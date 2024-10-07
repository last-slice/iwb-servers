import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { ACTIONS, COMPONENT_TYPES, CooldownPrerequisite, ItemPrerequisite, LevelPrerequisite, PrerequisiteType, Quest, QUEST_PREREQUISITES, QuestCompletionPrerequisite, QuestStep, RepeatablePrerequisite, REWARD_TYPES, SERVER_MESSAGE_TYPES, StepCompletionPrerequisite, TimePrerequisite } from "../utils/types";
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

    playerData:any = {}
}

export async function createQuestComponent(room:IWBRoom, scene:Scene, aid:string, data?:any){
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

        if(room.state.questManager.data[aid]){
            component.playerData = room.state.questManager.data[aid].playerData
            console.log('queset player data is', component.playerData)
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

export function startQuest(scene:Scene, player: Player, questId: string): boolean {
    let quest = scene[COMPONENT_TYPES.QUEST_COMPONENT].get(questId)
    if(!quest || !quest.enabled){
        console.log('quest does not exist or is not enabled')
        return
    }

    if(quest.playerData[player.address]){
        console.log('player has already started this quest')
        return
    }

    console.log('player data does not exist for this quest')
    quest.playerData[player.address] = {
        id: questId,
        started:true,
        status: 'in-progress',
        startedAt: Math.floor(Date.now()/1000),
        completedSteps: [],
        currentStep: quest.steps[0].id,  // Dynamically set the first step
        currentRepeats:0
      };
    player.sendPlayerMessage(SERVER_MESSAGE_TYPES.QUEST_ACTION, {action:ACTIONS.QUEST_START, quest:quest})
}

export function handleQuestStep(scene:Scene, player: Player, questInfo:any): boolean {
    let quest = scene[COMPONENT_TYPES.QUEST_COMPONENT].get(questInfo.id)
    if(!quest || !quest.enabled){
        console.log('quest does not exist or is not enabled')
        return
    }

    if(!quest.playerData[player.address]){
        console.log('player has not started this quest')
        return
    }

    if(quest.playerData[player.address].completed){
        console.log('player has already completed this quest')
        return
    }

    const step:QuestStep = quest.steps.find((step:any) => step.id === questInfo.stepId)
    if(!step){
      console.log("that step does not exist for this quest")
      return 
    }

    if(hasPlayerCompletedStep(quest.playerData[player.address], questInfo.stepId)){
        console.log('player has already completed the step')
        return
      }

    // if(step.prerequisites.length > 0 && !this.meetsPrerequisites(player, step.prerequisites)){
    //   console.log('player has not completed all prerequisite steps')
    //   return
    // }

    if (step.type === "branching") {
        // // Player chooses one of the options in the branching step
        // if (player.choice === "option_1") {
        //   completeStep(player, step.options[0]);  // Collect herbs
        // } else if (player.choice === "option_2") {
        //   completeStep(player, step.options[1]);  // Defeat the wild beast
        // }
      } else {
        // Linear step completion
        if (!quest.playerData[player.address].completedSteps.includes(questInfo.stepId)) {
            quest.playerData[player.address].completedSteps.push(questInfo.stepId);
            console.log(`Player ${player.name} completed step ${questInfo.stepId} in quest ${questInfo.id}`);
            player.sendPlayerMessage(SERVER_MESSAGE_TYPES.QUEST_ACTION, {action:ACTIONS.QUEST_ACTION, quest:quest, sceneId:scene.id})
          }
      }


      // Check if the quest is now complete
        if (isQuestComplete(quest.playerData[player.address], quest.steps)) {
            // Mark quest as completed for the player
            quest.playerData[player.address].status = 'completed';
            player.sendPlayerMessage(SERVER_MESSAGE_TYPES.QUEST_ACTION, {action:'COMPLETE', questId:questInfo.id, quest:quest, sceneId:scene.id})
            console.log(`Player ${player.name} has completed the quest ${questInfo.id}`);
        }
}

function isQuestComplete(playerData:any, steps:QuestStep[]): boolean {
    // Check if all steps in the quest are completed by the player
    const allStepsCompleted = steps.every(step => hasPlayerCompletedStep(playerData, step.id));
    return allStepsCompleted;
  }

function hasPlayerCompletedStep(playerData:any, stepId:string){
    return playerData.completedSteps.includes(stepId);
}

export function getQuestStepData(room:IWBRoom, client:Client, info:any){
    let scene = room.state.scenes.get(info.sceneId)
    if(!scene){
        console.log('no scene to get quest step data')
        return
    }

    let quest = scene[COMPONENT_TYPES.QUEST_COMPONENT].get(info.aid)
    if(!quest){
        console.log('no quest to get steps')
        return
    }

    client.send(SERVER_MESSAGE_TYPES.QUEST_STEP_DATA, {sceneId:info.sceneId, aid:info.aid, steps:quest.steps})
}

export async function getQuestsPlayerData(room:IWBRoom){
    let questData:any = {}
    room.state.scenes.forEach((scene:Scene, aid:string)=>{
        scene[COMPONENT_TYPES.QUEST_COMPONENT].forEach((quest:QuestComponent, aid:string)=>{
            questData[aid] = {
                playerData:quest.playerData
            }
        })
    })
    console.log('quest player data is', questData)
    return questData
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



