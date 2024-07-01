import { Client } from "colyseus";
import { IWBRoom } from "../IWBRoom";
import { COMPONENT_TYPES, SCENE_MODES, SERVER_MESSAGE_TYPES, TRIGGER_TYPES } from "../../utils/types";
import { Quaternion, Vector3, createTransformComponent, editTransform } from "../../Objects/Transform";
import { createVisibilityComponent, editVisibility } from "../../Objects/Visibility";
import { createTextComponent, editTextShape } from "../../Objects/TextShape";
import { Player } from "../../Objects/Player";
import { pushPlayfabEvent } from "../../utils/Playfab";
import { itemManager, iwbManager } from "../../app.config";
import { Scene } from "../../Objects/Scene";
// import { IWBComponent, createIWBComponent, editIWBComponent } from "../../Objects/IWB";
import { NameComponent, createNameComponent, editNameComponent } from "../../Objects/Names";
import { GltfComponent, createGLTFComponent, editGltfComponent } from "../../Objects/Gltf";
import { ParentingComponent, createParentingComponent, editParentingComponent, removeParenting } from "../../Objects/Parenting";
import { AnimatorComponentSchema, createAnimationComponent } from "../../Objects/Animator";
import { createAudioSourceComponent, editAudioComponent } from "../../Objects/Sound";
import { createMaterialComponent } from "../../Objects/Materials";
import { createVideoComponent, editVideoComponent } from "../../Objects/Video";
import { IWBComponent, createIWBComponent, editIWBComponent } from "../../Objects/IWB";
import { createNftShapeComponent, editNftShape } from "../../Objects/NftShape";
import { createMeshRendererComponent, editMeshRendererComponent } from "../../Objects/MeshRenderers";
import { MeshColliderComponent, createMeshColliderComponent, editMeshColliderComponent } from "../../Objects/MeshColliders";
import { createTextureComponent, editTextureComponent } from "../../Objects/Textures";
import { createEmissiveComponent } from "../../Objects/Emissive";
import { createCounterComponent, editCounterComponent } from "../../Objects/Counter";
import { createActionComponent, editActionComponent } from "../../Objects/Actions";
import { createTriggerComponent, editTriggerComponent, removeActionFromTriggers } from "../../Objects/Trigger";
import { createPointerComponent, editPointerComponent } from "../../Objects/Pointers";
import { createStateComponent, editStateComponent } from "../../Objects/State";
import { createUITextComponent, editUIComponent } from "../../Objects/UIText";
import { createUIImageComponent, editUIImageComponent } from "../../Objects/UIImage";
import { createBillboardComponent } from "../../Objects/Billboard";
import { addGameComponent, sceneHasGame } from "../../Objects/Game";


