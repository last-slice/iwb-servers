import { Client, generateId } from "colyseus";
import { IWBRoom } from "../IWBRoom";
import { ACTIONS, CATALOG_IDS, COMPONENT_TYPES, EDIT_MODIFIERS, SCENE_MODES, SERVER_MESSAGE_TYPES, TRIGGER_TYPES } from "../../utils/types";
import { Quaternion, TransformComponent, Vector3, createTransformComponent, editTransform } from "../../Objects/Transform";
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
import { createAudioComponent, editAudioComponent } from "../../Objects/Sound";
import { createMaterialComponent, editMaterialComponent } from "../../Objects/Materials";
import { createVideoComponent, editVideoComponent } from "../../Objects/Video";
import { IWBComponent, createIWBComponent, editIWBComponent } from "../../Objects/IWB";
import { createNftShapeComponent, editNftShape } from "../../Objects/NftShape";
import { createMeshRendererComponent, editMeshRendererComponent } from "../../Objects/MeshRenderers";
import { MeshColliderComponent, createMeshColliderComponent, editMeshColliderComponent } from "../../Objects/MeshColliders";
import { createTextureComponent, editTextureComponent } from "../../Objects/Textures";
import { createCounterComponent, editCounterComponent } from "../../Objects/Counter";
import { createActionComponent, editActionComponent } from "../../Objects/Actions";
import { createTriggerComponent, editTriggerComponent, removeActionFromTriggers, TriggerDecisionComponent } from "../../Objects/Trigger";
import { createPointerComponent, editPointerComponent } from "../../Objects/Pointers";
import { createStateComponent, editStateComponent } from "../../Objects/State";
import { createUITextComponent, editUIComponent } from "../../Objects/UIText";
import { createUIImageComponent, editUIImageComponent } from "../../Objects/UIImage";
import { createBillboardComponent } from "../../Objects/Billboard";
import { createGameComponent, deleteGameComponent, editGameComponent, sceneHasGame } from "../../Objects/Game";
import { editLevelComponent } from "../../Objects/Level";
import { createLiveComponent, editLiveComponent } from "../../Objects/LiveShow";
import { createGameItemComponent, editGameItemComponent } from "../../Objects/GameItem";
import { createDialogComponent, editDialogComponent } from "../../Objects/Dialog";
import { createRewardComponent, editRewardComponent } from "../../Objects/Rewards";
import { createPlaylistComponent, editPlaylistComponent } from "../../Objects/Playlist";//
import { createAvatarShapeComponent, editAvatarShapeComponent } from "../../Objects/AvatarShape";
import { createPathComponent, editPathComponent } from "../../Objects/Paths";
import { createVLMComponent, editVLMComponent } from "../../Objects/VLM";
import { createLeaderboardComponent, editLeaderboardComponent } from "../../Objects/Leaderboard";
import { createVehicleComponent } from "../../Objects/Vehicle";
import { createPhysicsComponent, editPhysicsComponent } from "../../Objects/Physics";


