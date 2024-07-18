import { iwbManager } from "../app.config"
import { GameComponent, TeamComponent } from "../Objects/Game"
import { Player } from "../Objects/Player"
import { Scene } from "../Objects/Scene"
import { getRandomIntInclusive } from "../utils/functions"
import { pushPlayfabEvent, PLAYFAB_DATA_ACCOUNT } from "../utils/Playfab"
import { COMPONENT_TYPES, PLAYER_GAME_STATUSES, SERVER_MESSAGE_TYPES } from "../utils/types"
import { IWBRoom } from "./IWBRoom"

export class GameManager {

    scene:Scene
    aid:string
    room:IWBRoom

    countdownTimer:any
    countdownInterval:any
    countdownBase:number = 10
    countdownTime:number = this.countdownBase

    gameTimeBase:number = 60
    gameResetTimeBase:number = 12

    haveMinPlayers:boolean = false

    constructor(scene:Scene, aid:string){
        this.scene = scene
        this.aid = aid
        this.room = iwbManager.rooms.find(($:any)=>$.roomId === scene.roomId)
    }
    
    garbageCollect(){
        console.log('garbage collecting game manager')
        this.clearCountdown()
    }

    removePlayer(player:Player){
        let gaming:GameComponent = this.scene[COMPONENT_TYPES.GAME_COMPONENT].get(this.aid)
        if(!gaming){
            return
        }

        if(gaming.started){
            //do other player removal things
            // this.checkRemainingPlayers()
        }
    }

    checkRemainingPlayers(){
        let playing = 0

        //check how many players still left before auto end

        if(playing === 0){
            this.endGame()
        }
    }

    checkMultiplayerReady(){
        let gaming = this.scene[COMPONENT_TYPES.GAME_COMPONENT].get(this.aid)
        if(gaming.teams && gaming.teams.size >= gaming.minTeams && !gaming.startingSoon){
            console.log('we have minimum team size, continue game is ready to go')
            if(this.haveMinPlayers){
                this.clearCountdown()
                gaming.gameCountdown = -500
            }else{
                this.haveMinPlayers = true
            }

            gaming.gameCountdown = 10
            this.countdownInterval = setInterval(()=>{
                gaming.gameCountdown--
              }, 1000)

            this.countdownTimer = setTimeout(()=>{
                this.clearCountdown()

                gaming.startingSoon = true
                this.startGameCountdown()
              }, 1000 * 10)

        }else{
            console.log('havent reached minimum team size to start game, do nothing')
        }

        // if(gaming.pods.filter(pod => pod.locked).length >= this.minPlayers && !gaming.startingSoon){
        //     console.log("we have minimum players, begin game")
            
        //     if(this.haveMinPlayers){
        //         this.clearCountdown()4
        //         gaming.gameCountdown = -500
        //     }else{
        //         this.haveMinPlayers = true
        //     }

        //     gaming.gameCountdown = 10
        //     this.countdownInterval = setInterval(()=>{
        //         gaming.gameCountdown--
        //       }, 1000)

        //     this.countdownTimer = setTimeout(()=>{
        //         this.clearCountdown()

        //         gaming.startingSoon = true
        //         this.startGameCountdown()
        //       }, 1000 * 10)
        // }
    }

    clearCountdown(){
        clearTimeout(this.countdownTimer)
        clearInterval(this.countdownInterval)
    }

    startGameCountdown(){
        let gaming:GameComponent = this.scene[COMPONENT_TYPES.GAME_COMPONENT].get(this.aid)
        if(!gaming){
            return
        }

        gaming.gameCountdown = -500
        gaming.gameCountdown = this.countdownTime

        this.countdownTimer = setTimeout(()=>{
            gaming.gameCountdown = -500
            this.clearCountdown()
            this.startGame()
          }, 1000 * this.countdownTime)
            
          this.countdownInterval = setInterval(()=>{
            gaming.gameCountdown--
          }, 1000)
    }

