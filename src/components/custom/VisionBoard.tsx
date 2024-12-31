'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ArrowLeft, ArrowRight, RotateCw, TrendingUp, Palette, Calendar, Clock, Upload, X, Lock, Maximize2 } from 'lucide-react'
import { cn } from "@/lib/utils"
import CustomCalendar from "./custom-calendar"
import AchievementContent, { type AchievementContentProps } from './achievement-showcase'
import { debounce } from 'lodash'
import LoadingSpinner from '@/components/ui/loading-spinner'
import { getRandomQuote, shouldUpdateQuote } from '@/lib/quoteUtils'
import { getRandomFocusMessage } from '@/lib/focusMessages'

const ClientOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <LoadingSpinner />;
  }

  return <>{children}</>;
};

const MobileNotice = () => (
  <Card className="p-6 bg-white rounded-[20px] shadow-lg text-center">
    <div className="flex flex-col items-center gap-4">
      <Lock className="w-12 h-12 text-[#5b06be]" />
      <h2 className="text-xl font-semibold text-[#5b06be]">Desktop Experience Only</h2>
      <p className="text-gray-600">The Interactive Vision Board is optimized for desktop viewing. Please access this feature from a larger screen for the best experience.</p>
    </div>
  </Card>
);

interface ActivityCircle {
  value: number
  label: string
  progress: number
  color: string
  icon: 'clock' | 'calendar'
  max: number
}

interface Achievement {
  name: string
  progress: number
  badge?: string
  locked?: boolean
}

interface VisionItem {
  id: string
  src: string
  x: number
  y: number
  width: number
  height: number
  zIndex: number
  aspectRatio: number
}

interface VisionBoardContentProps {
  glowColor: string
  fileInputRef: React.RefObject<HTMLInputElement>
  boardRef: React.RefObject<HTMLDivElement>
  isFullScreen: boolean
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  toggleFullScreen: () => void
  handleInteractionMove: (event: React.MouseEvent) => void
  handleInteractionEnd: () => void
  visionItems: VisionItem[]
  handleInteractionStart: (event: React.MouseEvent, id: string, type: 'move' | 'resize', direction?: string) => void
  deleteItem: (id: string) => void
  memberId: string | null
  setGlowColor: (color: string) => void
  isMobile: boolean
}

