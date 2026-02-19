import { useEffect, useRef } from 'react';
import { Renderer, Program, Mesh, Color, Triangle } from 'ogl';

const VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `#version 300 es
precision highp float;

uniform float uTime;
uniform float uAmplitude;
uniform vec3 uColorStops[3];
uniform vec2 uResolution;
uniform float uBlend;

out vec4 fragColor;

vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v){
  const vec4 C = vec4(
      0.211324865405187, 0.366025403784439,
      -0.577350269189626, 0.024390243902439
  );
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);

  vec3 p = permute(
      permute(i.y + vec3(0.0, i1.y, 1.0))
    + i.x + vec3(0.0, i1.x, 1.0)
  );

  vec3 m = max(
      0.5 - vec3(
          dot(x0, x0),
          dot(x12.xy, x12.xy),
          dot(x12.zw, x12.zw)
      ), 
      0.0
  );
  m = m * m;
  m = m * m;

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);

  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

struct ColorStop {
  vec3 color;
  float position;
};

#define COLOR_RAMP(colors, factor, finalColor) {              \
  int index = 0;                                            \
  for (int i = 0; i < 2; i++) {                               \
     ColorStop currentColor = colors[i];                    \
     bool isInBetween = currentColor.position <= factor;    \
     index = int(mix(float(index), float(i), float(isInBetween))); \
  }                                                         \
  ColorStop currentColor = colors[index];                   \
  ColorStop nextColor = colors[index + 1];                  \
  float range = nextColor.position - currentColor.position; \
  float lerpFactor = (factor - currentColor.position) / range; \
  finalColor = mix(currentColor.color, nextColor.color, lerpFactor); \
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
    vec2 p = uv;
    p.x *= uResolution.x / max(1.0, uResolution.y);
  float topFlow = 1.0 - uv.y;
  
  ColorStop colors[3];
  colors[0] = ColorStop(uColorStops[0], 0.0);
  colors[1] = ColorStop(uColorStops[1], 0.5);
  colors[2] = ColorStop(uColorStops[2], 1.0);
  
    vec3 rampNear;
    vec3 rampMid;
    vec3 rampFar;
    COLOR_RAMP(colors, clamp(uv.x + snoise(vec2(p.x * 0.6 - uTime * 0.12, p.y * 0.25)) * 0.12, 0.0, 1.0), rampNear);
    COLOR_RAMP(colors, clamp(uv.x + 0.18 + snoise(vec2(p.x * 0.45 + uTime * 0.07, p.y * 0.2)) * 0.1, 0.0, 1.0), rampMid);
    COLOR_RAMP(colors, clamp(uv.x - 0.2 + snoise(vec2(p.x * 0.35 - uTime * 0.05, p.y * 0.18)) * 0.08, 0.0, 1.0), rampFar);
  
    float waveNear = snoise(vec2(p.x * 1.4 + uTime * 0.14, topFlow * 0.5 + uTime * 0.02));
    float waveMid = snoise(vec2(p.x * 1.0 - uTime * 0.08, topFlow * 0.35 - uTime * 0.015));
    float waveFar = snoise(vec2(p.x * 0.65 + uTime * 0.05, topFlow * 0.25));

    float curtainNear = exp(waveNear * 0.85 * uAmplitude);
    float curtainMid = exp(waveMid * 0.65 * uAmplitude);
    float curtainFar = exp(waveFar * 0.5 * uAmplitude);

    float layerNear = (topFlow * 2.1 - curtainNear + 0.18);
    float layerMid = (topFlow * 1.7 - curtainMid + 0.3);
    float layerFar = (topFlow * 1.35 - curtainFar + 0.42);

    float nearAlpha = smoothstep(0.07, 0.82, 0.9 - layerNear);
    float midAlpha = smoothstep(0.08, 0.86, 0.95 - layerMid) * 0.72;
    float farAlpha = smoothstep(0.1, 0.9, 1.0 - layerFar) * 0.5;

    vec3 depthColor = rampNear * nearAlpha + rampMid * midAlpha + rampFar * farAlpha;
    float caustic = smoothstep(0.36, 1.0, nearAlpha) * (0.45 + 0.55 * snoise(vec2(p.x * 3.0 + uTime * 0.35, p.y * 1.1)));
    vec3 highlight = depthColor * (0.2 + 0.6 * caustic);

    float depthFade = smoothstep(0.0, 0.85, topFlow);
    vec3 auroraColor = (depthColor + highlight * 0.28) * depthFade;
  
  float midPoint = 0.20;
    float intensity = nearAlpha * 0.9 + midAlpha * 0.72 + farAlpha * 0.55;
    float auroraAlpha = smoothstep(midPoint - uBlend * 0.5, midPoint + uBlend * 0.5, intensity) * depthFade;
  
  fragColor = vec4(auroraColor * auroraAlpha, auroraAlpha);
}
`;

