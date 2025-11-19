//@ts-nocheck
// This file contains the 3D canvas renderer for the drone show.
import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

interface Particle {
  x: number;
  y: number;
  z: number;
  color: string;
  phase: number;
}

interface Canvas3DRendererProps {
  particlesRef: React.MutableRefObject<Particle[]>;
  updateParticles: () => void;
  droneCount: number;
}

// Canvas3DRenderer는 드론 쇼를 3D로 렌더링하는 구성 요소입니다.
function Canvas3DRenderer({ particlesRef, updateParticles, droneCount }: Canvas3DRendererProps) {
  const [count, setCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const updateParticlesRef = useRef(updateParticles);
  useEffect(() => { updateParticlesRef.current = updateParticles; }, [updateParticles]);

  useEffect(() => {
    setCount(1)
    if (!containerRef.current) return;

    // Scene Setup
    const scene = new THREE.Scene();

    //중복 랜더링 방지코드
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }


    scene.background = new THREE.Color(0x111827);
    scene.fog = new THREE.FogExp2(0x111827, 0.0015);

    const camera = new THREE.PerspectiveCamera(60, containerRef.current.clientWidth / containerRef.current.clientHeight, 1, 4000);
    camera.position.set(0, 300, 1000);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Geometry Setup
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(droneCount * 3);
    const colors = new Float32Array(droneCount * 3);
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Texture
    const canvas = document.createElement('canvas');
    canvas.width = 32; canvas.height = 32;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 32, 32);
    }
    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: 10,
      vertexColors: true,
      map: texture,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // Controls
    let isDragging = false, px = 0, py = 0, theta = 0.2, phi = 1.4, radius = 1000;

    const onDown = (e) => {
      isDragging = true;
      px = e.touches ? e.touches[0].clientX : e.clientX;
      py = e.touches ? e.touches[0].clientY : e.clientY;
    };
    const onUp = () => isDragging = false;
    const onMove = (e) => {
      if (!isDragging) return;
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const cy = e.touches ? e.touches[0].clientY : e.clientY;
      theta -= (cx - px) * 0.005;
      phi -= (cy - py) * 0.005;
      phi = Math.max(0.1, Math.min(Math.PI - 0.1, phi));
      px = cx; py = cy;
      if (e.type === 'touchmove' && e.cancelable) e.preventDefault();
    };

    // [Zoom 기능 추가] 마우스 휠로 radius 조절
    const onWheel = (e) => {
      e.preventDefault();
      // 휠 방향에 따라 radius 증감 (감도 조절: 0.5)
      radius += e.deltaY * 0.5;
      // 줌 제한 (최소 100, 최대 3000)
      radius = Math.max(100, Math.min(3000, radius));
    };

    const container = containerRef.current;
    container.addEventListener('mousedown', onDown); window.addEventListener('mouseup', onUp); window.addEventListener('mousemove', onMove);
    container.addEventListener('touchstart', onDown, { passive: false }); window.addEventListener('touchend', onUp); window.addEventListener('touchmove', onMove, { passive: false });
    
    // 휠 이벤트 추가 ({ passive: false }로 preventDefault 허용)
    container.addEventListener('wheel', onWheel, { passive: false });

    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);

      updateParticlesRef.current();

      const currentParticles = particlesRef.current;
      if (currentParticles.length !== droneCount) return;

      const pos = points.geometry.attributes.position.array;
      const col = points.geometry.attributes.color.array;
      const c = new THREE.Color();

      for (let i = 0; i < droneCount; i++) {
        const p = currentParticles[i];
        pos[i * 3] = p.x; pos[i * 3 + 1] = p.y; pos[i * 3 + 2] = p.z;
        c.set(p.color);
        col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
      }
      points.geometry.attributes.position.needsUpdate = true;
      points.geometry.attributes.color.needsUpdate = true;

      camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
      camera.position.y = radius * Math.cos(phi);
      camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
      camera.lookAt(scene.position);

      if (!isDragging) theta += 0.0003;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      container.removeEventListener('mousedown', onDown); window.removeEventListener('mouseup', onUp); window.removeEventListener('mousemove', onMove);
      container.removeEventListener('touchstart', onDown); window.removeEventListener('touchend', onUp); window.removeEventListener('touchmove', onMove);
      container.removeEventListener('wheel', onWheel); // 이벤트 제거

      // [Cleanup] 메모리 누수 방지 및 DOM 정리
      if (containerRef.current && renderer.domElement) {
        try {
          containerRef.current.removeChild(renderer.domElement);
        } catch (e) {
          // 이미 삭제된 경우 무시
        }
      }
      geometry.dispose(); material.dispose();
    };
  }, [droneCount]);

  return <div ref={containerRef} className="w-full h-full block touch-none" />;
}

export default Canvas3DRenderer;