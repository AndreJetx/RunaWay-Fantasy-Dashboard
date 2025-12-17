"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";

// Dados dos inimigos fornecidos
const ENEMY_DATA = [
  {
    name: "Skeleton",
    cr: 0,
    type: "undead",
    size: "medium",
    alignment: "lawful evil",
    ac: 13,
    hp: "13 (2d8+4)",
    speed: "30 ft.",
    abilities: { str: 10, dex: 14, con: 15, int: 6, wis: 8, cha: 5 },
    saving_throws: [],
    skills: ["Perception +2"],
    damage_vulnerabilities: ["bludgeoning"],
    damage_resistances: [],
    damage_immunities: ["poison"],
    condition_immunities: ["poisoned"],
    senses: "darkvision 60 ft., passive Perception 9",
    languages: "understands Common but can't speak",
    actions: [
      {
        name: "Shortsword",
        bonus: 4,
        damage: "1d6+2 piercing",
        type: "melee",
        description: "",
      },
      {
        name: "Shortbow",
        bonus: 4,
        damage: "1d6+2 piercing",
        type: "ranged",
        description: "",
      },
    ],
    special_traits: [],
  },
  {
    name: "Zombie",
    cr: 0,
    type: "undead",
    size: "medium",
    alignment: "neutral evil",
    ac: 8,
    hp: "22 (3d8+9)",
    speed: "20 ft.",
    abilities: { str: 13, dex: 6, con: 16, int: 3, wis: 6, cha: 5 },
    saving_throws: [],
    skills: [],
    damage_vulnerabilities: [],
    damage_resistances: [],
    damage_immunities: ["poison"],
    condition_immunities: ["poisoned"],
    senses: "darkvision 60 ft., passive Perception 8",
    languages: "understands Common but can't speak",
    actions: [
      {
        name: "Slam",
        bonus: 3,
        damage: "1d6+1 bludgeoning",
        type: "melee",
        description: "",
      },
    ],
    special_traits: [
      {
        name: "Undead Fortitude",
        description:
          "If damage reduces the zombie to 0 HP, it makes a CON save (DC 5 + damage). On success, it drops to 1 HP instead.",
      },
    ],
  },
  {
    name: "Giant Rat",
    cr: 0,
    type: "beast",
    size: "small",
    alignment: "unaligned",
    ac: 12,
    hp: "7 (2d6)",
    speed: "30 ft.",
    abilities: { str: 7, dex: 15, con: 11, int: 2, wis: 10, cha: 4 },
    saving_throws: [],
    skills: ["Perception +2"],
    damage_vulnerabilities: [],
    damage_resistances: [],
    damage_immunities: [],
    condition_immunities: [],
    senses: "darkvision 60 ft., passive Perception 10",
    languages: "",
    actions: [
      {
        name: "Bite",
        bonus: 4,
        damage: "1d4+2 piercing",
        type: "melee",
        description: "",
      },
    ],
    special_traits: [],
  },
  {
    name: "Goblin",
    cr: 0.25,
    type: "humanoid",
    size: "small",
    alignment: "neutral evil",
    ac: 15,
    hp: "7 (2d6)",
    speed: "30 ft.",
    abilities: { str: 8, dex: 14, con: 10, int: 10, wis: 8, cha: 8 },
    saving_throws: [],
    skills: ["Stealth +6"],
    damage_vulnerabilities: [],
    damage_resistances: [],
    damage_immunities: [],
    condition_immunities: [],
    senses: "darkvision 60 ft., passive Perception 9",
    languages: "Common, Goblin",
    actions: [
      {
        name: "Scimitar",
        bonus: 4,
        damage: "1d6+2 slashing",
        type: "melee",
        description: "",
      },
      {
        name: "Shortbow",
        bonus: 4,
        damage: "1d6+2 piercing",
        type: "ranged",
        description: "",
      },
    ],
    special_traits: [
      {
        name: "Nimble Escape",
        description:
          "The goblin can take the Disengage or Hide action as a bonus action.",
      },
    ],
  },
  {
    name: "Wolf",
    cr: 0.25,
    type: "beast",
    size: "medium",
    alignment: "unaligned",
    ac: 13,
    hp: "11 (2d8+2)",
    speed: "40 ft.",
    abilities: { str: 12, dex: 15, con: 12, int: 3, wis: 12, cha: 6 },
    saving_throws: [],
    skills: ["Perception +3", "Stealth +4"],
    damage_vulnerabilities: [],
    damage_resistances: [],
    damage_immunities: [],
    condition_immunities: [],
    senses: "passive Perception 13",
    languages: "",
    actions: [
      {
        name: "Bite",
        bonus: 4,
        damage: "2d4+2 piercing",
        type: "melee",
        description:
          "Target must succeed on a DC 11 STR save or be knocked prone.",
      },
    ],
    special_traits: [
      {
        name: "Pack Tactics",
        description:
          "Advantage on attacks if an ally is within 5 ft. of the target.",
      },
    ],
  },
  {
    name: "Orc",
    cr: 0.5,
    type: "humanoid",
    size: "medium",
    alignment: "chaotic evil",
    ac: 13,
    hp: "15 (2d8+6)",
    speed: "30 ft.",
    abilities: { str: 16, dex: 12, con: 16, int: 7, wis: 11, cha: 10 },
    saving_throws: [],
    skills: ["Intimidation +2"],
    damage_vulnerabilities: [],
    damage_resistances: [],
    damage_immunities: [],
    condition_immunities: [],
    senses: "darkvision 60 ft., passive Perception 10",
    languages: "Common, Orc",
    actions: [
      {
        name: "Greataxe",
        bonus: 5,
        damage: "1d12+3 slashing",
        type: "melee",
        description: "",
      },
      {
        name: "Javelin",
        bonus: 5,
        damage: "1d6+3 piercing",
        type: "ranged",
        description: "",
      },
    ],
    special_traits: [
      {
        name: "Aggressive",
        description:
          "As a bonus action, the orc can move up to its speed toward a hostile creature it can see.",
      },
    ],
  },
  {
    name: "Bandit",
    cr: 0.5,
    type: "humanoid",
    size: "medium",
    alignment: "any non-lawful",
    ac: 12,
    hp: "11 (2d8+2)",
    speed: "30 ft.",
    abilities: { str: 11, dex: 12, con: 12, int: 10, wis: 10, cha: 10 },
    saving_throws: [],
    skills: [],
    damage_vulnerabilities: [],
    damage_resistances: [],
    damage_immunities: [],
    condition_immunities: [],
    senses: "passive Perception 10",
    languages: "Common",
    actions: [
      {
        name: "Scimitar",
        bonus: 3,
        damage: "1d6+1 slashing",
        type: "melee",
        description: "",
      },
      {
        name: "Light Crossbow",
        bonus: 3,
        damage: "1d8+1 piercing",
        type: "ranged",
        description: "",
      },
    ],
    special_traits: [],
  },
  {
    name: "Bugbear",
    cr: 1,
    type: "humanoid",
    size: "medium",
    alignment: "chaotic evil",
    ac: 16,
    hp: "27 (5d8+5)",
    speed: "30 ft.",
    abilities: { str: 15, dex: 14, con: 13, int: 8, wis: 11, cha: 9 },
    saving_throws: [],
    skills: ["Stealth +6"],
    damage_vulnerabilities: [],
    damage_resistances: [],
    damage_immunities: [],
    condition_immunities: [],
    senses: "darkvision 60 ft., passive Perception 10",
    languages: "Common, Goblin",
    actions: [
      {
        name: "Morningstar",
        bonus: 4,
        damage: "2d8+2 piercing",
        type: "melee",
        description: "",
      },
      {
        name: "Javelin",
        bonus: 4,
        damage: "1d6+2 piercing",
        type: "ranged",
        description: "",
      },
    ],
    special_traits: [
      {
        name: "Surprise Attack",
        description:
          "If the bugbear surprises a creature and hits it with an attack, the attack deals an extra 2d6 damage.",
      },
    ],
  },
  {
    name: "Hobgoblin",
    cr: 1,
    type: "humanoid",
    size: "medium",
    alignment: "lawful evil",
    ac: 18,
    hp: "11 (2d8+2)",
    speed: "30 ft.",
    abilities: { str: 13, dex: 12, con: 12, int: 10, wis: 10, cha: 9 },
    saving_throws: [],
    skills: ["Athletics +3", "Intimidation +1"],
    damage_vulnerabilities: [],
    damage_resistances: [],
    damage_immunities: [],
    condition_immunities: [],
    senses: "darkvision 60 ft., passive Perception 10",
    languages: "Common, Goblin",
    actions: [
      {
        name: "Longsword",
        bonus: 3,
        damage: "1d8+1 slashing",
        type: "melee",
        description: "",
      },
      {
        name: "Longbow",
        bonus: 3,
        damage: "1d8+1 piercing",
        type: "ranged",
        description: "",
      },
    ],
    special_traits: [
      {
        name: "Martial Advantage",
        description:
          "Once per turn, the hobgoblin can deal an extra 2d6 damage to a creature it hits with a weapon attack if that creature is within 5 ft. of an ally.",
      },
    ],
  },
  {
    name: "Gelatinous Cube",
    cr: 1,
    type: "ooze",
    size: "large",
    alignment: "unaligned",
    ac: 6,
    hp: "84 (8d10+40)",
    speed: "15 ft.",
    abilities: { str: 14, dex: 3, con: 20, int: 1, wis: 6, cha: 1 },
    saving_throws: [],
    skills: [],
    damage_vulnerabilities: [],
    damage_resistances: [],
    damage_immunities: ["acid"],
    condition_immunities: [
      "blinded",
      "charmed",
      "deafened",
      "exhaustion",
      "frightened",
      "prone",
    ],
    senses: "blindsight 60 ft., passive Perception 8",
    languages: "",
    actions: [
      {
        name: "Pseudopod",
        bonus: 4,
        damage: "3d6+2 acid",
        type: "melee",
        description: "On hit, target is engulfed.",
      },
    ],
    special_traits: [
      {
        name: "Engulf",
        description:
          "Targets failing a DC 12 DEX save are engulfed and take acid damage each turn.",
      },
    ],
  },
  {
    name: "Ogre",
    cr: 2,
    type: "giant",
    size: "large",
    alignment: "chaotic evil",
    ac: 11,
    hp: "59 (7d10+21)",
    speed: "40 ft.",
    abilities: { str: 19, dex: 8, con: 16, int: 5, wis: 7, cha: 7 },
    saving_throws: [],
    skills: [],
    damage_vulnerabilities: [],
    damage_resistances: [],
    damage_immunities: [],
    condition_immunities: [],
    senses: "darkvision 60 ft., passive Perception 8",
    languages: "Giant",
    actions: [
      {
        name: "Greatclub",
        bonus: 6,
        damage: "2d8+4 bludgeoning",
        type: "melee",
        description: "",
      },
      {
        name: "Javelin",
        bonus: 6,
        damage: "2d6+4 piercing",
        type: "ranged",
        description: "",
      },
    ],
    special_traits: [],
  },
  {
    name: "Giant Spider",
    cr: 2,
    type: "beast",
    size: "large",
    alignment: "unaligned",
    ac: 14,
    hp: "26 (4d10+4)",
    speed: "30 ft., climb 30 ft.",
    abilities: { str: 14, dex: 16, con: 12, int: 2, wis: 11, cha: 4 },
    saving_throws: [],
    skills: ["Stealth +7"],
    damage_vulnerabilities: [],
    damage_resistances: [],
    damage_immunities: [],
    condition_immunities: [],
    senses: "blindsight 10 ft., darkvision 60 ft., passive Perception 11",
    languages: "",
    actions: [
      {
        name: "Bite",
        bonus: 5,
        damage: "1d8+3 piercing + 2d8 poison",
        type: "melee",
        description: "DC 12 CON save, half on success.",
      },
      {
        name: "Web",
        bonus: 5,
        damage: "",
        type: "ranged",
        description: "Restrains target (DC 12 STR to escape).",
      },
    ],
    special_traits: [],
  },
  {
    name: "Veteran Guard",
    cr: 2,
    type: "humanoid",
    size: "medium",
    alignment: "any",
    ac: 16,
    hp: "58 (9d8+18)",
    speed: "30 ft.",
    abilities: { str: 13, dex: 12, con: 14, int: 10, wis: 11, cha: 10 },
    saving_throws: [],
    skills: ["Perception +2"],
    damage_vulnerabilities: [],
    damage_resistances: [],
    damage_immunities: [],
    condition_immunities: [],
    senses: "passive Perception 12",
    languages: "Common",
    actions: [
      {
        name: "Multiattack",
        bonus: 0,
        damage: "",
        type: "other",
        description: "Makes 2 longsword attacks.",
      },
      {
        name: "Longsword",
        bonus: 3,
        damage: "1d8+1 slashing",
        type: "melee",
        description: "",
      },
      {
        name: "Longbow",
        bonus: 3,
        damage: "1d8+1 piercing",
        type: "ranged",
        description: "",
      },
    ],
    special_traits: [],
  },
];