const VisionBoardContent: React.FC<VisionBoardContentProps> = ({
  glowColor,
  fileInputRef,
  boardRef,
  isFullScreen,
  handleFileUpload,
  toggleFullScreen,
  handleInteractionMove,
  handleInteractionEnd,
  visionItems,
  handleInteractionStart,
  deleteItem,
  memberId,
  setGlowColor,
  isMobile
}) => {
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <img 
            src="https://res.cloudinary.com/drkudvyog/image/upload/v1733941009/Interactie_vision_board_icon_nja1aq.png"
            alt="Vision Board Icon"
            className="h-6 w-6"
          />
          <h2 className="text-2xl font-semibold text-[#000000]">Interactive Vision Board</h2>
        </div>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger>
             <Button
               variant="outline" 
               size="sm"
               className="bg-[#ffffff] hover:bg-[#ffffff] text-black border-[#ffffff] gap-2 rounded-xl"
            >
             <img 
               src="https://res.cloudinary.com/drkudvyog/image/upload/v1733772222/Color_icon_duha_d6sapd.png"
               alt="Color"
               className="w-4 h-4" 
             />
             Color
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-[9999]" align="end">
              <ColorPicker 
                color={glowColor} 
                onChange={async (newColor: string) => {
                  try {
                    setGlowColor(newColor);
                    
                    await fetch('/api/vision-board', {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        memberstack_id: memberId,
                        board_color: newColor
                      })
                    });
                  } catch (error) {
                    console.error('Color update error:', error);
                  }
                }}
              />
            </PopoverContent>
          </Popover>
          <Button
              variant="outline"
              size="sm"
              className="bg-[#ffffff] hover:bg-[#ffffff] text-black border-[#ffffff] gap-2 rounded-xl"
              onClick={() => fileInputRef.current?.click()}
            >
              <img 
              src="https://res.cloudinary.com/drkudvyog/image/upload/v1733750646/upload_icon_bjsfxf.png"
              alt="Upload"
              className="w-4 h-4"
            />
            Add Vision
          </Button>
          <Button
              variant="outline"
              size="sm"
              className="bg-[#ffffff] hover:bg-[#ffffff] text-black border-[#ffffff] gap-2 rounded-xl"
              onClick={toggleFullScreen}
          >
            <img 
              src="https://res.cloudinary.com/drkudvyog/image/upload/v1733777679/Full_screen_icon_duha_qrdpsa.png"
              alt="Full Screen"
              className="w-4 h-4"
            />
            {isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
          </Button>
        </div>
      </div>

      <div 
  ref={boardRef} 
  className={`relative w-full rounded-3xl bg-[#f0f1f7] shadow-lg border overflow-hidden min-h-[512px]`}
  style={{
    borderColor: glowColor,
    boxShadow: `0 0 10px ${glowColor}, 0 0 20px ${glowColor.replace('0.3', '0.2')}`,
    height: isFullScreen ? '80vh' : 'auto'
  }}
  onMouseMove={handleInteractionMove}
  onMouseUp={handleInteractionEnd}
  onMouseLeave={handleInteractionEnd}
>
        <div className="relative w-full h-full">
          {visionItems.map((item) => (
            <div
              key={item.id}
              className={`absolute cursor-move group select-none`}
              style={{
                left: `${item.x}px`,
                top: `${item.y}px`,
                width: `${item.width}px`,
                height: `${item.height}px`,
                zIndex: item.zIndex,
              }}
              onMouseDown={(e) => handleInteractionStart(e, item.id, 'move')}
            >
              <div 
                className="relative w-full h-full rounded-2xl overflow-hidden border shadow-lg transition-all duration-300"
                style={{
                  borderColor: glowColor,
                  boxShadow: `0 0 10px ${glowColor}, 0 0 20px ${glowColor.replace('0.3', '0.2')}`
                }}
              >
                <img 
                  src={item.src} 
                  alt="Vision Item" 
                  className="w-full h-full object-cover select-none" 
                  draggable="false"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#f8b922] hover:bg-[#f9a238] text-white"
                  onClick={() => deleteItem(item.id)}
                >
                  <X />
                </Button>
                <div className="resize-handle resize-handle-tl" onMouseDown={(e) => handleInteractionStart(e, item.id, 'resize', 'top-left')} />
                <div className="resize-handle resize-handle-tr" onMouseDown={(e) => handleInteractionStart(e, item.id, 'resize', 'top-right')} />
                <div className="resize-handle resize-handle-bl" onMouseDown={(e) => handleInteractionStart(e, item.id, 'resize', 'bottom-left')} />
                <div className="resize-handle resize-handle-br" onMouseDown={(e) => handleInteractionStart(e, item.id, 'resize', 'bottom-right')} />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />
    </div>
  );
};

const getMemberId = async () => {
  try {
    // Try Memberstack first
    const memberstack = (window as any).memberstack;
    if (memberstack) {
      const member = await memberstack.getCurrentMember();
      if (member) return member.id;
    }
    
    // Fallback to URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const memberId = urlParams.get('memberId');
    if (memberId) return memberId;
    
    // Final fallback
    return 'test123';
  } catch (error) {
    console.log('Using test member ID');
    return 'test123';
  }
};

const UploadIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
)

const PaletteIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="7" r="1" />
    <circle cx="17" cy="12" r="1" />
    <circle cx="7" cy="12" r="1" />
    <circle cx="12" cy="17" r="1" />
    <path d="M3 12h4m10 0h4M12 3v4m0 10v4" />
  </svg>
)

const TrashIcon = () => (
  <svg 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2"
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M4 6h16v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6zM7 3h10M9 3v3M15 3v3M9 14v-4M15 14v-4" />
  </svg>
)

