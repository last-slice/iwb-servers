import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { COMPONENT_TYPES } from "../utils/types";

export class Color4 extends Schema {
    @type("number") r: number = 1
    @type("number") g: number = 1
    @type("number") b: number = 1
    @type("number") a: number = 1
}

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

export class GltfComponent extends Schema{
    @type("string") src:string
    @type("number") visibleCollision:number
    @type("number") invisibleCollision:number
}

export class NameComponent extends Schema{
    @type("string") value:string
}

export class VisibilityComponent extends Schema{
    @type("boolean") visible:boolean
}

export class ParentingComponent extends Schema{
    @type("string") aid:string
    @type("string") entity:string
    @type(["string"]) children:ArraySchema<string> = new ArraySchema<string>()

    constructor(data:any){
        super()
        this.aid = data.entity
        data.children.forEach((child:any)=>{
            this.children.push(child)
        })
    }
}

export class ActionComponentSchema extends Schema{

    @type("number") entity:number

    @type("string") hoverText:string
    @type("string") aid:string
    @type("string") animName:string
    @type("string") teleport:string
    @type("string") teleCam:string
    @type("boolean") animLoop:boolean
    @type("number") showTimer:string
    @type("number") showSize:number
    @type("string") showPos:string
    @type("number") startDTimer:number
    @type("string") startDId:string
    @type("number") cVMask:number
    @type("number") cIMask:number
    @type("string") dialID:string
    @type("number") twT:number
    @type("number") twE:number
    @type("number") twD:number
    @type("number") twL:number
    @type("number") twEX:number
    @type("number") twEY:number
    @type("number") twEZ:number










    @type("string") id:string
    @type("string") name:string
    @type("string") type:string
    @type("number") anchor:number
    @type("string") emote:string
    @type("boolean") visible:boolean
    @type("number") vMask:number
    @type("number") iMask:number
    @type("string") showText:string
    @type("string") url:string
    @type("string") movePos:string
    @type("string") moveCam:string
    @type("boolean") moveRel:boolean

    ///amount for add/subtract actions
    @type("number") value:number
    @type("string") counter:string
    @type("string") state:string
}

export class ActionComponent extends Schema {
    @type([ActionComponentSchema]) actions:ArraySchema<ActionComponentSchema>
}

export class CounterComponentSchema extends Schema{
    @type("number") currentValue:number
    @type("number") previousValue:number
}

export class CounterComponent extends Schema{
    @type({map:CounterComponentSchema}) values:MapSchema<CounterComponentSchema>
}

export class CounterBarComponent extends Schema{
    @type("string") p:string
    @type("string") s:string
    @type("number") max:number
}

export class StateComponent extends Schema{
    @type(["string"]) values:ArraySchema<string>
    @type("string") defaultValue:string
}

export class TriggerConditionComponent extends Schema{
    @type("string") id:string
    @type("string") type:string
    @type("string") value:string
    @type("string") counter:string
}

export class TriggerComponentSchema extends Schema{
    @type("string") id:string
    @type("string") type:string
    @type("number") input:number
    @type([TriggerConditionComponent]) conditions:ArraySchema<TriggerConditionComponent>
    @type(["string"]) actions:ArraySchema<string>
}

export class TriggerComponent extends Schema{
    @type([TriggerComponentSchema]) triggers:ArraySchema<TriggerComponentSchema>
}

export class TextShapeComponent extends Schema{
    @type("string") id:string
    @type("string") text:string
    @type("number") font:number
    @type("number") fontSize:number
    @type("number") textAlign:number
    @type("number") paddingTop:number
    @type("number") paddingRight:number
    @type("number") paddingBottom:number
    @type("number") paddingLeft:number
    @type("number") lineSpacing:number
    @type("number") outlineWidth:number
    @type("boolean") fontAutoSize:boolean
    @type(["number"]) outlineColor:ArraySchema<number> = new ArraySchema<number>()
    @type(["number"]) textColor:ArraySchema<number> = new ArraySchema<number>()
}

export class AnimatorComponentSchema extends Schema{
    @type("string") clip:string
    @type("boolean") loop:boolean
    @type("boolean") playing:boolean
}

export class AnimatorComponent extends Schema{
    @type("string") id:string
    @type([AnimatorComponentSchema]) states:ArraySchema<AnimatorComponentSchema>
}

export class PointerComponentEvent extends Schema{
    @type("string") id:string
    @type("string") hoverText:string
    @type("number") eventType:number
    @type("number") button:number
    @type("number") maxDistance:number
    @type("boolean") showFeedback:boolean
}

export class PointerComponent extends Schema{
    @type("string") id:string
    @type([PointerComponentEvent]) events:ArraySchema<PointerComponentEvent>
}

export class SoundComponent extends Schema {
    @type("string") url:string
    @type("number") volume:number
    @type("boolean") autostart:boolean
    @type("boolean") loop:boolean
    @type("boolean") attach:boolean
}

