import { useMemo } from 'react';

/**
 * Decorative, constantly-animated city skyline that sits behind the page.
 * Pure CSS transforms/opacity only, so it stays cheap while scrolling.
 */

interface Building {
  key: string;
  grow: number;
  height: number;
  breathe: boolean;
  delay: number;
  duration: number;
  dim: boolean;
  roof: boolean;
  antenna: boolean;
  warm: boolean;
}

interface LayerConfig {
  id: 'far' | 'mid' | 'near';
  seed: number;
  count: number;
  minHeight: number;
  maxHeight: number;
  duration: number;
  height: number;
  reverse?: boolean;
}

const LAYERS: LayerConfig[] = [
  { id: 'far', seed: 11, count: 22, minHeight: 12, maxHeight: 44, duration: 280, height: 30 },
  { id: 'mid', seed: 37, count: 17, minHeight: 24, maxHeight: 70, duration: 200, height: 36, reverse: true },
  { id: 'near', seed: 73, count: 13, minHeight: 40, maxHeight: 100, duration: 140, height: 44 },
];

/** Deterministic PRNG so the skyline is stable between renders. */
function mulberry32(seed: number): () => number {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateBuildings(config: LayerConfig): Building[] {
  const random = mulberry32(config.seed);

  return Array.from({ length: config.count }, (_, index) => {
    const height = config.minHeight + random() * (config.maxHeight - config.minHeight);
    return {
      key: `${config.id}-${index}`,
      grow: 0.7 + random() * 1.9,
      height,
      breathe: random() > 0.45,
      delay: random() * 9,
      duration: 5 + random() * 6,
      dim: random() > 0.82,
      roof: random() > 0.55,
      antenna: height > 78 && random() > 0.4,
      warm: random() > 0.42,
    };
  });
}

const STARS = Array.from({ length: 90 }, (_, index) => {
  const random = mulberry32(1000 + index);
  return {
    key: `star-${index}`,
    left: random() * 100,
    top: random() * 62,
    size: 1 + random() * 1.8,
    delay: random() * 6,
    duration: 3 + random() * 5,
  };
});

interface PlaneConfig {
  id: string;
  top: number;
  width: number;
  duration: number;
  delay: number;
  reverse: boolean;
}

/** Slow, occasional flights across the skyline. */
const PLANES: PlaneConfig[] = [
  { id: 'plane-1', top: 15, width: 64, duration: 58, delay: -18, reverse: false },
  { id: 'plane-2', top: 28, width: 46, duration: 82, delay: -46, reverse: true },
  { id: 'plane-3', top: 7, width: 34, duration: 104, delay: -78, reverse: false },
];

interface MoteConfig {
  id: string;
  left: number;
  top: number;
  size: number;
  duration: number;
  delay: number;
}

const MOTES: MoteConfig[] = [
  { id: 'm1', left: 8, top: 22, size: 4, duration: 14, delay: -3 },
  { id: 'm2', left: 22, top: 38, size: 3, duration: 18, delay: -9 },
  { id: 'm3', left: 41, top: 18, size: 5, duration: 16, delay: -5 },
  { id: 'm4', left: 63, top: 30, size: 3, duration: 20, delay: -12 },
  { id: 'm5', left: 78, top: 16, size: 4, duration: 15, delay: -7 },
  { id: 'm6', left: 88, top: 42, size: 3, duration: 19, delay: -15 },
  { id: 'm7', left: 15, top: 52, size: 3, duration: 22, delay: -1 },
  { id: 'm8', left: 55, top: 46, size: 4, duration: 17, delay: -10 },
];

function CityHalf({ buildings }: { buildings: Building[] }) {
  return (
    <div className="city-half" aria-hidden="true">
      {buildings.map((building) => (
        <span
          key={building.key}
          className={`city-building ${building.warm ? 'city-building--warm' : 'city-building--cool'}${
            building.dim ? ' is-dim' : ''
          }`}
          style={{ flexGrow: building.grow, height: `${building.height}%` }}
        >
          <span
            className={`city-windows${building.breathe ? ' is-lit' : ''}`}
            style={{ animationDelay: `${building.delay}s`, animationDuration: `${building.duration}s` }}
          />
          {building.roof && <span className="city-roof" />}
          {building.antenna && (
            <span className="city-antenna">
              <span className="city-beacon" style={{ animationDelay: `${building.delay}s` }} />
            </span>
          )}
        </span>
      ))}
    </div>
  );
}

export default function CityBackdrop() {
  const layers = useMemo(
    () => LAYERS.map((config) => ({ config, buildings: generateBuildings(config) })),
    [],
  );

  return (
    <div className="city-backdrop" aria-hidden="true">
      <div className="city-sky" />
      <div className="city-moon" />
      <div className="city-stars">
        {STARS.map((star) => (
          <span
            key={star.key}
            className="city-star"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`,
            }}
          />
        ))}
        <span className="city-shooting-star city-shooting-star--one" />
        <span className="city-shooting-star city-shooting-star--two" />
      </div>

      <div className="city-planes" aria-hidden="true">
        {PLANES.map((plane) => (
          <span
            key={plane.id}
            className={`city-plane${plane.reverse ? ' is-reverse' : ''}`}
            style={{
              top: `${plane.top}%`,
              width: `${plane.width}px`,
              animationDuration: `${plane.duration}s`,
              animationDelay: `${plane.delay}s`,
            }}
          >
            <span className="city-plane-craft">
              <span className="city-plane-trail" />
              <svg viewBox="0 0 100 40" className="city-plane-body" aria-hidden="true">
                <g fill="currentColor">
                  <path
                    className="city-plane-fuselage"
                    d="M96 20C92 16.8 86 15.2 78 15L24 15C16 15.2 10 17 7 20C10 23 16 24.8 24 25L78 25C86 24.8 92 23.2 96 20Z"
                  />
                  <path className="city-plane-wing" d="M64 16L34 5L24 5L43 16Z" />
                  <path className="city-plane-wing" d="M64 24L34 35L24 35L43 24Z" />
                  <path className="city-plane-stabilizer" d="M22 17L12 10L6 10L14 17Z" />
                  <path className="city-plane-stabilizer" d="M22 23L12 30L6 30L14 23Z" />
                  <rect className="city-plane-engine" x="42" y="10.6" width="12" height="3.4" rx="1.7" />
                  <rect className="city-plane-engine" x="42" y="26" width="12" height="3.4" rx="1.7" />
                </g>

                <circle className="city-plane-light city-plane-light--port" cx="24" cy="5" r="1.7" />
                <circle className="city-plane-light city-plane-light--starboard" cx="24" cy="35" r="1.7" />
                <circle className="city-plane-light city-plane-light--strobe" cx="7" cy="20" r="1.5" />
                <circle className="city-plane-light city-plane-light--beacon" cx="52" cy="20" r="1.2" />
              </svg>
            </span>
          </span>
        ))}
      </div>

      <div className="city-clouds" aria-hidden="true">
        <span className="city-cloud city-cloud--one" />
        <span className="city-cloud city-cloud--two" />
        <span className="city-cloud city-cloud--three" />
      </div>

      <div className="city-motes" aria-hidden="true">
        {MOTES.map((mote) => (
          <span
            key={mote.id}
            className="city-mote"
            style={{
              left: `${mote.left}%`,
              top: `${mote.top}%`,
              width: `${mote.size}px`,
              height: `${mote.size}px`,
              animationDuration: `${mote.duration}s`,
              animationDelay: `${mote.delay}s`,
            }}
          />
        ))}
      </div>

      {layers.map(({ config, buildings }) => (
        <div
          key={config.id}
          className={`city-layer city-layer--${config.id}`}
          style={{ height: `${config.height}vh` }}
        >
          <div
            className="city-track"
            style={{
              animationDuration: `${config.duration}s`,
              animationDirection: config.reverse ? 'reverse' : 'normal',
            }}
          >
            <CityHalf buildings={buildings} />
            <CityHalf buildings={buildings} />
          </div>
        </div>
      ))}

      <div className="city-haze" />
      <div className="city-street" />
    </div>
  );
}
