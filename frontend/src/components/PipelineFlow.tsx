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
          <GitMerge size={18} color="#00f0ff" />
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc', letterSpacing: '-0.3px', margin: 0 }}>
            SANGAM End-to-End Forecast Blending Pipeline
          </h3>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-subtle)',
            color: '#cbd5e1',
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
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '8px',
          padding: '10px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <CloudRain size={16} color="#38bdf8" style={{ marginBottom: '4px' }} />
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#f1f5f9' }}>1. Atmospheric State</div>
          <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>Current estimate (T, RH, P, Wind)</div>
        </div>

        {/* Step 2 */}
        <div style={{
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: '8px',
          padding: '10px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Layers size={16} color="#38bdf8" style={{ marginBottom: '4px' }} />
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#38bdf8' }}>2. Multi-Model Ingestion</div>
          <div style={{ fontSize: '9px', color: '#cbd5e1', marginTop: '3px' }}>
            <span style={{ color: '#10b981', fontWeight: '700' }}>3 Validated</span> • <span style={{ color: '#fb923c' }}>3 Additional</span>
          </div>
        </div>

        {/* Step 3 */}
        <div style={{
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '8px',
          padding: '10px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Sliders size={16} color="#a78bfa" style={{ marginBottom: '4px' }} />
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#f1f5f9' }}>3. Feature Extraction</div>
          <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>Spread, Lead Time, Spatial Biome</div>
        </div>

        {/* Step 4 */}
        <div style={{
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid rgba(167, 139, 250, 0.3)',
          borderRadius: '8px',
          padding: '10px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Cpu size={16} color="#a78bfa" style={{ marginBottom: '4px' }} />
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#a78bfa' }}>4. AI Weighting Engine</div>
          <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>LightGBM context reliability</div>
        </div>

        {/* Step 5 */}
        <div style={{
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '8px',
          padding: '10px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Scale size={16} color="#f59e0b" style={{ marginBottom: '4px' }} />
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#f1f5f9' }}>5. Dynamic Weights</div>
          <div style={{ fontSize: '10px', color: '#f59e0b', marginTop: '2px', fontFamily: 'monospace' }}>∑ w_i = 1, w_i ≥ 0</div>
        </div>

        {/* Step 6 */}
        <div style={{
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '8px',
          padding: '10px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <GitMerge size={16} color="#10b981" style={{ marginBottom: '4px' }} />
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#10b981' }}>6. Forecast Blender</div>
          <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px', fontFamily: 'monospace' }}>F_blended = ∑ w_i F_i</div>
        </div>

        {/* Step 7 */}
        <div style={{
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '8px',
          padding: '10px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <AlertTriangle size={16} color="#fbbf24" style={{ marginBottom: '4px' }} />
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#f1f5f9' }}>7. Uncertainty &amp; Extremes</div>
          <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>Spread entropy &amp; guidance</div>
        </div>

        {/* Step 8 */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)',
          border: '1px solid #00f0ff',
          borderRadius: '8px',
          padding: '10px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <CheckCircle2 size={16} color="#00f0ff" style={{ marginBottom: '4px' }} />
          <div style={{ fontSize: '11px', fontWeight: '800', color: '#00f0ff' }}>8. SANGAM Synthesis</div>
          <div style={{ fontSize: '10px', color: '#cbd5e1', marginTop: '2px' }}>Optimized blended output</div>
        </div>
      </div>

      {/* Model Ingestion Breakdown: Validated vs Additional Systems (Part 3) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '12px',
        marginTop: '14px',
        padding: '12px 14px',
        background: 'rgba(0,0,0,0.2)',
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
              background: 'rgba(16, 185, 129, 0.2)',
              color: '#34d399',
              border: '1px solid rgba(16, 185, 129, 0.4)'
            }}>
              TRACK B VALIDATED BENCHMARK
            </span>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>Evaluated against ERA5 Reanalysis</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', padding: '3px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: '#f1f5f9' }}>
              <b>ECMWF IFS</b> (0.25°)
            </span>
            <span style={{ fontSize: '12px', padding: '3px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: '#f1f5f9' }}>
              <b>NOAA GFS</b> (0.25°)
            </span>
            <span style={{ fontSize: '12px', padding: '3px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: '#f1f5f9' }}>
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
              background: 'rgba(245, 158, 11, 0.2)',
              color: '#fbbf24',
              border: '1px solid rgba(245, 158, 11, 0.4)'
            }}>
              ADDITIONAL INTEGRATED SYSTEMS
            </span>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>Architectural &amp; Live Integration</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', padding: '3px 8px', borderRadius: '4px', background: 'rgba(249, 115, 22, 0.1)', color: '#fb923c', border: '1px solid rgba(249, 115, 22, 0.3)' }}>
              🇮🇳 <b>BharatFS</b> (6km, Pending Archive)
            </span>
            <span style={{ fontSize: '12px', padding: '3px 8px', borderRadius: '4px', background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
              <b>ECMWF AIFS</b> (0.25° AI Proxy)
            </span>
            <span style={{ fontSize: '12px', padding: '3px 8px', borderRadius: '4px', background: 'rgba(148, 163, 184, 0.1)', color: '#cbd5e1' }}>
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
          background: 'rgba(7, 10, 18, 0.7)',
          borderRadius: '8px',
          border: '1px solid rgba(0, 240, 255, 0.25)'
        }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#00f0ff', marginBottom: '6px' }}>
            Mathematical Blending Formulation:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', fontSize: '12px', color: '#cbd5e1' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '6px' }}>
              <div style={{ fontFamily: 'monospace', color: '#38bdf8', fontWeight: '700', marginBottom: '4px' }}>
                1. Non-Negativity &amp; Unit Normalization
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '13px', color: '#f1f5f9' }}>
                w_i ≥ 0, &nbsp; ∑_(i=1)^N w_i = 1.0
              </div>
              <p style={{ fontSize: '11px', color: '#94a3b8', margin: '4px 0 0 0' }}>
                Enforced mathematically by Softmax normalization over model reliability logits.
              </p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '6px' }}>
              <div style={{ fontFamily: 'monospace', color: '#10b981', fontWeight: '700', marginBottom: '4px' }}>
                2. Convex Combination Synthesis
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '13px', color: '#f1f5f9' }}>
                F_blended = ∑_(i=1)^N (w_i × F_i)
              </div>
              <p style={{ fontSize: '11px', color: '#94a3b8', margin: '4px 0 0 0' }}>
                "Each model receives a non-negative weight, all weights sum to 1, and the final forecast is their weighted combination."
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
