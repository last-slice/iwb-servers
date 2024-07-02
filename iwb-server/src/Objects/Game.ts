import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Scene } from "./Scene";
import { COMPONENT_TYPES, SERVER_MESSAGE_TYPES } from "../utils/types";
import { itemManager } from "../app.config";
import { createNewItem } from "../rooms/messaging/ItemHandler";
import { IWBRoom } from "../rooms/IWBRoom";
import { Client, generateId } from "colyseus";
import { Quaternion, Vector3 } from "./Transform";
import { createLevelComponent } from "./Level";
import { editTriggerComponent } from "./Trigger";

export class GameComponent extends Schema{
    @type("string") id:string = ""
    @type("string") name:string = ""
    @type("string") image:string = ""
    @type("string") description:string = ""
    @type("string") startScreen:string = "iwb"
    @type("string") loadingScreen:string
    @type("number") type:number
    @type("number") startLevel:number
    @type("number") currentLevel:number
    @type(Vector3) loadingSpawn:Vector3
    @type("boolean") invisibleStartBox:boolean //do we need this?
    @type("boolean") saveProgress:boolean //do we need this?
    @type("boolean") premiumAccess:boolean //do we need this? ifo
    @type("boolean") premiumAccessType:boolean //do we need this? ifo
    @type("boolean") premiumAccessItem:boolean //do we need this? ifo
    //levels here?

    //game component can have children components to track "global" variables
    // like time, score, health, death, etc
}

export function createGameComponent(scene:Scene, aid:string, data:any){
    let component:any = new GameComponent()
    for(let key in data){
        if(key === "loadingSpawn"){
            component[key] = new Vector3(data[key])
        }else{
            component[key] = data[key]
        }
        
    }
    scene[COMPONENT_TYPES.GAME_COMPONENT].set(aid, component)
}

export function editGameComponent(info:any, scene:Scene){
    let itemInfo:any = scene[COMPONENT_TYPES.GAME_COMPONENT].get(info.aid)
    if(itemInfo){
        for(let key in info){
            if(itemInfo.hasOwnProperty(key)){
                itemInfo[key] = info[key]
            }
        }
    }
}

export function addGameComponent(room:IWBRoom, client:Client, scene:Scene, aid:string, catalogInfo:any){
    let gameComponentInfo:any = {
        id: scene.id,
        name: scene.n + " Game",
        description: "IWB Game",
        type:0,
        startLevel: 1,
        loadingSpawn: new Vector3({x:0, y:0, z:0})
    }
    createGameComponent(scene, aid, gameComponentInfo)
    updateGameTrigger(scene, aid)
    createGameLevel(room, client, scene, 1)  
}

function updateGameTrigger(scene:Scene, aid:string){
    let trigger = scene[COMPONENT_TYPES.TRIGGER_COMPONENT].get(aid)
    let triggerId = trigger.triggers[0].id

    let action = scene[COMPONENT_TYPES.ACTION_COMPONENT].get(aid)
    let actionid = action.actions[0].id
    action.actions[0].game = scene.id

    let data:any = {
        aid:aid,
        action:"addaction",
        data:{
            tid:triggerId,
            id:actionid,
        }
    }
    editTriggerComponent(data, scene)
}

export function createGameLevel(room:IWBRoom, client:Client, scene:Scene, number:number){
    let newLevelCatalogInfo = {...itemManager.items.get("b9768002-c662-4b80-97a0-fb0d0b714fab")}// empty entity
    let aid = generateId(6)
    newLevelCatalogInfo.n = "Level " + number
    newLevelCatalogInfo.aid = aid
    newLevelCatalogInfo.pending = false
    newLevelCatalogInfo.ugc = false
    newLevelCatalogInfo.position = new Vector3({x:0,y:0,z:0})
    newLevelCatalogInfo.rotation = new Quaternion({x:0,y:0,z:0})
    newLevelCatalogInfo.scale = new Vector3({x:1,y:1,z:1})

    createNewItem(room, client, scene, newLevelCatalogInfo, newLevelCatalogInfo) 

    let newLevelInfo:any = {
        name: "Level 1",
        number: number,
        loadingSpawn: new Vector3({x:0, y:0, z:0}),
        invisibleStartBox:true
    }
    createLevelComponent(scene, aid, newLevelInfo)
}

export function sceneHasGame(scene:Scene){
    let count = 0
    scene[COMPONENT_TYPES.GAME_COMPONENT].forEach((component)=>{
        count++
    })
    console.log("game component count", count)
    return count > 0
}