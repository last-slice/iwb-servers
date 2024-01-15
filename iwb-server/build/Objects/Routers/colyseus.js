"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.colyseusRouter = void 0;
const monitor_1 = require("@colyseus/monitor");
const playground_1 = require("@colyseus/playground");
function colyseusRouter(router) {
    router.use('/colyseus', (0, monitor_1.monitor)());
    if (process.env.NODE_ENV !== "production") {
        router.use("/playground", playground_1.playground);
    }
}
exports.colyseusRouter = colyseusRouter;
