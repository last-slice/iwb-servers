"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventListener = exports.playerManager = exports.iwbManager = exports.itemManager = void 0;
const tools_1 = __importDefault(require("@colyseus/tools"));
const IWBRoom_1 = require("./rooms/IWBRoom");
const ItemManager_1 = require("./Objects/ItemManager");
const eventListener_1 = __importDefault(require("./utils/eventListener"));
const Playfab_1 = require("./utils/Playfab");
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const IWBManager_1 = require("./Objects/IWBManager");
const PlayerManager_1 = require("./Objects/PlayerManager");
const playground_1 = require("@colyseus/playground");
const Router_1 = require("./Objects/Routers/Router");
exports.default = (0, tools_1.default)({
    initializeGameServer: (gameServer) => {
        (0, Playfab_1.initPlayFab)();
        exports.eventListener = new eventListener_1.default();
        exports.itemManager = new ItemManager_1.ItemManager();
        exports.iwbManager = new IWBManager_1.IWBManager();
        exports.playerManager = new PlayerManager_1.PlayerManager();
        gameServer.define('iwb-world', IWBRoom_1.IWBRoom)
            .filterBy(['world']);
    },
    initializeExpress: (app) => {
        app.use((0, cors_1.default)({ origin: true }));
        app.options('*', (0, cors_1.default)());
        app.use(body_parser_1.default.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));
        app.use(express_1.default.static('public'));
        app.use(express_1.default.static(path_1.default.join(__dirname, '..', 'public')));
        app.use("/", Router_1.router);
        // ...
        app.use("/playground", playground_1.playground);
        console.log(path_1.default.join(__dirname, '..', 'public'));
    },
    beforeListen: () => {
        /**
         * Before before gameServer.listen() is called.
         */
    }
});
