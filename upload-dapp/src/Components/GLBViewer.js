import React, { useRef, useState, useEffect, Suspense } from "react";
import { Canvas } from "react-three-fiber";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';
// import { Stats, OrbitControls, Circle } from '@react-three/drei'
import { useLoader } from '@react-three/fiber'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {Row, Col, Button} from 'react-bootstrap'
import { memo } from "react";
import { AnimationMixer, LoopOnce } from 'three';


function GLBViewer({ glbFile, cb }) {
  const width = window.innerWidth / 2.5
  const height = window.innerHeight / 2

  const [file, setFile] = useState(glbFile);
  const [selectedGLB, setGLB] = useState(null)

  const [polygonCount, setPolygonCount] = useState(0)
  const [animations, setAnimations] = useState([])
  const [scale, setScale] = useState({x:0, y:0, z:0})

  const canvasRef = useRef(null);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer();
  const controls = new OrbitControls( camera, renderer.domElement );
  const [currentAnimationIndex, setCurrentAnimationIndex] = useState(-1);
  const mixer = new AnimationMixer();


  // Add an ambient light to the scene
  const ambientLight = new THREE.AmbientLight(0xffffff, 1); // Color, Intensity
  // scene.add(ambientLight);

  renderer.setClearColor(new THREE.Color(0xeeeeee)); // Change the color as needed


  useEffect(() => {
    if (canvasRef.current) {
      // Initialize the renderer and add it to the component's DOM element.
      // renderer.setSize(window.innerWidth / 2, window.innerHeight);
      renderer.setSize(width, height);
      canvasRef.current.appendChild(renderer.domElement);

      // Initialize the camera position
      camera.position.z = 5;

      // Load and display the uploaded GLB file
      if (file) {
        const loader = new GLTFLoader();
        loader.load(URL.createObjectURL(file), (gltf) => {
          // Adjust the position, rotation, and scale as needed

          const model = gltf.scene;

           // Get all animations from the model
          const animations = gltf.animations;
          console.log('animations', animations)
          setAnimations(animations)

          // Calculate the poly count
          let polygonCount = 0;
          model.traverse((child) => {
            if (child.isMesh) {
              polygonCount += child.geometry.index ? child.geometry.index.count / 3 : 0;
            }
          });
          setPolygonCount(polygonCount)


          const box = new THREE.Box3().setFromObject(model);

          // Calculate the dimensions of the cube
          const width = box.max.x - box.min.x
          const height = box.max.y - box.min.y
          const depth = box.max.z - box.min.z

          console.log('boundaries', width, height, depth)
          let scale = {x:width, y:height, z:depth}

          setScale(scale)

          cb({polygonCount, scale, animations})

          gltf.scene.position.set(0, 0, 0);
          gltf.scene.rotation.set(0, 0, 0);
          gltf.scene.scale.set(1, 1, 1);

          setGLB(gltf.scene)

          // Remove any previous objects from the scene
          scene.clear();

          // Add the loaded GLB model to the scene
          scene.add(gltf.scene);
          scene.add(ambientLight);

          // Animate the scene
          const animate = () => {
            requestAnimationFrame(animate);
            controls.update()
            renderer.render(scene, camera);
          };
          animate();
        });
      } else {
        // Animate the scene with just the cube (no GLB file loaded)
        const animate = () => {
          requestAnimationFrame(animate);
          controls.update()
          renderer.render(scene, camera);
        };
        animate();
      }
    }
  },[]);

  const handlePlayAnimation = (animationIndex) => {
    setCurrentAnimationIndex(animationIndex);
  };

  useEffect(() => {
    const animate = () => {
      requestAnimationFrame(animate);

      // Update animations only when a valid animation index is selected
      if (currentAnimationIndex >= 0 && animations[currentAnimationIndex]) {
        const animationClip = animations[currentAnimationIndex];
        animationClip.update(0.01); // You can adjust the time parameter as needed
      }

      // Render the scene
      renderer.render(scene, camera);
    };

    animate();
  }, [currentAnimationIndex, animations]);
  
  return (
    <Suspense fallback={null}>
      <Row>
        <Col>
        <div className="viewer" ref={canvasRef}></div>
        </Col>
      </Row>

      <Row style={{marginTop:"10em"}}>
        <Col>

        <div className="dcl header-menu ">
          <div className="dcl header-menu-left">
            <div className="ui large header">Asset Statistics</div>
          </div>
        </div>


<table className="ui very basic table">
  <thead className="">
    <tr className="">
      <th className="">Name</th>
      <th className="">Value</th>
      <th className="">Limit</th>
      </tr>
      </thead>
      <tbody className="">
        <tr >
          <td className="closed" style={{color:'white'}}>
            Polycount
            </td>
            <td className="closed" style={{color:'white'}}>
              {polygonCount}
              </td>
              <td className="closed" style={{color:'white'}}>
              </td>
            </tr>

            <tr >
          <td className="closed" style={{color:'white'}}>
            Size
            </td>
            <td className="closed" style={{color:'white'}}>
              {(glbFile.size / 1024 / 1024).toFixed(2)} MB
              </td>
              <td className="closed" style={{color:'white'}}>
                50 MB
              </td>
            </tr>

            <tr >
          <td className="closed" style={{color:'white'}}>
            Animations
            </td>
            <td className="closed" style={{color:'white'}}>
              {animations.length} total
              </td>
              <td className="closed" style={{color:'white'}}>
              </td>
            </tr>

            {animations.map((animation, i)=>(
              <tr key={i}>
              <td className="closed" style={{color:'white'}}>
                {animation.name}
                </td>
                <td className="closed" style={{color:'white'}}>
                  {animation.duration.toFixed(2)} Seconds
                  </td>
                  <td className="closed" style={{color:'white'}}>
                  {/* <label className="ui button" onClick={() => handlePlayAnimation(i)}>Play Animation</label> */}
                  </td>
                </tr>
            ))}
          </tbody>
        </table>
      </Col></Row>
    </Suspense>
  );
}

export default memo(GLBViewer);








// function GLBViewer({ glbFile }) {

//   console.log("file i is", glbFile)

//   const gltf = useLoader(
//     GLTFLoader,
//     glbFile
//   )

//   const model = gltf.scene;
//   let polygonCount = 0;

//   // Traverse the model's children (assuming it's a group)
//   model.traverse((child) => {
//     if (child.isMesh) {
//       // Each mesh represents a part of the model with its own geometry
//       // Add the face count of the mesh's geometry to the polygonCount
//       polygonCount += child.geometry.index ? child.geometry.index.count / 3 : child.geometry.attributes.position.count / 3;
//     }
//   });

//   console.log(`Polygon Count: ${polygonCount}`);


//   return (
   
//     <Canvas camera={{ position: [-0.5, 1, 2] }} shadows>
//         <directionalLight position={[3.3, 1.0, 4.4]} castShadow intensity={Math.PI * 2} />
//         <Suspense fallback={null}>
//         <primitive object={gltf.scene} position={[0, 1, 0]} children-0-castShadow />
//         </Suspense>
//         <Circle args={[10]} rotation-x={-Math.PI / 2} receiveShadow>
//           <meshStandardMaterial />
//         </Circle>
//         <OrbitControls target={[0, 1, 0]} />
//       </Canvas>
//   );
// }

// export default GLBViewer;
