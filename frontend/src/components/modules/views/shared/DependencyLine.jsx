import React from 'react';

/**
 * DependencyLine Component
 * SVG line connecting two cards to show blocking/dependency relationships
 * 
 * @param {Object} props
 * @param {Object} props.from - Source position { x, y }
 * @param {Object} props.to - Target position { x, y }
 * @param {string} props.type - Line type: 'blocking' | 'related'
 * @param {boolean} props.animated - Show animation
 * @param {function} props.onClick - Click handler
 */
const DependencyLine = ({
    from,
    to,
    type = 'blocking',
    animated = false,
    onClick,
}) => {
    const colors = {
        blocking: '#ef4444', // red-500
        related: '#6366f1', // indigo-500
        parent: '#10b981', // green-500
    };

    const color = colors[type] || colors.blocking;

    // Calculate control points for curved line
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;
    const curveOffset = 20; // Curve amount

    // Create bezier curve path
    const path = `M ${from.x} ${from.y} C ${from.x + curveOffset} ${from.y}, ${to.x - curveOffset} ${to.y}, ${to.x} ${to.y}`;

    // Arrow head calculation
    const arrowSize = 6;
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    const arrowPath = `
        M ${to.x} ${to.y}
        L ${to.x - arrowSize * Math.cos(angle - Math.PI / 6)} ${to.y - arrowSize * Math.sin(angle - Math.PI / 6)}
        L ${to.x - arrowSize * Math.cos(angle + Math.PI / 6)} ${to.y - arrowSize * Math.sin(angle + Math.PI / 6)}
        Z
    `;

    return (
        <g
            onClick={onClick}
            className={`cursor-pointer ${onClick ? 'hover:opacity-80' : ''}`}
        >
            {/* Main line */}
            <path
                d={path}
                fill="none"
                stroke={color}
                strokeWidth={2}
                strokeDasharray={type === 'related' ? '4,4' : 'none'}
                className={animated ? 'animate-pulse' : ''}
            />

            {/* Arrow head */}
            <path
                d={arrowPath}
                fill={color}
            />

            {/* Hit area for easier clicking */}
            <path
                d={path}
                fill="none"
                stroke="transparent"
                strokeWidth={10}
            />
        </g>
    );
};

/**
 * DependencyLines Container
 * SVG container for rendering multiple dependency lines
 * 
 * @param {Object} props
 * @param {Array} props.dependencies - Array of { from, to, type }
 * @param {number} props.width - Container width
 * @param {number} props.height - Container height
 */
export const DependencyLinesContainer = ({
    dependencies = [],
    width,
    height,
    onLineClick,
}) => {
    return (
        <svg
            className="absolute inset-0 pointer-events-none overflow-visible"
            style={{ width, height }}
        >
            {dependencies.map((dep, index) => (
                <DependencyLine
                    key={`${dep.fromId}-${dep.toId}-${index}`}
                    from={dep.from}
                    to={dep.to}
                    type={dep.type}
                    animated={dep.animated}
                    onClick={() => onLineClick?.(dep)}
                />
            ))}
        </svg>
    );
};

export default DependencyLine;
