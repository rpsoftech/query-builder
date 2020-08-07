import * as maria from 'mariadb';
import { QueryExec } from './query_exec';
export declare class Pool {
    _pool: maria.Pool;
    constructor(settings: maria.PoolConfig);
    pool(): maria.Pool;
    get_connection(): Promise<QueryExec>;
    disconnect(cb: any): Promise<unknown>;
}
//# sourceMappingURL=pool.d.ts.map