function ColorPicker({ color, onChange }: { color: string, onChange: (color: string) => void }) {
  const [hue, setHue] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const pickerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (pickerRef.current) {
      const rect = pickerRef.current.getBoundingClientRect()
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
      const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height))
      setPosition({ x, y })
      const newColor = `hsl(${hue}, ${x * 100}%, ${100 - y * 100}%)`
      onChange(newColor)
    }
  }

  const handleHueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHue = parseInt(e.target.value)
    setHue(newHue)
    const newColor = `hsl(${newHue}, ${position.x * 100}%, ${100 - position.y * 100}%)`
    onChange(newColor)
  }

  return (
    <div className="p-4 w-64 space-y-4">
      <div
        ref={pickerRef}
        className="w-full h-40 rounded-lg cursor-crosshair relative"
        style={{
          background: `linear-gradient(to bottom, white, transparent),
                      linear-gradient(to right, transparent, hsl(${hue}, 100%, 50%))`,
          backgroundColor: 'black'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={(e) => e.buttons === 1 && handleMouseDown(e)}
      >
        <div
          className="w-4 h-4 rounded-full border-2 border-white absolute -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${position.x * 100}%`,
            top: `${position.y * 100}%`,
            backgroundColor: color
          }}
        />
      </div>
      <input
        type="range"
        min="0"
        max="360"
        value={hue}
        onChange={handleHueChange}
        className="color-slider w-full h-3 rounded-lg appearance-none cursor-pointer"
      />
    </div>
  )
}

function VisionBoard() {
  const [currentDate] = useState(new Date(2024, 10, 17))
  const [memberId, setMemberId] = useState<string | null>(null);
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0)
  const [activeAchievementCategory, setActiveAchievementCategory] = useState('practice-streak')
  const [visionItems, setVisionItems] = useState<VisionItem[]>([])
  const [maxZIndex, setMaxZIndex] = useState(0)
  const [activeItem, setActiveItem] = useState<string | null>(null)
  const [interactionType, setInteractionType] = useState<'move' | 'resize' | null>(null)
  const [interactionStart, setInteractionStart] = useState<{ x: number, y: number } | null>(null)
  const [resizeDirection, setResizeDirection] = useState<string | null>(null)
  const [glowColor, setGlowColor] = useState('rgba(85, 107, 199, 0.3)')
  const boardRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [isLoading, setIsLoading] = useState(true);
  const [quote, setQuote] = useState({ text: "", author: "" });

  const updateQuote = () => {
    const newQuote = getRandomQuote();
    setQuote(newQuote);
    localStorage.setItem('dailyQuote', JSON.stringify({
      quote: newQuote,
      timestamp: new Date().toISOString()
    }));
  };

  const [focusMessage, setFocusMessage] = useState("");

  const [activities, setActivities] = useState<ActivityCircle[]>([
    { value: 0, label: 'TODAY', progress: 0, color: '#5b06be', icon: 'clock', max: 10 },
    { value: 0, label: 'THIS WEEK', progress: 0, color: '#f8b922', icon: 'calendar', max: 50 },
    { value: 0, label: 'THIS MONTH', progress: 0, color: '#5b06be', icon: 'calendar', max: 100 },
    { value: 0, label: 'THIS YEAR', progress: 0, color: '#ce00cb', icon: 'calendar', max: 1000 },
]);

const [achievementData, setAchievementData] = useState<AchievementContentProps['achievements']>({
  streakAchievements: [],
  callAchievements: [],
  activityAchievements: [],
  leagueAchievements: []
});

