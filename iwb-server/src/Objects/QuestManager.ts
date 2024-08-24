

//e451156b-be78-4f0f-8505-7b2453a0fb07
//ca7fc75d-b052-4906-8669-5647bc4539dc

import { fetchPlayfabFile, fetchPlayfabMetadata, PLAYFAB_DATA_ACCOUNT } from "../utils/Playfab"
import { createAuthchainHeaders, initWeb3Wallet, sendSignedAPI, signMessage, wallet } from "./Web3"

export class QuestManager {
    baseURL = "https://quests.decentraland.org/"
    creator:string
    quests:any[] = []

    constructor(){
        this.creator = process.env.QUEST_ACCOUNT
        this.fetchQuests()
    }

    async fetchQuests(){
        try{
            if(!wallet){
                await initWeb3Wallet()
            }

            let metadata = await fetchPlayfabMetadata(PLAYFAB_DATA_ACCOUNT)
            let questData = await fetchPlayfabFile(metadata, "quests.json")
            console.log('server quest da is', questData)
            this.quests = questData
        
            await this.getServerQuests(this.baseURL, this.creator)
           
            // let questResponse = await fetch("https://quests.decentraland.org/api/creators/" + this.creator + "/quests")
            // let questData = await questResponse.json()
            // if(questData){
            //     // this.setQuests(questData.quests)
            //     this.quests = questData.quests
            // }
            // console.log('quest data is', questData)

            
        }
        catch(e){
            console.log('error getting quests', e)
        }
    }

    // setQuests(quests:[]){
    //     quests.forEach((quest:any) =>{
    //         this.quests.set(quest.id, quest)
    //     })
    // }

    async getServerQuests(baseURL:string, address:string){
        const getQuests = `${baseURL}api/creators/${address}/quests`
        
        const timestamp = String(Date.now())
    
        let commandData:any = { url: getQuests, method: 'GET', metadata: {}, actionType: 'list' }
        let payload = buildPayload(commandData, timestamp)
        let authchainHeaders = await createAuthchainHeaders(address,await signMessage(payload), payload, timestamp,JSON.stringify(commandData.metadata))
        console.log('auth chain headers' ,authchainHeaders)
        let response = await sendSignedAPI(getQuests, authchainHeaders)
        response.quests.forEach((quest:any)=>{
          let toUpdate = this.quests.find(($:any)=> $.id === quest.id)
            if(toUpdate){
              toUpdate.definition = quest.definition
            }
          })
    }
}



function buildPayload(commandData:any, timestamp:string){
    const pathname = new URL(commandData.url).pathname
    const payload = [commandData.method, pathname, timestamp, JSON.stringify(commandData.metadata)]
      .join(':')
      .toLowerCase()
    return payload
}


async function executeListSubcommand(
    baseURL: string,
    address: string
  ) {
  
    const getQuests = `${baseURL}api/creators/${address}/quests`
  
    // if (!isAddress(address)) {
    //   throw new CliError('You should provide a valid EVM address')
    // }
  
    let quests = await executeSubcommand(
      { url: getQuests, method: 'GET', metadata: {}, actionType: 'list' },
      async (authchainHeaders:any) => {
        const res = await fetch(getQuests, {
          method: 'GET',
          headers: {
            ...authchainHeaders,
            'Content-Type': 'application/json'
          }
        })
        if (res.status === 200) {
        //   const { quests } = (await res.json()) as { quests: { id: string; name: string }[] }
        const quests = await res.json()
          if (quests) {
            console.log("Your request has been processed successfully. The Quests' list is below: ", '')
            return quests.quests
          } else {
            console.log(`No Quest was created by ${address}`, '')
            return null
          }
        } else {
          const { code, message } = (await res.json()) as { code: number; message: string }
          console.log(`> Error returned by Quests Server: `)
          return null
        }
      }
    )

    console.log('quests are a', quests)
  }

  export async function executeSubcommand(
    commandData: {
      url: string
      method: 'GET' | 'POST' | 'PUT' | 'DELETE'
      metadata: Record<any, any>
      actionType: QuestLinkerActionType
      extraData?: {
        questName?: string
        questId?: string
        createQuest?: CreateQuest
      },
      address?:string
    },
    commandCallback: (authchainHeaders: Record<string, string>) => Promise<void>
  ) {
  
    const timestamp = String(Date.now())
    // const timestamp = "1724283408338"
  
    const pathname = new URL(commandData.url).pathname
    const payload = [commandData.method, pathname, timestamp, JSON.stringify(commandData.metadata)]
      .join(':')
      .toLowerCase()
  
    // const { program } = await getAddressAndSignature(
    //   components,
    //   linkerOps,
    //   awaitResponse,
    //   { messageToSign: payload, extraData: commandData.extraData, actionType: commandData.actionType },
    await commandCallback(
        createAuthchainHeaders(
        commandData.address,
        await signMessage(payload),
        payload,
        timestamp,
        JSON.stringify(commandData.metadata)
        )
    )
    // )
  
    // try {
    //   await awaitResponse
    // } finally {
    //   void program?.stop()
    // }
  }

  export type CreateQuest = {
    name: string
    description: string
    imageUrl: string
    definition: QuestDefinition
    reward?: {
      hook: {
        webhookUrl: string
        requestBody?: Record<string, string>
      }
      items: { name: string; imageLink: string }[]
    }
  }
  
  export interface QuestDefinition {
    steps: Step[]
    connections: Connection[]
  }
  
  export interface Connection {
    stepFrom: string
    stepTo: string
  }
  
  export interface Step {
    id: string
    description: string
    tasks: Task[]
  }
  
  export interface Action {
    type: string
    parameters: { [key: string]: string }
  }
  
  export interface Task {
    id: string
    description: string
    actionItems: Action[]
  }
  
  export type QuestLinkerActionType = 'create' | 'list' | 'activate' | 'deactivate'