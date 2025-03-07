import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Quaternion, Vector3 } from "./Transform";
import { Scene } from "./Scene";
import { COMPONENT_TYPES } from "../utils/types";

export class SceneAdminComponent extends Schema{
    @type(["string"]) admins:ArraySchema<string> = new ArraySchema()
    @type(["string"]) n:ArraySchema<string> = new ArraySchema()
    @type([Vector3]) p:ArraySchema<Vector3> = new ArraySchema()
    @type([Vector3]) l:ArraySchema<Vector3> = new ArraySchema()
}

export function createAdminComponent(scene:Scene, data:any){
    console.log('creating admin component', data)
    let component:any = new SceneAdminComponent()
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
    scene.metadata.admin.set(scene.id, component)
}

export function editSceneAdminComponent(info:any, scene:Scene){
    let itemInfo:SceneAdminComponent = scene.metadata.admin.get(scene.id)
    if(itemInfo){
        switch(info.type){
            case 'add-admin':
                itemInfo.admins.push(info.admin.toLowerCase())
                break;

            case 'remove-admin':
                if(info.index >= 0){
                    itemInfo.admins.splice(info.index, 1)
                    itemInfo.n.splice(info.index, 1)
                }

                // let adminIndex = itemInfo.admins.findIndex($=> $ === info.data.toLowerCase())
                // if(adminIndex >=0){
                 
                // }
                break;

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