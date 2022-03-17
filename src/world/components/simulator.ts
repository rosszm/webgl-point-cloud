import * as THREE from "three";
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
  size: number;

  private gpuCompute: GPUComputationRenderer;
  private position: Variable;
  private velocity: Variable;
  private raycaster: THREE.Raycaster;
  private particles: THREE.Points;

  /**
   * Creates a new Particle Simulator.
   * @param particles a geometry where vertices represent individual particles
   * @param renderer the WebGL renderer
   */
  constructor(particles: THREE.Points, renderer: THREE.WebGLRenderer) {
    this.raycaster = new THREE.Raycaster(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0));
    this.particles = particles;
    this.size = Math.round(Math.sqrt(particles.geometry.getAttribute("position").count));
    this.gpuCompute = new GPUComputationRenderer(this.size, this.size, renderer);

    let tex = this.getDataTextures();
    this.position = this.gpuCompute.addVariable("u_PositionTexture", positionShader, tex.position),
    this.velocity = this.gpuCompute.addVariable("u_VelocityTexture", velocityShader, tex.velocity),

    this.gpuCompute.setVariableDependencies(this.position, [this.position, this.velocity]);
    this.gpuCompute.setVariableDependencies(this.velocity, [this.position, this.velocity]);

    this.position.material.uniforms.u_Dt = {value: DELTA_TIME};
    this.velocity.material.uniforms.u_Dt = {value : DELTA_TIME};
    this.velocity.material.uniforms.u_OriginPositionTexture = {value: tex.position};

    let error = this.gpuCompute.init();
    if (error) {
      throw new SimulatorError("Could not initialize GPU compute renderer");
    }
  }

  /**
   * Returns the position and velocity data textures created from given particles geometry.
   */
  private getDataTextures() {
    let textures = {
      position: this.gpuCompute.createTexture(),
      velocity: this.gpuCompute.createTexture(),
    }
    let positionData: Uint8ClampedArray = textures.position.image.data;
    let velocityData: Uint8ClampedArray = textures.velocity.image.data;

    // offset is 4 because texture values are stored as a vec4
    for (let i=0; i < positionData.length / 4; i++) {
      let geometryAttribute = this.particles.geometry.getAttribute("position");
      let position = (new THREE.Vector3()).fromBufferAttribute(geometryAttribute, i);
      let particleIndex = 4 * i;

      positionData[particleIndex] = position.x;
      positionData[particleIndex + 1] = position.y;
      positionData[particleIndex + 2] = position.z;
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

  /**
   * Updates the ray uniform with a new origin and direction.
   * @param coords 2D coordinates of the mouse, in normalized device coordinates (NDC)
   * @param camera camera from which the ray should originate
   */
  setRayFromCamera(coords: {x: number, y: number}, camera: THREE.Camera) {
    this.raycaster.setFromCamera(coords, camera);
    this.velocity.material.uniforms.u_Ray = {
      value: {
        origin: this.particles.worldToLocal(this.raycaster.ray.origin),
        direction: this.particles.worldToLocal(this.raycaster.ray.direction),
      }
    }
  }

  /** Returns the position texture of this simulator's current render target. */
  getPositionTexture(): THREE.Texture {
    return this.gpuCompute.getCurrentRenderTarget(this.position).texture;
  }
}