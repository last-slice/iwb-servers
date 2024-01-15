"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Vector3 = exports.getStartOfDayUTC = exports.deepCopyMap = exports.isJSON = exports.distanceObjects = exports.distance = exports.generateRandomId = exports.getRandomIntWithDecimals = exports.getRandomIntInclusive = exports.initDeployServerDeploy = exports.initIWBDeploy = void 0;
const { exec } = require('child_process');
const axios_1 = __importDefault(require("axios"));
const command = '../iwb-server.sh';
function initIWBDeploy() {
    axios_1.default.post(process.env.DEPLOYMENT_ENDPOINT + "/false", {
        auth: process.env.DEPLOYMENT_AUTH
    })
        .then(function (response) {
        console.log(response);
    })
        .catch(function (error) {
        console.log(error);
    });
}
exports.initIWBDeploy = initIWBDeploy;
function initDeployServerDeploy() {
    try {
        // Execute the shell command
        const childProcess = exec(command);
        // Listen for stdout data events
        childProcess.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });
        // Listen for stderr data events
        childProcess.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
            if (data.substring(0, 5) === "Error") {
                console.log('we have an error with deployment');
            }
            else if (data === "Content uploaded successfully") {
                console.log('we finished deploying');
            }
        });
        // You can also listen for the child process to exit
        childProcess.on('exit', (code, signal) => {
            if (code === 0) {
                console.log('Child process exited successfully.');
            }
            else {
                console.error(`Child process exited with code ${code}.`);
            }
        });
    }
    catch (error) {
        console.error(error);
    }
}
exports.initDeployServerDeploy = initDeployServerDeploy;
function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
}
exports.getRandomIntInclusive = getRandomIntInclusive;
function getRandomIntWithDecimals(min, max) {
    return (Math.random() * (max - min)) + min;
}
exports.getRandomIntWithDecimals = getRandomIntWithDecimals;
function generateRandomId(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
exports.generateRandomId = generateRandomId;
function distance(player, object) {
    return Math.sqrt(Math.pow(player.x - object.x, 2) + Math.pow(player.y - object.y, 2) + Math.pow(player.z - object.z, 2));
}
exports.distance = distance;
function distanceObjects(from, to) {
    return Math.sqrt(Math.pow(from.x - to.x, 2) + Math.pow(from.y - to.y, 2) + Math.pow(from.z - to.z, 2));
}
exports.distanceObjects = distanceObjects;
function isJSON(value) {
    try {
        const parsedValue = JSON.parse(value);
        return typeof parsedValue === "object";
    }
    catch (error) {
        return false;
    }
}
exports.isJSON = isJSON;
function deepCopyMap(originalMap) {
    const newMap = new Map();
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
exports.deepCopyMap = deepCopyMap;
const getStartOfDayUTC = () => {
    const currentDate = new Date();
    const isDST = isEasternDaylightTime();
    const offset = isDST ? -4 : -5; // Offset for EST or EDT (GMT-4:00 or GMT-5:00) depending on DST
    const startOfDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0, 0, 0);
    const startOfDayUTC = startOfDay.getTime() + offset * 60 * 60 * 1000;
    return Math.floor(startOfDayUTC / 1000);
};
exports.getStartOfDayUTC = getStartOfDayUTC;
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
class Vector3 {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    lerp(target, t) {
        return new Vector3(lerp(this.x, target.x, t), lerp(this.y, target.y, t), lerp(this.z, target.z, t));
    }
}
exports.Vector3 = Vector3;
function lerp(start, end, t) {
    return (1 - t) * start + t * end;
}