    async startPlayer(userId:string) {
        // Simulate an asynchronous operation
        return new Promise(resolve => {
            let player = this.room.state.players.get(userId)
            if(player){
                player.gameStatus = PLAYER_GAME_STATUSES.PLAYING
            }
            resolve(userId);
        });
    }

    async startGame(){
        console.log('starting game')
        let gaming:GameComponent = this.scene[COMPONENT_TYPES.GAME_COMPONENT].get(this.aid)
        if(!gaming){
            return
        }

        const promises:any = [];
       

        for (const [key, team] of gaming.teams) {
            console.log(`Processing key: ${key}`);
            for(const mate of team.mates){
                promises.push(this.startPlayer(mate))
            }
        }

        await Promise.all(promises); // Wait for all promises to resolve
        
        // gaming.teams.forEach((teamComponent:TeamComponent, aid:string)=>{
        //     teamComponent.mates && teamComponent.mates.forEach((userId:string)=>{
        //         let player = this.room.state.players.get(userId)
        //         if(player){
        //             player.gameStatus = PLAYER_GAME_STATUSES.PLAYING
        //         }
        //     })
        // })
       
        gaming.reset = false
        gaming.ended = false
        gaming.started = true

        this.startForceEndTimer()
    }

    async endGame(){
        let gaming:GameComponent = this.scene[COMPONENT_TYPES.GAME_COMPONENT].get(this.aid)
        if(!gaming){
            return
        }
        gaming.ended = true
        this.clearCountdown()

        // gaming.players.forEach((player:Player)=>{
        //     player.playingGame = false
        //     // player.sendPlayerMessage(SERVER_MESSAGE_TYPES.PLAYER_SCORES, {pigs: pod.pigsFlown, targets: pod.targetsHit})
        //     // player.saveToDB()
        // })

        // pushPlayfabEvent(SERVER_MESSAGE_TYPES.END_GAME, PLAYFAB_DATA_ACCOUNT, {})

        await this.determineWinner()

        this.countdownTime = this.gameResetTimeBase
        this.countdownTimer = setTimeout(()=>{
            this.clearCountdown()
            this.resetGame()
          }, 1000 * this.countdownTime)

        console.log('game over')
    }

    determineWinner(){
        let gaming:GameComponent = this.scene[COMPONENT_TYPES.GAME_COMPONENT].get(this.aid)
        if(!gaming){
            return
        }

        let highscore = 0
        let winner = ""
        let winnerId = ""
        // gaming.pods.forEach((pod, i:number)=>{
        //     if(pod.locked){
        //         if(pod.score === highscore){
        //             winner = "tie"
        //             pushPlayfabEvent(SERVER_MESSAGE_TYPES.GAME_TIED, PLAYFAB_DATA_ACCOUNT, {})
        //         }else{
        //             if(pod.score > highscore){
        //                 highscore = pod.score
        //                 winner = pod.name
        //                 winnerId = pod.id
        //             }
        //         }
        //     }
        // })
        gaming.winner = winner
        gaming.winnerId = winnerId

        // if(winner !== "tie"){
        //     let player = gaming.players.get(winnerId)
        //     if(player && this.numPlayers > 1){
        //         player.increaseValueInMap(player.stats, SERVER_MESSAGE_TYPES.WIN_GAME, 1)
        //     }
        // }
    }

    resetPlayers(){
        // gaming.players.forEach((player)=>{
        //     //do player cleanup
        // })
    }

    resetGame(){
        this.resetPlayers()

        let gaming:GameComponent = this.scene[COMPONENT_TYPES.GAME_COMPONENT].get(this.aid)
        if(!gaming){
            return
        }

        // this.numPlayers = 0
        this.haveMinPlayers = false
        gaming.reset = true
        gaming.winner = ""
        gaming.winnerId = ""

        this.countdownTime = this.gameResetTimeBase
        this.countdownTimer = setTimeout(()=>{
            this.clearCountdown()
            gaming.started = false
            gaming.ended = false
            gaming.startingSoon = false
            this.countdownTime = this.countdownBase
          }, 1000 * this.countdownTime)
    }

