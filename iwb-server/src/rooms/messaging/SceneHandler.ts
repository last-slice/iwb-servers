import { Player } from "../../Objects/Player";
import { itemManager, iwbManager } from "../../app.config";
import { pushPlayfabEvent } from "../../utils/Playfab";
import { SERVER_MESSAGE_TYPES, SCENE_MODES } from "../../utils/types";
import { IWBRoom } from "../IWBRoom";
import { DEBUG } from "../../utils/config";
import { Scene } from "../../Objects/Scene";
import { generateId } from "colyseus";

let deploymentServer:any = DEBUG ? process.env.DEPLOYMENT_SERVER_DEV : process.env.DEPLOYMENT_SERVER_PROD

export function iwbSceneHandler(room:IWBRoom){
    room.onMessage(SERVER_MESSAGE_TYPES.SCENE_DOWNLOAD, async(client, info)=>{
        // (SERVER_MESSAGE_TYPES.SCENE_DOWNLOAD + " message", info)

        let player:Player = room.state.players.get(client.userData.userId)
        if(player){//} && (player.mode === SCENE_MODES.BUILD_MODE)){
            let scene = room.state.scenes.get(info.sceneId)
            if(scene){

                scene.parenting.forEach((assetItem:any, index:number)=>{
                    // let iwbAsset = scene.catalogInfo.get(assetItem.aid)
                    // let itemConfig = itemManager.items.get(assetItem.aid)
                    // if(itemConfig && itemConfig.n){
                    //     iwbAsset.n = itemConfig.n
                    // }
                })

                try{
                    let res = await fetch(deploymentServer + "scene/download", {
                        method:"POST",
                        headers:{"Content-type": "application/json"},
                        body: JSON.stringify({scene:scene})
                    })
                   //  console.log('deployment ping', await res.json())

                   pushPlayfabEvent(
                    SERVER_MESSAGE_TYPES.SCENE_DOWNLOAD, 
                    player, 
                    [{scene:scene.n}]
                    )
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
            let world = iwbManager.worlds.find((w)=> w.ens === room.state.world)
            if(world && world.owner === client.userData.userId){
                iwbManager.deployWorld(world, room)
            }
        }
    })

    room.onMessage(SERVER_MESSAGE_TYPES.SELECT_PARCEL, async(client, info)=>{
        // console.log(SERVER_MESSAGE_TYPES.SELECT_PARCEL + " message", info)
        let player:Player = room.state.players.get(client.userData.userId)
        if(player && (player.mode === SCENE_MODES.CREATE_SCENE_MODE || info.current)){

            if(info.current !== 0){
                let scene = room.state.scenes.get(info.current)
                if(scene){
                    if(isOccupied(room, info.parcel)){
                        removeParcel(scene, info.parcel)
                    }else{
                        scene.pcls.push(info.parcel)
                    }
                }

            }else{
                if(!isOccupied(room, info.parcel)){
                    if(info.current){}
                    if(hasTemporaryParcel(room, info.parcel)){
                        removeTemporaryParcel(room, info.parcel)
                        }else{
                        if(!hasTemporaryParcel(room, info.parcel)){
                            addTempParcel(room, info.parcel) 
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
            if(room.state.temporaryParcels.length > 0){
                let scene:Scene = createScene(player, room, info, [...room.state.temporaryParcels])
                room.state.scenes.set(scene.id, scene)
                room.state.sceneCount += 1

                room.state.temporaryParcels.forEach((parcel)=>{
                   room.state.occupiedParcels.push(parcel)
                })
                freeTemporaryParcels(room)

                let world = iwbManager.worlds.find((w)=>w.ens === room.state.world)
                if(world){
                    world.builds += 1
                    world.updated = Math.floor(Date.now()/1000)
                }

                player.updatePlayMode(SCENE_MODES.BUILD_MODE)
                client.send(SERVER_MESSAGE_TYPES.PLAY_MODE_CHANGED, {mode:player.mode})
                room.broadcast(SERVER_MESSAGE_TYPES.SCENE_ADDED_NEW, {name:player.name, sceneName:scene.n})

                pushPlayfabEvent(
                    SERVER_MESSAGE_TYPES.SCENE_ADDED_NEW, 
                    player, 
                    [{scene: scene.n, world:world.ens}]
                )
            }
        }else{
          //   console.log('player is not in create scene mode')
        }
    })

    room.onMessage(SERVER_MESSAGE_TYPES.WORLD_ADD_BP, async(client, info)=>{
        // console.log(SERVER_MESSAGE_TYPES.WORLD_ADD_BP + " message", info)

        let player:Player = room.state.players.get(client.userData.userId)
        if(player){
            let world = iwbManager.worlds.find(($=> $.ens === room.state.world))
            if(world && world.owner === player.address){
                world.bps.push(info.user)

                client.send(SERVER_MESSAGE_TYPES.WORLD_ADD_BP, info)
                let otherPlayer = room.state.players.get(info.user)
                if(otherPlayer){
                    otherPlayer.sendPlayerMessage(SERVER_MESSAGE_TYPES.WORLD_ADD_BP, info)
                }

                iwbManager.worldsModified = true

                pushPlayfabEvent(
                    SERVER_MESSAGE_TYPES.WORLD_ADD_BP, 
                    player, 
                    [{world:room.state.world, permissions: info.user, owner:client.userData.userId}]
                )
            }
        }
    })

    room.onMessage(SERVER_MESSAGE_TYPES.WORLD_DELETE_BP, async(client, info)=>{
         let player:Player = room.state.players.get(client.userData.userId)
         if(player){
            let world = iwbManager.worlds.find(($=> $.ens === room.state.world))
            if(world && world.bps.includes(info.user)){
                let userIndex = world.bps.findIndex(($:any)=> $ === info.user)
                if(userIndex >= 0){
                    world.bps.splice(userIndex, 1)
                    client.send(SERVER_MESSAGE_TYPES.WORLD_DELETE_BP, info)
                    let otherPlayer = room.state.players.get(info.user)
                    if(otherPlayer){
                        otherPlayer.sendPlayerMessage(SERVER_MESSAGE_TYPES.WORLD_DELETE_BP, info)
                    }

                    iwbManager.worldsModified = true

                    pushPlayfabEvent(
                       SERVER_MESSAGE_TYPES.WORLD_DELETE_BP, 
                       player, 
                       [{world:room.state.world, permissions: info.newBuilder, owner:client.userData.userId}]
                   )
                }
            }
         }
     })

    room.onMessage(SERVER_MESSAGE_TYPES.SCENE_ADD_BP, async(client, info)=>{
        // console.log(SERVER_MESSAGE_TYPES.SCENE_ADD_BP + " message", info)

        let player:Player = room.state.players.get(client.userData.userId)
        if(player){
            let scene = room.state.scenes.get(info.sceneId)
            if(scene){
                if(!scene.bps.includes(info.user)){
                    scene.bps.push(info.user)
                    info.sceneName = scene.n
                    
                    client.send(SERVER_MESSAGE_TYPES.SCENE_ADD_BP, info)
                    let otherPlayer = room.state.players.get(info.user)
                    if(otherPlayer){
                        otherPlayer.sendPlayerMessage(SERVER_MESSAGE_TYPES.SCENE_ADD_BP, info)
                    }
                    pushPlayfabEvent(
                        SERVER_MESSAGE_TYPES.SCENE_ADD_BP, 
                        player, 
                        [{scene: scene.n, world:scene.w, permissions: info.user, owner:client.userData.userId}]
                    )
                }
            }
        }
    })

    room.onMessage(SERVER_MESSAGE_TYPES.SCENE_DELETE_BP, async(client, info)=>{
       //  console.log(SERVER_MESSAGE_TYPES.SCENE_DELETE_BP + " message", info)

        let player:Player = room.state.players.get(client.userData.userId)
        if(player){
            let scene = room.state.scenes.get(info.sceneId)
            if(scene){
                if(scene.bps.includes(info.user)){
                    let userIndex = scene.bps.findIndex((us)=> us === info.user)
                    if(userIndex >= 0){
                        scene.bps.splice(userIndex, 1)
                        client.send(SERVER_MESSAGE_TYPES.SCENE_DELETE_BP, info)
                        let otherPlayer = room.state.players.get(info.user)
                        if(otherPlayer){
                            otherPlayer.sendPlayerMessage(SERVER_MESSAGE_TYPES.SCENE_DELETE_BP, info)
                        }
                        pushPlayfabEvent(
                            SERVER_MESSAGE_TYPES.SCENE_DELETE_BP, 
                            player, 
                            [{scene: scene.n, world:scene.w, permissions: info.user, owner:client.userData.userId}]
                        )
                    }
                }
            }
        }
    })

    room.onMessage(SERVER_MESSAGE_TYPES.SCENE_DELETE, async(client, info)=>{
        console.log(SERVER_MESSAGE_TYPES.SCENE_DELETE + " message", info)

        let player:Player = room.state.players.get(client.userData.userId)
        if(player){
            let scene = room.state.scenes.get(info.sceneId)
            if(scene){
                if(scene.o === client.userData.userId){
                    let worldConfig = iwbManager.worlds.find((w)=> w.ens === room.state.world)
                    if(worldConfig){
                        worldConfig.builds -= 1
                        worldConfig.updated = Math.floor(Date.now()/1000)
                    }
                    room.state.scenes.delete(info.sceneId)
                    scene.bps.forEach((user)=>{
                        let player:Player = room.state.players.get(user) 
                        if(player){
                            player.sendPlayerMessage(SERVER_MESSAGE_TYPES.SCENE_DELETE, info)
                        }
                    })
                    room.state.sceneCount -= 1

                    pushPlayfabEvent(
                        SERVER_MESSAGE_TYPES.SCENE_DELETE, 
                        player, 
                        [{scene: scene.n, world:scene.w}]
                    )
                }
            }
        }
    })

    room.onMessage(SERVER_MESSAGE_TYPES.SCENE_CLEAR_ASSETS, async(client, info)=>{
        // console.log(SERVER_MESSAGE_TYPES.SCENE_CLEAR_ASSETS + " message", info)
        let player:Player = room.state.players.get(client.userData.userId)
        if(player){
            let scene = room.state.scenes.get(info.sceneId)
            if(scene){
                if(scene.o === client.userData.userId){
                    // let worldConfig = iwbManager.worlds.find((w)=> w.ens === this.room.state.world)
                    // if(worldConfig){
                    //     worldConfig.builds -= 1
                    //     worldConfig.updated = Math.floor(Date.now()/1000)
                    // }
                    clearSceneAssets(scene)

                    scene.si = 0
                    scene.pc = 0

                    pushPlayfabEvent(
                        SERVER_MESSAGE_TYPES.SCENE_CLEAR_ASSETS, 
                        player, 
                        [{scene: scene.n, world:scene.w}]
                    )

                    player.sendPlayerMessage(SERVER_MESSAGE_TYPES.PLAYER_RECEIVED_MESSAGE, "Your scene assets were removed!")
                }
            }
        }
    })

    room.onMessage(SERVER_MESSAGE_TYPES.SCENE_SAVE_EDITS, async(client, info)=>{
       // console.log(SERVER_MESSAGE_TYPES.SCENE_SAVE_EDITS + " message", info)

        let player:Player = room.state.players.get(client.userData.userId)
        if(player){
            let scene:Scene = room.state.scenes.get(info.sceneId)
            if(scene){
                if(scene.o === client.userData.userId){

                    scene.n = info.name
                    scene.d = info.desc

                    let enabledView = false
                    scene.e !== info.enabled ? enabledView = true : null
                    scene.e = info.enabled

                    let privateView = false
                    scene.priv !== info.priv ? privateView = true : null
                    scene.priv = info.priv

                    let limits = false
                    scene.lim !== info.lim ? limits = true : null
                    scene.lim = info.lim

                    let worldConfig = iwbManager.worlds.find((w)=> w.ens === room.state.world)
                    if(worldConfig){
                        worldConfig.updated = Math.floor(Date.now()/1000)
                    }
                    
                    room.broadcast(SERVER_MESSAGE_TYPES.SCENE_SAVE_EDITS, {sceneId:info.sceneId, enabledChanged:enabledView, privateChanged:privateView})
                }
            }
        }
    })

    room.onMessage(SERVER_MESSAGE_TYPES.SCENE_DEPLOY, async(client, info)=>{
        console.log(SERVER_MESSAGE_TYPES.SCENE_DEPLOY + " message", info)
        let player:Player = room.state.players.get(client.userData.userId)
        if(player){
            let scene:Scene = room.state.scenes.get(info.sceneId)
            if(scene && scene.o === player.address){
              //   console.log('owner is requesting deployment')

                try{
                    let res = await fetch(deploymentServer + "scene/deploy", {
                        method:"POST",
                        headers:{
                            "Content-type": "application/json",
                            "Auth": "" + process.env.IWB_DEPLOYMENT_AUTH
                        },
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
                    console.log('json is', json)
                    player.sendPlayerMessage(SERVER_MESSAGE_TYPES.SCENE_DEPLOY, {valid:json.valid, msg:json.valid ? "Your deployment is pending!...Please wait for a link to sign the deployment. This could take a couple minutes." : "Error with your deployment request. Please try again."})

                    pushPlayfabEvent(
                        SERVER_MESSAGE_TYPES.SCENE_DEPLOY, 
                        player, 
                        [{scene:scene, world: scene.w}]
                    )
                }
                catch(e){
                    console.log('error pinging deploy server', player.address, e)
                    player.sendPlayerMessage(SERVER_MESSAGE_TYPES.SCENE_DEPLOY, {valid:false, msg:"Error pinging the deploy server"})
                }
            }else{
               //  console.log('someone else requesting deployment access')
            }
        }
    })

    room.onMessage(SERVER_MESSAGE_TYPES.SCENE_ADDED_SPAWN, async(client, info)=>{
        // console.log(SERVER_MESSAGE_TYPES.SCENE_ADDED_SPAWN + " message", info)
        let player:Player = room.state.players.get(client.userData.userId)
        let scene: Scene = room.state.scenes.get(info.sceneId)
        if(player && scene && scene.o === player.address){
            scene.sp.push("" + info.sp.x.toFixed(0) + "," + info.sp.y.toFixed(0) + "," + info.sp.z.toFixed(0))
            scene.cp.push("" + info.cp.x.toFixed(0) + "," + info.cp.y.toFixed(0) + "," + info.cp.z.toFixed(0))

            pushPlayfabEvent(
                SERVER_MESSAGE_TYPES.SCENE_ADDED_SPAWN, 
                player, 
                [{scene: scene.n, world:scene.w}]
            )
        }
    })

    room.onMessage(SERVER_MESSAGE_TYPES.SCENE_DELETE_SPAWN, async(client, info)=>{
        // console.log(SERVER_MESSAGE_TYPES.SCENE_DELETE_SPAWN + " message", info)
        let player:Player = room.state.players.get(client.userData.userId)
        let scene: Scene = room.state.scenes.get(info.sceneId)
        if(player && scene && scene.o === player.address){
            scene.sp.splice(info.index, 1)
            scene.cp.splice(info.index, 1)

            pushPlayfabEvent(
                SERVER_MESSAGE_TYPES.SCENE_DELETE_SPAWN, 
                player, 
                [{scene: scene.n, world:scene.w}]
            )
        }
    })

    room.onMessage(SERVER_MESSAGE_TYPES.SUBMIT_FEEDBACK, async(client, info)=>{
        // console.log(SERVER_MESSAGE_TYPES.SUBMIT_FEEDBACK + " message", info)
        let player:Player = room.state.players.get(client.userData.userId)            
        iwbManager.feedback.push(info)

        pushPlayfabEvent(
            SERVER_MESSAGE_TYPES.SUBMIT_FEEDBACK, 
            player, 
            [{feedback:info}]
        )
    })

    room.onMessage(SERVER_MESSAGE_TYPES.WORLD_TRAVEL, async(client, info)=>{
        // console.log(SERVER_MESSAGE_TYPES.WORLD_TRAVEL + " message", info)
        let player:Player = room.state.players.get(client.userData.userId)
        pushPlayfabEvent(
            SERVER_MESSAGE_TYPES.WORLD_TRAVEL, 
            player, 
            [info]
        )
    })

    room.onMessage(SERVER_MESSAGE_TYPES.DELETE_UGC_ASSET, async(client, info)=>{
         console.log(SERVER_MESSAGE_TYPES.DELETE_UGC_ASSET + " message", info)

        let player:Player = room.state.players.get(client.userData.userId)
        if(player && iwbManager.isOwner(player.address, room.state.world)){
            let ugcAsset = room.state.realmAssets.get(info.id)
            if(ugcAsset){
                iwbManager.deleteUGCAsset(player, ugcAsset, room)
            }else{
                console.log('ugc asset does not exist')
            }
        }else{
            console.log('not owner')
        }
    }) 
}

export function removeParcel(scene:Scene, parcel: any) {
    let parcelIndex = scene.pcls.findIndex((p) => p === parcel)
    if (parcelIndex >= 0) {
        //to do
        //remove parcel asssets
        scene.pcls.splice(parcelIndex, 1)
    }   
}

export function freeTemporaryParcels(room:IWBRoom) {
    room.state.temporaryParcels.clear()
}

export function removeTemporaryParcel(room:IWBRoom, parcel: any) {
    let index = room.state.temporaryParcels.findIndex((p) => p === parcel)
    if (index >= 0) {
        room.state.temporaryParcels.splice(index, 1)
    }
}

export function addTempParcel(room:IWBRoom, parcel: any) {
    room.state.temporaryParcels.push(parcel)
}

export function isOccupied(room:IWBRoom, parcel: any){
    let parcels:string[] = []
    room.state.scenes.forEach((scene, key)=>{
        scene.pcls.forEach((parcel)=>{
            parcels.push(parcel)
        })
    })
    return parcels
        .find((p) => p === parcel)
}

export function hasTemporaryParcel(room:IWBRoom, parcel: any) {
    return [...room.state.temporaryParcels]
        .find((p) => p === parcel) || isOccupied(room, parcel)
}

export function checkAssetsForEditByPlayer(room:IWBRoom, user:string){
    room.state.scenes.forEach((scene, key)=>{
        scene.parenting.forEach((assetItem:any, index:number)=>{
            let iwbAsset = scene.itemInfo.get(assetItem.aid)
            iwbAsset.editing = false
            iwbAsset.editor = ""
        })
    })
}

export function createScene(player:Player, room:IWBRoom, info:any, parcels:string[]){
    console.log('creating scene')
    let sceneData:any = {
      w: room.state.world,
      id: "" + generateId(5),
      im: info.image ? info.image : "",
      n: info.name,
      d: info.desc,
      o: player.dclData.userId,
      ona: player.dclData.name,
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
      priv:info.private,
    }

    // console.log('creating new scene with data', sceneData)
    sceneData.room = room
    sceneData.components = {
        Parenting:[
            {"entity":"0", "aid":"0", "children":[]},
            {"entity":"1", "aid":"1", "children":[]},
            {"entity":"2", "aid":"2", "children":[]},
        ]
    }
    let scene = new Scene(sceneData)
    return scene
  }

  function clearSceneAssets(scene:Scene){

  }