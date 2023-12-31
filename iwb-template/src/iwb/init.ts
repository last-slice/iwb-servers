import {getUserData} from "~system/UserIdentity";
import {setupUi} from "./ui/ui";
import {joinWorld} from "./components/messaging";
import {createHQ} from "./components/hq";
import {getAssetUploadToken, getPreview, log} from "./helpers/functions";
import {createInputListeners} from "./components/listeners/inputListeners";
import {addPlayer} from "./components/player/player";
import {engine} from "@dcl/sdk/ecs";
import {PlayerTrackingSystem} from "./components/systems/playerTracking";
import resources from "./helpers/resources";
import {signedFetch} from "~system/SignedFetch";
import { BuildModeVisibiltyComponents } from "./components/systems/BuildModeVisibilty";
import { getRealm } from "~system/Runtime";
import { realm, updateRealm } from "./components/scenes";

export function initIWB() {
    setupUi()

    getPreview().then(()=>{
        
        getUserData({}).then(async ({data})=>{
            log("getuserdata is", data)
            if(data){
                await addPlayer(data.userId, true, [{dclData:data}])
                
                let realmData = await getRealm({})
                updateRealm(realmData.realmInfo ? realmData.realmInfo.realmName === "LocalPreview" ? "BuilderWorld.dcl.eth" : realmData.realmInfo.realmName : "")

                engine.addSystem(PlayerTrackingSystem)
                engine.addSystem(BuildModeVisibiltyComponents)

                getAssetUploadToken()//
            }

            //build IWB HQ
            createHQ()

            //add input listeners
            createInputListeners()

            // // Login with dcl auth and retrieve jwt
            // const {body, status} = await signedFetch({
            //     url: resources.endpoints.validateTest + "/login",
            //     init: {
            //         method: "POST",
            //         headers: {}
            //     }
            // })
            // let json = JSON.parse(body)
            // //console.log('login response', status, json)

            // connect with userData and token
            // colyseusConnect(data, json.data.token)
            joinWorld(realm)
            // colyseusConnect(data, "")
        })
    })
}
  