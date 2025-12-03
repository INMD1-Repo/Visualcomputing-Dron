#include <algorithm>
#include <cmath>
#include <fstream>
#include <iostream>
#include <sstream>
#include <string>
#include <time.h>
#include <vector>

#define GLEW_STATIC
#include <GL/glew.h>
#include <GLFW/glfw3.h>

#include "imgui.h"
#include "imgui_impl_glfw.h"
#include "imgui_impl_opengl3.h"

#define STB_IMAGE_IMPLEMENTATION
#include "cJSON.h"
#include "stb_image.h"

// --- Math & Easing ---
const float PI = 3.1415926535f;
struct Vec3 {
  float x, y, z;
};
struct Vec4 {
  float x, y, z, w;
};
Vec3 operator+(Vec3 a, Vec3 b) { return {a.x + b.x, a.y + b.y, a.z + b.z}; }
Vec3 operator-(Vec3 a, Vec3 b) { return {a.x - b.x, a.y - b.y, a.z - b.z}; }
Vec3 operator*(Vec3 a, float s) { return {a.x * s, a.y * s, a.z * s}; }
float dot(Vec3 a, Vec3 b) { return a.x * b.x + a.y * b.y + a.z * b.z; }
Vec3 cross(Vec3 a, Vec3 b) {
  return {a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x};
}
Vec3 normalize(Vec3 v) {
  float mag = sqrt(dot(v, v));
  if (mag > 0.0001f)
    return v * (1.0f / mag);
  return {0, 0, 0};
}
Vec3 lerp(Vec3 start, Vec3 end, float t) {
  return start * (1.0f - t) + end * t;
}
Vec4 lerp(Vec4 start, Vec4 end, float t) {
  return {start.x * (1.0f - t) + end.x * t, start.y * (1.0f - t) + end.y * t,
          start.z * (1.0f - t) + end.z * t, start.w * (1.0f - t) + end.w * t};
}
Vec3 naturalLerp(Vec3 start, Vec3 end, float t, int droneIndex) {
  Vec3 lerpedPos = lerp(start, end, t);
  if (t > 0.01f && t < 0.99f) { // Avoid deviation at start and end
    float frequency = 2.0f;
    float magnitude =
        20.0f * (1.0f - pow(2.0f * t - 1.0f,
                            4.0f)); // Strongest deviation in the middle

    Vec3 path = end - start;
    Vec3 randomDir = {(float)sin(droneIndex * 2.3f),
                      (float)cos(droneIndex * 5.1f),
                      (float)sin(droneIndex * 1.7f)};
    Vec3 perpendicular = normalize(cross(path, randomDir));
    if (dot(perpendicular, perpendicular) <
        0.1f) { // Handle case where path and randomDir are parallel
      perpendicular = normalize(cross(path, {1, 0, 0}));
      if (dot(perpendicular, perpendicular) < 0.1f) {
        perpendicular = normalize(cross(path, {0, 1, 0}));
      }
    }

    lerpedPos = lerpedPos + perpendicular * magnitude * sin(t * PI);
  }
  return lerpedPos;
}
float easeOutCubic(float t) { return 1.0f - pow(1.0f - t, 3.0f); }

struct Mat4 {
  float m[16] = {0};
};
Mat4 identity() {
  Mat4 mat;
  mat.m[0] = 1.0f;
  mat.m[5] = 1.0f;
  mat.m[10] = 1.0f;
  mat.m[15] = 1.0f;
  return mat;
}
Mat4 perspective(float fov, float aspect, float n, float f) {
  Mat4 mat;
  float t = tan(fov / 2.0f);
  mat.m[0] = 1.0f / (aspect * t);
  mat.m[5] = 1.0f / t;
  mat.m[10] = -(f + n) / (f - n);
  mat.m[11] = -1.0f;
  mat.m[14] = -(2.0f * f * n) / (f - n);
  return mat;
}
Mat4 orthographic(float l, float r, float b, float t, float n, float f) {
  Mat4 mat = identity();
  mat.m[0] = 2.0f / (r - l);
  mat.m[5] = 2.0f / (t - b);
  mat.m[10] = -2.0f / (f - n);
  mat.m[12] = -(r + l) / (r - l);
  mat.m[13] = -(t + b) / (t - b);
  mat.m[14] = -(f + n) / (f - n);
  return mat;
}
Mat4 lookAt(Vec3 eye, Vec3 center, Vec3 up) {
  Vec3 f = normalize(center - eye);
  Vec3 s = normalize(cross(f, up));
  Vec3 u = cross(s, f);
  Mat4 mat = identity();
  mat.m[0] = s.x;
  mat.m[4] = s.y;
  mat.m[8] = s.z;
  mat.m[1] = u.x;
  mat.m[5] = u.y;
  mat.m[9] = u.z;
  mat.m[2] = -f.x;
  mat.m[6] = -f.y;
  mat.m[10] = -f.z;
  mat.m[12] = -dot(s, eye);
  mat.m[13] = -dot(u, eye);
  mat.m[14] = dot(f, eye);
  return mat;
}

