import {monitor} from "@colyseus/monitor";
import {playground} from "@colyseus/playground";

export function colyseusRouter(router:any){
    router.use('/colyseus', monitor())

    if (process.env.NODE_ENV !== "production") {
        router.use("/playground", playground);
    }
}