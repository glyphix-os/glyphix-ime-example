type Constructor<T = any> = new (...args: any[]) => T;

export class DIContainer {
  private singletons = new Map<string, any>();
  private factories = new Map<string, () => any>();

  register<T>(key: string, ctor: Constructor<T>, deps: string[] = []) {
    this.factories.set(key, () => {
      const args = deps.map((depKey) => this.get(depKey));
      return new ctor(...args);
    });
  }

  singleton<T>(key: string, ctor: Constructor<T>, deps: string[] = []) {
    this.factories.set(key, () => {
      if (!this.singletons.has(key)) {
        const args = deps.map((depKey) => this.get(depKey));
        this.singletons.set(key, new ctor(...args));
      }
      return this.singletons.get(key);
    });
  }

  get<T>(key: string): T {
    const factory = this.factories.get(key);
    if (!factory) throw new Error(`No provider found for ${key}`);
    return factory();
  }
}

export const container = new DIContainer();
