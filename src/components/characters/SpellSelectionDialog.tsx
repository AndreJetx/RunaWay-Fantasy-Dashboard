"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Sparkles, X } from "lucide-react";
import { getSpellcastingLevel } from "@/lib/spell-slots";
import { useTranslation } from "@/lib/i18n/context";
import { getTranslatedDescription } from "@/lib/data/spell-data";

const DND_API_BASE = "https://www.dnd5eapi.co";

interface Spell {
  index: string;
  name: string;
  url: string;
  level?: number;
  patron?: string[];
}

interface SpellDetail {
  index: string;
  name: string;
  level: number;
  school?: {
    name: string;
  };
  desc?: string[];
  classes?: Array<{
    name: string;
  }>;
}

interface SpellSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableSpells: Spell[];
  selectedSpells: string[];
  onSpellsChange: (spells: string[]) => void;
  maxSpells: number;
  maxCantrips?: number;
  characterClass: string;
  characterLevel: number;
  knownSpells?: string[]; // Magias já conhecidas pelo personagem
  allowSwap?: boolean; // Permite trocar magias conhecidas
  subclass?: string; // Subclasse para regras específicas (Eldritch Knight, Arcane Trickster)
}

export function SpellSelectionDialog({
  open,
  onOpenChange,
  availableSpells,
  selectedSpells,
  onSpellsChange,
  maxSpells,
  maxCantrips = 0,
  characterClass,
  characterLevel,
  knownSpells = [],
  allowSwap = false,
  subclass,
}: SpellSelectionDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [spellDetails, setSpellDetails] = useState<Record<string, SpellDetail>>({});
  const [loadingDetails, setLoadingDetails] = useState<string[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<number | "all">(
    maxCantrips > 0 ? 0 : "all"
  );
  const [spellsToRemove, setSpellsToRemove] = useState<string[]>([]);
  const [homebrewSpells, setHomebrewSpells] = useState<Spell[]>([]);

  const maxSpellLevel = getSpellcastingLevel(characterClass, characterLevel, subclass);
  const { t, translateDnd5e, translateSpell } = useTranslation();

  useEffect(() => {
    if (open) {
      fetchHomebrewSpells();
      if (maxCantrips > 0 && maxSpells > 0) {
        const selectedCantrips = selectedSpells.filter(idx => {
          const spell = availableSpells.find(s => s.index === idx) || homebrewSpells.find(s => s.index === idx);
          return spell?.level === 0;
        });
        setSelectedLevel(selectedCantrips.length < maxCantrips ? 0 : "all");
      } else if (maxCantrips > 0) {
        setSelectedLevel(0);
      } else {
        setSelectedLevel("all");
      }
    }
  }, [open, maxCantrips, maxSpells, selectedSpells, availableSpells]);

  const fetchHomebrewSpells = async () => {
    try {
      const res = await fetch("/api/homebrew?type=spell");
      if (res.ok) {
        const data = await res.json();
        const formattedSpells: Spell[] = data.map((item: any) => ({
          index: `hb_${item.id}`,
          name: item.name,
          url: "",
          level: item.data.level || 0,
          isHomebrew: true,
          details: {
            desc: [item.description],
            school: { name: item.data.school || "Universal" },
            ...item.data
          }
        }));
        setHomebrewSpells(formattedSpells);
      }
    } catch (error) {
      console.error("Error fetching homebrew spells:", error);
    }
  };

  const getLevelName = (level: number) => {
    if (level === 0) return t("spell.cantrips");
    return `${level}º Nível`;
  };

  const allSpells = [...availableSpells, ...homebrewSpells];
  const cantrips = allSpells.filter(s => s.level === 0);
  const spellsLevel1Plus = allSpells.filter(s => s.level !== undefined && s.level > 0);

  const filteredSpells = (selectedLevel === 0 ? cantrips : selectedLevel === "all" ? allSpells : spellsLevel1Plus).filter((spell) => {
    const matchesSearch = spell.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === "all" || spell.level === selectedLevel;
    const matchesMaxLevel = spell.level !== undefined && spell.level <= maxSpellLevel;
    return matchesSearch && matchesLevel && matchesMaxLevel;
  });

  const selectedCantrips = selectedSpells.filter(idx => {
    const spell = allSpells.find(s => s.index === idx);
    return spell?.level === 0;
  });

  const selectedSpellsLevel1Plus = selectedSpells.filter(idx => {
    const spell = allSpells.find(s => s.index === idx);
    return spell?.level !== undefined && spell.level > 0;
  });

  const isSelectingCantrips = maxCantrips > 0 && selectedLevel === 0;
  const currentMax = isSelectingCantrips ? maxCantrips : maxSpells;
  const currentSelected = isSelectingCantrips ? selectedCantrips.length : selectedSpellsLevel1Plus.length;

  const loadSpellDetails = async (spell: Spell & { isHomebrew?: boolean, details?: any }) => {
    if (spell.isHomebrew) {
      setSpellDetails(prev => ({ ...prev, [spell.index]: spell.details }));
      return;
    }

    if (spellDetails[spell.index] || loadingDetails.includes(spell.index)) {
      return;
    }

    setLoadingDetails(prev => [...prev, spell.index]);
    try {
      const res = await fetch(`${DND_API_BASE}${spell.url}`);
      if (res.ok) {
        const detail: SpellDetail = await res.json();
        setSpellDetails(prev => ({ ...prev, [spell.index]: detail }));
      }
    } catch (error) {
      console.error(`Error loading spell ${spell.name}:`, error);
    } finally {
      setLoadingDetails(prev => prev.filter(id => id !== spell.index));
    }
  };

  const toggleSpell = (spellIndex: string) => {
    const spell = allSpells.find(s => s.index === spellIndex);
    const isCantrip = spell?.level === 0;
    const currentMaxForType = isCantrip ? maxCantrips : maxSpells;
    const currentSelectedForType = isCantrip ? selectedCantrips.length : selectedSpellsLevel1Plus.length;
    const isAlreadyKnown = knownSpells.includes(spellIndex);

    if (selectedSpells.includes(spellIndex)) {
      onSpellsChange(selectedSpells.filter(s => s !== spellIndex));
    } else {
      if (isAlreadyKnown && !allowSwap) return;

      if (currentSelectedForType < currentMaxForType) {
        onSpellsChange([...selectedSpells, spellIndex]);
      } else if (allowSwap) {
        const sameTypeSpells = selectedSpells.filter(idx => {
          const s = allSpells.find(sp => sp.index === idx);
          return (s?.level === 0) === isCantrip;
        });
        const otherTypeSpells = selectedSpells.filter(idx => {
          const s = allSpells.find(sp => sp.index === idx);
          return (s?.level === 0) !== isCantrip;
        });

        const newSameType = [...sameTypeSpells];
        newSameType[newSameType.length - 1] = spellIndex;
        onSpellsChange([...otherTypeSpells, ...newSameType]);
      }
    }
  };

  const toggleKnownSpellForRemoval = (spellIndex: string) => {
    if (spellsToRemove.includes(spellIndex)) {
      setSpellsToRemove(spellsToRemove.filter(s => s !== spellIndex));
    } else {
      setSpellsToRemove([...spellsToRemove, spellIndex]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            {t("spell.select")}
          </DialogTitle>
          <DialogDescription>
            {maxCantrips > 0 && maxSpells > 0
              ? `Selecione ${maxCantrips} truque(s) e ${maxSpells} magia(s) de nível 1+`
              : maxCantrips > 0
                ? `Selecione ${maxCantrips} truque(s)`
                : `Selecione ${maxSpells} magia(s)`
            }. {t("spell.level")} {maxSpellLevel}º.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
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
              {maxCantrips > 0 && maxSpells > 0 && (
                <>
                  <option value={0}>{t("spell.cantrips")}</option>
                  <option value="all">{t("spell.allLevels")}</option>
                </>
              )}
              {maxCantrips === 0 && <option value="all">{t("spell.allLevels")}</option>}
              {Array.from({ length: maxSpellLevel + 1 }, (_, i) => i).filter(l => l > 0 || maxCantrips === 0).map((level) => (
                <option key={level} value={level}>
                  {getLevelName(level)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {currentSelected} / {currentMax} {t("spell.selected")}
              {maxCantrips > 0 && maxSpells > 0 && (
                <span className="ml-2">
                  ({selectedCantrips.length}/{maxCantrips} truques, {selectedSpellsLevel1Plus.length}/{maxSpells} magias)
                </span>
              )}
            </p>
            {selectedSpells.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSpellsChange([])}
              >
                {t("common.clear") || "Limpar Seleção"}
              </Button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-2">
            {filteredSpells.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t("common.noResults") || "Nenhuma magia encontrada"}
              </div>
            ) : (
              filteredSpells.map((spell: any) => {
                const isSelected = selectedSpells.includes(spell.index);
                const isAlreadyKnown = knownSpells.includes(spell.index);
                const isMarkedForRemoval = spellsToRemove.includes(spell.index);
                const detail = spellDetails[spell.index];
                const isLoading = loadingDetails.includes(spell.index);

                return (
                  <Card
                    key={spell.index}
                    className={`cursor-pointer transition-colors ${isSelected
                      ? "bg-primary/20 border-primary"
                      : isAlreadyKnown && !isMarkedForRemoval
                        ? "bg-blue-500/10 border-blue-500/30"
                        : isMarkedForRemoval
                          ? "bg-red-500/10 border-red-500/30"
                          : "bg-card/60 border-white/10 hover:border-primary/50"
                      }`}
                    onClick={() => {
                      if (isAlreadyKnown && allowSwap) {
                        toggleKnownSpellForRemoval(spell.index);
                      } else {
                        toggleSpell(spell.index);
                      }
                      if (!detail && !isLoading) {
                        loadSpellDetails(spell);
                      }
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{translateSpell(spell.name)}</h3>
                            {spell.isHomebrew && (
                              <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/50">
                                Homebrew
                              </Badge>
                            )}
                            {spell.level !== undefined && (
                              <Badge variant="outline">
                                {getLevelName(spell.level)}
                              </Badge>
                            )}
                            {spell.patron && spell.patron.map((p: string) => (
                              <Badge key={p} variant="secondary" className="bg-orange-500/20 text-orange-300 border-orange-500/50">
                                {p}
                              </Badge>
                            ))}
                            {detail?.school && (
                              <Badge variant="outline" className="text-xs">
                                {translateDnd5e(detail.school.name)}
                              </Badge>
                            )}
                            {isSelected && (
                              <Badge className="bg-primary">{t("spell.selected")}</Badge>
                            )}
                            {isAlreadyKnown && !isMarkedForRemoval && (
                              <Badge className="bg-blue-500">Conhecida</Badge>
                            )}
                            {isMarkedForRemoval && (
                              <Badge className="bg-red-500">Remover</Badge>
                            )}
                          </div>
                          {detail && detail.desc && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {getTranslatedDescription(spell.name, 'pt-BR') || detail.desc[0]}
                            </p>
                          )}
                        </div>
                        <div className="ml-4">
                          {isSelected ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSpell(spell.index);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          ) : isAlreadyKnown && allowSwap ? (
                            <Button
                              variant={isMarkedForRemoval ? "destructive" : "outline"}
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleKnownSpellForRemoval(spell.index);
                              }}
                            >
                              {isMarkedForRemoval ? "Cancelar" : "Trocar"}
                            </Button>
                          ) : isAlreadyKnown ? (
                            <Badge variant="outline">Conhecida</Badge>
                          ) : (
                            <Button
                              variant={selectedSpells.length >= maxSpells ? "ghost" : "outline"}
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSpell(spell.index);
                                if (!detail && !isLoading) {
                                  loadSpellDetails(spell);
                                }
                              }}
                              disabled={!allowSwap && selectedSpells.length >= maxSpells}
                            >
                              {t("common.select")}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.close")}
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            disabled={
              (maxCantrips > 0 && selectedCantrips.length < maxCantrips) ||
              (maxSpells > 0 && selectedSpellsLevel1Plus.length < maxSpells)
            }
          >
            {t("common.confirm")}
            {maxCantrips > 0 && maxSpells > 0
              ? ` (${selectedCantrips.length}/${maxCantrips} truques, ${selectedSpellsLevel1Plus.length}/${maxSpells} magias)`
              : maxCantrips > 0
                ? ` (${selectedCantrips.length}/${maxCantrips})`
                : ` (${selectedSpellsLevel1Plus.length}/${maxSpells})`
            }
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

