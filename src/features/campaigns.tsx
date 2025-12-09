"use client";

import { useEffect, useState } from "react";
import { FantasyLayout } from "@/components/layout/FantasyLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Scroll, Clock, Users, MapPin, ChevronRight, Copy, Key, UserPlus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import mapBg from "@assets/generated_images/fantasy_world_map_parchment.png";
import Image from "next/image";
import { useCampaign } from "@/contexts/CampaignContext";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/context";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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

interface Campaign {
  id: string;
  title: string;
  description: string | null;
  status: string;
  system: string;
  progress: number;
  image: string | null;
  nextSession: string | null;
  createdAt: Date;
  inviteCode?: string | null;
}

export default function Campaigns() {
  const { campaigns, setActiveCampaign, loading, refreshCampaigns } =
    useCampaign();
  const router = useRouter();
  const [isDM, setIsDM] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [generatingCode, setGeneratingCode] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deletingCampaign, setDeletingCampaign] = useState<string | null>(null);
  const [confirmCampaignTitle, setConfirmCampaignTitle] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    const checkRole = async () => {
      try {
        const res = await fetch("/api/users/me");
        if (res.ok) {
          const data = await res.json();
          setIsDM(data.role === "dm");
        }
      } catch (error) {
        console.error("Error checking role:", error);
      }
    };
    checkRole();
  }, []);

  const handleSelectCampaign = (campaign: Campaign) => {
    router.push(`/campaigns/${campaign.id}`);
  };

  const handleJoinCampaign = async () => {
    if (!inviteCode.trim()) {
      toast.error(t("campaigns.inviteCode") + " " + t("common.name"));
      return;
    }

    setJoining(true);
    try {
      // Normalizar código para maiúsculas
      const normalizedCode = inviteCode.trim().toUpperCase();
      
      const res = await fetch("/api/campaigns/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode: normalizedCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data.error || t("campaigns.connectionError");
        console.error("Error response:", data);
        toast.error(errorMsg);
        return;
      }

      toast.success(`${t("campaigns.enterCampaign")}: ${data.campaign.title}`);
      setInviteCode("");
      setDialogOpen(false); // Fechar o dialog
      await refreshCampaigns();
    } catch (error) {
      console.error("Error joining campaign:", error);
      toast.error(t("campaigns.connectionError"));
    } finally {
      setJoining(false);
    }
  };

  const handleGenerateInviteCode = async (campaignId: string) => {
    setGeneratingCode(campaignId);
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/invite/generate`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || t("campaigns.inviteError"));
        return;
      }

      toast.success(t("campaigns.inviteGenerated"));
      // Copiar para clipboard
      if (data.inviteCode) {
        navigator.clipboard.writeText(data.inviteCode);
        toast.info(t("campaigns.inviteCopied"));
      }
      refreshCampaigns();
    } catch (error) {
      console.error("Error generating invite code:", error);
      toast.error(t("campaigns.inviteError"));
    } finally {
      setGeneratingCode(null);
    }
  };

  const handleDeleteCampaign = async (campaignId: string, campaignTitle: string) => {
    if (confirmCampaignTitle !== campaignTitle) {
      toast.error(t("campaign.nameMismatch") || "O nome da campanha não confere");
      return;
    }

    setDeletingCampaign(campaignId);
    try {
      const res = await fetch(`/api/campaigns/${campaignId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || t("campaign.deleteError") || "Erro ao excluir campanha");
      }

      toast.success(t("campaign.deleteSuccess") || "Campanha excluída com sucesso!");
      setConfirmCampaignTitle("");
      await refreshCampaigns();
    } catch (error: any) {
      console.error("Error deleting campaign:", error);
      toast.error(error.message || t("campaign.deleteError") || "Erro ao excluir campanha");
    } finally {
      setDeletingCampaign(null);
      setConfirmCampaignTitle("");
    }
  };

  if (loading) {
    return (
      <FantasyLayout>
        <div className="text-center py-12 text-muted-foreground">
          {t("campaigns.loading")}
        </div>
      </FantasyLayout>
    );
  }

  return (
    <FantasyLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold font-cinzel text-primary">
              {t("campaigns.title")}
            </h1>
            <p className="text-muted-foreground">
              {t("campaigns.subtitle")}
            </p>
          </div>
          <div className="flex gap-2">
            {!isDM && (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
                    <UserPlus className="mr-2 h-4 w-4" /> {t("campaigns.joinWithCode")}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("campaigns.joinTitle")}</DialogTitle>
                    <DialogDescription>
                      {t("campaigns.joinDescription")}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="inviteCode">{t("campaigns.inviteCode")}</Label>
                      <Input
                        id="inviteCode"
                        placeholder="Ex: ABC12345"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                        maxLength={8}
                        className="mt-2 font-mono text-lg tracking-widest"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setInviteCode("");
                        setDialogOpen(false);
                      }}
                    >
                      {t("common.cancel")}
                    </Button>
                    <Button
                      onClick={handleJoinCampaign}
                      disabled={joining || !inviteCode.trim()}
                    >
                      {joining ? t("campaigns.entering") : t("campaigns.enterCampaign")}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            {isDM && (
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => router.push("/campaigns/new")}
              >
                <Scroll className="mr-2 h-4 w-4" /> {t("campaigns.newCampaign")}
              </Button>
            )}
          </div>
        </div>

        {campaigns.length === 0 ? (
          <Card className="bg-card/40 border-primary/20 p-12 text-center">
            <p className="text-muted-foreground mb-4">
              {t("campaigns.noCampaigns")}
            </p>
            {isDM && (
              <Button
                onClick={() => router.push("/campaigns/new")}
                className="bg-primary text-primary-foreground"
              >
                {t("campaigns.createFirst")}
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid gap-8">
            {campaigns.map((camp, i) => (
              <motion.div
                key={camp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
              >
                <Card 
                  className="bg-card/60 border-white/10 overflow-hidden hover:border-primary/40 transition-colors group cursor-pointer"
                  onClick={() => handleSelectCampaign(camp)}
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/3 h-48 md:h-auto relative overflow-hidden">
                      <div className="absolute inset-0 bg-primary/10 mix-blend-overlay z-10" />
                      <Image
                        src={camp.image || mapBg}
                        alt={camp.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105 sepia-[.3]"
                        sizes="(min-width: 768px) 33vw, 100vw"
                        priority={i === 0}
                      />
                    </div>
                    <div className="md:w-2/3 p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge
                                variant="outline"
                                className="border-primary/50 text-primary bg-primary/10"
                              >
                                {camp.status}
                              </Badge>
                              {isDM && (camp as any).inviteCode && (
                                <Badge
                                  variant="outline"
                                  className="border-green-500/50 text-green-400 bg-green-500/10 font-mono text-xs"
                                >
                                  <Key className="w-3 h-3 mr-1" />
                                  {(camp as any).inviteCode}
                                </Badge>
                              )}
                            </div>
                            <h2 className="text-2xl font-bold font-cinzel text-foreground group-hover:text-primary transition-colors">
                              {camp.title}
                            </h2>
                            {camp.description && (
                              <p className="text-sm text-muted-foreground mt-2">
                                {camp.description}
                              </p>
                            )}
                            {isDM && (
                              <div className="mt-3">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleGenerateInviteCode(camp.id);
                                  }}
                                  disabled={generatingCode === camp.id}
                                  className="text-xs"
                                  type="button"
                                >
                                  {generatingCode === camp.id ? (
                                    t("campaigns.generating")
                                  ) : (camp as any).inviteCode ? (
                                    <>
                                      <Copy className="w-3 h-3 mr-1" />
                                      {t("campaigns.regenerateInvite")}
                                    </>
                                  ) : (
                                    <>
                                      <Key className="w-3 h-3 mr-1" />
                                      {t("campaigns.generateInvite")}
                                    </>
                                  )}
                                </Button>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {isDM && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>{t("campaign.deleteConfirmTitle") || "Tem certeza absoluta?"}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      {t("campaign.deleteConfirmDescription") || "Esta ação não pode ser desfeita. Isso excluirá permanentemente a campanha"}{" "}
                                      <span className="font-bold text-primary">{camp.title}</span> {t("campaign.deleteConfirmDescription2") || "e removerá todos os dados relacionados, incluindo:"}
                                      <ul className="list-disc list-inside mt-2 ml-4 text-red-300">
                                        <li>{t("campaign.allCharacters") || "Todos os personagens"}</li>
                                        <li>{t("campaign.allMembers") || "Todos os membros"}</li>
                                        <li>{t("campaign.allItems") || "Todos os itens"}</li>
                                        <li>{t("campaign.allMaps") || "Todos os mapas"}</li>
                                        <li>{t("campaign.allChaptersNotes") || "Todos os capítulos e notas"}</li>
                                      </ul>
                                      {t("campaign.typeCampaignName") || "Por favor, digite o nome da campanha"} (<span className="font-bold text-primary">{camp.title}</span>) {t("campaign.toConfirm") || "para confirmar"}.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <Input
                                    placeholder={camp.title}
                                    value={confirmCampaignTitle}
                                    onChange={(e) => setConfirmCampaignTitle(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <AlertDialogFooter>
                                    <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
                                      {t("common.cancel")}
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteCampaign(camp.id, camp.title);
                                      }}
                                      disabled={confirmCampaignTitle !== camp.title || deletingCampaign === camp.id}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      {deletingCampaign === camp.id ? (t("campaign.deleting") || "Excluindo...") : (t("campaign.confirmDelete") || "Confirmar Exclusão")}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground hover:text-primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectCampaign(camp);
                              }}
                            >
                              <ChevronRight className="w-6 h-6" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                          {camp.nextSession && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="w-4 h-4 text-primary" />
                              {t("campaigns.nextSession")}: {new Date(camp.nextSession).toLocaleDateString()}
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4 text-primary" />
                            {camp.system}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs uppercase tracking-widest text-muted-foreground">
                          <span>{t("campaigns.storyProgress")}</span>
                          <span>{camp.progress}%</span>
                        </div>
                        <div className="h-2 bg-black/50 rounded-full overflow-hidden border border-white/5">
                          <motion.div
                            className="h-full bg-gradient-to-r from-primary to-secondary"
                            initial={{ width: 0 }}
                            animate={{ width: `${camp.progress}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </FantasyLayout>
  );
}
