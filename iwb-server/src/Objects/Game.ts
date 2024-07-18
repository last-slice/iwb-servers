import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Scene } from "./Scene";
import { ACTIONS, COMPONENT_TYPES, GAME_TYPES, PLAYER_GAME_STATUSES, SERVER_MESSAGE_TYPES, Triggers } from "../utils/types";
import { IWBRoom } from "../rooms/IWBRoom";
import { Client, generateId } from "colyseus";
import { Vector3 } from "./Transform";
import { LevelComponent, createGameLevel, createLevelComponent, removeLevels } from "./Level";
import { createTriggerComponent, editTriggerComponent } from "./Trigger";
import { Player } from "./Player";
import { editGameItemComponent } from "./GameItem";
import { createActionComponent, editActionComponent } from "./Actions";
import { createPointerComponent } from "./Pointers";
import { GameManager } from "../rooms/IWBGameManager";
import { editParentingComponent } from "./Parenting";

let noBackup:any[] = [
    "gameCountdown",
    "assigningPlayer",
    "startingSoon",
    "started",
    "ended",
    "reset",
    "winner",
    "winnerId"
]

export class TeamComponent extends Schema {
    @type("string") id:string
    @type("number") max:number = 1
    @type(Vector3) sp:Vector3 = new Vector3({x:0, y:0, z:0})
    @type(Vector3) ss:Vector3 = new Vector3({x:1, y:1, z:1})
    @type(Vector3) sc:Vector3 = new Vector3({x:0, y:0, z:0})
    @type(["string"]) mates:ArraySchema<string> = new ArraySchema()
}

export class GameComponent extends Schema{
    //configurations
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

    @type(Vector3) sp:Vector3 = new Vector3({x:0, y:0, z:0})
    @type(Vector3) ss:Vector3 = new Vector3({x:1, y:1, z:1})

    @type("number") minTeams:number = 2
    @type("boolean") playerTimers:boolean
    @type(["string"]) variables:ArraySchema<string> = new ArraySchema()
    @type({map:"number"}) pvariables:MapSchema<number> = new MapSchema()
    @type({map: TeamComponent}) teams:MapSchema<TeamComponent> = new MapSchema()


    //gameplay variables
    @type(["string"]) lobby:ArraySchema<string> = new ArraySchema()
    @type("number") gameCountdown:number
    @type("boolean") assigningPlayer:boolean = false
    @type("boolean") startingSoon:boolean = false
    @type("boolean") started:boolean = false
    @type("boolean") ended:boolean = false
    @type("boolean") reset:boolean = false
    @type("string") winner:string = ""
    @type("string") winnerId:string = ""
    gameManager: GameManager
}

export function createGameComponent(room:IWBRoom, scene:Scene, aid:string, data?:any, fromScene?:boolean){
    let component:any = new GameComponent()
    component.id = scene.id
    component.name = scene.n + " Game"
    for(let key in data){
        if(key === "teams"){
            for(let id in data[key]){
                // console.log('create game component team', data[key])//
                let team = data[key][id]
                let teamComponent = new TeamComponent()
                teamComponent.id = id
                teamComponent.max = team.max
                teamComponent.ss = new Vector3(team.ss)
                teamComponent.sp = new Vector3(team.sp)
                teamComponent.sc = new Vector3(team.sc)
                
                component.teams.set(teamComponent.id, teamComponent)
            }
        }
        else if(key === "ss" || key === "sp"){
            component[key] = new Vector3(data[key])
        }
        else if(key === "pvariables"){
            for(let id in data[key]){
                component.pvariables.set(id, data[key][id])
            }
        }
        else if(noBackup.includes(key)){}
        else{
            // console.log('create game component', key)
            component[key] = data[key]
        }
    }
    scene[COMPONENT_TYPES.GAME_COMPONENT].set(aid, component)
    component.gameManager = new GameManager(scene, aid)

    // editParentingComponent()
    //do we add children entities for the game variables and track them locally as well?
    // ie, add state & counter to represent game state and countdown, then scene can listen for these changes
    //could someone hack these and change the state of the game elsewhere in the scene? we would have to prevent this
}

export function deleteGameComponent(scene:Scene, aid:string){
    console.log('deleting game component, clean up any timers and things')
    deleteGameActions(scene, {aid:aid})
    //delete timers
}

