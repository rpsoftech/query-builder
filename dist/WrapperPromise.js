"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WrapperPromise = void 0;
class WrapperPromise {
    constructor(sql, exec, cb) {
        this.sql = sql;
        this.exec = exec;
        if (typeof cb === "function")
            this.cb = cb.bind(this);
    }
    promisify() {
        return new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
            this.invoke();
        });
    }
    invoke() {
        this.exec(this.sql, (err, res) => {
            if (err) {
                this.reject(err);
                return;
            }
            if (typeof this.cb === "function") {
                this.cb(err, res);
                return;
            }
            this.resolve(res);
        });
    }
}
exports.WrapperPromise = WrapperPromise;
