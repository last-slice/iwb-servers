import * as fs from 'fs';

export async function writePlayModeFile(location:string, data:any){
    let template = await writeFile()
    await fs.writeFileSync(location, template);
}

async function writeFile(){
    let scene = await writeImports()
    scene = await writeEnableSceneEntities(scene)
    scene = await writeGetSceneItem(scene)
    scene = await writeSceneEntryTrigger(scene)
    scene = await writeCheckAnimations(scene)
    scene = await writeCheckPointers(scene)
    scene = await writeCheckSmartItem(scene)
    scene = await writeDelayedTimerFunctions(scene)
    scene = await writeExports(scene)
    return scene
}

export async function writeImports(){
    let scene = `
    import {
        Animator,
        AudioSource,
        AudioStream,
        AvatarShape,
        ColliderLayer,
        Entity,
        GltfContainer,
        Material,
        MeshCollider,
        MeshRenderer,
        NftShape,
        TextShape,
        Transform,
        VideoPlayer,
        VisibilityComponent,
        PointerEventType,
        PointerEvents,
        engine
    } from "@dcl/sdk/ecs";
import * as utils from '@dcl-sdk/utils'
import { Color4, Quaternion } from "@dcl/sdk/math"
import {COLLISION_LAYERS, COMPONENT_TYPES, IWBScene, MATERIAL_TYPES, Materials, SCENE_MODES, SceneItem, SelectedItem, Triggers} from "./types";
import { iwbAssets, sceneParent, itemIdsFromEntities } from './iwb'
import { runTrigger } from './actions'

export let delayedActionTimers:any[] = []
`
    return scene
}

async function writeEnableSceneEntities(scene:any){
    scene += `
function enableSceneEntities(scene: any) {
    findSceneEntryTrigger(scene)

    for(let i = 0; i < scene.entities.length; i++){
        let entity = scene.entities[i]
        let sceneItem = getSceneItem(scene, entity)
        if(sceneItem){
            checkAnimation(entity, sceneItem)
            // check3DCollision(entity, sceneItem)
            // checkVideo(entity, sceneItem)
            // checkA
            // check2DCollision(entity, sceneItem)
    
            checkSmartItem(entity, sceneItem, scene)
            checkPointers(entity, sceneItem)
        }
    }
} 
`
    return scene
}

async function writeGetSceneItem(scene:any){
    scene += `
function getSceneItem(scene:IWBScene, entity:Entity){
    let assetId = itemIdsFromEntities.get(entity)
    if(assetId){
        let sceneItem = scene.ass.find((a)=> a.aid === assetId)
        if(sceneItem){
            return sceneItem
        }else{
            return false
        }
    }else{
        return false
    }
}
`
return scene
}

async function writeSceneEntryTrigger(scene:any){
    scene += `
function findSceneEntryTrigger(scene:IWBScene){
    let triggerAssets = scene.ass.filter((asset:SceneItem)=> asset.trigComp)
    triggerAssets.forEach((tasset:SceneItem)=>{
        let triggers = tasset.trigComp.triggers.filter((trig:any)=> trig.type === Triggers.ON_ENTER)
        triggers.forEach((trigger:any)=>{
            runTrigger(tasset, trigger.actions)
        })
    })
}
`
    return scene
}

async function writeCheckAnimations(scene:any){
    scene += `
function checkAnimation(entity:Entity, sceneItem: any){
    console.log('checking animations for play mode', sceneItem)
    if(sceneItem.animComp && sceneItem.animComp.enabled && sceneItem.animComp.autostart){
        Animator.deleteFrom(entity)

        let animations:any[] = []

        sceneItem.animComp.animations.forEach((animation:string, i:number)=>{
            let anim:any = {
                clip:animation,
                playing: sceneItem.animComp.autostart && sceneItem.animComp.startIndex === i ? true : false,
                loop: sceneItem.animComp.autoloop && sceneItem.animComp.autostart && sceneItem.animComp.startIndex === i ? true : false
            }
            animations.push(anim)
        })

        Animator.createOrReplace(entity, {
            states:animations
        })
    }
}
`
    return scene
}

async function writeCheckPointers(scene:any){
    scene += `
export function checkPointers(entity:Entity, sceneItem: SceneItem){
    console.log('checking pointer', sceneItem.trigComp)
    if(sceneItem.trigComp && sceneItem.trigComp.triggers.length > 0 && sceneItem.trigComp.enabled){
        let pointers:any[] = []
        sceneItem.trigComp.triggers.forEach((trigger:any, i:number)=>{
            pointers.push(
                {
                    eventType: PointerEventType.PET_DOWN,
                    eventInfo: {
                        button: trigger.pointer,
                        hoverText: "" + trigger.hoverText,
                        maxDistance: trigger.distance
                    }
                }
            )
        })

        PointerEvents.createOrReplace(entity,{
            pointerEvents:pointers
        })
    }
}
`
return scene
}

async function writeCheckSmartItem(scene:any){
    scene += `
function checkSmartItem(entity:Entity, sceneItem: SceneItem, scene:IWBScene){
    console.log("checking smart item for play mode", sceneItem)
    MeshRenderer.deleteFrom(entity)
    MeshCollider.deleteFrom(entity)
    Material.deleteFrom(entity)

    switch(sceneItem.n){
        case 'Trigger Area':
            if(sceneItem.trigArComp && sceneItem.trigArComp.enabled){
                utils.triggers.enableTrigger(entity, sceneItem.trigArComp.enabled)
            }else{
                utils.triggers.enableTrigger(entity, false)
            }
            break;

        case 'Click Area':
            if(sceneItem.trigComp && sceneItem.trigComp.enabled){
                MeshCollider.setBox(entity, ColliderLayer.CL_POINTER)
            }
            break;

        case 'NPC':
            Transform.createOrReplace(entity, {
                parent: sceneParent,
                position: sceneItem.p,
                rotation: Quaternion.fromEulerDegrees(sceneItem.r.x, sceneItem.r.y, sceneItem.r.z),
                scale: sceneItem.s
            })
            break;
    }
}
`
return scene
}

async function writeDelayedTimerFunctions(scene:any){
    scene += `
export function addDelayedActionTimer(timer:any){
    delayedActionTimers.push(timer)
}

export function disableDelayedActionTimers(){
    delayedActionTimers.forEach((timer)=>{
        utils.timers.clearTimeout(timer)
    })
    delayedActionTimers.length = 0
}
`
return scene
}

async function writeExports(scene:any){
    scene +=`
export {
    enableSceneEntities
}
`
    return scene
}