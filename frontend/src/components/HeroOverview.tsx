import React, { useState } from 'react';
import { 
  Layers, 
  Cpu, 
  GitMerge, 
  Award, 
  ShieldAlert, 
  Database, 
  ChevronDown, 
  ChevronUp, 
  Radio 
} from 'lucide-react';

interface HeroOverviewProps {
  dataSource: string;
}

export const HeroOverview: React.FC<HeroOverviewProps> = ({ dataSource }) => {
  const [showJudgeCard, setShowJudgeCard] = useState<boolean>(true);

  return (
    <div style={{ marginBottom: '22px' }}>
      {/* Top Banner: SANGAM Identity & Headline */}
      <div className="glass-panel" style={{ padding: '22px 26px', marginBottom: '14px', position: 'relative', overflow: 'hidden' }}>
        {/* Subtle Background Glow */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '240px',
          height: '240px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, color-mix(in srgb, var(--accent-primary) 12%, transparent) 0%, color-mix(in srgb, var(--accent-ai) 4%, transparent) 70%, transparent 100%)',
          filter: 'blur(30px)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span style={{
                background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-ai) 100%)',
                color: 'var(--text-inverse)',
                fontWeight: '900',
                fontSize: '11px',
                padding: '3px 8px',
                borderRadius: '4px',
                letterSpacing: '0.8px',
                textTransform: 'uppercase'
              }}>
                Multi-Model Blending
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                Operational AI–NWP Weather Synthesis
              </span>
            </div>

            <h1 style={{
              fontSize: '28px',
              fontWeight: '800',
              color: 'var(--text-primary)',
              letterSpacing: '-0.5px',
              margin: '0 0 6px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              SANGAM
              <span style={{ fontSize: '18px', fontWeight: '400', color: 'var(--text-muted)' }}>
                | Hybrid AI–NWP Multi-Model Forecast Blending System
              </span>
            </h1>

            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0, maxWidth: '900px', lineHeight: '1.5' }}>
              <b>"Context-aware dynamic weighting of multiple weather forecasting systems."</b> Rather than trusting any single model, SANGAM continuously optimizes model weights based on lead time, geographic coordinates, model disagreement, and atmospheric regimes.
            </p>
          </div>

          {/* Quick Mode & Judge Toggle */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
            <button
              onClick={() => setShowJudgeCard(!showJudgeCard)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: showJudgeCard ? 'color-mix(in srgb, var(--accent-primary) 15%, transparent)' : 'var(--surface)',
                border: showJudgeCard ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                color: showJudgeCard ? 'var(--accent-primary)' : 'var(--text-secondary)',
                borderRadius: '8px',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Award size={14} />
              <span>{showJudgeCard ? 'Hide Executive Summary' : 'View Executive Summary'}</span>
              {showJudgeCard ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {/* Validation vs Demo vs Live Mode Indicator */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              padding: '4px 10px',
              borderRadius: '6px',
              background: dataSource === 'LIVE' ? 'color-mix(in srgb, var(--accent-success) 15%, transparent)' : 'color-mix(in srgb, var(--accent-primary) 15%, transparent)',
              border: dataSource === 'LIVE' ? '1px solid color-mix(in srgb, var(--accent-success) 30%, transparent)' : '1px solid color-mix(in srgb, var(--accent-primary) 30%, transparent)',
              color: dataSource === 'LIVE' ? 'var(--accent-success)' : 'var(--accent-primary)'
            }}>
              <Radio size={12} className={dataSource === 'LIVE' ? 'animate-pulse' : ''} />
              <span style={{ fontWeight: '700' }}>
                {dataSource === 'LIVE' ? 'LIVE DATA MODE' : 'DEMO REPRODUCIBLE MODE'}
              </span>
            </div>
          </div>
        </div>

        {/* 3 Foundational Architecture Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '14px',
          marginTop: '18px'
        }}>
          {/* Card 1: Model Disagreement */}
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '14px 16px',
            borderLeft: '4px solid var(--accent-primary)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Layers size={16} color="var(--accent-primary)" />
              <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '0.4px' }}>
                1. MODEL DISAGREEMENT
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.45' }}>
              Multiple forecasting systems provide different estimates. Differences between forecasts provide an important model-disagreement signal for uncertainty assessment.
            </p>
          </div>

          {/* Card 2: Dynamic Weights */}
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '14px 16px',
            borderLeft: '4px solid var(--accent-ai)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Cpu size={16} color="var(--accent-ai)" />
              <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '0.4px' }}>
                2. DYNAMIC WEIGHTS
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.45' }}>
              SANGAM learns how much to trust each model for the current context (lead time, geographic coordinates, model disagreement, and atmospheric regime).
            </p>
          </div>

          {/* Card 3: Blended Forecast */}
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '14px 16px',
            borderLeft: '4px solid var(--accent-success)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <GitMerge size={16} color="var(--accent-success)" />
              <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '0.4px' }}>
                3. BLENDED FORECAST
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.45' }}>
              The final forecast combines the model outputs using normalized non-negative weights (<span style={{ fontFamily: 'monospace' }}>∑ w_i = 1.0, w_i ≥ 0</span>) with quantified uncertainty bounds.
            </p>
          </div>
        </div>
      </div>

      {/* Permanently Visible Scientific Scope Strip (Part 13) */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        marginBottom: '14px',
        fontSize: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Database size={15} color="var(--accent-primary)" />
          <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
            <span style={{ color: 'var(--accent-primary)', fontWeight: '700' }}>SCIENTIFIC VALIDATION SCOPE:</span> 41-day historical sample • 5 locations • Summer monsoon 2024 • 1,800 held-out test instances • ERA5 reanalysis reference
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', color: 'var(--text-secondary)' }}>
          <span>Ref: <b>ECMWF ERA5 Reanalysis (0.25°)</b></span>
          <span>•</span>
          <span style={{ color: 'var(--accent-indian)' }}>🇮🇳 BharatFS (6km): <b>Pending Archive</b></span>
        </div>
      </div>

      {/* Executive Summary Card (Part 16) */}
      {showJudgeCard && (
        <div className="glass-panel" style={{
          padding: '18px 22px',
          marginBottom: '18px',
          border: '1px solid var(--border-active)',
          background: 'var(--surface)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={18} color="var(--accent-primary)" />
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.2px', margin: 0 }}>
                Executive Briefing & Verification Summary
              </h3>
            </div>
            <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px', background: 'color-mix(in srgb, var(--accent-primary) 15%, transparent)', color: 'var(--accent-primary)' }}>
              Core Benchmark & Verification Scope
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '14px' }}>
            <div style={{ background: 'var(--surface-elevated)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Evaluation Protocol</div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '2px' }}>Purged Out-of-Sample Holdout</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>72h purge buffers • 1,800 test instances</div>
            </div>

            <div style={{ background: 'var(--surface-elevated)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Validated Operational Models</div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent-success)', marginTop: '2px' }}>ECMWF IFS • NOAA GFS • DWD ICON</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Evaluated at T+24h, T+48h, T+72h</div>
            </div>

            <div style={{ background: 'var(--surface-elevated)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Temperature Skill Gain</div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent-success)', marginTop: '2px' }}>+15.35% RMSE Reduction</div>
              <div style={{ fontSize: '11px', color: 'var(--accent-success)' }}>95% CI: [+12.72%, +17.90%] (excludes 0)</div>
            </div>

            <div style={{ background: 'var(--surface-elevated)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Wind Speed Skill Gain</div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent-success)', marginTop: '2px' }}>+12.86% RMSE Reduction</div>
              <div style={{ fontSize: '11px', color: 'var(--accent-success)' }}>95% CI: [+10.83%, +14.98%] (excludes 0)</div>
            </div>

            <div style={{ background: 'var(--surface-elevated)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Precipitation Skill Gain</div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent-warning)', marginTop: '2px' }}>+0.80% (Statistically Inconclusive)</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>95% CI: [-0.37%, +3.10%] (crosses 0)</div>
            </div>

            <div style={{ background: 'var(--surface-elevated)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Indian Model Integration</div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent-indian)', marginTop: '2px' }}>🇮🇳 BharatFS (6 km Grid)</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Architecture ready; validation pending archive</div>
            </div>
          </div>

          {/* Critical Caveats Disclosed Upfront for Judges */}
          <div style={{
            background: 'color-mix(in srgb, var(--accent-danger) 8%, transparent)',
            border: '1px solid color-mix(in srgb, var(--accent-danger) 25%, transparent)',
            borderRadius: '8px',
            padding: '10px 14px',
            fontSize: '11px',
            color: 'var(--accent-danger)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            lineHeight: '1.45'
          }}>
            <ShieldAlert size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <b>Disclosed Scientific Boundaries:</b> Evaluated on 41 summer monsoon days across 5 monitoring stations (Delhi, Guwahati, Mumbai, Chennai, Leh). High-altitude mountain terrain (Leh) exhibits localized temperature degradation (-44.21%) due to steep valley reanalysis grid-smoothing. Improvement indicators are based on bootstrap confidence intervals; gains whose 95% CI excludes zero are treated as statistically supported, while intervals spanning zero remain inconclusive. Extreme rain (&ge;20mm, N=6) and heatwaves (&ge;40°C, N=0) sample counts are insufficient for formal inferential claims.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
