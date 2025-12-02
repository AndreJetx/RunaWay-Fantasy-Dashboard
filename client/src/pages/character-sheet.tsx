import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FantasyLayout } from "@/components/layout/FantasyLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  Save, 
  Heart, 
  Shield, 
  Zap, 
  Swords,
  Brain,
  Dumbbell,
  Target,
  Wind,
  Eye,
  MessageSquare,
  Sparkles,
  Scroll,
  Backpack,
  Star,
  Crown
} from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import type { Character } from "@shared/schema";
import avatarPlaceholder from "@assets/generated_images/fantasy_character_avatar_placeholder.png";

const ATTRIBUTES_DND = [
  { key: "strength", name: "Força", icon: Dumbbell },
  { key: "dexterity", name: "Destreza", icon: Target },
  { key: "constitution", name: "Constituição", icon: Heart },
  { key: "intelligence", name: "Inteligência", icon: Brain },
  { key: "wisdom", name: "Sabedoria", icon: Eye },
  { key: "charisma", name: "Carisma", icon: Crown },
];

const SKILLS_DND = [
  { key: "acrobatics", name: "Acrobacia", attr: "dexterity" },
  { key: "animalHandling", name: "Trato com Animais", attr: "wisdom" },
  { key: "arcana", name: "Arcanismo", attr: "intelligence" },
  { key: "athletics", name: "Atletismo", attr: "strength" },
  { key: "deception", name: "Enganação", attr: "charisma" },
  { key: "history", name: "História", attr: "intelligence" },
  { key: "insight", name: "Intuição", attr: "wisdom" },
  { key: "intimidation", name: "Intimidação", attr: "charisma" },
  { key: "investigation", name: "Investigação", attr: "intelligence" },
  { key: "medicine", name: "Medicina", attr: "wisdom" },
  { key: "nature", name: "Natureza", attr: "intelligence" },
  { key: "perception", name: "Percepção", attr: "wisdom" },
  { key: "performance", name: "Atuação", attr: "charisma" },
  { key: "persuasion", name: "Persuasão", attr: "charisma" },
  { key: "religion", name: "Religião", attr: "intelligence" },
  { key: "sleightOfHand", name: "Prestidigitação", attr: "dexterity" },
  { key: "stealth", name: "Furtividade", attr: "dexterity" },
  { key: "survival", name: "Sobrevivência", attr: "wisdom" },
];

function getModifier(value: number): number {
  return Math.floor((value - 10) / 2);
}

