# WebGL Point Cloud Example
Example particle simulation with point clouds using WebGL2 shaders and [three.js](https://threejs.org/).

See the [Live demo](https://rosszm.github.io/webgl-point-cloud).

## Point Cloud Data
The point cloud data was generated from a drone video (https://www.youtube.com/watch?v=yiNJTDxF8FY) of the [Temple of Poseidon](https://en.wikipedia.org/wiki/Temple_of_Poseidon,_Sounion).
The video was clipped and spliced into images via [`ffmpeg`](https://github.com/ffmpeg/ffmpeg), then fed into [`colmap`](https://github.com/colmap/colmap) to generate the point cloud model.

## Build
Download the git repository:
```sh
git clone https://github.com/rosszm/webgl-point-cloud.git
cd webgl-point-cloud
```

Install Node dependencies (Yarn):
```sh
yarn
```

Run the Vite dev server (Yarn):
```sh
yarn dev
```
This will print the address of the server, which defaults to [localhost:3000](http://localhost:3000).

## References
Here is a list of references I found helpful for this project:
- [WebGL2 Fundamentals](https://webgl2fundamentals.org/)
- [Learn OpenGL](https://learnopengl.com)
- [WebGL Shader Examples](https://webgl-shaders.com/)
- [Three.js GPGPU Examples](https://threejs.org/examples/?q=gpgpu)
- [The Book of Shaders](https://thebookofshaders.com)
- [Interactive Linear Algebra [UBC]](https://personal.math.ubc.ca/~tbjw/ila/index.html)
