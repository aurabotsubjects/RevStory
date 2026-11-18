/* ============================================================================
 *  AURABOT PROJECT · REVELATION · WORLD LIBRARY
 *  Reusable procedural set pieces: stars, Milky Way, planet, dawn sky, sea,
 *  terrain, wind-grass, dust motes, sun flare, and the figure of John.
 * ========================================================================== */
(function () {
  'use strict';
  const Aura = (window.Aura = window.Aura || {});
  const THREE = window.THREE;
  const lib = (Aura.lib = {});
  const { clamp, lerp, smooth } = Aura.math;
  const V3 = THREE.Vector3;

  /* seeded RNG so every episode builds identical sets */
  let _seed = 12345;
  function rnd() { _seed = (Math.imul(_seed, 1664525) + 1013904223) >>> 0; return _seed / 4294967296; }
  lib.reseed = (n) => { _seed = n >>> 0; };
  lib.rnd = rnd;

  /* ------------------------------------------------------- JS noise */
  function hash2(x, y, s) {
    let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul((s || 0) | 0, 1442695041)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
    return (h >>> 0) / 4294967295;
  }
  function perlin(x, y, s) {
    const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0;
    const u = fx * fx * fx * (fx * (fx * 6 - 15) + 10), v = fy * fy * fy * (fy * (fy * 6 - 15) + 10);
    const g = (ix, iy, dx, dy) => { const a = hash2(ix, iy, s) * 6.2831853; return Math.cos(a) * dx + Math.sin(a) * dy; };
    const n00 = g(x0, y0, fx, fy), n10 = g(x0 + 1, y0, fx - 1, fy), n01 = g(x0, y0 + 1, fx, fy - 1), n11 = g(x0 + 1, y0 + 1, fx - 1, fy - 1);
    return (n00 + (n10 - n00) * u + ((n01 + (n11 - n01) * u) - (n00 + (n10 - n00) * u)) * v) * 1.41;
  }
  function fbm2(x, y, oct, s) { let a = 0.5, sum = 0, f = 1; for (let i = 0; i < (oct || 5); i++) { sum += a * perlin(x * f, y * f, (s || 0) + i * 31); f *= 2.03; a *= 0.5; } return sum; }
  lib.noise = { perlin, fbm: fbm2, hash: hash2 };
  const ss = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };

  /* ------------------------------------------------------- GLSL chunks */
  const GLSL_NOISE = [
    'vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}',
    'vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}',
    'vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}',
    'vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}',
    'float snoise(vec3 v){',
    ' const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);',
    ' vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);',
    ' vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);',
    ' vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;',
    ' i=mod289(i);',
    ' vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));',
    ' float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;',
    ' vec4 j=p-49.0*floor(p*ns.z*ns.z); vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);',
    ' vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);',
    ' vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);',
    ' vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));',
    ' vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;',
    ' vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);',
    ' vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));',
    ' p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;',
    ' vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;',
    ' return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));',
    '}',
    'float fbm(vec3 p){ float a=0.5,s=0.0; for(int i=0;i<5;i++){ s+=a*snoise(p); p=p*2.03+vec3(1.7,9.2,3.1); a*=0.5; } return s; }',
    'float fbm3(vec3 p){ float a=0.5,s=0.0; for(int i=0;i<3;i++){ s+=a*snoise(p); p=p*2.03+vec3(1.7,9.2,3.1); a*=0.5; } return s; }',
  ].join('\n');

  const GLSL_SKY = [
    'uniform vec3 uSunDir,uSunCol,uZen,uMid,uHor;',
    'vec3 skyColor(vec3 d){',
    '  float h=max(d.y,0.0);',
    '  vec3 col=mix(uHor,uMid,pow(h,0.42));',
    '  col=mix(col,uZen,smoothstep(0.12,0.85,h));',
    '  float s=max(dot(d,uSunDir),0.0);',
    '  col+=uSunCol*(0.10*pow(s,4.0)+0.35*pow(s,40.0)+25.0*pow(s,2600.0));',
    '  col+=uHor*0.55*pow(s,2.0)*exp(-h*5.0);',
    '  return col;',
    '}',
    'vec3 fogColor(vec3 d){',
    '  vec3 col=mix(uHor,uMid,pow(0.05,0.42));',
    '  vec2 a=normalize(d.xz+vec2(1e-4)); vec2 b=normalize(uSunDir.xz+vec2(1e-4)); float s=max(dot(a,b),0.0);',
    '  col+=uSunCol*0.10*pow(s,5.0)+uHor*0.5*pow(s,2.0);',
    '  return col;',
    '}',
  ].join('\n');

  /* ----------------------------------------------------- environment */
  lib.env = function () {
    return {
      uTime: { value: 0 }, uSunDir: { value: new V3(1, 0.1, 0).normalize() }, uSunCol: { value: new THREE.Color(1, 0.6, 0.3) },
      uZen: { value: new THREE.Color() }, uMid: { value: new THREE.Color() }, uHor: { value: new THREE.Color() },
      uAmbS: { value: new THREE.Color(0.1, 0.13, 0.25) }, uAmbG: { value: new THREE.Color(0.1, 0.07, 0.05) },
      uSeaLight: { value: 1 }, uStar: { value: 1 }, uFog: { value: 0.00035 }, uWaveAmp: { value: 1 }, uWind: { value: 0.3 },
      uPR: { value: 1 }, uGust: { value: new THREE.Vector3(0, 10, 0) }, uShock: { value: new THREE.Vector4(0, 0, 0, 0) },
    };
  };
  const C = (r, g, b) => new THREE.Color(r, g, b);
  /* el = sun elevation (radians-ish sine units: -0.1 .. 0.5), az in radians (0 = +x) */
  lib.setSun = function (env, el, az) {
    const ce = Math.sqrt(Math.max(0, 1 - el * el));
    env.uSunDir.value.set(ce * Math.cos(az), el, ce * Math.sin(az)).normalize();
    const a = ss(-0.10, 0.16, el), b = ss(0.05, 0.5, el);
    env.uZen.value.copy(C(0.002, 0.004, 0.018)).lerp(C(0.018, 0.05, 0.17), a).lerp(C(0.05, 0.16, 0.5), b);
    env.uMid.value.copy(C(0.012, 0.015, 0.06)).lerp(C(0.17, 0.19, 0.42), a).lerp(C(0.28, 0.45, 0.8), b);
    env.uHor.value.copy(C(0.07, 0.05, 0.09)).lerp(C(1.15, 0.5, 0.2), a).lerp(C(1.0, 0.8, 0.6), b * 0.6);
    env.uSunCol.value.copy(C(0.05, 0.05, 0.1)).lerp(C(2.6, 1.25, 0.55), ss(-0.05, 0.1, el)).lerp(C(2.6, 1.9, 1.2), b);
    env.uAmbS.value.copy(C(0.012, 0.018, 0.05)).lerp(C(0.12, 0.15, 0.3), a);
    env.uAmbG.value.copy(C(0.012, 0.01, 0.01)).lerp(C(0.12, 0.075, 0.05), a);
    env.uSeaLight.value = 0.25 + 0.75 * a;
    env.uStar.value = 1 - ss(-0.06, 0.2, el);
  };

  /* ------------------------------------------------------------ stars */
  lib.stars = function (env, o) {
    o = o || {}; lib.reseed(99); const n = o.count || 7000, R = o.radius || 3000;
    const pos = new Float32Array(n * 3), size = new Float32Array(n), seed = new Float32Array(n), col = new Float32Array(n * 3);
    const bn = new V3(0.35, 0.8, 0.45).normalize();
    for (let i = 0; i < n; i++) {
      let d = new V3(rnd() * 2 - 1, rnd() * 2 - 1, rnd() * 2 - 1);
      if (d.lengthSq() < 0.01) d.set(0, 1, 0);
      d.normalize();
      if (rnd() < 0.55) { d.addScaledVector(bn, -d.dot(bn) * 0.93).normalize(); }
      pos.set([d.x * R, d.y * R, d.z * R], i * 3);
      const m = Math.pow(rnd(), 6);
      size[i] = 1.0 + m * 3.2; seed[i] = rnd();
      const t = rnd(); const c = t < 0.2 ? [1, 0.82, 0.62] : t < 0.6 ? [0.8, 0.88, 1] : [1, 1, 1];
      const br = 0.35 + m * 1.5; col.set([c[0] * br, c[1] * br, c[2] * br], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1)); g.setAttribute('aCol', new THREE.BufferAttribute(col, 3));
    const m = new THREE.ShaderMaterial({
      uniforms: { uTime: env.uTime, uAlpha: env.uStar, uPR: env.uPR },
      vertexShader: 'attribute float aSize,aSeed; attribute vec3 aCol; uniform float uPR,uTime; varying vec3 vC; varying float vS; void main(){ vC=aCol; vS=aSeed; gl_PointSize=aSize*uPR; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
      fragmentShader: 'uniform float uTime,uAlpha; varying vec3 vC; varying float vS; void main(){ float d=length(gl_PointCoord-0.5); float a=smoothstep(0.5,0.0,d); float tw=0.78+0.22*sin(uTime*(1.0+vS*3.0)+vS*60.0); gl_FragColor=vec4(vC*a*tw*uAlpha,1.0); }',
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    const p = new THREE.Points(g, m); p.frustumCulled = false; p.renderOrder = -19;
    return p;
  };
  lib.milkyWay = function (env) {
    const m = new THREE.ShaderMaterial({
      uniforms: { uAlpha: env.uStar },
      vertexShader: 'varying vec3 vD; void main(){ vD=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
      fragmentShader: GLSL_NOISE + '\nuniform float uAlpha; varying vec3 vD; void main(){ vec3 d=normalize(vD); vec3 n=normalize(vec3(0.35,0.8,0.45)); float b=dot(d,n); float band=exp(-b*b*10.0); float cl=fbm(d*3.2)*0.5+0.5; float dust=smoothstep(0.38,0.78,fbm(d*7.0+3.0)*0.5+0.5); vec3 col=mix(vec3(0.02,0.03,0.09),vec3(0.11,0.09,0.17),cl)*band*(1.0-0.7*dust)*0.6; col+=vec3(0.16,0.11,0.08)*pow(band,4.0)*cl*0.5; gl_FragColor=vec4(col*uAlpha,1.0); }',
      side: THREE.BackSide, depthWrite: false, blending: THREE.AdditiveBlending, transparent: true,
    });
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(3500, 32, 20), m); mesh.renderOrder = -20; mesh.frustumCulled = false;
    return mesh;
  };

  /* ----------------------------------------------------------- planet */
  lib.planet = function (o) {
    o = o || {}; const R = o.radius || 100;
    const uniforms = { uSunDir: { value: (o.sunDir || new V3(0.7, 0.3, -0.65)).clone().normalize() }, uTime: { value: 0 }, uCloudBoost: { value: 0 }, uTarget: { value: new V3(0, 0, 1) } };
    const earth = new THREE.Mesh(new THREE.SphereGeometry(R, 160, 110), new THREE.ShaderMaterial({
      uniforms,
      vertexShader: 'varying vec3 vObj,vNw,vWp; void main(){ vObj=position; vNw=normalize(mat3(modelMatrix)*normal); vec4 w=modelMatrix*vec4(position,1.0); vWp=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }',
      fragmentShader: GLSL_NOISE + [
        'uniform vec3 uSunDir,uTarget; uniform float uTime,uCloudBoost; varying vec3 vObj,vNw,vWp;',
        'void main(){',
        ' vec3 N=normalize(vNw); vec3 P=normalize(vObj); vec3 V=normalize(cameraPosition-vWp);',
        ' float l=dot(N,uSunDir);',
        ' float h=fbm(P*1.9+vec3(2.3,1.1,4.7))*0.8+fbm3(P*7.0)*0.25;',
        ' float land=smoothstep(0.01,0.06,h); float lat=abs(P.y);',
        ' vec3 deep=vec3(0.003,0.022,0.075); vec3 shal=vec3(0.01,0.12,0.19);',
        ' vec3 ocean=mix(deep,shal,smoothstep(-0.22,0.02,h));',
        ' float moist=fbm3(P*4.0+9.0)*0.5+0.5;',
        ' vec3 veg=vec3(0.03,0.09,0.025); vec3 dry=vec3(0.26,0.19,0.09); vec3 rock=vec3(0.18,0.15,0.12);',
        ' vec3 lc=mix(dry,veg,smoothstep(0.35,0.65,moist)*(1.0-lat*0.5)); lc=mix(lc,rock,smoothstep(0.22,0.5,h));',
        ' lc=mix(lc,vec3(0.85),smoothstep(0.72,0.86,lat+h*0.25));',
        ' vec3 alb=mix(ocean,lc,land);',
        ' vec3 R=reflect(-uSunDir,N); float spec=pow(max(dot(R,V),0.0),70.0)*(1.0-land);',
        ' vec3 cp=P*2.5+vec3(uTime*0.003,0.0,0.0);',
        ' float c=fbm(cp)*0.5+0.5; c+=fbm3(cp*3.3)*0.2;',
        ' float tg=max(dot(P,uTarget),0.0); float cloud=smoothstep(0.5,0.76,c+uCloudBoost*smoothstep(0.55,0.98,tg));',
        ' vec3 sunC=vec3(1.0,0.9,0.78)*1.05; float dl=max(l,0.0); dl=pow(dl,0.8);',
        ' vec3 lit=alb*sunC*dl+alb*vec3(0.03,0.05,0.11)*0.6+sunC*spec*1.4;',
        ' vec3 cl=vec3(0.92,0.95,1.0)*(dl*0.95+0.015);',
        ' vec3 col=mix(lit,cl,cloud);',
        ' float tw=exp(-pow((l-0.04)*5.5,2.0)); col+=vec3(1.0,0.36,0.1)*tw*(0.25+cloud*0.6);',
        ' float city=smoothstep(0.72,0.86,fbm3(P*55.0)*0.5+0.5+0.1*fbm3(P*9.0))*land*(1.0-cloud)*smoothstep(0.02,-0.2,l)*smoothstep(0.35,0.7,moist);',
        ' col+=vec3(1.0,0.62,0.28)*city*0.7;',
        ' float rim=pow(1.0-max(dot(N,V),0.0),3.0); col+=vec3(0.2,0.45,1.0)*rim*(0.08+0.45*smoothstep(-0.2,0.45,l));',
        ' gl_FragColor=vec4(col,1.0);',
        '}',
      ].join('\n'),
    }));
    const atm = new THREE.Mesh(new THREE.SphereGeometry(R * 1.06, 96, 64), new THREE.ShaderMaterial({
      uniforms: { uSunDir: uniforms.uSunDir },
      vertexShader: 'varying vec3 vN,vWp; void main(){ vN=normalize(mat3(modelMatrix)*normal); vec4 w=modelMatrix*vec4(position,1.0); vWp=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }',
      fragmentShader: 'uniform vec3 uSunDir; varying vec3 vN,vWp; void main(){ vec3 N=normalize(vN); vec3 V=normalize(cameraPosition-vWp); float d=max(dot(N,V),0.0); float f=pow(smoothstep(0.0,0.34,d),1.4)*pow(1.0-smoothstep(0.34,0.95,d),2.2); float l=dot(N,uSunDir); float day=smoothstep(-0.3,0.45,l); float tw=exp(-pow((l-0.02)*4.0,2.0)); vec3 c=vec3(0.15,0.42,1.0)*day*1.1+vec3(1.0,0.4,0.12)*tw*1.0; gl_FragColor=vec4(c*f*1.15,1.0); }',
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.FrontSide,
    }));
    const g = new THREE.Group(); g.add(earth); g.add(atm);
    return { group: g, uniforms };
  };

  /* -------------------------------------------------------------- sky */
  lib.sky = function (env) {
    const m = new THREE.ShaderMaterial({
      uniforms: { uSunDir: env.uSunDir, uSunCol: env.uSunCol, uZen: env.uZen, uMid: env.uMid, uHor: env.uHor, uTime: env.uTime },
      vertexShader: 'varying vec3 vD; void main(){ vD=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
      fragmentShader: GLSL_NOISE + '\n' + GLSL_SKY + [
        'uniform float uTime; varying vec3 vD;',
        'void main(){',
        ' vec3 d=normalize(vD); vec3 col=skyColor(d);',
        ' float s=max(dot(d,uSunDir),0.0);',
        ' vec2 uv=d.xz/(max(d.y,0.0)+0.2);',
        ' float n=fbm3(vec3(uv*1.1+vec2(uTime*0.01,0.0),uTime*0.012))*0.5+0.5;',
        ' float n2=fbm3(vec3(uv*3.3,uTime*0.02+4.0))*0.5+0.5;',
        ' float cl=smoothstep(0.42,0.78,n*0.8+n2*0.35)*smoothstep(0.0,0.14,d.y)*(1.0-smoothstep(0.55,0.95,d.y)*0.6);',
        ' vec3 lit=mix(uMid*1.2+vec3(0.02,0.02,0.04),uHor*1.5+uSunCol*0.25,clamp(pow(s,1.5)*1.4+exp(-d.y*5.0)*0.5,0.0,1.0));',
        ' lit+=uSunCol*0.5*pow(s,10.0)*cl;',
        ' col=mix(col,lit,cl*0.8);',
        ' gl_FragColor=vec4(col,1.0);',
        '}',
      ].join('\n'),
      side: THREE.BackSide, depthWrite: false,
    });
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(2200, 48, 24), m); mesh.renderOrder = -10; mesh.frustumCulled = false;
    return mesh;
  };

  /* -------------------------------------------------------------- sea */
  function ringGrid(rings, segs, r0, k) {
    const pos = [], idx = [];
    for (let i = 0; i <= rings; i++) { const r = i === 0 ? 0 : r0 * Math.pow(k, i - 1); for (let j = 0; j <= segs; j++) { const a = (j / segs) * Math.PI * 2; pos.push(Math.cos(a) * r, 0, Math.sin(a) * r); } }
    for (let i = 0; i < rings; i++) for (let j = 0; j < segs; j++) { const a = i * (segs + 1) + j, b = a + segs + 1; idx.push(a, a + 1, b, b, a + 1, b + 1); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); return g;
  }
  lib.sea = function (env, o) {
    o = o || {};
    const wave = [
      'uniform vec4 uShock;',
      '#define W(d,f,a,s) {float ph=dot(p,d)*f+t*s; h+=a*sin(ph); g+=a*f*cos(ph)*d;}',
      'void waves(vec2 p,float t,out float h,out vec2 g){ h=0.0; g=vec2(0.0);',
      ' W(vec2(0.80,0.60),0.12,0.34,0.9) W(vec2(-0.50,0.86),0.20,0.20,1.2) W(vec2(0.95,-0.30),0.33,0.10,1.7) W(vec2(0.10,0.99),0.55,0.05,2.3) W(vec2(-0.70,-0.70),0.90,0.024,3.1)',
      ' if(uShock.w>0.001){ vec2 dv=p-uShock.xy; float dd=max(length(dv),0.001); vec2 dn=dv/dd;',
      '  for(int m=0;m<4;m++){ float r=uShock.z-float(m)*38.0; float x=dd-r; float sg=16.0+float(m)*3.0; float e=exp(-x*x/(2.0*sg*sg)); float k=0.19; float a=uShock.w*pow(0.62,float(m))*step(0.0,r)/(1.0+r*0.0035);',
      '   h+=a*cos(x*k)*e; g+=a*(-k*sin(x*k)*e+cos(x*k)*e*(-x/(sg*sg)))*dn; } } }',
    ].join('\n');
    const m = new THREE.ShaderMaterial({
      uniforms: { uSunDir: env.uSunDir, uSunCol: env.uSunCol, uZen: env.uZen, uMid: env.uMid, uHor: env.uHor, uTime: env.uTime, uWaveAmp: env.uWaveAmp, uSeaLight: env.uSeaLight, uFog: env.uFog,
        uShock: env.uShock || { value: new THREE.Vector4() }, uDeep: { value: o.deep || C(0.004, 0.028, 0.05) }, uShallow: { value: o.shallow || C(0.02, 0.15, 0.19) } },
      vertexShader: wave + '\nuniform float uTime,uWaveAmp; varying vec3 vW; void main(){ vec4 wp=modelMatrix*vec4(position,1.0); float h; vec2 g; waves(wp.xz,uTime,h,g); float dd=length(wp.xz-cameraPosition.xz); wp.y+=h*uWaveAmp*(1.0-smoothstep(600.0,3000.0,dd)); vW=wp.xyz; gl_Position=projectionMatrix*viewMatrix*wp; }',
      fragmentShader: GLSL_NOISE + '\n' + GLSL_SKY + '\n' + wave + [
        'uniform float uTime,uWaveAmp,uSeaLight,uFog; uniform vec3 uDeep,uShallow; varying vec3 vW;',
        'void main(){',
        ' vec3 V=normalize(cameraPosition-vW); float dist=length(cameraPosition-vW);',
        ' float h; vec2 g; waves(vW.xz,uTime,h,g);',
        ' vec3 n=normalize(vec3(-g.x*uWaveAmp,1.0,-g.y*uWaveAmp));',
        ' float f1=snoise(vec3(vW.xz*0.45,uTime*0.35)); float f2=snoise(vec3(vW.xz*1.6+17.0,uTime*0.7));',
        ' float near=1.0-smoothstep(40.0,500.0,dist);',
        ' n=normalize(n+vec3(f1*0.10+f2*0.05,0.0,f2*0.08-f1*0.04)*near*uWaveAmp);',
        ' float far=smoothstep(120.0,1400.0,dist); n=normalize(mix(n,vec3(0.0,1.0,0.0),far*0.9));',
        ' vec3 R=reflect(-V,n); R.y=max(R.y,0.015);',
        ' float fres=0.02+0.98*pow(1.0-max(dot(n,V),0.0),5.0);',
        ' vec3 refl=skyColor(normalize(R));',
        ' vec3 body=mix(uDeep,uShallow,clamp(0.18+0.2*f1+0.1*h,0.0,1.0))*(0.35+0.65*uSeaLight)*(0.6+0.8*max(dot(n,uSunDir),0.0)*uSeaLight);',
        ' vec3 col=mix(body,refl,clamp(fres,0.0,1.0));',
        ' vec3 H=normalize(uSunDir+V); float sp=pow(max(dot(n,H),0.0),900.0)*18.0+pow(max(dot(n,H),0.0),90.0)*0.5; col+=uSunCol*sp*step(0.0,uSunDir.y+0.03);',
        ' vec3 fogC=fogColor(vec3(-V.x,0.0,-V.z));',
        ' col=mix(col,fogC,1.0-exp(-dist*uFog*1.4));',
        ' gl_FragColor=vec4(col,1.0);',
        '}',
      ].join('\n'),
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(ringGrid(150, 144, 2.2, 1.057), m); mesh.frustumCulled = false; mesh.renderOrder = -5;
    return mesh;
  };

  /* ---------------------------------------------------------- terrain */
  const TERRAIN_COLORS = { sand: [0.4, 0.31, 0.18], dry: [0.26, 0.19, 0.085], scrub: [0.065, 0.085, 0.03], rock: [0.13, 0.11, 0.09], lrock: [0.27, 0.23, 0.18] };
  function defaultColor(x, z, h, slope, rel) {
    const T = TERRAIN_COLORS, n = fbm2(x * 0.03, z * 0.03, 3, 7) * 0.5 + 0.5, n2 = fbm2(x * 0.2, z * 0.2, 2, 9) * 0.5 + 0.5;
    let c = [T.dry[0], T.dry[1], T.dry[2]];
    const mixc = (a, k) => { c[0] = lerp(c[0], a[0], k); c[1] = lerp(c[1], a[1], k); c[2] = lerp(c[2], a[2], k); };
    mixc(T.scrub, ss(0.35, 0.65, n) * 0.85);
    mixc(T.lrock, ss(0.3, 0.8, rel) * 0.5 * (0.5 + n2));
    mixc(T.rock, ss(0.25, 0.6, slope) * 0.9);
    mixc(T.sand, 1 - ss(0.2, 2.0, h));
    const v = 0.85 + n2 * 0.3; return [c[0] * v, c[1] * v, c[2] * v];
  }
  /* o: {x0,x1,z0,z1,cell,height(x,z),env,detail,color(x,z,h,slope,rel)} */
  lib.terrain = function (o) {
    const cell = o.cell, nx = Math.round((o.x1 - o.x0) / cell) + 1, nz = Math.round((o.z1 - o.z0) / cell) + 1;
    const H = new Float32Array(nx * nz);
    for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) H[j * nx + i] = o.height(o.x0 + i * cell, o.z0 + j * cell);
    const hAt = (x, z) => {
      const fx = clamp((x - o.x0) / cell, 0, nx - 1.001), fz = clamp((z - o.z0) / cell, 0, nz - 1.001), i = Math.floor(fx), j = Math.floor(fz), u = fx - i, v = fz - j;
      const a = H[j * nx + i], b = H[j * nx + i + 1], c = H[(j + 1) * nx + i], d = H[(j + 1) * nx + i + 1];
      return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
    };
    const pos = new Float32Array(nx * nz * 3), nor = new Float32Array(nx * nz * 3), col = new Float32Array(nx * nz * 3), sh = new Float32Array(nx * nz);
    const sd = o.env.uSunDir.value, hl = Math.hypot(sd.x, sd.z) || 1, sx = sd.x / hl, sz = sd.z / hl, sl = sd.y / hl;
    let hmax = 1; for (let k = 0; k < H.length; k++) hmax = Math.max(hmax, H[k]);
    for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
      const k = j * nx + i, x = o.x0 + i * cell, z = o.z0 + j * cell, h = H[k];
      pos[k * 3] = x; pos[k * 3 + 1] = h; pos[k * 3 + 2] = z;
      const hx = hAt(x + cell, z) - hAt(x - cell, z), hz = hAt(x, z + cell) - hAt(x, z - cell);
      const n = new V3(-hx / (2 * cell), 1, -hz / (2 * cell)).normalize();
      nor[k * 3] = n.x; nor[k * 3 + 1] = n.y; nor[k * 3 + 2] = n.z;
      let occ = 0, d = cell * 1.2;
      for (let s = 0; s < 30; s++) { const hh = hAt(x + sx * d, z + sz * d); const over = hh - (h + sl * d); if (over > 0) occ = Math.max(occ, clamp(over / (0.12 * d + cell * 0.6))); d *= 1.14; if (d > 3000) break; }
      sh[k] = 1 - occ;
      const c = (o.color || defaultColor)(x, z, h, 1 - n.y, h / hmax);
      col[k * 3] = c[0]; col[k * 3 + 1] = c[1]; col[k * 3 + 2] = c[2];
    }
    const idx = new Uint32Array((nx - 1) * (nz - 1) * 6); let p = 0;
    for (let j = 0; j < nz - 1; j++) for (let i = 0; i < nx - 1; i++) { const a = j * nx + i, b = a + 1, c = a + nx, d = c + 1; idx[p++] = a; idx[p++] = c; idx[p++] = b; idx[p++] = b; idx[p++] = c; idx[p++] = d; }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    g.setAttribute('aCol', new THREE.BufferAttribute(col, 3)); g.setAttribute('aSh', new THREE.BufferAttribute(sh, 1)); g.setIndex(new THREE.BufferAttribute(idx, 1));
    g.computeBoundingSphere();
    const e = o.env;
    const m = new THREE.ShaderMaterial({
      uniforms: { uSunDir: e.uSunDir, uSunCol: e.uSunCol, uZen: e.uZen, uMid: e.uMid, uHor: e.uHor, uAmbS: e.uAmbS, uAmbG: e.uAmbG, uFog: e.uFog, uTime: e.uTime, uDetail: { value: o.detail || 0.05 } },
      vertexShader: 'attribute vec3 aCol; attribute float aSh; varying vec3 vN,vC,vW; varying float vSh; void main(){ vN=normal; vC=aCol; vSh=aSh; vec4 wp=modelMatrix*vec4(position,1.0); vW=wp.xyz; gl_Position=projectionMatrix*viewMatrix*wp; }',
      fragmentShader: GLSL_NOISE + '\n' + GLSL_SKY + [
        'uniform vec3 uAmbS,uAmbG; uniform float uFog,uDetail; varying vec3 vN,vC,vW; varying float vSh;',
        'void main(){',
        ' float nz=snoise(vW*uDetail)*0.5+snoise(vW*uDetail*3.7)*0.25;',
        ' vec3 N=normalize(vN+vec3(snoise(vW*uDetail*2.0+1.0),0.0,snoise(vW*uDetail*2.0+7.0))*0.22);',
        ' float ndl=max(dot(N,uSunDir),0.0);',
        ' vec3 alb=vC*(1.0+nz*0.4);',
        ' vec3 sun=uSunCol*ndl*vSh;',
        ' vec3 amb=mix(uAmbG,uAmbS,N.y*0.5+0.5);',
        ' vec3 vd=vW-cameraPosition; float dist=length(vd); vec3 dir=vd/dist;',
        ' float rimk=pow(1.0-max(dot(N,-dir),0.0),3.0)*clamp(dot(N,uSunDir)*0.6+0.5,0.0,1.0);',
        ' vec3 col=alb*(sun+amb)+alb*uSunCol*rimk*0.8*vSh;',
        ' float fog=1.0-exp(-dist*uFog*1.5); fog=max(fog,0.0);',
        ' vec3 fc=fogColor(dir);',
        ' col=mix(col,fc,fog);',
        ' gl_FragColor=vec4(col,1.0);',
        '}',
      ].join('\n'),
    });
    const mesh = new THREE.Mesh(g, m); mesh.frustumCulled = false;
    mesh.userData.heightAt = hAt;
    return mesh;
  };

  /* island height function (elongated, rugged). cx,cz centre; rx,rz radii; peak metres */
  lib.islandHeight = function (cx, cz, rx, rz, peak, seed) {
    return function (x, z) {
      const nx = (x - cx) / rx, nz = (z - cz) / rz;
      const warp = 0.3 * perlin(x * 0.004 + 3.1, z * 0.004 + 1.7, seed) + 0.12 * perlin(x * 0.011, z * 0.011, seed + 3);
      const d = Math.hypot(nx, nz) + warp;
      const mask = ss(1.0, 0.5, d);
      const ridge = 1 - Math.abs(perlin(x * 0.005 + 9, z * 0.005 + 2, seed + 1));
      let h = mask * (peak * 0.22 + peak * 0.65 * Math.pow(ridge, 2.6) * ss(0.95, 0.3, d) + peak * 0.14 * perlin(x * 0.013, z * 0.013, seed + 2) * mask + peak * 0.03 * perlin(x * 0.05, z * 0.05, seed + 4));
      h -= (1 - mask) * 25;
      return h;
    };
  };

  /* -------------------------------------------------------------- grass */
  lib.grass = function (env, o) {
    const n = o.count || 5000;
    const base = new THREE.InstancedBufferGeometry();
    const rows = 4, pv = [], pi = [];
    for (let r = 0; r <= rows; r++) { const y = r / rows, w = 0.5 * (1 - y * 0.85); pv.push(-w, y, 0, w, y, 0); }
    for (let r = 0; r < rows; r++) { const a = r * 2; pi.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    base.setAttribute('position', new THREE.Float32BufferAttribute(pv, 3)); base.setIndex(pi);
    const off = new Float32Array(n * 3), sc = new Float32Array(n), rot = new Float32Array(n), tint = new Float32Array(n);
    let k = 0, tries = 0;
    while (k < n && tries < n * 6) {
      tries++;
      const x = o.x0 + rnd() * (o.x1 - o.x0), z = o.z0 + rnd() * (o.z1 - o.z0);
      if (o.accept && !o.accept(x, z)) continue;
      off.set([x, o.height(x, z), z], k * 3); sc[k] = 0.35 + rnd() * 0.75; rot[k] = rnd() * 6.283; tint[k] = rnd(); k++;
    }
    base.setAttribute('aOff', new THREE.InstancedBufferAttribute(off, 3)); base.setAttribute('aScale', new THREE.InstancedBufferAttribute(sc, 1));
    base.setAttribute('aRot', new THREE.InstancedBufferAttribute(rot, 1)); base.setAttribute('aTint', new THREE.InstancedBufferAttribute(tint, 1));
    base.instanceCount = k;
    const m = new THREE.ShaderMaterial({
      uniforms: { uSunDir: env.uSunDir, uSunCol: env.uSunCol, uZen: env.uZen, uMid: env.uMid, uHor: env.uHor, uAmbS: env.uAmbS, uAmbG: env.uAmbG, uFog: env.uFog, uTime: env.uTime, uWind: env.uWind, uGust: env.uGust || { value: new THREE.Vector3(0, 10, 0) } },
      vertexShader: 'attribute vec3 aOff; attribute float aScale,aRot,aTint; uniform float uTime,uWind; uniform vec3 uGust; varying float vH,vT; varying vec3 vW; void main(){ float h=position.y; vH=h; vT=aTint; float c=cos(aRot),s=sin(aRot); vec3 p=vec3(position.x*0.1*c, position.y*aScale, position.x*0.1*s); float sway=sin(uTime*1.7+aOff.x*0.9+aOff.z*0.6)*0.5+sin(uTime*3.3+aOff.x*2.1)*0.25; float gx=(aOff.x-uGust.x)/uGust.y; float gust=uGust.z*exp(-gx*gx); float bend=(sway*0.7+1.0)*(uWind+gust)*h*h*aScale*0.6; p.x-=bend; p.z+=sin(uTime*2.1+aOff.z)*bend*0.3; vec4 wp=vec4(p+aOff,1.0); vW=wp.xyz; gl_Position=projectionMatrix*viewMatrix*wp; }',
      fragmentShader: GLSL_SKY + 'uniform vec3 uAmbS; uniform float uFog; varying float vH,vT; varying vec3 vW; void main(){ vec3 baseC=mix(vec3(0.03,0.04,0.012),vec3(0.2,0.14,0.05),vT); vec3 tip=vec3(0.75,0.5,0.18)*(0.6+0.8*vT); vec3 col=mix(baseC*(uAmbS*3.0+0.2),tip*uSunCol*0.55,smoothstep(0.1,1.0,vH)); vec3 vd=vW-cameraPosition; float dist=length(vd); float fog=1.0-exp(-dist*uFog*1.5); col=mix(col,fogColor(vd),fog); gl_FragColor=vec4(col,1.0); }',
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(base, m); mesh.frustumCulled = false; return mesh;
  };

  /* -------------------------------------------------------- dust motes */
  lib.dust = function (env, o) {
    o = o || {}; const n = o.count || 500, S = o.size || 40;
    const base = new Float32Array(n * 3), seed = new Float32Array(n), size = new Float32Array(n);
    for (let i = 0; i < n; i++) { base.set([rnd() * S, rnd() * S * 0.5, rnd() * S], i * 3); seed[i] = rnd(); size[i] = 0.5 + rnd() * 1.5; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(base, 3)); g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1)); g.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
    const m = new THREE.ShaderMaterial({
      uniforms: { uTime: env.uTime, uSize: { value: S }, uPR: env.uPR, uWind: env.uWind, uSunCol: env.uSunCol, uBright: { value: 1 } },
      vertexShader: 'attribute float aSeed,aSize; uniform float uTime,uSize,uPR,uWind; varying float vA; void main(){ vec3 p=position+vec3(-(0.4+uWind*3.0)*uTime,sin(uTime*0.4+aSeed*20.0)*0.6+uTime*0.03,sin(uTime*0.3+aSeed*9.0)*0.8); vec3 o=cameraPosition; p=mod(p-o+uSize*0.5,uSize)-uSize*0.5+o; vec4 mv=viewMatrix*vec4(p,1.0); float d=-mv.z; vA=smoothstep(0.5,3.0,d)*(1.0-smoothstep(uSize*0.3,uSize*0.5,d))*(0.5+0.5*sin(uTime*1.3+aSeed*50.0)); gl_PointSize=clamp(aSize*uPR*26.0/max(d,1.0),1.0,14.0*uPR); gl_Position=projectionMatrix*mv; }',
      fragmentShader: 'uniform vec3 uSunCol; uniform float uBright; varying float vA; void main(){ float d=length(gl_PointCoord-0.5); float a=smoothstep(0.5,0.0,d); gl_FragColor=vec4(uSunCol*0.55*a*vA*uBright,1.0); }',
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    const p = new THREE.Points(g, m); p.frustumCulled = false; return p;
  };

  /* -------------------------------------------------------- sun flare */
  lib.flare = function () {
    const mk = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); return t; };
    const glow = mk(256, 256, (x, w, h) => { const g = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.12, 'rgba(255,230,190,0.7)'); g.addColorStop(0.4, 'rgba(255,150,70,0.18)'); g.addColorStop(1, 'rgba(255,120,40,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); });
    const streak = mk(512, 32, (x, w, h) => { const g = x.createLinearGradient(0, 0, w, 0); g.addColorStop(0, 'rgba(120,170,255,0)'); g.addColorStop(0.5, 'rgba(255,235,210,1)'); g.addColorStop(1, 'rgba(120,170,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); const v = x.createLinearGradient(0, 0, 0, h); v.addColorStop(0, 'rgba(0,0,0,1)'); v.addColorStop(0.5, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,1)'); x.globalCompositeOperation = 'destination-out'; x.fillStyle = v; x.fillRect(0, 0, w, h); });
    const mat = (t) => new THREE.SpriteMaterial({ map: t, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true });
    const g = new THREE.Group(), s1 = new THREE.Sprite(mat(glow)), s2 = new THREE.Sprite(mat(streak)), s3 = new THREE.Sprite(mat(glow));
    s3.material.color.setRGB(0.5, 0.7, 1.0);
    g.add(s1, s2, s3); g.renderOrder = 10;
    return {
      group: g,
      update(cam, dir, intensity, size) {
        g.position.copy(cam.position).addScaledVector(dir, 1800); size = size || 1;
        s1.scale.set(900 * size, 900 * size, 1); s2.scale.set(5200 * size, 150 * size, 1); s3.scale.set(260 * size, 260 * size, 1);
        s1.material.opacity = clamp(intensity); s2.material.opacity = clamp(intensity * 0.8); s3.material.opacity = clamp(intensity * 0.35);
        g.visible = intensity > 0.01;
      },
    };
  };

  /* --------------------------------------------------------- rim glow */
  function rimMaterial(env, color, power) {
    return new THREE.ShaderMaterial({
      uniforms: { uSunDir: env.uSunDir, uCol: { value: color || C(1.0, 0.6, 0.28) }, uInt: { value: 1.5 }, uPow: { value: power || 2.4 } },
      vertexShader: 'varying vec3 vN,vV; void main(){ vN=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.0); vV=-mv.xyz; gl_Position=projectionMatrix*mv; }',
      fragmentShader: 'uniform vec3 uSunDir,uCol; uniform float uInt,uPow; varying vec3 vN,vV; void main(){ vec3 N=normalize(vN); vec3 Vv=normalize(vV); vec3 L=normalize((viewMatrix*vec4(uSunDir,0.0)).xyz); float f=pow(1.0-max(dot(N,Vv),0.0),uPow); float k=smoothstep(-0.35,0.55,dot(N,L)); gl_FragColor=vec4(uCol*f*k*uInt,1.0); }',
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.FrontSide,
    });
  }
  lib.rimMaterial = rimMaterial;

  /* ------------------------------------------------------------- John */
  /* An elderly man in simple robes. Faces +X. Height ~1.7. update(t, wind) animates hair, mantle and hem. */
  lib.john = function (env) {
    const root = new THREE.Group(), body = new THREE.Group(); root.add(body); body.rotation.y = Math.PI / 2;
    const std = (hex, rough) => new THREE.MeshStandardMaterial({ color: Aura.col(hex), roughness: rough === undefined ? 0.92 : rough, metalness: 0, side: THREE.DoubleSide });
    const robeMat = std(0x918268), mantleMat = std(0x5d4a37), skinMat = std(0x9c7357, 0.7), hairMat = std(0xd8d3ca, 0.8);
    const rim = rimMaterial(env, C(1.0, 0.6, 0.28), 2.2), rimHair = rimMaterial(env, C(1.0, 0.72, 0.4), 1.6);
    rimHair.uniforms.uInt.value = 0.55;
    const addRim = (m, mat) => { const r = new THREE.Mesh(m.geometry, mat || rim); r.renderOrder = 2; m.add(r); };

    // robe
    const prof = [[0.47, 0], [0.44, 0.15], [0.37, 0.5], [0.29, 0.92], [0.265, 1.18], [0.29, 1.36], [0.22, 1.47], [0.075, 1.53]].map((p) => new THREE.Vector2(p[0], p[1]));
    const robeGeo = new THREE.LatheGeometry(prof, 36);
    const rp = robeGeo.attributes.position, robeBase = rp.array.slice();
    for (let i = 0; i < rp.count; i++) {
      const x = robeBase[i * 3], y = robeBase[i * 3 + 1], z = robeBase[i * 3 + 2], a = Math.atan2(z, x);
      const f = 1 + 0.055 * Math.sin(a * 7 + y * 2.2) + 0.03 * Math.sin(a * 13 + 1.3) * (1 - y / 1.5);
      rp.setXYZ(i, x * f, y, z * f);
    }
    for (let i = 0; i < rp.count; i++) { robeBase[i * 3] = rp.array[i * 3]; robeBase[i * 3 + 1] = rp.array[i * 3 + 1]; robeBase[i * 3 + 2] = rp.array[i * 3 + 2]; }
    robeGeo.computeVertexNormals();
    const robe = new THREE.Mesh(robeGeo, robeMat); body.add(robe); addRim(robe);
    // slight stoop
    const upper = new THREE.Group(); body.add(upper);
    // neck + head
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.12, 12), skinMat); neck.position.set(0, 1.55, 0.015); upper.add(neck);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.1, 24, 18), skinMat); head.scale.set(0.9, 1.12, 1.0); head.position.set(0, 1.67, 0.03); upper.add(head); addRim(head);
    // arms
    [-1, 1].forEach((s) => {
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.07, 0.62, 12), robeMat); arm.position.set(s * 0.3, 1.14, 0.06); arm.rotation.z = s * 0.1; arm.rotation.x = -0.12; body.add(arm); addRim(arm);
      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.052, 12, 10), skinMat); hand.position.set(s * 0.335, 0.82, 0.11); body.add(hand);
    });
    // mantle (cloak wrapped around the shoulders and back)
    const robeR = (y) => { for (let i = 0; i < prof.length - 1; i++) { const a0 = prof[i], a1 = prof[i + 1]; if (y >= a0.y && y <= a1.y) { const k = (y - a0.y) / (a1.y - a0.y); return a0.x + (a1.x - a0.x) * k; } } return prof[prof.length - 1].x; };
    const mSX = 22, mSY = 20;
    const mGeo = new THREE.PlaneGeometry(1, 1, mSX, mSY); const mp = mGeo.attributes.position;
    const mU = [], mV = [];
    for (let i = 0; i < mp.count; i++) { mU.push(mp.getX(i)); mV.push(0.5 - mp.getY(i)); }
    const mantleMat2 = std(0x5a4631, 0.95); mantleMat2.emissive = new THREE.Color(0.012, 0.008, 0.004);
    const mantle = new THREE.Mesh(mGeo, mantleMat2); mantle.frustumCulled = false; body.add(mantle); addRim(mantle);
    // hair cap + flowing strips
    const hairMat2 = std(0x8f8a80, 0.7); hairMat2.emissive = new THREE.Color(0.012, 0.011, 0.009);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.106, 28, 18, Math.PI / 2 + 0.95, Math.PI * 2 - 1.9, 0, 2.05), hairMat2);
    cap.scale.set(0.93, 1.12, 1.04); cap.position.set(0, 1.675, 0.025); upper.add(cap); addRim(cap, (() => { const r = rimMaterial(env, C(1.0, 0.72, 0.4), 1.4); r.uniforms.uInt.value = 0.7; return r; })());
    const strips = [], HR = 9;
    const hairPos = [], hairIdx = [];
    const addStrip = (root0, out, len, w, rowsN) => { const start = hairPos.length / 3; for (let r = 0; r <= rowsN; r++) { hairPos.push(0, 0, 0, 0, 0, 0); } for (let r = 0; r < rowsN; r++) { const a = start + r * 2; hairIdx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } strips.push({ root: root0, out, len, w, start, rows: rowsN }); };
    for (let i = 0; i < 40; i++) { const a = (i / 40) * Math.PI * 2; const dir = new V3(Math.sin(a) * 0.9, -0.15 + rnd() * 0.45, -Math.cos(a)).normalize(); if (dir.z > 0.1 && Math.abs(dir.x) < 0.55) continue; addStrip(new V3(dir.x * 0.097, 1.665 + dir.y * 0.1, 0.025 + dir.z * 0.1), dir, 0.3 + rnd() * 0.26, 0.026 + rnd() * 0.016, HR); }
    const nHairStrips = strips.length;
    for (let i = 0; i < 9; i++) { const a = (i / 8 - 0.5) * 1.5; addStrip(new V3(Math.sin(a) * 0.075, 1.605, 0.07 + Math.cos(a) * 0.03), new V3(Math.sin(a) * 0.5, -0.2, 0.6).normalize(), 0.14 + rnd() * 0.1, 0.03, 5); }
    const hGeo = new THREE.BufferGeometry(); hGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(hairPos), 3)); hGeo.setIndex(hairIdx);
    const hair = new THREE.Mesh(hGeo, hairMat2); hair.frustumCulled = false; upper.add(hair); addRim(hair, rimHair);
    const hnorm = new THREE.BufferAttribute(new Float32Array(hairPos.length), 3); for (let i = 0; i < hnorm.count; i++) hnorm.setXYZ(i, 0, 0, 1); hGeo.setAttribute('normal', hnorm);
    // simple lights are provided by the scene; compute dimensions
    const tmp = new V3();
    function update(t, wind) {
      wind = wind === undefined ? 0.3 : wind;
      // breathing / posture
      upper.rotation.x = 0.06 + Math.sin(t * 0.9) * 0.004; upper.position.y = Math.sin(t * 0.9) * 0.002;
      // robe hem
      for (let i = 0; i < rp.count; i++) {
        const y = robeBase[i * 3 + 1], x = robeBase[i * 3], z = robeBase[i * 3 + 2];
        const k = Math.pow(Math.max(0, 1 - y / 0.9), 1.8), a = Math.atan2(z, x);
        const push = wind * 0.2 * k * (0.6 + 0.4 * Math.sin(t * 2.6 + a * 3 + y * 4));
        rp.setXYZ(i, x, y, z - push);
      }
      rp.needsUpdate = true;
      // mantle
      for (let i = 0; i < mp.count; i++) {
        const u = mU[i], v = mV[i], y = 1.47 - v * 1.1;
        const r = robeR(Math.max(y, 0.02)) * (1 + 0.2 * v) + 0.045 + 0.03 * Math.sin(u * 20 + v * 2.0) * v + 0.012 * Math.sin(u * 47) * v;
        const a = u * (2.55 - 0.35 * v);
        const fl = 0.5 + 0.3 * Math.sin(t * 2.3 + u * 6 + v * 3.5) + 0.2 * Math.sin(t * 4.1 + v * 8 + u * 3);
        const push = wind * (0.04 + 0.55 * Math.pow(v, 1.4)) * (0.5 + 0.5 * fl);
        const x = r * Math.sin(a) + Math.sin(t * 3.1 + v * 6 + u * 4) * 0.035 * wind * v;
        const z = -r * Math.cos(a) - push * (0.35 + 0.65 * Math.max(0, Math.cos(a)));
        mp.setXYZ(i, x, y, z);
      }
      mp.needsUpdate = true; mGeo.computeVertexNormals();
      // hair + beard
      const pa = hGeo.attributes.position;
      strips.forEach((s, si) => {
        const isBeard = si >= nHairStrips;
        for (let r = 0; r <= s.rows; r++) {
          const f = r / s.rows, ph = si * 1.7;
          const wob = 0.6 + 0.4 * Math.sin(t * 2.4 + ph + f * 4);
          tmp.copy(s.root).addScaledVector(s.out, f * 0.07);
          tmp.y -= f * s.len * (isBeard ? 1 : 0.92);
          tmp.z -= wind * f * f * (isBeard ? 0.12 : 0.55) * wob;
          tmp.x += Math.sin(t * 3 + ph + f * 5) * 0.02 * wind * f;
          const w = s.w * (1 - f * 0.6) * 0.5;
          pa.setXYZ(s.start + r * 2, tmp.x - w, tmp.y, tmp.z); pa.setXYZ(s.start + r * 2 + 1, tmp.x + w, tmp.y, tmp.z);
        }
      });
      pa.needsUpdate = true; hGeo.computeBoundingSphere();
    }
    update(0, 0.3);
    return { group: root, update, height: 1.72 };
  };

  /* soft elongated ground shadow (decal) */
  lib.groundShadow = function (len, width) {
    const g = new THREE.PlaneGeometry(len, width, 1, 1); g.translate(len / 2, 0, 0); g.rotateX(-Math.PI / 2);
    const m = new THREE.ShaderMaterial({
      uniforms: { uA: { value: 0.55 } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
      fragmentShader: 'uniform float uA; varying vec2 vUv; void main(){ float l=1.0-vUv.x; float e=1.0-abs(vUv.y-0.5)*2.0; float a=smoothstep(0.0,0.5,e)*smoothstep(0.0,1.0,l)*uA; gl_FragColor=vec4(0.0,0.0,0.0,a); }',
      transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2,
    });
    const mesh = new THREE.Mesh(g, m); mesh.renderOrder = 1; return mesh;
  };

  /* ------------------------------------------------ Patmos cliff scene */
  /* The shared set for Episodes 1-3+: cliff edge, grass, rocks, John, dust, lights. */
  lib.cliffScene = function (ctx, env) {
    const quality = ctx.quality, hi = quality === 'high';
    lib.reseed(777);
    const group = new THREE.Group(); group.position.set(0, 0, 6000);
    const edgeX = (z) => 2.6 + 3.2 * perlin(z * 0.07, 3.3, 5) + 1.1 * perlin(z * 0.3, 8.1, 6);
    const plateau = (x, z) => 12 + 0.9 * perlin(x * 0.09, z * 0.09, 8) + 0.25 * perlin(x * 0.7, z * 0.7, 9) + 0.005 * x;
    const cliffH = (x, z) => {
      const d = x - edgeX(z), H = plateau(x, z);
      if (d < 0) return H + 0.25 * perlin(x * 0.45, z * 0.45, 4) * ss(-8, -0.5, d);
      const wid = 5.5 + 3 * perlin(z * 0.15, 1.7, 2), t = clamp(d / wid), prof = Math.pow(1 - t, 1.5);
      return H * prof - 6 * t + 1.1 * perlin(x * 0.55, z * 0.55, 12) * (1 - t) * Math.min(1, d);
    };
    const terrain = lib.terrain({ env, x0: -90, x1: 40, z0: -130, z1: 130, cell: hi ? 0.5 : 0.7, detail: 1.1, height: cliffH, color: (x, z, h, slope) => {
      const n = fbm2(x * 0.25, z * 0.25, 3, 7) * 0.5 + 0.5, n2 = fbm2(x * 1.4, z * 1.4, 2, 3) * 0.5 + 0.5;
      const dry = [0.2, 0.15, 0.085], sc = [0.075, 0.09, 0.04], rock = [0.2, 0.17, 0.135], lr = [0.34, 0.29, 0.22];
      const c = dry.slice(); const mx = (a, k) => { c[0] += (a[0] - c[0]) * k; c[1] += (a[1] - c[1]) * k; c[2] += (a[2] - c[2]) * k; };
      mx(sc, ss(0.45, 0.7, n) * 0.7); mx(lr, ss(0.55, 0.85, n2) * 0.35); mx(rock, ss(0.18, 0.5, slope) * 0.95);
      const v = 0.8 + n2 * 0.4; return [c[0] * v, c[1] * v, c[2] * v];
    } });
    group.add(terrain);
    const jx = 0.4, jz = 0, jy = cliffH(jx, jz);
    const grass = lib.grass(env, { count: hi ? 16000 : 9000, x0: -16, x1: edgeX(0) - 0.4, z0: -12, z1: 12, height: cliffH, accept: (x, z) => x < edgeX(z) - 0.5 });
    group.add(grass);
    const rockMat = new THREE.MeshStandardMaterial({ color: Aura.col(0x8a7558), roughness: 1, metalness: 0, emissive: new THREE.Color(0.035, 0.022, 0.012) });
    for (let i = 0; i < 26; i++) {
      const x = -14 + rnd() * 15, z = -12 + rnd() * 24; if (x > edgeX(z) - 1.0) continue;
      const r = 0.14 + rnd() * 0.5, g = new THREE.IcosahedronGeometry(r, 1), p = g.attributes.position;
      for (let k = 0; k < p.count; k++) { const sc = 1 + 0.35 * perlin(p.getX(k) * 5 + i, p.getZ(k) * 5, 3); p.setXYZ(k, p.getX(k) * sc, p.getY(k) * sc * 0.7, p.getZ(k) * sc); }
      g.computeVertexNormals(); const m = new THREE.Mesh(g, rockMat); m.position.set(x, cliffH(x, z) + r * 0.12, z); m.rotation.y = rnd() * 6; group.add(m);
    }
    const sunLight = new THREE.DirectionalLight(0xffa860, 2.6); group.add(sunLight); group.add(sunLight.target);
    const hemi = new THREE.HemisphereLight(0x3a4a8a, 0x3a2a1c, 0.8); group.add(hemi);
    const fill = new THREE.DirectionalLight(0xffc890, 0.16); group.add(fill); group.add(fill.target);
    const john = lib.john(env); john.group.position.set(jx, jy, jz); group.add(john.group);
    const shadow = lib.groundShadow(14, 0.9); shadow.position.set(jx, jy + 0.04, jz); group.add(shadow);
    const dust = lib.dust(env, { count: hi ? 700 : 350, size: 36 }); group.add(dust);
    const jWorld = new V3(jx, jy, jz).add(group.position);
    const jc = (dy, dx, dz) => [jWorld.x + (dx || 0), jWorld.y + dy, jWorld.z + (dz || 0)];
    function update(t, wind, sdir, cam) {
      sunLight.position.copy(sdir).multiplyScalar(60).add(john.group.position); sunLight.target.position.copy(john.group.position);
      const k = clamp(0.4 + 6 * Math.max(0, sdir.y));
      sunLight.intensity = 2.4 * k + 0.3; sunLight.color.copy(env.uSunCol.value).multiplyScalar(0.5);
      sunLight.color.r = Math.min(1, sunLight.color.r); sunLight.color.g = Math.min(1, sunLight.color.g); sunLight.color.b = Math.min(1, sunLight.color.b);
      fill.position.copy(cam.position).sub(group.position); fill.target.position.copy(john.group.position);
      hemi.color.copy(env.uAmbS.value).multiplyScalar(4); hemi.groundColor.copy(env.uAmbG.value).multiplyScalar(3); hemi.intensity = 0.9;
      john.update(t, wind);
      const sl = clamp(3.2 / Math.max(0.05, Math.tan(Math.asin(clamp(sdir.y, 0.03, 0.4)))), 2, 26);
      shadow.scale.set(sl / 14, 1, 1); shadow.rotation.y = Math.atan2(-sdir.z, -sdir.x) * -1; shadow.material.uniforms.uA.value = 0.5;
    }
    return { group, john, terrain, cliffH, edgeX, jWorld, jc, update };
  };

  /* ------------------------------------------------ sky effects (lights, clouds, shaft, glyphs) */
  let _glow = null;
  lib.glowTex = function () {
    if (_glow) return _glow;
    const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
    const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.14, 'rgba(255,236,190,0.85)'); g.addColorStop(0.42, 'rgba(255,170,80,0.24)'); g.addColorStop(1, 'rgba(255,140,50,0)');
    x.fillStyle = g; x.fillRect(0, 0, 128, 128); return (_glow = new THREE.CanvasTexture(c));
  };
  lib.orb = function (r, g, b) {
    const m = new THREE.SpriteMaterial({ map: lib.glowTex(), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, color: new THREE.Color(r === undefined ? 1 : r, g === undefined ? 0.85 : g, b === undefined ? 0.55 : b) });
    return new THREE.Sprite(m);
  };
  lib.cloudTex = function (seed) {
    lib.reseed(seed);
    const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
    for (let i = 0; i < 80; i++) {
      const cx = 128 + (rnd() - 0.5) * 160, cy = 128 + (rnd() - 0.5) * 70, r = 26 + rnd() * 56, a = 0.09 + rnd() * 0.11;
      const g = x.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, 'rgba(255,255,255,' + a + ')'); g.addColorStop(0.6, 'rgba(255,255,255,' + a * 0.45 + ')'); g.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = g; x.fillRect(0, 0, 256, 256);
    }
    return new THREE.CanvasTexture(c);
  };
  /* a column of heavenly light: scale.x/z = base radius, scale.y = height; base sits at the mesh origin */
  lib.shaft = function () {
    const g = new THREE.CylinderGeometry(0.55, 1, 1, 40, 1, true); g.translate(0, 0.5, 0);
    const m = new THREE.ShaderMaterial({
      uniforms: { uInt: { value: 0 }, uCol: { value: new THREE.Color(1.0, 0.8, 0.5) } },
      vertexShader: 'varying vec3 vN,vV; varying float vY; void main(){ vN=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.0); vV=-mv.xyz; vY=position.y; gl_Position=projectionMatrix*mv; }',
      fragmentShader: 'uniform float uInt; uniform vec3 uCol; varying vec3 vN,vV; varying float vY; void main(){ float e=pow(abs(dot(normalize(vN),normalize(vV))),1.6); float a=e*(0.2+0.8*vY)*(1.0-smoothstep(0.78,1.0,vY))*uInt; gl_FragColor=vec4(uCol*a,1.0); }',
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(g, m); mesh.frustumCulled = false; return mesh;
  };
  /* a glowing letter made of light that can be revealed (uReveal 0..1); faces the camera via update */
  lib.glyph = function (ch) {
    const c = document.createElement('canvas'); c.width = c.height = 512; const x = c.getContext('2d');
    x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = 'bold 400px Cinzel, "Times New Roman", Georgia, serif';
    x.shadowColor = 'rgba(255,190,90,1)'; x.shadowBlur = 60; x.fillStyle = 'rgba(255,200,110,0.9)'; x.fillText(ch, 256, 270); x.fillText(ch, 256, 270);
    x.shadowBlur = 14; x.fillStyle = '#fff4d8'; x.fillText(ch, 256, 270);
    const tex = new THREE.CanvasTexture(c);
    const m = new THREE.ShaderMaterial({
      uniforms: { uMap: { value: tex }, uReveal: { value: 0 }, uBright: { value: 2.2 }, uTime: { value: 0 } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
      fragmentShader: 'uniform sampler2D uMap; uniform float uReveal,uBright,uTime; varying vec2 vUv; void main(){ vec4 t=texture2D(uMap,vUv); float k=vUv.x*0.5+(1.0-vUv.y)*0.5; float r=smoothstep(0.0,0.3,uReveal*1.55-k); float sh=0.85+0.15*sin(uTime*2.0+vUv.x*9.0); gl_FragColor=vec4(t.rgb*t.a*uBright*r*sh,1.0); }',
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), m); mesh.frustumCulled = false; return mesh;
  };

  /* ---------------------------------------------------- surf: foam + spray */
  /* waterline polyline for a cliffScene: local-space x where the cliff meets the sea, per z */
  lib.waterline = function (cs, zMin, zMax, step) {
    const pts = [];
    for (let z = zMin; z <= zMax + 1e-6; z += step) {
      let x = cs.edgeX(z), prev = cs.cliffH(x, z);
      for (let k = 0; k < 160; k++) { x += 0.1; const h = cs.cliffH(x, z); if (h <= 0.15) { break; } prev = h; }
      pts.push([x, z]);
    }
    return pts;
  };
  /* JS copy of the sea's base swell (matches lib.sea) so foam can ride the water. p = WORLD x,z */
  lib.seaHeight = function (x, z, t) {
    const W = (dx, dz, f, a, s) => a * Math.sin((x * dx + z * dz) * f + t * s);
    return W(0.8, 0.6, 0.12, 0.34, 0.9) + W(-0.5, 0.86, 0.2, 0.2, 1.2) + W(0.95, -0.3, 0.33, 0.1, 1.7) + W(0.1, 0.99, 0.55, 0.05, 2.3) + W(-0.7, -0.7, 0.9, 0.024, 3.1);
  };
  /* foam ribbon hugging the waterline, pulsing with the swell. group is the cliffScene group. */
  lib.foam = function (env, pts, groupZ) {
    const n = pts.length, pos = new Float32Array(n * 2 * 3), uv = new Float32Array(n * 2 * 2), idx = [];
    for (let i = 0; i < n; i++) { uv.set([i * 0.37, 0, i * 0.37, 1], i * 4); }
    for (let i = 0; i < n - 1; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); g.setIndex(idx);
    const m = new THREE.ShaderMaterial({
      uniforms: { uTime: env.uTime, uSunCol: env.uSunCol, uAmbS: env.uAmbS, uAmt: { value: 1 } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
      fragmentShader: GLSL_NOISE + 'uniform float uTime,uAmt; uniform vec3 uSunCol,uAmbS; varying vec2 vUv; void main(){ float n=snoise(vec3(vUv.x*5.0,vUv.y*3.0,uTime*0.5))*0.5+0.5; float n2=snoise(vec3(vUv.x*17.0,vUv.y*9.0,uTime*0.9))*0.5+0.5; float edge=smoothstep(0.0,0.35,vUv.y)*(1.0-smoothstep(0.55,1.0,vUv.y)); float surge=0.55+0.45*sin(uTime*0.9+vUv.x*1.3); float a=smoothstep(0.35,0.75,n*0.65+n2*0.5)*edge*(0.45+0.55*surge)*uAmt; vec3 c=vec3(0.78,0.84,0.9)*(uAmbS*2.5+uSunCol*0.22+0.12); gl_FragColor=vec4(c*a,a); }',
      transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3,
    });
    const mesh = new THREE.Mesh(g, m); mesh.frustumCulled = false; mesh.renderOrder = 3;
    const P = g.attributes.position;
    mesh.userData.update = function (t) {
      for (let i = 0; i < n; i++) {
        const x = pts[i][0], z = pts[i][1], surge = 0.5 + 0.5 * Math.sin(t * 0.9 + i * 1.3 * 0.37), y = lib.seaHeight(x, z + groupZ, t) + 0.12;
        P.setXYZ(i * 2, x - 0.7 + surge * 0.5, y, z); P.setXYZ(i * 2 + 1, x + 1.9 + surge * 0.9, y, z);
      }
      P.needsUpdate = true;
    };
    return mesh;
  };
  /* surf spray: pure function of time. pts = waterline [[x,z],..] (local). */
  lib.spray = function (env, pts, o) {
    o = o || {}; lib.reseed(o.seed || 4242);
    const per = o.perBurst || 22, sources = o.sources || 22, n = sources * per;
    const A = new Float32Array(n * 3), V = new Float32Array(n * 3), S = new Float32Array(n * 4);
    for (let s = 0; s < sources; s++) {
      const pt = pts[(rnd() * pts.length) | 0], period = 4.2 + rnd() * 3.6, phase = rnd(), pw = 0.55 + rnd() * 0.9;
      for (let k = 0; k < per; k++) {
        const i = s * per + k;
        A.set([pt[0] + 0.4 + rnd() * 1.6, 0.0, pt[1] + (rnd() - 0.5) * 3.0], i * 3);
        V.set([(rnd() - 0.2) * 2.4 - 0.6, (4.2 + rnd() * 6.5) * pw, (rnd() - 0.5) * 2.0], i * 3);
        S.set([phase, period, 1.4 + rnd() * 1.4, 0.16 + rnd() * 0.5], i * 4);
      }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(A, 3)); g.setAttribute('aVel', new THREE.BufferAttribute(V, 3)); g.setAttribute('aS', new THREE.BufferAttribute(S, 4));
    const m = new THREE.ShaderMaterial({
      uniforms: { uTime: env.uTime, uVH: { value: 800 }, uSunCol: env.uSunCol, uAmbS: env.uAmbS, uAmt: { value: 1 } },
      vertexShader: 'attribute vec3 aVel; attribute vec4 aS; uniform float uTime,uVH,uAmt; varying float vA; float hh(float x){ return fract(sin(x*91.7)*43758.5453); } void main(){ float cyc=uTime/aS.y+aS.x; float f=fract(cyc); float tau=f*aS.y; float burst=hh(floor(cyc)+aS.x*17.0); float life=aS.z*(0.7+0.5*burst); float k=0.35+0.9*burst; vec3 p=position+aVel*vec3(1.0,k,1.0)*tau; p.y-=4.9*tau*tau; float on=step(tau,life)*step(0.0,p.y+0.2); vA=on*pow(max(1.0-tau/life,0.0),1.4)*smoothstep(0.0,0.12,tau)*uAmt; vec4 mv=modelViewMatrix*vec4(p,1.0); float d=max(-mv.z,0.5); gl_PointSize=clamp(aS.w*(0.7+tau*0.9)*projectionMatrix[1][1]*uVH*0.5/d,1.0,150.0); gl_Position=projectionMatrix*mv; }',
      fragmentShader: 'uniform vec3 uSunCol,uAmbS; varying float vA; void main(){ float d=length(gl_PointCoord-0.5)*2.0; float a=smoothstep(1.0,0.15,d)*vA*0.3; vec3 c=vec3(0.86,0.92,1.0)*(0.18+uAmbS*2.0+uSunCol*0.22); gl_FragColor=vec4(c*a,1.0); }',
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    const p = new THREE.Points(g, m); p.frustumCulled = false; p.renderOrder = 4; return p;
  };
  /* rising motes of light around a point (local space); amount 0..1 via material.uniforms.uAmt */
  lib.motes = function (env, o) {
    o = o || {}; lib.reseed(o.seed || 616); const n = o.count || 300, R = o.radius || 7, H = o.height || 9;
    const P = new Float32Array(n * 3), S = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { const a = rnd() * 6.283, r = Math.sqrt(rnd()) * R; P.set([Math.cos(a) * r, rnd() * H, Math.sin(a) * r], i * 3); S.set([rnd(), 0.25 + rnd() * 0.6, 0.6 + rnd() * 1.4], i * 3); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(P, 3)); g.setAttribute('aS', new THREE.BufferAttribute(S, 3));
    const m = new THREE.ShaderMaterial({
      uniforms: { uTime: env.uTime, uVH: { value: 800 }, uAmt: { value: 0 }, uH: { value: H }, uSz: { value: o.size || 0.09 }, uCol: { value: new THREE.Color(1.0, 0.8, 0.5) } },
      vertexShader: 'attribute vec3 aS; uniform float uTime,uVH,uAmt,uH,uSz; varying float vA; void main(){ vec3 p=position; p.y=mod(p.y+uTime*aS.y*0.8,uH); p.x+=sin(uTime*0.7+aS.x*40.0)*0.5; p.z+=cos(uTime*0.6+aS.x*31.0)*0.5; vA=smoothstep(0.0,1.5,p.y)*(1.0-smoothstep(uH*0.6,uH,p.y))*(0.5+0.5*sin(uTime*1.6+aS.x*60.0))*uAmt; vec4 mv=modelViewMatrix*vec4(p,1.0); float d=max(-mv.z,0.5); gl_PointSize=clamp(aS.z*uSz*projectionMatrix[1][1]*uVH*0.5/d,1.0,24.0); gl_Position=projectionMatrix*mv; }',
      fragmentShader: 'uniform vec3 uCol; varying float vA; void main(){ float d=length(gl_PointCoord-0.5)*2.0; float a=smoothstep(1.0,0.0,d); gl_FragColor=vec4(uCol*a*a*vA*1.6,1.0); }',
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    const p = new THREE.Points(g, m); p.frustumCulled = false; p.renderOrder = 6; return p;
  };
  /* a name written in light, as a sprite (call .userData.redraw() once fonts load) */
  lib.nameTag = function (text) {
    const c = document.createElement('canvas'); c.width = 1024; c.height = 192; const x = c.getContext('2d');
    const tex = new THREE.CanvasTexture(c);
    function draw() {
      x.clearRect(0, 0, 1024, 192); x.textAlign = 'center'; x.textBaseline = 'middle';
      let fs = 118; const font = (z) => '700 ' + z + 'px Cinzel, "Times New Roman", Georgia, serif';
      x.font = font(fs); while (x.measureText(text).width > 940 && fs > 40) { fs -= 4; x.font = font(fs); }
      x.shadowColor = 'rgba(255,190,90,1)'; x.shadowBlur = 38; x.fillStyle = 'rgba(255,205,120,0.9)'; x.fillText(text, 512, 100); x.fillText(text, 512, 100);
      x.shadowBlur = 8; x.fillStyle = '#fff6df'; x.fillText(text, 512, 100);
      tex.needsUpdate = true;
    }
    draw();
    const m = new THREE.SpriteMaterial({ map: tex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true });
    const sp = new THREE.Sprite(m); sp.userData.redraw = draw; return sp;
  };
  lib.dirOf = function (az, el, out) { out = out || new V3(); return out.set(Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az)); };

  /*@@EP4-BEGIN@@*/
  /* ====================================================================
   *  PIECES FIRST USED IN EPISODE 4  (reusable in every later vision)
   *  lib.lampstand · lib.christ (the bright silhouette) · lib.star · lib.flameSprite
   *  lib.terrainDisc (light pools & rolling rings that follow the ground)
   * ================================================================== */
  let _star = null, _flame = null;
  /* a four-point star of light */
  lib.starTex = function () {
    if (_star) return _star;
    const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
    const g = x.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.07, 'rgba(255,250,235,0.95)'); g.addColorStop(0.2, 'rgba(255,228,175,0.34)'); g.addColorStop(1, 'rgba(255,200,120,0)');
    x.fillStyle = g; x.fillRect(0, 0, 256, 256);
    x.globalCompositeOperation = 'lighter';
    const spike = (ang, len, wid) => {
      x.save(); x.translate(128, 128); x.rotate(ang);
      const gr = x.createLinearGradient(-len, 0, len, 0); gr.addColorStop(0, 'rgba(255,240,200,0)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.95)'); gr.addColorStop(1, 'rgba(255,240,200,0)');
      x.fillStyle = gr; x.beginPath(); x.moveTo(-len, 0); x.quadraticCurveTo(0, -wid, len, 0); x.quadraticCurveTo(0, wid, -len, 0); x.fill(); x.restore();
    };
    spike(0, 126, 5); spike(Math.PI / 2, 126, 5); spike(Math.PI / 4, 62, 2.6); spike(-Math.PI / 4, 62, 2.6);
    return (_star = new THREE.CanvasTexture(c));
  };
  lib.star = function (r, g, b) {
    return new THREE.Sprite(new THREE.SpriteMaterial({ map: lib.starTex(), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, color: new THREE.Color(r === undefined ? 1 : r, g === undefined ? 0.95 : g, b === undefined ? 0.85 : b) }));
  };
  /* a tongue of flame (tip up) */
  lib.flameTex = function () {
    if (_flame) return _flame;
    const c = document.createElement('canvas'); c.width = 128; c.height = 256; const x = c.getContext('2d');
    x.shadowColor = 'rgba(255,150,40,1)'; x.shadowBlur = 16;
    const path = () => { x.beginPath(); x.moveTo(64, 14); x.bezierCurveTo(78, 82, 108, 128, 106, 166); x.bezierCurveTo(104, 204, 86, 226, 64, 226); x.bezierCurveTo(42, 226, 24, 204, 22, 166); x.bezierCurveTo(20, 128, 50, 82, 64, 14); x.closePath(); };
    const g = x.createRadialGradient(64, 178, 0, 64, 178, 104);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.28, 'rgba(255,236,170,0.96)'); g.addColorStop(0.62, 'rgba(255,150,45,0.78)'); g.addColorStop(1, 'rgba(255,70,10,0)');
    x.fillStyle = g; path(); x.fill();
    x.shadowBlur = 0; x.globalCompositeOperation = 'lighter';
    const g2 = x.createRadialGradient(64, 190, 0, 64, 190, 56); g2.addColorStop(0, 'rgba(255,255,255,0.95)'); g2.addColorStop(1, 'rgba(255,230,160,0)');
    x.fillStyle = g2; x.beginPath(); x.ellipse(64, 186, 26, 48, 0, 0, 6.2832); x.fill();
    return (_flame = new THREE.CanvasTexture(c));
  };
  lib.flameSprite = function (r, g, b) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: lib.flameTex(), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, color: new THREE.Color(r === undefined ? 1 : r, g === undefined ? 0.9 : g, b === undefined ? 0.7 : b) }));
    sp.center.set(0.5, 0.1); return sp;
  };

  /* ---------------------------------------------- a golden lampstand */
  /* One of the seven. Stands on y=0, ~3.1 high. update(t, k): k 0..1 = how alight it is. */
  lib.lampstand = function (env, o) {
    o = o || {}; const H = 3.0, pts = [];
    const bump = (y, yk, w, a) => a * Math.exp(-Math.pow((y - yk) / w, 2));
    pts.push(new THREE.Vector2(0.0, 0.0));
    for (let i = 0; i <= 70; i++) {
      const y = (i / 70) * 2.62;
      let r = 0.048 + 0.012 * Math.sin(y * 9) + 0.36 * Math.exp(-y * 8.5) + bump(y, 0.62, 0.065, 0.062) + bump(y, 1.22, 0.065, 0.062) + bump(y, 1.82, 0.065, 0.062) + bump(y, 2.3, 0.075, 0.07) + bump(y, 0.2, 0.05, 0.025);
      pts.push(new THREE.Vector2(r, y));
    }
    for (let i = 1; i <= 16; i++) { const u = i / 16, y = 2.62 + u * 0.4, r = 0.05 + 0.27 * Math.pow(u, 0.72); pts.push(new THREE.Vector2(r, y)); }
    pts.push(new THREE.Vector2(0.31, 3.03), new THREE.Vector2(0.27, 3.0), new THREE.Vector2(0.17, 2.92), new THREE.Vector2(0.0, 2.9));
    const geo = new THREE.LatheGeometry(pts, 52);
    const mat = new THREE.MeshStandardMaterial({ color: Aura.col(0xe2ac3c), roughness: 0.3, metalness: 0.42, emissive: new THREE.Color(0.2, 0.105, 0.016), side: THREE.DoubleSide });
    const group = new THREE.Group(), body = new THREE.Mesh(geo, mat); group.add(body);
    /* the oil, glowing in the bowl */
    const oil = new THREE.Mesh(new THREE.CircleGeometry(0.2, 24), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 1.4, 0.45) })); oil.rotation.x = -Math.PI / 2; oil.position.y = 2.93; group.add(oil);
    const top = new THREE.Vector3(0, 3.0, 0);
    const halo = lib.orb(1.0, 0.66, 0.26); halo.renderOrder = 5; halo.position.copy(top).add(new THREE.Vector3(0, 0.3, 0)); group.add(halo);
    const flame = lib.flameSprite(1.0, 0.86, 0.6); flame.renderOrder = 6; flame.position.copy(top).add(new THREE.Vector3(0, 0.04, 0)); group.add(flame);
    const flame2 = lib.flameSprite(1.0, 0.7, 0.3); flame2.renderOrder = 6; flame2.position.copy(top).add(new THREE.Vector3(0, 0.02, 0)); group.add(flame2);
    const seed = (o.seed || 0) * 1.73;
    function update(t, k, bend) {
      k = k === undefined ? 1 : k; bend = bend || 0;
      const fl = 0.86 + 0.14 * Math.sin(t * 9.1 + seed) * Math.sin(t * 5.3 + seed * 2.1) + 0.06 * Math.sin(t * 17 + seed);
      const pop = k > 0 && k < 1 ? 1 + 1.4 * Math.sin(Math.PI * k) : 1;
      const s = k * fl * pop;
      flame.scale.set(0.3 * s, 0.62 * s * (0.94 + 0.1 * Math.sin(t * 7 + seed)), 1); flame.material.opacity = clamp(k * 1.4);
      flame2.scale.set(0.2 * s, 0.44 * s * (0.95 + 0.1 * Math.sin(t * 11 + seed * 3)), 1); flame2.material.opacity = clamp(k * 1.4);
      flame.material.rotation = -bend * 0.5 + Math.sin(t * 3.1 + seed) * 0.05; flame2.material.rotation = -bend * 0.7 + Math.sin(t * 4.3 + seed) * 0.07;
      const hs = k * (1.6 + 0.4 * fl) * (1 + 1.3 * Math.max(0, pop - 1)); halo.scale.set(hs, hs, 1); halo.material.opacity = clamp(k * 1.2); oil.material.color.setRGB(2.2 * k + 0.05, 1.4 * k + 0.03, 0.45 * k + 0.02);
      mat.emissive.setRGB(0.05 + 0.2 * k, 0.026 + 0.105 * k, 0.004 + 0.016 * k);
    }
    update(0, 1);
    return { group, top, height: 3.1, update, flame, halo };
  };

  /* ------------------------ ground-following disc (light pool, rolling rings) */
  /* hFn(x,z)->ground height in the parent's space. frag: GLSL body using vUv (x = r/R, y = angle 0..1), uT, uAmt, uCol, uR (R metres) */
  lib.terrainDisc = function (hFn, cx, cz, R, o) {
    o = o || {}; const nr = o.rings || 56, ns = o.segs || 96, lift = o.lift === undefined ? 0.4 : o.lift, pw = o.pow || 1.3;
    const pos = new Float32Array((nr + 1) * (ns + 1) * 3), uv = new Float32Array((nr + 1) * (ns + 1) * 2), idx = [];
    for (let i = 0; i <= nr; i++) {
      const r = R * Math.pow(i / nr, pw);
      for (let j = 0; j <= ns; j++) { const a = (j / ns) * Math.PI * 2, x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r, k = i * (ns + 1) + j; pos.set([x, hFn(x, z) + lift, z], k * 3); uv.set([r / R, j / ns], k * 2); }
    }
    for (let i = 0; i < nr; i++) for (let j = 0; j < ns; j++) { const a = i * (ns + 1) + j, b = a + 1, c = a + ns + 1, d = c + 1; idx.push(a, c, b, b, c, d); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); g.setIndex(idx);
    const m = new THREE.ShaderMaterial({
      uniforms: Object.assign({ uT: { value: 0 }, uAmt: { value: 1 }, uCol: { value: new THREE.Color(1.0, 0.78, 0.4) }, uR: { value: R }, uFront: { value: 0 }, uXFade: { value: new THREE.Vector2(9998, 9999) } }, o.uniforms || {}),
      vertexShader: 'varying vec2 vUv; varying vec3 vP; void main(){ vUv=uv; vP=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
      fragmentShader: GLSL_NOISE + 'uniform float uT,uAmt,uR,uFront; uniform vec3 uCol; uniform vec2 uXFade; varying vec2 vUv; varying vec3 vP; void main(){ float fade=1.0-smoothstep(uXFade.x,uXFade.y,vP.x); float a=0.0; ' + o.frag + ' gl_FragColor=vec4(uCol*a*uAmt*fade,1.0); }',
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(g, m); mesh.frustumCulled = false; mesh.renderOrder = 4; return mesh;
  };
  lib.lightPool = (hFn, cx, cz, R) => lib.terrainDisc(hFn, cx, cz, R, { frag: 'float r=vUv.x; float n=snoise(vec3(vP.x*0.4,vP.z*0.4,uT*0.3))*0.5+0.5; a=pow(1.0-r,3.2)*(0.7+0.3*n);' });
  /* concentric swells moving outward from the centre: uFront = radius (metres) of the leading ring */
  lib.waveRings = (hFn, cx, cz, R) => lib.terrainDisc(hFn, cx, cz, R, { rings: 90, segs: 120, pow: 1.0, lift: 0.5, frag: 'float rm=vUv.x*uR; float tot=0.0; for(int m=0;m<5;m++){ float rr=uFront-float(m)*6.0; float x=rm-rr; float sg=1.0+float(m)*0.35; float e=exp(-x*x/(2.0*sg*sg)); tot+=e*pow(0.7,float(m))*step(0.0,rr); } float w=snoise(vec3(vUv.y*14.0,rm*0.5,uT*0.8))*0.5+0.5; a=tot*(0.6+0.7*w)*(1.0-smoothstep(0.55,1.0,vUv.x));' });

  /* ----------------------------------- the bright silhouette of Christ */
  /* Faces +X, feet at y=0, about 2.05 tall before scale. Light, never a dark figure; no facial detail.
     update(t, k): k = { form 0..1 (rises as light), eyes, stars 0..7, sword 0..1, face 0..1, blaze 0..1, wind } */
  lib.christ = function (env, o) {
    o = o || {}; const S = o.scale || 1.2, root = new THREE.Group(), g = new THREE.Group(); root.add(g); g.scale.setScalar(S);
    const U = { uTime: { value: 0 }, uForm: { value: 1 }, uH: { value: 2.0 }, uBlaze: { value: 0 }, uScale: { value: S }, uOrigin: { value: new V3() } };
    const radVS = 'varying vec3 vN,vV,vW; uniform float uInfl; void main(){ vec3 p=position+normal*uInfl; vN=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(p,1.0); vV=-mv.xyz; vW=(modelMatrix*vec4(p,1.0)).xyz; gl_Position=projectionMatrix*mv; }';
    const radFS = GLSL_NOISE + 'uniform float uTime,uForm,uH,uInt,uBlaze,uScale; uniform vec3 uCol,uOrigin; varying vec3 vN,vV,vW; void main(){ float h=(vW.y-uOrigin.y)/uScale/uH; float edge=uForm*1.2-h; if(edge<0.0) discard; vec3 N=normalize(vN),V=normalize(vV); float ndv=clamp(dot(N,V),0.0,1.0); float n=snoise(vec3(vW.x*2.6,vW.y*1.7-uTime*0.55,vW.z*2.6))*0.5+0.5; float n2=snoise(vec3(vW.x*9.0,vW.y*5.0-uTime*1.4,vW.z*9.0))*0.5+0.5; float rim=pow(1.0-ndv,2.0); vec3 col=uCol*(0.5+0.4*n+0.16*n2)*(0.62+0.38*ndv); col+=vec3(1.0,0.96,0.88)*rim*1.5; col*=uInt*(1.0+uBlaze*2.6); float wv=smoothstep(0.2,0.0,edge); col+=vec3(2.4,2.0,1.4)*wv; gl_FragColor=vec4(col,1.0); }';
    const mk = (col, inten) => new THREE.ShaderMaterial({ uniforms: { uTime: U.uTime, uForm: U.uForm, uH: U.uH, uBlaze: U.uBlaze, uScale: U.uScale, uOrigin: U.uOrigin, uCol: { value: col.clone() }, uInt: { value: inten }, uInfl: { value: 0 } }, vertexShader: radVS, fragmentShader: radFS, side: THREE.DoubleSide });
    const shellMat = (col, inten, infl) => new THREE.ShaderMaterial({ uniforms: { uForm: U.uForm, uH: U.uH, uScale: U.uScale, uOrigin: U.uOrigin, uCol: { value: col.clone() }, uInt: { value: inten }, uInfl: { value: infl }, uAmt: { value: 1 } },
      vertexShader: radVS, fragmentShader: 'uniform float uForm,uH,uScale,uInt,uAmt; uniform vec3 uCol,uOrigin; varying vec3 vN,vV,vW; void main(){ float h=(vW.y-uOrigin.y)/uScale/uH; float edge=uForm*1.2-h; if(edge<0.0) discard; float f=pow(1.0-clamp(dot(normalize(vN),normalize(vV)),0.0,1.0),1.5); gl_FragColor=vec4(uCol*f*uInt*uAmt,1.0); }',
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
    const robeMat = mk(C(1.0, 0.8, 0.46), 0.5), skinMat = mk(C(1.0, 0.85, 0.6), 0.62), whiteMat = mk(C(1.0, 0.96, 0.9), 0.85), sashMat = mk(C(1.0, 0.55, 0.1), 0.95);
    const shells = [], addShell = (mesh, infl, int, col) => { const sh = new THREE.Mesh(mesh.geometry, shellMat(col || C(1.0, 0.82, 0.5), (int || 1.1) * 0.45, infl)); sh.renderOrder = 3; mesh.add(sh); shells.push(sh); return sh; };
    const limb = (a, b, ra, rb, mat) => {
      const A = new V3(...a), B = new V3(...b), len = A.distanceTo(B), m = new THREE.Mesh(new THREE.CylinderGeometry(rb, ra, len, 16, 1), mat);
      m.position.copy(A).add(B).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(new V3(0, 1, 0), B.clone().sub(A).normalize()); g.add(m); addShell(m, 0.02, 0.8); return m;
    };

    /* the robe, reaching down to his feet */
    const keys = [[0, 0.44, 0.24], [1, 0.42, 0.42], [2, 0.35, 0.82], [3, 0.285, 1.17], [4, 0.26, 1.34], [5, 0.29, 1.5], [6, 0.215, 1.63], [7, 0.1, 1.7], [8, 0.05, 1.72]], cv = Aura.curve(keys), prof = [];
    for (let i = 0; i <= 30; i++) { const v = cv((i / 30) * 8); prof.push(new THREE.Vector2(v[0], v[1])); }
    const robeGeo = new THREE.LatheGeometry(prof, 56), rp = robeGeo.attributes.position, rb = rp.array.slice();
    for (let i = 0; i < rp.count; i++) { const x = rb[i * 3], y = rb[i * 3 + 1], z = rb[i * 3 + 2], a = Math.atan2(z, x), f = 1 + 0.045 * Math.sin(a * 9 + y * 2.6) + 0.025 * Math.sin(a * 17 + 1.3) * (1.1 - y / 1.5); rp.setXYZ(i, x * f, y, z * f); rb[i * 3] = rp.array[i * 3]; rb[i * 3 + 2] = rp.array[i * 3 + 2]; }
    robeGeo.computeVertexNormals();
    const robe = new THREE.Mesh(robeGeo, robeMat); g.add(robe); addShell(robe, 0.03, 1.2);
    /* the golden sash around his chest */
    const sash = new THREE.Mesh(new THREE.CylinderGeometry(0.292, 0.3, 0.15, 48, 1, true), sashMat); sash.position.y = 1.36; g.add(sash); addShell(sash, 0.02, 1.6, C(1.0, 0.7, 0.2));
    /* arms: the left hangs; the right is held out, palm up, and holds the stars */
    limb([0, 1.53, -0.27], [0.04, 0.94, -0.34], 0.07, 0.055, robeMat);
    const armU = limb([0, 1.53, 0.27], [0.08, 1.22, 0.4], 0.07, 0.062, robeMat), armF = limb([0.08, 1.22, 0.4], [0.44, 1.34, 0.5], 0.062, 0.05, robeMat);
    const handR = new V3(0.5, 1.36, 0.5);
    const hR = new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 12), skinMat); hR.scale.set(1.3, 0.55, 1.0); hR.position.copy(handR); g.add(hR); addShell(hR, 0.015, 1);
    const hL = new THREE.Mesh(new THREE.SphereGeometry(0.052, 14, 10), skinMat); hL.position.set(0.05, 0.9, -0.34); g.add(hL);
    /* head and hair */
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.062, 0.14, 14), skinMat); neck.position.set(0, 1.7, 0); g.add(neck);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.105, 32, 24), skinMat); head.scale.set(0.92, 1.14, 0.96); head.position.set(0, 1.81, 0); g.add(head); addShell(head, 0.012, 1.1);
    const capGeo = new THREE.SphereGeometry(0.124, 40, 26, Math.PI + 0.95, Math.PI * 2 - 1.9, 0, 2.1), cp = capGeo.attributes.position;
    for (let i = 0; i < cp.count; i++) { const x = cp.getX(i), y = cp.getY(i), z = cp.getZ(i), d = 1 + 0.1 * perlin(x * 34 + 3, y * 34, 11) + 0.05 * perlin(z * 60, y * 60, 13); cp.setXYZ(i, x * d, y * d, z * d); }
    capGeo.computeVertexNormals();
    const cap = new THREE.Mesh(capGeo, whiteMat); cap.scale.set(0.96, 1.12, 1.02); cap.position.set(-0.004, 1.815, 0); g.add(cap); addShell(cap, 0.018, 1.3, C(1.0, 0.95, 0.85));
    const strips = [], hp = [], hi = [], HR = 9;
    lib.reseed(4141);
    for (let i = 0; i < 44; i++) {
      const a = (i / 44) * Math.PI * 2, dx = -Math.cos(a), dz = Math.sin(a);                 // a=0 at the back (-x)
      if (dx > 0.35 && Math.abs(dz) < 0.75) continue;                                       // keep the face clear
      const root0 = new V3(dx * 0.118, 1.82 + (rnd() - 0.5) * 0.05, dz * 0.12), start = hp.length / 3;
      for (let r = 0; r <= HR; r++) hp.push(0, 0, 0, 0, 0, 0);
      for (let r = 0; r < HR; r++) { const k = start + r * 2; hi.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
      strips.push({ root: root0, out: new V3(dx, -0.1, dz).normalize(), len: 0.34 + rnd() * 0.3, w: 0.03 + rnd() * 0.02, start, ph: rnd() * 6.3 });
    }
    const hGeo = new THREE.BufferGeometry(); hGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(hp), 3)); hGeo.setIndex(hi);
    const hn = new Float32Array(hp.length); for (let i = 0; i < hn.length; i += 3) hn[i + 1] = 1; hGeo.setAttribute('normal', new THREE.BufferAttribute(hn, 3));
    const hair = new THREE.Mesh(hGeo, whiteMat); hair.frustumCulled = false; g.add(hair);
    /* eyes like a flame of fire: light only, no face */
    const eyes = [-1, 1].map((s) => {
      const grp = new THREE.Group(); grp.position.set(0.098, 1.822, s * 0.044); g.add(grp);
      const halo = lib.orb(1.0, 0.45, 0.1); halo.renderOrder = 6; grp.add(halo);
      const core = lib.star(1.0, 0.95, 0.8); core.renderOrder = 7; grp.add(core);
      const tongues = [0, 1, 2].map((q) => { const f = lib.flameSprite(1.0, 0.7 + 0.1 * q, 0.3); f.renderOrder = 7; grp.add(f); return f; });
      return { grp, halo, core, tongues, s };
    });
    /* the sharp two-edged sword, from his mouth */
    const bladeGroup = new THREE.Group(); bladeGroup.position.set(0.1, 1.745, 0); bladeGroup.rotation.set(0, -0.42, 0.04); g.add(bladeGroup);
    {
      const L = 1.25, N = 28, bp = [], bi = [];
      for (let i = 0; i <= N; i++) { const s = i / N, w = (0.02 + 0.105 * Math.sin(Math.min(1, s * 5) * 1.5708)) * Math.pow(1 - s, 0.62), th = 0.012 * (1 - s * 0.85); bp.push(s * L, 0, -w, s * L, th, 0, s * L, 0, w, s * L, -th, 0); }
      for (let i = 0; i < N; i++) for (let k = 0; k < 4; k++) { const a = i * 4 + k, b = i * 4 + (k + 1) % 4, c = a + 4, d = b + 4; bi.push(a, c, b, b, c, d); }
      const bg = new THREE.BufferGeometry(); bg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(bp), 3)); bg.setIndex(bi); bg.computeVertexNormals();
      const bm = new THREE.ShaderMaterial({ uniforms: { uTime: U.uTime, uInt: { value: 1 } },
        vertexShader: 'varying vec3 vN,vV; varying float vS; void main(){ vS=position.x/1.25; vN=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.0); vV=-mv.xyz; gl_Position=projectionMatrix*mv; }',
        fragmentShader: 'uniform float uTime,uInt; varying vec3 vN,vV; varying float vS; void main(){ float f=pow(1.0-abs(dot(normalize(vN),normalize(vV))),1.4); vec3 core=vec3(1.5,1.55,1.6); vec3 edge=vec3(0.7,0.88,1.6); float sh=0.9+0.1*sin(vS*38.0-uTime*9.0); gl_FragColor=vec4(mix(core,edge,f)*uInt*sh*(1.1-0.3*vS),1.0); }',
        side: THREE.DoubleSide });
      var blade = new THREE.Mesh(bg, bm); blade.frustumCulled = false; blade.rotation.x = Math.PI / 2; bladeGroup.add(blade);
      var bladeGlow = lib.orb(0.6, 0.78, 1.0); bladeGlow.renderOrder = 6; bladeGroup.add(bladeGlow);
      var tipStar = lib.star(0.85, 0.95, 1.0); tipStar.renderOrder = 7; bladeGroup.add(tipStar);
      var bladeMat = bm;
    }
    /* seven stars in his right hand */
    const starsGrp = new THREE.Group(); starsGrp.position.copy(handR).add(new V3(0, 0.26, 0)); g.add(starsGrp);
    const stars = []; for (let i = 0; i < 7; i++) { const sp = lib.star(0.96, 0.97, 1.0); sp.renderOrder = 7; starsGrp.add(sp); stars.push(sp); }
    const starHalo = lib.orb(0.8, 0.85, 1.0); starHalo.renderOrder = 5; starsGrp.add(starHalo);
    /* his feet, like burnished brass refined in a furnace */
    const feetMat = new THREE.ShaderMaterial({ uniforms: { uTime: U.uTime, uForm: U.uForm, uH: U.uH, uScale: U.uScale, uOrigin: U.uOrigin, uHeat: { value: 1 } },
      vertexShader: 'varying vec3 vN,vV,vW; void main(){ vN=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.0); vV=-mv.xyz; vW=(modelMatrix*vec4(position,1.0)).xyz; gl_Position=projectionMatrix*mv; }',
      fragmentShader: GLSL_NOISE + 'uniform float uTime,uForm,uH,uScale,uHeat; uniform vec3 uOrigin; varying vec3 vN,vV,vW; void main(){ float h=(vW.y-uOrigin.y)/uScale/uH; if(uForm*1.2-h<0.0) discard; float n=snoise(vec3(vW.x*7.0,vW.y*6.0-uTime*0.9,vW.z*7.0))*0.5+0.5; float n2=snoise(vec3(vW.x*19.0,vW.y*13.0+uTime*0.6,vW.z*19.0))*0.5+0.5; float ndv=clamp(dot(normalize(vN),normalize(vV)),0.0,1.0); vec3 hot=mix(vec3(1.0,0.2,0.03),vec3(1.0,0.72,0.3),n*0.8+n2*0.35); hot=mix(hot,vec3(1.0,0.93,0.7),pow(ndv,3.0)*0.55); gl_FragColor=vec4(hot*(0.85+0.7*n)*uHeat,1.0); }' });
    const feet = [-1, 1].map((s) => { const f = new THREE.Mesh(new THREE.SphereGeometry(0.09, 24, 16), feetMat); f.scale.set(1.75, 0.62, 0.9); f.position.set(0.1, 0.17, s * 0.11); g.add(f); return f; });
    const footGlow = lib.orb(1.0, 0.4, 0.08); footGlow.renderOrder = 5; footGlow.position.set(0.1, 0.15, 0); g.add(footGlow);
    /* the face, like the sun at its brightest; and the halo of the whole */
    const faceGlow = lib.orb(1.0, 0.96, 0.86); faceGlow.renderOrder = 8; faceGlow.position.set(0.12, 1.81, 0); g.add(faceGlow);
    const faceStar = lib.star(1, 0.97, 0.9); faceStar.renderOrder = 9; faceStar.position.copy(faceGlow.position); g.add(faceStar);
    [faceGlow, faceStar].forEach((sp) => { sp.material.depthTest = false; });
    eyes.forEach((e) => { [e.halo, e.core].concat(e.tongues).forEach((sp) => { sp.material.depthTest = false; }); });
    const aura = lib.orb(1.0, 0.78, 0.42); aura.renderOrder = 2; aura.position.set(0, 1.1, 0); g.add(aura);

    const tmp = new V3(), faceWorld = new V3(), mouthWorld = new V3(), handWorld = new V3();
    /* (ep 5) the right arm can reach: target = hand position in the figure's own unscaled space, amt 0 = held out (as in Ep 4), 1 = at target.
       Two-bone solve; the bones stretch a little if the target is far, so the hand always arrives. */
    const aS = new V3(0, 1.53, 0.27), aE0 = new V3(0.08, 1.22, 0.4), aW0 = new V3(0.44, 1.34, 0.5), aL1 = aS.distanceTo(aE0), aL2 = aE0.distanceTo(aW0);
    const aUp = new V3(0, 1, 0), aA = new V3(), aB = new V3(), aD = new V3(), aP = new V3(), aE = new V3(), aW = new V3(), aQ = new THREE.Quaternion();
    const aPlace = (m, A, B, len) => { aD.copy(B).sub(A); const L = aD.length(); m.position.copy(A).add(B).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(aUp, aD.multiplyScalar(1 / Math.max(L, 1e-5))); m.scale.set(1, L / len, 1); };
    function reachRight(target, amt) {
      aW.copy(aW0).lerp(target, clamp(amt));
      aD.copy(aW).sub(aS); let d = aD.length(); const dir = aD.clone().multiplyScalar(1 / Math.max(d, 1e-5));
      const stretch = Math.max(1, d / (aL1 + aL2 - 0.02)), l1 = aL1 * stretch, l2 = aL2 * stretch; d = Math.min(d, l1 + l2 - 0.012);
      const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d), hh = Math.sqrt(Math.max(0, l1 * l1 - a * a));
      aP.set(0.22, -1, 0.5); aP.addScaledVector(dir, -aP.dot(dir)).normalize();
      aE.copy(aS).addScaledVector(dir, a).addScaledVector(aP, hh);
      aW.copy(aS).addScaledVector(dir, d);
      aPlace(armU, aS, aE, aL1); aPlace(armF, aE, aW, aL2);
      hR.position.copy(aW).add(aD.set(0.07, 0.015, 0.0).multiplyScalar(1 - 0.0));
      starsGrp.position.copy(hR.position).add(aD.set(0, 0.26, 0));
    }
    function update(t, k) {
      k = Object.assign({ form: 1, eyes: 0, stars: 0, sword: 0, face: 0.3, blaze: 0, wind: 0.3, aura: 1 }, k || {});
      root.updateMatrixWorld(true);
      U.uTime.value = t; U.uForm.value = k.form; U.uBlaze.value = k.blaze; U.uOrigin.value.setFromMatrixPosition(root.matrixWorld);
      shells.forEach((sh) => { sh.material.uniforms.uAmt.value = 1 + 1.2 * k.blaze; });
      /* the robe and hem move like something living */
      for (let i = 0; i < rp.count; i++) {
        const y = rb[i * 3 + 1], x = rb[i * 3], z = rb[i * 3 + 2], kk = Math.pow(Math.max(0, 1 - y / 1.1), 1.7), a = Math.atan2(z, x);
        const sw = k.wind * 0.1 * kk * (0.6 + 0.4 * Math.sin(t * 1.9 + a * 3 + y * 3)); const br = 1 + 0.018 * Math.sin(t * 1.3 + y * 5) * kk;
        rp.setXYZ(i, x * br - sw * 0.6, y, z * br);
      }
      rp.needsUpdate = true;
      /* hair: white wool, lifting a little */
      const pa = hGeo.attributes.position;
      strips.forEach((s, si) => {
        for (let r = 0; r <= HR; r++) {
          const f = r / HR, wob = 0.6 + 0.4 * Math.sin(t * 1.9 + s.ph + f * 4);
          tmp.copy(s.root).addScaledVector(s.out, f * 0.075); tmp.y -= f * s.len; tmp.x -= k.wind * f * f * 0.16 * wob; tmp.z += Math.sin(t * 2.4 + s.ph + f * 5) * 0.012 * f;
          const w = s.w * (1 - f * 0.55) * 0.5; pa.setXYZ(s.start + r * 2, tmp.x, tmp.y, tmp.z - w); pa.setXYZ(s.start + r * 2 + 1, tmp.x, tmp.y, tmp.z + w);
        }
      });
      pa.needsUpdate = true; hGeo.computeBoundingSphere();
      /* eyes */
      eyes.forEach((e, ei) => {
        const fl = 0.85 + 0.15 * Math.sin(t * 13 + ei * 2) * Math.sin(t * 7.3 + ei), kE = k.eyes;
        e.halo.scale.set(0.34 * kE * fl, 0.22 * kE * fl, 1); e.halo.material.opacity = clamp(kE);
        e.core.scale.set(0.15 * kE, 0.07 * kE * fl, 1); e.core.material.opacity = clamp(kE * 1.5); e.core.material.rotation = 0;
        e.tongues.forEach((f, q) => { const ph = t * (9 + q * 2.7) + ei * 1.9 + q * 2.2, lf = 0.7 + 0.3 * Math.sin(ph); f.scale.set(0.05 * kE * lf, (0.17 + 0.05 * q) * kE * (0.7 + 0.5 * Math.sin(ph * 0.7 + 1)), 1); f.material.rotation = (q - 1) * 0.42 + 0.12 * Math.sin(ph * 0.5); f.material.opacity = clamp(kE * 1.4); f.position.set(0, 0.005, (q - 1) * 0.022); });
      });
      /* sword */
      const sg = k.sword; blade.visible = sg > 0.001; bladeGroup.scale.set(Math.max(0.001, sg), 1, 1); bladeMat.uniforms.uInt.value = 1 + 0.5 * k.blaze;
      bladeGlow.position.set(0.6, 0, 0); bladeGlow.scale.set(1.5 * sg, 0.4 * sg, 1); bladeGlow.material.opacity = clamp(sg * 0.8);
      tipStar.position.set(1.25, 0, 0); tipStar.scale.set(0.32 * sg, 0.32 * sg, 1); tipStar.material.opacity = clamp(sg); tipStar.material.rotation = t * 0.5;
      /* stars: seven, kindled one by one */
      stars.forEach((sp, i) => {
        const a = t * 0.45 + (i / 7) * 6.2832, r = 0.17 + 0.03 * Math.sin(t + i), ig = clamp(k.stars - i), pop = ig > 0 && ig < 1 ? 1 + 1.2 * Math.sin(Math.PI * ig) : 1, tw = 0.88 + 0.12 * Math.sin(t * 5 + i * 2.2);
        sp.position.set(Math.cos(a) * r, 0.05 * Math.sin(a * 2 + i) + 0.04 * Math.sin(t * 0.9 + i), Math.sin(a) * r);
        const sz = 0.27 * ig * pop * tw; sp.scale.set(sz, sz, 1); sp.material.opacity = clamp(ig * 1.5); sp.material.rotation = t * 0.2 * (i % 2 ? 1 : -1);
      });
      const sh = 0.55 * clamp(k.stars / 7) * (0.9 + 0.1 * Math.sin(t * 2)); starHalo.scale.set(sh, sh, 1); starHalo.material.opacity = clamp(k.stars / 7);
      /* feet */
      const heat = 0.9 + 0.12 * Math.sin(t * 3.3); feetMat.uniforms.uHeat.value = heat * (1 + 0.6 * k.blaze);
      footGlow.scale.set(0.9, 0.5, 1); footGlow.material.opacity = 0.3 * clamp(k.form * 1.4 - 0.2);
      /* face as the sun */
      const fb = k.face, fl2 = 0.95 + 0.05 * Math.sin(t * 6);
      faceGlow.scale.set((0.4 + 7 * fb * fb * fb) * fl2, (0.4 + 7 * fb * fb * fb) * fl2, 1); faceGlow.material.opacity = clamp(0.25 + fb * 1.6);
      faceStar.scale.set((0.1 + 5.5 * fb * fb) * fl2, (0.1 + 5.5 * fb * fb) * fl2, 1); faceStar.material.opacity = clamp(fb * 1.8 - 0.25); faceStar.material.rotation = t * 0.06;
      aura.scale.set(1.9 * k.aura, 3.4 * k.aura, 1); aura.material.opacity = clamp(0.16 * clamp(k.form * 1.5)) * (1 + 0.5 * k.blaze);
      /* world anchors for the camera and effects */
      faceWorld.set(0.12, 1.81, 0).multiplyScalar(S).applyMatrix4(root.matrixWorld);
      mouthWorld.set(0.1, 1.745, 0).multiplyScalar(S).applyMatrix4(root.matrixWorld);
      handWorld.copy(starsGrp.position).multiplyScalar(S).applyMatrix4(root.matrixWorld);
    }
    update(0, { form: 1 });
    return { group: root, update, reachRight, scale: S, height: 2.05 * S, face: faceWorld, mouth: mouthWorld, hand: handWorld, parts: { robe, sash, head, hair, eyes, blade, bladeGroup, stars: starsGrp, feet, faceGlow, aura, hL, handR: hR } };
  };

  /*@@EP4-END@@*/

  /*@@EP5-BEGIN@@*/
  /* ====================================================================
   *  PIECES FIRST USED IN EPISODE 5
   *  lib.keys (the keys of Death and of Hades) · lib.cityLights (a city seen as lit windows + dark roofs)
   *  (lib.christ gained .reachRight(target, amt) for the right hand laid on John)
   * ================================================================== */
  /* a ring with two keys: one of bright gold, one of dark iron. ~0.2 high, hangs down from y=0. update(t, k): k = 0..1 visible, glint = 0..1 star flash */
  lib.keys = function (env, o) {
    o = o || {}; const group = new THREE.Group(), swing = new THREE.Group(); group.add(swing);
    const gold = new THREE.MeshStandardMaterial({ color: Aura.col(0xf2c04e), roughness: 0.22, metalness: 0.75, emissive: new THREE.Color(0.32, 0.17, 0.02) });
    const iron = new THREE.MeshStandardMaterial({ color: Aura.col(0x2b2733), roughness: 0.3, metalness: 0.85, emissive: new THREE.Color(0.05, 0.03, 0.09) });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.034, 0.0055, 10, 36), gold); ring.position.y = -0.032; swing.add(ring);
    const makeKey = (mat, ang, len) => {
      const k = new THREE.Group(); k.rotation.z = ang; k.position.y = -0.06; swing.add(k);
      const bow = new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.0065, 8, 24), mat); bow.position.y = -0.016; k.add(bow);
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.0042, 0.0042, len, 8), mat); shaft.position.y = -0.04 - len / 2; k.add(shaft);
      for (let i = 0; i < 3; i++) { const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.0065, 0.0075), mat); tooth.position.set(0.0135, -0.04 - len + 0.005 + i * 0.0115, 0); k.add(tooth); }
      return k;
    };
    const kg = makeKey(gold, 0.2, 0.15), ki = makeKey(iron, -0.22, 0.17); ki.scale.set(-1, 1, 1);
    const g1 = lib.star(1.0, 0.9, 0.62), g2 = lib.star(0.78, 0.7, 1.0); [g1, g2].forEach((sp) => { sp.renderOrder = 8; sp.material.depthTest = false; group.add(sp); });
    const halo = lib.orb(1.0, 0.72, 0.3); halo.renderOrder = 5; halo.position.y = -0.1; group.add(halo);
    function update(t, k, glint) {
      k = k === undefined ? 1 : k; glint = glint || 0; group.visible = k > 0.001; group.scale.setScalar(Math.max(0.001, k));
      swing.rotation.z = 0.07 * Math.sin(t * 1.7) + 0.03 * Math.sin(t * 3.9); swing.rotation.x = 0.04 * Math.sin(t * 1.3 + 1);
      const fl = 0.8 + 0.2 * Math.sin(t * 6.1);
      g1.position.set(0.03, -0.205, 0); g1.scale.setScalar((0.03 + 0.2 * glint) * fl); g1.material.opacity = clamp(glint * 1.6); g1.material.rotation = t * 0.6;
      g2.position.set(-0.034, -0.225, 0); g2.scale.setScalar((0.02 + 0.14 * glint) * fl); g2.material.opacity = clamp(glint * 1.3 - 0.1); g2.material.rotation = -t * 0.5;
      halo.scale.set(0.34, 0.34, 1); halo.material.opacity = 0.5 * clamp(k);
    }
    update(0, 1, 0);
    return { group, update, swing };
  };

  /* a city from a distance: dark roofs and scattered warm lit windows. radius in metres; hFn(x,z)->ground y (local to group) */
  lib.cityLights = function (o) {
    o = o || {}; const R = o.radius || 24, n = o.count || 160, nb = o.buildings || 60, hFn = o.height || (() => 0);
    lib.reseed(o.seed || 909); const group = new THREE.Group();
    const P = new Float32Array(n * 3), Cl = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const a = rnd() * 6.283, r = Math.pow(rnd(), 0.75) * R, x = Math.cos(a) * r, z = Math.sin(a) * r * 0.8, w = 0.5 + rnd() * 0.5, c = 0.65 + rnd() * 0.35;
      P.set([x, hFn(x, z) + 0.7 + rnd() * 2.2, z], i * 3); Cl.set([1.0 * c * w, 0.62 * c * w, 0.26 * c * w], i * 3);
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(P, 3)); g.setAttribute('color', new THREE.BufferAttribute(Cl, 3));
    const pm = new THREE.PointsMaterial({ map: lib.glowTex(), size: o.size || 3.4, sizeAttenuation: true, vertexColors: true, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true });
    const pts = new THREE.Points(g, pm); pts.frustumCulled = false; pts.renderOrder = 4; group.add(pts);
    const bm = new THREE.MeshStandardMaterial({ color: Aura.col(0x3a2c22), roughness: 0.95, metalness: 0, emissive: new THREE.Color(0.02, 0.012, 0.007) });
    const inst = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), bm, nb), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), sc = new V3(), ps = new V3();
    for (let i = 0; i < nb; i++) {
      const a = rnd() * 6.283, r = Math.pow(rnd(), 0.8) * R * 0.92, x = Math.cos(a) * r, z = Math.sin(a) * r * 0.8, w = 1.6 + rnd() * 3.2, h = 1.2 + rnd() * 3.4 * (1 - r / R * 0.6);
      e.set(0, rnd() * 3.14, 0); q.setFromEuler(e); sc.set(w, h, w * (0.7 + rnd() * 0.6)); ps.set(x, hFn(x, z) + h / 2, z); m4.compose(ps, q, sc); inst.setMatrixAt(i, m4);
    }
    group.add(inst);
    const glow = lib.orb(1.0, 0.55, 0.2); glow.renderOrder = 3; glow.scale.set(R * 3.6, R * 1.5, 1); glow.position.y = 3; group.add(glow);
    function update(amt) { amt = clamp(amt === undefined ? 1 : amt); pm.opacity = amt; glow.material.opacity = 0.35 * amt; group.visible = amt > 0.001; }
    return { group, update, points: pts, glow };
  };
  /*@@EP5-END@@*/
})();
