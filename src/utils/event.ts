import { EventEmitter } from 'glyphix-utils';
import { CandidateList, ShowKeyBoardType } from './type';

export const ChangeLang = 'board.lang.chang';
export const ChangeCandidateList = 'board.candidate.change';
export const ChangeBoardType = 'board.type.change';
export const InsertImeText = 'update.ime.text';
export const DownloadLibrary = 'download.library.progress';
export const ChangeShowBoardList = 'board.type.list.change';

export const eventEmitter = new EventEmitter<{
  [ChangeLang]: [boolean];
  [ChangeCandidateList]: [CandidateList];
  [ChangeBoardType]: [ShowKeyBoardType];
  [InsertImeText]: [
    {
      input: string;
      select: string;
    },
  ];
  [DownloadLibrary]: [number];
  [ChangeShowBoardList]: [void];
}>();
