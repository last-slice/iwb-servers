import React, { useState, useEffect } from "react";
import { Card, Form, Row, Col,Tabs as BTabs, Tab as BTab } from "react-bootstrap";
import { Button, Header, Loader, Table, Tabs, Blockie, Address, Checkbox, Dropdown } from "decentraland-ui";
import { SketchPicker } from 'react-color';
import { Room } from "colyseus.js";

const hairstyles:any ={
  M:[
    {k:"Keanu", v:"urn:decentraland:off-chain:base-avatars:keanu_hair"},
    {k:"Oldie", v:"urn:decentraland:off-chain:base-avatars:hair_oldie"},
    {k:"Standard", v:"urn:decentraland:off-chain:base-avatars:standard_hair"},
    {k:"Tall", v:"urn:decentraland:off-chain:base-avatars:tall_front_01"},
    {k:"Bald", v:"urn:decentraland:off-chain:base-avatars:00_bald"},
  ],
  F:[
    {k:"Anime", v:"urn:decentraland:off-chain:base-avatars:hair_anime_01"},
    {k:"Pony", v:"urn:decentraland:off-chain:base-avatars:pony_tail"},
    {k:"Standard", v:"urn:decentraland:off-chain:base-avatars:standard_hair"},
    {k:"Shoulder Hiar", v:"urn:decentraland:off-chain:base-avatars:shoulder_hair"},
    {k:"Two Tails", v:"urn:decentraland:off-chain:base-avatars:two_tails"},
  ]
}

