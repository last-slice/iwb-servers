import { Room, Client } from "@colyseus/core";
import { IWBRoomState } from "./schema/IWBRoomState";
import { Player } from "../Objects/Player";
import { RoomMessageHandler } from "./MessageHandler";
import { eventListener, itemManager } from "../app.config";
import { pushPlayfabEvent } from "../Objects/PlayfabEvents";

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

    new RoomMessageHandler(this, eventListener)
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

    this.state.players.delete(client.userData.userId)
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

  async getPlayerInfo(client:Client, options:any){
    client.send('init', {
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
