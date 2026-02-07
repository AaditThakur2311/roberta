// Fragment shader for reactor core with stability-driven visualization
uniform float uTime;
uniform float uStability;  // 0.0 to 1.0
uniform float uPulse;      // Spike on interaction
uniform float uOverdrive;  // 1.0 when in overdrive mode

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

// Simplex 3D Noise by Ian McEwan
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

float snoise(vec3 v){ 
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1. + 3.0 * C.xxx;

  i = mod(i, 289.0 ); 
  vec4 p = permute( permute( permute( 
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

  float n_ = 1.0/7.0;
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                dot(p2,x2), dot(p3,x3) ) );
}

void main() {
  // Base color interpolation based on stability
  vec3 criticalColor = vec3(1.0, 0.2, 0.1);  // Red
  vec3 lowColor = vec3(1.0, 0.6, 0.0);       // Orange
  vec3 mediumColor = vec3(0.0, 1.0, 0.67);   // Cyan/Green
  vec3 stableColor = vec3(0.2, 0.6, 1.0);    // Blue
  vec3 overdriveColor = vec3(1.0, 1.0, 1.0); // White-hot
  
  vec3 baseColor;
  if (uOverdrive > 0.5) {
    // Overdrive: white-hot
    baseColor = mix(stableColor, overdriveColor, uOverdrive);
  } else if (uStability < 0.2) {
    // Critical: red
    baseColor = criticalColor;
  } else if (uStability < 0.5) {
    // Low: orange to yellow
    baseColor = mix(criticalColor, lowColor, (uStability - 0.2) / 0.3);
  } else if (uStability < 0.8) {
    // Medium: cyan/green
    baseColor = mix(lowColor, mediumColor, (uStability - 0.5) / 0.3);
  } else {
    // Stable: blue
    baseColor = mix(mediumColor, stableColor, (uStability - 0.8) / 0.2);
  }
  
  // Noise-based distortion (more chaotic when unstable)
  float noiseScale = 2.0 + (1.0 - uStability) * 3.0;
  float noiseSpeed = 0.5 + (1.0 - uStability) * 1.5;
  float noise1 = snoise(vPosition * noiseScale + uTime * noiseSpeed);
  float noise2 = snoise(vPosition * noiseScale * 0.5 + uTime * noiseSpeed * 0.7);
  
  float distortion = (noise1 + noise2 * 0.5) * (1.0 - uStability) * 0.5;
  
  // Energy flow lines (vertical waves)
  float flowSpeed = 2.0 + (1.0 - uStability) * 3.0;
  float flow = sin(vUv.y * 10.0 + uTime * flowSpeed) * 0.5 + 0.5;
  flow = pow(flow, 2.0); // Sharpen the lines
  
  // Pulse effect (on habit completion)
  float pulse = uPulse * exp(-mod(uTime, 1.0) * 3.0);
  
  // Fresnel effect (edge glow)
  float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
  
  // Combine all effects
  vec3 finalColor = baseColor;
  finalColor += vec3(flow * 0.3); // Add flow lines
  finalColor += vec3(distortion * 0.5); // Add noise distortion
  finalColor += vec3(pulse * 0.5); // Add pulse
  finalColor += baseColor * fresnel * 0.4; // Add edge glow
  
  // Overdrive extra intensity
  if (uOverdrive > 0.5) {
    finalColor += vec3(0.3) * sin(uTime * 10.0) * uOverdrive;
  }
  
  // Opacity based on stability (more transparent when critical)
  float opacity = 0.7 + uStability * 0.3;
  
  gl_FragColor = vec4(finalColor, opacity);
}
