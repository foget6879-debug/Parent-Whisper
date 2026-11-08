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
      </div>

      <div className="city-clouds" aria-hidden="true">
        <span className="city-cloud city-cloud--one" />
        <span className="city-cloud city-cloud--two" />
        <span className="city-cloud city-cloud--three" />
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