interface CreateEnemyDialogProps {
  campaignId: string;
  chapterId?: string | null;
  onEnemyCreated?: () => void;
}

export function CreateEnemyDialog({
  campaignId,
  chapterId,
  onEnemyCreated,
}: CreateEnemyDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [crFilter, setCrFilter] = useState<string>("all");
  const [selectedEnemy, setSelectedEnemy] = useState<any>(null);
  const [customName, setCustomName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [creating, setCreating] = useState(false);

  // Obter todos os CRs únicos para o filtro
  const uniqueCRs = Array.from(new Set(ENEMY_DATA.map((enemy) => enemy.cr.toString()))).sort((a, b) => {
    const numA = parseFloat(a);
    const numB = parseFloat(b);
    return numA - numB;
  });

  const filteredEnemies = ENEMY_DATA.filter((enemy) => {
    const matchesSearch =
      enemy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enemy.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCR = crFilter === "all" || enemy.cr.toString() === crFilter;
    return matchesSearch && matchesCR;
  });

  const handleSelectEnemy = (enemy: any) => {
    setSelectedEnemy(enemy);
    setCustomName(enemy.name);
    setImageUrl("");
  };

  const handleCreate = async () => {
    if (!selectedEnemy) {
      toast.error("Selecione um inimigo primeiro");
      return;
    }

    setCreating(true);
    try {
      // Preparar dados do inimigo para envio
      const hpMatch = selectedEnemy.hp?.match(/\d+/);
      const hpValue = hpMatch ? parseInt(hpMatch[0], 10) : 10;
      
      const speedMatch = selectedEnemy.speed?.match(/\d+/);
      const speedValue = speedMatch ? parseInt(speedMatch[0], 10) : 30;

      const enemyData: any = {
        name: customName || selectedEnemy.name,
        challengeRating: selectedEnemy.cr?.toString() || undefined,
        type: "enemy", // Sempre definir como "enemy" quando criar através deste dialog
        size: selectedEnemy.size || undefined,
        alignment: selectedEnemy.alignment || undefined,
        armorClass: selectedEnemy.ac || 10,
        maxHp: hpValue,
        currentHp: hpValue,
        speed: speedValue,
        hitDice: selectedEnemy.hp || undefined,
        abilities: selectedEnemy.abilities || {},
        savingThrows: selectedEnemy.saving_throws || [],
        skills: selectedEnemy.skills || [],
        damageVulnerabilities: selectedEnemy.damage_vulnerabilities || [],
        damageResistances: selectedEnemy.damage_resistances || [],
        damageImmunities: selectedEnemy.damage_immunities || [],
        conditionImmunities: selectedEnemy.condition_immunities || [],
        senses: selectedEnemy.senses || undefined,
        languages: selectedEnemy.languages || undefined,
        actions: selectedEnemy.actions || [],
        specialTraits: selectedEnemy.special_traits || [],
        isHostile: true, // Sempre true para inimigos criados através deste dialog
      };

      // Adicionar campos opcionais apenas se tiverem valor
      if (imageUrl) {
        enemyData.image = imageUrl;
      }
      if (chapterId) {
        enemyData.chapterId = chapterId;
      }

      const res = await fetch(`/api/campaigns/${campaignId}/npcs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(enemyData),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro ao criar inimigo: ${res.status}`);
      }

      toast.success(`Inimigo "${customName || selectedEnemy.name}" criado!`);
      setOpen(false);
      setSelectedEnemy(null);
      setCustomName("");
      setImageUrl("");
      setSearchTerm("");
      setCrFilter("all");
      onEnemyCreated?.();
    } catch (error: any) {
      console.error("Error creating enemy:", error);
      toast.error(error.message || "Erro ao criar inimigo");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground">
          <Plus className="mr-2 h-4 w-4" /> Criar Inimigo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Criar Inimigo</DialogTitle>
          <DialogDescription>
            Selecione um inimigo da lista ou busque por nome/tipo
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
          {/* Lista de Inimigos */}
          <div className="flex flex-col space-y-4 min-h-0">
            <div className="flex flex-col gap-2 flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar inimigo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div>
                <Select value={crFilter} onValueChange={setCrFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por CR (todos)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os CRs</SelectItem>
                    {uniqueCRs.map((cr) => (
                      <SelectItem key={cr} value={cr}>
                        CR {cr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <ScrollArea className="flex-1 min-h-0 border rounded-md">
              <div className="p-2 space-y-2">
                {filteredEnemies.map((enemy) => (
                  <div
                    key={enemy.name}
                    onClick={() => handleSelectEnemy(enemy)}
                    className={`p-3 rounded-md cursor-pointer transition-colors ${
                      selectedEnemy?.name === enemy.name
                        ? "bg-primary/10 border-2 border-primary"
                        : "bg-card/40 border-2 border-transparent hover:bg-card/60"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{enemy.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {enemy.type} • CR {enemy.cr}
                        </div>
                      </div>
                      <Badge variant="outline">CA {enemy.ac}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Preview do Inimigo Selecionado */}
          <div className="flex flex-col space-y-4 min-h-0">
            {selectedEnemy ? (
              <>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <div>
                    <Label htmlFor="customName">Nome do Inimigo</Label>
                    <Input
                      id="customName"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder={selectedEnemy.name}
                    />
                  </div>
                  <div>
                    <Label htmlFor="imageUrl">URL da Imagem (opcional)</Label>
                    <Input
                      id="imageUrl"
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://exemplo.com/imagem.jpg"
                    />
                  </div>
                </div>
                <ScrollArea className="flex-1 min-h-0 border rounded-md p-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold text-lg">{selectedEnemy.name}</h3>
                      <div className="flex gap-2 mt-1">
                        <Badge>{selectedEnemy.type}</Badge>
                        <Badge variant="outline">CR {selectedEnemy.cr}</Badge>
                        <Badge variant="outline">CA {selectedEnemy.ac}</Badge>
                        <Badge variant="outline">HP {selectedEnemy.hp}</Badge>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold">Atributos</h4>
                      <div className="grid grid-cols-6 gap-2 mt-1 text-sm">
                        {Object.entries(selectedEnemy.abilities || {}).map(
                          ([attr, value]: [string, any]) => (
                            <div key={attr} className="text-center">
                              <div className="font-medium">{attr.toUpperCase()}</div>
                              <div>{value}</div>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    {selectedEnemy.actions && selectedEnemy.actions.length > 0 && (
                      <div>
                        <h4 className="font-semibold">Ações</h4>
                        <div className="space-y-2 mt-1">
                          {selectedEnemy.actions.map((action: any, idx: number) => (
                            <div key={idx} className="text-sm">
                              <div className="font-medium">
                                {action.name} {action.bonus && `+${action.bonus}`}
                              </div>
                              <div className="text-muted-foreground">
                                {action.damage} {action.type}
                              </div>
                              {action.description && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {action.description}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedEnemy.special_traits &&
                      selectedEnemy.special_traits.length > 0 && (
                        <div>
                          <h4 className="font-semibold">Traços Especiais</h4>
                          <div className="space-y-2 mt-1">
                            {selectedEnemy.special_traits.map(
                              (trait: any, idx: number) => (
                                <div key={idx} className="text-sm">
                                  <div className="font-medium">{trait.name}</div>
                                  <div className="text-muted-foreground">
                                    {trait.description}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {(selectedEnemy.damage_resistances?.length > 0 ||
                      selectedEnemy.damage_immunities?.length > 0 ||
                      selectedEnemy.damage_vulnerabilities?.length > 0) && (
                      <div>
                        <h4 className="font-semibold">Resistências/Imunidades</h4>
                        <div className="space-y-1 mt-1 text-sm">
                          {selectedEnemy.damage_resistances?.length > 0 && (
                            <div>
                              <span className="font-medium">Resistências: </span>
                              {selectedEnemy.damage_resistances.join(", ")}
                            </div>
                          )}
                          {selectedEnemy.damage_immunities?.length > 0 && (
                            <div>
                              <span className="font-medium">Imunidades: </span>
                              {selectedEnemy.damage_immunities.join(", ")}
                            </div>
                          )}
                          {selectedEnemy.damage_vulnerabilities?.length > 0 && (
                            <div>
                              <span className="font-medium">Vulnerabilidades: </span>
                              {selectedEnemy.damage_vulnerabilities.join(", ")}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Selecione um inimigo da lista
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!selectedEnemy || creating}
            className="bg-primary text-primary-foreground"
          >
            {creating ? "Criando..." : "Criar Inimigo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

