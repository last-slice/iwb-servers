import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Scene } from "./Scene";
import { Vector3, createTransformComponent } from "./Transform";

export class ParentingComponent extends Schema{
    @type("string") aid:string
    @type("number") entity:number
    @type(["string"]) children:ArraySchema<string> = new ArraySchema<string>()

    constructor(data?:any){
        super()
        if(data){
            this.aid = data.aid
            data.children.forEach((child:any)=>{
                this.children.push(child)
            })
        }
    }
}

export function createParentingComponent(scene:Scene, data:any){
    let component = new ParentingComponent()
    component.aid = data.aid
    scene.parenting[0].children.push(data.aid)
    scene.parenting.push(component)
}

export function editParentingComponent(info:any, scene:Scene){
    if(info.hasOwnProperty("parent")){
        for(let i = 0; i < scene.parenting.length; i++){
            const childIndex = scene.parenting[i].children.findIndex(child => child === info.aid)
            if(childIndex >= 0){
                scene.parenting[i].children.splice(childIndex, 1)
                break
            }
        }

        if(info.parent >= 0){
            scene.parenting[info.parent].children.push(info.aid)
        }
    }
}