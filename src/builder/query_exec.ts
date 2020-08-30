import { QueryBuilder } from './query_builder';
import { ERROR } from '../QueryExecError';
import { PoolConnection } from 'mariadb';
// ****************************************************************************
// QueryBuilder "Query Execution" methods.
// ****************************************************************************
export class QueryExec extends QueryBuilder {
  _connection: PoolConnection;
  resolve: Function;
  reject: Function;
  constructor(db: PoolConnection) {
    super(db);
    this._connection = db;
  }

  _exec(sql, data?) {
    if (
      Object.prototype.toString.call(this._connection) ===
      Object.prototype.toString.call({})
    ) {
      return this._connection.query(
        {
          sql: sql,
          // rowsAsArray:true
        },
        data
      );
    } else {
      throw ERROR.NO_CONN_OBJ_ERR;
    }
  }
  release() {
    this._connection.release();
  }
  startTransaction() {
    this._connection.beginTransaction();
  }
  rollupTransaction() {
    this._connection.reset();
  }
  commitTransaction() {
    this._connection.commit();
  }
  query(sql, data?) {
    this._exec(sql, data);
  }
  insert_update(table: string, insertset: {}, updateset: {}) {
    this.reset_query('');
    let sql1 = this._insert(table, insertset);
    sql1 += ' ON DUPLICATE KEY UPDATE ';
    this.reset_query(sql1);
    sql1  += this._update(table, updateset).split('SET')[1];
    this.reset_query(sql1);

    return this._exec(sql1);
  }
  count(table?) {
    const sql = this._count(table);
    this.reset_query(sql);

    return this._exec(sql);
  }

  get(table = '') {
    // The table parameter is optional, it could be the cb...

    const sql = this._get(table);
    this.reset_query(sql);

    return this._exec(sql);
  }

  get_where(table, where) {
    if (typeof table !== 'string' && !Array.isArray(table)) {
      throw ERROR.FIRST_PARAM_OF_GET_WHERE_ERR;
    }
    if (
      Object.prototype.toString.call(where) !==
      Object.prototype.toString.call({})
    ) {
      throw ERROR.SECOND_PARAM_OF_GET_WHERE_ERR;
    }
    const sql = this._get_where(table, where);
    this.reset_query(sql);
    this._exec(sql);
  }

  insert(table = '', set: any = '', ignore = false, suffix = '') {
    const sql = this._insert(table, set, ignore, suffix);
    this.reset_query(sql);
    return this._exec(sql);
  }

  insert_ignore(table, set, on_dupe?) {
    const sql = this._insert_ignore(table, set, on_dupe);
    this.reset_query(sql);
    return this._exec(sql);
  }

  insert_batch(table, set, ignore?, on_dupe?) {
    const sql = this._insert_batch(table, set, ignore, on_dupe);
    this.reset_query(sql);
    return this._exec(sql);
  }

  update(table, set, where?) {
    // The where parameter is optional, it could be the cb...
    if (
      typeof where === 'undefined' ||
      where === false ||
      (where !== null &&
        typeof where === 'object' &&
        Object.keys(where).length === 0)
    ) {
      where = null;
    }

    const sql = this._update(table, set, where);
    this.reset_query(sql);

    return this._exec(sql);
  }

  // TODO: Write this complicated-ass function
  //   update_batch_exec(table, set, index, where) {
  //     // The where parameter is optional, it could be the cb...
  //     if (
  //       typeof where === 'undefined' ||
  //       where === false ||
  //       (where !== null &&
  //         typeof where === 'object' &&
  //         Object.keys(where).length === 0)
  //     ) {
  //       where = null;
  //     }

  //     const sqls = this._update_batch(table, set, index, where);
  //     let results = null;
  //     const errors = [];

  //     // Execute each batch of (at least) 100
  //     const handler = (resolve?, reject?) => {
  //       (function next_batch() {
  //         const sql = sqls.shift();
  //         this.reset_query(sql);

  //         this._exec(sql, (err, res) => {
  //           if (!err) {
  //             if (null === results) {
  //               results = res;
  //             } else {
  //               results.affected_rows += res.affected_rows;
  //               results.changed_rows += res.changed_rows;
  //             }
  //           } else {
  //             errors.push(err);
  //           }

  //           if (sqls.length > 0) {
  //             setTimeout(next_batch, 0);
  //           } else {
  //           }
  //         });
  //       })();
  //     };
  //   }

  delete(table?, where?) {
    const sql = this._delete(table, where);
    this.reset_query(sql);
    this._exec(sql);
  }

  empty_table(table) {
    const sql = this._empty_table(table);
    this.reset_query(sql);
    this._exec(sql);
  }

  truncate(table) {
    const sql = this._truncate(table);
    this.reset_query(sql);
    this._exec(sql);
  }
}