// --- Data Structures ---
struct DronePoint {
  Vec3 pos;
  Vec4 color;
};
struct DroneLayer {
  std::string id;
  std::string name;
  int duration;
  std::vector<DronePoint> points;
};
struct DroneShow {
  std::string title;
  std::vector<DroneLayer> layers;
};
enum ViewMode { VIEW_3D, VIEW_2D_TOP, VIEW_2D_FRONT };

// --- Globals ---
DroneShow droneShow;
DroneLayer groundFormation;
std::vector<float> vertexData;
std::vector<DronePoint> animationBuffer;
int currentLayer = 0, previousLayer = 0;
bool isPlaying = false;
float timelinePosition = 0.0f, totalDuration = 0.0f, elapsedTime = 0.0f;
float playbackSpeed = 1.0f;
int visibleDroneCount = -1; // -1 for all
int maxDronesInShow = 0;
GLuint droneTexture;
GLuint droneShaderProgram;
float droneSize = 5.0f;

// --- Animation State ---
enum InitialAnimationState { PRE_TAKEOFF, TAKING_OFF, DONE };
InitialAnimationState initialAnimationState = PRE_TAKEOFF;
bool inTransition = false;
float transitionDuration = 1500.0f, transitionElapsedTime = 0.0f,
      preTakeoffTime = 0.0f;
const float PRE_TAKEOFF_DURATION = 3000.0f; // 3 seconds

// --- Fireworks State ---
struct Particle {
  Vec3 pos;
  Vec3 vel;
  Vec4 color;
  float lifetime;
};
std::vector<Particle> particles;
bool enableFireworks = false;

// --- Camera & Mouse State ---
ViewMode currentViewMode = VIEW_3D;
Vec3 cameraTarget = {0, 0, 0};
float cameraYaw = -PI / 2.0f, cameraPitch = 0.0f,
      cameraRadius = 500.0f; // For 3D orbit
float orthoSize = 500.0f;    // For 2D zoom
bool isDragging = false;
double lastMouseX = 0, lastMouseY = 0;

// --- Forward Declarations ---
void triggerTransition(int nextLayer);
void scroll_callback(GLFWwindow *window, double xoffset, double yoffset);
void mouse_button_callback(GLFWwindow *window, int button, int action,
                           int mods);
void cursor_position_callback(GLFWwindow *window, double xpos, double ypos);
void spawnFireworks();
GLuint createShaderProgram(const char *vsPath, const char *fsPath,
                           const char *gsPath = nullptr);
GLuint loadTexture(const char *path);

// --- Helper Functions ---
std::string readFile(const char *filePath) {
  std::ifstream f(filePath);
  std::stringstream buf;
  if (f) {
    buf << f.rdbuf();
  }
  return buf.str();
}
void parseColor(const char *hex, Vec4 &color) {
  if (hex[0] == '#') {
    long val = strtol(hex + 1, NULL, 16);
    color.x = ((val >> 16) & 0xFF) / 255.0f;
    color.y = ((val >> 8) & 0xFF) / 255.0f;
    color.z = (val & 0xFF) / 255.0f;
    color.w = 1.0f;
  }
}

