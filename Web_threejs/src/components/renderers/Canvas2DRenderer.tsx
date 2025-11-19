// This file contains the 2D canvas renderer for the drone show.
import { useRef, useEffect } from 'react';

interface Particle {
    x: number;
    y: number;
    z: number;
    color: string;
    phase: number;
}

interface Canvas2DRendererProps {
    particlesRef: React.MutableRefObject<Particle[]>;
    updateParticles: () => void;
    droneCount: number;
}

// Canvas2DRenderer is a component that renders the drone show in 2D.
function Canvas2DRenderer({ particlesRef, updateParticles, droneCount }: Canvas2DRendererProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const updateParticlesRef = useRef(updateParticles);
    
    useEffect(() => { updateParticlesRef.current = updateParticles; }, [updateParticles]);
  
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      let animationId: number;
  
      const render = () => {
        if (canvas.width !== canvas.offsetWidth || canvas.height !== canvas.offsetHeight) {
          canvas.width = canvas.offsetWidth;
          canvas.height = canvas.offsetHeight;
        }
        const w = canvas.width, h = canvas.height;
        const cx = w / 2, cy = h / 2;
  
        // [Time-based] 부모가 계산한 위치 정보를 가져옴 (이 안에서 particlesRef가 갱신됨)
        updateParticlesRef.current();
  
        // 배경 및 잔상
        ctx.fillStyle = 'rgba(17, 24, 39, 0.5)'; // 3D 뷰보다 약간 더 진하게
        ctx.fillRect(0, 0, w, h);
  
        const particles = particlesRef.current;
        if (!particles || particles.length !== droneCount) return;
  
        // Batch Drawing
        for (let i = 0; i < droneCount; i++) {
          const p = particles[i];
          // 원근 투영
          const fov = 800;
          const scale = fov / (fov + p.z + 400);
          const x2d = p.x * scale + cx;
          const y2d = -p.y * scale + cy; 
  
          if (scale > 0) {
            ctx.beginPath();
            ctx.arc(x2d, y2d, Math.max(0.4, 2.5 * scale), 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
          }
        }
        animationId = requestAnimationFrame(render);
      };
      render();
      return () => cancelAnimationFrame(animationId);
    }, [droneCount]); 
    return <canvas ref={canvasRef} className="w-full h-full block touch-none" />;
  }

  export default Canvas2DRenderer;