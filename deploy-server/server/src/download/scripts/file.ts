import * as fs from 'fs';
import { temporaryDirectory } from './index';

export async function writeIWBFile(location:string, data:any){
    let template = await writeImports()
    template = await writeParent(template)
    template = await writeItems(template)
    template = await writeComponents(template)

    await fs.writeFileSync(location, template);
}

export async function writeImports(){
    let scene = `
import { Entity, GltfContainer, Material, MeshCollider, MeshRenderer, Transform, VideoPlayer, engine } from "@dcl/sdk/ecs"
import { Color4, Quaternion, Vector3 } from "@dcl/sdk/math"
import { scene } from "./config"
import * as IWB from './components'
import { enableSceneEntities } from './playMode'
`
    return scene
}

export async function writeParent(template:any){
    template += `
export let sceneParent:Entity
export let iwbAssets:any[] = []

export let itemIdsFromEntities: Map<number, any> = new Map()
export let entitiesFromItemIds: Map<string, Entity> = new Map()

export async function initIWBScene(){
    await createParent()
    await createSceneItems()
    enableSceneEntities(scene)
}

async function createParent(){
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
async function createSceneItems(){
    scene.entities = []
    
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
async function addAssetComponents(entity:Entity, item:any, type:string, name:string){

    IWB.createVisiblityComponent(entity, item)

    switch(type){
`
    template = await writeGLTFComponent(template)
    template = await write2DComponent(template)
    template = await writeAudioComponent(template)
    

    //end of addAssetComponents function
    template += `
    }
    iwbAssets.push({entity:entity, data:item})
    scene.entities.push(entity)

    itemIdsFromEntities.set(entity, item.aid)
    entitiesFromItemIds.set(item.aid, entity)
}`

    return template
}

async function writeGLTFComponent(template:any){
    template += `
    case '3D':
        IWB.createGltfComponent(entity, item)
        break;
`
    return template
}
async function write2DComponent(template:any){
    template +=`
    case '2D':
        if(item.colComp.vMask === 1){
            MeshCollider.setPlane(entity)
        }
        
        switch(name){
            case 'Image':
                MeshRenderer.setPlane(entity)
                IWB.updateImageUrl(entity, item)
                break;

            case 'Video':
                MeshRenderer.setPlane(entity)
                IWB.createVideoComponent(entity, item)
                break;

            case 'NFT Frame':
                IWB.updateNFTFrame(entity, item)
                break;

                case 'Text':
                IWB.updateTextComponent(entity, item)
                break;
                
            case 'Plane':
                MeshRenderer.setPlane(entity)
                // updateMaterialComponent(item.aid, item.matComp)
                break;
        }
        break;
`

    return template
}
async function writeAudioComponent(template:any){
    template += `
    case 'Audio':
        IWB.updateAudioComponent(entity, item)
        break;
`
    return template
}