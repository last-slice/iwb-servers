import { IWBRoom } from "../IWBRoom";
import { RoomPlayerHandler } from "./PlayerHandlers";
import { RoomSceneGameHandler } from "./SceneGameHandler";
import { RoomSceneHandler } from "./SceneHandler";
import { RoomSceneItemHandler } from "./SceneItemHandler";
import { RoomRewardHandler } from "./SceneRewardHandler";

export class RoomMessageHandler {
    
    room:IWBRoom

    playerHandler:RoomPlayerHandler
    sceneHandler:RoomSceneHandler
    sceneItemHandler:RoomSceneItemHandler
    gameHandler:RoomSceneGameHandler
    rewardHandler:RoomSceneGameHandler

    constructor(room:IWBRoom){
        this.room = room
        this.playerHandler = new RoomPlayerHandler(room)
        this.sceneHandler = new RoomSceneHandler(room)
        this.sceneItemHandler = new RoomSceneItemHandler(room)
        this.gameHandler = new RoomSceneGameHandler(room)
        this.rewardHandler = new RoomRewardHandler(room)
    }

    broadcast(type:any, data:any){
        this.room.broadcast(type, data)
    }
}