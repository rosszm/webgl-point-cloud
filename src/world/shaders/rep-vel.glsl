// FRAGMENT SHADER

struct ray3 {
    vec3 origin;
    vec3 direction;
};

// Simulation uniforms
uniform float u_Dt;
uniform ray3 u_Ray;
uniform sampler2D u_OriginPositionTexture;

// Simulation constants
const float repulsionRadius = .1;
const float repulsionStrength = .1;
const float restorationStregth = .05;

/// Returns the orthogonal projection of a vector, v, onto a line described by
/// the vector, r.
vec3 projectVector(vec3 v, vec3 r) {
    vec3 v_r = (dot(v, r) / dot(r, r)) * r;
    return v_r;
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
    vec3 origin = texture2D(u_OriginPositionTexture, uv).xyz;

    vec3 totalForce = vec3(0.);

    // Restoring force. This forces pulls particles back to their original
    // position.
    vec3 restoringForce = (origin - position)* restorationStregth - velocity;
    totalForce += restoringForce;

    // orthogonal projection of the position onto the ray
    vec3 v = position - u_Ray.origin;
    vec3 v_ray = projectVector(v, u_Ray.direction);
    vec3 v_rayT = v - v_ray; // T here indicates perendicular

    float radius = repulsionRadius * length(v_ray);
    float distanceFromRay = length(v_rayT);
    if (distanceFromRay < radius) {
        totalForce += v_rayT * repulsionStrength;
    }

    gl_FragColor = vec4(velocity + u_Dt * totalForce, 1.);
}
