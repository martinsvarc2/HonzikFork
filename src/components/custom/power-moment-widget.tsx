"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Zap } from 'lucide-react'

interface PowerMomentWidgetProps {
  moment: string;
}

export function PowerMomentWidget({ moment }: PowerMomentWidgetProps) {
  return (
    <Card className="shadow-lg shadow-black/20 rounded-2xl overflow-hidden h-[200px]">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Zap className="w-5 h-5 text-[#f8b922]" />
          Power Moment!
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">{moment}</p>
      </CardContent>
    </Card>
  )
}

