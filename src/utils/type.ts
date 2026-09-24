export type CanDidate = {
  surface: string;
};

export type CandidateList = Array<CanDidate>;

export enum ShowKeyBoardType {
  NormalBoard = 'normal',
  EmojiBoard = 'emoji',
  CandidateBoard = 'candidate',
  NumberBoard = 'number',
}
