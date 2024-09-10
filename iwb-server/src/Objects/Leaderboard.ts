import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Scene } from "./Scene";
import { COMPONENT_TYPES, SERVER_MESSAGE_TYPES } from "../utils/types";
import { IWBRoom } from "../rooms/IWBRoom";
import { GameComponent } from "./Game";

export class LeaderboardComponent extends Schema{
    @type("number") type:number = -1  //0 - 3d, 1 - ui 
    @type("number") variableType:number = 0 //0 - game variable
    @type("number") order:number = 0 //0 - descending, 1 - ascending
    @type("number") topAmount:number = 10
    @type("number") fontSize:number = 3
    @type("number") fontStyle:number = 0 //0 - sdk, 1 - custom
    @type("string") gameId:string
    @type("string") variable:string

    data:any
    entities:any
}

export function editLeaderboardComponent(info:any, scene:Scene){
    let leaderboardInfo:any = scene[COMPONENT_TYPES.LEADERBOARD_COMPONENT].get(info.aid)
    if(!leaderboardInfo){
        console.log("leaderboard doesnt exist")
        return
    }

    switch(info.action){
        case 'choose':
            leaderboardInfo.type = info.data
            break;

        case 'edit':
            leaderboardInfo[info.type] = info.data
            break;
    }
}

export function createLeaderboardComponent(scene:Scene, aid:string, data?:any){
    let component:any = new LeaderboardComponent()
    if(data){
        for(let key in data){
            component[key] = data[key]
        }
    }

    if(data.type){

    }

    scene[COMPONENT_TYPES.LEADERBOARD_COMPONENT].set(aid, component)
}

export function refreshLeaderboards(room:IWBRoom){
    room.state.scenes.forEach((scene:Scene, aid:string)=>{
        let gameAid:any
        let gameInfo:any

        scene[COMPONENT_TYPES.GAME_COMPONENT].forEach((game:GameComponent, aid:string)=>{
            gameAid = aid
            gameInfo = game
        })

        scene[COMPONENT_TYPES.LEADERBOARD_COMPONENT].forEach((leaderboard:LeaderboardComponent, aid:string)=>{
            if(leaderboard.type >= 0 && leaderboard.variableType >= 0 && leaderboard.variable){
                let leaderboardData:any
                switch(leaderboard.variableType){
                    case 0:
                        console.log('refresh game variable leaderboard')
                        leaderboardData = getTopPlayersByDataPoint(gameInfo.gameData, leaderboard.variable, leaderboard.topAmount, leaderboard.order)
                        console.log('leaderboard data is', leaderboardData)
                        room.broadcast(SERVER_MESSAGE_TYPES.LEADERBOARD_UPDATE, {sceneId:scene.id, aid:aid, data:leaderboardData})
                        break;
            
                    default:
                        break;
                }
            }
        })
    })
}

// Function to retrieve top 10 players by a specific data point (e.g., coins, score, level)
function getTopPlayersByDataPoint(gameData:any, dataPoint:any, amount:number, order:number) {
    // Convert the player data object into an array of { playerName, dataPoint }
    const playersArray = Object.entries(gameData).map(([name, data]:any) => {
      return { name:data['name'], value: data[dataPoint] };
    });

    let sortedPlayers:any

    if(order === 0){
        sortedPlayers = playersArray.sort((a, b) => b.value - a.value);
    }else{
        sortedPlayers = playersArray.sort((a, b) => a.value - b.value);
    }
    return sortedPlayers.slice(0, amount);
  }