import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Scene } from "./Scene";
import { ACTIONS, CATALOG_IDS, COMPONENT_TYPES, GAME_TYPES, PLAYER_GAME_STATUSES, SERVER_MESSAGE_TYPES, Triggers } from "../utils/types";
import { IWBRoom } from "../rooms/IWBRoom";
import { Client, generateId } from "colyseus";
import { Quaternion, Vector3 } from "./Transform";
import { LevelComponent, createGameLevel, createLevelComponent, removeLevels } from "./Level";
import { createTriggerComponent, editTriggerComponent } from "./Trigger";
import { Player } from "./Player";
import { createGameItemComponent, editGameItemComponent } from "./GameItem";
import { createActionComponent, editActionComponent } from "./Actions";
import { createPointerComponent } from "./Pointers";
import { GameManager } from "../rooms/IWBGameManager";
import { addEntity, editParentingComponent } from "./Parenting";
import { createStateComponent, editStateComponent } from "./State";
import { createCounterComponent } from "./Counter";
import { editNameComponent } from "./Names";
import { itemManager } from "../app.config";
import { addItemComponents, createNewItem, deleteSceneItem } from "../rooms/messaging/ItemHandler";
import { addPlayerVariableItem, createSoloEntities, startSoloGame } from "./SoloGame";
import { initializeUploadPlayerFiles, uploadPlayerFiles, finalizeUploadFiles, abortFileUploads, fetchPlayfabFile, fetchUserMetaData } from "../utils/Playfab";

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

export class GameVariableComponent extends Schema {
    @type("number") value:number = 0 
    @type("boolean") save:boolean = false
    @type("string") aid:string
    
    constructor(data?:any){
        super()
        if(data){
            this.value = data.value
            this.save = data.save
            this.aid = data.aid
        }
    }
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
    @type("string") currentLevelAid:string
    @type("string") premiumAccessItem:string

    @type("number") startLevel:number
    @type("number") currentLevel:number
    @type("number") premiumAccessType:number  = -1//0 - has nft, 1 - wearing item, 2 - daily, 3 - weekly, 4 - monthly, 5 - custom time, 6 - has game item?

    @type("boolean") disableTeleport:boolean = false
    @type("boolean") disableMap:boolean = false
    @type("boolean") saveProgress:boolean //do we need this?

    @type(Vector3) sp:Vector3 = new Vector3({x:0, y:0, z:0})
    @type(Vector3) ss:Vector3 = new Vector3({x:1, y:1, z:1})

    @type("number") minTeams:number
    @type("boolean") playerTimers:boolean
    @type(["string"]) variables:ArraySchema<string> = new ArraySchema()
    @type({map:GameVariableComponent}) pvariables:MapSchema<GameVariableComponent> = new MapSchema()
    @type({map: TeamComponent}) teams:MapSchema<TeamComponent>


    //gameplay variables
    @type(["string"]) lobby:ArraySchema<string>
    @type("number") gameCountdown:number
    @type("boolean") assigningPlayer:boolean
    @type("boolean") startingSoon:boolean
    @type("boolean") started:boolean
    @type("boolean") ended:boolean
    @type("boolean") reset:boolean
    @type("string") winner:string
    @type("string") winnerId:string

    gameManager: GameManager
    gameData:any = {}
    
}

