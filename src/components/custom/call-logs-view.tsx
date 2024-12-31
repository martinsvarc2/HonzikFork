"use client"

import React, { useState, useRef, useEffect, useMemo } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { PowerMomentWidget } from "@/components/custom/power-moment-widget"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Play, Pause, Pencil, BarChart2, Check, X, ArrowLeft, ChevronLeft, ChevronRight, Zap } from 'lucide-react'
import { formatDateShort } from '@/utils/formatters'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import Image from 'next/image'
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { ChevronDown } from 'lucide-react'
import { Calendar } from "./calendar"
import { Slider } from "@/components/ui/slider"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils";

interface CallLogsViewProps {
  data: CallLogData[];
}

interface CallLogData {
  name: string
  avatar: string
  date: string
  performance: number
  audioUrl: string
  audioUrlOgg: string
  transcript?: string
  engagement: number;
  objectionHandling: number;
  informationGathering: number;
  programExplanation: number;
  closingSkills: number;
  overallEffectiveness: number;
  notes?: string;
  callerImage: string; 
}

interface ImprovementArea {
  area: string;
  description: string;
}

interface Message {
  speaker: string;
  avatar: string;
  content: string;
  isAgent: boolean;
}

const callLogsData: CallLogData[] = [
  {
    name: "David Anderson",
    avatar: "DA",
    date: "2024-11-13",
    performance: 88,
    audioUrl: "/audio1.mp3",
    audioUrlOgg: "/audio1.ogg",
    transcript: "This is a sample transcript for David Anderson's call.",
    engagement: 90,
    objectionHandling: 85,
    informationGathering: 89,
    programExplanation: 87,
    closingSkills: 86,
    overallEffectiveness: 88,
    notes: "Customer showed interest in our premium package. Follow up next week to discuss financing options.",
    callerImage: "https://res.cloudinary.com/drkudvyog/image/upload/v1734301718/a-3d-cartoon-style-profile-image-of-david-a-40-yea-vzj8l6oUQwqDyV_BtWc0Eg-n9lLI1SAQfuxxvzy48S83Q_yy9urr.png"
  },
  {
    name: "Sophie Williams",
    avatar: "SW",
    date: "2024-11-16",
    performance: 91,
    audioUrl: "/audio6.mp3",
    audioUrlOgg: "/audio6.ogg",
    transcript: "This is a sample transcript for Sophie Williams's call.",
    engagement: 93,
    objectionHandling: 91,
    informationGathering: 92,
    programExplanation: 90,
    closingSkills: 89,
    overallEffectiveness: 91,
    callerImage: "https://res.cloudinary.com/drkudvyog/image/upload/v1734565206/a-3d-cartoon-style-profile-image-of-rachel-a-30-ye-tkHg-wwXRnKMpxUbbd3X5w-x8ca8T9zQB-uIbW2TAzcMg_exndep.png"
  },
  {
    name: "Rachel Taylor",
    avatar: "RT",
    date: "2024-11-13",
    performance: 92,
    audioUrl: "/audio2.mp3",
    audioUrlOgg: "/audio2.ogg",
    transcript: "This is a sample transcript for Rachel Taylor's call.",
    engagement: 92,
    objectionHandling: 90,
    informationGathering: 91,
    programExplanation: 93,
    closingSkills: 92,
    overallEffectiveness: 92,
    callerImage: "https://res.cloudinary.com/drkudvyog/image/upload/v1734565206/a-3d-cartoon-style-profile-image-of-rachel-a-30-ye-tkHg-wwXRnKMpxUbbd3X5w-x8ca8T9zQB-uIbW2TAzcMg_exndep.png"
  },
  {
    name: "John Martinez",
    avatar: "JM",
    date: "2024-11-14",
    performance: 95,
    audioUrl: "/audio3.mp3",
    audioUrlOgg: "/audio3.ogg",
    transcript: "This is a sample transcript for John Martinez's call.",
    engagement: 96,
    objectionHandling: 94,
    informationGathering: 97,
    programExplanation: 95,
    closingSkills: 96,
    overallEffectiveness: 95,
    callerImage: "https://res.cloudinary.com/drkudvyog/image/upload/v1734565214/a-3d-cartoon-style-profile-image-of-a-45-year-old--cEWhASYMTDaIRrdhScg9nw-eP1jjMAQR16vtgZMb1_GIA_slmeu2.png"
  },
  {
    name: "Emma Thompson",
    avatar: "ET",
    date: "2024-11-15",
    performance: 89,
    audioUrl: "/audio4.mp3",
    audioUrlOgg: "/audio4.ogg",
    transcript: "This is a sample transcript for Emma Thompson's call.",
    engagement: 88,
    objectionHandling: 90,
    informationGathering: 87,
    programExplanation: 91,
    closingSkills: 89,
    overallEffectiveness: 89,
    callerImage: "https://res.cloudinary.com/drkudvyog/image/upload/v1734301718/a-3d-cartoon-style-profile-image-of-david-a-40-yea-vzj8l6oUQwqDyV_BtWc0Eg-n9lLI1SAQfuxxvzy48S83Q_yy9urr.png"
  },
  {
    name: "Michael Chen",
    avatar: "MC",
    date: "2024-11-16",
    performance: 93,
    audioUrl: "/audio5.mp3",
    audioUrlOgg: "/audio5.ogg",
    transcript: "This is a sample transcript for Michael Chen's call.",
    engagement: 94,
    objectionHandling: 92,
    informationGathering: 93,
    programExplanation: 94,
    closingSkills: 91,
    overallEffectiveness: 93,
    callerImage: "https://res.cloudinary.com/drkudvyog/image/upload/v1734565206/a-3d-cartoon-style-profile-image-of-rachel-a-30-ye-tkHg-wwXRnKMpxUbbd3X5w-x8ca8T9zQB-uIbW2TAzcMg_exndep.png"
  }
]

