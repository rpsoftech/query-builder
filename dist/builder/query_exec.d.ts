import { QueryBuilder } from './query_builder';
import { PoolConnection } from 'mariadb';
export declare class QueryExec extends QueryBuilder {
    _connection: PoolConnection;
    resolve: Function;
    reject: Function;
    constructor(db: PoolConnection);
    _exec(sql: any, data?: any): Promise<any>;
    release(): void;
    startTransaction(): void;
    rollupTransaction(): void;
    commitTransaction(): void;
    query(sql: any, data?: any): void;
    insert_update(table: string, insertset: {}, updateset: {}): Promise<any>;
    count(table?: any): Promise<any>;
    get(table?: string): Promise<any>;
    get_where(table: any, where: any): void;
    insert(table?: string, set?: any, ignore?: boolean, suffix?: string): Promise<any>;
    insert_ignore(table: any, set: any, on_dupe?: any): Promise<any>;
    insert_batch(table: any, set: any, ignore?: any, on_dupe?: any): Promise<any>;
    update(table: any, set: any, where: any): Promise<any>;
    delete(table?: any, where?: any): void;
    empty_table(table: any): void;
    truncate(table: any): void;
}
//# sourceMappingURL=query_exec.d.ts.map