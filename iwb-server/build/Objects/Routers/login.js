"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginRouter = void 0;
const jwt = __importStar(require("jsonwebtoken"));
const dcl = __importStar(require("decentraland-crypto-middleware"));
function loginRouter(router) {
    router.post('/login', dcl.express({}), (req, res) => {
        const address = req.auth;
        const metadata = req.authMetadata;
        console.log('user info', address, metadata);
        //Create and sign jwt
        let token;
        try {
            token = jwt.sign({
                userId: address,
                realm: metadata.realm.serverName,
                origin: metadata.origin
            }, process.env.SERVER_SECRET, { expiresIn: "6h" });
        }
        catch (err) {
            console.log(err);
            const error = new Error("Error! Something went wrong.");
            return res.status(500).json({ message: error.message });
        }
        res
            .status(200)
            .json({
            success: true,
            data: {
                userId: address,
                token: token,
            },
        });
    });
}
exports.loginRouter = loginRouter;
