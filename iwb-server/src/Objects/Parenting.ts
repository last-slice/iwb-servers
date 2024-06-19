import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Scene } from "./Scene";
import { generateId } from "colyseus";
import { itemManager } from "../app.config";
import { addItemComponents, createNewItem } from "../rooms/messaging/ItemHandler";
import { COMPONENT_TYPES } from "../utils/types";
import { IWBRoom } from "../rooms/IWBRoom";

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
    console.log('creaging parenting component', data)//
    let component = new ParentingComponent()
    component.aid = data.aid
    scene[COMPONENT_TYPES.PARENTING_COMPONENT][data.parent ? data.parent : 0].children.push(data.aid)
    scene[COMPONENT_TYPES.PARENTING_COMPONENT].push(component)
}

export function editParentingComponent(room:IWBRoom, info:any, scene:Scene){
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
        
                if(parentData.parent >= 0){
                    scene[COMPONENT_TYPES.PARENTING_COMPONENT][parentData.parent].children.push(info.aid)
                    let transform = scene[COMPONENT_TYPES.TRANSFORM_COMPONENT].get(info.aid)
                    if(transform){
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
                    createNewItem(room, scene, item, catalogItem)
                    // addItemComponents(scene, item, catalogItem)
                }
                break;
        }
    }
}