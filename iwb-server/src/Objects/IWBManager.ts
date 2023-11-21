import { itemManager } from "../app.config"
import { IWBRoom } from "../rooms/IWBRoom"
import { getTitleData, setTitleData } from "../utils/Playfab"
import { SERVER_MESSAGE_TYPES } from "../utils/types"
import { Player } from "./Player"
import { Scene } from "./Scene"

export class IWBManager{
    
    rooms:IWBRoom[] = []

    worldBackupInterval:any
    backupInterval:any
    worldsModified:boolean = false
    configModified:boolean = false
    scenes:any[] = []
    worlds:any[] = []
    pendingSaves:any[] = []

    version:number = 0

    initQueue:any[]= []

    constructor(){
        this.getServerConfigurations()

        this.backupInterval = setInterval(async ()=>{
            if(this.configModified){
                await setTitleData({Key:'Config', Value: JSON.stringify({v:this.version})})
                this.configModified = false
            }
        },
        1000 * 20)

        this.backupInterval = setInterval(async ()=>{
            if(this.worldsModified){
                await setTitleData({Key:'Worlds', Value: JSON.stringify(this.worlds)})
                this.worldsModified = false
            }
        },
        1000 * 20)
    }

    addRoom(room:IWBRoom){
        this.rooms.push(room)
    }

    removeRoom(room:IWBRoom){
        // this.rooms.delete(room.roomId)
        let index = this.rooms.findIndex((ro)=> ro.roomId === room.roomId)
        if(index >=0){
            this.rooms.splice(index,1)
        }
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
            let response = await await getTitleData({Keys: ["Builder Items", "Catalog1", "Config", "Scenes", "Worlds"]})
            
            let config = JSON.parse(response.Data['Config'])
            this.version = config.v

            let scenes = JSON.parse(response.Data['Scenes'])
            this.scenes = scenes

            let worlds = JSON.parse(response.Data['Worlds'])
            this.worlds = worlds

            itemManager.initServerItems([response.Data['Builder Items'], response.Data['Catalog1']])
        }
        catch(e){
            console.log('error getting server items', e)
        }
    }

    getScenes(){
        let serverScenes:any[] = []
        this.scenes.forEach((scene)=>{
            serverScenes.push({id:scene.id, scna:scene.n, owner:scene.o, updated: scene.upd, name: scene.ona})
        })
        return serverScenes
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

    sendAllMessage(type:SERVER_MESSAGE_TYPES, data:any){
        this.rooms.forEach((room)=>{
            room.broadcast(type,data)
        })
    }

    sendUserMessage(user:string, type:SERVER_MESSAGE_TYPES, data:any){
        this.rooms.forEach((room)=>{
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


    async initWorld(world:any){
        this.initQueue.push(world)
        let res = await fetch(process.env.DEPLOYMENT_WORLD_ENDPOINT,{
            headers:{"content-type":"application/json"},
            method:"POST",
            body:JSON.stringify({
                auth: process.env.DEPLOYMENT_AUTH,
                world:{
                    ens:world.ens,
                    worldName: world.name,
                    owner: world.owner,
                    init:true
                }
            })
        })
        let json = await res.json()
        console.log('world deployment api response is', json)
    }

    saveNewWorld(world:any){
        world.updated = Math.floor(Date.now()/1000)
        world.builds = 0

        this.rooms.forEach((room:IWBRoom)=>{
            room.broadcast(SERVER_MESSAGE_TYPES.NEW_WORLD_CREATED, world)
        })

        delete world.init
        this.worlds.push(world)
        this.worldsModified = true
    }

    addWorldPendingSave(world:string){
        this.pendingSaves.push(world)
    }

    removeWorldPendingSave(world:string){
        let index = this.pendingSaves.findIndex((w)=> w === world)
        if(index >=0){
            this.pendingSaves.splice(index,1)
        }
    }
}