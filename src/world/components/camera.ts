import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";


/**
 * Creates the camera and orbit controls used by the world.
 *
 * @param renderer the world renderer.
 * @returns the perspective camera and orbit controls
 */
export function getCamera(renderer: THREE.WebGLRenderer): [THREE.PerspectiveCamera, OrbitControls] {
  let camera = new THREE.PerspectiveCamera(
    50,
    renderer.domElement.width / renderer.domElement.height,
    0.1,
    500
  );
	camera.position.z = 10;
	let controls = new OrbitControls(camera, renderer.domElement);
	controls.enablePan = true;

  return [camera, controls];
}