interface AuroraProps {
    colorStops?: string[];
    amplitude?: number;
    blend?: number;
    time?: number;
    speed?: number;
}

export default function Aurora(props: AuroraProps) {
    const { colorStops = ['#5227FF', '#7cff67', '#5227FF'], amplitude = 1.0, blend = 0.5 } = props;
    const propsRef = useRef<AuroraProps>(props);
    propsRef.current = props;

    const ctnDom = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctn = ctnDom.current;
        if (!ctn) return;

        const renderer = new Renderer({
            alpha: true,
            premultipliedAlpha: true,
            antialias: true,
            dpr: Math.min(window.devicePixelRatio, 2)
        });
        const gl = renderer.gl;
        gl.clearColor(0, 0, 0, 0);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.canvas.style.backgroundColor = 'transparent';

        let program: Program | undefined;

        function resize() {
            if (!ctn) return;
            const width = ctn.offsetWidth;
            const height = ctn.offsetHeight;
            renderer.setSize(width, height);
            if (program) {
                program.uniforms.uResolution.value = [width, height];
            }
        }
        window.addEventListener('resize', resize);

        const geometry = new Triangle(gl);
        if (geometry.attributes.uv) {
            delete geometry.attributes.uv;
        }

        const colorStopsArray = colorStops.map(hex => {
            const c = new Color(hex);
            return [c.r, c.g, c.b];
        });

        program = new Program(gl, {
            vertex: VERT,
            fragment: FRAG,
            uniforms: {
                uTime: { value: 0 },
                uAmplitude: { value: amplitude },
                uColorStops: { value: colorStopsArray },
                uResolution: { value: [ctn.offsetWidth, ctn.offsetHeight] },
                uBlend: { value: blend }
            }
        });

        const mesh = new Mesh(gl, { geometry, program });
        ctn.appendChild(gl.canvas);

        let animateId = 0;
        const update = (t: number) => {
            animateId = requestAnimationFrame(update);
            const { time = t * 0.01, speed = 1.0 } = propsRef.current;
            if (program) {
                program.uniforms.uTime.value = time * speed * 0.1;
                program.uniforms.uAmplitude.value = propsRef.current.amplitude ?? 1.0;
                program.uniforms.uBlend.value = propsRef.current.blend ?? blend;
                const stops = propsRef.current.colorStops ?? colorStops;
                program.uniforms.uColorStops.value = stops.map((hex: string) => {
                    const c = new Color(hex);
                    return [c.r, c.g, c.b];
                });
                renderer.render({ scene: mesh });
            }
        };
        animateId = requestAnimationFrame(update);

        resize();

        return () => {
            cancelAnimationFrame(animateId);
            window.removeEventListener('resize', resize);
            if (ctn && gl.canvas.parentNode === ctn) {
                ctn.removeChild(gl.canvas);
            }
            gl.getExtension('WEBGL_lose_context')?.loseContext();
        };
    }, [amplitude]);

    return <div ref={ctnDom} className="w-full h-full" />;
}
