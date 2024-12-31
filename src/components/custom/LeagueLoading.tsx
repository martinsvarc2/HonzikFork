'use client'

export default function LeagueLoading() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full py-8">
      <div className="relative w-12 h-12 mb-3" role="status" aria-label="Loading">
        <svg
          className="w-full h-full animate-spin"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="#F5F5F5"
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="#556bc7"
            strokeWidth="12"
            fill="none"
            strokeDasharray="30 95 30 95"
            strokeDashoffset="-15"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <p className="text-[#556bc7] font-montserrat text-sm">Loading league data...</p>
    </div>
  )
}
