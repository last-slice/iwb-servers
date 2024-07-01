import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Scene } from "./Scene";
import { Client, generateId } from "colyseus";
import { itemManager } from "../app.config";
import { addItemComponents, createNewItem } from "../rooms/messaging/ItemHandler";
import { COMPONENT_TYPES } from "../utils/types";
import { IWBRoom } from "../rooms/IWBRoom";
import { Quaternion, Vector3 } from "./Transform";

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

export function editParentingComponent(room:IWBRoom, client:Client, info:any, scene:Scene){
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
        
                if(parentData.parent >=0){
                    scene[COMPONENT_TYPES.PARENTING_COMPONENT][parentData.parent].children.push(info.aid)
                    let newPosition = new Vector3({x: info.sp.x - info.pp.x, y:info.sp.y - info.pp.y, z:info.sp.z - info.pp.z})
                    let newRotation = new Quaternion({x: info.sr.x - info.pr.x, y:info.sr.y - info.pr.y, z:info.sr.z - info.pr.z})

                    let transform = scene[COMPONENT_TYPES.TRANSFORM_COMPONENT].get(info.aid)
                    if(transform){
                        transform.p = newPosition
                        transform.r = newRotation
                        transform.delta++
                    }
                }
                break;

            case 'newchild':
                let newAid = generateId(6)
                let currentParentIndex = scene[COMPONENT_TYPES.PARENTING_COMPONENT].findIndex($=> $.aid === info.aid)
                if(currentParentIndex){
                    let catalogItem = itemManager.items.get("b9768002-c662-4b80-97a0-fb0d0b714fab")
                    let item:any = {...catalogItem}
                    item.pending = false
                    item.ugc = false
                    item.parent = currentParentIndex,
                    item.aid = newAid
                    item.position = {x:0, y:0,z:0}
                    item.rotation = {x:0, y:0,z:0}
                    item.scale = {x:0, y:0,z:0}
                    createNewItem(room, client, scene, item, catalogItem)
                    // addItemComponents(scene, item, catalogItem)
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

export async function removeParenting(scene:Scene, aid:string){
    let parentIndex = scene[COMPONENT_TYPES.PARENTING_COMPONENT].findIndex(($:any) => $.aid === aid)
    if(parentIndex >= 0){
        //need to delete trigger references
        //need to delete action references

        for(let childIndex = 0; childIndex < scene[COMPONENT_TYPES.PARENTING_COMPONENT][parentIndex].children.length; childIndex++){
            await removeParenting(scene, scene[COMPONENT_TYPES.PARENTING_COMPONENT][parentIndex].children[childIndex])
        }
        scene[COMPONENT_TYPES.PARENTING_COMPONENT].splice(parentIndex,1)
    }

    for(const parent of scene[COMPONENT_TYPES.PARENTING_COMPONENT]){
        if(parent.children.includes(aid)){
            let childIndex = parent.children.findIndex(($:any)=> $ === aid)
            if(childIndex >= 0){
                parent.children.splice(childIndex, 1)
                return
            }
        }
    }
}