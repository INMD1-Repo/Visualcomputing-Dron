# Cross-platform Makefile (Windows MinGW/MSYS2 and Linux)
# - Excludes building vendor/glew/src/*.c (use system GLEW)
# - Compiles C files with g++ to avoid C/C++ runtime mixing issues
# - Disables ImGui asserts with -DIMGUI_DISABLE_ASSERTS

CXX := g++
# Common compiler flags
CXXFLAGS := -std=c++17 -O2 -g -Wall -Wextra -fexceptions -DIMGUI_DISABLE_ASSERTS

# Include paths (adjust if your headers live elsewhere)
CPPFLAGS := -I./src \
           -I./vendor/imgui \
           -I./vendor/imgui/backends \
           -I./vendor/cJSON \
           -I./vendor/stb

# Detect OS: set OSFLAG to WINDOWS or LINUX (or fail)
OSFLAG :=
ifeq ($(OS), Windows_NT)
  OSFLAG := WINDOWS
else
  UNAME_S := $(shell uname -s 2>/dev/null)
  ifneq (,$(findstring MINGW,$(UNAME_S)))
    OSFLAG := WINDOWS
  else ifneq (,$(findstring MSYS,$(UNAME_S)))
    OSFLAG := WINDOWS
  else ifeq ($(UNAME_S),Linux)
    OSFLAG := LINUX
  else ifeq ($(UNAME_S),Darwin)
    OSFLAG := LINUX  # treat macOS similar to Linux here (adjust if needed)
  endif
endif

ifeq ($(OSFLAG),)
$(error Unsupported or undetected OS. Detected OS: $(UNAME_S))
endif

# OS-specific linker flags / libs
LDFLAGS :=
LDLIBS :=

ifeq ($(OSFLAG), WINDOWS)
  TARGET := drone_show.exe
  # If you installed MSYS2 mingw64 packages, these paths are typical:
  # -L/mingw64/lib helps find the libraries when building inside MSYS2 MINGW64 shell.
  LDFLAGS += -L/mingw64/lib
  # Link against system GLEW/glfw/opengl (Windows)
  LDLIBS += -lglew32 -lglfw3 -lopengl32 -lgdi32 -lstdc++
else ifeq ($(OSFLAG), LINUX)
  TARGET := drone_show
  # Typical Linux libs (system must have libglew-dev, libglfw-dev installed)
  LDLIBS += -lGLEW -lglfw -lGL -lpthread -ldl -lstdc++
endif

# -- Source file discovery (auto) --
# C++ sources from src/ and imgui vendor; you can tweak patterns if you have other files.
SOURCES_CPP := $(wildcard src/*.cpp) $(wildcard vendor/imgui/*.cpp) $(wildcard vendor/imgui/backends/*.cpp)
# C sources (cJSON only). Exclude vendor/glew/src/*
SOURCES_C := $(wildcard vendor/cJSON/*.c)

# Remove any accidental glew.c if present
SOURCES_C := $(filter-out vendor/glew/src/%, $(SOURCES_C))

# Object lists
OBJS_CPP := $(patsubst %.cpp,%.o,$(SOURCES_CPP))
OBJS_C   := $(patsubst %.c,%.o,$(SOURCES_C))
OBJS := $(OBJS_CPP) $(OBJS_C)

# Default target
.PHONY: all
all: $(TARGET)

# Link step (use g++ to ensure C++ runtime is linked)
$(TARGET): $(OBJS)
	@echo Linking $@ ...
	$(CXX) $(CXXFLAGS) $(OBJS) -o $@ $(LDFLAGS) $(LDLIBS)
	@echo Build complete: $@

# Compile rules: use g++ for both .cpp and .c to avoid mixed runtime issues
%.o: %.cpp
	@echo CXX compile $<
	$(CXX) $(CXXFLAGS) $(CPPFLAGS) -c $< -o $@

%.o: %.c
	@echo C compile with g++: $<
	$(CXX) $(CXXFLAGS) $(CPPFLAGS) -c $< -o $@

# Clean (cross-platform)
.PHONY: clean
clean:
	@echo Cleaning object files and target...
	-$(RM) $(OBJS) $(TARGET)

# Help
.PHONY: info
info:
	@echo "OSFLAG = $(OSFLAG)"
	@echo "SOURCES_CPP = $(SOURCES_CPP)"
	@echo "SOURCES_C   = $(SOURCES_C)"
	@echo "OBJS        = $(OBJS)"
	@echo "CXXFLAGS    = $(CXXFLAGS)"
	@echo "CPPFLAGS    = $(CPPFLAGS)"
	@echo "LDFLAGS     = $(LDFLAGS)"
	@echo "LDLIBS      = $(LDLIBS)"
