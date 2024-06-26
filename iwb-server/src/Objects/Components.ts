import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import {COMPONENT_TYPES, REWARD_TYPES} from "../utils/types";
import { SceneItem } from "./Scene";
import { Client, generateId } from "colyseus";
import { Player } from "./Player";

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

export class CollisionComponent extends Schema {
    @type("number") vMask: number = 0
    @type("number") iMask: number = 3
}

export class MaterialComponent extends Schema {
    @type("boolean") shadows: boolean = true
    @type("number") metallic: number = 0
    @type("number") roughness: number = 1
    @type("number") intensity: number = 0
    @type("string") emissPath: string = ""
    @type("boolean") emiss: boolean = true
    @type('number') emissInt: number = 0
    @type("string") textPath: string = ""
    @type("string") type: string = "PBR"
    @type(['string']) color: ArraySchema = new ArraySchema<string>("1", "1", "1", "1")
    @type(['string']) emissColor: ArraySchema = new ArraySchema<string>("1", "1", "1", "1")
}

export class VisibilityComponent extends Schema {
    @type("boolean") visible: boolean = true
}

export class ImageComponent extends Schema {
    @type("string") url: string = ""
}

export class NFTComponent extends Schema {
    @type("string") contract: string = "0xf23e1aa97de9ca4fb76d2fa3fafcf4414b2afed0"
    @type("string") tokenId: string = "1"
    @type("string") chain: string = "eth"
    @type("number") style: number = 22
}

export class VideoComponent extends Schema {
    @type("string") url: string = ""
    @type("number") volume: number = .5
    @type("boolean") autostart: boolean = true
    @type("boolean") loop: boolean = false
}

export class AudioComponent extends Schema {
    @type("string") url: string = ""
    @type("number") volume: number = .5
    @type("boolean") autostart: boolean = false
    @type("boolean") loop: boolean = false
    @type("boolean") attachedPlayer: boolean = false
}


export class TextComponent extends Schema {
    @type("string") text: string = "Text"
    @type("number") font: number = 2
    @type("number") align: number = 4
    @type("number") fontSize: number = 1
    @type("number") outlineWidth: number = 0
    @type(Color4) outlineColor: Color4 = new Color4(1,1,1,1)
    @type(Color4) color: Color4 = new Color4(1,1,1,1)
}

export class Actions extends Schema {
    @type("string") name: string
    @type("number") entity: number
    @type("string") url: string
    @type("string") type: string
    @type("string") hoverText: string
    @type("string") aid: string
    @type("string") animName: string
    @type("string") teleport: string
    @type("string") teleCam: string
    @type("boolean") animLoop:boolean
    @type("string") emote: string
    @type("boolean") vis:boolean
    @type("number") vMask:number
    @type("number") iMask:number
    @type("string") showText: string
    @type("number") showTimer: string
    @type("number") showSize: number
    @type("string") showPos: string
    @type("number") startDTimer: number
    @type("string") startDId: string
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
}

export class ActionComponent extends Schema {
    @type({map:Actions}) actions = new MapSchema<Actions>()
}

export class TriggerActionComponent extends Schema {
    @type('string') aid:string
    @type('string') id:string
}

export class Triggers extends Schema {
    @type([TriggerActionComponent]) actions = new ArraySchema<TriggerActionComponent>()
    @type("string") type: string = "on_click"
    @type("string") hoverText: string = "Click here"
    @type("number") pointer:number = 0
    @type("number") distance:number = 3
    @type("boolean") showHover: boolean = true
}

export class TriggerComponent extends Schema {
    @type("boolean") enabled: boolean = false
    @type([Triggers]) triggers = new ArraySchema<Triggers>()
}

export class TriggerAreaComponent extends Schema {
    @type("boolean") enabled: boolean = true
    @type([TriggerActionComponent]) eActions = new ArraySchema<TriggerActionComponent>()
    @type([TriggerActionComponent]) lActions = new ArraySchema<TriggerActionComponent>()
}

export class AnimationComponent extends Schema {
    @type("boolean") enabled: boolean = true
    @type("boolean") autostart: boolean = false
    @type("boolean") autoloop: boolean = false
    @type("number") startIndex: number = 0
    @type(['string']) animations = new ArraySchema<string>()
    @type(['number']) durations = new ArraySchema<number>()
}

export class NpcComponent extends Schema {
    @type("string") name:string = ""
    @type("number") bodyShape:number = 0
    @type("number") type:number = 0
    @type("number") change:number = 0
    @type("boolean") dName: boolean = true
    @type(['string']) wearables = new ArraySchema<string>()
    @type(Color4) eyeColor = new Color4(0,0,0,1)
    @type(Color4) skinColor = new Color4(215,170,105,1)
    @type(Color4) hairColor = new Color4(0,0,0,1)
}

