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
exports.handlBulkWorldsDeployments = exports.handleWorldDeployment = exports.updateCatalogAssets = exports.updateIWBVersion = exports.authenticateToken = exports.handleNewAssetData = exports.handleAssetUploaderSigning = void 0;
const jwt = __importStar(require("jsonwebtoken"));
const app_config_1 = require("../app.config");
function handleAssetUploaderSigning(req, res) {
    if (req.body.user && req.header('Authorization') && req.header('AssetAuth')) {
        const assetAuth = req.header('AssetAuth').replace('Bearer ', '').trim();
        const sceneToken = req.header('Authorization').replace('Bearer ', '').trim();
        if (!sceneToken || !assetAuth) {
            console.log('scene or asset token invalid');
            return res.status(200).json({ valid: false, message: 'Unauthorized' });
        }
        if (assetAuth !== process.env.IWB_UPLOAD_AUTH_KEY) {
            console.log('asset auth invalid');
            return res.status(200).json({ valid: false, message: 'Unauthorized' });
        }
        let token;
        token = jwt.sign({
            user: req.body.user,
            auth: assetAuth,
            key: sceneToken
        }, process.env.SERVER_SECRET, { expiresIn: "6h" });
        console.log('asset upload token is', token);
        res.status(200).send({ valid: true, token: token });
    }
    else {
        res.status(200).send({ valid: false, token: false });
    }
}
exports.handleAssetUploaderSigning = handleAssetUploaderSigning;
function handleNewAssetData(req, res) {
    if (req.body.user && req.header('Authorization') && req.header('AssetAuth')) {
        const assetAuth = req.header('AssetAuth').replace('Bearer ', '').trim();
        const sceneToken = req.header('Authorization').replace('Bearer ', '').trim();
        if (!sceneToken || !assetAuth) {
            console.log('no scene or asset token');
            return res.status(200).json({ valid: false, message: 'Unauthorized' });
        }
        if (assetAuth !== process.env.IWB_UPLOAD_AUTH_KEY) {
            console.log('invalid asset auth key');
            return res.status(200).json({ valid: false, message: 'Unauthorized' });
        }
        jwt.verify(sceneToken, process.env.SERVER_SECRET, (err, user) => {
            if (err) {
                console.log('error validating scene upload token for user', req.body.user);
                return res.status(200).json({ valid: false, message: 'Invalid token' });
            }
            console.log('new asset signature verified, need to store data in playfab');
            res.status(200).send({ valid: true });
            app_config_1.itemManager.saveNewAsset(req.body.user, req.body);
        });
    }
    else {
        console.log('invalue body and user');
        res.status(200).send({ valid: false, token: false });
    }
}
exports.handleNewAssetData = handleNewAssetData;
function authenticateToken(req, res, next) {
    const token = req.header('Authorization');
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    jwt.verify(token, process.env.SERVER_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        console.log('user is', user);
        req.user = user;
        next();
    });
}
exports.authenticateToken = authenticateToken;
function updateIWBVersion(req, res, manual) {
    if (req.header('AssetAuth')) {
        const assetAuth = req.header('AssetAuth').replace('Bearer ', '').trim();
        if (!assetAuth) {
            console.log('no scene or asset token');
            return res.status(200).json({ valid: false, message: 'Unauthorized' });
        }
        if (assetAuth !== process.env.IWB_UPLOAD_AUTH_KEY) {
            console.log('invalid asset auth key');
            return res.status(200).json({ valid: false, message: 'Unauthorized' });
        }
        app_config_1.iwbManager.incrementVersion(manual ? req.body.updates : undefined);
        if (manual) { }
        else {
            app_config_1.itemManager.notifyUsersDeploymentReady();
        }
        res.status(200).send({ valid: true });
    }
    else {
        res.status(200).send({ valid: false, token: false });
    }
}
exports.updateIWBVersion = updateIWBVersion;
async function updateCatalogAssets(req, res) {
    if (req.body.assets && req.header('Authorization')) {
        const authtoken = req.header('Authorization').replace('Bearer ', '').trim();
        if (!authtoken) {
            console.log('no scene or asset token');
            return res.status(200).json({ valid: false, message: 'Unauthorized' });
        }
        if (authtoken !== process.env.IWB_UPLOAD_AUTH_KEY) {
            console.log('invalid asset auth key');
            return res.status(200).json({ valid: false, message: 'Unauthorized' });
        }
        res.status(200).send({ valid: true });
        await app_config_1.itemManager.saveNewCatalogAssets(req.body.assets);
    }
    else {
        res.status(200).send({ valid: false, token: false });
    }
}
exports.updateCatalogAssets = updateCatalogAssets;
function handleWorldDeployment(req, res) {
    if (req.body.auth !== process.env.IWB_UPLOAD_AUTH_KEY) {
        console.log('invalid asset auth key');
        return res.status(200).json({ valid: false, message: 'Unauthorized' });
    }
    else {
        res.status(200).send({ valid: true });
        app_config_1.iwbManager.saveNewWorld(req.body.world);
    }
}
exports.handleWorldDeployment = handleWorldDeployment;
function handlBulkWorldsDeployments(req, res) {
    if (req.params.auth !== process.env.IWB_UPLOAD_AUTH_KEY) {
        console.log('invalid asset auth key');
        return res.status(200).json({ valid: false, message: 'Unauthorized' });
    }
    else {
        res.status(200).send({ valid: true });
        app_config_1.iwbManager.updateAllWorlds();
    }
}
exports.handlBulkWorldsDeployments = handlBulkWorldsDeployments;
