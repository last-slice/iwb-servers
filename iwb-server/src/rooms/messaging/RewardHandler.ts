import { Player } from "../../Objects/Player"
import { SERVER_MESSAGE_TYPES, ACTIONS, REWARD_TYPES } from "../../utils/types"
import { IWBRoom } from "../IWBRoom"

export function iwbRewardHandler(room:IWBRoom){
//     room.onMessage(SERVER_MESSAGE_TYPES.CLAIM_REWARD, async(client, info)=>{
//         console.log(SERVER_MESSAGE_TYPES.CLAIM_REWARD + " message", info)
//         let now = Math.floor(Date.now() / 1000)

//         try{
//             if(info.action === ACTIONS.GIVE_REWARD){
//                 let player:Player = room.state.players.get(client.userData.userId)
//                 if(player && !player.claimingReward){
//                     player.claimingReward = true
//                  let scene = room.state.scenes.get(info.sceneId)
//                  if(scene){
//                      let asset = scene.ass.find((asset:SceneItem)=> asset.aid === info.aid)
//                      if(asset && asset.rComp){
//                         let rewardConfig = asset.rComp
//                         if(rewardConfig.start > now || rewardConfig.end < now){
//                             console.log('outside of claim window', rewardConfig.start, rewardConfig.end, player.dclData.userId)
//                             player.claimingReward = false
//                             player.sendPlayerMessage(SERVER_MESSAGE_TYPES.CLAIM_REWARD, {valid:false, reason:"Outside Claim Window"})
//                             return
//                         }
                        
//                          let walletClaims = rewardConfig.claims.filter((claim)=> claim.user === client.userData.userId).length
//                          let ipClaims = rewardConfig.claims.filter((claim)=> claim.ip === client.userData.ip).length
//                         if(ipClaims >= rewardConfig.ip){
//                             console.log('too many ip claims', ipClaims, rewardConfig.ip)
//                             player.sendPlayerMessage(SERVER_MESSAGE_TYPES.CLAIM_REWARD, {valid:false, reason:"Too Many Claims"})
//                             player.claimingReward = false
//                             return
//                         }    

//                         if(walletClaims >= rewardConfig.amt){
//                             console.log('too many wallet claims', walletClaims, rewardConfig.amt)
//                             player.sendPlayerMessage(SERVER_MESSAGE_TYPES.CLAIM_REWARD, {valid:false, reason:"Too Many Claims"})
//                             player.claimingReward = false
//                             return
//                         } 

//                         sendReward(asset, player)

//                      }else{
//                         console.log('trying to claim reward outside of parameters - scammer?', client.userData.userId)
//                         player.sendPlayerMessage(SERVER_MESSAGE_TYPES.CLAIM_REWARD, {valid:false, reason:"Potential Bot Detected"})
//                         return
//                      }
//                  }
//                 } else{
//                     console.log('not a real player')
//                     player.sendPlayerMessage(SERVER_MESSAGE_TYPES.CLAIM_REWARD, {valid:false, reason:"Potential Bot Detected"})
//                     player.claimingReward = false
//                 }
//             }
//         }
//         catch(e){
//             console.log('error claiming reward', client.userData.userId, info, e)
//             let player:Player = room.state.players.get(client.userData.userId)
//                 if(player){
//                     player.claimingReward = false
//                     player.sendPlayerMessage(SERVER_MESSAGE_TYPES.CLAIM_REWARD, {valid:false, reason:"Claim Error"})
//                 }
//         }
//    }) 
}

function sendReward(assetId:string, player:Player){
    // switch(asset.rComp.type){
    //     case REWARD_TYPES.DCL_ITEM:
    //         sendDCLItem(asset, player)
    //         break;
    // }

    // console.log('claims are now', asset.rComp.claims)
}

async function sendDCLItem(assetId:string, player:Player){
    // try{
    //     const request = await fetch('https://rewards.decentraland.org/api/rewards', {
    //         method: 'POST',
    //         headers: {
    //           'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify({
    //           campaign_key: asset.rComp.key,
    //           beneficiary: player.dclData.userId
    //         }),
    //       })
          
    //       const response = await request.json()
    //       console.log(response)
    //       if(response.ok){
    //         asset.rComp.claims.push({ip:player.ip, user:player.dclData.userId})
    //         player.claimingReward = false
    //         player.sendPlayerMessage(SERVER_MESSAGE_TYPES.CLAIM_REWARD, {valid:true, image: response.data[0].image, name:response.data[0].token})
    //       }else{
    //         player.claimingReward = false
    //         player.sendPlayerMessage(SERVER_MESSAGE_TYPES.CLAIM_REWARD, {valid:false, reason: "Reward Server Error"})
    //       }
    // }
    // catch(e){
    //     console.log('error sending dcl reward claim', asset.rComp, player.dclData.userId, e)
    //     player.claimingReward = false
    // }
}