import Link from "next/link";
import { CheckSquare, FileText, Circle, CheckCircle, Clock } from "lucide-react";
import { type Tables } from "@/lib/database.types";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskCheckbox } from "@/components/items/task-checkbox";

type Item = Tables<'items'>

interface ItemListProps {
  items: Item[] | null;
}

const getStatusIcon = (status: Item['status']) => {
  switch (status) {
    case 'todo':
      return <Circle className="h-5 w-5 text-muted-foreground" />;
    case 'in_progress':
      return <Clock className="h-5 w-5 text-blue-500" />;
    case 'done':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    default:
      return null;
  }
};

export function ItemList({ items }: ItemListProps) {
  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg border-2 border-dashed border-muted bg-muted/50 p-8 text-center">
        <h3 className="text-lg font-semibold">No items yet</h3>
        <p className="text-sm text-muted-foreground">
          Get started by creating your first task or document.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <Card key={item.id} className="p-0 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            {item.type === 'task' && (
              <div className="p-4">
                <TaskCheckbox item={item} />
              </div>
            )}
            <Link href={`/projects/${item.project_id}/${item.id}`} className="flex-grow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {item.type === 'task' ? (
                    getStatusIcon(item.status)
                  ) : (
                    <FileText className="h-5 w-5 text-blue-500" />
                  )}
                  <span className={`${item.status === 'done' ? 'text-muted-foreground line-through' : ''}`}>
                    {item.title}
                  </span>
                </CardTitle>
                {item.content && (
                  <p className="text-sm text-muted-foreground truncate">
                    {item.content}
                  </p>
                )}
              </CardHeader>
            </Link>
          </div>
        </Card>
      ))}
    </div>
  );
}
