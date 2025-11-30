# OpenGL Drone Show

This project is a C++/OpenGL version of a web-based drone show simulator. It uses GLFW for windowing, GLEW for OpenGL extensions, Dear ImGui for the UI, and cJSON for parsing drone show files.

## Prerequisites

Before compiling, you need to set up the appropriate build environment for your operating system.

### For Windows

The recommended way to build on Windows is by using the MSYS2 environment.

1.  **Install MSYS2:** Download and install MSYS2 from the official website: [https://www.msys2.org/](https://www.msys2.org/)

2.  **Open MSYS2 Terminal:** After installation, launch the "MSYS2 MINGW64" terminal.

3.  **Update Packages:** Run the following command to update the package database and core packages. Close the terminal and reopen it if prompted.
    ```sh
    pacman -Syu
    ```

4.  **Install Build Tools:** Install the C++ compiler (`g++`), `make`, and the `glfw` library by running:
    ```sh
    pacman -S --needed base-devel mingw-w64-x86_64-toolchain mingw-w64-x86_64-glfw make
    ```

### For Debian/Ubuntu

You can install the required packages using `apt-get`:
```bash
sudo apt-get update
sudo apt-get install build-essential g++ make libglfw3-dev
```

## Build and Run

Once the prerequisites for your OS are installed, you can build and run the project using the provided `Makefile`.

1.  **Navigate to Project Directory:** Open your terminal (MSYS2 MINGW64 on Windows) and navigate to the project's root directory.

2.  **Build the Project:** Run the `make` command.
    ```sh
    make
    ```

3.  **Run the Application:** This will create an executable file.
    *   On Windows: `drone_show.exe`
    *   On Linux/macOS: `drone_show`

    Run it from the terminal:
    ```sh
    # On Windows
    ./drone_show.exe

    # On Linux
    ./drone_show
    ```
# OpenGL 드론 쇼

이 프로젝트는 웹 기반 드론 쇼 시뮬레이터의 C++/OpenGL 버전입니다. GLFW로 창을 생성하고, GLEW로 OpenGL 확장을 관리하며, Dear ImGui로 UI를, cJSON으로 드론 쇼 파일을 파싱합니다.

## 사전 준비

컴파일하기 전에 운영 체제에 맞는 빌드 환경을 설정해야 합니다.

### Windows

Windows에서는 MSYS2 환경을 사용하여 빌드하는 것을 권장합니다.

1.  **MSYS2 설치:** 공식 웹사이트([https://www.msys2.org/](https://www.msys2.org/))에서 MSYS2를 다운로드하여 설치합니다.

2.  **MSYS2 터미널 열기:** 설치 후 "MSYS2 MINGW64" 터미널을 실행합니다.

3.  **패키지 업데이트:** 다음 명령을 실행하여 패키지 데이터베이스와 핵심 패키지를 업데이트합니다. 터미널을 닫고 다시 열라는 메시지가 표시되면 따릅니다.
    ```sh
    pacman -Syu
    ```

4.  **빌드 도구 설치:** 다음 명령을 실행하여 C++ 컴파일러(`g++`), `make`, `glfw` 라이브러리를 설치합니다.
    ```sh
    pacman -S --needed base-devel mingw-w64-x86_64-toolchain mingw-w64-x86_64-glfw make
    ```

### Debian/Ubuntu

`apt-get`을 사용하여 필요한 패키지를 설치할 수 있습니다.
```bash
sudo apt-get update
sudo apt-get install build-essential g++ make libglfw3-dev
```

## 빌드 및 실행

운영 체제에 맞는 사전 준비가 완료되면 제공된 `Makefile`을 사용하여 프로젝트를 빌드하고 실행할 수 있습니다.

1.  **프로젝트 디렉터리로 이동:** 터미널(Windows의 경우 MSYS2 MINGW64)을 열고 프로젝트의 루트 디렉터리로 이동합니다.

2.  **프로젝트 빌드:** `make` 명령을 실행합니다.
    ```sh
    make
    ```

3.  **애플리케이션 실행:** 빌드가 완료되면 실행 파일이 생성됩니다.
    *   Windows: `drone_show.exe`
    *   Linux/macOS: `drone_show`

    터미널에서 실행 파일을 실행합니다.
    ```sh
    # Windows
    ./drone_show.exe

    # Linux
    ./drone_show
    ```
