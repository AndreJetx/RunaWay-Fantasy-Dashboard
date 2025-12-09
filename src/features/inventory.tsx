"use client";

import { useEffect, useState } from "react";
import { FantasyLayout } from "@/components/layout/FantasyLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { Sword, Shield, FlaskConical, Gem, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCampaign } from "@/contexts/CampaignContext";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n/context";

interface Item {
  id: string;
  name: string;
  type: string;
  rarity: string;
  weight: number | null;
  description: string | null;
}

const rarityColors: Record<string, { color: string; border: string }> = {
  Common: { color: "text-slate-300", border: "border-slate-500/30" },
  Uncommon: { color: "text-green-400", border: "border-green-500/50" },
  Rare: { color: "text-blue-400", border: "border-blue-500/50" },
  Epic: { color: "text-purple-400", border: "border-purple-500/50" },
  Legendary: { color: "text-orange-400", border: "border-orange-500/50" },
};

const typeIcons: Record<string, typeof Sword> = {
  Weapon: Sword,
  Armor: Shield,
  Consumable: FlaskConical,
  Gem: Gem,
  Material: Gem,
};

export default function Inventory() {
  const { activeCampaign } = useCampaign();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDM, setIsDM] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [characters, setCharacters] = useState<any[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    const checkRole = async () => {
      try {
        const res = await fetch("/api/users/me");
        if (res.ok) {
          const data = await res.json();
          setIsDM(data.role === "dm");
          setUserId(data.id);
        }
      } catch (error) {
        console.error("Error checking role:", error);
      }
    };
    checkRole();
  }, []);

  useEffect(() => {
    if (!activeCampaign) {
      setItems([]);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        // Buscar itens diretamente da rota otimizada
        const itemsRes = await fetch(`/api/items?campaignId=${activeCampaign.id}`);
        if (itemsRes.ok) {
          const itemsData = await itemsRes.json();
          setItems(itemsData || []);
        } else {
          setItems([]);
        }

        // Buscar personagens apenas se necessário
        if (!isDM) {
          const charactersRes = await fetch(`/api/characters`);
          if (charactersRes.ok) {
            const allCharacters = await charactersRes.json();
            const myCharacters = allCharacters.filter(
              (char: any) => char.playerId === userId && char.campaignId === activeCampaign.id
            );
            setCharacters(myCharacters);
          }
        }
      } catch (error) {
        console.error("Error fetching items:", error);
        toast.error(t("inventory.loadError"));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeCampaign, isDM, userId, t]);

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.rarity.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!activeCampaign) {
    return (
      <FantasyLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              {t("inventory.selectCampaign")}
            </p>
          </div>
        </div>
      </FantasyLayout>
    );
  }

  return (
    <FantasyLayout>
      <div className="space-y-6 h-full flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
          <div>
            <h1 className="text-3xl font-bold font-cinzel text-accent text-glow">
              {isDM ? t("inventory.campaignInventory") : t("inventory.myInventory")}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {activeCampaign.title}
              {!isDM && characters.length > 0 && (
                <span className="ml-2">
                  • {characters.length} {characters.length === 1 ? t("inventory.character") : t("inventory.characters")}
                </span>
              )}
            </p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("inventory.filterItems")}
              className="pl-8 bg-card/50 border-accent/20 focus:border-accent/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            {t("inventory.loading")}
          </div>
        ) : (
          <ScrollArea className="flex-1 pr-4">
            {filteredItems.length === 0 ? (
              <Card className="bg-card/40 border-primary/20 p-12 text-center">
                <p className="text-muted-foreground">
                  {searchTerm
                    ? t("inventory.noItemsFound")
                    : t("inventory.noItems")}
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredItems.map((item, index) => {
                  const Icon = typeIcons[item.type] || Gem;
                  const rarityStyle =
                    rarityColors[item.rarity] ||
                    rarityColors.Common;

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card
                        className={`aspect-square bg-black/40 backdrop-blur-sm border-2 flex flex-col items-center justify-center p-4 hover:bg-white/5 transition-colors cursor-pointer group relative overflow-hidden ${rarityStyle.border}`}
                      >
                        <div
                          className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${
                            rarityStyle.color.includes("orange")
                              ? "bg-orange-500"
                              : rarityStyle.color.includes("purple")
                              ? "bg-purple-500"
                              : rarityStyle.color.includes("blue")
                              ? "bg-blue-500"
                              : rarityStyle.color.includes("green")
                              ? "bg-green-500"
                              : "bg-slate-500"
                          }`}
                        />

                        <Icon
                          className={`w-12 h-12 mb-3 ${rarityStyle.color} drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] transition-transform group-hover:scale-110 duration-300`}
                        />

                        <h4 className="font-cinzel font-bold text-sm text-center leading-tight mb-1">
                          {item.name}
                        </h4>
                        <p className="text-xs text-muted-foreground">{item.type}</p>

                        <Badge
                          variant="outline"
                          className={`mt-2 text-[10px] border-white/10 bg-black/50 ${rarityStyle.color}`}
                        >
                          {item.rarity}
                        </Badge>

                        {item.weight && (
                          <div className="absolute bottom-2 right-2 text-[10px] text-muted-foreground">
                            {item.weight}kg
                          </div>
                        )}
                      </Card>
                    </motion.div>
                  );
                })}

                {/* Empty Slots */}
                {Array.from({ length: Math.max(0, 12 - filteredItems.length) }).map(
                  (_, i) => (
                    <div
                      key={`empty-${i}`}
                      className="aspect-square border-2 border-dashed border-white/5 rounded-lg flex items-center justify-center opacity-50 hover:opacity-100 transition-opacity"
                    >
                      <div className="w-2 h-2 rounded-full bg-white/10" />
                    </div>
                  )
                )}
              </div>
            )}
          </ScrollArea>
        )}
      </div>
    </FantasyLayout>
  );
}
