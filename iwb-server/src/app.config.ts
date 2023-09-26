import config from "@colyseus/tools";
import { monitor } from "@colyseus/monitor";
import { playground } from "@colyseus/playground";
import { IWBRoom } from "./rooms/IWBRoom";
import { ItemManager } from "./Objects/ItemManager";
import Listener from "./utils/eventListener";
import { initPlayFab } from "./utils/Playfab";
import { SceneManager } from "./Objects/SceneManager";

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
        app.get("/hello_world", (req, res) => {
            console.log('hello world server')
            res.send("It's time to kick ass and chew bubblegum!");
        });

        if (process.env.NODE_ENV !== "production") {
            app.use("/", playground);
        }

        app.use("/colyseus", monitor());
    },


    beforeListen: () => {
        /**
         * Before before gameServer.listen() is called.
         */
    }
});
