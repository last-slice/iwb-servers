"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addItemComponents = exports.Scene = exports.TempScene = exports.SceneItem = void 0;
const schema_1 = require("@colyseus/schema");
const types_1 = require("../utils/types");
const Components_1 = require("./Components");
class SceneItem extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.editing = false;
        this.ugc = false;
        this.pending = false;
        this.editor = "";
        this.p = new Components_1.Vector3();
        this.r = new Components_1.Vector3();
        this.s = new Components_1.Vector3();
        this.comps = new schema_1.ArraySchema();
        // @type(ClickComponent) clickComp: ClickComponent
    }
}
exports.SceneItem = SceneItem;
__decorate([
    (0, schema_1.type)("string")
], SceneItem.prototype, "id", void 0);
__decorate([
    (0, schema_1.type)("number")
], SceneItem.prototype, "ent", void 0);
__decorate([
    (0, schema_1.type)('string')
], SceneItem.prototype, "aid", void 0);
__decorate([
    (0, schema_1.type)("string")
], SceneItem.prototype, "n", void 0);
__decorate([
    (0, schema_1.type)("string")
], SceneItem.prototype, "type", void 0);
__decorate([
    (0, schema_1.type)("boolean")
], SceneItem.prototype, "editing", void 0);
__decorate([
    (0, schema_1.type)("boolean")
], SceneItem.prototype, "ugc", void 0);
__decorate([
    (0, schema_1.type)("boolean")
], SceneItem.prototype, "pending", void 0);
__decorate([
    (0, schema_1.type)("string")
], SceneItem.prototype, "editor", void 0);
__decorate([
    (0, schema_1.type)(Components_1.Vector3)
], SceneItem.prototype, "p", void 0);
__decorate([
    (0, schema_1.type)(Components_1.Quaternion)
], SceneItem.prototype, "r", void 0);
__decorate([
    (0, schema_1.type)(Components_1.Vector3)
], SceneItem.prototype, "s", void 0);
__decorate([
    (0, schema_1.type)(["string"])
], SceneItem.prototype, "comps", void 0);
__decorate([
    (0, schema_1.type)(Components_1.VisibilityComponent)
], SceneItem.prototype, "visComp", void 0);
__decorate([
    (0, schema_1.type)(Components_1.MaterialComponent)
], SceneItem.prototype, "matComp", void 0);
__decorate([
    (0, schema_1.type)(Components_1.CollisionComponent)
], SceneItem.prototype, "colComp", void 0);
__decorate([
    (0, schema_1.type)(Components_1.ImageComponent)
], SceneItem.prototype, "imgComp", void 0);
__decorate([
    (0, schema_1.type)(Components_1.VideoComponent)
], SceneItem.prototype, "vidComp", void 0);
__decorate([
    (0, schema_1.type)(Components_1.NFTComponent)
], SceneItem.prototype, "nftComp", void 0);
__decorate([
    (0, schema_1.type)(Components_1.TextComponent)
], SceneItem.prototype, "textComp", void 0);
__decorate([
    (0, schema_1.type)(Components_1.AudioComponent)
], SceneItem.prototype, "audComp", void 0);
__decorate([
    (0, schema_1.type)(Components_1.TriggerComponent)
], SceneItem.prototype, "trigComp", void 0);
__decorate([
    (0, schema_1.type)(Components_1.ActionComponent)
], SceneItem.prototype, "actComp", void 0);
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
    constructor(data, room) {
        super();
        this.bps = new schema_1.ArraySchema();
        this.rat = new schema_1.ArraySchema();
        this.rev = new schema_1.ArraySchema();
        this.pcls = new schema_1.ArraySchema();
        this.sp = new schema_1.ArraySchema();
        this.ass = new schema_1.ArraySchema();
        if (data) {
            // console.log('creating new scene', data)
            this.id = data.id;
            this.n = data.n;
            this.d = data.d;
            this.pcnt = data.pcnt;
            this.cd = data.cd;
            this.upd = data.upd;
            this.o = data.o;
            this.ona = data.ona;
            this.cat = data.cat;
            this.bpcl = data.bpcl;
            this.bps = data.bps;
            this.rat = data.rat;
            this.rev = data.rev;
            this.pcls = data.pcls;
            this.sp = data.sp;
            this.si = data.si;
            this.toc = data.toc;
            this.pc = data.pc;
            this.isdl = data.isdl;
            this.e = data.e;
            this.w = data.w;
            this.priv = data.priv;
            this.im = data.im ? data.im : "";
            if (data.ass) {
                data.ass.forEach((asset) => {
                    try {
                        let item = new SceneItem();
                        item.id = asset.id;
                        item.ent = asset.ent;
                        item.p = new Components_1.Vector3(asset.p);
                        item.r = new Components_1.Quaternion(asset.r);
                        item.s = new Components_1.Vector3(asset.s);
                        item.aid = asset.aid;
                        item.type = asset.type;
                        item.ugc = asset.hasOwnProperty("ugc") ? asset.ugc : false;
                        item.pending = asset.hasOwnProperty("pending") ? asset.pending : false;
                        if (item.ugc && room) {
                            let ugcItem = room.state.realmAssets.get(item.id);
                            if (ugcItem) {
                                item.pending = ugcItem.pending;
                            }
                        }
                        console.log('asset is pending', asset);
                        //add components
                        addItemComponents(item, asset);
                        this.ass.push(item);
                    }
                    catch (e) {
                        console.log('error loading asset for scene', this.id, asset);
                    }
                });
            }
        }
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
    (0, schema_1.type)([SceneItem])
], Scene.prototype, "ass", void 0);
function addItemComponents(item, asset) {
    item.comps = asset.comps;
    if (!item.comps.includes(types_1.COMPONENT_TYPES.COLLISION_COMPONENT)) {
        item.comps.push(types_1.COMPONENT_TYPES.COLLISION_COMPONENT);
    }
    if (!item.comps.includes(types_1.COMPONENT_TYPES.TRIGGER_COMPONENT)) {
        item.comps.push(types_1.COMPONENT_TYPES.TRIGGER_COMPONENT);
    }
    if (!item.comps.includes(types_1.COMPONENT_TYPES.ACTION_COMPONENT)) {
        item.comps.push(types_1.COMPONENT_TYPES.ACTION_COMPONENT);
    }
    item.comps.forEach((component) => {
        switch (component) {
            case types_1.COMPONENT_TYPES.MATERIAL_COMPONENT:
                item.matComp = new Components_1.MaterialComponent();
                item.matComp.shadows = asset.matComp.shadows;
                item.matComp.metallic = asset.matComp.metallic;
                item.matComp.roughness = asset.matComp.roughness;
                item.matComp.intensity = asset.matComp.intensity;
                item.matComp.emissPath = asset.matComp.emissPath;
                item.matComp.emissInt = asset.matComp.emissInt;
                item.matComp.textPath = asset.matComp.textPath;
                item.matComp.color = asset.matComp.color;
                item.matComp.emiss = asset.matComp.emiss;
                item.matComp.type = asset.matComp.type ? asset.matComp.type : "PBR";
                item.matComp.emissColor = asset.matComp.emissColor ? asset.matComp.emissColor : ["1", "1", "1", "1"];
                break;
            case types_1.COMPONENT_TYPES.IMAGE_COMPONENT:
                item.imgComp = new Components_1.ImageComponent();
                item.imgComp.url = asset.imgComp.url;
                break;
            case types_1.COMPONENT_TYPES.VIDEO_COMPONENT:
                item.vidComp = new Components_1.VideoComponent();
                item.vidComp.url = asset.vidComp?.url || '';
                item.vidComp.volume = asset.vidComp?.volume || 0.5;
                item.vidComp.autostart = asset.vidComp?.autostart || true;
                item.vidComp.loop = asset.vidComp?.loop || false;
                break;
            case types_1.COMPONENT_TYPES.AUDIO_COMPONENT:
                console.log('audio component is', asset.audComp);
                item.audComp = new Components_1.AudioComponent();
                item.audComp.url = asset.audComp?.url || '';
                item.audComp.volume = asset.audComp?.volume || 0.5;
                item.audComp.autostart = asset.audComp?.autostart;
                item.audComp.loop = asset.audComp?.loop || false;
                item.audComp.attachedPlayer = asset.audComp?.attachedPlayer || false;
                break;
            case types_1.COMPONENT_TYPES.VISBILITY_COMPONENT:
                item.visComp = new Components_1.VisibilityComponent();
                item.visComp.visible = asset.visComp.visible;
                break;
            case types_1.COMPONENT_TYPES.COLLISION_COMPONENT:
                item.colComp = new Components_1.CollisionComponent();
                item.colComp.iMask = asset.colComp ? asset.colComp.iMask : 2;
                item.colComp.vMask = asset.colComp ? asset.colComp.vMask : 1;
                break;
            case types_1.COMPONENT_TYPES.NFT_COMPONENT:
                item.nftComp = new Components_1.NFTComponent();
                item.nftComp.contract = asset.nftComp ? asset.nftComp.contract : "";
                item.nftComp.tokenId = asset.nftComp ? asset.nftComp.tokenId : "";
                item.nftComp.chain = asset.nftComp ? asset.nftComp.chain : "eth";
                item.nftComp.style = asset.nftComp ? asset.nftComp.style : "none";
                break;
            case types_1.COMPONENT_TYPES.TEXT_COMPONENT:
                item.textComp = new Components_1.TextComponent();
                if (asset.textComp) {
                    item.textComp.text = asset.textComp.text;
                    item.textComp.font = asset.textComp.font;
                    item.textComp.fontSize = asset.textComp.fontSize;
                    item.textComp.color = new Components_1.Color4();
                    item.textComp.color.r = asset.textComp.color.r;
                    item.textComp.color.g = asset.textComp.color.g;
                    item.textComp.color.b = asset.textComp.color.b;
                    item.textComp.color.a = asset.textComp.color.a;
                    item.textComp.align = asset.textComp.align;
                    item.textComp.outlineWidth = asset.textComp.outlineWidth;
                    item.textComp.outlineColor = new Components_1.Color4(asset.textComp.outlineColor);
                }
                break;
            // case COMPONENT_TYPES.CLICK_COMPONENT:
            //     item.clickComp = new ClickComponent()
            //     if(asset.clickComp){
            //         item.clickComp.url = asset.clickComp.url
            //         item.clickComp.type = asset.clickComp.type
            //         item.clickComp.enabled = asset.clickComp.enabled
            //         item.clickComp.hoverText = asset.clickComp.hoverText
            //     }
            //     break;
            case types_1.COMPONENT_TYPES.TRIGGER_COMPONENT:
                item.trigComp = new Components_1.TriggerComponent();
                if (asset.trigComp) {
                    item.trigComp.enabled = asset.trigComp.enabled;
                    asset.trigComp.triggers.forEach((data) => {
                        console.log('triggers are ', data);
                        let trigger = new Components_1.Triggers();
                        trigger.type = data.type;
                        for (let key in data.actions) {
                            console.log('action is', data.actions[key]);
                            let action = new Components_1.Actions();
                            action.name = data.actions[key].name;
                            action.url = data.actions[key].url;
                            action.type = data.actions[key].type;
                            action.hoverText = data.actions[key].hoverText;
                            trigger.actions.set(action.name, action);
                        }
                        item.trigComp.triggers.push(trigger);
                    });
                }
                break;
            case types_1.COMPONENT_TYPES.ACTION_COMPONENT:
                item.actComp = new Components_1.ActionComponent();
                if (asset.actComp) {
                    for (let key in asset.actComp.actions) {
                        let action = new Components_1.Actions();
                        action.name = asset.actComp.actions[key].name;
                        action.url = asset.actComp.actions[key].url;
                        action.type = asset.actComp.actions[key].type;
                        action.hoverText = asset.actComp.actions[key].hoverText;
                        item.actComp.actions.set(key, action);
                    }
                    // console.log('asset actions are a', asset.actComp.actions)
                    // asset.actComp.actions.forEach((action:any, key:any)=>{
                    //     item.actComp.actions.set(key, action)
                    // })
                }
                break;
        }
    });
}
exports.addItemComponents = addItemComponents;
