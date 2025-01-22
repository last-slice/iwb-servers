import React, { useState, useEffect } from "react";
import { Container, Center, Page, Tab, Tabs,Button, Loader, Hero, HeroProps } from "decentraland-ui";
import {ethers } from 'ethers'
import {Client, Room} from 'colyseus.js'
import resources from "../utils/resources";


const wsUrl = resources.ENV === "Development" ? resources.DEV_SERVER : resources.PROD_SERVER;

interface LoginPageProps {
  setUserAddress: (address: string) => void;
  setRoom: (room: Room | null) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ setUserAddress, setRoom }) => {
  const [loading, setLoading] = useState<boolean>(false);
  
  const connectToMetaMask = async () => {
    try {
      setLoading(true);

      if (!window.ethereum) {
        alert("MetaMask is not installed!");
        setLoading(false);
        return;
      }

      console.log(wsUrl)

      const provider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await provider.send("eth_requestAccounts", []);
      const userAddress = accounts[0];

      console.log('user address is', userAddress)

      // Connect to Colyseus server
      let client:Client
      if(resources.DEV_SERVER){
        client = new Client(wsUrl);
      }else{
        client = new Client({hostname:wsUrl, secure:true});
      }
      const room:Room = await client.joinOrCreate(resources.COLYSEUS_ROOM, {userId: userAddress, name:"Admin"});
      // Set user data
      setUserAddress(userAddress);
      setRoom(room);

    } catch (error) {
      console.error("Error connecting to MetaMask or Colyseus:", error);
      alert("" + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="Page-story-container">
        <Tabs>
          <Tabs.Tab active>Angzaar Plaza Admin</Tabs.Tab>
       </Tabs>
        <div className="dcl page">
        <Container>
            <div className="dcl center">
            {
            loading ?
            <Loader active inline />
            :
            <Button primary onClick={connectToMetaMask}>
                    Connect with MetaMask
                    </Button>
            }
            </div>
    </Container>
        </div>
    </div>
  );
};
