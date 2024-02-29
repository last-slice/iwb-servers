import {ArraySchema, Schema, type} from "@colyseus/schema";
import {ACTIONS, COMPONENT_TYPES} from "../utils/types";
import {
    ActionComponent,
    Actions,
    AnimationComponent,
    AudioComponent,
    CollisionComponent,
    Color4,
    ImageComponent,
    MaterialComponent,
    NFTComponent,
    NpcComponent,
    Quaternion,
    TextComponent,
    TriggerActionComponent,
    TriggerAreaComponent,
    TriggerComponent,
    Triggers,
    Vector3,
    VideoComponent,
    VisibilityComponent
} from "./Components";
import { IWBRoom } from "../rooms/IWBRoom";

export class SceneItem extends Schema {
    @type("string") id: string
    @type("number") ent: number
    @type('string') aid: string
    @type("string") n: string
    @type("string") type: string
    @type("string") sty: string
    @type("boolean") editing:boolean = false
    @type("boolean") ugc:boolean
    @type("boolean") pending:boolean = false
    @type("string") editor:string = ""
    @type("boolean") buildVis:boolean = true
    @type("boolean") locked:boolean = false
    @type(Vector3) p: Vector3 = new Vector3()
    @type(Quaternion) r: Vector3 = new Vector3()
    @type(Vector3) s: Vector3 = new Vector3()
    @type(["string"]) comps: ArraySchema = new ArraySchema<string>()
    @type(VisibilityComponent) visComp: VisibilityComponent
    @type(MaterialComponent) matComp: MaterialComponent
    @type(CollisionComponent) colComp: CollisionComponent
    @type(ImageComponent) imgComp: ImageComponent
    @type(VideoComponent) vidComp: VideoComponent
    @type(NFTComponent) nftComp: NFTComponent
    @type(TextComponent) textComp: TextComponent
    @type(AudioComponent) audComp: AudioComponent
    @type(TriggerComponent) trigComp: TriggerComponent
    @type(ActionComponent) actComp: ActionComponent
    @type(TriggerAreaComponent) trigArComp: TriggerAreaComponent
    @type(AnimationComponent) animComp: AnimationComponent
    @type(NpcComponent) npcComp: NpcComponent
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

    @type([SceneItem]) ass = new ArraySchema<SceneItem>();

    constructor(data?: any, room?:IWBRoom) {
        super()
        if (data) {
            // console.log('creating new scene', data)
            this.id = data.id
            this.n = data.n
            this.d = data.d
            this.pcnt = data.pcls.length
            this.cd = data.cd
            this.upd = data.upd
            this.o = data.o
            this.ona = data.ona
            this.cat = data.cat
            this.bpcl = data.bpcl
            this.bps = data.bps
            this.rat = data.rat
            this.rev = data.rev
            this.pcls = data.pcls
            this.sp = data.sp[0].split(",").length === 2 ? [data.sp[0].split(",")[0] + ",0," + data.sp[0].split(",")[1]] : data.sp
            this.cp = data.hasOwnProperty("cp") ? data.cp : ["0,0,0"]
            this.si = data.si
            this.toc = data.toc
            this.pc = data.pc
            this.isdl = data.isdl
            this.e = data.e
            this.w = data.w
            this.priv = data.priv
            this.im = data.im ? data.im : ""

            if (data.ass) {
                data.ass.forEach((asset: any) => {
                    try {
                        let item = new SceneItem()
                        item.id = asset.id
                        item.ent = asset.ent
                        item.p = new Vector3(asset.p)
                        item.r = new Quaternion(asset.r)
                        item.s = new Vector3(asset.s)
                        item.aid = asset.aid
                        item.type = asset.type
                        item.sty = asset.sty || asset.sty !== "Stream" ? "Local" : "Stream"
                        item.ugc = asset.hasOwnProperty("ugc") ? asset.ugc : false
                        item.pending = asset.hasOwnProperty("pending") ? asset.pending : false
                        item.locked =  asset.hasOwnProperty("locked") ? asset.locked : false
                        item.buildVis =  asset.hasOwnProperty("buildVis") ? asset.buildVis : true

                        if(item.ugc && room){
                            let ugcItem = room.state.realmAssets.get(item.id)
                            if(ugcItem){
                                item.pending = ugcItem.pending
                            }
                        }

                        // console.log('asset is pending', asset)

                        //add components
                        addItemComponents(item, asset)

                        this.ass.push(item)
                    } catch (e) {
                        console.log('error loading asset for scene', this.id, asset)
                    }
                })
            }
        }
    }
}

