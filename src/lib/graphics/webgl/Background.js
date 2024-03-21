import { createShaderProgram, setupBuffer } from './UtilFunctions';

const bgVertShaderSource = `
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = position * 1.0 + 1.0;
    gl_Position = vec4(position, 0, 1);
  }
`;

const bgFragShaderSource = `
precision highp float;

#define PI 3.1415926535897932384626433832795

varying vec2 vUv;
uniform float time;
uniform float aspectRatio;

// Function to compute distance to the nearest hexagon center
float hexagon(vec2 p, float scale) {
  const float sqrt3 = sqrt(3.0);
  
  p.x *= aspectRatio; // Apply scaling here for both aspect ratio and hexagon size
  // Hexagonal lattice transformation with scaling applied
  vec2 a = mod(p, vec2(3.0 * scale, sqrt3 * scale)) - vec2(1.5 * scale, sqrt3 / 2.0 * scale);
  vec2 b = mod(p - vec2(1.5 * scale, sqrt3 / 2.0 * scale), vec2(3.0 * scale, sqrt3 * scale)) - vec2(1.5 * scale, sqrt3 / 2.0 * scale);
  // Return distance to the closest point, adjusted for scale
  return -(min(dot(a, a), dot(b, b)) - (1.0 / 4.0) * scale * scale);
}

void main() {
    vec2 uv = vUv * 1.0 - 1.0;
    float scale = PI / 2.0;
    
    float dist1 = hexagon(uv, 1.0);
    float dist2 = hexagon(uv, 1.0 / pow(scale, 1.0) );
    float dist3 = hexagon(uv, 1.0 / pow(scale, 2.0) );
    float dist4 = hexagon(uv, 1.0 / pow(scale, 3.0) );
    float dist5 = hexagon(uv, 1.0 / pow(scale, 4.0) );
    float dist6 = hexagon(uv, 1.0 / pow(scale, 5.0) );
    float dist7 = hexagon(uv, 1.0 / pow(scale, 6.0) );
    float dist8 = hexagon(uv, 1.0 / pow(scale, 7.0) );

    float scaledTime = (time * scale * 0.000001) + 0.1;

    vec3 color1 = vec3(0.5 + 0.5 * tan(scaledTime / dist1), 0.5 + 0.5 * sin(scaledTime / dist1), 0.5 + 0.5 * cos(scaledTime / dist1));
    vec3 color2 = vec3(0.5 + 0.5 * tan(scaledTime / dist2), 0.5 + 0.5 * sin(scaledTime / dist2), 0.5 + 0.5 * cos(scaledTime / dist2));
    vec3 color3 = vec3(0.5 + 0.5 * tan(scaledTime / dist3), 0.5 + 0.5 * sin(scaledTime / dist3), 0.5 + 0.5 * cos(scaledTime / dist3));
    vec3 color4 = vec3(0.5 + 0.5 * tan(scaledTime / dist4), 0.5 + 0.5 * sin(scaledTime / dist4), 0.5 + 0.5 * cos(scaledTime / dist4));
    vec3 color5 = vec3(0.5 + 0.5 * tan(scaledTime / dist5), 0.5 + 0.5 * sin(scaledTime / dist5), 0.5 + 0.5 * cos(scaledTime / dist5));
    vec3 color6 = vec3(0.5 + 0.5 * tan(scaledTime / dist6), 0.5 + 0.5 * sin(scaledTime / dist6), 0.5 + 0.5 * cos(scaledTime / dist6));
    vec3 color7 = vec3(0.5 + 0.5 * tan(scaledTime / dist7), 0.5 + 0.5 * sin(scaledTime / dist7), 0.5 + 0.5 * cos(scaledTime / dist7));
    vec3 color8 = vec3(0.5 + 0.5 * tan(scaledTime / dist8), 0.5 + 0.5 * sin(scaledTime / dist8), 0.5 + 0.5 * cos(scaledTime / dist8));

    vec3 color = mix(color1, color2, 0.5);
    color = mix(color, color3, 0.5);
    color = mix(color, color4, 0.5);
    color = mix(color, color5, 0.5);
    color = mix(color, color6, 0.5);
    color = mix(color, color7, 0.5);
    color = mix(color, color8, 0.5);

    gl_FragColor = vec4(color, 1.0);
}
`;