GLuint loadTexture(const char *path) {
  GLuint textureID;
  glGenTextures(1, &textureID);

  int width, height, nrComponents;
  unsigned char *data = stbi_load(path, &width, &height, &nrComponents, 0);
  if (data) {
    GLenum format;
    if (nrComponents == 1)
      format = GL_RED;
    else if (nrComponents == 3)
      format = GL_RGB;
    else if (nrComponents == 4)
      format = GL_RGBA;

    glBindTexture(GL_TEXTURE_2D, textureID);
    glTexImage2D(GL_TEXTURE_2D, 0, format, width, height, 0, format,
                 GL_UNSIGNED_BYTE, data);
    glGenerateMipmap(GL_TEXTURE_2D);

    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_REPEAT);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_REPEAT);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER,
                    GL_LINEAR_MIPMAP_LINEAR);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);

    stbi_image_free(data);
  } else {
    std::cout << "Texture failed to load at path: " << path << std::endl;
    stbi_image_free(data);
  }

  return textureID;
}

GLuint createShaderProgram(const char *vsPath, const char *fsPath,
                           const char *gsPath) {
  std::string vsSrc = readFile(vsPath), fsSrc = readFile(fsPath);
  const char *vs = vsSrc.c_str(), *fs = fsSrc.c_str();

  auto compileShader = [](GLuint type, const char *src) {
    GLuint shader = glCreateShader(type);
    glShaderSource(shader, 1, &src, NULL);
    glCompileShader(shader);
    int success;
    char infoLog[512];
    glGetShaderiv(shader, GL_COMPILE_STATUS, &success);
    if (!success) {
      glGetShaderInfoLog(shader, 512, NULL, infoLog);
      std::cerr << "ERROR::SHADER::COMPILATION_FAILED\n"
                << infoLog << std::endl;
    }
    return shader;
  };

  GLuint vShader = compileShader(GL_VERTEX_SHADER, vs);
  GLuint fShader = compileShader(GL_FRAGMENT_SHADER, fs);
  GLuint gShader = 0;

  if (gsPath) {
    std::string gsSrc = readFile(gsPath);
    const char *gs = gsSrc.c_str();
    gShader = compileShader(GL_GEOMETRY_SHADER, gs);
  }

  GLuint program = glCreateProgram();
  glAttachShader(program, vShader);
  glAttachShader(program, fShader);
  if (gShader)
    glAttachShader(program, gShader);
  glLinkProgram(program);

  int success;
  char infoLog[512];
  glGetProgramiv(program, GL_LINK_STATUS, &success);
  if (!success) {
    glGetProgramInfoLog(program, 512, NULL, infoLog);
    std::cerr << "ERROR::PROGRAM::LINKING_FAILED\n" << infoLog << std::endl;
  }

  glDeleteShader(vShader);
  glDeleteShader(fShader);
  if (gShader)
    glDeleteShader(gShader);

  return program;
}

void loadDroneShow(const char *path) {
  droneShow.layers.clear();
  totalDuration = 0;
  elapsedTime = 0;
  currentLayer = 0;
  previousLayer = 0;
  visibleDroneCount = -1;
  maxDronesInShow = 0;
  std::string jsonString = readFile(path);
  if (jsonString.empty())
    return;
  cJSON *root = cJSON_Parse(jsonString.c_str());
  if (!root)
    return;
  droneShow.title = cJSON_GetObjectItem(root, "title")->valuestring;
  cJSON *layers = cJSON_GetObjectItem(root, "layers");
  cJSON *layer;
  cJSON_ArrayForEach(layer, layers) {
    DroneLayer l;
    l.id = cJSON_GetObjectItem(layer, "id")->valuestring;
    l.name = cJSON_GetObjectItem(layer, "name")->valuestring;
    l.duration = cJSON_GetObjectItem(layer, "duration")->valueint;
    totalDuration += l.duration;
    cJSON *points = cJSON_GetObjectItem(layer, "points");
    cJSON *point;
    cJSON_ArrayForEach(point, points) {
      DronePoint p;
      p.pos.x = cJSON_GetObjectItem(point, "x")->valuedouble;
      p.pos.y = cJSON_GetObjectItem(point, "y")->valuedouble;
      p.pos.z = cJSON_GetObjectItem(point, "z")->valuedouble;
      parseColor(cJSON_GetObjectItem(point, "color")->valuestring, p.color);
      l.points.push_back(p);
    }
    droneShow.layers.push_back(l);
    if (l.points.size() > (size_t)maxDronesInShow) {
      maxDronesInShow = l.points.size();
    }
    // Ensure at least 2500 drones
    if (maxDronesInShow < 2500)
      maxDronesInShow = 2500;
  }
  cJSON_Delete(root);

  // Create a "ground" formation
  groundFormation.points.clear();
  int drones = maxDronesInShow;
  int grid_size = ceil(sqrt(drones));
  float spacing = std::max(10.0f, droneSize * 4.0f);
  // Get colors from the first layer if available
  std::vector<DronePoint> targetPoints;
  if (!droneShow.layers.empty()) {
    targetPoints = droneShow.layers[0].points;
  }

  for (int i = 0; i < drones; ++i) {
    DronePoint p;
    p.pos.x = (i % grid_size - (grid_size - 1) / 2.0f) * spacing;
    p.pos.y = -200.0f;
    p.pos.z = (i / grid_size - (grid_size - 1) / 2.0f) * spacing;

    if (i < (int)targetPoints.size()) {
      p.color = targetPoints[i].color;
    } else {
      p.color = {0.2f, 0.2f, 0.2f, 1.0f}; // Visible dark gray
    }
    groundFormation.points.push_back(p);
  }

  if (!droneShow.layers.empty()) {
    animationBuffer.assign(groundFormation.points.begin(),
                           groundFormation.points.end());
    animationBuffer.resize(maxDronesInShow);

    visibleDroneCount = maxDronesInShow;
    initialAnimationState = PRE_TAKEOFF;
    preTakeoffTime = 0.0f;
    transitionElapsedTime = 0.0f;
    currentLayer = 0;
    previousLayer = 0;
    isPlaying = false;
    timelinePosition = 0.0f;
    elapsedTime = 0.0f;
  } else {
    animationBuffer.clear();
    visibleDroneCount = 0;
  }
}

