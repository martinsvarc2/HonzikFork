'use client'

import LoadingSpinner from '@/components/ui/loading-spinner'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Heart, MessageSquare, Plus, X, Reply, Trash2, Search, Maximize2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Image from 'next/image'

interface ApiResponse {
  topics: Topic[];
  comments: Comment[];
  error?: string;
}

const fetchCommunityData = async (memberId: string): Promise<ApiResponse> => {
  const response = await fetch(`/api/request-feature/community?memberId=${memberId}`);
  const data = await response.json();
  return data;
};

const createTopic = async (memberId: string, topic: { title: string; content: string }) => {
  const response = await fetch(`/api/request-feature/community?memberId=${memberId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'topic',
      title: topic.title,
      content: topic.content
    }),
  });
  return response.json();
};

const createComment = async (memberId: string, comment: {
  topicId: number;
  parentCommentId?: number;
  content: string;
  author: string;
}) => {
  const response = await fetch(`/api/request-feature/community?memberId=${memberId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'comment',
      ...comment
    }),
  });
  return response.json();
};

const toggleLike = async (memberId: string, id: number, type: 'topic' | 'comment') => {
  const response = await fetch(`/api/request-feature/community?memberId=${memberId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type,
      id,
      action: 'like'
    }),
  });
  return response.json();
};

type Status = 'Shipped' | 'In Progress' | 'Pending'

interface Topic {
  id: number
  title: string
  content: string
  author: string
  avatar_url: string
  avatar_color: string
  created_at: string
  likes: number
  comment_count: number
  status?: Status
  is_liked?: boolean
}

interface Comment {
  id: number
  topic_id: number
  parent_comment_id: number | null
  content: string
  author: string
  created_at: string
  likes: number
  is_liked: boolean
  level: number
  path: number[]
}

type CommentsType = {
  [key: number]: Comment[]
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years !== 1 ? 's' : ''} ago`;
}

export default function Support() {
  const searchParams = useSearchParams()
  const memberId = searchParams.get('memberId')

  const [topics, setTopics] = useState<Topic[]>([])
  const [comments, setComments] = useState<{ [key: number]: Comment[] }>({})
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPost, setSelectedPost] = useState<Topic | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeComments, setActiveComments] = useState<{ id: number; isOpen: boolean }>({ id: 0, isOpen: false })
  const [newComment, setNewComment] = useState('')
  const [replyTo, setReplyTo] = useState<{ commentId: number | null, author: string | null }>({ commentId: null, author: null })
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; commentId: number | null }>({
    isOpen: false,
    commentId: null
  })
  const [sortBy, setSortBy] = useState<'newest' | 'most-liked' | 'most-commented'>('most-liked');
  const [newPostDialogOpen, setNewPostDialogOpen] = useState(false)
  const [newPostForm, setNewPostForm] = useState({
    title: '',
    content: ''
  })

  useEffect(() => {
    const fetchData = async () => {
      if (!memberId) return
      setIsLoading(true)
      try {
        const data = await fetchCommunityData(memberId)
        setTopics(data.topics)
        
        const groupedComments = data.comments.reduce((acc: { [key: number]: Comment[] }, comment) => {
          const topicId = comment.topic_id
          if (!acc[topicId]) acc[topicId] = []
          acc[topicId].push(comment)
          return acc
        }, {})
        
        setComments(groupedComments)
      } catch (error) {
        console.error('Failed to fetch data:', error)
      }
      setIsLoading(false)
    }

    fetchData()
  }, [memberId])

  const handleCommentLike = async (commentId: number) => {
    if (!memberId) return
    try {
      const response = await toggleLike(memberId, commentId, 'comment')
      setComments(prev => {
        const newComments = { ...prev }
        Object.keys(newComments).forEach(key => {
          const topicId = parseInt(key, 10)
          if (!isNaN(topicId) && Array.isArray(newComments[topicId])) {
            newComments[topicId] = newComments[topicId].map(comment => 
              comment.id === commentId
                ? { ...comment, likes: response.comment.likes, is_liked: !comment.is_liked }
                : comment
            )
          }
        })
        return newComments
      })
    } catch (error) {
      console.error('Failed to toggle comment like:', error)
    }
  }

