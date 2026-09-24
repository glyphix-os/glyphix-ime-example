import { Store } from '/store';
import { Candidate } from '/types';
import {
  ChangeBoardType,
  ChangeLang,
  eventEmitter,
  InsertImeText,
} from '/utils/event';
import {
  getImeErrorI18nKey,
  ImeEngine,
  normalizeImeError,
} from '/utils/ime-engine';
import { ShowKeyBoardType } from '/utils/type';
import { prompt } from '/utils/prompt';
import { QueryResult } from '@system.ime';
import type { DIContainer } from '/utils/container';
import { TaskQueue } from 'glyphix-utils/modules/queue';

export interface ImeCtx {
  $app: any;
  showShiftValue: boolean;
  candidateList: Array<Candidate>;
  showBoardType: ShowKeyBoardType;
  curLang: string;
  isHideBottomFixOperation: boolean;
  curLangCode: string;
  showCandidateList: boolean;
  defaultCandidate: Array<Candidate>;
  needReplaceCandiateList: boolean;
  displayInputText: string;
  rawInputGroup: Array<string>;
  _backspaceTimer: number | null;
  _queryImeRunning: boolean;
  _queryImePending: boolean;
  hasILoadedImdict: boolean;
  lastDictFile: string;
  $emit: (name: string) => void;
  queryIme: () => void;
  appendCandidate: (result: QueryResult) => void;
  backspace: () => void;
}

