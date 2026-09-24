import SysNetwork from '@system.network';

export class NetworkUtils {
  private netAvailable: boolean = false;
  constructor() {
    SysNetwork.getType().then((res) => {
      console.info('network type', res);
      this.netAvailable = res.online;
    });
    SysNetwork.subscribe((status) => {
      console.info('network status changed', status);
      this.netAvailable = status.online;
    });
  }
  initNetStatus() {
    console.info('init network status');
    SysNetwork.getType().then((res) => {
      console.info('network type', res);
      this.netAvailable = res.online;
    });
  }
  isAvailable(): boolean {
    return this.netAvailable;
  }
}
