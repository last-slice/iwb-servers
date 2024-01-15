import { generateId } from "colyseus";
import {
    ActionComponent,
    Actions,
    Color4,
    Quaternion,
    TriggerComponent,
    Triggers,
    Vector3,
    addActionComponent,
    addCollisionComponent,
    addImageComponent,
    addMaterialComponent,
    addNFTComponent,
    addTextComponent,
    addTriggerComponent,
    addVideoComponent,
    addVisibilityComponent,
    addAudioComponent
} from "../../Objects/Components";
import { Player } from "../../Objects/Player";
import { Scene, SceneItem } from "../../Objects/Scene";
import { itemManager, iwbManager } from "../../app.config";
import { COMPONENT_TYPES, EDIT_MODIFIERS, SCENE_MODES, SERVER_MESSAGE_TYPES } from "../../utils/types";
import { IWBRoom } from "../IWBRoom";
import { updateItemComponentFunctions } from "./ItemComponentUpdates";

export class RoomSceneItemHandler {
    room:IWBRoom

    constructor(room:IWBRoom) {
        this.room = room

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
                    let sceneItem = item.ugc ? this.room.state.realmAssets.get(item.id) : itemManager.items.get(item.id)
                    console.log('scene item is', sceneItem)
                    if(sceneItem){
                        if(this.checkSceneLimits(scene, sceneItem)){
                            const newItem = new SceneItem()
                            newItem.id = item.id
                            newItem.aid = item.aid
                            newItem.p = new Vector3(item.position)
                            newItem.r = new Quaternion(item.rotation)
                            newItem.s = new Vector3(item.scale)
                            newItem.type = sceneItem.ty
                            newItem.ugc = sceneItem.ugc
                            newItem.pending = sceneItem.pending
    
                            if(item.duplicate !== null){
                                let serverItem = scene.ass.find((as)=> as.aid === item.duplicate)
                                if(serverItem){
                                    this.addItemComponents(newItem, sceneItem.n, serverItem)
                                }else{
    
                                    this.addItemComponents(newItem, sceneItem.n, player.selectedAsset && player.selectedAsset !== null && player.selectedAsset.componentData ? player.selectedAsset.componentData : undefined)
                                }
                            }else{
                                this.addItemComponents(newItem, sceneItem.n, player.selectedAsset && player.selectedAsset !== null && player.selectedAsset.componentData ? player.selectedAsset.componentData : undefined)
                            }
       
                            scene.ass.push(newItem)
                            scene.pc += sceneItem.pc
                            scene.si += sceneItem.si
                        }else{
                            player.sendPlayerMessage(SERVER_MESSAGE_TYPES.ASSET_OVER_SCENE_LIMIT, {})
                        }
                    }
                }

                info.user = client.userData.userId
                room.broadcast(SERVER_MESSAGE_TYPES.SCENE_ADD_ITEM, info)

