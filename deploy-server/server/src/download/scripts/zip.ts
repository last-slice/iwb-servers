import * as fs from 'fs-extra';
import { assetDirectory, bucketDirectory, temporaryDirectory } from '.';
import { addDownloadQueue } from '..';
import { fail } from 'assert';
import path from 'path';
import fss from "fs/promises";
import archiver from "archiver";
import Axios from 'axios';
import { downloadSceneImage } from './downloadImage';
import { copyAssetsToZip, copyUITextures } from './assets';
import { REQUIRED_ASSETS } from '../../utils/types'

const fsp = require('fs/promises');
const JSZip = require('jszip');

interface ProcessDirectoryResult {
  zipBlob: Buffer;
  error?: any;
}

export async function zipScene(data:any, type:string){
  // return new Promise(async (resolve) => {
  //   let directory:string = path.join(temporaryDirectory, data.metadata.o + "-" + data.id)
  //   console.log('zipping scene')
  //   try {
  //     const zip = await createZipFromFolder(directory);
  //     let now = Math.floor(Date.now()/1000)
  //     zip
  //       .generateNodeStream({ streamFiles: true, compression: 'DEFLATE' })
  //       .pipe(fs.createWriteStream(directory + '.zip'))
  //       .on('error', (err:any) => console.error('Error writing file', err.stack))
  //       .on('finish', async () => {
  //         console.log('finished zipping')
  //         addDownloadQueue(data.id, data.metadata.o, now)
  //         resolve(data)
  //       });
  //   } catch (ex) {
  //     console.error('Error creating zip', ex);
  //     fail()
  //   }
  // });
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

export const zipDirectory = async (data:any, sceneJSON:any): Promise<void> => {
  let directory:string = path.join(temporaryDirectory, data.metadata.o + "-" + data.id)
  console.log('zipping directory', directory)
  const excludedDirectories:string[] = ["assets", "node_modules", "bin"]

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

export const createZipFromDirectory = async (
  outputZipPath: string,
  sceneJSON:any
): Promise<void> => {
  let excludeDirs: string[] = ["node_modules", "assets", "bin", ".git"]
  let excludeFiles: string[] = [".gitignore", "README.md", ".gitattributes"]
  try {
      // Ensure the source directory exists
      await fss.access(bucketDirectory);

      // Create a write stream for the zip file
      const output = await fss.open(outputZipPath, "w");
      const archive = archiver("zip", {
          zlib: { level: 9 }, // Best compression
      });

      const stream = output.createWriteStream();
      archive.pipe(stream);

      // Function to recursively add files to the archive
      const addFilesToArchive = async (dir: string, sceneJSON:any) => {
          const items = await fss.readdir(dir, { withFileTypes: true });

          for (const item of items) {
              const fullPath = path.join(dir, item.name);
              const relativePath = path.relative(bucketDirectory, fullPath);

              if (item.isDirectory()) {
                  // Skip directories in the exclude list
                  if (excludeDirs.includes(relativePath)) {
                      console.log(`Skipping excluded directory: ${relativePath}`);
                      continue;
                  }
                  await addFilesToArchive(fullPath, sceneJSON);
              } else if (item.name === "scene.json") {
                  // Modify `scene.json` if applicable
                  const jsonContent = await fss.readFile(fullPath, "utf-8");
                  const json = JSON.parse(jsonContent);
                  console.log('json content is', json)

                  json.display.title = sceneJSON.metadata.n
                  json.display.description = sceneJSON.metadata.d
                  json.display.owner = sceneJSON.metadata.o
                  json.display.navmapThumbnail = "images/scene-thumbnail.png" 
                  json.scene.parcels = sceneJSON.pcls
                  json.scene.base = sceneJSON.bpcl
                  json.spawnPoints = []
                  console.log('spawn points', sceneJSON.sp)
                  sceneJSON.sp.forEach((spawn:any, i:number)=>{
                    let [x,y,z] = spawn.split(",")
                    let [cx,cy,cz] = sceneJSON.cp[i].split(",")
                    console.log('spawn is', spawn, x,y,z)
                    json.spawnPoints.push({
                      name:"spawn-"+i,
                      default:true,
                      position:{
                        x:parseFloat(x),
                        y:parseFloat(y),
                        z:parseFloat(z)
                      },
                      cameraTarget:
                      {
                        x:parseFloat(cx),
                        y:parseFloat(cy),
                        z:parseFloat(cz)
                      },
                    })
                  })

                  json.iwb.name = sceneJSON.w
                  json.iwb.gcScene = true
                  json.iwb.scene = sceneJSON.id

                  // Add the modified JSON to the zip
                  archive.append(JSON.stringify(json, null, 2), { name: relativePath });
              } 
              else if(item.name === "scene-thumbnail.png"){
                console.log(`❌ Skipping image thumbnail until later`);
              }
              else {
                    // Skip excluded files
                  if (excludeFiles.includes(item.name)) {
                    console.log(`❌ Skipping excluded file: ${item.name}`);
                    continue;
                  }

                  archive.file(fullPath, { name: relativePath });
              }
          }
      };

      // Start adding files
      await addFilesToArchive(bucketDirectory, sceneJSON);

      // Add the scene.ts file under src/iwb/
      const sceneTsContent = `export let iwbScene:any = ${JSON.stringify(sceneJSON, null, 2)}`;
      archive.append(sceneTsContent, { name: 'src/iwb/scene.ts' });

      if(sceneJSON.metadata.im !== ""){
        let {file, extension} = await downloadSceneImage(sceneJSON)
        if(file !== undefined){
          archive.append(file, { name: 'images/scene-thumbnail' + extension });        
        }
      }else{
        archive.file(path.join(bucketDirectory, "images", "scene-thumbnail.png"), { name: 'images/scene-thumbnail.png' });    
      }

      //add assets
      await copyAssetsToZip(archive, sceneJSON)
      await copyUITextures("", undefined, archive)

      //add required textures
      for(let i = 0; i < Object.values(REQUIRED_ASSETS).length; i++){
        let file = Object.values(REQUIRED_ASSETS)[i]
        try{
          archive.file(path.join(assetDirectory, file), { name: "assets/" + file });
        }
        catch(e){
            console.log('file copy error', e)
        }
      }

      // Finalize the archive
      await archive.finalize();

      return new Promise<void>((resolve, reject) => {
          stream.on("close", () => {
              console.log(`Zip file created at: ${outputZipPath}`);
              resolve();
          });

          stream.on("error", reject);
      });
  } catch (error) {
      console.error(`Error creating zip file for ${bucketDirectory}:`, error);
      throw error;
  }
};
