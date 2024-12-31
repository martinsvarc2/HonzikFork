'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { CreditCard, UserPlus, X, Info } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CheckedState } from "@radix-ui/react-checkbox"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const showSelectUserWarning = () => {
  toast.warning("Please select at least one user", {
    style: {
      background: '#18181B',
      color: '#fff',
      border: 'none',
    },
    position: 'top-center',
    duration: 2000,
  })
}

const toastStyle = {
  style: {
    background: '#18181B',
    color: '#fff',
    border: 'none',
  },
  position: 'top-center' as const,
  duration: 2000,
}

interface User {
  member_id: string
  team_id: string
  user_name: string
  user_picture_url: string
  credits: number
  monthly_credits: number
  needs_monthly_credits?: boolean
  monthly_credit_manager_id?: string
}

interface UserRowProps {
  user: User
  currentUserId: string
  onAddCredits: (memberId: string, amount: number) => void
  onRemoveCredits: (memberId: string, amount: number) => void
  checked: boolean
  onCheckedChange: (checked: CheckedState) => void
  onSaveAutomation: (memberId: string, amount: string) => void
  onRemoveUser: (memberId: string) => void
}

const UserRow: React.FC<UserRowProps> = ({ 
  user, 
  currentUserId,
  onAddCredits, 
  onRemoveCredits, 
  checked, 
  onCheckedChange, 
  onSaveAutomation, 
  onRemoveUser 
}) => {
  const [creditAmount, setCreditAmount] = useState<string>('')
  const [automationAmount, setAutomationAmount] = useState<string>('')
  const [isEditingAutomation, setIsEditingAutomation] = useState(false)
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false)

  const isOwnAutomation = user.monthly_credit_manager_id === currentUserId

  return (
    <tr className="h-12 hover:bg-gray-50 border-b border-gray-200 last:border-b-0">
      <td className="py-4 px-4 text-center">
        <div className="flex items-center gap-4 min-h-[32px]">
         <Checkbox 
          checked={checked}
          onCheckedChange={(state: CheckedState) => onCheckedChange(state)}
          className="data-[state=checked]:bg-[#5b06be] data-[state=checked]:border-[#5b06be]"
          />
          <img
            src={user.user_picture_url || "https://res.cloudinary.com/drkudvyog/image/upload/v1734566580/Profila_photo_duha_s_bilym_pozadim_glyneq.png"}
            alt={`${user.user_name}'s profile`}
            className="w-8 h-8 rounded-full object-cover"
          />
          <span className="font-medium text-black">{user.user_name}</span>
        </div>
      </td>
      <td className="py-4 px-4 text-center align-middle text-black">{user.credits} credits</td>
      <td className="py-4 px-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            {user.monthly_credits > 0 && !isEditingAutomation ? (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-black">
                  {user.monthly_credits} credits/month
                  {!isOwnAutomation && ' (Set by another user)'}
                </span>
                {isOwnAutomation && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setAutomationAmount(user.monthly_credits.toString())
                        setIsEditingAutomation(true)
                      }}
                      className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => onSaveAutomation(user.member_id, '0')}
                      className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={automationAmount}
                  onChange={(e) => setAutomationAmount(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Amount"
                  className="h-9 border text-sm w-24 !text-black bg-white"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      if (automationAmount) {
                        onSaveAutomation(user.member_id, automationAmount)
                        setAutomationAmount('')
                        setIsEditingAutomation(false)
                      }
                    }}
                    disabled={!automationAmount}
                    className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm whitespace-nowrap"
                  >
                    {isEditingAutomation ? 'Update Automation' : 'Save Automation'}
                  </Button>
                  {isEditingAutomation && (
                    <Button
                      onClick={() => {
                        setAutomationAmount('')
                        setIsEditingAutomation(false)
                      }}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm"
                    >
                      Cancel Edit
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-4">
          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={creditAmount}
            onChange={(e) => setCreditAmount(e.target.value.replace(/[^0-9]/g, ''))}
            placeholder="Amount"
            className="h-9 border text-sm w-24 !text-black bg-white"
          />
          <Button
            onClick={() => {
              if (creditAmount) {
                onAddCredits(user.member_id, parseInt(creditAmount))
                setCreditAmount('')
              }
            }}
            disabled={!creditAmount}
            className="h-9 bg-green-100 text-green-700 text-sm"
          >
            Add To user
          </Button>
          <Button
            onClick={() => {
              if (creditAmount) {
                onRemoveCredits(user.member_id, parseInt(creditAmount))
                setCreditAmount('')
              }
            }}
            disabled={!creditAmount}
            className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm"
          >
            Withdraw From user
          </Button>
        </div>
      </td>
      <td className="py-4 px-4 text-center">
      <Button
  onClick={() => setIsRemoveDialogOpen(true)}
  variant="ghost"
  size="icon"
  className="hover:bg-red-100 hover:text-red-700 text-black"
>
  <X className="h-5 w-5" />
</Button>
<Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Remove User</DialogTitle>
      <DialogDescription className="pt-4">
        Are you sure you want to remove <span className="font-semibold text-black">{user.user_name}</span>? 
        This action cannot be undone.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter className="flex gap-2 pt-4">
      <Button 
        variant="outline" 
        onClick={() => setIsRemoveDialogOpen(false)}
        className="flex-1"
      >
        Cancel
      </Button>
      <Button 
        variant="destructive"
        onClick={() => {
          onRemoveUser(user.member_id)
          setIsRemoveDialogOpen(false)
        }}
        className="flex-1 bg-red-600 hover:bg-red-700"
      >
        Remove User
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
        <Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Remove User</DialogTitle>
              <DialogDescription className="pt-4">
                Are you sure you want to remove <span className="font-semibold text-black">{user.user_name}</span>? 
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsRemoveDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={() => {
                  onRemoveUser(user.member_id)
                  setIsRemoveDialogOpen(false)
                }}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                Remove User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </td>
    </tr>
  )
}

