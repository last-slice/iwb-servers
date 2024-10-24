import axios from "axios"
import { itemManager, iwbManager, questManager } from "../app.config"
import { IWBRoom } from "../rooms/IWBRoom"
import { PlayfabId, abortFileUploads, addEvent, fetchPlayfabFile, fetchPlayfabMetadata, fetchUserMetaData, finalizeUploadFiles, getDownloadURL, getTitleData, initializeUploadPlayerFiles, playerLogin, playfabLogin, setTitleData, uploadPlayerFiles } from "../utils/Playfab"
import { SERVER_MESSAGE_TYPES } from "../utils/types"
import { Player } from "./Player"
import { getRealmData, initServerAssets, initServerScenes, Scene } from "./Scene"
import { Client, generateId } from "colyseus"
import { DEBUG } from "../utils/config"
import { getRandomIntInclusive } from "../utils/functions"
import { iwbSceneActionHandler } from "../rooms/messaging/ActionHandler"
import { iwbSceneGameHandler } from "../rooms/messaging/GameHandler"
import { hasWorldPermissions, iwbItemHandler } from "../rooms/messaging/ItemHandler"
import { iwbPlayerHandler } from "../rooms/messaging/PlayerHandler"
import { iwbSceneHandler } from "../rooms/messaging/SceneHandler"
import { garbageCollectRealmGames } from "./Game"
import { garbageCollectPlaylist } from "./Playlist"
import { iwbQuestHandler } from "../rooms/messaging/QuestHandler"
import { QuestManager } from "./QuestManager"

const fs = require('fs');

export class IWBManager{
    
    rooms:IWBRoom[] = []

    worldBackupInterval:any
    backupInterval:any
    worldsModified:boolean = false
    configModified:boolean = false
    backingUp:boolean = false
    worlds:any[] = []
    pendingSaves:any[] = []
    pendingBackups:any[] = []
    savingWorlds:any[] = []
    savingBackups:any[] = []

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

    pendingSaveIntervals:Map<string, any> = new Map()
    pendingRooms:Map<string, IWBRoom> = new Map()


