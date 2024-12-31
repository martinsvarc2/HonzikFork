"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface PerformanceMetricsWidgetProps {
  log: {
    performance: number;
    engagement: number;
    objectionHandling: number;
    informationGathering: number;
    programExplanation: number;
    closingSkills: number;
    overallEffectiveness: number;
  };
}

export function PerformanceMetricsWidget({ log }: PerformanceMetricsWidgetProps) {
  const [activeTab, setActiveTab] = useState("metrics");
  const metrics = Object.entries(log).map(([key, value]) => ({ label: key, value }));
  const [selectedMetric, setSelectedMetric] = useState("");

  return (
    <Card className="w-[984px] h-[400px]">
      <CardContent className="p-5 h-full overflow-hidden">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "metrics" | "transcript")} className="w-full">
          <div className="flex items-center gap-4 px-3 py-1">
            <TabsList className="h-8 p-1 bg-transparent">
              <TabsTrigger 
                value="metrics" 
                className="relative h-6 rounded-full data-[state=active]:bg-transparent border border-transparent data-[state=active]:border-[#f8b922]"
              >
                <div className="flex items-center gap-2">
                  <Image
                    src="https://res.cloudinary.com/drkudvyog/image/upload/v1734436445/Table_Activity_Team_View_icon_duha_yiqxlv.png"
                    alt="Metrics"
                    width={16}
                    height={16}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Metrics</span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="transcript"
                className="relative h-6 rounded-full data-[state=active]:bg-transparent"
              >
                <div className="flex items-center gap-2">
                  <Image
                    src="https://res.cloudinary.com/drkudvyog/image/upload/v1734443546/Transcript_icon_duha_ptie6x.png"
                    alt="Transcript"
                    width={16}
                    height={16}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-500">Transcript</span>
                </div>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="metrics" className="flex-1 p-4 overflow-y-auto h-[calc(100%-60px)]">
            <div className="space-y-2">
              {/* Overall Score Card with Description */}
              <div className="bg-[#f0fdf4] border border-[#22c55e] rounded-xl p-4 mt-2 mx-auto" style={{ width: 'calc(100% - 16px)' }}>
                <div className="flex flex-col items-center justify-center mb-4">
                  <h2 className="text-xl font-bold text-center mb-2">Overall Score</h2>
                  <div className="text-[#22c55e] text-3xl font-bold">{log.performance}/100</div>
                </div>
                <div className="w-full h-2 bg-[#22c55e]/20 rounded-full mb-4">
                  <div 
                    className="h-full bg-[#22c55e] rounded-full transition-all"
                    style={{ width: `${log.performance}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 leading-tight text-center">
                  Combined score reflecting the agent's overall performance across all metrics. This comprehensive evaluation takes into account multiple factors including customer engagement, problem-solving abilities, and communication effectiveness. The score helps identify areas of excellence and opportunities for improvement.
                </p>
              </div>

              {/* Metrics Grid */}
              <div className="flex gap-1 h-auto overflow-x-auto pb-2 mb-2 w-full items-center justify-center px-4"> {/* Updated container styles */}
                {metrics.map((metric) => (
                  <div 
                    key={metric.label} 
                    onClick={() => setSelectedMetric(metric.label)}
                    className={cn(
                      "bg-white rounded-lg p-1.5 cursor-pointer transition-all hover:shadow-md flex flex-col items-center justify-between h-20 w-[120px] border border-gray-200 relative",
                       metric.label === selectedMetric && "bg-[#f0fdf4] border-[#22c55e]"
                    )}
                  >
                    <h3 className="text-[9px] font-medium text-center w-full h-6 flex items-center justify-center leading-tight">
                      {metric.label}
                    </h3>
                    <span className="text-[#22c55e] text-base font-bold absolute bottom-1.5 left-1/2 transform -translate-x-1/2">
                      {metric.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="transcript" className="flex-1 overflow-y-auto h-[calc(100%-60px)]">
            <div className="p-3">
              Transcript content...
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

