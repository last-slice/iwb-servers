import Listener from "../../utils/eventListener";
import { IWBRoom } from "../IWBRoom";
import { UserRoom } from "../UserRoom";
import { playerHandlers } from "./PlayerHandlers";

export class RoomMessageHandler {
    
    room:IWBRoom | UserRoom
    listener:Listener

    constructor(room:IWBRoom | UserRoom, listener:Listener){
        this.room = room
        this.listener = listener

        playerHandlers(room)
    }

    broadcast(type:any, data:any){
        this.room.broadcast(type, data)
    }

}