// server/regiobot.js
import { z } from "zod";
import OpenAI from "openai";
import pg from "pg";

const { Pool } = pg;

// Lazy initialization - only create clients when needed
let openai = null;
let pool = null;

function getOpenAI() {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is niet geconfigureerd");
    }
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
}

function getPool() {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return pool;
}

// ---- Input schema ----
// question can be empty if dossierRequestId is provided (dossier-only context)
const RegioBotInput = z.object({
  question: z.string().optional().default(""),
  task: z.enum([
    "analyse_besluit",
    "mandaat_check",
    "wat_ontbreekt",
    "vervolg_woo",
    "tijdlijn",
    "publiceer_samenvatting",
  ]).optional(),
  dossierRequestId: z.number().int().positive().optional(),
  regionSlug: z.string().min(1).optional(),     // bv "haarlemmermeer"
  authoritySlug: z.string().min(1).optional(),  // bv "gemeente-haarlem"
  tags: z.array(z.string()).optional(),         // bv ["mandaat","heffing"]
  includePrivate: z.boolean().optional().default(true),
  limit: z.number().int().min(1).max(12).optional().default(6),
}).refine(
  (data) => data.question.trim().length >= 3 || data.dossierRequestId,
  { message: "Question required (min 3 chars) unless dossier is selected" }
);

// ---- Helpers ----
function compact(str, max = 1200) {
  if (!str) return "";
  const s = String(str).replace(/\s+/g, " ").trim();
  return s.length > max ? s.slice(0, max) + "…" : s;
}

