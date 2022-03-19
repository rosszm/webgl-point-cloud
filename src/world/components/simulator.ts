import * as THREE from "three";
import { GPUComputationRenderer, Variable } from "three/examples/jsm/misc/GPUComputationRenderer";
import { positionShader, velocityShader } from "../shaders";


/** Represents a pointer/mouse in the screen space. */
export interface Pointer {
  /** The current 2D coordinates in normalized device coordinates (NDC). */
  coords: {
    x: number;
    y: number;
  };
  /** The 2D movement vector. */
  movement: {
    x: number;
    y: number;
  };
}


/** Base error for the simulator module. */
export class SimulatorError extends Error {};

/**
 * Particle Simulator.
 *
 * Simulates the mouse/pointer repulsion effect on a point cloud.
 */
export class ParticleSimulator {
  size: number;
  deltaTime: number;

  private gpuCompute: GPUComputationRenderer;
  private position: Variable;
  private velocity: Variable;
  private raycaster: THREE.Raycaster;
  private pointerDirection: THREE.Vector3;
  private particles: THREE.Points;

  /**
   * Creates a new Particle Simulator.
   * @param particles a geometry where vertices represent individual particles
   * @param renderer the WebGL renderer
   */
  constructor(particles: THREE.Points, renderer: THREE.WebGLRenderer) {
    this.particles = particles;
    this.deltaTime = 1.0;

    this.raycaster = new THREE.Raycaster(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0));
    this.pointerDirection = new THREE.Vector3();

    this.size = Math.round(Math.sqrt(particles.geometry.getAttribute("position").count));
    this.gpuCompute = new GPUComputationRenderer(this.size, this.size, renderer);

    let tex = this.getDataTextures();
    this.position = this.gpuCompute.addVariable("u_PositionTexture", positionShader, tex.position),
    this.velocity = this.gpuCompute.addVariable("u_VelocityTexture", velocityShader, tex.velocity),

    this.gpuCompute.setVariableDependencies(this.position, [this.position, this.velocity]);
    this.gpuCompute.setVariableDependencies(this.velocity, [this.position, this.velocity]);

    this.position.material.uniforms.u_Dt = {value: this.deltaTime};
    this.velocity.material.uniforms.u_Dt = {value : this.deltaTime};
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
   * Updates the pointer within this simulation.
   * @param pointer the new pointer values.
   * @param camera the camera from which the pointer is projected
   */
  setPointerFromCamera(pointer: Pointer, camera: THREE.Camera) {
    this.raycaster.setFromCamera(pointer.movement, camera);
    this.pointerDirection.copy(this.raycaster.ray.direction);
    this.raycaster.setFromCamera(pointer.coords, camera);
    this.pointerDirection.sub(this.raycaster.ray.direction);

    this.velocity.material.uniforms.u_Ray = {
      value: {
        origin: this.particles.worldToLocal(this.raycaster.ray.origin),
        direction: this.particles.worldToLocal(this.raycaster.ray.direction),
      }
    }
    this.velocity.material.uniforms.u_PointerDirection = {
      value: this.particles.worldToLocal(this.pointerDirection)
    }
  }

  /** Returns the position texture of this simulator's current render target. */
  getPositionTexture(): THREE.Texture {
    return this.gpuCompute.getCurrentRenderTarget(this.position).texture;
  }
}