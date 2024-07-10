import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Scene } from "./Scene";
import { ACTIONS, CATALOG_IDS, COMPONENT_TYPES, SERVER_MESSAGE_TYPES, Triggers } from "../utils/types";
import { Quaternion, Vector3 } from "./Transform";
import { IWBRoom } from "../rooms/IWBRoom";
import { Player } from "./Player";
import { createStateComponent, editStateComponent } from "./State";
import { Client, generateId } from "colyseus";
import { itemManager } from "../app.config";
import { createNewItem } from "../rooms/messaging/ItemHandler";
import { createActionComponent } from "./Actions";
import { createTriggerComponent } from "./Trigger";

export class LevelComponent extends Schema{
    @type("number") number:number
    @type("number") loadingMin:number = 3
    @type(Vector3) loadingSpawn:Vector3 = new Vector3({x:0, y:0, z:0})
    @type(Vector3) loadingSpawnLook:Vector3 = new Vector3({x:0, y:0, z:0})
    @type("boolean") invisibleStartBox:boolean //do we need this?
    @type("boolean") saveProgress:boolean //do we need this?
    @type("boolean") premiumAccess:boolean //do we need this? ifo
    @type("boolean") premiumAccessType:boolean //do we need this? ifo
    @type("boolean") premiumAccessItem:boolean //do we need this? ifo
    @type("boolean") live:boolean = false
    //levels here?

    //game component can have children components to track "global" variables
    // like time, score, health, death, etc
}

export function createLevelComponent(scene:Scene, aid:string, data:any){
    let component:any = new LevelComponent()
    for(let key in data){
        if(key === "loadingSpawn" || key === "loadingSpawnLook"){
            component[key] = new Vector3(data[key])
        }else{
            component[key] = data[key]
        }
        
    }
    scene[COMPONENT_TYPES.LEVEL_COMPONENT].set(aid, component)
}

export function removeLevels(room:IWBRoom, scene:Scene, player:Player){
    scene[COMPONENT_TYPES.LEVEL_COMPONENT].clear()

    scene[COMPONENT_TYPES.LEVEL_COMPONENT].forEach((levelComponent:any, aid:string)=>{
        console.log('removing level', aid)
        let levelItem = {}

    })
}

export function editLevelComponent(info:any, scene:Scene){
    let itemInfo:any = scene[COMPONENT_TYPES.LEVEL_COMPONENT].get(info.aid)
    if(itemInfo){
        for(let key in info){
            if(key === "loadingSpawn" || key === "loadingSpawnLook"){
                itemInfo[key] = new Vector3(info[key])  
            }
            else{
                if(itemInfo.hasOwnProperty(key)){
                    itemInfo[key] = info[key]
                }
            }
        }
    }
}

export function createGameLevel(room:IWBRoom, client:Client, scene:Scene, item:any, number:number){
    let newLevelCatalogInfo = {...itemManager.items.get(CATALOG_IDS.EMPTY_ENTITY)}
    let aid = generateId(6)
    newLevelCatalogInfo.n = "Level " + number
    newLevelCatalogInfo.aid = aid
    newLevelCatalogInfo.pending = false
    newLevelCatalogInfo.ugc = false
    newLevelCatalogInfo.position = new Vector3({x:0,y:0,z:0})
    newLevelCatalogInfo.rotation = new Quaternion({x:0,y:0,z:0})
    newLevelCatalogInfo.scale = new Vector3({x:1,y:1,z:1})

    createNewItem(room, client, scene, newLevelCatalogInfo, newLevelCatalogInfo) 

    createLevelComponent(scene, aid, {
        name: "Level " + number,
        number: number,
        loadingSpawn: new Vector3(item.position),
        loadingSpawnLook: new Vector3({x:0, y:0, z:0}),
        invisibleStartBox:true
    })

    createActionComponent(scene, aid, 
        {
        actions:[
            {name:"Load Level", type:ACTIONS.LOAD_LEVEL},
            {name:"Complete Level", type:ACTIONS.COMPLETE_LEVEL},
            {name:"End Level", type:ACTIONS.END_LEVEL},
        ]
        }
    )

    createTriggerComponent(scene, aid, 
        {
            isArea:false,
            triggers:[
                {input:0, pointer:0, type:Triggers.ON_LEVEL_LOADED, actions:[]},
                {input:0, pointer:0, type:Triggers.ON_LEVEL_COMPLETE, actions:[]},
                {input:0, pointer:0, type:Triggers.ON_LEVEL_END, actions:[]}
            ],
        }
    )
}