let updateComponentFunctions:any = {
    ['Delete']: (scene:any, info:any)=>{deleteComponent(scene, info)},
    ['Add']: (scene:any, info:any)=>{addNewComponent(scene, info)},
    [COMPONENT_TYPES.TRANSFORM_COMPONENT]:(scene:any, info:any, client:any, room:IWBRoom)=>{editTransform(client,info, scene)}, 
    [COMPONENT_TYPES.VISBILITY_COMPONENT]:(scene:any, info:any, client:any, room:IWBRoom)=>{editVisibility(client, info, scene)}, 
    [COMPONENT_TYPES.TEXT_COMPONENT]:(scene:any, info:any, client:any, room:IWBRoom)=>{editTextShape(client, info, scene)}, 
    [COMPONENT_TYPES.IWB_COMPONENT]:(scene:any, info:any, client:any, room:IWBRoom)=>{editIWBComponent(info, scene)}, 
    [COMPONENT_TYPES.NAMES_COMPONENT]:(scene:any, info:any, client:any, room:IWBRoom)=>{ editNameComponent(info, scene)}, 
    [COMPONENT_TYPES.AUDIO_SOURCE_COMPONENT]:(scene:any, info:any, client:any, room:IWBRoom)=>{editAudioComponent(info, scene, info.component)}, 
    [COMPONENT_TYPES.AUDIO_STREAM_COMPONENT]:(scene:any, info:any, client:any, room:IWBRoom)=>{editAudioComponent(info, scene, info.component)}, 
    [COMPONENT_TYPES.NFT_COMPONENT]:(scene:any, info:any, client:any, room:IWBRoom)=>{editNftShape(info, scene)}, 
    [COMPONENT_TYPES.GLTF_COMPONENT]:(scene:any, info:any, client:any, room:IWBRoom)=>{editGltfComponent(info, scene)}, 
    [COMPONENT_TYPES.VIDEO_COMPONENT]:(scene:any, info:any, client:any, room:IWBRoom)=>{editVideoComponent(info, scene)}, 
    [COMPONENT_TYPES.MESH_COLLIDER_COMPONENT]:(scene:any, info:any, client:any, room:IWBRoom)=>{editMeshColliderComponent(info, scene)}, 
    [COMPONENT_TYPES.MESH_RENDER_COMPONENT]:(scene:any, info:any, client:any, room:IWBRoom)=>{editMeshRendererComponent(info, scene)}, 
    [COMPONENT_TYPES.TEXTURE_COMPONENT]:(scene:any, info:any, client:any, room:IWBRoom)=>{editTextureComponent(info, scene)},
    [COMPONENT_TYPES.PARENTING_COMPONENT]:(scene:any, info:any, client:any, room:IWBRoom)=>{editParentingComponent(room, client, info, scene)},
    [COMPONENT_TYPES.ACTION_COMPONENT]:(scene:any, info:any, client:any, room:IWBRoom)=>{editActionComponent(info, scene)},
    [COMPONENT_TYPES.TRIGGER_COMPONENT]:(scene:any, info:any, client:any, room:IWBRoom)=>{editTriggerComponent(info, scene)},
    [COMPONENT_TYPES.POINTER_COMPONENT]:(scene:any, info:any, client:any, room:IWBRoom)=>{ editPointerComponent(info, scene)},
    [COMPONENT_TYPES.STATE_COMPONENT]:(scene:any, info:any, client:any, room:IWBRoom)=>{editStateComponent(info, scene)},
    [COMPONENT_TYPES.UI_TEXT_COMPONENT]:(scene:any, info:any, client:any, room:IWBRoom)=>{editUIComponent(info, scene)},
    [COMPONENT_TYPES.UI_IMAGE_COMPONENT]:(scene:any, info:any, client:any, room:IWBRoom)=>{editUIImageComponent(info, scene)},
    [COMPONENT_TYPES.COUNTER_COMPONENT]:(scene:any, info:any, client:any, room:IWBRoom)=>{editCounterComponent(info, scene)}, 
}

let createComponentFunctions:any = {
    ['Delete']: (scene:any, info:any)=>{deleteComponent(scene, info)},
    ['Add']: (scene:any, info:any)=>{addNewComponent(scene, info)},
    [COMPONENT_TYPES.TEXT_COMPONENT]:(scene:any, aid:string, info:any)=>{createTextComponent(scene, aid, info)}, 
    // [COMPONENT_TYPES.AUDIO_SOURCE_COMPONENT]:(scene:any, info:any, client:any, room:IWBRoom)=>{editAudioComponent(info, scene, info.component)}, 
    // [COMPONENT_TYPES.AUDIO_STREAM_COMPONENT]:(scene:any, info:any, client:any, room:IWBRoom)=>{editAudioComponent(info, scene, info.component)}, 
    [COMPONENT_TYPES.NFT_COMPONENT]:(scene:any, aid:string, info:any)=>{createNftShapeComponent(scene, aid, info)}, 
    [COMPONENT_TYPES.GLTF_COMPONENT]:(scene:any, aid:string, info:any)=>{createGLTFComponent(scene, info)}, 
    // [COMPONENT_TYPES.VIDEO_COMPONENT]:(scene:any, info:any, client:any, room:IWBRoom)=>{editVideoComponent(info, scene)}, 
    [COMPONENT_TYPES.MESH_COLLIDER_COMPONENT]:(scene:any, aid:string, info:any)=>{createMeshColliderComponent(scene, info)}, 
    [COMPONENT_TYPES.MESH_RENDER_COMPONENT]:(scene:any, aid:string, info:any)=>{createMeshRendererComponent(scene, info)}, 
    [COMPONENT_TYPES.TEXTURE_COMPONENT]:(scene:any, aid:string, info:any)=>{createTextureComponent(scene, info)},
    [COMPONENT_TYPES.ACTION_COMPONENT]:(scene:any, aid:string, info:any)=>{createActionComponent(scene, aid, info)},
    [COMPONENT_TYPES.TRIGGER_COMPONENT]:(scene:any, aid:string, info:any)=>{ createTriggerComponent(scene, aid, info)},
    [COMPONENT_TYPES.POINTER_COMPONENT]:(scene:any, aid:string, info:any)=>{createPointerComponent(scene, aid, info)},
    [COMPONENT_TYPES.STATE_COMPONENT]:(scene:any, aid:string, info:any)=>{createStateComponent(scene, aid)},
    [COMPONENT_TYPES.UI_TEXT_COMPONENT]:(scene:any, aid:string, info:any)=>{createUITextComponent(scene, aid, info)},
    [COMPONENT_TYPES.UI_IMAGE_COMPONENT]:(scene:any, aid:string, info:any)=>{createUIImageComponent(scene, aid, info)},
    [COMPONENT_TYPES.COUNTER_COMPONENT]:(scene:any, aid:string, info:any)=>{createCounterComponent(scene, aid, info)}, 
    [COMPONENT_TYPES.MATERIAL_COMPONENT]:(scene:any, aid:string, info:any)=>{createMaterialComponent(scene, aid, info)}, 
    [COMPONENT_TYPES.BILLBOARD_COMPONENT]:(scene:any, aid:string, info:any)=>{createBillboardComponent(scene, aid, info)}, 
}