void triggerTransition(int nextLayer) {
  if (droneShow.layers.empty() || nextLayer >= (int)droneShow.layers.size() ||
      currentLayer == nextLayer)
    return;
  inTransition = true;
  transitionElapsedTime = 0.0f;
  previousLayer = currentLayer;
  currentLayer = nextLayer;
}

void spawnFireworks() {
  if (droneShow.layers.empty())
    return;
  const auto &lastLayerPoints = droneShow.layers.back().points;
  if (lastLayerPoints.empty())
    return;

  particles.clear();

  int numExplosions = std::min(15, (int)lastLayerPoints.size());
  for (int i = 0; i < numExplosions; ++i) {
    const auto &drone = lastLayerPoints[rand() % lastLayerPoints.size()];
    Vec3 center = drone.pos;
    Vec4 color = {(float)(rand() % 256) / 255.0f,
                  (float)(rand() % 256) / 255.0f,
                  (float)(rand() % 256) / 255.0f, 1.0f};
    if (rand() % 5 == 0) { // Add some white fireworks
      color = {1.0f, 1.0f, 1.0f, 1.0f};
    }

    int numParticlesPerExplosion = 100 + (rand() % 50);
    for (int j = 0; j < numParticlesPerExplosion; ++j) {
      Particle p;
      p.pos = center;
      float speed = 50.0f + (rand() % 150);
      float angle1 = (rand() / (float)RAND_MAX) * PI; // Hemisphere
      float angle2 = (rand() / (float)RAND_MAX) * 2.0f * PI;
      p.vel.x = speed * sin(angle1) * cos(angle2);
      p.vel.y = speed * cos(angle1); // Y-up
      p.vel.z = speed * sin(angle1) * sin(angle2);
      p.color = color;
      p.lifetime = 1.5f + (rand() / (float)RAND_MAX) * 2.0f;
      particles.push_back(p);
    }
  }
}

