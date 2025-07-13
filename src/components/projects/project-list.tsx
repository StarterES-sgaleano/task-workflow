import Link from "next/link";
import { type Tables } from "@/lib/database.types";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Project = Tables<'projects'>

interface ProjectListProps {
  projects: Project[] | null;
}

export function ProjectList({ projects }: ProjectListProps) {
  if (!projects || projects.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg border-2 border-dashed border-muted bg-muted/50 p-8 text-center">
        <h3 className="text-lg font-semibold">No projects yet</h3>
        <p className="text-sm text-muted-foreground">
          Get started by creating your first project.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <Link href={`/projects/${project.id}`} key={project.id}>
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div 
                  className="h-3 w-3 rounded-full bg-blue-500" 
                />
                {project.name}
              </CardTitle>
              {project.description && (
                <CardDescription>{project.description}</CardDescription>
              )}
            </CardHeader>
          </Card>
        </Link>
      ))}
    </div>
  );
}
