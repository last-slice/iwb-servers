import { Client } from "colyseus";
import { IWBRoom } from "../IWBRoom";
import { SERVER_MESSAGE_TYPES } from "../../utils/types";
import { attemptGameEnd, attemptGameStart } from "../../Objects/Game";
import { IWBGameRoom } from "../IWBGameRoom";

export function iwbSceneGameHandler(room:IWBRoom){
    room.onMessage(SERVER_MESSAGE_TYPES.START_GAME, (client:Client, info:any)=>{
        console.log(SERVER_MESSAGE_TYPES.START_GAME + " received", info)
        attemptGameStart(room, client, info)
    })

    room.onMessage(SERVER_MESSAGE_TYPES.END_GAME, (client:Client, info:any)=>{
        console.log(SERVER_MESSAGE_TYPES.END_GAME + " received", info)
        attemptGameEnd(room, client, info)
    })
}

export function iwbGameRoomHandler(room:IWBGameRoom){
    // room.onMessage(SERVER_MESSAGE_TYPES.ENTERED_POD, async(client, info)=>{
    //     console.log(SERVER_MESSAGE_TYPES.ENTERED_POD + " message", info)
    //     let player:Player = room.state.players.get(client.userData.userId)
    //     if(player){
    //         player.enteredPod = true    
    //         if(!player.podCountingDown && !player.podLocked){
    //             player.startPodLockCountdown(info.pod)
    //         }   
    //     }
    // })
}