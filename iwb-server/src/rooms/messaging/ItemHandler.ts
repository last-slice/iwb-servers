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
import { IWBComponent, createIWBComponent, editIWBComponent } from "../../Objects/IWB";
import { createNameComponent } from "../../Objects/Names";
import { GltfComponent, createGLTFComponent } from "../../Objects/Gltf";
import { createParentingComponent } from "../../Objects/Parenting";
import { AnimatorComponentSchema, createAnimationComponent } from "../../Objects/Animator";
import { createSoundComponent } from "../../Objects/Sound";
import { createMaterialComponent } from "../../Objects/Materials";
import { createMeshComponent } from "../../Objects/Meshes";
import { createVideoComponent } from "../../Objects/Video";

export function iwbItemHandler(room:IWBRoom){
    room.onMessage(SERVER_MESSAGE_TYPES.EDIT_SCENE_ASSET, (client:Client, info:any)=>{
        console.log("edit asset message", info)
        let scene = room.state.scenes.get(info.sceneId)
        if(scene){
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
            }
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
                room.broadcast(SERVER_MESSAGE_TYPES.SCENE_ADD_ITEM, info)

                player.removeSelectedAsset()
            }else{
                console.log('something wrong here with adding item', info)
            }
        })
}

function canBuild(room:IWBRoom, user:string, sceneId:any){
    let scene:Scene = room.state.scenes.get(sceneId)
    if(scene){
       //  console.log('can build')
        return scene.bps.includes(user) || user === iwbManager.worlds.find((w) => w.ens === room.state.world).owner;
    }else{
        // console.log('cannot build')
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
    createParentingComponent(scene, item)
    createIWBComponent(scene, {scene:item, item:catalogItemInfo})
    createNameComponent(scene, {scene:item, item:catalogItemInfo})
    createVisibilityComponent(scene, item)
    createTransformComponent(scene, item)
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
                    createMeshComponent(scene, 
                        {
                            aid:item.aid, 
                            type:0, 
                            collision:-500
                        }
                    )
                    createMaterialComponent(scene, item.aid,
                        {
                            type:"video",
                            // texture:{
                            //     src:""
                            // },
                            // emissive:{
                            //     src:"",
                            //     intensity:1,
                            //     color:{r:1,g:1,b:1,a:1}
                            // }
                        }
                    )

                    break;

                case 'Image':
                    createMeshComponent(scene, 
                        {
                            aid:item.aid, 
                            type:0, 
                            collision:-500
                        }
                    )
                    createMaterialComponent(scene, item.aid,
                        {
                            type:"pbr",
                            texture:{
                                src:""
                            }
                        }
                    )
                    break;
            }
            break;

        case 'Audio':
            createSoundComponent(scene, item.aid, catalogItemInfo)
            break;
    }
}

