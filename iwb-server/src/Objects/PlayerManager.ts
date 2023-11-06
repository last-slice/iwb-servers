import {Client, Room} from "@colyseus/core";
import { Player } from "./Player"

export class PlayerManager {
    
    players:Map<string,Player> = new Map()

    addPlayerToWorld(player:Player){
        if(!this.players.has(player.dclData.userId)){
            this.players.set(player.dclData.userId, player)
        }
    }

    addPlayerToPrivateWorld(player:Player, client:Client, world:string){
        player.client.leave()
        player.client = client
        player.world = world
    }   

    removePlayer(user:string){
        this.players.delete(user)
    }

    savePlayerCache(player:Player){
        // player.saveCache()
    }

    isInPrivateWorld(player:Player){
        return this.players.has(player.dclData.userId) && this.players.get(player.dclData.userId).world !== "main"
    }
}

