#version 330 core
layout (location = 0) in vec3 aPos;

out vec3 TexCoords;

uniform mat4 projection;
uniform mat4 view;

void main()
{
    TexCoords = aPos;
    // Remove translation from the view matrix to make the skybox follow the camera
    mat4 view_no_translation = mat4(mat3(view));
    vec4 pos = projection * view_no_translation * vec4(aPos, 1.0);
    // Set z to w to make sure the depth is always 1.0 (the maximum) after perspective division
    gl_Position = pos.xyww;
}