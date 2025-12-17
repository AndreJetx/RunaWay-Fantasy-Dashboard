"use client";

import { useEffect, useState } from "react";
import { FantasyLayout } from "@/components/layout/FantasyLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Search, Check, X, Loader2, RefreshCw } from "lucide-react";
import { getItemIcon } from "@/lib/icon-mapper";
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
  equipped?: boolean;
  ownerId?: string;
  ownerName?: string;
}

const rarityColors: Record<string, { color: string; border: string }> = {
  Common: { color: "text-slate-300", border: "border-slate-500/30" },
  Uncommon: { color: "text-green-400", border: "border-green-500/50" },
  Rare: { color: "text-blue-400", border: "border-blue-500/50" },
  Epic: { color: "text-purple-400", border: "border-purple-500/50" },
  Legendary: { color: "text-orange-400", border: "border-orange-500/50" },
};


export default function Inventory() {
  const { activeCampaign } = useCampaign();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDM, setIsDM] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [characters, setCharacters] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>("");
  const [equipping, setEquipping] = useState(false);
  const [syncing, setSyncing] = useState(false);
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

        // Buscar personagens da campanha usando a API de overview (mais confiável)
        const overviewRes = await fetch(`/api/campaigns/${activeCampaign.id}/overview`);
        if (overviewRes.ok) {
          const overviewData = await overviewRes.json();
          let campaignCharacters: any[] = overviewData.characters || [];
          
          // Se for jogador, filtrar apenas seus personagens
          if (!isDM && userId) {
            campaignCharacters = campaignCharacters.filter(
              (char: any) => char.playerId === userId
            );
          }
          
          setCharacters(campaignCharacters);
          console.log("Characters loaded:", {
            total: overviewData.characters?.length || 0,
            filtered: campaignCharacters.length,
            isDM,
            userId,
          });
        } else {
          console.error("Failed to fetch campaign overview:", overviewRes.status);
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

  const handleItemClick = (item: Item) => {
    setSelectedItem(item);
    // Se for jogador e tiver apenas um personagem, selecionar automaticamente
    if (!isDM && characters.length === 1) {
      setSelectedCharacterId(characters[0].id);
    } else {
      setSelectedCharacterId("");
    }
  };

  const handleSyncInventory = async () => {
    if (!activeCampaign) {
      toast.error("Selecione uma campanha primeiro");
      return;
    }

    // Buscar personagens usando a API de overview da campanha (mais confiável)
    try {
      const overviewRes = await fetch(`/api/campaigns/${activeCampaign.id}/overview`);
      if (!overviewRes.ok) {
        toast.error("Erro ao buscar dados da campanha");
        return;
      }

      const overviewData = await overviewRes.json();
      let campaignCharacters: any[] = overviewData.characters || [];
      
      // Se for jogador, filtrar apenas seus personagens
      if (!isDM && userId) {
        campaignCharacters = campaignCharacters.filter(
          (char: any) => char.playerId === userId
        );
      }
      
      console.log("Characters found for sync:", {
        total: overviewData.characters?.length || 0,
        filtered: campaignCharacters.length,
        isDM,
        userId,
        campaignId: activeCampaign.id,
      });
      
      if (campaignCharacters.length === 0) {
        toast.error("Nenhum personagem encontrado nesta campanha. Verifique se você tem personagens criados.");
        return;
      }
      
      setCharacters(campaignCharacters);
      
      // Continuar com a sincronização
      await syncCharactersInventory(campaignCharacters);
    } catch (error) {
      console.error("Error fetching characters:", error);
      toast.error("Erro ao buscar personagens");
    }
  };

  const syncCharactersInventory = async (charsToSync: any[]) => {
    // Evitar múltiplas sincronizações simultâneas
    if (syncing) {
      console.warn("Sincronização já em andamento, ignorando nova chamada");
      return;
    }

    setSyncing(true);
    try {
      let synced = 0;
      let errors = 0;

      for (const char of charsToSync) {
        try {
          const res = await fetch(`/api/characters/${char.id}/sync-inventory`, {
            method: "POST",
          });

          if (res.ok) {
            const result = await res.json();
            console.log(`Sync result for ${char.name}:`, result);
            synced++;
          } else {
            const errorData = await res.json().catch(() => ({}));
            console.error(`Error syncing ${char.name}:`, errorData);
            errors++;
          }
        } catch (error) {
          console.error(`Error syncing ${char.name}:`, error);
          errors++;
        }
      }

      // Recarregar itens e personagens
      const [itemsRes, charactersRes] = await Promise.all([
        fetch(`/api/items?campaignId=${activeCampaign?.id}`),
        fetch(`/api/characters`),
      ]);
      
      if (itemsRes.ok) {
        const itemsData = await itemsRes.json();
        setItems(itemsData || []);
      }
      
      if (charactersRes.ok) {
        const allCharacters = await charactersRes.json();
        if (isDM) {
          const campaignCharacters = allCharacters.filter(
            (char: any) => char.campaignId === activeCampaign?.id
          );
          setCharacters(campaignCharacters);
        } else if (userId) {
          const myCharacters = allCharacters.filter(
            (char: any) => char.playerId === userId && char.campaignId === activeCampaign?.id
          );
          setCharacters(myCharacters);
        }
      }

      if (synced > 0) {
        toast.success(`${synced} personagem(ns) sincronizado(s)!`);
      }
      if (errors > 0) {
        toast.warning(`${errors} erro(s) ao sincronizar`);
      }
    } catch (error) {
      console.error("Error syncing inventory:", error);
      toast.error("Erro ao sincronizar inventário");
    } finally {
      setSyncing(false);
    }
  };

  const handleEquip = async () => {
    if (!selectedItem || !selectedCharacterId) {
      toast.error("Selecione um personagem");
      return;
    }

    setEquipping(true);
    try {
      const res = await fetch(`/api/items/${selectedItem.id}/equip`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterId: selectedCharacterId,
          equipped: !selectedItem.equipped,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Erro ao equipar item");
      }

      const data = await res.json();
      
      // Atualizar lista de itens
      setItems((prev) =>
        prev.map((item) =>
          item.id === selectedItem.id
            ? { ...item, equipped: !selectedItem.equipped }
            : item
        )
      );

      toast.success(
        selectedItem.equipped
          ? "Item desequipado com sucesso!"
          : "Item equipado com sucesso!"
      );

      // Se for armadura, mostrar novo CA
      if (selectedItem.type === "Armor" && data.characterAC !== undefined) {
        toast.info(`CA atualizado para ${data.characterAC}`);
      }

      setSelectedItem(null);
    } catch (error: any) {
      console.error("Error equipping item:", error);
      toast.error(error.message || "Erro ao equipar item");
    } finally {
      setEquipping(false);
    }
  };

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
        <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
          <div className="flex-1">
            <h1 className="text-3xl font-bold font-cinzel text-accent text-glow">
              {isDM ? t("inventory.campaignInventory") : t("inventory.myInventory")}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {activeCampaign.title}
              {characters.length > 0 && (
                <span className="ml-2">
                  • {characters.length} {characters.length === 1 ? t("inventory.character") : t("inventory.characters")}
                </span>
              )}
            </p>
            {items.length === 0 && characters.length > 0 && (
              <p className="text-xs text-yellow-400 mt-2 flex items-center gap-2">
                <RefreshCw className="w-3 h-3" />
                Se você comprou itens na loja, clique em "Sincronizar Inventário" para aparecerem aqui
              </p>
            )}
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            <div className="relative flex-1 min-w-[200px] sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("inventory.filterItems")}
                className="pl-8 bg-card/50 border-accent/20 focus:border-accent/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {activeCampaign && (
              <Button
                onClick={handleSyncInventory}
                disabled={syncing}
                variant="outline"
                size="sm"
                className="shrink-0"
                title="Sincroniza itens do inventário dos personagens para aparecerem aqui"
              >
                {syncing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sincronizando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sincronizar Inventário
                  </>
                )}
              </Button>
            )}
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
                <p className="text-muted-foreground mb-4">
                  {searchTerm
                    ? t("inventory.noItemsFound")
                    : t("inventory.noItems")}
                </p>
                {!searchTerm && items.length === 0 && activeCampaign && (
                  <div className="mt-4">
                    <p className="text-sm text-yellow-400 mb-3">
                      {characters.length > 0 
                        ? "Se você comprou itens na loja ao criar seu personagem, eles podem estar apenas no inventário do personagem."
                        : "Clique em 'Sincronizar Inventário' para buscar itens dos seus personagens."}
                    </p>
                    <Button
                      onClick={handleSyncInventory}
                      disabled={syncing}
                      variant="default"
                      size="sm"
                    >
                      {syncing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sincronizando...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Sincronizar Inventário Agora
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </Card>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredItems.map((item, index) => {
                  const Icon = getItemIcon(item.name, item.type);
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
                        onClick={() => handleItemClick(item)}
                        className={`aspect-square bg-black/40 backdrop-blur-sm border-2 flex flex-col items-center justify-center p-4 hover:border-primary/50 transition-all cursor-pointer group relative overflow-hidden ${rarityStyle.border} ${
                          item.equipped ? "ring-2 ring-green-500/50" : ""
                        }`}
                      >

                        <Icon
                          className={`w-12 h-12 mb-3 ${rarityStyle.color} drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] transition-transform duration-300`}
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

                        {item.equipped && (
                          <div className="absolute top-2 right-2">
                            <Badge className="bg-green-500/80 text-white text-[10px] px-1.5 py-0.5">
                              <Check className="w-3 h-3 mr-1" />
                              Equipado
                            </Badge>
                          </div>
                        )}

                        {item.weight && (
                          <div className="absolute bottom-2 right-2 text-[10px] text-muted-foreground">
                            {item.weight}kg
                          </div>
                        )}

                        {isDM && item.ownerName && (
                          <div className="absolute bottom-2 left-2 text-[10px] text-blue-300 bg-blue-500/20 border border-blue-500/30 px-1.5 py-0.5 rounded backdrop-blur-sm">
                            {item.ownerName}
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

        {/* Dialog de Detalhes do Item */}
        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent>
            {selectedItem && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    {getItemIcon(selectedItem.name) && (
                      <div className={rarityColors[selectedItem.rarity]?.color || ""}>
                        {(() => {
                          const Icon = getItemIcon(selectedItem.name);
                          return <Icon className="w-5 h-5" />;
                        })()}
                      </div>
                    )}
                    {selectedItem.name}
                  </DialogTitle>
                  <DialogDescription>
                    {selectedItem.type} • {selectedItem.rarity}
                    {selectedItem.equipped && (
                      <span className="ml-2 text-green-400">• Equipado</span>
                    )}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  {selectedItem.description && (
                    <div>
                      <Label>Descrição</Label>
                      <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                        {selectedItem.description}
                      </p>
                    </div>
                  )}

                  {selectedItem.weight && (
                    <div>
                      <Label>Peso</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedItem.weight} kg
                      </p>
                    </div>
                  )}

                  {/* Seleção de Personagem */}
                  {characters.length > 0 ? (
                    <div>
                      <Label htmlFor="character-select">
                        {isDM ? "Equipar em:" : "Personagem:"}
                      </Label>
                      <Select
                        value={selectedCharacterId}
                        onValueChange={setSelectedCharacterId}
                      >
                        <SelectTrigger id="character-select">
                          <SelectValue placeholder="Selecione um personagem" />
                        </SelectTrigger>
                        <SelectContent>
                          {characters.map((char) => (
                            <SelectItem key={char.id} value={char.id}>
                              {char.name} ({char.characterClass})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      {isDM
                        ? "Nenhum personagem encontrado nesta campanha."
                        : "Você não tem personagens nesta campanha."}
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={handleEquip}
                      disabled={equipping || (!isDM && !selectedCharacterId)}
                      variant={selectedItem.equipped ? "outline" : "default"}
                      className="flex-1"
                    >
                      {equipping ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {selectedItem.equipped ? "Desequipando..." : "Equipando..."}
                        </>
                      ) : (
                        <>
                          {selectedItem.equipped ? (
                            <>
                              <X className="w-4 h-4 mr-2" />
                              Desequipar
                            </>
                          ) : (
                            <>
                              <Check className="w-4 h-4 mr-2" />
                              Equipar
                            </>
                          )}
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedItem(null)}
                    >
                      Fechar
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </FantasyLayout>
  );
}
