"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";

interface Campaign {
  id: string;
  title: string;
  description: string | null;
  status: string;
  system: string;
  progress: number;
  image: string | null;
  nextSession: string | Date | null;
  createdAt: string | Date;
}

interface CampaignContextType {
  campaigns: Campaign[];
  activeCampaign: Campaign | null;
  setActiveCampaign: (campaign: Campaign | null) => void;
  loading: boolean;
  isDM: boolean;
  refreshCampaigns: () => Promise<void>;
}

const CampaignContext = createContext<CampaignContextType | undefined>(
  undefined,
);

export function CampaignProvider({ children }: { children: ReactNode }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDM, setIsDM] = useState(false);

  const fetchCampaigns = useCallback(async () => {
    try {
      const res = await fetch("/api/campaigns/my-campaigns");
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data.campaigns || []);
        setIsDM(data.isDM);

        // Restore active campaign from localStorage or set first one
        const savedId = localStorage.getItem("activeCampaignId");
        if (savedId && data.campaigns) {
          const saved = data.campaigns.find((c: Campaign) => c.id === savedId);
          if (saved) {
            setActiveCampaign(saved);
          } else if (data.campaigns.length > 0) {
            // Saved campaign not found, use first one
            setActiveCampaign(data.campaigns[0]);
            localStorage.setItem("activeCampaignId", data.campaigns[0].id);
          }
        } else if (data.campaigns && data.campaigns.length > 0) {
          // No saved campaign, use first one
          setActiveCampaign(data.campaigns[0]);
          localStorage.setItem("activeCampaignId", data.campaigns[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    } finally {
      setLoading(false);
    }
  }, []); // Removido activeCampaign das dependências para evitar loop infinito

  useEffect(() => {
    fetchCampaigns();
  }, []); // Executa apenas uma vez ao montar

  const handleSetActiveCampaign = (campaign: Campaign | null) => {
    setActiveCampaign(campaign);
    if (campaign) {
      localStorage.setItem("activeCampaignId", campaign.id);
    } else {
      localStorage.removeItem("activeCampaignId");
    }
  };

  return (
    <CampaignContext.Provider
      value={{
        campaigns,
        activeCampaign,
        setActiveCampaign: handleSetActiveCampaign,
        loading,
        isDM,
        refreshCampaigns: fetchCampaigns,
      }}
    >
      {children}
    </CampaignContext.Provider>
  );
}

export function useCampaign() {
  const context = useContext(CampaignContext);
  if (context === undefined) {
    throw new Error("useCampaign must be used within a CampaignProvider");
  }
  return context;
}

