import SysRoute from '@system.router';
import { Store } from './store';
import { container } from '/utils/container';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import SysBrightness from '@system.brightness';
import SysInvoke from '@system.invoke';
import SysLaunch from '@system.launch';
import SysMessage from '@system.messageChannel';
import SysStorage from '@system.storage';
import { USER_LICENSE_STATUS_KEY } from '/utils/constants';

export default {
  initParams: null,
  onCreate() {
    container.singleton('store', Store);

    if (SysInvoke.queryFeature('keepAlwaysOn')) {
      SysInvoke.invoke('keepAlwaysOn', { keepAlwaysOn: true });
    } else {
      SysBrightness.setKeepScreenOn(true);
    }
    if (!SysStorage.get(USER_LICENSE_STATUS_KEY)) {
      SysRoute.replace({
        uri: 'launch',
      });
    }
  },
  onRoute(page: string, query: { [key: string]: string }) {
    console.debug('Application onRoute', page, query);
    this.initParams = query as any;

    if (!SysStorage.get(USER_LICENSE_STATUS_KEY)) {
      return;
    }

    SysRoute.replace({
      uri: 'board',
    });
  },
  onShow() {
    console.info('Application onShow');
  },
  onHide() {
    console.info('Application onHide');
    if (SysInvoke.queryFeature('keepAlwaysOn')) {
      SysInvoke.invoke('keepAlwaysOn', { keepAlwaysOn: false });
    } else {
      SysBrightness.setKeepScreenOn(false);
    }
    if (process.env.GLYPHIX_EMU_LAUNCHER === 'true') {
      SysRoute.replace({
        uri: 'main',
      });
    } else {
      SysLaunch.exit();
    }
  },
  onDestroy() {
    console.info('Application onDestroy');
    SysMessage.unsubscribe();
  },
  onError() {
    console.error('Application onError');
  },
  onPageNotFound(params: any) {
    const { uri = '' } = params;
    console.error('error uri', uri);
  },
};
