

import { Client } from "colyseus";
import { IWBRoom } from "../IWBRoom";
import { ACTIONS, COMPONENT_TYPES, SERVER_MESSAGE_TYPES } from "../../utils/types";
import { questManager } from "../../app.config";

export function iwbQuestHandler(room:IWBRoom){
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

        switch(info.action){
            case ACTIONS.QUEST_START:
                questManager.startQuest(player, info.quest.id)
                break;

            case ACTIONS.QUEST_ACTION:
                questManager.handleQuestStep(player, info.quest)
                break;
        }
    })
}