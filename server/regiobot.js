// server/regiobot.js
import { z } from "zod";
import OpenAI from "openai";
import pg from "pg";

const { Pool } = pg;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// ---- Input schema ----
const RegioBotInput = z.object({
  question: z.string().min(3),
  regionSlug: z.string().min(1).optional(),     // bv "haarlemmermeer"
  authoritySlug: z.string().min(1).optional(),  // bv "gemeente-haarlem"
  tags: z.array(z.string()).optional(),         // bv ["mandaat","heffing"]
  includePrivate: z.boolean().optional().default(true),
  limit: z.number().int().min(1).max(12).optional().default(6),
});

// ---- Helpers ----
function compact(str, max = 1200) {
  if (!str) return "";
  const s = String(str).replace(/\s+/g, " ").trim();
  return s.length > max ? s.slice(0, max) + "…" : s;
}

function buildSystemPrompt() {
  return [
    "Je bent RegioBot: Regionale WOO & Juridische AI voor OpenRegio.",
    "Doel: antwoorden geven op basis van WOO-verzoeken, besluiten, antwoorden en bijlagen uit de database.",
    "Regels:",
    "- Gebruik primair de meegeleverde bronnen uit de context.",
    "- Als bronnen onvoldoende zijn: zeg expliciet wat ontbreekt en geef een korte lijst vervolg-WOO vragen.",
    "- Geen drama, geen politiek, geen meningen. Feitelijk, controleerbaar, zakelijk.",
    "- Output altijd met: 1) Antwoord 2) Wat ontbreekt 3) Vervolgvragen voor WOO 4) Bronnen (IDs/links).",
    "- Geen boekhouding/Excel/marketing. Focus op WOO, mandaten, besluiten, bevoegdheden, ondertekening, grondslagen."
  ].join("\n");
}

function buildUserPrompt(question, regionSlug, authoritySlug, tags) {
  const bits = [
    `Vraag: ${question}`,
    regionSlug ? `Regio: ${regionSlug}` : null,
    authoritySlug ? `Bestuursorgaan: ${authoritySlug}` : null,
    tags?.length ? `Tags: ${tags.join(", ")}` : null,
  ].filter(Boolean);

  return bits.join("\n");
}

function formatSources(rows) {
  return rows.map((r, i) => {
    const header = [
      `SOURCE ${i + 1}`,
      `type: ${r.source_type}`,
      `request_id: ${r.request_id}`,
      r.document_id ? `document_id: ${r.document_id}` : null,
      r.region_slug ? `region: ${r.region_slug}` : null,
      r.authority_slug ? `authority: ${r.authority_slug}` : null,
      r.reference_code ? `kenmerk: ${r.reference_code}` : null,
      r.sent_at ? `sent_at: ${r.sent_at}` : null,
      r.received_at ? `received_at: ${r.received_at}` : null,
      r.title ? `title: ${r.title}` : null,
      r.filename ? `filename: ${r.filename}` : null,
      r.file_url ? `file_url: ${r.file_url}` : null,
    ].filter(Boolean).join("\n");

    const body = [
      r.summary ? `summary: ${compact(r.summary, 600)}` : null,
      r.text_content ? `text: ${compact(r.text_content, 1200)}` : null,
      r.body ? `request_body: ${compact(r.body, 1200)}` : null,
    ].filter(Boolean).join("\n");

    return `${header}\n${body}`.trim();
  }).join("\n\n");
}

