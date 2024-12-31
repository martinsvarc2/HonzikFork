'use client'

import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, ChevronLeft, ChevronDown, ChevronUp } from 'lucide-react'
import { AnimatedLock } from './AnimatedLock'
import { ScorePanel } from './ScorePanel'

function useCharacterState(
  memberId: string | null,
  performanceGoals: {
    overall_performance_goal: number;
    number_of_calls_average: number;
  } | null
) {
  const [characterStates, setCharacterStates] = useState<{
    [key: string]: {
      isLocked: boolean;
      animationShown: boolean;
      metrics: any | null;
    };
  }>({});
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const initializationRef = useRef(false);

  useEffect(() => {
    if (!memberId || !performanceGoals || initializationRef.current) return;
    
    async function initializeCharacterStates() {
      try {
        // Fetch all character states in parallel
        const statePromises = characters.map(async (character) => {
          const [unlockRes, metricsRes] = await Promise.all([
            fetch(`/api/tbai-assistants/unlock-animations?memberId=${memberId}&characterName=${character.name}`),
            fetch(`/api/tbai-assistants/character-performance?memberId=${memberId}&characterName=${character.name}`)
          ]);

          const [unlockData, metricsData] = await Promise.all([
            unlockRes.json(),
            metricsRes.json()
          ]);

          return {
            name: character.name,
            isLocked: !unlockData.unlocked,
            animationShown: unlockData.shown,
            metrics: metricsData
          };
        });

        const results = await Promise.all(statePromises);
        
       const newStates = results.reduce<Record<string, CharacterState>>((acc, result: CharacterStateResult) => {
  acc[result.name] = {
    isLocked: result.isLocked,
    animationShown: result.animationShown,
    metrics: result.metrics
  };
  return acc;
}, {});

        setCharacterStates(newStates);
        setIsInitialLoad(false);
        initializationRef.current = true;
      } catch (error) {
        console.error('Error initializing character states:', error);
        setIsInitialLoad(false);
      }
    }

    initializeCharacterStates();
  }, [memberId, performanceGoals]);

  const unlockCharacter = useCallback(async (characterName: string) => {
    if (!memberId) return;

    try {
      await fetch('/api/tbai-assistants/unlock-animations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, characterName })
      });

      setCharacterStates(prev => ({
        ...prev,
        [characterName]: {
          ...prev[characterName],
          isLocked: false,
          animationShown: true
        }
      }));
    } catch (error) {
      console.error('Error unlocking character:', error);
    }
  }, [memberId]);

  return {
    characterStates,
    isInitialLoad,
    unlockCharacter
  };
}

declare global {
  interface Window {
    $memberstackDom: {
      getCurrentMember: () => Promise<{
        data: {
          id: string;
        } | null;
      }>;
    };
  }
}

const scrollbarStyles = `
  .scrollbar-thin {
    /* Firefox */
    scrollbar-width: thin;
    scrollbar-color: #f2f3f8 transparent;
  }
  
  .scrollbar-thin::-webkit-scrollbar {
    width: 2px !important;
    display: block !important;
  }
  
  .scrollbar-thin::-webkit-scrollbar-track {
    background: transparent !important;
    display: block !important;
  }
  
  .scrollbar-thin::-webkit-scrollbar-thumb {
    background-color: #f2f3f8 !important;
    border-radius: 20px !important;
    display: block !important;
    opacity: 1 !important;
    visibility: visible !important;
  }

  /* Explicitly remove both up and down buttons */
  .scrollbar-thin::-webkit-scrollbar-button:single-button {
    display: none !important;
    height: 0 !important;
    width: 0 !important;
    background: none !important;
  }
  
  .scrollbar-thin::-webkit-scrollbar-button:start {
    display: none !important;
  }
  
  .scrollbar-thin::-webkit-scrollbar-button:end {
    display: none !important;
  }
  
  /* Remove any potential button spaces */
  .scrollbar-thin::-webkit-scrollbar-button:vertical:start:decrement,
  .scrollbar-thin::-webkit-scrollbar-button:vertical:end:increment,
  .scrollbar-thin::-webkit-scrollbar-button:vertical:start:increment,
  .scrollbar-thin::-webkit-scrollbar-button:vertical:end:decrement {
    display: none !important;
  }
`

interface Character {
  name: string
  difficulty: "Easy" | "Intermediate" | "Expert"
  age: number
  description: string
  imageSrc: string
  color: string
  locked?: boolean
  scores?: {
    overallPerformance: number
    engagement: number
    objectionHandling: number
    informationGathering: number
    programExplanation: number
    closingSkills: number
    overallEffectiveness: number
  }
}
interface PerformanceMetrics {
  overall_performance: number;
  engagement: number;
  objection_handling: number;
  information_gathering: number;
  program_explanation: number;
  closing_skills: number;
  overall_effectiveness: number;
  total_calls: number;
}

