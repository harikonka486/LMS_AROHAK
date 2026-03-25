'use client'

interface Slice {
  label: string
  value: number
  color: string
}

interface StatusPieChartProps {
  total: number
  active: number
  completed: number
  size?: number
}

export default function StatusPieChart({ total, active, completed, size = 160 }: StatusPieChartProps) {
  const notStarted = Math.max(0, total - active - completed)

  const slices: Slice[] = [
    { label: 'Completed',   value: completed,  color: '#10b981' },
    { label: 'In Progress', value: active,      color: '#f59e0b' },
    { label: 'Not Started', value: notStarted,  color: '#6b7280' },
  ].filter(s => s.value > 0)

  const cx = size / 2
  const cy = size / 2
  const r  = size / 2 - 10
  const innerR = r * 0.55  // donut hole

  // Build SVG arc paths
  function polarToXY(angleDeg: number, radius: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) }
  }

  function arcPath(startAngle: number, endAngle: number, outerRadius: number, innerRadius: number) {
    const large = endAngle - startAngle > 180 ? 1 : 0
    const o1 = polarToXY(startAngle, outerRadius)
    const o2 = polarToXY(endAngle,   outerRadius)
    const i1 = polarToXY(endAngle,   innerRadius)
    const i2 = polarToXY(startAngle, innerRadius)
    return [
      `M ${o1.x} ${o1.y}`,
      `A ${outerRadius} ${outerRadius} 0 ${large} 1 ${o2.x} ${o2.y}`,
      `L ${i1.x} ${i1.y}`,
      `A ${innerRadius} ${innerRadius} 0 ${large} 0 ${i2.x} ${i2.y}`,
      'Z',
    ].join(' ')
  }

  // Empty state
  if (total === 0) {
    return (
      <div className="flex flex-col items-center gap-3">
        <svg width={size} height={size}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e5e7eb" strokeWidth={r - innerR} />
          <text x={cx} y={cy - 6} textAnchor="middle" fill="#9ca3af" fontSize="13" fontWeight="600">No</text>
          <text x={cx} y={cy + 10} textAnchor="middle" fill="#9ca3af" fontSize="13" fontWeight="600">courses</text>
        </svg>
      </div>
    )
  }

  let currentAngle = 0
  const paths = slices.map(slice => {
    const sweep = (slice.value / total) * 360
    const path = arcPath(currentAngle, currentAngle + sweep, r, innerR)
    currentAngle += sweep
    return { ...slice, path }
  })

  const pct = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Donut */}
      <div className="relative">
        <svg width={size} height={size}>
          {paths.map((s, i) => (
            <path key={i} d={s.path} fill={s.color} className="transition-opacity hover:opacity-80" />
          ))}
          {/* Center text */}
          <text x={cx} y={cy - 8} textAnchor="middle" fill="#111827" fontSize="22" fontWeight="700">
            {pct}%
          </text>
          <text x={cx} y={cy + 10} textAnchor="middle" fill="#6b7280" fontSize="11">
            completed
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2 w-full">
        {[
          { label: 'Completed',   value: completed,  color: '#10b981' },
          { label: 'In Progress', value: active,      color: '#f59e0b' },
          { label: 'Not Started', value: notStarted,  color: '#6b7280' },
        ].map(item => (
          <div key={item.label} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
              <span className="text-gray-600">{item.label}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-gray-800">{item.value}</span>
              <span className="text-gray-400">
                ({total > 0 ? Math.round((item.value / total) * 100) : 0}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