                player.removeSelectedAsset()
            }else{
                console.log('something wrong here')
            }
        })

        room.onMessage(SERVER_MESSAGE_TYPES.EDIT_SCENE_ASSET_DONE, async(client, info)=>{
            console.log(SERVER_MESSAGE_TYPES.EDIT_SCENE_ASSET_DONE + " message", info)
    
            let player:Player = room.state.players.get(client.userData.userId)
            if(player && player.mode === SCENE_MODES.BUILD_MODE && this.canBuild(client.userData.userId, info.item.sceneId)){
                let scene = this.room.state.scenes.get(info.item.sceneId)
                if(scene){
                    let sceneItem = scene.ass.find((as)=> as.aid === info.item.aid)
                    if(sceneItem && sceneItem.editing){
                        sceneItem.editing = false
                    }
                }
            }
        })

        room.onMessage(SERVER_MESSAGE_TYPES.EDIT_SCENE_ASSET, async(client, info)=>{
            console.log(SERVER_MESSAGE_TYPES.EDIT_SCENE_ASSET + " message", info)
    
            let player:Player = room.state.players.get(client.userData.userId)
            if(player && player.mode === SCENE_MODES.BUILD_MODE && this.canBuild(client.userData.userId, info.item.sceneId)){
                let scene = this.room.state.scenes.get(info.item.sceneId)
                if(scene){
                    let sceneItem = scene.ass.find((as)=> as.aid === info.item.aid)
                    if(sceneItem && !sceneItem.editing){
                        sceneItem.editing = true
                        sceneItem.editor = client.userData.userId
                    }
                }
            }
        })

        room.onMessage(SERVER_MESSAGE_TYPES.SCENE_UPDATE_ITEM, async(client, info)=>{
            console.log(SERVER_MESSAGE_TYPES.SCENE_UPDATE_ITEM + " message", info)
    
            let player:Player = room.state.players.get(client.userData.userId)
            if(player && player.mode === SCENE_MODES.BUILD_MODE && this.canBuild(client.userData.userId, info.item.sceneId)){
                const {item} = info

                let scene = this.room.state.scenes.get(info.item.sceneId)
                if(scene){
                    let sceneItem = scene.ass.find((as)=> as.aid === info.item.aid)
                    if(sceneItem && !sceneItem.editing){
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
                info.catalogAsset = true
                player.addSelectedAsset(info)
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
                    if(sceneAsset && !sceneAsset.editing){
                        sceneAsset.editing = true
                        data.componentData = sceneAsset
                    }
                }
                player.addSelectedAsset(data)
                player.selectedAsset.componentData.comps.includes(COMPONENT_TYPES.IMAGE_COMPONENT) ? addImageComponent(player.selectedAsset.componentData, player.selectedAsset.componentData.imgComp.url) : null
                player.selectedAsset.componentData.comps.includes(COMPONENT_TYPES.NFT_COMPONENT) ? addNFTComponent(player.selectedAsset.componentData, player.selectedAsset.componentData.nftComp) : null
                this.deleteSceneItem(player, info)
            }
        })

        room.onMessage(SERVER_MESSAGE_TYPES.PLACE_SELECTED_ASSET, async(client, info)=>{
            console.log(SERVER_MESSAGE_TYPES.PLACE_SELECTED_ASSET + " message", info)
    
            let player:Player = room.state.players.get(client.userData.userId)

            if(player && player.mode === SCENE_MODES.BUILD_MODE){
                this.room.broadcast(SERVER_MESSAGE_TYPES.PLACE_SELECTED_ASSET, info, )
                player.removeSelectedAsset()
            }else{
                console.log('player is not in create scene mode')
            }
        })

        room.onMessage(SERVER_MESSAGE_TYPES.UPDATE_ITEM_COMPONENT, async(client, info)=>{
            console.log(SERVER_MESSAGE_TYPES.UPDATE_ITEM_COMPONENT + " message", info)

            let player:Player = room.state.players.get(client.userData.userId)
            if(player && player.mode === SCENE_MODES.BUILD_MODE){
                let scene = room.state.scenes.get(info.data.sceneId)
                if(scene){
                    let asset = scene.ass.find((a)=> a.aid === info.data.aid)
                    if(asset){
                        updateItemComponentFunctions[info.component](asset, info)
                    }
                }
            }
        })

        room.onMessage(SERVER_MESSAGE_TYPES.PLAYER_EDIT_ASSET, async(client, info)=>{
            console.log(SERVER_MESSAGE_TYPES.PLAYER_EDIT_ASSET + " message", info)

            let player:Player = room.state.players.get(client.userData.userId)
            if(player && player.mode === SCENE_MODES.BUILD_MODE){
                let scene = room.state.scenes.get(info.sceneId)
                if(scene){
                    switch(info.editType){
                        case EDIT_MODIFIERS.TRANSFORM:
                            this.transformAsset(scene, info)
                            break;
                    }
                }
            }
        })

        room.onMessage(SERVER_MESSAGE_TYPES.UPDATE_GRAB_Y_AXIS, async(client, info)=>{
            console.log(SERVER_MESSAGE_TYPES.UPDATE_GRAB_Y_AXIS + " message", info)
            room.broadcast(SERVER_MESSAGE_TYPES.UPDATE_GRAB_Y_AXIS, {user:client.userData.userId, y:info.y, aid:info.aid})
        })
    }

    deleteSceneItem(player:Player, info:any){
        if(player && player.mode === SCENE_MODES.BUILD_MODE){
            let scene = this.room.state.scenes.get(info.sceneId)
            if(scene){
                let assetIndex = scene.ass.findIndex((ass)=> ass.aid === info.assetId)
                if(assetIndex >= 0){
                    if(scene.ass[assetIndex].ugc){
                        scene.pc -= this.room.state.realmAssets.get(scene.ass.find((a)=>a.id === scene.ass[assetIndex].id).id).pc
                        scene.si -= this.room.state.realmAssets.get(scene.ass.find((a)=>a.id === scene.ass[assetIndex].id).id).si
                        scene.ass.splice(assetIndex,1)
                    }
                    else{
                        scene.pc -= itemManager.items.get(scene.ass.find((a)=>a.aid === info.assetId).id).pc
                        scene.si -= itemManager.items.get(scene.ass.find((a)=>a.aid === info.assetId).id).si
                        scene.ass.splice(assetIndex,1)
                    }
                }
            }
        }
    }

    transformAsset(scene:Scene, data:any){
        console.log('need to get asset to update scene')
        let asset = scene.ass.find((asset)=> asset.aid === data.aid)
        if(asset){
            switch(data.modifier){
                case EDIT_MODIFIERS.POSITION:
                    switch(data.axis){
                        case 'x':
                            if(data.manual){
                                asset.p.x = data.value === "" ? 0 : data.value
                            }else{
                                asset.p.x += (data.direction * data.factor)
                            }
                            break;

                        case 'y':
                            if(data.manual){
                                asset.p.y = data.value === "" ? 0 : data.value
                            }else{
                                asset.p.y += (data.direction * data.factor)
                            }
                            break;

                        case 'z':
                            if(data.manual){
                                asset.p.z = data.value === "" ? 0 : data.value
                            }else{
                                asset.p.z += (data.direction * data.factor)
                            }
                            break;
                    }
                    break;
        
                case EDIT_MODIFIERS.ROTATION:
                    switch(data.axis){
                        case 'x':
                            if(data.manual){
                                asset.r.x = data.value === "" ? 0 : data.value
                            }else{
                                asset.r.x += (data.direction * data.factor)
                            }
                            break;

                        case 'y':
                            if(data.manual){
                                asset.r.y = data.value === "" ? 0 : data.value
                            }else{
                                asset.r.y += (data.direction * data.factor)
                            }
                            break;

                        case 'z':
                            if(data.manual){
                                asset.r.z = data.value === "" ? 0 : data.value
                            }else{
                                asset.r.z += (data.direction * data.factor)
                            }
                            break;
                    }
                    break;
        
                case EDIT_MODIFIERS.SCALE:
                    switch(data.axis){
                        case 'x':
                            if(data.manual){
                                asset.s.x = data.value === "" ? 0 : data.value
                            }else{
                                asset.s.x += (data.direction * data.factor)
                            }
                            break;

                        case 'y':
                            if(data.manual){
                                asset.s.y = data.value === "" ? 0 : data.value
                            }else{
                                asset.s.y += (data.direction * data.factor)
                            }
                            break;

                        case 'z':
                            if(data.manual){
                                asset.s.z = data.value === "" ? 0 : data.value
                            }else{
                                asset.s.z += (data.direction * data.factor)
                            }
                            break;
                    }
                    break;
            }
        }
    }

    canBuild(user:string, sceneId:any){
        let scene:Scene = this.room.state.scenes.get(sceneId)
        if(scene){
            console.log('can build')
            return scene.bps.includes(user) || user === iwbManager.worlds.find((w) => w.ens === this.room.state.world).owner;
        }else{
            console.log('cannot build')
            return false
        }
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

    addItemComponents(item:SceneItem, name:string, selectedAsset?:any){
        item.comps.push(COMPONENT_TYPES.TRANSFORM_COMPONENT)

        addTriggerComponent(item, selectedAsset ? selectedAsset.trigComp : undefined)
        addActionComponent(item, selectedAsset ? selectedAsset.actComp : undefined)
        // addClickComponent(item, selectedAsset ? selectedAsset.clickComp : undefined)        
        addVisibilityComponent(item, selectedAsset ? selectedAsset.visComp.visible : true)
        addCollisionComponent(item, selectedAsset ? selectedAsset.colComp : undefined)

        switch(item.type){
            case '3D':
                break;

            case '2D':
                switch(name){
                    case 'Image':        
                        console.log('selected ass', selectedAsset)
                        addImageComponent(item, selectedAsset ? selectedAsset.imgComp.url : "")                
                        addMaterialComponent(item, selectedAsset ? selectedAsset.matComp : null)
                        break;
                    case 'Video':
                        addVideoComponent(item, selectedAsset ? selectedAsset.vidComp : null)
                        break;
                    case 'NFT Frame':
                        addNFTComponent(item, selectedAsset ? selectedAsset.nftComp : null)
                        break;

                    case 'Text':
                        addTextComponent(item, selectedAsset ? selectedAsset.textComp : null)
                        break;
                }
                break;

            case 'Audio':
                addAudioComponent(item, selectedAsset ? selectedAsset.audComp : null)
                break;
        }
    }
}