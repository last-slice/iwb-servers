import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { COMPONENT_TYPES, Color4 } from "../utils/types";
import { ActionComponent, ActionComponentSchema } from "./Actions";
import { AnimatorComponent, createAnimationComponent } from "./Animator";
import { CounterComponent, CounterBarComponent, createCounterComponent } from "./Counter";
import { GltfComponent, createGLTFComponent } from "./Gltf";
import { createNameComponent, NameComponent } from "./Names";
import { ParentingComponent } from "./Parenting";
import { PointerComponent, PointerComponentEvent, createPointerComponent } from "./Pointers";
import { SoundComponent, createAudioSourceComponent, createAudioStreamComponent } from "./Sound";
import { StateComponent } from "./State";
import { TextShapeComponent, createTextComponent } from "./TextShape";
import { TransformComponent } from "./Transform";
import { createTriggerComponent, TriggerComponent, TriggerComponentSchema, TriggerConditionComponent } from "./Trigger";
import { VisibilityComponent } from "./Visibility";
import { IWBRoom } from "../rooms/IWBRoom";
import { itemManager, iwbManager } from "../app.config";
import { fetchPlayfabMetadata, fetchPlayfabFile } from "../utils/Playfab";
import { checkRewardCache, createRewardComponent, RewardComponent } from "./Rewards";
import { createMeshRendererComponent, MeshRendererComponent } from "./MeshRenderers";
import { MaterialComponent, createMaterialComponent } from "./Materials";
import { VideoComponent } from "./Video";
import { checkIWBCache, IWBComponent, setIWBComponent } from "./IWB";
import { NftShapeComponent, createNftShapeComponent } from "./NftShape";
import { MeshColliderComponent } from "./MeshColliders";
import { TextureComponent } from "./Textures";
import { AvatarShapeComponent, createAvatarShapeComponent } from "./AvatarShape";
import { UITextComponent, createUITextComponent } from "./UIText";
import { GameComponent, createGameComponent } from "./Game";
import { UIImageComponent, createUIImageComponent } from "./UIImage";
import { BillboardComponent, createBillboardComponent } from "./Billboard";
import { LevelComponent, createLevelComponent } from "./Level";
import { createLiveComponent, LiveShowComponent } from "./LiveShow";
import { createTeamComponent, TeamComponent } from "./Team";
import { createGameItemComponent, GameItemComponent } from "./GameItem";
import { createDialogComponent, DialogComponent } from "./Dialog";
import { createPlaylistComponent, PlaylistComponent } from "./Playlist";
import { createPathComponent, PathComponent } from "./Paths";

export class TempScene extends Schema {
    @type("string") id: string
    @type("string") n: string
    @type("string") d: string
    @type("string") bpcl: string
    @type(['string']) pcls = new ArraySchema<string>();
}

export class Scene extends Schema {
    @type("string") id: string
    @type("string") n: string
    @type("string") d: string
    @type("string") o: string
    @type("string") ona: string
    @type("string") cat: string
    @type("string") bpcl: string
    @type("string") w: string
    @type("string") im: string

    @type(['string']) bps = new ArraySchema<string>();
    // @type(['string']) rat = new ArraySchema<string>();
    // @type(['string']) rev = new ArraySchema<string>();
    @type(['string']) pcls = new ArraySchema<string>();
    @type(['string']) sp = new ArraySchema<string>();
    @type(['string']) cp = new ArraySchema<string>();

    @type("number") cd: number
    @type("number") upd: number
    @type("number") si: number = 0
    // @type("number") toc: number
    @type("number") pc: number = 0
    @type("number") pcnt: number
    @type("number") direction: number = 0

    @type("boolean") isdl: boolean
    @type("boolean") e: boolean
    @type("boolean") priv: boolean
    @type("boolean") dv: boolean = false
    @type("boolean") dpx: boolean = false
    @type("boolean") lim: boolean = true


