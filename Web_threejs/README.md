# Visual Computing Drone Show Animator

이 프로젝트는 JSON 파일을 통해 드론 쇼 애니메이션을 정의하고 시각화하는 도구입니다.

## 핵심 원리

### 1. 드론 쇼 정의 (JSON 파일)

드론 쇼의 애니메이션 데이터는 `example-drone-show.json`과 같은 JSON 파일 형식으로 정의됩니다. 이 파일은 여러 `layers` (레이어)로 구성되며, 각 레이어는 특정 애니메이션 시퀀스를 나타냅니다.

*   **`layers`**: 드론 쇼를 구성하는 개별 애니메이션 시퀀스의 배열입니다.
    *   **`id`**: 레이어의 고유 식별자입니다.
    *   **`name`**: 레이어의 이름 (예: "Square Formation").
    *   **`type`**: 레이어의 유형 (예: "custom").
    *   **`duration`**: 해당 레이어가 지속되는 시간 (밀리초).
    *   **`points`**: 드론의 위치와 색상을 정의하는 객체 배열입니다.
        *   **`x`, `y`, `z`**: 드론의 3차원 공간 내 위치 좌표입니다.
        *   **`color`**: 드론의 색상 (HEX 코드).

애플리케이션은 이 `points` 데이터를 기반으로 각 드론의 위치와 색상을 시간 경과에 따라 부드럽게 보간하여 애니메이션을 생성합니다.

### 2. 시각화 및 애니메이션 렌더링

프로젝트는 `src/components/renderers/Canvas2DRenderer.tsx` 및 `src/components/renderers/Canvas3DRenderer.tsx`를 사용하여 정의된 드론 쇼를 2D 또는 3D 환경에서 시각화합니다. `src/hooks/useDroneAnimation.ts`는 JSON 데이터에서 정의된 타임라인과 포인트를 기반으로 드론의 움직임과 색상 변화를 처리하는 핵심 애니메이션 로직을 담당합니다.

## 실행 방법

이 프로젝트는 [Vite](https://vitejs.dev/)와 [React](https://react.dev/) 기반의 TypeScript 웹 애플리케이션입니다.

1.  **의존성 설치:**
    프로젝트에 필요한 모든 Node.js 패키지를 설치합니다.
    ```bash
    npm install
    ```

2.  **개발 서버 실행:**
    개발 서버를 시작하고 웹 브라우저에서 실시간으로 변경 사항을 확인합니다.
    ```bash
    npm run dev
    ```
    일반적으로 `http://localhost:5173`과 같은 주소로 접근할 수 있습니다.

3.  **프로덕션 빌드:**
    배포를 위한 최적화된 프로덕션 빌드 파일을 생성합니다.
    ```bash
    npm run build
    ```
    빌드된 파일은 `dist` 디렉토리에 저장됩니다.
