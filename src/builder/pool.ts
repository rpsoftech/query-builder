import * as maria from 'mariadb';
import { QueryExec } from './query_exec';
export class Pool {
    _pool:maria.Pool;
    constructor(settings:maria.PoolConfig) {
        this._pool = maria.createPool(settings);
    }

    pool() {
        return this._pool;
    }

    get_connection():Promise<QueryExec>{
        if (!this._pool) {
            const error_msg = "Connection pool not available!";
            if (console && console.hasOwnProperty('error')) console.error(error_msg);
            throw new Error(error_msg);
        }
        return new Promise((resolve?, reject?) => {
            this._pool.getConnection().then(db=>{
                resolve(new QueryExec(db));
            }).catch(err=>{
                reject(err);
            });
        });
    }

    disconnect(cb){
        if (!cb || (cb && typeof cb !== 'function')) {
            return new Promise((resolve, reject) => {
                this._pool.end().then(resolve);
            });
        } else {
            this._pool.end();
            cb();
        }
    }
}