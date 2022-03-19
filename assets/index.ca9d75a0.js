var T=Object.defineProperty;var P=(e,t,n)=>t in e?T(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n;var a=(e,t,n)=>(P(e,typeof t!="symbol"?t+"":t,n),n);import{R as C,V as l,G as D,T as S,P as z,B as R,S as b,a as F,b as E,c as A,O as L,W as V,C as G,d as H,e as M,f as I}from"./vendor.d98ab21d.js";const O=function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))o(i);new MutationObserver(i=>{for(const r of i)if(r.type==="childList")for(const c of r.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&o(c)}).observe(document,{childList:!0,subtree:!0});function n(i){const r={};return i.integrity&&(r.integrity=i.integrity),i.referrerpolicy&&(r.referrerPolicy=i.referrerpolicy),i.crossorigin==="use-credentials"?r.credentials="include":i.crossorigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function o(i){if(i.ep)return;i.ep=!0;const r=n(i);fetch(i.href,r)}};O();var j=`// VERTEX SHADER

in float index;
in vec3 color;

uniform float u_ParticleSize;
uniform sampler2D u_PositionTexture;
uniform float u_TextureSize;

out vec3 v_Color;

/// Returns the position of a particle from a 2D Texture.
///
/// tex - the 2D texture
/// size - the size of the texture
/// i - the index of the particle
vec4 positionFromTexture2D(sampler2D tex, float size, float i) {
    vec2 texCoord = (vec2(mod(i, size), floor(i / size)) + .5) / vec2(size);
    return texture2D(tex, texCoord);
}

/// The main program.
void main() {
    // Get the point model view position
    vec4 position = positionFromTexture2D(u_PositionTexture, u_TextureSize, index);
    vec4 viewPosition = modelViewMatrix * position;

    // Vertex shader output
    v_Color = color;

    gl_PointSize = -u_ParticleSize / viewPosition.z;
    gl_Position = projectionMatrix * viewPosition;
}
`,N=`// FRAGMENT SHADER

in vec3 v_Color;

out vec4 color;

/*
* The main program
*/
void main() {
    // Makes the particles appear round
    if (length(gl_PointCoord - vec2(.5)) > .475) {
        discard;
    }
    color = vec4(v_Color, 1.0);
}
`,W=`// FRAGMENT SHADER

// Simulation uniforms
uniform float u_Dt;

/*
* The main program
*/
void main() {
    // Get the point texture position
    vec2 uv = gl_FragCoord.xy / resolution;

    // Get the point current position and velocity
    vec3 position = texture2D(u_PositionTexture, uv).xyz;
    vec3 velocity = texture2D(u_VelocityTexture, uv).xyz;

    // Return the updated point position
    gl_FragColor = vec4(position + u_Dt * velocity, 1.0);
}
`,B=`// FRAGMENT SHADER

struct ray3 {
    vec3 origin;
    vec3 direction;
};

// Simulation uniforms
uniform float u_Dt;
uniform ray3 u_Ray;
uniform vec3 u_PointerDirection;
uniform sampler2D u_OriginPositionTexture;

// Simulation constants
const float repulsionRadius = .05;
const float repulsionStrength = .05;
const float restorationStregth = .01;
const float pointerStrength = 2.5;

/// Returns the projection of a vector, v, onto a line described by
/// the vector, r.
vec3 projectVector(vec3 v, vec3 r) {
    vec3 v_r = (dot(v, r) / dot(r, r)) * r;
    return v_r;
}

/*
* The main program
*/
void main() {
    // Get the particle texture position
    vec2 uv = gl_FragCoord.xy / resolution;

    // Get the particle current position and velocity
    vec3 position = texture2D(u_PositionTexture, uv).xyz;
    vec3 velocity = texture2D(u_VelocityTexture, uv).xyz;
    vec3 origin = texture2D(u_OriginPositionTexture, uv).xyz;

    vec3 totalForce = vec3(0.);

    // project the position onto the ray
    vec3 v = position - u_Ray.origin;
    vec3 v_ray = projectVector(v, u_Ray.direction);
    vec3 v_RayT = v - v_ray; // T here indicates perendicular

    float particleDistance = length(v_ray);

    // Calculate the spring force that the returns paricles to their original
    // position.
    totalForce += (origin - position) * restorationStregth - velocity;

    // calculate the repulsion force around the pointer.
    float radius = repulsionRadius * particleDistance;
    float isInRadius = float(length(v_RayT) < radius);
    totalForce += v_RayT * repulsionStrength * isInRadius;

    // calculate the component of pointer force that applies to the particle
    vec3 pointerForce = projectVector(u_PointerDirection, v_RayT);
    float isInPointerDirection = float(dot(u_PointerDirection, v_RayT) > 0.);
    pointerForce *= pointerStrength * particleDistance;
    totalForce += pointerForce * isInRadius * isInPointerDirection;

    gl_FragColor = vec4(velocity + u_Dt * totalForce, 1.);
}
`;class g extends Error{}class X{constructor(t,n){a(this,"size");a(this,"deltaTime");a(this,"gpuCompute");a(this,"position");a(this,"velocity");a(this,"raycaster");a(this,"pointerDirection");a(this,"particles");this.particles=t,this.deltaTime=1,this.raycaster=new C(new l(0,0,0),new l(0,0,0)),this.pointerDirection=new l,this.size=Math.round(Math.sqrt(t.geometry.getAttribute("position").count)),this.gpuCompute=new D(this.size,this.size,n);let o=this.getDataTextures();if(this.position=this.gpuCompute.addVariable("u_PositionTexture",W,o.position),this.velocity=this.gpuCompute.addVariable("u_VelocityTexture",B,o.velocity),this.gpuCompute.setVariableDependencies(this.position,[this.position,this.velocity]),this.gpuCompute.setVariableDependencies(this.velocity,[this.position,this.velocity]),this.position.material.uniforms.u_Dt={value:this.deltaTime},this.velocity.material.uniforms.u_Dt={value:this.deltaTime},this.velocity.material.uniforms.u_OriginPositionTexture={value:o.position},this.gpuCompute.init())throw new g("Could not initialize GPU compute renderer")}getDataTextures(){let t={position:this.gpuCompute.createTexture(),velocity:this.gpuCompute.createTexture()},n=t.position.image.data,o=t.velocity.image.data;for(let i=0;i<n.length/4;i++){let r=this.particles.geometry.getAttribute("position"),c=new l().fromBufferAttribute(r,i),m=4*i;n[m]=c.x,n[m+1]=c.y,n[m+2]=c.z,n[m+3]=1,o[i]=0,o[i+1]=0,o[i+2]=0,o[i+3]=1}return t}compute(t=1){if(t<1)throw new g("compute(): n must be greater than 0.");for(let n=0;n<t;n++)this.gpuCompute.compute()}setPointerFromCamera(t,n){this.raycaster.setFromCamera(t.movement,n),this.pointerDirection.copy(this.raycaster.ray.direction),this.raycaster.setFromCamera(t.coords,n),this.pointerDirection.sub(this.raycaster.ray.direction),this.velocity.material.uniforms.u_Ray={value:{origin:this.particles.worldToLocal(this.raycaster.ray.origin),direction:this.particles.worldToLocal(this.raycaster.ray.direction)}},this.velocity.material.uniforms.u_PointerDirection={value:this.particles.worldToLocal(this.pointerDirection)}}getPositionTexture(){return this.gpuCompute.getCurrentRenderTarget(this.position).texture}}const q=4,U=1080,h={u_ViewHeight:{type:"f",value:window.innerHeight},u_ParticleSize:{type:"f",value:y()},u_TextureSize:{type:"f",value:0},u_PositionTexture:{type:"t",value:new S},u_Ray:{value:{origin:new l(0,0,0),direction:new l(0,0,0)}}};async function Y(e,t){return new z().loadAsync(e,t).then(J)}function Z(){h.u_ParticleSize.value=y()}function k(e){h.u_TextureSize.value=e}function K(e){h.u_PositionTexture.value=e}function J(e){let t=e.getAttribute("position").count,n=new Float32Array(t);e.setAttribute("index",new R(n,1));for(let i=0;i<t;i++)n[i]=i;let o=new b({glslVersion:F,uniforms:h,vertexShader:j,fragmentShader:N});return new E(e,o)}function y(){return q*window.devicePixelRatio*(window.innerHeight/U)}function Q(e){let t=new A(50,e.domElement.width/e.domElement.height,.1,500);t.position.z=10;let n=new L(t,e.domElement);return n.enablePan=!0,[t,n]}var $="/webgl-point-cloud/assets/scene.269784f1.ply";let s,f,d,p,u,x,v;async function ee(){Y($,te).then(ie),s=new V({antialias:!0}),s.setPixelRatio(window.devicePixelRatio),s.setSize(window.innerWidth,window.innerHeight),s.setClearColor(new G(0,0,0)),document.getElementById("scene").appendChild(s.domElement),f=new H,[d,p]=Q(s),window.addEventListener("resize",ne,!1),window.addEventListener("pointermove",oe,!1)}function te(e){console.log("progress: ",e.loaded/e.total*100)}function ie(e){e.rotateX(2.9),u=new X(e,s),k(u.size);let t=new M;t.setFromObject(e),t.getCenter(p.target),p.update(),f.add(e)}function ne(e){d.aspect=window.innerWidth/window.innerHeight,d.updateProjectionMatrix(),s.setSize(window.innerWidth,window.innerHeight),Z()}function oe(e){let t={x:e.clientX/window.innerWidth*2-1,y:-(e.clientY/window.innerHeight)*2+1};v={coords:t,movement:{x:t.x+e.movementX/window.innerWidth,y:t.y-e.movementY/window.innerHeight}},u&&u.setPointerFromCamera(v,d)}function re(){u&&(ae(),u.compute(3),K(u.getPositionTexture())),s.render(f,d)}function ae(){let e=p.target.distanceTo(p.object.position);e!=x&&(v&&u.setPointerFromCamera(v,d),x=e)}const w=I();se();function se(){ee(),document.getElementById("stats").appendChild(w.dom),_()}function _(){requestAnimationFrame(_),re(),w.update()}
