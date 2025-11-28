#version 330 core
out vec4 FragColor;

in vec3 TexCoords;

void main()
{    
    // Normalize the direction vector from the cube's vertex positions
    vec3 dir = normalize(TexCoords);
    
    // Simple gradient based on the y-coordinate of the direction
    // Starts with a dark blue/black at the bottom and goes to a lighter blue at the top
    float t = 0.5 + 0.5 * dir.y; // Map y from [-1, 1] to [0, 1]
    
    // Define bottom and top colors
    vec3 bottomColor = vec3(0.05, 0.05, 0.15); // Dark deep blue
    vec3 topColor = vec3(0.3, 0.4, 0.6);      // Lighter sky blue
    
    // Interpolate between the two colors
    vec3 finalColor = mix(bottomColor, topColor, t);
    
    FragColor = vec4(finalColor, 1.0);
}