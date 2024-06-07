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
import { createCounterComponent } from "../../Objects/Counter";
import { createActionComponent, editActionComponent } from "../../Objects/Actions";
import { createTriggerComponent, editTriggerComponent } from "../../Objects/Trigger";
import { createPointerComponent, editPointerComponent } from "../../Objects/Pointers";

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
                    case 'Add':
                        addNewComponent(scene, info)
                        break;

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

                    case COMPONENT_TYPES.ACTION_COMPONENT:
                        editActionComponent(info, scene)
                        break;

                    case COMPONENT_TYPES.TRIGGER_COMPONENT:
                        editTriggerComponent(info, scene)
                        break;

                    case COMPONENT_TYPES.POINTER_COMPONENT:
                        editPointerComponent(info, scene)
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
                console.log('player is in build mode, can select item')
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
                // sceneroom.broadcast(SERVER_MESSAGE_TYPES.SELECT_NEW_ASSET, info)
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
                        //         sceneaddItemComponents(newItem, sceneItem, serverItem)
                        //     }else{

                        //         sceneaddItemComponents(newItem, sceneItem, player.selectedAsset && player.selectedAsset !== null && player.selectedAsset.componentData ? player.selectedAsset.componentData : undefined, player.dclData.userId)
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

function addNewComponent(scene:Scene, item:any){
    switch(item.type){
        case COMPONENT_TYPES.COUNTER_COMPONENT:
            if(!scene.counters.has(item.aid)){
                createCounterComponent(scene, item.aid, {})
            }
            break;

        case COMPONENT_TYPES.ACTION_COMPONENT:
            if(!scene.actions.has(item.aid)){
                createActionComponent(scene, item.aid, undefined)
            }
            break;

        case COMPONENT_TYPES.POINTER_COMPONENT:
            if(!scene.pointers.has(item.aid)){
                createPointerComponent(scene, item.aid, {})
            }
            break;
    }
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

        case 'Audio':
            createSoundComponent(scene, item.aid, {url:catalogItemInfo.m})
            createActionComponent(scene, item.aid, {actions:[{name:"Play Sound", type:"play_sound"}, {name:"Stop Sound", type:"stop_sound"}]})
            break;
    }

    catalogItemInfo.components && catalogItemInfo.components.forEach((component:any)=>{
        switch(component){
            case COMPONENT_TYPES.CLICK_AREA_COMPONENT:
                scene.clickAreas.set(item.aid, item.aid)
                createTriggerComponent(scene, item.aid, {
                    triggers:[
                        {
                            type: TRIGGER_TYPES.ON_INPUT_ACTION,
                            input:0,
                            conditions:[],
                            actions:[]
                        }
                    ]
                })
                break;

            // case COMPONENT_TYPES.AVATAR_SHAPE:
            //     createAvatarShapeComponent(scene, key, components)
            //     break;

            // case COMPONENT_TYPES.IWB_COMPONENT:
            //     setIWBComponent(scene, key, components)
            //     break;

            // case COMPONENT_TYPES.NAMES_COMPONENT:
            //     for (const aid in components[key]) {
            //         scenenames.set(aid, new NameComponent(components[key][aid]))
            //     }
            //     break;

            // case COMPONENT_TYPES.VISBILITY_COMPONENT:
            //     for (const aid in components[key]) {
            //         let vis = new VisibilityComponent(components[key][aid])
            //         vis.visible = true
            //         scenevisibilities.set(aid, new VisibilityComponent(components[key][aid]))
            //     }
            //     break;

            // case COMPONENT_TYPES.PARENTING_COMPONENT:
            //     components[key].forEach((info:any) => {
            //         sceneparenting.push(new ParentingComponent(info))
            //     });
            //     break;

            // case COMPONENT_TYPES.TRANSFORM_COMPONENT:
            //     for (const aid in components[key]) {
            //         scenetransforms.set(aid, new TransformComponent(components[key][aid]))
            //     }
            //     break;

            // case COMPONENT_TYPES.POINTER_COMPONENT:
            //     for (const aid in components[key]) {
            //         let pointerEvents = new PointerComponent()
            //         pointerEvents.events = new ArraySchema<PointerComponentEvent>()
            //         components[key][aid].pointerEvents.forEach((event:any)=>{
            //             let pointerEvent = new PointerComponentEvent()
            //             pointerEvent.hoverText = event.eventInfo.hoverText
            //             pointerEvent.maxDistance = event.eventInfo.maxDistance
            //             pointerEvent.showFeedback = event.eventInfo.showFeedback
            //             pointerEvent.eventType = event.eventType
            //             pointerEvent.button = event.eventInfo.button
            //             pointerEvents.events.push(pointerEvent)
            //         })
            //         scenepointers.set(aid, pointerEvents)
            //     }
            //     break;

            // case COMPONENT_TYPES.TEXT_COMPONENT:
                
            //     for (const aid in components[key]) {
            //         let textShape = new TextShapeComponent(components[key][aid]) 
            //         textShape.outlineColor = new Color4(components[key][aid].outlineColor)
            //         textShape.color = new Color4(components[key][aid].color)
            //         scenetextShapes.set(aid, textShape)
            //     }
            //     break;

            // case COMPONENT_TYPES.COUNTER_COMPONENT:
            //     for (const aid in components[key]) {
            //         createCounterComponent(scene, aid, components[key][aid])
            //     }
            //     break;

            // case COMPONENT_TYPES.AVATAR_SHAPE_COMPONENT:
            //     for (const aid in components[key]) {
            //         createAvatarShapeComponent(scene, aid, components[key][aid])
            //     }
            //     break;
        
            // case COMPONENT_TYPES.TRIGGER_COMPONENT:
               
            //     for (const aid in components[key]) {
            //         let data = components[key][aid]

            //         let trigger = new TriggerComponent()
            //         trigger.triggers = new ArraySchema<TriggerComponentSchema>()

            //         data.triggers.forEach((data:any)=>{
            //             let schema = new TriggerComponentSchema()
            //             schema.type = data.type
            //             schema.input = data.input
            //             schema.conditions = new ArraySchema<TriggerConditionComponent>()
            //             schema.actions = new ArraySchema<string>()

            //             data.conditions.forEach((condition:any)=>{
            //                 schema.conditions.push(new TriggerConditionComponent(condition))
            //             })

            //             data.actions.forEach((action:any)=>{
            //                 schema.actions.push(action.id)
            //             })
            //             trigger.triggers.push(schema)
            //         })

            //         scenetriggers.set(aid, trigger)
            //     }
            //     break;

            // case COMPONENT_TYPES.ACTION_COMPONENT:
                
            //     for (const aid in components[key]) {
            //         let data = components[key][aid]

            //         let action = new ActionComponent()
            //         action.actions = new ArraySchema<ActionComponentSchema>()

                    
            //         data.actions.forEach((data:any)=>{
            //             let schema = new ActionComponentSchema()
            //             schema.id = data.id
            //             schema.name = data.name
            //             schema.type = data.type
            //             schema.showText = data.text
            //             schema.value = data.value
            //             schema.counter = data.counter
            //             schema.state = data.state
            //             schema.visible = data.visible
            //             schema.vMask = data.vMask
            //             schema.iMask = data.iMask
            //             schema.url = data.url
            //             schema.moveCam = data.moveCam
            //             schema.movePos = data.movePos
            //             schema.emote = data.emote
            //             schema.moveRel = data.moveRel
            //             schema.anchor = data.anchor
            //             action.actions.push(schema)
            //         })     

            //         sceneactions.set(aid, action)
            //     }
            //     break;

            // case COMPONENT_TYPES.GLTF_COMPONENT:
            //     for (const aid in components[key]) {
            //         scenegltfs.set(aid, new GltfComponent(components[key][aid]))
            //     }
            //     break;

            // case COMPONENT_TYPES.MESH_RENDER_COMPONENT:
            //     for (const aid in components[key]) {
            //         scenemeshRenders.set(aid, new MeshRendererComponent(components[key][aid]))
            //     }
            //     break;

            // case COMPONENT_TYPES.MESH_COLLIDER_COMPONENT:
            //     for (const aid in components[key]) {
            //         scenemeshColliders.set(aid, new MeshColliderComponent(components[key][aid]))
            //     }
            //     break;

            // case COMPONENT_TYPES.TEXTURE_COMPONENT:
            //     for (const aid in components[key]) {
            //         scenetextures.set(aid, new TextureComponent(components[key][aid]))
            //     }
            //     break;

            // case COMPONENT_TYPES.EMISSIVE_TEXTURE_COMPONENT:
            //     for (const aid in components[key]) {
            //         createEmissiveComponent(scene, aid, components[key][aid])
            //     }
            //     break;

            //  case COMPONENT_TYPES.MATERIAL_COMPONENT:
            //     for (const aid in components[key]) {
            //         createMaterialComponent(scene, aid, components[key][aid])
            //     }
            //     break;

            //  case COMPONENT_TYPES.NFT_COMPONENT:
            //     for (const aid in components[key]) {
            //         createNftShapeComponent(scene, aid, components[key][aid])
            //     }
            //     break;

            // case COMPONENT_TYPES.STATE_COMPONENT:
             
            //     for (const aid in components[key]) {
            //         let data = components[key][aid]

            //         let state = new StateComponent()
            //         state.defaultValue = data.defaultValue

            //         state.values = new ArraySchema<string>()
            //         data.values.forEach((value:string)=>{
            //             state.values.push(value)
            //         })
            //         scenestates.set(aid, state)
            //     }
            //     break;

            // case COMPONENT_TYPES.SOUND_COMPONENT:
           
            //     for (const aid in components[key]) {
            //         scenesounds.set(aid, new SoundComponent(components[key][aid]))
            //     }
            //     break;

            // case COMPONENT_TYPES.VIDEO_COMPONENT:
              
            //     for (const aid in components[key]) {
            //         scenevideos.set(aid, new VideoComponent(components[key][aid]))
            //     }
            //     break;

            // case COMPONENT_TYPES.ANIMATION_COMPONENT:
              
            //     for (const aid in components[key]) {
            //         createAnimationComponent(scene, aid, components[key][aid])
            //     }
            //     break;

        }
    })
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