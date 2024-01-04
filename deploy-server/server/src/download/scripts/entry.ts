import * as fs from 'fs';
import { temporaryDirectory } from '.';

let index = `
import { initIWBScene } from "./iwb/iwb"

export function main() {
  initIWBScene()
}
`

export async function writeIndexFile(data:any){
    fs.writeFileSync(temporaryDirectory + data.o + "-" + data.id + "/src/index.ts", index);
}