interface AnimatedStartButtonProps {
  onStart: () => void;
  isLocked?: boolean;
  showLockedText?: boolean;
}

interface CharacterState {
  isLocked: boolean;
  animationShown: boolean;
  metrics: any;  // You can make this more specific based on your metrics type
}

// Then define interface for the result object
interface CharacterStateResult {
  name: string;
  isLocked: boolean;
  animationShown: boolean;
  metrics: any;
}

const AnimatedStartButton: React.FC<AnimatedStartButtonProps> = ({ onStart, isLocked, showLockedText }) => {
  const [state, setState] = useState<'idle' | 'loading' | 'complete'>('idle')
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (state === 'loading') {
      const startTime = Date.now();
      const duration = 3000; // 3 seconds

      const updateProgress = () => {
        const elapsedTime = Date.now() - startTime;
        const newProgress = Math.min((elapsedTime / duration) * 100, 100);
        setProgress(newProgress);

        if (newProgress < 100) {
          requestAnimationFrame(updateProgress);
        } else {
          setState('complete');
        }
      };

      requestAnimationFrame(updateProgress);
    }
  }, [state])

  const handleClick = () => {
    if (state === 'idle' && !isLocked) {
      onStart();
      setState('loading')
      setProgress(0)
    }
  }

  return (
    <div className={`relative overflow-hidden rounded-[20px] bg-[#5f0bb9] text-white shadow-lg w-full h-[48px] ${isLocked ? 'opacity-50' : ''}`}
         style={{
           boxShadow: "0 4px 14px 0 rgba(95, 11, 185, 0.39)"
         }}>
      <AnimatePresence mode="wait" initial={false}>
        {state === 'idle' && (
          <motion.button
            className="absolute inset-0 flex items-center justify-center text-lg font-bold"
            onClick={handleClick}
            whileHover={!isLocked ? { scale: 1.05 } : {}}
            whileTap={!isLocked ? { scale: 0.95 } : {}}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              scale: { type: "spring", stiffness: 300, damping: 25 },
              opacity: { duration: 0.2 }
            }}
            disabled={isLocked}
          >
            START {showLockedText ? '(LOCKED)' : ''}
          </motion.button>
        )}

        {state === 'loading' && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <motion.div 
              className="mb-2 text-sm"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              Preparing call...
            </motion.div>
            <div className="h-2 w-4/5 overflow-hidden rounded-full bg-[#4c098f]">
              <motion.div
                className="h-full bg-white"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: "linear" }}
              />
            </div>
          </motion.div>
        )}

        {state === 'complete' && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <motion.div 
              className="text-lg font-bold"
              initial={{ y: 48 }}
              animate={{ y: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30,
                delay: 0.1
              }}
            >
              Call Starting
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const characters: Character[] = [
  {
    name: "Megan",
    difficulty: "Easy",
    age: 25,
    description: "I'm Megan, 25, fresh out of college with my marketing degree and diving headfirst into real estate. Everything's new territory for me right now, especially wholesaling - it's like learning a whole new language! I'm super eager to learn though, and I've got plenty of questions. Hope you don't mind walking me through the basics.",
    imageSrc: "https://cdn.prod.website-files.com/6715d8211d464cb83a0c72a1/672e571489c14976033b13e0_Obr%C3%A1zek%20WhatsApp%2C%202024-11-08%20v%2019.21.46_99e4962c-p-500.jpg",
    color: "#23c55f",
    locked: false, // Add this line
  },
  {
    name: "David",
    difficulty: "Intermediate",
    age: 40,
    description: "I'm David, 40, and I approach real estate decisions with the same analytical mindset I've developed over years in finance. Currently evaluating multiple offers for my property from wholesalers, and I need to make sure I'm not leaving money on the table. I dig into the details and expect clear, data-backed answers. Let's break down these options systematically.",
    imageSrc: "https://cdn.prod.website-files.com/6715d8211d464cb83a0c72a1/6729085f757129974706314d_image%20(6)-p-500.png",
    color: "#FCA147",
    locked: true,
  },
  {
    name: "Linda",
    difficulty: "Expert",
    age: 55,
    description: "I'm Linda, 55, with decades in real estate investing and a legal background that makes me question everything twice. I've seen too many deals go south to take anything at face value. While wholesaling might be legal, I have serious concerns about how it's used with distressed properties. Let's talk ethics and compliance.",
    imageSrc: "https://cdn.prod.website-files.com/6715d8211d464cb83a0c72a1/6729085f8a8dc1e8f78eae9b_image%20(7)-p-500.png",
    color: "#DC2626",
    locked: true,
  },
]

function LockedOverlay({ 
  previousAssistant, 
  isLastLocked, 
  difficulty,
  performanceGoals,
  showUnlockAnimation,
  onAnimationComplete,
  characterName
}: { 
  previousAssistant: string; 
  isLastLocked: boolean; 
  difficulty: string;
  performanceGoals: {
    overall_performance_goal: number;
    number_of_calls_average: number;
  };
  showUnlockAnimation?: boolean;
  onAnimationComplete?: () => void;
  characterName: string;
}) {
  const glowColor = 
    difficulty === 'Easy' 
      ? 'rgba(72, 199, 174, 0.5)' 
      : difficulty === 'Intermediate'
        ? 'rgba(252, 161, 71, 0.5)'
        : 'rgba(220, 38, 38, 0.5)';

  useEffect(() => {
    if (showUnlockAnimation) {
      const timeout = setTimeout(() => {
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      }, 3000); // Match this with your animation duration

      return () => clearTimeout(timeout);
    }
  }, [showUnlockAnimation, onAnimationComplete]);

  return (
    <div 
      className="absolute inset-0 rounded-[15px] flex items-center justify-center bg-black/40 backdrop-blur-sm" 
      style={{ 
        boxShadow: `0 0 20px ${glowColor}`
      }}
    >
      <div className="w-[400px] h-[400px] p-6 pt-16 text-center flex flex-col items-center justify-start">
        <div>
          <div className="flex justify-center items-center gap-4 mb-8 w-full">
            <AnimatedLock 
              characterName={previousAssistant}
              isLocked={!showUnlockAnimation}
              onUnlockShown={onAnimationComplete}
            />
          </div>
          <h3 className="text-3xl font-bold text-white mb-4">Character Locked</h3>
          <p className="text-white text-xl mb-8">
            {`Achieve Overall Performance above ${performanceGoals.overall_performance_goal} from the past ${performanceGoals.number_of_calls_average} calls on ${previousAssistant} to Unlock.`}
          </p>
          <div className="w-full">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-white">Overall Performance</span>
              <span className="text-sm font-bold text-white">{performanceGoals.overall_performance_goal}/100</span>
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden relative">
              <div 
                className="h-full bg-gradient-to-r from-white to-gray-200 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${performanceGoals.overall_performance_goal}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


export default function CharacterSelection() {
  const [teamId, setTeamId] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<{ [key: string]: 'description' | 'scores' }>({
    Megan: 'description',
    David: 'description',
    Linda: 'description'
  });
  const [memberId, setMemberId] = useState<string | null>(null);
  const [performanceGoals, setPerformanceGoals] = useState<{
    overall_performance_goal: number;
    number_of_calls_average: number;
  } | null>(null);  // Start as null since we'll fetch it
  
  const { characterStates, isInitialLoad, unlockCharacter } = useCharacterState(memberId, performanceGoals);

useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tid = urlParams.get('teamId');
    setTeamId(tid);
  }, []);

  useEffect(() => {
  // Get memberId directly from URL
  const searchParams = new URLSearchParams(window.location.search);
  const mid = searchParams.get('memberId');
  console.log('Found memberId in URL:', mid);
  
  if (mid) {
    setMemberId(mid);
  } else {
    // Only try message approach if no URL parameter
    window.parent.postMessage({ type: 'GET_MEMBER_ID' }, '*');
  }

  const handleMessage = (event: MessageEvent) => {
    if (event.data.type === 'SET_MEMBER_ID' && event.data.memberId) {
      console.log('Received member ID:', event.data.memberId);
      setMemberId(event.data.memberId);
    }
  };

  window.addEventListener('message', handleMessage);
  return () => window.removeEventListener('message', handleMessage);
}, []);

const handleStart = async (character: Character) => {
  console.log('Start button clicked for:', character.name);
  console.log('Current memberId:', memberId);
  console.log('Current teamId:', teamId);

  if (!memberId) {
    console.error('No member ID found');
    return;
  }

  const apiUrls: Record<string, string> = {
    Megan: 'https://aiemployee.app.n8n.cloud/webhook/2b36f9f1-6dc9-4bf5-878d-f63dffb0141b',
    David: 'https://aiemployee.app.n8n.cloud/webhook/2b36f9f1-6dc9-4bf5-878d-f63dffb0141b',
    Linda: 'https://aiemployee.app.n8n.cloud/webhook/2b36f9f1-6dc9-4bf5-878d-f63dffb0141b'
  };

  const apiUrl = apiUrls[character.name];
  if (!apiUrl) {
    console.error('No API URL found for character:', character.name);
    return;
  }

  try {
    // Create the form directly with the data we need
    const form = document.createElement('form');
    form.method = 'POST';
    form.style.display = 'none';
    form.target = '_top'; // Force top-level navigation

    // Add member_ID input
    const memberInput = document.createElement('input');
    memberInput.type = 'hidden';
    memberInput.name = 'member_ID';
    memberInput.value = memberId;
    form.appendChild(memberInput);

    // Add teamId input if it exists
    if (teamId) {
      const teamInput = document.createElement('input');
      teamInput.type = 'hidden';
      teamInput.name = 'teamId';
      teamInput.value = teamId;
      form.appendChild(teamInput);
    }

    // Add character input
    const characterInput = document.createElement('input');
    characterInput.type = 'hidden';
    characterInput.name = 'character';
    characterInput.value = character.name;
    form.appendChild(characterInput);

    // Set the form action URL with query parameters
    const params = new URLSearchParams({
      member_ID: memberId,
      ...(teamId && { teamId }),
      character: character.name
    });
    form.action = `${apiUrl}?${params.toString()}`;

    // Add the form to the document and submit it
    document.body.appendChild(form);
    form.submit();

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(form);
    }, 1000);

  } catch (error) {
    console.error('Error during redirect:', error);
    
    // Fallback: Try direct navigation if form submission fails
    if (window.top) {
      window.top.location.href = apiUrl + '?' + new URLSearchParams({
        member_ID: memberId,
        ...(teamId && { teamId }),
        character: character.name
      }).toString();
    }
  }
};

  const togglePanel = (name: string) => {
    setActivePanel(prev => ({
      ...prev,
      [name]: prev[name] === 'description' ? 'scores' : 'description'
    }));
  };

