import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Scene } from "./Scene";
import { COMPONENT_TYPES } from "../utils/types";
import { Vector3 } from "./Transform";

export class RaycastComponent extends Schema{
    @type("string") id:string
    @type("string") targetAid:string
    @type("number") type:number = 2 //0 - local, 1 - global, 2 - global target - 3, target entity
    @type("number") maxD:number = 1
    @type("number") hit:number = 1 //0 - first, 1 - all, 2 - none
    @type("number") mask:number
    @type("boolean") cont:boolean = true
    @type(Vector3) direction:Vector3
    @type(Vector3) targetV:Vector3

    laserEntity:any
}


export function createRaycastComponent(scene:Scene, aid:string, data?:any){
    console.log('creating raycast component',data)
    let component:any = new RaycastComponent()
    if(data){
        for(let key in data){
            // if(key === "claims"){
            //     component.claims =
            //     data.claims.forEach((claim:string)=>{
            //         component.claims.pu
            //     })
            // }else{
                component[key] = data[key]
            // }
        }
    }
    scene[COMPONENT_TYPES.RAYCAST_COMPONENT].set(aid, component)
}
