"use client"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface Message {
  speaker: string;
  avatar: string;
  content: string;
  isAgent: boolean;
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
      <div className="flex-grow overflow-y-auto pr-4 space-y-4">
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
