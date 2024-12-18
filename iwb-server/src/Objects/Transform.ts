import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Client } from "colyseus";
import { Scene } from "./Scene";
import { COMPONENT_TYPES, EDIT_MODIFIERS } from "../utils/types";

export class Vector3 extends Schema {
  @type("number") x: number
  @type("number") y: number
  @type("number") z: number

  subtract(other: Vector3): Vector3 {
    return new Vector3(
        this.x - other.x,
        this.y - other.y,
        this.z - other.z
    );
  }
}

export class Quaternion extends Schema {
  @type("number") x: number
  @type("number") y: number
  @type("number") z: number
}

export class TransformComponent extends Schema{
  @type(Vector3) p: Vector3
  @type(Quaternion) r: Quaternion
  @type(Vector3) s:Vector3
  @type("number") delta:number = 0

  constructor(data?:any){
      super()
      if(data){
        this.p = new Vector3(data.p)
        this.r = new Quaternion(data.r)
        this.s = new Vector3(data.s)
      }
  }
}

export function editTransform(client:Client, data:any, scene:Scene){
    let transform = scene[COMPONENT_TYPES.TRANSFORM_COMPONENT].get(data.aid)
    if(transform){
      switch(data.modifier){
        case EDIT_MODIFIERS.POSITION:
            switch(data.axis){
              case 'ALL':
                transform.p.x = data.x
                transform.p.y = data.y
                transform.p.z = data.z
                break;

                case 'x':
                    if(data.manual){
                      transform.p.x = data.value === "" ? 0 : data.value
                    }else{
                      transform.p.x += (data.direction * data.factor)
                    }
                    break;

                case 'y':
                    if(data.manual){
                      transform.p.y = data.value === "" ? 0 : data.value
                    }else{
                      transform.p.y += (data.direction * data.factor)
                    }
                    break;

                case 'z':
                    if(data.manual){
                      transform.p.z = data.value === "" ? 0 : data.value
                    }else{
                      transform.p.z += (data.direction * data.factor)
                    }
                    break;
            }
            break;

        case EDIT_MODIFIERS.ROTATION:
            switch(data.axis){
              case 'ALL':
                transform.r.x = data.x
                transform.r.y = data.y
                transform.r.z = data.z
                break;
                case 'x':
                    if(data.manual){
                      transform.r.x = data.value === "" ? 0 : data.value
                    }else{
                      transform.r.x += (data.direction * data.factor)
                    }
                    break;

                case 'y':
                    if(data.manual){
                      transform.r.y = data.value === "" ? 0 : data.value
                    }else{
                      transform.r.y += (data.direction * data.factor)
                    }
                    break;

                case 'z':
                    if(data.manual){
                      transform.r.z = data.value === "" ? 0 : data.value
                    }else{
                      transform.r.z += (data.direction * data.factor)
                    }
                    break;
            }
            break;

        case EDIT_MODIFIERS.SCALE:
            switch(data.axis){
              case 'ALL':
                transform.r.x = data.x
                transform.r.y = data.y
                transform.r.z = data.z
                break;
                case 'x':
                    if(data.manual){
                      transform.s.x = data.value === "" ? 0 : data.value
                    }else{
                      transform.s.x += (data.direction * data.factor)
                    }
                    break;

                case 'y':
                    if(data.manual){
                      transform.s.y = data.value === "" ? 0 : data.value
                    }else{
                      transform.s.y += (data.direction * data.factor)
                    }
                    break;

                case 'z':
                    if(data.manual){
                      transform.s.z = data.value === "" ? 0 : data.value
                    }else{
                      transform.s.z += (data.direction * data.factor)
                    }
                    break;
            }
            break;
    }
    }
}

export function createTransformComponent(scene:Scene, data:any){
  let component = new TransformComponent()
  component.p = new Vector3(data.position)
  component.r = new Quaternion(data.rotation)
  component.s = new Vector3(data.scale)
  scene[COMPONENT_TYPES.TRANSFORM_COMPONENT].set(data.aid, component)
}