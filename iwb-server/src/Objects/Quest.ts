import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { COMPONENT_TYPES, CooldownPrerequisite, ItemPrerequisite, LevelPrerequisite, PrerequisiteType, Quest, QUEST_PREREQUISITES, QuestCompletionPrerequisite, QuestStep, RepeatablePrerequisite, REWARD_TYPES, SERVER_MESSAGE_TYPES, StepCompletionPrerequisite, TimePrerequisite } from "../utils/types";
import { Scene } from "./Scene";
import { IWBRoom } from "../rooms/IWBRoom";
import { Client, generateId } from "colyseus";
import { Player } from "./Player";

export class QuestComponent extends Schema {
    @type("string") name:string = ""
    @type("string") description:string = ""
    @type("boolean") enabled:boolean = false

    steps:QuestStep[] = []
    prerequisites:QUEST_PREREQUISITES[] = []
}

export async function createQuestComponent(scene:Scene, aid:string, data?:any){
    console.log('creating quest component',data)
    let component:any = new QuestComponent()
    if(data){
        for(let key in data){
            if(key !== "steps" && key !== "prerequisites"){
                component[key] = data[key]
            }
        }
        if(data.hasOwnProperty("steps") || data.hasOwnProperty("prerequisites")){
            await loadQuestDefinition(component, data)
        }
    }
    scene[COMPONENT_TYPES.QUEST_COMPONENT].set(aid, component)
}

