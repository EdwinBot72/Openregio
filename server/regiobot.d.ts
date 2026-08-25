interface RegioBotInput {
  question: string;
  regionSlug?: string;
  authoritySlug?: string;
  tags?: string[];
  includePrivate?: boolean;
  limit?: number;
}

interface RegioBotResult {
  answer: string;
  sources: Array<{
    request_id: string;
    source_type: string;
    snippet: string;
  }>;
  model: string;
  regionSlug?: string;
  authoritySlug?: string;
}

interface RegioBotCitation {
  sourceNo: number;
  source_type?: string;
  request_id?: string | number;
  document_id?: string | number;
  region?: string;
  authority?: string;
  title?: string;
  filename?: string;
  file_url?: string;
}

interface RegioBotPrepared {
  earlyAnswer?: string;
  messages?: Array<{ role: string; content: string }>;
  model?: string;
  citations: RegioBotCitation[];
}

export function runRegioBot(input: RegioBotInput): Promise<RegioBotResult>;
export function prepareRegioBot(input: any): Promise<RegioBotPrepared>;
