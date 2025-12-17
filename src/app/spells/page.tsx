"use client";

import { useState, useEffect } from "react";
import { FantasyLayout } from "@/components/layout/FantasyLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Sparkles, Loader2, BookOpen } from "lucide-react";
import { getSpellIcon } from "@/lib/icon-mapper";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "@/lib/i18n/context";
import { getSpellDescription } from "@/lib/i18n/spell-descriptions";

interface Spell {
  index: string;
  name: string;
  url: string;
}

interface SpellDetail {
  index: string;
  name: string;
  desc?: string[];
  higher_level?: string[];
  range?: string;
  components?: string[];
  material?: string;
  ritual?: boolean;
  duration?: string;
  concentration?: boolean;
  casting_time?: string;
  level?: number;
  attack_type?: string;
  damage?: {
    damage_type?: {
      index: string;
      name: string;
    };
    damage_at_slot_level?: Record<string, string>;
    damage_at_character_level?: Record<string, string>;
  };
  school?: {
    index: string;
    name: string;
  };
  classes?: Array<{
    index: string;
    name: string;
    url: string;
  }>;
  subclasses?: Array<{
    index: string;
    name: string;
    url: string;
  }>;
  area_of_effect?: {
    type: string;
    size: number;
  };
  heal_at_slot_level?: Record<string, string>;
  dc?: {
    dc_type: {
      index: string;
      name: string;
    };
    dc_success: string;
  };
}

const DND_API_BASE = "https://www.dnd5eapi.co";