// const bgFragShaderSource = `
// precision highp float;

// #define PI 3.1415926535897932384626433832795

// varying vec2 vUv;
// uniform float time;
// uniform float aspectRatio;

// // Function to compute distance to the nearest hexagon center
// float hexagon(vec2 p, float scale) {
//   const float sqrt3 = sqrt(3.0);
//   p.x *= aspectRatio;
//   // Hexagonal lattice transformation with scaling applied
//   vec2 a = mod(p, vec2(3.0 * scale, sqrt3 * scale)) - vec2(1.5 * scale, sqrt3 / 2.0 * scale);
//   vec2 b = mod(p - vec2(1.5 * scale, sqrt3 / 2.0 * scale), vec2(3.0 * scale, sqrt3 * scale)) - vec2(1.5 * scale, sqrt3 / 2.0 * scale);
//   // Return distance to the closest point, adjusted for scale
//   return min(dot(a, a), dot(b, b));
// }

// void main() {
//     vec2 uv = vUv * 2.0 - 1.0;
//     float dist1 = hexagon(uv, 1.0);
//     float dist2 = hexagon(uv, 1.0 / (PI * 0.5) );
//     float dist3 = hexagon(uv, 1.0 / (PI * 0.5) / (PI * 0.5) );
//     float dist4 = hexagon(uv, 1.0 / (PI * 0.5) / (PI * 0.5) / (PI * 0.5) );
//     float dist5 = hexagon(uv, 1.0 / (PI * 0.5) / (PI * 0.5) / (PI * 0.5) / (PI * 0.5) );
//     float dist6 = hexagon(uv, 1.0 / (PI * 0.5) / (PI * 0.5) / (PI * 0.5) / (PI * 0.5) / (PI * 0.5) );

//     // Create a dot at each vertex
//     float radius = 0.01; // Radius of each dot

//     float alpha1 = smoothstep(radius * 0.8, radius, sqrt(dist1));
//     float alpha2 = smoothstep(radius * 0.8, radius, sqrt(dist2));
//     float alpha3 = smoothstep(radius * 0.8, radius, sqrt(dist3));
//     float alpha4 = smoothstep(radius * 0.8, radius, sqrt(dist4));
//     float alpha5 = smoothstep(radius * 0.8, radius, sqrt(dist5));
//     float alpha6 = smoothstep(radius * 0.8, radius, sqrt(dist6));

//     float alpha = min(alpha1, alpha2);
//     alpha = min(alpha, alpha3);
//     alpha = min(alpha, alpha4);
//     alpha = min(alpha, alpha5);
//     alpha = min(alpha, alpha6);

//     vec3 color = vec3(1.0, 1.0, 1.0); // Color of the dots
//     gl_FragColor = vec4(color, alpha);
// }

// `;

export function setupBackground(gl) {
	const program = createShaderProgram(gl, bgVertShaderSource, bgFragShaderSource);
	const positionBuffer = setupBuffer(gl, [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
	const positionAttributeLocation = gl.getAttribLocation(program, 'position');
	const timeUniformLocation = gl.getUniformLocation(program, 'time');
	const aspectRatioUniformLocation = gl.getUniformLocation(program, 'aspectRatio');

	return {
		program,
		positionBuffer,
		positionAttributeLocation,
		timeUniformLocation,
		aspectRatioUniformLocation
	};
}

export function drawBackground(gl, bg, time, aspectRatio) {
	gl.useProgram(bg.program);
	gl.bindBuffer(gl.ARRAY_BUFFER, bg.positionBuffer);
	gl.vertexAttribPointer(bg.positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(bg.positionAttributeLocation);
	// uniforms
	gl.uniform1f(bg.timeUniformLocation, time);
	gl.uniform1f(bg.aspectRatioUniformLocation, aspectRatio);
	gl.drawArrays(gl.TRIANGLES, 0, 6);
}

export function cleanupBackground(gl, bg) {
	gl.deleteProgram(bg.program);
	gl.deleteBuffer(bg.positionBuffer);
}
