# 드론 쇼 시뮬레이터 (Drone Show Simulator)

이 저장소는 드론 쇼 시뮬레이션이라는 동일한 주제를 두 가지 다른 기술 스택으로 구현한 프로젝트 입니다.. 하나는 C++과 OpenGL을 사용한 네이티브 데스크톱 애플리케이션이고, 다른 하나는 React와 Three.js를 사용한 최신 웹 애플리케이션입니다.<br/>
> 슬픈 소식은 원래 웹으로만 했는데 교수님이 OpenGL을 해라고해서 다시 한 ㅜㅜ
## 프로젝트

### 1. Web-based Drone Show Simulator (Web_threejs)

최신 웹 기술을 활용하여 브라우저에서 드론 쇼를 시각화하는 프로젝트입니다. React, Three.js, Vite를 기반으로 구축되었으며, 2D 및 3D 시각화, 재생 제어, 실시간 설정 변경 등 풍부한 인터랙션을 제공합니다.

**주요 기능:**

-   **2D 및 3D 렌더링 모드:** 사용자가 원하는 관점에서 드론 쇼를 볼 수 있습니다.
-   **재생 컨트롤:** 타임라인을 통해 재생, 일시정지, 특정 시간으로 이동이 가능합니다.
-   **실시간 설정:** 드론 개수, 속도, 간격 등을 즉시 변경하며 시뮬레이션을 관찰할 수 있습니다.
-   **커스텀 데이터 로드:** JSON 형식의 드론 쇼 파일을 불러와 시뮬레이션할 수 있습니다.
-   **모던 UI:** React와 Tailwind CSS로 구축된 반응형 사용자 인터페이스를 제공합니다.

**실행 방법:**

1.  프로젝트 디렉토리로 이동합니다.
    ```bash
    cd Web_threejs
    ```
2.  필요한 패키지를 설치합니다.
    ```bash
    # npm 사용 시
    npm install

    # yarn 사용 시
    yarn install
    ```
3.  개발 서버를 실행합니다.
    ```bash
    # npm 사용 시
    npm run dev

    # yarn 사용 시
    yarn dev
    ```
4.  터미널에 표시된 URL(예: `http://localhost:5173`)을 웹 브라우저에서 엽니다.

---

### 2. C++/OpenGL Drone Show Simulator (opengl-drone-show)

C++과 OpenGL을 사용하여 고성능 데스크톱 환경에서 드론 쇼를 렌더링하는 네이티브 애플리케이션입니다. Dear ImGui를 통해 사용자 인터페이스를 제공하며, cJSON 라이브러리로 드론 쇼 파일을 파싱합니다.

**주요 기능:**

-   **고성능 렌더링:** OpenGL을 통해 수많은 드론을 효율적으로 처리합니다.
-   **GUI 컨트롤:** Dear ImGui를 사용하여 기본적인 설정을 제어할 수 있습니다.
-   **JSON 파싱:** cJSON을 사용하여 드론 쇼 데이터 파일을 읽어옵니다.
-   **크로스플랫폼 빌드:** Windows(MSYS2) 및 Linux 환경에서 빌드를 지원합니다.

**실행 방법:**

1.  **사전 준비:** 사용 중인 운영 체제에 맞는 빌드 도구를 설치해야 합니다.
    -   **Windows:** MSYS2 환경과 `mingw-w64-x86_64-toolchain`, `make`, `glfw` 패키지가 필요합니다.
    -   **Debian/Ubuntu:** `build-essential`, `g++`, `make`, `libglfw3-dev` 패키지가 필요합니다.
    -   (자세한 내용은 `opengl-drone-show/README.md`를 참고하세요.)

2.  프로젝트 디렉토리로 이동합니다.
    ```bash
    cd opengl-drone-show
    ```
3.  `make` 명령어를 사용하여 프로젝트를 빌드합니다.
    ```bash
    make
    ```
4.  빌드가 완료되면 생성된 실행 파일을 실행합니다.
    ```bash
    # Windows
    ./drone_show.exe

    # Linux
    ./drone_show
    ```
    
> 자세한거는 해당 폴더에 있는 리드미 파일을 보세요!