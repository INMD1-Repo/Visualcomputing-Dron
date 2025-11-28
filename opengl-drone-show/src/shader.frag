#version 330 core
out vec4 FragColor;

in vec3 fColor;
in vec2 fTexCoords;

uniform sampler2D droneTexture;

void main()
{
    // The final color is the drone's color, and the alpha is from the texture's alpha channel.
    // This allows the soft, circular shape of the texture to define the particle's shape.
    FragColor = vec4(fColor, texture(droneTexture, fTexCoords).a);
}
