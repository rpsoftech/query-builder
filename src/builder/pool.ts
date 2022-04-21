import { Pool as marpool, PoolConfig, createPool, QueryOptions } from 'mariadb';
import { QueryExec } from './query_exec';
export class Pool {
  _pool: marpool;
  databasestring: string;
  private PostDataProcessor: ((data: any) => any)[] = [];
  constructor(settings: PoolConfig,private queryOptions?:QueryOptions) {
    this._pool = createPool(settings);
    this.databasestring = settings.database;
  }
  ClearAll() {
    this.PostDataProcessor = [];
  }
  AddDataProcessorPostExecution(processor: (d: any) => any) {
    this.PostDataProcessor.push(processor);
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
    return this._pool.getConnection().then((db) => new QueryExec(db,this.PostDataProcessor,this.queryOptions));
  }

  disconnect() {
    return this._pool.end();
  }
}
