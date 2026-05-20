export interface ZoektermenRequest {
  beroep: string;
  stad: string;
  wijk?: string;
}

export interface ZoektermenResponse {
  primair: string[];
  longTail: string[];
  zoekvragen: string[];
  paginatitel: string;
  metaDescription: string;
  h1Suggestie: string;
  wijkTip: string;
}