export let updateComponentFunctions:any = {
    ['Delete']: (scene:any, info:any, client:any, player:Player, room:IWBRoom)=>{deleteComponent(room, scene, player, info)},
    ['Add']: (scene:any, info:any, client:any, player:Player, room:IWBRoom)=>{addNewComponent(scene, info, client, room)},
    [COMPONENT_TYPES.TRANSFORM_COMPONENT]:(scene:any, info:any, client:any, player:Player, room:IWBRoom)=>{editTransform(client,info, scene)}, 
    [COMPONENT_TYPES.VISBILITY_COMPONENT]:(scene:any, info:any, client:any, player:Player, room:IWBRoom)=>{editVisibility(client, info, scene)}, 
    [COMPONENT_TYPES.TEXT_COMPONENT]:(scene:any, info:any, client:any, player:Player, room:IWBRoom)=>{editTextShape(client, info, scene)}, 
    [COMPONENT_TYPES.IWB_COMPONENT]:(scene:any, info:any, client:any, player:Player, room:IWBRoom)=>{editIWBComponent(info, scene)}, 
    [COMPONENT_TYPES.NAMES_COMPONENT]:(scene:any, info:any, client:any, player:Player, room:IWBRoom)=>{ editNameComponent(info, scene)}, 
    // [COMPONENT_TYPES.AUDIO_SOURCE_COMPONENT]:(scene:any, info:any, client:any, player:Player, room:IWBRoom)=>{editAudioComponent(info, scene, info.component)}, 
    // [COMPONENT_TYPES.AUDIO_STREAM_COMPONENT]:(scene:any, info:any, client:any, player:Player, room:IWBRoom)=>{editAudioComponent(info, scene, info.component)}, 
    [COMPONENT_TYPES.NFT_COMPONENT]:(scene:any, info:any, client:any, player:Player, room:IWBRoom)=>{editNftShape(info, scene)}, 
    [COMPONENT_TYPES.GLTF_COMPONENT]:(scene:any, info:any, client:any, player:Player, room:IWBRoom)=>{editGltfComponent(info, scene)}, 
    [COMPONENT_TYPES.VIDEO_COMPONENT]:(scene:any, info:any, client:any, player:Player, room:IWBRoom)=>{editVideoComponent(info, scene)}, 
    [COMPONENT_TYPES.MESH_COLLIDER_COMPONENT]:(scene:any, info:any, client:any, player:Player, room:IWBRoom)=>{editMeshColliderComponent(info, scene)}, 
    [COMPONENT_TYPES.MESH_RENDER_COMPONENT]:(scene:any, info:any, client:any, player:Player, room:IWBRoom)=>{editMeshRendererComponent(info, scene)}, 
    [COMPONENT_TYPES.TEXTURE_COMPONENT]:(scene:any, info:any, client:any, player:Player, room:IWBRoom)=>{editTextureComponent(info, scene)},
    [COMPONENT_TYPES.PARENTING_COMPONENT]:(scene:any, info:any, client:any, player:Player, room:IWBRoom)=>{editParentingComponent(room, client, info, scene, player)},
    [COMPONENT_TYPES.ACTION_COMPONENT]:(scene:any, info:any, client:any, player:Player, room:IWBRoom)=>{editActionComponent(info, scene)},
    [COMPONENT_TYPES.TRIGGER_COMPONENT]:(scene:any, info:any, client:any, player:Player, room:IWBRoom)=>{editTriggerComponent(info, scene)},
    [COMPONENT_TYPES.POINTER_COMPONENT]:(scene:any, info:any, client:any, player:Player, room:IWBRoom)=>{ editPointerComponent(info, scene)},
    [COMPONENT_TYPES.STATE_COMPONENT]:(scene:any, info:any, client:any, player:Player, room:IWBRoom)=>{editStateComponent(info, scene)},
    [COMPONENT_TYPES.UI_TEXT_COMPONENT]:(scene:any, info:any, client:any, player:Player, room:IWBRoom)=>{editUIComponent(info, scene)},
    [COMPONENT_TYPES.UI_IMAGE_COMPONENT]:(scene:any, info:any, client:any, player:Player, room:IWBRoom)=>{editUIImageComponent(info, scene)},
    [COMPONENT_TYPES.COUNTER_COMPONENT]:(scene:any, info:any, client:any, player:Player, room:IWBRoom)=>{editCounterComponent(info, scene)}, 
    [COMPONENT_TYPES.GAME_COMPONENT]:(scene:any, info:any, client:any, player:Player, room:IWBRoom)=>{editGameComponent(room, client, info, scene, player)}, 
    [COMPONENT_TYPES.LEVEL_COMPONENT]:(scene:any, info:any, client:any, player:Player,room:IWBRoom)=>{editLevelComponent(info, scene)}, 
    [COMPONENT_TYPES.LIVE_COMPONENT]:(scene:any, info:any, client:any, player:Player, room:IWBRoom)=>{editLiveComponent(info, scene)}, 
    [COMPONENT_TYPES.MATERIAL_COMPONENT]:(scene:any, info:any, client:any, player:Player, room:IWBRoom)=>{editMaterialComponent(info, scene)}, 
    [COMPONENT_TYPES.DIALOG_COMPONENT]:(scene:any, info:any, client:any, player:Player, room:IWBRoom)=>{editDialogComponent(info, scene)}, 
    [COMPONENT_TYPES.REWARD_COMPONENT]:(scene:any, info:any, client:any, player:Player, room:IWBRoom)=>{editRewardComponent(info, scene)}, 
    [COMPONENT_TYPES.PLAYLIST_COMPONENT]:(scene:any, info:any, client:any, player:Player, room:IWBRoom)=>{editPlaylistComponent(info, scene)}, 
    [COMPONENT_TYPES.AVATAR_SHAPE_COMPONENT]:(scene:any, info:any, client:any, player:Player, room:IWBRoom)=>{editAvatarShapeComponent(info, scene)}, 
    [COMPONENT_TYPES.PATH_COMPONENT]:(scene:any, info:any, client:any, player:Player, room:IWBRoom)=>{editPathComponent(info, scene)}, 
    [COMPONENT_TYPES.AUDIO_COMPONENT]:(scene:any, info:any, client:any, player:Player, room:IWBRoom)=>{editAudioComponent(info, scene)}, 
    [COMPONENT_TYPES.VLM_COMPONENT]:(scene:any, info:any, client:any, player:Player, room:IWBRoom)=>{editVLMComponent(info, scene)}, 
    [COMPONENT_TYPES.GAME_ITEM_COMPONENT]:(scene:any, info:any, client:any, player:Player, room:IWBRoom)=>{editGameItemComponent(info, scene)}, 
    [COMPONENT_TYPES.LEADERBOARD_COMPONENT]:(scene:any, info:any, client:any, player:Player, room:IWBRoom)=>{editLeaderboardComponent(info, scene)}, 
    [COMPONENT_TYPES.PHYSICS_COMPONENT]:(scene:any, info:any, client:any, player:Player, room:IWBRoom)=>{editPhysicsComponent(info, scene)}, 
}

