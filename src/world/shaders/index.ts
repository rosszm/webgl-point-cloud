/**
 * This module contains the raw shader files for the project.
 */

// import from glsl shader files.
import vertexShader from "./rep-vert.glsl?raw";
import fragmentShader from "./rep-frag.glsl?raw";
import positionShader from "./rep-pos.glsl?raw";
import velocityShader from "./rep-vel.glsl?raw";

// export as TS strings constants.
export {
  vertexShader,
  fragmentShader,
  positionShader,
  velocityShader,
};