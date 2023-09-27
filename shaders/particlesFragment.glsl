uniform float time;
uniform float progress;
uniform sampler2D texture;
uniform vec4 resolution;
varying vec2 vUv;
varying vec3 Position;
varying float vColorRandom;

uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
float PI = 3.141592653589793238;
void main() {
  float alpha = 1. - smoothstep(-0.2, 0.5, length(gl_PointCoord - vec2(0.5)));
  alpha *= 0.5;

  vec3 finalColor = uColor1;

  if(vColorRandom > 0.33 && vColorRandom <= 0.66) {
    finalColor = uColor2;
  } else if(vColorRandom > 0.66) {
    finalColor = uColor3;
  }

  float gradient = smoothstep(0.4, 0.88, vUv.y);

  // gl_FragColor = vec4(finalColor, 1.);
  gl_FragColor = vec4(finalColor, alpha * gradient);
}