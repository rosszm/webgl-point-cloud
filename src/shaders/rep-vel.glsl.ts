export const velocityShader = `
    // FRAGMENT SHADER

    // Simulation uniforms
    uniform float u_Dt;

    // Simulation constants
    const float width = resolution.x;
    const float height = resolution.y;

    // Softening factor. This is required to avoid high acceleration values
    // when two particles get too close
    const float softening = 0.1;

    /*
    * The main program
    */
    void main() {
        
    }
`
