import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Scene } from "./Scene";
import { generateId } from "colyseus";
import { itemManager } from "../app.config";
import { addItemComponents, createNewItem } from "../rooms/messaging/ItemHandler";

export class ParentingComponent extends Schema{
    @type("string") aid:string
    @type("number") entity:number
    @type(["string"]) children:ArraySchema<string> = new ArraySchema<string>()

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
    console.log('creaging parenting component', data)
    let component = new ParentingComponent()
    component.aid = data.aid
    scene.parenting[data.parent ? data.parent : 0].children.push(data.aid)
    scene.parenting.push(component)
}

export function editParentingComponent(info:any, scene:Scene){
    let parentInfo = scene.parenting.find($=> $.aid === info.aid)
    if(parentInfo){
        let parentData = info.data
        switch(info.action){
            case 'edit':
                for(let i = 0; i < scene.parenting.length; i++){
                    const childIndex = scene.parenting[i].children.findIndex(child => child === info.aid)
                    if(childIndex >= 0){
                        scene.parenting[i].children.splice(childIndex, 1)
                        break
                    }
                }
        
                if(parentData.parent >= 0){
                    scene.parenting[parentData.parent].children.push(info.aid)
                    let transform = scene.transforms.get(info.aid)
                    if(transform){
                        transform.delta++
                    }
                }
                break;

            case 'newchild':
                console.log('need to create new child for parent')
                let newAid = generateId(6)
                let currentParentIndex = scene.parenting.findIndex($=> $.aid === info.aid)
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
                    createNewItem(scene, item, catalogItem)
                    // addItemComponents(scene, item, catalogItem)
                }
                break;
        }
    }
}