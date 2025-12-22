"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { FantasyLayout } from "@/components/layout/FantasyLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Shield,
  Heart,
  Eye,
  EyeOff,
  Trash2,
  Edit,
  Skull,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateNPCDialog } from "@/components/campaigns/CreateNPCDialog";

interface NPC {
  id: string;
  name: string;
  type?: string | null;
  challengeRating?: string | null;
  alignment?: string | null;
  image?: string | null;
  isHostile?: boolean;
  currentHp?: number | null;
  maxHp?: number | null;
  armorClass?: number | null;
  // Campos completos apenas para DM
  race?: string | null;
  characterClass?: string | null;
  level?: number | null;
  initiative?: number | null;
  speed?: number | null;
  tempHp?: number | null;
  hitDice?: string | null;
  attributes?: Record<string, number>;
  savingThrows?: Record<string, boolean>;
  skills?: Record<string, number>;
  proficiencyBonus?: number | null;
  attacks?: Array<{
    name: string;
    bonus: number;
    damage: string;
    type: string;
    description: string;
  }>;
  abilities?: Array<{
    name: string;
    description: string;
  }>;
  resistances?: string[];
  immunities?: string[];
  vulnerabilities?: string[];
  description?: string | null;
  backstory?: string | null;
  notes?: string | null;
  chapterId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export default function NPCsPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = (params?.id as string) || "";

