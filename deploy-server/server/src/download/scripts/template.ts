import * as fs from 'fs';
import { temporaryDirectory } from '.';

export async function writeSceneTemplate(location:string, data:any){
    let jsonString = JSON.stringify(data, null, 2);
    let config = `
export let scene:any = ${jsonString};
`
    fs.writeFileSync(location, config);
}