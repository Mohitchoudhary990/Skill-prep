import React from 'react'

export default function ScoreGauge({ value = 0, size = 200, label = 'Score' }) {
    const radius = 70
    const stroke = 12
    const cx = size / 2
    const cy = size / 2 + 20 // shift down so arc fits
    const angle = 200 // total arc degrees
    const startDeg = 270 - angle / 2
    const endDeg = 270 + angle / 2

    const toRad = d => (d * Math.PI) / 180
    const circum = 2 * Math.PI * radius
    const arcLen = (angle / 360) * circum
    const fillLen = (value / 100) * arcLen

    const color = value >= 75 ? '#10b981'
        : value >= 50 ? '#6366f1'
            : value >= 30 ? '#f59e0b'
                : '#ef4444'

    // SVG arc path
    const polarToXY = (deg) => ({
        x: cx + radius * Math.cos(toRad(deg)),
        y: cy + radius * Math.sin(toRad(deg)),
    })

    const p1 = polarToXY(startDeg)
    const p2 = polarToXY(endDeg)
    const arcPath = `M ${p1.x} ${p1.y} A ${radius} ${radius} 0 1 1 ${p2.x} ${p2.y}`

    return (
        <div className="gauge-wrapper">
            <svg width={size} height={size - 20} className="gauge-svg">
                {/* Track */}
                <path
                    d={arcPath}
                    className="gauge-track"
                    strokeWidth={stroke}
                    style={{ stroke: 'rgba(255,255,255,0.07)' }}
                />
                {/* Fill */}
                <path
                    d={arcPath}
                    fill="none"
                    strokeWidth={stroke}
                    stroke={color}
                    strokeLinecap="round"
                    strokeDasharray={`${arcLen}`}
                    strokeDashoffset={arcLen - fillLen}
                    style={{
                        filter: `drop-shadow(0 0 8px ${color}80)`,
                        transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)',
                    }}
                />
                {/* Number */}
                <text x={cx} y={cy - 2} className="gauge-number" fill="white">
                    {value}%
                </text>
                <text x={cx} y={cy + 22} className="gauge-label">
                    {label}
                </text>
            </svg>
        </div>
    )
}
