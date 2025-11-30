#version 330 core

// 입력: 포인트 하나를 받아서
layout (points) in;
// 출력: 최대 4개의 정점을 내보내고, 삼각형 스트립 형태로 구성해 사각형(쿼드)을 만든다
layout (triangle_strip, max_vertices = 4) out;

// 정점 셰이더에서 전달된 색상(각 포인트의 색상)
in vec4 vColor[];

// 프래그먼트 셰이더로 넘길 색상, 텍스처 좌표
out vec4 fColor;
out vec2 fTexCoords;

// 변환 행렬들
uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

// 드론(쿼드)의 크기
uniform float drone_size;

void main() {

    // 입력 포인트 위치
    vec3 pos = gl_in[0].gl_Position.xyz;

    // 색상을 프래그먼트 셰이더로 넘길 준비
    fColor = vColor[0];

    // 카메라 기준 좌/우 벡터와 위/아래 벡터를 뽑음
    // → Billboard(카메라 정면 항상 향하는 사각형) 만들기 위해 필요
    vec3 cameraRight_worldspace = vec3(view[0][0], view[1][0], view[2][0]);
    vec3 cameraUp_worldspace    = vec3(view[0][1], view[1][1], view[2][1]);
    
    // 포인트 위치를 월드 좌표로 변환
    vec4 particle_center_worldspace = model * vec4(pos, 1.0);

    // ───────────────────────────────
    //  4개의 정점을 생성하여 Billboard Quad 만들기
    // ───────────────────────────────

    // 1) Top-left
    gl_Position = projection * view * (
        particle_center_worldspace
        + vec4(-cameraRight_worldspace * drone_size 
               - cameraUp_worldspace    * drone_size, 0.0)
    );
    fTexCoords = vec2(0.0, 1.0);
    EmitVertex();

    // 2) Top-right
    gl_Position = projection * view * (
        particle_center_worldspace
        + vec4(cameraRight_worldspace * drone_size 
               - cameraUp_worldspace  * drone_size, 0.0)
    );
    fTexCoords = vec2(1.0, 1.0);
    EmitVertex();

    // 3) Bottom-left
    gl_Position = projection * view * (
        particle_center_worldspace
        + vec4(-cameraRight_worldspace * drone_size 
               + cameraUp_worldspace   * drone_size, 0.0)
    );
    fTexCoords = vec2(0.0, 0.0);
    EmitVertex();

    // 4) Bottom-right
    gl_Position = projection * view * (
        particle_center_worldspace
        + vec4(cameraRight_worldspace * drone_size 
               + cameraUp_worldspace  * drone_size, 0.0)
    );
    fTexCoords = vec2(1.0, 0.0);
    EmitVertex();

    // 하나의 사각형(Primitive) 종료
    EndPrimitive();
}
