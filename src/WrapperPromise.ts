export class WrapperPromise {
    /**
     *
     * @param {String} sql - A sql command
     * @param {function} exec - A sql execution function
     * @param {function} cb - A callback function
     *
     * @description
     * Wraps the execute command in promise
     */
    sql:string;
    cb:Function;
    exec:Function;
    resolve;
    reject;
    constructor(sql, exec, cb?:Function) {
        this.sql = sql;
        this.exec = exec;
        if (typeof cb === "function") this.cb = cb.bind(this);
    }

    /**
     * Promisify
     */
    promisify() {
        return new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
            this.invoke();
        });
    }

    /**
     * Executet the query and resolve as the result
     */
    invoke() {
        this.exec(this.sql, (err, res) => {
            if (err) {
                this.reject(err);
                return;
            }

            /**
             * If theres is a cb function, let the cb function resolve and reject the promise
             */
            if (typeof this.cb === "function") {
                this.cb(err, res);
                return;
            }

            this.resolve(res);
        });
    }
}
// interface callback(err:string,res:Function);
