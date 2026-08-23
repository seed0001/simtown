import * as THREE from 'three'

// Ground color comes from a real fragment shader, not a material tint: two
// layered fbm noise fields pick between grass, dirt, and dry-patch tones per
// fragment so the field reads as varied terrain instead of a flat color.
// Grafted onto meshStandardMaterial via onBeforeCompile so it still lights
// and shadows like everything else in the scene.

const NOISE_GLSL = /* glsl */ `
  float groundHash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float groundNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = groundHash(i);
    float b = groundHash(i + vec2(1.0, 0.0));
    float c = groundHash(i + vec2(0.0, 1.0));
    float d = groundHash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  float groundFbm(vec2 p) {
    float v = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 4; i++) {
      v += amp * groundNoise(p);
      p *= 2.0;
      amp *= 0.5;
    }
    return v;
  }

  vec3 groundColor(vec2 worldXZ) {
    float large = groundFbm(worldXZ * 0.025);
    float fine = groundFbm(worldXZ * 0.18);

    vec3 grassDeep = vec3(0.184, 0.325, 0.129);
    vec3 grassLight = vec3(0.396, 0.510, 0.196);
    vec3 dryPatch = vec3(0.588, 0.529, 0.263);
    vec3 dirt = vec3(0.365, 0.271, 0.153);

    vec3 col = mix(grassDeep, grassLight, large);
    col = mix(col, dryPatch, smoothstep(0.58, 0.88, large) * (0.5 + fine * 0.6));
    col = mix(col, dirt, smoothstep(0.22, 0.0, large) * 0.65);
    col += (fine - 0.5) * 0.05;
    return col;
  }
`

export function createGroundMaterial(): THREE.MeshStandardMaterial {
  const material = new THREE.MeshStandardMaterial({ roughness: 1, metalness: 0 })

  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\nvarying vec3 vGroundWorldPos;`)
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>\nvGroundWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;`,
      )

    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\nvarying vec3 vGroundWorldPos;\n${NOISE_GLSL}`)
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>\ndiffuseColor.rgb = groundColor(vGroundWorldPos.xz);`,
      )
  }

  return material
}
