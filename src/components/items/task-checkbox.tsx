'use client'

import { useTransition } from 'react'
import { toast } from 'react-hot-toast'
import { type Tables } from '@/lib/database.types'

import { updateTaskStatus } from '@/lib/api/items'
import { Checkbox } from '@/components/ui/checkbox'

type Item = Tables<'items'>

interface TaskCheckboxProps {
  item: Item
}

export function TaskCheckbox({ item }: TaskCheckboxProps) {
  const [isPending, startTransition] = useTransition()

  if (item.type !== 'task') {
    return null
  }

  return (
    <Checkbox
      checked={item.status === 'done'}
      onCheckedChange={(checked) => {
        startTransition(async () => {
          try {
            const newStatus = checked ? 'done' : 'todo'
            await updateTaskStatus(item.id, newStatus)
            toast.success(`Task ${checked ? 'completed' : 'reopened'}`)
          } catch (error) {
            toast.error('Failed to update task status')
          }
        });
      }}
      disabled={isPending}
      aria-label="Toggle task completion"
    />
  )
}