export default function SpellsPage() {
  const [spells, setSpells] = useState<Spell[]>([]);
  const [spellsByLevel, setSpellsByLevel] = useState<Record<number, Spell[]>>({});
  const [selectedSpell, setSelectedSpell] = useState<SpellDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<number | "all">("all");
  const { t, translateDnd5e, translateSpell, locale } = useTranslation();

  useEffect(() => {
    fetchSpellsData();
  }, []);

  const fetchSpellsData = async () => {
    try {
      setLoading(true);

      // Buscar todas as magias
      const spellsRes = await fetch(`${DND_API_BASE}/api/2014/spells`);
      if (!spellsRes.ok) throw new Error("Failed to fetch spells");
      const spellsData = await spellsRes.json();
      const allSpells: Spell[] = spellsData.results || [];
      setSpells(allSpells);

      // Organizar magias por nível
      const organized: Record<number, Spell[]> = {};
      
      // Buscar detalhes de cada magia para descobrir o nível
      const spellPromises = allSpells.map(async (spell: Spell) => {
        try {
          const detailRes = await fetch(`${DND_API_BASE}${spell.url}`);
          if (detailRes.ok) {
            const detail: SpellDetail = await detailRes.json();
            return { spell, level: detail.level ?? 0 };
          }
        } catch (error) {
          console.error(`Error fetching ${spell.name}:`, error);
        }
        return { spell, level: 0 };
      });

      const results = await Promise.all(spellPromises);
      
      results.forEach(({ spell, level }) => {
        if (!organized[level]) {
          organized[level] = [];
        }
        organized[level].push(spell);
      });

      // Ordenar magias dentro de cada nível
      Object.keys(organized).forEach((level) => {
        organized[parseInt(level)].sort((a, b) => a.name.localeCompare(b.name));
      });

      setSpellsByLevel(organized);
    } catch (error) {
      console.error("Error fetching spells data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSpellDetails = async (url: string) => {
    try {
      const res = await fetch(`${DND_API_BASE}${url}`);
      if (res.ok) {
        const detail: SpellDetail = await res.json();
        setSelectedSpell(detail);
      }
    } catch (error) {
      console.error("Error fetching spell details:", error);
    }
  };

  const filteredSpells = selectedLevel === "all"
    ? Object.values(spellsByLevel).flat()
    : spellsByLevel[selectedLevel] || [];

  const searchFiltered = filteredSpells.filter(spell =>
    spell.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getLevelName = (level: number) => {
    if (level === 0) return t("spell.cantrips");
    return `${level}${t("spell.level")}`;
  };

  return (
    <FantasyLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-cinzel text-primary">{t("spell.catalog") || "Catálogo de Magias"}</h1>
            <p className="text-muted-foreground mt-2">
              {t("spell.exploreAll") || "Explore todas as magias do D&D 5e"}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <Card className="bg-card/60 border-white/10">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t("spell.search")}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value === "all" ? "all" : parseInt(e.target.value))}
                    className="h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="all">{t("spell.allLevels")}</option>
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => (
                      <option key={level} value={level}>
                        {getLevelName(level)}
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            {selectedLevel === "all" ? (
              <Tabs defaultValue="0" className="space-y-4">
                <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => (
                    <TabsTrigger key={level} value={level.toString()}>
                      {level === 0 ? t("spell.cantrips") : `${level}${t("spell.level")}`}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => {
                  const levelSpells = spellsByLevel[level] || [];
                  const filtered = levelSpells.filter(spell =>
                    spell.name.toLowerCase().includes(searchTerm.toLowerCase())
                  );
                  
                  return (
                    <TabsContent key={level} value={level.toString()} className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <h2 className="text-xl font-bold font-cinzel">
                          {getLevelName(level)} ({filtered.length} {t("spell.spells") || "magias"})
                        </h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map((spell) => (
                          <Card
                            key={spell.index}
                            className="bg-card/60 border-white/10 hover:border-primary/50 transition-colors cursor-pointer"
                            onClick={() => fetchSpellDetails(spell.url)}
                          >
                            <CardHeader>
                              <div className="flex items-center gap-2">
                                {(() => {
                                  const SpellIcon = getSpellIcon(spell.name);
                                  return <SpellIcon className="w-5 h-5 text-primary flex-shrink-0" />;
                                })()}
                                <CardTitle className="text-lg">{translateSpell(spell.name)}</CardTitle>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <Badge variant="outline" className="mb-2">
                                {getLevelName(level)}
                              </Badge>
                              <Button variant="outline" size="sm" className="w-full mt-2">
                                {t("spell.viewDetails") || "Ver Detalhes"}
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      {filtered.length === 0 && (
                        <Card className="bg-card/40 border-border/40 p-8 text-center">
                          <p className="text-muted-foreground">
                            {t("spell.noSpellsInLevel") || "Nenhuma magia encontrada neste nível"}
                          </p>
                        </Card>
                      )}
                    </TabsContent>
                  );
                })}
              </Tabs>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold font-cinzel">
                    {getLevelName(selectedLevel)} ({searchFiltered.length} {t("spell.spells") || "magias"})
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchFiltered.map((spell) => (
                    <Card
                      key={spell.index}
                      className="bg-card/60 border-white/10 hover:border-primary/50 transition-colors cursor-pointer"
                      onClick={() => fetchSpellDetails(spell.url)}
                    >
                      <CardHeader>
                        <CardTitle className="text-lg">{translateSpell(spell.name)}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Badge variant="outline" className="mb-2">
                          {getLevelName(selectedLevel)}
                        </Badge>
                        <Button variant="outline" size="sm" className="w-full mt-2">
                          {t("spell.viewDetails") || "Ver Detalhes"}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {searchFiltered.length === 0 && (
                  <Card className="bg-card/40 border-border/40 p-8 text-center">
                    <p className="text-muted-foreground">
                      {t("common.noResults")}
                    </p>
                  </Card>
                )}
              </div>
            )}
          </>
        )}

        {/* Dialog de Detalhes da Magia */}
        <Dialog open={!!selectedSpell} onOpenChange={() => setSelectedSpell(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {selectedSpell && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-cinzel flex items-center gap-2">
                    <BookOpen className="h-6 w-6" />
                    {translateSpell(selectedSpell.name)}
                  </DialogTitle>
                  <DialogDescription className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline">
                      {getLevelName(selectedSpell.level ?? 0)}
                    </Badge>
                    {selectedSpell.school && (
                      <Badge variant="outline">
                        {translateDnd5e(selectedSpell.school.name)}
                      </Badge>
                    )}
                    {selectedSpell.ritual && (
                      <Badge variant="outline">{t("spell.ritual") || "Ritual"}</Badge>
                    )}
                    {selectedSpell.concentration && (
                      <Badge variant="outline">{translateDnd5e("Concentration")}</Badge>
                    )}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {selectedSpell.desc && selectedSpell.desc.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">{t("common.description")}</h3>
                      {(() => {
                        const translatedDesc = getSpellDescription(selectedSpell.name, locale);
                        if (translatedDesc) {
                          return (
                            <div className="space-y-2">
                              {translatedDesc.map((desc, idx) => (
                                <p key={idx} className="text-sm text-muted-foreground">{desc}</p>
                              ))}
                            </div>
                          );
                        }
                        return (
                          <>
                            <p className="text-xs text-muted-foreground/70 italic mb-2">
                              {t("spell.descriptionInEnglish")}
                            </p>
                            <div className="space-y-2">
                              {selectedSpell.desc.map((desc, idx) => (
                                <p key={idx} className="text-sm text-muted-foreground">{desc}</p>
                              ))}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    {selectedSpell.casting_time && (
                      <div>
                        <h3 className="font-semibold mb-2">{t("spell.castingTime")}</h3>
                        <p className="text-sm text-muted-foreground">{translateDnd5e(selectedSpell.casting_time)}</p>
                      </div>
                    )}
                    {selectedSpell.range && (
                      <div>
                        <h3 className="font-semibold mb-2">{translateDnd5e("Range")}</h3>
                        <p className="text-sm text-muted-foreground">{translateDnd5e(selectedSpell.range)}</p>
                      </div>
                    )}
                    {selectedSpell.components && (
                      <div>
                        <h3 className="font-semibold mb-2">{translateDnd5e("Components")}</h3>
                        <p className="text-sm text-muted-foreground">
                          {selectedSpell.components.map(c => translateDnd5e(c)).join(", ")}
                          {selectedSpell.material && ` (${selectedSpell.material})`}
                        </p>
                      </div>
                    )}
                    {selectedSpell.duration && (
                      <div>
                        <h3 className="font-semibold mb-2">{translateDnd5e("Duration")}</h3>
                        <p className="text-sm text-muted-foreground">{translateDnd5e(selectedSpell.duration)}</p>
                      </div>
                    )}
                  </div>
                  {selectedSpell.higher_level && selectedSpell.higher_level.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">{t("spell.atHigherLevels") || "Em Níveis Superiores"}</h3>
                      <div className="space-y-2">
                        {selectedSpell.higher_level.map((desc, idx) => (
                          <p key={idx} className="text-sm text-muted-foreground">{desc}</p>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedSpell.damage && (
                    <div>
                      <h3 className="font-semibold mb-2">{translateDnd5e("Damage")}</h3>
                      {selectedSpell.damage.damage_type && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {t("spell.type") || "Tipo"}: {translateDnd5e(selectedSpell.damage.damage_type.name)}
                        </p>
                      )}
                      {selectedSpell.damage.damage_at_slot_level && (
                        <div className="space-y-1">
                          {Object.entries(selectedSpell.damage.damage_at_slot_level).map(([level, damage]) => (
                            <p key={level} className="text-sm text-muted-foreground">
                              {t("common.level")} {level}: {damage}
                            </p>
                          ))}
                        </div>
                      )}
                      {selectedSpell.damage.damage_at_character_level && (
                        <div className="space-y-1">
                          {Object.entries(selectedSpell.damage.damage_at_character_level).map(([level, damage]) => (
                            <p key={level} className="text-sm text-muted-foreground">
                              {t("common.level")} {level}: {damage}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {selectedSpell.dc && (
                    <div>
                      <h3 className="font-semibold mb-2">{t("spell.savingThrow") || "Teste de Resistência"}</h3>
                      <p className="text-sm text-muted-foreground">
                        {translateDnd5e(selectedSpell.dc.dc_type.name)}: {selectedSpell.dc.dc_success}
                      </p>
                    </div>
                  )}
                  {selectedSpell.area_of_effect && (
                    <div>
                      <h3 className="font-semibold mb-2">{t("spell.areaOfEffect") || "Área de Efeito"}</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedSpell.area_of_effect.type} ({selectedSpell.area_of_effect.size} {translateDnd5e("ft")})
                      </p>
                    </div>
                  )}
                  {selectedSpell.classes && selectedSpell.classes.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">{t("spell.classes") || "Classes"}</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedSpell.classes.map((cls) => (
                          <Badge key={cls.index} variant="outline">
                            {translateDnd5e(cls.name)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedSpell.subclasses && selectedSpell.subclasses.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">{t("spell.subclasses") || "Subclasses"}</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedSpell.subclasses.map((subcls) => (
                          <Badge key={subcls.index} variant="outline">
                            {translateDnd5e(subcls.name)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </FantasyLayout>
  );
}

