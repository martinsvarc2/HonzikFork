'use client'

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { motion } from "framer-motion"
import Image from 'next/image'
import { Info } from 'lucide-react'

interface TargetConfig {
  name: string
  min: number
  max: number
  unit?: string
  infoText: string
}

const INITIAL_TARGET_TYPES: TargetConfig[] = [
  { 
    name: "Overall Performance", 
    min: 10, 
    max: 100, 
    unit: "%",
    infoText: "The minimum average score (%) your team members must achieve across their required number of training calls to unlock the next avatar. For example, if set to 70%, they must maintain at least a 70% average score."
  },
  { 
    name: "Number of calls", 
    min: 1, 
    max: 50,
    infoText: "The minimum number of training calls your team members must complete while maintaining the target performance score. These calls must be completed to qualify for avatar progression."
  },
  { 
    name: "Call length", 
    min: 5, 
    max: 30, 
    unit: "minutes",
    infoText: "Set the length of each training session in minutes. This determines how long team members have to demonstrate their skills in each practice call."
  }
]

export default function SetCallTargetsModal() {
  const [activeCategory] = useState<'intermediate' | 'expert'>('intermediate')
  const [targets, setTargets] = useState<string[]>(INITIAL_TARGET_TYPES.map(() => ""))
  const [callExtendAllowed, setCallExtendAllowed] = useState(true)
  const [showInfo, setShowInfo] = useState<number | null>(null)
  const [memberId, setMemberId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const popupRef = useRef<HTMLDivElement>(null)

useEffect(() => {
  const initializeMemberData = async () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const memberId = params.get('memberId');
      
      if (!memberId) {
        throw new Error('No memberId found in URL');
      }
      
      setMemberId(memberId);
      
      if (memberId) {
        const response = await fetch(`/api/performance-goals?memberId=${memberId}`);
        if (response.ok) {
          const data = await response.json();
          if (data) {
            setTargets([
              data.overall_performance_goal.toString(),
              data.number_of_calls_average.toString(),
              data.call_length?.toString() || ""
            ]);
            setCallExtendAllowed(data.call_extend_allowed ?? true);
          }
        }
      }
    } catch (err) {
      console.error('Member data error:', err);
      setError('Error loading member data. Please refresh the page.');
    }
  }

  initializeMemberData();
}, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setShowInfo(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!memberId) {
    setError('Member ID not available. Please refresh the page.');
    return;
  }

  setIsLoading(true);
  setError(null);

  try {
    const response = await fetch('/api/performance-goals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        memberId,  // Changed from memberstackId
        overall_performance_goal: Number(targets[0]),
        number_of_calls_average: Number(targets[1]),
        call_length: Number(targets[2]),
        call_extend_allowed: callExtendAllowed
      })
    });

    if (!response.ok) {
      throw new Error('Failed to save targets');
    }

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  } catch (err) {
    console.error('Error saving targets:', err);
    setError('Failed to save targets. Please try again.');
  } finally {
    setIsLoading(false);
  }
};

  const getGradientColor = (value: number): string => {
    if (value < 50) return 'from-[#50c2aa] to-[#50c2aa]'
    if (value < 80) return 'from-[#f8b923] to-[#f8b923]'
    return 'from-[#ff0000] to-[#ff0000]'
  }

  const updateTargets = (index: number, value: string) => {
    const newTargets = [...targets]
    newTargets[index] = value
    setTargets(newTargets)
  }

  const InfoPopup: React.FC<{ text: string }> = ({ text }) => (
    <div 
      ref={popupRef} 
      className="absolute left-0 mt-2 p-3 bg-white border border-gray-200 rounded-md shadow-lg z-10 w-64"
    >
      <p className="text-xs text-gray-600 leading-relaxed">{text}</p>
    </div>
  )

  const renderTargetInputs = () => {
    return (
      <>
        {INITIAL_TARGET_TYPES.map((target, index) => (
          <div key={`${activeCategory}-${index}`} className="mb-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Label
                  htmlFor={`${activeCategory}-target-${index}`}
                  className="text-[#000000] text-xs sm:text-sm font-montserrat font-semibold"
                >
                  {target.name}
                </Label>
                <div className="relative">
                  <Info
                    className="w-4 h-4 text-[#5b06be] cursor-pointer hover:text-[#4a05a0] transition-colors"
                    onClick={() => setShowInfo(showInfo === index ? null : index)}
                  />
                  {showInfo === index && <InfoPopup text={target.infoText} />}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative flex-1 h-2">
                  <div className="absolute inset-0 bg-[#f8b922] rounded-full"></div>
                  <div 
                    className="absolute inset-0 bg-gradient-to-r rounded-full pointer-events-none" 
                    style={{
                      clipPath: `inset(0 ${100 - (Number(targets[index] || target.min) / target.max) * 100}% 0 0)`,
                    }}
                  >
                    <div className={`w-full h-full ${getGradientColor(Number(targets[index] || target.min))}`}></div>
                  </div>
                  <input
                    id={`${activeCategory}-target-${index}`}
                    type="range"
                    min={target.min}
                    max={target.max}
                    value={targets[index] || target.min}
                    onChange={(e) => updateTargets(index, e.target.value)}
                    className="absolute inset-0 w-full h-full appearance-none bg-transparent focus:outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-gray-300 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-150 [&::-webkit-slider-thumb]:ease-in-out [&::-webkit-slider-thumb]:hover:scale-110 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-gray-300 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:transition-all [&::-moz-range-thumb]:duration-150 [&::-moz-range-thumb]:ease-in-out [&::-moz-range-thumb]:hover:scale-110"
                  />
                </div>
                <span className="text-lg font-medium min-w-[30px]">
                  {targets[index] || target.min}
                </span>
                {target.unit && (
                  <span className="text-lg text-gray-600 min-w-[80px]">
                    {target.unit}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Call Extension Toggle */}
        <div className="mb-8 pt-2 border-t border-gray-100">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Label
                  htmlFor="call-extend-toggle"
                  className="text-[#000000] text-xs sm:text-sm font-montserrat font-semibold"
                >
                  Allow users to extend their calls
                </Label>
                <div className="relative">
                  <Info
                    className="w-4 h-4 text-[#5b06be] cursor-pointer hover:text-[#4a05a0] transition-colors"
                    onClick={() => setShowInfo(showInfo === 3 ? null : 3)}
                  />
                  {showInfo === 3 && (
                    <InfoPopup 
                      text="When enabled, users can request additional time during their training calls if needed." 
                    />
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Switch
  id="call-extend-toggle"
  checked={callExtendAllowed}
  onCheckedChange={setCallExtendAllowed}
  className="data-[state=checked]:bg-[#5b06be] data-[state=unchecked]:bg-gray-200 peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
/>
                <span className="text-sm text-gray-600 min-w-[60px]">
                  {callExtendAllowed ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
  <div className="relative">
    <div className="w-full max-w-[600px] bg-white flex flex-col rounded-[20px] overflow-hidden px-3 sm:px-5 py-2 sm:py-3 relative opacity-50">
      <div className="w-full bg-white rounded-[20px] px-4 py-2 sm:py-3">
        <div className="flex items-start space-x-2 -mt-1">
          <div className="flex-shrink-0 mt-[2px]">
            <Image
              src="https://res.cloudinary.com/drkudvyog/image/upload/v1733749804/Target_icon_ghep9p.png"
              alt="Target icon"
              width={24}
              height={24}
            />
          </div>
          <div className="flex-1">
            <h2 className="text-[18px] md:text-[16px] sm:text-[14px] font-extrabold font-montserrat leading-tight text-[#5b06be] mb-1">
              Set Performance Goals for Your Team to Unlock Next Avatar
            </h2>
            <p className="text-[14px] md:text-[14px] sm:text-[14px] font-bold font-montserrat text-gray-600 leading-snug">
              Help your team progress by setting minimum performance requirements for their training sessions.
            </p>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col">
          <div className="py-2 sm:py-3 px-8">
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}
            {renderTargetInputs()}
          </div>
          <div className="p-8 border-t flex justify-center mt-auto">
            <Button
              onClick={handleSubmit}
              disabled={isLoading || saveSuccess}
              className={`
                px-6 h-[45px] rounded-[20px] text-lg 
                font-semibold shadow-lg transition-all 
                duration-200 hover:scale-[1.02] 
                w-full max-w-xs border-2
                ${saveSuccess 
                  ? 'bg-[#5b06be] text-white border-[#5b06be] hover:bg-[#4a05a0]' 
                  : 'bg-white text-black hover:bg-gray-50'
                }
              `}
            >
              {isLoading ? 'Saving...' : saveSuccess ? 'Success!' : 'Save Targets'}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>

    {/* Blur overlay with lock icon and text */}
    <div className="absolute inset-0 backdrop-blur-[2px] bg-white/30 rounded-[20px] flex flex-col items-center justify-center gap-4">
      <Image
        src="https://res.cloudinary.com/dmbzcxhjn/image/upload/6757257c556bbe29ac199a32_Team_View_icon_duha_svjfrk.png"
        alt="Lock icon"
        width={48}
        height={48}
      />
      <p className="text-[#000000] text-center text-sm sm:text-base font-montserrat font-semibold px-4">
        Start Building Your Team to Use Advanced Functions
       </p>
    </div>
  </div>
) 
} 
