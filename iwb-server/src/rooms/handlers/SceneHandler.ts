import {Client} from "@colyseus/core";
import { Player } from "../../Objects/Player"
import {
    CollisionComponent,
    ImageComponent,
    MaterialComponent,
    Quaternion,
    Scene,
    SceneItem,
    Vector3,
    VideoComponent,
    VisibilityComponent
} from "../../Objects/Scene"
import { itemManager, iwbManager } from "../../app.config"
import { COMPONENT_TYPES, SCENE_MODES, SERVER_MESSAGE_TYPES } from "../../utils/types"
import { IWBRoom } from "../IWBRoom"

export class RoomSceneHandler {
    room:IWBRoom

    constructor(room:IWBRoom) {
        this.room = room

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

                if(info.current){
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
                    let scene:Scene = player.createScene(this.room.state.world, info, [...this.room.state.temporaryParcels])
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

        room.onMessage(SERVER_MESSAGE_TYPES.SCENE_DELETE_ITEM, async(client, info)=>{
            console.log(SERVER_MESSAGE_TYPES.SCENE_DELETE_ITEM + " message", info)

            let player:Player = room.state.players.get(client.userData.userId)
            this.deleteSceneItem(player, info)
        })
    
        room.onMessage(SERVER_MESSAGE_TYPES.SCENE_ADD_ITEM, async(client, info)=>{
            console.log(SERVER_MESSAGE_TYPES.SCENE_ADD_ITEM + " message", info)
    
            let player:Player = room.state.players.get(client.userData.userId)
            if(player && player.mode === SCENE_MODES.BUILD_MODE && this.canBuild(client.userData.userId, info.item.sceneId)){
                const {item} = info

                let scene = this.room.state.scenes.get(info.item.sceneId)
                if(scene){
                    if(this.checkSceneLimits(scene, itemManager.items.get(item.id))){
                        const newItem = new SceneItem()
                        newItem.id = item.id
                        newItem.aid = item.aid
                        newItem.p = new Vector3(item.position)
                        newItem.r = new Quaternion(item.rotation)
                        newItem.s = new Vector3(item.scale)
                        newItem.type = itemManager.items.get(item.id).ty

                        this.addItemComponents(newItem, itemManager.items.get(item.id).n, player.selectedAsset && player.selectedAsset !== null && player.selectedAsset.componentData ? player.selectedAsset.componentData : undefined)
   
                        scene.ass.push(newItem)
                        scene.pc += itemManager.items.get(item.id).pc
                        scene.si += itemManager.items.get(item.id).si
                    }else{
                        player.sendPlayerMessage(SERVER_MESSAGE_TYPES.ASSET_OVER_SCENE_LIMIT, {})
                    }
                }

                info.user = client.userData.userId
                room.broadcast(SERVER_MESSAGE_TYPES.SCENE_ADD_ITEM, info)

                player.removeSelectedAsset()
            }
        })

        room.onMessage(SERVER_MESSAGE_TYPES.SCENE_UPDATE_ITEM, async(client, info)=>{
            console.log(SERVER_MESSAGE_TYPES.SCENE_UPDATE_ITEM + " message", info)
    
            let player:Player = room.state.players.get(client.userData.userId)
            if(player && player.mode === SCENE_MODES.BUILD_MODE && this.canBuild(client.userData.userId, info.item.sceneId)){
                const {item} = info

                let scene = this.room.state.scenes.get(info.item.sceneId)
                console.log('scene to edit item in is', scene)
                if(scene){
                    console.log('we have scene for asset edit')
                    let sceneItem = scene.ass.find((as)=> as.aid === info.item.aid)
                    console.log('scene item is ', sceneItem)
                    if(sceneItem){
                        sceneItem.p.x = item.position.x
                        sceneItem.p.y = item.position.y
                        sceneItem.p.z = item.position.z

                        sceneItem.r.x = item.rotation.x
                        sceneItem.r.y = item.rotation.y
                        sceneItem.r.z = item.rotation.z
                    }
                }
            }
        })

        room.onMessage(SERVER_MESSAGE_TYPES.PLAYER_CANCELED_CATALOG_ASSET, async(client, info)=>{
            console.log(SERVER_MESSAGE_TYPES.PLAYER_CANCELED_CATALOG_ASSET + " message", info)
    
            let player:Player = room.state.players.get(client.userData.userId)

            if(player && player.mode === SCENE_MODES.BUILD_MODE){
                player.removeSelectedAsset()
                // this.room.broadcast(SERVER_MESSAGE_TYPES.SELECT_NEW_ASSET, info)
            }else{
                console.log('player is not in create scene mode')
            }
        })

        room.onMessage(SERVER_MESSAGE_TYPES.SELECT_CATALOG_ASSET, async(client, info)=>{
            console.log(SERVER_MESSAGE_TYPES.SELECT_CATALOG_ASSET + " message", info)
    
            let player:Player = room.state.players.get(client.userData.userId)

            if(player && player.mode === SCENE_MODES.BUILD_MODE){
                player.addSelectedAsset(info)
                // this.room.broadcast(SERVER_MESSAGE_TYPES.SELECT_NEW_ASSET, info)
            }else{
                console.log('player is not in create scene mode')
            }
        })

        room.onMessage(SERVER_MESSAGE_TYPES.SELECTED_SCENE_ASSET, async(client, info)=>{
            console.log(SERVER_MESSAGE_TYPES.SELECTED_SCENE_ASSET + " message", info)
    
            let player:Player = room.state.players.get(client.userData.userId)

            if(player && player.mode === SCENE_MODES.BUILD_MODE){
                let data:any = {
                    catalogId: info.catalogId,
                    assetId: info.assetId,
                }
                let scene = this.room.state.scenes.get(info.sceneId)
                if(scene){
                    let sceneAsset = scene.ass.find((asset:any)=> asset.aid === info.assetId)
                    if(sceneAsset){
                        data.componentData = sceneAsset
                    }
                }
                player.addSelectedAsset(data)
                this.deleteSceneItem(player, info)
            }
        })

        room.onMessage(SERVER_MESSAGE_TYPES.PLACE_SELECTED_ASSET, async(client, info)=>{
            console.log(SERVER_MESSAGE_TYPES.PLACE_SELECTED_ASSET + " message", info)
    
            let player:Player = room.state.players.get(client.userData.userId)

            if(player && player.mode === SCENE_MODES.BUILD_MODE){
                this.room.broadcast(SERVER_MESSAGE_TYPES.PLACE_SELECTED_ASSET, info, )
                // player.removeSelectedAsset()
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
    }

    deleteSceneItem(player:Player, info:any){
        if(player && player.mode === SCENE_MODES.BUILD_MODE){
            let scene = this.room.state.scenes.get(info.sceneId)
            if(scene){
                let assetIndex = scene.ass.findIndex((ass)=> ass.aid === info.assetId)
                if(assetIndex >= 0){
                    scene.pc -= itemManager.items.get(scene.ass.find((a)=>a.aid === info.assetId).id).pc
                    scene.ass.splice(assetIndex,1)
                }
            }
        }
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

    canBuild(user:string, sceneId:any){
        console.log('can build world is', this.room.state.world)
        console.log('can build user ens is', iwbManager.worlds.find((w)=>w.owner === user).ens)
    
        let scene:Scene = this.room.state.scenes.get(sceneId)
        if(scene){
            return scene.bps.includes(user) || user === iwbManager.worlds.find((w) => w.ens === this.room.state.world).owner;
        }else{
            return false
        }
    }

    addItemComponents(item:SceneItem, name:string, selectedAsset?:any){
        item.comps.push(COMPONENT_TYPES.TRANSFORM_COMPONENT)

        this.addVisibilityComponent(item, selectedAsset ? selectedAsset.visComp.visible : true)

        switch(item.type){
            case '3D':
                break;

            case '2D':
                switch(name){
                    case 'Image':        
                        console.log('selected ass', selectedAsset)
                        this.addImageComponent(item, selectedAsset ? selectedAsset.imgComp.url : "")                
                        this.addMaterialComponent(item)
                        break;
                    case 'Video':
                        this.addVideoComponent(item, selectedAsset ? selectedAsset.vidComp : null)
                        break;
                }
                break;
        }

        this.addCollisionComponent(item, selectedAsset ? selectedAsset.colComp : null)
    }

    addCollisionComponent(item:SceneItem, collision:any){
        item.comps.push(COMPONENT_TYPES.COLLISION_COMPONENT)
        item.colComp = new CollisionComponent()

        if(collision !== null){
            item.colComp.iMask = collision.iMask
            item.colComp.vMask = collision.vMask
        }
    }

    addVisibilityComponent(item:SceneItem, selectedVisibility:boolean){
        item.comps.push(COMPONENT_TYPES.VISBILITY_COMPONENT)
        item.visComp = new VisibilityComponent()
        item.visComp.visible = selectedVisibility
    }

    addImageComponent(item:SceneItem, url:string){
        item.comps.push(COMPONENT_TYPES.IMAGE_COMPONENT)
        item.imgComp = new ImageComponent()
        item.imgComp.url = url
    }

    addVideoComponent(item:SceneItem, data:any){
        item.comps.push(COMPONENT_TYPES.VIDEO_COMPONENT)
        item.vidComp = new VideoComponent()
        if(data !== null){
            item.vidComp.url = data.url
            item.vidComp.autostart = data.autostart
            item.vidComp.loop = data.loop
            item.vidComp.volume = data.volume
        }
    }

    addMaterialComponent(item:SceneItem){
        item.comps.push(COMPONENT_TYPES.MATERIAL_COMPONENT)
        item.matComp = new MaterialComponent()
        item.matComp.color.push("1")
        item.matComp.color.push("1")
        item.matComp.color.push("1")
        item.matComp.color.push("1")
    }

    checkSceneLimits(scene:Scene, item:SceneItem){
        let totalSize = (scene.pcnt > 20 ? 300 : scene.pcnt * 15) * (1024 ** 2)
        let totalPoly = scene.pcnt * 10000

        if(scene.si > totalSize || scene.pc > totalPoly){
            console.log('scene is over limitations')
            return false
        }else{
            console.log('scene is within limitations')
            return true
        }
    }
}