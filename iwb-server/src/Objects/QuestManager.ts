import { Client } from 'colyseus'
import { IWBRoom } from '../rooms/IWBRoom'
import data from '../tests/testQuests.json'
import { fetchPlayfabFile, fetchPlayfabMetadata, fetchUserMetaData } from '../utils/Playfab'
import { QUEST_PREREQUISITES, PrerequisiteType, LevelPrerequisite, TimePrerequisite, ItemPrerequisite, QuestCompletionPrerequisite, StepCompletionPrerequisite, CooldownPrerequisite, RepeatablePrerequisite, Quest, QuestStep, SERVER_MESSAGE_TYPES, COMPONENT_TYPES } from '../utils/types'
import { Player } from './Player'
import { Scene } from './Scene'

export class QuestManager {
  room:IWBRoom
  quests:any[] = []
  prerequisites:QUEST_PREREQUISITES[] = []


  data:any = {}

  constructor(){
  }

  public static async create(room:IWBRoom){
    const instance = new QuestManager()
    await instance.initialize(room)
    return instance
  }

  async initialize(room:IWBRoom){
    this.room = room
    await this.fetchQuests(room)
  }

  async fetchQuests(room:IWBRoom){
      try{
          let metadata = await fetchUserMetaData({
            EntityToken:{
              Entity:{
                Id:this.room.state.realmId,
                Type:this.room.state.realmTokenType, 
              },
              EntityToken:this.room.state.realmToken
            }
          })

          let questData = await fetchPlayfabFile(metadata, "" + room.state.world + "-quests-data.json", true)
          console.log('quest data is', questData)
          if(questData || questData !== undefined){
            console.log('we have quest file, load it', questData)
            this.data = questData
            // this.loadQuestDefinitions(questData.quests)
            // console.log('this realm quests are a', this.quests)
          }else{
            console.log('no quest file, dont do anything')
          }
      }
      catch(e){
          console.log('error getting quests', e)
      }
  }

  getPlayerData(client:Client, info:any){
    let scene = this.room.state.scenes.get(info.sceneId)
    if(!scene){
      console.log('invalid scene to get player quest data')
      return
    }

    let questInfo = scene[COMPONENT_TYPES.QUEST_COMPONENT].get(info.aid)
    if(!questInfo){
      console.log('invalid quest ifo to get player quest data')
      return
    }

    // if(!questInfo.playerData[client.userData.userId]){
    //   console.log('no player quest data')
    //   client.send(SERVER_MESSAGE_TYPES.QUEST_PLAYER_DATA, {aid:info.aid, data:{}})
    //   return
    // }

    client.send(SERVER_MESSAGE_TYPES.QUEST_PLAYER_DATA, {aid:info.aid, playerData:questInfo.playerData[client.userData.userId]})
  }

  loadPrerequisiteDefinitions(json:any){
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
    this.prerequisites = typedPrerequisites
  }