useEffect(() => {
  const fetchPerformanceGoals = async () => {
    try {
      // Get teamId from URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const teamId = urlParams.get('teamId');

      console.log('Fetching performance goals for teamId:', teamId);
      const response = await fetch(`/api/tbai-assistants/performance-goals?teamId=${teamId}`);
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched performance goals:', data);
        setPerformanceGoals(data);
      } else {
        console.error('Failed to fetch performance goals:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching performance goals:', error);
    }
  };

  fetchPerformanceGoals();
}, []);

useLayoutEffect(() => {
  const updateHeight = () => {
    const height = document.documentElement.scrollHeight;
    window.parent.postMessage({
      type: 'RESIZE_IFRAME',
      height: height
    }, '*');
  };

  // Update height on initial render
  updateHeight();

  // Update height when panel state changes
  const observer = new ResizeObserver(updateHeight);
  observer.observe(document.body);

  // Update height when images load
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    if (img.complete) {
      updateHeight();
    } else {
      img.addEventListener('load', updateHeight);
    }
  });

  return () => {
    observer.disconnect();
    images.forEach(img => img.removeEventListener('load', updateHeight));
  };
}, [activePanel]);
  
return (
  <div className="w-full h-auto bg-white rounded-[20px]">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-5">
      {characters.map((character, index) => {
        if (isInitialLoad) {
          return (
            <motion.div
              key={`${character.name}-skeleton`}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: index * 0.2,
                ease: [0.23, 1, 0.32, 1]
              }}
              className="bg-white rounded-[20px] shadow-lg overflow-hidden"
            >
              <div className="p-4 flex flex-col items-center">
                {/* Profile Image Skeleton */}
                <div className="w-32 h-32 mb-4 rounded-[20px] bg-gradient-to-r from-gray-100 to-gray-200 animate-pulse" />
                
                {/* Name and Difficulty Skeleton */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-6 w-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full animate-pulse" />
                  <div className="h-6 w-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full animate-pulse" />
                </div>

                {/* Start Button Skeleton */}
                <div className="w-full h-12 mb-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-[20px] animate-pulse" />

                {/* Toggle Button Skeleton */}
                <div className="w-full h-12 mb-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-[20px] animate-pulse" />

                {/* Description Skeleton */}
                <div className="space-y-2 w-full">
                  <div className="h-4 w-full bg-gradient-to-r from-gray-100 to-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-5/6 bg-gradient-to-r from-gray-100 to-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-4/6 bg-gradient-to-r from-gray-100 to-gray-200 rounded animate-pulse" />
                </div>
              </div>
            </motion.div>
          );
        }

        const characterState = characterStates[character.name];
        const prevCharacter = index > 0 ? characters[index - 1] : null;
        const prevCharacterState = prevCharacter ? characterStates[prevCharacter.name] : null;

        let shouldBeUnlocked = index === 0;
        if (index > 0 && prevCharacterState && prevCharacterState.metrics && performanceGoals) {
          const meetsPerformance = prevCharacterState.metrics.overall_performance >= performanceGoals.overall_performance_goal;
          const meetsCalls = prevCharacterState.metrics.total_calls >= performanceGoals.number_of_calls_average;
          shouldBeUnlocked = meetsPerformance && meetsCalls;
        }

        if (shouldBeUnlocked && characterState?.isLocked && !characterState.animationShown) {
          unlockCharacter(character.name);
        }

        const showUnlockAnimation = shouldBeUnlocked && characterState?.isLocked && !characterState.animationShown;

        return (
          <motion.div 
            key={character.name}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: index * 0.2,
              ease: [0.23, 1, 0.32, 1]
            }}
            className="relative rounded-[20px] overflow-hidden"
            style={{ 
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)'
            }}
          >
      <div className="p-4 flex flex-col items-center text-center">
        {/* Character card content remains the same */}
        <div className="w-full px-5 mb-2">
          <div 
            className="w-32 h-32 mx-auto relative overflow-hidden rounded-[20px] transition-all duration-300 ease-in-out" 
            style={{ 
              perspective: '1000px',
            }}
          >
            <div 
              className="w-full h-full absolute inset-0" 
              style={{ 
                border: `7px solid ${
                  character.name === 'Megan'
                    ? 'rgba(35, 197, 95, 0.5)'
                    : character.name === 'David'
                      ? 'rgba(250, 162, 72, 0.5)'
                      : 'rgba(236, 27, 38, 0.5)'
                }`,
                borderRadius: '20px',
                zIndex: 2
              }}
            />
            <div className="w-full h-full relative">
              <Image
                src={character.imageSrc}
                alt={character.name}
                fill
                className="object-cover rounded-[14px]"
              />
            </div>
          </div>
        </div>

        <div className="w-full mb-2 flex flex-col items-center">
          <div className="flex items-center gap-2 py-1">
            <h2 className="text-2xl font-bold text-black">
              {character.name}
            </h2>
            <div
              className="px-3 py-1 rounded-full text-white font-semibold text-sm"
              style={{ backgroundColor: character.color }}
            >
              {character.difficulty.toUpperCase()}
            </div>
          </div>
          <AnimatedStartButton 
            onStart={() => handleStart(character)}
            isLocked={characterState?.isLocked}
            showLockedText={characterState?.isLocked}
          />
        </div>

<div className="relative w-full flex-grow">
  <button 
    onClick={() => togglePanel(character.name)}
    className="w-full py-3 rounded-[20px] text-black font-semibold text-lg transition-all hover:opacity-90 hover:shadow-lg bg-white shadow-md mb-2"
  >
    <span>
      {activePanel[character.name] === 'description' ? 'View Performance' : 'Back to Description'}
    </span>
    {activePanel[character.name] === 'description' ? (
      <ChevronDown size={20} className="inline-block ml-2" />
    ) : (
      <ChevronUp size={20} className="inline-block ml-2" />
    )}
  </button>

          <div className="min-h-[300px] overflow-hidden relative">
            <AnimatePresence initial={false}>
              {activePanel[character.name] === 'description' ? (
                <motion.div
                  key="description"
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "-100%", opacity: 0 }}
                  transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
                  className="absolute inset-0"
                >
                  <p className="text-gray-600 text-base leading-relaxed text-center pt-2">
                    {character.description}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="scores"
                  initial={{ y: "-100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "100%", opacity: 0 }}
                  transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
                  className="absolute inset-0 overflow-hidden"
                >
                  {!isInitialLoad && performanceGoals && (
  <ScorePanel 
    characterName={character.name}
    memberId={memberId || ''}
    teamId={teamId}
    performanceGoals={performanceGoals}
  />
)}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Only show LockedOverlay if character is locked */}
     {characterState?.isLocked && performanceGoals && (
              <LockedOverlay 
                previousAssistant={prevCharacter?.name || ''}
                isLastLocked={index === characters.length - 1}
                difficulty={character.difficulty}
                performanceGoals={performanceGoals}
                showUnlockAnimation={showUnlockAnimation}
                onAnimationComplete={() => {
                  if (showUnlockAnimation) {
                    unlockCharacter(character.name);
                  }
                }}
                characterName={character.name}
              />
            )}
          </motion.div>
        );
      })}
    </div>
  </div>
);
}
