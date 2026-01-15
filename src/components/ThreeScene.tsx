import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const ThreeScene: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mountElement = mountRef.current;
    if (!mountElement) return;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0); // transparent
    mountElement.appendChild(renderer.domElement);

    // Brand colors
    const colors = {
      navy: 0x006D88,
      blue: 0x00B4FF,
      mint: 0x48E5B6,
    };

    // Create animated cubes
    const createCube = (color: number, position: THREE.Vector3) => {
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshPhongMaterial({ color, transparent: true, opacity: 0.8 });
      const cube = new THREE.Mesh(geometry, material);
      cube.position.copy(position);
      scene.add(cube);
      return cube;
    };

    const cubes = [
      createCube(colors.mint, new THREE.Vector3(-2, 1, -1)),
      createCube(colors.blue, new THREE.Vector3(0, -1, -2)),
      createCube(colors.navy, new THREE.Vector3(2, 1, -3)),
    ];

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(colors.blue, 1);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      cubes.forEach((cube, index) => {
        cube.rotation.x += 0.01 + (index * 0.002);
        cube.rotation.y += 0.01 + (index * 0.003);
        cube.position.y += Math.sin(Date.now() * 0.001 + index) * 0.005;
      });

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountElement && mountElement.contains(renderer.domElement)) {
        mountElement.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 pointer-events-none z-0"
      style={{ height: '100vh' }}
    />
  );
};

export default ThreeScene;
