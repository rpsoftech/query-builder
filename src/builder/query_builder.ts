import { GenericQueryBuilder } from '../GenericQueryBuilder';
import { Connection } from 'mariadb';
import { QueryOptions } from '../QueryExecError';
export abstract class QueryBuilder extends GenericQueryBuilder {
  escape_char = '`';
  multi_condition_rgx = /\s(OR|AND)\s/i;
  condition_rgx = /([\[\]\w\."\s-]+)(\s*[^\"\[`'\w-]+\s*)(.+)/i;
  rand_word = 'RAND()';
  dbInstance: Connection;
  constructor(db: Connection, protected _queryOptions?: QueryOptions) {
    super();
    this.dbInstance = db;
  }

  // ---------------------------------------- SQL ESCAPE FUNCTIONS ------------------------ //
  _qb_escape(str: any) {
    if (
      typeof str === 'string' &&
      str.trim() === '' &&
      this._queryOptions?.allowBlankStringInput
    ) {
      return str;
    } else if (typeof str === 'boolean') {
      str = str === false ? 0 : 1;
    } else if (
      typeof str === 'number' ||
      (typeof str === 'string' && isNaN(+str) === false)
    ) {
      (str as any) *= 1;
    } else {
      str = this.dbInstance.escape(str);
    }
    return str;
  }

  // ---------------------------- SQL BUILD TOOLS ----------------------------//
  _build_limit_clause(sql: string, limit, offset: string) {
    if (!limit) return sql;
    sql += ' ';
    if (typeof offset !== 'number' || offset === 0) {
      offset = '';
    } else {
      offset = offset + ', ';
    }
    return sql.replace(/\s+$/, ' ') + 'LIMIT ' + offset + limit;
  }

  // ---------------------------- SQL EXEC TOOLS ----------------------------//
  _compile_delete() {
    if (this.from_array.length === 0) {
      throw new Error('You have not specified any tables to delete from!');
    }

    this.from_array = this.from_array.slice(0, 1);

    const limit_to = this.limit_to[0] || false;
    const offset_val = this.offset_val[0] || false;
    const from_clause = this._build_from_clause().trim();
    const where_clause = this._build_where_clause().trim();

    const sql = `DELETE ${from_clause} ${where_clause}`.trim();
    return this._build_limit_clause(sql, limit_to, offset_val);
  }

  _compile_insert(ignore, suffix = '') {
    const keys = [];
    const values = [];
    let table: string;

    for (let i in this.set_array) {
      const key = Object.keys(this.set_array[i])[0];
      const val = this.set_array[i][key];
      keys.push(key);
      if (
        typeof val === 'string' &&
        val.trim() === '' &&
        this._queryOptions.allowBlankStringInput
      ) {
        values.push("''");
      } else {
        values.push(val);
      }
    }

    const verb = ('INSERT ' + (ignore === true ? 'IGNORE ' : '')).trim();

    if (this.from_array.length === 1) {
      table = this.from_array.toString();
    } else {
      if (this.from_array.length === 0) {
        throw new Error(
          "You haven't provided any tables to build INSERT querty with!"
        );
      }
      throw new Error(
        'You have provided too many tables to build INSERT query with!'
      );
    }

    const sql = `${verb} INTO ${table} (${keys.join(
      ', '
    )}) VALUES (${values.join(', ')}) ${suffix.trim()}`;
    return sql.trim();
  }

  _compile_select() {
    const distinct_clause = this.distinct_clause[0] || '';
    const from_clause = this._build_from_clause().trim();
    const join_string = this._build_join_string().trim();
    const where_clause = this._build_where_clause().trim();
    const group_by_clause = this._build_group_by_clause().trim();
    const having_clause = this._build_having_clause().trim();
    const order_by_clause = this._build_order_by_clause().trim();

    let sql = `SELECT ${distinct_clause}`.trim() + ' ';
    if (this.select_array.length === 0) {
      sql += '*';
    } else {
      sql += this.select_array.join(', ');
    }

    sql = `${sql} ${from_clause}`;
    sql += join_string ? ` ${join_string}` : '';
    sql += where_clause ? ` ${where_clause}` : '';
    sql += group_by_clause ? ` ${group_by_clause}` : '';
    sql += having_clause ? ` ${having_clause}` : '';
    sql += order_by_clause ? ` ${order_by_clause}` : '';

    const limit_to = this.limit_to[0] || false;
    const offset_val = this.offset_val[0] || false;

    sql = this._build_limit_clause(sql, limit_to, offset_val);
    return sql.trim();
  }

  _compile_update() {
    const valstr = [];
    for (let i in this.set_array) {
      const key = Object.keys(this.set_array[i])[0];
      const val = this.set_array[i][key];
      valstr.push(key + ' = ' + val);
    }

    if (this.from_array.length !== 1) {
      if (this.from_array.length === 0) {
        throw new Error(
          "You haven't provided any tables to build UPDATE query with!"
        );
      }
      throw new Error(
        'You have provided too many tables to build UPDATE query with!'
      );
    }

    const table = this.from_array.toString();

    const limit_to = this.limit_to[0] || false;
    const offset_val = this.offset_val[0] || false;
    const where_clause = this._build_where_clause().trim();
    const order_by_clause = this._build_order_by_clause().trim();

    let sql = `UPDATE (${table}) SET ${valstr.join(', ')}`;
    sql += where_clause ? ` ${where_clause}` : '';
    sql += order_by_clause ? ` ${order_by_clause}` : '';
    return this._build_limit_clause(sql, limit_to, offset_val);
  }

  _insert_batch(table, set: any[] = null, ignore = false, suffix = '') {
    const orig_table = (table = table || '');
    ignore = typeof ignore !== 'boolean' ? false : ignore;
    suffix = typeof suffix !== 'string' ? '' : suffix;
    if (suffix == ' ') suffix = '';

    if (typeof table !== 'string')
      throw new Error('insert(): Table parameter must be a string!');
    table = table.trim();

    if (table !== '' && !/^[a-zA-Z0-9\$_]+(\.[a-zA-Z0-9\$_]+)?$/.test(table)) {
      throw new Error(
        "insert(): Invalid table name ('" + table + "') provided!"
      );
    }

    if (table == '') {
      if (this.from_array.length === 0) {
        throw new Error(
          'insert_batch(): You have not set any tables to insert into.'
        );
      }
      table = this.from_array[0];
    } else {
      this._clear_array(this.from_array);
      this.from(table);
    }

    if (!Array.isArray(set)) {
      throw new Error(
        'insert_batch(): Array of objects must be provided for batch insert!'
      );
    }

    set.forEach((row) => {
      const is_object = typeof row === 'object';
      if (!is_object || (is_object && Object.keys(row).length === 0)) {
        throw new Error(
          'insert_batch(): An invalid item was found in the data array!'
        );
      } else {
        Object.keys(row).forEach((v1) => {
          const v = row[v1];
          if (!/^(number|string|boolean)$/.test(typeof v) && v !== null) {
            throw new Error('set(): Invalid value provided!');
          } else if (typeof v === 'number' && (v === Infinity || v !== +v)) {
            throw new Error(
              'set(): Infinity and NaN are not valid values in MySQL!'
            );
          }
        });
      }
    });
    if (set.length == 0) {
      return this.insert(orig_table, {}, ignore, suffix === '' ? null : suffix);
    }

    const map = [];
    const columns = Object.keys(set[0]);

    set.forEach((rowObj) => {
      const row = [];
      columns.forEach((a) => {
        if (typeof rowObj[a] !== 'undefined') {
          row.push(this._qb_escape(rowObj[a]));
        }
      });
      if (row.length !== columns.length) {
        throw new Error(
          `insert_batch(): Cannot use batch insert into ${table} - fields must match on all rows (${row.join(
            ','
          )} vs ${columns.join(',')}).`
        );
      }
      map.push('(' + row.join(', ') + ')');
    });
    const verb = 'INSERT' + (ignore === true ? ' IGNORE' : '');
    const sql = `${verb} INTO ${this.from_array[0]} (${columns.join(
      ', '
    )}) VALUES ${map.join(', ')} ${suffix.trim()}`;
    return sql.trim();
  }

  _count(table) {
    if (typeof table === 'string') {
      this.from(table);
    }

    const from_clause = this._build_from_clause().trim();
    const join_string = this._build_join_string().trim();
    const where_clause = this._build_where_clause().trim();

    let sql = `SELECT COUNT(*) AS ${this._protect_identifiers(
      'numrows'
    )} ${from_clause}`;
    sql += join_string ? ` ${join_string}` : '';
    sql += where_clause ? ` ${where_clause}` : '';

    return sql.trim();
  }
}
