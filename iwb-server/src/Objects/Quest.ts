import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { COMPONENT_TYPES, REWARD_TYPES, SERVER_MESSAGE_TYPES } from "../utils/types";
import { Scene } from "./Scene";
import { IWBRoom } from "../rooms/IWBRoom";
import { Client } from "colyseus";
import { Player } from "./Player";

export class RewardComponent extends Schema {
    @type("string") id:string
    @type("string") type:string = REWARD_TYPES.DCL_ITEM
    @type("number") start:number = 0
    @type("number") end:number = 0 
    @type("number") ip:number = 1
    @type("number") amt:number = 1
    @type("boolean") not:boolean = true

    o:string

    key:string

    en:boolean
    claims:any[] = []
}

export function createRewardComponent(scene:Scene, aid:string, data?:any){
    console.log('creating rewrd component',data)
    let component:any = new RewardComponent()
    if(data){
        for(let key in data){
            // if(key === "claims"){
            //     component.claims =
            //     data.claims.forEach((claim:string)=>{
            //         component.claims.pu
            //     })
            // }else{
                component[key] = data[key]
            // }
        }
    }
    scene[COMPONENT_TYPES.REWARD_COMPONENT].set(aid, component)
}

export function editRewardComponent(info:any, scene:Scene){
    let rewardInfo:any = scene[COMPONENT_TYPES.REWARD_COMPONENT].get(info.aid)
    if(!rewardInfo){
        return
    }

    switch(info.action){
        case 'edit':
            if(info.type !== "claims"){
                rewardInfo[info.type] = info.value
            }
            break;
    }
}

export function handleReward(room:IWBRoom, client:Client, scene:Scene, info:any){
    console.log('handling reward givewaway', info)
    let now = Math.floor(Date.now() / 1000)

    try{
        let player:Player = room.state.players.get(client.userData.userId)
        if(player && !player.claimingReward){
            player.claimingReward = true
            let scene = room.state.scenes.get(info.sceneId)
            if(!scene){
                console.log('not a real player')
                player.sendPlayerMessage(SERVER_MESSAGE_TYPES.CLAIM_REWARD, {valid:false, reason:"Potential Bot Detected"})
                player.claimingReward = false
                return
            }
            let rewardInfo = scene[COMPONENT_TYPES.REWARD_COMPONENT].get(info.aid)
            if(!rewardInfo){
                console.log('trying to claim reward outside of parameters - scammer?', client.userData.userId)
                player.sendPlayerMessage(SERVER_MESSAGE_TYPES.CLAIM_REWARD, {valid:false, reason:"Potential Bot Detected"})
                return
            }

            if(rewardInfo.start > now || rewardInfo.end < now){
                console.log('outside of claim window', rewardInfo.start, rewardInfo.end, player.dclData.userId)
                player.claimingReward = false
                player.sendPlayerMessage(SERVER_MESSAGE_TYPES.CLAIM_REWARD, {valid:false, reason:"Outside Claim Window"})
                return
            }
                
            let walletClaims = rewardInfo.claims.filter((claim)=> claim.user === client.userData.userId).length
            let ipClaims = rewardInfo.claims.filter((claim)=> claim.ip === client.userData.ip).length
            if(ipClaims >= rewardInfo.ip){
                console.log('too many ip claims', ipClaims, rewardInfo.ip)
                player.sendPlayerMessage(SERVER_MESSAGE_TYPES.CLAIM_REWARD, {valid:false, reason:"Too Many Claims"})
                player.claimingReward = false
                return
            }    

            if(walletClaims >= rewardInfo.amt){
                console.log('too many wallet claims', walletClaims, rewardInfo.amt)
                player.sendPlayerMessage(SERVER_MESSAGE_TYPES.CLAIM_REWARD, {valid:false, reason:"Too Many Claims"})
                player.claimingReward = false
                return
            } 

            sendReward(rewardInfo, player)
        }else{
            console.log('player is already trying to claim a reward')
        }
    }
    catch(e){
        console.log('error claiming reward', client.userData.userId, info, e)
        let player:Player = room.state.players.get(client.userData.userId)
            if(player){
                player.claimingReward = false
                player.sendPlayerMessage(SERVER_MESSAGE_TYPES.CLAIM_REWARD, {valid:false, reason:"Claim Error"})
            }
    }
}

function sendReward(rewardInfo:any, player:Player){
    switch(rewardInfo.type){
        case REWARD_TYPES.DCL_ITEM:
            sendDCLItem(rewardInfo, player)
            break;
    }
}

async function sendDCLItem(rewardInfo:any, player:Player){
    try{
        const request = await fetch('https://rewards.decentraland.org/api/rewards', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              campaign_key: rewardInfo.key,
              beneficiary: player.dclData.userId
            }),
          })
          
          const response = await request.json()
          console.log(response)
          if(response.ok){
            rewardInfo.claims.push({ip:player.ip, user:player.dclData.userId})
            player.claimingReward = false
            player.sendPlayerMessage(SERVER_MESSAGE_TYPES.CLAIM_REWARD, {valid:true, image: response.data[0].image, name:response.data[0].token})
          }else{
            player.claimingReward = false
            player.sendPlayerMessage(SERVER_MESSAGE_TYPES.CLAIM_REWARD, {valid:false, reason: "Reward Server Error"})
          }

          console.log('claims are now', rewardInfo.claims, rewardInfo.key)
    }
    catch(e){
        console.log('error sending dcl reward claim', rewardInfo.key, player.dclData.userId, e)
        player.claimingReward = false
    }
}

export async function checkRewardCache(scene:Scene, aid:string, jsonScene:any){
    let itemInfo = scene[COMPONENT_TYPES.REWARD_COMPONENT].get(aid)
    if(itemInfo){
        let itemJSON:any = itemInfo.toJSON()
        itemJSON.claims = itemInfo.claims
        itemJSON.key = itemInfo.key
        jsonScene[COMPONENT_TYPES.REWARD_COMPONENT][aid] = itemJSON
    }
    return jsonScene
}