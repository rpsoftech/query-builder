"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pool = void 0;
const maria = require("mariadb");
const query_exec_1 = require("./query_exec");
class Pool {
    constructor(settings) {
        this._pool = maria.createPool(settings);
    }
    pool() {
        return this._pool;
    }
    get_connection() {
        if (!this._pool) {
            const error_msg = "Connection pool not available!";
            if (console && console.hasOwnProperty('error'))
                console.error(error_msg);
            throw new Error(error_msg);
        }
        return new Promise((resolve, reject) => {
            this._pool.getConnection().then(db => {
                resolve(new query_exec_1.QueryExec(db));
            }).catch(err => {
                reject(err);
            });
        });
    }
    disconnect(cb) {
        if (!cb || (cb && typeof cb !== 'function')) {
            return new Promise((resolve, reject) => {
                this._pool.end().then(resolve);
            });
        }
        else {
            this._pool.end();
            cb();
        }
    }
}
exports.Pool = Pool;
//# sourceMappingURL=pool.js.map