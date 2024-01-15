import config from "@colyseus/tools";
import {IWBRoom} from "./rooms/IWBRoom";
import {ItemManager} from "./Objects/ItemManager";
import Listener from "./utils/eventListener";
import {initPlayFab} from "./utils/Playfab";
import cors from 'cors'
import bodyParser from "body-parser";
import express from 'express';
import path from 'path';
import { IWBManager } from "./Objects/IWBManager";
import { PlayerManager } from "./Objects/PlayerManager";
import { playground } from "@colyseus/playground";
import { router } from "./Objects/Routers/Router";

export let itemManager: ItemManager
export let iwbManager: IWBManager
export let playerManager: PlayerManager
export let eventListener: Listener

export default config({

    initializeGameServer: (gameServer) => {
        initPlayFab()

        eventListener = new Listener()
        itemManager = new ItemManager()
        iwbManager = new IWBManager()

        playerManager = new PlayerManager()

        gameServer.define('iwb-world', IWBRoom)
        .filterBy(['world'])
    },

    initializeExpress: (app) => {

        app.use(cors({origin: true}))
        app.options('*', cors());
        app.use(bodyParser.urlencoded({limit: '50mb', extended: true,  parameterLimit: 50000 }));
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