export async function editQuestComponent(player:Player, info:any, scene:Scene){
    let component:any = scene[COMPONENT_TYPES.QUEST_COMPONENT].get(info.aid)
    if(!component){
        return
    }

    switch(info.action){
        case 'edit':
            for(let key in info.metadata){
                if(component.hasOwnProperty(key)){
                    component[key] = info.metadata[key]
                }
            }
            break;

        case 'definition':
            console.log('send quest definition to editor')
            player.sendPlayerMessage(SERVER_MESSAGE_TYPES.GET_QUEST_DEFINITIONS, {steps:component.steps, prerequisites:component.prerequisites})
            break;
        case 'add-step':
            try{
                await validateNewStep(component, info.step)
                player.sendPlayerMessage(SERVER_MESSAGE_TYPES.GET_QUEST_DEFINITIONS, {steps:component.steps, prerequisites:component.prerequisites})
            }
            catch(e){
                console.log('error validating step', e)
            }
            break;

        case 'add-prereq':
            break;
        default:
            break;
    }
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

async function loadQuestDefinition(component:QuestComponent, quest: any) {
      component.prerequisites = quest.prerequisites;
      component.steps = quest.steps.map((step: any): QuestStep => {
        const stepPrerequisites = resolvePrerequisites(quest, step.prerequisites, quest.steps);
        const options = step.options?.map((option: any): QuestStep => {
          const optionPrerequisites = resolvePrerequisites(quest, option.prerequisites);
          return {
            id: option.id,
            description: option.description,
            type: option.type,
            target: option.target,
            quantity: option.quantity,
            prerequisites: optionPrerequisites,
          };
        });
        return {
          id: step.id,
          description: step.description,
          type: step.type,
          prerequisites: stepPrerequisites,
          options: options,
          order: step.order
        };
      });
      console.log('quest data is', component)
}

function getPrerequisiteById(quest:any, id: string): QUEST_PREREQUISITES | undefined {
    return quest.prerequisites.find((prereq:any) => prereq.id === id);
}

function resolvePrerequisites(quest:any, prerequisiteIds: any[], steps?: QuestStep[]): QUEST_PREREQUISITES[] {
  console.log('ids are', prerequisiteIds)
  return prerequisiteIds.map((prereqObj: any) => {
    if(prereqObj.id.includes("step_")){
      if(steps){
        const step = steps.find(s => s.id === prereqObj.id)
        if(!step){
          throw new Error(`Step with ID ${prereqObj.id} not found`);
        }
        return {id:prereqObj.id, type:PrerequisiteType.StepCompletion, value: prereqObj.id} as QUEST_PREREQUISITES
      }
    }

    const prerequisite = getPrerequisiteById(quest, prereqObj.id);
    if (!prerequisite) {
      throw new Error(`Prerequisite with ID ${prereqObj.id} not found`);
    }
    return prerequisite;
  });
}

function validateNewStep(component:QuestComponent, newStep:any){
    newStep.id = "step_" + generateId(5)
    const stepPrerequisites = resolvePrerequisites(component, component.prerequisites, component.steps);
    // const options = step.options?.map((option: any): QuestStep => {
    //     const optionPrerequisites = resolvePrerequisites(quest, option.prerequisites);
    //     return {
    //       id: option.id,
    //       description: option.description,
    //       type: option.type,
    //       target: option.target,
    //       quantity: option.quantity,
    //       prerequisites: optionPrerequisites,
    //     };
    //   });
    let step:QuestStep = {
        id: newStep.id,
        description: newStep.description,
        type: 'interaction',
        prerequisites: stepPrerequisites,
        // options: options,
        // order: step.order
    }
    component.steps.push(step)
    console.log('quest steps are ', component.steps)
}

function loadPrerequisiteDefinitions(json:any){
    const typedPrerequisites: QUEST_PREREQUISITES[] = json.map((prereq: any) => {
      switch (prereq.type) {
        case PrerequisiteType.Level:
          return {
            id: prereq.id,
            type: PrerequisiteType.Level,
            value: prereq.value,
            description: prereq.description,
            world:prereq.world
          } as LevelPrerequisite;

        case PrerequisiteType.Time:
          return {
            id: prereq.id,
            type: PrerequisiteType.Time,
            value: prereq.value,
            description: prereq.description,
            world:prereq.world
          } as TimePrerequisite;

        case PrerequisiteType.Item:
          return {
            id: prereq.id,
            type: PrerequisiteType.Item,
            value: prereq.value,
            description: prereq.description,
            world:prereq.world
          } as ItemPrerequisite;

        case PrerequisiteType.QuestCompletion:
          return {
            id: prereq.id,
            type: PrerequisiteType.QuestCompletion,
            value: prereq.value,
            description: prereq.description,
            world:prereq.world
          } as QuestCompletionPrerequisite;

        case PrerequisiteType.StepCompletion:
          return {
            id: prereq.id,
            type: PrerequisiteType.StepCompletion,
            value: prereq.value,
            questId: prereq.questId,
            description: prereq.description,
            world:prereq.world
          } as StepCompletionPrerequisite;

      case PrerequisiteType.Cooldown:
        return {
          id: prereq.id,
          type: PrerequisiteType.Cooldown,
          value: prereq.value,
          lastCompleted: prereq.lastCompleted,
          description: prereq.description,
          world:prereq.world
        } as CooldownPrerequisite;
      
      case PrerequisiteType.Repeatable:
        return {
          id: prereq.id,
          type: PrerequisiteType.Repeatable,
          questId: prereq.questId,
          maxRepeats: prereq.maxRepeats,
          description: prereq.description,
          world:prereq.world
        } as RepeatablePrerequisite;

        default:
          throw new Error(`Unknown prerequisite type: ${prereq.type}`);
      }
    });
    return typedPrerequisites
}

export async function checkQuestCache(scene:Scene, aid:string, jsonScene:any){
    let itemInfo = scene[COMPONENT_TYPES.QUEST_COMPONENT].get(aid)
    if(itemInfo){
        let itemJSON:any = itemInfo.toJSON()
        itemJSON.steps = itemInfo.steps
        itemJSON.prerequisites = itemInfo.prerequisites
        jsonScene[COMPONENT_TYPES.QUEST_COMPONENT][aid] = itemJSON
        console.log('quest edata is', itemJSON)
    }
    return jsonScene
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



