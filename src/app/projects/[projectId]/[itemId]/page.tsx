import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

import { EditItemDialog } from "@/components/items/edit-item-dialog";

export default async function ItemPage({ params }: { params: { itemId: string } }) {
  const supabase = createClient(cookies());
  const { data: item } = await supabase
    .from("items")
    .select("*")
    .eq("id", params.itemId)
    .single();

  if (!item) {
    return <div>Item not found</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{item.name}</h1>
        <EditItemDialog item={item} />
      </div>
      <p className="text-muted-foreground">{item.description}</p>
    </div>
  );
}
