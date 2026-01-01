/**
 * Global Type Definitions
 * 
 * Type declarations for external libraries and global extensions.
 */

// Extend Window interface for webkit prefixed APIs
interface Window {
  webkitAudioContext?: typeof AudioContext;
}

// sql.js types
declare module 'sql.js' {
  export interface SqlJsStatic {
    Database: new (data?: ArrayLike<number> | Buffer | null) => Database;
  }

  export interface Database {
    run(sql: string, params?: any[]): void;
    exec(sql: string, params?: any[]): QueryExecResult[];
    export(): Uint8Array;
    close(): void;
  }

  export interface QueryExecResult {
    columns: string[];
    values: any[][];
  }

  export default function initSqlJs(options?: {
    locateFile?: (file: string) => string;
  }): Promise<SqlJsStatic>;
}

// canvas-confetti shape extension
declare module 'canvas-confetti' {
  export function shapeFromText(options: { text: string; scalar?: number }): Shape;
}

// Global game types
declare global {
  interface Window {
    game?: any;
    DEBUG?: boolean;
  }
}

export {};
