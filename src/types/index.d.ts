import type { ImeInstance } from '@system.ime';

export interface QueryParams {
  line: string;
  offset?: number;
  limit?: number;
}

export type Candidate = {
  surface: string;
};

export type ImeSuggestCandidate = Candidate;

export interface ImeQueryResult {
  total: number;
  data: Candidate[];
}

export interface QueryResult {
  input: string;
  result: ImeQueryResult;
}

export type QueryFuntion = (
  imeInstance: ImeInstance,
  params: QueryParams,
  getInput: (input: string) => void,
  appendCandidate: (candidate: Array<Candidate>) => void,
) => void;

export interface BoardItem {
  name: string;
  langName: string;
  lang: string;
  boardType: string;
  layoutFile: string;
  path: string;
  title?: string;
  subTitle?: string;
  icon?: string;
  boardMask: number;
}

export interface LangInfo {
  langCode: string;
  langName: string;
  updateTime: number;
}