void renderUI() {
  ImGui::SetNextWindowPos(ImVec2(0, 0));
  ImGui::SetNextWindowSize(ImVec2(ImGui::GetIO().DisplaySize.x, 50));
  ImGui::Begin("Header", NULL,
               ImGuiWindowFlags_NoDecoration | ImGuiWindowFlags_NoMove);
  ImGui::Text("%s", droneShow.title.c_str());
  ImGui::End();

  ImGui::SetNextWindowPos(ImVec2(0, ImGui::GetIO().DisplaySize.y - 80));
  ImGui::SetNextWindowSize(ImVec2(ImGui::GetIO().DisplaySize.x, 80));
  ImGui::Begin("Controls", NULL,
               ImGuiWindowFlags_NoDecoration | ImGuiWindowFlags_NoMove);
  if (ImGui::Button(isPlaying ? "Pause" : "Play")) {
    isPlaying = !isPlaying;
  }
  ImGui::SameLine();
  ImGui::SetNextItemWidth(ImGui::GetWindowWidth() - 250);
  if (ImGui::SliderFloat("##timeline", &timelinePosition, 0.0f, 1.0f)) {
    elapsedTime = timelinePosition * totalDuration;
  }
  ImGui::SameLine();
  ImGui::SetNextItemWidth(120);
  ImGui::SliderFloat("Speed", &playbackSpeed, 0.1f, 4.0f, "%.1fx");
  ImGui::End();

  ImGui::SetNextWindowPos(ImVec2(10, 60));
  ImGui::SetNextWindowSize(ImVec2(250, 350));
  ImGui::Begin("Info & Settings");
  ImGui::Text("Layer: %s", droneShow.layers.empty()
                               ? "N/A"
                               : droneShow.layers[currentLayer].name.c_str());
  ImGui::Text("Drones: %d", visibleDroneCount == -1
                                ? (int)animationBuffer.size()
                                : visibleDroneCount);
  if (!droneShow.layers.empty()) {
    if (ImGui::SliderInt("Drone Count", &visibleDroneCount, 1,
                         maxDronesInShow)) {
      // Value changed
    }
  }
  ImGui::SliderFloat("Drone Size", &droneSize, 0.1f, 20.0f);
  ImGui::Separator();
  ImGui::Checkbox("Enable Fireworks on Finish", &enableFireworks);
  ImGui::Separator();
  ImGui::Text("View Mode");
  if (ImGui::RadioButton("3D", currentViewMode == VIEW_3D)) {
    currentViewMode = VIEW_3D;
  }
  ImGui::SameLine();
  if (ImGui::RadioButton("2D Top", currentViewMode == VIEW_2D_TOP)) {
    currentViewMode = VIEW_2D_TOP;
  }
  ImGui::SameLine();
  if (ImGui::RadioButton("2D Front", currentViewMode == VIEW_2D_FRONT)) {
    currentViewMode = VIEW_2D_FRONT;
  }
  ImGui::Separator();
  ImGui::Text("Mouse Controls:");
  ImGui::Text("Drag to Orbit (3D) / Pan (2D)");
  ImGui::Text("Scroll to Zoom");
  ImGui::End();

  ImGui::SetNextWindowPos(ImVec2(ImGui::GetIO().DisplaySize.x - 260, 60));
  ImGui::SetNextWindowSize(ImVec2(250, 200));
  ImGui::Begin("Layers");
  for (size_t i = 0; i < droneShow.layers.size(); ++i) {
    if (ImGui::Selectable(droneShow.layers[i].name.c_str(),
                          currentLayer == (int)i)) {
      if (currentLayer != (int)i)
        triggerTransition((int)i);
    }
  }
  ImGui::End();
}