export function createImeManager(ctx: ImeCtx, container: DIContainer) {
  const loadQueue = new TaskQueue();

  function loadLayout() {
    const info = container.get<Store>('store').activeBoardInfo;
    ctx.hasILoadedImdict = false;
    ctx.curLangCode = info.lang;
    return new Promise((resolve, reject) => {
      loadQueue.addTask(() => {
        return import(`${info.path}/${info.layoutFile}`)
          .then((res) => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            console.debug(
              `${info.path}/${info.layoutFile} layout`,
              JSON.stringify(res),
            );
            // this.renderRows = res.layout.rows as any;

            ctx.curLang = res.layout.library;

            console.debug(`ready to load ${res.layout.library} library`, info);
            ctx.defaultCandidate = (res.layout.defaultCandidate as any) ?? [];
            ctx.candidateList = res.layout.defaultCandidate ?? [];
            // SysStorage.set(ACTIVATE_LANG_LAYOUT, this.renderRows);
            // SysStorage.set(ACTIVATE_DEFAULT_CANDIDATE, this.defaultCandidate);

            // TODO 简单处理，对于同一个词库文件，不做重复加载
            if (`${info.path}/${info.lang}.imdict` == ctx.lastDictFile) {
              container
                .get<ImeEngine>('imeEngine')
                .selectMethod(res.layout.boardMask);
              ctx.hasILoadedImdict = true;

              return;
            }
            ctx.lastDictFile = `${info.path}/${info.lang}.imdict`;
            console.info('load library', ctx.lastDictFile);

            return container
              .get<ImeEngine>('imeEngine')
              .load({
                path: ctx.lastDictFile,
                maxCandidates: 16,
                maxSyllables: 4,
              })
              .then((loadRes) => {
                console.debug('library load res', loadRes);
                // TODO 设置输入法可能会失败
                container
                  .get<ImeEngine>('imeEngine')
                  .selectMethod(res.layout.boardMask);
                ctx.hasILoadedImdict = true;
              });
          })
          .catch((error) => {
            const imeError = normalizeImeError(error);
            const errorText = $t(getImeErrorI18nKey(imeError.code)) as string;
            prompt.showToast({
              message: `${$t('imeLoadErrorTitle') as string}: ${
                $t('imeErrorPrefix') as string
              }${errorText} (${imeError.code})`,
              duration: 4000,
            });
            console.error(
              'ime load failed',
              imeError.code,
              imeError.message,
              info,
            );
          })
          .finally(() => resolve(''));
      });
    });
  }

  function _finishQueryIme() {
    ctx._queryImeRunning = false;
    if (ctx._queryImePending) {
      _doQueryIme();
    }
  }

  function _doQueryIme() {
    ctx._queryImeRunning = true;
    ctx._queryImePending = false;

    if (!ctx.rawInputGroup.join()) {
      ctx.displayInputText = '';

      eventEmitter.emit(InsertImeText, {
        input: '',
        select: '',
      });
      _finishQueryIme();
      return;
    }

    if (ctx.rawInputGroup.join('')) {
      const line = ctx.rawInputGroup.join('');
      console.debug('use default library query ', line);
      container
        .get<ImeEngine>('imeEngine')
        .input(line)
        .then((result) => {
          console.debug('input res', JSON.stringify(result));
          appendCandidate(result.result);
          _finishQueryIme();
        })
        .catch((error) => {
          const imeError = normalizeImeError(error);
          console.error(
            'ime input failed',
            imeError.code,
            $t(getImeErrorI18nKey(imeError.code)),
            imeError.message,
            ctx.rawInputGroup.join(''),
          );
          prompt.showToast({
            message: $t(getImeErrorI18nKey(imeError.code)),
            duration: 4000,
          });
          ctx.rawInputGroup.pop();
          _finishQueryIme();
        });
    } else {
      _finishQueryIme();
    }
  }

  function appendCandidate(result: QueryResult) {
    console.debug(ctx.displayInputText, 'query result', JSON.stringify(result));

    if (result.code !== 0) {
      console.error('ime query error', result.code, result.segment);
      return;
    }
    const list = (result.candidates ?? []).map((item) => ({
      surface: item.surface,
    }));

    ctx.displayInputText = result.segment;

    eventEmitter.emit(InsertImeText, {
      input: ctx.displayInputText,
      select: '',
    });

    if (!list.length) {
      ctx.candidateList = [
        {
          surface: ctx.displayInputText,
        },
      ];
      ctx.needReplaceCandiateList = false;

      console.debug(
        'not find candidate, show input text',
        ctx.displayInputText,
        ctx.candidateList,
      );
    } else {
      if (!ctx.needReplaceCandiateList) {
        ctx.candidateList.push(...list);
      } else {
        ctx.candidateList = list;
        ctx.needReplaceCandiateList = false;
      }
    }
  }

  function queryIme() {
    ctx.needReplaceCandiateList = true;

    if (ctx._queryImeRunning) {
      ctx._queryImePending = true;
      return;
    }

    _doQueryIme();
  }

  function stopLongPressBackspace() {
    if (ctx._backspaceTimer) {
      clearInterval(ctx._backspaceTimer);
      ctx._backspaceTimer = null;
    }
  }

  function _performBackspace() {
    console.debug('backspace=====', ctx.displayInputText);
    if (ctx.displayInputText.length) {
      ctx.displayInputText = ctx.displayInputText.slice(
        0,
        ctx.displayInputText.length - 1,
      );
      ctx.rawInputGroup.splice(-1);

      if (!ctx.displayInputText) {
        ctx.rawInputGroup = [];
        ctx.candidateList = ctx.defaultCandidate;
      }
      queryIme();
    } else {
      ctx.candidateList = ctx.defaultCandidate;
      ctx.$emit('backspace');
    }

    console.debug('backspace result', ctx.displayInputText, ctx.rawInputGroup);
  }

  // ── 对外暴露的方法 ──

  function onKeyTap(key: { type: string; value: string; shiftValue?: string }) {
    console.debug('onKeyTap', key);
    if (container.get<Store>('store').isMorThanMaxLen(ctx.$app.initParams)) {
      prompt.showToast({
        message: $t('imeStatusBufferTooSmall') as string,
        duration: 1000,
      });
      return;
    }
    switch (key.type) {
      case 'shift':
        ctx.showShiftValue = !ctx.showShiftValue;
        break;
      case 'number':
        eventEmitter.emit(ChangeBoardType, ShowKeyBoardType.NumberBoard);
        break;
      default:
        if (!ctx.hasILoadedImdict) {
          prompt.showToast({
            message: $t('imeLoadDictFirst') as string,
            duration: 1000,
          });
        }
        ctx.rawInputGroup.push(
          ctx.showShiftValue ? (key.shiftValue ?? '') : key.value,
        );
        queryIme();
    }
  }

  function onTapCandidate(item: Candidate) {
    if (container.get<Store>('store').isMorThanMaxLen(ctx.$app.initParams)) {
      prompt.showToast({
        message: $t('imeStatusBufferTooSmall') as string,
        duration: 1000,
      });
      return;
    }
    let surface = item.surface;
    if (!['zh-CN', 'zh-HK', 'zh-TW', 'th-TH'].includes(ctx.curLangCode)) {
      surface = surface + ' ';
    }
    eventEmitter.emit(InsertImeText, {
      input: '',
      select: surface,
    });

    ctx.displayInputText = '';
    ctx.rawInputGroup = [];
    container
      .get<ImeEngine>('imeEngine')
      .suggest(item)
      .then((res) => {
        console.debug('suggest result', res);
        if (res.result.length) {
          ctx.candidateList = res.result;
        } else {
          ctx.candidateList = ctx.defaultCandidate;
        }
      });
  }

  function longPressBackspace() {
    stopLongPressBackspace();
    ctx._backspaceTimer = setInterval(() => {
      _performBackspace();
    }, 30) as any;
    _performBackspace();
  }

  function backspace() {
    stopLongPressBackspace();
    _performBackspace();
  }

  return {
    loadLayout,
    onKeyTap,
    queryIme,
    appendCandidate,
    onTapCandidate,
    longPressBackspace,
    backspace,
    stopLongPressBackspace,
  };
}
