import Listener from "../utils/eventListener";
import { IWBRoom } from "./IWBRoom";
import { sceneCreationHandlers } from "./handlers/CreateSceneHandlers";
import { playerHandlers } from "./handlers/PlayerHandlers";

export class RoomMessageHandler {
    
    room:IWBRoom
    listener:Listener

    constructor(room:IWBRoom, listener:Listener){
        this.room = room
        this.listener = listener
        sceneCreationHandlers(room)
        playerHandlers(room)
    }

    broadcast(type:any, data:any){
        this.room.broadcast(type, data)
    }

}