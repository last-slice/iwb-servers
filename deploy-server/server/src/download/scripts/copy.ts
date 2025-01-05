import * as fs from 'fs-extra';
import path from 'path';
import { bucketDirectory } from '.';

export async function copyTemplate(location:string, data:any){
    // try{
    //     await fs.copy(templateDirectory, location)
    // }
    // catch(e){
    //     console.error(`Error copying folder: ${e}`);
    // }
}

export const copyDirectory = async (
  destinationDir: string,
): Promise<void> => {
  try {
    // Ensure the destination directory exists
    await fs.ensureDir(destinationDir);
    const excludeDirs:string[] = ["node_modules", "assets", "bin"]

    // Copy the directory with filtering
    await fs.copy(bucketDirectory, destinationDir, {
      filter: (src) => {
        // Normalize the path for consistent comparison
        const relativePath = path.relative(bucketDirectory, src);
        const normalizedPath = relativePath.split(path.sep).join('/'); // For cross-platform compatibility

        // Exclude directories listed in `excludeDirs`
        for (const excludedDir of excludeDirs) {
          if (normalizedPath.startsWith(excludedDir)) {
            console.log(`Excluding: ${src}`);
            return false;
          }
        }

        return true; // Include everything else
      },
    });

    console.log(`Directory copied from ${bucketDirectory} to ${destinationDir}`);
  } catch (error) {
    console.error('Error copying directory:', error);
    throw error;
  }
};
