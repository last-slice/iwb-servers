import { Client } from "colyseus"
import { Player } from "../../Objects/Player"
import { iwbManager } from "../../app.config"
import { SERVER_MESSAGE_TYPES } from "../../utils/types"
import { IWBRoom } from "../IWBRoom"

export let players:Map<string,Player> = new Map()

export function addPlayerToWorld(player:Player){
    if(!players.has(player.dclData.userId)){
        players.set(player.dclData.userId, player)
    }
}

export function addPlayerToPrivateWorld(player:Player, client:Client, world:any){
    player.client = client
    player.world = world
    player.sendPlayerMessage(SERVER_MESSAGE_TYPES.PLAYER_JOINED_USER_WORLD, world)
}   

export function removePlayer(user:string){
    players.delete(user)
}

export function savePlayerCache(player:Player){
    player.saveCache()
}

export function isInPrivateWorld(player:Player){
    return players.has(player.dclData.userId) && players.get(player.dclData.userId).world !== "main"
}

export function iwbPlayerHandler(room:IWBRoom){
    room.onMessage(SERVER_MESSAGE_TYPES.PLAY_MODE_CHANGED, async(client, info)=>{
         console.log(SERVER_MESSAGE_TYPES.PLAY_MODE_CHANGED + " message", info)
 
         let player:Player = room.state.players.get(client.userData.userId)
         if(player){
             player.updatePlayMode(info.mode)
            //  room.broadcast(SERVER_MESSAGE_TYPES.PLAY_MODE_CHANGED, info)       
         }
     })

     room.onMessage(SERVER_MESSAGE_TYPES.INIT_WORLD, async(client, info)=>{
       //   console.log(SERVER_MESSAGE_TYPES.INIT_WORLD + " message", info)
 
         let player:Player = room.state.players.get(client.userData.userId)
         if(player){
            //  console.log('need to initiate deployment to world')
             iwbManager.initWorld(room, info.world)
         }
     })

     room.onMessage(SERVER_MESSAGE_TYPES.FIRST_TIME, async(client, info)=>{
         // console.log(SERVER_MESSAGE_TYPES.FIRST_TIME + " message", info)
         let player:Player = room.state.players.get(client.userData.userId)
         if(player){
             player.settings.firstTime = true
         }
     })

     room.onMessage(SERVER_MESSAGE_TYPES.PLAYER_SETTINGS, async(client, info)=>{
         // console.log(SERVER_MESSAGE_TYPES.PLAYER_SETTINGS + " message", info)
         let player:Player = room.state.players.get(client.userData.userId)
         if(player){
             player.settings[info.key] = info.value
         }
     })
}