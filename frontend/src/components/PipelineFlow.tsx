import React, { useState } from 'react';
import { 
  CloudRain, 
  Layers, 
  Sliders, 
  Cpu, 
  Scale, 
  GitMerge, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';

export const PipelineFlow: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  return (
    <div className="glass-panel" style={{ padding: '20px', marginBottom: '22px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <GitMerge size={18} color="var(--accent-primary)" />
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.3px', margin: 0 }}>
            SANGAM End-to-End Forecast Blending Pipeline
          </h3>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--surface)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            borderRadius: '6px',
            padding: '4px 10px',
            fontSize: '11px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          <span>{isExpanded ? 'Hide Mathematical Specification' : 'View Blending Mathematics & Pipeline'}</span>
          {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      {/* Visual Step-by-Step Flow */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '8px',
        alignItems: 'stretch',
        position: 'relative'
      }}>
        {/* Step 1 */}
        <div style={{
          background: 'var(--surface-elevated)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '10px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <CloudRain size={16} color="var(--accent-primary)" style={{ marginBottom: '4px' }} />
          <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-primary)' }}>1. Atmospheric State</div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>Current estimate (T, RH, P, Wind)</div>
        </div>

        {/* Step 2 */}
        <div style={{
          background: 'var(--surface-elevated)',
          border: '1px solid var(--border-active)',
          borderRadius: '8px',
          padding: '10px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Layers size={16} color="var(--accent-primary)" style={{ marginBottom: '4px' }} />
          <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--accent-primary)' }}>2. Multi-Model Ingestion</div>
          <div style={{ fontSize: '9px', color: 'var(--text-secondary)', marginTop: '3px' }}>
            <span style={{ color: 'var(--accent-success)', fontWeight: '700' }}>3 Validated</span> • <span style={{ color: 'var(--accent-indian)' }}>3 Additional</span>
          </div>
        </div>

        {/* Step 3 */}
        <div style={{
          background: 'var(--surface-elevated)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '10px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Sliders size={16} color="var(--accent-ai)" style={{ marginBottom: '4px' }} />
          <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-primary)' }}>3. Feature Extraction</div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>Spread, Lead Time, Spatial Biome</div>
        </div>

        {/* Step 4 */}
        <div style={{
          background: 'var(--surface-elevated)',
          border: '1px solid color-mix(in srgb, var(--accent-ai) 35%, transparent)',
          borderRadius: '8px',
          padding: '10px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Cpu size={16} color="var(--accent-ai)" style={{ marginBottom: '4px' }} />
          <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--accent-ai)' }}>4. AI Weighting Engine</div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>LightGBM context reliability</div>
        </div>

        {/* Step 5 */}
        <div style={{
          background: 'var(--surface-elevated)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '10px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Scale size={16} color="var(--accent-warning)" style={{ marginBottom: '4px' }} />
          <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-primary)' }}>5. Dynamic Weights</div>
          <div style={{ fontSize: '10px', color: 'var(--accent-warning)', marginTop: '2px', fontFamily: 'monospace' }}>∑ w_i = 1, w_i ≥ 0</div>
        </div>

        {/* Step 6 */}
        <div style={{
          background: 'var(--surface-elevated)',
          border: '1px solid color-mix(in srgb, var(--accent-success) 35%, transparent)',
          borderRadius: '8px',
          padding: '10px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <GitMerge size={16} color="var(--accent-success)" style={{ marginBottom: '4px' }} />
          <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--accent-success)' }}>6. Forecast Blender</div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px', fontFamily: 'monospace' }}>F_blended = ∑ w_i F_i</div>
        </div>

        {/* Step 7 */}
        <div style={{
          background: 'var(--surface-elevated)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '10px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <AlertTriangle size={16} color="var(--accent-warning)" style={{ marginBottom: '4px' }} />
          <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-primary)' }}>7. Uncertainty &amp; Extremes</div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>Spread entropy &amp; guidance</div>
        </div>

        {/* Step 8 */}
        <div style={{
          background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent-primary) 15%, transparent) 0%, color-mix(in srgb, var(--accent-ai) 15%, transparent) 100%)',
          border: '1px solid var(--accent-primary)',
          borderRadius: '8px',
          padding: '10px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <CheckCircle2 size={16} color="var(--accent-primary)" style={{ marginBottom: '4px' }} />
          <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--accent-primary)' }}>8. SANGAM Synthesis</div>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>Optimized blended output</div>
        </div>
      </div>

      {/* Model Ingestion Breakdown: Validated vs Additional Systems (Part 3) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))',
        gap: '12px',
        marginTop: '14px',
        padding: '12px 14px',
        background: 'var(--surface)',
        borderRadius: '8px',
        border: '1px solid var(--border-subtle)'
      }}>
        {/* Left: Track B Validated Models */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <span style={{
              fontSize: '10px',
              fontWeight: '800',
              padding: '2px 6px',
              borderRadius: '3px',
              background: 'color-mix(in srgb, var(--accent-success) 20%, transparent)',
              color: 'var(--accent-success)',
              border: '1px solid color-mix(in srgb, var(--accent-success) 40%, transparent)'
            }}>
              TRACK B VALIDATED BENCHMARK
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Evaluated against ERA5 Reanalysis</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', padding: '3px 8px', borderRadius: '4px', background: 'var(--surface-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
              <b>ECMWF IFS</b> (0.25°)
            </span>
            <span style={{ fontSize: '12px', padding: '3px 8px', borderRadius: '4px', background: 'var(--surface-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
              <b>NOAA GFS</b> (0.25°)
            </span>
            <span style={{ fontSize: '12px', padding: '3px 8px', borderRadius: '4px', background: 'var(--surface-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
              <b>DWD ICON</b> (0.25°)
            </span>
          </div>
        </div>

        {/* Right: Additional Integrated Systems */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <span style={{
              fontSize: '10px',
              fontWeight: '800',
              padding: '2px 6px',
              borderRadius: '3px',
              background: 'color-mix(in srgb, var(--accent-warning) 20%, transparent)',
              color: 'var(--accent-warning)',
              border: '1px solid color-mix(in srgb, var(--accent-warning) 40%, transparent)'
            }}>
              ADDITIONAL INTEGRATED SYSTEMS
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Architectural &amp; Live Integration</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', padding: '3px 8px', borderRadius: '4px', background: 'color-mix(in srgb, var(--accent-indian) 15%, transparent)', color: 'var(--accent-indian)', border: '1px solid color-mix(in srgb, var(--accent-indian) 30%, transparent)' }}>
              🇮🇳 <b>BharatFS</b> (6km, Pending Archive)
            </span>
            <span style={{ fontSize: '12px', padding: '3px 8px', borderRadius: '4px', background: 'color-mix(in srgb, var(--accent-ai) 15%, transparent)', color: 'var(--accent-ai)', border: '1px solid color-mix(in srgb, var(--accent-ai) 30%, transparent)' }}>
              <b>ECMWF AIFS</b> (0.25° AI Proxy)
            </span>
            <span style={{ fontSize: '12px', padding: '3px 8px', borderRadius: '4px', background: 'var(--surface-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
              <b>HGEFS</b> (0.5° Ensemble)
            </span>
          </div>
        </div>
      </div>

      {/* Expandable Mathematical Specification (Part 6) */}
      {isExpanded && (
        <div style={{
          marginTop: '14px',
          padding: '14px 16px',
          background: 'var(--surface-elevated)',
          borderRadius: '8px',
          border: '1px solid var(--border-active)'
        }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent-primary)', marginBottom: '6px' }}>
            Mathematical Blending Formulation:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))', gap: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <div style={{ background: 'var(--surface)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }}>
              <div style={{ fontFamily: 'monospace', color: 'var(--accent-primary)', fontWeight: '700', marginBottom: '4px' }}>
                1. Non-Negativity &amp; Unit Normalization
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '13px', color: 'var(--text-primary)' }}>
                w_i ≥ 0, &nbsp; ∑_(i=1)^N w_i = 1.0
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                Enforced mathematically by Softmax normalization over model reliability logits.
              </p>
            </div>

            <div style={{ background: 'var(--surface)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }}>
              <div style={{ fontFamily: 'monospace', color: 'var(--accent-success)', fontWeight: '700', marginBottom: '4px' }}>
                2. Convex Combination Synthesis
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '13px', color: 'var(--text-primary)' }}>
                F_blended = ∑_(i=1)^N (w_i × F_i)
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                "Each model receives a non-negative weight, all weights sum to 1, and the final forecast is their weighted combination."
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
