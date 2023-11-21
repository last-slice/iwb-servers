import {Client, Room} from "@colyseus/core";
import { Player } from "./Player"
import { SERVER_MESSAGE_TYPES } from "../utils/types";

export class PlayerManager {
    
    players:Map<string,Player> = new Map()

    addPlayerToWorld(player:Player){
        if(!this.players.has(player.dclData.userId)){
            this.players.set(player.dclData.userId, player)
        }
    }

    addPlayerToPrivateWorld(player:Player, client:Client, world:any){
        player.client = client
        player.world = world
        player.sendPlayerMessage(SERVER_MESSAGE_TYPES.PLAYER_JOINED_USER_WORLD, world)
    }   

    removePlayer(user:string){
        this.players.delete(user)
    }

    savePlayerCache(player:Player){
        player.saveCache()
    }

    isInPrivateWorld(player:Player){
        return this.players.has(player.dclData.userId) && this.players.get(player.dclData.userId).world !== "main"
    }
}

