"use client";

import { useEffect, useState } from "react";
import { FantasyLayout } from "@/components/layout/FantasyLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Crown,
  Sword,
  Backpack,
  Map as MapIcon,
  Feather,
  ChevronRight,
  Calendar,
  Trash2,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/context";
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
import { Input } from "@/components/ui/input";

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
}

interface CampaignOverview {
  campaign: Campaign;
  members: Array<{
    id: string;
    userId: string;
    username: string;
    role: string;
  }>;
  characters: Array<any>;
  items: Array<any>;
  maps: Array<any>;
  notes: Array<any>;
  isDM: boolean;
}

export default function Dashboard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignOverviews, setCampaignOverviews] = useState<
    Record<string, CampaignOverview>
  >({});
  const [loading, setLoading] = useState(true);
  const [isDM, setIsDM] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [deletingCampaign, setDeletingCampaign] = useState<string | null>(null);
  const [confirmCampaignTitle, setConfirmCampaignTitle] = useState("");
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/campaigns/my-campaigns");
        if (res.ok) {
          const data = await res.json();
          setCampaigns(data.campaigns || []);
          setIsDM(data.isDM);
          setUser(data.user);

          // Fetch overview for each campaign
          const overviews: Record<string, CampaignOverview> = {};
          for (const campaign of data.campaigns || []) {
            const overviewRes = await fetch(
              `/api/campaigns/${campaign.id}/overview`,
            );
            if (overviewRes.ok) {
              const overview = await overviewRes.json();
              overviews[campaign.id] = overview;
            }
          }
          setCampaignOverviews(overviews);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
      // Recarregar dados
      const res2 = await fetch("/api/campaigns/my-campaigns");
      if (res2.ok) {
        const data = await res2.json();
        setCampaigns(data.campaigns || []);
        // Recarregar overviews
        const overviews: Record<string, CampaignOverview> = {};
        for (const campaign of data.campaigns || []) {
          const overviewRes = await fetch(
            `/api/campaigns/${campaign.id}/overview`,
          );
          if (overviewRes.ok) {
            const overview = await overviewRes.json();
            overviews[campaign.id] = overview;
          }
        }
        setCampaignOverviews(overviews);
      }
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
        <div className="flex items-center justify-center h-96">
          <div className="text-muted-foreground">{t("common.loading")}</div>
        </div>
      </FantasyLayout>
    );
  }

  const greeting = isDM
    ? t("dashboard.welcomeDM")
    : t("dashboard.welcomePlayer");

  if (campaigns.length === 0) {
    return (
      <FantasyLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-white drop-shadow-[0_0_10px_rgba(var(--primary),0.5)] font-cinzel mb-2">
              {isDM ? t("dashboard.title") : t("dashboard.myAdventures")}
            </h1>
            <p className="text-muted-foreground">{greeting}</p>
          </div>

          <Card className="bg-card/50 backdrop-blur border-primary/20 p-12 text-center">
            <Crown className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h2 className="text-2xl font-cinzel font-bold mb-2">
              {t("dashboard.noCampaigns")}
            </h2>
            <p className="text-muted-foreground mb-6">
              {isDM
                ? t("dashboard.noCampaignsDM")
                : t("dashboard.noCampaignsPlayer")}
            </p>
            {isDM && (
              <Link href="/campaigns">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  {t("dashboard.createCampaign")}
                </Button>
              </Link>
            )}
          </Card>
        </div>
      </FantasyLayout>
    );
  }

  return (
    <FantasyLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white drop-shadow-[0_0_10px_rgba(var(--primary),0.5)] font-cinzel mb-2">
              {isDM ? t("dashboard.title") : t("dashboard.myAdventures")}
            </h1>
            <p className="text-muted-foreground">{greeting}</p>
          </div>
          {isDM && (
            <Link href="/campaigns">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(var(--primary),0.4)] border border-white/10">
                <Crown className="mr-2 h-4 w-4" />
                {t("dashboard.newCampaign")}
              </Button>
            </Link>
          )}
        </div>

        {/* Campaigns List */}
        <div className="space-y-6">
          {campaigns.map((campaign, index) => {
            const overview = campaignOverviews[campaign.id];
            const statusColors: Record<string, string> = {
              Active: "bg-green-500/20 text-green-400 border-green-500/50",
              Paused: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
              Completed: "bg-blue-500/20 text-blue-400 border-blue-500/50",
              Archived: "bg-gray-500/20 text-gray-400 border-gray-500/50",
            };

            return (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-card/60 border-white/10 overflow-hidden hover:border-primary/40 transition-colors">
                  <div className="p-6">
                    {/* Campaign Header */}
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="text-2xl font-bold font-cinzel text-foreground">
                            {campaign.title}
                          </h2>
                          <span
                            className={cn(
                              "px-2 py-1 rounded text-xs font-medium border",
                              statusColors[campaign.status] ||
                                "bg-gray-500/20 text-gray-400 border-gray-500/50",
                            )}
                          >
                            {campaign.status}
                          </span>
                        </div>
                        {campaign.description && (
                          <p className="text-muted-foreground mb-2">
                            {campaign.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Sistema: {campaign.system}</span>
                          {campaign.nextSession && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Próxima sessão:{" "}
                              {new Date(campaign.nextSession).toLocaleDateString(
                                "pt-BR",
                              )}
                            </span>
                          )}
                        </div>
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
                                  <span className="font-bold text-primary">{campaign.title}</span> {t("campaign.deleteConfirmDescription2") || "e removerá todos os dados relacionados, incluindo:"}
                                  <ul className="list-disc list-inside mt-2 ml-4 text-red-300">
                                    <li>{overview?.characters?.length || 0} {t("campaign.characters") || "personagem(ns)"}</li>
                                    <li>{overview?.members?.length || 0} {t("campaign.members") || "membro(s)"}</li>
                                    <li>{overview?.items?.length || 0} {t("campaign.items") || "item(ns)"}</li>
                                    <li>{overview?.maps?.length || 0} {t("campaign.maps") || "mapa(s)"}</li>
                                    <li>{t("campaign.allChaptersNotes") || "Todos os capítulos, notas e dados da campanha"}</li>
                                  </ul>
                                  {t("campaign.typeCampaignName") || "Por favor, digite o nome da campanha"} (<span className="font-bold text-primary">{campaign.title}</span>) {t("campaign.toConfirm") || "para confirmar"}.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <Input
                                placeholder={campaign.title}
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
                                    handleDeleteCampaign(campaign.id, campaign.title);
                                  }}
                                  disabled={confirmCampaignTitle !== campaign.title || deletingCampaign === campaign.id}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  {deletingCampaign === campaign.id ? (t("campaign.deleting") || "Excluindo...") : (t("campaign.confirmDelete") || "Confirmar Exclusão")}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                        <Link href={`/campaigns/${campaign.id}`}>
                          <Button variant="ghost" size="icon">
                            <ChevronRight className="w-6 h-6" />
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {/* Campaign Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card className="bg-card/40 border-border/40">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            {t("dashboard.players")}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {overview?.members?.length || 0}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-card/40 border-border/40">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                            <Sword className="w-4 h-4" />
                            {t("dashboard.characters")}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {overview?.characters?.length || 0}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-card/40 border-border/40">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                            <Backpack className="w-4 h-4" />
                            {t("dashboard.items")}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {overview?.items?.length || 0}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-card/40 border-border/40">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                            <MapIcon className="w-4 h-4" />
                            {t("dashboard.maps")}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {overview?.maps?.length || 0}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-6 space-y-2">
                      <div className="flex justify-between text-xs uppercase tracking-widest text-muted-foreground">
                        <span>{t("dashboard.campaignProgress")}</span>
                        <span>{campaign.progress}%</span>
                      </div>
                      <div className="h-2 bg-black/50 rounded-full overflow-hidden border border-white/5">
                        <motion.div
                          className="h-full bg-gradient-to-r from-primary to-secondary"
                          initial={{ width: 0 }}
                          animate={{ width: `${campaign.progress}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </FantasyLayout>
  );
}
