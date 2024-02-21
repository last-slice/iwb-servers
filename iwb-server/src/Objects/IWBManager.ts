import axios from "axios"
import { itemManager, iwbManager } from "../app.config"
import { IWBRoom } from "../rooms/IWBRoom"
import { PlayfabId, abortFileUploads, addEvent, fetchPlayfabFile, fetchPlayfabMetadata, fetchUserMetaData, finalizeUploadFiles, getTitleData, initializeUploadPlayerFiles, playerLogin, playfabLogin, setTitleData, uploadPlayerFiles } from "../utils/Playfab"
import { SERVER_MESSAGE_TYPES } from "../utils/types"
import { Player } from "./Player"
import { Scene } from "./Scene"
import { generateId } from "colyseus"
import { DEBUG } from "../utils/config"
import { getRandomIntInclusive } from "../utils/functions"

export class IWBManager{
    
    rooms:IWBRoom[] = []

    worldBackupInterval:any
    backupInterval:any
    worldsModified:boolean = false
    configModified:boolean = false
    backingUp:boolean = false
    worlds:any[] = []
    pendingSaves:any[] = []

    //server config
    version:number = 0
    versionUpdates:any[] = []
    styles:string[] = []

    initQueue:any[]= []
    realmFileKey:string = 'scenes.json'

    eventQueue:any[] = []
    postingEvents = false

    customKeys:any = {}

    tutorials:any[] = []
    tutorialsCID:string = ""
    feedback:any[] = []


    defaultPlayerSettings:any = {
            firstTime: false,
            nots: true,
            confirms: false,
            music: true
        }

    constructor(){
        this.getServerConfigurations(true)

        this.backupInterval = setInterval(async ()=>{
            if(this.configModified && !this.backingUp){
                this.backup()
            }
        },
        1000 * getRandomIntInclusive(10,30))

        let backupWorldConfigInterval = setInterval(async ()=>{
            if(this.worldsModified){
                try{
                    await setTitleData({Key:'Worlds', Value: JSON.stringify(this.worlds)})
                    this.worldsModified = false
                }
                catch(e){
                    console.log('error saving worlds', e)
                }

            }
        },
        1000 * getRandomIntInclusive(10,30))

        let eventUpdateInterval = setInterval(async()=>{
            this.checkEventQueue()
        }, 1000 * 5)
    }

