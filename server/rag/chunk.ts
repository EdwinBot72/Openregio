function estimateTokens(str: string): number {
  const words = (str || "").trim().split(/\s+/).filter(Boolean).length;
  return Math.ceil(words / 0.75);
}

interface ChunkOptions {
  maxTokens?: number;
  overlapTokens?: number;
}

export function chunkText(text: string, options: ChunkOptions = {}): string[] {
  const { maxTokens = 1100, overlapTokens = 220 } = options;
  const lines = (text || "").split(/\r?\n/);
  const blocks: string[] = [];
  let buf: string[] = [];
  let bufTok = 0;

  const pushBuf = () => {
    const t = buf.join("\n").trim();
    if (t) blocks.push(t);
    buf = [];
    bufTok = 0;
  };

  for (const line of lines) {
    const l = line.replace(/\s+$/, "");
    const isHardSplit = /^\s*(Geachte|Betreft|Onderwerp|Besluit|Kenmerk|Zaaknummer|Datum|Artikel\s+\d+)/i.test(l);
    const lt = estimateTokens(l);

    if (isHardSplit && bufTok > maxTokens * 0.6) pushBuf();
    if (bufTok + lt > maxTokens && buf.length) pushBuf();

    buf.push(l);
    bufTok += lt;
  }
  pushBuf();

  if (overlapTokens <= 0 || blocks.length <= 1) return blocks;

  const out: string[] = [];
  for (let i = 0; i < blocks.length; i++) {
    if (i === 0) {
      out.push(blocks[i]);
    } else {
      const prev = out[out.length - 1];
      const overlap = prev.slice(Math.max(0, prev.length - 1200));
      out.push((overlap + "\n" + blocks[i]).trim());
    }
  }
  return out;
}
