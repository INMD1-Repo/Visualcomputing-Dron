# Compiler and flags
CXX = g++
CXXFLAGS = -std=c++11 -Wall -Wextra -g
CPPFLAGS = -I./vendor/glew/include -I./vendor/cJSON -I./vendor/imgui

# Linker flags
LDFLAGS = -lglfw -lGL -lpthread -ldl

# Target executable
TARGET = drone_show

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
VENDOR_OBJ = $(VENDOR_SRC:.c=.o)
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
	rm -f src/*.o vendor/glew/src/*.o vendor/cJSON/*.o vendor/imgui/*.o $(TARGET)

.PHONY: all clean