const handleLike = async (topicId: number) => {
  if (!memberId) return;
  
  try {
    const response = await fetch(`/api/request-feature/community?memberId=${memberId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'topic',
        id: topicId,
        action: 'like'
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to toggle like');
    }

    const data = await response.json();
    
    if (data.topic) {
      setTopics(prev => prev.map(topic =>
        topic.id === topicId
          ? { ...topic, likes: data.topic.likes, is_liked: !topic.is_liked }
          : topic
      ));
    }
  } catch (error) {
    console.error('Failed to toggle like:', error);
  }
};

  const handleNewPost = async () => {
  if (!memberId || !newPostForm.title.trim() || !newPostForm.content.trim() || isSubmitting) return;

  try {
    setIsSubmitting(true);
    
    const response = await createTopic(memberId, {
      title: newPostForm.title,
      content: newPostForm.content
    });

    if (response.status === 'pending') {
      setNewPostForm({ title: '', content: '' });
      setNewPostDialogOpen(false);
    }
  } catch (error) {
    console.error('Failed to create topic:', error)
  } finally {
    setIsSubmitting(false);
  }
}

  const handleCommentSubmit = async () => {
  if (!memberId || !newComment.trim() || !selectedPost?.id) return;  // Add check for id

  try {
    const response = await createComment(memberId, {
      topicId: selectedPost.id,
      parentCommentId: replyTo.commentId || undefined,
      content: newComment,
      author: 'Your Name'
    });

      setComments(prev => {
        const updatedComments = [...(prev[selectedPost.id] || []), response.comment]
        return {
          ...prev,
          [selectedPost.id]: updatedComments
        }
      })

      setTopics(prev => prev.map(topic =>
        topic.id === selectedPost.id
          ? { ...topic, comment_count: topic.comment_count + 1 }
          : topic
      ))

      setNewComment('')
      setReplyTo({ commentId: null, author: null })
    } catch (error) {
      console.error('Failed to create comment:', error)
    }
  }

  const handleReply = (commentId: number, author: string) => {
    setReplyTo({ commentId, author })
    setNewComment(`@${author} `)
  }

  const handleDeleteClick = (commentId: number) => {
    setDeleteConfirm({ isOpen: true, commentId })
  }

  const handleConfirmDelete = () => {
    if (!selectedPost || !deleteConfirm.commentId) return
    
    setComments(prev => {
      const topicComments = prev[selectedPost.id] || []
      const updatedComments = topicComments.filter(comment => comment.id !== deleteConfirm.commentId)
      
      return {
        ...prev,
        [selectedPost.id]: updatedComments
      }
    })

    setTopics(prev => prev.map(topic =>
      topic.id === selectedPost.id
        ? { ...topic, comment_count: Math.max(0, topic.comment_count - 1) }
        : topic
    ))

    setDeleteConfirm({ isOpen: false, commentId: null })
  }

  const filteredAndSortedTopics = topics
    .filter(topic =>
      topic.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'most-liked':
          return b.likes - a.likes;
        case 'most-commented':
          return b.comment_count - a.comment_count;
        default:
          return b.likes - a.likes;
      }
    });

// The return statement inside the Support component continues here
  return (
    <>
      <div className="w-full h-screen flex flex-col">
        {!memberId ? (
          <div className="text-center py-8">No member ID provided</div>
       ) : isLoading ? (
  <LoadingSpinner />
) : (
  <>
            <div>
  <div className="bg-white rounded-2xl p-8 shadow-lg mb-2 border border-gray-100">
                <h2 className="text-2xl font-bold mb-6 text-gray-900">Upvote posts, or add new ones.</h2>
                <div className="space-y-4 text-gray-700">
                  <p>1. Use the search bar at the top to check if the request already exists.</p>
                  <p>2. Upvote any existing requests you want us to prioritize.</p>
                  <p>3. If your post does not exist yet, create a new one.</p>
                  <p>4. Duplicate requests will be deleted.</p>
                </div>
                <div className="mt-2 flex items-center gap-4">
                  <div className="relative flex-grow">
                    <Input
                      type="text"
                      placeholder="Search topics..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 pr-4 py-3 w-full rounded-full border-2 border-gray-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition duration-150 ease-in-out"
                    />
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  </div>
                  <Select
 value={sortBy}
 onValueChange={(value: string) => {
   if (value === 'newest' || value === 'most-liked' || value === 'most-commented') {
     setSortBy(value);
   }
 }}
 >
  <SelectTrigger className="w-[180px] rounded-full flex items-center gap-2">
    <Image
      src="https://res.cloudinary.com/drkudvyog/image/upload/v1734400792/Sort_icon_duha_tpvska.png"
      alt="Sort"
      width={16}
      height={16}
    />
    <SelectValue defaultValue="most-liked" placeholder="Sort by" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="newest">Newest</SelectItem>
    <SelectItem value="most-liked">Most liked</SelectItem>
    <SelectItem value="most-commented">Most commented</SelectItem>
  </SelectContent>
</Select>
                  <Button
                    onClick={() => setNewPostDialogOpen(true)}
                    className="bg-[#5b06be] hover:bg-[#4a05a0] text-white rounded-full px-6 py-3 flex items-center space-x-2 transition duration-150 ease-in-out"
                  >
                    <Plus size={20} />
                    <span>Create New Post</span>
                  </Button>
                </div>
              </div>
            </div>
<div 
  className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-y-auto max-h-[calc(100vh-280px)]"
  style={{
    scrollbarWidth: 'thin',
    scrollbarColor: '#5b06be #f3f4f6'
  }}
>
  {filteredAndSortedTopics.slice(0, Math.max(5, filteredAndSortedTopics.length)).map((topic, index) => (
                <div key={topic.id} className="group">
                  <div 
                    className="p-6 transition duration-150 ease-in-out hover:bg-gray-50 cursor-pointer" 
                    onClick={() => setSelectedPost(topic)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-grow">
                        <Avatar className="h-12 w-12 rounded-full">
  <AvatarImage src={topic.avatar_url} alt={topic.author} />
  <AvatarFallback className={`${topic.avatar_color} text-white`}>{topic.author[0]}</AvatarFallback>
</Avatar>
                        <div className="flex-grow">
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#5b06be] transition duration-150 ease-in-out flex items-center gap-2">
                            <span className="flex-grow truncate max-w-[calc(100%-120px)]" title={topic.title}>
                              {topic.title.length > 50 ? `${topic.title.substring(0, 50)}...` : topic.title}
                            </span>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleLike(topic.id);
                                }}
                                className="flex items-center space-x-1 text-gray-500 hover:text-[#5b06be] transition duration-150 ease-in-out"
                              >
                                <Heart className={`w-5 h-5 ${topic.is_liked ? 'fill-[#5b06be] text-[#5b06be]' : ''}`} />
                                <span className="text-sm">{topic.likes}</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedPost(topic);
                                }}
                                className="flex items-center space-x-1 text-gray-500 hover:text-[#5b06be] transition duration-150 ease-in-out"
                              >
                                <MessageSquare className="w-5 h-5" />
                                <span className="text-sm">{topic.comment_count}</span>
                              </button>
                            </div>
                          </h3>
                          <p className="text-sm text-gray-500">
                            Posted {formatTimeAgo(topic.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {index < filteredAndSortedTopics.length - 1 && <hr className="border-gray-100" />}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <Dialog open={!!selectedPost} onOpenChange={(isOpen) => !isOpen && setSelectedPost(null)}>
       <DialogContent className="sm:max-w-[700px] h-[80vh] bg-white overflow-hidden">
  <div className="absolute right-4 top-4">
    <button className="text-gray-400 hover:text-[#5b06be] transition-colors"
      onClick={() => setSelectedPost(null)}
    >
      <X className="w-5 h-5" />
    </button>
  </div>
<div className="space-y-1 flex flex-col h-full">
  <div className="flex-shrink-0">
  <div className="flex items-center gap-1"> {/* Changed from gap-3 to gap-2 */}
    <Avatar className="h-10 w-10"> {/* Optionally reduced avatar size from h-12 w-12 */}
      <AvatarImage src={selectedPost?.avatar_url} alt={selectedPost?.author} />
      <AvatarFallback className={selectedPost?.avatar_color}>{selectedPost?.author?.[0]}</AvatarFallback>
    </Avatar>
    <div className="space-y-0"> {/* Added space-y-0 to minimize spacing between name and timestamp */}
      <h2 className="font-semibold text-gray-900">{selectedPost?.author}</h2>
      <p className="text-sm text-gray-500">{formatTimeAgo(selectedPost?.created_at || '')}</p>
    </div>
  </div>
</div>
  <h1 className="text-2xl font-semibold text-gray-900">{selectedPost?.title}</h1>
            <p className="text-gray-600 text-lg">{selectedPost?.content || "No content available."}</p>

            <div className="flex items-center gap-6 pt-4 border-t border-gray-200">
              <button 
                onClick={() => selectedPost && handleLike(selectedPost.id)}
                className="flex items-center gap-2 text-gray-500 hover:text-[#5b06be] transition-colors"
              >
                <Heart className={`w-5 h-5 ${selectedPost?.is_liked ? 'fill-[#5b06be] text-[#5b06be]' : ''}`} />
                <span>{selectedPost?.likes} likes</span>
              </button>
            </div>

<div className="pt-2">
  <div className="relative">
    <textarea
  value={newComment}
  onChange={(e) => setNewComment(e.target.value)}
  placeholder={replyTo.author ? `Reply to ${replyTo.author}...` : "Write your comment here..."}
  className="w-full p-2 border border-gray-300 rounded-[15px] mb-1 h-14 focus:outline-none focus:border-[#5b06be] focus:border-2 whitespace-pre-wrap break-words"
  rows={3}
  maxLength={100}
/>
    <div className="text-sm text-gray-400 text-right mb-2">
      {newComment.length}/100 characters
    </div>
  </div>
  <Button 
    onClick={handleCommentSubmit}
    className="w-full bg-[#5b06be] hover:bg-[#4a05a0] text-white rounded-[15px]"
  >
    Post Comment
  </Button>
</div>

<div 
  className={`
    space-y-2
    mt-4
    ${(comments[selectedPost?.id || 0]?.length || 0) > 2 ? 'overflow-y-auto' : 'overflow-y-hidden'} 
    transition-all 
    duration-300 
    ease-in-out
    flex-grow
    pr-2
    pb-2
  `}
  style={{
    height: '230px',
    scrollbarWidth: 'thin',
    scrollbarColor: '#5b06be #f3f4f6'
  }}
>
  {comments[selectedPost?.id || 0]?.length > 0 ? (
    comments[selectedPost?.id || 0]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map((comment) => (
                    <div 
                      key={comment.id} 
                      className="space-y-4"
                      style={{ marginLeft: `${comment.level * 2}rem` }}
                    >
                      <div className="p-4 bg-gray-50 rounded-[20px] mb-2" style={{ minHeight: '105px' }}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[#5b06be]">{comment.author}</span>
                            <span className="text-sm text-gray-500">{formatTimeAgo(comment.created_at)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleCommentLike(comment.id)}
                              className="text-gray-500 hover:text-[#5b06be] transition-colors"
                            >
                              <Heart className={`w-4 h-4 ${comment.is_liked ? 'fill-[#5b06be] text-[#5b06be]' : ''}`} />
                            </button>
                            <span className="text-sm text-gray-500">{comment.likes}</span>
                            <button
                              onClick={() => handleReply(comment.id, comment.author)}
                              className="text-gray-500 hover:text-[#5b06be] transition-colors"
                            >
                              <Reply className="w-4 h-4" />
                            </button>
                            {comment.author === 'You' && (
                              <button
                                onClick={() => handleDeleteClick(comment.id)}
                                className="text-gray-500 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-700 break-words whitespace-pre-wrap" style={{ maxWidth: '100%', wordBreak: 'break-word' }}>
  {comment.content}
</p>
                      </div>
                    </div>
                  ))
              ) : (
                <p className="text-center text-gray-500">No comments yet. Be the first to comment!</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteConfirm.isOpen} onOpenChange={(isOpen) => setDeleteConfirm({ isOpen, commentId: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-[#5b06be] hover:bg-[#5b06be]"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

     <Dialog open={newPostDialogOpen} onOpenChange={setNewPostDialogOpen}>
<DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
    <DialogHeader>
      <DialogTitle className="text-xl font-semibold">Create New Post</DialogTitle>
    </DialogHeader>
    <div className="space-y-4 overflow-y-auto flex-1">
          <div className="space-y-4">
           <div className="space-y-2 flex flex-col h-full">
  <label htmlFor="title" className="text-sm font-medium">Title</label>
  <Input
    id="title"
    placeholder="What's your question about?"
    value={newPostForm.title}
    onChange={(e) => setNewPostForm(prev => ({ ...prev, title: e.target.value }))}
    maxLength={50}
  />
              <p className="text-sm text-gray-500">
                {newPostForm.title.length}/50 characters
              </p>
            </div>
<div className="space-y-2">
  <label htmlFor="content" className="text-sm font-medium">Description</label>
  <textarea
  id="content"
  rows={5}
  className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:border-[#5b06be] focus:border-2 whitespace-pre-wrap break-words"
  placeholder="Provide as many details as possible..."
  value={newPostForm.content}
  onChange={(e) => setNewPostForm(prev => ({ ...prev, content: e.target.value }))}
/>
  <p className="text-sm text-gray-500">
    {newPostForm.content.length}/200 characters
  </p>
</div>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setNewPostForm({ title: '', content: '' })
                  setNewPostDialogOpen(false)
                }}
              >
                Cancel
              </Button>
              <Button
  className="bg-[#5b06be] hover:bg-[#4a05a0]"
  onClick={handleNewPost}
  disabled={isSubmitting || !newPostForm.title.trim() || !newPostForm.content.trim()}
>
  {isSubmitting ? 'Posting...' : 'Post'}
</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
