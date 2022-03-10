export const vertexShader = `
    // VERTEX SHADER

    struct ray3 {
        vec3 origin;
        vec3 direction;
    };

    attribute float index;
    attribute vec3 color;

    uniform float u_ParticleSize;
    uniform sampler2D u_PositionTexture;
    uniform float u_PositionDimensions;
    uniform ray3 u_Ray;

    out vec3 v_Color;

    /// Returns the position of a particle from a 2D Texture.
    ///
    /// tex - the 2D texture
    /// dim - the dimensions of the texture
    /// i - the index of the particle
    vec4 positionFromTexture2D(sampler2D tex, float dim, float i) {
        vec2 texCoord = (vec2(mod(i, dim), floor(i / dim)) + .5) / vec2(dim);
        return texture2D(tex, texCoord);
    }

    /// Returns a vector perpendicular to the point projected onto the ray.
    vec3 projectOnRayT(vec3 point, ray3 ray) {
        vec3 r = ray.direction;
        vec3 v = ray.origin - point;
        vec3 v_r = (dot(v, r) / dot(r, r)) * r;
        return v - v_r;
    }

    /// The main program.
    void main() {
        // Get the point model view position
        vec4 position = positionFromTexture2D(u_PositionTexture, u_PositionDimensions, index);
        vec4 worldPosition = modelMatrix * position;
        vec4 viewPosition = modelViewMatrix * position;

        // Vertex shader output
        v_Color = color;
        vec3 orth = projectOnRayT(worldPosition.xyz, u_Ray);
        if (length(orth) < 1.0) {
            v_Color = -orth;
            if (length(orth) < .1) v_Color = vec3(255);
        }
        
        gl_PointSize = -u_ParticleSize / viewPosition.z;
        gl_Position = projectionMatrix * viewPosition;
    }
`
