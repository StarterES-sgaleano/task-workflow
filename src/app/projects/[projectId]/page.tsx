import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { CreateItemDialog } from "@/components/items/create-item-dialog";
import { ItemList } from "@/components/items/item-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FolderOpen, CheckSquare, FileText, Plus, ArrowLeft, Settings } from "lucide-react";
import Link from "next/link";

interface ProjectPageProps {
  params: {
    projectId: string;
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const user = await requireAuth();
  const supabase = createClient(cookies());

  // Fetch project details
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', params.projectId)
    .single();

  if (projectError || !project) {
    notFound();
  }

  // Fetch project items
  const { data: allItems } = await supabase
    .from('items')
    .select('*')
    .eq('project_id', params.projectId)
    .order('updated_at', { ascending: false });

  // Separate items by type
  const tasks = allItems?.filter(item => item.type === 'task') || [];
  const documents = allItems?.filter(item => item.type === 'document') || [];

  // Task status counts
  const todoTasks = tasks.filter(task => task.status === 'todo');
  const inProgressTasks = tasks.filter(task => task.status === 'in_progress');
  const doneTasks = tasks.filter(task => task.status === 'done');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/projects">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Projects
              </Link>
            </Button>
          </div>
          
          <div className="flex items-center gap-3">
            <div 
              className="h-8 w-8 rounded-full" 
              style={{ backgroundColor: project.color }}
            />
            <div>
              <h1 className="text-3xl font-bold">{project.name}</h1>
              {project.description && (
                <p className="text-muted-foreground mt-1">{project.description}</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <CreateItemDialog 
            projects={[project]} 
            defaultProjectId={project.id}
            trigger={
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            }
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Todo Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todoTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              Tasks to be started
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <CheckSquare className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              Tasks being worked on
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckSquare className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{doneTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              Tasks completed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.length}</div>
            <p className="text-xs text-muted-foreground">
              Documents and notes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Items Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Items ({allItems?.length || 0})</TabsTrigger>
          <TabsTrigger value="tasks">Tasks ({tasks.length})</TabsTrigger>
          <TabsTrigger value="documents">Documents ({documents.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          {allItems && allItems.length > 0 ? (
            <ItemList items={allItems} />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Plus className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No items yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Start by adding your first task or document to this project.
                </p>
                <CreateItemDialog 
                  projects={[project]} 
                  defaultProjectId={project.id}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="tasks" className="space-y-4">
          {tasks.length > 0 ? (
            <ItemList items={tasks} />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No tasks yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create your first task to start tracking your work.
                </p>
                <CreateItemDialog 
                  projects={[project]} 
                  defaultProjectId={project.id}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="documents" className="space-y-4">
          {documents.length > 0 ? (
            <ItemList items={documents} />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No documents yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create your first document to store notes and information.
                </p>
                <CreateItemDialog 
                  projects={[project]} 
                  defaultProjectId={project.id}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
