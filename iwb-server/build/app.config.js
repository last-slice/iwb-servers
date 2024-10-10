"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.questManager = exports.iwbManager = exports.itemManager = void 0;
const monitor_1 = require("@colyseus/monitor");
const tools_1 = __importDefault(require("@colyseus/tools"));
const ws_transport_1 = require("@colyseus/ws-transport");
const IWBRoom_1 = require("./rooms/IWBRoom");
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
// import { PlayerManager } from "./Objects/PlayerManager";
const playground_1 = require("@colyseus/playground");
const Playfab_1 = require("./utils/Playfab");
const IWBManager_1 = require("./Objects/IWBManager");
const ItemManager_1 = require("./Objects/ItemManager");
const Router_1 = require("./Routers/Router");
const QuestManager_1 = require("./Objects/QuestManager");
exports.default = (0, tools_1.default)({
    initializeGameServer: (gameServer) => {
        (0, Playfab_1.initPlayFab)();
        exports.questManager = new QuestManager_1.QuestManager();
        exports.itemManager = new ItemManager_1.ItemManager();
        exports.iwbManager = new IWBManager_1.IWBManager();
        gameServer.define('iwb-world', IWBRoom_1.IWBRoom)
            .filterBy(['world', 'island']);
    },
    initializeTransport: function (opts) {
        return new ws_transport_1.WebSocketTransport({
            ...opts,
            pingInterval: 6000,
            pingMaxRetries: 4,
            maxPayload: 1024 * 1024 * 10, // 10MB Max Payload
        });
    },
    initializeExpress: (app) => {
        app.use((0, cors_1.default)({ origin: true }));
        app.options('*', (0, cors_1.default)());
        app.use(body_parser_1.default.urlencoded({ limit: '50mb', extended: true }));
        app.use(body_parser_1.default.json({ limit: '150mb' }));
        app.use(express_1.default.static('public'));
        app.use(express_1.default.static(path_1.default.join(__dirname, '..', 'public')));
        app.use(express_1.default.static(path_1.default.join('/root/iwb', 'dapps', 'upload')));
        app.use(express_1.default.static(path_1.default.join('/root/iwb', 'dapps', 'deploy')));
        app.use(express_1.default.static(path_1.default.join('/root/iwb-game-qa', 'dapps', 'deploy')));
        app.use('/colyseus', (0, monitor_1.monitor)());
        app.use("/playground", playground_1.playground);
        app.use(Router_1.router);
    },
    beforeListen: () => {
        /**
         * Before before gameServer.listen() is called.
         */
    }
});