const EditNPCPage: React.FC<any> = ({ asset, room, models, onDeleteNpc, onUpdateItem, onSave, onDelete }) => {
  const [activeTab, setActiveTab] = useState('transform') 
  const [transform, setTransform] = useState(asset.t);
  const [modifier, setModifier] = useState(1);
  const [rModifier, setRModifier] = useState(0);
  const [isWalking, setWalking] = useState(asset.p.e);
  const [showName, setShowName] = useState(asset.dn);
  const [randomWearables, setRandomWearables] = useState(asset.w.r)
  const [wearables, setWearables] = useState(asset.w.i)
  const [wearableNames, setWearableNames] = useState<any>([])
  const [newWearableLink, setNewWearableLink] = useState("")
  const [speed, setSpeed] = useState(asset.speed)
  const [bodyShape, setBodyShape] = useState(asset.b)
  const [isMale, setMale] = useState(asset.b === "M" ? true : false)
  const [name, seAssettName] = useState(asset.n)
  const [haircolor, setHaircolor] = useState(asset.hc)
  const [eyecolor, setEyeColor] = useState(asset.ec)
  const [skincolor, setSkinColor] = useState(asset.sc)
  const [hairIndex, setHairIndex] = useState(hairstyles[bodyShape].findIndex((h:any)=> h.v === asset.hs))

  const handleWearableLink = (event: React.ChangeEvent<any>) => {
    event.preventDefault();
    setNewWearableLink(event.target.value)
  }

  const addWearable = (event: React.FormEvent) =>{
    event.preventDefault()
    let items = newWearableLink.split("/")

    setWearables((prevItems:any) => [...prevItems, "" + items[5] + ":" + items[7]]);
    fetchWearableName(items[5] + ":" + items[7])

    room.send("npc-update", {
      id: asset.id,
      action:'add-wearable',
      item:items[5] + ":" + items[7]
    });
  }

    // Handle deleting a wearable
    const handleDeleteWearable = (e:React.FormEvent, index: number) => {
      e.preventDefault()

      setWearables((prevWearables:any) =>
        prevWearables.filter((_:any, i:any) => i !== index)
      );
      setWearableNames((prevNames:any) => prevNames.filter((_:any, i:any) => i !== index));

      room.send("npc-update", {
        id: asset.id,
        action:'remove-wearable',
        index:index
      });
    };

  const fetchWearableName = async (item: string) => {
    try {
      const res = await fetch(
        "https://marketplace-api.decentraland.org/v1/items?contractAddress=" +
          item.split(":")[0] +
          "&itemId=" +
          item.split(":")[1]
      );
      const json = await res.json();

      if (json.total > 0) {
        const foundItem = json.data.find(
          (res: any) => res.itemId === item.split(":")[1]
        );
        if (foundItem) {
          setWearableNames((prev:any) => [...prev, foundItem.name]);
        } else {
          setWearableNames((prev:any) => [...prev, "View Marketplace"]);
        }
      } else {
        setWearableNames((prev:any) => [...prev, "View Marketplace"]);
      }
    } catch (e) {
      console.error("Error fetching wearable name", e);
      setWearableNames((prev:any) => [...prev, "View Marketplace"]);
    }
  };


  const changeSkincolor = (color:any) =>{
    setSkinColor(color.rgb)
    room.send("npc-update", {
      id: asset.id,
      action:'skin-color',
     color:color.rgb    
  });
  }

  const changeHaircolor = (color:any) =>{
    setHaircolor(color.rgb)
    room.send("npc-update", {
      id: asset.id,
      action:'hair-color',
      color:color.rgb    
    });
  }

  const changeEyecolor = (color:any) =>{
    setEyeColor(color.rgb)
    room.send("npc-update", {
      id: asset.id,
      action:'eye-color',
      color:color.rgb    
    });
  }


  // Watch for changes in the `transform` state and notify the parent
    useEffect(() => {
        const updatedAsset = { ...asset, t: transform, p:{e:isWalking, r:false, p:[]} };
        onUpdateItem(updatedAsset); // Notify the parent

        const getWearableNames = async ()=>{
          let names:any[] = []
          for(let i = 0; i < asset.w.i.length; i++){
            let item = asset.w.i[i]
            try{
              let res = await fetch("https://marketplace-api.decentraland.org/v1/items?contractAddress=" + item.split(":")[0] + "&itemId=" + item.split(":")[1])
              let json = await res.json()
              console.log('json is', json)
              if(json.total > 0){
                json.data.forEach((res:any)=>{
                  if(res.itemId === item.split(":")[1]){
                    names.push(json.data[0].name)
                  }else{
                  }
                })
              }else{
                names.push("View Marketplace")
              }
            }
            catch(e){
              console.log('error getting wearable info', e)
               names.push("View Marketplace")
            }
            }
            console.log('names are ', names)
            setWearableNames(names)
        }

        getWearableNames()
    }, [transform, isWalking]); // Run this effect whenever `transform` change

  const handleIncrement = (event: React.FormEvent, field: string, axis:number) => {
    event.preventDefault();
    setTransform((prev: any) => ({
        ...prev,
        [field]: prev[field].map((value: number, index: number) =>
          index === axis ? value + (field === "r" ? rModifier : modifier) : value
        ),
      }));

    room.send("npc-update", {
      id: asset.id,
      action:'transform',
      field:field,
      axis:axis,
      direction:1,
      modifier:field === "r" ? rModifier : modifier
    });

    // Update the asset with the new transform
    const updatedAsset = { ...asset, t: transform };
    onUpdateItem(updatedAsset); // Notify the parent
  };

  const handleDecrement = (event: React.FormEvent, field: string, axis: number) => {
    event.preventDefault();
    setTransform((prev: any) => ({
        ...prev,
        [field]: prev[field].map((value: number, index: number) =>
          index === axis ? value - (field === "r" ? rModifier : modifier) : value
        ),
      }));

    room.send("npc-update", {
      id: asset.id,
      action:'transform',
      field:field,
      axis:axis,
      direction:-1,
      modifier:field === "r" ? rModifier : modifier
    });

    asset.t = transform

     // Update the asset with the new transform
     const updatedAsset = { ...asset, t: transform };
     onUpdateItem(updatedAsset); // Notify the parent
  };

  const handleIncreaseSpeed = (event: React.FormEvent) => {
    event.preventDefault();
    setSpeed(speed + 0.1)

    room.send("npc-update", {
      id: asset.id,
      action:'speed',
      speed:parseFloat((speed + 0.1).toFixed(2))
    });

    // Update the asset with the new transform
    const updatedAsset = { ...asset, t: transform };
    onUpdateItem(updatedAsset); // Notify the parent
  };

  const handleDecreaseSpeed = (event: React.FormEvent) => {
    event.preventDefault();
    setSpeed(speed - 0.1)

    room.send("npc-update", {
      id: asset.id,
      action:'speed',
      speed:parseFloat((speed - 0.1).toFixed(2))
      
    });

    // Update the asset with the new transform
    const updatedAsset = { ...asset, t: transform };
    onUpdateItem(updatedAsset); // Notify the parent
  };

  const handleModelChange = (event: React.FormEvent, value:string) => {
    event.preventDefault();

    asset.model = value

    room.send("custom-item-update", {
      id: asset.id,
      action:'model',
      value:value
    });

    // Update the asset with the new transform
    const updatedAsset = { ...asset, transform: transform,  };
    onUpdateItem(updatedAsset); // Notify the parent
  };

  const toggleItemStatus = (event: React.FormEvent, value:boolean) => {
    event.preventDefault();

    asset.en = value

    room.send("npc-update", {
      id: asset.id,
      action:'status',
      value:value
    });

    // Update the asset with the new transform
    const updatedAsset = { ...asset, transform: transform,  };
    onUpdateItem(updatedAsset); // Notify the parent
  };

  const toggleModifier = (event: React.FormEvent) => {
    event.preventDefault()
    setModifier((prev) => (prev === 1 ? 0.1 : prev === 0.1 ? 0.01 : prev === 0.01 ? 0.001 : 1));
  };

  const toggleRModifier = (event: React.FormEvent) => {
    event.preventDefault()
    setRModifier((prev) => (prev === 1 ? 90 : prev === 90 ? 45 : prev === 45 ? 15 : prev === 15 ? 5 : prev === 5 ? 1 : 1));
  };

  const deleteItem = (event: React.FormEvent) => {
    event.preventDefault()
    room.send('npc-update', {id:asset.id, action:'delete'})
    onDeleteNpc(asset.id)
  }

  const setName = (e:React.FormEvent, value:any)=>{
    e.preventDefault()
    seAssettName(value);

    room.send("npc-update", {
        id: asset.id,
        action:'name',
        value:value
      });
    seAssettName(value)
  }

  const handleDefaultWearableschange = () => {
    setRandomWearables(!randomWearables); // Toggle checkbox state

    room.send("npc-update", {
        id: asset.id,
        action:'random-wearables',
        value:!randomWearables
      });
  };

  const handleCheckboxChange = () => {
    setWalking(!isWalking); // Toggle checkbox state

    room.send("npc-update", {
        id: asset.id,
        action:'walking',
        value:!isWalking
      });
  };

  const handleHairChange = (e:React.FormEvent, index:number) => {
    e.preventDefault()
    setHairIndex(index)
    room.send('npc-update', {id:asset.id, action:'hair', value:hairstyles[bodyShape][index].v})
  };

  const handleBodyChange = () => {
    setMale(!isMale); // Toggle checkbox state

    setBodyShape(!isMale ? "M" : "F")

    room.send("npc-update", {
        id: asset.id,
        action:'bodyshape',
        value: !isMale ? "M" : "F"
      });
  };

  const handleDisplayNameChange = () => {
    setShowName(!showName); // Toggle checkbox state

    room.send("npc-update", {
        id: asset.id,
        action:'display-name',
        value:!showName
      });
  };

  return (
    <div style={{ padding: "20px" }}>
      <Header>Edit NPC - {asset.n}</Header>

      <Row>
        <Col>
        <Card>
        <Card.Body>
          <Form>
          <Row style={{ marginTop: "20px 0 20px 0" }}>
          {/* <Col>
        <Button  primary={asset.en ? true : undefined} onClick={(e)=>{
          toggleItemStatus(e,!asset.en)
        }} style={{ marginTop: "10px" }}>
          Save Edits
          </Button>
        </Col> */}
        <Col>
        <Button  primary={asset.en ? true : undefined} onClick={(e)=>{
          toggleItemStatus(e, !asset.en)
        }} style={{ marginTop: "10px" }}>
          {asset.en ? "Disable" : "Enable"}
          </Button>
        </Col>
        <Col>
        <Button  onClick={(e)=>{
          deleteItem(e)
        }} style={{ marginTop: "10px" }}>
          Delete NPC
          </Button>
        </Col>
        </Row>

        <Row style={{marginTop:'2em'}}>
        <Col><Checkbox toggle checked={showName} onClick={handleDisplayNameChange} label="Show Name?" />
        </Col>
            <Col>
            { showName ? 
            <Form.Group controlId="formModel">
              <Form.Label>Name</Form.Label>
                <Form.Control
                        type="text"
                        placeholder={asset.n}
                        onChange={(e) => {setName(e, e.target.value)}}
                    />
            </Form.Group>
            : null}
            </Col>
        </Row>

        <Row style={{marginTop:'2em'}}>
            <Col>
            <Form.Group controlId="formModel">
            <Form.Label>Category</Form.Label>
            <Form.Select
                    onChange={(e) => {}}
                >
                    <option value="">
                    Select Category
                    </option>
                    {/* {statusOptions.map((option:string, index:number) => (
                        <option key={index} value={option}>
                        {option}
                        </option>
                    ))
                    } */}
                    </Form.Select>
                </Form.Group>
            </Col>
        </Row>
        
            
          </Form>
        </Card.Body>
      </Card>
        </Col>

        <Col style={{width:'50%'}}>
        <BTabs
            defaultActiveKey={activeTab}
            id="uncontrolled-tab-example"
            className="mb-3"
            >
            <BTab eventKey="transform" title="Transform">
            <Card>
            <Card.Body>
            <Row style={{margin:'2em'}}>
            <Col><Checkbox toggle checked={isWalking} onClick={handleCheckboxChange} label="Walking?" />
            </Col>
             </Row>

        { !isWalking ?
        <div>
         <Row>
                 <Col>
                   <div>
                     <strong>Position X:</strong> {transform.p[0].toFixed(2)}
                   </div>
                   <Row>
                   <Col style={{margin:'1em'}}><Button onClick={(e) => handleIncrement(e,"p",0)}>+</Button></Col>
                    <Col style={{margin:'1em'}}><Button onClick={(e) => handleDecrement(e,"p", 0)}>-</Button></Col>
                    </Row>
                   
                   
                 </Col>
                 <Col>
                   <div>
                     <strong>Position Y:</strong>{transform.p[1].toFixed(2)}
                   </div>
                   <Row>
                    <Col style={{margin:'1em'}}><Button onClick={(e) => handleIncrement(e,"p", 1)}>+</Button></Col>
                    <Col style={{margin:'1em'}}><Button onClick={(e) => handleDecrement(e,"p", 1)}>-</Button></Col>
                   </Row>
                   
                 </Col>
                 <Col>
                   <div>
                     <strong>Position Z:</strong> {transform.p[2].toFixed(2)}
                   </div>
                   <Row>
                    <Col style={{margin:'1em'}}> <Button onClick={(e) => handleIncrement(e,"p",2)}>+</Button></Col>
                    <Col style={{margin:'1em'}}><Button onClick={(e) => handleDecrement(e,"p", 2)}>-</Button></Col>
                   </Row>
                   
                 </Col>
        </Row>

        <Row>
                 <Col>
                   <div>
                     <strong>Scale X:</strong> {transform.s[0].toFixed(2)}
                   </div>
                   <Row>
                   <Col style={{margin:'1em'}}><Button onClick={(e) => handleIncrement(e,"s",0)}>+</Button></Col>
                    <Col style={{margin:'1em'}}><Button onClick={(e) => handleDecrement(e,"s", 0)}>-</Button></Col>
                    </Row>
                   
                   
                 </Col>
                 <Col>
                   <div>
                     <strong>Scale Y:</strong>{transform.s[1].toFixed(2)}
                   </div>
                   <Row>
                    <Col style={{margin:'1em'}}><Button onClick={(e) => handleIncrement(e,"s", 1)}>+</Button></Col>
                    <Col style={{margin:'1em'}}><Button onClick={(e) => handleDecrement(e,"s", 1)}>-</Button></Col>
                   </Row>
                   
                 </Col>
                 <Col>
                   <div>
                     <strong>Scale Z:</strong> {transform.s[2].toFixed(2)}
                   </div>
                   <Row>
                    <Col style={{margin:'1em'}}> <Button onClick={(e) => handleIncrement(e,"s",2)}>+</Button></Col>
                    <Col style={{margin:'1em'}}><Button onClick={(e) => handleDecrement(e,"s", 2)}>-</Button></Col>
                   </Row>
                   
                 </Col>
        </Row>

        <Row style={{ marginTop: "20px", marginBottom:'3em' }}>
                  <Col>
                    <div>
                      <strong>Position/Scale Modifier:</strong> {modifier}
                    </div>
                    <Button variant="primary" onClick={toggleModifier}>
                      Change Modifier
                    </Button>
                  </Col>
                </Row>

        <Row>
                 <Col>
                   <div>
                     <strong>Rotation X:</strong> {transform.r[0].toFixed(2)}
                   </div>
                   <Row>
                   <Col style={{margin:'1em'}}><Button onClick={(e) => handleIncrement(e,"r",0)}>+</Button></Col>
                    <Col style={{margin:'1em'}}><Button onClick={(e) => handleDecrement(e,"r", 0)}>-</Button></Col>
                    </Row>
                   
                   
                 </Col>
                 <Col>
                   <div>
                     <strong>Rotation Y:</strong>{transform.r[1].toFixed(2)}
                   </div>
                   <Row>
                    <Col style={{margin:'1em'}}><Button onClick={(e) => handleIncrement(e,"r", 1)}>+</Button></Col>
                    <Col style={{margin:'1em'}}><Button onClick={(e) => handleDecrement(e,"r", 1)}>-</Button></Col>
                   </Row>
                   
                 </Col>
                 <Col>
                   <div>
                     <strong>Rotation Z:</strong> {transform.r[2].toFixed(2)}
                   </div>
                   <Row>
                    <Col style={{margin:'1em'}}> <Button onClick={(e) => handleIncrement(e,"r",2)}>+</Button></Col>
                    <Col style={{margin:'1em'}}><Button onClick={(e) => handleDecrement(e,"r", 2)}>-</Button></Col>
                   </Row>
                   
                 </Col>
        </Row>

        <Row style={{ marginTop: "20px" }}>
                  <Col>
                    <div>
                      <strong>Rotation Modifier:</strong> {rModifier}
                    </div>
                    <Button variant="primary" onClick={toggleRModifier}>
                      Change Modifier
                    </Button>
                  </Col>
                </Row>

        </div>

               : 
               
               <Row>
                <Col style={{margin:'1em'}}>Speed: {speed.toFixed(2)}</Col>
               <Col style={{margin:'1em'}}>
               <Button onClick={(e) => handleDecreaseSpeed(e)}>-</Button>
               <Button onClick={(e) => handleIncreaseSpeed(e)}>+</Button>
               </Col>
                </Row>
               
               }
                </Card.Body>
            </Card>
            
            </BTab>

            <BTab eventKey="wearables" title="Wearables">
            <Card>
            <Card.Body>
            <Row style={{margin:'2em'}}>
            <Col><Checkbox toggle checked={randomWearables} onClick={handleDefaultWearableschange} label="Default Wearables?" />
            </Col>
             </Row>

             {!randomWearables ?

              <div>
            <Row style={{margin:'2em'}}>
              <Form>
            <Col>
            <Form.Group controlId="formModel">
              <Form.Label>Marketplace Link</Form.Label>
                <Form.Control
                        type="text"
                        placeholder={"enter dcl marketplace link"}
                        onChange={handleWearableLink}
                    />
            </Form.Group>
            </Col>
            <Col>
            <Form.Group controlId="formModel">
            <Button  primary onClick={(e)=>{
              addWearable(e)
            }} style={{ marginTop: "10px" }}>
              Add
              </Button>
            </Form.Group>
            </Col>
            </Form>
             </Row>

            <Row>
              <Col>
              <Table basic="very">
                  <Table.Header>
                      <Table.Row>
                      <Table.HeaderCell>Image</Table.HeaderCell>
                      <Table.HeaderCell>Action</Table.HeaderCell>
                      </Table.Row>
                  </Table.Header>
              
                  <Table.Body>
                  {wearables.map((item:any, index:number) => (
                      <Table.Row key={"item-" + index}>
                      <Table.Cell><img src={'https://peer.decentraland.org/lambdas/collections/contents/urn:decentraland:matic:collections-v2:'+ item +'/thumbnail'} width={100}></img>
                      </Table.Cell>
                      <Table.Cell><a target="_blank" href={"https://decentraland.org/marketplace/contracts/" + item.split(":")[0] + "/items/" + + item.split(":")[1]}>{wearableNames[index]}</a>
                      </Table.Cell>
                      <Table.Cell>
                      <Button primary onClick={(e:any)=>{handleDeleteWearable(e, index)}} style={{ marginTop: "10px" }}>
                  Delete
                  </Button>
                      </Table.Cell>
                      </Table.Row>
                  ))}
                  </Table.Body>
                  </Table>
                  </Col>
            </Row>

            </div>
              : null }


            </Card.Body>
            </Card>
            </BTab>

            <BTab eventKey="body" title="Body">
            <Card>
            <Card.Body>
            <Row style={{margin:'2em'}}>
            <Col><Checkbox toggle checked={isMale} onClick={handleBodyChange} label="Male Shape" />
            </Col>
             </Row>
             <Row>
              <Col>
              <Header>Edit Hair Style </Header>
              </Col>
              <Col>
              <Dropdown text={hairstyles[bodyShape][hairIndex].k} direction="right">
                    <Dropdown.Menu>
                    {hairstyles[bodyShape].map((item:any, index:number) => (
                            <Dropdown.Item key={index} onClick={(e) => {handleHairChange(e, index)}} eventKey={index + 1} text={"" + item.k}/>
                            ))}
                    </Dropdown.Menu>
                </Dropdown>
              </Col>
             </Row>


             <Row style={{marginTop:'2em'}}>
              <Col>
              <Header>Edit Skin Color</Header>
              <SketchPicker
                  color={skincolor}
                  onChangeComplete={changeSkincolor}
                />
              </Col>
              <Col>
              <Header>Edit Hair Color</Header>
              <SketchPicker
                  color={ haircolor}
                  onChangeComplete={changeHaircolor}
                />
              </Col>
              <Col>
              <Header>Edit Eye Color</Header>
              <SketchPicker
                  color={ eyecolor}
                  onChangeComplete={changeEyecolor}
                />
              </Col>
             </Row>
             </Card.Body>
             </Card>
             </BTab>
            </BTabs>
        </Col>
      </Row>

     
      
      
    </div>
  );
};

export default EditNPCPage;
