import { Authenticator } from "@dcl/crypto";


const { ethers } = require("ethers");

export let wallet:any

export async function initWeb3Wallet(){
    // Your private key
    const privateKey = process.env.QUEST_KEY
    wallet = new ethers.Wallet(privateKey);
}

export async function signMessage(messageToSign:any){
    const signature = await wallet.signMessage(messageToSign);
    return signature
}

const AUTH_CHAIN_HEADER_PREFIX = 'x-identity-auth-chain-'
const AUTH_TIMESTAMP_HEADER = 'x-identity-timestamp'
const AUTH_METADATA_HEADER = 'x-identity-metadata'

export function createAuthchainHeaders(
  address: string,
  signature: string,
  payload: string,
  timestamp: string,
  metadata: string
): Record<string, string> {
  const authchain = Authenticator.createSimpleAuthChain(payload, address, signature)
  const headers: Record<string, string> = {}
  authchain.forEach((link, i) => {
    headers[AUTH_CHAIN_HEADER_PREFIX + i] = JSON.stringify(link)
  })
  headers[AUTH_TIMESTAMP_HEADER] = timestamp
  headers[AUTH_METADATA_HEADER] = metadata

  // console.log('headers are ', headers)
  return headers
}

export async function sendSignedAPI(url:string, method:string, authchainHeaders:any, status?:any, body?:any){
    const res = await fetch(url, {
        method: method,
        headers: {
          ...authchainHeaders,
          'Content-Type': 'application/json'
        },
        body: body ? body : undefined
      })
      // console.log('res is', res)
      if (res.status === status ? status : 201) {
      //   const { quests } = (await res.json()) as { quests: { id: string; name: string }[] }
      const data = await res.json()
        if (data) {
          console.log("Your request has been processed successfully")
          return data
        } else {
          console.log('no data')
          return null
        }
      } else {
        console.log(`> Error returned by Quests Server: `, await res.json())
        return null
      }
}