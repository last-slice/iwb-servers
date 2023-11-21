import { IWBRoom } from "../IWBRoom";
import { RoomPlayerHandler } from "./PlayerHandlers";
import { RoomSceneHandler } from "./SceneHandler";
import { RoomSceneItemHandler } from "./SceneItemHandler";

export class RoomMessageHandler {
    
    room:IWBRoom

    playerHandler:RoomPlayerHandler
    sceneHandler:RoomSceneHandler
    sceneItemHandler:RoomSceneItemHandler

    constructor(room:IWBRoom){
        this.room = room
        this.playerHandler = new RoomPlayerHandler(room)
        this.sceneHandler = new RoomSceneHandler(room)
        this.sceneItemHandler = new RoomSceneItemHandler(room)
    }

    broadcast(type:any, data:any){
        this.room.broadcast(type, data)
    }
}