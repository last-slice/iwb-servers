import config from "@colyseus/tools";
import {IWBRoom} from "./rooms/IWBRoom";
import {ItemManager} from "./Objects/ItemManager";
import Listener from "./utils/eventListener";
import {initPlayFab} from "./utils/Playfab";
import {SceneManager} from "./Objects/SceneManager";
import cors from 'cors'
import bodyParser from "body-parser";
import express from 'express';
import path from 'path';
import {router} from "./Objects/Router";
import { IWBManager } from "./Objects/IWBManager";
import { PlayerManager } from "./Objects/PlayerManager";
import { UserRoom } from "./rooms/UserRoom";
import { playground } from "@colyseus/playground";

export let itemManager: ItemManager
export let sceneManager: SceneManager
export let iwbManager: IWBManager
export let playerManager: PlayerManager
export let eventListener: Listener

export default config({

    initializeGameServer: (gameServer) => {
        initPlayFab()

        eventListener = new Listener()
        itemManager = new ItemManager()
        sceneManager = new SceneManager()
        iwbManager = new IWBManager()

        playerManager = new PlayerManager()

        gameServer.define('iwb-world', IWBRoom)
        gameServer.define('user-world', UserRoom)
        .filterBy(['world'])
    },

    initializeExpress: (app) => {

        app.use(cors({origin: true}))
        app.options('*', cors());
        app.use(bodyParser.urlencoded({extended: true}));
        app.use(express.static('public'));
        app.use(express.static(path.join(__dirname, '..', 'public')));
        app.use("/", router);


// ...
app.use("/playground", playground);

        console.log(path.join(__dirname, '..', 'public'))
    },


    beforeListen: () => {
        /**
         * Before before gameServer.listen() is called.
         */
    }
});