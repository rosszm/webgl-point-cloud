import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { ParticleSimulator, Pointer } from "./components/simulator";
import * as Particles from "./components/particles";
import { getCamera } from "./components/camera";
import modelURL from "../../models/scene.ply?url";


let renderer: THREE.WebGLRenderer;
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let controls: OrbitControls;
let simulator: ParticleSimulator;
let zoom: number;
let pointer: Pointer;


/**
 * Initializes the world.
 */
export async function init() {
	/// start loading particle geometry.
	Particles.loadFromModel(modelURL, onModelProgress).then(addParticles);

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
	console.log("progress: ", progress.loaded / progress.total * 100)
}

/**
 * Add particles to the world. Requires that `scene`, `camera`, and `controls` are not undefined.
 *
 * @param particles the particles to be added
 */
function addParticles(particles: THREE.Points) {
	particles.rotateX(2.9);
	simulator = new ParticleSimulator(particles, renderer);
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
	let coords = {
		x: (event.clientX / window.innerWidth) * 2 - 1,
		y: -(event.clientY / window.innerHeight) * 2 + 1,
	};
	pointer = {
		coords: coords,
		movement: {
			x: coords.x + event.movementX / window.innerWidth,
			y: coords.y - event.movementY / window.innerHeight,
		}
	};
	if (simulator) {
		simulator.setPointerFromCamera(pointer, camera);
	}
}

/**
 * Renders the world.
 */
export function render() {
	if (simulator) {
		detectCameraZoom();

		simulator.compute(3);
		Particles.setPositionTexture(simulator.getPositionTexture());
	}
	// Render the particles on the screen
	renderer.render(scene, camera);
}

function detectCameraZoom() {
	let newZoom = controls.target.distanceTo(controls.object.position);
	if (newZoom != zoom) {
		if (pointer) {
			simulator.setPointerFromCamera(pointer, camera);
		}
		zoom = newZoom;
	}
}
