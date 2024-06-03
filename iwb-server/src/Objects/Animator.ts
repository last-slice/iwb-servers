import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Scene } from "./Scene";


export class AnimatorComponentSchema extends Schema{
    @type("string") clip:string
    @type("boolean") loop:boolean
    @type("boolean") playing:boolean
}

export class AnimatorComponent extends Schema{
    // @type("string") id:string
    @type([AnimatorComponentSchema]) states:ArraySchema<AnimatorComponentSchema>
}

export function createAnimationComponent(scene:Scene, aid:string, data:any){
    let component = new AnimatorComponent()
    // component.id = data.id
    data.states.forEach((state:any)=>{
        component.states.push(new AnimatorComponentSchema(state))
    })
    scene.animators.set(aid, component)
}