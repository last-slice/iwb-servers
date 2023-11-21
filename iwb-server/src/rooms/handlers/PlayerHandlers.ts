import { generateId } from "colyseus";
import { Player } from "../../Objects/Player";
import { Scene } from "../../Objects/Scene";
import { SCENE_MODES, SERVER_MESSAGE_TYPES } from "../../utils/types";
import { IWBRoom } from "../IWBRoom";
import { iwbManager } from "../../app.config";

export class RoomPlayerHandler {
    room:IWBRoom

    constructor(room:IWBRoom) {
        room.onMessage(SERVER_MESSAGE_TYPES.PLAY_MODE_CHANGED, async(client, info)=>{
            console.log(SERVER_MESSAGE_TYPES.PLAY_MODE_CHANGED + " message", info)
    
            let player:Player = room.state.players.get(client.userData.userId)
            if(player){
                player.updatePlayMode(info.mode)
                // room.broadcast(SERVER_MESSAGE_TYPES.PLAY_MODE_CHANGED, info)       

            }
        })

        room.onMessage(SERVER_MESSAGE_TYPES.INIT_WORLD, async(client, info)=>{
            console.log(SERVER_MESSAGE_TYPES.INIT_WORLD + " message", info)
    
            let player:Player = room.state.players.get(client.userData.userId)
            if(player){
                console.log('need to initiate deployment to world')
                iwbManager.initWorld(info.world)
            }
        })
    }
}