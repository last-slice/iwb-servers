import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { COMPONENT_TYPES, Color4 } from "../utils/types";
import { ActionComponent, ActionComponentSchema } from "./Actions";
import { AnimatorComponent, createAnimationComponent } from "./Animator";
import { CounterComponent, CounterBarComponent, createCounterComponent } from "./Counter";
import { GltfComponent, createGLTFComponent } from "./Gltf";
import { NameComponent } from "./Names";
import { ParentingComponent } from "./Parenting";
import { PointerComponent, PointerComponentEvent, createPointerComponent } from "./Pointers";
import { SoundComponent } from "./Sound";
import { StateComponent } from "./State";
import { TextShapeComponent, createTextComponent } from "./TextShape";
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
import { AvatarShapeComponent, createAvatarShapeComponent } from "./AvatarShape";
import { UITextComponent, createUITextComponent } from "./UIText";
import { GameComponent } from "./Game";
import { UIImageComponent, createUIImageComponent } from "./UIImage";
import { BillboardComponent, createBillboardComponent } from "./Billboard";

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

    @type({map:TransformComponent}) [COMPONENT_TYPES.TRANSFORM_COMPONENT]:MapSchema<TransformComponent>
    @type({map:GltfComponent}) [COMPONENT_TYPES.GLTF_COMPONENT]:MapSchema<GltfComponent>
    @type({map:MeshRendererComponent}) [COMPONENT_TYPES.MESH_RENDER_COMPONENT]:MapSchema<MeshRendererComponent>
    @type({map:MeshColliderComponent}) [COMPONENT_TYPES.MESH_COLLIDER_COMPONENT]:MapSchema<MeshColliderComponent>
    @type({map:TextureComponent}) [COMPONENT_TYPES.TEXTURE_COMPONENT]:MapSchema<TextureComponent>
    @type({map:EmissiveComponent}) [COMPONENT_TYPES.EMISSIVE_TEXTURE_COMPONENT]:MapSchema<EmissiveComponent>
    @type({map:MaterialComponent}) [COMPONENT_TYPES.MATERIAL_COMPONENT]:MapSchema<MaterialComponent>
    @type({map:NameComponent}) [COMPONENT_TYPES.NAMES_COMPONENT]:MapSchema<NameComponent>
    @type({map:VisibilityComponent}) [COMPONENT_TYPES.VISBILITY_COMPONENT]:MapSchema<VisibilityComponent>
    @type({map:ActionComponent}) [COMPONENT_TYPES.ACTION_COMPONENT]:MapSchema<ActionComponent>
    @type({map:CounterComponent}) [COMPONENT_TYPES.COUNTER_COMPONENT]:MapSchema<CounterComponent>
    @type({map:CounterBarComponent}) counterbars:MapSchema<CounterBarComponent>
    @type({map:StateComponent}) [COMPONENT_TYPES.STATE_COMPONENT]:MapSchema<StateComponent>
    @type({map:TriggerComponent}) [COMPONENT_TYPES.TRIGGER_COMPONENT]:MapSchema<TriggerComponent>
    @type({map:TextShapeComponent}) [COMPONENT_TYPES.TEXT_COMPONENT]:MapSchema<TextShapeComponent>
    @type({map:NftShapeComponent}) [COMPONENT_TYPES.NFT_COMPONENT]:MapSchema<NftShapeComponent>
    @type({map:AnimatorComponent}) [COMPONENT_TYPES.ANIMATION_COMPONENT]:MapSchema<AnimatorComponent>
    @type({map:PointerComponent}) [COMPONENT_TYPES.POINTER_COMPONENT]:MapSchema<PointerComponent>
    @type({map:SoundComponent}) [COMPONENT_TYPES.AUDIO_SOURCE_COMPONENT]:MapSchema<SoundComponent>
    @type({map:SoundComponent}) [COMPONENT_TYPES.AUDIO_STREAM_COMPONENT]:MapSchema<SoundComponent>
    @type({map:AvatarShapeComponent}) [COMPONENT_TYPES.AVATAR_SHAPE_COMPONENT]:MapSchema<AvatarShapeComponent>
    @type({map:VideoComponent}) [COMPONENT_TYPES.VIDEO_COMPONENT]:MapSchema<VideoComponent>
    @type({map:RewardComponent}) rewards:MapSchema<RewardComponent>
    @type({map:IWBComponent}) [COMPONENT_TYPES.IWB_COMPONENT]:MapSchema<IWBComponent>
    @type({map:UITextComponent}) [COMPONENT_TYPES.UI_TEXT_COMPONENT]:MapSchema<UITextComponent>
    @type({map:UIImageComponent}) [COMPONENT_TYPES.UI_IMAGE_COMPONENT]:MapSchema<UIImageComponent>
    @type({map:GameComponent}) [COMPONENT_TYPES.GAME_COMPONENT]:MapSchema<GameComponent>
    @type({map:BillboardComponent}) [COMPONENT_TYPES.BILLBOARD_COMPONENT]:MapSchema<BillboardComponent>
    @type([ParentingComponent]) [COMPONENT_TYPES.PARENTING_COMPONENT]:ArraySchema<ParentingComponent>


    // @type({map:"string"}) [COMPONENT_TYPES.CLICK_AREA_COMPONENT]:MapSchema<string>

    //pointer evnts component
    //sync components

    parentEntity:any
    entities:any[] = []
    components:any

    constructor(data?:any) {
        super(data)
        if (data){
            this.pcls = data.pcls
            this.pcnt = data.pcls.length
            this.lim = data.hasOwnProperty("lim") ? data.lim : true
            this.sp = data.sp[0].split(",").length === 2 ? [data.sp[0].split(",")[0] + ",0," + data.sp[0].split(",")[1]] : data.sp
            this.cp = data.hasOwnProperty("cp") ? data.cp : ["0,0,0"]

            this.setComponents(data)
        }
    }
    
    setComponents(data:any){
        this[COMPONENT_TYPES.IWB_COMPONENT] = new MapSchema<IWBComponent>()
        this[COMPONENT_TYPES.NAMES_COMPONENT] = new MapSchema<NameComponent>()
        this[COMPONENT_TYPES.VISBILITY_COMPONENT] = new MapSchema<VisibilityComponent>()
        this[COMPONENT_TYPES.PARENTING_COMPONENT] = new ArraySchema<ParentingComponent>()
        this[COMPONENT_TYPES.TRANSFORM_COMPONENT] = new MapSchema<TransformComponent>()
        this[COMPONENT_TYPES.POINTER_COMPONENT] = new MapSchema<PointerComponent>()
        this[COMPONENT_TYPES.TEXT_COMPONENT] = new MapSchema<TextShapeComponent>()
        this[COMPONENT_TYPES.COUNTER_COMPONENT] = new MapSchema<CounterComponent>()
        this[COMPONENT_TYPES.TRIGGER_COMPONENT] = new MapSchema<TriggerComponent>()
        this[COMPONENT_TYPES.ACTION_COMPONENT] = new MapSchema<ActionComponent>()
        this[COMPONENT_TYPES.GLTF_COMPONENT] = new MapSchema<GltfComponent>()
        this[COMPONENT_TYPES.MESH_RENDER_COMPONENT] = new MapSchema<MeshRendererComponent>()
        this[COMPONENT_TYPES.MESH_COLLIDER_COMPONENT] = new MapSchema<MeshColliderComponent>()
        this[COMPONENT_TYPES.TEXTURE_COMPONENT] = new MapSchema<TextureComponent>()
        this[COMPONENT_TYPES.EMISSIVE_TEXTURE_COMPONENT] = new MapSchema<EmissiveComponent>()
        this[COMPONENT_TYPES.MATERIAL_COMPONENT] = new MapSchema<MaterialComponent>()
        this[COMPONENT_TYPES.STATE_COMPONENT] = new MapSchema<StateComponent>()
        this[COMPONENT_TYPES.AUDIO_SOURCE_COMPONENT] = new MapSchema<SoundComponent>()
        this[COMPONENT_TYPES.AUDIO_STREAM_COMPONENT] = new MapSchema<SoundComponent>()
        this[COMPONENT_TYPES.VIDEO_COMPONENT] = new MapSchema<VideoComponent>()
        this[COMPONENT_TYPES.ANIMATION_COMPONENT] = new MapSchema<AnimatorComponent>()
        this[COMPONENT_TYPES.NFT_COMPONENT] = new MapSchema<NftShapeComponent>()
        this[COMPONENT_TYPES.AVATAR_SHAPE_COMPONENT] = new MapSchema<AvatarShapeComponent>()
        this[COMPONENT_TYPES.UI_TEXT_COMPONENT] = new MapSchema<UITextComponent>()
        this[COMPONENT_TYPES.UI_TEXT_COMPONENT] = new MapSchema<UITextComponent>()
        this[COMPONENT_TYPES.GAME_COMPONENT] = new MapSchema<GameComponent>()
        this[COMPONENT_TYPES.UI_IMAGE_COMPONENT] = new MapSchema<UIImageComponent>()
        this[COMPONENT_TYPES.BILLBOARD_COMPONENT] = new MapSchema<BillboardComponent>()
        // this[COMPONENT_TYPES.CLICK_AREA_COMPONENT] = new MapSchema<string>()

        Object.values(COMPONENT_TYPES).forEach((component:any)=>{
            if(data[component]){
                switch(component){
                    case COMPONENT_TYPES.BILLBOARD_COMPONENT:
                        for (const aid in data[component]) {
                            createBillboardComponent(this, aid,  data[component][aid])
                        }
                        break;

                    case COMPONENT_TYPES.UI_TEXT_COMPONENT:
                        for (const aid in data[component]) {
                            createUITextComponent(this, aid,  data[component][aid])
                        }
                        break;

                    case COMPONENT_TYPES.UI_IMAGE_COMPONENT:
                        for (const aid in data[component]) {
                            createUIImageComponent(this, aid,  data[component][aid])
                        }
                        break;

                    case COMPONENT_TYPES.IWB_COMPONENT:
                        setIWBComponent(data.room, this, data[component])
                        break;

                    case COMPONENT_TYPES.NAMES_COMPONENT:
                        for (const aid in data[component]) {
                            this[COMPONENT_TYPES.NAMES_COMPONENT].set(aid, new NameComponent(data[component][aid]))
                        }
                        break;

                    case COMPONENT_TYPES.VISBILITY_COMPONENT:
                        for (const aid in data[component]) {
                            let vis = new VisibilityComponent(data[component][aid])
                            vis.visible = true
                            this[COMPONENT_TYPES.VISBILITY_COMPONENT].set(aid, new VisibilityComponent(data[component][aid]))
                        }
                        break;

                    case COMPONENT_TYPES.PARENTING_COMPONENT:
                        data[component].forEach((info:any) => {
                            this[COMPONENT_TYPES.PARENTING_COMPONENT].push(new ParentingComponent(info))
                        });
                        break;

                    case COMPONENT_TYPES.TRANSFORM_COMPONENT:
                        for (const aid in data[component]) {
                            this[COMPONENT_TYPES.TRANSFORM_COMPONENT].set(aid, new TransformComponent(data[component][aid]))
                        }
                        break;

                    case COMPONENT_TYPES.POINTER_COMPONENT:
                        for (const aid in data[component]) {
                            createPointerComponent(this, aid, data[component][aid])
                        }
                        break;

                    case COMPONENT_TYPES.TEXT_COMPONENT:
                        for (const aid in data[component]) {
                            createTextComponent(this, aid, data[component][aid])
                        }
                        break;

                    case COMPONENT_TYPES.COUNTER_COMPONENT:
                        for (const aid in data[component]) {
                            createCounterComponent(this, aid, data[component][aid])
                        }
                        break;

                    case COMPONENT_TYPES.AVATAR_SHAPE_COMPONENT:
                        for (const aid in data[component]) {
                            createAvatarShapeComponent(this, aid, data[component][aid])
                        }
                        break;
                
                    case COMPONENT_TYPES.TRIGGER_COMPONENT:
                       
                        for (const aid in data[component]) {
                            let triggerData = data[component][aid]

                            let trigger = new TriggerComponent()
                            trigger.triggers = new ArraySchema<TriggerComponentSchema>()
                            trigger.isArea = data.isArea

                            triggerData.triggers.forEach((data:any)=>{
                                let schema = new TriggerComponentSchema()
                                schema.id = data.id
                                schema.type = data.type
                                schema.input = data.input
                                schema.pointer = data.pointer

                                schema.caid = new ArraySchema<string>()
                                schema.ctype = new ArraySchema<string>()
                                schema.cvalue = new ArraySchema<string>()
                                schema.ccounter = new ArraySchema<number>()

                                data.caid.forEach((caid:any)=>{
                                    schema.caid.push(caid)
                                })
                                data.ctype.forEach((ctype:any)=>{
                                    schema.ctype.push(ctype)
                                })
                                data.cvalue.forEach((cvalue:any)=>{
                                    schema.cvalue.push(cvalue)
                                })
                                data.ccounter.forEach((ccounter:any)=>{
                                    schema.ccounter.push(ccounter)
                                })

                                schema.actions = new ArraySchema<string>()
                                data.actions.forEach((action:any)=>{
                                    schema.actions.push(action)
                                })
                                trigger.triggers.push(schema)
                            })

                            this[COMPONENT_TYPES.TRIGGER_COMPONENT].set(aid, trigger)
                        }
                        break;

                    case COMPONENT_TYPES.ACTION_COMPONENT:
                        
                        for (const aid in data[component]) {
                            let actionData = data[component][aid]

                            let action = new ActionComponent()

                            action.actions = new ArraySchema<ActionComponentSchema>()
                            actionData.actions.forEach((data:any)=>{
                                let schema:any = new ActionComponentSchema()
                                for(let key in data){
                                    schema[key] = data[key]
                                }
                                action.actions.push(schema)
                            })     
                            this[COMPONENT_TYPES.ACTION_COMPONENT].set(aid, action)
                        }
                        break;

                    case COMPONENT_TYPES.GLTF_COMPONENT:
                        for (const aid in data[component]) {
                            this[COMPONENT_TYPES.GLTF_COMPONENT].set(aid, new GltfComponent(data[component][aid]))
                        }
                        break;

                    case COMPONENT_TYPES.MESH_RENDER_COMPONENT:
                        for (const aid in data[component]) {
                            this[COMPONENT_TYPES.MESH_RENDER_COMPONENT].set(aid, new MeshRendererComponent(data[component][aid]))
                        }
                        break;

                    case COMPONENT_TYPES.MESH_COLLIDER_COMPONENT:
                        for (const aid in data[component]) {
                            this[COMPONENT_TYPES.MESH_COLLIDER_COMPONENT].set(aid, new MeshColliderComponent(data[component][aid]))
                        }
                        break;

                    case COMPONENT_TYPES.TEXTURE_COMPONENT:
                        for (const aid in data[component]) {
                            this[COMPONENT_TYPES.TEXTURE_COMPONENT].set(aid, new TextureComponent(data[component][aid]))
                        }
                        break;

                    case COMPONENT_TYPES.EMISSIVE_TEXTURE_COMPONENT:
                        for (const aid in data[component]) {
                            createEmissiveComponent(this, aid, data[component][aid])
                        }
                        break;

                     case COMPONENT_TYPES.MATERIAL_COMPONENT:
                        for (const aid in data[component]) {
                            createMaterialComponent(this, aid, data[component][aid])
                        }
                        break;

                     case COMPONENT_TYPES.NFT_COMPONENT:
                        for (const aid in data[component]) {
                            createNftShapeComponent(this, aid, data[component][aid])
                        }
                        break;

                    case COMPONENT_TYPES.STATE_COMPONENT:
                     
                        for (const aid in data[component]) {
                            let stateData = data[component][aid]

                            let state = new StateComponent()
                            state.defaultValue = data[component][aid].defaultValue

                            state.values = new ArraySchema<string>()
                            stateData.values.forEach((value:string)=>{
                                state.values.push(value)
                            })
                            this[COMPONENT_TYPES.STATE_COMPONENT].set(aid, state)
                        }
                        break;

                    case COMPONENT_TYPES.AUDIO_SOURCE_COMPONENT:
                        for (const aid in data[component]) {
                            this[COMPONENT_TYPES.AUDIO_SOURCE_COMPONENT].set(aid, new SoundComponent(data[component][aid]))
                        }
                        break;

                    case COMPONENT_TYPES.AUDIO_STREAM_COMPONENT:
                        for (const aid in data[component]) {
                            this[COMPONENT_TYPES.AUDIO_STREAM_COMPONENT].set(aid, new SoundComponent(data[component][aid]))
                        }
                        break;

                    case COMPONENT_TYPES.VIDEO_COMPONENT:
                      
                        for (const aid in data[component]) {
                            this[COMPONENT_TYPES.VIDEO_COMPONENT].set(aid, new VideoComponent(data[component][aid]))
                        }
                        break;

                    case COMPONENT_TYPES.ANIMATION_COMPONENT:
                      
                        for (const aid in data[component]) {
                            createAnimationComponent(this, aid, data[component][aid])
                        }
                        break;

                }
            }
        })
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
            let world = iwbManager.worlds.find((w)=> w.ens === room.state.world)
            if(world){
                iwbManager.initiateRealm(world.owner)
                .then((realmData)=>{
                    room.state.realmToken = realmData.EntityToken.EntityToken
                    room.state.realmId = realmData.EntityToken.Entity.Id
                    room.state.realmTokenType = realmData.EntityToken.Entity.Type
    
                    iwbManager.fetchRealmData(realmData)
                    .then((realmScenes)=>{
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
    //     item.pending = true
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
    room.state.scenes.forEach(async (scene:any)=>{
        let jsonScene:any = scene.toJSON()
        // console.log('scene is', jsonScene)
        // await checkAssetCacheStates(scene, jsonScene)


        // Object.values(COMPONENT_TYPES).forEach((component:any)=>{
        //     if(data[component]){
        //         for(let aid in data[component]){

        //         }
        //     }
        // })

        scenes.push(jsonScene)
    })

    // console.log('scenes are', scenes)

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
    // scene.parenting.forEach((assetItem:any, index:number)=>{
    //     let iwbAsset = scene.itemInfo.get(assetItem.aid)
    //     iwbAsset.editing = false
    //     iwbAsset.editor = ""

    //     //Reward Component
    //     let rewardInfo = scene.rewards.get(assetItem.aid)
    //     if(rewardInfo){
    //         let jsonItem = rewardInfo.toJSON()
    //         jsondata[COMPONENT_TYPES.REWARD_COMPONENT][assetItem.aid] = jsonItem
    //     }
    // })
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