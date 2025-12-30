"use client";

import { PreparedSpellsManager } from "@/components/characters/PreparedSpellsManager";
import { SpellSlotTracker } from "@/components/characters/SpellSlotTracker";
import { useState, useEffect, useCallback } from "react";
import { getSpellDetails } from "@/lib/data/spell-data";
import { useParams, useRouter } from "next/navigation";
import { FantasyLayout } from "@/components/layout/FantasyLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Save,
  Heart,
  Shield,
  Zap,
  Move,
  Star,
  Award,
  Settings,
  Target,
  Sparkles,
  Package,
  FileText,
  Dumbbell,
  Crosshair,
  Activity,
  Brain,
  Eye,
  Crown,
  Coins,
  BookOpen
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import avatarPlaceholder from "@assets/generated_images/fantasy_character_silhouette_avatar.png";
import { canCastSpells, getSpellSlots } from "@/lib/spell-slots";
import { useTranslation } from "@/lib/i18n/context";
import { CLASS_FEATURES } from "@/lib/class-features";
import { ALL_SUBCLASSES } from "@/lib/subclasses";
import { getDragonType, getDamageTypeLabel } from "@/lib/dragon-types";

// Atributos D&D 5e
const ATTRIBUTES = [
  { key: "strength", label: "Força", abbr: "FOR", Icon: Dumbbell },
  { key: "dexterity", label: "Destreza", abbr: "DES", Icon: Crosshair },
  { key: "constitution", label: "Constituição", abbr: "CON", Icon: Activity },
  { key: "intelligence", label: "Inteligência", abbr: "INT", Icon: Brain },
  { key: "wisdom", label: "Sabedoria", abbr: "SAB", Icon: Eye },
  { key: "charisma", label: "Carisma", abbr: "CAR", Icon: Crown },
];

// Habilidades D&D 5e
const SKILLS = [
  { key: "acrobatics", label: "Acrobacia", attribute: "dexterity" },
  { key: "animalHandling", label: "Adestrar Animais", attribute: "wisdom" },
  { key: "arcana", label: "Arcanismo", attribute: "intelligence" },
  { key: "athletics", label: "Atletismo", attribute: "strength" },
  { key: "deception", label: "Enganação", attribute: "charisma" },
  { key: "history", label: "História", attribute: "intelligence" },
  { key: "insight", label: "Intuição", attribute: "wisdom" },
  { key: "intimidation", label: "Intimidação", attribute: "charisma" },
  { key: "investigation", label: "Investigação", attribute: "intelligence" },
  { key: "medicine", label: "Medicina", attribute: "wisdom" },
  { key: "nature", label: "Natureza", attribute: "intelligence" },
  { key: "perception", label: "Percepção", attribute: "wisdom" },
  { key: "performance", label: "Atuação", attribute: "charisma" },
  { key: "persuasion", label: "Persuasão", attribute: "charisma" },
  { key: "religion", label: "Religião", attribute: "intelligence" },
  { key: "sleightOfHand", label: "Prestidigitação", attribute: "dexterity" },
  { key: "stealth", label: "Furtividade", attribute: "dexterity" },
  { key: "survival", label: "Sobrevivência", attribute: "wisdom" },
];

const calculateModifier = (value: number): number => {
  return Math.max(0, Math.floor((value - 10) / 2));
};

