import * as maria from 'mariadb';
import { QueryExec } from './query_exec';
export class Pool {
  _pool: maria.Pool;
  constructor(settings: maria.PoolConfig) {
    this._pool = maria.createPool(settings);
  }

  pool() {
    return this._pool;
  }

  get_connection(): Promise<QueryExec> {
    if (!this._pool) {
      const error_msg = 'Connection pool not available!';
      if (console && console.hasOwnProperty('error')) console.error(error_msg);
      throw new Error(error_msg);
    }
    return this._pool.getConnection().then((db) => new QueryExec(db));
  }

  disconnect() {
    return this._pool.end();
  }
}