export function createGameComponent(room:IWBRoom, scene:Scene, aid:string, data?:any, fromScene?:boolean){
    let component:any = new GameComponent()
    component.id = scene.id
    component.name = scene.metadata.n + " Game"
    for(let key in data){
        if(key === "teams"){
            component.teams = new MapSchema()
            for(let id in data[key]){
                // console.log('create game component team', data[key])
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
            console.log('pvariables are', data[key])
            for(let id in data[key]){
                console.log("variable is", data[key][id])
                component.pvariables.set(id, new GameVariableComponent(data[key][id]))
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

    // if(fromScene){
    //     createGameFile(room, aid)
    // }else{
    //     loadGameFile(room, aid, component)
    // }

    console.log('game data is', component.gameData)

    // editParentingComponent()
    //do we add children entities for the game variables and track them locally as well?
    // ie, add state & counter to represent game state and countdown, then scene can listen for these changes
    //could someone hack these and change the state of the game elsewhere in the scene? we would have to prevent this
}

async function createGameFile(room:IWBRoom, aid:string){
    let filename:string = room.state.world + "-" + aid + "-data.json"
    try{
        console.log('creating game file for game ', aid)
        let initres = await initializeUploadPlayerFiles(room.state.realmToken,{
            Entity: {Id: room.state.realmId, Type: room.state.realmTokenType},
            FileNames:[filename]
        })

        let uploadres = await uploadPlayerFiles(initres.UploadDetails[0].UploadUrl, JSON.stringify({}))
        if(!uploadres || uploadres === undefined){
            throw new Error("error uploading game file")
        }

        let finalres = await finalizeUploadFiles(room.state.realmToken,
            {
                Entity: {Id: room.state.realmId, Type: room.state.realmTokenType},
                FileNames:[filename],
                ProfileVersion:initres.ProfileVersion,
        })

        if(!finalres || finalres === undefined){
            throw new Error("error finalizaing game file")
        }
    }
    catch(e:any){
        console.log('error creating game file on playfab', e.message)
        await abortFileUploads(room.state.realmToken,{
            Entity: {Id: room.state.realmId, Type: room.state.realmTokenType},
            FileNames:[filename]
          })
    }
}

async function loadGameFile(room:IWBRoom, aid:string, component:GameComponent){
  try{
    let metadata = await fetchUserMetaData({
        EntityToken:{
            Entity:{
                Type:room.state.realmTokenType,
                Id:room.state.realmId
            },
            EntityToken:room.state.realmToken
        }
    })
    let data = await fetchPlayfabFile(metadata, room.state.world + "-" + aid + "-data.json", true)
    console.log('saved game data is', data)
    if(data || data !== undefined){
      console.log('we have game data to store in cache')
      component.gameData = data
    }
  }
  catch(e){
    console.log('error getting load game variables', e)
  }
}

export function deleteGameComponent(room:IWBRoom, scene:Scene, player:Player, aid:string){
    console.log('deleting game component, clean up any timers and things')
    deleteGameActions(scene, {aid:aid})
    removeLevels(room, scene, player)
    //delete timers
}

export async function editGameComponent(room:IWBRoom, client:Client, info:any, scene:Scene, player:Player){
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
                let toDelete = itemInfo.pvariables.get(info.variables)
                deleteSceneItem(room, player, {
                    assetId: toDelete.aid,
                    childDelete:true,
                    sceneId:scene.id
                })
                itemInfo.pvariables.delete(info.variables)
                break;

            case 'delete-variable':
                let variableIndex = itemInfo.variables.findIndex(($:any)=> $ === info.variables)
                if(variableIndex >=0){
                    itemInfo.variables.splice(variableIndex,1)
                    //need to delete game variable from all game items
                    // editGameItemComponent()
                }
                break;

            case 'pvariable-save':
                console.log('updating player variable save value')
                let variable = itemInfo.pvariables.get(info.variable)
                console.log('variable is',variable.toJSON())
                variable.save = info.value
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
                        else if(key === "pvariables"){
                            if(!isNaN(parseFloat(info[key].value))){
                                addPlayerVariableItem(room, scene, client, player, info.aid, itemInfo, info[key])
                            }else{
                                console.log('player variable not a number')
                            }
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
                createGameLevel(room, client, scene, info.aid, player, {position:transform.p}, scene[COMPONENT_TYPES.LEVEL_COMPONENT].size + 1)
                break;

            case 'edit-type':
                if(info.gameType === itemInfo.type){
                    return
                }

                //to do

                //remove all current game variables and players etc
                itemInfo.teams && itemInfo.teams.clear()

                //remove all init actions
                deleteGameActions(scene, info)

                //remove all levels
                // removeAllTeams(scene)
                //do other clean up of things specific to both game types

                itemInfo.type = info.gameType
                await addGameConsoleTriggers(room, scene, info.aid, itemInfo, 0, 2)

                switch(info.gameType){
                    // case GAME_TYPES.SOLO:
                    case 'SOLO':
                        itemInfo.startLevel = 1
                        itemInfo.currentLevel = 0
                        createSoloEntities(room, client, scene, player, info.aid, itemInfo)
                        break;

                    // case GAME_TYPES.MULTIPLAYER:
                    case 'MULTIPLAYER':
                        itemInfo.minTeams = 1
                        itemInfo.lobby = new ArraySchema()
                        itemInfo.teams = new MapSchema()
                        itemInfo.assigningPlayer = false
                        itemInfo.startingSoon = false
                        itemInfo.started = false
                        itemInfo.ended = false
                        itemInfo.reset = false
                        itemInfo.winner = ""
                        itemInfo.winnerId = ""
                        // itemInfo
                        
                        //add multiplayer scene entities and variables
                        createMultiplayerEntities(room, client, scene, player, info.aid, itemInfo)
                        break;
                }
                break;
        }
    }
}

async function addGameConsoleTriggers(room:IWBRoom, scene:Scene, aid:string, gameInfo:GameComponent, index:number, max:number){
    console.log('add game triggers')
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
                    "name": "Attempt Game Start",
                    "type": ACTIONS.ATTEMPT_GAME_START
                },
                {
                    "name": "End Game",
                    "type": ACTIONS.END_GAME
                },
                {
                    "name": "Advance Level",
                    "type": ACTIONS.ADVANCED_LEVEL
                }
            ]
        }
    )

    //check if asset already has triggers
    let triggerInfo = scene[COMPONENT_TYPES.TRIGGER_COMPONENT].get(aid)
    if(!triggerInfo){
        // await createTriggerComponent(scene, aid, {
        //     triggers:[
        //         {input:1, pointer:1, decisions:[], type:Triggers.ON_INPUT_ACTION},
        //         {input:2, pointer:1, decisions:[], type:Triggers.ON_INPUT_ACTION}
        //     ]
        // })

        let gameTriggers:any = [
            {
                type: Triggers.ON_INPUT_ACTION,
                pointer:1,
                input:1,
                decisions:[
                    {
                        conditions:[],
                        actions:["Attempt Game Start"]
                    }
                ]
            },
            {
                type: Triggers.ON_INPUT_ACTION,
                pointer:1,
                input:2,
                decisions:[
                    {
                        conditions:[],
                        actions:["End Game"]
                    }
                ]
            }
        ]

        gameTriggers.forEach((trigger:any)=>{
            trigger.decisions.forEach((decision:any)=>{
                decision.id = generateId(5)
                decision.name = decision.id
        
                console.log('decision is', decision)
        
                let actionIds:any[] = []
                decision.actions.forEach((decisionAction:any)=>{
                    let actions = scene[COMPONENT_TYPES.ACTION_COMPONENT].get(aid)
                    if(actions && actions.actions.length > 0){
                        let found = actions.actions.find(($:any)=> $.name === decisionAction)
                        console.log("action found", found)
                        if(found){
                            actionIds.push(found.id)
                        }
                    }
                })
                decision.actions = actionIds
            })
        })

        
        await createTriggerComponent(scene, aid, {triggers:gameTriggers})
    }else{

    }



