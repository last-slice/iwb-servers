import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Scene } from "./Scene";
import { ACTIONS, CATALOG_IDS, COMPONENT_TYPES, SERVER_MESSAGE_TYPES, Triggers } from "../utils/types";
import { editTransform, Quaternion, Vector3 } from "./Transform";
import { IWBRoom } from "../rooms/IWBRoom";
import { Player } from "./Player";
import { createStateComponent, editStateComponent } from "./State";
import { Client, generateId } from "colyseus";
import { itemManager } from "../app.config";
import { addItemComponents, createNewItem, deleteSceneItem, removeItem, updateComponentFunctions } from "../rooms/messaging/ItemHandler";
import { createActionComponent } from "./Actions";
import { createTriggerComponent } from "./Trigger";
import { addEntity, editParentingComponent } from "./Parenting";
import { createBillboardComponent } from "./Billboard";

export class LevelComponent extends Schema{
    @type("string") gameAid:string
    @type("string") loadingScreen:string
    @type("number") number:number
    @type("number") loadingMin:number = 3
    @type("number") loadingType:number = 0
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

    loadingTimer:any
    loadingInterval:any
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
    scene[COMPONENT_TYPES.LEVEL_COMPONENT].forEach((levelComponent:any, aid:string)=>{
        console.log('removing level', aid)
        deleteSceneItem(room, player, {
            assetId: aid,
            childDelete:true,
            sceneId:scene.id
        })
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

export async function createGameLevel(room:IWBRoom, client:Client, scene:Scene, gameAid:any, player:Player, item:any, number:number){
    let newLevelCatalogInfo = {...itemManager.items.get(CATALOG_IDS.EMPTY_ENTITY)}
    let aid = generateId(6)
    newLevelCatalogInfo.n = "Level " + number
    newLevelCatalogInfo.aid = aid
    newLevelCatalogInfo.pending = false
    newLevelCatalogInfo.ugc = false
    newLevelCatalogInfo.position = new Vector3(item.position)
    newLevelCatalogInfo.rotation = new Quaternion({x:0,y:0,z:0})
    newLevelCatalogInfo.scale = new Vector3({x:1,y:1,z:1})

    await createNewItem(room, client, scene, newLevelCatalogInfo, newLevelCatalogInfo) 
    await addItemComponents(room, client, scene, player, newLevelCatalogInfo, newLevelCatalogInfo)
    await createBillboardComponent(scene, aid, {mode:2})

    await createLevelComponent(scene, aid, {
        name: "Level " + number,
        number: number,
        loadingSpawn: new Vector3(item.position),
        loadingSpawnLook: new Vector3(item.position),
        invisibleStartBox:true,
        gameAid:gameAid
    })


    await createStateComponent(scene, aid, {
        defaultValue:"disabled",
        values:["disabled", "enabled"]
    })

    await createActionComponent(scene, aid, 
        {
        actions:[
            {name:"Load Level", type:ACTIONS.LOAD_LEVEL},
            {name:"End Level", type:ACTIONS.END_LEVEL},
            {name:"Advance Level", type:ACTIONS.ADVANCED_LEVEL},
            {name:"Disable Level", type:ACTIONS.SET_STATE, state:'disabled'},
            {name:"Enable Level", type:ACTIONS.SET_STATE, state:'enabled'},
        ]
        }
    )

    await createTriggerComponent(scene, aid, 
        {
            isArea:false,
            triggers:[
                {input:0, pointer:0, type:Triggers.ON_LEVEL_LOADED, decisions:[]},
            ],
        }
    )

    setTimeout(async ()=>{
        await addLogicEntity(room, client, scene, player, aid, number)
    }, 500)
}

async function addLogicEntity(room:IWBRoom, client:Client, scene:Scene, player:Player, parentAid:string, number:number){

    let parentTransform = scene[COMPONENT_TYPES.TRANSFORM_COMPONENT].get(parentAid)
    let newEntityPosition = new Vector3({x:parentTransform.p.x, y:parentTransform.p.y + 1.5, z:parentTransform.p.z})

    let newEntity = {...itemManager.items.get(CATALOG_IDS.EMPTY_ENTITY)}
    let newEntityAid = generateId(6)

    newEntity.n = "Level " + number + "logic"
    newEntity.aid = newEntityAid
    newEntity.pending = false
    newEntity.ugc = false
    newEntity.position = newEntityPosition
    newEntity.rotation = new Quaternion({x:0,y:0,z:0})
    newEntity.scale = new Vector3({x:1,y:1,z:1})

    await createNewItem(room, client, scene, newEntity, newEntity) 
    await addItemComponents(room, client, scene, player, newEntity, newEntity)

    await createTriggerComponent(scene, newEntityAid, 
        {
            isArea:false,
            triggers:[
                {input:0, pointer:0, type:Triggers.ON_CLOCK_TICK, decisions:[]}
            ],
        }
    )

    setTimeout(()=>{
        editParentingComponent(room, client,     {
            component:COMPONENT_TYPES.PARENTING_COMPONENT,
            sceneId:scene.id,
            action:'edit', 
            aid:newEntityAid, 
            data:parentAid, 
            pp:parentTransform.p.toJSON(), 
            pr:parentTransform.r.toJSON(),
            sp:newEntityPosition.toJSON(),
            sr:new Vector3({x:0, y:0, z:0})
        }, scene, player)
    }, 500)


}

async function addLoseLogicEntity(room:IWBRoom, client:Client, scene:Scene, player:Player, parentAid:string, number:number){
    let parentTransform = scene[COMPONENT_TYPES.TRANSFORM_COMPONENT].get(parentAid)
    let newEntityPosition = new Vector3({x:parentTransform.p.x, y:parentTransform.p.y + 3, z:parentTransform.p.z})

    let newEntity = {...itemManager.items.get(CATALOG_IDS.EMPTY_ENTITY)}
    let newEntityAid = generateId(6)

    newEntity.n = "Level " + number + " lose logic"
    newEntity.aid = newEntityAid
    newEntity.pending = false
    newEntity.ugc = false
    newEntity.position = newEntityPosition
    newEntity.rotation = new Quaternion({x:0,y:0,z:0})
    newEntity.scale = new Vector3({x:1,y:1,z:1})

    await createNewItem(room, client, scene, newEntity, newEntity) 
    await addItemComponents(room, client, scene, player, newEntity, newEntity)

    await createTriggerComponent(scene, newEntityAid, 
        {
            isArea:false,
            triggers:[
                {input:0, pointer:0, type:Triggers.ON_LEVEL_END, actions:[]}
            ],
        }
    )
    
    setTimeout(()=>{
        editParentingComponent(room, client,     {
            component:COMPONENT_TYPES.PARENTING_COMPONENT,
            sceneId:scene.id,
            action:'edit', 
            aid:newEntityAid, 
            data:parentAid, 
            pp:parentTransform.p.toJSON(), 
            pr:parentTransform.r.toJSON(),
            sp:newEntityPosition.toJSON(),
            sr:new Vector3({x:0, y:0, z:0})
        }, scene, player)
    }, 500)
}