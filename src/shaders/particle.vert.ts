export const particleVertexShader = `
uniform float uTime;
uniform float uSize;
uniform float uSpread;
uniform float uSpread2;
attribute float aScale;
attribute vec3 aRandomness;
attribute vec3 aSpread;
attribute vec3 aGlyph2;
attribute float aWarm;
attribute float aFlow;
varying vec3 vColor;

void main(){
  vec3 p = mix( mix(position, aSpread, uSpread), aGlyph2, uSpread2 );
  float t = uTime*(0.7+0.4*aFlow);
  float flow = aFlow*6.2831;
  float still = 1.0 - uSpread2;
  float wave1 = sin(t*1.15 + flow*2.0 + p.y*1.35 + p.x*0.6);
  float wave2 = sin(t*0.8  + flow*3.4 - p.y*2.2);
  float wave3 = sin(t*1.5  + flow*2.5 + p.x*1.05 - p.y*1.15);
  float wave4 = sin(t*0.62 + flow*4.7 + p.y*0.95 + p.x*0.4);
  float base = (0.030 + 0.034*uSpread) * still;
  float current = base + 0.035*wave1 + 0.020*wave3 + 0.012*wave4 + (1.0-uSpread)*0.012*wave2;
  p.x += cos(flow*0.9 + p.y*1.7 + t*1.05)*current;
  p.y += sin(flow*1.9 + p.x*1.3 + t*1.22 + wave2*0.65)*current*1.15;
  p.z += (wave4*0.030 + wave2*0.022)*still;
  float organic = sin(t*0.52 + aRandomness.x*6.2831)*(0.010 + 0.016*uSpread)*still;
  p += aRandomness*organic;
  vec4 mvPosition=modelViewMatrix*vec4(p,1.0);
  gl_Position=projectionMatrix*mvPosition;
  float pulse = 0.95 + (0.18*sin(t*1.7 + aFlow*22.0) + 0.05*sin(t*3.2 + aFlow*43.0))*still;
  gl_PointSize=uSize*aScale*pulse*(1.0/max(1.0,-mvPosition.z));
  vColor=mix(vec3(0.78,0.88,1.0),vec3(1.0,0.76,0.72),aWarm);
}
`