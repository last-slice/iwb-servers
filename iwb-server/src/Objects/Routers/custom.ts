import path from "path";
import { createBuildCompetitionRouters } from "../Custom/BuildCompetition";
import { createArtWeekRouters } from "../Custom/ArtWeek";

export function customRouters(router:any){  
    createBuildCompetitionRouters(router)
    createArtWeekRouters(router)
}