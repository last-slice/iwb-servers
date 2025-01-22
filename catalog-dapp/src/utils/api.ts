
import JSZip, { files } from "jszip";
import resources from "./resources";
import CryptoJS from "crypto-js";


const IGNORE_FILE_LIST = (resources.IGNORE_FILES || "").split(",");
const IGNORE_FILE_TYPES = (resources.IGNORE_FILE_TYPES || "").split(",");
const IGNORE_DIRECTORIES = (resources.IGNORE_DIRECTORIES || "").split(",");
const MAX_FILE_SIZE = parseSize(resources.MAX_FILE_SIZE || "50MB");
const MAX_TOTAL_SIZE = parseSize(resources.MAX_TOTAL_SIZE || "50MB");

/**
 * Checks if a file has an ignored file type.
 * @param fileName - The name of the file.
 * @returns `true` if the file type is ignored, `false` otherwise.
 */
const isIgnoredFileType = (fileName: string): boolean => {
  return IGNORE_FILE_TYPES.some((ext) => fileName.endsWith(ext));
};

/**
 * Normalizes a relative path by removing the top-level directory from the ZIP.
 * @param relativePath - The full path of the file in the ZIP.
 * @returns The normalized path without the top-level directory.
 */
const normalizePath = (relativePath: string): string => {
  const segments = relativePath.split("/");
  return segments.slice(1).join("/"); // Remove the first segment (top-level directory)
};

/**
 * Checks if a path is within an ignored directory.
 * @param filePath - The relative path of the file or folder.
 * @returns `true` if the path is in an ignored directory, `false` otherwise.
 */
const isInIgnoredDirectory = (filePath: string): boolean => {
  if(filePath === ""){
    console.log('file path is nothing')
    return true
  }

  const normalizedDir = filePath.split("/")[0]; // Get the top-level directory
  return IGNORE_DIRECTORIES.includes(normalizedDir);
};

/**
 * Validates a single file against criteria.
 * @param fileName - The name of the file.
 * @param fileSize - The size of the file.
 * @param filePath - The relative path of the file in the zip archive.
 * @returns `true` if the file passes validation, `false` otherwise.
 */
const validateFile = (fileName: string, fileSize: number, filePath: string, error:any): boolean => {
  if (IGNORE_FILE_LIST.includes(fileName)) {
    console.warn(`File ignored: ${fileName}`);
    return false;
  }

  if (isIgnoredFileType(fileName)) {
    console.warn(`File type ignored: ${fileName}`);
    return false;
  }

  if (isInIgnoredDirectory(filePath)) {
    console.warn(`File in ignored directory: ${filePath}`);
    return false;
  }

  if (fileSize > MAX_FILE_SIZE) {
    console.warn(`File too large: ${fileName} (${fileSize} bytes)`);
    error = {
      msg:"Filesize exceeds size limits",
      type:'filesize'
    }
    return false;
  }

  return true;
};

export const processZipFile = async (zipFile: File, parcels:number) => {
  try {
    const zip = new JSZip();
    const zipData = await zip.loadAsync(zipFile);
    const validFiles: { name: string; size: number; path: string }[] = [];
    const newZip = new JSZip();

    let fileCount = 0
    let largestFileSize = 0
    let size = 0
    let error:any
    let newZipBlob:any

    for (const relativePath of Object.keys(zipData.files)) {
      const file = zipData.files[relativePath];      
      const normalizedPath = normalizePath(relativePath);

      if(file.dir){
        console.log('we have directory, validate')

        if(isInIgnoredDirectory(normalizedPath) || normalizedPath === ""){
          console.log('directory is being ignored')
        }else{
          newZip.folder(normalizedPath);
        }
      }else{
          // Normalize the file path
        const normalizedPath = normalizePath(relativePath);
        const content = await file.async("blob"); // Extract file content as a Blob
        const fileSize = content.size; // Use the Blob's size property

        if (validateFile(file.name, fileSize, normalizedPath, error)) {
          // Add the file to the new zip archive
          newZip.file(normalizedPath, content);
          fileCount++
          size += fileSize

          console.log('filesize is', fileSize)
          if(fileSize > largestFileSize){
            largestFileSize = fileSize
          }
        }
      }
    }

    // Generate the new zip as a Blob
    newZipBlob = await newZip.generateAsync({ type: "blob" });

    if (newZipBlob.size > MAX_TOTAL_SIZE || ((newZipBlob.size/1024/1024) > parcels * 15)) {
      error = {
        msg:"Scene exceeds size limits",
        type:'scenesize'
      }
    }
  
    return {newZipBlob, fileCount, size, largestFileSize, error};
  } catch (error:any) {
    console.error("Error processing ZIP file:", error);
    throw new Error(error.message)
  }
};

/**
 * Convert a size string (e.g., "50MB") to bytes.
 * @param sizeStr - The size string.
 * @returns The size in bytes.
 */
function parseSize(sizeStr: string): number {
  const sizeRegex = /^(\d+)(KB|MB|GB)$/i;
  const match = sizeStr.match(sizeRegex);

  if (!match) {
    throw new Error(`Invalid size format: ${sizeStr}`);
  }

  const size = parseInt(match[1], 10);
  const unit = match[2].toUpperCase();

  switch (unit) {
    case "KB":
      return size * 1024;
    case "MB":
      return size * 1024 * 1024;
    case "GB":
      return size * 1024 * 1024 * 1024;
    default:
      throw new Error(`Unsupported size unit: ${unit}`);
  }
}

export const formatUnixTimestamp = (timestamp: number) => {
  const date = new Date(timestamp * 1000); // Convert Unix timestamp to milliseconds
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long", // Full day name (e.g., Tuesday)
    day: "numeric",  // Day of the month (e.g., 14)
    month: "long",   // Full month name (e.g., December)
    year: "numeric", // Full year (e.g., 2021)
    hour: "2-digit", // Hour (e.g., 04 or 16 depending on the time format)
    minute: "2-digit", // Minute (e.g., 05)
    second: "2-digit", // Second (e.g., 45)
    hour12: true,   // Use 24-hour format; set to true for 12-hour format
  };

  // Format the date with time
  const formatter = new Intl.DateTimeFormat("en-US", options);
  const formattedDateTime = formatter.format(date);

  return formattedDateTime;
}


export const hashFile = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer);
  return CryptoJS.SHA256(wordArray).toString(CryptoJS.enc.Hex); // Returns the hash as a hex string
};