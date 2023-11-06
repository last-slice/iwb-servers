import {Client, Room} from "@colyseus/core";
import {IWBRoomState} from "./schema/IWBRoomState";
import {Player} from "../Objects/Player";
import {RoomMessageHandler} from "./handlers/MessageHandler";
import {eventListener, itemManager, iwbManager, playerManager, sceneManager} from "../app.config";
import {SERVER_MESSAGE_TYPES} from "../utils/types";
import * as jwt from "jsonwebtoken";
import { playerLogin, updatePlayerDisplayName, updatePlayerInternalData } from "../utils/Playfab";

export class UserRoom extends Room<IWBRoomState> {

    onCreate(options: any) {
        this.setState(new IWBRoomState());
        this.state.world = options.world

        iwbManager.addRoom(this)
        new RoomMessageHandler(this, eventListener)

        sceneManager.loadWorldScenes(this)
    }

    onJoin(client: Client, options: any) {
        try {
            let player:Player = playerManager.players.get(options.userData.userId)
            if(player){
              console.log('player was already in main iwb world, log them into private wworld')
              playerManager.addPlayerToPrivateWorld(player, client, options.world)
              
              // player.setScenes()
            }else{
              console.log('player tried to join private world directly')
              client.leave(4114)
            }
        } catch (e) {
            console.log('on join error', e)
        }
    }

    async onLeave(client: Client, consented: boolean) {
        console.log(client.userData, "left!");

        //player cleanup
        sceneManager.freeTemporaryParcels(this.state.players.get(client.userData.userId))

        let player:Player = this.state.players.get(client.userData.userId)
        if(player){
            console.log('found player to clean up')
          await player.saveCache()
          this.state.players.delete(client.userData.userId)
        }

        this.broadcast(SERVER_MESSAGE_TYPES.PLAYER_LEAVE, {player: client.userData.userId})
    }

    onDispose() {
        console.log("room", this.roomId, "disposing...");
        sceneManager.cleanUp()
        iwbManager.removeRoom(this)
    }

}
