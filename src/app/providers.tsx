"use client";

import { type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { CampaignProvider } from "@/contexts/CampaignContext";
import { I18nProvider } from "@/lib/i18n/context";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <TooltipProvider>
          <CampaignProvider>
            {children}
            <Toaster />
          </CampaignProvider>
        </TooltipProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}

