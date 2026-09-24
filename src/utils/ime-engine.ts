import SysIme, { ImeInstance } from '@system.ime';
import { Candidate, ImeSuggestCandidate } from '/types';

export interface ImeRejectError {
  code: number;
  message: string;
}

type ImeResponse = {
  result?: Array<Partial<ImeSuggestCandidate>>;
  candidates?: Array<Partial<ImeSuggestCandidate>>;
  data?: Array<Partial<ImeSuggestCandidate>>;
};

type ImeSuggestable = ImeInstance & {
  suggest?: (
    candidate: ImeSuggestCandidate,
  ) => Promise<ImeResponse> | ImeResponse;
};

export function normalizeImeError(error: unknown): ImeRejectError {
  const err = error as Partial<ImeRejectError> | null | undefined;
  return {
    code: typeof err?.code === 'number' ? err.code : 0,
    message:
      typeof err?.message === 'string' && err.message
        ? err.message
        : 'unknown status',
  };
}

export function getImeErrorI18nKey(code: number): string {
  switch (code) {
    case 1:
      return 'imeStatusInvalidArgument';
    case 2:
      return 'imeStatusNotInitialized';
    case 3:
      return 'imeStatusAlreadyInitialized';
    case 4:
      return 'imeStatusFileOpenFailed';
    case 5:
      return 'imeStatusFileReadFailed';
    case 6:
      return 'imeStatusInvalidDictionary';
    case 7:
      return 'imeStatusDictionaryTooOld';
    case 8:
      return 'imeStatusDictionaryTooNew';
    case 9:
      return 'imeStatusUnsupportedInputMethod';
    case 10:
      return 'imeStatusBufferTooSmall';
    case 11:
      return 'imeStatusOutOfMemory';
    case 12:
      return 'imeStatusCacheFull';
    case 13:
      return 'imeStatusNoCandidate';
    case 14:
      return 'imeStatusInternalError';
    default:
      return 'imeStatusUnknown';
  }
}

export class ImeEngine {
  private ime: ImeInstance;

  constructor() {
    this.ime = SysIme.create();
  }

  load(options: {
    path: string;
    maxInputLength?: number;
    maxCandidates?: number;
    maxSyllables?: number;
    enableFuzzyPinyin?: boolean;
  }) {
    this.ime.unload();
    return this.ime.load(options);
  }

  input(line: string) {
    return this.ime.input(line);
  }

  selectMethod(mask: number) {
    console.info('select input method with mask', mask);
    return this.ime.selectInputMethod({
      methodId: mask,
    });
  }

  getSupportMethods() {
    return this.ime.supportMethods();
  }

  suggest(candidate: ImeSuggestCandidate) {
    return this.ime.suggest(candidate);
  }
}