    defaultPlayerSettings:any = {
            firstTime: true,
            nots: true,
            confirms: true,
            music: false,
            loadRadius:10
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
                    console.log('backing up worlds config to playfab')
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

    addPendingRoom(room:IWBRoom){
        this.pendingRooms.set(room.roomId, room)
    }

    async processPendingRoom(room:IWBRoom, player:Player){
        if(!this.rooms.find(($:any)=> $.roomId === room.roomId)){

            console.log('we have not init room yet')
            await iwbItemHandler(room)
            await iwbSceneActionHandler(room)
            // iwbRewardHandler(this)
            await iwbSceneGameHandler(room)
            await iwbPlayerHandler(room)
            await iwbSceneHandler(room)
            await iwbQuestHandler(room)

            let options:any
            if(room.state.options.island === "client"){
                if(!room.state.options.world){
                    options = room.state.options
                }
            }else{
                if(room.state.options.island !== "world"){
                    options =room.state.options
                }
            }

            await initServerAssets(room)
            await initServerScenes(room, options)
            // loadRealmScenes(this, data)
            // createCustomObjects(this)     
            this.addRoom(room)       
        }else{
            this.initPlayer(room, player)
        }
    }

    sendItemsInChunks(room: IWBRoom, player:Player): void {
        const totalItems = room.state.realmAssets.size
        let items:any[] = [...room.state.realmAssets.values()]
        console.log('items size is', totalItems, items.length)
        let chunkSize = 100
        let chunkIndex = 0;
    
        while (chunkIndex * chunkSize < totalItems) {
            // Get the current chunk of items
            const chunk = items.slice(chunkIndex * chunkSize, (chunkIndex + 1) * chunkSize);

            let assets:Map<string,any> = new Map()
            chunk.forEach((item:any)=>{
                assets.set(item.id, item)
            })
            // console.log('chunk is', chunk.length)
            player.sendPlayerMessage(SERVER_MESSAGE_TYPES.CHUNK_SEND_ASSETS, assets)
            chunkIndex++;
        }

        player.sendPlayerMessage(SERVER_MESSAGE_TYPES.INIT,{
            prerequisites: questManager.prerequisites.filter(condition => condition.world === room.state.world),
            quests: questManager.quests.filter(quest => quest.world === room.state.world),
            // quests: questManager.quests.filter(quest => quest.owner === room.state.owner).map(({ definition, ...rest }) => rest),
            // realmAssets: room.state.realmAssets,
            realmAssetSize:room.state.realmAssets.size,
            styles: iwbManager.styles,
            worlds: iwbManager.worlds,
            iwb: {v: iwbManager.version, updates:iwbManager.versionUpdates},
            tutorials: {
                videos: iwbManager.tutorials,
                cid: iwbManager.tutorialsCID
            },
            settings: player.settings
        })
    }   

    initPlayer(room:IWBRoom, player:Player){
        console.log('asset count ', room.state.realmAssets.size)
        // console.log('quests are ', questManager.quests.values())
        // player.sendPlayerMessage(SERVER_MESSAGE_TYPES.INIT,{
        //     prerequisites: questManager.prerequisites.filter(condition => condition.world === room.state.world),
        //     quests: questManager.quests.filter(quest => quest.world === room.state.world),
        //     // quests: questManager.quests.filter(quest => quest.owner === room.state.owner).map(({ definition, ...rest }) => rest),
        //     realmAssets: room.state.realmAssets,
        //     realmAssetSize:room.state.realmAssets.size,
        //     styles: iwbManager.styles,
        //     worlds: iwbManager.worlds,
        //     iwb: {v: iwbManager.version, updates:iwbManager.versionUpdates},
        //     tutorials: {
        //         videos: iwbManager.tutorials,
        //         cid: iwbManager.tutorialsCID
        //     },
        //     settings: player.settings
        // })
        // setTimeout(()=>{
            this.sendItemsInChunks(room, player)
        // },200)
    }

    initUsers(room:IWBRoom){
        room.state.players.forEach((player:Player)=>{
            this.initPlayer(room, player)
        })
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

    async getServerConfigurations(init?:boolean, keys?:any[]){
        try{
            let serverKeys:any = []
            if(keys){
                serverKeys = keys
            }else{
                serverKeys = ["Config", "Scenes", "Worlds", "CUSTOM", "Tutorials"]
            }
            
            let response = await await getTitleData({Keys: serverKeys})
            
            let config = JSON.parse(response.Data['Config'])
            this.version = config.v
            this.versionUpdates = config.updates
            this.styles = config.styles

            // console.log('config is', config)

            let worlds = JSON.parse(response.Data['Worlds'])
            this.worlds = worlds

            // let refresh = false
            // this.worlds.forEach((world:any)=>{
            //     if(!world.hasOwnProperty("bans")){
            //         world.bans = []
            //         refresh = true
            //     }
            // })

            // console.log('world refresh', refresh)
            // refresh ? this.worldsModified = true : null

            init ? await itemManager.initServerItems() : null

            let custom = JSON.parse(response.Data['CUSTOM'])
            let res = await getTitleData({Keys:custom})
            for(let key in res.Data){
                this.customKeys[key] = JSON.parse(res.Data[key])
                // console.log('key is', key, this.customKeys[key])
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
                this.sendUserMessage(req.body.user.toLowerCase(), SERVER_MESSAGE_TYPES.PLAYER_RECEIVED_MESSAGE, {message:req.body.message, sound:req.body.sound})
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
                room.broadcast(SERVER_MESSAGE_TYPES.PLAYER_RECEIVED_MESSAGE, {message:body.message, sound:body.sound})
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
        this.rooms.forEach((room:IWBRoom, key)=>{
            player = room.state.players.get(user.toLowerCase())
        })
        return player
    }

    findWorldOwner(world:string){
        let owner:any
        owner = this.worlds.find((w)=> w.ens === world).owner
        return owner
    }

    async updateAllWorlds(){
        for(let i = 0; i < this.worlds.length; i++){
            await this.deployWorld(this.worlds[i])
        }
    }

    async updateSpecificWorlds(worlds:any[]){
        for(let i = 0; i < worlds.length; i++){
            await this.deployWorld(worlds[i])
        }
    }

    async adminDeploy(user:string, world:string){
        let metadata = await fetchPlayfabMetadata(user)
        let url = getDownloadURL(metadata, "catalogs.json")
        await this.deploy(user, {name: world, ens: world + ".dcl.eth", owner:user}, url)
    }

    async deploy(owner:string, world:any, url:string){
        let res = await fetch((DEBUG ? process.env.DEPLOYMENT_SERVER_DEV : process.env.DEPLOYMENT_SERVER_PROD ) + process.env.DEPLOYMENT_WORLD_ENDPOINT,{
            headers:{"content-type":"application/json"},
            method:"POST",
            body:JSON.stringify({
                auth: process.env.DEPLOYMENT_AUTH,
                world:{
                    ens:world.ens,
                    worldName: world.name,
                    owner: world.owner,
                    init: world.hasOwnProperty("init") ? true : false,
                    url:url,
                    destination:'iwbworld'
                },
                
            })
        })
        let json = await res.json()
        console.log('world deployment api response is', json, world)
    }

    async deployWorld(worldToDeploy:any, room?:IWBRoom){
        try{
            console.log('deploying world', worldToDeploy)

            let url:any
            let world = iwbManager.worlds.find((w:any)=> w.ens === worldToDeploy.ens)
            if(world){
                let metadata = await fetchPlayfabMetadata(world.owner)
                url = getDownloadURL(metadata, "catalogs.json")
            }

            if(DEBUG){
                this.saveNewWorld(worldToDeploy)
            }else{
                await this.deploy(worldToDeploy.owner, worldToDeploy, url)    
            }
        }
        catch(e){
            console.log('error posting deployment request', e)
        }
    }

    async deployWorldToDCLName(world:any){
        let metadata = await fetchPlayfabMetadata(world.owner)
        let url = getDownloadURL(metadata, world.ens + "-scenes.json")

        try{
            let res = await fetch((DEBUG ? process.env.DEPLOYMENT_SERVER_DEV : process.env.DEPLOYMENT_SERVER_PROD ) + process.env.DEPLOYMENT_DCL_WORLD_ENDPOINT,{
                headers:{"content-type":"application/json"},
                method:"POST",
                body:JSON.stringify({
                    auth: process.env.DEPLOYMENT_AUTH,
                    world:{
                        ens:world.ens,
                        worldName: world.worldName,
                        owner: world.owner,
                        url:url,
                        destination:'dclname'
                    },
                    
                })
            })
            let json = await res.json()
            console.log('world deployment api response is', json, world)
        }
        catch(e){
            console.log('error pinging deploy server', e)
        }
    }

    async backupWorld(room:IWBRoom, client:Client, info:any){
        let player:Player = room.state.players.get(client.userData.userId)
        if(player){
            let world = iwbManager.worlds.find((w)=> w.ens === room.state.world)
            if(world && world.owner === client.userData.userId || world.bps.includes(client.userData.userId)){
                world.backedUp = Math.floor(Date.now()/1000)
                this.worldsModified = true
                                                                           
                let realmScenes:any[] = await getRealmData(room)
                iwbManager.addWorldPendingBackup(room.state.world, room.roomId, ["" + room.state.world + "-backup.json"], room.state.realmToken, room.state.realmTokenType, room.state.realmId, [realmScenes])
            }
            else{
                console.log('someone trying to back up world who isnt owner or has permissions', world.ens, player.address)
            }  
        }
        else{
            console.log('someone trying to back up world who isnt a player on the server', client.userData.userId)
        }
    }

    async initWorld(room:IWBRoom, world:any){
        let current = this.initQueue.find((w)=>w.ens === world.ens)
        if(!current){
            world.init = true
            this.initQueue.push(world)
            await this.deployWorld(world, room)
        }
    }

    saveNewWorld(world:any){
        console.log('saving new world', world)
        world.updated = Math.floor(Date.now()/1000)
        world.builds = 0
        world.bps = []
        world.bans = []
        world.v = this.version
        world.cv = 0
        world.worldName = world.ens.split(".")[0]

        this.rooms.forEach((room:IWBRoom)=>{
            room.broadcast(SERVER_MESSAGE_TYPES.NEW_WORLD_CREATED, world)
        })

        if(world.init){
            delete world.init
            this.worlds.push(world)
        }else{
            delete world.init
            let cachedWorld = this.worlds.find((w)=> w.ens === world.ens)
            if(cachedWorld){
                cachedWorld.updated = world.updated
                cachedWorld.v = this.version
                cachedWorld.cv += 1
                this.updateRealmPendingAssets(world.owner, world.ens)
            }
        }
        this.worldsModified = true

        let index = this.initQueue.findIndex((w)=> w.ens === world.ens)
        if(index >=0){
            this.initQueue.splice(index,1)
        }
    }

    checkPendingBackupQueue(world:string){
        let pendingBackup:any = this.pendingBackups.find(($:any)=> $.world === world)
        if(pendingBackup && !this.savingBackups.includes(world)){
            this.savingBackups.push(world)
            this.worldsModified = true

            this.backupFiles(pendingBackup)
        }
    }

    addWorldPendingBackup(world:string, roomId:string, filenames:string[], token:string, type:string, realmId:string, data:any[]){
        this.pendingBackups.push({
            world:world,
            roomId:roomId,
            filenames:filenames,
            token:token,
            type:type,
            realmId:realmId,
            data:data
        })
        this.checkPendingBackupQueue(world)
    }

    async removeWorldPendingBackup(world:string){
        let index = this.pendingBackups.findIndex((w)=> w.world === world)
        if(index >=0){
            this.pendingBackups.splice(index,1)
        }

        let save = this.savingBackups.findIndex((w)=> w === world)
        if(save >=0){
            this.savingBackups.splice(index,1)
        }
    }

    checkPendingSaveQueue(world:string){
        let pendingWorld:any = this.pendingSaves.find(($:any)=> $.world === world)
        if(pendingWorld && !this.savingWorlds.includes(world)){
            this.savingWorlds.push(world)
            this.backupFiles(pendingWorld)
        }
    }

    addWorldPendingSave(world:string, roomId:string, filenames:string[], token:string, type:string, realmId:string, data:any[]){
        this.pendingSaves.push({
            world:world,
            roomId:roomId,
            filenames:filenames,
            token:token,
            type:type,
            realmId:realmId,
            data:data
        })
        this.checkPendingSaveQueue(world)
    }

    async removeWorldPendingSave(world:string){
        let index = this.pendingSaves.findIndex((w)=> w.world === world)
        if(index >=0){
            this.pendingSaves.splice(index,1)
        }

        let save = this.savingWorlds.findIndex((w)=> w === world)
        if(save >=0){
            this.savingWorlds.splice(index,1)
        }
    }

    async checkSaveFinished(room:IWBRoom, onComplete:any){
        if(this.pendingSaves.find(($:any)=> $.world === room.state.world)){
            setTimeout(()=>{
                this.checkSaveFinished(room, onComplete)
            }, 200)
        }else{
            onComplete()
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

    async fetchRealmScenes(world:string, realmScenes:any){
        if(realmScenes.code === 200){
            let version = realmScenes.data.ProfileVersion
            if(version > 0){
                let metadata = realmScenes.data.Metadata
                let count = 0
                let hasSceneFile = false
                for (const key in metadata) {
                    if (metadata.hasOwnProperty(key)) {
                        count++
                        if(key === world + '-' + this.realmFileKey){
                            hasSceneFile = true
                        }
                    }
                }

                if(count > 0){
                    if(hasSceneFile){
                        let res = await fetch(metadata[world + '-' + this.realmFileKey].DownloadUrl)
                        let json = await res.json()
                        return json
                    }else{
                        return []
                    }
                }else{
                    return []
                }
                
            }else{
                return []
            }
        }
    }

    // createLobbyScene(room:IWBRoom, world:any){
    //     let lobby:Scene = new Scene({
    //         room:room,
    //         w: world.ens,
    //         id: "" + generateId(5),
    //         n: "Realm Lobby",
    //         d: "Realm Lobby Scene",
    //         o: world.owner,
    //         ona: world.worldName,
    //         cat:"",
    //         bps:[],
    //         bpcl: "0,0",
    //         cd: Math.floor(Date.now()/1000),
    //         upd: Math.floor(Date.now()/1000),
    //         si: 0,
    //         toc:0,
    //         pc: 0,
    //         pcnt: 4,
    //         isdl: false,
    //         e:true,
    //         pcls:["0,0", "1,0", "1,1", "0,1"],
    //         sp:["16,16"],
    //         ass:[]
    //       })

    //     return lobby
    // }

    async backupFiles(pendingWorld:any){
        let {world, token, realmId, type, filenames, data} = pendingWorld

        try{
            console.log('backing up world', world)
            let initres = await initializeUploadPlayerFiles(token,{
                Entity: {Id: realmId, Type: type},
                FileNames:filenames
            })

            // console.log('initres is', initres)//

            for(let i = 0; i < filenames.length; i++){
                let uploadres = await uploadPlayerFiles(initres.UploadDetails[i].UploadUrl, JSON.stringify(data[i]))
            }

            //let uploadres = await uploadPlayerFiles(initres.UploadDetails[0].UploadUrl, JSON.stringify(data))
    
            let finalres = await finalizeUploadFiles(token,
                {
                Entity: {Id: realmId, Type: type},
                FileNames:filenames,
                ProfileVersion:initres.ProfileVersion,
            })
            await this.removeWorldPendingSave(world)
            this.checkPendingSaveQueue(world)
        }
        catch(e:any){
            console.log('backup file error', e.message)
            this.abortSaveSceneUploads(world, filenames, token, type, realmId)
        }
    }

    // async backupFiles(world:string, filenames:string[], token:string, type:string, realmId:string, data:any[]){
    //     try{
    //         this.addWorldPendingSave(world)

    //         let initres = await initializeUploadPlayerFiles(token,{
    //             Entity: {Id: realmId, Type: type},
    //             FileNames:filenames
    //         })

    //         // console.log('initres is', initres)

    //         for(let i = 0; i < filenames.length; i++){
    //             let uploadres = await uploadPlayerFiles(initres.UploadDetails[i].UploadUrl, JSON.stringify(data[i]))
    //         }

    //         //let uploadres = await uploadPlayerFiles(initres.UploadDetails[0].UploadUrl, JSON.stringify(data))
    
    //         let finalres = await finalizeUploadFiles(token,
    //             {
    //             Entity: {Id: realmId, Type: type},
    //             FileNames:filenames,
    //             ProfileVersion:initres.ProfileVersion,
    //         })
    //         this.removeWorldPendingSave(world)
    //     }
    //     catch(e:any){
    //         console.log('backup file error', e.message)
    //         this.abortSaveSceneUploads(world, filenames, token, type, realmId)
    //     }
    // }

    // async backupScene(world:string, token:string, type:string, realmId:string, scenes:any[]){
    //     try{
    //         this.addWorldPendingSave(world)

    //         // console.log('scenes to back up are', scenes)

    //         let initres = await initializeUploadPlayerFiles(token,{
    //             Entity: {Id: realmId, Type: type},
    //             FileNames:[world + "-" + this.realmFileKey]
    //         })
            
    //         console.log(initres)
    
    //         let uploadres = await uploadPlayerFiles(initres.UploadDetails[0].UploadUrl, JSON.stringify(scenes))
    
    //         let finalres = await finalizeUploadFiles(token,
    //             {
    //             Entity: {Id: realmId, Type: type},
    //             FileNames:[world + "-"  + this.realmFileKey],
    //             ProfileVersion:initres.ProfileVersion,
    //         })
    //         this.removeWorldPendingSave(world)
    //     }
    //     catch(e){
    //         console.log('error backing up realm scenes', world, e)
    //         this.abortSaveSceneUploads(world, [world + "-" + this.realmFileKey], token, type, realmId)
    //     }
    // }

    async abortSaveSceneUploads(world:string, filenames:string[], token:string, type:string, realmId:string){
        await abortFileUploads(token,{
            Entity: {Id: realmId, Type: type},
            FileNames:filenames
          })
          this.checkPendingSaveQueue(world)
    }

    async updateRealmPendingAssets(owner:any, world:string){
        console.log("updating realm assets for world", world)
        // let found = false
        // // let assets:any[] = []
        // if(this.rooms.length > 0){
        //     let room:IWBRoom = this.rooms.find(($:any)=> $.state.world === world)
        //     if(room){
        //         room.state.realmAssets.forEach((asset,key)=>{
        //             asset.pending = false
        //             // assets.push(asset)
        //         })
        //     }
        // }

        // if(found){
        //     await itemManager.uploadFile(owner, "catalogs.json", [...assets])
        //     console.log('finished updating realm assets')
        // }else{
        //     console.log('player not on, need to log in first and get catalog before saving')
        //     let metadata = await fetchPlayfabMetadata(owner)
        //     let catalog = await fetchPlayfabFile(metadata, "catalogs.json")
        //     catalog.forEach((asset:any)=>{
        //         asset.pending = false
        //     })
        //     await itemManager.uploadFile(owner, "catalogs.json", [...catalog])
        // }
    }

    async sceneReady(body:any){
        let player:Player
        // console.log('iwb rooms are ', iwbManager.rooms)

        iwbManager.rooms.forEach((room:IWBRoom)=>{
            if(room.state.players.has(body.user)){
                player = room.state.players.get(body.user)
            }
        })

        // let room:IWBRoom = iwbManager.rooms.find((w:any)=> w.state.world === (body.dest === "dclname" ? body.dta.currentWorld : body.data.worldName + ".dcl.eth"))
        // if(room && room.state.players.get(body.user)){
        //     player = room.state.players.get(body.user)
        // }

        // player = room.state.players.get(body.user)

        if(!player){
            console.log('user not online anymore, delete deployment and free up bucket')
        }else{
            console.log('found user, notify them of their deployment', body)
            player.pendingDeployment = body.data.auth

            // let link = (DEBUG ? "http://localhost:3000/" : "https://dcl-iwb.co/") + "toolset/" + body.user + "/" + body.data.dest + "/"
            // if(body.data.dest === "gc"){
            //     link += body.data.tokenId === "" ? ("parcel/" + body.bucket + "/" + body.data.name +"/" + body.data.parcel.split(",")[0] +  "/" + body.data.parcel.split(",")[1]) : ("estate/" +  body.bucket + "/" + body.data.tokenId + "/") 
            // }else{
            //     link += body.bucket + "/" + body.data.name +"/" + body.data.worldName
            // }
            

            let link = (DEBUG ? "http://localhost:3000/" : "https://dcl-iwb.co/") + "toolset/qa/" + body.user + "/" + body.data.dest + "/"
            if(body.data.dest === "gc"){
                link += body.data.tokenId === "" ? ("parcel/" + body.bucket + "/" + body.data.name +"/x/y") : ("estate/" +  body.bucket + "/" + body.data.tokenId + "/") 
            }else{
                link += body.bucket + "/" + body.data.name +"/" + body.data.worldName
            }

            link += "/" + body.auth

            console.log('link is', link)
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

    isOwner(user:string, world:string){
        return this.worlds.find((w)=> w.ens === world && w.owner === user)
    }

    // async deleteUGCAsset(id:string, type){
    //     try{
    //         fs.unlinkSync(pathToFile);
    //         console.log('File deleted successfully');
    //     }
    //     catch(e){
    //         console.log('error deleting ugc asset from world', id)
    //     }
    // }

    async deleteWorldAssets(room:IWBRoom, client:Client, info:any){
        let player = room.state.players.get(client.userData.userId)
        if(player && (player.inHomeWorld(room.state.world) || hasWorldPermissions(room, player.address))){
            if(info){
                info.forEach(async (id:any, i:number)=>{
                    let asset = room.state.realmAssets.get(id)
                    if(asset){
                        room.state.realmAssets.delete(id)
                        room.state.realmAssetsChanged = true
                        room.broadcast(SERVER_MESSAGE_TYPES.DELETE_WORLD_ASSETS, id)

                        if(asset.ugc){
                            await this.deleteUGCAsset(player, asset, room)
                        }
                    }

                    let ownerWorldsOnline:IWBRoom[] = iwbManager.rooms.filter(($:any)=> $.owner === player.address && $.state.world !== room.state.world)
                    ownerWorldsOnline.forEach((room:IWBRoom)=>{
                        room.state.realmAssets.delete(id)
                        room.broadcast(SERVER_MESSAGE_TYPES.DELETE_WORLD_ASSETS, id)
                    })
                })
            }
        }else{
            console.log('player not in home world, spamming?')
        }
    }

    async deleteUGCAsset(player:Player, ugcAsset:any, room:IWBRoom){
        // console.log('ugc asset to delete is', ugcAsset)
        // let realmAssets:any[] = itemManager.getUserCatalog(room)

        // let path = "" + player.address + "/" + ugcAsset.id
        // switch(ugcAsset.ty){
        //     case '3D':
        //         path += ".glb"
        //         break;

        //     case 'Audio':
        //         path += ".mp3"
        //         break;
                
        // }

        try{
            let response = await axios.get((DEBUG ? "http://localhost:3525" : "https://deployment.dcl-iwb.co") + 
            "/ugc/delete/" + 
            player.address + 
            "/" + 
            ugcAsset.id + 
            "/" + 
            ugcAsset.ty + 
            "/" +
             process.env.DEPLOYMENT_AUTH)

            if(response.data && response.data.valid){
                console.log('sucessfully deleted ugc asset on server')
            }else{
                console.log('failed to remove asset on ugc server', ugcAsset.id, player.address)
            }

            // let realmAssets:any[] = itemManager.getUserCatalog(room)
            // iwbManager.addWorldPendingBackup(room.state.world, room.roomId, ["catalogs.json"], room.state.realmToken, room.state.realmTokenType, room.state.realmId, [realmAssets])

            // player.sendPlayerMessage(SERVER_MESSAGE_TYPES.DELETE_UGC_ASSET, {id:ugcAsset.id})
        }
        catch(e){
            console.log('error in deleting ugc asset from server', ugcAsset.id, e)
        }
    }

    async garbageCollectRoom(room:IWBRoom){
        // destroyCustomObjects(this)
        garbageCollectRealmGames(room)
        garbageCollectPlaylist(room)
    }
}