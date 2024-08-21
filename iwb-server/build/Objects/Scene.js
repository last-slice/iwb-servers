"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10;
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAssetCacheStates = exports.saveRealmAssets = exports.getRealmData = exports.saveRealm = exports.loadRealmScenes = exports.initServerAssets = exports.initServerScenes = exports.Scene = exports.TempScene = void 0;
const schema_1 = require("@colyseus/schema");
const types_1 = require("../utils/types");
const Actions_1 = require("./Actions");
const Animator_1 = require("./Animator");
const Counter_1 = require("./Counter");
const Gltf_1 = require("./Gltf");
const Names_1 = require("./Names");
const Parenting_1 = require("./Parenting");
const Pointers_1 = require("./Pointers");
const Sound_1 = require("./Sound");
const State_1 = require("./State");
const TextShape_1 = require("./TextShape");
const Transform_1 = require("./Transform");
const Trigger_1 = require("./Trigger");
const Visibility_1 = require("./Visibility");
const app_config_1 = require("../app.config");
const Playfab_1 = require("../utils/Playfab");
const Rewards_1 = require("./Rewards");
const MeshRenderers_1 = require("./MeshRenderers");
const Materials_1 = require("./Materials");
const Video_1 = require("./Video");
const IWB_1 = require("./IWB");
const NftShape_1 = require("./NftShape");
const MeshColliders_1 = require("./MeshColliders");
const Textures_1 = require("./Textures");
const Emissive_1 = require("./Emissive");
const AvatarShape_1 = require("./AvatarShape");
const UIText_1 = require("./UIText");
const Game_1 = require("./Game");
const UIImage_1 = require("./UIImage");
const Billboard_1 = require("./Billboard");
const Level_1 = require("./Level");
const LiveShow_1 = require("./LiveShow");
const Team_1 = require("./Team");
const GameItem_1 = require("./GameItem");
const Dialog_1 = require("./Dialog");
const Playlist_1 = require("./Playlist");
const Paths_1 = require("./Paths");
class TempScene extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.pcls = new schema_1.ArraySchema();
    }
}
exports.TempScene = TempScene;
__decorate([
    (0, schema_1.type)("string")
], TempScene.prototype, "id", void 0);
__decorate([
    (0, schema_1.type)("string")
], TempScene.prototype, "n", void 0);
__decorate([
    (0, schema_1.type)("string")
], TempScene.prototype, "d", void 0);
__decorate([
    (0, schema_1.type)("string")
], TempScene.prototype, "bpcl", void 0);
__decorate([
    (0, schema_1.type)(['string'])
], TempScene.prototype, "pcls", void 0);
class Scene extends schema_1.Schema {
    static { _a = types_1.COMPONENT_TYPES.TRANSFORM_COMPONENT, _b = types_1.COMPONENT_TYPES.GLTF_COMPONENT, _c = types_1.COMPONENT_TYPES.MESH_RENDER_COMPONENT, _d = types_1.COMPONENT_TYPES.MESH_COLLIDER_COMPONENT, _e = types_1.COMPONENT_TYPES.TEXTURE_COMPONENT, _f = types_1.COMPONENT_TYPES.EMISSIVE_TEXTURE_COMPONENT, _g = types_1.COMPONENT_TYPES.MATERIAL_COMPONENT, _h = types_1.COMPONENT_TYPES.NAMES_COMPONENT, _j = types_1.COMPONENT_TYPES.VISBILITY_COMPONENT, _k = types_1.COMPONENT_TYPES.ACTION_COMPONENT, _l = types_1.COMPONENT_TYPES.COUNTER_COMPONENT, _m = types_1.COMPONENT_TYPES.STATE_COMPONENT, _o = types_1.COMPONENT_TYPES.TRIGGER_COMPONENT, _p = types_1.COMPONENT_TYPES.TEXT_COMPONENT, _q = types_1.COMPONENT_TYPES.NFT_COMPONENT, _r = types_1.COMPONENT_TYPES.ANIMATION_COMPONENT, _s = types_1.COMPONENT_TYPES.POINTER_COMPONENT, _t = types_1.COMPONENT_TYPES.AUDIO_SOURCE_COMPONENT, _u = types_1.COMPONENT_TYPES.AUDIO_STREAM_COMPONENT, _v = types_1.COMPONENT_TYPES.AVATAR_SHAPE_COMPONENT, _w = types_1.COMPONENT_TYPES.VIDEO_COMPONENT, _x = types_1.COMPONENT_TYPES.IWB_COMPONENT, _y = types_1.COMPONENT_TYPES.UI_TEXT_COMPONENT, _z = types_1.COMPONENT_TYPES.UI_IMAGE_COMPONENT, _0 = types_1.COMPONENT_TYPES.GAME_COMPONENT, _1 = types_1.COMPONENT_TYPES.LEVEL_COMPONENT, _2 = types_1.COMPONENT_TYPES.BILLBOARD_COMPONENT, _3 = types_1.COMPONENT_TYPES.LIVE_COMPONENT, _4 = types_1.COMPONENT_TYPES.TEAM_COMPONENT, _5 = types_1.COMPONENT_TYPES.GAME_ITEM_COMPONENT, _6 = types_1.COMPONENT_TYPES.DIALOG_COMPONENT, _7 = types_1.COMPONENT_TYPES.REWARD_COMPONENT, _8 = types_1.COMPONENT_TYPES.PLAYLIST_COMPONENT, _9 = types_1.COMPONENT_TYPES.PATH_COMPONENT, _10 = types_1.COMPONENT_TYPES.PARENTING_COMPONENT; }
    constructor(room, data) {
        super(data);
        this.bps = new schema_1.ArraySchema();
        this.rat = new schema_1.ArraySchema();
        this.rev = new schema_1.ArraySchema();
        this.pcls = new schema_1.ArraySchema();
        this.sp = new schema_1.ArraySchema();
        this.cp = new schema_1.ArraySchema();
        this.si = 0;
        this.pc = 0;
        this.direction = 0;
        this.dv = false;
        this.dpx = false;
        this.lim = true;
        this.entities = [];
        if (room) {
            this.roomId = room.roomId;
        }
        if (data) {
            this.bps = data.bps;
            this.pcls = data.pcls;
            this.pcnt = data.pcls.length;
            this.lim = data.hasOwnProperty("lim") ? data.lim : true;
            this.sp = data.sp[0].split(",").length === 2 ? [data.sp[0].split(",")[0] + ",0," + data.sp[0].split(",")[1]] : data.sp;
            this.cp = data.hasOwnProperty("cp") ? data.cp : ["0,0,0"];
            data.hasOwnProperty("direction") ? this.direction = data.direction : null;
            this.setComponents(data, room);
        }
    }
    setComponents(data, room) {
        this[types_1.COMPONENT_TYPES.IWB_COMPONENT] = new schema_1.MapSchema();
        this[types_1.COMPONENT_TYPES.NAMES_COMPONENT] = new schema_1.MapSchema();
        this[types_1.COMPONENT_TYPES.VISBILITY_COMPONENT] = new schema_1.MapSchema();
        this[types_1.COMPONENT_TYPES.PARENTING_COMPONENT] = new schema_1.ArraySchema();
        this[types_1.COMPONENT_TYPES.TRANSFORM_COMPONENT] = new schema_1.MapSchema();
        this[types_1.COMPONENT_TYPES.POINTER_COMPONENT] = new schema_1.MapSchema();
        this[types_1.COMPONENT_TYPES.TEXT_COMPONENT] = new schema_1.MapSchema();
        this[types_1.COMPONENT_TYPES.COUNTER_COMPONENT] = new schema_1.MapSchema();
        this[types_1.COMPONENT_TYPES.TRIGGER_COMPONENT] = new schema_1.MapSchema();
        this[types_1.COMPONENT_TYPES.ACTION_COMPONENT] = new schema_1.MapSchema();
        this[types_1.COMPONENT_TYPES.GLTF_COMPONENT] = new schema_1.MapSchema();
        this[types_1.COMPONENT_TYPES.MESH_RENDER_COMPONENT] = new schema_1.MapSchema();
        this[types_1.COMPONENT_TYPES.MESH_COLLIDER_COMPONENT] = new schema_1.MapSchema();
        this[types_1.COMPONENT_TYPES.TEXTURE_COMPONENT] = new schema_1.MapSchema();
        this[types_1.COMPONENT_TYPES.EMISSIVE_TEXTURE_COMPONENT] = new schema_1.MapSchema();
        this[types_1.COMPONENT_TYPES.MATERIAL_COMPONENT] = new schema_1.MapSchema();
        this[types_1.COMPONENT_TYPES.STATE_COMPONENT] = new schema_1.MapSchema();
        this[types_1.COMPONENT_TYPES.AUDIO_SOURCE_COMPONENT] = new schema_1.MapSchema();
        this[types_1.COMPONENT_TYPES.AUDIO_STREAM_COMPONENT] = new schema_1.MapSchema();
        this[types_1.COMPONENT_TYPES.VIDEO_COMPONENT] = new schema_1.MapSchema();
        this[types_1.COMPONENT_TYPES.ANIMATION_COMPONENT] = new schema_1.MapSchema();
        this[types_1.COMPONENT_TYPES.NFT_COMPONENT] = new schema_1.MapSchema();
        this[types_1.COMPONENT_TYPES.AVATAR_SHAPE_COMPONENT] = new schema_1.MapSchema();
        this[types_1.COMPONENT_TYPES.UI_TEXT_COMPONENT] = new schema_1.MapSchema();
        this[types_1.COMPONENT_TYPES.UI_TEXT_COMPONENT] = new schema_1.MapSchema();
        this[types_1.COMPONENT_TYPES.GAME_COMPONENT] = new schema_1.MapSchema();
        this[types_1.COMPONENT_TYPES.UI_IMAGE_COMPONENT] = new schema_1.MapSchema();
        this[types_1.COMPONENT_TYPES.BILLBOARD_COMPONENT] = new schema_1.MapSchema();
        this[types_1.COMPONENT_TYPES.LEVEL_COMPONENT] = new schema_1.MapSchema();
        this[types_1.COMPONENT_TYPES.LIVE_COMPONENT] = new schema_1.MapSchema();
        this[types_1.COMPONENT_TYPES.TEAM_COMPONENT] = new schema_1.MapSchema();
        this[types_1.COMPONENT_TYPES.GAME_ITEM_COMPONENT] = new schema_1.MapSchema();
        this[types_1.COMPONENT_TYPES.DIALOG_COMPONENT] = new schema_1.MapSchema();
        this[types_1.COMPONENT_TYPES.REWARD_COMPONENT] = new schema_1.MapSchema();
        this[types_1.COMPONENT_TYPES.PLAYLIST_COMPONENT] = new schema_1.MapSchema();
        // this[COMPONENT_TYPES.PATH_COMPONENT] = new MapSchema<PathComponent>()
        // this[COMPONENT_TYPES.CLICK_AREA_COMPONENT] = new MapSchema<string>()//
        Object.values(types_1.COMPONENT_TYPES).forEach((component) => {
            if (data[component]) {
                switch (component) {
                    // case COMPONENT_TYPES.PATH_COMPONENT:
                    //     for (const aid in data[component]) {
                    //         createPathComponent(this, aid,  data[component][aid])
                    //     }
                    //     break;
                    case types_1.COMPONENT_TYPES.PLAYLIST_COMPONENT:
                        for (const aid in data[component]) {
                            (0, Playlist_1.createPlaylistComponent)(this, aid, data[component][aid]);
                        }
                        break;
                    case types_1.COMPONENT_TYPES.REWARD_COMPONENT:
                        for (const aid in data[component]) {
                            (0, Rewards_1.createRewardComponent)(this, aid, data[component][aid]);
                        }
                        break;
                    case types_1.COMPONENT_TYPES.DIALOG_COMPONENT:
                        for (const aid in data[component]) {
                            (0, Dialog_1.createDialogComponent)(this, aid, data[component][aid]);
                        }
                        break;
                    case types_1.COMPONENT_TYPES.GAME_ITEM_COMPONENT:
                        for (const aid in data[component]) {
                            (0, GameItem_1.createGameItemComponent)(this, aid, data[component][aid]);
                        }
                        break;
                    case types_1.COMPONENT_TYPES.TEAM_COMPONENT:
                        for (const aid in data[component]) {
                            (0, Team_1.createTeamComponent)(this, aid, data[component][aid]);
                        }
                        break;
                    case types_1.COMPONENT_TYPES.LIVE_COMPONENT:
                        for (const aid in data[component]) {
                            (0, LiveShow_1.createLiveComponent)(this, aid, data[component][aid]);
                        }
                        break;
                    case types_1.COMPONENT_TYPES.LEVEL_COMPONENT:
                        for (const aid in data[component]) {
                            (0, Level_1.createLevelComponent)(this, aid, data[component][aid]);
                        }
                        break;
                    case types_1.COMPONENT_TYPES.GAME_COMPONENT:
                        for (const aid in data[component]) {
                            (0, Game_1.createGameComponent)(room, this, aid, data[component][aid]);
                        }
                        break;
                    case types_1.COMPONENT_TYPES.BILLBOARD_COMPONENT:
                        for (const aid in data[component]) {
                            (0, Billboard_1.createBillboardComponent)(this, aid, data[component][aid]);
                        }
                        break;
                    case types_1.COMPONENT_TYPES.UI_TEXT_COMPONENT:
                        for (const aid in data[component]) {
                            (0, UIText_1.createUITextComponent)(this, aid, data[component][aid]);
                        }
                        break;
                    case types_1.COMPONENT_TYPES.UI_IMAGE_COMPONENT:
                        for (const aid in data[component]) {
                            (0, UIImage_1.createUIImageComponent)(this, aid, data[component][aid]);
                        }
                        break;
                    case types_1.COMPONENT_TYPES.IWB_COMPONENT:
                        for (const aid in data[component]) {
                            (0, IWB_1.setIWBComponent)(room, this, aid, data[component][aid]);
                        }
                        break;
                    case types_1.COMPONENT_TYPES.NAMES_COMPONENT:
                        for (const aid in data[component]) {
                            (0, Names_1.createNameComponent)(this, aid, data[component][aid], true);
                            // this[COMPONENT_TYPES.NAMES_COMPONENT].set(aid, new NameComponent(data[component][aid]))
                        }
                        break;
                    case types_1.COMPONENT_TYPES.VISBILITY_COMPONENT:
                        for (const aid in data[component]) {
                            let vis = new Visibility_1.VisibilityComponent(data[component][aid]);
                            vis.visible = true;
                            this[types_1.COMPONENT_TYPES.VISBILITY_COMPONENT].set(aid, new Visibility_1.VisibilityComponent(data[component][aid]));
                        }
                        break;
                    case types_1.COMPONENT_TYPES.PARENTING_COMPONENT:
                        data[component].forEach((info) => {
                            this[types_1.COMPONENT_TYPES.PARENTING_COMPONENT].push(new Parenting_1.ParentingComponent(info));
                        });
                        break;
                    case types_1.COMPONENT_TYPES.TRANSFORM_COMPONENT:
                        for (const aid in data[component]) {
                            this[types_1.COMPONENT_TYPES.TRANSFORM_COMPONENT].set(aid, new Transform_1.TransformComponent(data[component][aid]));
                        }
                        break;
                    case types_1.COMPONENT_TYPES.POINTER_COMPONENT:
                        for (const aid in data[component]) {
                            (0, Pointers_1.createPointerComponent)(this, aid, data[component][aid]);
                        }
                        break;
                    case types_1.COMPONENT_TYPES.TEXT_COMPONENT:
                        for (const aid in data[component]) {
                            (0, TextShape_1.createTextComponent)(this, aid, data[component][aid]);
                        }
                        break;
                    case types_1.COMPONENT_TYPES.COUNTER_COMPONENT:
                        for (const aid in data[component]) {
                            (0, Counter_1.createCounterComponent)(this, aid, data[component][aid]);
                        }
                        break;
                    case types_1.COMPONENT_TYPES.AVATAR_SHAPE_COMPONENT:
                        for (const aid in data[component]) {
                            (0, AvatarShape_1.createAvatarShapeComponent)(this, aid, data[component][aid]);
                        }
                        break;
                    case types_1.COMPONENT_TYPES.TRIGGER_COMPONENT:
                        for (const aid in data[component]) {
                            (0, Trigger_1.createTriggerComponent)(this, aid, data[component][aid]);
                        }
                        break;
                    case types_1.COMPONENT_TYPES.ACTION_COMPONENT:
                        for (const aid in data[component]) {
                            let actionData = data[component][aid];
                            let action = new Actions_1.ActionComponent();
                            action.actions = new schema_1.ArraySchema();
                            actionData.actions.forEach((data) => {
                                let schema = new Actions_1.ActionComponentSchema();
                                for (let key in data) {
                                    schema[key] = data[key];
                                }
                                action.actions.push(schema);
                            });
                            this[types_1.COMPONENT_TYPES.ACTION_COMPONENT].set(aid, action);
                        }
                        break;
                    case types_1.COMPONENT_TYPES.GLTF_COMPONENT:
                        for (const aid in data[component]) {
                            this[types_1.COMPONENT_TYPES.GLTF_COMPONENT].set(aid, new Gltf_1.GltfComponent(data[component][aid]));
                        }
                        break;
                    case types_1.COMPONENT_TYPES.MESH_RENDER_COMPONENT:
                        for (const aid in data[component]) {
                            data[component][aid].aid = aid;
                            (0, MeshRenderers_1.createMeshRendererComponent)(this, data[component][aid]);
                        }
                        break;
                    case types_1.COMPONENT_TYPES.MESH_COLLIDER_COMPONENT:
                        for (const aid in data[component]) {
                            this[types_1.COMPONENT_TYPES.MESH_COLLIDER_COMPONENT].set(aid, new MeshColliders_1.MeshColliderComponent(data[component][aid]));
                        }
                        break;
                    case types_1.COMPONENT_TYPES.TEXTURE_COMPONENT:
                        for (const aid in data[component]) {
                            this[types_1.COMPONENT_TYPES.TEXTURE_COMPONENT].set(aid, new Textures_1.TextureComponent(data[component][aid]));
                        }
                        break;
                    case types_1.COMPONENT_TYPES.EMISSIVE_TEXTURE_COMPONENT:
                        for (const aid in data[component]) {
                            (0, Emissive_1.createEmissiveComponent)(this, aid, data[component][aid]);
                        }
                        break;
                    case types_1.COMPONENT_TYPES.MATERIAL_COMPONENT:
                        for (const aid in data[component]) {
                            (0, Materials_1.createMaterialComponent)(this, aid, data[component][aid]);
                        }
                        break;
                    case types_1.COMPONENT_TYPES.NFT_COMPONENT:
                        for (const aid in data[component]) {
                            (0, NftShape_1.createNftShapeComponent)(this, aid, data[component][aid]);
                        }
                        break;
                    case types_1.COMPONENT_TYPES.STATE_COMPONENT:
                        for (const aid in data[component]) {
                            let stateData = data[component][aid];
                            let state = new State_1.StateComponent();
                            state.defaultValue = data[component][aid].defaultValue;
                            state.values = new schema_1.ArraySchema();
                            stateData.values.forEach((value) => {
                                state.values.push(value);
                            });
                            this[types_1.COMPONENT_TYPES.STATE_COMPONENT].set(aid, state);
                        }
                        break;
                    case types_1.COMPONENT_TYPES.AUDIO_SOURCE_COMPONENT:
                        for (const aid in data[component]) {
                            (0, Sound_1.createAudioSourceComponent)(this, aid, data[component][aid]);
                        }
                        break;
                    case types_1.COMPONENT_TYPES.AUDIO_STREAM_COMPONENT:
                        for (const aid in data[component]) {
                            (0, Sound_1.createAudioStreamComponent)(this, aid, data[component][aid]);
                            // this[COMPONENT_TYPES.AUDIO_STREAM_COMPONENT].set(aid, new SoundComponent(data[component][aid]))
                        }
                        break;
                    case types_1.COMPONENT_TYPES.VIDEO_COMPONENT:
                        for (const aid in data[component]) {
                            this[types_1.COMPONENT_TYPES.VIDEO_COMPONENT].set(aid, new Video_1.VideoComponent(data[component][aid]));
                        }
                        break;
                    case types_1.COMPONENT_TYPES.ANIMATION_COMPONENT:
                        for (const aid in data[component]) {
                            (0, Animator_1.createAnimationComponent)(this, aid, data[component][aid]);
                        }
                        break;
                }
            }
        });
    }
}
exports.Scene = Scene;
__decorate([
    (0, schema_1.type)("string")
], Scene.prototype, "id", void 0);
__decorate([
    (0, schema_1.type)("string")
], Scene.prototype, "n", void 0);
__decorate([
    (0, schema_1.type)("string")
], Scene.prototype, "d", void 0);
__decorate([
    (0, schema_1.type)("string")
], Scene.prototype, "o", void 0);
__decorate([
    (0, schema_1.type)("string")
], Scene.prototype, "ona", void 0);
__decorate([
    (0, schema_1.type)("string")
], Scene.prototype, "cat", void 0);
__decorate([
    (0, schema_1.type)("string")
], Scene.prototype, "bpcl", void 0);
__decorate([
    (0, schema_1.type)("string")
], Scene.prototype, "w", void 0);
__decorate([
    (0, schema_1.type)("string")
], Scene.prototype, "im", void 0);
__decorate([
    (0, schema_1.type)(['string'])
], Scene.prototype, "bps", void 0);
__decorate([
    (0, schema_1.type)(['string'])
], Scene.prototype, "rat", void 0);
__decorate([
    (0, schema_1.type)(['string'])
], Scene.prototype, "rev", void 0);
__decorate([
    (0, schema_1.type)(['string'])
], Scene.prototype, "pcls", void 0);
__decorate([
    (0, schema_1.type)(['string'])
], Scene.prototype, "sp", void 0);
__decorate([
    (0, schema_1.type)(['string'])
], Scene.prototype, "cp", void 0);
__decorate([
    (0, schema_1.type)("number")
], Scene.prototype, "cd", void 0);
__decorate([
    (0, schema_1.type)("number")
], Scene.prototype, "upd", void 0);
__decorate([
    (0, schema_1.type)("number")
], Scene.prototype, "si", void 0);
__decorate([
    (0, schema_1.type)("number")
], Scene.prototype, "toc", void 0);
__decorate([
    (0, schema_1.type)("number")
], Scene.prototype, "pc", void 0);
__decorate([
    (0, schema_1.type)("number")
], Scene.prototype, "pcnt", void 0);
__decorate([
    (0, schema_1.type)("number")
], Scene.prototype, "direction", void 0);
__decorate([
    (0, schema_1.type)("boolean")
], Scene.prototype, "isdl", void 0);
__decorate([
    (0, schema_1.type)("boolean")
], Scene.prototype, "e", void 0);
__decorate([
    (0, schema_1.type)("boolean")
], Scene.prototype, "priv", void 0);
__decorate([
    (0, schema_1.type)("boolean")
], Scene.prototype, "dv", void 0);
__decorate([
    (0, schema_1.type)("boolean")
], Scene.prototype, "dpx", void 0);
__decorate([
    (0, schema_1.type)("boolean")
], Scene.prototype, "lim", void 0);
__decorate([
    (0, schema_1.type)({ map: Transform_1.TransformComponent })
], Scene.prototype, _a, void 0);
__decorate([
    (0, schema_1.type)({ map: Gltf_1.GltfComponent })
], Scene.prototype, _b, void 0);
__decorate([
    (0, schema_1.type)({ map: MeshRenderers_1.MeshRendererComponent })
], Scene.prototype, _c, void 0);
__decorate([
    (0, schema_1.type)({ map: MeshColliders_1.MeshColliderComponent })
], Scene.prototype, _d, void 0);
__decorate([
    (0, schema_1.type)({ map: Textures_1.TextureComponent })
], Scene.prototype, _e, void 0);
__decorate([
    (0, schema_1.type)({ map: Emissive_1.EmissiveComponent })
], Scene.prototype, _f, void 0);
__decorate([
    (0, schema_1.type)({ map: Materials_1.MaterialComponent })
], Scene.prototype, _g, void 0);
__decorate([
    (0, schema_1.type)({ map: Names_1.NameComponent })
], Scene.prototype, _h, void 0);
__decorate([
    (0, schema_1.type)({ map: Visibility_1.VisibilityComponent })
], Scene.prototype, _j, void 0);
__decorate([
    (0, schema_1.type)({ map: Actions_1.ActionComponent })
], Scene.prototype, _k, void 0);
__decorate([
    (0, schema_1.type)({ map: Counter_1.CounterComponent })
], Scene.prototype, _l, void 0);
__decorate([
    (0, schema_1.type)({ map: Counter_1.CounterBarComponent })
], Scene.prototype, "counterbars", void 0);
__decorate([
    (0, schema_1.type)({ map: State_1.StateComponent })
], Scene.prototype, _m, void 0);
__decorate([
    (0, schema_1.type)({ map: Trigger_1.TriggerComponent })
], Scene.prototype, _o, void 0);
__decorate([
    (0, schema_1.type)({ map: TextShape_1.TextShapeComponent })
], Scene.prototype, _p, void 0);
__decorate([
    (0, schema_1.type)({ map: NftShape_1.NftShapeComponent })
], Scene.prototype, _q, void 0);
__decorate([
    (0, schema_1.type)({ map: Animator_1.AnimatorComponent })
], Scene.prototype, _r, void 0);
__decorate([
    (0, schema_1.type)({ map: Pointers_1.PointerComponent })
], Scene.prototype, _s, void 0);
__decorate([
    (0, schema_1.type)({ map: Sound_1.SoundComponent })
], Scene.prototype, _t, void 0);
__decorate([
    (0, schema_1.type)({ map: Sound_1.SoundComponent })
], Scene.prototype, _u, void 0);
__decorate([
    (0, schema_1.type)({ map: AvatarShape_1.AvatarShapeComponent })
], Scene.prototype, _v, void 0);
__decorate([
    (0, schema_1.type)({ map: Video_1.VideoComponent })
], Scene.prototype, _w, void 0);
__decorate([
    (0, schema_1.type)({ map: Rewards_1.RewardComponent })
], Scene.prototype, "rewards", void 0);
__decorate([
    (0, schema_1.type)({ map: IWB_1.IWBComponent })
], Scene.prototype, _x, void 0);
__decorate([
    (0, schema_1.type)({ map: UIText_1.UITextComponent })
], Scene.prototype, _y, void 0);
__decorate([
    (0, schema_1.type)({ map: UIImage_1.UIImageComponent })
], Scene.prototype, _z, void 0);
__decorate([
    (0, schema_1.type)({ map: Game_1.GameComponent })
], Scene.prototype, _0, void 0);
__decorate([
    (0, schema_1.type)({ map: Level_1.LevelComponent })
], Scene.prototype, _1, void 0);
__decorate([
    (0, schema_1.type)({ map: Billboard_1.BillboardComponent })
], Scene.prototype, _2, void 0);
__decorate([
    (0, schema_1.type)({ map: LiveShow_1.LiveShowComponent })
], Scene.prototype, _3, void 0);
__decorate([
    (0, schema_1.type)({ map: Team_1.TeamComponent })
], Scene.prototype, _4, void 0);
__decorate([
    (0, schema_1.type)({ map: GameItem_1.GameItemComponent })
], Scene.prototype, _5, void 0);
__decorate([
    (0, schema_1.type)({ map: Dialog_1.DialogComponent })
], Scene.prototype, _6, void 0);
__decorate([
    (0, schema_1.type)({ map: Rewards_1.RewardComponent })
], Scene.prototype, _7, void 0);
__decorate([
    (0, schema_1.type)({ map: Playlist_1.PlaylistComponent })
], Scene.prototype, _8, void 0);
__decorate([
    (0, schema_1.type)({ map: Paths_1.PathComponent })
], Scene.prototype, _9, void 0);
__decorate([
    (0, schema_1.type)([Parenting_1.ParentingComponent])
], Scene.prototype, _10, void 0);
function initServerScenes(room, options) {
    if (app_config_1.iwbManager.pendingSaves.includes((room.state.world))) {
        let timeout = setTimeout(() => {
            clearTimeout(timeout);
            initServerScenes(room, options);
        }, 1000 * 1);
    }
    else {
        setTimeout(() => {
            let world = app_config_1.iwbManager.worlds.find((w) => w.ens === room.state.world);
            if (world) {
                app_config_1.iwbManager.initiateRealm(world.owner)
                    .then((realmData) => {
                    room.state.realmToken = realmData.EntityToken.EntityToken;
                    room.state.realmId = realmData.EntityToken.Entity.Id;
                    room.state.realmTokenType = realmData.EntityToken.Entity.Type;
                    app_config_1.iwbManager.fetchRealmData(realmData)
                        .then((realmScenes) => {
                        app_config_1.iwbManager.fetchRealmScenes(room.state.world, realmScenes)
                            .then(async (sceneData) => {
                            await loadRealmScenes(room, sceneData, options);
                            app_config_1.iwbManager.initUsers(room);
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
exports.initServerScenes = initServerScenes;
async function initServerAssets(room) {
    let world = app_config_1.iwbManager.worlds.find((w) => w.ens === room.state.world);
    console.log('init server assets for world', world);
    let metadata = await (0, Playfab_1.fetchPlayfabMetadata)(world.owner);
    let json = await (0, Playfab_1.fetchPlayfabFile)(metadata, "catalogs.json");
    let catalogVersion = json.hasOwnProperty("version") ? json.version : 0;
    room.state.catalogVersion = catalogVersion;
    if (json.hasOwnProperty("items")) {
        json.items.forEach((item) => {
            item.v = catalogVersion;
            if (item.ugc) {
                room.state.realmAssets.set(item.id, item);
            }
            else {
                let catalogItem = app_config_1.itemManager.items.get(item.id);
                if (catalogItem) {
                    room.state.realmAssets.set(item.id, { ...catalogItem });
                }
            }
        });
    }
    else {
        json.forEach((item) => {
            item.v = catalogVersion;
            if (item.ugc) {
                room.state.realmAssets.set(item.id, item);
            }
            else {
                let catalogItem = app_config_1.itemManager.items.get(item.id);
                if (catalogItem) {
                    room.state.realmAssets.set(item.id, { ...catalogItem });
                }
            }
        });
        room.state.realmAssetsChanged = true;
    }
    console.log('realm asset size', room.state.realmAssets.size);
    console.log('realm catalog version is', room.state.catalogVersion);
}
exports.initServerAssets = initServerAssets;
async function loadRealmScenes(room, scenes, options) {
    let filter = [...scenes.filter((scene) => scene.w === room.state.world)];
    room.state.sceneCount = filter.length;
    if (options) {
        console.log('we have connectoin from gc, only load specfic scene');
        let scene = filter.find(($) => $.id === options.localConfig.id);
        if (scene) {
            console.log('we found scene to load for gc');
            scene.pcls = translateGCParcels(scene.pcls);
            scene.bpcl = "0,0";
            // scene.pcls = options.localConfig.parcels
            // scene.bpcl = options.localConfig.base
            room.state.scenes.set(scene.id, new Scene(room, scene));
        }
    }
    else {
        filter.forEach((scene) => {
            room.state.scenes.set(scene.id, new Scene(room, scene));
        });
    }
}
exports.loadRealmScenes = loadRealmScenes;
async function saveRealm(room) {
    let fileNames = [];
    let data = [];
    let scenes = await getRealmData(room);
    if (scenes && scenes.length > 0) {
        fileNames.push("" + room.state.world + "-scenes.json");
        data.push(scenes);
    }
    if (room.state.realmAssetsChanged) {
        console.log('back up catalog assets');
        let json = {
            version: room.state.catalogVersion + 1,
            items: []
        };
        room.state.realmAssets.forEach((item) => {
            json.items.push(item);
        });
        if (scenes && scenes.length > 0) {
            fileNames.push("catalogs.json");
            data.push(json);
        }
    }
    else {
        console.log('dont back up catalog assets');
    }
    if (fileNames.length > 0) {
        let world = app_config_1.iwbManager.worlds.find((w) => w.ens === room.state.world);
        if (world) {
            world.builds = scenes.length;
            world.updated = Math.floor(Date.now() / 1000);
            if (room.state.realmAssetsChanged) {
                world.cv = room.state.catalogVersion + 1;
            }
            app_config_1.iwbManager.worldsModified = true;
        }
        app_config_1.iwbManager.addWorldPendingSave(room.state.world, room.roomId, fileNames, room.state.realmToken, room.state.realmTokenType, room.state.realmId, data);
        // iwbManager.backupFiles(room.state.world, fileNames, room.state.realmToken, room.state.realmTokenType, room.state.realmId, data)
    }
}
exports.saveRealm = saveRealm;
function getRealmData(room) {
    let scenes = [];
    room.state.scenes.forEach(async (scene) => {
        let jsonScene = scene.toJSON();
        jsonScene = await checkAssetCacheStates(scene, jsonScene);
        scenes.push(jsonScene);
    });
    return scenes;
}
exports.getRealmData = getRealmData;
function saveRealmAssets(room) {
    let assets = [];
    room.state.realmAssets.forEach((item) => {
        assets.push(item);
    });
    return assets;
    // iwbManager.backupFile(room.state.world, "catalogs.json", room.state.realmToken, room.state.realmTokenType, room.state.realmId, assets)
}
exports.saveRealmAssets = saveRealmAssets;
async function checkAssetCacheStates(scene, jsonScene) {
    scene[types_1.COMPONENT_TYPES.IWB_COMPONENT].forEach(async (iwbComponent, aid) => {
        jsonScene = await (0, IWB_1.checkIWBCache)(scene, aid, jsonScene);
        jsonScene = await (0, Rewards_1.checkRewardCache)(scene, aid, jsonScene);
    });
    return jsonScene;
}
exports.checkAssetCacheStates = checkAssetCacheStates;
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
function translateGCParcels(parcels) {
    // Parse the coordinate strings into an array of tuples
    const parsedCoords = parcels.map(coord => {
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
    console.log('translated coords are ', translatedCoords);
    return translatedCoords;
}
