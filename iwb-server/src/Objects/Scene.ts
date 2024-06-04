import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { COMPONENT_TYPES, Color4 } from "../utils/types";
import { ActionComponent, ActionComponentSchema } from "./Actions";
import { AnimatorComponent, createAnimationComponent } from "./Animator";
import { CounterComponent, CounterBarComponent, CounterComponentSchema } from "./Counter";
import { GltfComponent, createGLTFComponent } from "./Gltf";
// import { IWBComponent, setIWBComponent } from "./IWB";
import { NameComponent } from "./Names";
import { ParentingComponent } from "./Parenting";
import { PointerComponent, PointerComponentEvent } from "./Pointers";
import { SoundComponent } from "./Sound";
import { StateComponent } from "./State";
import { TextShapeComponent } from "./TextShape";
import { TransformComponent } from "./Transform";
import { TriggerComponent, TriggerComponentSchema, TriggerConditionComponent } from "./Trigger";
import { VisibilityComponent } from "./Visibility";
import { IWBRoom } from "../rooms/IWBRoom";
import { iwbManager } from "../app.config";
import { fetchPlayfabMetadata, fetchPlayfabFile } from "../utils/Playfab";
import { RewardComponent } from "./Rewards";
import { MeshRendererComponent } from "./MeshRenderers";
import { MaterialComponent, createMaterialComponent } from "./Materials";
import { VideoComponent } from "./Video";
import { IWBComponent, setIWBComponent } from "./IWB";
import { NftShapeComponent, createNftShapeComponent } from "./NftShape";
import { MeshColliderComponent } from "./MeshColliders";
import { TextureComponent } from "./Textures";
import { EmissiveComponent, createEmissiveComponent } from "./Emissive";

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
    @type("number") si: number = 0
    @type("number") toc: number
    @type("number") pc: number = 0
    @type("number") pcnt: number

    @type("boolean") isdl: boolean
    @type("boolean") e: boolean
    @type("boolean") priv: boolean
    @type("boolean") lim: boolean = true

    @type({map:TransformComponent}) transforms:MapSchema<TransformComponent>
    @type({map:GltfComponent}) gltfs:MapSchema<GltfComponent>
    @type({map:MeshRendererComponent}) meshRenders:MapSchema<MeshRendererComponent>
    @type({map:MeshColliderComponent}) meshColliders:MapSchema<MeshColliderComponent>
    @type({map:TextureComponent}) textures:MapSchema<TextureComponent>
    @type({map:EmissiveComponent}) emissives:MapSchema<EmissiveComponent>
    @type({map:MaterialComponent}) materials:MapSchema<MaterialComponent>
    @type({map:NameComponent}) names:MapSchema<NameComponent>
    @type({map:VisibilityComponent}) visibilities:MapSchema<VisibilityComponent>
    @type({map:ActionComponent}) actions:MapSchema<ActionComponent>
    @type({map:CounterComponent}) counters:MapSchema<CounterComponent>
    @type({map:CounterBarComponent}) counterbars:MapSchema<CounterBarComponent>
    @type({map:StateComponent}) states:MapSchema<StateComponent>
    @type({map:TriggerComponent}) triggers:MapSchema<TriggerComponent>
    @type({map:TextShapeComponent}) textShapes:MapSchema<TextShapeComponent>
    @type({map:NftShapeComponent}) nftShapes:MapSchema<NftShapeComponent>
    @type({map:AnimatorComponent}) animators:MapSchema<AnimatorComponent>
    @type({map:PointerComponent}) pointers:MapSchema<PointerComponent>
    @type({map:SoundComponent}) sounds:MapSchema<SoundComponent>
    @type({map:VideoComponent}) videos:MapSchema<VideoComponent>
    @type({map:RewardComponent}) rewards:MapSchema<RewardComponent>
    @type({map:IWBComponent}) itemInfo:MapSchema<IWBComponent>
    @type([ParentingComponent]) parenting:ArraySchema<ParentingComponent>

    //pointer evnts component
    //sync components

    parentEntity:any
    entities:any[] = []

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
        this.itemInfo = new MapSchema<IWBComponent>()
        this.names = new MapSchema<NameComponent>()
        this.visibilities = new MapSchema<VisibilityComponent>()
        this.parenting = new ArraySchema<ParentingComponent>()
        this.transforms = new MapSchema<TransformComponent>()
        this.pointers = new MapSchema<PointerComponent>()
        this.textShapes = new MapSchema<TextShapeComponent>()
        this.counters = new MapSchema<CounterComponent>()
        this.triggers = new MapSchema<TriggerComponent>()
        this.actions = new MapSchema<ActionComponent>()
        this.gltfs = new MapSchema<GltfComponent>()
        this.meshRenders = new MapSchema<MeshRendererComponent>()
        this.meshColliders = new MapSchema<MeshColliderComponent>()
        this.textures = new MapSchema<TextureComponent>()
        this.emissives = new MapSchema<EmissiveComponent>()
        this.materials = new MapSchema<MaterialComponent>()
        this.states = new MapSchema<StateComponent>()
        this.sounds = new MapSchema<SoundComponent>()
        this.videos = new MapSchema<VideoComponent>()
        this.animators = new MapSchema<AnimatorComponent>()
        this.nftShapes = new MapSchema<NftShapeComponent>()

        for (const key in components) {
            if (components.hasOwnProperty(key)) {
                switch(key){
                    case COMPONENT_TYPES.IWB_COMPONENT:
                        setIWBComponent(this, key, components)
                        break;

                    case COMPONENT_TYPES.NAMES_COMPONENT:
                        for (const aid in components[key]) {
                            this.names.set(aid, new NameComponent(components[key][aid]))
                        }
                        break;

                    case COMPONENT_TYPES.VISBILITY_COMPONENT:
                        for (const aid in components[key]) {
                            let vis = new VisibilityComponent(components[key][aid])
                            vis.visible = true
                            this.visibilities.set(aid, new VisibilityComponent(components[key][aid]))
                        }
                        break;

                    case COMPONENT_TYPES.PARENTING_COMPONENT:
                        components[key].forEach((info:any) => {
                            this.parenting.push(new ParentingComponent(info))
                        });
                        break;

                    case COMPONENT_TYPES.TRANSFORM_COMPONENT:
                        for (const aid in components[key]) {
                            this.transforms.set(aid, new TransformComponent(components[key][aid]))
                        }
                        break;

                    case COMPONENT_TYPES.POINTER_COMPONENT:
                       
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
                        
                        for (const aid in components[key]) {
                            let textShape = new TextShapeComponent(components[key][aid]) 
                            textShape.outlineColor = new Color4(components[key][aid].outlineColor)
                            textShape.color = new Color4(components[key][aid].color)
                            this.textShapes.set(aid, textShape)
                        }
                        break;

                    case COMPONENT_TYPES.COUNTER_COMPONENT:
                        
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
                        for (const aid in components[key]) {
                            this.gltfs.set(aid, new GltfComponent(components[key][aid]))
                        }
                        break;

                    case COMPONENT_TYPES.MESH_RENDER_COMPONENT:
                        for (const aid in components[key]) {
                            this.meshRenders.set(aid, new MeshRendererComponent(components[key][aid]))
                        }
                        break;

                    case COMPONENT_TYPES.MESH_COLLIDER_COMPONENT:
                        for (const aid in components[key]) {
                            this.meshColliders.set(aid, new MeshColliderComponent(components[key][aid]))
                        }
                        break;

                    case COMPONENT_TYPES.TEXTURE_COMPONENT:
                        for (const aid in components[key]) {
                            this.textures.set(aid, new TextureComponent(components[key][aid]))
                        }
                        break;

                    case COMPONENT_TYPES.EMISSIVE_TEXTURE_COMPONENT:
                        for (const aid in components[key]) {
                            createEmissiveComponent(this, aid, components[key][aid])
                        }
                        break;

                     case COMPONENT_TYPES.MATERIAL_COMPONENT:
                        for (const aid in components[key]) {
                            createMaterialComponent(this, aid, components[key][aid])
                        }
                        break;

                     case COMPONENT_TYPES.NFT_COMPONENT:
                        for (const aid in components[key]) {
                            createNftShapeComponent(this, aid, components[key][aid])
                        }
                        break;

                    case COMPONENT_TYPES.STATE_COMPONENT:
                     
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
                   
                        for (const aid in components[key]) {
                            this.sounds.set(aid, new SoundComponent(components[key][aid]))
                        }
                        break;

                    case COMPONENT_TYPES.VIDEO_COMPONENT:
                      
                        for (const aid in components[key]) {
                            this.videos.set(aid, new VideoComponent(components[key][aid]))
                        }
                        break;

                    case COMPONENT_TYPES.ANIMATION_COMPONENT:
                      
                        for (const aid in components[key]) {
                            createAnimationComponent(this, aid, components[key][aid])
                        }
                        break;

                }
            }
        }
    }
}