// await createTriggerComponent(scene, item.aid, catalogItemInfo.components.Triggers)

//         editTriggerComponent({
//             aid:aid,
//             action:"add",
//             data:{
//                 type:Triggers.ON_INPUT_ACTION,
//                 input: 1,
//                 pointer:1
//             }
//         }, scene)

//         editTriggerComponent({
//             aid:aid,
//             action:"add",
//             data:{
//                 type:Triggers.ON_INPUT_ACTION,
//                 input: 2,
//                 pointer:1
//             }
//         }, scene)

//     let actions = scene[COMPONENT_TYPES.ACTION_COMPONENT].get(aid)
//     let startAction = actions.actions.find(($:any)=> $.type === ACTIONS.ATTEMPT_GAME_START)
//     let endAction = actions.actions.find(($:any)=> $.type === ACTIONS.END_GAME)

//     triggerInfo = scene[COMPONENT_TYPES.TRIGGER_COMPONENT].get(aid)
//     let startTrigger = triggerInfo.triggers.find(($:any)=> $.input === 1 && $.pointer === 1 && $.type === Triggers.ON_INPUT_ACTION)
//     let endTrigger = triggerInfo.triggers.find(($:any)=> $.input === 2 && $.pointer === 1 && $.type === Triggers.ON_INPUT_ACTION)

//     if(startTrigger && endTrigger){
//         let data:any = {
//             aid:aid,
//             action:"addaction",
//             data:{
//                 tid:startTrigger.id,
//                 id:startAction.id,
//             }
//         }
//         editTriggerComponent(data, scene)
    
//         data = {
//             aid:aid,
//             action:"addaction",
//             data:{
//                 tid:endTrigger.id,
//                 id:endAction.id,
//             }
//         }
//         editTriggerComponent(data, scene)
//     }
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

            //check game start restrictions
            if(gameInfo.premiumAccessType >= 0){

                if(!canStartGame(gameInfo, player)){
                    console.log('cannot start game')
                    return
                }
            }

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
    // let scene = room.state.scenes.get(info.sceneId)//
    if(player){
        player.endGame(room)
        // if(player.gameData){
        //     client.send(SERVER_MESSAGE_TYPES.END_GAME, {sceneId:player.gameData.sceneId, gameId:player.gameData.aid})
        // }
        client.send(SERVER_MESSAGE_TYPES.END_GAME, {sceneId:info.sceneId, gameId:player.gameId})
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
    room.state.scenes.forEach((scene:Scene)=>{
        scene[COMPONENT_TYPES.GAME_COMPONENT].forEach((gameComponent:GameComponent, aid:string)=>{
            if(player.gameId === aid && gameComponent.type !== 'SOLO'){
                console.log("found game to remove stale player")
                gameComponent.gameManager.removeStalePlayer(player)
                return
            }
        })
    })
}

export function garbageCollectRealmGames(room:IWBRoom){
    room.state.scenes.forEach((scene:Scene)=>{
        scene[COMPONENT_TYPES.GAME_COMPONENT].forEach((gameComponent:GameComponent, aid:string)=>{
            gameComponent.gameManager.garbageCollect()
        })
    })
}

