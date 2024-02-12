import { Player } from "../../Objects/Player"
import { itemManager, iwbManager } from "../../app.config"
import { SCENE_MODES, SERVER_MESSAGE_TYPES } from "../../utils/types"
import { IWBRoom } from "../IWBRoom"
import { Scene, SceneItem } from "../../Objects/Scene";
import { DEBUG } from "../../utils/config";
import { generateId } from "colyseus";

let deploymentServer:any = DEBUG ? process.env.DEPLOYMENT_SERVER_DEV : process.env.DEPLOYMENT_SERVER_PROD

export class RoomSceneHandler {
    room:IWBRoom

    constructor(room:IWBRoom) {
        this.room = room

        room.onMessage(SERVER_MESSAGE_TYPES.SCENE_DOWNLOAD, async(client, info)=>{
            console.log(SERVER_MESSAGE_TYPES.SCENE_DOWNLOAD + " message", info)
    
            let player:Player = room.state.players.get(client.userData.userId)
            if(player){//} && (player.mode === SCENE_MODES.BUILD_MODE)){
                let scene = this.room.state.scenes.get(info.sceneId)
                if(scene){
                    for(let i = 0; i < scene.ass.length; i++){
                        let asset = scene.ass[i]
                        if(asset.type === "2D"){
                            let itemConfig = itemManager.items.get(asset.id)
                            asset.n = itemConfig.n
                        }   
                    }

                    try{
                        let res = await fetch(deploymentServer + "scene/download", {
                            method:"POST",
                            headers:{"Content-type": "application/json"},
                            body: JSON.stringify({scene:scene})
                        })
                        console.log('deployment ping', await res.json())
                    }
                    catch(e){
                        console.log('error pinging download server for zip file', player.address, e)
                        player.sendPlayerMessage(SERVER_MESSAGE_TYPES.PLAYER_RECEIVED_MESSAGE, "There was an error initiating your download. Please try again.")
                    }
                }
            }
        })

        room.onMessage(SERVER_MESSAGE_TYPES.FORCE_DEPLOYMENT, async(client, info)=>{
            console.log(SERVER_MESSAGE_TYPES.FORCE_DEPLOYMENT + " message", info)
    
            let player:Player = room.state.players.get(client.userData.userId)
            if(player){
                let world = iwbManager.worlds.find((w)=> w.ens === this.room.state.world)
                if(world && world.owner === client.userData.userId){
                    iwbManager.deployWorld(world, false)
                }
            }
        })

        room.onMessage(SERVER_MESSAGE_TYPES.SELECT_PARCEL, async(client, info)=>{
            console.log(SERVER_MESSAGE_TYPES.SELECT_PARCEL + " message", info)
    
            let player:Player = room.state.players.get(client.userData.userId)
            if(player && (player.mode === SCENE_MODES.CREATE_SCENE_MODE || info.current)){

                if(info.current !== 0){
                    let scene = this.room.state.scenes.get(info.current)
                    if(scene){
                        if(this.isOccupied(info.parcel)){
                            this.removeParcel(scene, info.parcel)
                        }else{
                            scene.pcls.push(info.parcel)
                        }
                    }

                }else{
                    if(!this.isOccupied(info.parcel)){
                        if(info.current){}
                        if(this.hasTemporaryParcel(info.parcel)){
                            console.log('player has temporary parcel', info.parcel)
                            this.removeTemporaryParcel(info.parcel)
                            }else{
                            if(!this.hasTemporaryParcel(info.parcel)){
                                console.log('scene doesnt have temp parcel')
                                this.addTempParcel(info.parcel) 
                            }
                        }
                    }
                }
            }
        })   
    
        room.onMessage(SERVER_MESSAGE_TYPES.SCENE_SAVE_NEW, async(client, info)=>{
            console.log(SERVER_MESSAGE_TYPES.SCENE_SAVE_NEW + " message", info)
    
            let player:Player = room.state.players.get(client.userData.userId)

            if(player && player.mode === SCENE_MODES.CREATE_SCENE_MODE){
                if(this.room.state.temporaryParcels.length > 0){
                    let scene:Scene = this.createScene(player, this.room.state.world, info, [...this.room.state.temporaryParcels])
                    this.room.state.scenes.set(scene.id, scene)

                    this.room.state.temporaryParcels.forEach((parcel)=>{
                       this.room.state.occupiedParcels.push(parcel)
                    })
                    this.freeTemporaryParcels()

                    let world = iwbManager.worlds.find((w)=>w.ens === this.room.state.world)
                    if(world){
                        world.builds += 1
                        world.updated = Math.floor(Date.now()/1000)
                    }

                    player.updatePlayMode(SCENE_MODES.BUILD_MODE)
                    client.send(SERVER_MESSAGE_TYPES.PLAY_MODE_CHANGED, {mode:player.mode})
                }
            }else{
                console.log('player is not in create scene mode')
            }
        })

        room.onMessage(SERVER_MESSAGE_TYPES.SCENE_ADD_BP, async(client, info)=>{
            console.log(SERVER_MESSAGE_TYPES.SCENE_ADD_BP + " message", info)
    
            let player:Player = room.state.players.get(client.userData.userId)
            if(player){
                let scene = this.room.state.scenes.get(info.sceneId)
                if(scene){
                    if(!scene.bps.includes(info.user)){
                        scene.bps.push(info.user)
                        client.send(SERVER_MESSAGE_TYPES.SCENE_ADD_BP, info)
                        let otherPlayer = this.room.state.players.get(info.user)
                        if(otherPlayer){
                            otherPlayer.sendPlayerMessage(SERVER_MESSAGE_TYPES.SCENE_ADD_BP, info)
                        }
                    }
                }
            }
        })

        room.onMessage(SERVER_MESSAGE_TYPES.SCENE_DELETE_BP, async(client, info)=>{
            console.log(SERVER_MESSAGE_TYPES.SCENE_DELETE_BP + " message", info)
    
            let player:Player = room.state.players.get(client.userData.userId)
            if(player){
                let scene = this.room.state.scenes.get(info.sceneId)
                if(scene){
                    if(scene.bps.includes(info.user)){
                        let userIndex = scene.bps.findIndex((us)=> us === info.user)
                        if(userIndex >= 0){
                            scene.bps.splice(userIndex, 1)
                            client.send(SERVER_MESSAGE_TYPES.SCENE_DELETE_BP, info)
                            let otherPlayer = this.room.state.players.get(info.user)
                            if(otherPlayer){
                                otherPlayer.sendPlayerMessage(SERVER_MESSAGE_TYPES.SCENE_DELETE_BP, info)
                            }
                        }
                    }
                }
            }
        })

        room.onMessage(SERVER_MESSAGE_TYPES.SCENE_DELETE, async(client, info)=>{
            console.log(SERVER_MESSAGE_TYPES.SCENE_DELETE + " message", info)
    
            let player:Player = room.state.players.get(client.userData.userId)
            if(player){
                let scene = this.room.state.scenes.get(info.sceneId)
                if(scene){
                    if(scene.o === client.userData.userId){
                        let worldConfig = iwbManager.worlds.find((w)=> w.ens === this.room.state.world)
                        if(worldConfig){
                            worldConfig.builds -= 1
                            worldConfig.updated = Math.floor(Date.now()/1000)
                        }
                        this.room.state.scenes.delete(info.sceneId)
                        scene.bps.forEach((user)=>{
                            let player:Player = room.state.players.get(user) 
                            if(player){
                                player.sendPlayerMessage(SERVER_MESSAGE_TYPES.SCENE_DELETE, info)
                            }
                        })
                    }
                }
            }
        })

        room.onMessage(SERVER_MESSAGE_TYPES.SCENE_CLEAR_ASSETS, async(client, info)=>{
            console.log(SERVER_MESSAGE_TYPES.SCENE_CLEAR_ASSETS + " message", info)
            let player:Player = room.state.players.get(client.userData.userId)
            if(player){
                let scene = this.room.state.scenes.get(info.sceneId)
                if(scene){
                    if(scene.o === client.userData.userId){
                        let worldConfig = iwbManager.worlds.find((w)=> w.ens === this.room.state.world)
                        if(worldConfig){
                            worldConfig.builds -= 1
                            worldConfig.updated = Math.floor(Date.now()/1000)
                        }
                        scene.ass.clear()
                        player.sendPlayerMessage(SERVER_MESSAGE_TYPES.PLAYER_RECEIVED_MESSAGE, "Your scene assets were removed!")
                    }
                }
            }
        })

        room.onMessage(SERVER_MESSAGE_TYPES.SCENE_SAVE_EDITS, async(client, info)=>{
            console.log(SERVER_MESSAGE_TYPES.SCENE_SAVE_EDITS + " message", info)
    
            let player:Player = room.state.players.get(client.userData.userId)
            if(player){
                let scene:Scene = this.room.state.scenes.get(info.sceneId)
                if(scene){
                    if(scene.o === client.userData.userId){

                        scene.n = info.name
                        scene.d = info.desc
                        scene.e = info.enabled
                        scene.priv = info.priv

                        let worldConfig = iwbManager.worlds.find((w)=> w.ens === this.room.state.world)
                        if(worldConfig){
                            worldConfig.updated = Math.floor(Date.now()/1000)
                        }
                        
                        room.broadcast(SERVER_MESSAGE_TYPES.SCENE_SAVE_EDITS, info)
                    }
                }
            }
        })

        room.onMessage(SERVER_MESSAGE_TYPES.SCENE_DEPLOY, async(client, info)=>{
            console.log(SERVER_MESSAGE_TYPES.SCENE_DEPLOY + " message", info)
            let player:Player = room.state.players.get(client.userData.userId)
            if(player){
                let scene:Scene = this.room.state.scenes.get(info.sceneId)
                if(scene && scene.o === player.address){
                    console.log('owner is requesting deployment')

                    try{
                        let res = await fetch(deploymentServer + "scene/deploy", {
                            method:"POST",
                            headers:{"Content-type": "application/json"},
                            body: JSON.stringify({
                                scene:scene,
                                dest:info.dest,
                                name: info.name,
                                worldName:info.worldName,
                                user: scene.o,
                                parcel: info.parcel,
                                tokenId: info.tokenId,
                                target: 'interconnected.online'
                            })
                        })
                        let json = await res.json()
                        player.sendPlayerMessage(SERVER_MESSAGE_TYPES.SCENE_DEPLOY, {valid:json.valid, msg:json.valid ? "Your deployment is pending!...Please wait for a link to sign the deployment. This could take a couple minutes." : "Error with your deployment request. Please try again."})
                    }
                    catch(e){
                        console.log('error pinging deploy server', player.address, e)
                        player.sendPlayerMessage(SERVER_MESSAGE_TYPES.SCENE_DEPLOY, {valid:false, msg:"Error pinging the deploy server"})
                    }
                }else{
                    console.log('someone else requesting deployment access')
                }
            }
        })

        room.onMessage(SERVER_MESSAGE_TYPES.SCENE_ADDED_SPAWN, async(client, info)=>{
            console.log(SERVER_MESSAGE_TYPES.SCENE_ADDED_SPAWN + " message", info)
            let player:Player = room.state.players.get(client.userData.userId)
            let scene: Scene = room.state.scenes.get(info.sceneId)
            if(player && scene && scene.o === player.address){
                scene.sp.push("" + info.sp.x.toFixed(0) + "," + info.sp.y.toFixed(0) + "," + info.sp.z.toFixed(0))
                scene.cp.push("" + info.cp.x.toFixed(0) + "," + info.cp.y.toFixed(0) + "," + info.cp.z.toFixed(0))
            }
        })

        room.onMessage(SERVER_MESSAGE_TYPES.SCENE_DELETE_SPAWN, async(client, info)=>{
            console.log(SERVER_MESSAGE_TYPES.SCENE_DELETE_SPAWN + " message", info)
            let player:Player = room.state.players.get(client.userData.userId)
            let scene: Scene = room.state.scenes.get(info.sceneId)
            if(player && scene && scene.o === player.address){
                scene.sp.splice(info.index, 1)
                scene.cp.splice(info.index, 1)
            }
        })
    }

