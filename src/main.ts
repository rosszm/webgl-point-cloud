import Stats from "three/examples/jsm/libs/stats.module"
import * as World from "./world"

const stats = Stats();

// run the main program.
main();

/** The main three.js program */
function main() {
  World.init();
  document.getElementById("stats")!.appendChild(stats.dom);
  animate();
}

/**
 * Animates the world.
 */
function animate() {
  requestAnimationFrame(animate);
	World.render();
	stats.update();
}