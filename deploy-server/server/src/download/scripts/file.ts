import * as fs from 'fs';
import { temporaryDirectory } from './index';


export async function writeFile(template:any, data:any){
    await fs.writeFileSync(temporaryDirectory + data.o + "-" + data.id + '/src/iwb/iwb.ts', template);
}