import { Player } from "../../Objects/Player";
import { sceneManager } from "../../app.config";
import { SCENE_MODES, SERVER_MESSAGE_TYPES } from "../../utils/types";
import { IWBRoom } from "../IWBRoom";
import { UserRoom } from "../UserRoom";

export function playerHandlers(room:IWBRoom | UserRoom){
    room.onMessage(SERVER_MESSAGE_TYPES.PLAY_MODE_CHANGED, async(client, info)=>{
        console.log(SERVER_MESSAGE_TYPES.PLAY_MODE_CHANGED + " message", info)

        let player:Player = room.state.players.get(client.userData.userId)
        if(player){
            player.updatePlayMode(info.mode)
            // room.broadcast(SERVER_MESSAGE_TYPES.PLAY_MODE_CHANGED, info)                
        }
        
    })
}