export async function editGameComponent(room:IWBRoom, client:Client, info:any, scene:Scene){
    console.log('editing game component')
    let itemInfo:any = scene[COMPONENT_TYPES.GAME_COMPONENT].get(info.aid)
    if(itemInfo){
        switch(info.action){
            case 'edit-lobby-spawn-p':
                itemInfo.sp.x = info.value.x
                itemInfo.sp.y = info.value.y
                itemInfo.sp.z =info.value.z
                break;

             case 'edit-lobby-spawn-s':
                itemInfo.ss.x = info.value.x
                itemInfo.ss.y = info.value.y
                itemInfo.ss.z =info.value.z
                break;

            case 'edit-team-spawn-p':
                let value = info.value
                let teamedit = itemInfo.teams.get(value.id)
                teamedit.sp.x = value.transform.x
                teamedit.sp.y = value.transform.y
                teamedit.sp.z = value.transform.z
                break;

             case 'edit-team-spawn-s':
                let svalue = info.value
                let steamedit = itemInfo.teams.get(svalue.id)
                steamedit.ss.x = svalue.transform.x
                steamedit.ss.y = svalue.transform.y
                steamedit.ss.z = svalue.transform.z
                break;

            case 'delete-team':
                itemInfo.teams.delete(info.team)
                break;
            case 'add-team':
                let id = generateId(5)
                itemInfo.teams.set(id, new TeamComponent())
                let team = itemInfo.teams.get(id)
                team.id = id

                let gameTransform = scene[COMPONENT_TYPES.TRANSFORM_COMPONENT].get(info.aid)
                console.log('found game transform', gameTransform)
                if(gameTransform){
                    team.sp.x = gameTransform.p.x
                    team.sp.y = gameTransform.p.y
                    team.sp.z = gameTransform.p.z

                    team.sc.x = gameTransform.p.x
                    team.sc.y = gameTransform.p.y
                    team.sc.z = gameTransform.p.z
                }
                break;

             case 'delete-pvariable':
                itemInfo.pvariables.delete(info.variables)
                break;

            case 'delete-variable':
                let variableIndex = itemInfo.variables.findIndex(($:any)=> $ === info.variables)
                if(variableIndex >=0){
                    itemInfo.variables.splice(variableIndex,1)
                    //need to delete game variable from all game items
                    editGameItemComponent()
                }
                break;

            case 'edit':
                for(let key in info){
                    if(itemInfo.hasOwnProperty(key)){
                        if(key === "variables"){
                            itemInfo[key].push(info[key])
                        }
                        else if(key === "playerTimers"){
                            itemInfo[key] = info[key]
                            if(info[key]){
                                itemInfo.pvariables.set("timer", 0)
                            }else{
                                itemInfo.pvariables.delete("timer")
                            }
                        }
                        else if(key === "pvariables" && !isNaN(parseFloat(info[key].value))){
                            itemInfo.pvariables.set(info[key].id, parseFloat(info[key].value))
                        }
                        else{
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
                if(info.gameType === itemInfo.type){
                    return
                }

                //to do

                //remove all current game variables and players etc
                itemInfo.teams.clear()
                itemInfo.minTeams = undefined

                //remove all init actions
                deleteGameActions(scene, info)

                //remove all levels
                // removeAllTeams(scene)
                //do other clean up of things specific to both game types

                itemInfo.type = info.gameType
                addGameConsoleTriggers(room, scene, info.aid, itemInfo, 0, 2)

                switch(info.gameType){
                    // case GAME_TYPES.SOLO:
                    case 'SOLO':
                        console.log('chose solo game mode, load config here')
                        break;

                    // case GAME_TYPES.MULTIPLAYER:
                    case 'MULTIPLAYER':
                        break;
                }
                break;
        }
    }
}

export function addGameComponent(room:IWBRoom, client:Client, scene:Scene, item:any, catalogInfo:any){
    // let gameComponentInfo:any = {
    //     id: scene.id,
    //     name: scene.n + " Game",
    //     description: "IWB Game",
    //     type:0,
    //     startLevel: 1,
    // }

    // createGameComponent(scene, item.aid, gameComponentInfo)
    // addGameConsoleTriggers(scene, item.aid, 0, 2)
    // createGameLevel(room, client, scene, item, 1)  
}

async function addGameConsoleTriggers(room:IWBRoom, scene:Scene, aid:string, gameInfo:GameComponent, index:number, max:number){
    console.log('add game triggers')
    //check if asset already has triggers
    let triggerInfo = scene[COMPONENT_TYPES.TRIGGER_COMPONENT].get(aid)
    if(!triggerInfo){
        await createTriggerComponent(scene, aid, {
            triggers:[
                {input:1, pointer:1, actions:[], type:Triggers.ON_INPUT_ACTION},
                {input:2, pointer:1, actions:[], type:Triggers.ON_INPUT_ACTION}
            ]
        })
    }

    let pointerInfo = scene[COMPONENT_TYPES.POINTER_COMPONENT].get(aid)
    if(!pointerInfo){
        await createPointerComponent(scene, aid, {
            events:[
                {eventType:1, button:1, hoverText:"Start Game", maxDistance:5, showFeedback:true},
                {eventType:1, button:2, hoverText:"End Game", maxDistance:5, showFeedback:true}
            ]
        })
    }

    await createActionComponent(scene, aid, 
        {
            "actions": [
                {
                    "name": "Attempt Start Game",
                    "type": "attempt_game_start"
                },
                {
                    "name": "End Game",
                    "type": "end_game"
                }
            ]
        }
    )

    let actions = scene[COMPONENT_TYPES.ACTION_COMPONENT].get(aid)
    let startAction = actions.actions.find(($:any)=> $.type === ACTIONS.ATTEMPT_GAME_START)
    let endAction = actions.actions.find(($:any)=> $.type === ACTIONS.END_GAME)

    triggerInfo = scene[COMPONENT_TYPES.TRIGGER_COMPONENT].get(aid)
    let startTrigger = triggerInfo.triggers.find(($:any)=> $.input === 1 && $.pointer === 1 && $.type === Triggers.ON_INPUT_ACTION)
    let endTrigger = triggerInfo.triggers.find(($:any)=> $.input === 2 && $.pointer === 1 && $.type === Triggers.ON_INPUT_ACTION)

    let data:any = {
        aid:aid,
        action:"addaction",
        data:{
            tid:startTrigger.id,
            id:startAction.id,
        }
    }
    editTriggerComponent(data, scene)

    data = {
        aid:aid,
        action:"addaction",
        data:{
            tid:endTrigger.id,
            id:endAction.id,
        }
    }
    editTriggerComponent(data, scene)
}

export async function deleteGameActions(scene:Scene, info:any){
    let actions = scene[COMPONENT_TYPES.ACTION_COMPONENT].get(info.aid)
    if(actions){
        let startAction = actions.actions.find(($:any)=> $.type === ACTIONS.ATTEMPT_GAME_START)
        let endAction = actions.actions.find(($:any)=> $.type === ACTIONS.END_GAME)
        startAction ? await editActionComponent({action:"delete", aid:info.aid, data:{id:startAction.id}}, scene) : null
        endAction ? await editActionComponent({action:"delete", aid:info.aid, data:{id:endAction.id}}, scene) : null
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
    if(scene && player && player.gameStatus === PLAYER_GAME_STATUSES.NONE){
        let gameInfo:any
        scene[COMPONENT_TYPES.GAME_COMPONENT].forEach((gameComponent:GameComponent, aid:string)=>{
            if(gameComponent.id === info.sceneId){
                gameInfo = {...gameComponent}
                gameInfo.aid = aid
            }
        })

        if(gameInfo){
            info.aid = gameInfo.aid

            if(gameInfo.type === "MULTIPLAYER"){
                joinMultiplayerLobby(room, player ,scene, info, gameInfo)
            }else{
                startSoloGame(client, player, scene, info, gameInfo)
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

export function joinMultiplayerLobby(room:IWBRoom, player:Player, scene:Scene, info:any, gameInfo:any){
    console.log('joining multiplayer lobby')
    let gaming = scene[COMPONENT_TYPES.GAME_COMPONENT].get(gameInfo.aid)
    gaming.lobby.push(player.address)
    player.gameStatus = PLAYER_GAME_STATUSES.LOBBY

    gaming.gameManager.checkLobbyQueue()
}

export function removeStalePlayer(room:IWBRoom, player:Player){
    let scene = room.state.scenes.get(player.gameData.id)
    if(!scene){
        return
    }

    console.log('found scene to delete multiplayer')


    let gaming = scene[COMPONENT_TYPES.GAME_COMPONENT].get(player.gameData.aid)
    if(!gaming){
        return
    }

    gaming.gameManager.removeStalePlayer(player)
}

export function garbageCollectRealmGames(room:IWBRoom){
    room.state.scenes.forEach((scene:Scene)=>{
        scene[COMPONENT_TYPES.GAME_COMPONENT].forEach((gameComponent:GameComponent, aid:string)=>{
            gameComponent.gameManager.garbageCollect()
        })
    })
}