// FRAGMENT SHADER

struct ray3 {
    vec3 origin;
    vec3 direction;
};

// Simulation uniforms
uniform float u_Dt;
uniform ray3 u_Ray;
uniform vec3 u_PointerDirection;
uniform sampler2D u_OriginPositionTexture;

// Simulation constants
const float repulsionRadius = .05;
const float repulsionStrength = .05;
const float restorationStregth = .01;
const float pointerStrength = 2.5;

/// Returns the projection of a vector, v, onto a line described by
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

    // project the position onto the ray
    vec3 v = position - u_Ray.origin;
    vec3 v_ray = projectVector(v, u_Ray.direction);
    vec3 v_RayT = v - v_ray; // T here indicates perendicular

    float particleDistance = length(v_ray);

    // Calculate the spring force that the returns paricles to their original
    // position.
    totalForce += (origin - position) * restorationStregth - velocity;

    // calculate the repulsion force around the pointer.
    float radius = repulsionRadius * particleDistance;
    float isInRadius = float(length(v_RayT) < radius);
    totalForce += v_RayT * repulsionStrength * isInRadius;

    // calculate the component of pointer force that applies to the particle
    vec3 pointerForce = projectVector(u_PointerDirection, v_RayT);
    float isInPointerDirection = float(dot(u_PointerDirection, v_RayT) > 0.);
    pointerForce *= pointerStrength * particleDistance;
    totalForce += pointerForce * isInRadius * isInPointerDirection;

    gl_FragColor = vec4(velocity + u_Dt * totalForce, 1.);
}