    @type({map:TransformComponent}) [COMPONENT_TYPES.TRANSFORM_COMPONENT]:MapSchema<TransformComponent>
    @type({map:GltfComponent}) [COMPONENT_TYPES.GLTF_COMPONENT]:MapSchema<GltfComponent>
    @type({map:MeshRendererComponent}) [COMPONENT_TYPES.MESH_RENDER_COMPONENT]:MapSchema<MeshRendererComponent>
    @type({map:MeshColliderComponent}) [COMPONENT_TYPES.MESH_COLLIDER_COMPONENT]:MapSchema<MeshColliderComponent>
    @type({map:TextureComponent}) [COMPONENT_TYPES.TEXTURE_COMPONENT]:MapSchema<TextureComponent>
    @type({map:MaterialComponent}) [COMPONENT_TYPES.MATERIAL_COMPONENT]:MapSchema<MaterialComponent>
    @type({map:NameComponent}) [COMPONENT_TYPES.NAMES_COMPONENT]:MapSchema<NameComponent>
    @type({map:VisibilityComponent}) [COMPONENT_TYPES.VISBILITY_COMPONENT]:MapSchema<VisibilityComponent>
    @type({map:ActionComponent}) [COMPONENT_TYPES.ACTION_COMPONENT]:MapSchema<ActionComponent>
    @type({map:CounterComponent}) [COMPONENT_TYPES.COUNTER_COMPONENT]:MapSchema<CounterComponent>
    @type({map:CounterBarComponent}) counterbars:MapSchema<CounterBarComponent>
    @type({map:StateComponent}) [COMPONENT_TYPES.STATE_COMPONENT]:MapSchema<StateComponent>
    @type({map:TriggerComponent}) [COMPONENT_TYPES.TRIGGER_COMPONENT]:MapSchema<TriggerComponent>
    @type({map:TextShapeComponent}) [COMPONENT_TYPES.TEXT_COMPONENT]:MapSchema<TextShapeComponent>
    @type({map:NftShapeComponent}) [COMPONENT_TYPES.NFT_COMPONENT]:MapSchema<NftShapeComponent>
    @type({map:AnimatorComponent}) [COMPONENT_TYPES.ANIMATION_COMPONENT]:MapSchema<AnimatorComponent>
    @type({map:PointerComponent}) [COMPONENT_TYPES.POINTER_COMPONENT]:MapSchema<PointerComponent>
    @type({map:SoundComponent}) [COMPONENT_TYPES.AUDIO_SOURCE_COMPONENT]:MapSchema<SoundComponent>
    @type({map:SoundComponent}) [COMPONENT_TYPES.AUDIO_STREAM_COMPONENT]:MapSchema<SoundComponent>
    @type({map:AvatarShapeComponent}) [COMPONENT_TYPES.AVATAR_SHAPE_COMPONENT]:MapSchema<AvatarShapeComponent>
    @type({map:VideoComponent}) [COMPONENT_TYPES.VIDEO_COMPONENT]:MapSchema<VideoComponent>
    @type({map:IWBComponent}) [COMPONENT_TYPES.IWB_COMPONENT]:MapSchema<IWBComponent>
    @type({map:UITextComponent}) [COMPONENT_TYPES.UI_TEXT_COMPONENT]:MapSchema<UITextComponent>
    @type({map:UIImageComponent}) [COMPONENT_TYPES.UI_IMAGE_COMPONENT]:MapSchema<UIImageComponent>
    @type({map:GameComponent}) [COMPONENT_TYPES.GAME_COMPONENT]:MapSchema<GameComponent>
    @type({map:LevelComponent}) [COMPONENT_TYPES.LEVEL_COMPONENT]:MapSchema<LevelComponent>
    @type({map:BillboardComponent}) [COMPONENT_TYPES.BILLBOARD_COMPONENT]:MapSchema<BillboardComponent>
    @type({map:LiveShowComponent}) [COMPONENT_TYPES.LIVE_COMPONENT]:MapSchema<LiveShowComponent>
    @type({map:TeamComponent}) [COMPONENT_TYPES.TEAM_COMPONENT]:MapSchema<TeamComponent>
    @type({map:GameItemComponent}) [COMPONENT_TYPES.GAME_ITEM_COMPONENT]:MapSchema<GameItemComponent>
    @type({map:DialogComponent}) [COMPONENT_TYPES.DIALOG_COMPONENT]:MapSchema<DialogComponent>
    @type({map:RewardComponent}) [COMPONENT_TYPES.REWARD_COMPONENT]:MapSchema<RewardComponent>
    @type({map:PlaylistComponent}) [COMPONENT_TYPES.PLAYLIST_COMPONENT]:MapSchema<PlaylistComponent>
    @type({map:PathComponent}) [COMPONENT_TYPES.PATH_COMPONENT]:MapSchema<PathComponent>