export function iwbItemHandler(room:IWBRoom){
    room.onMessage(SERVER_MESSAGE_TYPES.UPDATE_GRAB_Y_AXIS, async(client, info)=>{
        // console.log(SERVER_MESSAGE_TYPES.UPDATE_GRAB_Y_AXIS + " message", info)
        // room.broadcast(SERVER_MESSAGE_TYPES.UPDATE_GRAB_Y_AXIS, {user:client.userData.userId, y:info.y, aid:info.aid})
    })

    room.onMessage(SERVER_MESSAGE_TYPES.EDIT_SCENE_ASSET, (client:Client, info:any)=>{
        console.log("edit asset message", info)
        let scene = room.state.scenes.get(info.sceneId)
        let player = room.state.players.get(client.userData.userId)

        if(scene && canBuild(room, player.address, scene.id)){
            let itemInfo = scene[COMPONENT_TYPES.IWB_COMPONENT].get(info.aid)
            if(itemInfo){
                itemInfo.editing = true
                itemInfo.editor = client.userData.userId
                updateComponentFunctions[info.component](scene, info, client, room)
            }
        }else{
            console.log('cannot build')
        }
      })

    room.onMessage(SERVER_MESSAGE_TYPES.EDIT_SCENE_ASSET_DONE, (client:Client, info:any)=>{
        console.log("edit asset message", info)
        let scene = room.state.scenes.get(info.sceneId)
        if(scene){
            let player = room.state.players.get(client.userData.userId)
            let itemInfo = scene[COMPONENT_TYPES.IWB_COMPONENT].get(info.aid)
            if(itemInfo && itemInfo.editing && itemInfo.editor === client.userData.userId){
                itemInfo.editing = false
                itemInfo.editor = undefined
            }
        }
        

    })

    room.onMessage(SERVER_MESSAGE_TYPES.SELECT_CATALOG_ASSET, async(client, info)=>{
            console.log(SERVER_MESSAGE_TYPES.SELECT_CATALOG_ASSET + " message", info)
    
            let player:Player = room.state.players.get(client.userData.userId)

            if(player && player.mode === SCENE_MODES.BUILD_MODE){
                info.catalogAsset = true
                info.grabbed = true
                info.editor = 
                // let catalogItem = item.ugc ? room.state.realmAssets.get(item.id) : itemManager.items.get(item.id)

                player.addSelectedAsset(info)

                // pushPlayfabEvent(
                //     SERVER_MESSAGE_TYPES.SELECT_CATALOG_ASSET, 
                //     player, 
                //     [{name:info.catalogId, type:sceneItem.ty}]
                // )
            }
        })

    room.onMessage(SERVER_MESSAGE_TYPES.PLAYER_CANCELED_CATALOG_ASSET, async(client, info)=>{
            console.log(SERVER_MESSAGE_TYPES.PLAYER_CANCELED_CATALOG_ASSET + " message", info)
    
            let player:Player = room.state.players.get(client.userData.userId)

            if(player && player.mode === SCENE_MODES.BUILD_MODE){
                player.removeSelectedAsset()
                // sceneroom.broadcast(SERVER_MESSAGE_TYPES.SELECT_NEW_ASSET, info)
            }else{
                // console.log('player is not in create scene mode')
            }
        })

    room.onMessage(SERVER_MESSAGE_TYPES.SCENE_ADD_ITEM, async(client, info)=>{
        console.log(SERVER_MESSAGE_TYPES.SCENE_ADD_ITEM + " message", info)

        let player:Player = room.state.players.get(client.userData.userId)
        if(player && player.mode === SCENE_MODES.BUILD_MODE && canBuild(room, client.userData.userId, info.item.sceneId)){
            console.log('player can add assets')
            const {item} = info

            let scene = room.state.scenes.get(info.item.sceneId)
            if(scene){
                let catalogItem = item.ugc ? room.state.realmAssets.get(item.id) : itemManager.items.get(item.id)
                console.log('catalog item is', catalogItem)
                if(catalogItem){
                    if(checkSceneLimits(scene, catalogItem)){
                        createNewItem(room, client, scene, item, catalogItem)

                        if(item.duplicate){
                            console.log('need to copy item')
                            copyItem(room, scene, info, catalogItem)

                            pushPlayfabEvent(
                                SERVER_MESSAGE_TYPES.SCENE_COPY_ITEM, 
                                player, 
                                [{name:catalogItem.n, type:catalogItem.ty}]
                            )
                        }

                        else{
                            addItemComponents(room, client, scene, item, catalogItem)

                            pushPlayfabEvent(
                                SERVER_MESSAGE_TYPES.SCENE_ADD_ITEM, 
                                player, 
                                [{name:catalogItem.n, type:catalogItem.ty}]
                            )
                        }
                    }
                    else{
                        player.sendPlayerMessage(SERVER_MESSAGE_TYPES.ASSET_OVER_SCENE_LIMIT, {})
                        pushPlayfabEvent(
                            SERVER_MESSAGE_TYPES.ASSET_OVER_SCENE_LIMIT, 
                            player, 
                            [{name: catalogItem.n}]
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

    room.onMessage(SERVER_MESSAGE_TYPES.SCENE_DELETE_ITEM, async(client, info)=>{
        // console.log(SERVER_MESSAGE_TYPES.SCENE_DELETE_ITEM + " message", info)
        let player:Player = room.state.players.get(client.userData.userId)
        deleteSceneItem(room, player, info)
    })

    room.onMessage(SERVER_MESSAGE_TYPES.SCENE_DELETE_GRABBED_ITEM, async(client, info)=>{
        // console.log(SERVER_MESSAGE_TYPES.SCENE_DELETE_GRABBED_ITEM + " message", info)
        let player:Player = room.state.players.get(client.userData.userId)
        deleteGrabbedItem(room, player)
    })

    room.onMessage(SERVER_MESSAGE_TYPES.PLAYER_CANCELED_CATALOG_ASSET, async(client, info)=>{
        console.log(SERVER_MESSAGE_TYPES.PLAYER_CANCELED_CATALOG_ASSET + " message", info)

        let player:Player = room.state.players.get(client.userData.userId)
        let scene = room.state.scenes.get(info.sceneId)
        if(scene && player && player.mode === SCENE_MODES.BUILD_MODE && canBuild(room, player.address, scene.id)){
            player.removeSelectedAsset()
        }
    })

    room.onMessage(SERVER_MESSAGE_TYPES.SELECTED_SCENE_ASSET, async(client, info)=>{
        console.log(SERVER_MESSAGE_TYPES.SELECTED_SCENE_ASSET + " message", info)

        let player:Player = room.state.players.get(client.userData.userId)

        if(player && player.mode === SCENE_MODES.BUILD_MODE){
            let scene = room.state.scenes.get(info.sceneId)
            if(scene && canBuild(room, player.address, scene.id)){
                console.log("player can build here and select scene asset")
                let itemInfo = scene[COMPONENT_TYPES.IWB_COMPONENT].get(info.assetId)
                console.log('item info selected is', itemInfo)

                if(itemInfo && !itemInfo.editing){
                    let data:any = {}

                    itemInfo.editing = true
                    itemInfo.editor = client.userData.userId
                    data.assetId = info.assetId,
                    data.catalogId = itemInfo.id
                    data.grabbed = true
                    data.componentData = {...itemInfo}
                    player.addSelectedAsset(data)
                    // player.selectedAsset.componentData.comps.includes(COMPONENT_TYPES.IMAGE_COMPONENT) ? addImageComponent(player.selectedAsset.componentData, player.selectedAsset.componentData.imgComp.url) : null
                    // player.selectedAsset.componentData.comps.includes(COMPONENT_TYPES.NFT_COMPONENT) ? addNFTComponent(player.selectedAsset.componentData, player.selectedAsset.componentData.nftComp) : null
                    deleteSceneItem(room, player, info,true)
                }
                // client.send(SERVER_MESSAGE_TYPES.SELECTED_SCENE_ASSET, {valid:true, reason:"", player:player.address})
            }else{
                client.send(SERVER_MESSAGE_TYPES.SELECTED_SCENE_ASSET, {valid:false, reason:"", player:player.address})
            }
        }else{
            client.send(SERVER_MESSAGE_TYPES.SELECTED_SCENE_ASSET, {valid:false, reason:"", player:player.address})
        }
    })

    room.onMessage(SERVER_MESSAGE_TYPES.EDIT_SCENE_ASSET_CANCEL, async(client, info)=>{
        console.log(SERVER_MESSAGE_TYPES.EDIT_SCENE_ASSET_CANCEL + " message", info)

        let player:Player = room.state.players.get(client.userData.userId)
        if(player && player.mode === SCENE_MODES.BUILD_MODE && canBuild(room, client.userData.userId, info.item.sceneId)){
            let scene = room.state.scenes.get(info.item.sceneId)
            if(scene){
                let itemInfo = scene[COMPONENT_TYPES.IWB_COMPONENT].get(info.item.aid)
                if(itemInfo && itemInfo.editing && itemInfo.editor === player.address){
                    itemInfo.editing = false
                    // this.cancelAssetChanges(player, sceneItem)
                }
            }
        }
    })
}

function canBuild(room:IWBRoom, user:string, sceneId:any){
    let scene:Scene = room.state.scenes.get(sceneId)
    if(!scene){
        return false
    }

    if(scene.bps.includes(user)){
        return true
    }

    let world = iwbManager.worlds.find((w) => w.ens === room.state.world)
    if(!world){
        return false
    }

    if(world.owner === user || world.bps.includes(user)){
        return true
    }

    if(scene.bps.includes(user)){
        return true
    }

    return false
}

function checkSceneLimits(scene:Scene, item:any){
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

export function createNewItem(room:IWBRoom, client:Client, scene:Scene, item:any, catalogItemInfo:any){
    //check if new item is a game comonent, if so, check if already exists

    if(sceneHasGame(scene)){
        client.send(SERVER_MESSAGE_TYPES.PLAYER_RECEIVED_MESSAGE, {message:"A game component already exists on this scene", sound:'error_2'})
        return
    }

    createIWBComponent(room, scene, {scene:item, item:catalogItemInfo})
    createNameComponent(scene, {aid:item.aid, value:catalogItemInfo.n})
    createVisibilityComponent(scene, item)
    createTransformComponent(scene, item)
    createParentingComponent(scene, item)
}

function deleteComponent(scene:any, item:any){
    scene[item.type].delete(item.aid)
}

function addNewComponent(scene:Scene, item:any){
    switch(item.type){
        case COMPONENT_TYPES.BILLBOARD_COMPONENT:
            if(!scene[COMPONENT_TYPES.BILLBOARD_COMPONENT].has(item.aid)){
                createBillboardComponent(scene, item.aid, {mode:2})
            }
            break;
            
        case COMPONENT_TYPES.COUNTER_COMPONENT:
            if(!scene[COMPONENT_TYPES.COUNTER_COMPONENT].has(item.aid)){
                createCounterComponent(scene, item.aid, {defaultValue:0})
            }
            break;

        case COMPONENT_TYPES.ACTION_COMPONENT:
            if(!scene[COMPONENT_TYPES.ACTION_COMPONENT].has(item.aid)){
                createActionComponent(scene, item.aid, undefined)
            }
            break;

        case COMPONENT_TYPES.POINTER_COMPONENT:
            if(!scene[COMPONENT_TYPES.POINTER_COMPONENT].has(item.aid)){
                createPointerComponent(scene, item.aid)
            }
            break;

        case COMPONENT_TYPES.TRIGGER_COMPONENT:
            if(!scene[COMPONENT_TYPES.TRIGGER_COMPONENT].has(item.aid)){
                createTriggerComponent(scene, item.aid, item.data)
            }
            break;

        case COMPONENT_TYPES.STATE_COMPONENT:
            if(!scene[COMPONENT_TYPES.STATE_COMPONENT].has(item.aid)){
                createStateComponent(scene, item.aid)
            }
            break;
    }
}

export function addItemComponents(room:IWBRoom, client:Client, scene:Scene, item:any, data:any){
    // if(item.type === "SM"){}
    // else{

    // }

    //check if game component and if it already exists
    if(sceneHasGame(scene)){
        client.send(SERVER_MESSAGE_TYPES.PLAYER_RECEIVED_MESSAGE, {message:"A game component already exists on this scene", sound:'error_2'})
        return
    }

    let catalogItemInfo = {...data}
    switch(catalogItemInfo.ty){
        case '3D':
            if(catalogItemInfo.anim){
                let states:any[] = [] 
                catalogItemInfo.anim.forEach((animation:any)=>{
                    states.push({
                        clip:animation.name,
                        playing:false,
                        loop:false
                    })
                })
                createAnimationComponent(scene, item.aid, {states:states})
            }
            createGLTFComponent(scene, {aid:item.aid, src:catalogItemInfo.id, visibleCollision:1, invisibleCollision:2, pc:catalogItemInfo.pc})
            break;

        case 'Text':
            catalogItemInfo.onPlay = true
            createTextComponent(scene, item.aid, catalogItemInfo)
        break;

        case 'Video':
            createVideoComponent(scene, item.aid, catalogItemInfo)
            createMeshRendererComponent(scene, {aid:item.aid, shape:0})
            createMeshColliderComponent(scene, {aid:item.aid, shape:0, layer:3})
            createTextureComponent(scene, {aid:item.aid, type:1})
            createEmissiveComponent(scene, item.aid, {type:0})
            createMaterialComponent(scene, item.aid, {type:0})
        break;

        case 'Image':
            createMeshRendererComponent(scene, {aid:item.aid, shape:0})
            createMeshColliderComponent(scene, {aid:item.aid, shape:0, layer:3})
            createTextureComponent(scene, {aid:item.aid, type:0, path:""})
            createEmissiveComponent(scene, item.aid, {type:0})
            createMaterialComponent(scene, item.aid, {type:0})
        break;

        case 'Audio':
            createMeshRendererComponent(scene, {aid:item.aid, shape:1})
            createMeshColliderComponent(scene, {aid:item.aid, shape:1, layer:3})
            createTextComponent(scene, item.aid, {text:"" + catalogItemInfo.n, onPlay:false})
            createAudioSourceComponent(scene, item.aid, {url:catalogItemInfo.m})
            createActionComponent(scene, item.aid, {actions:[{name:"Play Sound", type:"play_sound"}, {name:"Stop Sound", type:"stop_sound"}]})
            break;
    }

    if(catalogItemInfo.components){
        for(let componentType in catalogItemInfo.components){
            let componentData = {...catalogItemInfo.components[componentType]}
            componentData.aid = item.aid
            createComponentFunctions[componentType](scene, item.aid, componentData)
        }
    }

    if(catalogItemInfo.id === "e7a63c71-c2ba-4e6d-8e62-d77e2c8dc93a"){
        addGameComponent(room, client, scene, item.aid, catalogItemInfo)
    }
}

function deleteGrabbedItem(room:IWBRoom, player:Player){
    try{
        if(player && player.mode === SCENE_MODES.BUILD_MODE){
            player.removeSelectedAsset()

            // pushPlayfabEvent(
            //     SERVER_MESSAGE_TYPES.SCENE_DELETE_GRABBED_ITEM, 
            //     player, 
            //     [{name:itemData.n, type:itemInfo.type}]
            // )
        }
    }
    catch(e){
        console.log('error deleting grabbed scene item', e)
    }
}

function deleteSceneItem(room:IWBRoom, player:Player, info:any, edit?:boolean){
    try{
        if(player && player.mode === SCENE_MODES.BUILD_MODE){
            let scene = room.state.scenes.get(info.sceneId)
            if(scene && canBuild(room, player.address, scene.id)){
                let itemInfo = scene[COMPONENT_TYPES.IWB_COMPONENT].get(info.assetId)
                if(itemInfo && !itemInfo.locked){
                    let pc:any
                    let si:any

                    if(itemInfo.ugc){
                        let realmAsset = room.state.realmAssets.get(itemInfo.id)
                        pc = realmAsset ? realmAsset.pc : undefined
                        si = realmAsset ? realmAsset.si : undefined
                    }
                    else{
                        let item = itemManager.items.get(itemInfo.id)
                        pc = item ? item.pc : undefined
                        si = item ? item.si : undefined
                    }

                    scene.pc -= pc ? pc : 0
                    scene.si -= si ? si : 0

                    removeAllAssetComponents(scene, info.assetId)

                    let itemData = itemInfo.ugc ? 
                        room.state.realmAssets.get(itemInfo.id) : 
                        itemManager.items.get(itemInfo.id)

                    if(edit){
                        console.log('player editing asset, dont remove from selectecd tree')
                    }
                    else{
                        if(info.childDelete){}
                        else{
                            player.removeSelectedAsset()
                        }
                        
                        pushPlayfabEvent(
                            SERVER_MESSAGE_TYPES.SCENE_DELETE_ITEM, 
                            player, 
                            [{name:itemData.n, type:itemInfo.type}]
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

export function removeAllAssetComponents(scene:any, aid:string){
    Object.values(COMPONENT_TYPES).forEach((component:any)=>{
        if(scene[component] && component !== COMPONENT_TYPES.PARENTING_COMPONENT){
            if(component === COMPONENT_TYPES.ACTION_COMPONENT){
                let actions = scene[component].get(aid)
                if(actions){
                    actions.actions.forEach((action:any)=>{
                        removeActionFromTriggers(scene, action.id)
                    })
                }
            }
            scene[component].delete(aid)
        }
    })

    if(["0","1","2"].includes(aid)){
        return
    }
    removeParenting(scene, aid)
}

function copyItem(room:IWBRoom, scene:any, info:any, catalogInfo:any){
    let omittedComponents:COMPONENT_TYPES[] = [
        COMPONENT_TYPES.PARENTING_COMPONENT,
        COMPONENT_TYPES.VISBILITY_COMPONENT,
        COMPONENT_TYPES.TRANSFORM_COMPONENT,
        COMPONENT_TYPES.IWB_COMPONENT,
    ]
    Object.values(COMPONENT_TYPES).forEach((component:any)=>{
        if(scene[component] && !omittedComponents.includes(component)){
            let itemInfo:any

            if(component === COMPONENT_TYPES.NAMES_COMPONENT){
                itemInfo = scene[component].get(info.item.aid)
                if(itemInfo){
                    itemInfo.value += " Copy"
                }
            }
            else{
                itemInfo = scene[component].get(info.item.duplicate)
                if(itemInfo){
                    let currentComponent:any = {...itemInfo}
                    currentComponent.aid = info.item.aid
                    console.log('copy component', component)

                // if(component === COMPONENT_TYPES.TRIGGER_COMPONENT){
                //     let triggers:any[] = []
                //     itemInfo.triggers.forEach((trigger:any)=>{
                //         triggers.push({
                //             type:trigger.type,
                //             input:trigger.input,
                //             pointer:trigger.pointer,

                //         })
                //     })
                // }
    
                createComponentFunctions[component](scene, currentComponent.aid, currentComponent)
                }
            }
        }
    })
}