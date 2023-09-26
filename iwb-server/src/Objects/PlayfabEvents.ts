import { addEvent } from "../utils/Playfab"


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

export function pushPlayfabEvent(event:any){
    eventQueue.push(event)
}