const [streakData, setStreakData] = useState({
  current: 0,
  consistency: '0%',
  longest: 0,
  dates: []
});

  const updateFocusMessage = () => {
    const newMessage = getRandomFocusMessage();
    setFocusMessage(newMessage);
    localStorage.setItem('dailyFocus', JSON.stringify({
      message: newMessage,
      timestamp: new Date().toISOString()
    }));
  };

  // Quote effect
  useEffect(() => {
    const stored = localStorage.getItem('dailyQuote');
    if (stored) {
      const { quote: storedQuote, timestamp } = JSON.parse(stored);
      if (shouldUpdateQuote(timestamp)) {
        updateQuote();
      } else {
        setQuote(storedQuote);
      }
    } else {
      updateQuote();
    }

    const interval = setInterval(() => {
      const stored = localStorage.getItem('dailyQuote');
      if (stored) {
        const { timestamp } = JSON.parse(stored);
        if (shouldUpdateQuote(timestamp)) {
          updateQuote();
        }
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

// Focus message effect (separate)
useEffect(() => {
  const stored = localStorage.getItem('dailyFocus');
  if (stored) {
    const { message: storedMessage, timestamp } = JSON.parse(stored);
    if (shouldUpdateQuote(timestamp)) {
      updateFocusMessage();
    } else {
      setFocusMessage(storedMessage);
    }
  } else {
    updateFocusMessage();
  }

  const interval = setInterval(() => {
    const stored = localStorage.getItem('dailyFocus');
    if (stored) {
      const { timestamp } = JSON.parse(stored);
      if (shouldUpdateQuote(timestamp)) {
        updateFocusMessage();
      }
    }
  }, 60000);

  return () => clearInterval(interval);
}, []);

useEffect(() => {
    getMemberId().then(setMemberId);
  }, []);

useEffect(() => {
    const loadVisionBoard = async () => {
    setIsLoading(true);
      try {
        const memberId = await getMemberId();
        
        const response = await fetch(`/api/vision-board?memberId=${memberId}`)
        
        if (!response.ok) {
          console.error('Failed to load vision board')
          return
        }
        
        const data = await response.json()
        if (data && data.length > 0) {
          setVisionItems(data.map((item: any) => ({
            id: item.id.toString(),
            src: item.image_url,
            x: item.x_position,
            y: item.y_position,
            width: item.width,
            height: item.height,
            zIndex: item.z_index,
            aspectRatio: item.width / item.height
          })))
          
          setGlowColor(data[0]?.board_color || 'rgba(85, 107, 199, 0.3)')
        }
      } catch (error) {
        console.error('Load error:', error)
      } finally {
        setIsLoading(false);
      }
    }
    
    loadVisionBoard()
}, [])

  const calendar = Array.from({ length: 30 }, (_, i) => i + 1)
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

useEffect(() => {
  const fetchStreakData = async () => {
    try {
      const memberId = await getMemberId();
      const response = await fetch(`/api/streaks?memberId=${memberId}`);
      if (response.ok) {
        const data = await response.json();
        setStreakData(data);
      }
    } catch (error) {
      console.error('Error fetching streak data:', error);
    }
  };

  fetchStreakData();
}, []);

useEffect(() => {
  const fetchActivityData = async () => {
    try {
      const memberId = await getMemberId();
      const response = await fetch(`/api/activity-sessions?memberId=${memberId}`);
      if (response.ok) {
        const data = await response.json();
        
        setActivities([
          { value: data.today, label: 'TODAY', progress: (data.today / 10) * 100, color: '#5b06be', icon: 'clock', max: 10 },
          { value: data.week, label: 'THIS WEEK', progress: (data.week / 50) * 100, color: '#5b06be', icon: 'calendar', max: 50 },
          { value: data.month, label: 'THIS MONTH', progress: (data.month / 100) * 100, color: '#5b06be', icon: 'calendar', max: 100 },
          { value: data.year, label: 'THIS YEAR', progress: (data.year / 1000) * 100, color: '#5b06be', icon: 'calendar', max: 1000 }
        ]);
      }
    } catch (error) {
      console.error('Error fetching activity data:', error);
    }
  };

  fetchActivityData();
}, []);

useEffect(() => {
  const fetchAchievementData = async () => {
    try {
      const memberId = await getMemberId();
      const response = await fetch(`/api/achievements?memberId=${memberId}`);
      if (response.ok) {
        const data = await response.json();
        setAchievementData({
          streakAchievements: data.streakAchievements || [],
          callAchievements: data.callAchievements || [],
          activityAchievements: data.activityAchievements || [],
          leagueAchievements: data.leagueAchievements || []
        });
      }
    } catch (error) {
      console.error('Error fetching achievement data:', error);
    }
  };

  fetchAchievementData();
}, []);

  const nextActivitySlide = () => {
    setCurrentActivityIndex((prev) => (prev + 1) % activities.length)
  }

  const prevActivitySlide = () => {
    setCurrentActivityIndex((prev) => (prev - 1 + activities.length) % activities.length)
  }

  const getProgressBarColor = (progress: number) => {
    if (progress === 100) return 'bg-[#DAF0F2]' // Blue Diamond
    if (progress >= 70) return 'bg-[#00c157]'   // Green
    if (progress >= 40) return 'bg-[#f8b922]'   // Orange
    return 'bg-[#ef4444]'                       // Red
  }

  const CircularProgress = ({ value, max, color, children }: { value: number; max: number; color: string; children: React.ReactNode }) => {
    const progress = (value / max) * 100
    const radius = 80
    const strokeWidth = 8
    const normalizedRadius = radius - strokeWidth * 2
    const circumference = normalizedRadius * 2 * Math.PI
    const strokeDashoffset = circumference - ((progress / 100) * circumference * 0.75) // Multiply by 0.75 to only show 3/4 of the circle
    const rotation = -135 // Start at -135 degrees to position the gap at the bottom-left

    return (
      <div className="relative inline-flex items-center justify-center">
        <div 
          className="absolute inset-0 rounded-full opacity-90" 
          style={{ backgroundColor: color }}
        />
        <svg
          height={radius * 2}
          width={radius * 2}
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <circle
            stroke="rgba(255, 255, 255, 0.2)"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
          />
          <circle
            stroke="white"
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.3s ease' }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          {children}
        </div>
      </div>
    )
  }

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || !boardRef.current) return

    try {
      const memberId = await getMemberId();

      Array.from(files).forEach((file) => {
        const reader = new FileReader()
        reader.onload = async (e) => {
          const img = new Image()
          img.onload = async () => {
            const aspectRatio = img.width / img.height
            const height = 300
            const width = height * aspectRatio
            const board = boardRef.current!.getBoundingClientRect()
            
            const maxX = board.width - width
            const maxY = board.height - height
            const x = Math.min(Math.max(0, Math.random() * maxX), maxX)
            const y = Math.min(Math.max(0, Math.random() * maxY), maxY)
            
            try {
              const response = await fetch('/api/vision-board', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  memberstack_id: memberId,
                  image_url: e.target?.result,
                  x_position: x,
                  y_position: y,
                  width,
                  height,
                  z_index: maxZIndex + 1,
                  board_color: glowColor
                })
              })

              if (!response.ok) throw new Error('Failed to save image')
              
              const savedItem = await response.json()
              const newItem: VisionItem = {
                id: savedItem.id.toString(),
                src: savedItem.image_url,
                x: savedItem.x_position,
                y: savedItem.y_position,
                width: savedItem.width,
                height: savedItem.height,
                zIndex: savedItem.z_index,
                aspectRatio
              }
              
              setVisionItems(prev => [...prev, newItem])
              setMaxZIndex(prev => prev + 1)
            } catch (error) {
              console.error('Failed to save image:', error)
            }
          }
          img.src = e.target?.result as string
        }
        reader.readAsDataURL(file)
      })
    } catch (error) {
      console.error('Upload error:', error)
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
}, [maxZIndex, glowColor])

