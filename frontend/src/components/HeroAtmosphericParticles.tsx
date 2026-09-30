import React, { useMemo } from 'react';

interface Particle {
  id: number;
  top: string;
  left: string;
  size: number;
  opacity: number;
  duration: string;
  delay: string;
  animType: 1 | 2 | 3;
  desktopOnly?: boolean;
}

/**
 * Deterministic atmospheric floating particles for SANGAM hero background.
 * Represents atmospheric field data points / meteorological simulation tracers.
 * Fixed deterministic coordinates avoid layout shifts or hydration mismatches.
 */
const DETERMINISTIC_PARTICLES: Particle[] = [
  // Upper atmospheric field (sparse)
  { id: 1, top: '8%', left: '12%', size: 2.5, opacity: 0.28, duration: '14s', delay: '-3s', animType: 1 },
  { id: 2, top: '15%', left: '26%', size: 1.8, opacity: 0.20, duration: '18s', delay: '-7s', animType: 2 },
  { id: 3, top: '6%', left: '74%', size: 2.2, opacity: 0.22, duration: '16s', delay: '-11s', animType: 3 },
  { id: 4, top: '12%', left: '88%', size: 3.0, opacity: 0.30, duration: '20s', delay: '-5s', animType: 1 },

  // Mid upper-left & upper-right flanks
  { id: 5, top: '24%', left: '8%', size: 2.0, opacity: 0.25, duration: '15s', delay: '-9s', animType: 2 },
  { id: 6, top: '28%', left: '19%', size: 1.5, opacity: 0.18, duration: '22s', delay: '-4s', animType: 3, desktopOnly: true },
  { id: 7, top: '22%', left: '81%', size: 2.4, opacity: 0.26, duration: '17s', delay: '-8s', animType: 1 },
  { id: 8, top: '30%', left: '92%', size: 1.8, opacity: 0.22, duration: '19s', delay: '-13s', animType: 2 },

  // Mid field (surrounding hero core, maintaining negative space around central wordmark)
  { id: 9, top: '42%', left: '14%', size: 3.2, opacity: 0.32, duration: '16s', delay: '-2s', animType: 3 },
  { id: 10, top: '46%', left: '22%', size: 2.0, opacity: 0.18, duration: '24s', delay: '-14s', animType: 1, desktopOnly: true },
  { id: 11, top: '38%', left: '78%', size: 2.2, opacity: 0.24, duration: '18s', delay: '-6s', animType: 2 },
  { id: 12, top: '45%', left: '86%', size: 3.0, opacity: 0.28, duration: '21s', delay: '-10s', animType: 3 },

  // Outer mid flanks
  { id: 13, top: '55%', left: '6%', size: 2.4, opacity: 0.22, duration: '19s', delay: '-12s', animType: 1 },
  { id: 14, top: '58%', left: '16%', size: 1.8, opacity: 0.16, duration: '23s', delay: '-1s', animType: 2, desktopOnly: true },
  { id: 15, top: '52%', left: '84%', size: 2.6, opacity: 0.26, duration: '15s', delay: '-7s', animType: 3 },
  { id: 16, top: '60%', left: '94%', size: 2.0, opacity: 0.20, duration: '20s', delay: '-15s', animType: 1 },

  // Lower flanks & transitions toward benchmark cards
  { id: 17, top: '70%', left: '11%', size: 2.8, opacity: 0.26, duration: '17s', delay: '-4s', animType: 2 },
  { id: 18, top: '76%', left: '24%', size: 2.0, opacity: 0.18, duration: '25s', delay: '-11s', animType: 3, desktopOnly: true },
  { id: 19, top: '68%', left: '76%', size: 2.2, opacity: 0.22, duration: '16s', delay: '-8s', animType: 1 },
  { id: 20, top: '74%', left: '89%', size: 3.2, opacity: 0.30, duration: '22s', delay: '-3s', animType: 2 },

  // Bottom atmospheric boundary
  { id: 21, top: '88%', left: '18%', size: 2.0, opacity: 0.20, duration: '18s', delay: '-13s', animType: 3, desktopOnly: true },
  { id: 22, top: '85%', left: '32%', size: 1.6, opacity: 0.15, duration: '20s', delay: '-6s', animType: 1, desktopOnly: true },
  { id: 23, top: '90%', left: '68%', size: 1.8, opacity: 0.16, duration: '24s', delay: '-9s', animType: 2, desktopOnly: true },
  { id: 24, top: '86%', left: '82%', size: 2.6, opacity: 0.24, duration: '19s', delay: '-2s', animType: 3 },

  // Subtle peripheral beacons
  { id: 25, top: '35%', left: '3%', size: 1.8, opacity: 0.18, duration: '21s', delay: '-16s', animType: 1, desktopOnly: true },
  { id: 26, top: '66%', left: '97%', size: 2.2, opacity: 0.22, duration: '17s', delay: '-5s', animType: 2, desktopOnly: true },
];

export const HeroAtmosphericParticles: React.FC = () => {
  const particles = useMemo(() => DETERMINISTIC_PARTICLES, []);

  return (
    <div
      className="hero-atmospheric-particles"
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className={`hero-atmospheric-dot anim-drift-${p.animType} ${p.desktopOnly ? 'desktop-only-dot' : ''}`}
          style={{
            position: 'absolute',
            top: p.top,
            left: p.left,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            animationDuration: p.duration,
            animationDelay: p.delay,
          }}
        />
      ))}
    </div>
  );
};