int main() {
  if (!glfwInit())
    return -1;
  const char *glsl_version = "#version 330";
  glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
  glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
  glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);
  GLFWwindow *window =
      glfwCreateWindow(1280, 720, "OpenGL Drone Show", NULL, NULL);
  if (!window) {
    glfwTerminate();
    return -1;
  }
  glfwMakeContextCurrent(window);
  glfwSwapInterval(1);
  if (glewInit() != GLEW_OK) {
    std::cerr << "Failed to initialize GLEW" << std::endl;
    return -1;
  }

  glfwSetScrollCallback(window, scroll_callback);
  glfwSetMouseButtonCallback(window, mouse_button_callback);
  glfwSetCursorPosCallback(window, cursor_position_callback);

  IMGUI_CHECKVERSION();
  ImGui::CreateContext();
  ImGui::StyleColorsDark();
  ImGui_ImplGlfw_InitForOpenGL(window, true);
  ImGui_ImplOpenGL3_Init(glsl_version);

  srand(time(NULL));

  loadDroneShow("assets/example-drone-show.json");
  droneShaderProgram = createShaderProgram("src/shader.vert", "src/shader.frag",
                                           "src/shader.geom");
  droneTexture = loadTexture("assets/drone.png");

  GLuint VAO, VBO;
  glGenVertexArrays(1, &VAO);
  glGenBuffers(1, &VBO);
  glBindVertexArray(VAO);
  glBindBuffer(GL_ARRAY_BUFFER, VBO);
  glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 7 * sizeof(float), (void *)0);
  glEnableVertexAttribArray(0);
  glVertexAttribPointer(1, 4, GL_FLOAT, GL_FALSE, 7 * sizeof(float),
                        (void *)(3 * sizeof(float)));
  glEnableVertexAttribArray(1);
  glEnable(GL_DEPTH_TEST);
  glEnable(GL_BLEND);
  glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);

  float lastFrameTime = 0.0f;
  while (!glfwWindowShouldClose(window)) {
    float currentFrameTime = glfwGetTime();
    float deltaTime = currentFrameTime - lastFrameTime;
    lastFrameTime = currentFrameTime;
    float effectiveDeltaTime = deltaTime * playbackSpeed;

    if (initialAnimationState != DONE) {
      switch (initialAnimationState) {
      case PRE_TAKEOFF: {
        preTakeoffTime += effectiveDeltaTime * 1000;
        if (preTakeoffTime >= PRE_TAKEOFF_DURATION) {
          initialAnimationState = TAKING_OFF;
          transitionElapsedTime = 0.0f;
        }
        break;
      }
      case TAKING_OFF: {
        transitionElapsedTime += effectiveDeltaTime * 1000;
        float t = std::min(1.0f, transitionElapsedTime / transitionDuration);
        float eased_t = easeOutCubic(t);

        const auto &startPoints = groundFormation.points;
        const auto &endPoints = droneShow.layers[0].points;

        for (size_t i = 0; i < (size_t)maxDronesInShow; ++i) {
          bool inEnd = i < endPoints.size();
          Vec3 startPos = startPoints[i].pos;
          Vec3 endPos = inEnd ? endPoints[i].pos : startPos;

          animationBuffer[i].pos = naturalLerp(startPos, endPos, eased_t, i);
          Vec4 startColor = startPoints[i].color;
          Vec4 endColor = inEnd ? endPoints[i].color : Vec4{0, 0, 0, 0};
          animationBuffer[i].color = lerp(startColor, endColor, eased_t);
        }

        if (t >= 1.0f) {
          initialAnimationState = DONE;
          const auto &finalPoints = droneShow.layers[0].points;
          for (size_t i = 0; i < finalPoints.size(); ++i) {
            animationBuffer[i] = finalPoints[i];
          }
          for (size_t i = finalPoints.size(); i < (size_t)maxDronesInShow;
               ++i) {
            animationBuffer[i].pos = {0, -200.0f, 0};
            animationBuffer[i].color = {0, 0, 0, 0};
          }
          visibleDroneCount = finalPoints.size();
          elapsedTime = 0.0f;
          isPlaying = true;
        }
        break;
      }
      case DONE:
        break;
      }
    } else if (isPlaying) {
      elapsedTime += effectiveDeltaTime * 1000;
      if (elapsedTime >= totalDuration && totalDuration > 0) {
        if (enableFireworks) {
          spawnFireworks();
        }
        elapsedTime = fmod(elapsedTime, totalDuration);
        if (currentLayer != 0)
          triggerTransition(0);
      }

      timelinePosition = totalDuration > 0 ? elapsedTime / totalDuration : 0;
      float time_cursor = 0.0f;
      for (size_t i = 0; i < droneShow.layers.size(); ++i) {
        time_cursor += droneShow.layers[i].duration;
        if (elapsedTime < time_cursor) {
          if (currentLayer != (int)i && !inTransition)
            triggerTransition((int)i);
          break;
        }
      }
    }

    if (inTransition) {
      transitionElapsedTime += effectiveDeltaTime * 1000;
      float t = std::min(1.0f, transitionElapsedTime / transitionDuration);
      float eased_t = easeOutCubic(t);
      const auto &startPoints = droneShow.layers[previousLayer].points;
      const auto &endPoints = droneShow.layers[currentLayer].points;

      for (size_t i = 0; i < (size_t)maxDronesInShow; ++i) {
        bool inStart = i < startPoints.size();
        bool inEnd = i < endPoints.size();
        Vec3 startPos, endPos;

        if (inStart && inEnd) { // Exists in both, normal transition
          startPos = startPoints[i].pos;
          endPos = endPoints[i].pos;
        } else if (inStart) { // Disappearing drone
          startPos = startPoints[i].pos;
          // Fly outwards to surroundings
          Vec3 dir = {startPoints[i].pos.x, 0, startPoints[i].pos.z};
          if (dot(dir, dir) < 0.1f)
            dir = {(float)sin(i), 0, (float)cos(i)};
          dir = normalize(dir);
          endPos = dir * 500.0f;           // Fly far away
          endPos.y = startPoints[i].pos.y; // Keep height

        } else if (inEnd) { // Appearing drone
          startPos = {endPoints[i].pos.x + (float)sin(i) * 50.0f, -250.0f,
                      endPoints[i].pos.z + (float)cos(i) * 50.0f};
          endPos = endPoints[i].pos;
        } else { // Inactive drone
          startPos = endPos = {0, -200.0f, 0};
        }

        animationBuffer[i].pos = naturalLerp(startPos, endPos, eased_t, i);

        Vec4 startColor = inStart ? startPoints[i].color : Vec4{0, 0, 0, 0};
        Vec4 endColor = inEnd ? endPoints[i].color : Vec4{0, 0, 0, 0};
        animationBuffer[i].color = lerp(startColor, endColor, eased_t);
      }

      if (t >= 1.0f) {
        inTransition = false;
        const auto &finalPoints = droneShow.layers[currentLayer].points;
        for (size_t i = 0; i < finalPoints.size(); ++i) {
          animationBuffer[i] = finalPoints[i];
        }
        for (size_t i = finalPoints.size(); i < (size_t)maxDronesInShow; ++i) {
          animationBuffer[i].pos = {0, -200.0f, 0};
          animationBuffer[i].color = {0, 0, 0, 0};
        }
        visibleDroneCount = finalPoints.size();
      }
    }

    // Update and manage particles
    if (!particles.empty()) {
      float gravity = 20.0f;
      for (auto it = particles.begin(); it != particles.end();) {
        it->pos = it->pos + it->vel * effectiveDeltaTime;
        it->vel.y -= gravity * effectiveDeltaTime;
        it->lifetime -= effectiveDeltaTime;
        if (it->lifetime <= 0) {
          it = particles.erase(it);
        } else {
          ++it;
        }
      }
    }

    int numDronesToRender =
        (visibleDroneCount == -1)
            ? animationBuffer.size()
            : std::min((size_t)visibleDroneCount, animationBuffer.size());
    vertexData.clear();
    vertexData.reserve(numDronesToRender * 7 + particles.size() * 7);
    for (int i = 0; i < numDronesToRender; ++i) {
      const auto &p = animationBuffer[i];
      vertexData.push_back(p.pos.x);
      vertexData.push_back(p.pos.y);
      vertexData.push_back(p.pos.z);
      vertexData.push_back(p.color.x);
      vertexData.push_back(p.color.y);
      vertexData.push_back(p.color.z);
      vertexData.push_back(p.color.w);
    }

    // Add particles to vertex data
    for (const auto &p : particles) {
      vertexData.push_back(p.pos.x);
      vertexData.push_back(p.pos.y);
      vertexData.push_back(p.pos.z);
      vertexData.push_back(p.color.x);
      vertexData.push_back(p.color.y);
      vertexData.push_back(p.color.z);
      vertexData.push_back(p.color.w);
    }

    glfwPollEvents();
    ImGui_ImplOpenGL3_NewFrame();
    ImGui_ImplGlfw_NewFrame();
    ImGui::NewFrame();
    renderUI();

    int display_w, display_h;
    glfwGetFramebufferSize(window, &display_w, &display_h);
    glViewport(0, 0, display_w, display_h);
    glClearColor(0.1f, 0.1f, 0.12f, 1.0f);
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

    if (!vertexData.empty()) {
      glBindBuffer(GL_ARRAY_BUFFER, VBO);
      glBufferData(GL_ARRAY_BUFFER, vertexData.size() * sizeof(float),
                   vertexData.data(), GL_DYNAMIC_DRAW);

      glUseProgram(droneShaderProgram);
      Mat4 model = identity(), view, projection;
      float aspect = (float)display_w / (float)display_h;
      Vec3 camPos;

      switch (currentViewMode) {
      case VIEW_3D:
        camPos.x =
            cameraTarget.x + cameraRadius * cos(cameraPitch) * cos(cameraYaw);
        camPos.y = cameraTarget.y + cameraRadius * sin(cameraPitch);
        camPos.z =
            cameraTarget.z + cameraRadius * cos(cameraPitch) * sin(cameraYaw);
        projection = perspective(45.0f, aspect, 0.1f, 5000.0f);
        view = lookAt(camPos, cameraTarget, {0, 1, 0});
        break;
      case VIEW_2D_TOP:
        projection = orthographic(-orthoSize * aspect, orthoSize * aspect,
                                  -orthoSize, orthoSize, -1000.0f, 1000.0f);
        view = lookAt({cameraTarget.x, 500, cameraTarget.z}, cameraTarget,
                      {0, 0, -1});
        break;
      case VIEW_2D_FRONT:
        projection = orthographic(-orthoSize * aspect, orthoSize * aspect,
                                  -orthoSize, orthoSize, -1000.0f, 5000.0f);
        view = lookAt({cameraTarget.x, cameraTarget.y, 500}, cameraTarget,
                      {0, 1, 0});
        break;
      }
      glUniformMatrix4fv(glGetUniformLocation(droneShaderProgram, "model"), 1,
                         GL_FALSE, model.m);
      glUniformMatrix4fv(glGetUniformLocation(droneShaderProgram, "view"), 1,
                         GL_FALSE, view.m);
      glUniformMatrix4fv(glGetUniformLocation(droneShaderProgram, "projection"),
                         1, GL_FALSE, projection.m);
      glUniform1f(glGetUniformLocation(droneShaderProgram, "drone_size"),
                  droneSize);

      glActiveTexture(GL_TEXTURE0);
      glBindTexture(GL_TEXTURE_2D, droneTexture);
      glUniform1i(glGetUniformLocation(droneShaderProgram, "droneTexture"), 0);

      glBindVertexArray(VAO);
      glDrawArrays(GL_POINTS, 0, vertexData.size() / 7);
    }
    ImGui::Render();
    ImGui_ImplOpenGL3_RenderDrawData(ImGui::GetDrawData());
    glfwSwapBuffers(window);
  }

  glDeleteVertexArrays(1, &VAO);
  glDeleteBuffers(1, &VBO);
  glDeleteProgram(droneShaderProgram);
  glDeleteTextures(1, &droneTexture);
  ImGui_ImplOpenGL3_Shutdown();
  ImGui_ImplGlfw_Shutdown();
  ImGui::DestroyContext();
  glfwDestroyWindow(window);
  glfwTerminate();
  return 0;
}

