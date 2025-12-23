"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FantasyLayout } from "@/components/layout/FantasyLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useCampaign } from "@/contexts/CampaignContext";
import { useTranslation } from "@/lib/i18n/context";

interface Chapter {
  chapterNumber: number;
  title: string;
  description?: string;
}

interface Enemy {
  name: string;
  race?: string;
  characterClass?: string;
  level?: number;
  challengeRating?: string;
  type: "npc" | "enemy" | "boss";
  alignment?: string;
  armorClass?: number;
  maxHp?: number;
  attributes?: Record<string, number>;
  attacks?: any[];
  abilities?: any[];
  description?: string;
  isHostile?: boolean;
}

export default function NewCampaignPage() {
  const router = useRouter();
  const { refreshCampaigns } = useCampaign();
  const [loading, setLoading] = useState(false);
  const [isDM, setIsDM] = useState<boolean | null>(null);
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    system: "dnd5e",
    image: "",
    totalChapters: 10,
    attributeSystem: "fixed" as "fixed" | "point_buy" | "roll_4d6",
    initialMoney: "0",
    initialMapTitle: "",
    initialMapUrl: "",
    initialMapNotes: "",
    maxPlayers: 6,
    visibility: "private" as "public" | "private",
  });
  const [chapters, setChapters] = useState<Chapter[]>([
    { chapterNumber: 1, title: `${t("newCampaign.chapter")} 1`, description: "" },
  ]);
  const [chapter1Enemies, setChapter1Enemies] = useState<Enemy[]>([]);

  useEffect(() => {
    const checkRole = async () => {
      try {
        const res = await fetch("/api/users/me");
        if (res.ok) {
          const data = await res.json();
          setIsDM(data.role === "dm");
          if (data.role !== "dm") {
            toast.error(t("newCampaign.onlyDM"));
            router.push("/campaigns");
          }
        } else {
          setIsDM(false);
          router.push("/campaigns");
        }
      } catch (error) {
        console.error("Error checking role:", error);
        setIsDM(false);
        router.push("/campaigns");
      }
    };
    checkRole();
  }, [router, t]);

  if (isDM === null) {
    return (
      <FantasyLayout>
        <div className="text-center py-12 text-muted-foreground">
          {t("newCampaign.checkingPermissions")}
        </div>
      </FantasyLayout>
    );
  }

  if (!isDM) {
    return null; // Será redirecionado
  }

  const addChapter = () => {
    const nextNumber = chapters.length + 1;
    setChapters([...chapters, { chapterNumber: nextNumber, title: `${t("newCampaign.chapter")} ${nextNumber}`, description: "" }]);
  };

  const removeChapter = (index: number) => {
    if (chapters.length === 1) {
      toast.error(t("newCampaign.mustHaveOneChapter"));
      return;
    }
    const newChapters = chapters.filter((_, i) => i !== index);
    // Renumber chapters
    newChapters.forEach((ch, i) => {
      ch.chapterNumber = i + 1;
    });
    setChapters(newChapters);
  };

  const updateChapter = (index: number, field: keyof Chapter, value: string | number) => {
    const newChapters = [...chapters];
    newChapters[index] = { ...newChapters[index], [field]: value };
    setChapters(newChapters);
  };

  const addEnemy = () => {
    setChapter1Enemies([
      ...chapter1Enemies,
      {
        name: "",
        type: "enemy",
        armorClass: 10,
        maxHp: 10,
        attributes: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
        isHostile: true,
      },
    ]);
  };

  const removeEnemy = (index: number) => {
    setChapter1Enemies(chapter1Enemies.filter((_, i) => i !== index));
  };

  const updateEnemy = (index: number, field: keyof Enemy, value: any) => {
    const newEnemies = [...chapter1Enemies];
    newEnemies[index] = { ...newEnemies[index], [field]: value };
    setChapter1Enemies(newEnemies);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate
      if (!formData.title.trim()) {
        toast.error(t("newCampaign.campaignTitleRequired"));
        setLoading(false);
        return;
      }

      if (!formData.initialMapTitle.trim() || !formData.initialMapUrl.trim()) {
        toast.error(t("newCampaign.mapTitleRequired"));
        setLoading(false);
        return;
      }

      const payload = {
        title: formData.title,
        description: formData.description || undefined,
        system: formData.system,
        image: formData.image || undefined,
        totalChapters: formData.totalChapters,
        attributeSystem: formData.attributeSystem,
        initialMoney: formData.initialMoney,
        initialMap: {
          title: formData.initialMapTitle,
          imageUrl: formData.initialMapUrl,
          notes: formData.initialMapNotes || undefined,
        },
        maxPlayers: formData.maxPlayers,
        visibility: formData.visibility,
        chapters: chapters.map((ch) => ({
          chapterNumber: ch.chapterNumber,
          title: ch.title,
          description: ch.description || undefined,
        })),
        chapter1Enemies: chapter1Enemies.length > 0 ? chapter1Enemies.map((e) => ({
          name: e.name,
          race: e.race || undefined,
          characterClass: e.characterClass || undefined,
          level: e.level || undefined,
          challengeRating: e.challengeRating || undefined,
          type: e.type,
          alignment: e.alignment || undefined,
          armorClass: e.armorClass || undefined,
          maxHp: e.maxHp || undefined,
          attributes: e.attributes || undefined,
          attacks: e.attacks || undefined,
          abilities: e.abilities || undefined,
          description: e.description || undefined,
          isHostile: e.isHostile ?? true,
        })) : undefined,
      };

      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        console.error("Erro da API:", error);
        // Mostrar mais detalhes do erro em desenvolvimento
        const errorMessage = error.error
          ? `${error.message}\n\nDetalhes: ${error.error}`
          : error.message || "Erro ao criar campanha";
        throw new Error(errorMessage);
      }

      const data = await res.json();
      // Atualizar a lista de campanhas no contexto
      await refreshCampaigns();

      // Mostrar toast de sucesso
      toast.success(t("newCampaign.createSuccess"));

      // Aguardar um pouco para garantir que o toast seja exibido
      // e evitar erro de removeChild do React
      await new Promise(resolve => setTimeout(resolve, 500));

      router.push(`/campaigns`);
    } catch (error: any) {
      console.error("Error creating campaign:", error);
      // Mostrar erro detalhado no console
      if (error.message) {
        console.error("Mensagem de erro:", error.message);
      }
      // Mostrar toast com mensagem mais detalhada
      const errorMessage = error.message || t("newCampaign.createError");
      toast.error(errorMessage, {
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <FantasyLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-cinzel text-primary">
            {t("newCampaign.title")}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t("newCampaign.subtitle")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle>{t("newCampaign.basicInfo")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">{t("newCampaign.campaignTitle")} *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">{t("common.description")}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="image">{t("newCampaign.imageUrl")}</Label>
                <Input
                  id="image"
                  type="url"
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  placeholder="https://..."
                />
                <p className="text-xs text-blue-400/80 mt-1 flex items-center gap-1">
                  <span className="font-semibold">💡 Dica:</span>
                  <span>Tamanho ideal: 1920x1080px ou 1600x900px (formato horizontal), formato PNG ou JPG, máximo 2MB</span>
                </p>
              </div>
              <div>
                <Label htmlFor="totalChapters">{t("newCampaign.totalChapters")}</Label>
                <Input
                  id="totalChapters"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.totalChapters}
                  onChange={(e) =>
                    setFormData({ ...formData, totalChapters: parseInt(e.target.value) || 10 })
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {t("newCampaign.totalChaptersDesc")}
                </p>
              </div>
              <div>
                <Label htmlFor="attributeSystem">{t("newCampaign.attributeSystem")} *</Label>
                <select
                  id="attributeSystem"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  value={formData.attributeSystem}
                  onChange={(e) =>
                    setFormData({ ...formData, attributeSystem: e.target.value as "fixed" | "point_buy" | "roll_4d6" })
                  }
                  required
                >
                  <option value="fixed">{t("newCampaign.fixed")}</option>
                  <option value="point_buy">{t("newCampaign.pointBuy")}</option>
                  <option value="roll_4d6">{t("newCampaign.roll4d6")}</option>
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("newCampaign.attributeSystemDesc")}
                </p>
              </div>
              <div>
                <Label htmlFor="initialMoney">{t("newCampaign.initialMoney")} *</Label>
                <Input
                  id="initialMoney"
                  type="text"
                  value={formData.initialMoney}
                  onChange={(e) =>
                    setFormData({ ...formData, initialMoney: e.target.value })
                  }
                  placeholder="Ex: 100 ou 2d4x10"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {t("newCampaign.initialMoneyDesc")}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <Label htmlFor="maxPlayers">{t("newCampaign.maxPlayers")} *</Label>
                  <Input
                    id="maxPlayers"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.maxPlayers}
                    onChange={(e) =>
                      setFormData({ ...formData, maxPlayers: parseInt(e.target.value) || 6 })
                    }
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("newCampaign.maxPlayersDesc")}
                  </p>
                </div>
                <div>
                  <Label htmlFor="visibility">{t("newCampaign.visibility")} *</Label>
                  <select
                    id="visibility"
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={formData.visibility}
                    onChange={(e) =>
                      setFormData({ ...formData, visibility: e.target.value as "public" | "private" })
                    }
                    required
                  >
                    <option value="private">{t("newCampaign.private")}</option>
                    <option value="public">{t("newCampaign.public")}</option>
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("newCampaign.visibilityDesc")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mapa Inicial */}
          <Card>
            <CardHeader>
              <CardTitle>{t("newCampaign.initialMap")} *</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="initialMapTitle">{t("newCampaign.mapTitle")} *</Label>
                <Input
                  id="initialMapTitle"
                  value={formData.initialMapTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, initialMapTitle: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="initialMapUrl">{t("newCampaign.mapUrl")} *</Label>
                <Input
                  id="initialMapUrl"
                  type="url"
                  value={formData.initialMapUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, initialMapUrl: e.target.value })
                  }
                  placeholder="https://..."
                  required
                />
              </div>
              <div>
                <Label htmlFor="initialMapNotes">{t("newCampaign.mapNotes")}</Label>
                <Textarea
                  id="initialMapNotes"
                  value={formData.initialMapNotes}
                  onChange={(e) =>
                    setFormData({ ...formData, initialMapNotes: e.target.value })
                  }
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Capítulos */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t("newCampaign.chapters")} *</CardTitle>
              <Button type="button" onClick={addChapter} size="sm">
                <Plus className="h-4 w-4 mr-2" /> {t("newCampaign.addChapter")}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {chapters.map((chapter, index) => (
                <Card key={index} className="bg-card/50">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{t("newCampaign.chapter")} {chapter.chapterNumber}</h3>
                      {chapters.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeChapter(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div>
                      <Label>{t("newCampaign.chapterTitle")} *</Label>
                      <Input
                        value={chapter.title}
                        onChange={(e) =>
                          updateChapter(index, "title", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label>{t("newCampaign.chapterDescription")}</Label>
                      <Textarea
                        value={chapter.description || ""}
                        onChange={(e) =>
                          updateChapter(index, "description", e.target.value)
                        }
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Inimigos do Capítulo 1 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t("newCampaign.chapter1Enemies")}</CardTitle>
              <Button type="button" onClick={addEnemy} size="sm">
                <Plus className="h-4 w-4 mr-2" /> {t("newCampaign.addEnemy")}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {chapter1Enemies.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {t("newCampaign.noEnemies")}
                </p>
              ) : (
                chapter1Enemies.map((enemy, index) => (
                  <Card key={index} className="bg-card/50">
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{t("newCampaign.enemy")} {index + 1}</h3>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeEnemy(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>{t("newCampaign.enemyName")} *</Label>
                          <Input
                            value={enemy.name}
                            onChange={(e) =>
                              updateEnemy(index, "name", e.target.value)
                            }
                            required
                          />
                        </div>
                        <div>
                          <Label>{t("newCampaign.enemyRace")}</Label>
                          <Input
                            value={enemy.race || ""}
                            onChange={(e) =>
                              updateEnemy(index, "race", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <Label>{t("newCampaign.enemyClass")}</Label>
                          <Input
                            value={enemy.characterClass || ""}
                            onChange={(e) =>
                              updateEnemy(index, "characterClass", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <Label>{t("newCampaign.enemyLevel")}</Label>
                          <Input
                            type="number"
                            min="1"
                            value={enemy.level || ""}
                            onChange={(e) =>
                              updateEnemy(index, "level", parseInt(e.target.value) || undefined)
                            }
                          />
                        </div>
                        <div>
                          <Label>{t("newCampaign.challengeRating")}</Label>
                          <Input
                            value={enemy.challengeRating || ""}
                            onChange={(e) =>
                              updateEnemy(index, "challengeRating", e.target.value)
                            }
                            placeholder="1/4, 1/2, 1, 2..."
                          />
                        </div>
                        <div>
                          <Label>{t("newCampaign.enemyType")}</Label>
                          <select
                            className="w-full h-10 px-3 rounded-md border border-input bg-background"
                            value={enemy.type}
                            onChange={(e) =>
                              updateEnemy(index, "type", e.target.value as "npc" | "enemy" | "boss")
                            }
                          >
                            <option value="npc">{t("newCampaign.npc")}</option>
                            <option value="enemy">{t("newCampaign.enemyTypeEnemy")}</option>
                            <option value="boss">{t("newCampaign.boss")}</option>
                          </select>
                        </div>
                        <div>
                          <Label>{t("newCampaign.armorClass")}</Label>
                          <Input
                            type="number"
                            value={enemy.armorClass || 10}
                            onChange={(e) =>
                              updateEnemy(index, "armorClass", parseInt(e.target.value) || 10)
                            }
                          />
                        </div>
                        <div>
                          <Label>{t("newCampaign.maxHp")}</Label>
                          <Input
                            type="number"
                            value={enemy.maxHp || 10}
                            onChange={(e) =>
                              updateEnemy(index, "maxHp", parseInt(e.target.value) || 10)
                            }
                          />
                        </div>
                      </div>
                      <div>
                        <Label>{t("newCampaign.enemyDescription")}</Label>
                        <Textarea
                          value={enemy.description || ""}
                          onChange={(e) =>
                            updateEnemy(index, "description", e.target.value)
                          }
                          rows={2}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t("newCampaign.creating") : t("newCampaign.createCampaign")}
            </Button>
          </div>
        </form>
      </div>
    </FantasyLayout>
  );
}

