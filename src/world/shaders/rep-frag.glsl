// FRAGMENT SHADER

in vec3 v_Color;

out vec4 color;

/*
* The main program
*/
void main() {
    // Makes the particles appear round
    if (length(gl_PointCoord - vec2(.5)) > .475) {
        discard;
    }
    color = vec4(v_Color, 1.0);
}
