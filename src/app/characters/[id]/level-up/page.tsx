"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { FantasyLayout } from "@/components/layout/FantasyLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dice1, Sparkles, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getSpellSlots, canCastSpells, getSpellcastingLevel } from "@/lib/spell-slots";
import { getFeaturesAtLevel } from "@/lib/class-features";
import { calculateLevel } from "@/lib/xp-levels";
import { SpellSelectionDialog } from "@/components/characters/SpellSelectionDialog";
import { useTranslation } from "@/lib/i18n/context";

const DND_API_BASE = "https://www.dnd5eapi.co";

interface Spell {
  index: string;
  name: string;
  url: string;
  level?: number;
}

interface SpellDetail {
  index: string;
  name: string;
  level: number;
  school?: {
    name: string;
  };
}

export default function LevelUpPage() {
  const params = useParams();
  const router = useRouter();
  const characterId = params.id as string;

  const [character, setCharacter] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hitDiceRoll, setHitDiceRoll] = useState<number | null>(null);
  const [conModifier, setConModifier] = useState(0);
  const [hpGain, setHpGain] = useState(0);
  const [availableSpells, setAvailableSpells] = useState<Spell[]>([]);
  const [selectedSpells, setSelectedSpells] = useState<string[]>([]);
  const [spellsToSelect, setSpellsToSelect] = useState(0);
  const [showSpellDialog, setShowSpellDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const { translateSpell } = useTranslation();

  useEffect(() => {
    fetchCharacterData();
  }, [characterId]);

  const fetchCharacterData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/characters/${characterId}`);
      if (!res.ok) throw new Error("Failed to fetch character");
      
      const data = await res.json();
      const characterData = data.character || data; // Suporta ambos os formatos
      setCharacter(characterData);

      // Verificar se realmente precisa de level up
      // Primeiro verifica o flag, depois verifica se o XP é suficiente
      const currentXP = characterData.experiencePoints || 0;
      const currentLevel = characterData.level || 1;
      const calculatedLevel = calculateLevel(currentXP);
      
      // Precisa de level up se: flag está true OU nível calculado > nível atual
      const needsLevelUp = characterData.needsLevelUp || calculatedLevel > currentLevel;
      
      if (!needsLevelUp) {
        toast.info("Este personagem não precisa de level up no momento");
        router.push(`/characters/${characterId}`);
        return;
      }
      
      // Se o flag não estava true mas o XP é suficiente, atualizar o flag
      if (!characterData.needsLevelUp && calculatedLevel > currentLevel) {
        // Atualizar o personagem para marcar que precisa de level up
        await fetch(`/api/characters/${characterId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ needsLevelUp: true }),
        });
      }

      // Calcular modificador de CON
      const con = characterData.attributes?.constitution || 10;
      const conMod = Math.floor((con - 10) / 2);
      setConModifier(conMod);

      // Verificar se precisa selecionar magias
      if (canCastSpells(characterData.characterClass)) {
        const newLevel = characterData.level;
        const features = getFeaturesAtLevel(characterData.characterClass, newLevel);
        const spellcastingFeature = features.find(f => f.type === "spellcasting");
        
        if (spellcastingFeature || newLevel === 1) {
          // Buscar magias disponíveis para a classe
          await fetchAvailableSpells(characterData.characterClass, newLevel);
        }
      }
    } catch (error: any) {
      console.error("Error fetching character:", error);
      toast.error("Erro ao carregar personagem");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSpells = async (className: string, level: number) => {
    try {
      // Buscar magias da API do D&D 5e filtradas por classe
      const spellsRes = await fetch(`${DND_API_BASE}/api/2014/spells`);
      if (!spellsRes.ok) return;
      
      const spellsData = await spellsRes.json();
      const allSpells: Spell[] = spellsData.results || [];

      // Filtrar magias por nível máximo que o personagem pode aprender
      const maxSpellLevel = getSpellcastingLevel(className, level);
      const filteredSpells: Spell[] = [];

      // Buscar detalhes das magias para filtrar por nível
      const spellPromises = allSpells.slice(0, 100).map(async (spell: Spell) => {
        try {
          const detailRes = await fetch(`${DND_API_BASE}${spell.url}`);
          if (detailRes.ok) {
            const detail: SpellDetail = await detailRes.json();
            if (detail.level <= maxSpellLevel) {
              return { ...spell, level: detail.level };
            }
          }
        } catch (error) {
          console.error(`Error fetching spell ${spell.name}:`, error);
        }
        return null;
      });

      const results = await Promise.all(spellPromises);
      const validSpells = results.filter((s): s is Spell => s !== null && s.level !== undefined);
      
      setAvailableSpells(validSpells);

      // Determinar quantas magias o personagem pode selecionar
      // Por enquanto, vamos usar uma lógica simples: 2 magias por nível para classes full caster
      if (["Bardo", "Clérigo", "Druida", "Feiticeiro", "Mago"].includes(className)) {
        setSpellsToSelect(level === 1 ? 6 : 2); // Nível 1: 6 magias, outros níveis: 2 magias
      } else if (["Paladino", "Patrulheiro"].includes(className)) {
        setSpellsToSelect(level === 2 ? 2 : 1); // Half casters aprendem menos magias
      } else if (className === "Bruxo") {
        setSpellsToSelect(level === 1 ? 2 : 1); // Bruxo aprende menos magias
      }
    } catch (error) {
      console.error("Error fetching spells:", error);
    }
  };

  const rollHitDice = () => {
    if (!character) return;
    
    const hitDiceMatch = character.hitDice?.match(/1d(\d+)/);
    if (!hitDiceMatch) {
      toast.error("Dado de vida inválido");
      return;
    }

    const diceSize = parseInt(hitDiceMatch[1]);
    const roll = Math.floor(Math.random() * diceSize) + 1;
    setHitDiceRoll(roll);
    setHpGain(roll + conModifier);
  };

  const handleCompleteLevelUp = async () => {
    if (!character || !hitDiceRoll) {
      toast.error("Role o dado de vida primeiro");
      return;
    }

    if (canCastSpells(character.characterClass) && selectedSpells.length < spellsToSelect) {
      toast.error(`Selecione ${spellsToSelect} magia(s)`);
      return;
    }

    setSaving(true);
    try {
      const newMaxHp = (character.maxHp || 0) + hpGain;
      const newCurrentHp = Math.min((character.currentHp || 0) + hpGain, newMaxHp);

      // Preparar dados de spellcasting
      const currentSpellcasting = character.spellcasting || {};
      const knownSpells = currentSpellcasting.knownSpells || [];
      const newKnownSpells = [...knownSpells, ...selectedSpells];

      // Calcular slots de magia
      const spellSlots = getSpellSlots(character.characterClass, character.level);
      
      // Obter features do novo nível
      const features = getFeaturesAtLevel(character.characterClass, character.level);
      const currentFeatures = character.features || {};
      const newFeatures = { ...currentFeatures };
      
      features.forEach(feature => {
        if (!newFeatures[feature.level]) {
          newFeatures[feature.level] = [];
        }
        newFeatures[feature.level].push({
          name: feature.name,
          description: feature.description,
          type: feature.type,
        });
      });

      const res = await fetch(`/api/characters/${characterId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maxHp: newMaxHp,
          currentHp: newCurrentHp,
          needsLevelUp: false,
          pendingHitDiceRoll: null,
          spellcasting: {
            ...currentSpellcasting,
            knownSpells: newKnownSpells,
            spellSlots: spellSlots,
          },
          features: newFeatures,
        }),
      });

      if (!res.ok) throw new Error("Failed to complete level up");

      toast.success("Level up concluído com sucesso!");
      router.push(`/characters/${characterId}`);
    } catch (error: any) {
      console.error("Error completing level up:", error);
      toast.error("Erro ao concluir level up");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <FantasyLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </FantasyLayout>
    );
  }

  if (!character) {
    return (
      <FantasyLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Personagem não encontrado</p>
          <Button onClick={() => router.push("/characters")}>Voltar</Button>
        </div>
      </FantasyLayout>
    );
  }

  const spellSlots = getSpellSlots(character.characterClass, character.level);
  const features = getFeaturesAtLevel(character.characterClass, character.level);

  return (
    <FantasyLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold font-cinzel text-primary">
            Level Up: {character.name}
          </h1>
          <p className="text-muted-foreground mt-2">
            Nível {character.level - 1} → Nível {character.level}
          </p>
        </div>

        {/* Rolagem de Dado de Vida */}
        <Card className="bg-card/60 border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dice1 className="h-5 w-5" />
              Rolagem de Dado de Vida
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Dado de Vida da Classe</Label>
              <p className="text-lg font-bold">{character.hitDice}</p>
            </div>
            <div>
              <Label>Modificador de Constituição</Label>
              <p className="text-lg font-bold">
                {conModifier >= 0 ? "+" : ""}{conModifier}
              </p>
            </div>
            {!hitDiceRoll ? (
              <Button onClick={rollHitDice} className="w-full">
                Rolar Dado de Vida
              </Button>
            ) : (
              <div className="space-y-2">
                <div className="bg-primary/10 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Resultado do dado:</p>
                  <p className="text-3xl font-bold">{hitDiceRoll}</p>
                </div>
                <div className="bg-primary/10 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Ganho de PV:</p>
                  <p className="text-2xl font-bold">
                    {hitDiceRoll} + {conModifier} = {hpGain} PV
                  </p>
                </div>
                <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
                  <p className="text-sm text-muted-foreground">Novos PV Máximos:</p>
                  <p className="text-2xl font-bold text-green-400">
                    {(character.maxHp || 0) + hpGain} PV
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features do Nível */}
        {features.length > 0 && (
          <Card className="bg-card/60 border-white/10">
            <CardHeader>
              <CardTitle>Novas Habilidades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {features.map((feature, idx) => (
                  <div key={idx} className="p-3 bg-card/40 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{feature.name}</h3>
                      <Badge variant="outline">{feature.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Slots de Magia */}
        {spellSlots && (
          <Card className="bg-card/60 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Slots de Magia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => {
                  const slots = spellSlots[`level${level}` as keyof typeof spellSlots] || 0;
                  if (slots === 0 && level > 1) return null;
                  return (
                    <div key={level} className="text-center p-2 bg-card/40 rounded">
                      <p className="text-xs text-muted-foreground">{level}º</p>
                      <p className="text-xl font-bold">{slots}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Seleção de Magias */}
        {canCastSpells(character.characterClass) && spellsToSelect > 0 && (
          <Card className="bg-card/60 border-white/10">
            <CardHeader>
              <CardTitle>Selecionar Magias</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Selecione {spellsToSelect} magia(s) para aprender neste nível
              </p>
              {selectedSpells.length > 0 && (
                <div className="space-y-2">
                  <Label>Magias Selecionadas ({selectedSpells.length}/{spellsToSelect})</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedSpells.map((spellIndex) => {
                      const spell = availableSpells.find(s => s.index === spellIndex);
                      return (
                        <Badge key={spellIndex} variant="outline" className="p-2">
                          {spell ? translateSpell(spell.name) : spellIndex}
                          <button
                            onClick={() => setSelectedSpells(prev => prev.filter(s => s !== spellIndex))}
                            className="ml-2 text-red-400 hover:text-red-300"
                          >
                            ×
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
              <Button
                onClick={() => setShowSpellDialog(true)}
                variant="outline"
                className="w-full"
                disabled={selectedSpells.length >= spellsToSelect}
              >
                {selectedSpells.length >= spellsToSelect 
                  ? "Todas as magias selecionadas" 
                  : `Selecionar Magias (${selectedSpells.length}/${spellsToSelect})`}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Botão Finalizar */}
        <Card className="bg-card/60 border-white/10">
          <CardContent className="pt-6">
            <Button
              onClick={handleCompleteLevelUp}
              disabled={!hitDiceRoll || saving || (canCastSpells(character.characterClass) && selectedSpells.length < spellsToSelect)}
              className="w-full"
              size="lg"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Finalizar Level Up
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Dialog de Seleção de Magias */}
        {showSpellDialog && (
          <SpellSelectionDialog
            open={showSpellDialog}
            onOpenChange={setShowSpellDialog}
            availableSpells={availableSpells}
            selectedSpells={selectedSpells}
            onSpellsChange={setSelectedSpells}
            maxSpells={spellsToSelect}
            characterClass={character.characterClass}
            characterLevel={character.level}
          />
        )}
      </div>
    </FantasyLayout>
  );
}

