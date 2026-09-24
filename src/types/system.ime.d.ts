declare module '@system.ime' {
  export interface QueryResult {
    code: number;
    segment: string;
    candidates: Array<{ surface: string }>;
  }
  export interface ImeInstance {
    load(options: { path: string }): Promise<number>;
    unload();
    input(line: string): Promise<{ result: QueryResult }>;
    suggest(params: {
      surface: string;
    }): Promise<{ result: Array<{ surface: string }> }>;
  }
  interface ImeFactory {
    /**
     * 创建输入法实例
     */
    create(): ImeInstance;
  }

  const ime: ImeFactory;
  export default ime;
}
