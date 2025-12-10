"use client";

import { useState, useEffect, useCallback } from "react";
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
import { getSpellLearningInfo } from "@/lib/spell-learning-rules";
import { SpellSelectionDialog } from "@/components/characters/SpellSelectionDialog";
import { SubclassSelector } from "@/components/characters/SubclassSelector";
import { DragonTypeSelector } from "@/components/characters/DragonTypeSelector";
import { getSubclassLevel, needsSubclassSelection } from "@/lib/subclasses";
import { applySubclassBenefits } from "@/lib/benefit-application";
import type { Subclass } from "@/lib/subclasses";
import type { DragonType } from "@/lib/dragon-types";
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
  const characterId = (params?.id as string) || "";

  const [character, setCharacter] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hitDiceRoll, setHitDiceRoll] = useState<number | null>(null);
  const [conModifier, setConModifier] = useState(0);
  const [hpGain, setHpGain] = useState(0);
  const [availableSpells, setAvailableSpells] = useState<Spell[]>([]);
  const [selectedSpells, setSelectedSpells] = useState<string[]>([]);
  const [selectedCantrips, setSelectedCantrips] = useState<string[]>([]);
  const [spellsToSelect, setSpellsToSelect] = useState(0);
  const [cantripsToSelect, setCantripsToSelect] = useState(0);
  const [showSpellDialog, setShowSpellDialog] = useState(false);
  const [showSubclassSelector, setShowSubclassSelector] = useState(false);
  const [showDragonTypeSelector, setShowDragonTypeSelector] = useState(false);
  const [pendingSubclass, setPendingSubclass] = useState<Subclass | null>(null);
  const [pendingDragonType, setPendingDragonType] = useState<DragonType | null>(null);
  const [showPactSelector, setShowPactSelector] = useState(false);
  const [pendingPact, setPendingPact] = useState<Subclass | null>(null);
  const [saving, setSaving] = useState(false);
  const { translateSpell } = useTranslation();

  const fetchCharacterData = useCallback(async () => {
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

      // Definir o nível alvo como o próximo nível
      const targetLevel = currentLevel + 1;

      // Verificar se precisa selecionar magias
      if (canCastSpells(characterData.characterClass)) {
        const previousLevel = currentLevel;

        // Usar a nova biblioteca de regras de aprendizado
        const learningInfo = getSpellLearningInfo(
          characterData.characterClass,
          targetLevel,
          previousLevel
        );

        setCantripsToSelect(learningInfo.newCantrips);
        setSpellsToSelect(learningInfo.newSpells);

        if (learningInfo.newSpells > 0 || learningInfo.newCantrips > 0) {
          // Buscar magias disponíveis para a classe
          await fetchAvailableSpells(characterData.characterClass, targetLevel);
        }
      }
    } catch (error: any) {
      console.error("Error fetching character:", error);
      toast.error("Erro ao carregar personagem");
    } finally {
      setLoading(false);
    }
  }, [characterId, router]);

  useEffect(() => {
    fetchCharacterData();
  }, [fetchCharacterData]);

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
      const validSpells = results.filter((s): s is Spell & { level: number } => s !== null && s.level !== undefined);

      setAvailableSpells(validSpells);
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

    // Validar seleção de magias e truques
    if (canCastSpells(character.characterClass)) {
      if (cantripsToSelect > 0 && selectedCantrips.length < cantripsToSelect) {
        toast.error(`Selecione ${cantripsToSelect} truque(s)`);
        return;
      }
      if (spellsToSelect > 0 && selectedSpells.length < spellsToSelect) {
        toast.error(`Selecione ${spellsToSelect} magia(s)`);
        return;
      }
    }

    // Validar seleção de subclasse
    const targetLevel = character.level + 1;
    const subclassLevel = getSubclassLevel(character.characterClass);
    const needsSubclass = !character.subclass && targetLevel >= subclassLevel;
    if (needsSubclass && !pendingSubclass) {
      toast.error(`Selecione sua ${character.characterClass === 'Bruxo' ? 'Patrono' : 'Subclasse'}`);
      return;
    }

    // Validar seleção de dragão
    const isDraconic = (character.subclass === "Linhagem Dracônica" || pendingSubclass?.name === "Linhagem Dracônica");
    if (isDraconic && !character.dragonType && !pendingDragonType) {
      toast.error("Selecione seu Dragão Ancestral");
      return;
    }

    // Validar seleção de pacto
    const needsPact = character.characterClass === 'Bruxo' && targetLevel >= 3 && !character.pact && !pendingPact;
    if (needsPact) {
      toast.error("Selecione seu Pacto");
      return;
    }

    setSaving(true);
    try {
      const newMaxHp = (character.maxHp || 0) + hpGain;
      const newCurrentHp = Math.min((character.currentHp || 0) + hpGain, newMaxHp);

      // Preparar dados de spellcasting
      const currentSpellcasting = character.spellcasting || {};
      const knownSpells = currentSpellcasting.knownSpells || [];

      // Adicionar novas magias e truques às conhecidas
      const newKnownSpells = [...knownSpells, ...selectedSpells, ...selectedCantrips];

      // Calcular slots de magia
      const spellSlots = getSpellSlots(character.characterClass, targetLevel);

      // Obter features do novo nível
      const features = getFeaturesAtLevel(character.characterClass, targetLevel);
      const currentFeatures = character.features || {};
      const newFeatures = { ...currentFeatures };

      // Adicionar features de classe ao nível
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

      // Verificar se ainda precisa de level up após este
      const currentXP = character.experiencePoints || 0;
      const calculatedLevel = calculateLevel(currentXP);
      const stillNeedsLevelUp = calculatedLevel > targetLevel;

      // Preparar objeto base para atualização
      let updateBody: any = {
        level: targetLevel, // Atualizar para o novo nível
        maxHp: newMaxHp,
        currentHp: newCurrentHp,
        needsLevelUp: stillNeedsLevelUp, // Manter true se ainda tiver níveis a subir
        pendingHitDiceRoll: null,
        spellcasting: {
          ...currentSpellcasting,
          knownSpells: newKnownSpells,
          spellSlots: spellSlots,
        },
        features: newFeatures,
      };

      // Aplicar Subclasse
      if (pendingSubclass) {
        updateBody.subclass = pendingSubclass.name;

        // Aplicar benefícios da subclasse para obter skills, proficiências, etc.
        // Criamos um clone do personagem para aplicar os benefícios
        let tempChar = { ...character, subclass: pendingSubclass.name };
        tempChar = applySubclassBenefits(tempChar, pendingSubclass);

        // Atualizar campos no body
        if (tempChar.skills) updateBody.skills = tempChar.skills;
        if (tempChar.proficiencies) updateBody.proficiencies = tempChar.proficiencies;
        if (tempChar.languages) updateBody.languages = tempChar.languages;
        if (tempChar.resistances) updateBody.resistances = tempChar.resistances;

        // Adicionar features da subclasse ao newFeatures
        // Filtrar features até o nível alvo
        const subclassFeatures = pendingSubclass.benefits
          .filter(b => b.level <= targetLevel && b.type === 'feature');

        subclassFeatures.forEach(b => {
          if (!newFeatures[character.level]) {
            newFeatures[character.level] = [];
          }
          // Evitar duplicatas
          const featureName = typeof b.value === 'string' ? b.value : b.value[0];
          // Verificar se já existe (simplificado)
          const exists = newFeatures[character.level].some((f: any) => f.name === featureName);

          if (!exists) {
            newFeatures[character.level].push({
              name: featureName,
              description: b.description || `Habilidade de ${pendingSubclass.name}`,
              type: 'Subclasse'
            });
          }
        });
      }

      // Aplicar Dragão
      if (pendingDragonType) {
        updateBody.dragonType = pendingDragonType.name;
      }

      // Aplicar Pacto
      if (pendingPact) {
        updateBody.pact = pendingPact.name;

        // Aplicar benefícios do pacto
        let tempChar = { ...character, pact: pendingPact.name };
        tempChar = applySubclassBenefits(tempChar, pendingPact);

        // Atualizar campos no body (similar à subclasse)
        if (tempChar.skills) updateBody.skills = tempChar.skills;
        if (tempChar.proficiencies) updateBody.proficiencies = tempChar.proficiencies;
        if (tempChar.languages) updateBody.languages = tempChar.languages;

        // Adicionar features do pacto
        const pactFeatures = pendingPact.benefits
          .filter(b => b.level <= character.level && b.type === 'feature');

        pactFeatures.forEach(b => {
          if (!newFeatures[character.level]) {
            newFeatures[character.level] = [];
          }
          const featureName = typeof b.value === 'string' ? b.value : b.value[0];
          const exists = newFeatures[character.level].some((f: any) => f.name === featureName);

          if (!exists) {
            newFeatures[character.level].push({
              name: featureName,
              description: b.description || `Pacto: ${pendingPact.name}`,
              type: 'Subclasse' // Pacto é tecnicamente uma feature de subclasse/classe
            });
          }
        });
      }

      const res = await fetch(`/api/characters/${characterId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateBody),
      });

      if (!res.ok) throw new Error("Failed to complete level up");

      toast.success("Level up concluído com sucesso!");

      if (stillNeedsLevelUp) {
        toast.info("Você ainda tem níveis a subir! Recarregando...");
        window.location.reload(); // Recarregar para processar o próximo nível
      } else {
        router.push(`/characters/${characterId}`);
      }
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

  const spellSlots = character ? getSpellSlots(character.characterClass, character.level + 1) : null;
  const features = character ? getFeaturesAtLevel(character.characterClass, character.level + 1) : [];

  // Lógica de Subclasse
  const targetLevel = character ? character.level + 1 : 1;
  const subclassLevel = character ? getSubclassLevel(character.characterClass) : 99;
  const needsSubclass = character && !character.subclass && !pendingSubclass && targetLevel >= subclassLevel;
  const isDraconic = character && (character.subclass === "Linhagem Dracônica" || pendingSubclass?.name === "Linhagem Dracônica");
  const needsDragonType = isDraconic && !character.dragonType && !pendingDragonType;
  const needsPact = character && character.characterClass === 'Bruxo' && targetLevel >= 3 && !character.pact && !pendingPact;

  return (
    <FantasyLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold font-cinzel text-primary">
            Level Up: {character.name}
          </h1>
          <p className="text-muted-foreground mt-2">
            Nível {character.level} → Nível {character.level + 1}
          </p>
        </div>

        {/* Seleção de Subclasse */}
        {needsSubclass && (
          <Card className="bg-card/60 border-white/10 border-l-4 border-l-purple-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-400" />
                Escolha sua Subclasse
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-muted-foreground">
                Você alcançou o nível {subclassLevel} e agora pode escolher uma especialização para sua classe!
              </p>
              <Button
                onClick={() => setShowSubclassSelector(true)}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                Escolher {character.characterClass === 'Bruxo' ? 'Patrono' : 'Subclasse'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Subclasse Selecionada (Pendente) */}
        {pendingSubclass && (
          <Card className="bg-card/60 border-white/10 border-l-4 border-l-green-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                Subclasse Selecionada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold">{pendingSubclass.name}</h3>
                  <p className="text-sm text-muted-foreground">{pendingSubclass.description}</p>
                </div>
                <Button variant="outline" onClick={() => setShowSubclassSelector(true)}>
                  Alterar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Seleção de Dragão (Se necessário) */}
        {isDraconic && !character.dragonType && (
          <Card className={`bg-card/60 border-white/10 border-l-4 ${pendingDragonType ? 'border-l-green-500' : 'border-l-red-500'}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-red-400" />
                {pendingDragonType ? 'Dragão Ancestral Selecionado' : 'Escolha seu Dragão Ancestral'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingDragonType ? (
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-red-400">{pendingDragonType.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Dano: {pendingDragonType.damageType} | Sopro: {pendingDragonType.breathWeapon}
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => setShowDragonTypeSelector(true)}>
                    Alterar
                  </Button>
                </div>
              ) : (
                <>
                  <p className="mb-4 text-muted-foreground">
                    Como um Feiticeiro de Linhagem Dracônica, você deve escolher a cor do seu ancestral dragão.
                  </p>
                  <Button
                    onClick={() => setShowDragonTypeSelector(true)}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    Escolher Dragão Ancestral
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Seleção de Pacto (Bruxo Nível 3+) */}
        {needsPact && (
          <Card className="bg-card/60 border-white/10 border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-400" />
                Escolha seu Pacto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-muted-foreground">
                No 3º nível, seu Patrono lhe concede um presente pelos seus serviços leais.
              </p>
              <Button
                onClick={() => setShowPactSelector(true)}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Escolher Pacto
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Pacto Selecionado (Pendente) */}
        {pendingPact && (
          <Card className="bg-card/60 border-white/10 border-l-4 border-l-green-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                Pacto Selecionado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold">{pendingPact.name}</h3>
                  <p className="text-sm text-muted-foreground">{pendingPact.description}</p>
                </div>
                <Button variant="outline" onClick={() => setShowPactSelector(true)}>
                  Alterar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

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
        {canCastSpells(character.characterClass) && (spellsToSelect > 0 || cantripsToSelect > 0) && (
          <Card className="bg-card/60 border-white/10">
            <CardHeader>
              <CardTitle>Selecionar Magias</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {cantripsToSelect > 0 && spellsToSelect > 0
                  ? `Selecione ${cantripsToSelect} truque(s) e ${spellsToSelect} magia(s) para aprender neste nível`
                  : cantripsToSelect > 0
                    ? `Selecione ${cantripsToSelect} truque(s) para aprender neste nível`
                    : `Selecione ${spellsToSelect} magia(s) para aprender neste nível`
                }
              </p>
              {(selectedSpells.length > 0 || selectedCantrips.length > 0) && (
                <div className="space-y-2">
                  <Label>
                    Selecionadas ({selectedSpells.length + selectedCantrips.length}/{spellsToSelect + cantripsToSelect})
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {[...selectedCantrips, ...selectedSpells].map((spellIndex) => {
                      const spell = availableSpells.find(s => s.index === spellIndex);
                      const isCantrip = spell?.level === 0;
                      return (
                        <Badge key={spellIndex} variant="outline" className="p-2">
                          {spell ? translateSpell(spell.name) : spellIndex}
                          {isCantrip && " (Truque)"}
                          <button
                            onClick={() => {
                              if (isCantrip) {
                                setSelectedCantrips(prev => prev.filter(s => s !== spellIndex));
                              } else {
                                setSelectedSpells(prev => prev.filter(s => s !== spellIndex));
                              }
                            }}
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
                disabled={(selectedSpells.length >= spellsToSelect && selectedCantrips.length >= cantripsToSelect)}
              >
                {(selectedSpells.length >= spellsToSelect && selectedCantrips.length >= cantripsToSelect)
                  ? "Todas as magias selecionadas"
                  : `Selecionar Magias (${selectedSpells.length + selectedCantrips.length}/${spellsToSelect + cantripsToSelect})`}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Botão Finalizar */}
        <Card className="bg-card/60 border-white/10">
          <CardContent className="pt-6">
            <Button
              onClick={handleCompleteLevelUp}
              disabled={
                !hitDiceRoll ||
                saving ||
                (canCastSpells(character.characterClass) && (selectedSpells.length < spellsToSelect || selectedCantrips.length < cantripsToSelect)) ||
                (needsSubclass && !pendingSubclass) ||
                (needsDragonType && !pendingDragonType) ||
                (needsPact && !pendingPact)
              }
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
            selectedSpells={[...selectedCantrips, ...selectedSpells]}
            onSpellsChange={(spells) => {
              // Separar truques de magias
              const cantrips = spells.filter(idx => {
                const spell = availableSpells.find(s => s.index === idx);
                return spell?.level === 0;
              });
              const regularSpells = spells.filter(idx => {
                const spell = availableSpells.find(s => s.index === idx);
                return spell?.level !== undefined && spell.level > 0;
              });
              setSelectedCantrips(cantrips);
              setSelectedSpells(regularSpells);
            }}
            maxSpells={spellsToSelect}
            maxCantrips={cantripsToSelect}
            characterClass={character.characterClass}
            characterLevel={character.level}
            knownSpells={character.spellcasting?.knownSpells || []}
            allowSwap={false}
          />
        )}

        {/* Dialog de Seleção de Subclasse */}
        <SubclassSelector
          open={showSubclassSelector}
          onOpenChange={setShowSubclassSelector}
          className={character.characterClass}
          characterLevel={targetLevel}
          currentSubclass={character.subclass || pendingSubclass?.name}
          type={character.characterClass === 'Bruxo' ? 'patron' : undefined}
          onSelect={(subclass) => {
            setPendingSubclass(subclass);
            toast.success(`${character.characterClass === 'Bruxo' ? 'Patrono' : 'Subclasse'} "${subclass.name}" selecionada!`);
          }}
        />

        {/* Dialog de Seleção de Dragão */}
        <DragonTypeSelector
          open={showDragonTypeSelector}
          onOpenChange={setShowDragonTypeSelector}
          onSelect={(dragonType) => {
            setPendingDragonType(dragonType);
            toast.success(`Dragão Ancestral "${dragonType.name}" selecionado!`);
          }}
        />

        {/* Dialog de Seleção de Pacto */}
        <SubclassSelector
          open={showPactSelector}
          onOpenChange={setShowPactSelector}
          className={character.characterClass}
          characterLevel={targetLevel}
          currentSubclass={character.pact || pendingPact?.name}
          type="pact"
          onSelect={(pact) => {
            setPendingPact(pact);
            toast.success(`Pacto "${pact.name}" selecionado!`);
          }}
        />
      </div>
    </FantasyLayout>
  );
}

