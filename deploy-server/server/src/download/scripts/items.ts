
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