let createComponentFunctions:any = {
    ['Delete']: (room:IWBRoom, scene:Scene, client:Client, player:Player, aid:string, info:any)=>{deleteComponent(room, scene, player, info)},
    ['Add']: (room:IWBRoom, scene:Scene, client:Client, player:Player, aid:string, info:any)=>{addNewComponent(scene, info, client, room)},
    [COMPONENT_TYPES.TEXT_COMPONENT]:(room:IWBRoom, scene:Scene, client:Client, player:Player, aid:string, info:any)=>{createTextComponent(scene, aid, info)}, 
    // [COMPONENT_TYPES.AUDIO_SOURCE_COMPONENT]:(scene:any, info:any, client:any, room:IWBRoom)=>{editAudioComponent(info, scene, info.component)}, 
    // [COMPONENT_TYPES.AUDIO_STREAM_COMPONENT]:(scene:any, info:any, client:any, room:IWBRoom)=>{editAudioComponent(info, scene, info.component)}, 
    [COMPONENT_TYPES.NFT_COMPONENT]:(room:IWBRoom, scene:Scene, client:Client, player:Player, aid:string, info:any)=>{createNftShapeComponent(scene, aid, info)}, 
    [COMPONENT_TYPES.GLTF_COMPONENT]:(room:IWBRoom, scene:Scene, client:Client, player:Player, aid:string, info:any)=>{createGLTFComponent(scene, info)}, 
    // [COMPONENT_TYPES.VIDEO_COMPONENT]:(scene:any, info:any, client:any, room:IWBRoom)=>{editVideoComponent(info, scene)}, 
    [COMPONENT_TYPES.MESH_COLLIDER_COMPONENT]:(room:IWBRoom, scene:Scene, client:Client, player:Player, aid:string, info:any)=>{createMeshColliderComponent(scene, info)}, 
    [COMPONENT_TYPES.MESH_RENDER_COMPONENT]:(room:IWBRoom, scene:Scene, client:Client, player:Player, aid:string, info:any)=>{createMeshRendererComponent(scene, info)}, 
    [COMPONENT_TYPES.TEXTURE_COMPONENT]:(room:IWBRoom, scene:Scene, client:Client, player:Player, aid:string, info:any)=>{createTextureComponent(scene, info)},
    [COMPONENT_TYPES.ACTION_COMPONENT]:(room:IWBRoom, scene:Scene, client:Client, player:Player, aid:string, info:any)=>{createActionComponent(scene, aid, info)},
    [COMPONENT_TYPES.TRIGGER_COMPONENT]:(room:IWBRoom, scene:Scene, client:Client, player:Player, aid:string, info:any)=>{ createTriggerComponent(scene, aid, info)},
    [COMPONENT_TYPES.POINTER_COMPONENT]:(room:IWBRoom, scene:Scene, client:Client, player:Player, aid:string, info:any)=>{createPointerComponent(scene, aid, info)},
    [COMPONENT_TYPES.STATE_COMPONENT]:(room:IWBRoom, scene:Scene, client:Client, player:Player, aid:string, info:any)=>{createStateComponent(scene, aid)},
    [COMPONENT_TYPES.UI_TEXT_COMPONENT]:(room:IWBRoom, scene:Scene, client:Client, player:Player, aid:string, info:any)=>{createUITextComponent(scene, aid, info)},
    [COMPONENT_TYPES.UI_IMAGE_COMPONENT]:(room:IWBRoom, scene:Scene, client:Client, player:Player, aid:string, info:any)=>{createUIImageComponent(scene, aid, info)},
    [COMPONENT_TYPES.COUNTER_COMPONENT]:(room:IWBRoom, scene:Scene, client:Client, player:Player, aid:string, info:any)=>{createCounterComponent(scene, aid, info)}, 
    [COMPONENT_TYPES.MATERIAL_COMPONENT]:(room:IWBRoom, scene:Scene, client:Client, player:Player, aid:string, info:any)=>{createMaterialComponent(scene, aid, info)}, 
    [COMPONENT_TYPES.BILLBOARD_COMPONENT]:(room:IWBRoom, scene:Scene, client:Client, player:Player, aid:string, info:any)=>{createBillboardComponent(scene, aid, info)}, 
    [COMPONENT_TYPES.LIVE_COMPONENT]:(room:IWBRoom, scene:Scene, client:Client, player:Player, aid:string, info:any)=>{createLiveComponent(scene, aid, info)}, 
    [COMPONENT_TYPES.DIALOG_COMPONENT]:(room:IWBRoom, scene:Scene, client:Client, player:Player, aid:string, info:any)=>{createDialogComponent(scene, aid, info)}, 
    [COMPONENT_TYPES.REWARD_COMPONENT]:(room:IWBRoom, scene:Scene, client:Client, player:Player, aid:string, info:any)=>{createRewardComponent(scene, aid, info)}, 
    [COMPONENT_TYPES.PLAYLIST_COMPONENT]:(room:IWBRoom, scene:Scene, client:Client, player:Player, aid:string, info:any)=>{createPlaylistComponent(scene, aid, info)}, 
    [COMPONENT_TYPES.AVATAR_SHAPE_COMPONENT]:(room:IWBRoom, scene:Scene, client:Client, player:Player, aid:string, info:any)=>{createAvatarShapeComponent(scene, aid, info)}, 
    [COMPONENT_TYPES.PATH_COMPONENT]:(room:IWBRoom, scene:Scene, client:Client, player:Player, aid:string, info:any)=>{createPathComponent(scene, aid, info)}, 
    [COMPONENT_TYPES.AUDIO_COMPONENT]:(room:IWBRoom, scene:Scene, client:Client, player:Player, aid:string, info:any)=>{createAudioComponent(scene, aid, info)}, 
    [COMPONENT_TYPES.VLM_COMPONENT]:(room:IWBRoom, scene:Scene, client:Client, player:Player, aid:string, info:any)=>{createVLMComponent(scene, aid, info)}, 
    [COMPONENT_TYPES.GAME_ITEM_COMPONENT]:(room:IWBRoom, scene:Scene, client:Client, player:Player, aid:string, info:any)=>{createGameItemComponent(scene, aid, info)}, 
    [COMPONENT_TYPES.LEADERBOARD_COMPONENT]:(room:IWBRoom, scene:Scene, client:Client, player:Player, aid:string, info:any)=>{createLeaderboardComponent(scene, aid, info)}, 
    [COMPONENT_TYPES.VEHICLE_COMPONENT]:(room:IWBRoom, scene:Scene, client:Client, player:Player, aid:string, info:any)=>{createVehicleComponent(scene, aid, info)}, 
    [COMPONENT_TYPES.PHYSICS_COMPONENT]:(room:IWBRoom, scene:Scene, client:Client, player:Player, aid:string, info:any)=>{createPhysicsComponent(scene, aid, info)}, 
}