    @type([ParentingComponent]) [COMPONENT_TYPES.PARENTING_COMPONENT]:ArraySchema<ParentingComponent>

    // @type({map:"string"}) [COMPONENT_TYPES.CLICK_AREA_COMPONENT]:MapSchema<string>

    //pointer evnts component
    //sync components

    roomId:string

    parentEntity:any
    entities:any[] = []
    components:any
    checkEnabled:boolean
    checkDisabled:boolean
    loaded:boolean
    hiddenForGame:boolean

    constructor(room?:IWBRoom, data?:any) {
        super(data)
        if(room){
            this.roomId = room.roomId
        }

        if (data){
            this.bps = data.bps
            this.pcls = data.pcls
            this.pcnt = data.pcls.length
            this.lim = data.hasOwnProperty("lim") ? data.lim : true
            this.sp = data.sp[0].split(",").length === 2 ? [data.sp[0].split(",")[0] + ",0," + data.sp[0].split(",")[1]] : data.sp
            this.cp = data.hasOwnProperty("cp") ? data.cp : ["0,0,0"]
            data.hasOwnProperty("direction") ? this.direction = data.direction : this.direction = 0

            this.setComponents(data, room)
        }
    }
    
    setComponents(data:any, room:IWBRoom){
        this[COMPONENT_TYPES.IWB_COMPONENT] = new MapSchema<IWBComponent>()
        this[COMPONENT_TYPES.NAMES_COMPONENT] = new MapSchema<NameComponent>()
        this[COMPONENT_TYPES.VISBILITY_COMPONENT] = new MapSchema<VisibilityComponent>()
        this[COMPONENT_TYPES.PARENTING_COMPONENT] = new ArraySchema<ParentingComponent>()
        this[COMPONENT_TYPES.TRANSFORM_COMPONENT] = new MapSchema<TransformComponent>()
        this[COMPONENT_TYPES.POINTER_COMPONENT] = new MapSchema<PointerComponent>()
        this[COMPONENT_TYPES.TEXT_COMPONENT] = new MapSchema<TextShapeComponent>()
        this[COMPONENT_TYPES.COUNTER_COMPONENT] = new MapSchema<CounterComponent>()
        this[COMPONENT_TYPES.TRIGGER_COMPONENT] = new MapSchema<TriggerComponent>()
        this[COMPONENT_TYPES.ACTION_COMPONENT] = new MapSchema<ActionComponent>()
        this[COMPONENT_TYPES.GLTF_COMPONENT] = new MapSchema<GltfComponent>()
        this[COMPONENT_TYPES.MESH_RENDER_COMPONENT] = new MapSchema<MeshRendererComponent>()
        this[COMPONENT_TYPES.MESH_COLLIDER_COMPONENT] = new MapSchema<MeshColliderComponent>()
        this[COMPONENT_TYPES.TEXTURE_COMPONENT] = new MapSchema<TextureComponent>()
        this[COMPONENT_TYPES.MATERIAL_COMPONENT] = new MapSchema<MaterialComponent>()
        this[COMPONENT_TYPES.STATE_COMPONENT] = new MapSchema<StateComponent>()
        this[COMPONENT_TYPES.AUDIO_SOURCE_COMPONENT] = new MapSchema<SoundComponent>()
        this[COMPONENT_TYPES.AUDIO_STREAM_COMPONENT] = new MapSchema<SoundComponent>()
        this[COMPONENT_TYPES.VIDEO_COMPONENT] = new MapSchema<VideoComponent>()
        this[COMPONENT_TYPES.ANIMATION_COMPONENT] = new MapSchema<AnimatorComponent>()
        this[COMPONENT_TYPES.NFT_COMPONENT] = new MapSchema<NftShapeComponent>()
        this[COMPONENT_TYPES.AVATAR_SHAPE_COMPONENT] = new MapSchema<AvatarShapeComponent>()
        this[COMPONENT_TYPES.UI_TEXT_COMPONENT] = new MapSchema<UITextComponent>()
        this[COMPONENT_TYPES.UI_IMAGE_COMPONENT] = new MapSchema<UIImageComponent>()
        this[COMPONENT_TYPES.GAME_COMPONENT] = new MapSchema<GameComponent>()
        this[COMPONENT_TYPES.BILLBOARD_COMPONENT] = new MapSchema<BillboardComponent>()
        this[COMPONENT_TYPES.LEVEL_COMPONENT] = new MapSchema<LevelComponent>()
        this[COMPONENT_TYPES.LIVE_COMPONENT] = new MapSchema<LiveShowComponent>()
        this[COMPONENT_TYPES.TEAM_COMPONENT] = new MapSchema<TeamComponent>()
        this[COMPONENT_TYPES.GAME_ITEM_COMPONENT] = new MapSchema<GameItemComponent>()
        this[COMPONENT_TYPES.DIALOG_COMPONENT] = new MapSchema<DialogComponent>()
        this[COMPONENT_TYPES.REWARD_COMPONENT] = new MapSchema<RewardComponent>()
        this[COMPONENT_TYPES.PLAYLIST_COMPONENT] = new MapSchema<PlaylistComponent>()
        this[COMPONENT_TYPES.PATH_COMPONENT] = new MapSchema<PathComponent>()

        Object.values(COMPONENT_TYPES).forEach((component:any)=>{
            if(data[component]){
                switch(component){
                    case COMPONENT_TYPES.PATH_COMPONENT:
                        for (const aid in data[component]) {
                            createPathComponent(this, aid,  data[component][aid])
                        }
                        break;

                    case COMPONENT_TYPES.PLAYLIST_COMPONENT:
                        for (const aid in data[component]) {
                            createPlaylistComponent(this, aid,  data[component][aid])
                        }
                        break;
                    case COMPONENT_TYPES.REWARD_COMPONENT:
                        for (const aid in data[component]) {
                            createRewardComponent(this, aid,  data[component][aid])
                        }
                        break;
                    case COMPONENT_TYPES.DIALOG_COMPONENT:
                        for (const aid in data[component]) {
                            createDialogComponent(this, aid,  data[component][aid])
                        }
                        break;
                    case COMPONENT_TYPES.GAME_ITEM_COMPONENT:
                        for (const aid in data[component]) {
                            createGameItemComponent(this, aid,  data[component][aid])
                        }
                        break;
                    case COMPONENT_TYPES.TEAM_COMPONENT:
                        for (const aid in data[component]) {
                            createTeamComponent(this, aid,  data[component][aid])
                        }
                        break;
                    case COMPONENT_TYPES.LIVE_COMPONENT:
                        for (const aid in data[component]) {
                            createLiveComponent(this, aid,  data[component][aid])
                        }
                        break;
                    case COMPONENT_TYPES.LEVEL_COMPONENT:
                        for (const aid in data[component]) {
                            createLevelComponent(this, aid,  data[component][aid])
                        }
                        break;
                    case COMPONENT_TYPES.GAME_COMPONENT:
                        for (const aid in data[component]) {
                            createGameComponent(room, this, aid,  data[component][aid])
                        }
                        break;

                    case COMPONENT_TYPES.BILLBOARD_COMPONENT:
                        for (const aid in data[component]) {
                            createBillboardComponent(this, aid,  data[component][aid])
                        }
                        break;

                    case COMPONENT_TYPES.UI_TEXT_COMPONENT:
                        for (const aid in data[component]) {
                            createUITextComponent(this, aid,  data[component][aid])
                        }
                        break;

                    case COMPONENT_TYPES.UI_IMAGE_COMPONENT:
                        for (const aid in data[component]) {
                            createUIImageComponent(this, aid,  data[component][aid])
                        }
                        break;

                    case COMPONENT_TYPES.IWB_COMPONENT:
                        for (const aid in data[component]) {
                            setIWBComponent(room, this, aid, data[component][aid])
                        }
                        break;

                    case COMPONENT_TYPES.NAMES_COMPONENT:
                        for (const aid in data[component]) {
                            createNameComponent(this, aid, data[component][aid], true)
                            // this[COMPONENT_TYPES.NAMES_COMPONENT].set(aid, new NameComponent(data[component][aid]))
                        }
                        break;

                    case COMPONENT_TYPES.VISBILITY_COMPONENT:
                        for (const aid in data[component]) {
                            let vis = new VisibilityComponent(data[component][aid])
                            vis.visible = true
                            this[COMPONENT_TYPES.VISBILITY_COMPONENT].set(aid, new VisibilityComponent(data[component][aid]))
                        }
                        break;

                    case COMPONENT_TYPES.PARENTING_COMPONENT:
                        data[component].forEach((info:any) => {
                            this[COMPONENT_TYPES.PARENTING_COMPONENT].push(new ParentingComponent(info))
                        });
                        break;

                    case COMPONENT_TYPES.TRANSFORM_COMPONENT:
                        for (const aid in data[component]) {
                            this[COMPONENT_TYPES.TRANSFORM_COMPONENT].set(aid, new TransformComponent(data[component][aid]))
                        }
                        break;

                    case COMPONENT_TYPES.POINTER_COMPONENT:
                        for (const aid in data[component]) {
                            createPointerComponent(this, aid, data[component][aid])
                        }
                        break;

                    case COMPONENT_TYPES.TEXT_COMPONENT:
                        for (const aid in data[component]) {
                            createTextComponent(this, aid, data[component][aid])
                        }
                        break;

                    case COMPONENT_TYPES.COUNTER_COMPONENT:
                        for (const aid in data[component]) {
                            createCounterComponent(this, aid, data[component][aid])
                        }
                        break;

                    case COMPONENT_TYPES.AVATAR_SHAPE_COMPONENT:
                        for (const aid in data[component]) {
                            createAvatarShapeComponent(this, aid, data[component][aid])
                        }
                        break;
                
                    case COMPONENT_TYPES.TRIGGER_COMPONENT:
                        for (const aid in data[component]) {
                            createTriggerComponent(this, aid, data[component][aid])
                        }
                        break;

                    case COMPONENT_TYPES.ACTION_COMPONENT:
                        
                        for (const aid in data[component]) {
                            let actionData = data[component][aid]

                            let action = new ActionComponent()

                            action.actions = new ArraySchema<ActionComponentSchema>()
                            actionData.actions.forEach((data:any)=>{
                                let schema:any = new ActionComponentSchema()
                                for(let key in data){
                                    schema[key] = data[key]
                                }
                                action.actions.push(schema)
                            })     
                            this[COMPONENT_TYPES.ACTION_COMPONENT].set(aid, action)
                        }
                        break;

                    case COMPONENT_TYPES.GLTF_COMPONENT:
                        for (const aid in data[component]) {
                            this[COMPONENT_TYPES.GLTF_COMPONENT].set(aid, new GltfComponent(data[component][aid]))
                        }
                        break;

                    case COMPONENT_TYPES.MESH_RENDER_COMPONENT:
                        for (const aid in data[component]) {
                            data[component][aid].aid = aid
                            createMeshRendererComponent(this, data[component][aid])
                        }
                        break;

                    case COMPONENT_TYPES.MESH_COLLIDER_COMPONENT:
                        for (const aid in data[component]) {
                            this[COMPONENT_TYPES.MESH_COLLIDER_COMPONENT].set(aid, new MeshColliderComponent(data[component][aid]))
                        }
                        break;

                    case COMPONENT_TYPES.TEXTURE_COMPONENT:
                        for (const aid in data[component]) {
                            this[COMPONENT_TYPES.TEXTURE_COMPONENT].set(aid, new TextureComponent(data[component][aid]))
                        }
                        break;

                     case COMPONENT_TYPES.MATERIAL_COMPONENT:
                        for (const aid in data[component]) {
                            createMaterialComponent(this, aid, data[component][aid])
                        }
                        break;

                     case COMPONENT_TYPES.NFT_COMPONENT:
                        for (const aid in data[component]) {
                            createNftShapeComponent(this, aid, data[component][aid])
                        }
                        break;

                    case COMPONENT_TYPES.STATE_COMPONENT:
                     
                        for (const aid in data[component]) {
                            let stateData = data[component][aid]

                            let state = new StateComponent()
                            state.defaultValue = data[component][aid].defaultValue

                            state.values = new ArraySchema<string>()
                            stateData.values.forEach((value:string)=>{
                                state.values.push(value)
                            })
                            this[COMPONENT_TYPES.STATE_COMPONENT].set(aid, state)
                        }
                        break;

                    case COMPONENT_TYPES.AUDIO_SOURCE_COMPONENT:
                        for (const aid in data[component]){
                            createAudioSourceComponent(this, aid, data[component][aid])
                        }
                        break;

                    case COMPONENT_TYPES.AUDIO_STREAM_COMPONENT:
                        for (const aid in data[component]) {
                            createAudioStreamComponent(this, aid, data[component][aid])
                            // this[COMPONENT_TYPES.AUDIO_STREAM_COMPONENT].set(aid, new SoundComponent(data[component][aid]))
                        }
                        break;

                    case COMPONENT_TYPES.VIDEO_COMPONENT:
                      
                        for (const aid in data[component]) {
                            this[COMPONENT_TYPES.VIDEO_COMPONENT].set(aid, new VideoComponent(data[component][aid]))
                        }
                        break;

                    case COMPONENT_TYPES.ANIMATION_COMPONENT:
                      
                        for (const aid in data[component]) {
                            createAnimationComponent(this, aid, data[component][aid])
                        }
                        break;

                }
            }
        })
    }
}

