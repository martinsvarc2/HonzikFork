'use client'

import { useState, useMemo } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card"
import { BarChart2, ArrowLeft } from 'lucide-react'
import { filterData } from "@/utils/formatters"
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "./calendar"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

interface ActivityViewProps {
  data?: ActivityData[];  // Make data optional
}

interface ActivityData {
  name: string
  avatar: string
  overallPerformance: number
  trainingsToday: number
  thisWeek: number
  thisMonth: number
  total: number
  currentStreak: number
  longestStreak: number
  consistency: number
  engagement: number
  objectionHandling: number
  informationGathering: number
  programExplanation: number
  closingSkills: number
  overallEffectiveness: number
  date?: string
}

const activityData: ActivityData[] = [
  { 
    name: "Sarah Johnson", 
    avatar: "SJ", 
    overallPerformance: 87, 
    trainingsToday: 3, 
    thisWeek: 15, 
    thisMonth: 45, 
    total: 180, 
    currentStreak: 7, 
    longestStreak: 15, 
    consistency: 85,
    engagement: 90,
    objectionHandling: 85,
    informationGathering: 89,
    programExplanation: 87,
    closingSkills: 86,
    overallEffectiveness: 88,
    date: "2024-03-15"
  },
  { name: "Michael Chen", avatar: "MC", overallPerformance: 92, trainingsToday: 4, thisWeek: 18, thisMonth: 52, total: 195, currentStreak: 9, longestStreak: 18, consistency: 92, engagement: 94, objectionHandling: 91, informationGathering: 93, programExplanation: 92, closingSkills: 92, overallEffectiveness: 93, date: "2024-03-10" },
  { name: "Emma Davis", avatar: "ED", overallPerformance: 79, trainingsToday: 2, thisWeek: 12, thisMonth: 38, total: 165, currentStreak: 5, longestStreak: 12, consistency: 78, engagement: 81, objectionHandling: 77, informationGathering: 80, programExplanation: 78, closingSkills: 79, overallEffectiveness: 80, date: "2024-03-20" },
  { name: "James Wilson", avatar: "JW", overallPerformance: 95, trainingsToday: 5, thisWeek: 19, thisMonth: 55, total: 198, currentStreak: 10, longestStreak: 20, consistency: 95, engagement: 97, objectionHandling: 94, informationGathering: 96, programExplanation: 95, closingSkills: 94, overallEffectiveness: 96, date: "2024-03-25" },
  { name: "Olivia Brown", avatar: "OB", overallPerformance: 83, trainingsToday: 3, thisWeek: 14, thisMonth: 42, total: 175, currentStreak: 6, longestStreak: 14, consistency: 82, engagement: 85, objectionHandling: 81, informationGathering: 84, programExplanation: 83, closingSkills: 82, overallEffectiveness: 84, date: "2024-03-18" },
]

interface MetricCardProps {
  label: string
  value: number
  isHighlighted?: boolean
  description?: string
}

