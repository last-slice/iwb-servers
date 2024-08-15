import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Scene } from "./Scene";
import { COMPONENT_TYPES, Color4 } from "../utils/types";
import { Client } from "colyseus";

export class NftShapeComponent extends Schema{
    @type("string") chain:string = "ethereum"
    @type("string") standard:string = "erc721"
    @type("string") contract:string = ""
    @type("string") tokenId:string = ""
    @type("number") style:number = 0
    @type(Color4) color:Color4
}

export function createNftShapeComponent(scene:Scene, aid:string, data:any){
    console.log('creating nft component', data)
    let component:any = new NftShapeComponent()
    if(data){
        for(let key in data){
            if(key === "color"){
                component[key] = new Color4(data[key])
            }
            else{
                component[key] = data[key]
            }
            
        }
    }
    // component.urn = data.urn
    // component.style = data.style
    // data.color ? component.color = new Color4(data.color) : null
    scene[COMPONENT_TYPES.NFT_COMPONENT].set(aid, component)
}

export function editNftShape(info:any, scene:Scene){
    let itemInfo:any = scene[COMPONENT_TYPES.NFT_COMPONENT].get(info.aid)
    if(itemInfo){
        console.log('editing nft shape')
        for(let key in info){
            if(key === "color"){

            }
            else{
                itemInfo[key] = info[key]
            }

            // if(key === "style"){
            //     itemInfo[key] = info[key]
            // }else{

            //     let parts = itemInfo.urn.split(":")
            //     switch(key){
            //         case 'chain':
            //             parts[1] = info[key]
            //             itemInfo.urn = parts.join(":")
            //             break;

            //         case 'protocol':
            //             parts[2] = info[key]
            //             itemInfo.urn = parts.join(":")
            //             break;

            //         case 'address':
            //             parts[3] = info[key]
            //             itemInfo.urn = parts.join(":")
            //             break;

            //         case 'tokenId':
            //             parts[4] = info[key]
            //             itemInfo.urn = parts.join(":")
            //             break;
            //     }
            // }
        }
    }
}