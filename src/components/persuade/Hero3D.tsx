import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '@/hooks/useInView';
import { buildDrive } from '@/lib/three/buildDrive';
import { loadThree, type ThreeLib } from '@/lib/three/loadThree';

const BASE_TILT = 0.85;

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
  } catch {
    return false;
  }
}

function mountScene(THREE: ThreeLib, canvas: HTMLCanvasElement, container: HTMLElement): () => void {
  const reduceMotion = prefersReducedMotion();
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.z = 7.5;

  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const key = new THREE.DirectionalLight(0xffffff, 1.0);
  key.position.set(3, 5, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xa5b4fc, 0.6);
  rim.position.set(-4, 3, -3);
  scene.add(rim);
  const warm = new THREE.PointLight(0x84cc16, 1.1, 12);
  warm.position.set(-3, 2, 2);
  scene.add(warm);

  const drive = buildDrive(THREE);
  drive.scale.setScalar(1.1);
  drive.rotation.x = BASE_TILT;
  scene.add(drive);

  const pointer = { x: 0, y: 0 };
  const onPointerMove = (event: PointerEvent) => {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
  };
  const onOrientation = (event: DeviceOrientationEvent) => {
    pointer.x = Math.max(-1, Math.min(1, (event.gamma ?? 0) / 30));
    pointer.y = Math.max(-1, Math.min(1, ((event.beta ?? 0) - 45) / 30));
  };
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('deviceorientation', onOrientation);

  const resize = () => {
    const { clientWidth, clientHeight } = container;
    renderer.setSize(clientWidth, clientHeight, false);
    camera.aspect = clientWidth / Math.max(clientHeight, 1);
    camera.updateProjectionMatrix();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(container);
  resize();

  let frame = 0;
  const render = (time: number) => {
    const t = time / 1000;
    drive.rotation.y += reduceMotion ? 0 : 0.005;
    drive.rotation.x += (BASE_TILT + pointer.y * 0.3 - drive.rotation.x) * 0.05;
    drive.rotation.z += (-pointer.x * 0.15 - drive.rotation.z) * 0.05;
    drive.position.y = reduceMotion ? 0 : Math.sin(t * 1.2) * 0.1;
    renderer.render(scene, camera);
    if (!reduceMotion) frame = requestAnimationFrame(render);
  };
  frame = requestAnimationFrame(render);

  return () => {
    cancelAnimationFrame(frame);
    observer.disconnect();
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('deviceorientation', onOrientation);
    renderer.dispose();
  };
}

function CssDriveFallback() {
  return (
    <div className="perspective-1000 flex h-full w-full items-center justify-center" aria-hidden="true">
      <div className="relative h-40 w-64 preserve-3d animate-tilt-spin">
        <div className="absolute inset-0 rounded-2xl bg-primary-800 shadow-2xl preserve-3d" style={{ transform: 'translateZ(20px)' }}>
          <div className="absolute inset-x-8 top-1/2 h-14 -translate-y-1/2 rounded-md bg-slate-100" />
          <div className="absolute bottom-5 left-8 h-3 w-16 rounded bg-slate-500" />
          <div className="absolute bottom-5 right-8 h-3 w-3 rounded-full bg-accent-400 shadow-[0_0_12px_#84cc16]" />
        </div>
        <div
          className="absolute inset-y-0 right-0 w-10 rounded-r-2xl bg-primary-700"
          style={{ transform: 'rotateY(90deg) translateZ(128px)', transformOrigin: 'right center' }}
        />
      </div>
    </div>
  );
}

type Status = 'loading' | 'ready' | 'fallback';

export default function Hero3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    if (!hasWebGL()) {
      setStatus('fallback');
      return;
    }
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    loadThree()
      .then((THREE) => {
        if (cancelled || !canvasRef.current || !containerRef.current) return;
        cleanup = mountScene(THREE, canvasRef.current, containerRef.current);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('fallback');
      });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label="Оновлений SSD-накопичувач з радіатором, що повільно обертається"
      className="glass relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-[2rem] shadow-2xl shadow-primary-900/20"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-accent-100/60 via-transparent to-primary-100/60 dark:from-accent-500/10 dark:to-primary-500/20" />
      <canvas
        ref={canvasRef}
        className={`relative h-full w-full ${status === 'ready' ? '' : 'hidden'}`}
      />
      {status === 'fallback' && <div className="absolute inset-0"><CssDriveFallback /></div>}
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-700 dark:border-primary-700 dark:border-t-accent-400" />
        </div>
      )}
    </div>
  );
}