export class IWBCatalogComponent extends Schema{
    @type("string") id:string
    @type("string") name:string
    @type("string") description:string
    @type("string") owner:string
    @type("string") ownerAddress:string
    @type("string") category:string
    @type("string") type:string
    @type("string") style:string
    @type("boolean") ugc:boolean
    @type("boolean") pending:boolean
}

export class IWBComponent extends Schema{
    @type("string") aid:string
    @type("boolean") locked:boolean
    @type("boolean") buildVis:boolean
    @type("boolean") editing:boolean
}

export class TempScene extends Schema {
    @type("string") id: string
    @type("string") n: string
    @type("string") d: string
    @type("string") bpcl: string
    @type(['string']) pcls = new ArraySchema<string>();
}

export class Scene extends Schema {
    @type("string") id: string
    @type("string") n: string
    @type("string") d: string
    @type("string") o: string
    @type("string") ona: string
    @type("string") cat: string
    @type("string") bpcl: string
    @type("string") w: string
    @type("string") im: string

    @type(['string']) bps = new ArraySchema<string>();
    @type(['string']) rat = new ArraySchema<string>();
    @type(['string']) rev = new ArraySchema<string>();
    @type(['string']) pcls = new ArraySchema<string>();
    @type(['string']) sp = new ArraySchema<string>();
    @type(['string']) cp = new ArraySchema<string>();

    @type("number") cd: number
    @type("number") upd: number
    @type("number") si: number
    @type("number") toc: number
    @type("number") pc: number
    @type("number") pcnt: number

    @type("boolean") isdl: boolean
    @type("boolean") e: boolean
    @type("boolean") priv: boolean
    @type("boolean") lim: boolean = true

    @type({map:TransformComponent}) transforms:MapSchema<TransformComponent>
    @type({map:GltfComponent}) gltfs:MapSchema<GltfComponent>
    @type({map:NameComponent}) names:MapSchema<NameComponent>
    @type({map:VisibilityComponent}) visibilities:MapSchema<VisibilityComponent>
    @type({map:ActionComponent}) actions:MapSchema<ActionComponent>
    @type({map:CounterComponent}) counters:MapSchema<CounterComponent>
    @type({map:CounterBarComponent}) counterbars:MapSchema<CounterBarComponent>
    @type({map:StateComponent}) states:MapSchema<StateComponent>
    @type({map:TriggerComponent}) triggers:MapSchema<TriggerComponent>
    @type({map:TextShapeComponent}) textShapes:MapSchema<TextShapeComponent>
    @type({map:AnimatorComponent}) animators:MapSchema<AnimatorComponent>
    @type({map:PointerComponent}) pointers:MapSchema<PointerComponent>
    @type({map:SoundComponent}) sounds:MapSchema<SoundComponent>


    @type({map:IWBCatalogComponent}) catalogInfo:MapSchema<IWBCatalogComponent>
    @type({map:IWBComponent}) itemInfo:MapSchema<IWBComponent>

    @type([ParentingComponent]) parenting:ArraySchema<ParentingComponent>

    //pointer evnts component
    //sync components


    constructor(data?:any) {
        super(data)
        if (data){
            this.pcls = data.pcls
            this.pcnt = data.pcls.length
            this.lim = data.hasOwnProperty("lim") ? data.lim : true
            this.sp = data.sp[0].split(",").length === 2 ? [data.sp[0].split(",")[0] + ",0," + data.sp[0].split(",")[1]] : data.sp
            this.cp = data.hasOwnProperty("cp") ? data.cp : ["0,0,0"]

            this.setComponents(data.components)
        }
    }
    
