import * as fs from 'fs-extra';
import { temporaryDirectory } from '.';
import { addDownloadQueue } from '..';
import { fail } from 'assert';

const fsp = require('fs/promises');
const path = require('path');
const JSZip = require('jszip');

interface ProcessDirectoryResult {
  zipBlob: Buffer;
  error?: any;
}

export async function zipScene(data:any, type:string){
  return new Promise(async (resolve) => {
    let directory:string = path.join(temporaryDirectory, data.metadata.o + "-" + data.id)
    console.log('zipping scene')
    try {
      const zip = await createZipFromFolder(directory);
      let now = Math.floor(Date.now()/1000)
      zip
        .generateNodeStream({ streamFiles: true, compression: 'DEFLATE' })
        .pipe(fs.createWriteStream(directory + '.zip'))
        .on('error', (err:any) => console.error('Error writing file', err.stack))
        .on('finish', async () => {
          console.log('finished zipping')
          addDownloadQueue(data.id, data.metadata.o, now)
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

export const processDirectory = async (
  scene:any
): Promise<ProcessDirectoryResult> => {
  try {
    const sourceDir = process.env.NODE_ENV === "Development" ? process.env.DEV_IWB_BUCKET_DIRECTORY : process.env.PROD_WB_BUCKET_DIRECTORY
    const outputDir = process.env.NODE_ENV === "Development" ? process.env.DEV_DOWNLOAD_TEMP_DIRECTORY : process.env.PROD_DOWNLOAD_TEMP_DIRECTORY
    const zipFileName = '' + scene.metadata.o + "-" + scene.id + ".zip";
    const zipFilePath = path.join(outputDir, zipFileName);
    const zip = new JSZip();
    const excludedDirectories:string[] = []

    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const addDirectoryToZip = (dirPath: string, zipFolder:any) => {
      const files = fs.readdirSync(dirPath);

      files.forEach((file) => {
        const fullPath = path.join(dirPath, file);
        const stats = fs.statSync(fullPath);

        // Exclude the `assets` directory
        if (stats.isDirectory() && excludedDirectories.includes(file)) {
          console.log(`Excluding directory: ${fullPath}`);
          return;
        }

        if (stats.isDirectory()) {
          const subFolder = zipFolder.folder(file)!;
          addDirectoryToZip(fullPath, subFolder);
        } else {
          const content = fs.readFileSync(fullPath);
          zipFolder.file(file, content);
        }
      });
    };

      addDirectoryToZip(sourceDir, zip);
      // Add the scenes.json file
      const scenesContent = JSON.stringify(scene, null, 2);
      // Add the `scenes.json` file to the `src` subdirectory in the ZIP
      zip.folder('src')!.file('/iwb/scene.json', scenesContent);

      // Generate the ZIP file as a buffer
      const zipBlob = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
      // Write the buffer to the file system
      fs.writeFileSync(zipFilePath, zipBlob);

      console.log('finished writing download file')

      return {
        zipBlob,
      };
  } catch (error) {
    console.error('Error processing directory:', error);
    throw error;
  }
};

export const zipDirectory = async (data:any, type:string): Promise<void> => {
  let directory:string = path.join(temporaryDirectory, data.metadata.o + "-" + data.id)
  console.log('zipping directory', directory)
  const excludedDirectories:string[] = ["assets", "node_modules"]

  try {
    const zip = new JSZip();

    // Recursively add files to the ZIP
    const addFilesToZip = async (dirPath: string, zipFolder: any): Promise<void> => {
      const files = await fs.readdir(dirPath);

      for (const file of files) {
        // console.log('file is', file)
        const fullPath = path.join(dirPath, file);
        const stats = await fs.stat(fullPath);

        // Exclude the `assets` directory
        if (stats.isDirectory() && excludedDirectories.includes(file)) {
          console.log(`Excluding directory: ${fullPath}`);
          return;
        }

        if (stats.isDirectory()) {
          const subFolder = zipFolder.folder(file)!;
          await addFilesToZip(fullPath, subFolder);
        } else {
          const content = await fs.readFile(fullPath);
          zipFolder.file(file, content);
        }
      }
    };

    // console.log('adding files to zip')
    await addFilesToZip(directory, zip);

    // Generate the ZIP file as a buffer
    const zipBlob = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });

    console.log('generated zip blob')
    // Write the ZIP file to the file system
    await fs.writeFile(directory + '.zip', zipBlob);

    console.log(`ZIP file created: ${directory}`);
  } catch (error) {
    console.error('Error creating ZIP file:', error);
    throw error;
  }
};