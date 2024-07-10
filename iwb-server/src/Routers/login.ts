import * as jwt from "jsonwebtoken";
import * as dcl from "decentraland-crypto-middleware";

export function loginRouter(router:any){
    router.post(
    '/login',
    dcl.express({}),
    (req: Request & dcl.DecentralandSignatureData, res: any) => {
        const address: string = req.auth
        const metadata: Record<string, any> = req.authMetadata

        console.log('user info', address, metadata)

        //Create and sign jwt
        let token;
        try {
            token = jwt.sign(
                {
                    userId: address,
                    realm: metadata.realm.serverName,
                    origin: metadata.origin
                },
                process.env.SERVER_SECRET,
                {expiresIn: "6h"}
            );
        } catch (err) {
            console.log(err);
            const error = new Error("Error! Something went wrong.");
            return res.status(500).json({message: error.message});
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
    }
)
}