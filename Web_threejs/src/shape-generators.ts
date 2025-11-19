// This file contains the shape generators for the drone show.
import { COLORS, randomRange } from './constants';

// Generators is an object that contains the shape generators for the drone show.
export const Generators = {
  // grid is a shape generator that creates a grid of drones.
  grid: (count: number, spacing: number) => {
    const data = [];
    const cols = Math.ceil(Math.sqrt(count));
    const gap = 30 * spacing;
    const offset = (cols * gap) / 2;
    for (let i = 0; i < count; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      data.push({ x: col * gap - offset, y: -200, z: row * gap - offset, color: COLORS.white });
    }
    return data;
  },
  // sphere is a shape generator that creates a sphere of drones.
  sphere: (count: number, spacing: number) => {
    const data = [];
    const radius = 250 * spacing;
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    for (let i = 0; i < count; i++) {
      const theta = 2 * Math.PI * i / goldenRatio;
      const phi = Math.acos(1 - 2 * (i + 0.5) / count);
      data.push({
        x: radius * Math.sin(phi) * Math.cos(theta),
        y: radius * Math.sin(phi) * Math.sin(theta),
        z: radius * Math.cos(phi),
        color: i % 2 === 0 ? COLORS.drone : COLORS.white
      });
    }
    return data;
  },
  // rings is a shape generator that creates the Olympic rings of drones.
  rings: (count: number, spacing: number) => {
    const data = [];
    const rings = [
      { x: -220 * spacing, y: 50 * spacing, color: COLORS.blue },
      { x: 0, y: 50 * spacing, color: COLORS.black },
      { x: 220 * spacing, y: 50 * spacing, color: COLORS.red },
      { x: -110 * spacing, y: -50 * spacing, color: COLORS.yellow },
      { x: 110 * spacing, y: -50 * spacing, color: COLORS.green },
    ];
    const particlesPerRing = Math.floor(count / 5);
    const radius = 90 * spacing;
    let particleIdx = 0;
    rings.forEach((ring) => {
      for (let i = 0; i < particlesPerRing; i++) {
        const angle = (i / particlesPerRing) * Math.PI * 2;
        data.push({
          x: ring.x + Math.cos(angle) * (radius + randomRange(-5, 5)),
          y: ring.y + Math.sin(angle) * (radius + randomRange(-5, 5)),
          z: randomRange(-10, 10),
          color: ring.color
        });
        particleIdx++;
      }
    });
    while (particleIdx < count) {
      data.push({ x: randomRange(-400, 400), y: randomRange(-300, 300), z: randomRange(-100, 100), color: COLORS.white });
      particleIdx++;
    }
    return data;
  },
  // helix is a shape generator that creates a helix of drones.
  helix: (count: number, spacing: number) => {
    const data = [];
    const turns = 5;
    const height = 600 * spacing;
    const radius = 150 * spacing;
    for (let i = 0; i < count; i++) {
      const progress = i / count;
      const angle = progress * Math.PI * 2 * turns;
      const y = (progress * height) - (height / 2);
      const isSecondStrand = i % 2 === 0;
      const currentAngle = isSecondStrand ? angle + Math.PI : angle;
      data.push({
        x: Math.cos(currentAngle) * radius,
        y: y,
        z: Math.sin(currentAngle) * radius,
        color: isSecondStrand ? COLORS.drone : '#FF00FF'
      });
    }
    return data;
  }
};