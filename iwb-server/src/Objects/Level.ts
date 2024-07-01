import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Scene } from "./Scene";
import { COMPONENT_TYPES, SERVER_MESSAGE_TYPES } from "../utils/types";
import { Quaternion, Vector3 } from "./Transform";

export class LevelComponent extends Schema{
    @type("string") name:string
    @type("number") number:number
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

export function createLevelComponent(scene:Scene, aid:string, data:any){
    let component:any = new LevelComponent()
    for(let key in data){
        if(key === "loadingSpawn"){
            component[key] = new Vector3(data[key])
        }else{
            component[key] = data[key]
        }
        
    }
    scene[COMPONENT_TYPES.LEVEL_COMPONENT].set(aid, component)
}

// export function addGameComponent(room:IWBRoom, client:Client, scene:Scene, aid:string, catalogInfo:any){
//     let alreadyHas = scene[COMPONENT_TYPES.GAME_COMPONENT].get(aid)
//     if(alreadyHas){
//         client.send(SERVER_MESSAGE_TYPES.PLAYER_RECEIVED_MESSAGE, "A game component already exists on this scene")
//         return
//     }

//     let gameComponentInfo:any = {
//         id: scene.id,
//         name: scene.n + " Game",
//         description: "IWB Game",
//         type:0,
//         startLevel: 1,
//         loadingSpawn: new Vector3({x:0, y:0, z:0})
//     }
//     createGameComponent(scene, aid, gameComponentInfo)

//     let newLevelCatalogInfo = {...itemManager.items.get("b9768002-c662-4b80-97a0-fb0d0b714fab")}// empty entity
//     newLevelCatalogInfo.n = "Level 1"
//     newLevelCatalogInfo.aid = generateId(6)
//     newLevelCatalogInfo.pending = false
//     newLevelCatalogInfo.ugc = false
//     newLevelCatalogInfo.position = new Vector3({x:0,y:0,z:0})
//     newLevelCatalogInfo.rotation = new Quaternion({x:0,y:0,z:0})
//     newLevelCatalogInfo.scale = new Vector3({x:1,y:1,z:1})

//     createNewItem(room, scene, newLevelCatalogInfo, newLevelCatalogInfo)   
// }

// export function createGameLevel(){

// }