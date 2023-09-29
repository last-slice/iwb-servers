import { Player } from "../../Objects/Player";
import { sceneManager } from "../../app.config";
import { SCENE_MODES, SERVER_MESSAGE_TYPES } from "../../utils/types";
import { IWBRoom } from "../IWBRoom";

export function sceneCreationHandlers(room:IWBRoom){
    room.onMessage(SERVER_MESSAGE_TYPES.SELECT_PARCEL, async(client, info)=>{
        console.log(SERVER_MESSAGE_TYPES.SELECT_PARCEL + " message", info)

        let player:Player = room.state.players.get(client.userData.userId)
        console.log(player.mode)
        if(player && player.mode === SCENE_MODES.CREATE_SCENE_MODE){

            if(player.hasTemporaryParcel(info.parcel)){
                console.log('player has temporary parcel', info.parcel)
                sceneManager.removeTemporaryParcel(info.parcel)
                player.removeTemporaryParcel(info.parcel)
                room.broadcast(SERVER_MESSAGE_TYPES.REMOVE_PARCEL, info)
            }else{
                console.log('player doenst have temp parcel')
                if(!sceneManager.hasTemporaryParcel(info.parcel)){
                    console.log('scene doesnt have temp parcel')
                    sceneManager.addOccupiedParcel(info.parcel) 
                    player.addParcelToScene(info.parcel)
                    room.broadcast(SERVER_MESSAGE_TYPES.SELECT_PARCEL, info)
                }
            }
        }
    })
}