function buildSystemPrompt() {
  return `
Je bent RegioBot: een regionale juridische WOO-AI binnen OpenRegio.

DOEL
- Ondersteunen van een gezamenlijke WOO-bibliotheek
- Analyse van wet- en regelgeving die ondernemers raakt
- Inzicht in beleid, mandaten, bevoegdheden en uitvoeringsstructuren

WEL TOEGESTAAN
- WOO-verzoeken en WOO-antwoorden
- Beleidsregels, verordeningen, besluiten
- Mandaat- en delegatiebesluiten
- Handhavingskaders (beleid, geen individuele boetes)
- Vergunningen, subsidies, aanbestedingen
- Structuren: wie mag wat, namens wie

NIET TOEGESTAAN (hard weigeren)
- Verkeerszaken (snelheid, rood licht, parkeren)
- Mulderbeschikkingen / CJIB
- Individuele boetes of persoonlijke dossiers
- Privégeschillen of persoonlijke handhaving

GEDRAG
- Geen juridisch advies
- Geen actietaal
- Geen emotie
- Alleen feitelijk, controleerbaar, document-gedreven

OUTPUT ALTIJD IN DEZE STRUCTUUR
1. Korte analyse (op basis van WOO-bronnen)
2. Wat ontbreekt (documenten / besluiten)
3. Concrete vervolg-WOO vragen
4. Bronnen (met verwijzing naar dossiers)

Als een vraag buiten scope valt:
- Leg kort uit waarom
- Verwijs terug naar doel van OpenRegio
`;
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

function taskInstruction(task) {
  switch (task) {
    case "analyse_besluit":
      return "TAAK: Analyseer dit besluit/antwoord. Geef: kernbeslissing, wettelijke basis (als genoemd), wie tekent/rol, risico's/zwaktes, en wat je nog moet opvragen via WOO.";
    case "mandaat_check":
      return "TAAK: Mandaat-check. Zoek in bronnen naar mandaat/delegatie/aanwijzingsbesluiten. Zeg expliciet wat je wel/niet ziet. Geef concrete WOO-vragen om mandaatketen te bewijzen.";
    case "wat_ontbreekt":
      return "TAAK: Wat ontbreekt? Geef checklist met ontbrekende stukken (besluiten, mandaatregister, contracten, werkinstructies, beleidskaders) en formuleer vervolg-WOO vragen.";
    case "vervolg_woo":
      return "TAAK: Schrijf vervolg-WOO vragen (bulletlist) op basis van gaten/inconsistenties. Kort, precies, documentgericht (geen meningen).";
    case "tijdlijn":
      return "TAAK: Bouw een tijdlijn. Zet events op datum (verzoek/antwoord/besluit/bijlage), benoem verantwoordelijke partij per stap, en markeer hiaten.";
    case "publiceer_samenvatting":
      return "TAAK: Maak publicatie-ready samenvatting: geen persoonsgegevens, geen emotie, alleen feiten + verwijzingen. Eindig met: 'Bronnen' lijst.";
    default:
      return "";
  }
}

async function fetchDossierContextSmart({ requestId, queryText, maxDocs = 4 }) {
  const client = await getPool().connect();
  try {
    const reqRes = await client.query(
      `select r.id, r.title, r.body, r.reference_code, r.sent_at, r.status,
              rg.slug as region_slug, rg.name as region_name,
              au.slug as authority_slug, au.name as authority_name,
              r.category_slug
       from woo_requests r
       left join regions rg on rg.id = r.region_id
       left join authorities au on au.id = r.authority_id
       where r.id = $1`,
      [requestId]
    );

    if (!reqRes.rows[0]) return null;
    const r = reqRes.rows[0];

    const q = (queryText || "").trim();
    let docsRes;

    if (q.length >= 3) {
      docsRes = await client.query(
        `select id, kind, filename, file_url, received_at, summary, text_content, category_slug,
                ts_rank_cd(fts, plainto_tsquery('simple', $2)) as rank
         from woo_documents
         where request_id = $1
         order by rank desc, coalesce(received_at, created_at) desc
         limit $3`,
        [requestId, q, maxDocs]
      );
    } else {
      docsRes = await client.query(
        `select id, kind, filename, file_url, received_at, summary, text_content, category_slug,
                0 as rank
         from woo_documents
         where request_id = $1
         order by coalesce(received_at, created_at) desc
         limit $2`,
        [requestId, maxDocs]
      );
    }

    const header = [
      `DOSSIER`,
      `request_id: ${r.id}`,
      r.title ? `title: ${r.title}` : null,
      r.region_slug ? `region: ${r.region_slug}` : null,
      r.authority_slug ? `authority: ${r.authority_slug}` : null,
      r.reference_code ? `kenmerk: ${r.reference_code}` : null,
      r.sent_at ? `sent_at: ${r.sent_at}` : null,
      r.status ? `status: ${r.status}` : null,
      r.category_slug ? `category: ${r.category_slug}` : null,
      `docs_included: ${docsRes.rows.length}/${maxDocs}`,
    ].filter(Boolean).join("\n");

    const reqBody = r.body ? `REQUEST_BODY (compact):\n${compact(r.body, 1800)}` : "";

    const docBlocks = docsRes.rows.map((d, i) => {
      const meta = [
        `DOC ${i + 1}`,
        `document_id: ${d.id}`,
        d.kind ? `kind: ${d.kind}` : null,
        d.received_at ? `received_at: ${d.received_at}` : null,
        d.filename ? `filename: ${d.filename}` : null,
        d.file_url ? `file_url: ${d.file_url}` : null,
        d.category_slug ? `category: ${d.category_slug}` : null,
        d.rank ? `rank: ${Number(d.rank).toFixed(3)}` : null,
      ].filter(Boolean).join("\n");

      const content = d.summary
        ? `summary:\n${compact(d.summary, 900)}`
        : (d.text_content ? `text:\n${compact(d.text_content, 1200)}` : "text: (leeg)");

      return `${meta}\n${content}`.trim();
    }).join("\n\n");

    return `${header}\n\n${reqBody}\n\n${docBlocks}`.trim();
  } finally {
    client.release();
  }
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
  const client = await getPool().connect();
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

  // Hard filter: weiger verkeerszaken en persoonlijke boetes
  const forbidden = /(snelheid|rood licht|mulder|cjib|parkeerboete|kenteken|verkeersboete)/i;
  if (forbidden.test(input.question)) {
    return {
      answer: `Deze vraag valt buiten OpenRegio.

OpenRegio behandelt uitsluitend:
- wet- en regelgeving
- beleid en mandaten
- structurele handhaving die ondernemers raakt

Persoonlijke verkeerszaken of boetes worden niet opgenomen.`,
      citations: []
    };
  }

  // Fetch smart dossier context if a specific dossier is selected (Top-K docs)
  let dossierContext = null;
  if (input.dossierRequestId) {
    // Build meaningful query text for FTS ranking
    // Use task keywords + question, or task-derived keywords for dossier-only requests
    const taskKeywords = {
      analyse_besluit: "besluit antwoord grondslag bevoegdheid",
      mandaat_check: "mandaat delegatie aanwijzing volmacht",
      wat_ontbreekt: "ontbreken document besluit kader",
      vervolg_woo: "openbaarmaking document informatie",
      tijdlijn: "datum besluit verzoek antwoord",
      publiceer_samenvatting: "samenvatting feiten bronnen",
    };
    const taskTerms = input.task ? (taskKeywords[input.task] || input.task) : "";
    const userTerms = (input.question || "").trim();
    const queryText = userTerms.length >= 3 ? `${taskTerms} ${userTerms}` : taskTerms;

    dossierContext = await fetchDossierContextSmart({
      requestId: input.dossierRequestId,
      queryText,
      maxDocs: 4
    });
  }

  // Token control: reduce global sources when dossier is active (dossier context is leading)
  const effectiveLimit = input.dossierRequestId ? Math.min(input.limit ?? 6, 3) : (input.limit ?? 6);

  const sources = await fetchContext({ ...input, limit: effectiveLimit });
  const sourcesText = sources.length
    ? formatSources(sources)
    : "Geen bronnen gevonden in de database voor deze vraag.";

  const messages = [
    { role: "system", content: buildSystemPrompt() },
    { role: "user", content: buildUserPrompt(input.question, input.regionSlug, input.authoritySlug, input.tags) },
    ...(input.task ? [{ role: "user", content: taskInstruction(input.task) }] : []),
    ...(dossierContext ? [{ role: "user", content: `DOSSIER CONTEXT (smart Top-K):\n\n${dossierContext}` }] : []),
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

  const completion = await getOpenAI().chat.completions.create({
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
