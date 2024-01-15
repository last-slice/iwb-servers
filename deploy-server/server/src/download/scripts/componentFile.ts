import * as fs from 'fs';
import { temporaryDirectory } from './index';

export async function writeComponentFile(data:any){
    let template = await writeComponentFunctions()
    await fs.writeFileSync(temporaryDirectory + data.o + "-" + data.id + '/src/iwb/components.ts', template);
}

export async function writeComponentFunctions(){
    let scene = `
import { Entity, GltfContainer, Material, NftShape, TextShape, VideoPlayer } from "@dcl/sdk/ecs"
import { Color4 } from "@dcl/sdk/math"

export function updateTextComponent(entity:Entity, item:any){
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

export function createGltfComponent(entity:Entity, item:any){
    let gltf:any = {
        src:"assets/3D/" + item.id + ".glb",
        invisibleMeshesCollisionMask: item.colComp && item.colComp.iMask ? item.colComp && item.colComp.iMask : undefined,
        visibleMeshesCollisionMask: item.colComp && item.colComp.vMask ? item.colComp && item.colComp.vMask : undefined
    }
    GltfContainer.create(entity, gltf)
}


export function updateImageUrl(entity:Entity, item:any){
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

export function createVideoComponent(entity:Entity, item:any){
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
}

export function updateNFTFrame(entity:Entity, item:any){
    NftShape.createOrReplace(entity, {
        urn: 'urn:decentraland:ethereum:erc721:' + item.nftComp.contract + ':' + item.nftComp.tokenId,
        style: item.nftComp.style
        })
}
`
    return scene
}