"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pushPlayfabEvent = void 0;
const Playfab_1 = require("../utils/Playfab");
let eventQueue = [];
let postingEvents = false;
let eventUpdateInterval = setInterval(async () => {
    checkEventQueue();
}, 1000 * 20);
async function checkEventQueue() {
    if (!postingEvents && eventQueue.length > 0) {
        console.log('event queue has item, post to playfab');
        postingEvents = true;
        let event = eventQueue.shift();
        try {
            await (0, Playfab_1.addEvent)(event);
            postingEvents = false;
        }
        catch (e) {
            console.log('error posting event', e);
            postingEvents = false;
            eventQueue.push(event);
        }
    }
}
function pushPlayfabEvent(event) {
    eventQueue.push(event);
}
exports.pushPlayfabEvent = pushPlayfabEvent;
