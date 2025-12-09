"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FantasyLayout } from "@/components/layout/FantasyLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search, 
  Shield, 
  Heart, 
  Eye,
  EyeOff,
  Trash2,
  Edit,
  Skull,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NPC {
  id: string;
  name: string;
  type?: string | null;
  challengeRating?: string | null;
  alignment?: string | null;
  image?: string | null;
  isHostile?: boolean;
  currentHp?: number | null;
  maxHp?: number | null;
  armorClass?: number | null;
  // Campos completos apenas para DM
  race?: string | null;
  characterClass?: string | null;
  level?: number | null;
  initiative?: number | null;
  speed?: number | null;
  tempHp?: number | null;
  hitDice?: string | null;
  attributes?: Record<string, number>;
  savingThrows?: Record<string, boolean>;
  skills?: Record<string, number>;
  proficiencyBonus?: number | null;
  attacks?: Array<{
    name: string;
    bonus: number;
    damage: string;
    type: string;
    description: string;
  }>;
  abilities?: Array<{
    name: string;
    description: string;
  }>;
  resistances?: string[];
  immunities?: string[];
  vulnerabilities?: string[];
  description?: string | null;
  backstory?: string | null;
  notes?: string | null;
  chapterId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export default function NPCsPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  const [npcs, setNpcs] = useState<NPC[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDM, setIsDM] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNpc, setSelectedNpc] = useState<NPC | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  useEffect(() => {
    fetchNPCs();
  }, [campaignId]);

  const fetchNPCs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/campaigns/${campaignId}/npcs`);
      if (res.ok) {
        const data = await res.json();
        setNpcs(data.npcs || []);
        setIsDM(data.isDM || false);
      } else {
        toast.error("Erro ao carregar NPCs");
      }
    } catch (error) {
      console.error("Error fetching NPCs:", error);
      toast.error("Erro ao carregar NPCs");
    } finally {
      setLoading(false);
    }
  };

  const filteredNpcs = npcs.filter((npc) =>
    npc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    npc.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (npcId: string) => {
    if (!confirm("Tem certeza que deseja deletar este NPC?")) return;

    try {
      const res = await fetch(`/api/campaigns/${campaignId}/npcs/${npcId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("NPC deletado com sucesso");
        fetchNPCs();
      } else {
        toast.error("Erro ao deletar NPC");
      }
    } catch (error) {
      console.error("Error deleting NPC:", error);
      toast.error("Erro ao deletar NPC");
    }
  };

  const handleViewNpc = (npc: NPC) => {
    setSelectedNpc(npc);
    setIsViewDialogOpen(true);
  };

  if (loading) {
    return (
      <FantasyLayout>
        <div className="text-center py-12 text-muted-foreground">
          Carregando NPCs...
        </div>
      </FantasyLayout>
    );
  }

  return (
    <FantasyLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold font-cinzel text-primary">
              NPCs e Inimigos
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isDM 
                ? "Gerencie todos os NPCs e inimigos da campanha" 
                : "Visualize os NPCs encontrados"}
            </p>
          </div>
          {isDM && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground">
                  <Plus className="mr-2 h-4 w-4" /> Criar NPC
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Criar NPC a partir de Template</DialogTitle>
                </DialogHeader>
                <CreateNPCForm
                  campaignId={campaignId}
                  onSuccess={() => {
                    setIsCreateDialogOpen(false);
                    fetchNPCs();
                  }}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar NPCs..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {filteredNpcs.length === 0 ? (
          <Card className="bg-card/40 border-white/10 p-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">
              {searchTerm
                ? "Nenhum NPC encontrado"
                : isDM
                ? "Nenhum NPC criado ainda. Crie o primeiro!"
                : "Nenhum NPC encontrado ainda"}
            </p>
            {isDM && !searchTerm && (
              <Button
                className="bg-primary text-primary-foreground"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" /> Criar Primeiro NPC
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNpcs.map((npc) => (
              <motion.div
                key={npc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-card/40 border-white/10 hover:border-primary/50 transition-colors cursor-pointer h-full flex flex-col">
                  <div
                    className="p-4 flex-1"
                    onClick={() => handleViewNpc(npc)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1">{npc.name}</h3>
                        <div className="flex gap-2 flex-wrap">
                          {npc.type && (
                            <Badge variant="outline" className="text-xs">
                              {npc.type}
                            </Badge>
                          )}
                          {npc.challengeRating && (
                            <Badge variant="outline" className="text-xs">
                              CR {npc.challengeRating}
                            </Badge>
                          )}
                          {npc.isHostile && (
                            <Badge variant="destructive" className="text-xs">
                              <Skull className="h-3 w-3 mr-1" /> Hostil
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {isDM && (
                      <div className="space-y-2 text-sm text-muted-foreground">
                        {npc.currentHp !== null && npc.maxHp !== null && (
                          <div className="flex items-center gap-2">
                            <Heart className="h-4 w-4 text-red-400" />
                            <span>
                              {npc.currentHp} / {npc.maxHp} PV
                            </span>
                          </div>
                        )}
                        {npc.armorClass !== null && (
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-blue-400" />
                            <span>CA {npc.armorClass}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {!isDM && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {npc.isHostile ? "Inimigo" : "NPC"}
                      </p>
                    )}
                  </div>

                  {isDM && (
                    <div className="border-t border-white/10 p-2 flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewNpc(npc);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(npc.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Dialog para visualizar NPC */}
      {selectedNpc && (
        <ViewNPCDialog
          npc={selectedNpc}
          isOpen={isViewDialogOpen}
          onOpenChange={setIsViewDialogOpen}
          isDM={isDM}
          campaignId={campaignId}
          onUpdate={fetchNPCs}
        />
      )}
    </FantasyLayout>
  );
}

// Componente para criar NPC a partir de template
function CreateNPCForm({
  campaignId,
  onSuccess,
}: {
  campaignId: string;
  onSuccess: () => void;
}) {
  const [monsterTemplates] = useState([
    { name: "Skeleton", cr: 0, type: "undead" },
    { name: "Zombie", cr: 0, type: "undead" },
    { name: "Giant Rat", cr: 0, type: "beast" },
    { name: "Goblin", cr: 0.25, type: "humanoid" },
    { name: "Wolf", cr: 0.25, type: "beast" },
    { name: "Orc", cr: 0.5, type: "humanoid" },
    { name: "Bandit", cr: 0.5, type: "humanoid" },
    { name: "Bugbear", cr: 1, type: "humanoid" },
    { name: "Hobgoblin", cr: 1, type: "humanoid" },
    { name: "Gelatinous Cube", cr: 1, type: "ooze" },
    { name: "Ogre", cr: 2, type: "giant" },
    { name: "Giant Spider", cr: 2, type: "beast" },
    { name: "Veteran Guard", cr: 2, type: "humanoid" },
  ]);

  // JSON completo dos monstros
  const monsterDataMap: Record<string, any> = {
    Skeleton: {
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
    Zombie: {
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
    "Giant Rat": {
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
    Goblin: {
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
    Wolf: {
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
    Orc: {
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
    Bandit: {
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
    Bugbear: {
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
    Hobgoblin: {
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
    "Gelatinous Cube": {
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
    Ogre: {
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
    "Giant Spider": {
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
    "Veteran Guard": {
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
  };

  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [customName, setCustomName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) {
      toast.error("Selecione um template");
      return;
    }

    const monsterData = monsterDataMap[selectedTemplate];
    if (!monsterData) {
      toast.error("Template não encontrado");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(
        `/api/campaigns/${campaignId}/npcs/create-from-template`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            monsterData: {
              ...monsterData,
              name: customName || monsterData.name,
            },
          }),
        }
      );

      if (res.ok) {
        toast.success("NPC criado com sucesso!");
        onSuccess();
      } else {
        const error = await res.json();
        toast.error(error.error || "Erro ao criar NPC");
      }
    } catch (error) {
      console.error("Error creating NPC:", error);
      toast.error("Erro ao criar NPC");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="template">Template de Monstro</Label>
        <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
          <SelectTrigger id="template">
            <SelectValue placeholder="Selecione um template" />
          </SelectTrigger>
          <SelectContent>
            {monsterTemplates.map((template) => (
              <SelectItem key={template.name} value={template.name}>
                {template.name} (CR {template.cr}, {template.type})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedTemplate && (
        <div>
          <Label htmlFor="customName">Nome Personalizado (opcional)</Label>
          <Input
            id="customName"
            placeholder={`Deixe vazio para usar "${monsterDataMap[selectedTemplate]?.name}"`}
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
          />
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setSelectedTemplate("");
            setCustomName("");
          }}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting || !selectedTemplate}>
          {isSubmitting ? "Criando..." : "Criar NPC"}
        </Button>
      </div>
    </form>
  );
}

// Componente para visualizar NPC completo (apenas DM vê tudo)
function ViewNPCDialog({
  npc,
  isOpen,
  onOpenChange,
  isDM,
  campaignId,
  onUpdate,
}: {
  npc: NPC;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isDM: boolean;
  campaignId: string;
  onUpdate: () => void;
}) {
  if (!isDM) {
    // Jogador vê apenas informações básicas
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{npc.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              {npc.type && (
                <Badge variant="outline">{npc.type}</Badge>
              )}
              {npc.challengeRating && (
                <Badge variant="outline">CR {npc.challengeRating}</Badge>
              )}
              {npc.isHostile && (
                <Badge variant="destructive">Hostil</Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              {npc.isHostile
                ? "Este é um inimigo que você encontrou."
                : "Este é um NPC da campanha."}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // DM vê ficha completa
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-cinzel">{npc.name}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="space-y-6 pr-4">
            {/* Informações Básicas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {npc.challengeRating && (
                <div>
                  <Label className="text-xs text-muted-foreground">CR</Label>
                  <p className="font-bold">{npc.challengeRating}</p>
                </div>
              )}
              {npc.type && (
                <div>
                  <Label className="text-xs text-muted-foreground">Tipo</Label>
                  <p className="font-bold">{npc.type}</p>
                </div>
              )}
              {npc.alignment && (
                <div>
                  <Label className="text-xs text-muted-foreground">Alinhamento</Label>
                  <p className="font-bold">{npc.alignment}</p>
                </div>
              )}
              {npc.armorClass !== null && (
                <div>
                  <Label className="text-xs text-muted-foreground">CA</Label>
                  <p className="font-bold">{npc.armorClass}</p>
                </div>
              )}
            </div>

            {/* PV */}
            {npc.currentHp !== null && npc.maxHp !== null && (
              <div>
                <Label className="text-xs text-muted-foreground">Pontos de Vida</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={npc.currentHp}
                    onChange={async (e) => {
                      const newHp = parseInt(e.target.value, 10);
                      try {
                        const res = await fetch(
                          `/api/campaigns/${campaignId}/npcs/${npc.id}`,
                          {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ currentHp: newHp }),
                          }
                        );
                        if (res.ok) {
                          onUpdate();
                        }
                      } catch (error) {
                        console.error("Error updating HP:", error);
                      }
                    }}
                    className="w-24"
                  />
                  <span className="text-muted-foreground">/</span>
                  <Input
                    type="number"
                    value={npc.maxHp}
                    onChange={async (e) => {
                      const newMaxHp = parseInt(e.target.value, 10);
                      try {
                        const res = await fetch(
                          `/api/campaigns/${campaignId}/npcs/${npc.id}`,
                          {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ maxHp: newMaxHp }),
                          }
                        );
                        if (res.ok) {
                          onUpdate();
                        }
                      } catch (error) {
                        console.error("Error updating max HP:", error);
                      }
                    }}
                    className="w-24"
                  />
                </div>
              </div>
            )}

            {/* Atributos */}
            {npc.attributes && (
              <div>
                <Label className="text-sm font-bold mb-2 block">Atributos</Label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {Object.entries(npc.attributes).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <p className="text-xs text-muted-foreground uppercase">
                        {key.substring(0, 3)}
                      </p>
                      <p className="font-bold">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ataques */}
            {npc.attacks && npc.attacks.length > 0 && (
              <div>
                <Label className="text-sm font-bold mb-2 block">Ataques</Label>
                <div className="space-y-2">
                  {npc.attacks.map((attack, idx) => (
                    <Card key={idx} className="p-3 bg-card/40">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold">{attack.name}</p>
                          {attack.description && (
                            <p className="text-xs text-muted-foreground">
                              {attack.description}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm">
                            +{attack.bonus} para acertar
                          </p>
                          {attack.damage && (
                            <p className="text-xs text-muted-foreground">
                              {attack.damage}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Habilidades Especiais */}
            {npc.abilities && npc.abilities.length > 0 && (
              <div>
                <Label className="text-sm font-bold mb-2 block">
                  Habilidades Especiais
                </Label>
                <div className="space-y-2">
                  {npc.abilities.map((ability, idx) => (
                    <Card key={idx} className="p-3 bg-card/40">
                      <p className="font-bold text-sm">{ability.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {ability.description}
                      </p>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Resistências, Imunidades, Vulnerabilidades */}
            {(npc.resistances?.length ||
              npc.immunities?.length ||
              npc.vulnerabilities?.length) && (
              <div className="grid grid-cols-3 gap-4">
                {npc.resistances && npc.resistances.length > 0 && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Resistências</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {npc.resistances.map((res, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {res}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {npc.immunities && npc.immunities.length > 0 && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Imunidades</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {npc.immunities.map((imm, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {imm}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {npc.vulnerabilities && npc.vulnerabilities.length > 0 && (
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Vulnerabilidades
                    </Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {npc.vulnerabilities.map((vul, idx) => (
                        <Badge key={idx} variant="destructive" className="text-xs">
                          {vul}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Notas */}
            {npc.notes && (
              <div>
                <Label className="text-sm font-bold mb-2 block">Notas</Label>
                <Textarea
                  value={npc.notes}
                  readOnly
                  className="bg-muted min-h-[100px]"
                />
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

