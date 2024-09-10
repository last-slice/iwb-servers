import { Client, generateId } from "colyseus"
import { itemManager } from "../app.config"
import { IWBRoom } from "../rooms/IWBRoom"
import { createNewItem, addItemComponents } from "../rooms/messaging/ItemHandler"
import { COMPONENT_TYPES, CATALOG_IDS, ACTIONS, PLAYER_GAME_STATUSES, SERVER_MESSAGE_TYPES } from "../utils/types"
import { createActionComponent } from "./Actions"
import { createCounterComponent } from "./Counter"
import { GameComponent, GameVariableComponent, resetSessionVariables, setInitialPlayerData } from "./Game"
import { createGameItemComponent } from "./GameItem"
import { Player } from "./Player"
import { Scene } from "./Scene"
import { Vector3, Quaternion } from "./Transform"
import { LevelComponent } from "./Level"

export async function createSoloEntities(room:IWBRoom, client:Client, scene:Scene, player:Player, aid:string, gameInfo:any){
    await createSoloStartLevelEntity(room, client, scene, player, aid, gameInfo)
    await createSoloCurrentLevelEntity(room, client, scene, player, aid, gameInfo)
    await addPlayerVariableItem(room, scene, client, player, aid, gameInfo, {id:"total time", value:0, save:true})
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
            
            if(!gameInfo.gameData.hasOwnProperty(player.address)){
                console.log('player doent have game data, has never played before')
                setInitialPlayerData(gameInfo, player)
            }

            resetSessionVariables(gameInfo, player)

            gameInfo.gameData[player.address].lastPlayed = Math.floor(Date.now()/1000)
            player.gameStatus = PLAYER_GAME_STATUSES.PLAYING
            player.gameId = gameInfo.aid

            info.savedData = gameInfo.gameData[player.address]

            // player.startGame(scene.id, gameInfo, PLAYER_GAME_STATUSES.PLAYING, aid)
            client.send(SERVER_MESSAGE_TYPES.START_GAME, info)
        }
    })

    if(!canStartLevel){
        info.canStart = false
        client.send(SERVER_MESSAGE_TYPES.START_GAME, info)
    }
}

export async function addPlayerVariableItem(room:IWBRoom, scene:Scene, client:Client, player:Player, aid:string, gameItem:GameComponent, variable:any){
    let newEntityAid = generateId(6)
    variable.aid = newEntityAid

    gameItem.pvariables.set(variable.id, new GameVariableComponent(variable))

    let parentTransform = scene[COMPONENT_TYPES.TRANSFORM_COMPONENT].get(aid)

    let newEntityPosition = new Vector3({x:parentTransform.p.x, y:parentTransform.p.y + (3.5 + (gameItem.pvariables.size * 1.5)), z:parentTransform.p.z})

    let newEntity = {...itemManager.items.get(CATALOG_IDS.EMPTY_ENTITY)}
    

    newEntity.n = variable.id + "-PlayerVariable"
    newEntity.aid = newEntityAid
    newEntity.pending = false
    newEntity.ugc = false
    newEntity.position = newEntityPosition
    newEntity.rotation = new Quaternion({x:0,y:0,z:0})
    newEntity.scale = new Vector3({x:1,y:1,z:1})

    await createNewItem(room, client, scene, newEntity, newEntity) 
    await addItemComponents(room, client, scene, player, newEntity, newEntity)

    await createGameItemComponent(scene, newEntityAid, {type:1})
    await createCounterComponent(scene, newEntityAid, {
        defaultValue:variable.value
    })
}