export function initServerScenes(room:IWBRoom, options?:any){
    if(iwbManager.pendingSaves.includes((room.state.world))){
        let timeout = setTimeout(()=>{
            clearTimeout(timeout)
            initServerScenes(room, options)
        }, 1000 * 1)
    }else{
        setTimeout(()=>{
            let world = iwbManager.worlds.find((w)=> w.ens === room.state.world)
            if(world){
                iwbManager.initiateRealm(world.owner)
                .then((realmData)=>{
                    room.state.realmToken = realmData.EntityToken.EntityToken
                    room.state.realmId = realmData.EntityToken.Entity.Id
                    room.state.realmTokenType = realmData.EntityToken.Entity.Type
    
                    iwbManager.fetchRealmData(realmData)
                    .then((realmScenes)=>{
                        iwbManager.fetchRealmScenes(room.state.world, realmScenes)
                        .then(async (sceneData)=>{
                            await loadRealmScenes(room, sceneData, options)
                            iwbManager.initUsers(room)
                        })
                    })   
                })
                .catch((error)=>{
                    console.log('error initating realm', error)
                })
            }
        }, 1000)
    }
}

export async function initServerAssets(room:IWBRoom){
    let world = iwbManager.worlds.find((w:any)=> w.ens === room.state.world)
    console.log('init server assets for world', world)
    let metadata = await fetchPlayfabMetadata(world.owner)

    let json = await fetchPlayfabFile(metadata, "catalogs.json")
    let catalogVersion = json.hasOwnProperty("version") ? json.version : 0
    room.state.catalogVersion = catalogVersion

    if(json.hasOwnProperty("items")){
        json.items.forEach((item:any)=>{
            item.v = catalogVersion
            if(item.ugc){
                room.state.realmAssets.set(item.id, item)
            }
            else{
                let catalogItem = itemManager.items.get(item.id)
                if(catalogItem){
                    room.state.realmAssets.set(item.id, {...catalogItem})
                }
            }
        })
    }else{
        json.forEach((item:any)=>{
            item.v = catalogVersion
            if(item.ugc){
                room.state.realmAssets.set(item.id, item)
            }
            else{
                let catalogItem = itemManager.items.get(item.id)
                if(catalogItem){
                    room.state.realmAssets.set(item.id, {...catalogItem})
                }
            }
        })
        room.state.realmAssetsChanged = true
    }

    console.log('realm asset size', room.state.realmAssets.size)
    console.log('realm catalog version is', room.state.catalogVersion)
}

