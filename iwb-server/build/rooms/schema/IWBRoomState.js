"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IWBRoomState = void 0;
const schema_1 = require("@colyseus/schema");
const Player_1 = require("../../Objects/Player");
const Scene_1 = require("../../Objects/Scene");
class IWBRoomState extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.cv = 0;
        this.realmAssets = new Map();
        this.occupiedParcels = new schema_1.ArraySchema();
        this.temporaryParcels = new schema_1.ArraySchema();
        this.scenes = new schema_1.MapSchema();
        this.players = new schema_1.MapSchema();
    }
}
exports.IWBRoomState = IWBRoomState;
__decorate([
    (0, schema_1.type)("string")
], IWBRoomState.prototype, "world", void 0);
__decorate([
    (0, schema_1.type)(Scene_1.TempScene)
], IWBRoomState.prototype, "tempScene", void 0);
__decorate([
    (0, schema_1.type)(["string"])
], IWBRoomState.prototype, "occupiedParcels", void 0);
__decorate([
    (0, schema_1.type)(["string"])
], IWBRoomState.prototype, "temporaryParcels", void 0);
__decorate([
    (0, schema_1.type)({ map: Scene_1.Scene })
], IWBRoomState.prototype, "scenes", void 0);
__decorate([
    (0, schema_1.type)({ map: Player_1.Player })
], IWBRoomState.prototype, "players", void 0);