async function createMultiplayerEntities(room:IWBRoom, client:Client, scene:Scene, player:Player, aid:string, gameInfo:any){
    //create game state entity, state
    let currentParentIndex = scene[COMPONENT_TYPES.PARENTING_COMPONENT].findIndex($=> $.aid === aid)
    if(currentParentIndex >= 0){
        let newAid = await addEntity(room, client, scene, player, currentParentIndex)
        await editNameComponent({
            aid:newAid,
            value:"Game State Entity"
        }, scene)
        
        await editStateComponent({
            aid:newAid,
            action:'add',
            data:{
                value:"ended"
            }
        }, scene)
        await editStateComponent({
            aid:newAid,
            action:'add',
            data:{
                value:"started"
            }
        }, scene)
        await editStateComponent({
            aid:newAid,
            action:'add',
            data:{
                value:"ended"
            }
        }, scene)
        await editStateComponent({
            aid:newAid,
            action:'add',
            data:{
                value:"startingSoon"
            }
        }, scene)
        await editStateComponent({
            aid:newAid,
            action:'add',
            data:{
                value:"reset"
            }
        }, scene)
        await createCounterComponent(scene, newAid, {
            defaultValue:10
        })
    }
}

function canStartGame(gameInfo:any, player:Player){
    let playerData = gameInfo.gameData[player.address]
    if(!playerData){
        return true
    }

    //check game restrictions
    if(gameInfo.premiumAccessType >= 0){
        switch(gameInfo.premiumAccessType){
            case 0:
                break;

            case 1:
                break;

            case 2:
                console.log('checking last play time')
                // if(!playerGameVariables.hasOwnProperty("lastPlayed")){
                //     return true
                // }

                const currentTime = new Date();
                console.log('current time is', currentTime.getTime() / 1000)
                const timeDifference = (currentTime.getTime() / 1000) - playerData.lastPlayed;
                const twentyFourHoursInSeconds = 24 * 60 * 60;

                console.log('time difference is', timeDifference)

                if(timeDifference >= twentyFourHoursInSeconds){
                    console.log('its been a day, they can playe')
                    return true
                }else{
                    console.log('has not been a day, cant player')
                    player.sendPlayerMessage(SERVER_MESSAGE_TYPES.PLAYER_RECEIVED_MESSAGE, {message:"Please wait 24 hours before attempting game play"})
                    return false
                }

            case 3:
                break;

            case 4:
                break;

            case 5:
                break;

            case 5:
                break;
        }
    }

    return true
}

export async function checkGameCache(scene:Scene, aid:string, jsonScene:any){
    let itemInfo = scene[COMPONENT_TYPES.GAME_COMPONENT].get(aid)
    if(itemInfo){
        let itemJSON:any = itemInfo.toJSON()
        itemJSON.gameData = itemInfo.gameData
        jsonScene[COMPONENT_TYPES.GAME_COMPONENT][aid] = itemJSON
    }
    return jsonScene
}

export function setInitialPlayerData(gameInfo:GameComponent, player:Player){
    gameInfo.gameData[player.address] = {
        name: player.name
    }

    gameInfo.pvariables.forEach((data:GameVariableComponent, variable:string)=>{
        gameInfo.gameData[player.address][variable] = data.value
    })
    console.log('setting inital player game data to', gameInfo.gameData)
}

export function resetSessionVariables(gameInfo:GameComponent, player:Player){
    gameInfo.pvariables.forEach((data:GameVariableComponent, variable:string)=>{
        if(!data.save){
            gameInfo.gameData[player.address][variable] = data.value
        }
    })
    console.log('player game data is now', gameInfo.gameData)
}

export async function updatePlayerGameTime(room:IWBRoom, player:Player){
    let scene:Scene
    let gameInfo:GameComponent
    room.state.scenes.forEach((serverScene:Scene, aid:string)=>{
        console.log('looping here')
        if(!scene && !gameInfo){
            gameInfo = serverScene[COMPONENT_TYPES.GAME_COMPONENT].get(player.gameId)
            if(gameInfo){
                scene = serverScene
            }
        }
    })

    console.log('here we are')
    
    if(gameInfo){
        gameInfo.gameManager.debounce = true
        let playerData = gameInfo.gameData[player.address]
        console.log("player dat is", playerData)
        if(playerData && playerData.hasOwnProperty("total time")){
            console.log((Math.floor(Date.now()/1000) - playerData.lastPlayed))
            playerData['total time'] += (Math.floor(Date.now()/1000) - playerData.lastPlayed)
        }

        gameInfo.gameManager.debounce = false
        console.log('player game data is now', gameInfo.gameData)
    }

}