export async function loadRealmScenes(room:IWBRoom, scenes:any[], options?:any){
    let filter = [...scenes.filter((scene)=> scene.w === room.state.world)]
    room.state.sceneCount = filter.length

    if(options){
        console.log('we have connectoin from gc, only load specfic scene')
        let scene = filter.find(($:any)=> $.id === options.localConfig.id)
        if(scene){
            console.log('we found scene to load for gc')
            scene.pcls = translateGCParcels(scene.pcls)
            scene.bpcl = "0,0"
            // scene.pcls = options.localConfig.parcels
            // scene.bpcl = options.localConfig.base
            room.state.scenes.set(scene.id, new Scene(room, scene))
        }
    }else{
        filter.forEach((scene)=>{
            console.log('creating new iwb scene', scene.id)
            room.state.scenes.set(scene.id, new Scene(room, scene))
        })
    }
}

export async function saveRealm(room:IWBRoom){
    let fileNames:any[] = []
    let data:any[] = []

    let scenes:any[] = await getRealmData(room)

    if(scenes && scenes.length > 0){
        fileNames.push("" + room.state.world + "-scenes.json")
        data.push(scenes)
    }

    if(room.state.realmAssetsChanged){
        console.log('back up catalog assets')
        let json:any = {
            version:room.state.catalogVersion + 1,
            items:[]
        }

        room.state.realmAssets.forEach((item:any)=>{
            json.items.push(item)
        })
        if(scenes && scenes.length > 0){
            fileNames.push("catalogs.json")
            data.push(json)
        }
    }else{
        console.log('dont back up catalog assets')
    }

    if(fileNames.length > 0){
        let world = iwbManager.worlds.find((w)=>w.ens === room.state.world)
        if(world){
            world.builds = scenes.length
            world.updated = Math.floor(Date.now()/1000)

            if(room.state.realmAssetsChanged){
                world.cv = room.state.catalogVersion + 1
            }
            iwbManager.worldsModified = true
        }

        iwbManager.addWorldPendingSave(room.state.world, room.roomId, fileNames, room.state.realmToken, room.state.realmTokenType, room.state.realmId, data)
        // iwbManager.backupFiles(room.state.world, fileNames, room.state.realmToken, room.state.realmTokenType, room.state.realmId, data)
    }
}

