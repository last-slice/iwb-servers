import { Client } from "colyseus";
import { IWBRoom } from "../IWBRoom";
import { COMPONENT_TYPES, SCENE_MODES, SERVER_MESSAGE_TYPES } from "../../utils/types";
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
import { ParentingComponent, createParentingComponent, editParentingComponent } from "../../Objects/Parenting";
import { AnimatorComponentSchema, createAnimationComponent } from "../../Objects/Animator";
import { createSoundComponent, editAudioComponent } from "../../Objects/Sound";
import { createMaterialComponent } from "../../Objects/Materials";
import { createVideoComponent, editVideoComponent } from "../../Objects/Video";
import { IWBComponent, createIWBComponent, editIWBComponent } from "../../Objects/IWB";
import { editNftShape } from "../../Objects/NftShape";
import { createMeshRendererComponent, editMeshRendererComponent } from "../../Objects/MeshRenderers";
import { createMeshColliderComponent, editMeshColliderComponent } from "../../Objects/MeshColliders";
import { createTextureComponent, editTextureComponent } from "../../Objects/Textures";
import { createEmissiveComponent } from "../../Objects/Emissive";

export function iwbItemHandler(room:IWBRoom){
    room.onMessage(SERVER_MESSAGE_TYPES.EDIT_SCENE_ASSET, (client:Client, info:any)=>{
        console.log("edit asset message", info)
        let scene = room.state.scenes.get(info.sceneId)
        let player = room.state.players.get(client.userData.userId)

        if(scene && canBuild(room, player.address, scene.id)){
            let itemInfo = scene.itemInfo.get(info.aid)
            if(itemInfo){
                itemInfo.editing = true
                itemInfo.editor = client.userData.userId

                switch(info.component){
                    case COMPONENT_TYPES.TRANSFORM_COMPONENT:
                        editTransform(client, info, scene)
                        break;
    
                    case COMPONENT_TYPES.VISBILITY_COMPONENT:
                        editVisibility(client, info, scene)
                        break;
    
                    case COMPONENT_TYPES.TEXT_COMPONENT:
                        editTextShape(client, info, scene)
                        break;
    
                    case COMPONENT_TYPES.IWB_COMPONENT:
                        editIWBComponent(info, scene)
                        break;
    
                    case COMPONENT_TYPES.NAMES_COMPONENT:
                        editNameComponent(info, scene)
                        break;
                        
                    case COMPONENT_TYPES.AUDIO_COMPONENT:
                        editAudioComponent(info, scene)
                        break;
    
                    case COMPONENT_TYPES.NFT_COMPONENT:
                        editNftShape(info, scene)
                        break;
    
                    case COMPONENT_TYPES.GLTF_COMPONENT:
                        editGltfComponent(info, scene)
                        break;
    
                    case COMPONENT_TYPES.VIDEO_COMPONENT:
                        editVideoComponent(info, scene)
                        break;
    
                    case COMPONENT_TYPES.MESH_COLLIDER_COMPONENT:
                        editMeshColliderComponent(info, scene)
                        break;
    
                    case COMPONENT_TYPES.MESH_RENDER_COMPONENT:
                        editMeshRendererComponent(info, scene)
                        break;
    
                    case COMPONENT_TYPES.TEXTURE_COMPONENT:
                        editTextureComponent(info, scene)
                        break;

                    case COMPONENT_TYPES.PARENTING_COMPONENT:
                        editParentingComponent(info, scene)
                        break;
                }
            }
        }
      })

    room.onMessage(SERVER_MESSAGE_TYPES.EDIT_SCENE_ASSET_DONE, (client:Client, info:any)=>{
        console.log("edit asset message", info)
        let scene = room.state.scenes.get(info.sceneId)
        if(scene){
            let player = room.state.players.get(client.userData.userId)
            let itemInfo = scene.itemInfo.get(info.aid)
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
                // let catalogItem = item.ugc ? room.state.realmAssets.get(item.id) : itemManager.items.get(item.id)

                player.addSelectedAsset(info)

                // pushPlayfabEvent(
                //     SERVER_MESSAGE_TYPES.SCENE_ADD_ITEM, 
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
                // this.room.broadcast(SERVER_MESSAGE_TYPES.SELECT_NEW_ASSET, info)
            }else{
                // console.log('player is not in create scene mode')
            }
        })

    room.onMessage(SERVER_MESSAGE_TYPES.SCENE_ADD_ITEM, async(client, info)=>{
        console.log(SERVER_MESSAGE_TYPES.SCENE_ADD_ITEM + " message", info)

        let player:Player = room.state.players.get(client.userData.userId)
        if(player && player.mode === SCENE_MODES.BUILD_MODE && canBuild(room, client.userData.userId, info.item.sceneId)){
            const {item} = info

            let scene = room.state.scenes.get(info.item.sceneId)
            if(scene){
                let catalogItem = item.ugc ? room.state.realmAssets.get(item.id) : itemManager.items.get(item.id)
                console.log('catalog item is', catalogItem)
                if(catalogItem){
                    if(checkSceneLimits(scene, catalogItem)){

                        scene.pc += catalogItem.pc

                        let size = catalogItem.si
                        scene.itemInfo.forEach((item:IWBComponent, aid:string)=>{
                            if(item.id === catalogItem.id){
                                size = 0
                            }
                        })
                        scene.si += size

                        createNewItem(scene, item, catalogItem)

                        if(item.duplicate){
                            console.log('need to copy item')
                        //     let serverItem = scene.ass.find((as)=> as.aid === item.duplicate)
                        //     if(serverItem){
                        //         this.addItemComponents(newItem, sceneItem, serverItem)
                        //     }else{

                        //         this.addItemComponents(newItem, sceneItem, player.selectedAsset && player.selectedAsset !== null && player.selectedAsset.componentData ? player.selectedAsset.componentData : undefined, player.dclData.userId)
                        //     }

                        //     pushPlayfabEvent(
                        //         SERVER_MESSAGE_TYPES.SCENE_COPY_ITEM, 
                        //         player, 
                        //         [{name:sceneItem.n, type:sceneItem.ty}]
                        //     )

                        }

                        else{
                            addItemComponents(scene, item, catalogItem)

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
            // room.broadcast(SERVER_MESSAGE_TYPES.SCENE_ADD_ITEM, info)

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

    room.onMessage(SERVER_MESSAGE_TYPES.PLAYER_CANCELED_CATALOG_ASSET, async(client, info)=>{
        console.log(SERVER_MESSAGE_TYPES.PLAYER_CANCELED_CATALOG_ASSET + " message", info)

        let player:Player = room.state.players.get(client.userData.userId)
        let scene = room.state.scenes.get(info.sceneId)
        if(scene && player && player.mode === SCENE_MODES.BUILD_MODE && canBuild(room, player.address, scene.id)){
            player.removeSelectedAsset()
        }
    })
}

function canBuild(room:IWBRoom, user:string, sceneId:any){
    let scene:Scene = room.state.scenes.get(sceneId)
    if(scene){
       //  console.log('can build')
        return scene.bps.includes(user) || user === iwbManager.worlds.find((w) => w.ens === room.state.world).owner;
    }else{
        console.log('cannot build')
        return false
    }
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

function createNewItem(scene:Scene, item:any, catalogItemInfo:any){
    createIWBComponent(scene, {scene:item, item:catalogItemInfo})
    createNameComponent(scene, {scene:item, item:catalogItemInfo})
    createVisibilityComponent(scene, item)
    createTransformComponent(scene, item)
    createParentingComponent(scene, item)
}

function addItemComponents(scene:Scene, item:any, catalogItemInfo:any){
    // if(item.type === "SM"){}
    // else{

    // }

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
            createGLTFComponent(scene, {aid:item.aid, src:catalogItemInfo.id, visibleCollision:1, invisibleCollision:2})
            break;

        case '2D':
            switch(catalogItemInfo.n){
                case 'Text':
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
            }
            break;

        case 'Audio':
            createSoundComponent(scene, item.aid, catalogItemInfo)
            break;
    }
}

function deleteSceneItem(room:IWBRoom, player:Player, info:any, edit?:boolean){
    try{
        if(player && player.mode === SCENE_MODES.BUILD_MODE){
            let scene = room.state.scenes.get(info.sceneId)
            if(scene && canBuild(room, player.address, scene.id)){
                let itemInfo = scene.itemInfo.get(info.assetId)
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

                    if(edit){}
                    else{
                        player.removeSelectedAsset()
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

function removeAllAssetComponents(scene:Scene, aid:string){
    scene.transforms.delete(aid)
    scene.gltfs.delete(aid)
    scene.meshRenders.delete(aid)
    scene.meshColliders.delete(aid)
    scene.materials.delete(aid)
    scene.textures.delete(aid)
    scene.emissives.delete(aid)
    scene.names.delete(aid)
    scene.visibilities.delete(aid)
    scene.actions.delete(aid)
    scene.counters.delete(aid)
    // scene.counterbars.delete(aid)
    scene.states.delete(aid)
    scene.triggers.delete(aid)
    scene.textShapes.delete(aid)
    scene.animators.delete(aid)
    scene.pointers.delete(aid)
    scene.sounds.delete(aid)
    scene.videos.delete(aid)
    // scene.rewards.delete(aid)
    scene.itemInfo.delete(aid)
    scene.nftShapes.delete(aid)

    let parentIndex = scene.parenting.findIndex($ => $.aid === aid)
    if(parentIndex >= 0){
        scene.parenting.splice(parentIndex,1)
    }
}