import { BoardItem, LangInfo } from '/types';
import SysFile from '@system.file';
import SysDevice from '@system.device';
import { ChangeLang, eventEmitter } from '/utils/event';

interface boardList {
  active: string;
  list: Array<BoardItem>;
}

const LAGN_LANGS_DIR = 'internal://files/langs';
const STORAGE_LANG_INFO = 'internal://files/langs/info.json';

export class Store {
  private boardTypeList: boardList = {
    active: 'zh_9',
    list: [
      {
        name: '中文26键',
        langName: '简体中文',
        lang: 'zh-CN',
        boardType: 'zh_26',
        layoutFile: 'index26.jsc',
        boardMask: 1,
        path: '/assets/layout/zh-CN',
        icon: '/assets/imgs/boardType/zh_26.png',
      },
      {
        name: '中文9键',
        langName: '简体中文',
        lang: 'zh-CN',
        boardType: 'zh_9',
        boardMask: 2,
        layoutFile: 'index9.jsc',
        path: '/assets/layout/zh-CN',
        icon: '/assets/imgs/boardType/zh_9.png',
      },
      {
        name: '英语',
        langName: '英语',
        lang: 'en-US',
        boardType: 'en-US',
        boardMask: 4,
        layoutFile: 'index.jsc',
        path: '/assets/layout/en-US',
        icon: '/assets/imgs/boardType/en_us.png',
      },
    ],
  };

  private _activeLangs: Array<LangInfo> = [
    { langCode: 'zh-CN', langName: '简体中文', updateTime: 0 },
    { langCode: 'en-US', langName: 'English (United States)', updateTime: 0 },
  ];

  private _curInputLen: number = 0;

  private _isOverseas: boolean = false;

  constructor() {
    this.initLangInfo();
  }

  private saveLangInfo() {
    const activeInfo = this.boardTypeList.list.filter(
      (item) => item.boardType === this.boardTypeList.active,
    );
    if (!activeInfo.length) {
      // 删除了正在使用的语言, 将列表中的第一个设置为正在使用的语言
      this.boardTypeList.active = this.boardTypeList.list[0].boardType;
      import('/utils/event').then((res) => {
        res.eventEmitter.emit(res.ChangeLang, false);
      });
    }
    const content = {
      list: this.boardTypeList,
      activeList: this._activeLangs,
    };
    SysFile.writeText({
      uri: STORAGE_LANG_INFO,
      text: JSON.stringify(content),
    });
  }

  public initLangInfo() {
    return SysFile.access({
      uri: STORAGE_LANG_INFO,
    })
      .then((exist) => {
        if (!exist) return '';
        return SysFile.readText({
          uri: STORAGE_LANG_INFO,
        });
      })
      .then((res) => {
        if (!res) return;
        const info = JSON.parse(res) as Record<string, any>;
        if (info.list) this.boardTypeList = info.list;
        if (info.activeList) this._activeLangs = info.activeList;
        eventEmitter.emit(ChangeLang, true);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  public get boardInfo(): boardList {
    return {
      active: this.boardTypeList.active,
      list: this.boardTypeList.list.map((lang) => ({
        ...lang,
        name: lang.name,
        lang: lang.lang,
        boardType: lang.boardType,
        layoutFile: lang.layoutFile,
        path: lang.path,
      })),
    };
  }

  public get activeBoardInfo(): BoardItem {
    const tmp = this.boardTypeList.list.filter(
      (item) => item.boardType === this.boardTypeList.active,
    );
    return tmp[0];
  }

  public removeLang(locale: string) {
    this.boardTypeList.list = this.boardTypeList.list.filter(
      (item) => item.lang !== locale,
    );
    const index = this._activeLangs.findIndex(
      (item) => item.langCode === locale,
    );
    SysFile.remove({
      uri: `${LAGN_LANGS_DIR}/${locale}`,
      recursive: true,
    }).catch(() => {
      // ignore error
    });
    if (index >= 0) {
      // 存储删除的语言词库信息
      this._activeLangs.splice(index, 1);
    }
    import('/utils/event').then((res) => {
      res.eventEmitter.emit(res.ChangeShowBoardList);
    });

    this.saveLangInfo();
  }

  public set activeBoard(lang: string) {
    this.boardTypeList.active = lang;

    this.saveLangInfo();
  }

  public get activeBoard() {
    return this.boardInfo.active;
  }

  public addLang(langCode: string, langName: string) {
    const langStoreDir = `${LAGN_LANGS_DIR}/${langCode}`;

    return SysFile.readText({
      uri: `${langStoreDir}/info.json`,
    })
      .then((content) => {
        const info = JSON.parse(content) as Array<{
          name: string;
          lang: string;
          boardType: string;
          title?: string;
          subTitle?: string;
          icon?: string;
          layoutFile: string;
        }>;
        info.forEach((item) => {
          const boardInfo = {
            name: item.name,
            langName: langName,
            lang: item.lang,
            boardType: item.boardType,
            layoutFile: item.layoutFile,
            path: langStoreDir,
            title: item.title,
            subTitle: item.subTitle,
            icon: item.icon,
          };
          const index = this.boardTypeList.list.findIndex(
            (item) => item.boardType === boardInfo.boardType,
          );
          if (index < 0) {
            this.boardTypeList.list.push(boardInfo);
          } else {
            this.boardTypeList.list.splice(index, 1, boardInfo);
          }
        });
        this._activeLangs.push({
          langCode,
          langName,
          updateTime: new Date().getTime(),
        });
        import('/utils/event').then((res) => {
          res.eventEmitter.emit(res.ChangeShowBoardList);
        });
      })
      .then(() => {
        this.saveLangInfo();
      });
  }

  public get activeLangs() {
    console.info(this._activeLangs);
    return this._activeLangs.map((item) => {
      return {
        ...item,
      };
    });
  }

  /**
   * 启用语言
   * @param langCode
   * @param langName
   */
  public activeLang(langCode: string, langName: string) {
    this.addLang(langCode, langName);
  }

  public set curInputLen(len: number) {
    this._curInputLen = len;
  }

  public isMorThanMaxLen(initParams: Record<string, any>): boolean {
    console.debug('isMorThanMaxLen', initParams.maxLength, this._curInputLen);
    if (
      initParams.maxLength &&
      initParams.maxLength > 0 &&
      this._curInputLen >= initParams.maxLength
    ) {
      return true;
    }
    return false;
  }

  public get isOverseas(): boolean {
    return this._isOverseas;
  }
}
