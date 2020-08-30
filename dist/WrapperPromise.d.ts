export declare class WrapperPromise {
    sql: string;
    cb: Function;
    exec: Function;
    resolve: any;
    reject: any;
    constructor(sql: any, exec: any, cb?: Function);
    promisify(): Promise<unknown>;
    invoke(): void;
}
