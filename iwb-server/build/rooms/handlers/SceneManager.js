"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomSceneManager = void 0;
const Playfab_1 = require("../../utils/Playfab");
const Scene_1 = require("../../Objects/Scene");
const app_config_1 = require("../../app.config");
class RoomSceneManager {
    constructor(room, realm) {
        this.realm = "";
        this.version = 0;
        // scenes: Scene[] = []
        this.occupiedParcels = [];
        this.reservedParcels = ["0,0", "0,1", "1,0", "1,1"];
        this.backupQueue = [];
        this.backingUp = false;
        this.modified = false;
        this.room = room;
        this.realm = realm;
        // let backupInterval = setInterval(async()=>{
        //     if(this.modified){
        //         await setTitleData({Key:"Scenes", Value: JSON.stringify(this.scenes)})
        //         this.modified = false
        //     }
        // }, 1000 * 30)
        this.room.state.cv = app_config_1.iwbManager.worlds.find((w) => w.ens === this.room.state.world).cv;
        console.log('room cv is', this.room.state.cv);
        console.log('world cv is', app_config_1.iwbManager.worlds.find((w) => w.ens === this.room.state.world).cv);
        this.initServerScenes();
        this.initServerAssets();
    }
    initServerScenes() {
        if (app_config_1.iwbManager.pendingSaves.includes((this.room.state.world))) {
            let timeout = setTimeout(() => {
                clearTimeout(timeout);
                this.initServerScenes();
            }, 1000 * 1);
        }
        else {
            setTimeout(() => {
                let world = app_config_1.iwbManager.worlds.find((w) => w.ens === this.realm);
                if (world) {
                    app_config_1.iwbManager.initiateRealm(world.owner)
                        .then((realmData) => {
                        // console.log('realm data is', realmData)
                        this.realmToken = realmData.EntityToken.EntityToken;
                        this.realmId = realmData.EntityToken.Entity.Id;
                        this.realmTokenType = realmData.EntityToken.Entity.Type;
                        app_config_1.iwbManager.fetchRealmData(realmData)
                            .then((realmScenes) => {
                            console.log('realm scenes are ', realmScenes);
                            app_config_1.iwbManager.fetchRealmScenes(realmScenes)
                                .then((sceneData) => {
                                this.loadRealmScenes(sceneData);
                            });
                        });
                    })
                        .catch((error) => {
                        console.log('error initating realm', error);
                    });
                }
            }, 1000);
        }
    }
    async initServerAssets() {
        let metadata = await (0, Playfab_1.fetchPlayfabMetadata)(app_config_1.iwbManager.worlds.find((w) => w.ens === this.room.state.world).owner);
        let catalog = await (0, Playfab_1.fetchPlayfabFile)(metadata, "catalogs.json");
        catalog.forEach((item) => {
            //   if(item.v > this.room.state.cv){
            //     item.pending = true
            //   }
            this.room.state.realmAssets.set(item.id, item);
        });
    }
    loadRealmScenes(scenes) {
        let filter = scenes.filter((scene) => scene.w === this.room.state.world);
        filter.forEach((scene) => {
            this.room.state.scenes.set(scene.id, new Scene_1.Scene(scene, this.room));
        });
    }
    async saveRealmScenes() {
        let scenes = [];
        this.room.state.scenes.forEach((scene) => {
            scene.ass.forEach((asset) => {
                asset.editing = false;
                asset.editor = "";
            });
            scenes.push(scene);
        });
        let world = app_config_1.iwbManager.worlds.find((w) => w.ens === this.room.state.world);
        if (world) {
            world.builds = scenes.length;
            world.updated = Math.floor(Date.now() / 1000);
        }
        if (scenes.length > 0) {
            app_config_1.iwbManager.backupScene(this.room.state.world, this.realmToken, this.realmTokenType, this.realmId, scenes);
        }
    }
}
exports.RoomSceneManager = RoomSceneManager;
// console.log('res is',res.data)
// let data = res.data.data
// let metadata = data.Metadata
// for (const key in metadata) {
//     if (metadata.hasOwnProperty(key)) {
//       console.log(key, metadata[key]);
//       let res = await fetch( metadata[key].DownloadUrl)
//       let json = await res.json()
//       console.log('file is', json)
//       json = []
//       let initres = await initializeUploadPlayerFiles(client.auth.EntityToken.EntityToken,{
//         Entity: {Id: client.auth.EntityToken.Entity.Id, Type: client.auth.EntityToken.Entity.Type},
//         FileNames:[key]
//       })
//       console.log('init res is', initres)
//       console.log('init upload url is', initres.UploadDetails[0])
//     //   await abortFileUploads(client.auth.EntityToken.EntityToken,{
//     //     Entity: {Id: client.auth.EntityToken.Entity.Id, Type: client.auth.EntityToken.Entity.Type},
//     //     FileNames:[key]
//     //   })
//       let uploadres = await uploadPlayerFiles(initres.UploadDetails[0].UploadUrl, JSON.stringify(json))
//         console.log('upload res is', uploadres)
//         let finalres = await finalizeUploadFiles(client.auth.EntityToken.EntityToken,
//             {
//             Entity: {Id: client.auth.EntityToken.Entity.Id, Type: client.auth.EntityToken.Entity.Type},
//             FileNames:[key],
//             ProfileVersion:initres.ProfileVersion,
//           })
//           console.log('final res upload is', finalres)
