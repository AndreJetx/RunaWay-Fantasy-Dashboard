"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { FantasyLayout } from "@/components/layout/FantasyLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Users,
  Sword,
  Shield,
  Skull,
  Plus,
  CheckCircle2,
  Package,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import mapBg from "@assets/generated_images/fantasy_world_map_parchment.png";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CreateEnemyDialog } from "@/components/campaigns/CreateEnemyDialog";
import { Trash2 } from "lucide-react";

interface Character {
  id: string;
  name: string;
  race: string | null;
  characterClass: string;
  level: number;
  currentHp: number;
  maxHp: number;
  armorClass: number | null;
  playerId: string;
  image: string | null;
}

interface Npc {
  id: string;
  name: string;
  race: string | null;
  characterClass: string | null;
  type: string | null;
  level: number | null;
  challengeRating: string | null;
  currentHp: number | null;
  maxHp: number | null;
  armorClass: number | null;
  chapterId: string | null;
  isHostile: boolean;
  image: string | null;
}

interface Chapter {
  id: string;
  chapterNumber: number;
  title: string;
  description: string | null;
  isCompleted: boolean;
  completedAt: string | null;
}

interface Campaign {
  id: string;
  title: string;
  description: string | null;
  status: string;
  system: string;
  progress: number;
  totalChapters: number | null;
  image: string | null;
}

interface CampaignMember {
  id: string;
  userId: string;
  username: string;
  role: string;
}

