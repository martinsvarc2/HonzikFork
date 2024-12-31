import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import LeagueChart from './LeagueChart'
import { Badge, ACHIEVEMENTS } from '@/lib/achievement-data'
import LeagueLoading from "./LeagueLoading"
const FEATURE_ENABLED = false;

interface LeaguePlayer {
  rank: number;
  name: string;
  points: number;
  avatar: string;
  badges: string[];
  memberId: string;
}

interface LeagueApiResponse {
  weeklyRankings: {
    member_id: string;
    user_name: string;
    user_picture: string;
    points: number;
    unlocked_badges: string;
    rank: number;
  }[];
  teamRankings: {
    member_id: string;
    user_name: string;
    user_picture: string;
    points: number;
    unlocked_badges: string;
    rank: number;
  }[];
  userData: {
    member_id: string;
    user_name: string;
    user_picture: string;
    points: number;
    unlocked_badges: string;
    team_id?: string;
    daily_points?: Record<string, number>;
  } | null;
  chartData: {
    day: string;
    date: string;
    you: number;
  }[];
}

interface LeagueProps {
  activeCategory: 'weekly' | 'teamWeekly';
  setActiveLeagueCategory: (category: 'weekly' | 'teamWeekly') => void;
}

const getMemberId = async () => {
  try {
    const memberstack = (window as any).memberstack;
    if (memberstack) {
      const member = await memberstack.getCurrentMember();
      if (member) return member.id;
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    const memberId = urlParams.get('memberId');
    if (memberId) return memberId;
    
    return 'test123';
  } catch (error) {
    console.log('Using test member ID');
    return 'test123';
  }
};

const getImageUrl = (url: string, memberId: string) => {
  const timestamp = new Date().getTime();
  if (url?.includes('cloudinary')) {
    return `${url}?t=${timestamp}`;
  }
  return `${url}?userId=${memberId}&t=${timestamp}`;
};

function League({ activeCategory, setActiveLeagueCategory }: LeagueProps) {
  const [leagueData, setLeagueData] = useState<{ weekly: LeaguePlayer[]; teamWeekly: LeaguePlayer[] }>({
    weekly: [],
    teamWeekly: []
  });
  const [currentUser, setCurrentUser] = useState<LeaguePlayer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [apiData, setApiData] = useState<LeagueApiResponse | null>(null);

  const getBadgeImages = (unlocked_badges: string | null | undefined): string[] => {
    if (!unlocked_badges) return [];
    try {
      const allAchievements = [
        ...ACHIEVEMENTS.streak,
        ...ACHIEVEMENTS.calls,
        ...ACHIEVEMENTS.activity,
        ...ACHIEVEMENTS.league
      ];

      const images: string[] = [];
      
      allAchievements
        .filter(badge => unlocked_badges.includes(badge.id))
        .forEach(badge => {
          if (badge.image && !images.includes(badge.image)) {
            images.push(badge.image);
          }
        });

      return images;
    } catch (error) {
      console.error('Error processing badges:', error);
      return [];
    }
  };

  useEffect(() => {
    const fetchLeagueData = async () => {
      try {
        if (!leagueData.weekly.length) {
          setIsLoading(true);
        }
        const memberId = await getMemberId();
        const response = await fetch(`/api/achievements?memberId=${memberId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch league data');
        }
        
        const data = await response.json() as LeagueApiResponse;
        setApiData(data);
        
        if (!data.userData) {
          setIsNewUser(true);
          setCurrentUser(null);
          setLeagueData({ weekly: [], teamWeekly: [] });
          return;
        }

        setIsNewUser(false);
        
        const transformRankings = (rankings: any[]): LeaguePlayer[] => {
          return rankings.map(player => ({
            rank: player.rank,
            name: player.user_name,
            points: player.points || 0,
            avatar: getImageUrl(
              player.user_picture || 'https://res.cloudinary.com/dmbzcxhjn/image/upload/v1732590120/WhatsApp_Image_2024-11-26_at_04.00.13_58e32347_owfpnt.jpg',
              player.member_id
            ),
            badges: getBadgeImages(player.unlocked_badges),
            memberId: player.member_id
          }));
        };

        const weeklyPlayers = transformRankings(data.weeklyRankings);
        const teamPlayers = transformRankings(data.teamRankings);

        setLeagueData({
          weekly: weeklyPlayers,
          teamWeekly: teamPlayers
        });

        const findUserInRankings = (rankings: LeaguePlayer[]) => 
          rankings.find(player => player.memberId === memberId) || null;

        setCurrentUser(findUserInRankings(
          activeCategory === 'weekly' ? weeklyPlayers : teamPlayers
        ));

      } catch (error) {
        console.error('Error fetching league data:', error);
        setError('Failed to load league data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeagueData();
  }, [activeCategory]);

  const renderContent = () => {
    if (!FEATURE_ENABLED) {
      return (
        <div className="relative h-full">
          <img 
            src="https://res.cloudinary.com/dmbzcxhjn/image/upload/coming_soon_kkqdby.png"
            alt="Coming Soon"
            className="absolute inset-0 w-full h-full object-cover rounded-[20px] z-10"
          />
          <div className="invisible">
            <Card className="p-3 bg-white rounded-[20px] shadow-lg h-full">
              <LeagueLoading />
            </Card>
          </div>
        </div>
      );
    }

    if (isLoading) {
      return (
        <Card className="p-3 bg-white rounded-[20px] shadow-lg h-full">
          <LeagueLoading />
        </Card>
      );
    }

    if (error) {
      return (
        <Card className="p-3 bg-white rounded-[20px] shadow-lg h-full">
          <div className="text-red-500">{error}</div>
        </Card>
      );
    }

    const categoryData = leagueData[activeCategory === 'weekly' ? 'weekly' : 'teamWeekly'];

    return (
      <Card className="p-3 bg-white rounded-[20px] shadow-lg h-full">
        <div className="flex items-center gap-2 mb-4">
          <img 
            src="https://res.cloudinary.com/drkudvyog/image/upload/v1733941975/League_icon_duha_ai73hb.png"
            alt="League Icon"
            className="h-6 w-6"
          />
          <h2 className="text-2xl font-semibold text-[#000000]">League</h2>
        </div>
        
        <div className="flex gap-2 mb-6">
          <Button
            onClick={() => setActiveLeagueCategory('weekly')}
            aria-label="Weekly League"
            className={cn(
              "flex-1 px-4 py-2 text-base font-medium transition-colors rounded-full",
              activeCategory === 'weekly' 
                ? "bg-[#f8b922] text-white hover:bg-[#f8b922]/90" 
                : "bg-transparent text-gray-500 hover:bg-gray-100"
            )}
          >
            Weekly League
          </Button>
          <Button 
            onClick={() => setActiveLeagueCategory('teamWeekly')}
            aria-label="Team Weekly"
            className={cn(
              "flex-1 px-4 py-2 text-base font-medium transition-colors rounded-full",
              activeCategory === 'teamWeekly' 
                ? "bg-[#f8b922] text-white hover:bg-[#f8b922]/90" 
                : "bg-transparent text-gray-500 hover:bg-gray-100"
            )}
          >
            Team Weekly
          </Button>
        </div>

        {isNewUser ? (
          <div className="bg-[#ce00cb]/10 p-4 rounded-[20px] mb-6 text-center">
            <p className="text-[#ce00cb] font-medium mb-2">Welcome to the League! 🎉</p>
            <p className="text-gray-600">Start sessions to earn points and compete with others</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <LeagueChart 
                chartData={apiData?.chartData || []}
                weeklyRankings={apiData?.weeklyRankings || []}
              />
            </div>

            {currentUser && (
              <div className="bg-[#ce00cb] text-white p-2 rounded-[20px] flex items-center gap-2 text-sm mb-6">
                <span className="text-white/90 font-medium">#{currentUser.rank}</span>
                <img 
                  src={currentUser.avatar} 
                  alt="" 
                  className="w-8 h-8 rounded-full" 
                  onError={(e) => {
                    e.currentTarget.src = 'https://res.cloudinary.com/dmbzcxhjn/image/upload/v1732590120/WhatsApp_Image_2024-11-26_at_04.00.13_58e32347_owfpnt.jpg'
                  }}
                />
                <div className="flex items-center gap-1">
                  <span className="font-medium">{currentUser.name}</span>
                  <Badge badges={currentUser.badges} />
                </div>
                <span className="ml-auto font-medium">{currentUser.points} pts</span>
              </div>
            )}

            <h3 className="text-base font-semibold text-[#000000] mt-4 mb-2">Top 3 places</h3>

            {categoryData.slice(0, 3).map((player, index) => (
              <div 
                key={player.memberId} 
                className={cn(
                  "p-2 rounded-[20px] flex items-center gap-2 text-sm border mb-2",
                  index === 0 ? "border-[#f8b922] text-[#f8b922]" :
                  index === 1 ? "border-[#5b06be] text-[#5b06be]" :
                  "border-[#f97316] text-[#f97316]"
                )}
              >
                <span className="font-medium">#{player.rank}</span>
                <img 
                  src={player.avatar} 
                  alt="" 
                  className="w-8 h-8 rounded-full" 
                  onError={(e) => {
                    e.currentTarget.src = 'https://res.cloudinary.com/dmbzcxhjn/image/upload/v1732590120/WhatsApp_Image_2024-11-26_at_04.00.13_58e32347_owfpnt.jpg'
                  }}
                />
                <div className="flex items-center gap-1">
                  <span className="font-medium">{player.name}</span>
                  <Badge badges={player.badges} />
                </div>
                <span className="ml-auto font-medium">{player.points} pts</span>
              </div>
            ))}
          </>
        )}
      </Card>
    );
  };

  return renderContent();
}

export default League;
