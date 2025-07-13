import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { CreateProjectDialog } from "@/components/projects/create-project-dialog";
import { CreateItemDialog } from "@/components/items/create-item-dialog";
import { ProjectList } from "@/components/projects/project-list";
import { ItemList } from "@/components/items/item-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FolderOpen, CheckSquare, FileText, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const cookieStore = cookies();
  const user = await requireAuth(cookieStore);
  const supabase = createClient(cookieStore);

  // Fetch projects
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('is_archived', false)
    .order('updated_at', { ascending: false })
    .limit(6);

  // Fetch recent items
  const { data: recentItems } = await supabase
    .from('items')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(10);

  // Fetch task counts
  const { data: todoTasks } = await supabase
    .from('items')
    .select('id', { count: 'exact' })
    .eq('type', 'task')
    .eq('status', 'todo');

  const { data: inProgressTasks } = await supabase
    .from('items')
    .select('id', { count: 'exact' })
    .eq('type', 'task')
    .eq('status', 'in_progress');

  const { data: doneTasks } = await supabase
    .from('items')
    .select('id', { count: 'exact' })
    .eq('type', 'task')
    .eq('status', 'done');

  const { data: documents } = await supabase
    .from('items')
    .select('id', { count: 'exact' })
    .eq('type', 'document');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your work.
          </p>
        </div>
        <div className="flex gap-2">
          <CreateProjectDialog />
          <CreateItemDialog projects={projects || []} />
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
            <div className="text-2xl font-bold">{todoTasks?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Tasks waiting to be started
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <CheckSquare className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressTasks?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Tasks currently being worked on
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckSquare className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{doneTasks?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Tasks completed recently
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Documents and notes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Projects Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Projects</h2>
          <Button variant="outline" asChild>
            <Link href="/projects">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        {projects && projects.length > 0 ? (
          <ProjectList projects={projects} />
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Projects help you organize your tasks and documents. Create your first project to get started.
              </p>
              <CreateProjectDialog />
            </CardContent>
          </Card>
        )}
      </section>

      {/* Recent Items Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Activity</h2>
          <Button variant="outline" asChild>
            <Link href="/items">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        {recentItems && recentItems.length > 0 ? (
          <ItemList items={recentItems} />
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Plus className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No items yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Start by creating your first task or document.
              </p>
              <CreateItemDialog projects={projects || []} />
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
