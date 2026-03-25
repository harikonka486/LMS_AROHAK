'use client'

interface LearningGraphProps {
  total: number
  active: number
  completed: number
  width?: number
  height?: number
}

export default function LearningGraph({ total, active, completed, width = 300, height = 200 }: LearningGraphProps) {
  const notStarted = Math.max(0, total - active - completed)
  
  // Calculate percentages
  const completedPct = total > 0 ? (completed / total) * 100 : 0
  const activePct = total > 0 ? (active / total) * 100 : 0
  const notStartedPct = total > 0 ? (notStarted / total) * 100 : 0
  
  // Bar dimensions
  const barHeight = 24
  const barSpacing = 12
  const maxBarWidth = width - 80 // Leave space for labels
  const startY = 40
  
  // Empty state
  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <p className="text-sm text-gray-500 font-medium">No courses enrolled</p>
        <p className="text-xs text-gray-400 mt-1">Start learning to see your progress</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Title */}
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Learning Progress</h3>
      
      {/* Graph */}
      <svg width={width} height={height} className="overflow-visible">
        {/* Completed Bar */}
        <g>
          <text x="0" y={startY + barHeight/2 + 4} className="text-xs font-medium fill-gray-600" textAnchor="start">
            Completed
          </text>
          <rect
            x="75"
            y={startY}
            width={maxBarWidth * (completedPct / 100)}
            height={barHeight}
            fill="#10b981"
            rx="4"
            className="transition-all duration-500 ease-out"
          />
          <text 
            x={75 + maxBarWidth * (completedPct / 100) + 8} 
            y={startY + barHeight/2 + 4} 
            className="text-xs font-semibold fill-gray-700"
            textAnchor="start"
          >
            {completed} ({Math.round(completedPct)}%)
          </text>
        </g>

        {/* In Progress Bar */}
        <g>
          <text x="0" y={startY + barHeight + barSpacing + barHeight/2 + 4} className="text-xs font-medium fill-gray-600" textAnchor="start">
            In Progress
          </text>
          <rect
            x="75"
            y={startY + barHeight + barSpacing}
            width={maxBarWidth * (activePct / 100)}
            height={barHeight}
            fill="#f59e0b"
            rx="4"
            className="transition-all duration-500 ease-out delay-100"
          />
          <text 
            x={75 + maxBarWidth * (activePct / 100) + 8} 
            y={startY + barHeight + barSpacing + barHeight/2 + 4} 
            className="text-xs font-semibold fill-gray-700"
            textAnchor="start"
          >
            {active} ({Math.round(activePct)}%)
          </text>
        </g>

        {/* Not Started Bar */}
        <g>
          <text x="0" y={startY + (barHeight + barSpacing) * 2 + barHeight/2 + 4} className="text-xs font-medium fill-gray-600" textAnchor="start">
            Not Started
          </text>
          <rect
            x="75"
            y={startY + (barHeight + barSpacing) * 2}
            width={maxBarWidth * (notStartedPct / 100)}
            height={barHeight}
            fill="#6b7280"
            rx="4"
            className="transition-all duration-500 ease-out delay-200"
          />
          <text 
            x={75 + maxBarWidth * (notStartedPct / 100) + 8} 
            y={startY + (barHeight + barSpacing) * 2 + barHeight/2 + 4} 
            className="text-xs font-semibold fill-gray-700"
            textAnchor="start"
          >
            {notStarted} ({Math.round(notStartedPct)}%)
          </text>
        </g>

        {/* Total line indicator */}
        <line 
          x1="75" 
          y1={startY - 5} 
          x2={75 + maxBarWidth} 
          y2={startY - 5} 
          stroke="#e5e7eb" 
          strokeWidth="1" 
          strokeDasharray="2,2"
        />
      </svg>

      {/* Summary */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">Total Courses</span>
          <span className="text-sm font-semibold text-gray-800">{total}</span>
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-gray-500">Completion Rate</span>
          <span className="text-sm font-semibold text-emerald-600">{Math.round(completedPct)}%</span>
        </div>
      </div>
    </div>
  )
}
