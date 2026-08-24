import * as THREE from 'three'

// Weathering multiplies a material's existing diffuse color with grime
// blotches (darkened patches, biased to pool near the ground) and thin
// crack lines, via layered fbm noise injected through onBeforeCompile — the
// same technique groundMaterial.ts uses for terrain, but blended on top of
// whatever base color a mesh already has instead of replacing it, so each
// building keeps its own body/roof/accent hues.

const NOISE_GLSL = /* glsl */ `
  float weatherHash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float weatherNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = weatherHash(i);
    float b = weatherHash(i + vec2(1.0, 0.0));
    float c = weatherHash(i + vec2(0.0, 1.0));
    float d = weatherHash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  float weatherFbm(vec2 p) {
    float v = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 4; i++) {
      v += amp * weatherNoise(p);
      p *= 2.0;
      amp *= 0.5;
    }
    return v;
  }
`

type WeatheringOptions = {
  /** world-unit scale of the grime blotch pattern; smaller = larger blotches */
  grimeScale?: number
  /** world-unit scale of the crack pattern; smaller = larger cracks */
  crackScale?: number
  /** 0-1, how dark grime blotches get */
  grimeStrength?: number
  /** 0-1, how dark crack lines get */
  crackStrength?: number
  /** how much grime fades out per world-unit of height above the ground */
  groundBias?: number
}

function makeWeathering(opts: WeatheringOptions = {}) {
  const grimeScale = opts.grimeScale ?? 0.5
  const crackScale = opts.crackScale ?? 3.5
  const grimeStrength = opts.grimeStrength ?? 0.35
  const crackStrength = opts.crackStrength ?? 0.5
  const groundBias = opts.groundBias ?? 0.08

  return (shader: THREE.WebGLProgramParametersWithUniforms) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\nvarying vec3 vWeatherWorldPos;`)
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>\nvWeatherWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;`,
      )

    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\nvarying vec3 vWeatherWorldPos;\n${NOISE_GLSL}`)
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
        {
          vec3 wp = vWeatherWorldPos;
          float grime = weatherFbm(wp.xz * ${grimeScale.toFixed(4)} + wp.y * 0.2);
          float streak = weatherFbm(vec2(wp.x * ${(grimeScale * 3.0).toFixed(4)}, wp.y * 0.35));
          float grimeAmount = clamp(grime * 0.6 + streak * 0.5, 0.0, 1.0);
          grimeAmount *= clamp(1.0 - wp.y * ${groundBias.toFixed(4)}, 0.35, 1.0);
          diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * 0.4, grimeAmount * ${grimeStrength.toFixed(4)});

          float crackNoise = weatherFbm(wp.xz * ${crackScale.toFixed(4)} + wp.y * ${crackScale.toFixed(4)});
          float crack = smoothstep(0.47, 0.5, crackNoise) - smoothstep(0.5, 0.53, crackNoise);
          diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * 0.15, crack * ${crackStrength.toFixed(4)});
        }`,
      )
  }
}

/** Building walls: moderate grime that pools near the ground, clear crack lines. */
export const wallWeathering = makeWeathering({
  grimeScale: 0.5,
  crackScale: 3.5,
  grimeStrength: 0.35,
  crackStrength: 0.55,
  groundBias: 0.1,
})

/** Roofs and canopies: heavier grime (sun/rain exposure), subtler cracks. */
export const roofWeathering = makeWeathering({
  grimeScale: 0.7,
  crackScale: 4.5,
  grimeStrength: 0.4,
  crackStrength: 0.3,
  groundBias: 0.02,
})

/** Road asphalt: fine dirt blotches, dense cracking. */
export const roadWeathering = makeWeathering({
  grimeScale: 0.15,
  crackScale: 0.6,
  grimeStrength: 0.3,
  crackStrength: 0.6,
  groundBias: 0,
})

/** Sidewalk concrete: lighter dirt, slab-scale cracks. */
export const sidewalkWeathering = makeWeathering({
  grimeScale: 0.2,
  crackScale: 0.8,
  grimeStrength: 0.25,
  crackStrength: 0.5,
  groundBias: 0,
})
