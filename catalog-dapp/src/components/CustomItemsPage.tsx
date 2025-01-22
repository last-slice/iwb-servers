import React, {useEffect, useState} from "react";
import { Button, Header, Loader, Table, Tabs, Blockie, Address } from "decentraland-ui";
import { Card, Row, Col, Form, Tabs as BTabs, Tab as BTab } from "react-bootstrap";
import { Room } from "colyseus.js";
import EditAssetView from "./EditCustomItemView";

interface CustomItemsPageProps {
  onBack: () => void; // Callback to navigate back to the previous view
  room:Room
  userAddress:string
}

const CustomItemsPage: React.FC<CustomItemsPageProps> = ({ room, userAddress, onBack }) => {
  const [loadingPage, setLoadingPage] = useState(true);
  const [collections, setCollections] = useState([])
  const [items, setItems] = useState<any>([])
  const [models, setModels] = useState<any>([])
  const [view, setView] = useState("dashboard");
  const [activeTab, setActiveTab] = useState('items')
  const [model, setModel] = useState('')
  const [isListenerAdded, setIsListenerAdded] = useState(false); // Flag to prevent duplicate listeners
  const [editingItem, setEditItem] = useState<any>(null)

   // Default transform state
   const defaultTransform = {
    pos: { x: 0, y: 0, z: 0 }, // Position
    rot: { x: 0, y: 0, z: 0 }, // Rotation
    scl: { x: 1, y: 1, z: 1 }, // Scale
  };


  const [itemData, setItemData] = useState({
    name: "",
    status: "Enabled",
    type: "3D",
    // triggerType: "",
    // reactDistance: "",
    // hoverText: "",
    model: "",
  });

  const [transform, setTransform] = React.useState({
    pos: { x: 0, y: 0, z: 0 }, // Position
    rot: { x: 0, y: 0, z: 0 }, // Rotation
    scl: { x: 1, y: 1, z: 1 }, // Scale
  });

  const handleTransformChange = (field: string, axis:string, value: number) => {
    setTransform((prev:any) => ({
        ...prev,
        [field]: {
          ...prev[field],
          [axis]: value,
        },
      }));
  };

  const toggleItemStatus = (event: React.FormEvent, id:any, value:boolean) => {
      event.preventDefault();

      setItems((prevItems:any) =>
        prevItems.map((item: any) =>
          item.id === id ? { ...item, enabled: value } : item
        )
      );
  
      room.send("custom-item-update", {
        id: id,
        action:'status',
        value:value
      });
    };

  // Example options for the dropdowns
  const typeOptions = ["3D"];
  const statusOptions = ["Enabled", "Disabled"];

  const handleChange = (field: string, value: string) => {
    setItemData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const createItem = async (event: React.FormEvent) => {
    event.preventDefault();
    try{
        // await validateItem()
        room.send('add-custom-item', {itemData, transform})
        setTransform(defaultTransform); // Reset the transform state
    }
    catch(e){
        console.log('error adding custom model', e)
    }
  }

  const editItem = (id: string) => {
    const selectedItem = items.find((item: any) => item.id === id);
  
    if (selectedItem) {
      setEditItem(selectedItem); // Set the item being edited
    //   setTransform(selectedItem.transform); // Initialize the transform state
      setView("edit"); // Transition to the edit view
    }
  };

  const updateItemInArray = (updatedItem: any) => {
    setItems((prevItems:any) =>
      prevItems.map((item: any) =>
        item.id === updatedItem.id ? updatedItem : item // Update the matching item
      )
    );
}

    // Main getView function
    const getView = (): JSX.Element | null => {
      switch (view) {
        case "dashboard":
          return(
            <>
        <div style={{ padding: "0 5% 0 5%" }}>
            <Row>
                <Col>
                <Header>Custom Items Dashboard</Header>
                </Col>
            </Row>

            <Row>
                <Col>
                <Card style={{ width: "18rem" }}>
                    <Card.Body>
                    <Card.Title>3D Models</Card.Title>
                    <Card.Text>Create references to 3D model files to use in Items.</Card.Text>
                    <Button primary onClick={() => {setView("models")}}>
                        Create
                    </Button>
                    </Card.Body>
                </Card>
                </Col>

                <Col>
                <Card style={{ width: "18rem" }}>
                    <Card.Body>
                    <Card.Title>Items</Card.Title>
                    <Card.Text>Create Items to be placed in Angzaar.</Card.Text>
                    <Button primary onClick={() => {
                        setView("items")
                        setTransform(defaultTransform)
                        }}>
                        Create
                    </Button>
                    </Card.Body>
                </Card>
                </Col>

                <Col>
                <Card style={{ width: "18rem" }}>
                    <Card.Body>
                    <Card.Title>Collections</Card.Title>
                    <Card.Text>Items can be added to Collections and toggled at once.</Card.Text>
                    <Button primary onClick={() => {}}>
                        Create
                    </Button>
                    </Card.Body>
                </Card>
                </Col>

                <Col>
                <Card style={{ width: "18rem" }}>
                    <Card.Body>
                    <Card.Title>Refresh Server Items</Card.Title>
                    <Card.Text>Refresh the cached configuration for the server items.</Card.Text>
                    <Button primary onClick={() => {}}>
                        Create
                    </Button>
                    </Card.Body>
                </Card>
                </Col>
            </Row>

            <Row>
                <Col style={{marginTop:'5em'}}>

                <BTabs
                    defaultActiveKey={activeTab}
                    id="uncontrolled-tab-example"
                    className="mb-3"
                    >
                    <BTab eventKey="items" title="Items">
                    <Table basic="very">
                        <Table.Header>
                            <Table.Row>
                            <Table.HeaderCell>Name</Table.HeaderCell>
                            <Table.HeaderCell>Type</Table.HeaderCell>
                            <Table.HeaderCell>FilePath</Table.HeaderCell>
                            <Table.HeaderCell>Collection</Table.HeaderCell>
                            <Table.HeaderCell>Status</Table.HeaderCell>
                            <Table.HeaderCell>Transform</Table.HeaderCell>
                            <Table.HeaderCell>Actions</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                    
                        <Table.Body>
                        {items.map((item:any, index:number) => (
                            <Table.Row key={"item-" + index}>
                            <Table.Cell>{item.name}
                            </Table.Cell>
                            <Table.Cell>{item.type}
                            </Table.Cell>
                            <Table.Cell>{item.model}
                            </Table.Cell>
                            <Table.Cell>{item.collection}
                            </Table.Cell>
                            <Table.Cell>{item.enabled ? 
                            <Button  primary onClick={(e)=>{
                                toggleItemStatus(e, item.id, !item.enabled)
                            }} style={{ marginTop: "10px" }}>
                            Disable
                            </Button>

                            :
                            <Button onClick={(e)=>{
                                toggleItemStatus(e, item.id, !item.enabled)
                            }} style={{ marginTop: "10px" }}>
                            Enable
                        </Button>
                            }
                            </Table.Cell>
                            <Table.Cell>
                            <pre>{`P: {x: ${item.transform.pos.x.toFixed(2)}, y: ${item.transform.pos.y.toFixed(2)}, z: ${item.transform.pos.z.toFixed(2)}}`}</pre>
                            <pre>{`R: {x: ${item.transform.rot.x.toFixed(2)}, y: ${item.transform.rot.y.toFixed(2)}, z: ${item.transform.rot.z.toFixed(2)}}`}</pre>
                            <pre>{`S: {x: ${item.transform.scl.x.toFixed(2)}, y: ${item.transform.scl.y.toFixed(2)}, z: ${item.transform.scl.z.toFixed(2)}}`}</pre>

                            </Table.Cell>
                            <Table.Cell>
                            <Button primary onClick={()=>{editItem(item.id)}} style={{ marginTop: "10px" }}>
                        Edit
                        </Button>

                        <Button  onClick={()=>{
                          room.send('custom-item-copy', item.id)
                        }} style={{ marginTop: "10px" }}>
                        Copy
                        </Button>
                            </Table.Cell>
                            </Table.Row>
                        ))}
                        </Table.Body>
                    </Table>
                    </BTab>

                    <BTab eventKey="collections" title="Collections">
                        Tab content for Profile
                    </BTab>
                    <BTab eventKey="models" title="Models">
                    <Table basic="very">
               <Table.Header>
                 <Table.Row>
                    <Table.HeaderCell>Name</Table.HeaderCell>
                    <Table.HeaderCell>Actions</Table.HeaderCell>
                 </Table.Row>
               </Table.Header>
         
              <Table.Body>

              {models.map((model:string, index:number) => (
                <Table.Row key={"models-" + index}>
                <Table.Cell>{model}
                </Table.Cell>
                <Table.Cell>
                <Button primary onClick={()=>{}} style={{ marginTop: "10px" }}>
            Delete
            </Button>
                </Table.Cell>
                </Table.Row>
            ))}

               </Table.Body>
                </Table>
                    </BTab>
                    </BTabs>
                </Col>
            </Row>
            </div>
            </>
          )

          case "models":
            return(
              <>
               <div style={{ padding: "0 5% 0 5%" }}>
              <Row>
                  <Col>
                  <Header>Create Custom Models</Header>

                  <Card style={{ width: "50%" }}>
                    <Card.Body>
                    <Card.Title>Filename</Card.Title>
                    <Form>
                        <Form.Group controlId="formFilename">
                        <Form.Control
                            type="text"
                            placeholder="Enter filename"
                            onChange={(e) => {setModel(e.target.value)}}
                        />
                        </Form.Group>
                        <Button primary onClick={addCustomModel} style={{ marginTop: "10px" }}>
                        Add Model
                        </Button>
                    </Form>
                    </Card.Body>
                </Card>
                  </Col>
              </Row>
              </div>
              </>
            )
            
            case "items":
                return(
                  <>
                   <div style={{ padding: "0 5% 0 5%" }}>
                  <Row>
                      <Col>
                      <Header>Create New Item</Header>
    
                      <Card style={{ width: "100%" }}>
                        <Card.Body>
                        <Form>
                            <Form.Group controlId="formFilename">
                            <Form.Label>Item Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter item name"
                                onChange={(e) => handleChange("name", e.target.value)}
                            />
                            </Form.Group>


                            <Form.Group controlId="status">
                            <Form.Label>Item Status</Form.Label>
                            <Form.Select
                                onChange={(e) => handleChange("status", e.target.value)}
                            >
                                <option value="" disabled>
                                Select Status
                                </option>
                                {statusOptions.map((option:string, index:number) => (
                                    <option key={index} value={option}>
                                    {option}
                                    </option>
                                ))
                                }
                                </Form.Select>
                            </Form.Group>

                            <Form.Group controlId="status">
                            <Form.Label>Item Type</Form.Label>
                            <Form.Select
                                onChange={(e) => handleChange("type", e.target.value)}
                            >
                                <option value="" disabled>
                                Select Type
                                </option>
                                {typeOptions.map((option:string, index:number) => (
                                    <option key={index} value={option}>
                                    {option}
                                    </option>
                                ))
                                }
                                </Form.Select>
                            </Form.Group>

                            {/* <Form.Group controlId="status">
                            <Form.Label>Trigger Type</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter filename"
                                onChange={(e) => {setModel(e.target.value)}}
                            />
                            </Form.Group>

                            <Form.Group controlId="status">
                            <Form.Label>React Distance</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter filename"
                                onChange={(e) => {setModel(e.target.value)}}
                            />
                            </Form.Group>

                            <Form.Group controlId="status">
                            <Form.Label>Hover Text</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter filename"
                                onChange={(e) => {setModel(e.target.value)}}
                            />
                            </Form.Group> */}

                            <Form.Group controlId="status">
                            <Form.Label>Model</Form.Label>
                            <Form.Select
                                onChange={(e) => handleChange("model", e.target.value)}
                            >
                                <option value="" disabled>
                                Select Model
                                </option>
                                {models.map((option:string, index:number) => (
                                    <option key={index} value={option}>
                                    {option}
                                    </option>
                                ))
                                }
                            </Form.Select>
                            </Form.Group>

                            <Button primary onClick={createItem} style={{ marginTop: "10px" }}>
                            Create Item
                            </Button>
                        </Form>
                        </Card.Body>
                    </Card>
                      </Col>

                      <Col>
                      <Header>Transform</Header>
    
                      <Card style={{ width: "100%" }}>
                        <Card.Body>
                        <Form>
          {/* Position Row */}
          <Row>
            <Col>
              <Form.Group>
                <Form.Label>Position X</Form.Label>
                <Form.Control
                  type="number"
                  value={transform.pos.x}
                  onChange={(e) => handleTransformChange("pos", "x", parseFloat(e.target.value))}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group>
                <Form.Label>Position Y</Form.Label>
                <Form.Control
                  type="number"
                  value={transform.pos.y}
                  onChange={(e) => handleTransformChange("pos", "y", parseFloat(e.target.value))}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group>
                <Form.Label>Position Z</Form.Label>
                <Form.Control
                  type="number"
                  value={transform.pos.z}
                  onChange={(e) => handleTransformChange("pos", "z", parseFloat(e.target.value))}
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Rotation Row */}
          <Row>
            <Col>
              <Form.Group>
                <Form.Label>Rotation X</Form.Label>
                <Form.Control
                  type="number"
                  value={transform.rot.x}
                  onChange={(e) => handleTransformChange("rot", "x", parseFloat(e.target.value))}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group>
                <Form.Label>Rotation Y</Form.Label>
                <Form.Control
                  type="number"
                  value={transform.rot.y}
                  onChange={(e) => handleTransformChange("rot", "y", parseFloat(e.target.value))}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group>
                <Form.Label>Rotation Z</Form.Label>
                <Form.Control
                  type="number"
                  value={transform.rot.z}
                  onChange={(e) => handleTransformChange("rot", "z", parseFloat(e.target.value))}
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Scale Row */}
          <Row>
            <Col>
              <Form.Group>
                <Form.Label>Scale X</Form.Label>
                <Form.Control
                  type="number"
                  value={transform.scl.x}
                  onChange={(e) => handleTransformChange("scl", "x", parseFloat(e.target.value))}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group>
                <Form.Label>Scale Y</Form.Label>
                <Form.Control
                  type="number"
                  value={transform.scl.y}
                  onChange={(e) => handleTransformChange("scl", "y", parseFloat(e.target.value))}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group>
                <Form.Label>Scale Z</Form.Label>
                <Form.Control
                  type="number"
                  value={transform.scl.z}
                  onChange={(e) => handleTransformChange("scl", "z", parseFloat(e.target.value))}
                />
              </Form.Group>
            </Col>
          </Row>
        </Form>
                        </Card.Body>
                    </Card>
                      </Col>
                  </Row>
                  </div>
                  </>
                )

        case 'edit':
            return (
                <Row>
                    <Col style={{width:"50%"}}>
                    <EditAssetView
                    models={models}
                    onUpdateItem={updateItemInArray}
                  asset={editingItem}
                  room={room}
                  onSave={() => {
                  }}
                  onDelete={() => {
                  }}
                /></Col>
                </Row>
              );

        default:
          return <p>Invalid view selected.</p>;
      }
    };

    useEffect(() => {
        if (isListenerAdded) return; // Prevent duplicate listeners
        setIsListenerAdded(true);

        const handleMessage = (info: any) => {
            console.log("get-custom-items", info);

            setCollections(info.Collections)
            setItems(info.Items)
            setModels(info.Models)

            setLoadingPage(false)
        };

        // Send the request and mark it as sent
        room.send("get-custom-items", {});
        
        // Attach the listener for the response
        room.onMessage("get-custom-items", handleMessage);
        room.onMessage("custom-item-copy", (info:any)=>{
          setItems((prev:any) => [...prev, info]); // Append new NPC
        });

        room.onMessage("add-custom-model", (info)=>{
            console.log('add custom model', info)
            setModels((prevModels:any) => [...prevModels, info]);
            setView('dashboard')
        });

        room.onMessage("add-custom-item", (info)=>{
            console.log('received added custom item', info)
            setItems((prevModels:any) => [...prevModels, info]);
            setView('dashboard')
        });

        room.onMessage("custom-item-delete", (id)=>{
            console.log('custom-item-delete', id)
            setItems((prevItems:any) => prevItems.filter((item: any) => item.id !== id));
            setView('dashboard')
        });


        return () => {
            room.removeAllListeners(); // Clean up listeners to avoid duplicates

        };
    },[room]);

    const addCustomModel = (event: React.FormEvent) => {
        event.preventDefault(); // Prevent the form from submitting
        try{
            room.send('add-custom-model', model.trim())
        }
        catch(e){
            console.log('error adding custom model', e)
        }
    }

  return (
    <div className="dcl page fullscreen">
                {
        loadingPage ? 
            <Loader active>Loading...</Loader>
        : 

        <div>
                        <Tabs>
                    <Tabs.Tab onClick={()=>{onBack()}}>Angzaar Plaza Admin</Tabs.Tab>
                    <Tabs.Tab active onClick={()=>{setView("dashboard")}}>Custom Items</Tabs.Tab>
                    <Tabs.Tab>
                      <Blockie scale={3} seed={userAddress}>
                        <Address value={userAddress} strong />
                      </Blockie>
                    </Tabs.Tab>
                  </Tabs>
             {getView()}
            </div>
        }
    </div>
  );
};

export default CustomItemsPage;