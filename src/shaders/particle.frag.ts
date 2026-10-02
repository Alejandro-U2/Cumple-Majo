export const particleFragmentShader = `
varying vec3 vColor;
void main(){
  float d=distance(gl_PointCoord,vec2(0.5));
  float strength=1.0-smoothstep(0.0,0.5,d);
  strength=pow(strength,3.8);
  if(strength<0.015) discard;
  gl_FragColor=vec4(vColor,strength);
}
`