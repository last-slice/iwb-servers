import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Scene } from "./Scene";
import { Client, generateId } from "colyseus";
import { itemManager } from "../app.config";
import { addItemComponents, createNewItem, removeItem } from "../rooms/messaging/ItemHandler";
import { CATALOG_IDS, COMPONENT_TYPES } from "../utils/types";
import { IWBRoom } from "../rooms/IWBRoom";
import { Quaternion, Vector3 } from "./Transform";
import { Player } from "./Player";
import { rotateX, rotateY, rotateZ } from "../utils/functions";

export class ParentingComponent extends Schema{
    @type("string") aid:string
    @type("number") entity:number
    @type(["string"]) children:ArraySchema<string> = new ArraySchema<string>()
    components:any

    constructor(data?:any){
        super()
        if(data){
            this.aid = data.aid
            data.children && data.children.forEach((child:any)=>{
                this.children.push(child)
            })
        }
    }
}

export function createParentingComponent(scene:Scene, data:any){
    let component = new ParentingComponent()
    component.aid = data.aid
    scene[COMPONENT_TYPES.PARENTING_COMPONENT][data.parent ? data.parent : 0].children.push(data.aid)
    scene[COMPONENT_TYPES.PARENTING_COMPONENT].push(component)
}

export async function editParentingComponent(room:IWBRoom, client:Client, info:any, scene:Scene, player:Player){
    console.log("editing parent item", info)
    let parentInfo = scene[COMPONENT_TYPES.PARENTING_COMPONENT].find($=> $.aid === info.aid)
    if(parentInfo){
        let parentData = info.data
        switch(info.action){
            case 'edit':
                for(let i = 0; i < scene[COMPONENT_TYPES.PARENTING_COMPONENT].length; i++){
                    const childIndex = scene[COMPONENT_TYPES.PARENTING_COMPONENT][i].children.findIndex(child => child === info.aid)
                    if(childIndex >= 0){
                        scene[COMPONENT_TYPES.PARENTING_COMPONENT][i].children.splice(childIndex, 1)
                        break
                    }
                }
        
                if(parentData){
                    let parent = scene[COMPONENT_TYPES.PARENTING_COMPONENT].find(($:any)=> $.aid === parentData)
                    if(parent){
                        parent.children.push(info.aid)
                        // console.log('distance is', {x: info.sp.x - info.pp.x, y:info.sp.y - info.pp.y, z:info.sp.z - info.pp.z})
                        let newPosition:any
                        let newRotation:any

                        if(info.force){
                            newPosition = new Vector3({x: info.pp.x, y:info.pp.y, z:info.pp.z})
                            console.log('new forced position is', newPosition.x, newPosition.y, newPosition.z, newRotation)
    
                            newRotation = new Quaternion({x:info.pr.x, y:info.pr.y, z:info.pr.z})
                        }else{

                            let childLocalPosition = new Vector3({x: info.sp.x - info.pp.x, y:info.sp.y - info.pp.y, z:info.sp.z - info.pp.z})
                            let parentRotation = info.pr.y * (Math.PI / 180)

                            newPosition = rotateY(childLocalPosition, parentRotation);
                            newRotation = new Quaternion({x: info.sr.x - info.pr.x, y:info.sr.y - info.pr.y, z:info.sr.z - info.pr.z})
                        }
    
                        let transform = scene[COMPONENT_TYPES.TRANSFORM_COMPONENT].get(info.aid)
                        if(transform){
                            transform.p = newPosition
                            transform.r = newRotation
                            transform.delta++
                        }
                    }else{
                        console.log('did not find any parent, should we default back to scene root?')
                    }

                }
                break;

            case 'newchild':
                let currentParentIndex = scene[COMPONENT_TYPES.PARENTING_COMPONENT].findIndex($=> $.aid === info.aid)
                if(currentParentIndex >= 0){
                    return await addEntity(room, client, scene, player, currentParentIndex, true)
                }
                break;
        }
    }
}

export function addBasicSceneParenting(scene:Scene){
    let parenting = scene[COMPONENT_TYPES.PARENTING_COMPONENT]
    parenting.length = 0
    
    let sceneRoot = new ParentingComponent()
    sceneRoot.aid = "0"

    let playerRoot = new ParentingComponent()
    playerRoot.aid = "1"

    let cameraRoot = new ParentingComponent()
    cameraRoot.aid = "2"

    parenting.push(sceneRoot)
    parenting.push(playerRoot)
    parenting.push(cameraRoot)
}

