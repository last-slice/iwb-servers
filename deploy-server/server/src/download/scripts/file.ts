import * as fs from 'fs';
import { temporaryDirectory } from './index';

export async function writeIWBFile(data:any){
    let template = await writeImports()
    template = await writeParent(template)
    template = await writeItems(template)
    template = await writeComponents(template)

    await fs.writeFileSync(temporaryDirectory + data.o + "-" + data.id + '/src/iwb/iwb.ts', template);
}

export async function writeImports(){
    let scene = `
import { Entity, GltfContainer, Material, MeshCollider, MeshRenderer, Transform, VideoPlayer, engine } from "@dcl/sdk/ecs"
import { Color4, Quaternion, Vector3 } from "@dcl/sdk/math"
import { scene } from "./config"
import { createGltfComponent, createVideoComponent, updateImageUrl, updateNFTFrame, updateTextComponent } from "./components"

`
    return scene
}

export async function writeParent(template:any){
    template += `
export let sceneParent:Entity

export function initIWBScene(){
    createParent()
    createSceneItems()
}

function createParent(){
    sceneParent = engine.addEntity()
     const [x1, y1] = scene.bpcl.split(",")
     let x = parseInt(x1)
     let y = parseInt(y1)
 
     Transform.create(sceneParent)
}
`
    return template
}

export async function writeItems(template:any){
    template += `
function createSceneItems(){
    scene.ass.forEach((item:any)=>{
        let entity = engine.addEntity()
        Transform.create(entity, {parent:sceneParent, position:item.p, rotation:Quaternion.fromEulerDegrees(item.r.x, item.r.y, item.r.z), scale:item.s})
        addAssetComponents(entity, item, item.type, item.n)
    })
}
`
return template
}

export async function writeComponents(template:any){
    template += `
    function addAssetComponents(entity:Entity, item:any, type:string, name:string){

        switch(type){
            case '3D':
                createGltfComponent(entity, item)
                break;
    
            case '2D':
                if(item.colComp.vMask === 1){
                    MeshCollider.setPlane(entity)
                }
                
                switch(name){
                    case 'Image':
                        MeshRenderer.setPlane(entity)
                        updateImageUrl(entity, item)
                        break;
    
                    case 'Video':
                        MeshRenderer.setPlane(entity)
                        createVideoComponent(entity, item)
                        break;
    
                    case 'NFT Frame':
                        updateNFTFrame(entity, item)
                        break;
    
                     case 'Text':
                        updateTextComponent(entity, item)
                        break;
                        
                    case 'Plane':
                        MeshRenderer.setPlane(entity)
                        // updateMaterialComponent(item.aid, item.matComp)
                        break;
                }
                break;
    
            case 'Audio':
                break;
        }
    }
`
return template
}