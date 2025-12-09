"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
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

  const fetchCampaigns = async () => {
    try {
      const res = await fetch("/api/campaigns/my-campaigns");
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data.campaigns || []);
        setIsDM(data.isDM);

        // Set first campaign as active if none selected
        if (!activeCampaign && data.campaigns && data.campaigns.length > 0) {
          setActiveCampaign(data.campaigns[0]);
          localStorage.setItem("activeCampaignId", data.campaigns[0].id);
        } else if (activeCampaign) {
          // Restore active campaign from localStorage or find it in the list
          const savedId = localStorage.getItem("activeCampaignId");
          if (savedId) {
            const saved = data.campaigns?.find((c: Campaign) => c.id === savedId);
            if (saved) {
              setActiveCampaign(saved);
            } else if (data.campaigns && data.campaigns.length > 0) {
              setActiveCampaign(data.campaigns[0]);
              localStorage.setItem("activeCampaignId", data.campaigns[0].id);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

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

