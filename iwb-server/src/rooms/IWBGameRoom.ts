import {Client, Room} from "@colyseus/core";
import {Player} from "../Objects/Player";
import {SERVER_MESSAGE_TYPES} from "../utils/types";
import {playerLogin, pushPlayfabEvent, updatePlayerDisplayName, updatePlayerInternalData} from "../utils/Playfab";
import { IWBGameRoomState } from "./IWBGameRoomState";
import { iwbManager } from "../app.config";
import { IWBRoom } from "./IWBRoom";
import { GameManager } from "./IWBGameManager";
import { iwbGameRoomHandler } from "./messaging/GameHandler";

export class IWBGameRoom extends Room<IWBGameRoomState> {

    async onAuth(client: Client, options: any, req: any) {
        let room = iwbManager.rooms.find(($:IWBRoom)=> $.state.world === options.world)
        if(!room){
            return false
        }

        let player = room.state.players.get(options.userId)
        if(!player){
            return false
        }

        client.auth ? client.auth = {player:player} : client.auth.player = player
        return true
    }

    onCreate(options: any) {
        this.setState(new IWBGameRoomState());
        // addGameRoom(this)

        this.state.gameManager = new GameManager(this)
        iwbGameRoomHandler(this)
    }

    onJoin(client: Client, options: any) {
        try {
            let player:Player = client.auth.player
            this.state.players.set(options.userId, player)
    
            pushPlayfabEvent(
                SERVER_MESSAGE_TYPES.PLAYER_JOINED, 
                player, 
                [{world:options.world}]
            )
        } catch (e) {
            console.log('on join error', e)
        }
    }

    async onLeave(client: Client, consented: boolean) {
        let player:Player = this.state.players.get(client.userData.userId)
        if(player){

            await this.state.gameManager.removePlayer(player)

            this.state.players.delete(client.userData.userId)

            //if player is playing, handle leave
            // player.saveCache()
        }
    }

    onDispose() {
        console.log("room", this.roomId, "disposing...");
        this.state.gameManager.garbageCollect()
    }
}
