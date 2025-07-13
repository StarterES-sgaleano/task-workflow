import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { CreateProjectDialog } from "@/components/projects/create-project-dialog";
import { ProjectList } from "@/components/projects/project-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FolderOpen, Archive, Plus } from "lucide-react";

export default async function ProjectsPage() {
  const user = await requireAuth();
  const supabase = createClient();

  // Fetch active projects
  const { data: activeProjects } = await supabase
    .from('projects')
    .select('*')
    .eq('is_archived', false)
    .order('updated_at', { ascending: false });

  // Fetch archived projects
  const { data: archivedProjects } = await supabase
    .from('projects')
    .select('*')
    .eq('is_archived', true)
    .order('updated_at', { ascending: false });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">
            Organize your work into projects to keep tasks and documents grouped together.
          </p>
        </div>
        <CreateProjectDialog />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Projects currently in progress
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Archived Projects</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{archivedProjects?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Completed or inactive projects
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Projects Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">Active Projects</TabsTrigger>
          <TabsTrigger value="archived">Archived Projects</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="space-y-4">
          {activeProjects && activeProjects.length > 0 ? (
            <ProjectList projects={activeProjects} />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No active projects</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Get started by creating your first project to organize your work.
                </p>
                <CreateProjectDialog />
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="archived" className="space-y-4">
          {archivedProjects && archivedProjects.length > 0 ? (
            <ProjectList projects={archivedProjects} />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Archive className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No archived projects</h3>
                <p className="text-muted-foreground text-center">
                  Archived projects will appear here when you archive them.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
