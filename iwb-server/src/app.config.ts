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

export let itemManager: ItemManager
export let sceneManager: SceneManager
export let iwbManager: IWBManager
export let eventListener: Listener

export default config({

    initializeGameServer: (gameServer) => {
        initPlayFab()

        eventListener = new Listener()
        itemManager = new ItemManager()
        iwbManager = new IWBManager()
        sceneManager = new SceneManager()

        gameServer.define('iwb-world', IWBRoom);
    },

    initializeExpress: (app) => {

        app.use(cors({origin: true}))
        app.options('*', cors());
        app.use(bodyParser.urlencoded({extended: true}));
        app.use(express.static('public')); // notice the absence of `__dirname`, explained later on
        app.use(express.static(path.join(__dirname, '..', 'public')));
        app.use("/", router);

        console.log(path.join(__dirname, '..', 'public'))
    },


    beforeListen: () => {
        /**
         * Before before gameServer.listen() is called.
         */
    }
});