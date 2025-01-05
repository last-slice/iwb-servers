import fs from 'fs-extra';
import path from 'path';

export const addSceneJSONFile = async (directory: string, jsonData: object): Promise<void> => {
  try {
    const jsonFilePath = path.join(directory, "src", "iwb", "scene.json");

    // Write the JSON file
    await fs.writeJson(jsonFilePath, jsonData, { spaces: 2 });

    console.log(`JSON file added: ${jsonFilePath}`);
  } catch (error) {
    console.error('Error adding JSON file:', error);
    throw error;
  }
};