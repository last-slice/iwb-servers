import { Client } from "colyseus";
import { IWBRoom } from "../IWBRoom";
import { ACTIONS, COMPONENT_TYPES, SERVER_MESSAGE_TYPES } from "../../utils/types";
import { attemptGameEnd, attemptGameStart, GameComponent, GameVariableComponent, setInitialPlayerData } from "../../Objects/Game";

export function iwbSceneGameHandler(room:IWBRoom){
    room.onMessage(SERVER_MESSAGE_TYPES.START_GAME, (client:Client, info:any)=>{
        console.log(SERVER_MESSAGE_TYPES.START_GAME + " received", info)
        attemptGameStart(room, client, info)
    })

    room.onMessage(SERVER_MESSAGE_TYPES.END_GAME, (client:Client, info:any)=>{
        console.log(SERVER_MESSAGE_TYPES.END_GAME + " received", info)
        attemptGameEnd(room, client, info)
    })

    room.onMessage(SERVER_MESSAGE_TYPES.SHOOT, (client:Client, info:any)=>{
        console.log(SERVER_MESSAGE_TYPES.SHOOT + " received", info)
        room.broadcast(SERVER_MESSAGE_TYPES.SHOOT, info)
    })

    room.onMessage(SERVER_MESSAGE_TYPES.GAME_ACTION, (client:Client, info:any)=>{
        console.log(SERVER_MESSAGE_TYPES.GAME_ACTION + " received", info)
        handleGameAction(room, client, info)
    })
}

export function handleGameAction(room:IWBRoom, client:Client, info:any){
    if(!info || !info.sceneId || !info.action || !info.aid){
        console.log("invalid parameters")
        return
    }

    let scene = room.state.scenes.get(info.sceneId)
    if(!scene){
        console.log('no scene')
        return
    }

    let player = room.state.players.get(client.userData.userId)
    if(!player){
        console.log('no player')
        return
    }
    
    let game:any
    let gameAid:any

    scene[COMPONENT_TYPES.GAME_COMPONENT].forEach((gameComponent:GameComponent, aid:string)=>{
        game = gameComponent
        gameAid = aid
    })

    if(!game){
        console.log('no game found')
        return
    }

    let playerData = game.gameData[player.address]
    if(!playerData || playerData === undefined){
        setInitialPlayerData(game, player)
    }

    switch(info.action){
        case ACTIONS.ADD_NUMBER:
            console.log('add number to player')
            game.pvariables.forEach((data:GameVariableComponent, variable:string)=>{
                if(info.aid === data.aid){
                    console.log('variable found in game data', variable)
                    playerData[variable] += info.value
                    console.log('player data is', playerData)
                    return
                }
            })
            game
            break;
    }
}