export function iwbItemHandler(room:IWBRoom){
    room.onMessage(SERVER_MESSAGE_TYPES.SCENE_DROPPED_GRABBED, (client:Client, info:any)=>{
        console.log(SERVER_MESSAGE_TYPES.SCENE_DROPPED_GRABBED + " received", info)
        let scene = room.state.scenes.get(info.sceneId)
        let player = room.state.players.get(client.userData.userId)

        if(scene && canBuild(room, player.address, scene.id)){
            let itemInfo = scene[COMPONENT_TYPES.IWB_COMPONENT].get(info.aid)
            if(itemInfo){
                console.log('can build and found item to place grabbed')
                itemInfo.editing = false
                itemInfo.editor = undefined
                editTransform(client, {aid:info.aid,modifier:EDIT_MODIFIERS.POSITION, axis: 'ALL', x:info.position.x, y:info.position.y, z:info.position.z} , scene)
                editTransform(client, {aid:info.aid, modifier:EDIT_MODIFIERS.ROTATION, axis: 'ALL', x:info.rotation.x, y:info.rotation.y, z:info.rotation.z} , scene)
            }
        }else{
            console.log('cannot build')
        }
      })

    room.onMessage(SERVER_MESSAGE_TYPES.UPDATE_GRAB_Y_AXIS, async(client, info)=>{
        // console.log(SERVER_MESSAGE_TYPES.UPDATE_GRAB_Y_AXIS + " message", info)
        // room.broadcast(SERVER_MESSAGE_TYPES.UPDATE_GRAB_Y_AXIS, {user:client.userData.userId, y:info.y, aid:info.aid})
    })

    room.onMessage(SERVER_MESSAGE_TYPES.EDIT_SCENE_ASSET, (client:Client, info:any)=>{
        console.log(SERVER_MESSAGE_TYPES.EDIT_SCENE_ASSET + " received", info)
        let scene = room.state.scenes.get(info.sceneId)
        let player = room.state.players.get(client.userData.userId)

        if(scene && canBuild(room, player.address, scene.id)){
            let itemInfo = scene[COMPONENT_TYPES.IWB_COMPONENT].get(info.aid)
            if(itemInfo){
                itemInfo.editing = true
                itemInfo.editor = client.userData.userId
                updateComponentFunctions[info.component](scene, info, client, player, room)
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
                info.editor = player.address
                info.isCatalogSelect = info.isCatalogSelect
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
        // console.log('player is', player, player.mode, canBuild(room, client.userData.userId, info.item.sceneId))
        if(player && player.mode === SCENE_MODES.BUILD_MODE && canBuild(room, client.userData.userId, info.item.sceneId)){
            console.log('player can add assets')
            const {item} = info

            let scene = room.state.scenes.get(info.item.sceneId)
            if(scene){
                let catalogItem = item.ugc ? room.state.realmAssets.get(item.id) : itemManager.items.get(item.id)
                // console.log('catalog item is', catalogItem)
                if(catalogItem){
                    if(checkSceneLimits(scene, catalogItem)){

                        if(item.duplicate){
                            console.log('need to copy item')
                            copyItem(room, scene, client, player, info, catalogItem, item.duplicate)

                            pushPlayfabEvent(
                                SERVER_MESSAGE_TYPES.SCENE_COPY_ITEM, 
                                player, 
                                [{name:catalogItem.n, type:catalogItem.ty}]
                            )
                        }

                        else{
                            await createNewItem(room, client, scene, item, catalogItem)
                            addItemComponents(room, client, scene, player, item, catalogItem)

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
        }
        else{
            console.log('something wrong here with adding item', info)
        }
    })

    room.onMessage(SERVER_MESSAGE_TYPES.SCENE_DELETE_ITEM, async(client, info)=>{
        console.log(SERVER_MESSAGE_TYPES.SCENE_DELETE_ITEM + " message", info)
        let player:Player = room.state.players.get(client.userData.userId)
        deleteSceneItem(room, player, info)
    })

    room.onMessage(SERVER_MESSAGE_TYPES.SCENE_DELETE_GRABBED_ITEM, async(client, info)=>{
        // console.log(SERVER_MESSAGE_TYPES.SCENE_DELETE_GRABBED_ITEM + " message", info)
        deleteGrabbedItem(room, client, info)
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
                    data.sceneId = scene.id
                    data.grabbed = true
                    data.componentData = {...itemInfo}

                    // let childTransform:any
                    // let parenting = scene[COMPONENT_TYPES.PARENTING_COMPONENT].find(($:any)=> $.aid === info.assetId)
                    // parenting && parenting.children.forEach((aid:string, i:number)=>{
                    //     let transform = scene[COMPONENT_TYPES.TRANSFORM_COMPONENT].get(aid)
                    //     childTransform.set(aid, transform)
                    // })
                    // data.childTransform = childTransform
                
                    player.addSelectedAsset(data)

                    // deleteSceneItem(room, player, info,true)
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

export function hasWorldPermissions(room:IWBRoom, user:string){
    let world = iwbManager.worlds.find((w) => w.ens === room.state.world)
    if(!world){
        return false
    }

    if(world.owner === user || world.bps.includes(user)){
        return true
    }
    return false
}

export function canBuild(room:IWBRoom, user:string, sceneId?:any){
    console.log('can build check')
    let scene:Scene = room.state.scenes.get(sceneId)
    if(!scene){
        console.log('no scene')
        return false
    }

    if(scene.bps.includes(user)){
        return true
    }

    let world = iwbManager.worlds.find((w) => w.ens === room.state.world)
    if(!world){
        console.log('no world to build')
        return false
    }

    if(world.owner === user || hasWorldPermissions(room, user)){
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
        // console.log('scene is within limitations')//
        return true
    }
}

export async function createNewItem(room:IWBRoom, client:Client, scene:Scene, item:any, catalogItemInfo:any){
    //check if new item is a game component, if so, check if already exists

    if(catalogItemInfo.id === CATALOG_IDS.GAME_COMPONENT){
        if(sceneHasGame(scene)){
            client.send(SERVER_MESSAGE_TYPES.PLAYER_RECEIVED_MESSAGE, {message:"A game component already exists on this scene", sound:'error_2'})
            return
        }
    }

    await createIWBComponent(room, scene, {scene:item, item:catalogItemInfo})
    await createNameComponent(scene, item.aid, {aid:item.aid, value:catalogItemInfo.n})
    await createVisibilityComponent(scene, item)
    await createParentingComponent(scene, item)
    await createTransformComponent(scene, item)   
}

async function deleteComponent(room:IWBRoom, scene:any, player:Player, item:any){
    switch(item.type){
        case COMPONENT_TYPES.GAME_COMPONENT:
            await deleteGameComponent(room, scene, player, item.aid)
            break;
    }
    scene[item.type].delete(item.aid)
}

function addNewComponent(scene:Scene, item:any, client:Client, room:IWBRoom){
    switch(item.type){
        case COMPONENT_TYPES.PHYSICS_COMPONENT:
        if(!scene[COMPONENT_TYPES.PHYSICS_COMPONENT].has(item.aid)){
            createPhysicsComponent(scene, item.aid, {
                // type:1,
                // shape:2,
                // linearDamping:0.4,
                // angularDamping:0.4
            })
        }
        break;

        case COMPONENT_TYPES.VEHICLE_COMPONENT:
        if(!scene[COMPONENT_TYPES.VEHICLE_COMPONENT].has(item.aid)){
            createVehicleComponent(scene, item.aid)
        }
        break;

        case COMPONENT_TYPES.DIALOG_COMPONENT:
            if(!scene[COMPONENT_TYPES.DIALOG_COMPONENT].has(item.aid)){
                createDialogComponent(scene, item.aid)
            }
            break;

        case COMPONENT_TYPES.GAME_ITEM_COMPONENT:
            if(!scene[COMPONENT_TYPES.GAME_ITEM_COMPONENT].has(item.aid)){
                createGameItemComponent(scene, item.aid)
            }
            break;
        case COMPONENT_TYPES.LIVE_COMPONENT:
            if(!scene[COMPONENT_TYPES.LIVE_COMPONENT].has(item.aid)){
                createLiveComponent(scene, item.aid, {})
            }
            break;

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

        case COMPONENT_TYPES.GAME_COMPONENT:
            if(sceneHasGame(scene)){
                client.send(SERVER_MESSAGE_TYPES.PLAYER_RECEIVED_MESSAGE, {message:"A game component already exists on this scene", sound:'error_2'})
                return
            }
            createGameComponent(room, scene, item.aid, undefined, true)
            break;
    }
}

export async function addItemComponents(room:IWBRoom, client:Client, scene:Scene, player:Player, item:any, data:any){
    // if(item.type === "SM"){}
    // else{

    // }

    //check if game component and if it already exists
    // if(sceneHasGame(scene)){
    //     client.send(SERVER_MESSAGE_TYPES.PLAYER_RECEIVED_MESSAGE, {message:"A game component already exists on this scene", sound:'error_2'})
    //     return
    // }

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
            createMeshRendererComponent(scene, {aid:item.aid, shape:0, onPlay:true})
            createMeshColliderComponent(scene, {aid:item.aid, shape:0, layer:3})
            // createTextureComponent(scene, {aid:item.aid, type:1})
            // createEmissiveComponent(scene, item.aid, {type:0})
            createMaterialComponent(scene, item.aid, {onPlay:true, type:0, textureType:"VIDEO", texture:""})
        break;

        case 'Image':
            createMeshRendererComponent(scene, {aid:item.aid, shape:0, onPlay:true})
            createMeshColliderComponent(scene, {aid:item.aid, shape:0, layer:3})
            // createTextureComponent(scene, {aid:item.aid, type:0, path:""})
            // createEmissiveComponent(scene, item.aid, {type:0})
            createMaterialComponent(scene, item.aid, {onPlay:true, type:0, textureType:'TEXTURE', texture:""})
        break;

        case 'Audio':
            createMeshRendererComponent(scene, {aid:item.aid, shape:1})
            createMeshColliderComponent(scene, {aid:item.aid, shape:1, layer:3})
            createTextComponent(scene, item.aid, {text:"" + catalogItemInfo.n, onPlay:false})
            createAudioComponent(scene, item.aid, {type:0, name:catalogItemInfo.n, url:"assets/" + catalogItemInfo.id + ".mp3"})
            createActionComponent(scene, item.aid, {actions:[{name:"Play Sound", type:"audio_play"}, {name:"Stop Sound", type:"audio_stop"}]})
            createMaterialComponent(scene, item.aid, {onPlay:false, type:0,  textureType:"COLOR", "albedoColor": {
                "r": 0,
                "g": 0,
                "b": 1,
                "a": 0.5
            }})
            break;

        case 'Audio Stream':
            createMeshRendererComponent(scene, {aid:item.aid, shape:1})
            createMeshColliderComponent(scene, {aid:item.aid, shape:1, layer:3})
            createTextComponent(scene, item.aid, {text:"" + catalogItemInfo.n, onPlay:false})
            createMaterialComponent(scene, item.aid, {onPlay:false, textureType:"COLOR", type:0, "albedoColor": {
                    "r": 0,
                    "g": 0,
                    "b": 1,
                    "a": 0.5
                }})
            createAudioComponent(scene, item.aid, {type:catalogItemInfo.n === "Audio Stream" ? 1: 2, url:"", name:"" +  catalogItemInfo.n})
            // createActionComponent(scene, item.aid, {actions:[{name:"Start Audio Stream", type:ACTIONS.PLAY_AUDIO_STREAM}, {name:"Stop Audio Stream", type:ACTIONS.STOP_AUDIO_STREAM}]})
            break;
    }

    if(catalogItemInfo.sty === "Smart Items"){
        console.log('popuplating smart item')
        if(catalogItemInfo.components){
            if(catalogItemInfo.components.Actions){
                await createActionComponent(scene, item.aid, catalogItemInfo.components.Actions)
                delete catalogItemInfo.components.Actions
            }

            if(catalogItemInfo.components.Pointers){
                await createPointerComponent(scene, item.aid, catalogItemInfo.components.Pointers)
                delete catalogItemInfo.components.Pointers
            }

            if(catalogItemInfo.components.Triggers){
                catalogItemInfo.components.Triggers.triggers.forEach((trigger:any)=>{
                    trigger.decisions.forEach((decision:any)=>{
                        decision.id = generateId(5)
                        decision.name = decision.id

                        console.log('decision is', decision)
    
                        let actionIds:any[] = []
                        decision.actions.forEach((decisionAction:any)=>{
                            let actions = scene[COMPONENT_TYPES.ACTION_COMPONENT].get(item.aid)
                            if(actions && actions.actions.length > 0){
                                let found = actions.actions.find(($:any)=> $.name === decisionAction)
                                console.log("action found", found)
                                if(found){
                                    actionIds.push(found.id)
                                }
                            }
                        })
                        decision.actions = actionIds
                    })
                })
                await createTriggerComponent(scene, item.aid, catalogItemInfo.components.Triggers)
                delete catalogItemInfo.components.Triggers
            }
        }
    }
    
    if(catalogItemInfo.components){
        for(let componentType in catalogItemInfo.components){
            let componentData = {...catalogItemInfo.components[componentType]}
            componentData.aid = item.aid

            console.log('component data to copy is', componentData)
            createComponentFunctions[componentType](room, scene, client, player, item.aid, componentData)
        }
    }
}

function deleteGrabbedItem(room:IWBRoom, client:Client, info:any){
    try{
        if(!info || !info.sceneId || !info.aid){
            return
        }

        let player:Player = room.state.players.get(client.userData.userId)
        let scene = room.state.scenes.get(info.sceneId)
        if(!scene){
            return
        }

        let itemInfo = scene[COMPONENT_TYPES.IWB_COMPONENT].get(info.aid)
        if(!itemInfo){
            return
        }

        if(player && player.mode === SCENE_MODES.BUILD_MODE){
            player.removeSelectedAsset()
            removeItem(room, player, scene, {assetId:info.aid}, undefined, true)

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

export function deleteSceneItem(room:IWBRoom, player:Player, info:any, edit?:boolean){
    try{
        if(player && player.mode === SCENE_MODES.BUILD_MODE){
            let scene = room.state.scenes.get(info.sceneId)
            if(scene && canBuild(room, player.address, scene.id)){
                removeItem(room, player, scene, info, edit, true)
            }
        }
    }
    catch(e){
        console.log('error deleting scene item', info, e)
    }
}

export async function removeItem(room:IWBRoom, player:Player, scene:Scene, info:any, edit?:boolean, topLevelItem?:boolean){
    let itemInfo = scene[COMPONENT_TYPES.IWB_COMPONENT].get(info.assetId)
    if(itemInfo && !itemInfo.locked){
        let pc:any
        let si:any

        console.log('deleting item info', itemInfo.id)

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

        await removeParenting(room, player, scene, {aid:info.assetId}, topLevelItem)
        removeAllAssetComponents(room, player, scene, {aid:info.assetId})

        let itemData = itemInfo.ugc ? 
            room.state.realmAssets.get(itemInfo.id) : 
            itemManager.items.get(itemInfo.id)

        if(edit){
            console.log('player editing asset, dont remove from selectecd tree')//
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

        //check if game component and remove all levels and children
        // if(itemInfo.id === CATALOG_IDS.GAME_COMPONENT){
        //     console.log('removing game component, need to remove all levels as well')
        //     removeGameComponent(room, scene, player, info.assetId, itemInfo)
        // }
    }
}

export function removeAllAssetComponents(room:IWBRoom, player:Player, scene:any, info:any){
    Object.values(COMPONENT_TYPES).forEach((component:any)=>{
        if(scene[component] && component !== COMPONENT_TYPES.PARENTING_COMPONENT){
            if(component === COMPONENT_TYPES.ACTION_COMPONENT){
                let actions = scene[component].get(info.aid)
                if(actions){
                    actions.actions.forEach((action:any)=>{
                        removeActionFromTriggers(scene, action.id)
                    })
                }
            }
            try{
                scene[component].delete(info.aid)
            }catch(e){}
            
        }
    })

    if(["0","1","2"].includes(info.aid)){
        return
    }
    scene.si = 0
    scene.pc = 0
}

async function copyItem(room:IWBRoom, scene:any, client:Client, player:Player, info:any, catalogInfo:any, duplicateAid?:any){
    
    // console.log('copying item', info, catalogInfo)
    // console.log('copying item', info.item.aid, info.item.duplicate, info.item.parent)
    // console.log('aprent index is', scene[COMPONENT_TYPES.PARENTING_COMPONENT].findIndex(($:any)=> $.aid === info.item.duplicate))
    console.log(scene[COMPONENT_TYPES.PARENTING_COMPONENT].findIndex(($:any)=> $.aid === info.item.duplicate) >= 0 && scene[COMPONENT_TYPES.PARENTING_COMPONENT][scene[COMPONENT_TYPES.PARENTING_COMPONENT].findIndex(($:any)=> $.aid === info.item.duplicate)].children.length > 0)
    let parent = scene[COMPONENT_TYPES.PARENTING_COMPONENT][scene[COMPONENT_TYPES.PARENTING_COMPONENT].findIndex(($:any)=> $.aid === info.item.duplicate)]
    console.log(parent.children.length)

    catalogInfo.n += " Copy"
    info.item.n = catalogInfo.n

    // if(topLevel < 3){
        await createNewItem(room, client, scene, info.item, catalogInfo)

        let skip:any[] = [
            COMPONENT_TYPES.TRANSFORM_COMPONENT,
            COMPONENT_TYPES.IWB_COMPONENT,
            COMPONENT_TYPES.NAMES_COMPONENT,
            COMPONENT_TYPES.VISBILITY_COMPONENT,
            COMPONENT_TYPES.PARENTING_COMPONENT
        ]

        if(!catalogInfo.hasOwnProperty("components")){
            catalogInfo.components = {}
        }

        Object.values(COMPONENT_TYPES).forEach((component:any)=>{
            if(scene[component] && !skip.includes(component)){
                let componentData = scene[component].get(duplicateAid)
                if(componentData){
                    catalogInfo.components[component] = componentData
                } 
            }
        })


        scene
        await addItemComponents(room, client, scene, player, info.item, catalogInfo)
    
        let parentIndex = scene[COMPONENT_TYPES.PARENTING_COMPONENT].findIndex(($:any)=> $.aid === info.item.duplicate)
        if(parentIndex >= 0 && scene[COMPONENT_TYPES.PARENTING_COMPONENT][parentIndex].children.length > 0){
            console.log('parent has children to copy', scene[COMPONENT_TYPES.PARENTING_COMPONENT][parentIndex].children.length)
            let parent = {...scene[COMPONENT_TYPES.PARENTING_COMPONENT][parentIndex]}
            let childrenLoop:any[] = []
            parent.children.forEach((child:any)=>{
                childrenLoop.push(child)
            })
    
            for(let i = 0; i < childrenLoop.length; i++){
                let childAid = childrenLoop[i]
                console.log('child aid is', childAid, scene[COMPONENT_TYPES.PARENTING_COMPONENT].findIndex(($:any)=> $.aid === info.item.aid))
                let iwbInfo = scene[COMPONENT_TYPES.IWB_COMPONENT].get(childAid)
                let transform:any = {...scene[COMPONENT_TYPES.TRANSFORM_COMPONENT].get(childAid)}
                console.log('child transform is', transform.p.x)

                let catalogItem = iwbInfo.ugc ? room.state.realmAssets.get(iwbInfo.id) : itemManager.items.get(iwbInfo.id)
    
                let parentTransform = {...scene[COMPONENT_TYPES.TRANSFORM_COMPONENT].get(info.item.aid)}
                console.log('parentTransform transform is', parentTransform.p.x)
                let parentAid = info.item.aid

                let newItemInfo = {...info}
                newItemInfo.item.position = transform.p
                newItemInfo.item.rotation = transform.r
                newItemInfo.item.scale = transform.s
    
                let newAid = generateId(6)
                newItemInfo.item.id = catalogItem.id
                newItemInfo.item.duplicate = info.item.aid
                newItemInfo.item.aid = newAid
    
                // topLevel += 1
                newItemInfo.item.parent = 0
                console.log('item to copy is', newItemInfo, catalogItem)
                await copyItem(room, scene, client, player, newItemInfo, catalogItem, info.item.aid)

                editParentingComponent(room, client,{action:'edit', aid:newAid, data:parentAid, sp:{...parentTransform.p}, sr:{...parentTransform.r}, pp:{...transform.p}, pr:{...transform.r}, force:true} , scene, player)
            }
        }
    // }
    

    
    
    // let omittedComponents:COMPONENT_TYPES[] = [
    //     COMPONENT_TYPES.PARENTING_COMPONENT,
    //     COMPONENT_TYPES.VISBILITY_COMPONENT,
    //     COMPONENT_TYPES.TRANSFORM_COMPONENT,
    //     COMPONENT_TYPES.IWB_COMPONENT,
    // ]

    // Object.values(COMPONENT_TYPES).forEach((component:any)=>{
    //     if(scene[component] && !omittedComponents.includes(component)){
    //         let itemInfo:any

    //         if(component === COMPONENT_TYPES.NAMES_COMPONENT){
    //             itemInfo = scene[component].get(info.item.aid)
    //             if(itemInfo){
    //                 itemInfo.value += " Copy"
    //             }
    //         }
    //         else{
    //             itemInfo = scene[component].get(info.item.duplicate)
    //             if(itemInfo){
    //                 let currentComponent:any = {...itemInfo}
    //                 currentComponent.aid = info.item.aid
    //                 console.log('copy component', component)

    //             // if(component === COMPONENT_TYPES.TRIGGER_COMPONENT){
    //             //     let triggers:any[] = []
    //             //     itemInfo.triggers.forEach((trigger:any)=>{
    //             //         triggers.push({
    //             //             type:trigger.type,
    //             //             input:trigger.input,
    //             //             pointer:trigger.pointer,

    //             //         })
    //             //     })
    //             // }
    
    //             createComponentFunctions[component](room, scene, client, player, currentComponent.aid, currentComponent)
    //             }
    //         }
    //     }
    // })
}