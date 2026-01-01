/**
 * Type declarations for sql.js
 * 
 * sql.js provides SQLite database in WebAssembly
 */

declare module 'sql.js' {
  export interface SqlJsStatic {
    Database: new (data?: ArrayLike<number> | Buffer | null) => Database;
  }

  export interface Database {
    run(sql: string, params?: BindParams): void;
    exec(sql: string, params?: BindParams): QueryExecResult[];
    export(): Uint8Array;
    close(): void;
    getRowsModified(): number;
  }

  export interface QueryExecResult {
    columns: string[];
    values: SqlValue[][];
  }

  export type SqlValue = string | number | Uint8Array | null;
  export type BindParams = SqlValue[] | Record<string, SqlValue>;

  export interface SqlJsConfig {
    locateFile?: (file: string) => string;
    wasmBinary?: ArrayLike<number>;
  }

  function initSqlJs(config?: SqlJsConfig): Promise<SqlJsStatic>;
  
  export default initSqlJs;
}
