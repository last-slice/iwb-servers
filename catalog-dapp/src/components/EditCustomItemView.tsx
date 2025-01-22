import React, { useState } from "react";
import { Card, Form, Row, Col } from "react-bootstrap";
import { Button, Header, Loader, Table, Tabs, Blockie, Address } from "decentraland-ui";

import { Room } from "colyseus.js";

interface EditAssetProps {
  asset: {
    enabled:boolean,
    id: string;
    name: string;
    model: string;
    customCollision: boolean;
    transform: {
        pos: { x: number; y: number; z: number };
        rot: { x: number; y: number; z: number };
        scl: { x: number; y: number; z: number };
    };
  };
  room: Room;
  models:string[],
  onSave: () => void; // Callback for saving the item
  onDelete: () => void; // Callback for deleting the item
  onUpdateItem: (updatedItem: any) => void;
}

const EditAssetView: React.FC<EditAssetProps> = ({ asset, room, models, onUpdateItem, onSave, onDelete }) => {
  const [transform, setTransform] = useState(asset.transform);

  const [modifier, setModifier] = useState(1);
  const [rModifier, setRModifier] = useState(0);

  const handleIncrement = (event: React.FormEvent, field: string, axis: string) => {
    event.preventDefault();
    setTransform((prev:any) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [axis]: prev[field][axis] + (field === "rot" ? rModifier : modifier),
      },
    }));

    room.send("custom-item-update", {
      id: asset.id,
      action:'transform',
      field:field,
      axis:axis,
      direction:1,
      modifier:field === "rot" ? rModifier : modifier
    });

    // Update the asset with the new transform
    const updatedAsset = { ...asset, transform: transform };
    onUpdateItem(updatedAsset); // Notify the parent
  };

  const handleDecrement = (event: React.FormEvent, field: string, axis: string) => {
    event.preventDefault();
    setTransform((prev:any) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [axis]: prev[field][axis] - (field === "rot" ? rModifier : modifier),
      },
    }));

    room.send("custom-item-update", {
      id: asset.id,
      action:'transform',
      field:field,
      axis:axis,
      direction:-1,
      modifier:field === "rot" ? rModifier : modifier
    });

     // Update the asset with the new transform
     const updatedAsset = { ...asset, transform: transform };
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

    asset.enabled = value

    room.send("custom-item-update", {
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
    setRModifier((prev) => (prev === 0 ? 90 : prev === 90 ? 45 : prev === 45 ? 15 : prev === 15 ? 5 : prev === 5 ? 1 : 0));
  };

  const deleteItem = (event: React.FormEvent) => {
    event.preventDefault()
    room.send('custom-item-delete', asset.id)
  }

  return (
    <div style={{ padding: "20px" }}>
      <Header>Edit Item - {asset.name}</Header>

      <Card style={{width:'50%'}}>
        <Card.Body>
          <Form>
          <Row style={{ marginTop: "20px 0 20px 0" }}>
          <Col>
        <Button  primary={asset.enabled ? true : undefined} onClick={(e)=>{
          toggleItemStatus(e,!asset.enabled)
        }} style={{ marginTop: "10px" }}>
          {asset.enabled ? "Disable" : "Enable"}
          </Button>
        </Col>
        </Row>
        
            <Form.Group controlId="formModel">
              <Form.Label>Model</Form.Label>
              <Form.Select
                onChange={(e) => handleModelChange(e, e.target.value)}
                value={asset.model}
            >
                {models.map((option:string, index:number) => (
                    <option key={index} value={option}>
                    {option}
                    </option>
                ))
                }
                </Form.Select>
            </Form.Group>

            {/* <Form.Group controlId="formCustomCollision">
              <Form.Label>Custom Collision</Form.Label>
              <Form.Control type="text" value={asset.customCollision ? "True" : "False"} disabled />
            </Form.Group> */}

            <Card.Title style={{ marginTop: "20px" }}>Transform</Card.Title>
            {/* positoin */}
            <Row>
          <Col>
            <div>
              <strong>Position X:</strong> {transform.pos.x.toFixed(2)}
            </div>
            <Button onClick={(e) => handleDecrement(e,"pos", "x")}>-</Button>
            <Button onClick={(e) => handleIncrement(e,"pos", "x")}>+</Button>
          </Col>
          <Col>
            <div>
              <strong>Position Y:</strong> {transform.pos.y.toFixed(2)}
            </div>
            <Button onClick={(e) => handleDecrement(e,"pos", "y")}>-</Button>
            <Button onClick={(e) => handleIncrement(e,"pos", "y")}>+</Button>
          </Col>
          <Col>
            <div>
              <strong>Position Z:</strong> {transform.pos.z.toFixed(2)}
            </div>
            <Button onClick={(e) => handleDecrement(e,"pos", "z")}>-</Button>
            <Button onClick={(e) => handleIncrement(e,"pos", "z")}>+</Button>
          </Col>
        </Row>

        <Row>
          <Col>
            <div>
              <strong>Scale X:</strong> {transform.scl.x.toFixed(2)}
            </div>
            <Button onClick={(e) => handleDecrement(e,"scl", "x")}>-</Button>
            <Button onClick={(e) => handleIncrement(e,"scl", "x")}>+</Button>
          </Col>
          <Col>
            <div>
              <strong>Scale Y:</strong> {transform.scl.y.toFixed(2)}
            </div>
            <Button onClick={(e) => handleDecrement(e,"scl", "y")}>-</Button>
            <Button onClick={(e) => handleIncrement(e,"scl", "y")}>+</Button>
          </Col>
          <Col>
            <div>
              <strong>Scale Z:</strong> {transform.scl.z.toFixed(2)}
            </div>
            <Button onClick={(e) => handleDecrement(e,"scl", "z")}>-</Button>
            <Button onClick={(e) => handleIncrement(e,"scl", "z")}>+</Button>
          </Col>
        </Row>

        {/* Modifier */}
        <Row style={{ marginTop: "20px" }}>
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
              <strong>Rotation X:</strong> {transform.rot.x.toFixed(2)}
            </div>
            <Button onClick={(e) => handleDecrement(e,"rot", "x")}>-</Button>
            <Button onClick={(e) => handleIncrement(e,"rot", "x")}>+</Button>
          </Col>
          <Col>
            <div>
              <strong>Rotation Y:</strong> {transform.rot.y.toFixed(2)}
            </div>
            <Button onClick={(e) => handleDecrement(e,"rot", "y")}>-</Button>
            <Button onClick={(e) => handleIncrement(e,"rot", "y")}>+</Button>
          </Col>
          <Col>
            <div>
              <strong>Rotation Z:</strong> {transform.rot.z.toFixed(2)}
            </div>
            <Button onClick={(e) => handleDecrement(e,"rot", "z")}>-</Button>
            <Button onClick={(e) => handleIncrement(e,"rot", "z")}>+</Button>
          </Col>
        </Row>

        {/* Modifier */}
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


        <Row style={{ marginTop: "20px" }}>
          <Col>
        <Button primary onClick={deleteItem}>
          Delete Item
        </Button>
        </Col>
        </Row>

          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default EditAssetView;
