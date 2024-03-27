import * as fs from 'fs';
import { temporaryDirectory } from './index';

export async function writeComponentFile(location:string, data:any){
    let template = await writeComponentFunctions()
    await fs.writeFileSync(location, template);
}

export async function writeComponentFunctions(){
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
        engine
    } from "@dcl/sdk/ecs";
import { Color4 } from "@dcl/sdk/math"
import {COLLISION_LAYERS, COMPONENT_TYPES, IWBScene, MATERIAL_TYPES, Materials, SCENE_MODES, SceneItem, SelectedItem} from "./types";

`
    scene = await writeVisibilityComponent(scene)
    scene = await writeTextComponent(scene)
    scene = await writeGLTFComponent(scene)
    scene = await writeImageComponent(scene)
    scene = await writeVideoComponent(scene)
    scene = await writeNFTComponent(scene)
    scene = await writeAudioComponent(scene)
    scene = await writeAnimationComponent(scene)
    scene = await writeExports(scene)
    return scene
}

async function writeVisibilityComponent(scene:any){
    scene += `
function createVisiblityComponent(entity:Entity, item:any){
    if(item.comps.includes(COMPONENT_TYPES.VISBILITY_COMPONENT)){
        VisibilityComponent.create(entity, {
            visible:  item.visComp.visible
        })
    }
}
`
    return scene
}

async function writeTextComponent(scene:any){
    scene += `
function updateTextComponent(entity:Entity, item:any){
    TextShape.createOrReplace(entity,{
        text: item.textComp.text,
        textColor: item.textComp.color,
        font: item.textComp.font,
        fontSize: item.textComp.fontSize,
        textAlign: item.textComp.align,
        outlineWidth: item.textComp.outlineWidth > 0 ? item.textComp.outlineWidth : undefined,
        outlineColor: item.textComp.outlineWidth > 0 ? item.textComp.outlineColor : undefined
    })
}
`
    return scene
}

async function writeGLTFComponent(scene:any){
    scene +=`
function createGltfComponent(entity:Entity, item:any){
    let gltf:any = {
        src:"assets/" + item.id + ".glb",
        invisibleMeshesCollisionMask: item.colComp && item.colComp.iMask ? item.colComp && item.colComp.iMask : undefined,
        visibleMeshesCollisionMask: item.colComp && item.colComp.vMask ? item.colComp && item.colComp.vMask : undefined
    }
    GltfContainer.create(entity, gltf)

    if(item.animComp && item.animComp.enabled){
        console.log("item has anim comp", item.animComp)
        addAnimationComponent(entity, item)
    }
}
`
    return scene
}

async function writeImageComponent(scene:any){
    scene +=`
function updateImageUrl(entity:Entity, item:any){
    let texture = Material.Texture.Common({
        src: "" + item.imgComp.url
    })

    if(item.matComp.type === "Basic"){
        Material.setBasicMaterial(entity, {
            texture: texture,
        })
    }else{
        Material.setPbrMaterial(entity, {
            metallic: parseFloat(item.matComp.metallic),
            roughness:parseFloat(item.matComp.roughness),
            specularIntensity:parseFloat(item.matComp.intensity),
            emissiveIntensity: item.matComp.emissPath !== "" ? parseFloat(item.matComp.emissInt) : undefined,
            texture: texture,
            emissiveTexture: item.matComp.emissPath !== "" ? item.matComp.emissPath : undefined
            })
    }
}
`
    return scene
}

async function writeVideoComponent(scene:any){
    scene +=`
function createVideoComponent(entity:Entity, item:any){
    VideoPlayer.create(entity, {
        src: item.vidComp.url,
        playing: item.vidComp.autostart,
        volume: item.vidComp.volume,
        loop: item.vidComp.loop
    })

    const videoTexture = Material.Texture.Video({ videoPlayerEntity: entity })

    Material.setPbrMaterial(entity, {
        texture: videoTexture,
        roughness: 1.0,
        specularIntensity: 0,
        metallic: 0,
        emissiveColor:Color4.White(),
        emissiveIntensity: 1,
        emissiveTexture: videoTexture
    })
    item.videoTexture = videoTexture
}
`
    return scene
}

async function writeNFTComponent(scene:any){
    scene +=`
function updateNFTFrame(entity:Entity, item:any){
    NftShape.createOrReplace(entity, {
        urn: 'urn:decentraland:ethereum:erc721:' + item.nftComp.contract + ':' + item.nftComp.tokenId,
        style: item.nftComp.style
        })
}
`
    return scene
}

async function writeAudioComponent(scene:any){
    scene +=`
function updateAudioComponent(entity:Entity, item:any){
    if(item.stream){
        AudioStream.create(entity, {
            url: item.audComp.url,
            playing: item.audComp.autostart,
            volume: item.audComp.volume,
        })
    }else{
        console.log('here')
        AudioSource.create(entity, {
            audioClipUrl: item.audComp.url,
            playing: item.audComp.autostart,
            volume: item.audComp.volume,
            loop: item.audComp.loop
        })
    }

    if(item.audComp.attachedPlayer){
        Transform.createOrReplace(entity, {parent:engine.PlayerEntity})
    }
}
`
    return scene
}

async function writeAnimationComponent(scene:any){
    scene +=`
    function addAnimationComponent(entity:Entity, item:SceneItem){
        let animations:any[] = []
    
        item.animComp.animations.forEach((animation:string, i:number)=>{
            let anim:any = {
                clip:animation,
                playing: false,
                loop: false
            }
            animations.push(anim)
        })
    
        Animator.createOrReplace(entity, {
            states:animations
        })
    }
`
    return scene
}


async function writeExports(scene:any){
    scene +=`
export {
    createVisiblityComponent,
    createGltfComponent, 
    updateTextComponent, 
    updateImageUrl, 
    createVideoComponent, 
    updateNFTFrame, 
    updateAudioComponent
}
`
    return scene
}