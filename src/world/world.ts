import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { ParticleSimulator } from "./components/simulator";
import * as Particles from "./components/particles";
import { getCamera } from "./components/camera";


const raycaster = new THREE.Raycaster(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0));

let renderer: THREE.WebGLRenderer;
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let controls: OrbitControls;
let simulator: ParticleSimulator;


/**
 * Initializes the world.
 */
export async function init() {
	/// start loading particle geometry.
	Particles.loadFromModel("../models/scene.ply", onModelProgress).then(addParticles);

	renderer = new THREE.WebGLRenderer({antialias : true});
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setClearColor(new THREE.Color(0, 0, 0));

	let container = document.getElementById("scene");
	container!.appendChild(renderer.domElement);

	scene = new THREE.Scene();

	[camera, controls] = getCamera(renderer);

	// Add the event listeners
	window.addEventListener("resize", onWindowResize, false);
	window.addEventListener("pointermove", onPointerMove, false);
}

/**
 * Handles the load progress of a model file.
 *
 * @param progress the load event
 */
 function onModelProgress(progress: ProgressEvent) {
	console.log("progress: ", progress.loaded/progress.total * 100)
}

/**
 * Add particles to the world. Requires that `scene`, `camera`, and `controls` are not undefined.
 *
 * @param particles the particles to be added
 */
function addParticles(particles: THREE.Points) {
	simulator = new ParticleSimulator(particles.geometry, renderer);
	Particles.setPositionTextureSize(simulator.size);

	// center camera on the particles
	let bb = new THREE.Box3();
	bb.setFromObject(particles);
	bb.getCenter(controls.target);
	controls.update();

	scene.add(particles);
}

/**
 * Updates the renderer size and the camera aspect ratio when the window is resized
 */
 function onWindowResize(_event: any) {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);

	Particles.updateParticleSize();
}

/**
 * Updates the ray when the pointer is moved.
 */
function onPointerMove(event: PointerEvent) {
	raycaster.setFromCamera({
		x: (event.clientX / window.innerWidth) * 2 - 1,
		y: -(event.clientY / window.innerHeight) * 2 + 1,
	}, camera);

	Particles.setRay(raycaster.ray.origin, raycaster.ray.direction);
}

/**
 * Renders the world.
 */
export function render() {
	if (simulator) {
		simulator.compute();
		Particles.setPositionTexture(simulator.getPositionTexture());
	}
	// Render the particles on the screen
	renderer.render(scene, camera);
}