// --- GLFW Callbacks ---
void scroll_callback(GLFWwindow *window, double xoffset, double yoffset) {
  if (ImGui::GetIO().WantCaptureMouse)
    return;
  if (currentViewMode == VIEW_3D) {
    cameraRadius -= yoffset * 20.0f;
    if (cameraRadius < 1.0f)
      cameraRadius = 1.0f;
  } else {
    orthoSize -= yoffset * 20.0f;
    if (orthoSize < 10.0f)
      orthoSize = 10.0f;
  }
}

void mouse_button_callback(GLFWwindow *window, int button, int action,
                           int mods) {
  if (ImGui::GetIO().WantCaptureMouse)
    return;
  if (button == GLFW_MOUSE_BUTTON_LEFT) {
    if (action == GLFW_PRESS) {
      isDragging = true;
      glfwGetCursorPos(window, &lastMouseX, &lastMouseY);
    } else if (action == GLFW_RELEASE) {
      isDragging = false;
    }
  }
}

void cursor_position_callback(GLFWwindow *window, double xpos, double ypos) {
  if (!isDragging)
    return;
  float deltaX = xpos - lastMouseX;
  float deltaY = ypos - lastMouseY;
  lastMouseX = xpos;
  lastMouseY = ypos;

  if (currentViewMode == VIEW_3D) {
    cameraYaw += deltaX * 0.005f;
    cameraPitch -= deltaY * 0.005f;
    if (cameraPitch > PI / 2.0f - 0.01f)
      cameraPitch = PI / 2.0f - 0.01f;
    if (cameraPitch < -PI / 2.0f + 0.01f)
      cameraPitch = -PI / 2.0f + 0.01f;
  } else { // 2D Pan
    cameraTarget.x -= deltaX * (orthoSize / 500.0f);
    cameraTarget.y += deltaY * (orthoSize / 500.0f);
  }
}
