import { GenericQueryBuilder } from '../GenericQueryBuilder';
import { Connection } from 'mariadb';
export declare abstract class QueryBuilder extends GenericQueryBuilder {
    escape_char: any;
    multi_condition_rgx: RegExp;
    condition_rgx: RegExp;
    rand_word: string;
    dbInstance: Connection;
    constructor(db: Connection);
    _qb_escape(str: any): any;
    _build_limit_clause(sql: any, limit: any, offset: string): any;
    _compile_delete(): any;
    _compile_insert(ignore: any, suffix?: string): string;
    _compile_select(): string;
    _compile_update(): any;
    _insert_batch(table: any, set?: any, ignore?: boolean, suffix?: string): any;
    _count(table: any): string;
}
//# sourceMappingURL=query_builder.d.ts.map