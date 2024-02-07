import { iwbManager } from "../../app.config";
import { IWBRoom } from "../../rooms/IWBRoom";
import { setTitleData } from "../../utils/Playfab";
import { getRandomIntInclusive } from "../../utils/functions";
import { createBuildCompetition, destroyBuildCompetition } from "./BuildCompetition";

let backupInterval:any
export let backupRequired:boolean = false
let backingUp:boolean = false

backupInterval = setInterval(async ()=>{
    if(backupRequired && !backingUp){
        console.log('backing up Custom Keys')
        await backup()
    }
}, 1000 * getRandomIntInclusive(0, 30))

async function backup(){
    backingUp = true
    try{
        for(let key in iwbManager.customKeys){
            await setTitleData({Key: key, Value: JSON.stringify(iwbManager.customKeys[key])})
        }

        backingUp = false
        backupRequired = false
    }
    catch(e){
        backingUp = false
        backupRequired = false
    }
}

export function queueBackup(){
    backupRequired = true
}

export function createCustomObjects(room:IWBRoom){
    createBuildCompetition(room)
}

export async function destroyCustomObjects(room:IWBRoom){
   await destroyBuildCompetition(room)
   queueBackup()
}