    setComponents(components:any){
        for (const key in components) {
            if (components.hasOwnProperty(key)) {
                switch(key){
                    case COMPONENT_TYPES.NAMES_COMPONENT:
                        this.names = new MapSchema<NameComponent>()
                        for (const aid in components[key]) {
                            this.names.set(aid, new NameComponent(components[key][aid]))
                        }
                        break;

                    case COMPONENT_TYPES.VISBILITY_COMPONENT:
                        this.visibilities = new MapSchema<VisibilityComponent>()
                        for (const aid in components[key]) {
                            let vis = new VisibilityComponent(components[key][aid])
                            vis.visible = true
                            this.visibilities.set(aid, new VisibilityComponent(components[key][aid]))
                        }
                        break;

                    case COMPONENT_TYPES.PARENTING_COMPONENT:
                        this.parenting = new ArraySchema<ParentingComponent>()
                        components[key].forEach((info:any) => {
                            this.parenting.push(new ParentingComponent(info))
                        });
                        break;

                    case COMPONENT_TYPES.TRANSFORM_COMPONENT:
                        this.transforms = new MapSchema<TransformComponent>()
                        for (const aid in components[key]) {
                            this.transforms.set(aid, new TransformComponent(components[key][aid]))
                        }
                        break;

                    case COMPONENT_TYPES.POINTER_COMPONENT:
                        this.pointers = new MapSchema<PointerComponent>()
                        for (const aid in components[key]) {
                            let pointerEvents = new PointerComponent()
                            pointerEvents.events = new ArraySchema<PointerComponentEvent>()
                            components[key][aid].pointerEvents.forEach((event:any)=>{
                                let pointerEvent = new PointerComponentEvent()
                                pointerEvent.hoverText = event.eventInfo.hoverText
                                pointerEvent.maxDistance = event.eventInfo.maxDistance
                                pointerEvent.showFeedback = event.eventInfo.showFeedback
                                pointerEvent.eventType = event.eventType
                                pointerEvent.button = event.eventInfo.button
                                pointerEvents.events.push(pointerEvent)
                            })
                            this.pointers.set(aid, pointerEvents)
                        }
                        break;

                    case COMPONENT_TYPES.TEXT_COMPONENT:
                        this.textShapes = new MapSchema<TextShapeComponent>()
                        for (const aid in components[key]) {
                            let textShape = new TextShapeComponent(components[key][aid]) 
                            components[key][aid].outlineColor.forEach((color:number)=>{
                                textShape.outlineColor.push(color)
                            })
                            components[key][aid].textColor.forEach((color:number)=>{
                                textShape.textColor.push(color)
                            })
                            this.textShapes.set(aid, textShape)
                        }
                        break;

                    case COMPONENT_TYPES.COUNTER_COMPONENT:
                        this.counters = new MapSchema<CounterComponent>()
                        for (const aid in components[key]) {
                            let counter = new CounterComponent()
                            counter.values = new MapSchema<CounterComponentSchema>()

                            let counters = components[key][aid].counters
                            for(let name in counters){
                                let counterSchema = new CounterComponentSchema()
                                counterSchema.currentValue =  counters[name]
                                counterSchema.previousValue =  counters[name]

                                counter.values.set(name, counterSchema)
                            }

                            this.counters.set(aid, counter)
                        }
                        break;
                
                    case COMPONENT_TYPES.TRIGGER_COMPONENT:
                        this.triggers = new MapSchema<TriggerComponent>()
                        for (const aid in components[key]) {
                            let data = components[key][aid]

                            let trigger = new TriggerComponent()
                            trigger.triggers = new ArraySchema<TriggerComponentSchema>()

                            data.triggers.forEach((data:any)=>{
                                let schema = new TriggerComponentSchema()
                                schema.type = data.type
                                schema.input = data.input
                                schema.conditions = new ArraySchema<TriggerConditionComponent>()
                                schema.actions = new ArraySchema<string>()

                                data.conditions.forEach((condition:any)=>{
                                    schema.conditions.push(new TriggerConditionComponent(condition))
                                })

                                data.actions.forEach((action:any)=>{
                                    schema.actions.push(action.id)
                                })
                                trigger.triggers.push(schema)
                            })

                            this.triggers.set(aid, trigger)
                        }
                        break;

                    case COMPONENT_TYPES.ACTION_COMPONENT:
                        this.actions = new MapSchema<ActionComponent>()
                        for (const aid in components[key]) {
                            let data = components[key][aid]

                            let action = new ActionComponent()
                            action.actions = new ArraySchema<ActionComponentSchema>()

                            
                            data.actions.forEach((data:any)=>{
                                let schema = new ActionComponentSchema()
                                schema.id = data.id
                                schema.name = data.name
                                schema.type = data.type
                                schema.showText = data.text
                                schema.value = data.value
                                schema.counter = data.counter
                                schema.state = data.state
                                schema.visible = data.visible
                                schema.vMask = data.vMask
                                schema.iMask = data.iMask
                                schema.url = data.url
                                schema.moveCam = data.moveCam
                                schema.movePos = data.movePos
                                schema.emote = data.emote
                                schema.moveRel = data.moveRel
                                schema.anchor = data.anchor
                                action.actions.push(schema)
                            })     

                            this.actions.set(aid, action)
                        }
                        break;

                    case COMPONENT_TYPES.GLTF_COMPONENT:
                        this.gltfs = new MapSchema<GltfComponent>()
                        for (const aid in components[key]) {
                            this.gltfs.set(aid, new GltfComponent(components[key][aid]))
                        }
                        break;

                    case COMPONENT_TYPES.STATE_COMPONENT:
                        this.states = new MapSchema<StateComponent>()
                        for (const aid in components[key]) {
                            let data = components[key][aid]

                            let state = new StateComponent()
                            state.defaultValue = data.defaultValue

                            state.values = new ArraySchema<string>()
                            data.values.forEach((value:string)=>{
                                state.values.push(value)
                            })
                            this.states.set(aid, state)
                        }
                        break;

                    case COMPONENT_TYPES.SOUND_COMPONENT:
                        this.sounds = new MapSchema<SoundComponent>()
                        for (const aid in components[key]) {
                            this.sounds.set(aid, new SoundComponent(components[key][aid]))
                        }
                        break;

                }
            }
        }
    }
}