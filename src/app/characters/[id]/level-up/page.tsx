"use client";
// Force rebuild


import { useState, useEffect, useCallback } from "react";
import { getSpellsByClassPTBR, getSpellDetails, getSpellsFromAllClasses } from "@/lib/data/spell-data";
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
import { getSpellSlots, canCastSpells, getSpellcastingLevel, getEldritchKnightSpellProgression } from "@/lib/spell-slots";
import { getFeaturesAtLevel } from "@/lib/class-features";
import { calculateLevel } from "@/lib/xp-levels";
import { getSpellLearningInfo } from "@/lib/spell-learning-rules";
import { SpellSelectionDialog } from "@/components/characters/SpellSelectionDialog";
import { SubclassSelector } from "@/components/characters/SubclassSelector";
import { FeatSelector } from "@/components/characters/FeatSelector";
import { getSubclassLevel, needsSubclassSelection, getSubclassFeaturesAtLevel } from "@/lib/subclasses";
import { applySubclassBenefits } from "@/lib/benefit-application";
import type { Feat } from "@/lib/feats";
import type { Subclass } from "@/lib/subclasses";
import type { FightingStyle } from "@/lib/fighting-styles";
import { getFightingStylesForClass, needsFightingStyleSelection } from "@/lib/fighting-styles";
import { FightingStyleSelector } from "@/components/characters/FightingStyleSelector";
import { EldritchInvocationSelector } from "@/components/characters/EldritchInvocationSelector";
import { useTranslation } from "@/lib/i18n/context";
import { applyAutoFeatures } from "@/lib/auto-features";
import { getInvocationsCount, getNewInvocationsCount, ELDRITCH_INVOCATIONS } from "@/lib/eldritch-invocations";
import { applyPactBoonBenefits, hasPactBoonItems } from "@/lib/pact-boon-helper";
import { BookOfShadowsSelector } from "@/components/characters/BookOfShadowsSelector";
import { calculateInitiativeBonus } from "@/lib/initiative-helper";
import { getMysticArcanumLevel, getNewMysticArcanumLevel } from "@/lib/mystic-arcanum-helper";
import { MysticArcanumSelector } from "@/components/characters/MysticArcanumSelector";
import { MetamagicSelector } from "@/components/characters/MetamagicSelector";
import { getMetamagicCount, getNewMetamagicCount } from "@/lib/metamagic";

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
  const [canSwapSpells, setCanSwapSpells] = useState(false);
  const [isMagicalSecrets, setIsMagicalSecrets] = useState(false);
  const [cantripsToSelect, setCantripsToSelect] = useState(0);
  const [showSpellDialog, setShowSpellDialog] = useState(false);
  const [showSubclassSelector, setShowSubclassSelector] = useState(false);
  const [pendingSubclass, setPendingSubclass] = useState<Subclass | null>(null);
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
  const [showInvocationSelector, setShowInvocationSelector] = useState(false);
  const [selectedInvocations, setSelectedInvocations] = useState<string[]>([]);
  const [invocationsToSelect, setInvocationsToSelect] = useState(0);
  const [showBookOfShadowsSelector, setShowBookOfShadowsSelector] = useState(false);
  const [selectedBookCantrips, setSelectedBookCantrips] = useState<string[]>([]);
  const [showMysticArcanumSelector, setShowMysticArcanumSelector] = useState(false);
  const [mysticArcanumLevel, setMysticArcanumLevel] = useState<number | null>(null);
  const [selectedMysticArcanum, setSelectedMysticArcanum] = useState<string>("");
  const [showMetamagicSelector, setShowMetamagicSelector] = useState(false);
  const [selectedMetamagics, setSelectedMetamagics] = useState<string[]>([]);
  const [metamagicsToSelect, setMetamagicsToSelect] = useState(0);
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
      if (canCastSpells(characterData.characterClass, characterData.subclass, targetLevel)) {
        const previousLevel = currentLevel;

        // Usar a nova biblioteca de regras de aprendizado
        const learningInfo = getSpellLearningInfo(
          characterData.characterClass,
          targetLevel,
          previousLevel,
          characterData.subclass
        );

        // Detectar "Magia Mística" ou "Segredos Mágicos Adicionais"
        const features = getFeaturesAtLevel(characterData.characterClass, targetLevel);
        const subFeatures = characterData.subclass ? getSubclassFeaturesAtLevel(characterData.subclass, targetLevel) : [];
        const allFeatures = [...features, ...subFeatures];

        const hasMagicalSecrets = allFeatures.some(f =>
          f.name === "Magia Mística" || f.name === "Segredos Mágicos Adicionais"
        );

        let adjustedSpellsToSelect = learningInfo.newSpells;
        // Se for Lore Bard no lv 6, adicionar 2 magias extras (Additional Magical Secrets)
        if (hasMagicalSecrets && characterData.subclass === "Colégio do Conhecimento" && targetLevel === 6) {
          adjustedSpellsToSelect += 2;
        }

        setCantripsToSelect(learningInfo.newCantrips);
        setSpellsToSelect(adjustedSpellsToSelect);
        setCanSwapSpells(learningInfo.canSwap);

        if (adjustedSpellsToSelect > 0 || learningInfo.newCantrips > 0) {
          // Buscar magias disponíveis para a classe (ou todas se for Magia Mística)
          let spellClass = characterData.characterClass;
          if (characterData.characterClass === "Guerreiro" && characterData.subclass === "Cavaleiro Arcano") {
            spellClass = "Mago";
          } else if (characterData.characterClass === "Ladino" && characterData.subclass === "Trapaceiro Arcano") {
            spellClass = "Mago";
          }
          await fetchAvailableSpells(spellClass, targetLevel, hasMagicalSecrets, characterData.subclass);
        }
      }

      // Verificar se é Bruxo e precisa selecionar Invocações Arcanas
      if (characterData.characterClass === "Bruxo") {
        const currentInvocations = characterData.eldritchInvocations || [];
        setSelectedInvocations(currentInvocations);

        const currentInvocationsCount = getInvocationsCount(currentLevel);
        const targetInvocationsCount = getInvocationsCount(targetLevel);
        const newInvocations = targetInvocationsCount - currentInvocationsCount;

        setInvocationsToSelect(newInvocations);

        console.log(`[Invocations] Level ${currentLevel} -> ${targetLevel}: Need ${newInvocations} new invocations (total: ${targetInvocationsCount})`);

        // Verificar se precisa selecionar Mystic Arcanum
        const newArcanumLevel = getNewMysticArcanumLevel(currentLevel, targetLevel);
        if (newArcanumLevel) {
          const currentArcanum = characterData.mysticArcanum || {};
          if (!currentArcanum[newArcanumLevel.toString()]) {
            setMysticArcanumLevel(newArcanumLevel);
            setSelectedMysticArcanum("");
          }
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

  // Detectar seleção de Cavaleiro Arcano e abrir seleção de magias
  useEffect(() => {
    if (!character || !pendingSubclass) return;

    const targetLevel = character.level + 1;

    // Se é Guerreiro nível 3 escolhendo Cavaleiro Arcano
    if (
      character.characterClass === "Guerreiro" &&
      pendingSubclass.name === "Cavaleiro Arcano" &&
      targetLevel === 3
    ) {
      const progression = getEldritchKnightSpellProgression(3);
      setCantripsToSelect(progression.cantrips);
      setSpellsToSelect(progression.knownSpells);
      setCanSwapSpells(false);
      setShowSpellDialog(true);

      // Buscar magias do Mago até o nível máximo que Cavaleiro Arcano pode aprender no nível 3
      // Cavaleiro Arcano nível 3 pode aprender magias de nível 1
      fetchAvailableSpells("Mago", 3, false);

      toast.info("Cavaleiro Arcano: Selecione 2 truques e 3 magias de nível 1. Use o filtro 'Todos os Níveis' para ver truques e magias juntos.");
    }
  }, [pendingSubclass, character]);

  const fetchAvailableSpells = async (className: string, level: number, isMagiaMistica: boolean = false, subclass?: string) => {
    try {
      // Usar a base de dados local

      // Nível máximo de magia que pode aprender
      const maxSpellLevel = getSpellcastingLevel(className, level, subclass);

      // Buscar lista de magias para a classe (ou todas se for Magia Mística)
      let spellIndices: string[];
      if (isMagiaMistica) {
        spellIndices = getSpellsFromAllClasses(maxSpellLevel);
      } else {
        spellIndices = getSpellsByClassPTBR(className, maxSpellLevel);
      }

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
      setIsMagicalSecrets(isMagiaMistica);
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
    const targetLevel = character.level + 1;
    const effectiveSubclass = pendingSubclass?.name || character.subclass;

    if (canCastSpells(character.characterClass, effectiveSubclass, targetLevel)) {
      if (cantripsToSelect > 0 && selectedCantrips.length < cantripsToSelect) {
        toast.error(`Selecione ${cantripsToSelect} truque(s)`);
        return;
      }
      if (spellsToSelect > 0 && selectedSpells.length < spellsToSelect) {
        toast.error(`Selecione ${spellsToSelect} magia(s)`);
        return;
      }
    }

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
      // Calcular bônus de HP por nível (ex: Anão Hill)
      const hpBonusPerLevel = character.hpBonusPerLevel || 0;

      const newMaxHp = (character.maxHp || 0) + hpGain + hpBonusPerLevel;
      const newCurrentHp = Math.min((character.currentHp || 0) + hpGain + hpBonusPerLevel, newMaxHp);

      // Preparar dados de spellcasting
      const currentSpellcasting = character.spellcasting || {};
      const knownSpells = currentSpellcasting.knownSpells || [];

      // Adicionar novas magias e truques às conhecidas
      const newKnownSpells = [...knownSpells, ...selectedSpells, ...selectedCantrips];

      // Calcular slots de magia
      const spellSlots = getSpellSlots(character.characterClass, targetLevel, pendingSubclass?.name || character.subclass);

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
        // HP = (Dado máximo no nível 1) + (média do dado × (nível - 1)) + (mod CON × nível) + (bônus HP por nível × nível)
        const hitDiceMatch = character.hitDice?.match(/1d(\d+)/);
        const hitDiceSize = hitDiceMatch ? parseInt(hitDiceMatch[1]) : 8;
        const averageRoll = Math.floor(hitDiceSize / 2) + 1; // Média arredondada para cima

        // HP retroativo: dado máximo no nível 1 + média nos outros níveis + (novo mod CON × nível total) + (bônus HP por nível × nível total)
        finalMaxHp = hitDiceSize + (averageRoll * (targetLevel - 1)) + (newConMod * targetLevel) + (hpBonusPerLevel * targetLevel);

        // Ajustar currentHp proporcionalmente
        const hpPercentage = character.maxHp > 0 ? (character.currentHp || 0) / character.maxHp : 1;
        finalCurrentHp = Math.max(1, Math.floor(finalMaxHp * hpPercentage));

        console.log(`[HP Recalculation] CON mudou de ${character.attributes?.constitution} (${oldConMod}) para ${updatedAttributes.constitution} (${newConMod})`);
        console.log(`[HP Recalculation] HP antigo: ${character.maxHp}, HP novo: ${finalMaxHp} (ganho retroativo: ${finalMaxHp - (character.maxHp || 0)})`);
        console.log(`[HP Recalculation] Bônus HP por nível: ${hpBonusPerLevel} × ${targetLevel} = ${hpBonusPerLevel * targetLevel}`);
      } else {
        // Se CON não mudou, apenas adicionar o HP do level up
        finalMaxHp = newMaxHp;
        finalCurrentHp = newCurrentHp;
      }

      const newProficiencyBonus = Math.ceil(targetLevel / 4) + 1;

      // RECALCULAR INICIATIVA baseado em DEX e feats
      const dexMod = Math.floor(((updatedAttributes.dexterity || 10) - 10) / 2);
      const newInitiative = calculateInitiativeBonus(dexMod, updatedFeats);

      // Preparar objeto base para atualização
      let updateBody: any = {
        level: targetLevel, // Atualizar para o novo nível
        maxHp: finalMaxHp,
        currentHp: finalCurrentHp,
        proficiencyBonus: newProficiencyBonus,
        initiative: newInitiative, // Atualizar iniciativa com bônus de feats
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

        // Aplicar itens e benefícios automáticos do Pacto
        const pactBenefits = applyPactBoonBenefits(character.characterClass, pendingPact, targetLevel);

        // Adicionar itens do pacto ao inventário (se não existirem)
        if (pactBenefits.inventory && pactBenefits.inventory.length > 0) {
          const currentInventory = character.inventory || [];
          const hasItems = hasPactBoonItems(currentInventory, pendingPact.name);

          if (!hasItems) {
            const updatedInventory = [...currentInventory, ...pactBenefits.inventory];
            updateBody.inventory = updatedInventory;
          }
        }

        // Adicionar features do pacto
        if (pactBenefits.features) {
          Object.entries(pactBenefits.features).forEach(([level, features]) => {
            const lvl = parseInt(level);
            if (!newFeatures[lvl]) {
              newFeatures[lvl] = [];
            }
            features.forEach((feature: any) => {
              const exists = newFeatures[lvl].some((f: any) => f.name === feature.name);
              if (!exists) {
                newFeatures[lvl].push(feature);
              }
            });
          });
        }

        // Adicionar magias do pacto (ex: Find Familiar para Pacto da Corrente)
        if (pactBenefits.spellcasting?.knownSpells) {
          pactBenefits.spellcasting.knownSpells.forEach(spell => {
            if (!newKnownSpells.includes(spell)) {
              newKnownSpells.push(spell);
            }
          });
        }
      }

      // Aplicar Invocações Arcanas (Bruxo)
      if (character.characterClass === "Bruxo" && selectedInvocations.length > 0) {
        updateBody.eldritchInvocations = selectedInvocations;
      }

      // Aplicar Truques do Livro das Sombras (Pacto do Tomo)
      if (pendingPact?.name === "Pacto do Tomo" && selectedBookCantrips.length > 0) {
        updateBody.bookOfShadowsCantrips = selectedBookCantrips;
        // Adicionar os truques às magias conhecidas também
        selectedBookCantrips.forEach(cantrip => {
          if (!newKnownSpells.includes(cantrip)) {
            newKnownSpells.push(cantrip);
          }
        });
      }

      // Aplicar Mystic Arcanum (Bruxo)
      if (mysticArcanumLevel && selectedMysticArcanum) {
        const currentArcanum = character.mysticArcanum || {};
        updateBody.mysticArcanum = {
          ...currentArcanum,
          [mysticArcanumLevel.toString()]: selectedMysticArcanum
        };
        // Adicionar Mystic Arcanum às magias conhecidas
        if (!newKnownSpells.includes(selectedMysticArcanum)) {
          newKnownSpells.push(selectedMysticArcanum);
        }
      }

      // Aplicar Fighting Style
      if (selectedFightingStyle) {
        updateBody.fightingStyle = selectedFightingStyle.name;
      }

      // Aplicar Metamágicas (Feiticeiro)
      if (character.characterClass === "Feiticeiro" && selectedMetamagics.length > 0) {
        updateBody.metamagics = selectedMetamagics;
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
  const needsPact = character && character.characterClass === 'Bruxo' && targetLevel >= 3 && !character.pact && !pendingPact;

  // Verificar se tem ASI neste nível
  const hasASI = features.some(f => f.type === "ability_score_improvement");
  const totalASIPoints = hasASI ? 2 : 0;
  const usedASIPoints = Object.values(attributeIncreases).reduce((sum, val) => sum + val, 0);
  const remainingASIPoints = totalASIPoints - usedASIPoints;

  // Verificar se Feiticeiro ganha metamágicas neste nível
  const newMetamagicsCount = character?.characterClass === "Feiticeiro"
    ? getNewMetamagicCount(character.level, targetLevel)
    : 0;

  // Inicializar metamagics com as já conhecidas
  if (newMetamagicsCount > 0 && metamagicsToSelect === 0) {
    setMetamagicsToSelect(newMetamagicsCount);
    setSelectedMetamagics(character.metamagics || []);
  }

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

              {/* Features da Subclasse (se aplicável) */}
              {(() => {
                // Se tem subclasse pendente OU subclasse já escolhida
                const currentSubclass = pendingSubclass || (character.subclass ? character.subclass : null);

                if (!currentSubclass) return null;

                // Buscar subclasse completa se for apenas uma string
                let subclassData = currentSubclass;
                if (typeof currentSubclass === 'string') {
                  const { ALL_SUBCLASSES } = require('@/lib/subclasses');
                  subclassData = ALL_SUBCLASSES.find((s: any) => s.name === currentSubclass);
                }

                if (!subclassData || !subclassData.features) return null;

                // Pegar features da subclasse que são do novo nível
                const newLevel = character.level + 1;
                const subclassFeatures = subclassData.features.filter((f: any) => f.level === newLevel);

                if (subclassFeatures.length === 0) return null;

                return (
                  <>
                    <div className="border-t border-border my-3"></div>
                    <div className="mb-2">
                      <h4 className="text-sm font-semibold text-primary flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Habilidades de {subclassData.name}
                      </h4>
                    </div>
                    {subclassFeatures.map((feature: any, idx: number) => (
                      <div key={`subclass-${idx}`} className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-primary">{feature.name}</h3>
                          <Badge variant="outline" className="bg-primary/20">Nível {feature.level}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    ))}
                  </>
                );
              })()}
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

        {/* Seleção de Truques do Livro das Sombras (Pacto do Tomo) */}
        {pendingPact?.name === "Pacto do Tomo" && (
          <Card className={`bg-card/60 border-white/10 border-l-4 ${selectedBookCantrips.length === 3 ? 'border-l-green-500' : 'border-l-purple-500'}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-400" />
                {selectedBookCantrips.length === 3 ? 'Truques do Livro das Sombras Selecionados' : 'Escolha Truques para o Livro das Sombras'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedBookCantrips.length === 3 ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Você selecionou 3 truques:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedBookCantrips.map((cantrip) => (
                      <Badge key={cantrip} variant="secondary" className="text-sm">
                        {cantrip}
                      </Badge>
                    ))}
                  </div>
                  <Button variant="outline" onClick={() => setShowBookOfShadowsSelector(true)} className="w-full">
                    Alterar Truques
                  </Button>
                </div>
              ) : (
                <>
                  <p className="mb-4 text-muted-foreground">
                    O Livro das Sombras permite que você aprenda 3 truques de qualquer classe. Estes truques não contam contra seu número de truques conhecidos!
                  </p>
                  <Button
                    onClick={() => setShowBookOfShadowsSelector(true)}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Escolher 3 Truques
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Seleção de Mystic Arcanum (Bruxo Níveis 11, 13, 15, 17) */}
        {mysticArcanumLevel && (
          <Card className={`bg-card/60 border-white/10 border-l-4 ${selectedMysticArcanum ? 'border-l-green-500' : 'border-l-purple-500'}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-400" />
                {selectedMysticArcanum ? 'Mystic Arcanum Selecionado' : 'Escolha Mystic Arcanum'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedMysticArcanum ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Você selecionou uma magia de {mysticArcanumLevel}º nível:
                  </p>
                  <Badge variant="secondary" className="text-sm">
                    {selectedMysticArcanum}
                  </Badge>
                  <Button variant="outline" onClick={() => setShowMysticArcanumSelector(true)} className="w-full">
                    Alterar Magia
                  </Button>
                </div>
              ) : (
                <>
                  <p className="mb-4 text-muted-foreground">
                    Mystic Arcanum permite que você aprenda 1 magia de {mysticArcanumLevel}º nível. Esta magia pode ser conjurada 1x por descanso longo sem gastar espaço de magia!
                  </p>
                  <Button
                    onClick={() => setShowMysticArcanumSelector(true)}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Escolher Magia de {mysticArcanumLevel}º Nível
                  </Button>
                </>
              )}
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

        {/* Seleção de Invocações Arcanas (Bruxo) */}
        {character?.characterClass === "Bruxo" && invocationsToSelect > 0 && (
          <Card className={`bg-card/60 border-white/10 border-l-4 ${selectedInvocations.length >= getInvocationsCount(targetLevel) ? 'border-l-green-500' : 'border-l-purple-500'}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-400" />
                {selectedInvocations.length >= getInvocationsCount(targetLevel) ? 'Invocações Arcanas Selecionadas' : 'Escolha Invocações Arcanas'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedInvocations.length >= getInvocationsCount(targetLevel) ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Você selecionou {selectedInvocations.length} invocação(ões):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedInvocations.map((invId) => {
                      const inv = ELDRITCH_INVOCATIONS.find(i => i.id === invId);
                      return inv && (
                        <Badge key={invId} variant="secondary" className="text-sm">
                          {inv.name}
                        </Badge>
                      );
                    })}
                  </div>
                  <Button variant="outline" onClick={() => setShowInvocationSelector(true)} className="w-full">
                    Alterar Invocações
                  </Button>
                </div>
              ) : (
                <>
                  <p className="mb-4 text-muted-foreground">
                    Você alcançou o nível {character.level + 1} e pode escolher {invocationsToSelect} nova(s) invocação(ões) arcana(s)!
                    {character.eldritchInvocations && character.eldritchInvocations.length > 0 && (
                      <> Você já possui {character.eldritchInvocations.length} invocação(ões).</>
                    )}
                  </p>
                  <Button
                    onClick={() => setShowInvocationSelector(true)}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Escolher Invocações Arcanas
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Seleção de Metamágicas (Feiticeiro) */}
        {character?.characterClass === "Feiticeiro" && metamagicsToSelect > 0 && (
          <Card className={`bg-card/60 border-white/10 border-l-4 ${selectedMetamagics.length >= getMetamagicCount(targetLevel) ? 'border-l-green-500' : 'border-l-purple-500'}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-400" />
                {selectedMetamagics.length >= getMetamagicCount(targetLevel) ? 'Metamágicas Selecionadas' : 'Escolha Metamágicas'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedMetamagics.length >= getMetamagicCount(targetLevel) ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Você selecionou {selectedMetamagics.length} metamágica(s):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedMetamagics.map((metamagicId) => {
                      const { METAMAGICS } = require('@/lib/metamagic');
                      const metamagic = METAMAGICS[metamagicId];
                      return metamagic && (
                        <Badge key={metamagicId} variant="secondary" className="text-sm">
                          {metamagic.name}
                        </Badge>
                      );
                    })}
                  </div>
                  <Button variant="outline" onClick={() => setShowMetamagicSelector(true)} className="w-full">
                    Alterar Metamágicas
                  </Button>
                </div>
              ) : (
                <>
                  <p className="mb-4 text-muted-foreground">
                    Metamágicas permitem que você modifique suas magias gastando Pontos de Feitiçaria. Selecione {
                      getNewMetamagicCount(character.level, targetLevel)
                    } nova(s) metamágica(s).
                  </p>
                  <Button
                    onClick={() => setShowMetamagicSelector(true)}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Escolher Metamágicas
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

        {/* Card dedicado para escolha de atributo do Feat - DEPOIS de Aumento de Poder */}
        {asiChoice === "feat" && selectedFeat && selectedFeat.attributeBonus?.attribute === "any" && (
          <Card className={`bg-card/60 border-white/10 border-l-4 ${selectedFeatAttribute ? 'border-l-green-500' : 'border-l-primary'}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                {selectedFeatAttribute ? 'Atributo Selecionado' : 'Escolha o Atributo para ' + selectedFeat.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
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
                <p className="text-sm text-green-400 mt-3">
                  ✓ {selectedFeatAttribute === "strength" ? "Força" :
                    selectedFeatAttribute === "dexterity" ? "Destreza" :
                      selectedFeatAttribute === "constitution" ? "Constituição" :
                        selectedFeatAttribute === "intelligence" ? "Inteligência" :
                          selectedFeatAttribute === "wisdom" ? "Sabedoria" : "Carisma"} receberá +{selectedFeat.attributeBonus.bonus}
                </p>
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
          canCastSpells(character.characterClass, character.subclass || pendingSubclass?.name, targetLevel) && (spellsToSelect > 0 || cantripsToSelect > 0) && (
            <Card className="bg-card/60 border-white/10">
              <CardHeader>
                <CardTitle>Selecionar Magias</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {isMagicalSecrets ? (
                    `Você ganhou Segredos Mágicos! Selecione ${spellsToSelect} magias de QUALQUER classe.`
                  ) : (
                    cantripsToSelect > 0 && spellsToSelect > 0
                      ? `Selecione ${cantripsToSelect} truque(s) e ${spellsToSelect} magia(s) para aprender neste nível`
                      : cantripsToSelect > 0
                        ? `Selecione ${cantripsToSelect} truque(s) para aprender neste nível`
                        : `Selecione ${spellsToSelect} magia(s) para aprender neste nível`
                  )}
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
                (canCastSpells(character.characterClass, character.subclass || pendingSubclass?.name, targetLevel) && (selectedSpells.length < spellsToSelect || selectedCantrips.length < cantripsToSelect)) ||
                (needsSubclass && !pendingSubclass) ||
                (needsPact && !pendingPact) ||
                (character.characterClass === "Bruxo" && invocationsToSelect > 0 && selectedInvocations.length < getInvocationsCount(targetLevel)) ||
                (pendingPact?.name === "Pacto do Tomo" && selectedBookCantrips.length < 3) ||
                (mysticArcanumLevel && !selectedMysticArcanum)
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
              characterLevel={targetLevel}
              knownSpells={character.spellcasting?.knownSpells || []}
              allowSwap={canSwapSpells}
              subclass={character.subclass || pendingSubclass?.name}
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


        {/* Dialog de Seleção de Feat */}
        <FeatSelector
          open={showFeatSelector}
          onOpenChange={setShowFeatSelector}
          currentFeats={character?.feats || []}
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

        {/* Dialog de Seleção de Invocações Arcanas */}
        {
          showInvocationSelector && character && (
            <EldritchInvocationSelector
              open={showInvocationSelector}
              onOpenChange={setShowInvocationSelector}
              onSelect={(invocations) => {
                setSelectedInvocations(invocations);
                toast.success(`${invocations.length} invocação(ões) selecionada(s)!`);
              }}
              currentInvocations={character.eldritchInvocations || []}
              maxInvocations={getInvocationsCount(targetLevel)}
              characterLevel={targetLevel}
              pactBoon={character.pact}
              knownSpells={character.spellcasting?.knownSpells || []}
            />
          )
        }

        {/* Dialog de Seleção de Truques do Livro das Sombras */}
        {
          showBookOfShadowsSelector && character && (
            <BookOfShadowsSelector
              open={showBookOfShadowsSelector}
              onOpenChange={setShowBookOfShadowsSelector}
              onSelect={(cantrips) => {
                setSelectedBookCantrips(cantrips);
                toast.success(`3 truques selecionados para o Livro das Sombras!`);
              }}
              currentCantrips={character.bookOfShadowsCantrips || []}
              characterLevel={targetLevel}
            />
          )
        }

        {/* Dialog de Seleção de Mystic Arcanum */}
        {
          showMysticArcanumSelector && character && mysticArcanumLevel && (
            <MysticArcanumSelector
              open={showMysticArcanumSelector}
              onOpenChange={setShowMysticArcanumSelector}
              onSelect={(spellIndex) => {
                setSelectedMysticArcanum(spellIndex);
                toast.success(`Mystic Arcanum de ${mysticArcanumLevel}º nível selecionado!`);
              }}
              spellLevel={mysticArcanumLevel}
              currentSelection={selectedMysticArcanum}
            />
          )
        }

        {/* Dialog de Seleção de Metamágicas */}
        {
          showMetamagicSelector && character && (
            <MetamagicSelector
              open={showMetamagicSelector}
              onOpenChange={setShowMetamagicSelector}
              onSelect={(metamagics) => {
                setSelectedMetamagics(metamagics);
                toast.success(`${metamagics.length} metamágica(s) selecionada(s)!`);
              }}
              currentMetamagics={character.metamagics || []}
              maxMetamagics={getMetamagicCount(targetLevel)}
            />
          )
        }
      </div >
    </FantasyLayout >
  );
}
