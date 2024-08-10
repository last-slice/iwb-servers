"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7;
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAssetCacheStates = exports.saveRealmAssets = exports.saveRealmScenes = exports.getRealmData = exports.saveRealm = exports.loadRealmScenes = exports.initServerAssets = exports.initServerScenes = exports.Scene = exports.TempScene = void 0;
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
    static { _a = types_1.COMPONENT_TYPES.TRANSFORM_COMPONENT, _b = types_1.COMPONENT_TYPES.GLTF_COMPONENT, _c = types_1.COMPONENT_TYPES.MESH_RENDER_COMPONENT, _d = types_1.COMPONENT_TYPES.MESH_COLLIDER_COMPONENT, _e = types_1.COMPONENT_TYPES.TEXTURE_COMPONENT, _f = types_1.COMPONENT_TYPES.EMISSIVE_TEXTURE_COMPONENT, _g = types_1.COMPONENT_TYPES.MATERIAL_COMPONENT, _h = types_1.COMPONENT_TYPES.NAMES_COMPONENT, _j = types_1.COMPONENT_TYPES.VISBILITY_COMPONENT, _k = types_1.COMPONENT_TYPES.ACTION_COMPONENT, _l = types_1.COMPONENT_TYPES.COUNTER_COMPONENT, _m = types_1.COMPONENT_TYPES.STATE_COMPONENT, _o = types_1.COMPONENT_TYPES.TRIGGER_COMPONENT, _p = types_1.COMPONENT_TYPES.TEXT_COMPONENT, _q = types_1.COMPONENT_TYPES.NFT_COMPONENT, _r = types_1.COMPONENT_TYPES.ANIMATION_COMPONENT, _s = types_1.COMPONENT_TYPES.POINTER_COMPONENT, _t = types_1.COMPONENT_TYPES.AUDIO_SOURCE_COMPONENT, _u = types_1.COMPONENT_TYPES.AUDIO_STREAM_COMPONENT, _v = types_1.COMPONENT_TYPES.AVATAR_SHAPE_COMPONENT, _w = types_1.COMPONENT_TYPES.VIDEO_COMPONENT, _x = types_1.COMPONENT_TYPES.IWB_COMPONENT, _y = types_1.COMPONENT_TYPES.UI_TEXT_COMPONENT, _z = types_1.COMPONENT_TYPES.UI_IMAGE_COMPONENT, _0 = types_1.COMPONENT_TYPES.GAME_COMPONENT, _1 = types_1.COMPONENT_TYPES.LEVEL_COMPONENT, _2 = types_1.COMPONENT_TYPES.BILLBOARD_COMPONENT, _3 = types_1.COMPONENT_TYPES.LIVE_COMPONENT, _4 = types_1.COMPONENT_TYPES.TEAM_COMPONENT, _5 = types_1.COMPONENT_TYPES.GAME_ITEM_COMPONENT, _6 = types_1.COMPONENT_TYPES.DIALOG_COMPONENT, _7 = types_1.COMPONENT_TYPES.PARENTING_COMPONENT; }
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
        // this[COMPONENT_TYPES.CLICK_AREA_COMPONENT] = new MapSchema<string>()
        Object.values(types_1.COMPONENT_TYPES).forEach((component) => {
            if (data[component]) {
                switch (component) {
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
                            this[types_1.COMPONENT_TYPES.NAMES_COMPONENT].set(aid, new Names_1.NameComponent(data[component][aid]));
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
                            let triggerData = data[component][aid];
                            let trigger = new Trigger_1.TriggerComponent();
                            trigger.triggers = new schema_1.ArraySchema();
                            trigger.isArea = data[component][aid].isArea;
                            triggerData.triggers.forEach((data) => {
                                let schema = new Trigger_1.TriggerComponentSchema();
                                schema.id = data.id;
                                schema.type = data.type;
                                schema.input = data.input;
                                schema.pointer = data.pointer;
                                schema.caid = new schema_1.ArraySchema();
                                schema.ctype = new schema_1.ArraySchema();
                                schema.cvalue = new schema_1.ArraySchema();
                                schema.ccounter = new schema_1.ArraySchema();
                                data.caid.forEach((caid) => {
                                    schema.caid.push(caid);
                                });
                                data.ctype.forEach((ctype) => {
                                    schema.ctype.push(ctype);
                                });
                                data.cvalue.forEach((cvalue) => {
                                    schema.cvalue.push(cvalue);
                                });
                                data.ccounter.forEach((ccounter) => {
                                    schema.ccounter.push(ccounter);
                                });
                                schema.actions = new schema_1.ArraySchema();
                                data.actions.forEach((action) => {
                                    schema.actions.push(action);
                                });
                                trigger.triggers.push(schema);
                            });
                            this[types_1.COMPONENT_TYPES.TRIGGER_COMPONENT].set(aid, trigger);
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
                            this[types_1.COMPONENT_TYPES.MESH_RENDER_COMPONENT].set(aid, new MeshRenderers_1.MeshRendererComponent(data[component][aid]));
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
                            this[types_1.COMPONENT_TYPES.AUDIO_STREAM_COMPONENT].set(aid, new Sound_1.SoundComponent(data[component][aid]));
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
    (0, schema_1.type)([Parenting_1.ParentingComponent])
], Scene.prototype, _7, void 0);
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
    let metadata = await (0, Playfab_1.fetchPlayfabMetadata)(app_config_1.iwbManager.worlds.find((w) => w.ens === room.state.world).owner);
    let json = await (0, Playfab_1.fetchPlayfabFile)(metadata, "catalogs.json");
    let catalogVersion = json.hasOwnProperty("version") ? json.version : 0;
    room.state.catalogVersion = catalogVersion;
    if (json.hasOwnProperty("items")) {
        json.items.forEach((item) => {
            item.v = catalogVersion;
            room.state.realmAssets.set(item.id, item);
        });
    }
    else {
        json.forEach((item) => {
            item.v = catalogVersion;
            room.state.realmAssets.set(item.id, item);
        });
        room.state.realmAssetsChanged = true;
    }
    // console.log(room.state.realmAssets)
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
    let scenes = getRealmData(room);
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
        // if(scene.id === "OaT46"){
        //     // console.log('scene is', jsonScene)
        //     await checkAssetCacheStates(scene, jsonScene)
        // }
        // Object.values(COMPONENT_TYPES).forEach((component:any)=>{
        //     if(data[component]){
        //         for(let aid in data[component]){
        //         }
        //     }
        // })
        scenes.push(jsonScene);
    });
    return scenes;
}
exports.getRealmData = getRealmData;
async function saveRealmScenes(room) {
    let scenes = [];
    room.state.scenes.forEach(async (scene) => {
        let jsonScene = scene.toJSON();
        // console.log('scene is', jsonScene)
        // await checkAssetCacheStates(scene, jsonScene)
        // Object.values(COMPONENT_TYPES).forEach((component:any)=>{
        //     if(data[component]){
        //         for(let aid in data[component]){
        //         }
        //     }
        // })
        scenes.push(jsonScene);
    });
    // let world = iwbManager.worlds.find((w)=>w.ens === room.state.world)
    // if(world){
    //     world.builds = scenes.length
    //     world.updated = Math.floor(Date.now()/1000)
    // }
    // if(scenes.length > 0){
    //     iwbManager.backupScene(room.state.world, room.state.realmToken, room.state.realmTokenType, room.state.realmId, scenes)
    // }
    return scenes;
}
exports.saveRealmScenes = saveRealmScenes;
function saveRealmAssets(room) {
    let assets = [];
    room.state.realmAssets.forEach((item) => {
        assets.push(item);
    });
    return assets;
    // iwbManager.backupFile(room.state.world, "catalogs.json", room.state.realmToken, room.state.realmTokenType, room.state.realmId, assets)
}
exports.saveRealmAssets = saveRealmAssets;
function checkAssetCacheStates(scene, jsonScene) {
    scene[types_1.COMPONENT_TYPES.IWB_COMPONENT].forEach((iwbComponent, aid) => {
        console.log('ugc is', iwbComponent.ugc);
        console.log('type is', iwbComponent.type);
    });
    // scene.parenting.forEach((assetItem:any, index:number)=>{
    //     let iwbAsset = scene.itemInfo.get(assetItem.aid)
    //     iwbAsset.editing = false
    //     iwbAsset.editor = ""
    //     //Reward Component
    //     let rewardInfo = scene.rewards.get(assetItem.aid)
    //     if(rewardInfo){
    //         let jsonItem = rewardInfo.toJSON()
    //         jsondata[COMPONENT_TYPES.REWARD_COMPONENT][assetItem.aid] = jsonItem
    //     }
    // })
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
