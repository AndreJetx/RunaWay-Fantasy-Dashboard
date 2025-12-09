"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { FantasyLayout } from "@/components/layout/FantasyLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n/context";

export default function NewNpcPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignId = params.id as string;
  const chapterId = searchParams.get("chapterId");
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    race: "",
    characterClass: "",
    level: 1,
    challengeRating: "",
    type: "npc" as "npc" | "enemy" | "boss",
    alignment: "",
    armorClass: 10,
    maxHp: 10,
    currentHp: 10,
    description: "",
    isHostile: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: any = {
        campaignId,
        name: formData.name,
        race: formData.race || undefined,
        characterClass: formData.characterClass || undefined,
        level: formData.level,
        challengeRating: formData.challengeRating || undefined,
        type: formData.type,
        alignment: formData.alignment || undefined,
        armorClass: formData.armorClass,
        maxHp: formData.maxHp,
        currentHp: formData.currentHp,
        description: formData.description || undefined,
        isHostile: formData.isHostile,
      };

      if (chapterId) {
        payload.chapterId = chapterId;
      }

      const res = await fetch("/api/npcs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || t("newNpc.createError"));
      }

      toast.success(t("newNpc.createSuccess"));
      router.push(`/campaigns/${campaignId}`);
    } catch (error: any) {
      console.error("Error creating NPC:", error);
      toast.error(error.message || t("newNpc.createError"));
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    if (formData.type === "enemy") return t("newNpc.createEnemy");
    if (formData.type === "boss") return t("newNpc.createBoss");
    return t("newNpc.createNpc");
  };

  const getSubtitle = () => {
    if (formData.type === "enemy") return t("newNpc.subtitleEnemy");
    if (formData.type === "boss") return t("newNpc.subtitleBoss");
    return t("newNpc.subtitleNpc");
  };

  return (
    <FantasyLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold font-cinzel text-primary">
              {getTitle()}
            </h1>
            <p className="text-muted-foreground mt-2">
              {getSubtitle()}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("newNpc.basicInfo")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">{t("newNpc.npcName")} *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="race">{t("newNpc.npcRace")}</Label>
                  <Input
                    id="race"
                    value={formData.race}
                    onChange={(e) => setFormData({ ...formData, race: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="characterClass">{t("newNpc.npcClass")}</Label>
                  <Input
                    id="characterClass"
                    value={formData.characterClass}
                    onChange={(e) => setFormData({ ...formData, characterClass: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="type">{t("newNpc.npcType")} *</Label>
                <select
                  id="type"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as "npc" | "enemy" | "boss",
                      isHostile: e.target.value !== "npc",
                    })
                  }
                >
                  <option value="npc">{t("newCampaign.npc")}</option>
                  <option value="enemy">{t("newCampaign.enemyTypeEnemy")}</option>
                  <option value="boss">{t("newCampaign.boss")}</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="level">{t("newNpc.npcLevel")}</Label>
                  <Input
                    id="level"
                    type="number"
                    min="1"
                    value={formData.level}
                    onChange={(e) =>
                      setFormData({ ...formData, level: parseInt(e.target.value) || 1 })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="challengeRating">{t("newCampaign.challengeRating")}</Label>
                  <Input
                    id="challengeRating"
                    value={formData.challengeRating}
                    onChange={(e) =>
                      setFormData({ ...formData, challengeRating: e.target.value })
                    }
                    placeholder="1/4, 1/2, 1, 2..."
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="alignment">{t("newNpc.npcAlignment")}</Label>
                <Input
                  id="alignment"
                  value={formData.alignment}
                  onChange={(e) => setFormData({ ...formData, alignment: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("newNpc.stats")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="armorClass">{t("newCampaign.armorClass")}</Label>
                  <Input
                    id="armorClass"
                    type="number"
                    value={formData.armorClass}
                    onChange={(e) =>
                      setFormData({ ...formData, armorClass: parseInt(e.target.value) || 10 })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="maxHp">{t("newCampaign.maxHp")}</Label>
                  <Input
                    id="maxHp"
                    type="number"
                    value={formData.maxHp}
                    onChange={(e) => {
                      const maxHp = parseInt(e.target.value) || 10;
                      setFormData({
                        ...formData,
                        maxHp,
                        currentHp: Math.min(formData.currentHp, maxHp),
                      });
                    }}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="currentHp">{t("newNpc.currentHp")}</Label>
                <Input
                  id="currentHp"
                  type="number"
                  max={formData.maxHp}
                  value={formData.currentHp}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      currentHp: Math.min(
                        parseInt(e.target.value) || 0,
                        formData.maxHp
                      ),
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("newNpc.npcDescription")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                placeholder={t("newNpc.npcDescriptionPlaceholder")}
              />
            </CardContent>
          </Card>

          <div className="flex gap-4 justify-end">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t("newNpc.creating") : t("newNpc.createNpcButton")}
            </Button>
          </div>
        </form>
      </div>
    </FantasyLayout>
  );
}



