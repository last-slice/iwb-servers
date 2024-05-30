import { Client } from "colyseus";
import { IWBRoom } from "../IWBRoom";
import { COMPONENT_TYPES, SCENE_MODES, SERVER_MESSAGE_TYPES } from "../../utils/types";
import { Quaternion, Vector3, createTransformComponent, editTransform } from "../../Objects/Transform";
import { createVisibilityComponent, editVisibility } from "../../Objects/Visibility";
import { editTextShape } from "../../Objects/TextShape";
import { Player } from "../../Objects/Player";
import { pushPlayfabEvent } from "../../utils/Playfab";
import { itemManager, iwbManager } from "../../app.config";
import { Scene } from "../../Objects/Scene";
import { IWBComponent, createIWBComponent } from "../../Objects/IWB";
import { createNameComponent } from "../../Objects/Names";
import { GltfComponent, createGLTFComponent } from "../../Objects/Gltf";
import { createParentingComponent } from "../../Objects/Parenting";

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
                    let sceneItem = item.ugc ? room.state.realmAssets.get(item.id) : itemManager.items.get(item.id)
                    // console.log('scene item is', sceneItem)
                    if(sceneItem){
                        if(checkSceneLimits(scene, sceneItem)){

                            createNewItem(scene, item, sceneItem)

                            // const newItem = createNewItem(item, sceneItem)
    
                            // if(item.duplicate !== null){
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

                            // }else{
                            //     this.addItemComponents(newItem, sceneItem, player.selectedAsset && player.selectedAsset !== null && player.selectedAsset.componentData ? player.selectedAsset.componentData : undefined)
                                
                            //     pushPlayfabEvent(
                            //         SERVER_MESSAGE_TYPES.SCENE_ADD_ITEM, 
                            //         player, 
                            //         [{name:sceneItem.n, type:sceneItem.ty}]
                            //     )
                            // }
       
                            // scene.ass.push(newItem)
                            // scene.pc += sceneItem.pc
                            // scene.si += scene.ass.find((asset:any)=> asset.id === sceneItem.id) ? 0 : sceneItem.si
                        
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

function createNewItem(scene:Scene, item:any, sceneItem:any){
    createParentingComponent(scene, item)
    createIWBComponent(scene, {scene:item, item:sceneItem})
    createNameComponent(scene, {scene:item, item:sceneItem})
    createVisibilityComponent(scene, item)
    createTransformComponent(scene, item)

    console.log('scne item', sceneItem)

    switch(sceneItem.ty){
        case '3D':
            createGLTFComponent(scene, {aid:item.aid, src:sceneItem.id, visibleCollision:1, invisibleCollision:2})
            break;
    }

}

