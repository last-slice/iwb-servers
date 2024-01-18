import * as fs from 'fs';
import { temporaryDirectory } from '.';

let index = `
import { initIWBScene } from "./iwb/iwb"

export function main() {
  initIWBScene()
}
`

export async function writeIndexFile(location:any){
    fs.writeFileSync(location, index);
}


