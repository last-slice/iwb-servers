import { DeploymentData } from "src/utils/types";

const fs = require('fs-extra');

export async function updateSceneMetadata(filePath:string, deploymentData:DeploymentData){
    fs.readFile(filePath + "/scene.json", 'utf-8', (error:any, data:any) => {
        if (error) {
          console.error(`Error reading JSON file: ${error}`);
          throw new Error("error reading json")
        }
      
        try {
          const jsonObject = JSON.parse(data);
          console.log('Parsed JSON data:', jsonObject);
          jsonObject.display.title = "" + deploymentData.worldName + "'s IWB World";
          jsonObject.display.description = "IWB World playground"
          jsonObject.worldConfiguration = {
            name: "" + deploymentData.ens
          }
          const updatedJsonString = JSON.stringify(jsonObject, null, 2); // The `null, 2` arguments are for formatting (indentation)
      
          fs.writeFile(filePath + "/scene.json", updatedJsonString, 'utf-8', (error:any) => {
            if (error) {
              console.error(`Error writing JSON file: ${error}`);
              throw new Error("Error writing scene json")
            } else {
              console.log('JSON file updated successfully.');
            }
          });
        } catch (parseError) {
          console.error(`Error parsing JSON data: ${parseError}`);
          throw new Error("Error writing scene json")
        }
      });
}