"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addActionComponent = exports.addTriggerComponent = exports.addTextComponent = exports.addMaterialComponent = exports.addAudioComponent = exports.addVideoComponent = exports.addImageComponent = exports.addVisibilityComponent = exports.addCollisionComponent = exports.addNFTComponent = exports.TriggerComponent = exports.Triggers = exports.ActionComponent = exports.Actions = exports.TextComponent = exports.AudioComponent = exports.VideoComponent = exports.NFTComponent = exports.ImageComponent = exports.VisibilityComponent = exports.MaterialComponent = exports.CollisionComponent = exports.Quaternion = exports.Vector3 = exports.Color4 = void 0;
const schema_1 = require("@colyseus/schema");
const types_1 = require("../utils/types");
class Color4 extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.r = 1;
        this.g = 1;
        this.b = 1;
        this.a = 1;
    }
}
exports.Color4 = Color4;
__decorate([
    (0, schema_1.type)("number")
], Color4.prototype, "r", void 0);
__decorate([
    (0, schema_1.type)("number")
], Color4.prototype, "g", void 0);
__decorate([
    (0, schema_1.type)("number")
], Color4.prototype, "b", void 0);
__decorate([
    (0, schema_1.type)("number")
], Color4.prototype, "a", void 0);
class Vector3 extends schema_1.Schema {
}
exports.Vector3 = Vector3;
__decorate([
    (0, schema_1.type)("number")
], Vector3.prototype, "x", void 0);
__decorate([
    (0, schema_1.type)("number")
], Vector3.prototype, "y", void 0);
__decorate([
    (0, schema_1.type)("number")
], Vector3.prototype, "z", void 0);
class Quaternion extends schema_1.Schema {
}
exports.Quaternion = Quaternion;
__decorate([
    (0, schema_1.type)("number")
], Quaternion.prototype, "x", void 0);
__decorate([
    (0, schema_1.type)("number")
], Quaternion.prototype, "y", void 0);
__decorate([
    (0, schema_1.type)("number")
], Quaternion.prototype, "z", void 0);
__decorate([
    (0, schema_1.type)("number")
], Quaternion.prototype, "w", void 0);
class CollisionComponent extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.vMask = 1;
        this.iMask = 2;
    }
}
exports.CollisionComponent = CollisionComponent;
__decorate([
    (0, schema_1.type)("number")
], CollisionComponent.prototype, "vMask", void 0);
__decorate([
    (0, schema_1.type)("number")
], CollisionComponent.prototype, "iMask", void 0);
class MaterialComponent extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.shadows = true;
        this.metallic = 0;
        this.roughness = 1;
        this.intensity = 0;
        this.emissPath = "";
        this.emiss = true;
        this.emissInt = 0;
        this.textPath = "";
        this.type = "PBR";
        this.color = new schema_1.ArraySchema("1", "1", "1", "1");
        this.emissColor = new schema_1.ArraySchema("1", "1", "1", "1");
    }
}
exports.MaterialComponent = MaterialComponent;
__decorate([
    (0, schema_1.type)("boolean")
], MaterialComponent.prototype, "shadows", void 0);
__decorate([
    (0, schema_1.type)("number")
], MaterialComponent.prototype, "metallic", void 0);
__decorate([
    (0, schema_1.type)("number")
], MaterialComponent.prototype, "roughness", void 0);
__decorate([
    (0, schema_1.type)("number")
], MaterialComponent.prototype, "intensity", void 0);
__decorate([
    (0, schema_1.type)("string")
], MaterialComponent.prototype, "emissPath", void 0);
__decorate([
    (0, schema_1.type)("boolean")
], MaterialComponent.prototype, "emiss", void 0);
__decorate([
    (0, schema_1.type)('number')
], MaterialComponent.prototype, "emissInt", void 0);
__decorate([
    (0, schema_1.type)("string")
], MaterialComponent.prototype, "textPath", void 0);
__decorate([
    (0, schema_1.type)("string")
], MaterialComponent.prototype, "type", void 0);
__decorate([
    (0, schema_1.type)(['string'])
], MaterialComponent.prototype, "color", void 0);
__decorate([
    (0, schema_1.type)(['string'])
], MaterialComponent.prototype, "emissColor", void 0);
class VisibilityComponent extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.visible = true;
    }
}
exports.VisibilityComponent = VisibilityComponent;
__decorate([
    (0, schema_1.type)("boolean")
], VisibilityComponent.prototype, "visible", void 0);
class ImageComponent extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.url = "";
    }
}
exports.ImageComponent = ImageComponent;
__decorate([
    (0, schema_1.type)("string")
], ImageComponent.prototype, "url", void 0);
class NFTComponent extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.contract = "0xf23e1aa97de9ca4fb76d2fa3fafcf4414b2afed0";
        this.tokenId = "1";
        this.chain = "eth";
        this.style = 22;
    }
}
exports.NFTComponent = NFTComponent;
__decorate([
    (0, schema_1.type)("string")
], NFTComponent.prototype, "contract", void 0);
__decorate([
    (0, schema_1.type)("string")
], NFTComponent.prototype, "tokenId", void 0);
__decorate([
    (0, schema_1.type)("string")
], NFTComponent.prototype, "chain", void 0);
__decorate([
    (0, schema_1.type)("number")
], NFTComponent.prototype, "style", void 0);
class VideoComponent extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.url = "";
        this.volume = .5;
        this.autostart = true;
        this.loop = false;
    }
}
exports.VideoComponent = VideoComponent;
__decorate([
    (0, schema_1.type)("string")
], VideoComponent.prototype, "url", void 0);
__decorate([
    (0, schema_1.type)("number")
], VideoComponent.prototype, "volume", void 0);
__decorate([
    (0, schema_1.type)("boolean")
], VideoComponent.prototype, "autostart", void 0);
__decorate([
    (0, schema_1.type)("boolean")
], VideoComponent.prototype, "loop", void 0);
class AudioComponent extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.url = "";
        this.volume = .5;
        this.autostart = true;
        this.loop = false;
        this.attachedPlayer = false;
    }
}
exports.AudioComponent = AudioComponent;
__decorate([
    (0, schema_1.type)("string")
], AudioComponent.prototype, "url", void 0);
__decorate([
    (0, schema_1.type)("number")
], AudioComponent.prototype, "volume", void 0);
__decorate([
    (0, schema_1.type)("boolean")
], AudioComponent.prototype, "autostart", void 0);
__decorate([
    (0, schema_1.type)("boolean")
], AudioComponent.prototype, "loop", void 0);
__decorate([
    (0, schema_1.type)("boolean")
], AudioComponent.prototype, "attachedPlayer", void 0);
class TextComponent extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.text = "Text";
        this.font = 2;
        this.align = 4;
        this.fontSize = 1;
        this.outlineWidth = 0;
        this.outlineColor = new Color4(1, 1, 1, 1);
        this.color = new Color4(1, 1, 1, 1);
    }
}
exports.TextComponent = TextComponent;
__decorate([
    (0, schema_1.type)("string")
], TextComponent.prototype, "text", void 0);
__decorate([
    (0, schema_1.type)("number")
], TextComponent.prototype, "font", void 0);
__decorate([
    (0, schema_1.type)("number")
], TextComponent.prototype, "align", void 0);
__decorate([
    (0, schema_1.type)("number")
], TextComponent.prototype, "fontSize", void 0);
__decorate([
    (0, schema_1.type)("number")
], TextComponent.prototype, "outlineWidth", void 0);
__decorate([
    (0, schema_1.type)(Color4)
], TextComponent.prototype, "outlineColor", void 0);
__decorate([
    (0, schema_1.type)(Color4)
], TextComponent.prototype, "color", void 0);
class Actions extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.name = "Open Link";
        this.entity = -500;
        this.url = "https://decentraland.org/play";
        this.type = "open_link";
        this.hoverText = "Click here";
    }
}
exports.Actions = Actions;
__decorate([
    (0, schema_1.type)("string")
], Actions.prototype, "name", void 0);
__decorate([
    (0, schema_1.type)("number")
], Actions.prototype, "entity", void 0);
__decorate([
    (0, schema_1.type)("string")
], Actions.prototype, "url", void 0);
__decorate([
    (0, schema_1.type)("string")
], Actions.prototype, "type", void 0);
__decorate([
    (0, schema_1.type)("string")
], Actions.prototype, "hoverText", void 0);
class ActionComponent extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.actions = new schema_1.MapSchema();
    }
}
exports.ActionComponent = ActionComponent;
__decorate([
    (0, schema_1.type)({ map: Actions })
], ActionComponent.prototype, "actions", void 0);
class Triggers extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.actions = new schema_1.MapSchema();
        this.type = "on_click";
    }
}
exports.Triggers = Triggers;
__decorate([
    (0, schema_1.type)({ map: Actions })
], Triggers.prototype, "actions", void 0);
__decorate([
    (0, schema_1.type)("string")
], Triggers.prototype, "type", void 0);
class TriggerComponent extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.enabled = false;
        this.triggers = new schema_1.ArraySchema();
    }
}
exports.TriggerComponent = TriggerComponent;
__decorate([
    (0, schema_1.type)("boolean")
], TriggerComponent.prototype, "enabled", void 0);
__decorate([
    (0, schema_1.type)([Triggers])
], TriggerComponent.prototype, "triggers", void 0);
function addNFTComponent(item, nft) {
    item.comps.push(types_1.COMPONENT_TYPES.NFT_COMPONENT);
    item.nftComp = new NFTComponent();
    if (nft !== null) {
        item.nftComp.chain = nft.chain;
        item.nftComp.contract = nft.contract;
        item.nftComp.tokenId = nft.tokenId;
        item.nftComp.style = nft.style;
    }
}
exports.addNFTComponent = addNFTComponent;
function addCollisionComponent(item, collision) {
    item.comps.push(types_1.COMPONENT_TYPES.COLLISION_COMPONENT);
    item.colComp = new CollisionComponent();
    if (collision) {
        item.colComp.iMask = collision.iMask;
        item.colComp.vMask = collision.vMask;
    }
}
exports.addCollisionComponent = addCollisionComponent;
function addVisibilityComponent(item, selectedVisibility) {
    item.comps.push(types_1.COMPONENT_TYPES.VISBILITY_COMPONENT);
    item.visComp = new VisibilityComponent();
    item.visComp.visible = selectedVisibility;
}
exports.addVisibilityComponent = addVisibilityComponent;
function addImageComponent(item, url) {
    item.comps.push(types_1.COMPONENT_TYPES.IMAGE_COMPONENT);
    item.imgComp = new ImageComponent();
    item.imgComp.url = url;
}
exports.addImageComponent = addImageComponent;
function addVideoComponent(item, data) {
    item.comps.push(types_1.COMPONENT_TYPES.VIDEO_COMPONENT);
    item.vidComp = new VideoComponent();
    if (data !== null) {
        item.vidComp.url = data.url;
        item.vidComp.autostart = data.autostart;
        item.vidComp.loop = data.loop;
        item.vidComp.volume = data.volume;
    }
}
exports.addVideoComponent = addVideoComponent;
function addAudioComponent(item, data) {
    item.comps.push(types_1.COMPONENT_TYPES.AUDIO_COMPONENT);
    item.audComp = new AudioComponent();
    if (data !== null) {
        item.audComp.url = data.url;
        item.audComp.autostart = data.autostart;
        item.audComp.loop = data.loop;
        item.audComp.volume = data.volume;
        item.audComp.attachedPlayer = data.attachedPlayer;
    }
}
exports.addAudioComponent = addAudioComponent;
function addMaterialComponent(item, data) {
    item.comps.push(types_1.COMPONENT_TYPES.MATERIAL_COMPONENT);
    item.matComp = new MaterialComponent();
    if (data !== null) {
        console.log('maerial component is not null');
    }
    // @type("boolean") shadows: boolean = true
    // @type("number") metallic: number = 0
    // @type("number") roughness: number = 1
    // @type("number") intensity: number = 0
    // @type("string") emissPath: string = ""
    // @type('number') emissInt: number = 0
    // @type("string") textPath: string = ""
    // @type("string") type: string = "pbr"
}
exports.addMaterialComponent = addMaterialComponent;
function addTextComponent(item, textComp) {
    item.comps.push(types_1.COMPONENT_TYPES.TEXT_COMPONENT);
    item.textComp = new TextComponent();
    if (textComp) {
        item.textComp.text = textComp.text;
        item.textComp.font = textComp.font;
        item.textComp.fontSize = textComp.fontSize;
        item.textComp.color = new Color4();
        item.textComp.color.r = textComp.color.r;
        item.textComp.color.g = textComp.color.g;
        item.textComp.color.b = textComp.color.b;
        item.textComp.color.a = textComp.color.a;
        item.textComp.align = textComp.align;
        item.textComp.outlineWidth = textComp.outlineWidth;
        item.textComp.outlineColor = textComp.outlineColor;
    }
}
exports.addTextComponent = addTextComponent;
function addTriggerComponent(item, trigComp) {
    item.comps.push(types_1.COMPONENT_TYPES.TRIGGER_COMPONENT);
    item.trigComp = new TriggerComponent();
    if (trigComp) {
        item.trigComp.enabled = trigComp.enabled;
        trigComp.triggers.forEach((trigger) => {
            item.trigComp.triggers.push(trigger);
        });
    }
}
exports.addTriggerComponent = addTriggerComponent;
function addActionComponent(item, actComp) {
    item.comps.push(types_1.COMPONENT_TYPES.ACTION_COMPONENT);
    item.actComp = new ActionComponent();
    if (actComp) {
        actComp.actions.forEach((action, key) => {
            item.actComp.actions.set(key, action);
        });
    }
}
exports.addActionComponent = addActionComponent;
// export function addClickComponent(item:SceneItem, clickComp:ClickComponent){
//     item.comps.push(COMPONENT_TYPES.CLICK_COMPONENT)
//     item.clickComp = new ClickComponent()
//     if(clickComp){
//         item.clickComp.url = clickComp.url
//         item.clickComp.type = clickComp.type
//         item.clickComp.enabled = clickComp.enabled
//         item.clickComp.hoverText = clickComp.hoverText
//     }
// }
