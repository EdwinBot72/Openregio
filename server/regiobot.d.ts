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

export function runRegioBot(input: RegioBotInput): Promise<RegioBotResult>;