    async backup(){
        this.backingUp = true
        await setTitleData({Key:'Config', Value: JSON.stringify({v:this.version, updates:this.versionUpdates, styles:this.styles})})
        this.configModified = false
        this.backingUp = false
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

    incrementVersion(updates?:string[]){
        console.log('increment version request verified, updating iwb version from ' + this.version + " to " + (this.version + 1))
        this.version += 1
        this.configModified = true

        if(updates){
            this.versionUpdates.length = 0
            this.versionUpdates = updates
            this.backup()
        }
    }

    async getServerConfigurations(init?:boolean){
        try{
            let response = await await getTitleData({Keys: ["Config", "Scenes", "Worlds", "CUSTOM", "Tutorials"]})
            
            let config = JSON.parse(response.Data['Config'])
            this.version = config.v
            this.versionUpdates = config.updates
            this.styles = config.styles

            let worlds = JSON.parse(response.Data['Worlds'])
            this.worlds = worlds

            init ? await itemManager.initServerItems() : null

            let custom = JSON.parse(response.Data['CUSTOM'])
            let res = await getTitleData({Keys:custom})
            for(let key in res.Data){
                this.customKeys[key] = JSON.parse(res.Data[key])
            }

            let tutorialsConfig = JSON.parse(response.Data['Tutorials'])
            this.tutorials = tutorialsConfig.videos
            this.tutorialsCID = tutorialsConfig.CID
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

    sendAllMessage(body:any){
        console.log('body to send is', body)
        if(body && body.message){
            this.rooms.forEach((room)=>{
                room.broadcast(SERVER_MESSAGE_TYPES.PLAYER_RECEIVED_MESSAGE, body.message)
            })
        }
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

    async updateAllWorlds(){
        for(let i = 0; i < this.worlds.length; i++){
            await this.deployWorld(this.worlds[i], false)
        }
    }

    async deployWorld(world:any, init:boolean){
        let res = await fetch(process.env.DEPLOYMENT_WORLD_ENDPOINT,{
            headers:{"content-type":"application/json"},
            method:"POST",
            body:JSON.stringify({
                auth: process.env.DEPLOYMENT_AUTH,
                world:{
                    ens:world.ens,
                    worldName: world.name,
                    owner: world.owner,
                    init:init
                }
            })
        })
        let json = await res.json()
        console.log('world deployment api response is', json)
    }

    async initWorld(world:any){
        let current = this.initQueue.find((w)=>w.ens === world.ens)
        if(!current){
            this.initQueue.push(world)
            await this.deployWorld(world,true)
        }
    }

    saveNewWorld(world:any){
        console.log('saving new world', world)
        world.updated = Math.floor(Date.now()/1000)
        world.builds = 0
        world.v = this.version

        this.rooms.forEach((room:IWBRoom)=>{
            room.broadcast(SERVER_MESSAGE_TYPES.NEW_WORLD_CREATED, world)
        })

        if(world.init){
            delete world.init
            this.createRealmLobby(world, true)
        }else{
            delete world.init
            let cachedWorld = this.worlds.find((w)=> w.ens === world.ens)
            if(cachedWorld){
                cachedWorld.updated = world.updated
                cachedWorld.v = this.version
                cachedWorld.cv += 1
                this.updateRealmPendingAssets(cachedWorld.owner)
            }
        }
        this.worldsModified = true

        let index = this.initQueue.findIndex((w)=> w.ens === world.ens)
        if(index >=0){
            this.initQueue.splice(index,1)
        }
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

    async createRealmLobby(world:any, newWorld:boolean){
        try{let user = await playfabLogin(world.owner)
            let realmMetadata = await fetchUserMetaData(user)
            let scenes = await fetchPlayfabFile(realmMetadata, 'scenes.json')
            // console.log('user scenes are ', scenes)
    
            let realmScenes = scenes.filter((scene:any)=> scene.w === world.ens)
    
            if(!realmScenes.find((scene:any)=> scene.n === "Realm Lobby")){
                scenes.push(this.createLobbyScene(world))
    
                if(newWorld){
                    world.builds = 1
                    world.updated = Math.floor(Date.now()/1000)
                    world.cv = 1
                    world.v = iwbManager.version    
                } 
    
                await this.backupScene(world.ens, user.EntityToken.EntityToken, user.EntityToken.Entity.Type, user.EntityToken.Entity.Id, scenes)
                if(newWorld){
                    this.worlds.push(world)  
                }
            // this.initiateRealm(world.owner)
            // .then((realmData)=>{           
            //     let realmToken = realmData.EntityToken.EntityToken
            //     let realmId = realmData.EntityToken.Entity.Id
            //     let realmTokenType = realmData.EntityToken.Entity.Type
    
            //     this.fetchRealmData(realmData)
            //     .then((realmScenes)=>{
            //         console.log('realm scenes are ', realmScenes)
            //         this.fetchRealmScenes(realmScenes)
            //         .then((sceneData)=>{
            //             let scenes = sceneData.filter((scene:any)=> scene.w === world.ens)
    
            //             if(!scenes.find((scene:any)=> scene.n === "Realm Lobby")){
            //                 scenes.push(this.createLobbyScene(world))
    
            //                 if(newWorld){
            //                     world.builds = 1
            //                     world.updated = Math.floor(Date.now()/1000)
            //                     world.cv = 1    
            //                 } 
    
            //                 this.backupScene(world.ens, realmToken, realmTokenType, realmId, scenes)
            //                 .then(()=>{
            //                     if(newWorld){
            //                         this.worlds.push(world)  
            //                     }
            //                 })
            //                 .catch((e)=>{
            //                     console.log('error backing up lobby scene', world.ens, e)
            //                 })
            //             }
            //         })
            //     })  
            // })
            }}
        catch(e){
            console.log('error creating lobby for new world', world)
        }
    }

    async initiateRealm(user:string){
        try{
            const playfabInfo = await playerLogin(
              {
                CreateAccount: true, 
                ServerCustomId: user,
                InfoRequestParameters:{
                  "UserDataKeys":[], "UserReadOnlyDataKeys":[],
                  "GetUserReadOnlyData":false,
                  "GetUserInventory":false,
                  "GetUserVirtualCurrency":true,
                  "GetPlayerStatistics":false,
                  "GetCharacterInventories":false,
                  "GetCharacterList":false,
                  "GetPlayerProfile":true,
                  "GetTitleData":false,
                  "GetUserAccountInfo":true,
                  "GetUserData":false,
              }
              })
        
            if(playfabInfo.error){
              console.log('playfab login error => ', playfabInfo.error)
              return null
            }
            else{
              console.log('playfab login success, initiate realm')
              return playfabInfo
            }
          }
          catch(e){
            console.log('playfab connection error', e)
            return null
          }
    }

    async fetchRealmData(realmData:any){
        let response = await axios.post("https://" + PlayfabId + ".playfabapi.com/File/GetFiles", 
        {Entity: {Id: realmData.EntityToken.Entity.Id, Type: realmData.EntityToken.Entity.Type}},
        {headers:{
            'content-type': 'application/json',
            'X-EntityToken': realmData.EntityToken.EntityToken}}
        )
        return response.data
    }

    async fetchRealmScenes(realmScenes:any){
        if(realmScenes.code === 200){
            let version = realmScenes.data.ProfileVersion
            if(version > 0){
                let metadata = realmScenes.data.Metadata
                let count = 0
                for (const key in metadata) {
                    if (metadata.hasOwnProperty(key)) {
                        count++
                    }
                }

                if(count > 0){
                    let res = await fetch( metadata[this.realmFileKey].DownloadUrl)
                    let json = await res.json()
                    return json
                }else{
                    return []
                }
                
            }else{
                return []
            }
        }
    }

    createLobbyScene(world:any){
        let lobby:Scene = new Scene({
            w: world.ens,
            id: "" + generateId(5),
            n: "Realm Lobby",
            d: "Realm Lobby Scene",
            o: world.owner,
            ona: world.worldName,
            cat:"",
            bps:[],
            bpcl: "0,0",
            cd: Math.floor(Date.now()/1000),
            upd: Math.floor(Date.now()/1000),
            si: 0,
            toc:0,
            pc: 0,
            pcnt: 4,
            isdl: false,
            e:true,
            pcls:["0,0", "1,0", "1,1", "0,1"],
            sp:["16,16"],
            ass:[]
          })

        return lobby
    }


    async backupScene(world:string, token:string, type:string, realmId:string, scenes:any[]){
        try{
            this.addWorldPendingSave(world)

            // console.log('scenes to back up are', scenes)

            let initres = await initializeUploadPlayerFiles(token,{
                Entity: {Id: realmId, Type: type},
                FileNames:[this.realmFileKey]
            })
    
            let uploadres = await uploadPlayerFiles(initres.UploadDetails[0].UploadUrl, JSON.stringify(scenes))
    
            let finalres = await finalizeUploadFiles(token,
                {
                Entity: {Id: realmId, Type: type},
                FileNames:[this.realmFileKey],
                ProfileVersion:initres.ProfileVersion,
            })
            this.removeWorldPendingSave(world)
        }
        catch(e){
            console.log('error backing up realm scenes', world, e)
            this.abortSaveSceneUploads(world, token, type, realmId)
        }
    }

    async abortSaveSceneUploads(world:string, token:string, type:string, realmId:string){
        await abortFileUploads(token,{
            Entity: {Id: realmId, Type: type},
            FileNames:[this.realmFileKey]
          })
        this.removeWorldPendingSave(world)
    }

    async updateRealmPendingAssets(world:string){
        console.log("updating realm assets for world", world)
        let found = false
        let assets:any[] = []
        if(this.rooms.length > 0){
            this.rooms.forEach(async (room, key)=>{
                if(room.state.world === world){
                    room.state.realmAssets.forEach((asset,key)=>{
                        asset.pending = false
                        assets.push(asset)
                    })
                    found = true
                    return
                }
            })
        }

        if(found){
            await itemManager.uploadFile(world, "catalogs.json", [...assets])
            console.log('finished updating realm assets')
        }else{
            console.log('player not on, need to log in first and get catalog before saving')
            let metadata = await fetchPlayfabMetadata(world)
            let catalog = await fetchPlayfabFile(metadata, "catalogs.json")
            catalog.forEach((asset:any)=>{
                asset.pending = false
            })
            await itemManager.uploadFile(world, "catalogs.json", [...catalog])
        }
    }

    async sceneReady(body:any){
        let player:any = false

        iwbManager.rooms.forEach((room)=>{
            if(room.state.players.has(body.user)){
                player = room.state.players.get(body.user)
                return
            }
        })

        if(!player){
            console.log('user not online anymore, delete deployment and free up bucket')
        }else{
            console.log('found user, notify them of their deployment', body)
            player.pendingDeployment = body.data.auth

            let link = "http://localhost:3000/" + "deploy/" + body.user + "/" + body.data.dest + "/"
            if(body.data.dest === "gc"){
                link += body.data.tokenId === "" ? ("parcel/" + body.bucket + "/" + body.data.name +"/" + body.data.parcel.split(",")[0] +  "/" + body.data.parcel.split(",")[1]) : ("estate/" +  body.bucket + "/" + body.data.tokenId + "/") 
            }else{
                link += body.bucket + "/" + body.data.name +"/" + body.data.worldName
            }

            link += "/" + body.auth

            player.sendPlayerMessage(SERVER_MESSAGE_TYPES.SCENE_DEPLOY_READY, {link:link})
        }
    }

    async buildDeployLink(body:any){
        let link = "http://localhost:3000/" + 
        "deploy/" + body.user + 
        "/" + body.data.dest + "/" + 
        (body.data.dest === "gc" ? await this.buildGCLink(body) : await this.buildWorldLink(body)) + 
         "/" + body.auth
        return link
    }

    async buildWorldLink(body:any){
        let link = body.bucket + 
        "/" + 
        body.data.name +
        "/" +
        body.data.worldName
        return link
    }

    async buildGCLink(body:any){
        let link = (body.data.tokenId === "" ? "parcel" : "estate") +
         "/" + body.bucket + 
         "/" + body.data.name + 
         "/" + 
         (body.data.dest === "gc" ? (body.data.parcel.split(",")[0] + 
         "/" + body.data.parcel.split(",")[1]) : body.data.tokenId)
         return link
    }

    async checkEventQueue(){
        if(!this.postingEvents && this.eventQueue.length > 0){
            this.postingEvents = true
            let event = this.eventQueue.shift()
            console.log('event queue has item, post to playfab', event.EventName)
            try{
                await addEvent(event)
                this.postingEvents = false
            }
            catch(e){
                console.log('error posting event', e)
                this.postingEvents = false
            }
        }
    }

    clearFeedback(req:any, res:any){
        if(req.params.auth && req.params.auth === process.env.IWB_UPLOAD_AUTH_KEY){
            iwbManager.feedback.length = 0
            res.status(200).send({valid: true})
        }else{
            res.status(200).send({valid: false})
        }
    }

    async addTutorial(req:any, res:any){
        if(req.params.auth && req.params.auth === process.env.IWB_UPLOAD_AUTH_KEY){
            this.tutorials.push(req.body)
            this.rooms.forEach((room:IWBRoom)=>{
                room.broadcast(SERVER_MESSAGE_TYPES.ADDED_TUTORIAL, req.body)
            })
            await setTitleData({Key:'Tutorials', Value: JSON.stringify({videos:this.tutorials, CID:iwbManager.tutorialsCID})})
            res.status(200).send({valid: true})
        }else{
            res.status(200).send({valid: false})
        }
    }

    async updateCID(req:any, res:any){
        if(req.params.auth && req.params.auth === process.env.IWB_UPLOAD_AUTH_KEY){
            iwbManager.tutorialsCID = req.body.CID
            this.rooms.forEach((room:IWBRoom)=>{
                room.broadcast(SERVER_MESSAGE_TYPES.ADDED_TUTORIAL, req.body.CID)
            })
            await setTitleData({Key:'Tutorials', Value: JSON.stringify({videos:this.tutorials, CID:iwbManager.tutorialsCID})})
            res.status(200).send({valid: true})
        }else{
            res.status(200).send({valid: false})
        }
    }

    async clearTutorial(req:any, res:any){
        if(req.params.auth && req.params.auth === process.env.IWB_UPLOAD_AUTH_KEY){
            this.tutorials.splice(parseInt(req.params.index), 1)
            this.rooms.forEach((room:IWBRoom)=>{
                room.broadcast(SERVER_MESSAGE_TYPES.REMOVED_TUTORIAL, parseInt(req.params.index))
            })
            await setTitleData({Key:'Tutorials', Value: JSON.stringify(this.tutorials)})
            res.status(200).send({valid: true})
        }else{
            res.status(200).send({valid: false})
        }
    }
}