  loadQuestDefinitions(json: any) {
    const typedQuests: Quest[] = json.map((quest: any): Quest => {
      const questPrerequisites = this.resolvePrerequisites(quest.prerequisites);
      const steps = quest.steps.map((step: any): QuestStep => {
        const stepPrerequisites = this.resolvePrerequisites(step.prerequisites, quest.steps);
        const options = step.options?.map((option: any): QuestStep => {
          const optionPrerequisites = this.resolvePrerequisites(option.prerequisites);
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
      return {
        id: quest.id,
        name: quest.name,
        scene: quest.scene,
        description: quest.description,
        world: quest.world,
        prerequisites: questPrerequisites,
        steps: steps,
        rewards: quest.rewards
      };
    });
    typedQuests.forEach((quest:Quest)=>{
      this.quests.push(quest)
    })

    console.log('server quests are ', this.quests)
  }

  getPrerequisiteById(id: string): QUEST_PREREQUISITES | undefined {
    return this.prerequisites.find(prereq => prereq.id === id);
  }

  // Function to resolve prerequisites using the cached array
  resolvePrerequisites(prerequisiteIds: any[], steps?: QuestStep[]): QUEST_PREREQUISITES[] {
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

      const prerequisite = this.getPrerequisiteById(prereqObj.id);
      if (!prerequisite) {
        throw new Error(`Prerequisite with ID ${prereqObj.id} not found`);
      }
      return prerequisite;
    });
  }

  deleteQuest(id:string){
    let questIndex = this.quests.findIndex(q=> q.id === id)
    if(questIndex < 0){
      throw new Error("Quest not found")
    }

    this.quests.splice(questIndex, 1)
  }

   // Function to allow a player to start a quest
   startQuest(player: Player, questId: string): boolean {
    const quest = this.quests.find(q => q.id === questId);
    if (!quest) {
      console.log(`Quest with ID ${questId} not found`);
      return false;
    }

    // Check if player already started or completed the quest
    if (player.hasStartedQuest(questId)) {
      console.log(`Player ${player.name} has already started or completed the quest ${questId}`);
      return false;
    }

    // Check if the player meets the global prerequisites for starting the quest
    const prerequisitesMet = this.meetsPrerequisites(player, quest.prerequisites, questId);
    if (!prerequisitesMet) {
      console.log(`Player ${player.name} does not meet the prerequisites to start quest ${questId}`);
      return false;
    }

    // Mark the quest as started in the player's progress
    player.startQuest(quest);
    console.log(`Player ${player.name} started quest ${questId}`);
    return true;
  }

  // Function to validate prerequisites
  meetsPrerequisites(player: Player, prerequisites: QUEST_PREREQUISITES[], questId?:string): boolean {
    const currentTime:number = Math.floor(Date.now()/1000)
    for (const prerequisite of prerequisites) {
      switch (prerequisite.type) {
      // case PrerequisiteType.Level:
      //   return player.level >= prerequisite.value;
      // case PrerequisiteType.Item:
      //   return player.inventory.includes(prerequisite.value);
      case PrerequisiteType.QuestCompletion:
        const completedQuest = player.getQuest(prerequisite.value as string);
          if (!completedQuest || completedQuest.status !== 'completed') {
            console.log(`Player has not completed the prerequisite quest: ${prerequisite.value}`);
            return false;
          }
          return true
      case PrerequisiteType.StepCompletion:
        const stepPrerequisite = prerequisite as StepCompletionPrerequisite
        const questForStep = player.getQuest(stepPrerequisite.questId);  // Fetch the quest from the player's progress
        console.log('player quest data is', questForStep)
          if (!questForStep || !questForStep.completedSteps.includes(stepPrerequisite.value as string)) {
            console.log(`Player has not completed the prerequisite step: ${stepPrerequisite.value} for quest: ${stepPrerequisite.questId}`);
            return false;  // Fails if the player hasn't completed the required step
          }
          return true
      case PrerequisiteType.Time:
        if (typeof prerequisite.value === 'number') {
          return currentTime >= prerequisite.value;
        }
        return false
      case PrerequisiteType.Cooldown:
        const cooldownPrerequisite = prerequisite as CooldownPrerequisite;
        if (typeof cooldownPrerequisite.value === 'number') {
          const timeSinceLastCompletion = (new Date(currentTime).getTime() - new Date(cooldownPrerequisite.lastCompleted).getTime()) / 1000;
          return timeSinceLastCompletion >= cooldownPrerequisite.value;
        } else {
          return false
          throw new Error("Cooldown prerequisite's value must be a number.");
        }
      case PrerequisiteType.Repeatable:
        const repeatablePrerequisite = prerequisite as RepeatablePrerequisite;
        const playerRepeatableQuest = player.getQuest(repeatablePrerequisite.questId as string);
        return (!playerRepeatableQuest || repeatablePrerequisite.maxRepeats === undefined || playerRepeatableQuest.currentRepeats < repeatablePrerequisite.maxRepeats);
      default:
        return false;
      }
    }
    return true
  }

  handleQuestStep(scene:Scene, player: Player, questInfo:any){
    const quest = this.quests.find(q => q.id === questInfo.id);
    const playerQuestData = player.getQuest(questInfo.id)

    if (!quest) {
      console.log(`Quest with ID ${questInfo.id} not found`);
      return
    }

    if(!playerQuestData){
      console.log('player doent have that quest data')
      return
    }

    if (!player.hasStartedQuest(questInfo.id)) {
      console.log(`Player ${player.name} has not started the quest ${questInfo.id}`);
      return
    }

    const step:QuestStep = quest.steps.find((step:any) => step.id === questInfo.stepId)
    if(!step){
      console.log("that step does not exist for this quest")
      return 
    }

    if(player.hasCompletedStep(questInfo.id, questInfo.stepId)){
      console.log('player has already completed the step')
      return
    }

    if(step.prerequisites.length > 0 && !this.meetsPrerequisites(player, step.prerequisites)){
      console.log('player has not completed all prerequisite steps')
      return
    }

    if (step.type === "branching") {
      // // Player chooses one of the options in the branching step
      // if (player.choice === "option_1") {
      //   completeStep(player, step.options[0]);  // Collect herbs
      // } else if (player.choice === "option_2") {
      //   completeStep(player, step.options[1]);  // Defeat the wild beast
      // }
    } else {
      // Linear step completion
      player.completeQuestStep(questInfo.id, step.id)
    }

    //  // Find the next available step
    //  const nextStepIndex = quest.steps.findIndex((step:any) =>
    //   !playerQuestData.completedSteps.includes(step.id) && this.meetsPrerequisites(quest, step)
    // );

    // if (nextStepIndex === -1) {
    //   // All steps are completed, mark the quest as completed
    //   player.completeQuest(questInfo.id)
    // } else {
    //   // Set the next step as the current step
    //   playerQuestData.currentStep = quest.steps[nextStepIndex].id;
    //   console.log(`Player ${player.name} moved to step ${playerQuestData.currentStep} in quest ${quest.id}`);
    // }

    // Check if the quest is now complete
    if (this.isQuestComplete(player, quest)) {
      // Mark quest as completed for the player
      player.completeQuest(quest.id);
      console.log(`Player ${player.name} has completed the quest ${quest.id}`);
    }
  }

  isQuestComplete(player: Player, quest: Quest): boolean {
    // Check if all steps in the quest are completed by the player
    const allStepsCompleted = quest.steps.every(step => player.hasCompletedStep(quest.id, step.id));

    return allStepsCompleted;
  }

  // Function to get the current step index for the player in a specific quest
  getCurrentStepIndex(player: Player, questId: string): number | null {
    const quest = this.quests.find(q => q.id === questId);
    if (!quest) {
      console.log(`Quest with ID ${questId} not found`);
      return null;
    }

    // Loop through each step in the quest and find the current step index
    for (let i = 0; i < quest.steps.length; i++) {
      const step = quest.steps[i];

      // Check if the step is completed
      if (player.hasCompletedStep(questId, step.id)) {
        continue;  // Skip completed steps
      }

      // Check if the step is available to complete (prerequisites met)
      if (this.meetsPrerequisites(player, step.prerequisites)) {
        return i;  // Return the index of the current step
      }
    }

    // If no step is found, return null (quest might be fully completed)
    return null;
  }
}



































//e451156b-be78-4f0f-8505-7b2453a0fb07
//ca7fc75d-b052-4906-8669-5647bc4539dc



// import { fetchPlayfabFile, fetchPlayfabMetadata, PLAYFAB_DATA_ACCOUNT } from "../utils/Playfab"
// import { Scene } from "./Scene"
// import { createAuthchainHeaders, initWeb3Wallet, sendSignedAPI, signMessage, wallet } from "./Web3"

// export class QuestManager {
//     baseURL = "https://quests.decentraland.org/"
//     creator:string
//     quests:any[] = []

//     constructor(){
//         this.creator = process.env.QUEST_ACCOUNT
//         this.fetchQuests()
//     }

//     async fetchQuests(){
//         try{
//             if(!wallet){
//                 await initWeb3Wallet()
//             }

//             let metadata = await fetchPlayfabMetadata(PLAYFAB_DATA_ACCOUNT)
//             let questData = await fetchPlayfabFile(metadata, "quests.json")
//             // console.log('server quest da is', questData)
//             this.quests = questData
        
//             await this.getServerQuests(this.baseURL, this.creator)
//         }
//         catch(e){
//             console.log('error getting quests', e)
//         }
//     }

//     // setQuests(quests:[]){
//     //     quests.forEach((quest:any) =>{
//     //         this.quests.set(quest.id, quest)
//     //     })
//     // }

//     async getServerQuests(baseURL:string, address:string){
//       try{        
//         const getQuests = `${baseURL}api/creators/${address}/quests`
        
//         const timestamp = String(Date.now())
    
//         let commandData:any = { url: getQuests, method: 'GET', metadata: {}, actionType: 'list' }
//         let payload = buildPayload(commandData, timestamp)
//         let authchainHeaders = await createAuthchainHeaders(address,await signMessage(payload), payload, timestamp,JSON.stringify(commandData.metadata))
//         // console.log('auth chain headers' ,authchainHeaders)
//         let response = await sendSignedAPI(getQuests, commandData.method, authchainHeaders, 200)
//         response.quests.forEach((quest:any)=>{
//           let toUpdate = this.quests.find(($:any)=> $.id === quest.id)
//             if(toUpdate){
//               toUpdate.definition = quest.definition
//             }
//           })}
//       catch(e){
//         console.log('error getting server quests from quest service', e)
//       }
//     }

//     async createQuest(scene:Scene, quest:any){
//       try{        
//         const createQuest = `${this.baseURL}api/quests`
        
//         const timestamp = String(Date.now())
    
//         let commandData:any = { url: createQuest, method: 'POST', metadata:quest, actionType: 'create', extraData:{questName: quest.name, createQuest:quest} }
//         let payload = buildPayload(commandData, timestamp)
//         let authchainHeaders = await createAuthchainHeaders(this.creator,await signMessage(payload), payload, timestamp,JSON.stringify(commandData.metadata))
//         let response = await sendSignedAPI(createQuest, commandData.method, authchainHeaders, JSON.stringify(quest))
//         // console.log('response is', response)
//     }
//     catch(e){
//         console.log('error getting quests', e)
//     }
//     }
// }



// function buildPayload(commandData:any, timestamp:string){
//     const pathname = new URL(commandData.url).pathname
//     const payload = [commandData.method, pathname, timestamp, JSON.stringify(commandData.metadata)]
//       .join(':')
//       .toLowerCase()
//     return payload
// }


// async function executeListSubcommand(
//     baseURL: string,
//     address: string
//   ) {
  
//     const getQuests = `${baseURL}api/creators/${address}/quests`
  
//     // if (!isAddress(address)) {
//     //   throw new CliError('You should provide a valid EVM address')
//     // }
  
//     let quests = await executeSubcommand(
//       { url: getQuests, method: 'GET', metadata: {}, actionType: 'list' },
//       async (authchainHeaders:any) => {
//         const res = await fetch(getQuests, {
//           method: 'GET',
//           headers: {
//             ...authchainHeaders,
//             'Content-Type': 'application/json'
//           }
//         })
//         if (res.status === 200) {
//         //   const { quests } = (await res.json()) as { quests: { id: string; name: string }[] }
//         const quests = await res.json()
//           if (quests) {
//             console.log("Your request has been processed successfully. The Quests' list is below: ", '')
//             return quests.quests
//           } else {
//             console.log(`No Quest was created by ${address}`, '')
//             return null
//           }
//         } else {
//           const { code, message } = (await res.json()) as { code: number; message: string }
//           console.log(`> Error returned by Quests Server: `)
//           return null
//         }
//       }
//     )

//     console.log('quests are a', quests)
//   }

//   export async function executeSubcommand(
//     commandData: {
//       url: string
//       method: 'GET' | 'POST' | 'PUT' | 'DELETE'
//       metadata: Record<any, any>
//       actionType: QuestLinkerActionType
//       extraData?: {
//         questName?: string
//         questId?: string
//         createQuest?: CreateQuest
//       },
//       address?:string
//     },
//     commandCallback: (authchainHeaders: Record<string, string>) => Promise<void>
//   ) {
  
//     const timestamp = String(Date.now())
//     // const timestamp = "1724283408338"
  
//     const pathname = new URL(commandData.url).pathname
//     const payload = [commandData.method, pathname, timestamp, JSON.stringify(commandData.metadata)]
//       .join(':')
//       .toLowerCase()
  
//     // const { program } = await getAddressAndSignature(
//     //   components,
//     //   linkerOps,
//     //   awaitResponse,
//     //   { messageToSign: payload, extraData: commandData.extraData, actionType: commandData.actionType },
//     await commandCallback(
//         createAuthchainHeaders(
//         commandData.address,
//         await signMessage(payload),
//         payload,
//         timestamp,
//         JSON.stringify(commandData.metadata)
//         )
//     )
//     // )
  
//     // try {
//     //   await awaitResponse
//     // } finally {
//     //   void program?.stop()
//     // }
//   }

//   export type CreateQuest = {
//     name: string
//     description: string
//     imageUrl: string
//     definition: QuestDefinition
//     reward?: {
//       hook: {
//         webhookUrl: string
//         requestBody?: Record<string, string>
//       }
//       items: { name: string; imageLink: string }[]
//     }
//   }
  
//   export interface QuestDefinition {
//     steps: Step[]
//     connections: Connection[]
//   }
  
//   export interface Connection {
//     stepFrom: string
//     stepTo: string
//   }
  
//   export interface Step {
//     id: string
//     description: string
//     tasks: Task[]
//   }
  
//   export interface Action {
//     type: string
//     parameters: { [key: string]: string }
//   }
  
//   export interface Task {
//     id: string
//     description: string
//     actionItems: Action[]
//   }
  
//   export type QuestLinkerActionType = 'create' | 'list' | 'activate' | 'deactivate'