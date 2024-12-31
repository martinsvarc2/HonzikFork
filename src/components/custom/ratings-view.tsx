"use client"

import { useState } from "react"
import { Star, ArrowUpDown, ChevronDown } from 'lucide-react'
import { filterData } from "@/utils/formatters"

interface RatingsData {
  name: string
  avatar: string
  engagement: number
  objectionHandling: number
  informationGathering: number
  programExplanation: number
  closingSkills: number
  overallEffectiveness: number
}

export function RatingsView({ data }: { data: RatingsData[] }) {
  const [showMore, setShowMore] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredData = filterData(data, searchQuery)
  const visibleData = showMore ? filteredData : filteredData.slice(0, 5)

  return (
    <div>
    </div>
  )
}