function formatModifier(value: number): string {
  const mod = getModifier(value);
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

export default function CharacterSheet() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { isDm, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [hasChanges, setHasChanges] = useState(false);
  const [form, setForm] = useState<Partial<Character>>({});

  const { data: character, isLoading } = useQuery({
    queryKey: ["character", id],
    queryFn: () => api.getCharacter(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (character) {
      setForm(character);
    }
  }, [character]);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Character>) => api.updateCharacter(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["character", id] });
      setHasChanges(false);
      toast({ title: "Ficha salva!", description: "Alterações registradas com sucesso" });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Erro", description: error.message });
    },
  });

  const updateField = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const updateAttributes = (key: string, value: number) => {
    const current = form.attributes || {};
    updateField("attributes", { ...current, [key]: value });
  };

  const updateSkills = (key: string, value: number) => {
    const current = form.skills || {};
    updateField("skills", { ...current, [key]: value });
  };

  const handleSave = () => {
    updateMutation.mutate(form);
  };

  if (isLoading) {
    return (
      <FantasyLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </FantasyLayout>
    );
  }

  if (!character) {
    return (
      <FantasyLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-cinzel text-destructive">Personagem não encontrado</h2>
        </div>
      </FantasyLayout>
    );
  }

  const isOwner = character.playerId === user?.id;
  const canEdit = isOwner || isDm;
  const attrs = form.attributes || {};
  const skills = form.skills || {};

  return (
    <FantasyLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation(`/campaign/${character.campaignId}`)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold font-cinzel text-primary">{form.name}</h1>
              <p className="text-muted-foreground">
                {form.race} • {form.characterClass} • Nível {form.level}
              </p>
            </div>
          </div>
          
          {canEdit && (
            <Button 
              onClick={handleSave}
              disabled={!hasChanges || updateMutation.isPending}
              className="bg-gradient-to-r from-primary to-secondary"
            >
              <Save className="w-4 h-4 mr-2" />
              {updateMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          )}
        </div>

        {/* Quick Stats Bar */}
        <Card className="bg-gradient-to-r from-card/80 to-card/40 border-primary/20">
          <CardContent className="py-4">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Heart className="w-5 h-5 text-red-400" />
                  <span className="text-xs text-muted-foreground">Vida</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <Input
                    type="number"
                    value={form.currentHp || 0}
                    onChange={(e) => updateField("currentHp", parseInt(e.target.value) || 0)}
                    disabled={!canEdit}
                    className="w-16 h-8 text-center bg-black/20 border-red-500/30"
                  />
                  <span className="text-muted-foreground">/</span>
                  <Input
                    type="number"
                    value={form.maxHp || 0}
                    onChange={(e) => updateField("maxHp", parseInt(e.target.value) || 0)}
                    disabled={!canEdit}
                    className="w-16 h-8 text-center bg-black/20 border-red-500/30"
                  />
                </div>
                <Progress 
                  value={(form.currentHp || 0) / (form.maxHp || 1) * 100} 
                  className="h-1 mt-2"
                />
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Shield className="w-5 h-5 text-blue-400" />
                  <span className="text-xs text-muted-foreground">CA</span>
                </div>
                <Input
                  type="number"
                  value={form.armorClass || 10}
                  onChange={(e) => updateField("armorClass", parseInt(e.target.value) || 10)}
                  disabled={!canEdit}
                  className="w-16 h-10 text-center text-xl font-bold bg-black/20 border-blue-500/30 mx-auto"
                />
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <span className="text-xs text-muted-foreground">Iniciativa</span>
                </div>
                <Input
                  type="number"
                  value={form.initiative || 0}
                  onChange={(e) => updateField("initiative", parseInt(e.target.value) || 0)}
                  disabled={!canEdit}
                  className="w-16 h-10 text-center text-xl font-bold bg-black/20 border-yellow-500/30 mx-auto"
                />
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Wind className="w-5 h-5 text-green-400" />
                  <span className="text-xs text-muted-foreground">Deslocamento</span>
                </div>
                <Input
                  type="number"
                  value={form.speed || 30}
                  onChange={(e) => updateField("speed", parseInt(e.target.value) || 30)}
                  disabled={!canEdit}
                  className="w-16 h-10 text-center text-xl font-bold bg-black/20 border-green-500/30 mx-auto"
                />
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Star className="w-5 h-5 text-purple-400" />
                  <span className="text-xs text-muted-foreground">Proficiência</span>
                </div>
                <div className="text-2xl font-bold text-purple-400">
                  +{Math.ceil(form.level || 1 / 4) + 1}
                </div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  <span className="text-xs text-muted-foreground">XP</span>
                </div>
                <Input
                  type="number"
                  value={form.experiencePoints || 0}
                  onChange={(e) => updateField("experiencePoints", parseInt(e.target.value) || 0)}
                  disabled={!canEdit}
                  className="w-20 h-10 text-center text-lg font-bold bg-black/20 border-cyan-500/30 mx-auto"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="attributes" className="space-y-6">
          <TabsList className="bg-card/50 border border-white/10 flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="attributes" className="data-[state=active]:bg-primary/20">
              <Dumbbell className="w-4 h-4 mr-2" /> Atributos
            </TabsTrigger>
            <TabsTrigger value="combat" className="data-[state=active]:bg-primary/20">
              <Swords className="w-4 h-4 mr-2" /> Combate
            </TabsTrigger>
            <TabsTrigger value="skills" className="data-[state=active]:bg-primary/20">
              <Target className="w-4 h-4 mr-2" /> Perícias
            </TabsTrigger>
            <TabsTrigger value="spells" className="data-[state=active]:bg-primary/20">
              <Sparkles className="w-4 h-4 mr-2" /> Magias
            </TabsTrigger>
            <TabsTrigger value="inventory" className="data-[state=active]:bg-primary/20">
              <Backpack className="w-4 h-4 mr-2" /> Inventário
            </TabsTrigger>
            <TabsTrigger value="notes" className="data-[state=active]:bg-primary/20">
              <Scroll className="w-4 h-4 mr-2" /> Notas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="attributes" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {ATTRIBUTES_DND.map((attr) => {
                const value = (attrs as any)[attr.key] || 10;
                const Icon = attr.icon;
                return (
                  <Card key={attr.key} className="bg-card/40 border-primary/20 text-center">
                    <CardContent className="pt-4">
                      <Icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                      <Label className="text-xs text-muted-foreground block mb-2">{attr.name}</Label>
                      <Input
                        type="number"
                        min={1}
                        max={30}
                        value={value}
                        onChange={(e) => updateAttributes(attr.key, parseInt(e.target.value) || 10)}
                        disabled={!canEdit}
                        className="w-16 h-12 text-center text-2xl font-bold bg-black/30 border-primary/30 mx-auto"
                      />
                      <div className="mt-2 text-xl font-cinzel text-primary">
                        {formatModifier(value)}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="combat" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-card/40 border-primary/20">
                <CardHeader>
                  <CardTitle className="font-cinzel text-lg flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-400" /> Pontos de Vida
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs">HP Atual</Label>
                      <Input
                        type="number"
                        value={form.currentHp || 0}
                        onChange={(e) => updateField("currentHp", parseInt(e.target.value) || 0)}
                        disabled={!canEdit}
                        className="bg-black/20"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">HP Máximo</Label>
                      <Input
                        type="number"
                        value={form.maxHp || 0}
                        onChange={(e) => updateField("maxHp", parseInt(e.target.value) || 0)}
                        disabled={!canEdit}
                        className="bg-black/20"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">HP Temporário</Label>
                    <Input
                      type="number"
                      value={form.tempHp || 0}
                      onChange={(e) => updateField("tempHp", parseInt(e.target.value) || 0)}
                      disabled={!canEdit}
                      className="bg-black/20"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Dados de Vida</Label>
                    <Input
                      type="text"
                      value={form.hitDice || `${form.level}d8`}
                      onChange={(e) => updateField("hitDice", e.target.value)}
                      disabled={!canEdit}
                      className="bg-black/20"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/40 border-primary/20">
                <CardHeader>
                  <CardTitle className="font-cinzel text-lg flex items-center gap-2">
                    <Swords className="w-5 h-5 text-orange-400" /> Combate e Notas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Liste ataques, armas, resistências..."
                    value={form.notes || ""}
                    onChange={(e) => updateField("notes", e.target.value)}
                    disabled={!canEdit}
                    className="bg-black/20 min-h-[200px]"
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="skills" className="space-y-6">
            <Card className="bg-card/40 border-primary/20">
              <CardHeader>
                <CardTitle className="font-cinzel text-lg">Perícias</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {SKILLS_DND.map((skill) => {
                    const attrValue = (attrs as any)[skill.attr] || 10;
                    const bonus = (skills as any)[skill.key] || 0;
                    const total = getModifier(attrValue) + bonus;
                    return (
                      <div key={skill.key} className="flex items-center gap-3 p-2 bg-white/5 rounded">
                        <Input
                          type="number"
                          value={bonus}
                          onChange={(e) => updateSkills(skill.key, parseInt(e.target.value) || 0)}
                          disabled={!canEdit}
                          className="w-14 h-8 text-center bg-black/30 border-primary/30"
                        />
                        <span className="flex-1 text-sm">{skill.name}</span>
                        <Badge className="bg-primary/20 text-primary border-primary/30">
                          {total >= 0 ? `+${total}` : total}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="spells" className="space-y-6">
            <Card className="bg-card/40 border-primary/20">
              <CardHeader>
                <CardTitle className="font-cinzel text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" /> Magias
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs">Atributo de Conjuração</Label>
                    <Input
                      value={form.spellcasting?.spellcastingAbility || ""}
                      onChange={(e) => updateField("spellcasting", { ...form.spellcasting, spellcastingAbility: e.target.value })}
                      disabled={!canEdit}
                      placeholder="INT, SAB, CAR..."
                      className="bg-black/20"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">CD de Magia</Label>
                    <Input
                      type="number"
                      value={form.spellcasting?.spellSaveDC || 0}
                      onChange={(e) => updateField("spellcasting", { ...form.spellcasting, spellSaveDC: parseInt(e.target.value) || 0 })}
                      disabled={!canEdit}
                      className="bg-black/20"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Bônus de Ataque</Label>
                    <Input
                      type="number"
                      value={form.spellcasting?.spellAttackBonus || 0}
                      onChange={(e) => updateField("spellcasting", { ...form.spellcasting, spellAttackBonus: parseInt(e.target.value) || 0 })}
                      disabled={!canEdit}
                      className="bg-black/20"
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <Label className="text-xs">Lista de Magias (use notas adicionais)</Label>
                  <p className="text-muted-foreground text-sm mt-2">
                    Use a seção de Notas para listar suas magias.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-card/40 border-primary/20">
                <CardHeader>
                  <CardTitle className="font-cinzel text-lg flex items-center gap-2">
                    <Backpack className="w-5 h-5 text-amber-400" /> Equipamentos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {(form.equipment || []).map((item, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-white/5 rounded">
                        <span className="flex-1">{item.name}</span>
                        <span className="text-muted-foreground">x{item.quantity}</span>
                      </div>
                    ))}
                    {(!form.equipment || form.equipment.length === 0) && (
                      <p className="text-muted-foreground text-center py-4">
                        Nenhum equipamento cadastrado
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/40 border-primary/20">
                <CardHeader>
                  <CardTitle className="font-cinzel text-lg">Dinheiro</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Label className="w-32 text-sm">Platina (PP)</Label>
                    <Input
                      type="number"
                      value={form.currency?.platinum || 0}
                      onChange={(e) => updateField("currency", { ...form.currency, platinum: parseInt(e.target.value) || 0 })}
                      disabled={!canEdit}
                      className="bg-black/20"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Label className="w-32 text-sm">Ouro (PO)</Label>
                    <Input
                      type="number"
                      value={form.currency?.gold || 0}
                      onChange={(e) => updateField("currency", { ...form.currency, gold: parseInt(e.target.value) || 0 })}
                      disabled={!canEdit}
                      className="bg-black/20"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Label className="w-32 text-sm">Electrum (PE)</Label>
                    <Input
                      type="number"
                      value={form.currency?.electrum || 0}
                      onChange={(e) => updateField("currency", { ...form.currency, electrum: parseInt(e.target.value) || 0 })}
                      disabled={!canEdit}
                      className="bg-black/20"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Label className="w-32 text-sm">Prata (PP)</Label>
                    <Input
                      type="number"
                      value={form.currency?.silver || 0}
                      onChange={(e) => updateField("currency", { ...form.currency, silver: parseInt(e.target.value) || 0 })}
                      disabled={!canEdit}
                      className="bg-black/20"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Label className="w-32 text-sm">Cobre (PC)</Label>
                    <Input
                      type="number"
                      value={form.currency?.copper || 0}
                      onChange={(e) => updateField("currency", { ...form.currency, copper: parseInt(e.target.value) || 0 })}
                      disabled={!canEdit}
                      className="bg-black/20"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notes" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-card/40 border-primary/20">
                <CardHeader>
                  <CardTitle className="font-cinzel text-lg">História do Personagem</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Conte a história do seu personagem..."
                    value={form.backstory || ""}
                    onChange={(e) => updateField("backstory", e.target.value)}
                    disabled={!canEdit}
                    className="bg-black/20 min-h-[200px]"
                  />
                </CardContent>
              </Card>

              <Card className="bg-card/40 border-primary/20">
                <CardHeader>
                  <CardTitle className="font-cinzel text-lg">Características e Traços</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-xs">Traços de Personalidade</Label>
                    <Textarea
                      value={form.personalityTraits || ""}
                      onChange={(e) => updateField("personalityTraits", e.target.value)}
                      disabled={!canEdit}
                      className="bg-black/20 min-h-[60px]"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Ideais</Label>
                    <Textarea
                      value={form.ideals || ""}
                      onChange={(e) => updateField("ideals", e.target.value)}
                      disabled={!canEdit}
                      className="bg-black/20 min-h-[60px]"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Vínculos</Label>
                    <Textarea
                      value={form.bonds || ""}
                      onChange={(e) => updateField("bonds", e.target.value)}
                      disabled={!canEdit}
                      className="bg-black/20 min-h-[60px]"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Fraquezas</Label>
                    <Textarea
                      value={form.flaws || ""}
                      onChange={(e) => updateField("flaws", e.target.value)}
                      disabled={!canEdit}
                      className="bg-black/20 min-h-[60px]"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card/40 border-primary/20">
              <CardHeader>
                <CardTitle className="font-cinzel text-lg">Notas Adicionais</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Anotações, lembretes, informações da campanha..."
                  value={form.notes || ""}
                  onChange={(e) => updateField("notes", e.target.value)}
                  disabled={!canEdit}
                  className="bg-black/20 min-h-[200px]"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </FantasyLayout>
  );
}