const updateItemPosition = useCallback(async (id: string, deltaX: number, deltaY: number) => {
  if (!memberId) return;
  
  setVisionItems(prev => {
    const newItems = prev.map(item => {
      if (item.id === id && boardRef.current) {
        const board = boardRef.current.getBoundingClientRect();
        const newX = Math.min(Math.max(0, item.x + deltaX), board.width - item.width);
        const newY = Math.min(Math.max(0, item.y + deltaY), board.height - item.height);
        
        fetch('/api/vision-board', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: parseInt(id),
            memberstack_id: memberId,
            x_position: newX,
            y_position: newY
          })
        });

        return { ...item, x: newX, y: newY };
      }
      return item;
    });
    return newItems;
  });
}, [memberId]);

const updateItemSize = useCallback((id: string, deltaWidth: number, deltaHeight: number, direction: string) => {
  if (!memberId) return;

  // Keep track of the previous state for rollback
  let previousState: VisionItem | null = null;

  setVisionItems(prev => {
    const newItems = prev.map(item => {
      if (item.id === id && boardRef.current) {
        // Store the previous state
        previousState = { ...item };
        
        const board = boardRef.current.getBoundingClientRect()
        let newWidth = item.width
        let newHeight = item.height
        let newX = item.x
        let newY = item.y

        // Calculate new dimensions (existing logic)
        if (direction.includes('right')) {
          newWidth = Math.min(Math.max(100, item.width + deltaWidth), board.width - item.x)
        } else if (direction.includes('left')) {
          const potentialWidth = Math.min(Math.max(100, item.width - deltaWidth), item.x + item.width)
          newX = item.x + (item.width - potentialWidth)
          newWidth = potentialWidth
        }

        if (direction.includes('bottom')) {
          newHeight = Math.min(Math.max(100, item.height + deltaHeight), board.height - item.y)
        } else if (direction.includes('top')) {
          const potentialHeight = Math.min(Math.max(100, item.height - deltaHeight), item.y + item.height)
          newY = item.y + (item.height - potentialHeight)
          newHeight = potentialHeight
        }

        // Maintain aspect ratio
        const aspectRatio = item.aspectRatio
        if (newWidth / newHeight > aspectRatio) {
          newWidth = newHeight * aspectRatio
        } else {
          newHeight = newWidth / aspectRatio
        }

        // Trigger debounced save
        debouncedSaveSize(id, newX, newY, newWidth, newHeight, previousState);

        return { ...item, width: newWidth, height: newHeight, x: newX, y: newY }
      }
      return item
    });
    return newItems;
  });
}, [memberId]);

