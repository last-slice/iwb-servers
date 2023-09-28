import { Room, Client } from "@colyseus/core";
import { IWBRoomState } from "./schema/IWBRoomState";
import { Player } from "../Objects/Player";
import { RoomMessageHandler } from "./MessageHandler";
import { eventListener, itemManager, sceneManager } from "../app.config";
import { pushPlayfabEvent } from "../Objects/PlayfabEvents";
import { SERVER_MESSAGE_TYPES } from "../utils/types";

export class IWBRoom extends Room<IWBRoomState> {

  async onAuth (client:Client, options:any, request:any) {

    if(this.state.players.has(options.userData.userId)){
        console.log('user already signed in')
        return false
    }

    return true
  }

  onCreate (options: any) {
    this.setState(new IWBRoomState());

    let handler = new RoomMessageHandler(this, eventListener)

    itemManager.messageHandler = handler
  }

  onJoin (client: Client, options: any) {
    try{
      console.log(options.userData.userId, "joined! - ", options.userData.displayName);

      client.userData = options.userData;
      client.userData.roomId = this.roomId
  
      if(client.userData.userId == "admin"){
        console.log('we have an admin user')
      }
      else{
        this.getPlayerInfo(client, options)
      }
    }
    catch(e){
      console.log('on join error', e)
    }
  }

  onLeave (client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");

    //player cleanup
    sceneManager.freeTemporaryParcels(this.state.players.get(client.userData.userId))

    this.state.players.delete(client.userData.userId)
    this.broadcast(SERVER_MESSAGE_TYPES.PLAYER_LEAVE, {player:client.userData.userId})
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
    sceneManager.cleanUp()
  }

  async getPlayerInfo(client:Client, options:any){
    client.send(SERVER_MESSAGE_TYPES.INIT, {
      catalog: itemManager.items
    })

    this.state.players.set(options.userData.userId, new Player(this, client))

    //todo
    // pushPlayfabEvent({
    //   EventName: 'JOINED',
    //   PlayFabId: client.auth.PlayFabId,
    //   Body:{
    //     'player':options.userData.displayName,
    //     'ethaddress':options.userData.userId,
    //     'ip': client.auth.ip
    //   }
    // })
  }

}
