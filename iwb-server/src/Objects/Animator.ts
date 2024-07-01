import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Scene } from "./Scene";
import { COMPONENT_TYPES } from "../utils/types";


export class AnimatorComponentSchema extends Schema{
    @type("string") clip:string
    @type("boolean") loop:boolean
    @type("boolean") playing:boolean
}

export class AnimatorComponent extends Schema{
    // @type("string") id:string
    @type([AnimatorComponentSchema]) states:ArraySchema<AnimatorComponentSchema> = new ArraySchema()
}

export function createAnimationComponent(scene:Scene, aid:string, data:any){
    let component = new AnimatorComponent()
    // component.id = data.id
    data && data.states && data.states.forEach((state:any)=>{
        component.states.push(new AnimatorComponentSchema(state))
    })
    scene[COMPONENT_TYPES.ANIMATION_COMPONENT].set(aid, component)
}