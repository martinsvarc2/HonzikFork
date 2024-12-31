"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from 'next/navigation'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lock } from 'lucide-react'
import { cn } from "@/lib/utils"
import { 
  ACHIEVEMENTS,
  type Badge 
} from '@/lib/achievement-data'

interface BadgeData {
  memberId: string;
  current_streak: number;
  total_sessions: number;
  sessions_today: number;
  sessions_this_week: number;
  sessions_this_month: number;
  points: number;
  total_points: number;
  unlocked_badges: string[];
  league_rank?: string;
}

interface BaseBadge extends Badge {
  unlocked?: boolean;
  progress?: number;
  period?: 'day' | 'week' | 'month';
}

interface LeagueBadge extends BaseBadge {
  rank?: string;
}

export interface AchievementContentProps {
  achievements?: {
    streakAchievements: BaseBadge[];
    callAchievements: BaseBadge[];
    activityAchievements: BaseBadge[];
    leagueAchievements: LeagueBadge[];
  };
}

const getProgressBarColor = (progress: number) => {
  if (progress === 100) return 'bg-[#00b54b]' // Green
  if (progress >= 70) return 'bg-[#05b4ff]'   // Diamond BLue
  if (progress >= 40) return 'bg-[#f8b922]'   // Orange
  return 'bg-[#ef4444]'                       // Red
}

