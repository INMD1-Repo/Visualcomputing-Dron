#version 330 core

// 정점 셰이더의 입력 위치 정보 (location = 0 → aPos)
layout (location = 0) in vec3 aPos;
// 정점 셰이더의 입력 색상 정보 (location = 1 → aColor)
layout (location = 1) in vec4 aColor;

// 지오메트리 셰이더로 넘길 색상
out vec4 vColor;

void main()
{
    // 정점의 최종 위치 설정 (현재는 변환 없음, 그대로 clip space로 보냄)
    gl_Position = vec4(aPos, 1.0);

    // 색상을 그대로 다음 셰이더 단계(지오메트리 셰이더)로 전달
    vColor = aColor;
}
