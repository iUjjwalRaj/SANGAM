import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { checkBackendHealth } from '../services/api';
import './SANGAMBootScreen.css';

interface SANGAMBootScreenProps {
  onReady: () => void;
  isFastPath?: boolean;
}

interface ContextNode {
  id: string;
  label: string;
  value: string;
  top: string;
  left: string;
}

const CONTEXT_NODES: ContextNode[] = [
  {
    id: 'lead',
    label: 'LEAD TIME',
    value: 'Forecast Horizon',
    top: '24%',
    left: '5%',
  },
  {
    id: 'domain',
    label: 'COORDINATES',
    value: '8°N–37°N · 68°E–97°E',
    top: '44%',
    left: '4%',
  },
  {
    id: 'spread',
    label: 'MODEL SPREAD',
    value: 'Multi-Model Spread (ΔP)',
    top: '64%',
    left: '5%',
  },
  {
    id: 'skill',
    label: 'HISTORICAL SKILL',
    value: 'vs ERA5 reanalysis reference',
    top: '84%',
    left: '6%',
  },
  {
    id: 'mean',
    label: 'CONSENSUS MEAN',
    value: 'Multi-Model Consensus',
    top: '24%',
    left: '79%',
  },
  {
    id: 'std',
    label: 'STD DEVIATION',
    value: 'Inter-Model Spread (σ)',
    top: '44%',
    left: '80%',
  },
  {
    id: 'regime',
    label: 'ATM REGIME',
    value: 'Monsoonal / Synoptic',
    top: '64%',
    left: '79%',
  },
];