    isGameLive(){
        let gaming:GameComponent = this.scene[COMPONENT_TYPES.GAME_COMPONENT].get(this.aid)
        if(!gaming){
            return false
        }
        return gaming.started && !gaming.ended
    }

    startForceEndTimer(){
        let gaming:GameComponent = this.scene[COMPONENT_TYPES.GAME_COMPONENT].get(this.aid)
        if(!gaming){
            return
        }

        this.countdownTime = this.gameTimeBase
        this.countdownTimer = setTimeout(()=>{
            gaming.gameCountdown = -500

            pushPlayfabEvent(SERVER_MESSAGE_TYPES.GAME_FINISHED_EARLY, PLAYFAB_DATA_ACCOUNT, {})

            this.clearCountdown()
            this.endGame()
          }, 1000 * this.countdownTime)
    }

    resetForceEndTimer(){
        this.clearCountdown()
        this.startForceEndTimer()
    }

    checkLobbyQueue(){
        let gaming = this.scene[COMPONENT_TYPES.GAME_COMPONENT].get(this.aid)
        if(gaming.lobby.length > 0 && !gaming.started && !gaming.assigningPlayer){
            console.log('game has not started and player waiting in lobby')
            gaming.assigningPlayer = true
            this.assignRandomTeam(gaming.lobby.shift())
        }else{
            console.log('game lobby is empty or game already started')
        }
    }

    assignRandomTeam(userId:string){
        let gaming = this.scene[COMPONENT_TYPES.GAME_COMPONENT].get(this.aid)
        let availableTeams:any[] = []
        let emptyTeams:any[] = []
    
        gaming.teams.forEach((team:TeamComponent, id:string)=>{
            if(team.mates.length < team.max){
                if(team.mates.length === 0){
                    emptyTeams.push(team)
                }else{
                    availableTeams.push(team)
                }
            }
        })
    
        let randomTeam:any
        if (emptyTeams.length > 0) {
            let randomIndex = getRandomIntInclusive(0, emptyTeams.length - 1)
            randomTeam = gaming.teams.get(emptyTeams[randomIndex].id)
        } else {
          const teamWithFewestPlayers = availableTeams.reduce((prev, current) =>
            prev.mates.length < current.mates.length ? prev : current
          );
          randomTeam = teamWithFewestPlayers
        }
    
        let room = iwbManager.rooms.find(($:any)=> $.roomId === this.scene.roomId)
        if(room){
            let player = room.state.players.get(userId)
            if(player){
                randomTeam.mates.push(userId)
                player.startGame(this.scene.id, {...gaming, aid:this.aid}, PLAYER_GAME_STATUSES.WAITING)     
                player.sendPlayerMessage(SERVER_MESSAGE_TYPES.START_GAME, {sceneId:gaming.id, aid:this.aid})
            }
        }
    
        gaming.assigningPlayer = false
        gaming.gameManager.checkMultiplayerReady()
        this.checkLobbyQueue()
    }

    removeStalePlayer(player:Player){   
        let gaming = this.scene[COMPONENT_TYPES.GAME_COMPONENT].get(this.aid)
        let mateIndex = gaming.lobby.findIndex(($:any)=> $ === player.address)
        if(mateIndex >= 0){
            gaming.lobby.splice(mateIndex,1)
        }
    
        if(gaming.teams){
            gaming.teams.forEach((team:TeamComponent, id:string)=>{
                let mateIndex = team.mates.findIndex(($:any)=> $ === player.address)
                if(mateIndex >= 0){
                    team.mates.splice(mateIndex,1)
                }
            })
        }
    }


}