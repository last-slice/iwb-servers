
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