export function  addItemComponents(item: SceneItem, asset: any) {
    item.comps = asset.comps

    if(item.type !== "SM"){
        if(!item.comps.includes(COMPONENT_TYPES.COLLISION_COMPONENT)){
            item.comps.push(COMPONENT_TYPES.COLLISION_COMPONENT)
        }
    
        if(!item.comps.includes(COMPONENT_TYPES.TRIGGER_COMPONENT)){
            item.comps.push(COMPONENT_TYPES.TRIGGER_COMPONENT)
        }
    
        if(!item.comps.includes(COMPONENT_TYPES.ACTION_COMPONENT)){
            item.comps.push(COMPONENT_TYPES.ACTION_COMPONENT)
        }
    }

    item.comps.forEach((component: string) => {
        switch (component) {
            case COMPONENT_TYPES.MATERIAL_COMPONENT:
                item.matComp = new MaterialComponent()
                item.matComp.shadows = asset.matComp.shadows
                item.matComp.metallic = asset.matComp.metallic
                item.matComp.roughness = asset.matComp.roughness
                item.matComp.intensity = asset.matComp.intensity
                item.matComp.emissPath = asset.matComp.emissPath
                item.matComp.emissInt = asset.matComp.emissInt
                item.matComp.textPath = asset.matComp.textPath
                item.matComp.color = asset.matComp.color
                item.matComp.emiss = asset.matComp.emiss
                item.matComp.type = asset.matComp.type  ? asset.matComp.type : "PBR"
                item.matComp.emissColor = asset.matComp.emissColor ? asset.matComp.emissColor : ["1", "1", "1", "1"]
                break;

            case COMPONENT_TYPES.IMAGE_COMPONENT:
                item.imgComp = new ImageComponent()
                item.imgComp.url = asset.imgComp.url
                break;

            case COMPONENT_TYPES.VIDEO_COMPONENT:
                item.vidComp = new VideoComponent()
                item.vidComp.url = asset.vidComp?.url || ''
                item.vidComp.volume = asset.vidComp?.volume || 0.5
                item.vidComp.autostart = false // asset.vidComp?.autostart || true
                item.vidComp.loop = asset.vidComp?.loop || false
                break;

            case COMPONENT_TYPES.AUDIO_COMPONENT:
                // console.log('audio component is', asset)
                item.audComp = new AudioComponent()
                item.audComp.url = asset.hasOwnProperty("audComp") ? (asset.id !== "e6991f31-4b1e-4c17-82c2-2e484f53a124" ? "assets/" + asset.id + ".mp3" : asset.audComp.url) :""
                item.audComp.volume = asset.audComp?.volume || 0.5
                item.audComp.autostart = asset.audComp?.autostart
                item.audComp.loop = asset.audComp?.loop || false
                item.audComp.attachedPlayer = asset.audComp?.attachedPlayer || false
                break;

            case COMPONENT_TYPES.VISBILITY_COMPONENT:
                item.visComp = new VisibilityComponent()
                item.visComp.visible = asset.visComp.visible
                break;

             case COMPONENT_TYPES.COLLISION_COMPONENT:
                item.colComp = new CollisionComponent()
                item.colComp.iMask = asset.colComp ? asset.colComp.iMask : 2
                item.colComp.vMask = asset.colComp ? asset.colComp.vMask : 1
                break;

            case COMPONENT_TYPES.NFT_COMPONENT:
                item.nftComp = new NFTComponent()
                item.nftComp.contract = asset.nftComp ? asset.nftComp.contract : ""
                item.nftComp.tokenId = asset.nftComp ? asset.nftComp.tokenId : ""
                item.nftComp.chain = asset.nftComp ? asset.nftComp.chain : "eth"
                item.nftComp.style = asset.nftComp ? asset.nftComp.style : "none"
                break;

            case COMPONENT_TYPES.TEXT_COMPONENT:
                item.textComp = new TextComponent()
                if(asset.textComp){
                    item.textComp.text = asset.textComp.text
                    item.textComp.font = asset.textComp.font
                    item.textComp.fontSize = asset.textComp.fontSize

                    item.textComp.color = new Color4()
                    item.textComp.color.r = asset.textComp.color.r
                    item.textComp.color.g = asset.textComp.color.g
                    item.textComp.color.b = asset.textComp.color.b
                    item.textComp.color.a = asset.textComp.color.a

                    item.textComp.align = asset.textComp.align
                    item.textComp.outlineWidth = asset.textComp.outlineWidth
                    item.textComp.outlineColor = new Color4(asset.textComp.outlineColor)
                }
                break;

            case COMPONENT_TYPES.TRIGGER_COMPONENT:
                item.trigComp = new TriggerComponent()
                if(asset.trigComp){
                    item.trigComp.enabled = asset.trigComp.enabled             

                    asset.trigComp.triggers.forEach((data:any)=>{
                        let trigger = new Triggers()
                        trigger.type = data.type
                        trigger.pointer = data.pointer ? data.pointer : 0
                        trigger.showHover = data.showHover ? data.showHover : true
                        trigger.hoverText = data.hoverText ? data.hoverText : "Click here"

                        data.actions.forEach((action:any)=>{
                            trigger.actions.push(new TriggerActionComponent(action))
                        })

                        item.trigComp.triggers.push(trigger)
                    })
                }
                break;

            case COMPONENT_TYPES.ACTION_COMPONENT:
                item.actComp = new ActionComponent()
                if(asset.actComp){
                    for(let key in asset.actComp.actions){
                        let action = new Actions()
                        action.name = asset.actComp.actions[key].name
                        action.type = asset.actComp.actions[key].type
                        action.aid = asset.actComp.actions[key].aid

                        switch(asset.actComp.actions[key].type){
                            case ACTIONS.OPEN_LINK:
                                action.url = asset.actComp.actions[key].url
                                break;

                            case ACTIONS.PLAY_AUDIO:
                            case ACTIONS.PLAY_VIDEO:
                            case ACTIONS.TOGGLE_VIDEO:
                                break;

                            case ACTIONS.PLAY_ANIMATION:
                                action.animName = asset.actComp.actions[key].animName
                                action.animLoop = asset.actComp.actions[key].animLoop
                                break;

                            case ACTIONS.TELEPORT_PLAYER:
                                action.teleport = asset.actComp.actions[key].teleport
                                break;

                            case ACTIONS.EMOTE:
                                action.emote = asset.actComp.actions[key].emote
                                break;

                            case ACTIONS.SET_VISIBILITY:
                                action.vis = asset.actComp.actions[key].vis
                                action.vMask = asset.actComp.actions[key].vMask
                                action.iMask = asset.actComp.actions[key].iMask
                                break;
                        }

                        item.actComp.actions.set(key, action)
                    }
                }
                break;


            case COMPONENT_TYPES.TRIGGER_AREA_COMPONENT:
                item.trigArComp = new TriggerAreaComponent()
                if(asset.trigArComp){
                    item.trigArComp.enabled = asset.trigArComp.enabled   

                    asset.trigArComp.eActions.forEach((action:any)=>{
                        item.trigArComp.eActions.push(new TriggerActionComponent(action))
                    })

                    asset.trigArComp.lActions.forEach((action:any)=>{
                        item.trigArComp.lActions.push(new TriggerActionComponent(action))
                    })
                }
                break;

                case COMPONENT_TYPES.ANIMATION_COMPONENT:
                    item.animComp = new AnimationComponent()
                    if(asset.animComp){
                        item.animComp.enabled = asset.animComp.enabled   
                        item.animComp.autostart = asset.animComp.autostart  
                        item.animComp.autoloop = asset.animComp.autoloop
    
                        asset.animComp.animations.forEach((animation:any)=>{
                            item.animComp.animations.push(animation)
                        })

                        asset.animComp.durations.forEach((duration:any)=>{
                            item.animComp.durations.push(duration)
                        })
                    }
                    break;

                    case COMPONENT_TYPES.NPC_COMPONENT:
                    // console.log('item is npc component', asset)
                    item.npcComp = new NpcComponent()
                    if(asset.npcComp){
                        item.npcComp.name = asset.npcComp.name
                        item.npcComp.dName = asset.npcComp.dName
                        item.npcComp.bodyShape = asset.npcComp.bodyShape
                        item.npcComp.type = asset.npcComp.type
                        item.npcComp.wearables.length = 0

                        asset.npcComp.wearables.forEach((wearable:string)=>{
                            item.npcComp.wearables.push(wearable)
                        })

                        item.npcComp.eyeColor.r = asset.npcComp.eyeColor.r
                        item.npcComp.eyeColor.g = asset.npcComp.eyeColor.g
                        item.npcComp.eyeColor.b = asset.npcComp.eyeColor.b
            
                        item.npcComp.hairColor.r = asset.npcComp.hairColor.r
                        item.npcComp.hairColor.g = asset.npcComp.hairColor.g
                        item.npcComp.hairColor.b = asset.npcComp.hairColor.b
            
                        item.npcComp.skinColor.r = asset.npcComp.skinColor.r
                        item.npcComp.skinColor.g = asset.npcComp.skinColor.g
                        item.npcComp.skinColor.b = asset.npcComp.skinColor.b
                    }
                    break;
        }
    })
}
