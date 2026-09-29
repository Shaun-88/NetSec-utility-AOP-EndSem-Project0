import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import { tools } from "@/registry/tools";
import AppShell from "@/components/AppShell";
import { Loader2 } from "lucide-react";

export async function generateStaticParams() {
  return tools.map((t) => ({ toolId: t.id }));
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ toolId: string }>;
}) {
  const { toolId } = await params;
  const tool = tools.find((t) => t.id === toolId);

  if (!tool) {
    notFound();
  }

  const ToolComponent = tool.Component;

  return (
    <AppShell>
      <div className="py-2">
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[300px] text-slate-400 gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-[#00e575]" />
              <span className="text-xs">Loading tool workspace...</span>
            </div>
          }
        >
          <ToolComponent />
        </Suspense>
      </div>
    </AppShell>
  );
}
