import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Scene } from "./Scene";
import { ACTIONS, COMPONENT_TYPES, SERVER_MESSAGE_TYPES } from "../utils/types";
import { IWBRoom } from "../rooms/IWBRoom";
import { Client } from "colyseus";
import { getRandomIntInclusive, moveArrayItem } from "../utils/functions";

let audiusServers:any[] = []
let audiusServer:string = ""
let initAudiusServers = false
let APP_NAME = 'iwb-back-end-audius-player'

export class PlaylistComponent extends Schema{
    @type("number") type:number = -500 // 0 - images, 1 - video, 2 - audio, 3 - audius
    @type("number") volume:number
    @type("number") slideTime:number
    @type("number") playtype:number = 0 //0 - in order, 1 - shuffle
    @type("number") current:number
    @type("number") currentKeyframe:number
    @type(["string"]) meshAids:ArraySchema<string> = new ArraySchema()
    @type(["string"]) playlist:ArraySchema<string> = new ArraySchema()
    @type("string") audiusId:string
    @type("string") audiusName:string
    @type("string") audiusTrack:string
    audiusTrackDuration:string

    player:any
    lastTick:number = 0
    currentTick:number = 1
}

export function createPlaylistComponent(scene:Scene, aid:string, data?:any){
    let component:any = new PlaylistComponent()
    if(data){
        for(let key in data){
            if(key === "playlist" || key === "meshAids"){
                data[key].forEach((item:any)=>{
                    component[key].push(item)
                })
            }
            else{
                component[key] = data[key]
            }
        }
    }
    scene[COMPONENT_TYPES.PLAYLIST_COMPONENT].set(aid, component)
}

export function editPlaylistComponent(info:any, scene:Scene){
    let itemInfo = scene[COMPONENT_TYPES.PLAYLIST_COMPONENT].get(info.aid)
    if(!itemInfo){
        console.log('incorrect item info', info)
        return
    }

    switch(info.action){
        case 'addmesh':
            console.log('updating mesh list with new mesh')
            itemInfo.meshAids.push(info.meshAid)
            break;

        case 'deletemesh':
            console.log('deleting mesh', info)
            let index = itemInfo.meshAids.findIndex(($:any)=> $ === info.meshAid)
                if(index >= 0){
                    itemInfo.meshAids.splice(index,1)
                }
            break;

        case 'setaudiusplaylist':
            itemInfo.audiusName = info.data.name
            itemInfo.audiusId = info.data.id
            break;

        case 'type':
            itemInfo.type = info.data
            if(itemInfo.type === 0){
                itemInfo.slideTime = 5
            }
            break;

        case 'playmode':
            itemInfo.playtype = info.data
            break;

        case 'slidetime':
            itemInfo.slideTime = info.data
            break;

        case 'playmode':
            itemInfo.playtype = info.data
            break;

        case 'edit':
            break;

        case 'additem':
            itemInfo.playlist.push(info.data)
            break;

        case 'remove':
            itemInfo.playlist.splice(info.data,1)
        break;

        case 'reorder':
            switch(info.type){
                case 'up':
                    if(info.data - 1 >= 0){
                        itemInfo.playlist = moveArrayItem(itemInfo.playlist, info.data, info.data - 1)
                    }
                    break;

                case 'down':
                    if(info.data + 1 <= itemInfo.playlist.length){
                        itemInfo.playlist = moveArrayItem(itemInfo.playlist, info.data, info.data + 1)
                    }
                    break;
            }
            break;

        case 'volume':
            itemInfo.volume = info.data
            break;
    }
}

export function handlePlaylistAction(room:IWBRoom, client:Client, scene:Scene, info:any){
    console.log('handling playlist action', info)

    let playlistInfo:PlaylistComponent = scene[COMPONENT_TYPES.PLAYLIST_COMPONENT].get(info.action.playlistAid)
    if(!playlistInfo){
        return
    }

    if(playlistInfo.lastTick === playlistInfo.currentTick){
        return
    }

    playlistInfo.lastTick = playlistInfo.currentTick

    switch(info.type){
        case ACTIONS.STOP_PLAYLIST:
         stopPlaylist(playlistInfo)
            break;

        case ACTIONS.SEEK_PLAYLIST:
            switch(playlistInfo.type){
                case 0: //images
                seekImagePlaylist(room, client, scene, playlistInfo, info)
                break;

                case 1: //videos
                break;

                case 2: //audio
                break;

                case 3: //audius
                seekAudiusPlaylist(room, client, scene, playlistInfo, info)
                break;
            }

            break;

        case ACTIONS.PLAY_PLAYLIST:
            switch(playlistInfo.type){
                case 0: //images
                seekImagePlaylist(room, client, scene, playlistInfo, info, true)
                break;

                case 1: //videos
                break;

                case 2: //audio
                break;

                case 3: //audius
                seekAudiusPlaylist(room, client, scene, playlistInfo, info)
                break;
            }

            break;
    }
}