export const SANGAMBootScreen: React.FC<SANGAMBootScreenProps> = ({ onReady, isFastPath = false }) => {
  // Scene 1: Atmospheric Void
  // Scene 2: Atmosphere Forms / Globe Emerges
  // Scene 3: Model Streams
  // Scene 4: Context Signals
  // Scene 5: Dynamic Weighting (Centerpiece)
  // Scene 6: Synthesis (SANGAM moment / online ready)
  // Scene 7: Transition into Dashboard
  const overrideScene = useMemo(() => {
    try {
      const p = new URLSearchParams(window.location.search).get('scene');
      return p ? parseInt(p, 10) : null;
    } catch {
      return null;
    }
  }, []);

  const [scene, setScene] = useState<number>(overrideScene ?? (isFastPath ? 6 : 1));
  const [isOnline, setIsOnline] = useState<boolean>(overrideScene ? overrideScene >= 6 : isFastPath);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [activeNodeIdx, setActiveNodeIdx] = useState<number>(0);

  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const elapsedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Atmospheric dust / condensation particles
  const particles = useMemo(() => {
    return Array.from({ length: 44 }, (_, i) => ({
      id: i,
      left: `${(Math.random() * 100).toFixed(2)}%`,
      duration: `${(16 + Math.random() * 20).toFixed(1)}s`,
      delay: `${(-Math.random() * 24).toFixed(1)}s`,
      opacity: (0.12 + Math.random() * 0.32).toFixed(2),
      size: `${(1.5 + Math.random() * 2).toFixed(1)}px`,
    }));
  }, []);

  // Trigger Scene 7 and complete transition to dashboard
  const triggerDashboardTransition = useCallback(() => {
    setScene(7);
    transitionTimerRef.current = setTimeout(() => {
      onReady();
    }, 850);
  }, [onReady]);

  // Fast path progression
  useEffect(() => {
    if (overrideScene !== null) return;
    if (isFastPath) {
      const t1 = setTimeout(() => {
        triggerDashboardTransition();
      }, 950);
      return () => clearTimeout(t1);
    }
  }, [isFastPath, overrideScene, triggerDashboardTransition]);

  // Elapsed second counter for cold starts
  useEffect(() => {
    if (overrideScene !== null) return;
    if (isFastPath || isOnline) return;
    elapsedTimerRef.current = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);

    return () => {
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    };
  }, [isFastPath, isOnline, overrideScene]);

  // Scene progression (Scenes 1 -> 6) during initial boot
  useEffect(() => {
    if (overrideScene !== null) {
      const nodeInterval = setInterval(() => {
        setActiveNodeIdx(prev => (prev + 1) % CONTEXT_NODES.length);
      }, 2200);
      return () => clearInterval(nodeInterval);
    }
    if (isFastPath) return;

    const s2 = setTimeout(() => setScene(2), 1800);
    const s3 = setTimeout(() => setScene(3), 3800);
    const s4 = setTimeout(() => setScene(4), 5800);
    const s5 = setTimeout(() => setScene(5), 7800);
    const s6 = setTimeout(() => setScene(6), 10200);

    // Orbiting highlight among context signals
    const nodeInterval = setInterval(() => {
      setActiveNodeIdx(prev => (prev + 1) % CONTEXT_NODES.length);
    }, 2200);

    return () => {
      clearTimeout(s2);
      clearTimeout(s3);
      clearTimeout(s4);
      clearTimeout(s5);
      clearTimeout(s6);
      clearInterval(nodeInterval);
    };
  }, [isFastPath, overrideScene]);

  // Backend Health check polling loop
  useEffect(() => {
    if (overrideScene !== null) return;
    if (isFastPath) return;

    let isMounted = true;

    const probe = async () => {
      const health = await checkBackendHealth(2500);
      if (!isMounted) return;

      if (health && health.status === 'healthy') {
        setIsOnline(true);
        setScene(6); // Ensure synthesis scene is illuminated
        // Brief moment to witness coherence, then seamlessly transform into dashboard
        setTimeout(() => {
          if (isMounted) {
            triggerDashboardTransition();
          }
        }, 1100);
      }
    };

    probe();
    pollTimerRef.current = setInterval(probe, 2000);

    return () => {
      isMounted = false;
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    };
  }, [isFastPath, triggerDashboardTransition]);

  // Allow manual skip or keyboard Enter/Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        triggerDashboardTransition();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerDashboardTransition]);


  return (
    <div
      className={`sangam-boot-stage ${scene === 7 ? 'boot-scene-7' : ''}`}
      data-scene={scene}
      role="status"
      aria-live="polite"
      aria-label="SANGAM Atmospheric Forecast Synthesis Initialization"
    >
      {/* ── ATMOSPHERIC VOID & PARTICLES (SCENE 1) ── */}
      <div className="boot-atmospheric-void" aria-hidden="true">
        <div className="boot-volumetric-glow" />
        <div className="boot-particles">
          {particles.map(p => (
            <div
              key={p.id}
              className="boot-particle"
              style={{
                left: p.left,
                width: p.size,
                height: p.size,
                animationDuration: p.duration,
                animationDelay: p.delay,
                ['--particle-opacity' as string]: p.opacity,
              }}
            />
          ))}
        </div>
        <div className="boot-graticule-grid" />
      </div>

      {/* ── TOP HUD: SANGAM IDENTITY & CONTROLS ── */}
      <header className="boot-hud-top">
        <div className="boot-brand-lockup">
          <div className="boot-mission-badge">
            <span className="live-dot" />
            <span>RESEARCH PROTOTYPE · ATMOSPHERIC SYNTHESIS DOMAIN</span>
          </div>
          <h1 className="boot-hero-title">SANGAM</h1>
          <p className="boot-hero-subtitle">
            Hybrid AI–NWP Multi-Model Forecast Blending System
          </p>
        </div>

        <div className="boot-hud-controls">
          <button
            type="button"
            className="boot-skip-btn"
            onClick={triggerDashboardTransition}
            title="Proceed immediately to Forecast Dashboard"
          >
            SKIP TO DASHBOARD ↵
          </button>
          <div className="boot-domain-tag">
            DOMAIN: 8.00°N–37.00°N · 68.00°E–97.00°E
          </div>
        </div>
      </header>

      {/* ── CENTER VISUAL STAGE: TRANSLUCENT ROTATING EARTH GLOBE ── */}
      <div className="boot-visual-stage" aria-hidden="true">
        <svg
          className="boot-canvas-svg"
          viewBox="0 0 1000 800"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Spherical Clip for Globe Surface */}
            <clipPath id="globe-sphere-clip">
              <circle cx="500" cy="410" r="195" />
            </clipPath>

            {/* Globe Glass Atmospheric Base Gradient */}
            <radialGradient id="globe-body-gradient" cx="440" cy="350" r="210" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.22" />
              <stop offset="45%" stopColor="#1e3a8a" stopOpacity="0.32" />
              <stop offset="80%" stopColor="#0b132b" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#020617" stopOpacity="0.92" />
            </radialGradient>

            {/* Atmospheric Specular Limb Highlight */}
            <linearGradient id="globe-specular-grad" x1="330" y1="230" x2="480" y2="380" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
            </linearGradient>


            {/* Radiant Synthesis Field Gradient */}
            <radialGradient id="synthesis-radiance" cx="498" cy="410" r="300" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#7dd3fc" stopOpacity={scene >= 6 ? "0.38" : "0.15"} />
              <stop offset="45%" stopColor="#c4b5fd" stopOpacity={scene >= 6 ? "0.20" : "0.07"} />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* ── THE TRANSLUCENT ATMOSPHERIC GLOBE (SCENE 2 -> 6) ── */}
          {scene >= 2 && (
            <g className="boot-globe-group">
              {/* Outer Atmospheric Halo Rings */}
              <circle cx="500" cy="410" r="226" className="globe-outer-halo" />
              <circle cx="500" cy="410" r="212" className="globe-mid-halo" />
              <circle cx="500" cy="410" r="197" className="globe-limb-ring" />

              {/* Spherical Base & Continents (Clipped to Globe Boundary) */}
              <g clipPath="url(#globe-sphere-clip)">
                {/* Translucent Atmospheric Glass Body */}
                <circle cx="500" cy="410" r="195" fill="url(#globe-body-gradient)" />

                {/* Rotating Surface Band: Continents & Meridians (Seamless 38s pan) */}
                <g className="globe-surface-rotator">
                  {/* TILE 1 (X: 0 to 800) */}
                  <g className="globe-tile-1">
                    {/* Rotating Longitude Meridians (Tile 1) */}
                    <path d="M 66 215 C 75 310, 75 510, 66 605" className="globe-graticule-meridian" />
                    <path d="M 133 215 C 150 310, 150 510, 133 605" className="globe-graticule-meridian" />
                    <path d="M 200 215 C 225 310, 225 510, 200 605" className="globe-graticule-meridian" />
                    <path d="M 266 215 C 300 310, 300 510, 266 605" className="globe-graticule-meridian" />
                    <path d="M 333 215 C 375 310, 375 510, 333 605" className="globe-graticule-meridian" />
                    <path d="M 400 215 C 450 310, 450 510, 400 605" className="globe-graticule-meridian" />
                    <path d="M 466 215 C 525 310, 525 510, 466 605" className="globe-graticule-meridian" />
                    <path d="M 533 215 C 600 310, 600 510, 533 605" className="globe-graticule-meridian" />
                    <path d="M 600 215 C 675 310, 675 510, 600 605" className="globe-graticule-meridian" />
                    <path d="M 666 215 C 750 310, 750 510, 666 605" className="globe-graticule-meridian" />
                    <path d="M 733 215 C 825 310, 825 510, 733 605" className="globe-graticule-meridian" />

                    {/* Continents Outline: Africa & Europe */}
                    <path
                      d="M 335 375 L 345 325 L 380 275 L 390 310 L 375 365 L 385 380 L 430 440 L 420 520 L 380 570 L 330 460 L 310 420 L 335 380 Z"
                      className="globe-continent"
                    />

                    {/* Continents Outline: Asia, Eurasia & Siberia */}
                    <path
                      d="M 385 325 L 430 340 L 440 395 L 470 340 L 520 260 L 620 270 L 660 290 L 645 350 L 580 380 L 560 430 L 550 455 L 535 380 L 495 365 L 475 390 L 465 420 L 480 450 L 498 475 L 515 445 L 525 410 L 475 360 L 430 340 Z"
                      className="globe-continent"
                    />

                    {/* Continents Outline: Australia & Maritime */}
                    <path
                      d="M 560 470 L 610 480 L 640 510 L 680 530 L 670 580 L 635 580 L 610 540 Z"
                      className="globe-continent"
                    />

                    {/* Continents Outline: The Americas */}
                    <path
                      d="M 130 280 L 180 270 L 220 350 L 210 410 L 170 410 L 150 350 L 180 430 L 220 480 L 170 610 L 155 550 L 150 460 Z"
                      className="globe-continent"
                    />
                  </g>

                  {/* TILE 2 (X: 800 to 1600 - Seamless Duplicate) */}
                  <g className="globe-tile-2" transform="translate(800, 0)">
                    {/* Rotating Longitude Meridians (Tile 2) */}
                    <path d="M 66 215 C 75 310, 75 510, 66 605" className="globe-graticule-meridian" />
                    <path d="M 133 215 C 150 310, 150 510, 133 605" className="globe-graticule-meridian" />
                    <path d="M 200 215 C 225 310, 225 510, 200 605" className="globe-graticule-meridian" />
                    <path d="M 266 215 C 300 310, 300 510, 266 605" className="globe-graticule-meridian" />
                    <path d="M 333 215 C 375 310, 375 510, 333 605" className="globe-graticule-meridian" />
                    <path d="M 400 215 C 450 310, 450 510, 400 605" className="globe-graticule-meridian" />
                    <path d="M 466 215 C 525 310, 525 510, 466 605" className="globe-graticule-meridian" />
                    <path d="M 533 215 C 600 310, 600 510, 533 605" className="globe-graticule-meridian" />
                    <path d="M 600 215 C 675 310, 675 510, 600 605" className="globe-graticule-meridian" />
                    <path d="M 666 215 C 750 310, 750 510, 666 605" className="globe-graticule-meridian" />
                    <path d="M 733 215 C 825 310, 825 510, 733 605" className="globe-graticule-meridian" />

                    {/* Continents Outline: Africa & Europe */}
                    <path
                      d="M 335 375 L 345 325 L 380 275 L 390 310 L 375 365 L 385 380 L 430 440 L 420 520 L 380 570 L 330 460 L 310 420 L 335 380 Z"
                      className="globe-continent"
                    />

                    {/* Continents Outline: Asia, Eurasia & Siberia */}
                    <path
                      d="M 385 325 L 430 340 L 440 395 L 470 340 L 520 260 L 620 270 L 660 290 L 645 350 L 580 380 L 560 430 L 550 455 L 535 380 L 495 365 L 475 390 L 465 420 L 480 450 L 498 475 L 515 445 L 525 410 L 475 360 L 430 340 Z"
                      className="globe-continent"
                    />

                    {/* Continents Outline: Australia & Maritime */}
                    <path
                      d="M 560 470 L 610 480 L 640 510 L 680 530 L 670 580 L 635 580 L 610 540 Z"
                      className="globe-continent"
                    />

                    {/* Continents Outline: The Americas */}
                    <path
                      d="M 130 280 L 180 270 L 220 350 L 210 410 L 170 410 L 150 350 L 180 430 L 220 480 L 170 610 L 155 550 L 150 460 Z"
                      className="globe-continent"
                    />
                  </g>
                </g>

                {/* Fixed Spherical Parallels (Latitude Curves) */}
                <g className="globe-parallels-group">
                  {/* Arctic Circle 66.5°N */}
                  <path d="M 410 240 Q 500 255 590 240" className="globe-graticule-parallel" />
                  {/* Mid-Latitude 45°N */}
                  <path d="M 350 295 Q 500 325 650 295" className="globe-graticule-parallel" />
                  {/* Tropic of Cancer 23.5°N */}
                  <path d="M 315 355 Q 500 390 685 355" className="globe-graticule-parallel" />
                  {/* Equator 0° */}
                  <path d="M 305 410 Q 500 445 695 410" className="globe-graticule-parallel" />
                  {/* Tropic of Capricorn 23.5°S */}
                  <path d="M 315 465 Q 500 500 685 465" className="globe-graticule-parallel" />
                  {/* Mid-Latitude 45°S */}
                  <path d="M 350 525 Q 500 555 650 525" className="globe-graticule-parallel" />
                  {/* Antarctic Circle 66.5°S */}
                  <path d="M 410 580 Q 500 595 590 580" className="globe-graticule-parallel" />
                </g>

                {/* Specular Crescent Highlight on Glass Sphere */}
                <path
                  d="M 335 340 C 345 265, 415 220, 500 220 C 430 238, 365 285, 335 340 Z"
                  className="globe-specular-crescent"
                />
              </g>
            </g>
          )}

          {/* Unified Radiant Atmospheric Glow upon Synthesis (Scene 6) */}
          {scene >= 5 && (
            <circle
              cx="498"
              cy="410"
              r="240"
              fill="url(#synthesis-radiance)"
              className="synthesis-radiance-glow"
            />
          )}


          {/* Central Synthesis Core at Convergence Center (Scene 3 -> 6) */}
          {scene >= 3 && (
            <g className="boot-synthesis-vortex">
              <circle cx="498" cy="410" r="38" className="synthesis-core-ring ring-1" />
              <circle cx="498" cy="410" r="24" className="synthesis-core-ring ring-2" />
              <circle cx="498" cy="410" r="14" className="synthesis-core-ring ring-3" />
              <circle
                cx="498"
                cy="410"
                r={scene >= 6 ? 12 : 7}
                fill={scene >= 6 ? "#ffffff" : "var(--accent-primary)"}
                className="synthesis-core-nucleus"
              />
            </g>
          )}

        </svg>
      </div>

      {/* ── SCENE 4: ORBITAL SCIENTIFIC TELEMETRY ANNOTATIONS (QUIET) ── */}
      {scene >= 4 && (
        <div className="boot-floating-nodes" aria-hidden="true">
          {CONTEXT_NODES.map((node, idx) => (
            <div
              key={node.id}
              className={`context-telemetry-node ${scene >= 4 ? 'visible' : ''} ${idx === activeNodeIdx ? 'highlighted' : ''}`}
              style={{ top: node.top, left: node.left }}
            >
              <div className="node-header">
                <span className="node-pip" />
                <span>{node.label}</span>
              </div>
              <div className="node-value">{node.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── CINEMATIC NARRATIVE TITLE (SCENE BY SCENE STORYTELLING) ── */}
      <div className="boot-cinematic-narrative">
        {scene === 1 && (
          <>
            <span className="narrative-scene-label">ATMOSPHERIC VOID</span>
            <h2 className="narrative-title">Atmospheric Field Visualization</h2>
            <p className="narrative-subtitle">
              Initializing planetary state and multi-model synoptic fields.
            </p>
          </>
        )}

        {scene === 2 && (
          <>
            <span className="narrative-scene-label">ATMOSPHERE FORMS</span>
            <h2 className="narrative-title">Earth Atmospheric Domain</h2>
            <p className="narrative-subtitle">
              Stylized atmospheric flow inspired by monsoonal circulation (8°N–37°N · 68°E–97°E).
            </p>
          </>
        )}

        {scene === 3 && (
          <>
            <span className="narrative-scene-label">MODEL INGESTION</span>
            <h2 className="narrative-title">Multi-Model Numerical Streams</h2>
            <p className="narrative-subtitle">
              Illustrative numerical forecast streams from ECMWF IFS, NOAA GFS, and DWD ICON.
            </p>
          </>
        )}

        {scene === 4 && (
          <>
            <span className="narrative-scene-label">CONTEXT EXTRACTION</span>
            <h2 className="narrative-title">Atmospheric Context Signals</h2>
            <p className="narrative-subtitle">
              Evaluating multi-model spread, consensus baseline, local regime, and historical model skill vs ERA5 reanalysis reference.
            </p>
          </>
        )}

        {scene === 5 && (
          <>
            <span className="narrative-scene-label">DYNAMIC WEIGHTING</span>
            <h2 className="narrative-title">Context-Aware Dynamic Weighting</h2>
            <p className="narrative-subtitle">
              Conceptual modulation of model reliability coefficients across atmospheric regimes.
            </p>
            <div className="narrative-equation">
              [ILLUSTRATIVE METEOROLOGICAL CONVERGENCE · SIMPLEX CONSTRAINT ∑w_i = 1, w_i ≥ 0]
            </div>
          </>
        )}

        {scene >= 6 && (
          <>
            <span className="narrative-scene-label">SANGAM SYNTHESIS</span>
            <h2 className="narrative-title">MULTI-MODEL FORECAST SYNTHESIS</h2>
            <p className="narrative-subtitle">
              {isOnline
                ? 'Forecast synthesis ready. Track B models validated in the benchmark.'
                : 'Synchronizing multi-model blending engine with service cluster…'}
            </p>
          </>
        )}
      </div>

      {/* ── BOTTOM HUD: RADAR STATUS & STREAM LEGEND ── */}
      <footer className="boot-hud-bottom">
        <div className="boot-status-block">
          <div className="boot-status-row">
            <span className="boot-radar-sweep" />
            <span>
              {isOnline
                ? 'SANGAM ENGINE ONLINE · FORECAST SYNTHESIS CONVERGED'
                : `METEOROLOGICAL SYNCHRONIZATION IN PROGRESS (${elapsedSeconds}s)`}
            </span>
          </div>
          <div className="boot-status-sub">
            {isOnline
              ? 'TRACK B MODEL SYNTHESIS READY'
              : 'Establishing connection to FastAPI prediction service…'}
          </div>

          {elapsedSeconds >= 35 && !isOnline && (
            <div className="boot-cold-advisory">
              <span>Backend cold-start in progress (Render standby). Models calibrating...</span>
              <button
                type="button"
                onClick={() => checkBackendHealth(2000).then(res => { if (res) setIsOnline(true); })}
              >
                Re-check Probe
              </button>
            </div>
          )}
        </div>

        {/* Model Stream Ingestion Legend */}
        <div className="boot-streams-legend">
          <div className="legend-item">
            <span className="legend-dot ifs" />
            <span>ECMWF IFS</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot gfs" />
            <span>NOAA GFS</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot icon" />
            <span>DWD ICON</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SANGAMBootScreen;
