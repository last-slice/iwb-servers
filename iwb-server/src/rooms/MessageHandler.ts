import { getRandomItemFromDropTable, grantUserItem, updatePlayerInternalData, updatePlayerItem, updatePlayerStatistic } from "../utils/Playfab";
import axios from "axios";
import { generateId } from "colyseus";
import Listener from "../utils/eventListener";
import { IWBRoom } from "./IWBRoom";
import { createSceneHandlers } from "./handlers/CreateSceneHandlers";

export class RoomMessageHandler {
    
    room:IWBRoom
    listener:Listener

    constructor(room:IWBRoom, listener:Listener){
        this.room = room
        this.listener = listener
        createSceneHandlers(room)
    }

}