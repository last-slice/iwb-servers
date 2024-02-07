import path from "path";
import { createBuildCompetitionRouters } from "../Custom/BuildCompetition";

export function customRouters(router:any){  
    createBuildCompetitionRouters(router)
}