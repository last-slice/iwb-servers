import { getRandomItemFromDropTable, grantUserItem, updatePlayerInternalData, updatePlayerItem, updatePlayerStatistic } from "../utils/Playfab";
import axios from "axios";
import { generateId } from "colyseus";
import Listener from "../utils/eventListener";
import { IWBRoom } from "./IWBRoom";

export class RoomMessageHandler {
    
    room:IWBRoom
    listener:Listener

    constructor(room:IWBRoom, listener:Listener){
        this.room = room
        this.listener = listener

        this.room.onMessage("", async(client, message)=>{
        })
    }

}