export function CreditManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [currentUserCredits, setCurrentUserCredits] = useState<number>(0)
  const [checkedUsers, setCheckedUsers] = useState<{ [key: string]: boolean }>({})
  const [selectAll, setSelectAll] = useState(false)
  const [bulkAutomationAmount, setBulkAutomationAmount] = useState('')
  const [bulkCreditAmount, setBulkCreditAmount] = useState('')
  const [copyFeedback, setCopyFeedback] = useState('')
  const [loading, setLoading] = useState(true)

 // Get IDs from URL
  const memberId = typeof window !== 'undefined' ? 
  new URLSearchParams(window.location.search).get('memberId') || '' : '';
const teamId = typeof window !== 'undefined' ? 
  new URLSearchParams(window.location.search).get('teamId') || '' : '';

 useEffect(() => {
    if (teamId && memberId) {
      fetchUsers()
      fetchCurrentUserCredits()
      // Set up intervals for data refresh
      const monthlyInterval = setInterval(checkMonthlyCredits, 60000)
      const refreshInterval = setInterval(() => {
        fetchCurrentUserCredits() // Only refresh credits, not users
      }, 5000) // Refresh every 5 seconds
      return () => {
        clearInterval(monthlyInterval)
        clearInterval(refreshInterval)
      }
    }
  }, [teamId, memberId])

 const fetchUsers = async () => {
  try {
    console.log('Fetching users with teamId:', teamId);
    const response = await fetch(`/api/credits?teamId=${teamId}`);
    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);
    
    if (data.users) {
      setUsers(data.users);
    }
    setLoading(false);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    setLoading(false);
  }
}

  const fetchCurrentUserCredits = async () => {
  try {
    console.log('Fetching user credits with:', { teamId, memberId });
    const response = await fetch(`/api/credits?teamId=${teamId}&memberId=${memberId}`);
    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);
    
    if (data.credits !== undefined) {
      setCurrentUserCredits(data.credits);
    }
    
    // Double check after a short delay
    setTimeout(async () => {
      const verifyResponse = await fetch(`/api/credits?teamId=${teamId}&memberId=${memberId}`);
      const verifyData = await verifyResponse.json();
      if (verifyData.credits !== undefined) {
        setCurrentUserCredits(verifyData.credits);
      }
    }, 1000);

    setLoading(false);
  } catch (error) {
    console.error('Failed to fetch user credits:', error);
    setLoading(false);
  }
}

  const checkMonthlyCredits = async () => {
    // No need to manually handle this as it's done by the backend
    await fetchUsers()
    await fetchCurrentUserCredits()
  }

  const handleAddCredits = async (toMemberId: string, amount: number) => {
    if (amount > currentUserCredits) {
      toast.error('You don\'t have enough credits', toastStyle)
      return
    }

    try {
      const response = await fetch('/api/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADD_CREDITS',
          fromMemberId: memberId,
          toMemberId,
          teamId,
          amount
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to add credits')
      }
      
      await Promise.all([
        fetchUsers(),
        fetchCurrentUserCredits()
      ])
      toast.success('Credits added successfully', toastStyle)
    } catch (error) {
      console.error('Failed to add credits:', error)
      toast.error('Failed to add credits', toastStyle)
    }
  }

  const handleRemoveCredits = async (fromMemberId: string, amount: number) => {
    try {
      const response = await fetch('/api/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REMOVE_CREDITS',
          memberId: fromMemberId,
          teamId,
          amount
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to remove credits')
      }
      
      // Update both the table and current user credits
      await fetchCurrentUserCredits()
      await new Promise(resolve => setTimeout(resolve, 500))
      await fetchUsers()
      
      toast.success('Credits removed successfully', toastStyle)
    } catch (error) {
      console.error('Failed to remove credits:', error)
      toast.error('Failed to remove credits', toastStyle)
    }
  }

  const handleSaveAutomation = async (toMemberId: string, amount: string) => {
    const numAmount = parseInt(amount)
    
    // If amount is 0 or empty, we're canceling the automation
    if (amount === '' || numAmount === 0) {
      try {
        const response = await fetch('/api/credits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'UPDATE_MONTHLY_CREDITS',
            managerId: memberId,
            memberId: toMemberId,
            teamId,
            amount: 0
          })
        })

        if (!response.ok) throw new Error('Failed to cancel automation')
        
        await fetchUsers()
        toast.success('Automation cancelled', toastStyle)
      } catch (error) {
        console.error('Failed to cancel automation:', error)
        toast.error('Failed to cancel automation', toastStyle)
      }
      return
    }

    // Setting up or updating automation
    if (numAmount > currentUserCredits) {
      toast.error('You don\'t have enough credits for automation setup', toastStyle)
      return
    }

    try {
      const response = await fetch('/api/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_MONTHLY_CREDITS',
          managerId: memberId,
          memberId: toMemberId,
          teamId,
          amount: numAmount
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update automation')
      }
      
      await Promise.all([
        fetchUsers(),
        fetchCurrentUserCredits()
      ])
      toast.success('Automation updated successfully', toastStyle)
    } catch (error) {
      console.error('Failed to update automation:', error)
      toast.error('Failed to update automation', toastStyle)
    }
  }

  const handleSelectAllChange = (checked: CheckedState) => {
    setSelectAll(!!checked)
  }

  useEffect(() => {
    if (selectAll) {
      const allChecked = users.reduce((acc, user) => ({
        ...acc,
        [user.member_id]: true
      }), {})
      setCheckedUsers(allChecked)
    } else {
      setCheckedUsers({})
    }
  }, [selectAll, users])

  const handleCheckUser = (memberId: string, checked: CheckedState) => {
    setCheckedUsers(prev => ({
      ...prev,
      [memberId]: checked as boolean
    }))
  }

  const handleCopyInviteLink = () => {
    const inviteLink = `https://app.trainedbyai.com/signup-team-member?tid=${teamId}`
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopyFeedback('Copied!')
      setTimeout(() => setCopyFeedback(''), 2000)
    }).catch(err => {
      console.error('Failed to copy:', err)
      setCopyFeedback('Failed to copy')
    })
  }

  const handleBulkAutomation = async () => {
    const amount = bulkAutomationAmount
    const selectedUserIds = Object.entries(checkedUsers)
      .filter(([_, isChecked]) => isChecked)
      .map(([id]) => id)

    if (selectedUserIds.length === 0) {
      showSelectUserWarning()
      return
    }

    if (!amount) {
      toast.error('Please enter an automation amount', toastStyle)
      return
    }

    const numAmount = parseInt(amount) * selectedUserIds.length
    if (numAmount > currentUserCredits) {
      toast.error('You don\'t have enough credits for bulk automation', toastStyle)
      return
    }

    try {
      for (const toMemberId of selectedUserIds) {
        await handleSaveAutomation(toMemberId, amount)
      }
      setBulkAutomationAmount('')
    } catch (error) {
      console.error('Failed to update bulk automation:', error)
      toast.error('Failed to update automation for some users', toastStyle)
    }
  }

  const handleBulkAddCredits = async () => {
    const selectedUsers = Object.keys(checkedUsers).filter(id => checkedUsers[id]);
    if (selectedUsers.length === 0) {
      showSelectUserWarning();
      return;
    }

    const amount = parseInt(bulkCreditAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount', toastStyle);
      return;
    }

    const totalAmount = amount * selectedUsers.length;
    if (totalAmount > currentUserCredits) {
      toast.error('You don\'t have enough credits for bulk operation', toastStyle);
      return;
    }

    try {
      // Process users one by one
      for (let i = 0; i < selectedUsers.length; i++) {
        const toMemberId = selectedUsers[i];
        
        const response = await fetch('/api/credits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'ADD_CREDITS',
            fromMemberId: memberId,
            toMemberId,
            teamId,
            amount
          })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to add credits');
        }

        // Add a small delay between requests to not overwhelm n8n
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      await Promise.all([
        fetchUsers(),
        fetchCurrentUserCredits()
      ]);
      
      setBulkCreditAmount('');
      toast.success('Credits added successfully', toastStyle);
    } catch (error) {
      console.error('Failed to add bulk credits:', error);
      toast.error('Failed to add credits', toastStyle);
    }
  }

  const handleBulkRemoveCredits = async () => {
  const selectedUsers = Object.keys(checkedUsers).filter(id => checkedUsers[id]);
  if (selectedUsers.length === 0) {
    showSelectUserWarning();
    return;
  }

  const amount = parseInt(bulkCreditAmount);
  if (isNaN(amount) || amount <= 0) {
    toast.error('Invalid amount', toastStyle);
    return;
  }

  try {
    // Process users one by one
    for (let i = 0; i < selectedUsers.length; i++) {
      const targetMemberId = selectedUsers[i];
      
      const response = await fetch('/api/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REMOVE_CREDITS',
          memberId: targetMemberId,
          teamId,
          amount
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to remove credits');
      }

      // Add a small delay between requests to not overwhelm n8n
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    await Promise.all([
      fetchUsers(),            // This updates the table
      fetchCurrentUserCredits() // This will update "Your Available Credits"
    ]);
    
    setBulkCreditAmount('');
    toast.success('Credits removed successfully', toastStyle);
  } catch (error) {
    console.error('Failed to remove credits:', error);
    toast.error('Failed to remove credits', toastStyle);
  }
};

 const handleRemoveUser = async (memberId: string) => {
  try {
    // Send webhook notification first
    const webhookResponse = await fetch('https://aiemployee.app.n8n.cloud/webhook/ad038ab1-b1da-4822-ae6d-7f9bc8ad721a', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        memberId,
        teamId
      })
    });

    if (!webhookResponse.ok) {
      throw new Error('Failed to send webhook notification');
    }

    // Then proceed with user removal
    const response = await fetch('/api/credits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'REMOVE_USER',
        memberId,
        teamId
      })
    });

    if (!response.ok) {
      throw new Error('Failed to remove user');
    }

    await fetchUsers();
    setCheckedUsers(prev => {
      const { [memberId]: _, ...rest } = prev;
      return rest;
    });
    toast.success('User removed successfully', toastStyle);
  } catch (error) {
    console.error('Failed to remove user:', error);
    toast.error('Failed to remove user', toastStyle);
  }
};

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>
  }

  return (
    <div className="bg-white rounded-[20px] shadow-[0_0_10px_rgba(0,0,0,0.1)] pb-2 px-0 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-6 rounded-lg">
        <div className="flex items-center gap-4">
          <CreditCard className="w-8 h-8 text-[#5b06be]" />
          <h1 className="text-2xl font-[800] text-black">Credit Management</h1>
        </div>
        <div className="flex items-center gap-4 mt-4 sm:mt-0">
        <Card 
          onClick={() => window.parent.location.href = 'https://app.trainedbyai.com/credits'}
          className="bg-white border border-gray-200 shadow-sm py-2 px-4 flex items-center gap-2 cursor-pointer hover:border-[#5b06be] transition-colors duration-200 h-10"
        >
          <span className="text-sm font-[500] text-gray-600">Your Available Credits</span>
          <span className="text-xl font-[800] text-[#5b06be]">{currentUserCredits}</span>
        </Card>
          <Button
            onClick={handleCopyInviteLink}
            className="bg-[#5b06be] text-white hover:bg-[#4a05a2] flex items-center gap-2 h-10"
          >
            <UserPlus size={18} />
            {copyFeedback || 'Copy Invite Link'}
          </Button>
        </div>
      </div>
      <div className="flex-grow overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#F4C550] text-white border-b border-[#F4C550]">
              <th className="py-4 px-4 font-semibold text-center">User</th>
              <th className="py-4 px-4 font-semibold text-center">
                <div className="flex items-center justify-center gap-2">
                  Credits
                  <Popover>
                    <PopoverTrigger>
                      <Info className="w-4 h-4 text-white cursor-pointer" />
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2 bg-white border border-gray-200 rounded-lg text-black">
                      <p className="text-sm">One Credit = One Minute of Training</p>
                    </PopoverContent>
                  </Popover>
                </div>
              </th>
              <th className="py-4 px-4 font-semibold text-center">
                <div className="flex items-center justify-center gap-2">
                  Credits Automation
                  <Popover>
                    <PopoverTrigger>
                      <Info className="w-4 h-4 text-white cursor-pointer" />
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2 bg-white border border-gray-200 rounded-lg text-black">
                      <p className="text-sm">Credits Are Automatically Added Every 30 Days</p>
                    </PopoverContent>
                  </Popover>
                </div>
              </th>
              <th className="py-4 px-4 font-semibold text-center">One Time Credit Usage</th>
              <th className="py-4 px-4 font-semibold text-center">Remove</th>
            </tr>
          </thead>
          <tbody>
            <tr className="h-12 bg-gray-100 border-b-2 border-gray-300">
              <td className="py-4 px-4 text-center">
                <div className="flex items-center gap-4 min-h-[32px]">
                  <Checkbox 
                    checked={selectAll}
                    onCheckedChange={handleSelectAllChange}
                    className="data-[state=checked]:bg-[#5b06be] data-[state=checked]:border-[#5b06be]"
                  />
                  <span className="font-medium text-black">Select All Users</span>
                </div>
              </td>
              <td className="py-4 px-4 text-center">-</td>
              <td className="py-4 px-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <Input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={bulkAutomationAmount}
                      onChange={(e) => setBulkAutomationAmount(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="Amount"
                      className="h-9 border text-sm w-24 !text-black bg-white"
                    />
                    <Button
                      onClick={handleBulkAutomation}
                      disabled={!bulkAutomationAmount}
                      className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm whitespace-nowrap"
                    >
                      Save Automation for All
                    </Button>
                  </div>
                </div>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center gap-4">
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={bulkCreditAmount}
                    onChange={(e) => setBulkCreditAmount(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Amount"
                    className="h-9 border text-sm w-24 !text-black bg-white"
                  />
                  <Button
                    onClick={handleBulkAddCredits}
                    disabled={!bulkCreditAmount}
                    className="h-9 bg-green-100 text-green-700 text-sm"
                  >
                    Add To All
                  </Button>
                  <Button
                    onClick={handleBulkRemoveCredits}
                    disabled={!bulkCreditAmount}
                    className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm"
                  >
                    Withdraw From All
                  </Button>
                </div>
              </td>
              <td className="py-4 px-4 text-center">-</td>
            </tr>
            {users.map(user => (
              <UserRow
                key={user.member_id}
                user={user}
                currentUserId={memberId}
                onAddCredits={handleAddCredits}
                onRemoveCredits={handleRemoveCredits}
                checked={checkedUsers[user.member_id] || false}
                onCheckedChange={(checked) => handleCheckUser(user.member_id, checked)}
                onSaveAutomation={handleSaveAutomation}
                onRemoveUser={handleRemoveUser}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
