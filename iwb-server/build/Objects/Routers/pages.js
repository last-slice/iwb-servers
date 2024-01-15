"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pagesRouter = void 0;
const path_1 = __importDefault(require("path"));
function pagesRouter(router) {
    router.get('/:user/:key', (req, res) => {
        console.log('load asset creator page');
        res.sendFile(path_1.default.join(__dirname, '..', '..', '..', 'public', 'index.html'));
    });
}
exports.pagesRouter = pagesRouter;
