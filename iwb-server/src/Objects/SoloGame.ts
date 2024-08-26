import { Client, generateId } from "colyseus"
import { itemManager } from "../app.config"
import { IWBRoom } from "../rooms/IWBRoom"
import { createNewItem, addItemComponents } from "../rooms/messaging/ItemHandler"
import { COMPONENT_TYPES, CATALOG_IDS, ACTIONS, PLAYER_GAME_STATUSES, SERVER_MESSAGE_TYPES } from "../utils/types"
import { createActionComponent } from "./Actions"
import { createCounterComponent } from "./Counter"
import { GameComponent } from "./Game"
import { createGameItemComponent } from "./GameItem"
import { Player } from "./Player"
import { Scene } from "./Scene"
import { Vector3, Quaternion } from "./Transform"
import { LevelComponent } from "./Level"

export async function createSoloEntities(room:IWBRoom, client:Client, scene:Scene, player:Player, aid:string, gameInfo:any){
    await createSoloStartLevelEntity(room, client, scene, player, aid, gameInfo)
    await createSoloCurrentLevelEntity(room, client, scene, player, aid, gameInfo)
}

async function createSoloStartLevelEntity(room:IWBRoom, client:Client, scene:Scene, player:Player, aid:string, gameInfo:GameComponent){
    let parentTransform = scene[COMPONENT_TYPES.TRANSFORM_COMPONENT].get(aid)
    let newEntityPosition = new Vector3({x:parentTransform.p.x, y:parentTransform.p.y + 1.5, z:parentTransform.p.z})

    let newEntity = {...itemManager.items.get(CATALOG_IDS.EMPTY_ENTITY)}
    let newEntityAid = generateId(6)

    newEntity.n = "Game Start Level Entity"
    newEntity.aid = newEntityAid
    newEntity.pending = false
    newEntity.ugc = false
    newEntity.position = newEntityPosition
    newEntity.rotation = new Quaternion({x:0,y:0,z:0})
    newEntity.scale = new Vector3({x:1,y:1,z:1})

    await createNewItem(room, client, scene, newEntity, newEntity) 
    await addItemComponents(room, client, scene, player, newEntity, newEntity)
    await createGameItemComponent(scene, newEntityAid)

    await createCounterComponent(scene, newEntityAid, {
        defaultValue:gameInfo.startLevel
    })
}

async function createSoloCurrentLevelEntity(room:IWBRoom, client:Client, scene:Scene, player:Player, aid:string, gameInfo:any){
    let parentTransform = scene[COMPONENT_TYPES.TRANSFORM_COMPONENT].get(aid)
    let newEntityPosition = new Vector3({x:parentTransform.p.x, y:parentTransform.p.y + 2.5, z:parentTransform.p.z})

    let newEntity = {...itemManager.items.get(CATALOG_IDS.EMPTY_ENTITY)}
    let newEntityAid = generateId(6)

    newEntity.n = "Game Current Level Entity"
    newEntity.aid = newEntityAid
    newEntity.pending = false
    newEntity.ugc = false
    newEntity.position = newEntityPosition
    newEntity.rotation = new Quaternion({x:0,y:0,z:0})
    newEntity.scale = new Vector3({x:1,y:1,z:1})

    await createNewItem(room, client, scene, newEntity, newEntity) 
    await addItemComponents(room, client, scene, player, newEntity, newEntity)
    await createGameItemComponent(scene, newEntityAid)

    await createCounterComponent(scene, newEntityAid, {
        defaultValue:0
    })
    gameInfo.currentLevelAid = newEntityAid 

    await createActionComponent(scene, newEntityAid, {actions:[{value:1, name: 'Advance Level', type:ACTIONS.ADD_NUMBER}]})
   
}

export function startSoloGame(client:Client, player:Player, scene:Scene, info:any, gameInfo:any){
    console.log('starting solo game')
    let canStartLevel = false
    scene[COMPONENT_TYPES.LEVEL_COMPONENT].forEach((levelComponent:LevelComponent, aid:string)=>{
        if(gameInfo.startLevel === levelComponent.number && levelComponent.live && !canStartLevel){
            canStartLevel = true
            info.canStart = true
            info.level = aid

            player.startGame(scene.id, gameInfo, PLAYER_GAME_STATUSES.PLAYING, aid)
            client.send(SERVER_MESSAGE_TYPES.START_GAME, info)
        }
    })

    if(!canStartLevel){
        info.canStart = false
        client.send(SERVER_MESSAGE_TYPES.START_GAME, info)
    }
}

export function addPlayerVariableItem(room:IWBRoom, scene:Scene, client:Client, player:Player, gameItem:GameComponent, variable:any){
    gameItem.pvariables.set(variable.id, parseFloat(variable.value))
    // let emptyCatalogItem = {...itemManager.items.get(CATALOG_IDS.EMPTY_ENTITY)}
    // if(emptyCatalogItem){
    //     emptyCatalogItem.n = "Player Var - " + variable.id
    //     let item:any = {
    //         aid:generateId(5),
    //         sceneId:scene.id,
    //         id:CATALOG_IDS.EMPTY_ENTITY,
    //         position:{x:0, y:0, z:0},
    //         rotation:{x:0, y:0, z:0},
    //         scale:{x:0, y:0, z:0},
    //         parent:1
    //     }

    //     emptyCatalogItem.components = {
    //         Counters: {
    //             defaultValue: parseFloat(variable.value),
    //         }
    //     }

    //     createNewItem(room, client, scene, item, emptyCatalogItem)
    //     addItemComponents(room, client, scene, player, item, emptyCatalogItem)
    // }
}