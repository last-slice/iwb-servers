import { sceneManager } from "../../app.config";
import { SERVER_MESSAGE_TYPES } from "../../utils/types";
import { IWBRoom } from "../IWBRoom";

export function createSceneHandlers(room:IWBRoom){
    room.onMessage(SERVER_MESSAGE_TYPES.SELECT_PARCEL, async(client, info)=>{
        console.log(SERVER_MESSAGE_TYPES.SELECT_PARCEL + " message", info)
        if(!sceneManager.occupiedParcels.find((p)=> p === info.parcel)){
            console.log('parcel is not occupied, choose it for player', info)
            sceneManager.occupiedParcels.push(info.parcel)
            let player = room.state.players.get(info.player)
            player.temporaryParcels.push(info.parcel)
            
            room.broadcast(SERVER_MESSAGE_TYPES.SELECT_PARCEL, info)
        }
    })
}