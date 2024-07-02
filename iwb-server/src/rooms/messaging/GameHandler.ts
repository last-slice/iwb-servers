import { Client, generateId } from "colyseus";
import { IWBRoom } from "../IWBRoom";
import { ACTIONS, COMPONENT_TYPES, SERVER_MESSAGE_TYPES } from "../../utils/types";
import { ActionComponent, ActionComponentSchema, handleCloneAction } from "../../Objects/Actions";

export function iwbSceneGameHandler(room:IWBRoom){
    room.onMessage(SERVER_MESSAGE_TYPES.START_GAME, (client:Client, info:any)=>{
        console.log(SERVER_MESSAGE_TYPES.START_GAME + " received", info)
        let player = room.state.players.get(client.userData.userId)
        if(player && !player.playingGame){
            player.playingGame = true

            //to do - game verifications
            client.send(SERVER_MESSAGE_TYPES.START_GAME, info)

            //to do- multiplayer game handing
        }
    })
}