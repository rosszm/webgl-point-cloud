// VERTEX SHADER

in float index;
in vec3 color;

uniform float u_ParticleSize;
uniform sampler2D u_PositionTexture;
uniform float u_TextureSize;

out vec3 v_Color;

/// Returns the position of a particle from a 2D Texture.
///
/// tex - the 2D texture
/// size - the size of the texture
/// i - the index of the particle
vec4 positionFromTexture2D(sampler2D tex, float size, float i) {
    vec2 texCoord = (vec2(mod(i, size), floor(i / size)) + .5) / vec2(size);
    return texture2D(tex, texCoord);
}

/// The main program.
void main() {
    // Get the point model view position
    vec4 position = positionFromTexture2D(u_PositionTexture, u_TextureSize, index);
    vec4 viewPosition = modelViewMatrix * position;

    // Vertex shader output
    v_Color = color;

    gl_PointSize = -u_ParticleSize / viewPosition.z;
    gl_Position = projectionMatrix * viewPosition;
}
