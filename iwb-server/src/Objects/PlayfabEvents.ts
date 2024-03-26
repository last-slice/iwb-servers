import { addEvent } from "../utils/Playfab"
import { Player } from "./Player"


let eventQueue:any[] = []
let postingEvents = false

let eventUpdateInterval = setInterval(async()=>{
    checkEventQueue()
}, 1000 * 20)

async function checkEventQueue(){
    if(!postingEvents && eventQueue.length > 0){
        console.log('event queue has item, post to playfab')
        postingEvents = true
        let event = eventQueue.shift()
        try{
            await addEvent(event)
            postingEvents = false
        }
        catch(e){
            console.log('error posting event', e)
            postingEvents = false
            eventQueue.push(event) 
        }
    }
}

export function pushPlayfabEvent(type:any, player:any, data:any){
    let event:any = {
        EventName: type,
        PlayFabId: player.playFabData.PlayFabId,
        body:{
            player: player.dclData.name,
            wallet: player.dclData.userId,
        }
    }

    for(let key in data[0]){
        event.body[key] = data[0][key]
    }

    // console.log('new event to post is', event)
    eventQueue.push(event)
}