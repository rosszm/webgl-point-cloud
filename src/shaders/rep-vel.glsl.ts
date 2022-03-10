export const velocityShader = `
    // FRAGMENT SHADER

    struct ray3 {
        vec3 origin;
        vec3 direction;
    };

    // Simulation uniforms
    uniform float u_Dt;
    uniform ray3 u_Ray;

    // Simulation constants
    const float width = resolution.x;
    const float height = resolution.y;

    // Softening factor. This is required to avoid high acceleration values
    // when two particles get too close
    const float softening = 0.1;

    /// Returns a vector perpendicular to the point projected onto the ray.
    vec3 projectOnRayT(vec3 point, ray3 ray) {
        vec3 r = ray.direction;
        vec3 v = ray.origin - point;
        vec3 v_r = (dot(v, r) / dot(r, r)) * r;
        return v - v_r;
    }

    /*
    * The main program
    */
    void main() {
        // Get the particle texture position
        vec2 uv = gl_FragCoord.xy / resolution;

        // Get the particle current position and velocity
        vec3 position = texture2D(u_PositionTexture, uv).xyz;
        vec3 velocity = texture2D(u_VelocityTexture, uv).xyz;

        vec3 force = vec3(0.0);

        
        gl_FragColor = vec4(velocity + u_Dt * force, 1.0);
    }
`
