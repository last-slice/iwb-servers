import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Scene } from "./Scene";
import { COMPONENT_TYPES, GAME_TYPES, SERVER_MESSAGE_TYPES } from "../utils/types";
import { IWBRoom } from "../rooms/IWBRoom";
import { Client } from "colyseus";
import { Vector3 } from "./Transform";
import { LevelComponent, createGameLevel, createLevelComponent, removeLevels } from "./Level";
import { editTriggerComponent } from "./Trigger";
import { Player } from "./Player";
import { removeAllTeams } from "./Team";

export class GameComponent extends Schema{
    @type("string") id:string = ""
    @type("string") name:string = ""
    @type("string") image:string = ""
    @type("string") description:string = "IWB Game"
    @type("string") startScreen:string = "iwb"
    @type("string") loadingScreen:string
    @type("string") type:string
    @type("number") startLevel:number
    @type("number") currentLevel:number
    @type("boolean") disableTeleport:boolean = false
    @type("boolean") saveProgress:boolean //do we need this?
    @type("boolean") premiumAccess:boolean //do we need this? ifo
    @type("boolean") premiumAccessType:boolean //do we need this? ifo
    @type("boolean") premiumAccessItem:boolean //do we need this? ifo
    //levels here

    @type(["string"]) variables:ArraySchema<string> = new ArraySchema()

    //game component can have children components to track "global" variables
    // like time, score, health, death, etc
}

export function createGameComponent(scene:Scene, aid:string, data?:any){
    let component:any = new GameComponent()
    component.id = scene.id
    component.name = scene.n + " Game"
    for(let key in data){
        if(key === "loadingSpawn"){
            component[key] = new Vector3(data[key])
        }else{
            component[key] = data[key]
        }
    }
    scene[COMPONENT_TYPES.GAME_COMPONENT].set(aid, component)
}

export function editGameComponent(room:IWBRoom, client:Client, info:any, scene:Scene){
    let itemInfo:any = scene[COMPONENT_TYPES.GAME_COMPONENT].get(info.aid)
    if(itemInfo){
        switch(info.action){
            case 'delete-variable':
                let variableIndex = itemInfo.variables.findIndex(($:any)=> $ === info.variables)
                if(variableIndex >=0){
                    itemInfo.variables.splice(variableIndex,1)
                }
                break;

            case 'edit':
                for(let key in info){
                    if(itemInfo.hasOwnProperty(key)){
                        if(key === "variables"){
                            itemInfo[key].push(info[key])
                        }else{
                            itemInfo[key] = info[key]
                        }
                    }
                }
                break;

            case 'addlevel':
                console.log('adding game level')
                let transform = scene[COMPONENT_TYPES.TRANSFORM_COMPONENT].get(info.aid)
                createGameLevel(room, client, scene, {position:transform.p}, scene[COMPONENT_TYPES.LEVEL_COMPONENT].size + 1)
                break;

            case 'edit-type':
                //remove all levels
                // removeAllTeams(scene)
                //do other clean up of things specific to both game types

                itemInfo.type = info.gameType
                switch(info.gameType){
                    case GAME_TYPES.SOLO:
                        break;

                    case GAME_TYPES.MULTIPLAYER:
                        break;

                    case GAME_TYPES.TEAM_COMPETITION:
                        break;
                }
                break;
        }
    }
}

export function addGameComponent(room:IWBRoom, client:Client, scene:Scene, item:any, catalogInfo:any){
    let gameComponentInfo:any = {
        id: scene.id,
        name: scene.n + " Game",
        description: "IWB Game",
        type:0,
        startLevel: 1,
    }

    createGameComponent(scene, item.aid, gameComponentInfo)
    addGameConsoleTriggers(scene, item.aid, 0, 2)
    createGameLevel(room, client, scene, item, 1)  
}

function addGameConsoleTriggers(scene:Scene, aid:string, index:number, max:number){
    if(index < max){
        let trigger = scene[COMPONENT_TYPES.TRIGGER_COMPONENT].get(aid)
        let triggerId = trigger.triggers[index].id
    
        let action = scene[COMPONENT_TYPES.ACTION_COMPONENT].get(aid)
        let actionid = action.actions[index].id
        action.actions[index].game = scene.id
    
        let data:any = {
            aid:aid,
            action:"addaction",
            data:{
                tid:triggerId,
                id:actionid,
            }
        }
        editTriggerComponent(data, scene)
        index++
        addGameConsoleTriggers(scene, aid, index, max)
    }
}

export function sceneHasGame(scene:Scene){
    let count = 0
    scene[COMPONENT_TYPES.GAME_COMPONENT].forEach((component)=>{
        count++
    })
    return count > 0
}

export function removeGameComponent(room:IWBRoom, scene:Scene, player:Player,aid:string, info:any){
    removeLevels(room, scene, player)
}

export function attemptGameStart(room:IWBRoom, client:any, info:any){
    if(!info || !info.sceneId || !info.entity){
        return
    }

    let player = room.state.players.get(client.userData.userId)
    let scene = room.state.scenes.get(info.sceneId)
    if(scene && player && !player.playingGame){
        let gameInfo:any
        scene[COMPONENT_TYPES.GAME_COMPONENT].forEach((gameComponent:GameComponent, aid:string)=>{
            if(gameComponent.id === info.sceneId){
                gameInfo = {...gameComponent}
                gameInfo.aid = aid
            }
        })

        if(gameInfo){
            info.aid = gameInfo.aid

            let canStartLevel = false
            scene[COMPONENT_TYPES.LEVEL_COMPONENT].forEach((levelComponent:LevelComponent, aid:string)=>{
                if(gameInfo.startLevel === levelComponent.number && levelComponent.live && !canStartLevel){
                    canStartLevel = true
                    info.canStart = true
                    info.level = aid

                    player.startGame(scene.id, gameInfo, aid)
                    client.send(SERVER_MESSAGE_TYPES.START_GAME, info)
                }
            })

            if(!canStartLevel){
                info.canStart = false
                client.send(SERVER_MESSAGE_TYPES.START_GAME, info)
            }
        }
        //to do - game verifications
        //to do- multiplayer game handing
    }
}

export function attemptGameEnd(room:IWBRoom, client:any, info:any){
    // if(!info || !info.sceneId || !info.entity){
    //     return
    // }

    let player = room.state.players.get(client.userData.userId)
    // let scene = room.state.scenes.get(info.sceneId)
    if(player){
        player.endGame()
        if(player.gameData){
            client.send(SERVER_MESSAGE_TYPES.END_GAME, {sceneId:player.gameData.sceneId, gameId:player.gameData.aid})
        }
    }
}