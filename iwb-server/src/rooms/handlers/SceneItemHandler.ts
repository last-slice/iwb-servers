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
    addAudioComponent,
    addTriggerAreaComponent,
    addAnimationComponent,
    addNPCComponent,
    addDialogComponent,
    addClickAreaComponent,
    addRewardComponent
} from "../../Objects/Components";
import { Player } from "../../Objects/Player";
import { Scene, SceneItem } from "../../Objects/Scene";
import { itemManager, iwbManager } from "../../app.config";
import { COMPONENT_TYPES, EDIT_MODIFIERS, SCENE_MODES, SERVER_MESSAGE_TYPES } from "../../utils/types";
import { IWBRoom } from "../IWBRoom";
import { updateItemComponentFunctions } from "./ItemComponentUpdates";
import { pushPlayfabEvent } from "../../Objects/PlayfabEvents";

export class RoomSceneItemHandler {
    room:IWBRoom

    constructor(room:IWBRoom) {
        this.room = room

        room.onMessage(SERVER_MESSAGE_TYPES.SCENE_DELETE_ITEM, async(client, info)=>{
            // console.log(SERVER_MESSAGE_TYPES.SCENE_DELETE_ITEM + " message", info)

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
                    // console.log('scene item is', sceneItem)
                    if(sceneItem){
                        if(this.checkSceneLimits(scene, sceneItem)){

                            const newItem = this.createNewItem(item, sceneItem)
    
                            if(item.duplicate !== null){
                                let serverItem = scene.ass.find((as)=> as.aid === item.duplicate)
                                if(serverItem){
                                    this.addItemComponents(newItem, sceneItem, serverItem)
                                }else{
    
                                    this.addItemComponents(newItem, sceneItem, player.selectedAsset && player.selectedAsset !== null && player.selectedAsset.componentData ? player.selectedAsset.componentData : undefined, player.dclData.userId)
                                }

                                pushPlayfabEvent(
                                    SERVER_MESSAGE_TYPES.SCENE_COPY_ITEM, 
                                    player, 
                                    [{name:sceneItem.n, type:sceneItem.ty}]
                                )

                            }else{
                                this.addItemComponents(newItem, sceneItem, player.selectedAsset && player.selectedAsset !== null && player.selectedAsset.componentData ? player.selectedAsset.componentData : undefined)
                                
                                pushPlayfabEvent(
                                    SERVER_MESSAGE_TYPES.SCENE_ADD_ITEM, 
                                    player, 
                                    [{name:sceneItem.n, type:sceneItem.ty}]
                                )
                            }
       
                            scene.ass.push(newItem)
                            scene.pc += sceneItem.pc
                            scene.si += scene.ass.find((asset:any)=> asset.id === sceneItem.id) ? 0 : sceneItem.si
                        }
                        else{
                            player.sendPlayerMessage(SERVER_MESSAGE_TYPES.ASSET_OVER_SCENE_LIMIT, {})
                            pushPlayfabEvent(
                                SERVER_MESSAGE_TYPES.ASSET_OVER_SCENE_LIMIT, 
                                player, 
                                [{name: sceneItem.n}]
                            )
                        }
                    }
                }

                info.user = client.userData.userId
                room.broadcast(SERVER_MESSAGE_TYPES.SCENE_ADD_ITEM, info)

                player.removeSelectedAsset()
            }else{
                console.log('something wrong here with adding item', info)
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
                        player.removeSelectedAsset()

                        let itemData = sceneItem.ugc ? this.room.state.realmAssets.get(sceneItem.id) : itemManager.items.get(sceneItem.id)

                        pushPlayfabEvent(
                            SERVER_MESSAGE_TYPES.EDIT_SCENE_ASSET_DONE, 
                            player, 
                            [{name:itemData.n, type:sceneItem.type}]
                        )
                    }
                }
            }
        })

        room.onMessage(SERVER_MESSAGE_TYPES.EDIT_SCENE_ASSET_CANCEL, async(client, info)=>{
            console.log(SERVER_MESSAGE_TYPES.EDIT_SCENE_ASSET_CANCEL + " message", info)
    
            let player:Player = room.state.players.get(client.userData.userId)
            if(player && player.mode === SCENE_MODES.BUILD_MODE && this.canBuild(client.userData.userId, info.item.sceneId)){
                let scene = this.room.state.scenes.get(info.item.sceneId)
                if(scene){
                    let sceneItem = scene.ass.find((as)=> as.aid === info.item.aid)
                    if(sceneItem && sceneItem.editing){
                        sceneItem.editing = false
                        this.cancelAssetChanges(player, sceneItem)
                    }
                }
            }
        })

        room.onMessage(SERVER_MESSAGE_TYPES.EDIT_SCENE_ASSET, async(client, info)=>{
            // console.log(SERVER_MESSAGE_TYPES.EDIT_SCENE_ASSET + " message", info)
    
            let player:Player = room.state.players.get(client.userData.userId)
            if(player && player.mode === SCENE_MODES.BUILD_MODE && this.canBuild(client.userData.userId, info.item.sceneId)){
                let scene = this.room.state.scenes.get(info.item.sceneId)
                if(scene){
                    let sceneItem:SceneItem = scene.ass.find((as)=> as.aid === info.item.aid)
                    if(sceneItem && !sceneItem.editing){
                        sceneItem.editing = true
                        sceneItem.editor = client.userData.userId

                        const newItem = this.createNewItem(
                            {
                                position: sceneItem.p, 
                                rotation: sceneItem.r,
                                scale: sceneItem.s,
                                id:sceneItem.id,
                                aid:sceneItem.aid
                            }, 
                            {
                                ty:sceneItem.type,
                                ugc:sceneItem.ugc,
                                pending:sceneItem.pending,
                                sty:sceneItem.sty
                            }
                            )
                        this.addItemComponents(newItem, sceneItem, sceneItem)

                        player.addSelectedAsset(
                            {
                            catalogId: sceneItem.id,
                            assetId: sceneItem.aid,
                            componentData: newItem,
                            grabbed:false
                            }
                        )

                        // console.log(player.selectedAsset.toJSON())
                    }
                }
            }
        })

        room.onMessage(SERVER_MESSAGE_TYPES.SCENE_UPDATE_ITEM, async(client, info)=>{
            // console.log(SERVER_MESSAGE_TYPES.SCENE_UPDATE_ITEM + " message", info)
    
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
                // console.log('player is not in create scene mode')
            }
        })

        room.onMessage(SERVER_MESSAGE_TYPES.SELECT_CATALOG_ASSET, async(client, info)=>{
            console.log(SERVER_MESSAGE_TYPES.SELECT_CATALOG_ASSET + " message", info)
    
            let player:Player = room.state.players.get(client.userData.userId)

            if(player && player.mode === SCENE_MODES.BUILD_MODE){
                info.catalogAsset = true
                info.grabbed = true
                player.addSelectedAsset(info)

                // pushPlayfabEvent(
                //     SERVER_MESSAGE_TYPES.SCENE_ADD_ITEM, 
                //     player, 
                //     [{name:info.catalogId, type:sceneItem.ty}]
                // )
            }else{
                // console.log('player is not in create scene mode')
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
                if(scene && this.canBuild(player.address, scene.id)){
                    let sceneAsset:SceneItem = scene.ass.find((asset:any)=> asset.aid === info.assetId)
                    if(sceneAsset && !sceneAsset.editing){
                        sceneAsset.editing = true
                        sceneAsset.editor = player.address
                        data.componentData = sceneAsset
                        data.grabbed = true
                    }
                    player.addSelectedAsset(data)
                    player.selectedAsset.componentData.comps.includes(COMPONENT_TYPES.IMAGE_COMPONENT) ? addImageComponent(player.selectedAsset.componentData, player.selectedAsset.componentData.imgComp.url) : null
                    player.selectedAsset.componentData.comps.includes(COMPONENT_TYPES.NFT_COMPONENT) ? addNFTComponent(player.selectedAsset.componentData, player.selectedAsset.componentData.nftComp) : null
                    this.deleteSceneItem(player, info,true)

                    // client.send(SERVER_MESSAGE_TYPES.SELECTED_SCENE_ASSET, {valid:true, reason:"", player:player.address})
                }else{
                    client.send(SERVER_MESSAGE_TYPES.SELECTED_SCENE_ASSET, {valid:false, reason:"", player:player.address})
                }
            }else{
                client.send(SERVER_MESSAGE_TYPES.SELECTED_SCENE_ASSET, {valid:false, reason:"", player:player.address})
            }
        })

        room.onMessage(SERVER_MESSAGE_TYPES.PLACE_SELECTED_ASSET, async(client, info)=>{
            // console.log(SERVER_MESSAGE_TYPES.PLACE_SELECTED_ASSET + " message", info)
    
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
                        updateItemComponentFunctions[info.component](asset, info, room, player)
                    }
                }
            }
        })

        room.onMessage(SERVER_MESSAGE_TYPES.PLAYER_EDIT_ASSET, async(client, info)=>{
            // console.log(SERVER_MESSAGE_TYPES.PLAYER_EDIT_ASSET + " message", info)

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
            // console.log(SERVER_MESSAGE_TYPES.UPDATE_GRAB_Y_AXIS + " message", info)
            // room.broadcast(SERVER_MESSAGE_TYPES.UPDATE_GRAB_Y_AXIS, {user:client.userData.userId, y:info.y, aid:info.aid})
        })

        room.onMessage(SERVER_MESSAGE_TYPES.VERIFY_ACCESS, async(client, info)=>{
            console.log(SERVER_MESSAGE_TYPES.VERIFY_ACCESS + " message", info)
            info.user = client.userData.userId
            info.access = true
            room.broadcast(SERVER_MESSAGE_TYPES.VERIFY_ACCESS, info)
        })
    }

    deleteSceneItem(player:Player, info:any, edit?:boolean){
        try{
            if(player && player.mode === SCENE_MODES.BUILD_MODE){
                let scene = this.room.state.scenes.get(info.sceneId)
                if(scene && this.canBuild(player.address, scene.id)){
                    let sceneItem = scene.ass.find((asset)=> asset.aid === info.assetId)
                    if(sceneItem && !sceneItem.locked){
                        // console.log('found scene item to delete', sceneItem.id, sceneItem.ugc)
                        let pc:any
                        let si:any
                        if(sceneItem.ugc){
                            // console.log('ugc asset to delete')
                            let realmAsset = this.room.state.realmAssets.get(sceneItem.id)
                            // console.log('realm asset is', realmAsset)
                            pc = realmAsset ? realmAsset.pc : undefined
                            si = realmAsset ? realmAsset.si : undefined
                        }
                        else{
                           //  console.log('catalog asset to delete')
                            let item = itemManager.items.get(sceneItem.id)
                            // console.log('catalog item to delete is', item)
                            pc = item ? item.pc : undefined
                            si = item ? item.si : undefined
                        }

                        //delete actions from triggers
                        if(sceneItem.actComp){
                           //  console.log('need to delete actions for item across all triggers')
                            this.deleteActionsOnTriggers(scene, sceneItem)
                        }
    
                        scene.pc -= pc ? pc : 0
                        scene.si -= si ? si : 0
                        let index = scene.ass.findIndex((asset)=> asset.aid === info.assetId)
                        if(index >= 0){
                            console.log('deleting scene item')
                            scene.ass.splice(index,1)
                        }

                        let itemData = sceneItem.ugc ? this.room.state.realmAssets.get(sceneItem.id) : itemManager.items.get(sceneItem.id)

                        if(edit){}
                        else{
                            player.removeSelectedAsset()
                            pushPlayfabEvent(
                                SERVER_MESSAGE_TYPES.SCENE_DELETE_ITEM, 
                                player, 
                                [{name:itemData.n, type:sceneItem.type}]
                            )
                        }
                    }
                }
            }
        }
        catch(e){
            console.log('error deleting scene item', info, e)
        }

    }

    deleteActionsOnTriggers(scene:Scene, sceneItem:SceneItem){
        let triggerAssets:SceneItem[] = scene.ass.filter((asset:any)=> asset.trigComp)

        triggerAssets.forEach((asset:SceneItem)=>{
            asset.trigComp.triggers.forEach((trigger:any)=>{
                trigger.actions = trigger.actions.filter((action:any)=> !sceneItem.actComp.actions.has(action.id))
                // console.log('actions remaining =', trigger.actions.length)
            })
        })

        triggerAssets = scene.ass.filter((asset:any)=> asset.trigArComp)

        triggerAssets.forEach((asset:SceneItem)=>{
            asset.trigArComp.eActions = asset.trigArComp.eActions.filter((action:any)=> !sceneItem.actComp.actions.has(action.id))
            asset.trigArComp.lActions = asset.trigArComp.lActions.filter((action:any)=> !sceneItem.actComp.actions.has(action.id))
        })

        
        // triggerAssets = scene.ass.filter((asset:any)=> asset.trigArComp)
        // triggerAssets.trigArComp.triggers.forEach((trigger:any)=>{
        //     let actions = trigger.actions.filter((action:any)=> !sceneItem.actComp.actions.has(action.id))
        //     console.log('actions remaining =', actions.length)
        // })

        sceneItem.actComp.actions.clear()
    }

    transformAsset(scene:Scene, data:any){
        // console.log('need to get asset to update scene')
        let asset = scene.ass.find((asset)=> asset.aid === data.aid)
        if(asset){
            // console.log('asset to transform is', asset.aid)
            // console.log(data.modifier)
            switch(data.modifier){
                case EDIT_MODIFIERS.POSITION:
                    // console.log('editing position')
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
           //  console.log('can build')
            return scene.bps.includes(user) || user === iwbManager.worlds.find((w) => w.ens === this.room.state.world).owner;
        }else{
            // console.log('cannot build')
            return false
        }
    }

    checkSceneLimits(scene:Scene, item:any){
        if(!scene.lim){
            // console.log('scene limits are toggled off')
            return true
        }

        let totalSize = (scene.pcnt > 20 ? 300 : scene.pcnt * 15) * (1024 ** 2)
        let totalPoly = scene.pcnt * 10000

        if((scene.si + item.si) > totalSize || (scene.pc + item.pc) > totalPoly){
            // console.log('scene is over limitations', scene.si + item.si > totalSize, (scene.pc + item.pc) > totalPoly)
            return false
        }else{
            // console.log('scene is within limitations')
            return true
        }
    }

    addItemComponents(item:SceneItem, catalogItem:any, selectedAsset?:any, owner?:string){
        item.comps.push(COMPONENT_TYPES.TRANSFORM_COMPONENT)
        item.comps.push(COMPONENT_TYPES.VISBILITY_COMPONENT)

        // console.log('adding item components to item', item.type, catalogItem)

        if(item.type === "SM"){
            switch(catalogItem.n){
                case 'Trigger Area':
                    item.comps.push(COMPONENT_TYPES.TRIGGER_AREA_COMPONENT)
                    break;

                
                case 'Click Area':
                    item.comps.push(COMPONENT_TYPES.TRIGGER_COMPONENT)
                    item.comps.push(COMPONENT_TYPES.ACTION_COMPONENT)
                    item.comps.push(COMPONENT_TYPES.COLLISION_COMPONENT)
                    break;

                case 'NPC':
                    item.comps.push(COMPONENT_TYPES.TRIGGER_COMPONENT)
                    item.comps.push(COMPONENT_TYPES.ACTION_COMPONENT)
                    item.comps.push(COMPONENT_TYPES.NPC_COMPONENT)
                    break;

                case 'Dialog':
                    item.comps.push(COMPONENT_TYPES.ACTION_COMPONENT)
                    item.comps.push(COMPONENT_TYPES.DIALOG_COMPONENT)
                    break;

                case 'Reward':
                    item.comps.push(COMPONENT_TYPES.ACTION_COMPONENT)
                    item.comps.push(COMPONENT_TYPES.REWARD_COMPONENT)
                    break;
            }
        }else{
            item.comps.push(COMPONENT_TYPES.TRIGGER_COMPONENT)
            item.comps.push(COMPONENT_TYPES.ACTION_COMPONENT)
            item.comps.push(COMPONENT_TYPES.COLLISION_COMPONENT)
        }

        item.comps.forEach((component)=>{
            switch(component){
                case COMPONENT_TYPES.TRIGGER_COMPONENT:
                    addTriggerComponent(item, selectedAsset ? selectedAsset.trigComp : undefined)
                    break;

                case COMPONENT_TYPES.ACTION_COMPONENT:
                    addActionComponent(item, selectedAsset ? selectedAsset.actComp : undefined)
                    break;

                case COMPONENT_TYPES.VISBILITY_COMPONENT:
                    addVisibilityComponent(item, selectedAsset ? selectedAsset.visComp.visible : true)
                    break;

                case COMPONENT_TYPES.COLLISION_COMPONENT:
                    addCollisionComponent(item, selectedAsset ? selectedAsset.colComp : undefined)
                    break;
            }
        })

        switch(item.type){
            case '3D':
                if(catalogItem.anim){
                    item.comps.push(COMPONENT_TYPES.ANIMATION_COMPONENT)
                    addAnimationComponent(item, catalogItem.anim)
                }
                break;

            case '2D':
                switch(catalogItem.n){
                    case 'Image':        
                      //   console.log('selected ass', selectedAsset)
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

            case 'SM':
                switch(catalogItem.n){
                    case 'Click Area':
                        addClickAreaComponent(item)
                        // addTriggerComponent()
                        break;

                    case 'Trigger Area':
                        addTriggerAreaComponent(item, selectedAsset ? selectedAsset.trigArComp : null)
                        break;

                    case 'NPC':
                        addNPCComponent(item, selectedAsset ? selectedAsset.trigArComp : null)
                        break;

                    case 'Dialog':
                        addDialogComponent(item, selectedAsset ? selectedAsset.dialComp : null)
                        break;

                    case 'Reward':
                        addRewardComponent(item, selectedAsset ? selectedAsset.rComp : null, owner)
                        break;
                }
                break;
        }
    }

    createNewItem(item:any, sceneItem:any){
        const newItem = new SceneItem()
        newItem.id = item.id
        newItem.aid = item.aid
        newItem.n = item.n
        newItem.p = new Vector3(item.position)
        newItem.r = new Quaternion(item.rotation)
        newItem.s = new Vector3(item.scale)
        newItem.type = sceneItem.ty
        newItem.ugc = sceneItem.ugc
        newItem.pending = sceneItem.pending
        newItem.sty = sceneItem.sty
        return newItem
    }

    cancelAssetChanges(player:Player, sceneItem:SceneItem){
      //   console.log('cancelling asset changes')
        let previousItem:SceneItem = player.selectedAsset?.componentData

        if(previousItem){
            //update prior PRS
            this.revertTransform(previousItem.p, sceneItem)

            //update prior image link

            //update prior video link

            //update prior visibility

            //update prior collision

            //update prior text
        }
    }

    revertTransform(previousPosition:Vector3, sceneItem:SceneItem){
        sceneItem.p.x = previousPosition.x
        sceneItem.p.y = previousPosition.y
        sceneItem.p.z = previousPosition.z
    }
}