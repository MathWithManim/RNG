'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ThreeJSScene = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000); // Narrower FOV to reduce stretching
    camera.position.z = 4; // Closer position to make it appear less stretched

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setClearColor(0x000000, 0); // Transparent background
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Limit pixel ratio for performance
    containerRef.current.appendChild(renderer.domElement);

    // Create a simpler geometry for better performance
    // Using a dodecahedron which has 12 pentagonal faces
    const customGeometry = new THREE.DodecahedronGeometry(1.2, 0); // Regular dodecahedron with 12 pentagonal faces

    // Create material with gradient colors
    const material = new THREE.MeshPhongMaterial({
      color: 0x4f46e5, // indigo color
      shininess: 100,
      transparent: true,
      opacity: 0.7,
      wireframe: false,
      flatShading: true, // Use flat shading to make faces more distinct
    });

    const shape = new THREE.Mesh(customGeometry, material);
    scene.add(shape);

    // Add wireframe for better visual effect to highlight congruent faces
    const wireframe = new THREE.WireframeGeometry(customGeometry);
    const line = new THREE.LineSegments(wireframe);

    // Handle material as potentially an array
    if (Array.isArray(line.material)) {
      line.material.forEach(mat => {
        (mat as THREE.Material).depthTest = false;
        (mat as THREE.Material).opacity = 0.8;
        (mat as THREE.Material).transparent = true;
      });
    } else {
      line.material.depthTest = false;
      line.material.opacity = 0.8;
      line.material.transparent = true;
    }
    // Set color separately as LineBasicMaterial has color property
    if (Array.isArray(line.material)) {
      line.material.forEach(mat => {
        if ('color' in mat) {
          (mat as THREE.LineBasicMaterial).color = new THREE.Color(0xffffff);
        }
      });
    } else {
      if ('color' in line.material) {
        (line.material as THREE.LineBasicMaterial).color = new THREE.Color(0xffffff);
      }
    }
    shape.add(line);

    // Add additional animated shapes for more visual interest
    const innerGeometry = new THREE.IcosahedronGeometry(0.8, 0);
    const innerMaterial = new THREE.MeshPhongMaterial({
      color: 0x8b5cf6, // purple color
      shininess: 80,
      transparent: true,
      opacity: 0.7,
      wireframe: false,
    });
    const innerShape = new THREE.Mesh(innerGeometry, innerMaterial);
    innerShape.rotation.x = Math.PI / 4;
    innerShape.rotation.y = Math.PI / 4;
    shape.add(innerShape);

    // Add simple lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Add background particles for more visual interest
    const particleCount = 500;
    const particlesGeometry = new THREE.BufferGeometry();
    const posArray = new Float32Array(particleCount * 3);

    for(let i = 0; i < particleCount * 3; i++){
        posArray[i] = (Math.random() - 0.5) * 20;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.05,
        color: 0x8b5cf6, // purple color
        transparent: true,
        opacity: 0.7
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      const time = Date.now() * 0.001;

      // Smooth rotation for the dodecahedron
      shape.rotation.x = Math.sin(time * 0.3) * 0.5;
      shape.rotation.y = Math.cos(time * 0.2) * 0.5;

      // Rotate the wireframe
      if (shape.children[0]) { // Wireframe is the first child
        shape.children[0].rotation.x = time * 0.2;
        shape.children[0].rotation.y = time * 0.3;
      }

      // Rotate and scale the inner shape
      if (shape.children[1]) { // Inner shape is the second child
        shape.children[1].rotation.x = -time * 0.8;
        shape.children[1].rotation.y = -time * 0.6;

        // Pulsing effect for inner shape
        const innerScale = 0.8 + Math.sin(time * 2) * 0.15;
        shape.children[1].scale.set(innerScale, innerScale, innerScale);
      }

      // Animate particles
      const positions = particlesMesh.geometry.attributes.position.array;
      for(let i = 0; i < 500; i++){
          const i3 = i * 3;
          // Move particles in a wave pattern
          positions[i3 + 1] = positions[i3 + 1] + Math.sin(time + positions[i3] * 0.1) * 0.01;
          positions[i3] = positions[i3] + Math.cos(time + positions[i3 + 1] * 0.1) * 0.01;
      }
      particlesMesh.geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    };

    window.addEventListener('resize', handleResize);

    // Start animation
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      customGeometry.dispose();
      innerGeometry.dispose();
      particlesGeometry.dispose();
      material.dispose();
      innerMaterial.dispose();
      particlesMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full"
    />
  );
};

export default ThreeJSScene;