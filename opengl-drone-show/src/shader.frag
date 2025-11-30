#version 330 core

// 최종 출력될 픽셀 색상
out vec4 FragColor;

// 정점 셰이더에서 전달된 색상(조명, Vertex Color 등)
in vec4 fColor;
// 정점 셰이더에서 전달된 텍스처 좌표
in vec2 fTexCoords;

// 사용할 텍스처(드론 이미지)
uniform sampler2D droneTexture;

void main()
{
    // 텍스처에서 해당 좌표의 색상 값을 샘플링
    vec4 texColor = texture(droneTexture, fTexCoords);

    // 텍스처의 알파 값이 낮으면(투명한 부분이면) 픽셀을 그리지 않음
    if (texColor.a < 0.1)
        discard;

    // 정점 색상과 텍스처 색상을 곱해 최종 색상으로 출력
    FragColor = fColor * texColor;
}
