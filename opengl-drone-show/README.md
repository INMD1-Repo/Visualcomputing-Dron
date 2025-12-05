# OpenGL 드론 쇼

이 프로젝트는 C++ 기반의 OpenGL 애플리케이션으로, 드론 쇼를 시뮬레이션하고 시각화하기 위해 제작되었습니다.
GLFW를 이용해 창을 관리하고, GLEW로 OpenGL 확장을 로드하며, Dear ImGui를 통해 그래픽 사용자 인터페이스(GUI)를 제공합니다.
드론의 포메이션(배열)과 애니메이션은 JSON 설정 파일에서 불러옵니다.

## 주요 특징

* **3D 시각화**: 드론 포메이션을 3D 환경에서 렌더링.
* **카메라 컨트롤**: 3D 오빗(Orbit), 2D 탑다운(Top-down), 2D 프론트(Front) 뷰 지원.
* **애니메이션**: 큐빅 이징(cubic easing)을 통한 부드러운 포메이션 전환.
* **실시간 UI 조작**: 재생 속도, 타임라인 위치, 드론 크기, 표시 드론 개수 등을 실시간으로 조정.
* **파티클 효과**: 쇼 종료 시 간단한 불꽃놀이 이펙트.
* **JSON 지원**: 표준 JSON 파일에서 드론 위치와 색상 정보를 파싱.

## 의존성(Dependencies)

이 프로젝트를 빌드하고 실행하기 위해 다음 패키지가 필요합니다:

* **C++ 컴파일러**: C++11 이상을 지원하는 GCC(g++).
* **Make**: 빌드 자동화 도구.
* **벤더 라이브러리**(프로젝트의 `vendor/` 폴더에 포함):

  * GLEW
  * GLFW
  * Dear ImGui
  * cJSON
  * stb_image

### 시스템 요구 사항

* **Linux**: `build-essential`, `libglfw3-dev`, `libglew-dev`
  (GLEW는 vendor 제공 버전을 사용할 수 있으므로 선택 사항)
* **Windows**: MinGW-w64 또는 유사 환경 + GLFW 라이브러리 포함

## 빌드 방법

### 1. Linux

필요한 라이브러리를 설치한 뒤:

```bash
sudo apt-get install build-essential libglfw3-dev
```

프로젝트 디렉토리에서:

```bash
make
```

### 2. Windows

MSYS2 또는 MinGW에서 프로젝트 디렉토리로 이동한 후:

```bash
make
```

※ Windows에서는 GLFW 라이브러리 경로 설정이 필요할 수 있습니다.

## 실행 방법

빌드 후 `drone_show`(Windows는 `drone_show.exe`) 실행 파일이 생성됩니다.

```bash
./drone_show
```

애플리케이션은 기본적으로 `assets/example-drone-show.json` 파일을 로드합니다.

## 조작법

### 마우스

* **좌클릭 드래그**:

  * 3D 모드: 카메라 오빗
  * 2D 모드: 화면 패닝(Pan)
* **스크롤**: 줌 인/줌 아웃

### 사용자 인터페이스(UI)

UI 패널에서 다음을 조작할 수 있습니다:

* **재생/일시정지**
* **타임라인**(스크러버로 이동)
* **재생 속도 조절**
* **레이어 선택**(포메이션 간 전환)
* **뷰 모드 전환**(3D / 2D Top / 2D Front)
* **설정**: 불꽃놀이 효과, 시각적 옵션 등

## 디렉토리 구조

* `src/` : 소스 코드(`main.cpp`, 셰이더 등)
* `vendor/` : 서드파티 라이브러리(cJSON, ImGui, Glew, stb 등)
* `assets/` : 리소스(텍스처, JSON 생성 스크립트)
* `Makefile` : 빌드 스크립트