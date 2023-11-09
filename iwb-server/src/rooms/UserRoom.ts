import {Client, Room} from "@colyseus/core";
import {IWBRoomState} from "./schema/IWBRoomState";
import {Player} from "../Objects/Player";
import {RoomMessageHandler} from "./handlers/MessageHandler";
import {eventListener, itemManager, iwbManager, playerManager, sceneManager} from "../app.config";
import {SERVER_MESSAGE_TYPES} from "../utils/types";
import * as jwt from "jsonwebtoken";
import { playerLogin, updatePlayerDisplayName, updatePlayerInternalData } from "../utils/Playfab";
import { RoomSceneHandler } from "./handlers/SceneHandler";

export class UserRoom extends Room<IWBRoomState> {

    onCreate(options: any) {
        this.setState(new IWBRoomState());
        this.state.world = options.world

        iwbManager.addRoom(this)
        new RoomMessageHandler(this, eventListener)
        this.state.sceneHandler = new RoomSceneHandler(this)

        sceneManager.loadWorldScenes(this)
    }

    onJoin(client: Client, options: any) {
        try {
            let player:Player = playerManager.players.get(options.userData.userId)
            if(player){
              console.log('player was already in main iwb world, log them into private wworld')
              client.userData = options.userData

              playerManager.addPlayerToPrivateWorld(player, client, options.world)
              this.state.players.set(player.dclData.userId, player)

            }else{
              console.log('player tried to join private world directly')
              client.leave(4114)
            }
        } catch (e) {
            console.log('on join error', e)
        }
    }

    async onLeave(client: Client, consented: boolean) {
        console.log(client.userData.displayName, "left!");

        //player cleanup
        this.state.sceneHandler.freeTemporaryParcels()

        let player:Player = this.state.players.get(client.userData.userId)
        if(player){
            console.log('found player to clean up')
          await player.saveCache()
          this.state.players.delete(client.userData.userId)
        }

        this.broadcast(SERVER_MESSAGE_TYPES.PLAYER_LEAVE, {player: client.userData.userId})
    }

    async onDispose() {
        console.log("room", this.roomId, "disposing...");
        iwbManager.removeRoom(this)
        await sceneManager.saveWorldScenes(this.state.scenes)
        this.state.scenes.clear()
    }

}