export function initServerScenes(room:IWBRoom){
    if(iwbManager.pendingSaves.includes((room.state.world))){
        let timeout = setTimeout(()=>{
            clearTimeout(timeout)
            initServerScenes(room)
        }, 1000 * 1)
    }else{
        setTimeout(()=>{
            let world = iwbManager.worlds.find((w)=> w.ens === room.state.realm)
            if(world){
                iwbManager.initiateRealm(world.owner)
                .then((realmData)=>{
                    // console.log('realm data is', realmData)
                    room.state.realmToken = realmData.EntityToken.EntityToken
                    room.state.realmId = realmData.EntityToken.Entity.Id
                    room.state.realmTokenType = realmData.EntityToken.Entity.Type
    
                    iwbManager.fetchRealmData(realmData)
                    .then((realmScenes)=>{
                       //  console.log('realm scenes are ', realmScenes)
                        iwbManager.fetchRealmScenes(room.state.world, realmScenes)
                        .then((sceneData)=>{

                            loadRealmScenes(room, sceneData)
                        })
                    })   
                })
                .catch((error)=>{
                    console.log('error initating realm', error)
                })
            }
        }, 1000)
    }
}

export async function initServerAssets(room:IWBRoom){
    let metadata = await fetchPlayfabMetadata(iwbManager.worlds.find((w:any)=> w.ens === room.state.world).owner)

    let catalog = await fetchPlayfabFile(metadata, "catalogs.json")
    catalog.forEach((item:any)=>{
    //   if(item.v > this.room.state.cv){
    //     item.pending = true//
    //   }
      room.state.realmAssets.set(item.id, item)
    })
}

