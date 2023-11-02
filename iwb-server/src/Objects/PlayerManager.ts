import { Player } from "./Player"

export class PlayerManager {
    
    players:Map<string,any> = new Map()

    addPlayerToWorld(player:Player){
        if(!this.players.has(player.dclData.userId)){
            this.players.set(player.dclData.userId, {
                data:player,
                world:"main"
            })
        }
    }

    addPlayerToPrivateWorld(user:string, world:string){
        if(this.players.has(user)){
            this.players.get(user).world = world
        }
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

