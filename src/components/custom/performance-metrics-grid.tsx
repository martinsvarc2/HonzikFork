"use client"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  label: string
  value: number
  isSelected?: boolean
  onClick?: () => void
}

function MetricCard({ label, value, isSelected, onClick }: MetricCardProps) {
  const isOverallScore = label === "Overall Score";
  return (
    <Card
      className={cn(
        "p-4 cursor-pointer transition-all",
        isOverallScore ? "bg-[#f0fdf4] border-[#22c55e]" : "bg-white"
      )}
      onClick={onClick}
    >
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-gray-900">{label}</h3>
        <div className="flex items-center justify-center">
          <span className="text-[#22c55e] text-5xl font-bold">{value}</span>
        </div>
      </div>
    </Card>
  );
}

interface PerformanceMetricsGridProps {
  metrics: {
    label: string
    value: number
    description?: string
  }[]
  onSelectMetric?: (label: string) => void
  selectedMetric?: string
}

export function PerformanceMetricsGrid({ 
  metrics, 
  onSelectMetric,
  selectedMetric 
}: PerformanceMetricsGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {metrics.map((metric) => (
        <MetricCard
          key={metric.label}
          label={metric.label}
          value={metric.value}
          isSelected={selectedMetric === metric.label}
          onClick={() => onSelectMetric?.(metric.label)}
        />
      ))}
    </div>
  )
}