export function loadRealmScenes(room:IWBRoom, scenes:any[]){
    let filter = scenes.filter((scene)=> scene.w === room.state.world)
    room.state.sceneCount = filter.length

    filter.forEach((scene)=>{
        room.state.scenes.set(scene.id, new Scene(scene))
    })
}

export async function saveRealmScenes(room:IWBRoom){
    let scenes:any[] = []
    room.state.scenes.forEach(async (scene:Scene)=>{
        let jsonScene:any = scene.toJSON()
        await checkAssetCacheStates(scene, jsonScene)
        scenes.push(jsonScene)
    })

    let world = iwbManager.worlds.find((w)=>w.ens === room.state.world)
    if(world){
        world.builds = scenes.length
        world.updated = Math.floor(Date.now()/1000)
    }

    if(scenes.length > 0){
        iwbManager.backupScene(room.state.world, room.state.realmToken, room.state.realmTokenType, room.state.realmId, scenes)
    }
}

export function checkAssetCacheStates(scene:Scene, jsonScene:any){
    scene.parenting.forEach((assetItem:any, index:number)=>{
        let iwbAsset = scene.itemInfo.get(assetItem.aid)
        iwbAsset.editing = false
        iwbAsset.editor = ""

        //Reward Component
        let rewardInfo = scene.rewards.get(assetItem.aid)
        if(rewardInfo){
            let jsonItem = rewardInfo.toJSON()
            jsonScene[COMPONENT_TYPES.REWARD_COMPONENT][assetItem.aid] = jsonItem
        }
    })
}

// async saveWorldScenes(scenes:Map<string, Scene>){
//     scenes.forEach((scene:Scene, key)=>{
//         let sceneIndex = this.scenes.findIndex((sc:any) =>sc.id === scene.id)
//         if(sceneIndex >= 0){
//             this.scenes[sceneIndex] = scene
//         }else{
//             this.scenes.push(scene)
//         }
//         this.modified = true
//     })

//     console.log('saved world scenes', this.scenes)
// }

// addNewScene(scene:Scene){
//     this.room.state.scenes.set(scene, s)
// }