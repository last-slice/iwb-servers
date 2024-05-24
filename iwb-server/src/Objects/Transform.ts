import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Client } from "colyseus";
import { Scene } from "./Scene";

export class Vector3 extends Schema {
  @type("number") x: number
  @type("number") y: number
  @type("number") z: number
}

export class Quaternion extends Schema {
  @type("number") x: number
  @type("number") y: number
  @type("number") z: number
  @type("number") w: number
}

export class TransformComponent extends Schema{
  @type(Vector3) p: Vector3
  @type(Quaternion) r: Quaternion
  @type(Vector3) s:Vector3

  constructor(data:any){
      super()
      this.p = new Vector3(data.p)
      this.r = new Quaternion(data.r)
      this.s = new Vector3(data.s)
  }
}

export function editTransform(client:Client, info:any, scene:Scene){
    let transform = scene.transforms.get(info.aid)
    if(transform){
      switch(info.mode){
        case 'p':
          console.log('moving objct', info.aid)
          transform.p.x += 1
          break;
      }
    }
}