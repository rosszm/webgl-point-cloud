import * as THREE from "three";
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader";
import { fragmentShader, vertexShader } from "../shaders";


// Define constants for scaling particle size.
const PARTICLE_SIZE = 4;
const HEIGHT_CONSTANT = 1080.0;

/**
 * The particle uniforms. These are the uniform values passed to the particle vertex shader.
 */
const uniforms = {
	u_ViewHeight: {
		type: "f",
		value: window.innerHeight
	},
	u_ParticleSize : {
		type: "f",
		value: getParticleSize()
	},
	u_TextureSize: {
		type: "f",
		value: 0
	},
	u_PositionTexture: {
		type: "t",
		value: new THREE.Texture()
	},
	u_Ray: {
		value: {
			origin: new THREE.Vector3(0, 0, 0),
			direction: new THREE.Vector3(0, 0, 0)
		}
	}
};


/**
 * Loads the particles from a given model file.
 *
 * @param model the model to create the particles from.
 * @param onProgress a function that specifies what to do while loading the file.
 * @returns a promise to the particles.
 */
export async function loadFromModel(
  model: string,
  onProgress?: (event: ProgressEvent<EventTarget>) => void | undefined
): Promise<THREE.Points> {
  return new PLYLoader().loadAsync(model, onProgress).then(particlesFromGeometry);
}

/** Set the size of the particles */
export function updateParticleSize(): void {
  uniforms.u_ParticleSize.value = getParticleSize();
}

/**
 * Sets the size of the position texture. The size represents the hight and width values to use
 * for the position texture.
 *
 * @param size the size of the position texture.
 */
export function setPositionTextureSize(size: number): void {
  uniforms.u_TextureSize.value = size;
}

/**
 * Sets the raycaster values for the particles.
 *
 * @param origin the origin of the ray.
 * @param direction the direction of the ray.
 */
export function setRay(origin: THREE.Vector3, direction: THREE.Vector3): void {
  uniforms.u_Ray.value = {origin: origin, direction: direction};
}

/**
 * Sets the position texture of the particles.
 *
 * @param positionTexture a data texture containing position values.
 */
export function setPositionTexture(positionTexture: THREE.Texture): void {
  uniforms.u_PositionTexture.value = positionTexture;
}

/**
 * Creates the points from a given geometry.
 *
 * @param geometry the points geometry.
 */
function particlesFromGeometry(geometry: THREE.BufferGeometry): THREE.Points {
  let n = geometry.getAttribute("position").count
  let indices = new Float32Array(n);
  geometry.setAttribute("index", new THREE.BufferAttribute(indices, 1));
  for (let i=0; i < n; i++) indices[i] = i;

  let material = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3,
    uniforms : uniforms,
    vertexShader : vertexShader,
    fragmentShader : fragmentShader,
  });
  return new THREE.Points(geometry, material);
}

/**
 * Returns the size of particles based off the window size.
 */
function getParticleSize(): number {
	return PARTICLE_SIZE * window.devicePixelRatio * (window.innerHeight / HEIGHT_CONSTANT);
}