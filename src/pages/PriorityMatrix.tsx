import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Info, HelpCircle } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { PriorityBadge } from '@/components/ui';
import { StoryDrawer } from '@/components/stories/StoryDrawer';
import type { UserStory } from '@/types';

const QUADRANT_LABELS = [
  { label: 'Quick Wins', x: 0, y: 0, desc: 'High value, low effort', color: '#E5EBE2' },
  { label: 'Strategic', x: 1, y: 0, desc: 'High value, high effort', color: '#F5ECD5' },
  { label: 'Low Priority', x: 0, y: 1, desc: 'Low value, low effort', color: '#F7F6F2' },
  { label: 'Reconsider', x: 1, y: 1, desc: 'Low value, high effort', color: '#F3E2DC' },
];

const PRIORITY_COLORS: Record<string, string> = {
  critical: '#B86F5B',
  high: '#C59A45',
  medium: '#667A63',
  low: '#9CA3AF',
};

export function PriorityMatrix() {
  const { stories } = useAppContext();
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [svgSize, setSvgSize] = useState({ w: 600, h: 480 });

  useEffect(() => {
    function update() {
      if (svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        setSvgSize({ w: rect.width || 600, h: rect.height || 480 });
      }
    }
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const selectedStory = stories.find((s) => s.id === selectedStoryId) ?? null;
  const hoveredStory = stories.find((s) => s.id === hoveredId) ?? null;

  // Plot area margins
  const marginLeft = 52;
  const marginBottom = 40;
  const marginTop = 20;
  const marginRight = 20;
  const plotW = svgSize.w - marginLeft - marginRight;
  const plotH = svgSize.h - marginTop - marginBottom;
  const midX = marginLeft + plotW / 2;
  const midY = marginTop + plotH / 2;

  // Max effort = 13, business value = 10
  function storyToPoint(s: UserStory) {
    const effort = Math.max(1, Math.min(13, s.effort || 5));
    const bv = Math.max(1, Math.min(10, s.businessValue || 5));
    const x = marginLeft + ((effort - 1) / 12) * plotW;
    const y = marginTop + ((10 - bv) / 9) * plotH;
    return { x, y };
  }

  // Group stories with near-identical positions to avoid overlap
  const plotPoints = useMemo(() => {
    return stories.map((s) => {
      const { x, y } = storyToPoint(s);
      return { story: s, x, y };
    });
  }, [stories, svgSize]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border bg-surface flex-shrink-0">
        <h1 className="text-2xl font-bold text-text-primary">Priority Matrix</h1>
        <p className="text-sm text-text-secondary mt-1">
          Plot stories by Business Value vs. Effort to identify quick wins and strategic investments.
        </p>
        <div className="mt-3 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-text-secondary bg-ivory rounded px-3 py-2 border border-border">
            <Info size={12} className="text-sage" />
            X-axis: Effort (1–13 Fibonacci) · Y-axis: Business Value (1–10) · Click a dot to open the story
          </div>
          <div className="flex items-center gap-3 ml-auto">
            {(['critical','high','medium','low'] as const).map((p) => (
              <div key={p} className="flex items-center gap-1.5 text-xs text-text-secondary">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PRIORITY_COLORS[p] }} />
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-hidden">
        <div className="card h-full p-4 relative">
          {/* SVG Matrix */}
          <svg
            ref={svgRef}
            className="w-full h-full"
            style={{ minHeight: 420 }}
          >
            {/* Quadrant backgrounds */}
            <rect x={marginLeft} y={marginTop} width={plotW / 2} height={plotH / 2}
              fill="#E5EBE2" opacity={0.5} />
            <rect x={midX} y={marginTop} width={plotW / 2} height={plotH / 2}
              fill="#F5ECD5" opacity={0.5} />
            <rect x={marginLeft} y={midY} width={plotW / 2} height={plotH / 2}
              fill="#F7F6F2" opacity={0.6} />
            <rect x={midX} y={midY} width={plotW / 2} height={plotH / 2}
              fill="#F3E2DC" opacity={0.4} />

            {/* Quadrant labels */}
            <text x={marginLeft + plotW * 0.25} y={marginTop + 20} textAnchor="middle" className="text-xs" fontSize={11} fill="#667A63" fontWeight={600}>Quick Wins</text>
            <text x={marginLeft + plotW * 0.25} y={marginTop + 34} textAnchor="middle" fontSize={10} fill="#667A63" opacity={0.7}>High value, low effort</text>
            <text x={marginLeft + plotW * 0.75} y={marginTop + 20} textAnchor="middle" fontSize={11} fill="#C59A45" fontWeight={600}>Strategic</text>
            <text x={marginLeft + plotW * 0.75} y={marginTop + 34} textAnchor="middle" fontSize={10} fill="#C59A45" opacity={0.7}>High value, high effort</text>
            <text x={marginLeft + plotW * 0.25} y={midY + plotH * 0.25 + 10} textAnchor="middle" fontSize={11} fill="#9CA3AF" fontWeight={600}>Low Priority</text>
            <text x={marginLeft + plotW * 0.75} y={midY + plotH * 0.25 + 10} textAnchor="middle" fontSize={11} fill="#B86F5B" fontWeight={600}>Reconsider</text>
            <text x={marginLeft + plotW * 0.75} y={midY + plotH * 0.25 + 24} textAnchor="middle" fontSize={10} fill="#B86F5B" opacity={0.7}>Low value, high effort</text>

            {/* Grid dividers */}
            <line x1={midX} y1={marginTop} x2={midX} y2={marginTop + plotH} stroke="#E4E3DE" strokeWidth={1.5} strokeDasharray="4,4" />
            <line x1={marginLeft} y1={midY} x2={marginLeft + plotW} y2={midY} stroke="#E4E3DE" strokeWidth={1.5} strokeDasharray="4,4" />

            {/* Axes */}
            <line x1={marginLeft} y1={marginTop + plotH} x2={marginLeft + plotW} y2={marginTop + plotH} stroke="#E4E3DE" strokeWidth={1} />
            <line x1={marginLeft} y1={marginTop} x2={marginLeft} y2={marginTop + plotH} stroke="#E4E3DE" strokeWidth={1} />

            {/* X-axis labels */}
            <text x={marginLeft} y={marginTop + plotH + 20} textAnchor="middle" fontSize={10} fill="#9CA3AF">1</text>
            <text x={marginLeft + plotW * (5/12)} y={marginTop + plotH + 20} textAnchor="middle" fontSize={10} fill="#9CA3AF">5</text>
            <text x={marginLeft + plotW} y={marginTop + plotH + 20} textAnchor="middle" fontSize={10} fill="#9CA3AF">13</text>
            <text x={marginLeft + plotW / 2} y={marginTop + plotH + 35} textAnchor="middle" fontSize={11} fill="#6F706B">Effort →</text>

            {/* Y-axis labels */}
            <text x={marginLeft - 12} y={marginTop + 4} textAnchor="end" fontSize={10} fill="#9CA3AF">10</text>
            <text x={marginLeft - 12} y={midY + 4} textAnchor="end" fontSize={10} fill="#9CA3AF">5</text>
            <text x={marginLeft - 12} y={marginTop + plotH + 4} textAnchor="end" fontSize={10} fill="#9CA3AF">1</text>
            <text
              x={14}
              y={marginTop + plotH / 2}
              textAnchor="middle"
              fontSize={11}
              fill="#6F706B"
              transform={`rotate(-90, 14, ${marginTop + plotH / 2})`}
            >
              ← Business Value
            </text>

            {/* Story dots */}
            {plotPoints.map(({ story, x, y }) => {
              const isHovered = hoveredId === story.id;
              const isSelected = selectedStoryId === story.id;
              const color = PRIORITY_COLORS[story.priority] ?? '#9CA3AF';

              return (
                <g key={story.id}>
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered || isSelected ? 10 : 7}
                    fill={color}
                    fillOpacity={isHovered || isSelected ? 0.9 : 0.65}
                    stroke={color}
                    strokeWidth={isSelected ? 2.5 : 1.5}
                    strokeOpacity={isHovered || isSelected ? 1 : 0.4}
                    style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                    onMouseEnter={() => setHoveredId(story.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => setSelectedStoryId(story.id)}
                    aria-label={`${story.id}: ${story.title}`}
                  />
                  {(isHovered || isSelected) && (
                    <text
                      x={x}
                      y={y - 14}
                      textAnchor="middle"
                      fontSize={10}
                      fill={color}
                      fontWeight={600}
                    >
                      {story.id}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Hover tooltip */}
          {hoveredStory && (
            <div className="absolute bottom-4 left-4 bg-surface border border-border rounded-md shadow-card px-4 py-3 max-w-xs pointer-events-none">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-text-secondary">{hoveredStory.id}</span>
                <PriorityBadge priority={hoveredStory.priority} />
              </div>
              <p className="text-sm font-medium text-text-primary">{hoveredStory.title}</p>
              <div className="flex gap-4 mt-2 text-xs text-text-secondary">
                <span>Business Value: <strong className="text-text-primary">{hoveredStory.businessValue}/10</strong></span>
                <span>Effort: <strong className="text-text-primary">{hoveredStory.effort}</strong></span>
                <span>Points: <strong className="text-text-primary">{hoveredStory.storyPoints || '?'}</strong></span>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedStory && (
        <StoryDrawer
          story={selectedStory}
          onClose={() => setSelectedStoryId(null)}
          onOpenStory={setSelectedStoryId}
        />
      )}
    </div>
  );
}