export function getRealmData(room:IWBRoom){
    let scenes:any[] = []
    room.state.scenes.forEach(async (scene:any)=>{
        let jsonScene:any = scene.toJSON()
        jsonScene =  await checkAssetCacheStates(scene, jsonScene)
        scenes.push(jsonScene)
    })
    return scenes
}

export function saveRealmAssets(room:IWBRoom){
    let assets:any[] = []
    room.state.realmAssets.forEach((item:any)=>{
        assets.push(item)
    })

    return assets
    // iwbManager.backupFile(room.state.world, "catalogs.json", room.state.realmToken, room.state.realmTokenType, room.state.realmId, assets)
}

export async function checkAssetCacheStates(scene:Scene, jsonScene:any){
    scene[COMPONENT_TYPES.IWB_COMPONENT].forEach(async (iwbComponent:IWBComponent, aid:string)=>{
        jsonScene = await checkIWBCache(scene, aid, jsonScene) 
        jsonScene = await checkRewardCache(scene, aid, jsonScene)
    })
    return jsonScene
}

// async saveWorldScenes(scenes:Map<string, Scene>){
//     scenes.forEach((scene:Scene, key)=>{
//         let sceneIndex = this.scenes.findIndex((sc:any) =>sc.id === scene.id)
//         if(sceneIndex >= 0){
//             this.scenes[sceneIndex] = scene
//         }else{
//             this.scenes.push(scene)
//         }
//         this.modified = true
//     })

//     console.log('saved world scenes', this.scenes)
// }

// addNewScene(scene:Scene){
//     this.room.state.scenes.set(scene, s)
// }

function translateGCParcels(parcels:any[]){
    // Parse the coordinate strings into an array of tuples
    const parsedCoords:any[] = parcels.map(coord => {
        const [x, y] = coord.split(',').map(Number);
        return [x, y];
    });

    // Find the minimum x and y values
    const minX = Math.min(...parsedCoords.map(coord => coord[0]));
    const minY = Math.min(...parsedCoords.map(coord => coord[1]));

    // Translate the coordinates to start at (0, 0)
    const translatedCoords = parsedCoords.map(([x, y]) => [x - minX, y - minY]);

    // Convert the translated coordinates back to strings
    const translatedCoordsStrings = translatedCoords.map(([x, y]) => `${x},${y}`);

    return translatedCoordsStrings;
    console.log('translated coords are ', translatedCoords)

    return translatedCoords;
}