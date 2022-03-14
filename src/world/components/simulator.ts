import THREE from "three";
import { GPUComputationRenderer, Variable } from "three/examples/jsm/misc/GPUComputationRenderer";
import { positionShader, velocityShader } from "../shaders";


const DELTA_TIME = 1.0;


/** Base error for the simulator module. */
export class SimulatorError extends Error {};


export interface SimulatorShaderVariables {
  position: ShaderVariable;
  velocity: ShaderVariable;
}

export interface ShaderVariable {
  name: string;
  shader: string;
}

export class ParticleSimulator {
  gpuCompute: GPUComputationRenderer;
  position: Variable;
  velocity: Variable;
  size: number;

  /**
   * Creates a new Particle Simulator.
   * @param geometry a geometry where vertices represent individual particles
   * @param renderer the WebGL renderer
   */
  constructor(geometry: THREE.BufferGeometry, renderer: THREE.WebGLRenderer) {
    this.size = Math.round(Math.sqrt(geometry.getAttribute("position").count));
    this.gpuCompute = new GPUComputationRenderer(this.size, this.size, renderer);

    let tex = this.getDataTextures(geometry);
    this.position = this.gpuCompute.addVariable("u_PositionTexture", positionShader, tex.position),
    this.velocity = this.gpuCompute.addVariable("u_VelocityTexture", velocityShader, tex.velocity),

    this.gpuCompute.setVariableDependencies(this.position, [this.position, this.velocity]);
    this.gpuCompute.setVariableDependencies(this.velocity, [this.position, this.velocity]);

    this.position.material.uniforms.u_Dt = {value: DELTA_TIME};
    this.velocity.material.uniforms.u_Dt = {value : DELTA_TIME};

    let error = this.gpuCompute.init();
    if (error) {
      throw new SimulatorError("Could not initialize GPU compute renderer");
    }
  }

  /**
   * Returns the position and velocity data textures created from given geometry.
   *
   * @param geometry a geometry where each vertex represent a particle
   */
  private getDataTextures(geometry: THREE.BufferGeometry) {
    let textures = {
      position: this.gpuCompute.createTexture(),
      velocity: this.gpuCompute.createTexture(),
    }
    let positionData: Uint8ClampedArray = textures.position.image.data;
    let velocityData: Uint8ClampedArray = textures.velocity.image.data;

    // offset is 4 because texture values are stored as a vec4
    for (let i=0; i < positionData.length / 4; i++) {
      let geometryPosition = geometry.getAttribute("position")
      let particleIndex = 4 * i;
      positionData[particleIndex] = geometryPosition.getX(i);
      positionData[particleIndex + 1] = geometryPosition.getY(i);
      positionData[particleIndex + 2] = geometryPosition.getZ(i);
      positionData[particleIndex + 3] = 1;

      // Start with zero initial velocity
      velocityData[i] = 0;
      velocityData[i+1] = 0;
      velocityData[i+2] = 0;
      velocityData[i+3] = 1;
    }
    return textures;
  }

  /**
   * Computes a number of iterations on this simulation.
   *
   * Pre-conditions:
   * -  0 < `n`
   *
   * @param n the number of iterations to compute. Defaults to 1.
   */
  compute(n: number = 1): void {
    if (n < 1) throw new SimulatorError("compute(): n must be greater than 0.");

    for (let i=0; i < n; i++) {
      this.gpuCompute.compute();
    }
  }

  /** Returns the position texture of this simulator's current render target. */
  getPositionTexture(): THREE.Texture {
    return this.gpuCompute.getCurrentRenderTarget(this.position).texture;
  }
}