    removeParcel(scene:Scene, parcel: any) {
        let parcelIndex = scene.pcls.findIndex((p) => p === parcel)
        if (parcelIndex >= 0) {
            //to do
            //remove parcel asssets
            scene.pcls.splice(parcelIndex, 1)
        }   
    }

    freeTemporaryParcels() {
        this.room.state.temporaryParcels.clear()
    }

    removeTemporaryParcel(parcel: any) {
        let index = this.room.state.temporaryParcels.findIndex((p) => p === parcel)
        if (index >= 0) {
            this.room.state.temporaryParcels.splice(index, 1)
        }
    }

    addTempParcel(parcel: any) {
        this.room.state.temporaryParcels.push(parcel)
    }

    isOccupied(parcel: any){
        let parcels:string[] = []
        this.room.state.scenes.forEach((scene, key)=>{
            scene.pcls.forEach((parcel)=>{
                parcels.push(parcel)
            })
        })
        return parcels
            .find((p) => p === parcel)
    }

    hasTemporaryParcel(parcel: any) {
        return [...this.room.state.temporaryParcels]
            .find((p) => p === parcel) || this.isOccupied(parcel)
    }

    checkAssetsForEditByPlayer(user:string){
        this.room.state.scenes.forEach((scene, key)=>{
            scene.ass.forEach((asset, assetKey)=>{
                if(asset.editing && asset.editor === user){
                    asset.editing = false
                    asset.editor = ""
                }
            })
        })
    }

    createScene(player:Player, world:string, info:any, parcels:string[]){
        let sceneData:any = {
          w: world,
          id: "" + generateId(5),
          im: info.image ? info.image : "",
          n: info.name,
          d: info.desc,
          o: player.dclData.userId,
          ona: player.dclData.displayName,
          cat:"",
          bps:[],
          bpcl: parcels[0],
          cd: Math.floor(Date.now()/1000),
          upd: Math.floor(Date.now()/1000),
          si: 0,
          toc:0,
          pc: 0,
          pcnt: parcels.length,
          isdl: false,
          e:info.enabled,
          pcls:parcels,
          sp:["0,0,0"],
          cp:["0,0,0"],
          priv:info.private
        }
    
        // console.log('creating new scene with data', sceneData)
        let scene = new Scene(sceneData)
        return scene
      }
}

