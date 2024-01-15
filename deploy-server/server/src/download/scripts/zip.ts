import * as fs from 'fs';
import * as fsExtra from 'fs-extra';
import { temporaryDirectory } from '.';
import { addDownloadQueue } from '..';
import { fail } from 'assert';
const fsp = require('fs/promises');
const path = require('path');
const JSZip = require('jszip');

export async function zipScene(data:any){
  return new Promise(async (resolve) => {
    let user = data.o
    let sceneId = data.id
    try {
      const zip = await createZipFromFolder(temporaryDirectory + data.o + "-" + data.id);
      let now = Math.floor(Date.now()/1000)
      zip
        .generateNodeStream({ streamFiles: true, compression: 'DEFLATE' })
        .pipe(fs.createWriteStream(temporaryDirectory + data.o + "-" + data.id + '.zip'))
        .on('error', (err:any) => console.error('Error writing file', err.stack))
        .on('finish', async () => {
          await fsExtra.remove(temporaryDirectory + data.o + "-" + data.id)
          addDownloadQueue(sceneId, user, now)
          resolve(data)
        });
    } catch (ex) {
      console.error('Error creating zip', ex);
      fail()
    }
  });
}

const createZipFromFolder = async (dir:any) => {
  const absRoot = path.resolve(dir);
  const filePaths = await getFilePathsRecursively(dir);
  return filePaths.reduce((z, filePath) => {
    const relative = filePath.replace(absRoot, '');
    const zipFolder = path
      .dirname(relative)
      .split(path.sep)
      .reduce((zf:any, dirName:any) => zf.folder(dirName), z);

    zipFolder.file(path.basename(filePath), fs.createReadStream(filePath));
    return z;
  }, new JSZip());
};

const getFilePathsRecursively = async (dir:any) => {
  const list = await fsp.readdir(dir);
  const statPromises = list.map(async (file:any) => {
    const fullPath = path.resolve(dir, file);
    const stat = await fsp.stat(fullPath);
    if (stat && stat.isDirectory()) {
      return getFilePathsRecursively(fullPath);
    }
    return fullPath;
  });

  return (await Promise.all(statPromises)).flat(Infinity);
};