export default function CampaignDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = (params?.id as string) || "";

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [npcs, setNpcs] = useState<Npc[]>([]);
  const [members, setMembers] = useState<CampaignMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDM, setIsDM] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [completingChapter, setCompletingChapter] = useState<string | null>(null);
  const [xpToDistribute, setXpToDistribute] = useState(0);
  const [characterXP, setCharacterXP] = useState<
    Array<{ characterId: string; experiencePoints: number }>
  >([]);
  const [itemsToDistribute, setItemsToDistribute] = useState<
    Array<{ characterId: string; itemName: string; quantity: number }>
  >([]);
  const [editingTotalChapters, setEditingTotalChapters] = useState(false);
  const [totalChaptersValue, setTotalChaptersValue] = useState(10);
  const [savingTotalChapters, setSavingTotalChapters] = useState(false);
  const [deletingCampaign, setDeletingCampaign] = useState(false);

  const fetchCampaignData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch campaign overview
      const overviewRes = await fetch(`/api/campaigns/${campaignId}/overview`);
      if (!overviewRes.ok) {
        if (overviewRes.status === 404) {
          toast.error("Campanha não encontrada");
          router.push("/campaigns");
          return;
        }
        throw new Error("Failed to fetch campaign");
      }

      const overview = await overviewRes.json();
      setCampaign(overview.campaign);
      setCharacters(overview.characters || []);
      setMembers(overview.members || []);
      setIsDM(overview.isDM || false);
      setTotalChaptersValue(overview.campaign?.totalChapters || 10);

      // Fetch chapters
      const chaptersRes = await fetch(`/api/campaigns/${campaignId}/chapters`);
      if (chaptersRes.ok) {
        const chaptersData = await chaptersRes.json();
        setChapters(chaptersData.chapters || []);
        if (chaptersData.chapters && chaptersData.chapters.length > 0) {
          setSelectedChapter(chaptersData.chapters[0].chapterNumber);
        }
      }

      // Fetch NPCs
      const npcsRes = await fetch(`/api/campaigns/${campaignId}/npcs`);
      if (npcsRes.ok) {
        const npcsData = await npcsRes.json();
        setNpcs(npcsData.npcs || []);
      }
    } catch (error: any) {
      console.error("Error fetching campaign data:", error);
      toast.error("Erro ao carregar dados da campanha");
    } finally {
      setLoading(false);
    }
  }, [campaignId, router]);

  useEffect(() => {
    fetchCampaignData();
  }, [fetchCampaignData]);

  const handleChapterComplete = async (chapterId: string, isCompleted: boolean) => {
    if (isCompleted && isDM) {
      // Abrir diálogo para distribuir XP e itens
      setCompletingChapter(chapterId);
      setXpToDistribute(0);
      setCharacterXP(characters.map(char => ({ characterId: char.id, experiencePoints: 0 })));
      setItemsToDistribute([]);
      return;
    }

    // Se não for DM ou for para reabrir, atualizar diretamente
    await updateChapterStatus(chapterId, isCompleted);
  };

  const updateChapterStatus = async (chapterId: string, isCompleted: boolean) => {
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/chapters/${chapterId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted }),
      });

      if (!res.ok) throw new Error("Failed to update chapter");

      const data = await res.json();
      
      // Atualizar estado local
      setChapters((prev) =>
        prev.map((ch) =>
          ch.id === chapterId
            ? { ...ch, isCompleted: data.chapter.isCompleted, completedAt: data.chapter.completedAt }
            : ch
        )
      );

      if (isCompleted) {
        toast.success("Capítulo marcado como concluído!");
      } else {
        toast.success("Capítulo reaberto");
      }
    } catch (error: any) {
      console.error("Error updating chapter:", error);
      toast.error("Erro ao atualizar capítulo");
    }
  };

  const handleCompleteWithRewards = async () => {
    if (!completingChapter) return;

    try {
      // Preparar XP individual (filtrar apenas os que têm XP > 0)
      const xpToSend = characterXP.filter(xp => xp.experiencePoints > 0);
      
      const res = await fetch(
        `/api/campaigns/${campaignId}/chapters/${completingChapter}/complete`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            characterXP: xpToSend.length > 0 ? xpToSend : undefined,
            experiencePoints: xpToDistribute > 0 ? xpToDistribute : undefined, // Fallback para compatibilidade
            items: itemsToDistribute.length > 0 ? itemsToDistribute : undefined,
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to complete chapter");

      const data = await res.json();
      
      // Atualizar estado local
      setChapters((prev) =>
        prev.map((ch) =>
          ch.id === completingChapter
            ? { ...ch, isCompleted: true, completedAt: new Date().toISOString() }
            : ch
        )
      );

      // Recarregar personagens para mostrar XP atualizado
      await fetchCampaignData();

      toast.success("Capítulo concluído com sucesso!");
      
      // Mostrar informações de level ups
      if (data.levelUps && data.levelUps.length > 0) {
        data.levelUps.forEach((levelUp: any) => {
          toast.success(
            `${levelUp.characterName} subiu para nível ${levelUp.newLevel}!`,
            { duration: 5000 }
          );
        });
      }
      
      if (xpToSend.length > 0) {
        const totalXP = xpToSend.reduce((sum, xp) => sum + xp.experiencePoints, 0);
        toast.info(`XP distribuído: ${totalXP} total`);
      } else if (xpToDistribute > 0) {
        toast.info(`${xpToDistribute} XP distribuído para todos os personagens`);
      }
      
      if (itemsToDistribute.length > 0) {
        toast.info(`${itemsToDistribute.length} item(ns) distribuído(s)`);
      }

      setCompletingChapter(null);
      setXpToDistribute(0);
      setCharacterXP([]);
      setItemsToDistribute([]);
    } catch (error: any) {
      console.error("Error completing chapter:", error);
      toast.error("Erro ao concluir capítulo");
    }
  };

  const [refreshingNpcs, setRefreshingNpcs] = useState(false);

  const handleEnemyCreated = async () => {
    // Recarregar NPCs
    setRefreshingNpcs(true);
    try {
      const npcsRes = await fetch(`/api/campaigns/${campaignId}/npcs`);
      if (npcsRes.ok) {
        const npcsData = await npcsRes.json();
        setNpcs(npcsData.npcs || []);
      }
    } catch (error) {
      console.error("Error refreshing NPCs:", error);
    } finally {
      setRefreshingNpcs(false);
    }
  };

  const handleSaveTotalChapters = async () => {
    if (!campaign) return;
    
    setSavingTotalChapters(true);
    try {
      const res = await fetch(`/api/campaigns/${campaignId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ totalChapters: totalChaptersValue }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Erro ao atualizar número de capítulos");
      }

      const data = await res.json();
      setCampaign({ ...campaign, totalChapters: data.campaign.totalChapters });
      setEditingTotalChapters(false);
      toast.success("Número de capítulos atualizado com sucesso!");
      await fetchCampaignData(); // Recarregar dados
    } catch (error: any) {
      console.error("Error updating total chapters:", error);
      toast.error(error.message || "Erro ao atualizar número de capítulos");
    } finally {
      setSavingTotalChapters(false);
    }
  };

  const handleDeleteCampaign = async () => {
    if (!campaign) return;

    setDeletingCampaign(true);
    try {
      const res = await fetch(`/api/campaigns/${campaignId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Erro ao excluir campanha");
      }

      toast.success("Campanha excluída com sucesso!");
      router.push("/campaigns");
    } catch (error: any) {
      console.error("Error deleting campaign:", error);
      toast.error(error.message || "Erro ao excluir campanha");
    } finally {
      setDeletingCampaign(false);
    }
  };

  if (loading) {
    return (
      <FantasyLayout>
        <div className="text-center py-12 text-muted-foreground">
          Carregando campanha...
        </div>
      </FantasyLayout>
    );
  }

  if (!campaign) {
    return (
      <FantasyLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Campanha não encontrada</p>
          <Button onClick={() => router.push("/campaigns")}>Voltar</Button>
        </div>
      </FantasyLayout>
    );
  }

  // Separar NPCs por tipo
  const heroes = characters.filter((c) => !c.playerId || members.some((m) => m.userId === c.playerId));
  const friendlyNpcs = npcs.filter((n) => !n.isHostile && n.type === "npc");
  const enemies = npcs.filter((n) => n.isHostile || n.type === "enemy" || n.type === "boss");
  
  // Filtrar NPCs por capítulo selecionado
  const currentChapter = chapters.find((ch) => ch.chapterNumber === selectedChapter);
  const chapterNpcs = currentChapter
    ? npcs.filter((n) => n.chapterId === currentChapter.id)
    : npcs;

  return (
    <FantasyLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold font-cinzel text-primary">
                {campaign.title}
              </h1>
              <Badge variant="outline" className="border-primary/50 text-primary">
                {campaign.system}
              </Badge>
              <Badge
                variant="outline"
                className={
                  campaign.status === "Active"
                    ? "border-green-500/50 text-green-400"
                    : campaign.status === "Paused"
                    ? "border-yellow-500/50 text-yellow-400"
                    : "border-gray-500/50 text-gray-400"
                }
              >
                {campaign.status}
              </Badge>
            </div>
            {campaign.description && (
              <p className="text-muted-foreground mt-2">{campaign.description}</p>
            )}
            {/* Barra de Progresso */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Progresso da Campanha</span>
                <span className="text-sm text-muted-foreground">
                  {campaign.progress}%
                </span>
              </div>
              <div className="w-full bg-secondary/20 rounded-full h-2.5">
                <div
                  className="bg-primary h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${campaign.progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {chapters.filter((ch) => ch.isCompleted).length} de {campaign.totalChapters || chapters.length} capítulos concluídos
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="characters" className="space-y-4">
          <TabsList>
            <TabsTrigger value="characters">
              <Sword className="w-4 h-4 mr-2" />
              Personagens
            </TabsTrigger>
            <TabsTrigger value="chapters">
              <Package className="w-4 h-4 mr-2" />
              Capítulos
            </TabsTrigger>
            {isDM && (
              <TabsTrigger value="management">
                <Sparkles className="w-4 h-4 mr-2" />
                Gerenciar
              </TabsTrigger>
            )}
          </TabsList>

          {/* Tab: Personagens */}
          <TabsContent value="characters" className="space-y-6">
            {/* Heróis */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold font-cinzel flex items-center gap-2">
                  <Shield className="w-6 h-6 text-primary" />
                  Heróis da Campanha
                </h2>
              </div>
              {heroes.length === 0 ? (
                <Card className="bg-card/40 border-border/40 p-8 text-center">
                  <p className="text-muted-foreground">
                    Nenhum herói criado ainda
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {heroes.map((character) => (
                    <Card key={character.id} className="bg-card/60 border-white/10 overflow-hidden">
                      <div className="relative h-48 bg-primary/10">
                        <Image
                          src={character.image || mapBg}
                          alt={character.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="text-xl font-bold mb-1">{character.name}</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {character.race || "Desconhecido"} • {character.characterClass}
                        </p>
                        <div className="flex items-center gap-2 text-sm mb-3">
                          <Badge variant="outline" className="border-green-500/50 text-green-400">
                            Lvl {character.level}
                          </Badge>
                          <span className="text-muted-foreground">
                            HP: {character.currentHp}/{character.maxHp}
                          </span>
                          {character.armorClass && (
                            <span className="text-muted-foreground">
                              CA: {character.armorClass}
                            </span>
                          )}
                        </div>
                        {isDM && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => router.push(`/characters/${character.id}`)}
                          >
                            Ver Ficha Completa
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* NPCs Amigáveis */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold font-cinzel flex items-center gap-2">
                  <Users className="w-6 h-6 text-primary" />
                  NPCs
                </h2>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push(`/campaigns/${campaignId}/npcs`)}
                  >
                    Ver Todos
                  </Button>
                  {isDM && (
                    <Button 
                      onClick={() => router.push(`/campaigns/${campaignId}/npcs`)} 
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Criar NPC
                    </Button>
                  )}
                </div>
              </div>
              {friendlyNpcs.length === 0 ? (
                <Card className="bg-card/40 border-border/40 p-8 text-center">
                  <p className="text-muted-foreground">
                    Nenhum NPC criado ainda
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {friendlyNpcs.map((npc) => (
                    <Card key={npc.id} className="bg-card/60 border-white/10 overflow-hidden">
                      <div className="relative h-48 bg-primary/10">
                        <Image
                          src={npc.image || mapBg}
                          alt={npc.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="text-xl font-bold mb-1">{npc.name}</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {npc.race || "Desconhecido"} • {npc.characterClass || "NPC"}
                        </p>
                        <div className="flex items-center gap-2 text-sm">
                          {npc.level && (
                            <Badge variant="outline" className="border-blue-500/50 text-blue-400">
                              Lvl {npc.level}
                            </Badge>
                          )}
                          {npc.maxHp && (
                            <span className="text-muted-foreground">
                              HP: {npc.currentHp || 0}/{npc.maxHp}
                            </span>
                          )}
                          {npc.armorClass && (
                            <span className="text-muted-foreground">
                              CA: {npc.armorClass}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Inimigos */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold font-cinzel flex items-center gap-2">
                  <Skull className="w-6 h-6 text-red-500" />
                  Inimigos
                </h2>
                {isDM && (
                  <CreateEnemyDialog
                    campaignId={campaignId}
                    chapterId={currentChapter?.id || null}
                    onEnemyCreated={handleEnemyCreated}
                  />
                )}
              </div>
              {enemies.length === 0 ? (
                <Card className="bg-card/40 border-border/40 p-8 text-center">
                  <p className="text-muted-foreground">
                    Nenhum inimigo criado ainda
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {enemies.map((enemy) => (
                    <Card key={enemy.id} className="bg-card/60 border-red-500/20 overflow-hidden">
                      <div className="relative h-48 bg-red-500/10">
                        <Image
                          src={enemy.image || mapBg}
                          alt={enemy.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="text-xl font-bold mb-1">{enemy.name}</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {enemy.race || "Desconhecido"} • {enemy.characterClass || enemy.type || "Inimigo"}
                        </p>
                        <div className="flex items-center gap-2 text-sm">
                          {enemy.challengeRating && (
                            <Badge variant="outline" className="border-red-500/50 text-red-400">
                              CR {enemy.challengeRating}
                            </Badge>
                          )}
                          {enemy.level && (
                            <Badge variant="outline" className="border-red-500/50 text-red-400">
                              Lvl {enemy.level}
                            </Badge>
                          )}
                          {/* Jogadores não veem HP e CA de inimigos */}
                          {isDM && enemy.maxHp && (
                            <span className="text-muted-foreground">
                              HP: {enemy.currentHp || 0}/{enemy.maxHp}
                            </span>
                          )}
                          {isDM && enemy.armorClass && (
                            <span className="text-muted-foreground">
                              CA: {enemy.armorClass}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Tab: Capítulos */}
          <TabsContent value="chapters" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold font-cinzel">Capítulos da Campanha</h2>
              {isDM && (
                <Button onClick={() => router.push(`/campaigns/${campaignId}/chapters/new`)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Capítulo
                </Button>
              )}
            </div>

            {chapters.length === 0 ? (
              <Card className="bg-card/40 border-border/40 p-8 text-center">
                <p className="text-muted-foreground">
                  Nenhum capítulo criado ainda
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {chapters.map((chapter) => (
                  <Card
                    key={chapter.id}
                    className={`bg-card/60 border-white/10 ${
                      chapter.isCompleted ? "border-green-500/50" : ""
                    }`}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="border-primary/50 text-primary">
                            Capítulo {chapter.chapterNumber}
                          </Badge>
                          <CardTitle className="text-xl">{chapter.title}</CardTitle>
                          {chapter.isCompleted && (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Concluído
                            </Badge>
                          )}
                        </div>
                        {isDM && (
                          <div className="flex items-center gap-2">
                            {chapter.isCompleted ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleChapterComplete(chapter.id, false)}
                              >
                                Reabrir Capítulo
                              </Button>
                            ) : (
                              <>
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => {
                                    setCompletingChapter(chapter.id);
                                    setXpToDistribute(0);
                                    setCharacterXP(characters.map(char => ({ characterId: char.id, experiencePoints: 0 })));
                                    setItemsToDistribute([]);
                                  }}
                                >
                                  <CheckCircle2 className="w-4 h-4 mr-2" />
                                  Concluir Capítulo
                                </Button>
                                <Dialog
                                  open={completingChapter === chapter.id}
                                  onOpenChange={(open) => {
                                    if (!open) {
                                      setCompletingChapter(null);
                                      setXpToDistribute(0);
                                      setCharacterXP([]);
                                      setItemsToDistribute([]);
                                    }
                                  }}
                                >
                                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                      <DialogTitle>Concluir Capítulo: {chapter.title}</DialogTitle>
                                      <DialogDescription>
                                        Distribua experiência e itens para os jogadores
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-6 py-4">
                                      {/* XP Distribution Individual */}
                                      <div>
                                        <Label>Experiência (XP) Individual por Personagem</Label>
                                        <div className="space-y-2 mt-2">
                                          {characters.map((character) => {
                                            const xpEntry = characterXP.find(xp => xp.characterId === character.id);
                                            const xpValue = xpEntry?.experiencePoints || 0;
                                            return (
                                              <div key={character.id} className="flex items-center gap-2">
                                                <Label htmlFor={`xp-${character.id}`} className="w-32 text-sm">
                                                  {character.name}:
                                                </Label>
                                                <Input
                                                  id={`xp-${character.id}`}
                                                  type="number"
                                                  min="0"
                                                  value={xpValue}
                                                  onChange={(e) => {
                                                    const newXP = parseInt(e.target.value) || 0;
                                                    setCharacterXP(prev => {
                                                      const filtered = prev.filter(xp => xp.characterId !== character.id);
                                                      return [...filtered, { characterId: character.id, experiencePoints: newXP }];
                                                    });
                                                  }}
                                                  placeholder="0"
                                                  className="flex-1"
                                                />
                                              </div>
                                            );
                                          })}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-2">
                                          Defina o XP individual para cada personagem. O nível será calculado automaticamente.
                                        </p>
                                      </div>

                                      {/* Items Distribution */}
                                      <div>
                                        <div className="flex items-center justify-between mb-2">
                                          <Label>Itens para distribuir</Label>
                                          <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                              if (characters.length === 0) {
                                                toast.error("Não há personagens na campanha para receber itens");
                                                return;
                                              }
                                              setItemsToDistribute([
                                                ...itemsToDistribute,
                                                {
                                                  characterId: characters[0].id,
                                                  itemName: "",
                                                  quantity: 1,
                                                },
                                              ]);
                                            }}
                                            disabled={characters.length === 0}
                                          >
                                            <Plus className="w-4 h-4 mr-1" />
                                            Adicionar Item
                                          </Button>
                                        </div>
                                        {itemsToDistribute.length === 0 ? (
                                          <p className="text-sm text-muted-foreground text-center py-4">
                                            Nenhum item adicionado
                                          </p>
                                        ) : (
                                          <div className="space-y-2">
                                            {itemsToDistribute.map((item, index) => (
                                              <Card key={index} className="p-3">
                                                <div className="grid grid-cols-3 gap-2">
                                                  <div>
                                                    <Label className="text-xs">Personagem</Label>
                                                    <select
                                                      className="w-full h-9 px-2 rounded-md border border-input bg-background text-sm"
                                                      value={item.characterId}
                                                      onChange={(e) => {
                                                        const newItems = [...itemsToDistribute];
                                                        newItems[index].characterId = e.target.value;
                                                        setItemsToDistribute(newItems);
                                                      }}
                                                    >
                                                      {characters.map((char) => (
                                                        <option key={char.id} value={char.id}>
                                                          {char.name}
                                                        </option>
                                                      ))}
                                                    </select>
                                                  </div>
                                                  <div>
                                                    <Label className="text-xs">Nome do Item</Label>
                                                    <Input
                                                      value={item.itemName}
                                                      onChange={(e) => {
                                                        const newItems = [...itemsToDistribute];
                                                        newItems[index].itemName = e.target.value;
                                                        setItemsToDistribute(newItems);
                                                      }}
                                                      placeholder="Nome do item"
                                                      className="h-9 text-sm"
                                                    />
                                                  </div>
                                                  <div className="flex items-end gap-2">
                                                    <div className="flex-1">
                                                      <Label className="text-xs">Quantidade</Label>
                                                      <Input
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) => {
                                                          const newItems = [...itemsToDistribute];
                                                          newItems[index].quantity =
                                                            parseInt(e.target.value) || 1;
                                                          setItemsToDistribute(newItems);
                                                        }}
                                                        className="h-9 text-sm"
                                                      />
                                                    </div>
                                                    <Button
                                                      type="button"
                                                      variant="ghost"
                                                      size="icon"
                                                      onClick={() => {
                                                        setItemsToDistribute(
                                                          itemsToDistribute.filter((_, i) => i !== index)
                                                        );
                                                      }}
                                                    >
                                                      ×
                                                    </Button>
                                                  </div>
                                                </div>
                                              </Card>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <Button
                                        variant="outline"
                                        onClick={() => {
                                          setCompletingChapter(null);
                                          setXpToDistribute(0);
                                          setCharacterXP([]);
                                          setItemsToDistribute([]);
                                        }}
                                      >
                                        Cancelar
                                      </Button>
                                      <Button onClick={handleCompleteWithRewards}>
                                        Concluir Capítulo
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {chapter.description && (
                        <p className="text-muted-foreground">{chapter.description}</p>
                      )}
                      {chapter.isCompleted && chapter.completedAt && (
                        <p className="text-xs text-muted-foreground">
                          Concluído em: {new Date(chapter.completedAt).toLocaleDateString("pt-BR")}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Tab: Gerenciar (apenas para DM) */}
          {isDM && (
            <TabsContent value="management" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Gerenciar Campanha</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Número Total de Capítulos */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="totalChapters">Número Total de Capítulos</Label>
                      {!editingTotalChapters ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingTotalChapters(true)}
                        >
                          Editar
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingTotalChapters(false);
                              setTotalChaptersValue(campaign?.totalChapters || 10);
                            }}
                            disabled={savingTotalChapters}
                          >
                            Cancelar
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleSaveTotalChapters}
                            disabled={savingTotalChapters}
                          >
                            {savingTotalChapters ? "Salvando..." : "Salvar"}
                          </Button>
                        </div>
                      )}
                    </div>
                    {editingTotalChapters ? (
                      <Input
                        id="totalChapters"
                        type="number"
                        min="1"
                        max="100"
                        value={totalChaptersValue}
                        onChange={(e) => setTotalChaptersValue(parseInt(e.target.value) || 10)}
                        className="max-w-xs"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {campaign?.totalChapters || 10} capítulos
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Você não poderá criar mais capítulos que este número. Capítulos criados: {chapters.length}
                    </p>
                  </div>

                  {/* Jogadores */}
                  <div>
                    <h3 className="font-semibold mb-2">Jogadores</h3>
                    {members.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Nenhum jogador adicionado ainda
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {members.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center justify-between p-2 bg-card/40 rounded"
                          >
                            <span>{member.username}</span>
                            <Badge variant="outline">{member.role}</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Excluir Campanha */}
                  <div className="pt-6 border-t">
                    <h3 className="font-semibold mb-2 text-destructive">Zona de Perigo</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Ao excluir a campanha, todos os dados relacionados serão permanentemente deletados, incluindo:
                      personagens, NPCs, inimigos, mapas, capítulos, sessões, notas e itens.
                    </p>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          disabled={deletingCampaign}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Excluir Campanha
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir a campanha <strong>&quot;{campaign?.title}&quot;</strong>?
                            <br />
                            <br />
                            Esta ação não pode ser desfeita. Todos os dados relacionados serão permanentemente deletados:
                            <ul className="list-disc list-inside mt-2 space-y-1">
                              <li>Todos os personagens ({characters.length})</li>
                              <li>Todos os NPCs e inimigos ({npcs.length})</li>
                              <li>Todos os mapas</li>
                              <li>Todos os capítulos ({chapters.length})</li>
                              <li>Todas as sessões</li>
                              <li>Todas as notas</li>
                              <li>Todos os itens</li>
                            </ul>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel disabled={deletingCampaign}>
                            Cancelar
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteCampaign}
                            disabled={deletingCampaign}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {deletingCampaign ? "Excluindo..." : "Sim, excluir campanha"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </FantasyLayout>
  );
}

