// FRAGMENT SHADER

// Simulation uniforms
uniform float u_Dt;

/*
* The main program
*/
void main() {
    // Get the point texture position
    vec2 uv = gl_FragCoord.xy / resolution;

    // Get the point current position and velocity
    vec3 position = texture2D(u_PositionTexture, uv).xyz;
    vec3 velocity = texture2D(u_VelocityTexture, uv).xyz;

    // Return the updated point position
    gl_FragColor = vec4(position + u_Dt * velocity, 1.0);
}
