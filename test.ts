import {QueryExec} from './src/index';

const a = new QueryExec({} as any);
a.AutoExeQueryStatus(false);

a.get('oaisjdj').then(console.log);