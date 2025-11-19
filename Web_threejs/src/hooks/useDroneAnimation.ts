// This file contains the custom hook for the drone show animation.
import { useState, useEffect, useRef, useMemo } from 'react';
import { DRONE_SHOW_JSON } from '../timeline';
import { Generators } from '../shape-generators';
import { TRANSITION_DURATION, easeInOutCubic } from '../constants';

interface Particle {
    x: number;
    y: number;
    z: number;
    color: string;
    phase: number;
}

interface Shape {
    x: number;
    y: number;
    z: number;
    color: string;
}

// useDroneAnimation is a custom hook that handles the drone show animation.
export const useDroneAnimation = (droneCount: number, spacingMultiplier: number, speedMultiplier: number, externalData: any) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0); // ms 단위

    const particlesRef = useRef<Particle[]>([]);
    const requestRef = useRef<number | null>(null);
    const previousTimeRef = useRef<number | null>(null);

    const timelineData = useMemo(() => externalData || DRONE_SHOW_JSON, [externalData]);

    const timelineInfo = useMemo(() => {
        let accumulated = 0;
        const segments = timelineData.layers.map((layer: any, index: number) => {
            const start = accumulated;
            accumulated += layer.duration;
            return { ...layer, startTime: start, endTime: accumulated, index };
        });
        return { segments, totalDuration: accumulated };
    }, [timelineData]);

    const allShapes = useMemo(() => {
        return timelineData.layers.map((layer: any) => {
            if (layer.type === 'custom' && layer.points) {
                // If the layer is of type 'custom' and has points, use them directly
                return layer.points;
            } else {
                // Otherwise, use the generators
                return (Generators as any)[layer.type](droneCount, spacingMultiplier) as Shape[]
            }
        });
    }, [droneCount, spacingMultiplier, timelineData]);

    useEffect(() => {
        particlesRef.current = new Array(droneCount).fill(0).map(() => ({
            x: 0, y: 0, z: 0, color: '#ffffff', phase: Math.random() * Math.PI * 2
        }));
    }, [droneCount]);

    const animate = (time: number) => {
        if (previousTimeRef.current != undefined) {
            const deltaTime = time - (previousTimeRef.current || 0);
            
            if (isPlaying) {
                setCurrentTime(prev => {
                    const nextTime = prev + deltaTime * speedMultiplier;
                    return nextTime >= timelineInfo.totalDuration ? 0 : nextTime;
                });
            }
        }
        previousTimeRef.current = time;
        requestRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, [isPlaying, speedMultiplier, timelineInfo.totalDuration]);

    const updateParticlesByTime = () => {
        const currentSegment = timelineInfo.segments.find((s: any) => currentTime >= s.startTime && currentTime < s.endTime) || timelineInfo.segments[timelineInfo.segments.length - 1];
        
        if (!currentSegment) return;

        const layerIndex = currentSegment.index;
        const segmentTime = currentTime - currentSegment.startTime;

        const fromShape = layerIndex === 0 ? allShapes[0] : allShapes[layerIndex - 1];
        const toShape = allShapes[layerIndex];

        let progress = 0;
        if (layerIndex > 0) {
           progress = Math.min(segmentTime / TRANSITION_DURATION, 1);
        } else {
           progress = 1;
        }
        
        const easedProgress = easeInOutCubic(progress);

        const particles = particlesRef.current;
        if (!particles || particles.length !== droneCount) return;

        for (let i = 0; i < droneCount; i++) {
            const p = particles[i];
            // Use modulo to loop through the points if there are more drones than points
            const start = fromShape[i % fromShape.length] || { x: 0, y: 0, z: 0, color: '#fff' };
            const end = toShape[i % toShape.length] || { x: 0, y: 0, z: 0, color: '#fff' };

            p.x = start.x + (end.x - start.x) * easedProgress;
            p.y = start.y + (end.y - start.y) * easedProgress;
            p.z = start.z + (end.z - start.z) * easedProgress;

            if (progress >= 1 || layerIndex === 0) {
                const hoverTime = Date.now() * 0.002;
                p.y += Math.sin(hoverTime + p.phase) * 2;
            }

            p.color = progress > 0.5 ? end.color : start.color;
        }
        
        return currentSegment;
    };

    const activeSegment = timelineInfo.segments.find((s: any) => currentTime >= s.startTime && currentTime < s.endTime) || timelineInfo.segments[0];

    return {
        isPlaying,
        setIsPlaying,
        currentTime,
        setCurrentTime,
        particlesRef,
        updateParticlesByTime,
        timelineInfo,
        activeSegment
    };
};