"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

interface Scene3DProps {
  isSpeaking?: boolean;
}

interface MouthVertexData {
  mesh: THREE.Mesh;
  originalPositions: Float32Array;
  mouthVertexIndices: number[];
}

export function Scene3D({ isSpeaking = false }: Scene3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isSpeakingRef = useRef(isSpeaking);
  const mouthDataRef = useRef<MouthVertexData[]>([]);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    model: THREE.Group | null;
    mixer: THREE.AnimationMixer | null;
    clock: THREE.Clock;
  } | null>(null);

  // Update ref when prop changes
  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  useEffect(() => {
    if (!containerRef.current || sceneRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#0a0a0c");

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.2, 4);
    camera.lookAt(0, 1.0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xffffff, 1);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x6366f1, 0.5);
    pointLight2.position.set(-5, 3, 2);
    scene.add(pointLight2);

    const spotLight = new THREE.SpotLight(0x818cf8, 1);
    spotLight.position.set(0, 5, 3);
    spotLight.angle = 0.4;
    spotLight.penumbra = 0.5;
    scene.add(spotLight);

    // Load Shiba GLB model
    let model: THREE.Group | null = null;
    let mixer: THREE.AnimationMixer | null = null;

    const loader = new GLTFLoader();
    loader.load(
      "/models/shiba.glb",
      (gltf) => {
        model = gltf.scene;
        model.position.set(0, 0.5, 0);
        model.scale.setScalar(0.8);
        scene.add(model);

        // Play animations if available
        if (gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(model);
          const action = mixer.clipAction(gltf.animations[0]);
          action.play();
        }

        // Find mouth vertices for animation
        mouthDataRef.current = [];
        model.traverse((child) => {
          if (child instanceof THREE.Mesh && child.geometry) {
            const geometry = child.geometry as THREE.BufferGeometry;
            const positions = geometry.attributes.position;

            if (positions) {
              // Store original positions
              const originalPositions = new Float32Array(positions.array.length);
              originalPositions.set(positions.array as Float32Array);

              // Find vertices in mouth area (front-facing, lower part of head)
              const mouthVertexIndices: number[] = [];
              const boundingBox = new THREE.Box3().setFromObject(child);
              const modelHeight = boundingBox.max.y - boundingBox.min.y;
              const modelDepth = boundingBox.max.z - boundingBox.min.z;

              for (let i = 0; i < positions.count; i++) {
                const x = positions.getX(i);
                const y = positions.getY(i);
                const z = positions.getZ(i);

                // Mouth area: center horizontally, lower-middle vertically, front of face
                const relativeY = (y - boundingBox.min.y) / modelHeight;
                const relativeZ = (z - boundingBox.min.z) / modelDepth;

                // Adjust these values based on model structure
                // Mouth: center X, 25-50% Y, front but not nose tip (Z 0.5-0.85)
                const isInMouthArea =
                  Math.abs(x) < modelHeight * 0.3 && // center horizontally
                  relativeY > 0.25 && relativeY < 0.5 && // lower face area
                  relativeZ > 0.5 && relativeZ < 0.85; // front face, exclude nose tip

                if (isInMouthArea) {
                  mouthVertexIndices.push(i);
                }
              }

              if (mouthVertexIndices.length > 0) {
                mouthDataRef.current.push({
                  mesh: child,
                  originalPositions,
                  mouthVertexIndices,
                });
                console.log(`Found ${mouthVertexIndices.length} mouth vertices in mesh: ${child.name}`);
              }
            }
          }
        });

        if (sceneRef.current) {
          sceneRef.current.model = model;
          sceneRef.current.mixer = mixer;
        }
      },
      undefined,
      (error) => {
        console.error("Error loading Shiba model:", error);
      }
    );

    const clock = new THREE.Clock();

    sceneRef.current = { scene, camera, renderer, model, mixer, clock };

    // Animation loop
    const animate = () => {
      if (!sceneRef.current) return;
      requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Update animation mixer
      if (sceneRef.current.mixer) {
        sceneRef.current.mixer.update(delta);
      }

      // Model floating animation
      if (sceneRef.current.model) {
        sceneRef.current.model.rotation.y = Math.sin(elapsed * 0.3) * 0.2;
        sceneRef.current.model.position.y = 0.5 + Math.sin(elapsed * 2) * 0.05;
      }

      // Mouth animation when speaking
      for (const data of mouthDataRef.current) {
        const positions = data.mesh.geometry.attributes.position;

        if (isSpeakingRef.current) {
          // Animate mouth vertices with wave effect
          for (const idx of data.mouthVertexIndices) {
            const originalY = data.originalPositions[idx * 3 + 1];
            const originalZ = data.originalPositions[idx * 3 + 2];

            // Create speech-like movement
            const wave1 = Math.sin(elapsed * 15 + idx * 0.5) * 0.015;
            const wave2 = Math.sin(elapsed * 25 + idx * 0.3) * 0.008;
            const displacement = wave1 + wave2;

            positions.setY(idx, originalY + displacement);
            positions.setZ(idx, originalZ + displacement * 0.5);
          }
          positions.needsUpdate = true;
        } else {
          // Restore original positions when not speaking
          let needsUpdate = false;
          for (const idx of data.mouthVertexIndices) {
            const originalY = data.originalPositions[idx * 3 + 1];
            const originalZ = data.originalPositions[idx * 3 + 2];
            const currentY = positions.getY(idx);
            const currentZ = positions.getZ(idx);

            // Smooth transition back to original
            if (Math.abs(currentY - originalY) > 0.0001 || Math.abs(currentZ - originalZ) > 0.0001) {
              positions.setY(idx, currentY + (originalY - currentY) * 0.1);
              positions.setZ(idx, currentZ + (originalZ - currentZ) * 0.1);
              needsUpdate = true;
            }
          }
          if (needsUpdate) {
            positions.needsUpdate = true;
          }
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!containerRef.current || !sceneRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      sceneRef.current.camera.aspect = w / h;
      sceneRef.current.camera.updateProjectionMatrix();
      sceneRef.current.renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      container.removeChild(renderer.domElement);
      sceneRef.current = null;
      mouthDataRef.current = [];
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute left-0 right-0"
      style={{
        top: "-30%",
        height: "100%",
        background: "linear-gradient(180deg, #0a0a0c 0%, #111118 100%)"
      }}
    />
  );
}
