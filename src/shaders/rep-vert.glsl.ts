export const vertexShader = `
    // VERTEX SHADER 

    struct ray {
        vec3 origin;
        vec3 direction;
    };

    attribute float index;
    attribute vec3 color;

    uniform float u_ParticleSize;
    uniform sampler2D u_PositionTexture;
    uniform vec2 u_PositionDimensions;
    uniform float u_ViewHeight;
    uniform ray u_Ray;

    out vec3 v_Color;

    /// Returns the position of a particle from a 2D Texture.
    ///
    /// tex - the 2D texture
    /// dim - the dimensions of the texture
    /// i - the index of the particle
    vec4 positionFromTexture2D(sampler2D tex, vec2 dim, float i) {
        vec2 texCoord = (vec2(mod(i, dim.x), floor(i / dim.x)) + .5) / dim;
        return texture2D(tex, texCoord);
    }

    /// The main program.
    void main() {
        // Get the point model view position
        vec4 position = positionFromTexture2D(u_PositionTexture, u_PositionDimensions, index);
        vec4 mvPosition = modelViewMatrix * position;

        // Vertex shader output
        v_Color = color;
        
        gl_PointSize = -u_ParticleSize / mvPosition.z;
        gl_Position = projectionMatrix * mvPosition;
    }
`
