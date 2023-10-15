import { itemManager } from "../app.config"
import { IWBRoom } from "../rooms/IWBRoom"
import { RoomMessageHandler } from "../rooms/MessageHandler"
import { getTitleData, setTitleData } from "../utils/Playfab"
import { SERVER_MESSAGE_TYPES } from "../utils/types"
import { Player } from "./Player"

export class IWBManager{
    
    rooms:Map<string, IWBRoom> = new Map()
    messageHandler:RoomMessageHandler

    backupInterval:any
    configModified:boolean = false
    version:number = 0

    constructor(){
        this.getServerConfigurations()

        this.backupInterval = setInterval(async ()=>{
            if(this.configModified){
                await setTitleData({Key:'Config', Value: JSON.stringify({v:this.version})})
                this.configModified = false
            }
        },
        1000 * 20)
    }

    addRoom(room:IWBRoom){
        this.rooms.set(room.roomId, room)
    }

    removeRoom(room:IWBRoom){
        this.rooms.delete(room.roomId)
    }

    updateVersion(version:number){
        console.log('update version request verified, updating iwb version to ', version)
    }

    incrementVersion(){
        console.log('increment version request verified, updating iwb version from ' + this.version + " to " + (this.version + 1))
        this.version++
        this.configModified = true
    }

    async getServerConfigurations(init?:boolean){
        try{
            let response = await await getTitleData({Keys: ["Builder Items", "Catalog1", "Config"]})
            
            let config = JSON.parse(response.Data['Config'])
            this.version = config.v

            itemManager.initServerItems(response.Data)
        }
        catch(e){
            console.log('error getting server items', e)
        }
    }

    attemptUserMessage(req:any, res:any){
        if(req.body){
            if(req.body.user){
                this.sendUserMessage(req.body.user.toLowerCase(), SERVER_MESSAGE_TYPES.PLAYER_RECEIVED_MESSAGE, req.body.message)
                res.status(200).send({valid: true})
            }else{
                res.status(200).send({valid: false, msg: "invalid user"})
            }
        }else{
            res.status(200).send({valid: false, msg: "Invalid information"})
        }
    }

    sendUserMessage(user:string, type:SERVER_MESSAGE_TYPES, data:any){
        this.rooms.forEach((room, key)=>{
            let player:Player = room.state.players.get(user.toLowerCase())
            if(player){
                player.sendPlayerMessage(type, data)
            }
        })
    }

    findUser(user:string){
        let player:Player
        this.rooms.forEach(async (room, key)=>{
            player = room.state.players.get(user.toLowerCase())
        })
        return player
    }
}