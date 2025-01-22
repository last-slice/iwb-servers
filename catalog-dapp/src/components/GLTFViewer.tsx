import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

const GLTFViewer: React.FC<{ url: string; zoom?: number }> = ({ url, zoom = 1 }) => {
  const { scene } = useGLTF(url);

  // Filter out meshes with "_collider" in their name
  React.useEffect(() => {
    scene.traverse((child:any) => {
      if (child.isMesh && child.name.endsWith("_collider")) {
        child.visible = false; // Hide meshes with "_collider"
      }
    });
  }, [scene]);

  return (
    <Canvas
      camera={{ position: [0, 0, 5 * zoom] }}
      style={{ height: "100%", width: "100%" }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} />
      <OrbitControls />
      <primitive object={scene} scale={zoom} />
    </Canvas>
  );
};

export default GLTFViewer;
