import React, {useEffect, useState} from "react";
import { Button, Header, Loader, Table, Tabs, Blockie, Address, Dropdown } from "decentraland-ui";
import { Card, Row, Col, Form, Tabs as BTabs, Tab as BTab } from "react-bootstrap";
import { Room } from "colyseus.js";
import EditNPCPage from "./EditNPCPage";

interface NPCsPageProps {
  onBack: () => void; // Callback to navigate back to the previous view
  room:Room
  userAddress:string
}

const NPCsPage: React.FC<NPCsPageProps> = ({ room, userAddress, onBack }) => {
    console.log("NPC Page re-rendered!");

    const [loadingPage, setLoadingPage] = useState(true);
    const [npcs, setNPCs] = useState<any>([])
    const [originalNPCs, setOriginalNPCs] = useState<any>([])
    const [grid, setGrid] = useState([])
    const [view, setView] = useState("dashboard");
    const [activeTab, setActiveTab] = useState('npcs')
    const [model, setModel] = useState('')
    const [isListenerAdded, setIsListenerAdded] = useState(false); // Flag to prevent duplicate listeners
    const [editingItem, setEditItem] = useState<any>(null)

    // const [visibleGrid, setVisibleGrid] = useState<any>([])
    // const [visibleNPCs, setVisibleNPCs] = useState<any>([])
    const [pageNumber, setPageNumber] = useState(1)
    const [totalPages, setTotalPages] = useState(0)
    const [editGridWorld, setEditGridWorld] = useState(false)
    const [npc, setEditNPC] = useState(null)
    const [sortOrder, setSortOrder] = useState("original"); // Sort order state

     // Function to handle deletion of an NPC
  const handleDeleteNpc = (npcId: number) => {
    console.log('delete npc', npcId)
    setNPCs((prev:any) => prev.filter((npc:any) => npc.id !== npcId));
    setView("dashboard")
  };

    const paginateArray = (array:any[], page:number, itemsPerPage:number)=> {
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return array.slice(startIndex, endIndex)
    }

    const updateItemInArray = (updatedItem: any) => {
        console.log('updated item is', updatedItem)
        setNPCs((prevItems:any) =>
          prevItems.map((item: any) =>
            item.id === updatedItem.id ? updatedItem : item // Update the matching item
          )
        );
    }
      
    const newFilteredSelection = (tab:any)=>{
        // setVisibleNPCs([])x`
        // setVisibleGrid([])
        setPageNumber(1)
        setActiveTab(tab)
        updateVisiblePage(pageNumber, tab)
    }

    const updateVisiblePage = (page:number, tab?:string)=>{
        setPageNumber(page);

        switch(tab){
            case 'npcs':
                // setTotalPages(Math.ceil(npcs.length / 10))
                // setVisibleNPCs(paginateArray([...npcs], page, 10))

                setTotalPages(Math.ceil(npcs.length))

                setEditGridWorld(false)
                break;

            case 'grid':
                // setTotalPages(Math.ceil(grid.length / 10))
                // setVisibleGrid(paginateArray([...grid], page, 10))

                setTotalPages(Math.ceil(grid.length))
                // setVisibleGrid(paginateArray([...grid], page, 10))

                setEditGridWorld(true)
                break;
        }
    }

    // Handle page change
  const handlePageChange = (page: number) => {
    updateVisiblePage(page, activeTab)
  };

  const toggleItemStatus = (event: React.FormEvent, id:any, value:boolean) => {
        event.preventDefault();
  
        setNPCs((prevItems:any) =>
          prevItems.map((item: any) =>
            item.id === id ? { ...item, en: value } : item
          )
        );

        // updateVisiblePage(pageNumber, "npcs")
    
        room.send("npc-update", {
          id: id,
          action:'status',
          value:value
        });
      };

    // Sort NPCs based on selected criteria
//   const handleSort = (order: string) => {
    // setSortOrder(order);

//     if (order === "alphabetical") {
//       setNPCs([...originalNPCs].sort((a:any, b:any) => a.n.localeCompare(b.n)))
//     } else if (order === "original") {
//       setNPCs([...originalNPCs]); // Restore original order
//     }
//   };

    useEffect(() => {
        if (isListenerAdded) return; // Prevent duplicate listeners
        setIsListenerAdded(true);

        const handleMessage = (info: any) => {
            console.log("get-npcs", info);

            setNPCs([...info.npcs].sort((a:any, b:any) => a.n.localeCompare(b.n)))
            setGrid(info.grid)
            setLoadingPage(false)
            newFilteredSelection('npcs')
        };

        room.send("get-npcs", {});
        
        room.onMessage("get-npcs", handleMessage);
        room.onMessage("npc-copy", (info:any)=>{
            setNPCs((prevNpcs:any) => [...prevNpcs, info]); // Append new NPC
        });
        return () => {
            room.removeAllListeners(); // Clean up listeners to avoid duplicates

        };
    },[room]);

    // Main getView function
    const getView = (): JSX.Element | null => {
    switch (view) {
        case "dashboard":
        return(
            <>
        <div style={{ padding: "0 5% 0 5%" }}>
            <Row>
                <Col>
                <Header>NPCs Dashboard</Header>
                </Col>
            </Row>

            <Row>
                <Col>
                <Card style={{ width: "18rem" }}>
                    <Card.Body>
                    <Card.Title>Create NPCs</Card.Title>
                    <Card.Text>Create new NPCs for the Angzaar Plaza</Card.Text>
                    <Button primary onClick={() => {setView("models")}}>
                        Create
                    </Button>
                    </Card.Body>
                </Card>
                </Col>
            </Row>

            <Row>
                <Col style={{marginTop:'5em'}}>

                <Row>
                    <Col>
                     {/* Sort Dropdown */}

                    {/* <Dropdown text={`Sort: ${sortOrder === "original" ? "Original Order" : "Alphabetical"}`} direction="right">
                    <Dropdown.Menu>  <Dropdown.Item key={'original'} onClick={(e) => handleSort("original")} eventKey={'original'} text={"Original Order"}/>
                    <Dropdown.Item key={'alphabetical'} onClick={(e) => handleSort("alphabetical")} eventKey={'alphabetical'} text={"Alphabetical"}/>
                    </Dropdown.Menu>
                </Dropdown> */}

                    {/* <Dropdown text={"Page " + pageNumber} direction="right">
                    <Dropdown.Menu>
                    {Array.from({ length: totalPages }, (_, i) => (
                            <Dropdown.Item key={i} onClick={(e) => handlePageChange(i+1)} eventKey={i + 1} text={"Page " + (i+1)}/>
                            ))}
                    </Dropdown.Menu>
                </Dropdown> */}
                </Col>
                    <Col>
                            { activeTab === "grid" ? 
                    <Button  primary={editGridWorld ? true : undefined} onClick={()=>{
                        room.send('npc-tab-selection', editGridWorld ? 'grid' : 'npcs')
                        setEditGridWorld(!editGridWorld)
                    }}>
                        {editGridWorld ? "Edit in World" : "Finish Editing"}
                    </Button>
                    : null}
                    </Col>
                </Row>

                <BTabs
                    defaultActiveKey={activeTab}
                    id="uncontrolled-tab-example"
                    className="mb-3"
                    onSelect={(tab) => newFilteredSelection(tab)}
                    >
                    <BTab eventKey="npcs" title="NPCs">
                    <Table basic="very">
                        <Table.Header>
                            <Table.Row>
                            <Table.HeaderCell>Name</Table.HeaderCell>
                            <Table.HeaderCell>Category</Table.HeaderCell>
                            <Table.HeaderCell>Status</Table.HeaderCell>
                            <Table.HeaderCell>Custom</Table.HeaderCell>
                            {/* <Table.HeaderCell>Location</Table.HeaderCell> */}
                            <Table.HeaderCell>Transform</Table.HeaderCell>
                            <Table.HeaderCell>Actions</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                    
                        <Table.Body>
                        {npcs.map((item:any, index:number) => (
                            <Table.Row key={"item-" + index}>
                            <Table.Cell>{item.n}
                            </Table.Cell>
                            <Table.Cell>{item.ca}
                            </Table.Cell>
                            <Table.Cell>{item.en ? 
                                <Button  primary onClick={(e)=>{
                                    toggleItemStatus(e, item.id, !item.en)
                                }} style={{ marginTop: "10px" }}>
                                Disable
                                </Button>
    
                                :
                                <Button onClick={(e)=>{
                                    toggleItemStatus(e, item.id, !item.en)
                                }} style={{ marginTop: "10px" }}>
                                Enable
                            </Button>
                                }
                            </Table.Cell>
                            <Table.Cell>{item.c ? "True": ""}
                            </Table.Cell>
                            {/* <Table.Cell>
                            </Table.Cell> */}
                            <Table.Cell>
                                {item.p.e ? "Walking" : 
                                <div>
                            <pre>{`P: {x: ${item.t.p[0].toFixed(2)}, y: ${item.t.p[1].toFixed(2)}, z: ${item.t.p[2].toFixed(2)}}`}</pre>
                            <pre>{`R: {x: ${item.t.r[0].toFixed(2)}, y: ${item.t.r[1].toFixed(2)}, z: ${item.t.r[2].toFixed(2)}}`}</pre>
                            <pre>{`S: {x: ${item.t.s[0].toFixed(2)}, y: ${item.t.s[1].toFixed(2)}, z: ${item.t.s[2].toFixed(2)}}`}</pre>
                            </div>
                                }
                            </Table.Cell>
                            <Table.Cell>
                            <Button primary onClick={()=>{
                                setEditNPC(item)
                                setView("edit")
                            }} style={{ marginTop: "10px" }}>
                        Edit
                        </Button>

                        <Button  onClick={()=>{
                            room.send('npc-copy', item.id)
                        }} style={{ marginTop: "10px" }}>
                        Copy
                        </Button> 
                            </Table.Cell>
                            </Table.Row>
                        ))}
                        </Table.Body>
                    </Table>
                    </BTab>

                    <BTab eventKey="grid" title="Grid"
                      >
                    <Table basic="very">
                        <Table.Header>
                            <Table.Row>
                            <Table.HeaderCell>Coordinate</Table.HeaderCell>
                            <Table.HeaderCell>Obstacle</Table.HeaderCell>

                            </Table.Row>
                        </Table.Header>
                    
                        <Table.Body>
                        {grid.map((item:any, index:number) => (
                            <Table.Row key={"item-" + index}>
                            <Table.Cell>{item.x + "," + item.y}
                            </Table.Cell>
                            <Table.Cell>{item.enabled ? 
                                <Button  onClick={(e)=>{
                                    // toggleItemStatus(e, item.id, !item.enabled)
                                }} style={{ marginTop: "10px" }}>
                                Enable
                                </Button>

                                :
                                <Button primary onClick={(e)=>{
                                    // toggleItemStatus(e, item.id, !item.enabled)
                                }} style={{ marginTop: "10px" }}>
                                Disable
                            </Button>
                                }
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

        case 'edit':
            return( 
            <div style={{ padding: "0 5% 0 5%" }}>
            <EditNPCPage
                    asset={npc}
                    onUpdateItem={updateItemInArray}
                    onDeleteNpc={handleDeleteNpc} 
                  room={room}
                  onSave={() => {
                  }}
                  onDelete={() => {
                  }}
                />
                </div>
            )

        default:
            return <p>Invalid view selected.</p>;
    }}

  return (
    <div className="dcl page fullscreen">
                {
        loadingPage ? 
            <Loader active>Loading...</Loader>
        : 

        <div>
                        <Tabs>
                    <Tabs.Tab onClick={()=>{onBack()}}>Angzaar Plaza Admin</Tabs.Tab>
                    <Tabs.Tab active onClick={()=>{setLoadingPage(true); setView("dashboard"); setLoadingPage(false)}}>NPCs</Tabs.Tab>
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
}

export default NPCsPage;