"use client";

import { useState, useEffect, useCallback } from "react";
import { getSpellsByClassPTBR, getSpellDetails } from "@/lib/data/spell-data";
import { useParams, useRouter } from "next/navigation";
import { FantasyLayout } from "@/components/layout/FantasyLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dice1, Sparkles, CheckCircle2, Loader2, Settings, TrendingUp, Award } from "lucide-react";
import { toast } from "sonner";
import { getSpellSlots, canCastSpells, getSpellcastingLevel } from "@/lib/spell-slots";
import { getFeaturesAtLevel } from "@/lib/class-features";
import { calculateLevel } from "@/lib/xp-levels";
import { getSpellLearningInfo } from "@/lib/spell-learning-rules";
import { SpellSelectionDialog } from "@/components/characters/SpellSelectionDialog";
import { SubclassSelector } from "@/components/characters/SubclassSelector";
import { DragonTypeSelector } from "@/components/characters/DragonTypeSelector";
import { FeatSelector } from "@/components/characters/FeatSelector";
import { getSubclassLevel, needsSubclassSelection } from "@/lib/subclasses";
import { applySubclassBenefits } from "@/lib/benefit-application";
import type { Feat } from "@/lib/feats";
import type { Subclass } from "@/lib/subclasses";
import type { DragonType } from "@/lib/dragon-types";
import type { FightingStyle } from "@/lib/fighting-styles";
import { getFightingStylesForClass, needsFightingStyleSelection } from "@/lib/fighting-styles";
import { FightingStyleSelector } from "@/components/characters/FightingStyleSelector";
import { useTranslation } from "@/lib/i18n/context";
import { applyAutoFeatures } from "@/lib/auto-features";

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
  const [attributeIncreases, setAttributeIncreases] = useState<Record<string, number>>({});
  const [asiChoice, setAsiChoice] = useState<"asi" | "feat" | null>(null); // Escolha entre ASI ou Feat
  const [showFeatSelector, setShowFeatSelector] = useState(false);
  const [selectedFeat, setSelectedFeat] = useState<any>(null);
  const [selectedFeatAttribute, setSelectedFeatAttribute] = useState<string | null>(null); // Atributo escolhido para feat com "any"
  const [showFightingStyleSelector, setShowFightingStyleSelector] = useState(false);
  const [selectedFightingStyle, setSelectedFightingStyle] = useState<FightingStyle | null>(null);
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

      console.log(`[Level Up] Personagem: ${characterData.name}, Nível Atual: ${currentLevel}, XP: ${currentXP}, Nível Calculado: ${calculatedLevel}`);

      // Precisa de level up se: flag está true OU nível calculado > nível atual
      const needsLevelUp = characterData.needsLevelUp || calculatedLevel > currentLevel;

      if (!needsLevelUp) {
        toast.info("Este personagem não precisa de level up no momento");
        router.push(`/characters/${characterId}`);
        return;
      }

      // Se o nível calculado está muito à frente, avisar o jogador
      const levelsToGain = calculatedLevel - currentLevel;
      if (levelsToGain > 1) {
        toast.info(`Você tem XP suficiente para ${levelsToGain} níveis! Você subirá um nível por vez.`, {
          duration: 5000
        });
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

      // Restaurar o dado de vida pendente se existir
      if (characterData.pendingHitDiceRoll) {
        setHitDiceRoll(characterData.pendingHitDiceRoll);
        const attributes = characterData.attributes || {};
        const constitution = attributes.constitution || 10;
        const conMod = Math.floor((constitution - 10) / 2);
        setHpGain(characterData.pendingHitDiceRoll + conMod);
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
      // Usar a base de dados local

      // Nível máximo de magia que pode aprender
      const maxSpellLevel = getSpellcastingLevel(className, level);

      // Buscar lista de magias para a classe
      const spellIndices = getSpellsByClassPTBR(className, maxSpellLevel);

      // Converter para o formato esperado pelo componente
      const validSpells: Spell[] = spellIndices.map((index: string) => {
        const detail = getSpellDetails(index);
        return {
          index,
          name: detail?.namePT || detail?.name || index,
          url: `/api/spells/${index}`, // Fake URL for compatibility
          level: detail?.level || 0
        };
      });

      setAvailableSpells(validSpells);
    } catch (error) {
      console.error("Error loading local spells:", error);
    }
  };

  const rollHitDice = async () => {
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

    // Salvar o resultado do dado no banco para persistir entre sessões
    try {
      await fetch(`/api/characters/${characterId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pendingHitDiceRoll: roll }),
      });
    } catch (error) {
      console.error("Error saving hit dice roll:", error);
    }
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

    // Definir targetLevel primeiro
    const targetLevel = character.level + 1;

    // Validar ASI ou Feat
    const features = getFeaturesAtLevel(character.characterClass, targetLevel);
    const hasASI = features.some(f => f.type === "ability_score_improvement");
    if (hasASI) {
      if (!asiChoice) {
        toast.error("Escolha entre aumentar atributos (ASI) ou escolher um talento (Feat)");
        return;
      }

      if (asiChoice === "asi") {
        const usedPoints = Object.values(attributeIncreases).reduce((sum, val) => sum + val, 0);
        if (usedPoints !== 2) {
          toast.error("Você deve distribuir 2 pontos de atributo");
          return;
        }
      } else if (asiChoice === "feat") {
        if (!selectedFeat) {
          toast.error("Selecione um talento (Feat)");
          return;
        }
        // Validar se precisa escolher atributo para feat com "any"
        if (selectedFeat.attributeBonus?.attribute === "any" && !selectedFeatAttribute) {
          toast.error("Escolha o atributo que receberá o bônus do talento");
          return;
        }
      }
    }

    // Validar seleção de subclasse
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

    // Validar seleção de Fighting Style
    const needsFightingStyle = needsFightingStyleSelection(character.characterClass, targetLevel) && !character.fightingStyle && !selectedFightingStyle;
    if (needsFightingStyle) {
      toast.error("Selecione seu Estilo de Combate");
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

      console.log(`[Level Up Complete] Nível atual: ${character.level}, Novo nível: ${targetLevel}, XP: ${currentXP}, Nível calculado: ${calculatedLevel}, Ainda precisa de level up: ${stillNeedsLevelUp}`);


      // Aplicar aumentos de atributos ou Feat
      const currentAttributes = character.attributes || {};
      const updatedAttributes = { ...currentAttributes };
      const currentFeats = character.feats || [];
      let updatedFeats = [...currentFeats];

      if (asiChoice === "asi" && Object.keys(attributeIncreases).length > 0) {
        // Aplicar ASI (aumentos de atributo)
        Object.entries(attributeIncreases).forEach(([attr, increase]) => {
          const currentValue = updatedAttributes[attr] || 10;
          updatedAttributes[attr] = Math.min(20, currentValue + increase); // Máximo 20
        });
      } else if (asiChoice === "feat" && selectedFeat) {
        // Aplicar Feat
        const featData: any = {
          name: selectedFeat.name,
          description: selectedFeat.description,
          benefits: selectedFeat.benefits,
          acquiredAt: targetLevel,
        };

        // Se o feat tem bônus de atributo "any", salvar o atributo escolhido
        if (selectedFeat.attributeBonus?.attribute === "any" && selectedFeatAttribute) {
          featData.chosenAttribute = selectedFeatAttribute;
        }

        updatedFeats.push(featData);

        // Se o Feat dá bônus de atributo, aplicar também
        if (selectedFeat.attributeBonus) {
          const attrKey = selectedFeat.attributeBonus.attribute === 'any'
            ? selectedFeatAttribute
            : selectedFeat.attributeBonus.attribute;

          if (attrKey) {
            const currentValue = updatedAttributes[attrKey] || 10;
            updatedAttributes[attrKey] = Math.min(20, currentValue + selectedFeat.attributeBonus.bonus);
          }
        }
      }

      // APLICAR FEATURES AUTOMÁTICAS (ex: Campeão Primitivo do Bárbaro nível 20)
      const autoUpdatedAttributes = applyAutoFeatures(character.characterClass, targetLevel, updatedAttributes);
      Object.assign(updatedAttributes, autoUpdatedAttributes);

      // RECALCULAR HP se o modificador de CON mudou (retroativo para todos os níveis)
      const oldConMod = Math.floor(((character.attributes?.constitution || 10) - 10) / 2);
      const newConMod = Math.floor(((updatedAttributes.constitution || 10) - 10) / 2);
      const conModChanged = oldConMod !== newConMod;

      let finalMaxHp: number;
      let finalCurrentHp: number;

      if (conModChanged) {
        // Se CON mudou, recalcular HP total retroativamente
        // HP = (Dado máximo no nível 1) + (média do dado × (nível - 1)) + (mod CON × nível)
        const hitDiceMatch = character.hitDice?.match(/1d(\d+)/);
        const hitDiceSize = hitDiceMatch ? parseInt(hitDiceMatch[1]) : 8;
        const averageRoll = Math.floor(hitDiceSize / 2) + 1; // Média arredondada para cima

        // HP retroativo: dado máximo no nível 1 + média nos outros níveis + (novo mod CON × nível total)
        finalMaxHp = hitDiceSize + (averageRoll * (targetLevel - 1)) + (newConMod * targetLevel);

        // Ajustar currentHp proporcionalmente
        const hpPercentage = character.maxHp > 0 ? (character.currentHp || 0) / character.maxHp : 1;
        finalCurrentHp = Math.max(1, Math.floor(finalMaxHp * hpPercentage));

        console.log(`[HP Recalculation] CON mudou de ${character.attributes?.constitution} (${oldConMod}) para ${updatedAttributes.constitution} (${newConMod})`);
        console.log(`[HP Recalculation] HP antigo: ${character.maxHp}, HP novo: ${finalMaxHp} (ganho retroativo: ${finalMaxHp - (character.maxHp || 0)})`);
      } else {
        // Se CON não mudou, apenas adicionar o HP do level up
        finalMaxHp = newMaxHp;
        finalCurrentHp = newCurrentHp;
      }

      // Preparar objeto base para atualização
      let updateBody: any = {
        level: targetLevel, // Atualizar para o novo nível
        maxHp: finalMaxHp,
        currentHp: finalCurrentHp,
        needsLevelUp: stillNeedsLevelUp, // Manter true se ainda tiver níveis a subir
        pendingHitDiceRoll: stillNeedsLevelUp ? null : null, // Limpar dado pendente quando level up completo
        attributes: updatedAttributes,
        feats: updatedFeats,
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
          if (!newFeatures[targetLevel]) {
            newFeatures[targetLevel] = [];
          }
          // Evitar duplicatas
          const featureName = typeof b.value === 'string' ? b.value : b.value[0];
          // Verificar se já existe (simplificado)
          const exists = newFeatures[targetLevel].some((f: any) => f.name === featureName);

          if (!exists) {
            newFeatures[targetLevel].push({
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
          .filter(b => b.level <= targetLevel && b.type === 'feature');

        pactFeatures.forEach(b => {
          if (!newFeatures[targetLevel]) {
            newFeatures[targetLevel] = [];
          }
          const featureName = typeof b.value === 'string' ? b.value : b.value[0];
          const exists = newFeatures[targetLevel].some((f: any) => f.name === featureName);

          if (!exists) {
            newFeatures[targetLevel].push({
              name: featureName,
              description: b.description || `Pacto: ${pendingPact.name}`,
              type: 'Subclasse' // Pacto é tecnicamente uma feature de subclasse/classe
            });
          }
        });
      }

      // Aplicar Fighting Style
      if (selectedFightingStyle) {
        updateBody.fightingStyle = selectedFightingStyle.name;
      }

      const res = await fetch(`/api/characters/${characterId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateBody),
      });

      if (!res.ok) throw new Error("Failed to complete level up");

      toast.success(`Level up concluído! Agora você é nível ${targetLevel}!`);

      if (stillNeedsLevelUp) {
        const remainingLevels = calculatedLevel - targetLevel;
        toast.info(`Você ainda tem XP para ${remainingLevels} nível(is)! Preparando próximo level up...`, {
          duration: 3000
        });
        // Aguardar um pouco antes de recarregar para o usuário ver as mensagens
        setTimeout(() => {
          window.location.reload(); // Recarregar para processar o próximo nível
        }, 1500);
      } else {
        setTimeout(() => {
          router.push(`/characters/${characterId}`);
        }, 1000);
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

  // Debug para Paladino
  if (character?.characterClass === "Paladino") {
    console.log("🛡️ Paladino Debug:", {
      currentLevel: character.level,
      targetLevel,
      subclassLevel,
      hasSubclass: !!character.subclass,
      currentSubclass: character.subclass,
      pendingSubclass: pendingSubclass?.name,
      needsSubclass
    });
  }

  const isDraconic = character && (character.subclass === "Linhagem Dracônica" || pendingSubclass?.name === "Linhagem Dracônica");
  const needsDragonType = isDraconic && !character.dragonType && !pendingDragonType;
  const needsPact = character && character.characterClass === 'Bruxo' && targetLevel >= 3 && !character.pact && !pendingPact;

  // Verificar se tem ASI neste nível
  const hasASI = features.some(f => f.type === "ability_score_improvement");
  const totalASIPoints = hasASI ? 2 : 0;
  const usedASIPoints = Object.values(attributeIncreases).reduce((sum, val) => sum + val, 0);
  const remainingASIPoints = totalASIPoints - usedASIPoints;

  return (
    <FantasyLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold font-cinzel text-primary">
              Level Up: {character.name}
            </h1>
            <p className="text-muted-foreground mt-2">
              Nível {character.level} → Nível {character.level + 1}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              XP: {character.experiencePoints || 0}
            </p>
          </div>

          {/* Botão de Corrigir Nível */}
          <Button
            variant="outline"
            onClick={async () => {
              try {
                toast.info("Recalculando nível baseado no XP...");
                const res = await fetch(`/api/characters/${characterId}/recalculate-level`, {
                  method: "POST",
                });
                const data = await res.json();
                if (res.ok) {
                  toast.success(data.message);
                  setTimeout(() => {
                    window.location.reload();
                  }, 1500);
                } else {
                  toast.error(data.error || "Erro ao recalcular nível");
                }
              } catch (error) {
                toast.error("Erro ao recalcular nível");
              }
            }}
            className="border-amber-500/30 hover:bg-amber-500/10"
          >
            <Settings className="h-4 w-4 mr-2" />
            Corrigir Nível
          </Button>
        </div>

        {/* Dado de Vida e HP */}
        <Card className="bg-card/60 border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dice1 className="h-5 w-5" />
              Dado de Vida
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!hitDiceRoll ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Role seu dado de vida ({character.hitDice}) para determinar quanto HP você ganha.
                </p>
                <Button
                  onClick={rollHitDice}
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                  size="lg"
                >
                  <Dice1 className="mr-2 h-5 w-5" />
                  Rolar {character.hitDice}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <div>
                    <p className="text-sm text-muted-foreground">Resultado do Dado</p>
                    <p className="text-3xl font-bold text-primary">{hitDiceRoll}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Modificador CON</p>
                    <p className="text-3xl font-bold">{conModifier >= 0 ? '+' : ''}{conModifier}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">HP Ganho</p>
                    <p className="text-3xl font-bold text-green-400">+{hpGain}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-card/40 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">HP Atual</p>
                    <p className="text-xl font-bold">{character.maxHp || 0} PV</p>
                  </div>
                  <div className="text-2xl">→</div>
                  <div>
                    <p className="text-sm text-muted-foreground">Novo HP Máximo</p>
                    <p className="text-2xl font-bold text-green-400">
                      {(character.maxHp || 0) + hpGain} PV
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features do Nível */}
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
                  {/* Não mostrar descrição para ASI, pois já tem a escolha ASI/Feat */}
                  {feature.type !== "ability_score_improvement" && (
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  )}
                </div>
              ))}

              {/* Escolha de atributo para Feat com "any" */}
              {asiChoice === "feat" && selectedFeat && selectedFeat.attributeBonus?.attribute === "any" && (
                <div className="p-3 bg-primary/10 border border-primary/30 rounded-lg space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-primary">Escolha o Atributo para {selectedFeat.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Este talento concede +{selectedFeat.attributeBonus.bonus} em um atributo à sua escolha:
                  </p>
                  <Select
                    value={selectedFeatAttribute || ""}
                    onValueChange={(value) => setSelectedFeatAttribute(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um atributo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="strength">Força</SelectItem>
                      <SelectItem value="dexterity">Destreza</SelectItem>
                      <SelectItem value="constitution">Constituição</SelectItem>
                      <SelectItem value="intelligence">Inteligência</SelectItem>
                      <SelectItem value="wisdom">Sabedoria</SelectItem>
                      <SelectItem value="charisma">Carisma</SelectItem>
                    </SelectContent>
                  </Select>
                  {selectedFeatAttribute && (
                    <p className="text-sm text-green-400 mt-2">
                      ✓ {selectedFeatAttribute === "strength" ? "Força" :
                        selectedFeatAttribute === "dexterity" ? "Destreza" :
                          selectedFeatAttribute === "constitution" ? "Constituição" :
                            selectedFeatAttribute === "intelligence" ? "Inteligência" :
                              selectedFeatAttribute === "wisdom" ? "Sabedoria" : "Carisma"} receberá +{selectedFeat.attributeBonus.bonus}
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

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
                Escolher {character.characterClass === 'Bruxo' ? 'Patrono' : character.characterClass === 'Paladino' ? 'Juramento Sagrado' : 'Subclasse'}
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

        {/* Seleção de Fighting Style */}
        {needsFightingStyleSelection(character?.characterClass || "", targetLevel) && !character?.fightingStyle && (
          <Card className={`bg-card/60 border-white/10 border-l-4 ${selectedFightingStyle ? 'border-l-green-500' : 'border-l-orange-500'}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-orange-400" />
                {selectedFightingStyle ? 'Estilo de Combate Selecionado' : 'Escolha seu Estilo de Combate'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedFightingStyle ? (
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold">{selectedFightingStyle.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedFightingStyle.description}</p>
                  </div>
                  <Button variant="outline" onClick={() => setShowFightingStyleSelector(true)}>
                    Alterar
                  </Button>
                </div>
              ) : (
                <>
                  <p className="mb-4 text-muted-foreground">
                    Você aprendeu um estilo de combate que define como você luta em batalha.
                  </p>
                  <Button
                    onClick={() => setShowFightingStyleSelector(true)}
                    className="w-full bg-orange-600 hover:bg-orange-700"
                  >
                    Escolher Estilo de Combate
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Escolha: ASI ou Feat */}
        {hasASI && (
          <Card className={`bg-card/60 border-white/10 border-l-4 ${asiChoice ? 'border-l-green-500' : 'border-l-yellow-500'}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-yellow-400" />
                Aumento de Poder - Nível {character.level + 1}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Você pode escolher entre duas opções:
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Escolha */}
              {!asiChoice && (
                <div className="grid md:grid-cols-2 gap-4">
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => setAsiChoice("asi")}
                    className="h-auto py-6 flex-col items-start text-left space-y-2 hover:border-primary hover:bg-primary/10 whitespace-normal"
                  >
                    <div className="flex items-center gap-2 font-bold text-lg w-full">
                      <TrendingUp className="w-5 h-5 flex-shrink-0" />
                      <span className="break-words">Aumentar Atributos (ASI)</span>
                    </div>
                    <p className="text-sm text-muted-foreground font-normal break-words w-full">
                      Distribua +2 pontos nos seus atributos (máximo +1 por atributo ou +2 em um único).
                    </p>
                  </Button>

                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => {
                      setAsiChoice("feat");
                      setShowFeatSelector(true);
                    }}
                    className="h-auto py-6 flex-col items-start text-left space-y-2 hover:border-primary hover:bg-primary/10 whitespace-normal"
                  >
                    <div className="flex items-center gap-2 font-bold text-lg w-full">
                      <Award className="w-5 h-5 flex-shrink-0" />
                      <span className="break-words">Escolher Talento (Feat)</span>
                    </div>
                    <p className="text-sm text-muted-foreground font-normal break-words w-full">
                      Escolha uma habilidade especial. Alguns talentos também dão +1 em um atributo.
                    </p>
                  </Button>
                </div>
              )}

              {/* ASI Selecionado */}
              {asiChoice === "asi" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-sm">
                      ✓ Aumentar Atributos (ASI)
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setAsiChoice(null);
                        setAttributeIncreases({});
                      }}
                    >
                      Mudar escolha
                    </Button>
                  </div>

                  <p className="text-sm font-bold">
                    Pontos disponíveis: <span className={remainingASIPoints === 0 ? "text-green-400" : "text-yellow-400"}>{remainingASIPoints}/2</span>
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    {["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"].map((attr) => {
                      const currentValue = character.attributes?.[attr] || 10;
                      const increase = attributeIncreases[attr] || 0;
                      const newValue = currentValue + increase;
                      const atMax = newValue >= 20;

                      return (
                        <div key={attr} className="bg-background/50 rounded-lg p-3">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium capitalize">
                              {attr === "strength" && "Força"}
                              {attr === "dexterity" && "Destreza"}
                              {attr === "constitution" && "Constituição"}
                              {attr === "intelligence" && "Inteligência"}
                              {attr === "wisdom" && "Sabedoria"}
                              {attr === "charisma" && "Carisma"}
                            </span>
                            <span className="text-lg font-bold">
                              {currentValue} → {newValue}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                if (increase > 0) {
                                  setAttributeIncreases(prev => ({
                                    ...prev,
                                    [attr]: increase - 1
                                  }));
                                }
                              }}
                              disabled={increase === 0}
                              className="flex-1"
                            >
                              -
                            </Button>
                            <div className="flex-1 text-center py-1 bg-background rounded">
                              +{increase}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                if (remainingASIPoints > 0 && !atMax) {
                                  setAttributeIncreases(prev => ({
                                    ...prev,
                                    [attr]: increase + 1
                                  }));
                                }
                              }}
                              disabled={remainingASIPoints === 0 || atMax}
                              className="flex-1"
                            >
                              +
                            </Button>
                          </div>
                          {atMax && <p className="text-xs text-yellow-400 mt-1">Máximo atingido (20)</p>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Feat Selecionado */}
              {asiChoice === "feat" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-sm">
                      ✓ Escolher Talento (Feat)
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setAsiChoice(null);
                        setSelectedFeat(null);
                        setSelectedFeatAttribute(null);
                      }}
                    >
                      Mudar escolha
                    </Button>
                  </div>

                  {selectedFeat ? (
                    <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-lg">{selectedFeat.name}</h3>
                          <p className="text-sm text-muted-foreground">{selectedFeat.description}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowFeatSelector(true)}
                        >
                          Trocar
                        </Button>
                      </div>

                      {selectedFeat.attributeBonus && (
                        <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                          <TrendingUp className="w-3 h-3" />
                          +{selectedFeat.attributeBonus.bonus}{" "}
                          {selectedFeat.attributeBonus.attribute === "any" ? "Atributo à escolha" :
                            selectedFeat.attributeBonus.attribute === "strength" ? "Força" :
                              selectedFeat.attributeBonus.attribute === "dexterity" ? "Destreza" :
                                selectedFeat.attributeBonus.attribute === "constitution" ? "Constituição" :
                                  selectedFeat.attributeBonus.attribute === "intelligence" ? "Inteligência" :
                                    selectedFeat.attributeBonus.attribute === "wisdom" ? "Sabedoria" : "Carisma"}
                        </Badge>
                      )}

                      <div className="space-y-1">
                        <p className="text-sm font-semibold">Benefícios:</p>
                        <ul className="text-sm space-y-1">
                          {selectedFeat.benefits.slice(0, 3).map((benefit: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-green-400">✓</span>
                              <span>{benefit}</span>
                            </li>
                          ))}
                          {selectedFeat.benefits.length > 3 && (
                            <li className="text-xs text-muted-foreground italic">
                              ... e mais {selectedFeat.benefits.length - 3} benefício(s)
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setShowFeatSelector(true)}
                      className="w-full"
                      size="lg"
                    >
                      <Award className="w-5 h-5 mr-2" />
                      Escolher Talento
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}


        {/* Slots de Magia */}
        {
          spellSlots && (
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
          )
        }

        {/* Seleção de Magias */}
        {
          canCastSpells(character.characterClass) && (spellsToSelect > 0 || cantripsToSelect > 0) && (
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
          )
        }

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
        {
          showSpellDialog && (
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
          )
        }

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

        {/* Dialog de Seleção de Feat */}
        <FeatSelector
          open={showFeatSelector}
          onOpenChange={setShowFeatSelector}
          onSelect={(feat) => {
            setSelectedFeat(feat);
            setSelectedFeatAttribute(null); // Resetar atributo ao trocar de feat
            toast.success(`Talento "${feat.name}" selecionado!`);
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

        {/* Dialog de Seleção de Fighting Style */}
        {
          showFightingStyleSelector && (
            <FightingStyleSelector
              availableStyles={getFightingStylesForClass(character?.characterClass || "")}
              selectedStyle={selectedFightingStyle}
              onSelect={(style) => {
                setSelectedFightingStyle(style);
                toast.success(`Estilo de Combate "${style.name}" selecionado!`);
              }}
              onClose={() => setShowFightingStyleSelector(false)}
            />
          )
        }
      </div >
    </FantasyLayout >
  );
}
