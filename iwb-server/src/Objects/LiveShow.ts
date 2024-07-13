import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Quaternion, Vector3 } from "./Transform";
import { Scene } from "./Scene";
import { COMPONENT_TYPES } from "../utils/types";

export class LiveShowComponent extends Schema{
    @type(["string"]) admins:ArraySchema<string> = new ArraySchema()
    @type(["string"]) n:ArraySchema<string> = new ArraySchema()
    @type([Vector3]) p:ArraySchema<Vector3> = new ArraySchema()
    @type([Vector3]) l:ArraySchema<Vector3> = new ArraySchema()
}

export function createLiveComponent(scene:Scene, aid:string, data:any){
    let component:any = new LiveShowComponent()
    for(let key in data){
        if(key === "admins"){
            data.admins.forEach((admin:string)=>{
                component.admins.push(admin)
            })
        }else if(key === "p" || key === "l"){
            data[key].forEach((vector:any)=>{
                component[key].push(new Vector3(vector))
            }) 
        }else if(key === "n"){
            data[key].forEach((name:any)=>{
                component[key].push(name)
            }) 
        }
        else{
            component[key] = data[key]
        }
        
    }
    scene[COMPONENT_TYPES.LIVE_COMPONENT].set(aid, component)
}

export function editLiveComponent(info:any, scene:Scene){
    let itemInfo:LiveShowComponent = scene[COMPONENT_TYPES.LIVE_COMPONENT].get(info.aid)
    if(itemInfo){
        switch(info.action){
            case 'addBounce':
                itemInfo.n.push(info.data.n)
                itemInfo.p.push(new Vector3(info.data.p))
                itemInfo.l.push(new Vector3(info.data.l))
                break;

            case 'deletebounce':
                itemInfo.n.splice(info.data, 1)
                itemInfo.p.splice(info.data, 1)
                itemInfo.l.splice(info.data, 1)
                break;
        }
    }
}