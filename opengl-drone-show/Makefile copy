# Compiler and flags
CXX = g++
CXXFLAGS = -std=c++11 -Wall -Wextra -g
CPPFLAGS = -I./vendor/glew/include -I./vendor/cJSON -I./vendor/imgui -I./vendor/stb

# Linker flags
# Default to Linux flags
LDFLAGS = -lglfw -lGL -lpthread -ldl
TARGET = drone_show
CLEAN_CMD = rm -f

# Check for Windows NT
ifeq ($(OS), Windows_NT)
    LDFLAGS = -lglfw3 -lopengl32 -lgdi32
    TARGET = drone_show.exe
    CLEAN_CMD = del /F /Q
else
    # For non-Windows (Linux, macOS), check for uname
    UNAME_S := $(shell uname -s)
    ifeq ($(UNAME_S), Linux)
        # Linux flags (already set as default)
    endif
    ifeq ($(UNAME_S), Darwin)
        # macOS specific flags can be added here
    endif
endif

# Target executable
# TARGET is now set based on OS

# Source files
# Application sources
SRC = src/main.cpp
# Vendor sources
VENDOR_SRC = vendor/glew/src/glew.c \
             vendor/cJSON/cJSON.c \
             vendor/imgui/imgui.cpp \
             vendor/imgui/imgui_draw.cpp \
             vendor/imgui/imgui_tables.cpp \
             vendor/imgui/imgui_widgets.cpp \
             vendor/imgui/imgui_impl_glfw.cpp \
             vendor/imgui/imgui_impl_opengl3.cpp

# Object files
OBJ = $(SRC:.cpp=.o)
VENDOR_OBJ_CPP = $(filter %.cpp, $(VENDOR_SRC))
VENDOR_OBJ_C = $(filter %.c, $(VENDOR_SRC))

# Convert C++ vendor sources to object file names
VENDOR_OBJ_FROM_CPP = $(VENDOR_OBJ_CPP:.cpp=.o)
# Convert C vendor sources to object file names
VENDOR_OBJ_FROM_C = $(VENDOR_OBJ_C:.c=.o)


# Default rule
all: $(TARGET)

# Rule to link the executable
$(TARGET): $(OBJ) $(VENDOR_OBJ_FROM_CPP) $(VENDOR_OBJ_FROM_C)
	$(CXX) $(CXXFLAGS) $^ -o $(TARGET) $(LDFLAGS)

# Rule to compile C++ source files
%.o: %.cpp
	$(CXX) $(CXXFLAGS) $(CPPFLAGS) -c $< -o $@

# Rule to compile C source files (for glew and cjson)
%.o: %.c
	$(CXX) $(CXXFLAGS) $(CPPFLAGS) -c $< -o $@

# Clean rule
clean:
	-$(CLEAN_CMD) src\*.o
	-$(CLEAN_CMD) vendor\glew\src\*.o
	-$(CLEAN_CMD) vendor\cJSON\*.o
	-$(CLEAN_CMD) vendor\imgui\*.o
	-$(CLEAN_CMD) $(TARGET)

.PHONY: all clean
