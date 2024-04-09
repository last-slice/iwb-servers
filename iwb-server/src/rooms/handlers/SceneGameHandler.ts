import { generateId } from "colyseus";
import { Game } from "../../Objects/Game";
import { Player } from "../../Objects/Player";
import { SERVER_MESSAGE_TYPES } from "../../utils/types";
import { IWBRoom } from "../IWBRoom";
import { Vector3 } from "../../Objects/Components";




export class RoomSceneGameHandler {
    room:IWBRoom

    constructor(room:IWBRoom){
        this.room = room

        room.onMessage(SERVER_MESSAGE_TYPES.CREATE_GAME_LOBBY, async(client, info)=>{
            console.log(SERVER_MESSAGE_TYPES.CREATE_GAME_LOBBY + " message", info)

            let player:Player = room.state.players.get(client.userData.userId)
            let scene = this.room.state.scenes.get(info.sceneId)
            if(player && scene){
                try{
                    scene.game = new Game(info.config)
                    scene.game.id = generateId(5)
                    scene.game.p = new Vector3(info.t.position)
                    player.sendPlayerMessage(SERVER_MESSAGE_TYPES.CREATE_GAME_LOBBY, {valid: true})
                }
                catch(e){
                    console.log('error creating new game', e)
                    player.sendPlayerMessage(SERVER_MESSAGE_TYPES.CREATE_GAME_LOBBY, {valid: false})
                }
            }else{
                console.log('player or scene error')
                player.sendPlayerMessage(SERVER_MESSAGE_TYPES.CREATE_GAME_LOBBY, {valid: false})
            }
        })

    }

}