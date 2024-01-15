"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchPlayfabFile = exports.fetchUserMetaData = exports.playfabLogin = exports.fetchPlayfabMetadata = exports.abortFileUploads = exports.finalizeUploadFiles = exports.uploadPlayerFiles = exports.initializeUploadPlayerFiles = exports.getLeaderboard = exports.executeCloudScript = exports.getAllPlayers = exports.updatePlayerInternalData = exports.updatePlayerDisplayName = exports.getPlayerInternalData = exports.getPlayerData = exports.updatePlayerData = exports.playerLogin = exports.UpdateCatalogItems = exports.setCatalogItems = exports.getCatalogItems = exports.setTitleData = exports.getTitleData = exports.getEnemies = exports.getItem = exports.updatePlayerItem = exports.addItem = exports.revokeUserItem = exports.consumeItem = exports.updateItemUses = exports.grantUserItem = exports.incrementPlayerStatistic = exports.getPlayerStatistics = exports.updatePlayerStatistic = exports.updatePlayerStatisticDefinition = exports.addEvent = exports.getDropTables = exports.getRandomItemFromDropTable = exports.initPlayFab = exports.PLAYFAB_DATA_ACCOUNT = exports.PlayfabKey = exports.PlayfabId = void 0;
const axios_1 = __importDefault(require("axios"));
const playfab_sdk_1 = require("playfab-sdk");
const config_1 = require("./config");
exports.PlayfabId = config_1.DEBUG ? process.env.PLAYFAB_ID_QA : process.env.PLAYFAB_ID;
exports.PlayfabKey = config_1.DEBUG ? process.env.PLAYFAB_KEY_QA : process.env.PLAYFAB_KEY;
exports.PLAYFAB_DATA_ACCOUNT = process.env.PLAYFAB_DATA_ACCOUNT;
function initPlayFab() {
    playfab_sdk_1.PlayFabServer.settings.titleId = exports.PlayfabId;
    playfab_sdk_1.PlayFabServer.settings.developerSecretKey = exports.PlayfabKey;
    playfab_sdk_1.PlayFabAdmin.settings.titleId = exports.PlayfabId;
    playfab_sdk_1.PlayFabAdmin.settings.developerSecretKey = exports.PlayfabKey;
}
exports.initPlayFab = initPlayFab;
const c = (resolve, reject) => {
    //return (result:any,error:any) => {
    return (error, result) => {
        if (error) {
            console.log("PlayFab Error", error);
            console.log("PlayFab Result", result);
            reject(error);
        }
        else {
            resolve(result.data);
        }
    };
};
const getRandomItemFromDropTable = (request) => {
    return new Promise((resolve, reject) => {
        playfab_sdk_1.PlayFabServer.EvaluateRandomResultTable(request, c(resolve, reject));
    });
};
exports.getRandomItemFromDropTable = getRandomItemFromDropTable;
const getDropTables = (request) => {
    return new Promise((resolve, reject) => {
        playfab_sdk_1.PlayFabServer.GetRandomResultTables(request, c(resolve, reject));
    });
};
exports.getDropTables = getDropTables;
const addEvent = (request) => {
    return new Promise((resolve, reject) => {
        playfab_sdk_1.PlayFabServer.WritePlayerEvent(request, c(resolve, reject));
    });
};
exports.addEvent = addEvent;
const updatePlayerStatisticDefinition = (request) => {
    return new Promise((resolve, reject) => {
        playfab_sdk_1.PlayFabAdmin.UpdatePlayerStatisticDefinition(request, c(resolve, reject));
    });
};
exports.updatePlayerStatisticDefinition = updatePlayerStatisticDefinition;
const updatePlayerStatistic = (request) => {
    return new Promise((resolve, reject) => {
        playfab_sdk_1.PlayFabServer.UpdatePlayerStatistics(request, c(resolve, reject));
    });
};
exports.updatePlayerStatistic = updatePlayerStatistic;
const getPlayerStatistics = (request) => {
    return new Promise((resolve, reject) => {
        playfab_sdk_1.PlayFabServer.GetPlayerStatistics(request, c(resolve, reject));
    });
};
exports.getPlayerStatistics = getPlayerStatistics;
const incrementPlayerStatistic = (request) => {
    return new Promise((resolve, reject) => {
        playfab_sdk_1.PlayFabAdmin.IncrementPlayerStatisticVersion(request, c(resolve, reject));
    });
};
exports.incrementPlayerStatistic = incrementPlayerStatistic;
const grantUserItem = (request) => {
    return new Promise((resolve, reject) => {
        playfab_sdk_1.PlayFabServer.GrantItemsToUser(request, c(resolve, reject));
    });
};
exports.grantUserItem = grantUserItem;
const updateItemUses = (request) => {
    return new Promise((resolve, reject) => {
        playfab_sdk_1.PlayFabServer.ModifyItemUses(request, c(resolve, reject));
    });
};
exports.updateItemUses = updateItemUses;
const consumeItem = (request) => {
    return new Promise((resolve, reject) => {
        playfab_sdk_1.PlayFabClient.ConsumeItem(request, c(resolve, reject));
    });
};
exports.consumeItem = consumeItem;
const revokeUserItem = (request) => {
    return new Promise((resolve, reject) => {
        playfab_sdk_1.PlayFabServer.RevokeInventoryItem(request, c(resolve, reject));
    });
};
exports.revokeUserItem = revokeUserItem;
const addItem = (request) => {
    return new Promise((resolve, reject) => {
        playfab_sdk_1.PlayFabAdmin.UpdateCatalogItems(request, c(resolve, reject));
    });
};
exports.addItem = addItem;
const updatePlayerItem = (request) => {
    return new Promise((resolve, reject) => {
        playfab_sdk_1.PlayFabServer.UpdateUserInventoryItemCustomData(request, c(resolve, reject));
    });
};
exports.updatePlayerItem = updatePlayerItem;
const getItem = (request) => {
    return new Promise((resolve, reject) => {
        playfab_sdk_1.PlayFabServer.GetCatalogItems(request, c(resolve, reject));
    });
};
exports.getItem = getItem;
const getEnemies = (request) => {
    return new Promise((resolve, reject) => {
        playfab_sdk_1.PlayFabServer.GetCatalogItems(request, c(resolve, reject));
    });
};
exports.getEnemies = getEnemies;
const getTitleData = (request) => {
    return new Promise((resolve, reject) => {
        playfab_sdk_1.PlayFabServer.GetTitleData(request, c(resolve, reject));
    });
};
exports.getTitleData = getTitleData;
const setTitleData = (request) => {
    return new Promise((resolve, reject) => {
        playfab_sdk_1.PlayFabServer.SetTitleData(request, c(resolve, reject));
    });
};
exports.setTitleData = setTitleData;
const getCatalogItems = (request) => {
    return new Promise((resolve, reject) => {
        playfab_sdk_1.PlayFabServer.GetCatalogItems(request, c(resolve, reject));
    });
};
exports.getCatalogItems = getCatalogItems;
const setCatalogItems = (request) => {
    return new Promise((resolve, reject) => {
        playfab_sdk_1.PlayFabAdmin.SetCatalogItems(request, c(resolve, reject));
    });
};
exports.setCatalogItems = setCatalogItems;
const UpdateCatalogItems = (request) => {
    return new Promise((resolve, reject) => {
        playfab_sdk_1.PlayFabAdmin.UpdateCatalogItems(request, c(resolve, reject));
    });
};
exports.UpdateCatalogItems = UpdateCatalogItems;
const playerLogin = (request) => {
    return new Promise((resolve, reject) => {
        playfab_sdk_1.PlayFabServer.LoginWithServerCustomId(request, c(resolve, reject));
    });
};
exports.playerLogin = playerLogin;
const updatePlayerData = (request) => {
    return new Promise((resolve, reject) => {
        playfab_sdk_1.PlayFabServer.UpdateUserData(request, c(resolve, reject));
    });
};
exports.updatePlayerData = updatePlayerData;
const getPlayerData = (request) => {
    return new Promise((resolve, reject) => {
        playfab_sdk_1.PlayFabServer.GetUserData(request, c(resolve, reject));
    });
};
exports.getPlayerData = getPlayerData;
const getPlayerInternalData = (request) => {
    return new Promise((resolve, reject) => {
        playfab_sdk_1.PlayFabServer.GetUserInternalData(request, c(resolve, reject));
    });
};
exports.getPlayerInternalData = getPlayerInternalData;
const updatePlayerDisplayName = (request) => {
    return new Promise((resolve, reject) => {
        playfab_sdk_1.PlayFabAdmin.UpdateUserTitleDisplayName(request, c(resolve, reject));
    });
};
exports.updatePlayerDisplayName = updatePlayerDisplayName;
const updatePlayerInternalData = (request) => {
    return new Promise((resolve, reject) => {
        playfab_sdk_1.PlayFabServer.UpdateUserInternalData(request, c(resolve, reject));
    });
};
exports.updatePlayerInternalData = updatePlayerInternalData;
const getAllPlayers = (request) => {
    return new Promise((resolve, reject) => {
        playfab_sdk_1.PlayFabServer.GetPlayersInSegment(request, c(resolve, reject));
    });
};
exports.getAllPlayers = getAllPlayers;
const executeCloudScript = (request) => {
    return new Promise((resolve, reject) => {
        playfab_sdk_1.PlayFabServer.ExecuteCloudScript(request, c(resolve, reject));
    });
};
exports.executeCloudScript = executeCloudScript;
const getLeaderboard = (request) => {
    return new Promise((resolve, reject) => {
        playfab_sdk_1.PlayFabServer.GetLeaderboard(request, c(resolve, reject));
    });
};
exports.getLeaderboard = getLeaderboard;
const initializeUploadPlayerFiles = (entityToken, request) => {
    return new Promise((resolve, reject) => {
        axios_1.default.post("https://" + exports.PlayfabId + ".playfabapi.com/File/InitiateFileUploads", request, {
            headers: {
                'content-type': 'application/json',
                'X-EntityToken': entityToken
            }
        })
            .then(function (response) {
            resolve(response.data.data);
        })
            .catch(function (error) {
            reject(error);
        });
    });
};
exports.initializeUploadPlayerFiles = initializeUploadPlayerFiles;
const uploadPlayerFiles = (url, request) => {
    return new Promise((resolve, reject) => {
        axios_1.default.put(url, request, {
            headers: {
                'content-type': 'application/json'
            }
        })
            .then(function (response) {
            resolve(response.data.data);
        })
            .catch(function (error) {
            reject(error);
        });
    });
};
exports.uploadPlayerFiles = uploadPlayerFiles;
const finalizeUploadFiles = (entityToken, request) => {
    return new Promise((resolve, reject) => {
        axios_1.default.post("https://" + exports.PlayfabId + ".playfabapi.com/File/FinalizeFileUploads", request, {
            headers: {
                'content-type': 'application/json',
                'X-EntityToken': entityToken
            }
        })
            .then(function (response) {
            resolve(response.data.data);
        })
            .catch(function (error) {
            reject(error);
        });
    });
};
exports.finalizeUploadFiles = finalizeUploadFiles;
const abortFileUploads = (entityToken, request) => {
    return new Promise((resolve, reject) => {
        axios_1.default.post("https://" + exports.PlayfabId + ".playfabapi.com/File/AbortFileUploads", request, {
            headers: {
                'content-type': 'application/json',
                'X-EntityToken': entityToken
            }
        })
            .then(function (response) {
            resolve(response.data.data);
        })
            .catch(function (error) {
            reject(error);
        });
    });
};
exports.abortFileUploads = abortFileUploads;
async function fetchPlayfabMetadata(user) {
    try {
        let userData = await playfabLogin(user);
        return await fetchUserMetaData(userData);
    }
    catch (e) {
        console.log("error logging into playfab", e);
    }
}
exports.fetchPlayfabMetadata = fetchPlayfabMetadata;
async function playfabLogin(user) {
    try {
        const playfabInfo = await (0, exports.playerLogin)({
            CreateAccount: false,
            ServerCustomId: user,
            InfoRequestParameters: {
                "UserDataKeys": [], "UserReadOnlyDataKeys": [],
                "GetUserReadOnlyData": false,
                "GetUserInventory": false,
                "GetUserVirtualCurrency": true,
                "GetPlayerStatistics": false,
                "GetCharacterInventories": false,
                "GetCharacterList": false,
                "GetPlayerProfile": true,
                "GetTitleData": false,
                "GetUserAccountInfo": true,
                "GetUserData": false,
            }
        });
        if (playfabInfo.error) {
            console.log('playfab login error => ', playfabInfo.error);
            return null;
        }
        else {
            console.log('playfab login success, initiate realm');
            return playfabInfo;
        }
    }
    catch (e) {
        console.log('playfab connection error', e);
        return null;
    }
}
exports.playfabLogin = playfabLogin;
async function fetchUserMetaData(realmData) {
    try {
        let response = await axios_1.default.post("https://" + exports.PlayfabId + ".playfabapi.com/File/GetFiles", { Entity: { Id: realmData.EntityToken.Entity.Id, Type: realmData.EntityToken.Entity.Type } }, { headers: {
                'content-type': 'application/json',
                'X-EntityToken': realmData.EntityToken.EntityToken
            } });
        return response.data;
    }
    catch (e) {
        console.log('error fetching user metadata, maybe they dont have the file? ');
        return null;
    }
}
exports.fetchUserMetaData = fetchUserMetaData;
async function fetchPlayfabFile(metadata, fileKey) {
    if (metadata.code === 200) {
        let version = metadata.data.ProfileVersion;
        if (version > 0) {
            let data = metadata.data.Metadata;
            let count = 0;
            for (const key in data) {
                if (data.hasOwnProperty(key)) {
                    count++;
                }
            }
            if (count > 0) {
                if (data[fileKey]) {
                    let res = await fetch(data[fileKey].DownloadUrl);
                    let json = await res.json();
                    return json;
                }
                else {
                    return [];
                }
            }
            else {
                return [];
            }
        }
        else {
            console.log('no profile');
            return [];
        }
    }
    else {
        return [];
    }
}
exports.fetchPlayfabFile = fetchPlayfabFile;
