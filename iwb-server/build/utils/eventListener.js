"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Listener {
    constructor() {
        this.events = {};
    }
    on(eventName, callback) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(callback);
    }
    off(eventName, callback) {
        if (!this.events[eventName]) {
            return;
        }
        if (!callback) {
            delete this.events[eventName];
        }
        else {
            const index = this.events[eventName].indexOf(callback);
            if (index !== -1) {
                this.events[eventName].splice(index, 1);
            }
        }
    }
    emit(eventName, data) {
        const eventCallbacks = this.events[eventName];
        if (eventCallbacks) {
            eventCallbacks.forEach((callback) => {
                callback(data); // Pass the JSON object to the callback
            });
        }
    }
}
exports.default = Listener;
