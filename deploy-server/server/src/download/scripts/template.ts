import * as fs from 'fs';
import { temporaryDirectory } from '.';

export async function writeSceneTemplate(data:any){
    let jsonString = JSON.stringify(data, null, 2);
    let config = `
export let scene:any = ${jsonString};
`
    fs.writeFileSync(temporaryDirectory + data.o + "-" + data.id + "/src/iwb/config.ts", config);
}