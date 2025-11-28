#version 330 core
layout (points) in;
layout (triangle_strip, max_vertices = 4) out;

in vec3 vColor[];
out vec3 fColor;
out vec2 fTexCoords;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;
uniform float drone_size;

void main() {
    vec3 pos = gl_in[0].gl_Position.xyz;
    fColor = vColor[0];

    vec3 cameraRight_worldspace = vec3(view[0][0], view[1][0], view[2][0]);
    vec3 cameraUp_worldspace = vec3(view[0][1], view[1][1], view[2][1]);
    
    vec4 particle_center_worldspace = model * vec4(pos, 1.0);

    // Top-left
    gl_Position = projection * view * (particle_center_worldspace + vec4(-cameraRight_worldspace * drone_size - cameraUp_worldspace * drone_size, 0.0));
    fTexCoords = vec2(0.0, 1.0);
    EmitVertex();

    // Top-right
    gl_Position = projection * view * (particle_center_worldspace + vec4(cameraRight_worldspace * drone_size - cameraUp_worldspace * drone_size, 0.0));
    fTexCoords = vec2(1.0, 1.0);
    EmitVertex();

    // Bottom-left
    gl_Position = projection * view * (particle_center_worldspace + vec4(-cameraRight_worldspace * drone_size + cameraUp_worldspace * drone_size, 0.0));
    fTexCoords = vec2(0.0, 0.0);
    EmitVertex();

    // Bottom-right
    gl_Position = projection * view * (particle_center_worldspace + vec4(cameraRight_worldspace * drone_size + cameraUp_worldspace * drone_size, 0.0));
    fTexCoords = vec2(1.0, 0.0);
    EmitVertex();

    EndPrimitive();
}