function MetricCard({ label, value, isHighlighted, description }: MetricCardProps) {
  return (
    <div className={`rounded-xl p-4 ${isHighlighted ? 'bg-[#f0fdf4] border border-[#22c55e]' : 'bg-white'}`}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-800">{label}</h3>
          <div className="flex items-baseline">
            <span className="text-4xl font-bold text-[#22c55e]">{value}</span>
            <span className="text-lg text-gray-500 ml-1">/100</span>
          </div>
        </div>
        <div className="w-full h-2 bg-[#22c55e]/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#22c55e] rounded-full transition-all"
            style={{ width: `${value}%` }}
          />
        </div>
        {description && (
          <p className="text-gray-600 text-sm leading-relaxed mt-2">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}

function MetricGridCard({ label, value, isActive }: { label: string; value: number; isActive?: boolean }) {
  return (
    <div 
      className={`bg-white rounded-xl p-4 shadow-sm transition-all hover:shadow-md cursor-pointer
        ${isActive ? 'ring-2 ring-[#22c55e] bg-[#f0fdf4]' : ''}`}
    >
      <div className="space-y-1">
        <h3 className="text-gray-600 text-sm font-medium">{label}</h3>
        <span className="text-[#22c55e] text-3xl font-bold">{value}</span>
      </div>
    </div>
  )
}

function PerformanceDialog({ data }: { data: ActivityData }) {
  const metrics = [
    { 
      label: "Overall Score", 
      value: data.overallPerformance,
      description: "Combined score reflecting the agent's overall performance across all metrics. This comprehensive evaluation takes into account multiple factors including customer engagement, problem-solving abilities, and communication effectiveness. The score is calculated using our proprietary algorithm that weights different aspects of the interaction based on their importance."
    },
    { 
      label: "Engagement", 
      value: data.engagement,
      description: "Measures how well the agent connects with customers and maintains their interest throughout the conversation."
    },
    { 
      label: "Objection Handling", 
      value: data.objectionHandling,
      description: "Evaluates the agent's ability to address and overcome customer concerns effectively."
    },
    { 
      label: "Information Gathering", 
      value: data.informationGathering,
      description: "Assesses how well the agent collects relevant information from customers."
    },
    { 
      label: "Program Explanation", 
      value: data.programExplanation,
      description: "Rates the clarity and effectiveness of program/product explanations."
    },
    { 
      label: "Closing Skills", 
      value: data.closingSkills,
      description: "Evaluates the agent's ability to guide conversations toward successful conclusions."
    },
    { 
      label: "Overall Effectiveness", 
      value: data.overallEffectiveness,
      description: "Measures the overall impact and success of the agent's interactions."
    }
  ];

  const [selectedMetric, setSelectedMetric] = useState(metrics.find(m => m.label === "Overall Score") || metrics[0]);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState("All time");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleSelectDateRange = (range: string) => {
    setSelectedTimeFrame(range);
    setIsCalendarOpen(false);
  };

  // Sample data for the chart
  const chartData = [
    { date: '2024-03-01', score: 75 },
    { date: '2024-03-05', score: 80 },
    { date: '2024-03-10', score: 85 },
    { date: '2024-03-15', score: 82 },
    { date: '2024-03-20', score: 88 },
    { date: '2024-03-25', score: 92 },
    { date: '2024-03-30', score: 90 },
  ];

  return (
    <>
      <div className="bg-white rounded-xl p-4 mb-4 shadow-lg shadow-black/20">
        <Select 
          defaultValue="Overall Score"
          onValueChange={(value) => setSelectedMetric(metrics.find(m => m.label === value) || metrics[0])}
        >
          <SelectTrigger className="w-full">
            <SelectValue>
              <div className="flex justify-between items-center w-full">
                <span>{selectedMetric.label}</span>
                <span className="font-bold text-[#22c55e] ml-4">{selectedMetric.value}/100</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {metrics.map((metric) => (
              <SelectItem key={metric.label} value={metric.label}>
                <div className="flex justify-between items-center w-full">
                  <span>{metric.label}</span>
                  <span className="font-bold text-[#22c55e] ml-4">{metric.value}/100</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="mt-2">
          <p className="text-xs text-gray-600 leading-tight italic">
            {selectedMetric.description}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2">

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-lg shadow-black/20">
            <h4 className="font-medium text-[#21c55d] mb-2">Strong Points</h4>
            <ul className="space-y-1 text-sm text-black">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#21c55d]"></span>
                Excellent customer engagement and rapport building
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#21c55d]"></span>
                Clear and concise explanation of complex concepts
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#21c55d]"></span>
                Effective use of active listening techniques
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-lg shadow-black/20">
            <h4 className="font-medium text-[#ef4444] mb-2">Improvement Areas</h4>
            <ul className="space-y-1 text-sm text-black">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#ef4444]"></span>
                Increase clarity and confidence when framing calls
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#ef4444]"></span>
                Build stronger rapport by aligning with Megan's profile and concerns
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#ef4444]"></span>
                Improve tailored communication to Megan's unique situation
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-lg shadow-black/20 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-semibold text-gray-700">Performance Over Time</h3>
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
              {selectedTimeFrame}
            </Button>
          </div>
          <div className="h-[250px]">
            <ChartContainer
              config={{
                score: {
                  label: "Score",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="w-full h-full max-w-none"
            >
              <ResponsiveContainer width="100%" height="100%">
  <LineChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis 
      dataKey="date" 
      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
    />
    <YAxis 
      domain={[0, 100]} 
      tickCount={6} 
      tickFormatter={(value) => `${value}%`}
    />
    <Tooltip content={<ChartTooltipContent />} />
    <Line type="monotone" dataKey="score" stroke="var(--color-score)" strokeWidth={2} dot={{ r: 4 }} />
  </LineChart>
</ResponsiveContainer>
            </ChartContainer>
          </div>
        </div>
      </div>

      <Dialog open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
          <DialogHeader>
            <DialogTitle className="sr-only">Select Date Range</DialogTitle>
          </DialogHeader>
          <Calendar onSelectRange={handleSelectDateRange} />
        </DialogContent>
      </Dialog>
    </>
  );
}

function ActivityView({ data }: ActivityViewProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [performanceRange, setPerformanceRange] = useState([0, 100]);
  const [sortOption, setSortOption] = useState("standard");
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState("");
  const [currentUser, setCurrentUser] = useState<ActivityData | null>(null);
  const [notes, setNotes] = useState<{ [key: string]: string }>({});
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState("All time");
  const [selectedTimeFrame, setSelectedTimeFrame] = useState("All time");


  const handleAddNote = (user: ActivityData) => {
    setCurrentUser(user);
    setCurrentNote(notes[user.name] || "");
    setIsNoteDialogOpen(true);
  };

  const handleSaveNote = () => {
    if (currentUser) {
      setNotes(prevNotes => ({
        ...prevNotes,
        [currentUser.name]: currentNote
      }));
      console.log(`Saving note for ${currentUser.name}: ${currentNote}`);
    }
    setIsNoteDialogOpen(false);
  };

  const handleSelectDateRange = (range: string) => {
    setSelectedDateRange(range);
    setSelectedTimeFrame(range);
    setIsCalendarOpen(false);
  };

  const filteredAndSortedData = useMemo(() => {
    let data = filterData(activityData, searchQuery);
    data = data.filter(user => 
      user.overallPerformance >= performanceRange[0] && 
      user.overallPerformance <= performanceRange[1]
    );
    return [...data].sort((a, b) => {
      switch (sortOption) {
        case "a-z":
          return a.name.localeCompare(b.name);
        case "z-a":
          return b.name.localeCompare(a.name);
        case "date-new":
          return new Date(b.date || '').getTime() - new Date(a.date || '').getTime();
        case "date-old":
          return new Date(a.date || '').getTime() - new Date(b.date || '').getTime();
        default:
          return 0; 
      }
    });
  }, [searchQuery, performanceRange, sortOption, activityData]);

  return (
  <>
    <Card className="w-full bg-white rounded-3xl shadow-lg overflow-hidden shadow-md shadow-black/10">
      <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Image
            src="https://res.cloudinary.com/drkudvyog/image/upload/v1734588661/Rating_s_Teams_View_icon_duha_ifhqpv.png"
            alt="Performance Overview"
            width={24}
            height={24}
            className="h-6 w-6"
          />
          <h2 className="text-2xl font-bold flex items-center gap-2 text-black">Performance Overview</h2>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="rounded-full text-black hover:bg-gray-200 shadow-md shadow-black/10 transition-all duration-300 ease-in-out"
              >
                <Image
                  src="https://res.cloudinary.com/drkudvyog/image/upload/v1734400792/Sort_icon_duha_tpvska.png"
                  alt="Sort"
                  width={16}
                  height={16}
                  className="mr-1"
                />
                <span className="text-xs">Sort</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[300px] p-4">
              <DropdownMenuRadioGroup value={sortOption} onValueChange={setSortOption}>
                <DropdownMenuRadioItem value="standard" className="py-3 text-base font-normal">Standard sorting</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="a-z" className="py-3 text-base font-normal">Users (A-Z)</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="z-a" className="py-3 text-base font-normal">Users (Z-A)</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="date-new" className="py-3 text-base font-normal">Date (newest first)</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="date-old" className="py-3 text-base font-normal">Date (oldest first)</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
              <div className="pt-6 pb-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-base font-medium">Overall Performance Range:</span>
                  <span className="text-base font-medium text-[#5b06be]">{performanceRange[0]} - {performanceRange[1]}</span>
                </div>
                <Slider
                  min={0}
                  max={100}
                  step={1}
                  value={[performanceRange[0], performanceRange[1]]}
                  onValueChange={(newValue) => setPerformanceRange(newValue as [number, number])}
                  className="w-full [&_[role=slider]]:bg-white [&_[role=slider]]:border-2 [&_[role=slider]]:border-[#5b06be] [&_[role=slider]]:w-4 [&_[role=slider]]:h-4 [&_[role=slider]]:rounded-full [&_[role=track]]:bg-black [&_[role=track]]:h-1 [&_[role=range]]:bg-black [&_[role=slider]]:shadow-md [&_[role=slider]]:hover:scale-110 [&_[role=slider]]:transition-transform"
                />
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="relative max-w-xs">
            <Image
              src="https://res.cloudinary.com/drkudvyog/image/upload/v1734400793/Search_icon_duha_kuilhh.png"
              alt="Search"
              width={16}
              height={16}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10"
            />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-2 py-1 rounded-full text-black border-none shadow-md shadow-black/10 transition-all duration-300 ease-in-out text-xs"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          {/* První tabulka pro header */}
          <table className="w-full table-fixed">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#f8b922]">
                <th className="w-1/6 px-2 py-4 text-left pl-4 text-sm font-medium text-white">Users</th>
                <th className="w-1/6 px-2 py-4 text-center text-sm font-medium text-white">Overall Performance</th>
                <th className="w-1/12 px-2 py-4 text-center text-sm font-medium text-white">Today</th>
                <th className="w-1/12 px-2 py-4 text-center text-sm font-medium text-white">This Week</th>
                <th className="w-1/12 px-2 py-4 text-center text-sm font-medium text-white">This Month</th>
                <th className="w-1/12 px-2 py-4 text-center text-sm font-medium text-white">Total</th>
                <th className="w-1/12 px-2 py-4 text-center text-sm font-medium text-white">Current Streak</th>
                <th className="w-1/12 px-2 py-4 text-center text-sm font-medium text-white">Best Streak</th>
                <th className="w-1/12 px-2 py-4 text-center text-sm font-medium text-white">
                  <div>Consistency</div>
                  <div>This Month</div>
                </th>
                <th className="w-1/6 px-2 py-4 text-center text-sm font-medium text-white">Notes</th>
              </tr>
            </thead>
          </table>
      
          {/* Scrollovatelný div s druhou tabulkou */}
          <div className="h-[330px] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-[#F8F0FF] [&::-webkit-scrollbar-thumb]:bg-[#5b06be] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#7016e0]">
            <table className="w-full table-fixed">
              <tbody>
                {filteredAndSortedData.map((user, index) => (
                  <tr 
                    key={index} 
                    className="border-b border-gray-100 hover:bg-gray-50 transition-all duration-300 ease-in-out"
                  >
                    <td className="px-2 py-4">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8 border-2 border-[#5b06be] text-black">
                          <AvatarImage src="https://res.cloudinary.com/drkudvyog/image/upload/v1734565916/Profile_photo_duha_s_bilym_pozadim_cl4ukr.png" alt={`${user.name}'s profile`} />
                          <AvatarFallback className="bg-[#5b06be]/10 text-[#5b06be]">
                            {user.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-black text-sm">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-2 py-4 text-center">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="rounded-full bg-[#5b06be] text-white hover:bg-[#7016e0] transition-all px-3 py-1 text-xs h-7"
                          >
                            <span className="font-medium">{user.overallPerformance}/100</span>
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
                        <DialogContent className="sm:max-w-[1180px] w-[98vw] h-[95vh] overflow-y-auto p-4"> 
                          <DialogTitle className="sr-only">Performance Details</DialogTitle>
                          <div className="h-full">
                            <PerformanceDialog data={user} />
                          </div>
                        </DialogContent>
                      </Dialog>
                    </td>
                    <td className="px-2 py-4 text-center text-black">{user.trainingsToday}</td>
                    <td className="px-2 py-4 text-center text-black">{user.thisWeek}</td>
                    <td className="px-2 py-4 text-center text-black">{user.thisMonth}</td>
                    <td className="px-2 py-4 text-center text-black">{user.total}</td>
                    <td className="px-2 py-4 text-center text-black">{user.currentStreak}</td>
                    <td className="px-2 py-4 text-center text-black">{user.longestStreak}</td>
                    <td className="px-2 py-4 text-center">
                      <span className="text-black font-medium">{user.consistency}%</span>
                    </td>
                    <td className="px-2 py-4 text-center">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="rounded-full bg-[#5b06be] text-white hover:bg-[#7016e0] transition-all"
                        onClick={() => handleAddNote(user)}
                      >
                        {notes[user.name] ? 'Edit Note' : 'Add Note'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>

    <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
      <DialogContent className="!max-w-[600px] w-[95vw] flex flex-col items-center">
        <DialogHeader>
          <DialogTitle>{notes[currentUser?.name || ''] ? 'Edit' : 'Add'} Note for {currentUser?.name}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4 w-full">
          <Textarea
            value={currentNote}
            onChange={(e) => setCurrentNote(e.target.value)}
            placeholder="Enter your note here..."
            className="col-span-3 min-h-[150px] w-full text-base"
          />
        </div>
        <DialogFooter className="flex justify-center w-full">
          <div className="w-full flex justify-center">
            <Button 
              type="submit" 
              onClick={handleSaveNote}
              className="bg-[#5b06be] text-white hover:bg-[#7016e0] transition-all px-6 py-2 rounded-full text-sm font-medium mx-auto"
            >
              Save Note
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
        <DialogHeader>
          <DialogTitle className="sr-only">Select Date Range</DialogTitle>
        </DialogHeader>
        <Calendar onSelectRange={handleSelectDateRange} />
      </DialogContent>
    </Dialog>
  </>
 )
}

export { ActivityView }