export default function CharacterPage() {
  const params = useParams();
  const router = useRouter();
  const characterId = (params?.id as string) || "";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [character, setCharacter] = useState<any>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isDM, setIsDM] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [spellDetails, setSpellDetails] = useState<Record<string, any>>({});
  const [loadingSpells, setLoadingSpells] = useState(false);
  const { translateSpell, translateDnd5e } = useTranslation();

  // Carregar detalhes das magias quando o personagem for carregado
  useEffect(() => {
    if (character?.spellcasting?.knownSpells && character.spellcasting.knownSpells.length > 0) {
      loadSpellDetails(character.spellcasting.knownSpells);
    }
  }, [character?.spellcasting?.knownSpells]);

  const loadSpellDetails = async (spellIndexes: string[]) => {
    try {
      setLoadingSpells(true);
      const details: Record<string, any> = {};

      // Usar helper local

      spellIndexes.forEach((spellIndex) => {
        const localDetail = getSpellDetails(spellIndex);
        if (localDetail) {
          details[spellIndex] = localDetail;
        } else {
          console.warn(`Spell ${spellIndex} not found in local database`);
        }
      });

      setSpellDetails(details);
    } catch (error) {
      console.error("Error loading spell details:", error);
    } finally {
      setLoadingSpells(false);
    }
  };

  const addSpellToCharacter = async (spellIndex: string) => {
    if (!character) return;

    try {
      setSaving(true);

      // Verificar se a magia existe no banco local
      const spellData = getSpellDetails(spellIndex);

      if (!spellData) {
        toast.error(`Magia "${spellIndex}" não encontrada na base de dados local`);
        return;
      }

      const currentSpellcasting = character.spellcasting || {};
      const knownSpells = currentSpellcasting.knownSpells || [];

      // Verificar se já conhece a magia
      if (knownSpells.includes(spellIndex)) {
        toast.info("Você já conhece esta magia");
        return;
      }

      // Adicionar magia
      const updatedSpellcasting = {
        ...currentSpellcasting,
        knownSpells: [...knownSpells, spellIndex],
      };

      const res = await fetch(`/api/characters/${characterId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spellcasting: updatedSpellcasting }),
      });

      if (!res.ok) throw new Error("Erro ao adicionar magia");

      const data = await res.json();
      setCharacter(data.character);

      // Recarregar detalhes das magias
      await loadSpellDetails(updatedSpellcasting.knownSpells);

      toast.success("Magia adicionada com sucesso!");
    } catch (error: any) {
      console.error("Error adding spell:", error);
      toast.error(error.message || "Erro ao adicionar magia");
    } finally {
      setSaving(false);
    }
  };

  const fetchCharacter = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/characters/${characterId}`);

      if (!res.ok) {
        if (res.status === 404) {
          toast.error("Personagem não encontrado");
          router.push("/characters");
          return;
        }
        throw new Error("Erro ao carregar personagem");
      }

      const data = await res.json();
      setCharacter(data.character);
      setIsOwner(data.isOwner);
      setIsDM(data.isDM);
      setCanEdit(data.isOwner || data.isDM);
    } catch (error: any) {
      console.error("Error fetching character:", error);
      toast.error(error.message || "Erro ao carregar personagem");
    } finally {
      setLoading(false);
    }
  }, [characterId, router]);

  useEffect(() => {
    fetchCharacter();
  }, [fetchCharacter]);

  const handleSave = async () => {
    if (!character) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/characters/${characterId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(character),
      });

      if (!res.ok) {
        throw new Error("Erro ao salvar personagem");
      }

      toast.success("Personagem salvo com sucesso!");
    } catch (error: any) {
      console.error("Error saving character:", error);
      toast.error(error.message || "Erro ao salvar personagem");
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setCharacter((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateAttribute = (key: string, value: number) => {
    setCharacter((prev: any) => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [key]: value,
      },
    }));
  };

  // Calcular modificador de perícia
  const getSkillModifier = (skillKey: string): number => {
    const skill = SKILLS.find((s) => s.key === skillKey);
    if (!skill) return 0;

    const attributeValue = attributes[skill.attribute as keyof typeof attributes] || 0;
    const baseModifier = calculateModifier(attributeValue);
    const isProficient = (character.skills && character.skills[skillKey]) || false;
    const proficiencyBonus = character.proficiencyBonus || 2;

    return Math.max(0, baseModifier + (isProficient ? proficiencyBonus : 0));
  };

  // Calcular modificador de teste de resistência
  const getSavingThrowModifier = (attributeKey: string): number => {
    const attributeValue = attributes[attributeKey as keyof typeof attributes] || 0;
    const baseModifier = calculateModifier(attributeValue);
    const isProficient = (character.savingThrows && character.savingThrows[attributeKey]) || false;
    const proficiencyBonus = character.proficiencyBonus || 2;

    return Math.max(0, baseModifier + (isProficient ? proficiencyBonus : 0));
  };

  // Obter testes de resistência da classe
  const getClassSavingThrows = (): string[] => {
    if (!character.savingThrows) return [];
    // Retornar apenas os atributos que têm proficência em saving throws
    return Object.keys(character.savingThrows).filter(
      key => character.savingThrows[key] === true
    );
  };

  if (loading) {
    return (
      <FantasyLayout>
        <div className="text-center py-12 text-muted-foreground">
          Carregando personagem...
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

  const attributes = character.attributes || {};
  const currentHp = character.currentHp || 0;
  const maxHp = character.maxHp || 10;
  const hpPercentage = maxHp > 0 ? (currentHp / maxHp) * 100 : 0;

  return (
    <FantasyLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="gap-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>

          {/* Profile Picture */}
          {character.image && (
            <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-primary/30 shadow-lg shrink-0">
              <Image
                src={character.image}
                alt={character.name}
                fill
                className="object-cover"
              />
            </div>
          )}

          <div className="flex-1">
            <h1 className="text-4xl font-bold font-cinzel text-primary">
              {character.name || "Personagem Sem Nome"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {character.race || "Desconhecido"} • {character.characterClass || "Sem Classe"}
              {character.subclass && ` • ${character.subclass}`}
              {character.pact && ` • ${character.pact}`}
              • Nível {character.level || 1}
            </p>
          </div>
          {canEdit && (
            <Button onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          )}
        </div>

        {/* Level Up Notification */}
        {character.needsLevelUp && isOwner && (
          <Card className="bg-gradient-to-r from-primary/20 to-primary/10 border-primary/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/20 rounded-full">
                    <Award className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-cinzel text-primary mb-1">
                      Parabéns! Você subiu de nível!
                    </h3>
                    <p className="text-muted-foreground">
                      Complete o processo de level up rolando seu dado de vida e selecionando novas magias (se aplicável).
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        toast.info("Recalculando nível...");
                        const res = await fetch(`/api/characters/${characterId}/recalculate-level`, {
                          method: "POST",
                        });
                        const data = await res.json();
                        if (res.ok) {
                          toast.success(data.message);
                          window.location.reload();
                        } else {
                          toast.error(data.error || "Erro ao recalcular nível");
                        }
                      } catch (error) {
                        toast.error("Erro ao recalcular nível");
                      }
                    }}
                    className="border-primary/30 hover:bg-primary/10"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Corrigir Nível
                  </Button>
                  <Button
                    onClick={() => router.push(`/characters/${characterId}/level-up`)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Award className="h-4 w-4 mr-2" />
                    Completar Level Up
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="bg-card/60 border-red-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-5 h-5 text-red-400" />
                <Label className="text-sm text-muted-foreground">Vida</Label>
              </div>
              <div className="text-2xl font-bold">{currentHp} / {maxHp}</div>
              <div className="w-full bg-secondary/20 rounded-full h-2 mt-2">
                <div
                  className="bg-red-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(hpPercentage, 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/60 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-blue-400" />
                <Label className="text-sm text-muted-foreground">CA</Label>
              </div>
              <div className="text-2xl font-bold">{character.armorClass || 10}</div>
            </CardContent>
          </Card>

          <Card className="bg-card/60 border-yellow-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <Label className="text-sm text-muted-foreground">Iniciativa</Label>
              </div>
              <div className="text-2xl font-bold">
                {character.initiative !== undefined && character.initiative !== null
                  ? (character.initiative >= 0 ? "+" : "") + character.initiative
                  : "0"}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/60 border-green-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Move className="w-5 h-5 text-green-400" />
                <Label className="text-sm text-muted-foreground">Deslocamento</Label>
              </div>
              <div className="text-2xl font-bold">{character.speed || 30}</div>
            </CardContent>
          </Card>

          <Card className="bg-card/60 border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-purple-400" />
                <Label className="text-sm text-muted-foreground">Proficiência</Label>
              </div>
              <div className="text-2xl font-bold">
                +{character.proficiencyBonus || 2}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/60 border-cyan-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-cyan-400" />
                <Label className="text-sm text-muted-foreground">XP</Label>
              </div>
              <div className="text-2xl font-bold">{character.experiencePoints || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="atributos" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="atributos" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Atributos
            </TabsTrigger>
            <TabsTrigger value="combate" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Combate
            </TabsTrigger>
            <TabsTrigger value="pericias" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Perícias
            </TabsTrigger>
            <TabsTrigger value="magias" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Magias
            </TabsTrigger>
            <TabsTrigger value="inventario" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Inventário
            </TabsTrigger>
            <TabsTrigger value="notas" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Notas
            </TabsTrigger>
          </TabsList>

          {/* Tab: Atributos */}
          <TabsContent value="atributos">
            <div className="space-y-6">
              {/* Informações da Classe e Subclasse */}
              <Card className="bg-card/60 border-white/10">
                <CardHeader>
                  <CardTitle className="text-xl font-cinzel flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Classe e Especialização
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-background/50 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-1">Classe</p>
                      <p className="text-lg font-bold text-primary">{character.characterClass}</p>
                    </div>

                    {character.subclass && (
                      <div className="bg-background/50 rounded-lg p-4">
                        <p className="text-sm text-muted-foreground mb-1">
                          {character.characterClass === 'Bruxo' ? 'Patrono' : 'Subclasse'}
                        </p>
                        <p className="text-lg font-bold text-primary">{character.subclass}</p>
                      </div>
                    )}

                    {character.characterClass === 'Bruxo' && character.pact && (
                      <div className="bg-background/50 rounded-lg p-4 border-2 border-primary/30">
                        <p className="text-sm text-muted-foreground mb-1">Pacto (Nível 3)</p>
                        <p className="text-lg font-bold text-primary">{character.pact}</p>
                      </div>
                    )}

                    {character.characterClass === 'Feiticeiro' && character.subclass === 'Linhagem Dracônica' && character.dragonType && (
                      <div className="bg-background/50 rounded-lg p-4 border-2 border-red-500/30">
                        <p className="text-sm text-muted-foreground mb-1">Dragão Ancestral</p>
                        <p className="text-lg font-bold text-red-400">{character.dragonType}</p>
                        {(() => {
                          const dragonData = getDragonType(character.dragonType);
                          if (dragonData) {
                            return (
                              <p className="text-xs text-muted-foreground mt-1">
                                Dano: {getDamageTypeLabel(dragonData.damageType)}
                              </p>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    )}

                    {character.background && (
                      <div className="bg-background/50 rounded-lg p-4">
                        <p className="text-sm text-muted-foreground mb-1">Antecedente</p>
                        <p className="text-lg font-bold">{character.background}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Talentos (Feats) */}
              {character.feats && character.feats.length > 0 && (
                <Card className="bg-card/60 border-white/10 border-l-4 border-l-amber-500">
                  <CardHeader>
                    <CardTitle className="text-xl font-cinzel flex items-center gap-2">
                      <Award className="w-5 h-5 text-amber-500" />
                      Talentos (Feats)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {character.feats.map((feat: any, idx: number) => (
                        <div key={idx} className="bg-background/50 rounded-lg p-4 border border-amber-500/20">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-bold text-lg text-amber-400">{feat.name}</h3>
                            <Badge variant="secondary" className="text-xs">
                              Nv. {feat.acquiredAt}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {feat.description}
                          </p>
                          {feat.benefits && feat.benefits.length > 0 && (
                            <div className="space-y-1">
                              <p className="text-xs font-semibold text-amber-400">Benefícios:</p>
                              <ul className="text-xs space-y-1">
                                {feat.benefits.slice(0, 3).map((benefit: string, bidx: number) => (
                                  <li key={bidx} className="flex items-start gap-1">
                                    <span className="text-green-400">✓</span>
                                    <span>{benefit}</span>
                                  </li>
                                ))}
                                {feat.benefits.length > 3 && (
                                  <li className="text-muted-foreground italic">
                                    ... e mais {feat.benefits.length - 3}
                                  </li>
                                )}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Atributos */}
              <Card className="bg-card/60 border-white/10">
                <CardHeader>
                  <CardTitle className="text-xl font-cinzel">Atributos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {ATTRIBUTES.map((attr) => {
                      const value = attributes[attr.key] || 10;
                      const modifier = calculateModifier(value);
                      const IconComponent = attr.Icon;

                      return (
                        <Card key={attr.key} className="bg-card/40 border-border">
                          <CardContent className="p-4 text-center">
                            <div className="flex justify-center mb-2">
                              <IconComponent className="w-8 h-8 text-primary" />
                            </div>
                            <div className="text-sm text-muted-foreground mb-1">{attr.label}</div>
                            <div className="text-3xl font-bold mb-2">{value}</div>
                            <div className="text-lg font-semibold text-primary">
                              {modifier >= 0 ? "+" : ""}{modifier}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab: Combate */}
          <TabsContent value="combate">
            <div className="space-y-6">
              {/* Dragão Ancestral do Feiticeiro (se aplicável) */}
              {character.characterClass === 'Feiticeiro' && character.subclass === 'Linhagem Dracônica' && character.dragonType && (
                <Card className="bg-card/60 border-white/10 border-l-4 border-l-red-500">
                  <CardHeader>
                    <CardTitle className="text-xl font-cinzel flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-red-400" />
                      Linhagem: {character.dragonType}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const dragonData = getDragonType(character.dragonType);

                      if (!dragonData) return null;

                      return (
                        <div className="space-y-3">
                          <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/20">
                            <div className="grid md:grid-cols-2 gap-3">
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">💥 Tipo de Dano</p>
                                <p className="text-lg font-bold text-red-400">
                                  {getDamageTypeLabel(dragonData.damageType)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">🔥 Arma de Sopro</p>
                                <p className="text-sm font-medium">
                                  {dragonData.breathWeapon}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-background/80 rounded-lg p-3 border border-red-500/10">
                            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Benefícios em Combate:</p>
                            <ul className="text-sm space-y-1">
                              <li className="flex items-start gap-2">
                                <span className="text-green-400 mt-0.5">✓</span>
                                <span>Resistência a dano de {getDamageTypeLabel(dragonData.damageType).toLowerCase()}</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-green-400 mt-0.5">✓</span>
                                <span>+{Math.floor(((character.attributes?.charisma || 10) - 10) / 2)} de dano bônus ao causar dano de {getDamageTypeLabel(dragonData.damageType).toLowerCase()}</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              )}

              <Card className="bg-card/60 border-white/10">
                <CardHeader>
                  <CardTitle className="text-xl font-cinzel">Informações de Combate</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="armorClass">Classe de Armadura (CA)</Label>
                    <Input
                      id="armorClass"
                      type="number"
                      value={character.armorClass || 10}
                      readOnly
                      className="bg-muted cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <Label htmlFor="initiative">Iniciativa</Label>
                    <Input
                      id="initiative"
                      type="number"
                      value={character.initiative || 0}
                      readOnly
                      className="bg-muted cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <Label htmlFor="speed">Deslocamento</Label>
                    <Input
                      id="speed"
                      type="number"
                      value={character.speed || 30}
                      readOnly
                      className="bg-muted cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <Label htmlFor="currentHp">PV Atuais</Label>
                    <Input
                      id="currentHp"
                      type="number"
                      value={currentHp}
                      readOnly
                      className="bg-muted cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxHp">PV Máximos</Label>
                    <Input
                      id="maxHp"
                      type="number"
                      value={maxHp}
                      readOnly
                      className="bg-muted cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tempHp">PV Temporários</Label>
                    <Input
                      id="tempHp"
                      type="number"
                      value={character.tempHp || 0}
                      readOnly
                      className="bg-muted cursor-not-allowed"
                    />
                  </div>
                  {/* Testes de Resistência (apenas os da classe) */}
                  {getClassSavingThrows().map((attrKey) => {
                    const attr = ATTRIBUTES.find(a => a.key === attrKey);
                    if (!attr) return null;

                    const modifier = getSavingThrowModifier(attrKey);
                    const baseModifier = calculateModifier(attributes[attrKey as keyof typeof attributes] || 0);
                    const proficiencyBonus = character.proficiencyBonus || 2;

                    return (
                      <div key={attrKey}>
                        <Label htmlFor={`savingThrow-${attrKey}`}>
                          Teste de {attr.label} ({attr.abbr})
                        </Label>
                        <Input
                          id={`savingThrow-${attrKey}`}
                          type="number"
                          value={modifier}
                          readOnly
                          className="bg-muted cursor-not-allowed"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {baseModifier >= 0 ? "+" : ""}{baseModifier} + {proficiencyBonus} prof.
                        </p>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab: Perícias */}
          <TabsContent value="pericias">
            <Card className="bg-card/60 border-white/10">
              <CardHeader>
                <CardTitle className="text-xl font-cinzel">Perícias</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {SKILLS.map((skill) => {
                    const modifier = getSkillModifier(skill.key);
                    const isProficient = (character.skills && character.skills[skill.key]) || false;
                    const attributeValue = attributes[skill.attribute as keyof typeof attributes] || 0;
                    const baseModifier = calculateModifier(attributeValue);
                    const proficiencyBonus = character.proficiencyBonus || 2;
                    const attr = ATTRIBUTES.find(a => a.key === skill.attribute);

                    return (
                      <div key={skill.key} className="flex items-center justify-between p-3 bg-card/40 rounded border border-border">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{skill.label}</span>
                            {isProficient && (
                              <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">
                                Prof.
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {attr?.abbr || skill.attribute.toUpperCase()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">
                            {modifier >= 0 ? "+" : ""}{modifier}
                          </div>
                          {isProficient && (
                            <p className="text-xs text-muted-foreground">
                              {baseModifier >= 0 ? "+" : ""}{baseModifier} + {proficiencyBonus}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Magias */}
          <TabsContent value="magias">
            {canCastSpells(character.characterClass) ? (
              <>
                {/* Slots de Magia */}
                {character.spellcasting?.spellSlots && (
                  <Card className="bg-card/60 border-white/10 mb-6">
                    <CardHeader>
                      <CardTitle className="text-xl font-cinzel flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        Slots de Magia
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-5 gap-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => {
                          const slots = character.spellcasting.spellSlots[`level${level}` as keyof typeof character.spellcasting.spellSlots] || 0;
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

                {/* Rastreador de Slots de Magia */}
                <SpellSlotTracker
                  character={character}
                  onUpdate={fetchCharacter}
                  canEdit={canEdit}
                />

                {/* Magias Preparadas */}
                <PreparedSpellsManager
                  character={character}
                  spellDetails={spellDetails}
                  onUpdate={fetchCharacter}
                />

                {/* Magias Conhecidas */}
                <Card className="bg-card/60 border-white/10">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-cinzel flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        Magias Conhecidas
                      </CardTitle>
                      {canEdit && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const spellIndex = prompt("Digite o índice da magia (ex: fireball, magic-missile):");
                            if (spellIndex && spellIndex.trim()) {
                              addSpellToCharacter(spellIndex.trim());
                            }
                          }}
                        >
                          + Adicionar Magia
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loadingSpells ? (
                      <p className="text-muted-foreground">Carregando magias...</p>
                    ) : character.spellcasting?.knownSpells && character.spellcasting.knownSpells.length > 0 ? (
                      <div className="space-y-4">
                        {/* Mostrar magias sem detalhes carregados */}
                        {character.spellcasting.knownSpells
                          .filter((spellIndex: string) => !spellDetails[spellIndex])
                          .length > 0 && (
                            <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded">
                              <p className="text-sm text-yellow-400">
                                Carregando detalhes de {character.spellcasting.knownSpells.filter((spellIndex: string) => !spellDetails[spellIndex]).length} magia(s)...
                              </p>
                            </div>
                          )}

                        {/* Agrupar por nível */}
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => {
                          const spellsAtLevel = character.spellcasting.knownSpells
                            .map((spellIndex: string) => {
                              const detail = spellDetails[spellIndex];
                              // Se não tem detalhe, ainda mostra mas sem nível específico
                              if (!detail) {
                                // Só mostra no nível 0 se não tiver detalhe
                                return level === 0 ? { index: spellIndex, detail: null, level: null } : null;
                              }
                              return detail.level === level ? { index: spellIndex, detail, level: detail.level } : null;
                            })
                            .filter((s: any) => s !== null);

                          if (spellsAtLevel.length === 0) return null;

                          return (
                            <div key={level} className="space-y-2">
                              <h3 className="font-semibold text-lg">
                                {level === 0 ? "Truques (Cantrips)" : `${level}º Nível`}
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {spellsAtLevel.map(({ index, detail }: { index: string; detail: any }) => (
                                  <Card key={index} className="bg-card/40 border-white/5">
                                    <CardHeader className="pb-2">
                                      <CardTitle className="text-base flex items-center justify-between">
                                        <span>{detail ? translateSpell(detail.name) : index}</span>
                                        {detail?.school && (
                                          <span className="text-xs text-muted-foreground">
                                            {translateDnd5e(detail.school.name)}
                                          </span>
                                        )}
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                      {detail ? (
                                        <>
                                          {detail.casting_time && (
                                            <p className="text-xs text-muted-foreground">
                                              <strong>Tempo:</strong> {translateDnd5e(detail.casting_time)}
                                            </p>
                                          )}
                                          {detail.range && (
                                            <p className="text-xs text-muted-foreground">
                                              <strong>Alcance:</strong> {translateDnd5e(detail.range)}
                                            </p>
                                          )}
                                          {detail.components && (
                                            <p className="text-xs text-muted-foreground">
                                              <strong>Componentes:</strong> {detail.components.map((c: string) => translateDnd5e(c)).join(", ")}
                                              {detail.material && ` (${detail.material})`}
                                            </p>
                                          )}
                                          {detail.duration && (
                                            <p className="text-xs text-muted-foreground">
                                              <strong>Duração:</strong> {translateDnd5e(detail.duration)}
                                            </p>
                                          )}
                                          {detail.desc && detail.desc.length > 0 && (
                                            <div className="mt-2">
                                              <p className="text-xs text-muted-foreground line-clamp-3">
                                                {detail.desc[0]}
                                              </p>
                                            </div>
                                          )}
                                        </>
                                      ) : (
                                        <p className="text-xs text-muted-foreground italic">
                                          Carregando detalhes...
                                        </p>
                                      )}
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Nenhuma magia conhecida ainda.</p>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="bg-card/60 border-white/10">
                <CardHeader>
                  <CardTitle className="text-xl font-cinzel">Magias</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Esta classe não pode conjurar magias.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tab: Inventário */}
          <TabsContent value="inventario">
            <Card className="bg-card/60 border-white/10">
              <CardHeader>
                <CardTitle className="text-xl font-cinzel flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Inventário
                </CardTitle>
              </CardHeader>
              <CardContent>
                {character.inventory && character.inventory.length > 0 ? (
                  <div className="space-y-3">
                    {character.inventory.map((item: any, index: number) => (
                      <Card key={index} className="bg-card/40 border-white/5">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold">{item.name || item.index}</h3>
                              {item.quantity > 1 && (
                                <p className="text-sm text-muted-foreground">
                                  Quantidade: {item.quantity}
                                </p>
                              )}
                              {item.cost && (
                                <p className="text-xs text-muted-foreground">
                                  Custo: {item.cost.toFixed(2)} po {item.quantity > 1 && `(Total: ${(item.cost * item.quantity).toFixed(2)} po)`}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Nenhum item no inventário ainda.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Notas */}
          <TabsContent value="notas">
            <div className="space-y-6">
              {/* Informações da Classe */}
              <Card className="bg-card/60 border-white/10">
                <CardHeader>
                  <CardTitle className="text-xl font-cinzel flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    {character.characterClass}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Habilidades de Classe (Nível {character.level})</h3>
                    <div className="space-y-3">
                      {CLASS_FEATURES[character.characterClass]
                        ?.filter(f => f.level <= character.level)
                        .map((feature, idx) => (
                          <div key={idx} className="bg-background/50 rounded-lg p-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <h4 className="font-medium text-primary">
                                  {feature.name}
                                </h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {feature.description}
                                </p>
                              </div>
                              <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded whitespace-nowrap">
                                Nv. {feature.level}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Informações da Subclasse */}
              {character.subclass && (
                <Card className="bg-card/60 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-xl font-cinzel flex items-center gap-2">
                      <Star className="w-5 h-5" />
                      {character.subclass}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(() => {
                      const subclassData = ALL_SUBCLASSES.find(
                        s => s.name === character.subclass
                      );

                      if (!subclassData) return null;

                      return (
                        <>
                          <div className="bg-background/50 rounded-lg p-3">
                            <p className="text-sm text-muted-foreground">
                              {subclassData.description}
                            </p>
                          </div>

                          <div>
                            <h3 className="font-semibold text-lg mb-2">Habilidades de Subclasse</h3>
                            <div className="space-y-3">
                              {subclassData.features
                                ?.filter(f => f.level <= character.level)
                                .map((feature, idx) => (
                                  <div key={idx} className="bg-background/50 rounded-lg p-3">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex-1">
                                        <h4 className="font-medium text-primary">
                                          {feature.name}
                                        </h4>
                                        <p className="text-sm text-muted-foreground mt-1">
                                          {feature.description}
                                        </p>
                                      </div>
                                      <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded whitespace-nowrap">
                                        Nv. {feature.level}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </CardContent>
                </Card>
              )}

              {/* Pacto (para Bruxo) */}
              {character.characterClass === 'Bruxo' && character.pact && (
                <Card className="bg-card/60 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-xl font-cinzel flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      {character.pact}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const pactData = ALL_SUBCLASSES.find(
                        s => s.name === character.pact && s.type === 'pact'
                      );

                      if (!pactData) return null;

                      return (
                        <div className="space-y-3">
                          <div className="bg-background/50 rounded-lg p-3">
                            <p className="text-sm text-muted-foreground">
                              {pactData.description}
                            </p>
                          </div>

                          {pactData.features && pactData.features.length > 0 && (
                            <div className="space-y-2">
                              {pactData.features.map((feature, idx) => (
                                <div key={idx} className="bg-background/50 rounded-lg p-3">
                                  <h4 className="font-medium text-primary">{feature.name}</h4>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {feature.description}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              )}

              {/* Dragão Ancestral (para Feiticeiro Dracônico) */}
              {character.characterClass === 'Feiticeiro' && character.subclass === 'Linhagem Dracônica' && character.dragonType && (
                <Card className="bg-card/60 border-white/10 border-l-4 border-l-red-500">
                  <CardHeader>
                    <CardTitle className="text-xl font-cinzel flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-red-400" />
                      Dragão Ancestral
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const dragonData = getDragonType(character.dragonType);

                      if (!dragonData) return null;

                      return (
                        <div className="space-y-3">
                          <div className="bg-background/50 rounded-lg p-4">
                            <h3 className="text-2xl font-bold text-red-400 mb-2">{dragonData.name}</h3>
                            <div className="grid md:grid-cols-2 gap-3 mt-3">
                              <div className="bg-background/80 rounded p-3">
                                <p className="text-xs text-muted-foreground mb-1">Tipo de Dano</p>
                                <p className="text-lg font-bold text-primary">
                                  {getDamageTypeLabel(dragonData.damageType)}
                                </p>
                              </div>
                              <div className="bg-background/80 rounded p-3">
                                <p className="text-xs text-muted-foreground mb-1">Arma de Sopro</p>
                                <p className="text-sm font-medium">
                                  {dragonData.breathWeapon}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-background/50 rounded-lg p-3">
                            <h4 className="font-medium text-primary mb-2">Benefícios da Linhagem</h4>
                            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                              <li>Você pode falar, ler e escrever Dracônico</li>
                              <li>Resistência a dano de {getDamageTypeLabel(dragonData.damageType).toLowerCase()}</li>
                              <li>Ao causar dano de {getDamageTypeLabel(dragonData.damageType).toLowerCase()}, você pode adicionar seu modificador de Carisma</li>
                            </ul>
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              )}

              {/* Antecedente */}
              {character.background && (
                <Card className="bg-card/60 border-white/10 border-l-4 border-l-amber-500">
                  <CardHeader>
                    <CardTitle className="text-xl font-cinzel flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-amber-500" />
                      Antecedente: {character.background}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      // Buscar dados do antecedente
                      const { BACKGROUNDS } = require('@/lib/backgrounds');
                      const backgroundData = BACKGROUNDS.find(
                        (b: any) => b.name === character.background
                      );

                      if (!backgroundData) return (
                        <p className="text-muted-foreground">
                          Informações do antecedente não disponíveis.
                        </p>
                      );

                      return (
                        <div className="space-y-4">
                          {/* Feature do Antecedente */}
                          <div className="bg-amber-500/10 rounded-lg p-4 border border-amber-500/20">
                            <h4 className="font-bold text-amber-400 mb-2 flex items-center gap-2">
                              <Sparkles className="w-4 h-4" />
                              {backgroundData.feature.name}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {backgroundData.feature.description}
                            </p>
                          </div>

                          {/* Benefícios */}
                          <div className="grid md:grid-cols-2 gap-3">
                            {/* Perícias */}
                            {backgroundData.skillProficiencies && backgroundData.skillProficiencies.length > 0 && (
                              <div className="bg-background/50 rounded-lg p-3">
                                <h4 className="font-medium text-primary mb-2 text-sm">📚 Perícias</h4>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                  {backgroundData.skillProficiencies.map((skill: string, idx: number) => {
                                    const skillData = SKILLS.find(s => s.key === skill);
                                    return (
                                      <li key={idx} className="flex items-center gap-1">
                                        <span className="text-green-400">✓</span>
                                        {skillData?.label || skill}
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                            )}

                            {/* Proficiências em Ferramentas */}
                            {backgroundData.toolProficiencies && backgroundData.toolProficiencies.length > 0 && (
                              <div className="bg-background/50 rounded-lg p-3">
                                <h4 className="font-medium text-primary mb-2 text-sm">🔧 Ferramentas</h4>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                  {backgroundData.toolProficiencies.map((tool: string, idx: number) => (
                                    <li key={idx} className="flex items-center gap-1">
                                      <span className="text-green-400">✓</span>
                                      {tool}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Idiomas */}
                            {backgroundData.languages && backgroundData.languages > 0 && (
                              <div className="bg-background/50 rounded-lg p-3">
                                <h4 className="font-medium text-primary mb-2 text-sm">🗣️ Idiomas</h4>
                                <p className="text-sm text-muted-foreground">
                                  +{backgroundData.languages} idioma(s) adicional(is) à sua escolha
                                </p>
                              </div>
                            )}

                            {/* Equipamento */}
                            {backgroundData.equipment && backgroundData.equipment.length > 0 && (
                              <div className="bg-background/50 rounded-lg p-3">
                                <h4 className="font-medium text-primary mb-2 text-sm">🎒 Equipamento Inicial</h4>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                  {backgroundData.equipment.slice(0, 5).map((item: string, idx: number) => (
                                    <li key={idx} className="flex items-center gap-1">
                                      <span className="text-amber-400">•</span>
                                      {item}
                                    </li>
                                  ))}
                                  {backgroundData.equipment.length > 5 && (
                                    <li className="text-xs italic">
                                      ... e mais {backgroundData.equipment.length - 5} itens
                                    </li>
                                  )}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              )}

              {/* Notas Personalizadas */}
              <Card className="bg-card/60 border-white/10">
                <CardHeader>
                  <CardTitle className="text-xl font-cinzel flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Notas Personalizadas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={character.notes || ""}
                    onChange={(e) => updateField("notes", e.target.value)}
                    disabled={!canEdit}
                    rows={10}
                    className={!canEdit ? "bg-muted cursor-not-allowed" : ""}
                    placeholder="Anotações adicionais sobre o personagem..."
                  />
                </CardContent>
              </Card>

              {/* Financeiro */}
              <Card className="bg-card/60 border-white/10">
                <CardHeader>
                  <CardTitle className="text-xl font-cinzel flex items-center gap-2">
                    <Coins className="w-5 h-5" />
                    Financeiro
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <Label htmlFor="pp">Platinas (PP)</Label>
                      <Input
                        id="pp"
                        type="number"
                        min="0"
                        value={character.currency?.pp || 0}
                        onChange={(e) => updateField("currency", {
                          ...character.currency,
                          pp: parseInt(e.target.value) || 0,
                        })}
                        disabled={!canEdit}
                        className={!canEdit ? "bg-muted cursor-not-allowed" : ""}
                      />
                    </div>
                    <div>
                      <Label htmlFor="gp">Peças de Ouro (PO)</Label>
                      <Input
                        id="gp"
                        type="number"
                        min="0"
                        value={character.currency?.gp || 0}
                        onChange={(e) => updateField("currency", {
                          ...character.currency,
                          gp: parseInt(e.target.value) || 0,
                        })}
                        disabled={!canEdit}
                        className={!canEdit ? "bg-muted cursor-not-allowed" : ""}
                      />
                    </div>
                    <div>
                      <Label htmlFor="ep">Peças de Electrum (PE)</Label>
                      <Input
                        id="ep"
                        type="number"
                        min="0"
                        value={character.currency?.ep || 0}
                        onChange={(e) => updateField("currency", {
                          ...character.currency,
                          ep: parseInt(e.target.value) || 0,
                        })}
                        disabled={!canEdit}
                        className={!canEdit ? "bg-muted cursor-not-allowed" : ""}
                      />
                    </div>
                    <div>
                      <Label htmlFor="sp">Peças de Prata (PP)</Label>
                      <Input
                        id="sp"
                        type="number"
                        min="0"
                        value={character.currency?.sp || 0}
                        onChange={(e) => updateField("currency", {
                          ...character.currency,
                          sp: parseInt(e.target.value) || 0,
                        })}
                        disabled={!canEdit}
                        className={!canEdit ? "bg-muted cursor-not-allowed" : ""}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cp">Peças de Cobre (PC)</Label>
                      <Input
                        id="cp"
                        type="number"
                        min="0"
                        value={character.currency?.cp || 0}
                        onChange={(e) => updateField("currency", {
                          ...character.currency,
                          cp: parseInt(e.target.value) || 0,
                        })}
                        disabled={!canEdit}
                        className={!canEdit ? "bg-muted cursor-not-allowed" : ""}
                      />
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-card/40 rounded">
                    <p className="text-sm text-muted-foreground">
                      <strong>Total em Ouro:</strong>{" "}
                      {((character.currency?.pp || 0) * 10 +
                        (character.currency?.gp || 0) +
                        (character.currency?.ep || 0) * 0.5 +
                        (character.currency?.sp || 0) * 0.1 +
                        (character.currency?.cp || 0) * 0.01).toFixed(2)}{" "}
                      po
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </FantasyLayout>
  );
}