export class DialogButtonComponent extends Schema {
    @type("string") label: string
    @type(['string']) actions = new ArraySchema<string>()
}

export class DialogInfoComponent extends Schema {
    @type("string") text: string
    @type([DialogButtonComponent]) buttons = new ArraySchema<DialogButtonComponent>
    //audio
    //image
}

export class DialogComponent extends Schema {
    @type("string") name:string = "Dialog"
    @type("string") id:string
    @type("number") i:number = 0
    @type("number") type:number = 0
    @type([DialogInfoComponent]) dialogs = new ArraySchema<DialogInfoComponent>()
}

export class TweenComponent extends Schema {
    @type("number") type:number = 0
    @type("number") duration:number = 1
    @type("number") easing:number = 0
    @type("string") endPos:string = "0,0,0"
}

export class RewardComponent extends Schema {
    @type("string") id:string
    @type("string") type:string = REWARD_TYPES.DCL_ITEM
    @type("number") start:number
    @type("number") end:number
    @type("number") ip:number
    @type("number") amt:number

    o:string

    // @filter(function(
    //     this: RewardComponent, // the instance of the class `@filter` has been defined (instance of `Card`)
    //     client: Client, // the Room's `client` instance which this data is going to be filtered to
    //     value: RewardComponent['key'], // the value of the field to be filtered. (value of `number` field)
    //     root: Schema // the root state Schema instance
    // ) {
    //     return this.o === client.userData.userId;//
    // })

    key:string

    en:boolean
    claims:any[] = []
}

export class AccessComponent extends Schema {
    @type("string") id:string
    @type("string") type:string
    @type("string") nftType:string
    @type("string") category:string
    @type("string") filter:string
    @type("string") contract:string
    @type("string") tokenId:string
}


export function addNFTComponent(item:SceneItem, nft:NFTComponent){
    item.comps.push(COMPONENT_TYPES.NFT_COMPONENT)
    item.nftComp = new NFTComponent()

    if(nft !== null){
        item.nftComp.chain = nft.chain
        item.nftComp.contract = nft.contract
        item.nftComp.tokenId = nft.tokenId
        item.nftComp.style = nft.style
    }
}

export function addCollisionComponent(item:SceneItem, collision:CollisionComponent){
    item.colComp = new CollisionComponent()

    if(collision){
        item.colComp.iMask = collision.iMask
        item.colComp.vMask = collision.vMask
    }
}

export function addVisibilityComponent(item:SceneItem, selectedVisibility:boolean){
    item.visComp = new VisibilityComponent()
    item.visComp.visible = selectedVisibility
}

export function addImageComponent(item:SceneItem, url:string){
    item.comps.push(COMPONENT_TYPES.IMAGE_COMPONENT)
    item.imgComp = new ImageComponent()
    item.imgComp.url = url
}

export function addVideoComponent(item:SceneItem, data:VideoComponent){
    item.comps.push(COMPONENT_TYPES.VIDEO_COMPONENT)
    item.vidComp = new VideoComponent()
    if(data !== null){
        item.vidComp.url = data.url
        item.vidComp.autostart = data.autostart
        item.vidComp.loop = data.loop
        item.vidComp.volume = data.volume
    }
}

export function addAudioComponent(item:SceneItem, data:any){
    console.log('adding audio data', item.sty, data)
    item.comps.push(COMPONENT_TYPES.AUDIO_COMPONENT)
    item.audComp = new AudioComponent()
    item.audComp.url = "" + (item.sty !== "stream" ? "assets/" + item.id + ".mp3" : "")

    if(data !== null){
        item.audComp.url = "" + (item.sty !== "stream" ? "assets/" + item.id + ".mp3" : data.url)
        item.audComp.autostart = data.autostart
        item.audComp.loop = data.loop
        item.audComp.volume = data.volume
        item.audComp.attachedPlayer = data.attachedPlayer
    }
    console.log('new audio asset is', item.audComp.url)
}

export function addMaterialComponent(item:SceneItem, data:any){
    item.comps.push(COMPONENT_TYPES.MATERIAL_COMPONENT)
    item.matComp = new MaterialComponent()
    if(data !== null){
        console.log('maerial component is not null')
    
    }


    // @type("boolean") shadows: boolean = true
    // @type("number") metallic: number = 0
    // @type("number") roughness: number = 1
    // @type("number") intensity: number = 0
    // @type("string") emissPath: string = ""
    // @type('number') emissInt: number = 0
    // @type("string") textPath: string = ""
    // @type("string") type: string = "pbr"

    
}

