import { Client } from "colyseus";
import { IWBRoom } from "../IWBRoom";
import { ACTIONS, COMPONENT_TYPES, SERVER_MESSAGE_TYPES } from "../../utils/types";
import { attemptGameEnd, attemptGameStart, GameComponent, GameVariableComponent, setInitialPlayerData } from "../../Objects/Game";

export function vehicleHandler(room:IWBRoom){
    room.onMessage(SERVER_MESSAGE_TYPES.START_GAME, (client:Client, info:any)=>{
        console.log(SERVER_MESSAGE_TYPES.START_GAME + " received", info)
        attemptGameStart(room, client, info)
    })
}