export function garbageCollectPlaylist(room:IWBRoom){
    room.state.scenes.forEach((scene:Scene)=>{
        scene[COMPONENT_TYPES.PLAYLIST_COMPONENT].forEach((playlist:PlaylistComponent, aid:string)=>{
            stopPlaylist(playlist)
        })
    })
}

export function stopAllPlaylist(scene:Scene){
    console.log('ending all playlists')
    scene[COMPONENT_TYPES.PLAYLIST_COMPONENT].forEach((playlistComponent:PlaylistComponent)=>{
        stopPlaylist(playlistComponent, true)
    })
}

export function stopPlaylist(playlist:PlaylistComponent, reset?:boolean){
    clearTimeout(playlist.player)
    if(reset){
        playlist.current = -1
    }
    
    playlist.lastTick--
    playlist.currentKeyframe = -1
}

function seekImagePlaylist(room:IWBRoom, client:Client, scene:Scene, pInfo:any, info:any, reset?:boolean){
    let playlistInfo = scene[COMPONENT_TYPES.PLAYLIST_COMPONENT].get(info.action.playlistAid)
    if(!playlistInfo){
        return
    }

    if(reset){
        playlistInfo.current = -1
    }

    playlistInfo.current += 1
    let currentSlide = (playlistInfo.playtype === 0 ? (playlistInfo.current >= playlistInfo.playlist.length ? 0 : playlistInfo.current) : getRandomIntInclusive(0, playlistInfo.playlist.length - 1))
    playlistInfo.current = currentSlide
    console.log('seeking playlist, playing', playlistInfo.current)
    room.broadcast(SERVER_MESSAGE_TYPES.SCENE_ACTION, {
        action:ACTIONS.PLAY_PLAYLIST,
        sceneId:scene.id,
        type:'live-action',
        aid:info.aid,
        currentSlide:playlistInfo.current,
        actionId:info.actionId,
        forceScene:info.forceScene
    })
    playlistInfo.player = setTimeout(()=>{
        clearTimeout(playlistInfo.player)
        console.log('finished slide')
        seekImagePlaylist(room, client, scene, playlistInfo, info)
    }, 1000 * playlistInfo.slideTime)
}

async function seekAudiusPlaylist(room:IWBRoom, client:Client, scene:Scene, playlistInfo:any, actionInfo:any){
    stopPlaylist(playlistInfo, actionInfo.reset)
    playlistInfo.current += 1

    if(!initAudiusServers){
        initAudiusServers = true
          await getServers()
          audiusServer = audiusServers[getRandomIntInclusive(0, audiusServers.length -1)]
    }
      
    let audiusPlaylist = await fetch(audiusServer + "/v1/playlists/" + playlistInfo.audiusId + "/tracks?app_name=" + APP_NAME)
    let json = await audiusPlaylist.json()
    if(json && json.data && json.data.length > 0){

        if(actionInfo.channel && actionInfo.channel === 1){
            console.log('run multiplayer action')
                    //multiplayer action, update the playlist track to sync with everyone in scene
        // if()
        // let trackToPlay = json.data[playlistInfo.current]
        // if(trackToPlay){
        //     playlistInfo.audiusTrack = trackToPlay.id
        // }
        }else{
            console.log('run single player acttion for audius playlist', playlistInfo.current)
            if(playlistInfo.current > json.data.length - 1){
                playlistInfo.current = 0
            }

            let trackToPlay = json.data[playlistInfo.current]
            if(trackToPlay){
                actionInfo.track = trackToPlay.id
                actionInfo.duration = trackToPlay.duration
                client.send(SERVER_MESSAGE_TYPES.PLAY_AUDIUS_TRACK, actionInfo)
            }
        }
    }

    // room.broadcast(SERVER_MESSAGE_TYPES.SCENE_ACTION, {
    //     action:ACTIONS.PLAY_PLAYLIST,
    //     sceneId:scene.id,
    //     type:playlistInfo.type,
    //     currentSlide:currentSlide,
    //     meshAid:meshAid
    // })
}

export async function getServers(){
    try{    
        let res = await fetch("https://api.audius.co/")
        let json = await res.json()

      console.log('init player json is', json)
      if(json.data){
        audiusServers = json.data
      }
    }
      catch(e){
        console.log('error getting servers', e)
      }
}