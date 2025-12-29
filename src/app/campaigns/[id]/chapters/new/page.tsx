"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FantasyLayout } from "@/components/layout/FantasyLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n/context";

export default function NewChapterPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = (params?.id as string) || "";
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Buscar informações da campanha e capítulos
      const [campaignRes, chaptersRes] = await Promise.all([
        fetch(`/api/campaigns/${campaignId}/overview`),
        fetch(`/api/campaigns/${campaignId}/chapters`),
      ]);

      let chapterNumber = 1;
      let totalChapters = 10;

      if (campaignRes.ok) {
        const campaignData = await campaignRes.json();
        if (campaignData?.campaign?.totalChapters) {
          totalChapters = campaignData.campaign.totalChapters;
        }
      }

      if (chaptersRes.ok) {
        const chaptersData = await chaptersRes.json();
        if (chaptersData.chapters && chaptersData.chapters.length > 0) {
          const maxChapter = Math.max(
            ...chaptersData.chapters.map((ch: any) => ch.chapterNumber)
          );
          chapterNumber = maxChapter + 1;

          // Verificar se já atingiu o limite
          if (chaptersData.chapters.length >= totalChapters) {
            toast.error(t("newChapter.maxChaptersReached", { total: totalChapters }));
            setLoading(false);
            return;
          }
        }
      }

      const res = await fetch(`/api/campaigns/${campaignId}/chapters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapterNumber,
          title: formData.title,
          description: formData.description || undefined,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || t("newChapter.createError"));
      }

      toast.success(t("newChapter.createSuccess"));
      router.push(`/campaigns/${campaignId}`);
    } catch (error: any) {
      console.error("Error creating chapter:", error);
      toast.error(error.message || t("newChapter.createError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <FantasyLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()} className="gap-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold font-cinzel text-primary">
              {t("newChapter.title")}
            </h1>
            <p className="text-muted-foreground mt-2">
              {t("newChapter.subtitle")}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("newChapter.chapterInfo")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">{t("newChapter.chapterTitle")} *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">{t("newChapter.chapterDescription")}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  placeholder={t("newChapter.chapterDescriptionPlaceholder")}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4 justify-end">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t("newChapter.creating") : t("newChapter.createChapter")}
            </Button>
          </div>
        </form>
      </div>
    </FantasyLayout>
  );
}

