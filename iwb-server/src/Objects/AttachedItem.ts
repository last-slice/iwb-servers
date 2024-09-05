import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Vector3 } from "./Transform";

export class AttachedItem extends Schema {
  @type("string") id:string
  @type("string") userId:string
  @type("number") anchor:number
  @type("boolean") enabled:boolean = false
  @type(Vector3) pOffset:Vector3
  @type(Vector3) rOffset:Vector3
  @type(Vector3) sOffset:Vector3

  parent:any
}