// Debounced save function
const debouncedSaveSize = useCallback(
  debounce(async (
    id: string, 
    x: number, 
    y: number, 
    width: number, 
    height: number, 
    previousState: VisionItem
  ) => {
    try {
      const response = await fetch('/api/vision-board', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: parseInt(id),
          memberstack_id: memberId,
          x_position: x,
          y_position: y,
          width: width,
          height: height
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update dimensions');
      }
    } catch (error) {
      console.error('Failed to save dimensions:', error);
      
      // Rollback on failure
      if (previousState) {
        setVisionItems(prev => prev.map(item => 
          item.id === id ? previousState : item
        ));
      }
    }
  }, 500), // 500ms debounce delay
  [memberId]
);

// Cleanup debounced function on unmount
useEffect(() => {
  return () => {
    debouncedSaveSize.cancel();
  };
}, [debouncedSaveSize]);

  const bringToFront = useCallback((id: string) => {
    setMaxZIndex(prev => prev + 1)
    setVisionItems(prev => prev.map(item => item.id === id ? { ...item, zIndex: maxZIndex + 1 } : item))
  }, [maxZIndex])

 const deleteItem = useCallback(async (id: string) => {
  if (!memberId) return;

  try {
    const response = await fetch(`/api/vision-board?id=${id}&memberstack_id=${memberId}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      setVisionItems(prev => prev.filter(item => item.id !== id));
    }
  } catch (error) {
    console.error('Delete error:', error);
  }
}, [memberId]);

  const handleInteractionStart = (event: React.MouseEvent, id: string, type: 'move' | 'resize', direction?: string) => {
    if (event.button !== 0) return // Only handle left mouse button
    event.stopPropagation()
    event.preventDefault()
    setActiveItem(id)
    setInteractionType(type)
    setInteractionStart({ x: event.clientX, y: event.clientY })
    if (type === 'resize' && direction) {
      setResizeDirection(direction)
    }
    bringToFront(id)
  }

  const handleInteractionMove = (event: React.MouseEvent) => {
    if (!activeItem || !interactionStart) return

    const deltaX = event.clientX - interactionStart.x
    const deltaY = event.clientY - interactionStart.y

    if (interactionType === 'move') {
      updateItemPosition(activeItem, deltaX, deltaY)
    } else if (interactionType === 'resize' && resizeDirection) {
      updateItemSize(activeItem, deltaX, deltaY, resizeDirection)
    }

    setInteractionStart({ x: event.clientX, y: event.clientY })
  }

  const handleInteractionEnd = () => {
    setActiveItem(null)
    setInteractionType(null)
    setInteractionStart(null)
    setResizeDirection(null)
  }

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      handleInteractionEnd()
    }

    window.addEventListener('mouseup', handleGlobalMouseUp)
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [])

const toggleFullScreen = () => {
  if (!isFullScreen) {
    // Request fullscreen
    window.parent.postMessage('requestFullscreen', '*');
  } else {
    // Send message to parent to exit fullscreen
    window.parent.postMessage('exitFullscreen', '*');
  }
  setIsFullScreen(prev => !prev);
};

useEffect(() => {
  const handleFullscreenChange = () => {
    setIsFullScreen(!!document.fullscreenElement);
  };
  document.addEventListener('fullscreenchange', handleFullscreenChange);
  return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
}, []);

useEffect(() => {
  const handleMessage = (event: MessageEvent) => {
    if (event.data === 'fullscreenChanged') {
      setIsFullScreen(false);
    }
  };
  window.addEventListener('message', handleMessage);
  return () => window.removeEventListener('message', handleMessage);
}, []);

useEffect(() => {
  const updateHeight = () => {
    const contentHeight = document.documentElement.scrollHeight;
    window.parent.postMessage({ type: 'setHeight', height: contentHeight }, '*');
  };

const resizeObserver = new ResizeObserver(() => {
    updateHeight();
  });

  resizeObserver.observe(document.body);
  updateHeight();
  return () => {
    resizeObserver.disconnect();
  };
}, []);

return (
  <ClientOnly>
    <>
      {isLoading ? (
        <LoadingSpinner />
      ) : isFullScreen ? (
      <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center">
        <Card className="w-[95vw] h-[95vh] bg-white rounded-[20px] shadow-lg overflow-hidden">
          <div className="p-4 h-full">
            <VisionBoardContent
              glowColor={glowColor}
              fileInputRef={fileInputRef}
              boardRef={boardRef}
              isFullScreen={isFullScreen}
              handleFileUpload={handleFileUpload}
              toggleFullScreen={toggleFullScreen}
              handleInteractionMove={handleInteractionMove}
              handleInteractionEnd={handleInteractionEnd}
              visionItems={visionItems}
              handleInteractionStart={handleInteractionStart}
              deleteItem={deleteItem}
              memberId={memberId}
              setGlowColor={setGlowColor}
              isMobile={isMobile}
            />
          </div>
        </Card>
      </div>
    ) : (
      <div className="relative w-full bg-[#f0f1f7]">
        <div className="max-w-7xl mx-auto space-y-4">
          <Card className="p-4 bg-white rounded-[20px] shadow-lg">
            <VisionBoardContent
              glowColor={glowColor}
              fileInputRef={fileInputRef}
              boardRef={boardRef}
              isFullScreen={isFullScreen}
              handleFileUpload={handleFileUpload}
              toggleFullScreen={toggleFullScreen}
              handleInteractionMove={handleInteractionMove}
              handleInteractionEnd={handleInteractionEnd}
              visionItems={visionItems}
              handleInteractionStart={handleInteractionStart}
              deleteItem={deleteItem}
              memberId={memberId}
              setGlowColor={setGlowColor}
              isMobile={isMobile}
            />
          </Card>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <CustomCalendar streakData={streakData} />

            <div className="space-y-2 flex flex-col h-full">
  <Card className="p-6 bg-white rounded-[20px] shadow-lg flex-1">
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-2">
        <img 
          src="https://res.cloudinary.com/drkudvyog/image/upload/v1733953951/Areas_of_improvement_icon_duha_u5o65j.png"
          alt="Quote of the Day Icon"
          className="h-6 w-6"
        />
        <h2 className="text-2xl font-bold text-[#000000]">Quote of the Day</h2>
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        className="hover:bg-transparent text-gray-400 hover:text-gray-600"
        onClick={updateQuote}
      >
        <RotateCw className="w-5 h-5" />
      </Button>
    </div>
    <div className="h-[calc(2.5*4rem+1*1rem)]">
      <div className="p-4 bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] h-full flex flex-col justify-center">
        <p 
          className="text-center font-medium flex-grow flex items-center justify-center"
          style={{
            fontSize: 'clamp(0.8rem, 2.5vw, 1rem)',
            lineHeight: '1.4',
            maxWidth: '100%',
          }}
        >
          {quote.text && `"${quote.text}"`}
        </p>
        {quote.author && (
          <p className="text-right font-semibold text-gray-700 mt-2 pr-4">
            {quote.author}
          </p>
        )}
      </div>
    </div>
  </Card>

  <Card className="p-6 bg-white rounded-[20px] shadow-lg flex-1">
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-2">
        <img 
          src="https://res.cloudinary.com/drkudvyog/image/upload/v1733951551/Areas_of_Improvement_icon_duha_kplce1.png"
          alt="Today's Focus Icon"
          className="h-6 w-6"
        />
        <h2 className="text-2xl font-bold text-[#000000]">Daily Insight</h2>
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        className="hover:bg-transparent text-gray-400 hover:text-gray-600"
        onClick={updateFocusMessage}
      >
        <RotateCw className="w-5 h-5" />
      </Button>
    </div>
    <div className="h-[calc(2.5*4rem+1*1rem)]">
      <div className="p-4 bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] h-full flex items-center justify-center">
        <p className="text-center font-medium"
          style={{
            fontSize: 'clamp(0.7rem, 2vw, 0.9rem)',
            lineHeight: '1.2',
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: '3',
            WebkitBoxOrient: 'vertical',
          }}
        >
          {focusMessage}
        </p>
      </div>
    </div>
  </Card>
  </div>


            <AchievementContent achievements={achievementData} />

            <Card className="p-2 bg-white rounded-[20px] shadow-lg h-[280px]">
              <div className="flex items-center gap-2 mb-6">
                <img 
                  src="https://res.cloudinary.com/drkudvyog/image/upload/v1733953590/Activity_circles_icon_duha_lfbkjx.png"
                  alt="Activity Circles Icon"
                  className="h-6 w-6"
                />
                <h2 className="text-2xl font-semibold text-[#000000]">Activity Circles</h2>
              </div>
              <div className="relative flex justify-center items-center mb-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute -left-2 top-1/2 -translate-y-1/2 hover:bg-transparent"
                  onClick={prevActivitySlide}
                >
                  <ArrowLeft className="w-4 h-4 text-gray-400" />
                </Button>

                <div className="relative">
                  <div className="rounded-full">
                    <CircularProgress
                      value={activities[currentActivityIndex].value}
                      max={activities[currentActivityIndex].max}
                      color={activities[currentActivityIndex].color}
                    >
                      <span className="text-4xl font-bold mb-2">{activities[currentActivityIndex].value}</span>
                      <span className="text-sm tracking-wide">{activities[currentActivityIndex].label}</span>
                    </CircularProgress>
                  </div>

                  <div className="absolute -top-1 -right-1 bg-white rounded-[20px] p-2 shadow-lg">
                    <Clock className="w-3 h-3 text-[#000000]" />
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute -right-2 top-1/2 -translate-y-1/2 hover:bg-transparent"
                  onClick={nextActivitySlide}
                >
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </Button>
              </div>

              <div className="flex justify-center gap-2">
                {activities.map((_, index) => (
                  <div
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${
                      index === currentActivityIndex ? 'bg-gray-600' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </Card>
          </div>
         <style jsx global>{`
  /* New height management styles */
  html, body {
    margin: 0;
    padding: 0;
    overflow: hidden;
    height: auto !important;
    min-height: 100%;
  }

  #__next {
    height: auto !important;
    min-height: 100%;
  }

  .relative.w-full.bg-[#f0f1f7] {
    height: auto !important;
    min-height: 100%;
  }

  /* Existing resize handle styles */
  .resize-handle {
    position: absolute;
    width: 10px;
    height: 10px;
    background-color: white;
    border: 1px solid #ccc;
  }
  .resize-handle-tl { top: -5px; left: -5px; cursor: nwse-resize; }
  .resize-handle-tr { top: -5px; right: -5px; cursor: nesw-resize; }
  .resize-handle-bl { bottom: -5px; left: -5px; cursor: nesw-resize; }
  .resize-handle-br { bottom: -5px; right: -5px; cursor: nwse-resize; }
  .color-slider {
    background: linear-gradient(to right, #f8b922 0%, #ce00cb 50%, #5b06be 100%);
  }
`}</style>
        </div>
      </div>
    )}
    </>
  </ClientOnly>
);
}

export default VisionBoard;