import React from 'react';

const StadiumMap = ({ heatmapData = {}, onSectionClick }) => {
  // Map density 0-100 to colors
  const getColor = (density) => {
    if (!density) return '#e8eaed'; // light empty
    if (density < 40) return 'var(--heat-low)';
    if (density < 75) return 'var(--heat-medium)';
    return 'var(--heat-high)';
  };

  const sections = [
    { id: 'A', path: 'M50 50 L150 50 L120 150 L50 150 Z', x: 80, y: 100 },
    { id: 'B', path: 'M160 50 L260 50 L230 150 L130 150 Z', x: 190, y: 100 },
    { id: 'C', path: 'M270 50 L370 50 L340 150 L240 150 Z', x: 300, y: 100 },
    { id: 'D', path: 'M240 170 L340 170 L370 270 L270 270 Z', x: 300, y: 220 },
    { id: 'E', path: 'M130 170 L230 170 L260 270 L160 270 Z', x: 190, y: 220 },
    { id: 'F', path: 'M50 170 L120 170 L150 270 L50 270 Z', x: 80, y: 220 },
  ];

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '400px', margin: '0 auto' }}>
      <svg viewBox="0 0 400 320" className="stadium-map">
        <rect width="400" height="320" fill="#f8f9fa" rx="16" />
        {/* Field */}
        <rect x="80" y="80" width="240" height="160" fill="#34a853" rx="40" />
        <ellipse cx="200" cy="160" rx="30" ry="40" fill="none" stroke="white" strokeWidth="2" opacity="0.6"/>
        <line x1="200" y1="80" x2="200" y2="240" stroke="white" strokeWidth="2" opacity="0.6"/>
        
        {/* Sections */}
        {sections.map(sec => {
          const density = heatmapData[sec.id] || 0;
          return (
            <g key={sec.id} className="map-section" onClick={() => onSectionClick && onSectionClick(sec.id)}>
              <path 
                d={sec.path} 
                fill={getColor(density)} 
                stroke="#dadce0" 
                strokeWidth="4" 
              />
              <text x={sec.x} y={sec.y} fill="#202124" fontSize="14" fontWeight="bold" textAnchor="middle">
                {sec.id}
              </text>
              <text x={sec.x} y={sec.y + 15} fill="rgba(32,33,36,0.8)" fontSize="10" textAnchor="middle">
                {density}%
              </text>
            </g>
          );
        })}

        {/* Gates */}
        <circle cx="30" cy="160" r="10" fill="#1a73e8" />
        <text x="30" y="145" fill="#5f6368" fontSize="10" fontWeight="bold" textAnchor="middle">Gate 1</text>
        
        <circle cx="370" cy="160" r="10" fill="#1a73e8" />
        <text x="370" y="145" fill="#5f6368" fontSize="10" fontWeight="bold" textAnchor="middle">Gate 2</text>

        <circle cx="200" cy="300" r="10" fill="#1a73e8" />
        <text x="200" y="285" fill="#5f6368" fontSize="10" fontWeight="bold" textAnchor="middle">Gate 3</text>
      </svg>
    </div>
  );
};

export default StadiumMap;
