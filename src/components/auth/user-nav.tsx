'use client'

import { logout } from '@/app/(auth)/actions'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type User } from '@supabase/supabase-js'
import { LogOut, Settings, User as UserIcon } from 'lucide-react'

interface UserNavProps {
  user: User
  profile?: {
    username: string | null
    full_name: string | null
    avatar_url: string | null
  }
}

export function UserNav({ user, profile }: UserNavProps) {
  const displayName = profile?.full_name || profile?.username || user.email?.split('@')[0] || 'User'
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.avatar_url || undefined} alt={displayName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href="/profile" className="flex items-center">
            <UserIcon className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href="/settings" className="flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600 focus:text-red-600"
          onClick={() => logout()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
