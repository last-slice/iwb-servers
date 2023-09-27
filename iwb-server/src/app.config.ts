import config from "@colyseus/tools";
import { monitor } from "@colyseus/monitor";
import { playground } from "@colyseus/playground";
import { IWBRoom } from "./rooms/IWBRoom";
import { ItemManager } from "./Objects/ItemManager";
import Listener from "./utils/eventListener";
import { initPlayFab } from "./utils/Playfab";
import { SceneManager } from "./Objects/SceneManager";
import { handleGithook, initIWBDeploy } from "./Objects/Githooks";
import cors from 'cors'
import bodyParser from "body-parser";
import express from 'express';
import path from 'path';
import axios from "axios";
import { deploymentAuth, deploymentEndpoint } from "./iwb-server";
import { router } from "./Objects/Router";

export let itemManager:ItemManager
export let sceneManager:SceneManager
export let eventListener:Listener

export default config({

    initializeGameServer: (gameServer) => {
        initPlayFab()

        eventListener = new Listener()
        itemManager = new ItemManager()
        sceneManager = new SceneManager()

        gameServer.define('iwb-world', IWBRoom);
    },

    initializeExpress: (app) => {

        app.use(cors({ origin: true}))  
        app.options('*', cors());        
        app.use(bodyParser.urlencoded({ extended: true }));
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