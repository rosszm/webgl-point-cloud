import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GPUComputationRenderer } from "three/examples/jsm/misc/GPUComputationRenderer"
import Stats from "three/examples/jsm/libs/stats.module"
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import { positionShader, velocityShader, vertexShader, fragmentShader } from "./shaders"


var renderer: THREE.WebGLRenderer;
var scene: THREE.Scene;
var camera: THREE.PerspectiveCamera;
var stats: Stats
var simulator: any;
var positionVariable: any; 
var uniforms: any;
var geo: THREE.BufferGeometry;

const raycaster = new THREE.Raycaster();

init();
animate();

/*
	* Initializes the sketch
	*/
function init() {
	// Initialize the WebGL renderer
	renderer = new THREE.WebGLRenderer({
		antialias : true
	});
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setClearColor(new THREE.Color(0, 0, 0));

	// Add the renderer to the sketch container
	var container = document.getElementById("scene");
	container!.appendChild(renderer.domElement);

	// Initialize the scene
	scene = new THREE.Scene();

	// Initialize the camera
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
	camera.position.z = 10;

	// Initialize the camera controls
	var controls = new OrbitControls(camera, renderer.domElement);
	controls.enablePan = true;

	// Initialize the statistics monitor and add it to the sketch container
	stats = Stats();
	document.getElementById("stats")!.appendChild(stats.dom);

	// Create the particles geometry
	let loader = new PLYLoader();
	loader.load("../models/scene.ply", geometry => {
		geo = geometry;
		let nParticles = geometry.getAttribute("position").count
		let dim = Math.round(Math.sqrt(nParticles)); // round ensures the textures can hold all the values
	
		// Initialize the simulator

		// Define the particle shader uniforms
		uniforms = {
			u_ViewHeight : {
				type : "f",
				value : window.innerHeight
			},
			u_ParticleSize : {
				type : "f",
				value : 4 * window.devicePixelRatio * (window.innerHeight / 1080.0)
			},
			u_PositionDimensions : {
				value : {
					x: dim,
					y: dim,
				}
			},
			u_PositionTexture : {
				type : "t",
				value : null
			},
			u_Ray: {
				value: {
					origin: raycaster.ray.origin,
					direction: raycaster.ray.direction
				}
			}
		};

		// Create the particles shader material
		var material = new THREE.ShaderMaterial({
			glslVersion: THREE.GLSL3,
			uniforms : uniforms,
			vertexShader : vertexShader,
			fragmentShader : fragmentShader,
	});


		let indices = new Float32Array(nParticles);
		geo.setAttribute("index", new THREE.BufferAttribute(indices, 1));
		for (var i = 0; i < nParticles; i++) {
			indices[i] = i;
		} 
		// Create the particles and add them to the scene
		var particles = new THREE.Points(geo, material);
		scene.add(particles);

		let bb = new THREE.Box3();
		bb.setFromObject(particles);
		bb.getCenter(controls.target);

		simulator = getSimulator(dim, dim, renderer);
		positionVariable = getSimulationVariable("u_PositionTexture", simulator);
	})

	

	// Add the event listeners
	window.addEventListener("resize", onWindowResize, false);
	window.addEventListener("pointermove", onPointerMove, false);
}

/*
	* Initializes and returns the GPU simulator
	*/
function getSimulator(sizeX: number, sizeY: number, renderer: THREE.WebGLRenderer) {
	// Create a new GPU simulator instance
	var gpuSim = new GPUComputationRenderer(sizeX, sizeY, renderer);

	// Create the position and the velocity textures
	var positionTexture = gpuSim.createTexture();
	var velocityTexture = gpuSim.createTexture();

	// Fill the texture data arrays with the simulation initial conditions
	setInitialConditions(positionTexture, velocityTexture);

	// Add the position and velocity variables to the simulator
	var positionVariable = gpuSim.addVariable("u_PositionTexture", positionShader, positionTexture);
	var velocityVariable = gpuSim.addVariable("u_VelocityTexture", velocityShader, velocityTexture);

	// Specify the variable dependencies
	gpuSim.setVariableDependencies(positionVariable, [ positionVariable, velocityVariable ]);
	gpuSim.setVariableDependencies(velocityVariable, [ positionVariable, velocityVariable ]);

	// Add the position uniforms
	var positionUniforms = positionVariable.material.uniforms;
	positionUniforms.u_Dt = {value: 1.0};

	// Add the velocity uniforms
	var velocityUniforms = velocityVariable.material.uniforms;
	velocityUniforms.u_Dt = {value : positionUniforms.u_Dt.value};

	// Initialize the GPU simulator
	var error = gpuSim.init();

	if (error !== null) {
		console.error(error);
	}
	return gpuSim;
}

/*
	* Sets the simulation initial conditions
	*/
function setInitialConditions(positionTexture: THREE.DataTexture, velocityTexture: THREE.DataTexture) {
	// Get the position and velocity arrays
	var position = positionTexture.image.data;
	var velocity = velocityTexture.image.data;

	// Fill the position and velocity arrays
	var nParticles = position.length / 4;

	for (var i=0; i < nParticles; i++) {
		// Calculate the point x,y,z coordinates
		let geoPos = geo.getAttribute("position")
		var particleIndex = 4 * i;
		position[particleIndex] = geoPos.getX(i);
		position[particleIndex + 1] = geoPos.getY(i);
		position[particleIndex + 2] = geoPos.getZ(i);
		position[particleIndex + 3] = 1;

		// Start with zero initial velocity
		velocity[i] = 0;
		velocity[i+1] = 0;
		velocity[i+2] = 0;
		velocity[i+3] = 1;
	}
}

/*
	* Returns the requested simulation variable
	*/
function getSimulationVariable(variableName: string, gpuSim: any) {
	for (var i = 0; i < gpuSim.variables.length; i++) {
		if (gpuSim.variables[i].name === variableName) {
			return gpuSim.variables[i];
		}
	}
	return null;
}

/*
	* Animates the sketch
	*/
function animate() {
	requestAnimationFrame(animate);
	render();
	stats.update();
}

/*
	* Renders the sketch
	*/
function render() {
	// Run several iterations per frame
	for (var i = 0; i < 1; i++) {
		simulator.compute();
	}

	// Update the uniforms
	uniforms.u_Ray = {
		value: {
			origin: raycaster.ray.origin,
			direction: raycaster.ray.direction,
		}
	}
	uniforms.u_PositionTexture.value = simulator.getCurrentRenderTarget(positionVariable).texture;

	// Render the particles on the screen
	renderer.render(scene, camera);
}

/*
	* Updates the renderer size and the camera aspect ratio when the window is resized
	*/
function onWindowResize(_event: any) {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
	uniforms.u_ParticleSize.value = 4 * window.devicePixelRatio * (window.innerHeight / 1080.0);
	console.log(uniforms.u_ViewHeight);
}

function onPointerMove(event: any) {
	raycaster.setFromCamera({
		x: (event.clientX / window.innerWidth) * 2 - 1,
		y: (event.clientY / window.innerHeight) * 2 + 1,
	}, camera);
}