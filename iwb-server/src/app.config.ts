import {monitor} from "@colyseus/monitor";
import config from "@colyseus/tools";
import {IWBRoom} from "./rooms/IWBRoom";
import cors from 'cors'
import bodyParser from "body-parser";
import express from 'express';
import path from 'path';
// import { PlayerManager } from "./Objects/PlayerManager";
import { playground } from "@colyseus/playground";
import { initPlayFab } from "./utils/Playfab";
import { IWBManager } from "./Objects/IWBManager";
import { ItemManager } from "./Objects/ItemManager";
import { router } from "./Routers/Router";

export let itemManager: ItemManager
export let iwbManager: IWBManager

export default config({

    initializeGameServer: (gameServer) => {
        initPlayFab()

        itemManager = new ItemManager()
        iwbManager = new IWBManager()

        gameServer.define('iwb-world', IWBRoom)
        .filterBy(['world','island'])
    },

    initializeExpress: (app) => { 
        app.use(cors({origin: true}))
        app.options('*', cors());
        app.use(bodyParser.urlencoded({limit: '50mb', extended: true }));
        app.use(bodyParser.json({ limit: '150mb' }));
        app.use(express.static('public'));
        app.use(express.static(path.join(__dirname, '..', 'public')));
        app.use(express.static(path.join('/root/iwb', 'dapps', 'upload')));
        app.use(express.static(path.join('/root/iwb', 'dapps', 'deploy')));
        app.use(express.static(path.join('/root/iwb-game-qa', 'dapps', 'deploy')));
        app.use('/colyseus', monitor())
        app.use("/playground", playground);
        app.use(router)
    },

    beforeListen: () => {
        /**
         * Before before gameServer.listen() is called.
         */
    }
});