# OpenGL 드론 쇼

이 프로젝트는 웹 기반 드론 쇼 시뮬레이터의 C++/OpenGL 버전입니다. GLFW를 사용해 윈도우를 생성하고, GLEW로 OpenGL 확장을 관리하며, Dear ImGui로 UI를 구성하고, cJSON으로 드론 쇼 파일을 파싱합니다.

## 의존성

컴파일하기 전에 다음 패키지들이 시스템에 설치되어 있어야 합니다.

Debian/Ubuntu 계열 시스템의 경우:

```bash
sudo apt-get update
sudo apt-get install build-essential g++ libglfw3-dev
```

## 라이브러리 설정

이 프로젝트는 저장소에 포함되지 않은 여러 서드파티 라이브러리에 의존합니다. 아래 설명된 대로 해당 라이브러리들을 다운로드하여 `vendor/` 디렉터리에 배치해야 합니다.

### 1. cJSON

1. [cJSON GitHub 저장소](https://github.com/DaveGamble/cJSON)로 이동합니다.
2. `cJSON.c`와 `cJSON.h` 파일을 다운로드합니다.
3. 두 파일을 `vendor/cJSON/` 디렉터리에 넣습니다.

### 2. GLEW (OpenGL Extension Wrangler Library)

1. [GLEW 공식 사이트](https://glew.sourceforge.net/)에서 소스 코드를 다운로드합니다.
2. 다운로드한 압축 파일에서 다음 파일들을 추출하여 복사합니다:

   * `glew.c` → `vendor/glew/src/glew.c`
   * `glew.h` → `vendor/glew/include/GL/glew.h`
   * `wglew.h` → `vendor/glew/include/GL/wglew.h`

### 3. Dear ImGui

1. [Dear ImGui GitHub 저장소](https://github.com/ocornut/imgui)로 이동합니다.
2. 저장소를 클론하거나 ZIP 파일을 다운로드합니다.
3. ImGui 폴더에서 다음 파일들을 `vendor/imgui/` 디렉터리에 복사합니다:

   * `imconfig.h`
   * `imgui.h`
   * `imgui.cpp`
   * `imgui_draw.cpp`
   * `imgui_tables.cpp`
   * `imgui_widgets.cpp`
   * `imgui_internal.h`
   * 그리고 `backends/` 폴더에서:

     * `imgui_impl_glfw.h`
     * `imgui_impl_glfw.cpp`
     * `imgui_impl_opengl3.h`
     * `imgui_impl_opengl3.cpp`

모든 파일을 구성하면 `vendor/` 디렉터리는 다음과 같은 구조가 됩니다:

```
vendor/
├── cJSON/
│   ├── cJSON.c
│   └── cJSON.h
├── glew/
│   ├── include/GL/
│   │   ├── glew.h
│   │   └── wglew.h
│   └── src/
│       └── glew.c
└── imgui/
    ├── imconfig.h
    ├── imgui.h
    ├── imgui.cpp
    ├── ... (기타 imgui 소스 파일)
    ├── imgui_impl_glfw.h
    ├── imgui_impl_glfw.cpp
    ├── imgui_impl_opengl3.h
    └── imgui_impl_opengl3.cpp
```

## 빌드 및 실행

모든 의존성이 설치되고 라이브러리가 준비되었으면 제공된 `Makefile`을 사용해 프로젝트를 빌드할 수 있습니다.

1. 프로젝트 루트 디렉터리에서 터미널을 엽니다.
2. 아래 명령어를 실행합니다:

   ```bash
   make
   ```
3. 빌드가 완료되면 `drone_show`라는 실행 파일이 생성됩니다.
4. 프로그램 실행:

   ```bash
   ./drone_show
   ```