const AchievementContentInner = ({ achievements }: AchievementContentProps) => {
  const searchParams = useSearchParams();
  const memberId = searchParams.get('memberId') || 'default';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [badgeData, setBadgeData] = useState<BadgeData | null>(null);
  const [activeCategory, setActiveCategory] = useState('practice-streak');
  const [activeTooltipId, setActiveTooltipId] = useState<number | null>(null);
  const [localAchievements, setAchievements] = useState<AchievementContentProps['achievements']>();

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        setLoading(true);
        console.log('Fetching for memberId:', memberId);
        const response = await fetch(`/api/achievements?memberId=${memberId}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Badge fetch failed:', {
            status: response.status,
            statusText: response.statusText,
            errorText
          });
          throw new Error('Failed to fetch badges');
        }
        
        const data = await response.json();
        console.log('Raw achievement data:', data);
        
        setBadgeData(data.userData);
        
        if (!achievements) {
          setAchievements({
            streakAchievements: data.streakAchievements || ACHIEVEMENTS.streak.map(badge => ({
              ...badge,
              unlocked: false
            })),
            callAchievements: data.callAchievements || ACHIEVEMENTS.calls.map(badge => ({
              ...badge,
              unlocked: false
            })),
            activityAchievements: data.activityAchievements || ACHIEVEMENTS.activity.map(badge => ({
              ...badge,
              unlocked: false,
              period: badge.period as 'day' | 'week' | 'month' // Explicit type casting
            })),
            leagueAchievements: data.leagueAchievements || ACHIEVEMENTS.league.map(badge => ({
              ...badge,
              unlocked: false
            }))
          });
        }
      } catch (err) {
        console.error('Error fetching badges:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();
  }, [memberId, achievements]);

  const calculateBadgeProgress = (badge: BaseBadge | LeagueBadge): BaseBadge & { progress: number } => {
    console.log('Badge data:', {
      badge,
      badgeData,
      target: badge.target,
      practiceStreak: badgeData?.current_streak,
      totalCalls: badgeData?.total_sessions,
      dailyCalls: badgeData?.sessions_today,
      weeklyCalls: badgeData?.sessions_this_week,
      monthlyCalls: badgeData?.sessions_this_month
    });

    if (badge.unlocked) return { ...badge, progress: 100 };

    let progress = 0;
    
    // For streak badges
    if (badge.id.startsWith('streak_') && badge.target && badgeData?.current_streak) {
      progress = Math.min(100, (badgeData.current_streak / badge.target) * 100);
    }
    // For call badges
    else if (badge.id.startsWith('calls_') && badge.target && badgeData?.total_sessions) {
      progress = Math.min(100, (badgeData.total_sessions / badge.target) * 100);
    }
    // For activity badges
    else if (badge.target && 'period' in badge && badge.period && badgeData) {
      const current = badge.period === 'day' ? badgeData.sessions_today :
                     badge.period === 'week' ? badgeData.sessions_this_week :
                     badge.period === 'month' ? badgeData.sessions_this_month : 0;
      progress = Math.min(100, (current / badge.target) * 100);
    }

    console.log(`Progress for ${badge.id}:`, progress);
    return { ...badge, progress: Math.round(progress || 0) };
  };

  const categories: Record<string, (BaseBadge & { progress: number })[]> = {
    'practice-streak': (achievements?.streakAchievements || ACHIEVEMENTS.streak).map(badge => {
      const baseBadge = badge as BaseBadge;  // Add type assertion
      return calculateBadgeProgress({
        ...baseBadge,
        unlocked: baseBadge.unlocked ?? badgeData?.unlocked_badges?.includes(`streak_${badge.target}`)
      });
    }),
    
    'completed-calls': (achievements?.callAchievements || ACHIEVEMENTS.calls).map(badge => {
      const baseBadge = badge as BaseBadge;  // Add type assertion
      return calculateBadgeProgress({
        ...baseBadge,
        unlocked: baseBadge.unlocked ?? badgeData?.unlocked_badges?.includes(`calls_${badge.target}`)
      });
    }),
    
    'activity-goals': (achievements?.activityAchievements || ACHIEVEMENTS.activity).map(badge => {
      const baseBadge = badge as BaseBadge;  // Add type assertion
      return calculateBadgeProgress({
        ...baseBadge,
        period: badge.period as 'day' | 'week' | 'month',
        unlocked: baseBadge.unlocked ?? badgeData?.unlocked_badges?.includes(`${badge.period}_${badge.target}`)
      });
    }),
    
    'league-places': (achievements?.leagueAchievements || ACHIEVEMENTS.league).map(badge => {
      const leagueBadge = badge as LeagueBadge;
      return calculateBadgeProgress({
        ...leagueBadge,
        unlocked: leagueBadge.unlocked ?? (badgeData?.league_rank === leagueBadge.rank?.toString())
      });
    })
};

  return (
    <Card className="p-4 bg-white rounded-[20px] shadow-lg md:col-span-2 h-[280px] flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <img 
          src="https://res.cloudinary.com/drkudvyog/image/upload/v1733955503/Achiement_showcase_icon_duha_tisous.png"
          alt="Achievement Showcase Icon"
          className="h-6 w-6"
        />
        <h2 className="text-xl md:text-2xl font-semibold text-[#000000]">Achievement Showcase</h2>
      </div>
      
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 -mx-2 px-2 no-scrollbar">
        {Object.keys(categories).map((category) => (
          <Button
            key={category}
            variant={activeCategory === category ? 'default' : 'ghost'}
            className={cn(
              "px-3 sm:px-4 py-2 rounded-full whitespace-nowrap text-xs sm:text-sm",
              activeCategory === category 
                ? 'bg-[#f8b922] text-white hover:bg-[#f8b922]/90' 
                : 'text-gray-500 hover:text-gray-700'
            )}
            onClick={() => setActiveCategory(category)}
          >
            {category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          </Button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto pr-2 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-1">
            {categories[activeCategory].map((achievement, index) => (
              <div 
                key={index} 
                className="relative group"
                onMouseLeave={() => setActiveTooltipId(null)}
              >
                <div 
                  className="relative flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  onMouseEnter={() => !achievement.unlocked ? setActiveTooltipId(index) : setActiveTooltipId(null)}
                >
                  <div className="relative w-[40px] h-[40px] sm:w-[48px] sm:h-[48px] md:w-[56px] md:h-[56px]">
                    {achievement.unlocked ? (
                      achievement.image ? (
                        <img 
                          src={achievement.image} 
                          alt={achievement.tooltipTitle} 
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full rounded-lg bg-gray-100 flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-gray-200" />
                        </div>
                      )
                    ) : (
                      <div className="w-full h-full rounded-lg bg-gray-100" />
                    )}
                    
                    {!achievement.unlocked && (
                      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 flex flex-col items-center justify-center gap-1">
                        <div className="bg-white/90 rounded-full p-2 shadow-sm">
                          <Lock className="w-4 h-4 text-gray-400" />
                        </div>
                        <span className="text-[10px] font-medium text-gray-500">Locked</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="w-full text-center mt-2">
                    <div className="text-xs sm:text-sm font-medium mb-1 line-clamp-1 px-1">
                      {achievement.tooltipTitle}
                    </div>
                    <div className="text-xs text-gray-500 mb-1">
                      {achievement.progress}%
                    </div>
                    <div className="h-1.5 w-full max-w-[120px] mx-auto bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ease-in-out ${
                          getProgressBarColor(achievement.progress)
                        }`}
                        style={{ width: `${achievement.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
                
                <div 
                  className={cn(
                    "absolute inset-0 z-[100] bg-black/90 backdrop-blur-sm shadow-lg p-2 rounded-lg border border-gray-800 pointer-events-none",
                    activeTooltipId === index ? "opacity-100" : "opacity-0"
                  )}
                >
                  <p className="font-medium text-xs sm:text-sm text-white">{achievement.tooltipTitle}</p>
                  <p className="text-xs text-gray-400">{achievement.tooltipSubtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

const AchievementContent = (props: AchievementContentProps) => {
  return (
    <Suspense 
      fallback={
        <div className="flex items-center justify-center h-[600px]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      }
    >
      <AchievementContentInner {...props} />
    </Suspense>
  );
};

export default AchievementContent;