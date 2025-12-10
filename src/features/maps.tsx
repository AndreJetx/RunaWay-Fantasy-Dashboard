"use client";

import { useEffect, useState } from "react";
import { FantasyLayout } from "@/components/layout/FantasyLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Map as MapIcon, Tag } from "lucide-react";
import mapBg from "@assets/generated_images/fantasy_world_map_parchment.png";
import { motion } from "framer-motion";
import Image from "next/image";
import { useCampaign } from "@/contexts/CampaignContext";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n/context";

interface Map {
  id: string;
  title: string;
  notes: string | null;
  imageUrl: string;
  campaignId: string;
}

export default function Maps() {
  const { activeCampaign } = useCampaign();
  const [maps, setMaps] = useState<Map[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMap, setSelectedMap] = useState<Map | null>(null);
  const [zoom, setZoom] = useState(1);
  const { t } = useTranslation();

  useEffect(() => {
    if (!activeCampaign) {
      setMaps([]);
      setLoading(false);
      return;
    }

    const fetchMaps = async () => {
      try {
        setLoading(true);
        // Usar rota otimizada de maps
        const res = await fetch(`/api/maps?campaignId=${activeCampaign.id}`);
        if (res.ok) {
          const campaignMaps = await res.json();
          setMaps(campaignMaps || []);
          if (campaignMaps.length > 0 && !selectedMap) {
            setSelectedMap(campaignMaps[0]);
          }
        } else {
          setMaps([]);
        }
      } catch (error) {
        console.error("Error fetching maps:", error);
        toast.error(t("maps.loadError"));
        setMaps([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMaps();
  }, [activeCampaign, t, selectedMap]);

  if (!activeCampaign) {
    return (
      <FantasyLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              {t("maps.selectCampaign")}
            </p>
          </div>
        </div>
      </FantasyLayout>
    );
  }

  if (loading) {
    return (
      <FantasyLayout>
        <div className="text-center py-12 text-muted-foreground">
          {t("maps.loading")}
        </div>
      </FantasyLayout>
    );
  }

  return (
    <FantasyLayout>
      <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold font-cinzel text-primary">
              {t("maps.title")}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {activeCampaign.title}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setZoom(Math.min(2, zoom + 0.1))}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button className="bg-primary text-primary-foreground">
              <MapIcon className="mr-2 h-4 w-4" /> {t("maps.uploadMap")}
            </Button>
          </div>
        </div>

        {maps.length === 0 ? (
          <Card className="flex-1 bg-card/40 border-primary/20 flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                {t("maps.noMaps")}
              </p>
              <Button className="bg-primary text-primary-foreground">
                <MapIcon className="mr-2 h-4 w-4" /> {t("maps.addFirstMap")}
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="flex-1 bg-black/40 border-primary/30 overflow-hidden relative group">
            <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="opacity-50 hover:opacity-100 transition-opacity"
              >
                <Tag className="w-4 h-4 mr-2" /> {t("maps.addMarker")}
              </Button>
            </div>

            <div className="w-full h-full overflow-hidden flex items-center justify-center bg-[#1a1510] cursor-grab active:cursor-grabbing relative">
              {/* Grid overlay */}
              <div
                className="absolute inset-0 pointer-events-none opacity-10"
                style={{
                  backgroundImage:
                    "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
                  backgroundSize: "50px 50px",
                }}
              />

              {selectedMap && (
                <motion.div
                  className="relative shadow-2xl"
                  animate={{ scale: zoom }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  drag
                  dragConstraints={{
                    left: -500,
                    right: 500,
                    top: -300,
                    bottom: 300,
                  }}
                >
                  <Image
                    src={selectedMap.imageUrl || mapBg}
                    alt={selectedMap.title}
                    width={1200}
                    height={800}
                    className="max-w-none rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.5)] border-4 border-[#3d342b]"
                    style={{ height: "800px" }}
                    priority
                  />
                </motion.div>
              )}
            </div>
          </Card>
        )}
      </div>
    </FantasyLayout>
  );
}
