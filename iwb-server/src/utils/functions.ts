const { exec } = require('child_process');

import axios from 'axios';
import { Vector3 } from '../Objects/Transform';

const command = '../iwb-server.sh';

export function initIWBDeploy(){
  axios.post( process.env.DEPLOYMENT_ENDPOINT + "/false",{
      auth:process.env.DEPLOYMENT_AUTH
  })
  .then(function (response:any) {
  // console.log(response);
  })
  .catch(function (error:any) {
  console.log('init iwb deployument error', error);
  })
}

export function initDeployServerDeploy(){
  try {
      // Execute the shell command
      const childProcess = exec(command)

      // Listen for stdout data events
      childProcess.stdout.on('data', (data:any) => {
         // console.log(`stdout: ${data}`);
      });
          
      // Listen for stderr data events
      childProcess.stderr.on('data', (data:any) => {
          console.error(`stderr: ${data}`);

          if(data.substring(0,5) === "Error"){
              console.log('we have an error with deployment')
          }
          else if(data === "Content uploaded successfully"){
              // console.log('we finished deploying')
          }
      });

      // You can also listen for the child process to exit
      childProcess.on('exit', (code:any, signal:any) => {
          if (code === 0) {
            //   console.log('Child process exited successfully.');
            } else {
            //   console.error(`Child process exited with code ${code}.`);
            }        
      });

    } catch (error) {
      console.error(error);
    }
}

export function getRandomIntInclusive(min:number, max:number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
}

export function getRandomIntWithDecimals(min:number, max:number) {
  return (Math.random() * (max - min)) + min;
}


export function generateRandomId(length:number) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

export function distance(player:any, object:any){
    return Math.sqrt(
    Math.pow(player.x - object.x, 2) + Math.pow(player.y - object.y, 2) + Math.pow(player.z- object.z, 2)
  );
}

export function distanceObjects(from:any, to:any){
  return Math.sqrt(
  Math.pow(from.x - to.x, 2) + Math.pow(from.y - to.y, 2) + Math.pow(from.z- to.z, 2)
);
}

export function isJSON(value:any) {
  try {
    const parsedValue = JSON.parse(value);
    return typeof parsedValue === "object";
  } catch (error) {
    return false;
  }
}

export function deepCopyMap(originalMap: Map<any, any>): Map<any, any> {
  const newMap = new Map<any, any>();

  originalMap.forEach((value, key) => {
    // For primitive values, you can directly assign them to the new map
    if (typeof value !== 'object' || value === null) {
      newMap.set(key, value);
    }
    // For object values, create a deep copy recursively
    else {
      newMap.set(key, deepCopyMap(value));
    }
  });

  return newMap;
}

export const getStartOfDayUTC = () => {
  const currentDate = new Date();
  const isDST = isEasternDaylightTime();
  const offset = isDST ? -4 : -5; // Offset for EST or EDT (GMT-4:00 or GMT-5:00) depending on DST

  const startOfDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate(),
    0, 0, 0, 0
  );

  const startOfDayUTC = startOfDay.getTime() + offset * 60 * 60 * 1000;
  return Math.floor(startOfDayUTC / 1000);
  };

  const isEasternDaylightTime = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
  
    // DST starts on the second Sunday in March
    const dstStart = new Date(currentYear, 2, 8 + (14 - new Date(currentYear, 2, 1).getDay()));
    dstStart.setUTCHours(7); // Adjust UTC hours to 7 AM
  
    // DST ends on the first Sunday in November
    const dstEnd = new Date(currentYear, 10, 1 + (7 - new Date(currentYear, 10, 1).getDay()));
    dstEnd.setUTCHours(6); // Adjust UTC hours to 6 AM
  
    return currentDate >= dstStart && currentDate < dstEnd;
  };

  // Define a simple Vector3-like class or object
// export class Vector3 {
//   x:number
//   y:number
//   z:number

//   constructor(x:number, y:number, z:number) {
//     this.x = x;
//     this.y = y;
//     this.z = z;
//   }

//   lerp(target:Vector3, t:number) {
//     return new Vector3(
//       lerp(this.x, target.x, t),
//       lerp(this.y, target.y, t),
//       lerp(this.z, target.z, t)
//     );
//   }

//    // Method to subtract two Vector3 positions
//    subtract(other: Vector3): Vector3 {
//     return new Vector3(
//         this.x - other.x,
//         this.y - other.y,
//         this.z - other.z
//     );
// }
// }

function lerp(start:number, end:number, t:number) {
  return (1 - t) * start + t * end;
}


// Rotate the vector around the Y axis
export function rotateY(vector:any, angle: number): Vector3 {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return new Vector3(
    {x:cos * vector.x - sin * vector.z,
    y:vector.y,
    z:sin * vector.x + cos * vector.z}
);
}

// Rotate the vector around the X axis
export function rotateX(vector:any, angle: number): Vector3 {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return new Vector3(
    {x:vector.x,
    y:cos * vector.y - sin * vector.z,
    z:sin * vector.y + cos * vector.z}
  );
}

// Rotate the vector around the Z axis
export function rotateZ(vector:any, angle: number): Vector3 {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
      
  return new Vector3(
    {x:cos * vector.x - sin * vector.y,
    y:sin * vector.x + cos * vector.y,
    z:vector.z}
  );
}