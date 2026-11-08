const THREE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';

// The CDN build exposes Three.js as a global; its types are not installed in this project.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ThreeLib = any;

let threeLoader: Promise<ThreeLib> | null = null;

export function loadThree(): Promise<ThreeLib> {
  const w = window as unknown as { THREE?: ThreeLib };
  if (w.THREE) return Promise.resolve(w.THREE);
  if (!threeLoader) {
    threeLoader = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = THREE_URL;
      script.async = true;
      script.onload = () => (w.THREE ? resolve(w.THREE) : reject(new Error('Three.js missing')));
      script.onerror = () => reject(new Error('Three.js failed to load'));
      document.head.appendChild(script);
    });
  }
  return threeLoader;
}
