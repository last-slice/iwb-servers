

import { Client } from "colyseus";
import { IWBRoom } from "../IWBRoom";
import { ACTIONS, COMPONENT_TYPES, SERVER_MESSAGE_TYPES } from "../../utils/types";
import { questManager } from "../../app.config";
import { getQuestStepData, handleQuestStep, startQuest } from "../../Objects/Quest";

export function iwbQuestHandler(room:IWBRoom){
    room.onMessage(SERVER_MESSAGE_TYPES.QUEST_STEP_DATA, (client:Client, info:any)=>{
        console.log('get quest step data', info.aid)
        if(!info || !info.aid || !info.sceneId){
            console.log('invalid request parameters')
            return
        }
        getQuestStepData(room, client, info)
    })

    room.onMessage(SERVER_MESSAGE_TYPES.QUEST_PLAYER_DATA, (client:Client, info:any)=>{
        console.log('get player quest data for quest', info.aid)
        if(!info || !info.aid || !info.sceneId){
            console.log('invalid request parameters')
            return
        }
        room.state.questManager.getPlayerData(client, info)
    })
    
    room.onMessage(SERVER_MESSAGE_TYPES.QUEST_ACTION, (client:Client, info:any)=>{
        console.log(SERVER_MESSAGE_TYPES.QUEST_ACTION + " received", info)
        if(!info || !info.action || !info.quest){
            console.log('invalid quest action parameters', info, client.userData.userId)
            return
        }

        if(!info.action){
            console.log('no quest action')
            return 
        }

        let player = room.state.players.get(client.userData.userId)
        if(!player){
            console.log('player doesnt exist on server, scammer?', client.userData.userId)
            return
        }

        let scene = room.state.scenes.get(info.sceneId)
        if(!scene){
            console.log('that scene no longer exists to start quest')
            return
        }

        switch(info.action){
            case ACTIONS.QUEST_START:
                if(!info.sceneId){
                    console.log('invalid scene id to start quest')
                    return
                }
                startQuest(scene, player, info.quest.id)
                // questManager.startQuest(scene, player, info.quest.id)
                break;

            case ACTIONS.QUEST_ACTION:
                if(!info.sceneId){
                    console.log('invalid scene id to start quest')
                    return
                }
                handleQuestStep(scene, player, info.quest)
                break;
        }
    })
}