  const [npcs, setNpcs] = useState<NPC[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDM, setIsDM] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNpc, setSelectedNpc] = useState<NPC | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const fetchNPCs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/campaigns/${campaignId}/npcs`);
      if (res.ok) {
        const data = await res.json();
        setNpcs(data.npcs || []);
        setIsDM(data.isDM || false);
      } else {
        toast.error("Erro ao carregar NPCs");
      }
    } catch (error) {
      console.error("Error fetching NPCs:", error);
      toast.error("Erro ao carregar NPCs");
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    fetchNPCs();
  }, [fetchNPCs]);

  const filteredNpcs = npcs.filter((npc) =>
    npc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    npc.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (npcId: string) => {
    if (!confirm("Tem certeza que deseja deletar este NPC?")) return;

    try {
      const res = await fetch(`/api/campaigns/${campaignId}/npcs/${npcId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("NPC deletado com sucesso");
        fetchNPCs();
      } else {
        toast.error("Erro ao deletar NPC");
      }
    } catch (error) {
      console.error("Error deleting NPC:", error);
      toast.error("Erro ao deletar NPC");
    }
  };

  const handleViewNpc = (npc: NPC) => {
    setSelectedNpc(npc);
    setIsViewDialogOpen(true);
  };

  if (loading) {
    return (
      <FantasyLayout>
        <div className="text-center py-12 text-muted-foreground">
          Carregando NPCs...
        </div>
      </FantasyLayout>
    );
  }

  return (
    <FantasyLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold font-cinzel text-primary">
              NPCs e Inimigos
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isDM
                ? "Gerencie todos os NPCs e inimigos da campanha"
                : "Visualize os NPCs encontrados"}
            </p>
          </div>
          {isDM && (
            <CreateNPCDialog
              campaignId={campaignId}
              onSuccess={fetchNPCs}
            />
          )}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar NPCs..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {filteredNpcs.length === 0 ? (
          <Card className="bg-card/40 border-white/10 p-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">
              {searchTerm
                ? "Nenhum NPC encontrado"
                : isDM
                  ? "Nenhum NPC criado ainda. Crie o primeiro!"
                  : "Nenhum NPC encontrado ainda"}
            </p>
            {isDM && !searchTerm && (
              <Button
                className="bg-primary text-primary-foreground"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" /> Criar Primeiro NPC
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNpcs.map((npc) => (
              <motion.div
                key={npc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className={`bg-card/40 border-white/10 transition-colors h-full flex flex-col ${!isDM && npc.isHostile ? "cursor-default" : "cursor-pointer hover:border-primary/50"
                  }`}>
                  <div
                    className="p-4 flex-1"
                    onClick={() => {
                      if (!isDM && npc.isHostile) {
                        // Jogadores não podem clicar em inimigos
                        return;
                      }
                      handleViewNpc(npc);
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1">{npc.name}</h3>
                        {!isDM && npc.isHostile ? (
                          // Jogador vê apenas nome de inimigos
                          <Badge variant="destructive" className="text-xs mt-1">
                            <Skull className="h-3 w-3 mr-1" /> Inimigo
                          </Badge>
                        ) : (
                          // DM ou NPCs não hostis: mostrar badges completos
                          <div className="flex gap-2 flex-wrap">
                            {npc.type && (
                              <Badge variant="outline" className="text-xs">
                                {npc.type}
                              </Badge>
                            )}
                            {npc.challengeRating && (
                              <Badge variant="outline" className="text-xs">
                                CR {npc.challengeRating}
                              </Badge>
                            )}
                            {npc.isHostile && (
                              <Badge variant="destructive" className="text-xs">
                                <Skull className="h-3 w-3 mr-1" /> Hostil
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {isDM && (
                      <div className="space-y-2 text-sm text-muted-foreground">
                        {npc.currentHp !== null && npc.maxHp !== null && (
                          <div className="flex items-center gap-2">
                            <Heart className="h-4 w-4 text-red-400" />
                            <span>
                              {npc.currentHp} / {npc.maxHp} PV
                            </span>
                          </div>
                        )}
                        {npc.armorClass !== null && (
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-blue-400" />
                            <span>CA {npc.armorClass}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {!isDM && !npc.isHostile && npc.type && (
                      <p className="text-sm text-muted-foreground mt-2">
                        NPC - {npc.type}
                      </p>
                    )}
                  </div>

                  {isDM && (
                    <div className="border-t border-white/10 p-2 flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewNpc(npc);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(npc.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Dialog para visualizar NPC */}
      {selectedNpc && (
        <ViewNPCDialog
          npc={selectedNpc}
          isOpen={isViewDialogOpen}
          onOpenChange={setIsViewDialogOpen}
          isDM={isDM}
          campaignId={campaignId}
          onUpdate={fetchNPCs}
        />
      )}
    </FantasyLayout>
  );
}



// Componente para visualizar NPC completo (apenas DM vê tudo)
function ViewNPCDialog({
  npc,
  isOpen,
  onOpenChange,
  isDM,
  campaignId,
  onUpdate,
}: {
  npc: NPC;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isDM: boolean;
  campaignId: string;
  onUpdate: () => void;
}) {
  if (!isDM) {
    // Jogador: se for hostil, mostra apenas nome. Se for NPC, mostra ficha completa
    if (npc.isHostile) {
      return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
          <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>{npc.name}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Badge variant="destructive" className="mb-4">
                <Skull className="h-4 w-4 mr-2" /> Inimigo
              </Badge>
              <p className="text-muted-foreground">
                Você encontrou este inimigo, mas ainda não conhece seus detalhes.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      );
    }

    // Jogador vê ficha completa de NPCs (não hostis)
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{npc.name}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                {npc.type && (
                  <Badge variant="outline">{npc.type}</Badge>
                )}
                {npc.challengeRating && (
                  <Badge variant="outline">CR {npc.challengeRating}</Badge>
                )}
              </div>
              <p className="text-muted-foreground">
                Este é um NPC da campanha.
              </p>
              {/* Mostrar informações completas do NPC para jogadores */}
              {(npc.currentHp !== null || npc.maxHp !== null || npc.armorClass !== null) && (
                <div className="grid grid-cols-2 gap-4">
                  {npc.currentHp !== null && npc.maxHp !== null && (
                    <div>
                      <Label className="text-xs text-muted-foreground">PV</Label>
                      <p className="font-bold">{npc.currentHp} / {npc.maxHp}</p>
                    </div>
                  )}
                  {npc.armorClass !== null && (
                    <div>
                      <Label className="text-xs text-muted-foreground">CA</Label>
                      <p className="font-bold">{npc.armorClass}</p>
                    </div>
                  )}
                </div>
              )}
              {npc.description && (
                <div>
                  <Label className="text-xs text-muted-foreground">Descrição</Label>
                  <p className="text-sm">{npc.description}</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  }

  // DM vê ficha completa
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-cinzel">{npc.name}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 pr-4">
            {/* Informações Básicas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {npc.challengeRating && (
                <div>
                  <Label className="text-xs text-muted-foreground">CR</Label>
                  <p className="font-bold">{npc.challengeRating}</p>
                </div>
              )}
              {npc.type && (
                <div>
                  <Label className="text-xs text-muted-foreground">Tipo</Label>
                  <p className="font-bold">{npc.type}</p>
                </div>
              )}
              {npc.alignment && (
                <div>
                  <Label className="text-xs text-muted-foreground">Alinhamento</Label>
                  <p className="font-bold">{npc.alignment}</p>
                </div>
              )}
              {npc.armorClass !== null && (
                <div>
                  <Label className="text-xs text-muted-foreground">CA</Label>
                  <p className="font-bold">{npc.armorClass}</p>
                </div>
              )}
            </div>

            {/* PV */}
            {npc.currentHp !== null && npc.maxHp !== null && (
              <div>
                <Label className="text-xs text-muted-foreground">Pontos de Vida</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={npc.currentHp}
                    onChange={async (e) => {
                      const newHp = parseInt(e.target.value, 10);
                      try {
                        const res = await fetch(
                          `/api/campaigns/${campaignId}/npcs/${npc.id}`,
                          {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ currentHp: newHp }),
                          }
                        );
                        if (res.ok) {
                          onUpdate();
                        }
                      } catch (error) {
                        console.error("Error updating HP:", error);
                      }
                    }}
                    className="w-24"
                  />
                  <span className="text-muted-foreground">/</span>
                  <Input
                    type="number"
                    value={npc.maxHp}
                    onChange={async (e) => {
                      const newMaxHp = parseInt(e.target.value, 10);
                      try {
                        const res = await fetch(
                          `/api/campaigns/${campaignId}/npcs/${npc.id}`,
                          {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ maxHp: newMaxHp }),
                          }
                        );
                        if (res.ok) {
                          onUpdate();
                        }
                      } catch (error) {
                        console.error("Error updating max HP:", error);
                      }
                    }}
                    className="w-24"
                  />
                </div>
              </div>
            )}

            {/* Atributos */}
            {npc.attributes && (
              <div>
                <Label className="text-sm font-bold mb-2 block">Atributos</Label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {Object.entries(npc.attributes).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <p className="text-xs text-muted-foreground uppercase">
                        {key.substring(0, 3)}
                      </p>
                      <p className="font-bold">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ataques */}
            {npc.attacks && npc.attacks.length > 0 && (
              <div>
                <Label className="text-sm font-bold mb-2 block">Ataques</Label>
                <div className="space-y-2">
                  {npc.attacks.map((attack, idx) => (
                    <Card key={idx} className="p-3 bg-card/40">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold">{attack.name}</p>
                          {attack.description && (
                            <p className="text-xs text-muted-foreground">
                              {attack.description}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm">
                            +{attack.bonus} para acertar
                          </p>
                          {attack.damage && (
                            <p className="text-xs text-muted-foreground">
                              {attack.damage}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Habilidades Especiais */}
            {npc.abilities && npc.abilities.length > 0 && (
              <div>
                <Label className="text-sm font-bold mb-2 block">
                  Habilidades Especiais
                </Label>
                <div className="space-y-2">
                  {npc.abilities.map((ability, idx) => (
                    <Card key={idx} className="p-3 bg-card/40">
                      <p className="font-bold text-sm">{ability.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {ability.description}
                      </p>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Resistências, Imunidades, Vulnerabilidades */}
            {(npc.resistances?.length ||
              npc.immunities?.length ||
              npc.vulnerabilities?.length) && (
                <div className="grid grid-cols-3 gap-4">
                  {npc.resistances && npc.resistances.length > 0 && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Resistências</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {npc.resistances.map((res, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {res}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {npc.immunities && npc.immunities.length > 0 && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Imunidades</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {npc.immunities.map((imm, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {imm}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {npc.vulnerabilities && npc.vulnerabilities.length > 0 && (
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Vulnerabilidades
                      </Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {npc.vulnerabilities.map((vul, idx) => (
                          <Badge key={idx} variant="destructive" className="text-xs">
                            {vul}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

            {/* Notas */}
            {npc.notes && (
              <div>
                <Label className="text-sm font-bold mb-2 block">Notas</Label>
                <Textarea
                  value={npc.notes}
                  readOnly
                  className="bg-muted min-h-[100px]"
                />
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

