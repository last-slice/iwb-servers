import React, { useEffect, useRef, useState } from "react";
import {
  Tabs,
  Blockie,
  Address,
  Loader,
  Button,
  Pagination,
  Table,
  Radio,
} from "decentraland-ui";
import { Row, Col, Card, Form, Modal } from "react-bootstrap";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import resources from "../utils/resources";

interface AudioPlayerProps {
  url: string;
}

export const DashboardPage: React.FC<any> = () => {
  const [loadingPage, setLoadingPage] = useState(true);
  const [view, setView] = useState("dashboard");
  const [catalog, setCatalog] = useState([])
  const [visibleItems, setVisibleItems] = useState([])
  const [visiblePage, setVisiblePage] = useState(1)
  const [search, setSearch] = useState('')
  const [styleFilter, setStyleFilter] = useState("All Styles");
  const [styles, setStyles] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [types, setTypes] = useState<string[]>([]);
  const [withAnimations, setWithAnimations] = useState(false)

  const [showModal, setShowModal] = useState(false);
const [current3DModel, setCurrent3DModel] = useState<string | null>(null);
const [modelName, setModelName] = useState('')
const [showColliders, setShowColliders] = useState(true); // State to toggle colliders


const openModal = (modelUrl: string) => {
  console.log("modal is", modelUrl)
  setCurrent3DModel(modelUrl);
  setShowModal(true);
};

const closeModal = () => {
  setShowModal(false);
  setCurrent3DModel(null);
  setShowColliders(true)
};

  const ITEMS_PER_PAGE = 20;

  useEffect(() => {

    const fetchCatalog = async ()=>{
      fetch((resources.ENV === "Development" ? resources.DEV_SERVER : resources.PROD_SERVER) + "catalog/search")
      .then(async (response:any)=>{
        let data = await response.json()
        setCatalog(data.results)
        setLoadingPage(false);
        const uniqueStyles:any = Array.from(
          new Set(data.results.map((item: any) => item.sty))
        );
        setStyles(["All Styles", ...uniqueStyles]); // Include "all" as a default optio

        const uniqueTypes:any = Array.from(
          new Set(data.results.map((item: any) => item.ty))
        );
        setTypes(["All Types", ...uniqueTypes]); // Include "all" as a default optio


        setVisibleItems(data.results.slice(0, ITEMS_PER_PAGE)); // Default first page
        setView("dashboard");
      })
      .catch((e:any)=>{
        console.log('error is', e)
      })
    }
    fetchCatalog()
    return () => {};
  }, []);

   // Filter and paginate catalog
   useEffect(() => {
    let filteredCatalog = [...catalog]
    if(search.toLocaleLowerCase() !== ""){
      filteredCatalog = catalog.filter((item:any) =>
        item.n.toLowerCase().includes(search.toLowerCase()) ||
      (item.sty && item.sty.toLowerCase().includes(search.toLowerCase())) ||
      (item.cat && item.cat.toLowerCase().includes(search.toLowerCase())) ||
      (item.d && item.d.toLowerCase().includes(search.toLowerCase())) ||
      (item.on && item.on.toLowerCase().includes(search.toLowerCase())) ||
      (item.tag.length > 0 && item.tag.map(($:any)=> $.toLowerCase()).includes(search.toLowerCase()))
      );
    }

    if(styleFilter !== "All Styles"){
      filteredCatalog = filteredCatalog.filter((item:any) => 
        item.sty.toLowerCase() === styleFilter.toLowerCase()
      );
    }

    if(typeFilter !== "All Types"){
      filteredCatalog = filteredCatalog.filter((item:any) => 
        item.ty.toLowerCase() === typeFilter.toLowerCase()
      );
    }

    if(withAnimations){
      filteredCatalog = filteredCatalog.filter((item:any) => 
        item.anim
      );
    }
    
    const startIndex = (visiblePage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setVisibleItems(filteredCatalog.slice(startIndex, endIndex));
  }, [search,styleFilter, typeFilter,withAnimations, visiblePage, catalog]);

  const formatDollarAmount = (amount: number, decimal?:number): string => {
    return amount.toLocaleString('en-US', { maximumFractionDigits: decimal ? decimal : 0 });
  }

  const formatSize = (size: number | undefined)=> {
    if (!size) return "0"
  
    return (size / (1024 ** 2)).toFixed(2)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    setSearch(e.target.value.toLowerCase());
    setVisiblePage(1); // Reset to first page on new search
  };

  const handleStyleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault()
    setStyleFilter(e.target.value);
    setVisiblePage(1); // Reset to first page on new filter
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault()
    setTypeFilter(e.target.value);
    setVisiblePage(1); // Reset to first page on new filter
  };

  const handleIncludeAnimationsChange = (e: React.FormEvent<HTMLInputElement>, data:any) => {
    e.preventDefault()
    setWithAnimations(data.checked)
  };


  const handlePageChange = (event: any, data:any) => {
    console.log('page change ', data)
    setVisiblePage(data.activePage);
  };

    // Pagination controls
    const renderPagination = () => {
      const filteredCatalogLength = catalog.filter((item:any) =>
        item.n.toLowerCase().includes(search.toLowerCase())
      ).length;
      const totalPages = Math.ceil(filteredCatalogLength / ITEMS_PER_PAGE);
  
      return (
        <Pagination 
        defaultActivePage={1}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        >
          {[...Array(totalPages)].map((_, index) => (
            <Pagination.Item
              key={index + 1}
              active={index + 1 === visiblePage}
              // onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </Pagination.Item>
          ))}
        </Pagination>
      );
    };

    const getExtType = (type:any)=>{
      switch(type){
        case '3D':
          return ".glb"

        case 'Audio':
          return ".mp3"
      }
    }

    const show3DModel = (item:any) => {
      setModelName(item.n)
      openModal((resources.ENV === "Development" ? resources.DEV_DEPLOY_SERVER : resources.PROD_DEPLOY_SERVER) + "warehouse/asset/0x00/" + item.id + ".glb")
    }

    const downloadAsset = async (e:any, item:any) => {
      e.preventDefault()
      const anchor = document.createElement("a");
      anchor.href = (resources.ENV === "Development" ? resources.DEV_DEPLOY_SERVER : resources.PROD_DEPLOY_SERVER) + "warehouse/asset/" + item.n + getExtType(item.ty) + "/" + item.id  + getExtType(item.ty);
      anchor.download = item.n + getExtType(item.ty);
      anchor.target = "_blank"; // Open in a new tab if needed
      anchor.click();
      anchor.remove();
    }

    const AudioPlayer: React.FC<AudioPlayerProps> = ({ url }) => {
      const audioRef = useRef<HTMLAudioElement | null>(null);
      const [isPlaying, setIsPlaying] = useState(false);
    
      const togglePlay = () => {
        if (audioRef.current) {
          // if (isPlaying) {
            // audioRef.current.pause();
          // } else {
            audioRef.current.play();
          // }
          // setIsPlaying(!isPlaying);
        }
      };
    
      return (
        <div>
          <audio ref={audioRef} src={url} preload="auto" />
          <button
            onClick={togglePlay}
            className="btn btn-secondary"
            style={{ padding: "5px 10px", marginTop: "5px" }}
          >
           Play
          </button>
        </div>
      );
    };
    

    const renderTable = () => (
    <Table basic="very">
    <Table.Header>
        <Table.Row>
        <Table.HeaderCell>Image</Table.HeaderCell>
        <Table.HeaderCell>Name</Table.HeaderCell>
        <Table.HeaderCell>Type</Table.HeaderCell>
        <Table.HeaderCell>Animations</Table.HeaderCell>
        <Table.HeaderCell>Category</Table.HeaderCell>
        <Table.HeaderCell>Creator</Table.HeaderCell>
        <Table.HeaderCell>Size</Table.HeaderCell>
        <Table.HeaderCell>Poly Count</Table.HeaderCell>
        <Table.HeaderCell>Download</Table.HeaderCell>
        </Table.Row>
    </Table.Header>
    <Table.Body>
    {visibleItems.map((item:any, index) => (
          <tr key={index}>
            <td><img src={item.im} height={100} width={100}/></td>
            <td>{item.n}</td>
            <td>{
            item.ty === "3D" ? 
            <Button primary onClick={()=>{show3DModel(item)}}>View 3D Model</Button>
            :

            item.ty === "Audio" ? 
            <AudioPlayer url={`https://deployment.dcl-iwb.co/warehouse/asset/view/${item.id}.mp3`} />

            :

            <span>{item.ty}</span>
            }
            </td>
            <td>{item.anim && item.anim.length > 0 ? (
              <ul>
                {item.anim.map((animation: any, animIndex: number) => (
                  <li key={animIndex}>
                    <strong>{animation.name}</strong> ({animation.duration}s)
                  </li>
                ))}
              </ul>
            ) : null }</td>
            <td>{item.sty}</td>
            <td>{item.on}</td>
            <td>{formatSize(item.si)} MB</td>
            <td>{formatDollarAmount(item.pc)}</td>
            <td>{item.ty === "3D" || item.ty === "Audio" ? <Button primary onClick={(e:any)=> downloadAsset(e, item)}>Download</Button> : null}</td>
          </tr>
        ))}
      </Table.Body>
      </Table>
  );
  
  
  const getDashboard = (): JSX.Element => {
    return (
      <>
            <Tabs>
        <Tabs.Tab active onClick={()=>{setView("dashboard")}}>IWB Catalog</Tabs.Tab>
      </Tabs>

      {loadingPage ? 
    
      <div>
      <Row style={{ padding: "0 5% 0 5%" }}>
        <Loader  active size="massive"/>
      </Row>
    </div>
    
        :

        <div>
  <Row style={{ padding: "0 5% 0 5%", margin: '5% 0 2% 0' }}>
    <Col>
    <Form>
    <Row style={{ margin: '1% 0 1% 0' }}>     
       <Col>
    <Form.Group>
      <Form.Control
        type="text"
        placeholder="Search Catalog"
        onChange={handleSearchChange}
      />
    </Form.Group>
    </Col>
    </Row>

    <Row style={{ margin: '1% 0 1% 0' }}>     
            <Col> <Form.Group>
     <Form.Select
            onChange={handleStyleChange}
        >
{styles.map((style) => (
              <option key={style} value={style}>
                {style === "All Styles" ? "All Styles" : style}
              </option>
            ))}
        </Form.Select>
        </Form.Group></Col>

      <Col><Form.Group>
     <Form.Select
            onChange={handleTypeChange}
        >
{types.map((style) => (
              <option key={style} value={style}>
                {style === "All Types" ? "All Types" : style}
              </option>
            ))}
        </Form.Select>
        </Form.Group></Col>

        <Col>
        <Radio toggle label="Animations" onChange={handleIncludeAnimationsChange} /></Col>
    </Row>

   

        
    </Form>
    </Col>


    <Col></Col>
  </Row>
        
  <Row style={{ padding: "0 5% 0 5%" }}>
            <Col>
            {/* <Input
              placeholder="Search catalog..."
              value={search}
              onChange={handleSearchChange}
              style={{ marginBottom: "20px", width: "100%" }}
            /> */}
              {renderPagination()}
            {renderTable()}
            {renderModal()}
          </Col>
          </Row>
        </div>
    }

      </>
    );
  };

  // Main getView function
  const getView = (): JSX.Element | null => {
    switch (view) {
      case "dashboard":
        return getDashboard();
        default:
        return <p>Invalid view selected.</p>;
    }
  };

   // Custom GLTF loader component
   const GLTFViewer: React.FC<{ url: string, showColliders: boolean  }> = ({ url }) => {
    const { scene } = useGLTF(url);

    useEffect(() => {
      scene.traverse((child:any) => {
        if (child.isMesh && child.name.endsWith("_collider")) {
          child.visible = showColliders; // Show or hide based on state
        }
      });
    }, [scene, showColliders]);
    return <primitive object={scene} scale={1.5} />;
  };


  const renderModal = () => (
<Modal show={showModal} onHide={closeModal} fullscreen={true} size="lg" centered style={{height:'100%'}}>
<Modal.Header closeButton>
  <Modal.Title>{modelName} 3D Model   <Radio toggle label="Hide Colliders" onChange={()=>{setShowColliders(!showColliders)}} /></Modal.Title>
  
</Modal.Header>
<Modal.Body>
  {current3DModel ? (
    <Canvas style={{ height: "90%", width: "100%" }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} />
      <OrbitControls />
      <GLTFViewer url={current3DModel} showColliders={showColliders} />
    </Canvas>
  ) : (
    <p>No model available</p>
  )}
</Modal.Body>
</Modal>
  );

  return (
    <div className="dcl page fullscreen">
         {getView()}
    </div>
  );
};
