import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Scene } from "./Scene";
import { Color4 } from "../utils/types";
import { Client } from "colyseus";

export class NftShapeComponent extends Schema{
    @type("string") urn:string
    @type("number") style:number
    @type(Color4) color:Color4
}

export function createNftShapeComponent(scene:Scene, aid:string, data:any){
    let component = new NftShapeComponent()
    component.urn = data.urn
    component.style = data.style
    data.color ? component.color = new Color4(data.color) : null
    scene.nftShapes.set(aid, component)
}

export function editNftShape(info:any, scene:Scene){
    let itemInfo:any = scene.nftShapes.get(info.aid)
    if(itemInfo){
        console.log('editing nft shape')
        for(let key in info){
            if(key === "style"){
                itemInfo[key] = info[key]
            }else{

                let parts = itemInfo.urn.split(":")
                switch(key){
                    case 'chain':
                        parts[1] = info[key]
                        itemInfo.urn = parts.join(":")
                        break;

                    case 'protocol':
                        parts[2] = info[key]
                        itemInfo.urn = parts.join(":")
                        break;

                    case 'address':
                        parts[3] = info[key]
                        itemInfo.urn = parts.join(":")
                        break;

                    case 'tokenId':
                        parts[4] = info[key]
                        itemInfo.urn = parts.join(":")
                        break;
                }
            }
        }
    }
}