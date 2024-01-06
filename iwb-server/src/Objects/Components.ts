import {ArraySchema, Schema, type, MapSchema} from "@colyseus/schema";
import {COMPONENT_TYPES} from "../utils/types";
import { SceneItem } from "./Scene";

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
    @type("number") vMask: number = 1
    @type("number") iMask: number = 2
}

export class MaterialComponent extends Schema {
    @type("boolean") shadows: boolean = true
    @type("number") metallic: number = 0
    @type("number") roughness: number = 1
    @type("number") intensity: number = 0
    @type("string") emissPath: string = ""
    @type('number') emissInt: number = 0
    @type("string") textPath: string = ""
    @type(['string']) color: ArraySchema = new ArraySchema<string>()
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
    @type("string") name: string = "Open Link"
    @type("number") entity: number = -500
    @type("string") url: string = "https://decentraland.org/play"
    @type("string") type: string = "open_link"
    @type("string") hoverText: string = "Click here"
}

export class ActionComponent extends Schema {
    @type({map:Actions}) actions = new MapSchema<Actions>()
}

export class Triggers extends Schema {
    @type({map:Actions}) actions = new MapSchema<Actions>()
    @type("string") type: string = "on_click"
}

export class TriggerComponent extends Schema {
    @type("boolean") enabled: boolean = false
    @type([Triggers]) triggers = new ArraySchema<Triggers>()
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
    item.comps.push(COMPONENT_TYPES.COLLISION_COMPONENT)
    item.colComp = new CollisionComponent()

    if(collision){
        item.colComp.iMask = collision.iMask
        item.colComp.vMask = collision.vMask
    }
}

export function addVisibilityComponent(item:SceneItem, selectedVisibility:boolean){
    item.comps.push(COMPONENT_TYPES.VISBILITY_COMPONENT)
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

export function addMaterialComponent(item:SceneItem){
    item.comps.push(COMPONENT_TYPES.MATERIAL_COMPONENT)
    item.matComp = new MaterialComponent()
    item.matComp.color.push("1")
    item.matComp.color.push("1")
    item.matComp.color.push("1")
    item.matComp.color.push("1")
}

export function addTextComponent(item:SceneItem, textComp:TextComponent){
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
    item.comps.push(COMPONENT_TYPES.TRIGGER_COMPONENT)
    item.trigComp = new TriggerComponent()
    if(trigComp){
        item.trigComp.enabled = trigComp.enabled
        trigComp.triggers.forEach((trigger:any)=>{
            item.trigComp.triggers.push(trigger)
        })
    }
}

export function addActionComponent(item:SceneItem, actComp:ActionComponent){
    item.comps.push(COMPONENT_TYPES.ACTION_COMPONENT)
    item.actComp = new ActionComponent()
    if(actComp){
        actComp.actions.forEach((action, key)=>{
            item.actComp.actions.set(key, action)
        })
    }
}

// export function addClickComponent(item:SceneItem, clickComp:ClickComponent){
//     item.comps.push(COMPONENT_TYPES.CLICK_COMPONENT)
//     item.clickComp = new ClickComponent()
//     if(clickComp){
//         item.clickComp.url = clickComp.url
//         item.clickComp.type = clickComp.type
//         item.clickComp.enabled = clickComp.enabled
//         item.clickComp.hoverText = clickComp.hoverText
//     }
// }