function PowerMomentSection() {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 h-full flex flex-col"> {/* Přidáno flex flex-col */}
      <div className="flex items-center gap-2 mb-3">
        <Zap className="h-5 w-5 text-[#f8b922]" />
        <h2 className="text-lg font-semibold">Power Moment!</h2>
      </div>
      <p className="text-sm text-gray-600">
        Polite and professional tone throughout the call.
      </p>
    </div>
  )
}

export function CallLogsView({ data }: CallLogsViewProps) {
  const [showMore, setShowMore] = useState(false)
  const [feedbacks, setFeedbacks] = useState<{ [key: string]: string }>({})
  const [error, setError] = useState<Error | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState("All time");
  const [sortOption, setSortOption] = useState("standard");
  const [performanceRange, setPerformanceRange] = useState<[number, number]>([0, 100]);
  const [searchQuery, setSearchQuery] = useState(""); // Added searchQuery state
  const [feedbackText, setFeedbackText] = useState(""); // Added feedbackText state
  const [selectedTimeFrame, setSelectedTimeFrame] = useState("All time"); // Added selectedTimeFrame state
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);

  const handleSaveFeedback = (name: string, feedback: string) => {
    setFeedbacks(prev => ({ ...prev, [name]: feedback }));
  };

  const handleSelectDateRange = (range: string) => {
    setSelectedDateRange(range);
    setSelectedTimeFrame(range); // Update to set both states
    setIsCalendarOpen(false);
  };

  const handlePerformanceRangeChange = (value: number[]) => {
  if (value.length === 2) {
    setPerformanceRange([value[0], value[1]] as [number, number]);
  }
};

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filterData = (data: CallLogData[], query: string): CallLogData[] => {
    const lowercasedQuery = query.toLowerCase();
    return data.filter(log => 
      log.name.toLowerCase().includes(lowercasedQuery)
    );
  };

  const filteredAndSortedData = useMemo(() => {
    let data = filterData(callLogsData, searchQuery);
    data = data.filter(log => 
      log.performance >= performanceRange[0] && 
      log.performance <= performanceRange[1]
    );
    return [...data].sort((a, b) => {
      switch (sortOption) {
        case "a-z":
          return a.name.localeCompare(b.name);
        case "z-a":
          return b.name.localeCompare(a.name);
        case "date-new":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "date-old":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        default:
          return 0;
      }
    });
  }, [searchQuery, performanceRange, sortOption, callLogsData]);


  if (!callLogsData || callLogsData.length === 0) {
    return (
      <Card className="w-full bg-white overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 bg-white shadow-md">
          <CardTitle className="text-2xl font-bold flex items-center gap-2 text-black">
            <Image
              src="https://res.cloudinary.com/drkudvyog/image/upload/v1734436445/Team_Call_Logs_icon_duha_yvb0r1.png"
              alt="Team Call Logs"
              width={24}
              height={24}
              className="h-6 w-6"
            />
            Team Call Logs
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center text-gray-500">
          No call logs available.
        </CardContent>
      </Card>
    )
  }

  try {
    return (
      <Card className="w-full bg-white overflow-hidden">
        <CardHeader className="p-4 border-b flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold flex items-center gap-2 text-black flex-1">
            <Image
              src="https://res.cloudinary.com/drkudvyog/image/upload/v1734436445/Team_Call_Logs_icon_duha_yvb0r1.png"
              alt="Team Call Logs"
              width={24}
              height={24}
              className="h-6 w-6"
            />
            Team Call Logs
          </CardTitle>
          <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm"
                className="rounded-full text-black hover:bg-gray-200 shadow-md shadow-black/10"
                onClick={() => setIsCalendarOpen(true)}
              >
                <Image
                  src="https://res.cloudinary.com/drkudvyog/image/upload/v1734437402/calendar_icon_2_efgdme.png"
                  alt="Calendar"
                  width={16}
                  height={16}
                  className="mr-2"
                />
                {selectedDateRange}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="rounded-full text-black hover:bg-gray-200 shadow-md shadow-black/10"
                  >
                    <Image
                      src="https://res.cloudinary.com/drkudvyog/image/upload/v1734400792/Sort_icon_duha_tpvska.png"
                      alt="Sort"
                      width={16}
                      height={16}
                      className="mr-2"
                    />
                    Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[300px]">
                  <DropdownMenuRadioGroup value={sortOption} onValueChange={setSortOption}>
                    <DropdownMenuRadioItem value="standard">Standard sorting</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="a-z">Users (A-Z)</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="z-a">Users (Z-A)</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="date-new">Date (newest first)</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="date-old">Date (oldest first)</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                  <DropdownMenuSeparator />
                  <div className="px-2 py-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Overall Performance Range:</span>
                      <span className="text-sm font-medium text-[#5b06be]">{performanceRange[0]} - {performanceRange[1]}</span>
                    </div>
                    <Slider
                      min={0}
                      max={100}
                      step={1}
                      minStepsBetweenThumbs={1}
                      defaultValue={[performanceRange[0], performanceRange[1]]}
                      value={[performanceRange[0], performanceRange[1]]}
                      onValueChange={(newValue) => setPerformanceRange(newValue as [number, number])}
                      className="w-full [&_[role=slider]]:bg-white [&_[role=slider]]:border-2 [&_[role=slider]]:border-[#5b06be] [&_[role=slider]]:w-4 [&_[role=slider]]:h-4 [&_[role=slider]]:rounded-full [&_[role=track]]:bg-[#f8b922] [&_[role=track]]:opacity-100 [&_[role=range]]:bg-[#5b06be] [&_[role=track.background]]:bg-[#f8b922]"
                    />
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="relative max-w-sm">
                <Image
                  src="https://res.cloudinary.com/drkudvyog/image/upload/v1734400793/Search_icon_duha_kuilhh.png"
                  alt="Search"
                  width={16}
                  height={16}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2"
                />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10 rounded-full text-black border-none shadow-md shadow-black/10"
                />
              </div>
            </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="w-full">
            <table className="w-full table-fixed">
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#f8b922]">
                  <th className="w-20 px-2 py-4">
                    <div className="flex justify-start items-center text-sm font-medium text-white pl-2">
                      Date
                    </div>
                  </th>
                  <th className="w-48 px-2 py-4">
                    <div className="flex items-center justify-center text-sm font-medium text-white">
                      User
                    </div>
                  </th>
                  <th className="w-44 px-2 py-4 text-center text-sm font-medium text-white">
                    Avatar
                  </th>
                  <th className="w-52 px-2 py-4 text-center">
                    <span className="text-sm font-medium text-white">
                      Call Performance
                    </span>
                  </th>
                  <th className="w-[360px] px-2 py-4 text-center text-sm font-medium text-white">
                    Call Recording
                  </th>
                </tr>
              </thead>
            </table>
          
            <div className="h-[330px] overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-[#F8F0FF] [&::-webkit-scrollbar-thumb]:bg-[#5b06be] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#7016e0]">
              <table className="w-full">
                <tbody>
                  {filteredAndSortedData && filteredAndSortedData.length > 0 ? (
                    filteredAndSortedData.map((log, index) => (
                    <tr 
                      key={index} 
                      className="border-b border-[#f3f4f6] hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-4 py-3">
                        <div className="flex justify-start items-center pl-4">
                          <span className="text-black text-xs whitespace-nowrap">
                            {formatDateShort(log.date)}
                          </span>
                        </div>
                      </td>
                      
                      {/* User Column */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 ml-6">
                          <Avatar className="h-8 w-8 border-2 border-[#5b06be] flex-shrink-0">
                            <AvatarImage 
                              src="https://res.cloudinary.com/drkudvyog/image/upload/v1734565916/Profile_photo_duha_s_bilym_pozadim_cl4ukr.png"
                              alt={`${log.name}'s profile`} 
                            />
                          </Avatar>
                          <span className="font-medium text-black text-sm whitespace-nowrap">{log.name}</span>
                        </div>
                      </td>
                      
                      {/* Agent Column */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-4 justify-center">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8 border-2 border-[#5b06be]">
                              <AvatarImage 
                                src={log.callerImage}
                                alt="Agent profile" 
                              />
                            </Avatar>
                            <span className="font-medium text-black text-sm">Agent</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs whitespace-nowrap">
                              Creative Finance
                            </span>
                            <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs whitespace-nowrap">
                              Intermediate
                            </span>
                          </div>
                        </div>
                      </td>
            
                      {/* Performance Column */}
                      <td className="px-4 py-3 text-center">
                        <Dialog>
                          <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="rounded-full bg-[#5b06be] text-white hover:bg-[#7016e0] hover:text-white transition-all px-3 py-1 text-xs h-7"
                              >
                                <span className="font-medium">{log.performance}/100</span>
                                <span className="ml-1 font-medium">View Info</span>
                                <Image
                                  src="https://res.cloudinary.com/drkudvyog/image/upload/v1735521910/info_icon_white_btbu18.png"
                                  alt="Click to view"
                                  width={12}
                                  height={12}
                                  className="ml-0.5 inline-block"
                                />
                              </Button>
                            </DialogTrigger>
                         <DialogContent className="max-w-5xl h-[80vh] p-6">
                          <DialogHeader className="pb-4">
                            <div className="flex items-center justify-between w-full py-2 border-b">
                              <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-500">Nov 13</span>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8 border-2 border-[#5b06be]">
                                    <AvatarImage 
                                      src="https://res.cloudinary.com/drkudvyog/image/upload/v1734565916/Profile_photo_duha_s_bilym_pozadim_cl4ukr.png"
                                      alt={`${log.name}'s profile`} 
                                    />
                                  </Avatar>
                                  <span className="font-medium">{log.name}</span>
                                  <Image
                                    src="https://res.cloudinary.com/drkudvyog/image/upload/v1735534232/clash_icon_duha_wvhzo9.png"
                                    alt="Clash Icon"
                                    width={16}
                                    height={16}
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8 border-2 border-[#5b06be]">
                                    <AvatarImage 
                                      src={log.callerImage}
                                      alt="Agent profile" 
                                    />
                                  </Avatar>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                                    Creative Finance
                                  </span>
                                  <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                                    Intermediate
                                  </span>
                                </div>
                              </div>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="default" 
                                    size="sm"
                                    className="rounded-full bg-[#5b06be] text-white hover:bg-[#7016e0] px-4"
                                  >
                                    Edit Feedback for {log.name}
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                  <div className="mt-4 space-y-4">
                                    <Textarea 
                                      value={feedbackText}
                                      onChange={(e) => setFeedbackText(e.target.value)}
                                      placeholder="Enter your feedback here..."
                                      className="min-h-[100px] border-gray-300 focus:ring-black"
                                    />
                                    <div className="flex justify-center mt-4">
                                      <Button
                                        variant="default"
                                        className="w-full max-w-md bg-[#5b06be] text-white hover:bg-[#7016e0] transition-all rounded-full py-6 text-lg font-medium"
                                        onClick={() => handleSaveFeedback(log.name, feedbackText)}
                                      >
                                        Save Feedback
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </DialogHeader>
                                                  
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100%-80px)]">
                            <div className="h-full">
                              <PerformanceMetricsWidget log={log} />
                            </div>
                        
                            <div className="flex flex-col gap-6 h-full">
                              <div className="flex gap-6 h-[55%]">
                                <div className="flex-1 h-full">
                                  <CallNotesWidget log={log} />
                                </div>
                                <div className="w-64 h-full">
                                  <PowerMomentSection />
                                </div>
                              </div>
                              
                              <div className="h-[45%]">
                                <LevelUpPlanWidget />
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                        </Dialog>
                      </td>
            
                      {/* Recording Column */}
                      <td className="px-4 py-3 text-center">
                        <AudioPlayer audioUrl={log.audioUrl} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-3 text-center text-gray-500">
                      No call logs available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        </CardContent>
        <Dialog open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
            <DialogHeader>
              <DialogTitle className="sr-only">Select Date Range</DialogTitle>
            </DialogHeader>
            <Calendar onSelectRange={handleSelectDateRange} />
          </DialogContent>
        </Dialog>
      </Card>
    )
  } catch (err) {
    setError(err as Error);
    return null;
  }
}

function FeedbackDialog({ name, initialFeedback, onSaveFeedback }: { name: string, initialFeedback: string, onSaveFeedback: (feedback: string) => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [feedback, setFeedback] = useState(initialFeedback)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    setFeedback(initialFeedback)
    setIsEditing(!initialFeedback)
  }, [initialFeedback])

  const handleAddFeedback = () => { // Updated function name
    onSaveFeedback(feedback)
    setIsEditing(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="default" 
          size="sm"
          className="rounded-full bg-[#5b06be] text-white hover:bg-[#7016e0] transition-all px-3 py-1 text-xs h-7 pulse-button"
        >
          {initialFeedback ? `Edit Feedback for ${name}` : `Add Feedback for ${name}`}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <div className="mt-4 space-y-4">
          <Textarea 
            value={feedback}
            onChange={(e) => {
              setFeedback(e.target.value)
              setIsEditing(true)
            }}
            placeholder="Enter your feedback here..."
            className="min-h-[100px] border-gray-300 focus:ring-black"
          />
          <div className="flex justify-center mt-4">
            <Button
              variant="default"
              className="w-full max-w-md bg-[#5b06be] text-white hover:bg-[#7016e0] transition-all rounded-full py-6 text-lg font-medium"
              onClick={handleAddFeedback} // Updated onClick handler
            >
              {isEditing ? `Add Feedback for ${name}` : `Edit Feedback for ${name}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function AudioPlayer({ audioUrl }: { audioUrl: string }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const progressBarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (audio) {
      audio.addEventListener('error', handleAudioError)
      audio.addEventListener('loadedmetadata', () => {
        setError(null)
        setDuration(audio.duration)
      })
      audio.addEventListener('timeupdate', () => {
        setCurrentTime(audio.currentTime)
      })
      return () => {
        audio.removeEventListener('error', handleAudioError)
        audio.removeEventListener('loadedmetadata', () => {})
        audio.removeEventListener('timeupdate', () => {})
      }
    }
  }, [])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed
    }
  }, [playbackSpeed])

  const handleAudioError = (e: Event) => {
    const audio = e.target as HTMLAudioElement
    let errorMessage = 'Error loading audio'
    if (audio.error) {
      switch (audio.error.code) {
        case 1:
          errorMessage = 'Audio playback aborted'
          break
        case 2:
          errorMessage = 'Network error while loading audio'
          break
        case 3:
          errorMessage = 'Audio decoding error'
          break
        case 4:
          errorMessage = 'Audio format not supported'
          break
      }
    }
    console.error('Audio error:', errorMessage)
    setError(errorMessage)
    setIsPlaying(false)
  }

  const togglePlayPause = async () => {
    const audio = audioRef.current
    if (audio) {
      try {
        if (isPlaying) {
          await audio.pause()
        } else {
          await audio.play()
        }
        setIsPlaying(!isPlaying)
      } catch (err) {
        console.error('Playback error:', err)
        setError('Error during playback')
        setIsPlaying(false)
      }
    }
  }

  const seekAudio = (seconds: number) => {
    const audio = audioRef.current
    if (audio) {
      audio.currentTime += seconds
    }
  }

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const progressBar = progressBarRef.current
    const audio = audioRef.current
    if (progressBar && audio) {
      const rect = progressBar.getBoundingClientRect()
      const x = e.clientX - rect.left
      const percentage = x / rect.width
      audio.currentTime = percentage * duration
    }
  }

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  if (error) {
    return (
      <div className="text-red-500 text-xs">
        {error}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => seekAudio(-10)}
        className="text-xs text-black hover:text-[#5b06be]"
      >
        -10s
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={togglePlayPause}
        className="rounded-full bg-[#5b06be] text-white hover:bg-[#7016e0] hover:text-white transition-all shadow-md shadow-black/10 w-8 h-8 p-0 flex items-center justify-center"
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>
      <div
        ref={progressBarRef}
        className="relative w-44 h-1.5 bg-gray-200 roundedfull cursor-pointer"
        onClick={handleProgressBarClick}
      >
        <div
          className="absolute h-full bg-[#5b06be] rounded-full"
          style={{ width: `${(currentTime / duration) * 100}%` }}
        />
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => seekAudio(10)}
        className="text-xs text-black hover:text-[#5b06be]"
      >
        +10s
      </Button>
      <div className="flex flex-col items-center gap-1">
        <span className="text-[10px] px-2 py-0.5 bg-[#5b06be] text-white rounded-full min-w-[3.5rem] h-5 flex items-center justify-center transition-all hover:bg-[#7016e0]">
          {formatTime(currentTime)}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="text-[10px] px-2 py-0.5 bg-[#5b06be] text-white rounded-full min-w-[3.5rem] h-5 hover:bg-[#7016e0] hover:text-white flex items-center justify-center"
            >
              {playbackSpeed}x
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {[1, 1.25, 1.5, 1.75, 2].map((speed) => (
              <DropdownMenuItem 
                key={speed}
                onClick={() => setPlaybackSpeed(speed)}
                className="cursor-pointer"
                inset={false}
              >
                {speed}x
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <audio ref={audioRef}>
        <source src={audioUrl} type="audio/mpeg"/>
        <source src={audioUrl.replace('.mp3','.ogg')} type="audio/ogg" />
        Your browser does not support the audio element.
      </audio>
    </div>
  )
}

function AreasOfImprovement({ currentIndex }: { currentIndex: number }) {
  const [areas, setAreas] = useState([
    { area: "Objection Handling", description: "Improve addressing customer concerns." },
    { area: "Product Knowledge", description: "Enhance understanding of features and benefits." },
    { area: "Active Listening", description: "Practice attentive listening for customer needs." }
  ]);
  const [isEditing, setIsEditing] = useState(false);
  const currentArea = areas[currentIndex];

  const handleSave = (newArea: string, newDescription: string) => {
    const updatedAreas = [...areas];
    updatedAreas[currentIndex] = { 
      area: newArea || currentArea.area, 
      description: newDescription || currentArea.description 
    };
    setAreas(updatedAreas);
    setIsEditing(false);
  };

  return (
    <div className="flex-1 bg-white rounded-md p-4 pt-2 shadow-md shadow-black/20 relative">
      <div className="flex justify-between items-start mb-2">
        {isEditing ? (
          <input
            type="text"
            defaultValue={currentArea.area}
            className="text-lg font-semibold text-purple-800 bg-transparent border-b border-purple-300 focus:outline-none focus:border-purple-800"
            onBlur={(e) => handleSave(e.target.value, currentArea.description)}
          />
        ) : (
          <h4 className="text-lg font-semibold text-purple-800">
            {currentArea.area}
          </h4>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="text-purple-800 hover:bg-purple-100"
          onClick={() =>setIsEditing(!isEditing)}
        >
          <Pencil className="h-4 w-4 mr-2" />
          {isEditing ?'Save' : 'Edit'}
        </Button>
      </div>
      {isEditing ? (
        <textarea
          defaultValue={currentArea.description}
          className="w-full text-sm text-gray-600 bg-transparent border rounded-md p-2 focus:outline-none focus:border-purple-800"
          onBlur={(e) => handleSave(currentArea.area, e.target.value)}
        />
      ) : (
        <p className="text-sm text-gray-600 max-h-[100px] overflow-y-auto pr-2">{currentArea.description}</p>
      )}
    </div>
  );
}


function PerformanceMetricsWidget({ log }: { log: CallLogData }) {
  const [selectedMetric, setSelectedMetric] = useState<string>("Overall Score");
  const [activeTab, setActiveTab] = useState<"metrics" | "transcript">("metrics");

  const metrics = [
    { 
      label: "Overall Score", 
      value: log.performance,
      description: "Combined score reflecting the agent's overall performance across all metrics."
    },
    { 
      label: "Engagement", 
      value: log.engagement,
      description: "Measures how well the agent connects with customers and maintains their interest."
    },
    { 
      label: "Objection Handling", 
      value: log.objectionHandling,
      description: "Evaluates the agent's ability to address and overcome customer concerns effectively."
    },
    { 
      label: "Information Gathering", 
      value: log.informationGathering,
      description: "Assesses how well the agent collects relevant information from customers."
    },
    { 
      label: "Program Explanation", 
      value: log.programExplanation,
      description: "Rates the clarity and effectiveness of program/product explanations."
    },
    { 
      label: "Closing Skills", 
      value: log.closingSkills,
      description: "Evaluates the agent's ability to guide conversations toward successful conclusions."
    },
    { 
      label: "Overall Effectiveness", 
      value: log.overallEffectiveness,
      description: "Measures the overall impact and success of the agent's interactions."
    },
  ];

  const selectedMetricData = metrics.find(m => m.label === selectedMetric);

  const onSelectMetric = (label: string) => {
    setSelectedMetric(label);
  };

  return (
    <div className="bg-white shadow-md rounded-xl w-full overflow-hidden flex flex-col h-[calc(80vh-160px)]">
      <div className="p-4 h-full overflow-y-auto">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "metrics" | "transcript")} className="w-full h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="transcript">Transcript</TabsTrigger>
          </TabsList>
          <TabsContent value="metrics" className="h-full overflow-y-auto">
            <div className="mb-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {selectedMetric}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  {metrics.map((metric) => (
                    <DropdownMenuItem
                      key={metric.label}
                      onSelect={() => setSelectedMetric(metric.label)}
                      className="flex justify-between items-center"
                      inset={false}
                    >
                      <span>{metric.label}</span>
                      <span className="ml-2 text-[#22c55e] font-semibold">{metric.value}/100</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {selectedMetricData && (
              <div className="bg-[#f0fdf4] border border-[#22c55e] rounded-xl p-4 mt-4">
                <h2 className="text-lg font-bold mb-2 flex justify-between items-center">
                  <span>{selectedMetricData.label}</span>
                  <span className="text-[#22c55e]">{selectedMetricData.value}/100</span>
                </h2>
                <p className="text-sm text-gray-600 mt-2">{selectedMetricData.description}</p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="transcript" className="flex-grow overflow-hidden">
            <TranscriptView className="h-full overflow-hidden" messages={[
  {
    speaker: "Megan",
    avatar: "M",
    content: "Hey, I'm Megan. I'll be the homeowner, and you're the investor. Ready to hear your opening pitch.",
    isAgent: false
  },
  {
    speaker: "Martin",
    avatar: "MA",
    content: "Hey, Megan. This is Martin. How are you doing today?",
    isAgent: true
  },
  {
    speaker: "Megan",
    avatar: "M",
    content: "Hi, Martin. I'm doing okay. Thanks for asking. About you?",
    isAgent: false
  },
  {
    speaker: "Martin",
    avatar: "MA",
    content: "Everything is great. Hamdulah.",
    isAgent: true
  }
]} agentName={log.name} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}


function CallNotesWidget({ log }: { log: CallLogData }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 h-full flex flex-col">
      <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
        <Image
          src="https://res.cloudinary.com/drkudvyog/image/upload/v1734523886/User_s_notes_icon_duha_rlm6wm.png"
          alt="Call Notes Icon"
          width={20}
          height={20}
        />
        Call Notes
      </h2>
      <div className="flex-grow overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-[#F8F0FF] [&::-webkit-scrollbar-thumb]:bg-[#5b06be] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#7016e0]">
        <p className="text-sm text-gray-600">
          {log.notes}
        </p>
      </div>
    </div>
  );
}

function LevelUpPlanWidget() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalAreas = 3;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalAreas);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + totalAreas) % totalAreas);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Image
            src="https://res.cloudinary.com/drkudvyog/image/upload/v1734524541/Level_up_plan_icon_duha_wtftip.png"
            alt="Level Up Plan Icon"
            width={20}
            height={20}
          />
          Level Up Plan
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handlePrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">{currentIndex + 1}/{totalAreas}</span>
          <Button variant="ghost" size="sm" onClick={handleNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex-1">
        <AreasOfImprovement currentIndex={currentIndex} />
      </div>
    </div>
  );
}

interface TranscriptViewProps {
  messages?: Message[];
  className?: string;
  agentName?: string;
}

export function TranscriptView({ messages, className, agentName }: TranscriptViewProps) {
  if (!messages || messages.length === 0) {
    return <p className="text-center text-gray-500">No transcript available.</p>;
  }

  return (
    <div className={cn("h-full flex flex-col", className)}>
      <h2 className="text-xl font-semibold mb-4">Call Transcript</h2>
      <div className="flex-grow overflow-y-auto pr-4 space-y-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-[#F8F0FF] [&::-webkit-scrollbar-thumb]:bg-[#5b06be] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#7016e0]">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex flex-col gap-1.5 ${
              message.isAgent 
                ? 'bg-[#F8F0FF] border border-purple-100' 
                : 'bg-[#FDF7F3] border border-orange-100'
            } rounded-2xl p-3 min-w-0`}
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8 border-2 border-[#5b06be] flex-shrink-0">
                <AvatarImage 
                  src={message.isAgent 
                    ? "https://res.cloudinary.com/drkudvyog/image/upload/v1734565916/Profile_photo_duha_s_bilym_pozadim_cl4ukr.png"
                    : "/placeholder.svg?height=32&width=32"
                  } 
                  alt={`${message.speaker}'s avatar`}
                />
                <AvatarFallback className="bg-gray-100">
                  {message.avatar}
                </AvatarFallback>
              </Avatar>
              <span className="font-semibold text-sm">
                {message.isAgent ? agentName || message.speaker : message.speaker}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-gray-700 pl-11 break-words">
              {message.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

<style jsx>{`
  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(124, 58, 237, 0.7);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(124, 58, 237, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(124, 58, 237, 0);
    }
  }
  .pulse-button {
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(91, 6, 190, 0.7);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(91, 6, 190, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(91, 6, 190, 0);
    }
  }

  /* Scrollbar styly */
  .scrollbar-thin::-webkit-scrollbar {
    width: 6px;
  }

  .scrollbar-thin::-webkit-scrollbar-track {
    background: transparent;
  }

  .scrollbar-thin::-webkit-scrollbar-thumb {
    background: #5b06be;
    border-radius: 3px;
  }

  .scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background: #7016e0;
  }
.custom-purple-scrollbar::-webkit-scrollbar {
    width: 6px;
    background: transparent;
  }

  .custom-purple-scrollbar::-webkit-scrollbar-track {
    background: #F8F0FF;
    border-radius: 3px;
  }

  .custom-purple-scrollbar::-webkit-scrollbar-thumb {
    background: #5b06be;
    border-radius: 3px;
    transition: background 0.2s ease;
  }

  .custom-purple-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #7016e0;
  }
`}</style>