'use client'

import * as React from "react";
import { useState, useTransition } from "react";
import { toast } from "react-hot-toast";
import { type Tables } from "@/lib/database.types";

import { createItem } from "@/lib/api/items";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, CheckSquare, FileText } from "lucide-react";

type Project = Tables<'projects'>

interface CreateItemDialogProps {
  projects: Project[]
  defaultProjectId?: string
  trigger?: React.ReactNode
}

export function CreateItemDialog({ projects, defaultProjectId, trigger }: CreateItemDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [itemType, setItemType] = useState<'task' | 'document'>('task');
  const [projectId, setProjectId] = useState(defaultProjectId || '');
  const formRef = React.useRef<HTMLFormElement>(null);

  const handleSubmit = (formData: FormData) => {
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!projectId) {
      toast.error('Please select a project');
      return;
    }

    startTransition(async () => {
      try {
        await createItem({
          type: itemType,
          title,
          content: content || '',
          project_id: projectId,
          status: itemType === 'task' ? 'todo' : null,
          metadata: {}
        });
        
        toast.success(`${itemType === 'task' ? 'Task' : 'Document'} created successfully!`);
        setIsOpen(false);
        formRef.current?.reset();
        
        // Reset form state
        setItemType('task');
        setProjectId(defaultProjectId || '');
      } catch (error) {
        toast.error(`Failed to create ${itemType}`);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Item
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New {itemType === 'task' ? 'Task' : 'Document'}</DialogTitle>
          <DialogDescription>
            {itemType === 'task' 
              ? 'Create a new task to track your work.' 
              : 'Create a new document to store information.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form ref={formRef} onSubmit={(e) => { e.preventDefault(); handleSubmit(new FormData(e.currentTarget)); }}>
          <div className="grid gap-4 py-4">
            {/* Type Selection */}
            <div className="grid gap-2">
              <Label>Type</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={itemType === 'task' ? 'default' : 'outline'}
                  onClick={() => setItemType('task')}
                  className="flex-1"
                >
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Task
                </Button>
                <Button
                  type="button"
                  variant={itemType === 'document' ? 'default' : 'outline'}
                  onClick={() => setItemType('document')}
                  className="flex-1"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Document
                </Button>
              </div>
            </div>

            {/* Project Selection */}
            <div className="grid gap-2">
              <Label htmlFor="project">Project</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="h-3 w-3 rounded-full" 
                          style={{ backgroundColor: project.color }}
                        />
                        {project.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                placeholder={itemType === 'task' ? 'Task title' : 'Document title'}
                required
              />
            </div>
            
            {/* Content */}
            <div className="grid gap-2">
              <Label htmlFor="content">
                {itemType === 'task' ? 'Description' : 'Content'}
              </Label>
              <Textarea
                id="content"
                name="content"
                placeholder={itemType === 'task' 
                  ? 'Task description (optional)' 
                  : 'Document content (optional)'
                }
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Creating...' : `Create ${itemType === 'task' ? 'Task' : 'Document'}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
