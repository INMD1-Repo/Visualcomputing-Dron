// This file contains the constants and utility functions for the drone show simulator.

// WORLD_SIZE은 3D 캔버스에서 세계의 크기입니다.
export const WORLD_SIZE = 1000;
// TRANSITION_DURATION은 드론이 형상 간 전환하는 데 걸리는 시간(밀리초)입니다.
export const TRANSITION_DURATION = 2000; // 형상 변환에 걸리는 시간 (ms)

// COLORS는 드론 쇼에서 사용된 색상을 담고 있는 객체입니다.
// 변경 가능
export const COLORS = {
  blue: '#0081C8',
  yellow: '#FCB131',
  black: '#000000',
  green: '#00A651',
  red: '#EE334E',
  white: '#FFFFFF',
  drone: '#00FFFF'
};

// 랜덤 범위 함수는 주어진 최소값과 최대값 사이의 임의의 숫자를 반환합니다.
export const randomRange = (min: number, max: number) => Math.random() * (max - min) + min;

// easeInOutCubic은 3차 ease-in-out 애니메이션 값을 반환하는 유틸리티 함수입니다.
export const easeInOutCubic = (x: number) => {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