// ---- Database retrieval (simple relevance: title/summary/text ILIKE) ----
async function fetchContext({ question, regionSlug, authoritySlug, tags, limit }) {
  const client = await pool.connect();
  try {
    let regionId = null;
    let authorityId = null;

    if (regionSlug) {
      const r = await client.query("select id from regions where slug=$1", [regionSlug]);
      regionId = r.rows[0]?.id ?? null;
    }
    if (authoritySlug) {
      const a = await client.query("select id from authorities where slug=$1", [authoritySlug]);
      authorityId = a.rows[0]?.id ?? null;
    }

    let tagRequestIds = null;
    if (tags?.length) {
      const tagRows = await client.query(
        `select rt.request_id
         from request_tags rt
         join tags t on t.id = rt.tag_id
         where t.slug = any($1::text[])
         group by rt.request_id`,
        [tags]
      );
      tagRequestIds = tagRows.rows.map(x => x.request_id);
      if (!tagRequestIds.length) tagRequestIds = [-1];
    }

    const q = `%${question.replace(/%/g, "").slice(0, 200)}%`;

    const params = [];
    let where = `where (d.summary ilike $1 or d.text_content ilike $1 or r.title ilike $1 or r.body ilike $1)`;
    params.push(q);

    if (regionId) { params.push(regionId); where += ` and r.region_id = $${params.length}`; }
    if (authorityId) { params.push(authorityId); where += ` and r.authority_id = $${params.length}`; }
    if (tagRequestIds) { params.push(tagRequestIds); where += ` and r.id = any($${params.length}::int[])`; }

    params.push(limit);

    const docs = await client.query(
      `
      select
        'document' as source_type,
        r.id as request_id,
        d.id as document_id,
        rg.slug as region_slug,
        au.slug as authority_slug,
        r.reference_code,
        r.sent_at,
        d.received_at,
        r.title,
        d.filename,
        d.file_url,
        d.summary,
        d.text_content,
        r.body
      from woo_documents d
      join woo_requests r on r.id = d.request_id
      left join regions rg on rg.id = r.region_id
      left join authorities au on au.id = r.authority_id
      ${where}
      order by coalesce(d.received_at, r.sent_at, r.created_at) desc
      limit $${params.length}
      `,
      params
    );

    let rows = docs.rows;
    if (rows.length < limit) {
      const need = limit - rows.length;
      const p2 = params.slice(0, -1);
      p2.push(need);

      const reqs = await client.query(
        `
        select
          'request' as source_type,
          r.id as request_id,
          null::int as document_id,
          rg.slug as region_slug,
          au.slug as authority_slug,
          r.reference_code,
          r.sent_at,
          null::timestamptz as received_at,
          r.title,
          null::text as filename,
          null::text as file_url,
          null::text as summary,
          null::text as text_content,
          r.body
        from woo_requests r
        left join regions rg on rg.id = r.region_id
        left join authorities au on au.id = r.authority_id
        ${where.replaceAll("d.", "''::text || ")}
        order by coalesce(r.sent_at, r.created_at) desc
        limit $${p2.length}
        `,
        p2
      );

      rows = rows.concat(reqs.rows);
    }

    return rows;
  } finally {
    client.release();
  }
}

// ---- Main function ----
export async function runRegioBot(rawInput) {
  const input = RegioBotInput.parse(rawInput);

  const sources = await fetchContext(input);
  const sourcesText = sources.length
    ? formatSources(sources)
    : "Geen bronnen gevonden in de database voor deze vraag.";

  const messages = [
    { role: "system", content: buildSystemPrompt() },
    { role: "user", content: buildUserPrompt(input.question, input.regionSlug, input.authoritySlug, input.tags) },
    { role: "user", content: `BRONNEN (WOO Database):\n\n${sourcesText}` },
    {
      role: "user",
      content:
`Output format (strict):
1) Antwoord (kort, feitelijk)
2) Wat ontbreekt (bullets)
3) Vervolg WOO-vragen (bullets, zo concreet mogelijk)
4) Bronnen (noem SOURCE nummers + request_id/document_id + file_url indien aanwezig)
`
    }
  ];

  const model = process.env.OPENAI_MODEL || "gpt-4o";

  const completion = await openai.chat.completions.create({
    model,
    messages,
    temperature: 0.2
  });

  const answer = completion.choices?.[0]?.message?.content ?? "";

  const citationIndex = sources.map((s, idx) => ({
    sourceNo: idx + 1,
    source_type: s.source_type,
    request_id: s.request_id,
    document_id: s.document_id,
    region: s.region_slug,
    authority: s.authority_slug,
    title: s.title,
    filename: s.filename,
    file_url: s.file_url
  }));

  return { answer, citations: citationIndex };
}
