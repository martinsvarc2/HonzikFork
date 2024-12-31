import React from 'react'
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

// Define the default profile image URL as a constant at the top
export const DEFAULT_PROFILE_IMAGE = "https://res.cloudinary.com/dmbzcxhjn/image/upload/v1732590120/WhatsApp_Image_2024-11-26_at_04.00.13_58e32347_owfpnt.jpg"

interface ChartDataPoint {
  date: string
  userPoints: number
  topUserPoints: number
}

interface LeagueChartProps {
  chartData: {
    day: string;
    date: string;
    you: number;
  }[];
  weeklyRankings: {
    member_id: string;
    user_name: string;
    user_picture: string;
    points: number;
    unlocked_badges: string;
    rank: number;
  }[];
}

function LeagueChart({ 
  chartData,
  weeklyRankings
}: LeagueChartProps) {

  return (
    <div className="relative h-48 bg-gradient-to-t from-[#51c1a9]/20 via-[#51c1a9]/10 to-transparent rounded-[20px] overflow-hidden px-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorUserPoints" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#51c1a9" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#51c1a9" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorTopUserPoints" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#fbb350" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#fbb350" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          
          <XAxis 
            dataKey="date" 
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            interval={0}
            tick={{ fill: '#888888' }}
            padding={{ left: 10, right: 10 }}
          />
          
          <YAxis 
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            width={30}
          />
          
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border border-gray-200 bg-white p-2 shadow-md">
                    <p className="text-sm font-medium" style={{ color: '#51c1a9' }}>
                      Your Score: {payload[0].value}
                    </p>
                    <p className="text-sm font-medium" style={{ color: '#fbb350' }}>
                      Top Score: {payload[1].value}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          
          <Area
            type="monotone"
            dataKey="userPoints"
            stroke="#51c1a9"
            strokeWidth={2}
            fill="url(#colorUserPoints)"
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="topUserPoints"
            stroke="#fbb350"
            strokeWidth={2}
            fill="url(#colorTopUserPoints)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default LeagueChart;