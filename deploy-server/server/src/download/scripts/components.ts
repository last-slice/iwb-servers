export async function writeComponents(template:any){
    template += `
function addAssetComponents(entity:Entity, item:any, type:string, name:string){

    switch(type){
        case '3D':
            createGltfComponent(entity, item)
            break;

        case '2D':
            MeshRenderer.setPlane(entity)
            MeshCollider.setPlane(entity)
            
            switch(name){
                case 'Image':
                    updateImageUrl(entity, item.aid, item.matComp, item.imgComp.url)
                    break;

                case 'Video':
                    createVideoComponent(entity, item)
                    break;
            }
            break;

        case 'Audio':
            break;
    }
}

function createGltfComponent(entity:Entity, item:any){
    let gltf:any = {
        src:"assets/3D/" + item.id + ".glb",
        invisibleMeshesCollisionMask: item.colComp && item.colComp.iMask ? item.colComp && item.colComp.iMask : undefined,
        visibleMeshesCollisionMask: item.colComp && item.colComp.vMask ? item.colComp && item.colComp.vMask : undefined
    }
    GltfContainer.create(entity, gltf)
}

function updateImageUrl(entity:Entity, aid:string, materialComp:any, url:string){
    let texture = Material.Texture.Common({
        src: "" + url
    })
    
    Material.setPbrMaterial(entity, {
        metallic: parseFloat(materialComp.metallic),
        roughness:parseFloat(materialComp.roughness),
        specularIntensity:parseFloat(materialComp.intensity),
        emissiveIntensity: materialComp.emissPath !== "" ? parseFloat(materialComp.emissInt) : undefined,
        texture: texture,
        emissiveTexture: materialComp.emissPath !== "" ? materialComp.emissPath : undefined
        })
}

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
}
`
return template
}