export function addTextComponent(item:SceneItem, textComp:TextComponent){
    console.log('adding text component', item, textComp)
    
    item.comps.push(COMPONENT_TYPES.TEXT_COMPONENT)
    item.textComp = new TextComponent()
    if(textComp){
        item.textComp.text = textComp.text
        item.textComp.font = textComp.font
        item.textComp.fontSize = textComp.fontSize

        item.textComp.color = new Color4()
        item.textComp.color.r = textComp.color.r
        item.textComp.color.g = textComp.color.g
        item.textComp.color.b = textComp.color.b
        item.textComp.color.a = textComp.color.a

        item.textComp.align = textComp.align
        item.textComp.outlineWidth = textComp.outlineWidth
        item.textComp.outlineColor = textComp.outlineColor
    }
}

export function addTriggerComponent(item:SceneItem, trigComp:TriggerComponent){
    item.trigComp = new TriggerComponent()
    if(trigComp){
        item.trigComp.enabled = trigComp.enabled
        trigComp.triggers.forEach((trigger:any)=>{
            item.trigComp.triggers.push(trigger)
        })
    }
}

export function addActionComponent(item:SceneItem, actComp:ActionComponent){
    item.actComp = new ActionComponent()
    if(actComp){
        actComp.actions.forEach((action, key)=>{
            item.actComp.actions.set(key, action)
        })
    }
}

export function addTriggerAreaComponent(item:SceneItem, trigArComp:TriggerAreaComponent){
    console.log('adding trigger area component')
    item.trigArComp = new TriggerAreaComponent()
    if(trigArComp){
        item.trigArComp.enabled = trigArComp.enabled
        trigArComp.eActions.forEach((action)=>{
            item.trigArComp.eActions.push(action)
        })
        trigArComp.lActions.forEach((action)=>{
            item.trigArComp.lActions.push(action)
        })
    }
}

export function addClickAreaComponent(item:SceneItem){
    console.log('adding click area component')
    item.colComp.iMask = 0
    item.colComp.vMask = 1
}

export function addAnimationComponent(item:SceneItem, animations:any){
    item.animComp = new AnimationComponent()
    item.animComp.enabled = true
    item.animComp.autostart = false
    item.animComp.autoloop = false

    animations.forEach((animation:any)=>{
        item.animComp.animations.push(animation.name)
        item.animComp.durations.push(animation.duration)
    })
}

export function addNPCComponent(item:SceneItem, npcComp:NpcComponent){
    console.log('adding npc component')
    item.npcComp = new NpcComponent()
    if(npcComp){
        item.npcComp.name = npcComp.name
        item.npcComp.dName = npcComp.dName
        item.npcComp.bodyShape = npcComp.bodyShape
        item.npcComp.wearables = npcComp.wearables

        item.npcComp.eyeColor = npcComp.eyeColor
        item.npcComp.hairColor = npcComp.hairColor
        item.npcComp.skinColor = npcComp.skinColor
    }
}

export function addDialogComponent(item:SceneItem, dialComp:DialogComponent){
    console.log('adding npc component')
    item.dialComp = new DialogComponent()
    if(dialComp){
        item.dialComp.id = dialComp.id
        // item.npcComp.name = npcComp.name
        // item.npcComp.dName = npcComp.dName
        // item.npcComp.bodyShape = npcComp.bodyShape
        // item.npcComp.wearables = npcComp.wearables

        // item.npcComp.eyeColor = npcComp.eyeColor
        // item.npcComp.hairColor = npcComp.hairColor
        // item.npcComp.skinColor = npcComp.skinColor
    }else{
        item.dialComp.id = generateId(5)
    }
}

export function addRewardComponent(item:SceneItem, reward:RewardComponent, owner?:string){
    // item.comps.push(COMPONENT_TYPES.REWARD_COMPONENT)
    item.rComp = new RewardComponent()
    item.rComp.id = generateId(5)
    if(reward !== null){
        item.rComp.o = owner? owner : ""
        item.rComp.id = reward.id
        item.rComp.type = reward.type ? reward.type : REWARD_TYPES.DCL_ITEM
        item.rComp.start = reward.start
        item.rComp.end = reward.end
        item.rComp.ip = reward.ip
        item.rComp.amt = reward.amt
        item.rComp.key = reward.key
        item.rComp.en = reward.en
        item.rComp.claims = reward.claims
    }
}