// export async function removeParenting(scene:Scene, aid:string){
//     let parentIndex = scene[COMPONENT_TYPES.PARENTING_COMPONENT].findIndex(($:any) => $.aid === aid)
//     if(parentIndex >= 0){
//         //need to delete trigger references
//         //need to delete action references

//         console.log('parent index is', parentIndex)

//         for(let childIndex = 0; childIndex < scene[COMPONENT_TYPES.PARENTING_COMPONENT][parentIndex].children.length; childIndex++){
//             await removeParenting(scene, scene[COMPONENT_TYPES.PARENTING_COMPONENT][parentIndex].children[childIndex])
//         }
//         scene[COMPONENT_TYPES.PARENTING_COMPONENT].splice(parentIndex,1)
//     }

//     for(const parent of scene[COMPONENT_TYPES.PARENTING_COMPONENT]){
//         if(parent.children.includes(aid)){
//             let childIndex = parent.children.findIndex(($:any)=> $ === aid)
//             if(childIndex >= 0){
//                 parent.children.splice(childIndex, 1)
//                 return
//             }
//         }
//     }
// }

export async function removeParenting(room:IWBRoom, player:Player, scene:Scene, info:any, first?:boolean){
    if(first){
    // let parentsWithChildren = scene[COMPONENT_TYPES.PARENTING_COMPONENT].filter(obj => obj.children.length > 0);
    // const allChildrenStrings = parentsWithChildren.flatMap((obj:any) => obj.children);

        for(let i = 0; i < scene[COMPONENT_TYPES.PARENTING_COMPONENT].length; i++){
            let parent:any = scene[COMPONENT_TYPES.PARENTING_COMPONENT][i]
            parent.children = parent.children.filter(($:any)=> $ !== info.aid)
        }
    
    }

    let itemToDelete = scene[COMPONENT_TYPES.PARENTING_COMPONENT].find($ => $.aid === info.aid)
    if(itemToDelete){
        if(itemToDelete.children.length > 0){
            itemToDelete.children.forEach(async (aid:string, i:number)=>{
                await removeParenting(room, player, scene, {aid:aid})
                await removeItem(room, player, scene, {assetId:aid, childDelete:true}, undefined, true)
            })
        }
    }

    let itemToDeleteIndex = scene[COMPONENT_TYPES.PARENTING_COMPONENT].findIndex($ => $.aid === info.aid)
    if(itemToDeleteIndex >= 0){
        console.log('found top level item index to detele', itemToDeleteIndex)
        scene[COMPONENT_TYPES.PARENTING_COMPONENT].splice(itemToDeleteIndex,1)
    }



    // for(let i = 0; i < scene[COMPONENT_TYPES.PARENTING_COMPONENT].length; i++){
    //     if(i > 2){
    //         if(scene[COMPONENT_TYPES.PARENTING_COMPONENT][i].aid === aid){
    //             scene[COMPONENT_TYPES.PARENTING_COMPONENT].splice(i,1)
    //         }
    //     }
    // }
    
    // allChildrenStrings.forEach((aid:string, i:number)=>{
    //     console.log('children aid string', aid)
    //     if(scene[COMPONENT_TYPES.PARENTING_COMPONENT][i].aid === aid){
    //         scene[COMPONENT_TYPES.PARENTING_COMPONENT].splice(i,1)
    //         console.log("need to remove child entity")
    //         // removeItem(room, player, scene, info)
    //     }
    // })
}

export async function addEntity(room:IWBRoom, client:Client, scene:Scene, player:Player, parent?:any, child?:boolean){
    let newAid = generateId(6)
    let catalogItem = itemManager.items.get(CATALOG_IDS.EMPTY_ENTITY)
    let item:any = {...catalogItem}
    item.pending = false
    item.ugc = false
    item.parent = parent ? parent : 0,
    item.aid = newAid
    item.position = {x:0, y:0,z:0}
    item.rotation = {x:0, y:0,z:0}
    item.scale = {x:0, y:0,z:0}

    if(child){
        item.n = "Child-" + item.n
    }
    await createNewItem(room, client, scene, item, catalogItem)
    await addItemComponents(room, client, scene, player, item, catalogItem)
    return newAid
}