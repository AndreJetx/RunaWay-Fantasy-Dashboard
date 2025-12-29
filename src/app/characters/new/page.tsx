"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FantasyLayout } from "@/components/layout/FantasyLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowLeft, Save, RotateCcw, Sparkles, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { SpellSelectionDialog } from "@/components/characters/SpellSelectionDialog";
import { SubclassSelector } from "@/components/characters/SubclassSelector";
import { BackgroundSelector } from "@/components/characters/BackgroundSelector";
import { DragonTypeSelector } from "@/components/characters/DragonTypeSelector";
import { ShopDialog } from "@/components/characters/ShopDialog";
import { CharacterTypeSelection } from "@/components/characters/CharacterTypeSelection";
import { canCastSpells, getSpellSlots, getSpellcastingLevel, getCantripsCount, getSpellsCount, getSpellType } from "@/lib/spell-slots";
import { getXPForLevel } from "@/lib/xp-helper";
import { getClassFeatures } from "@/lib/class-features";
import { getSubclassLevel, needsSubclassSelection } from "@/lib/subclasses";
import { applySubclassBenefits, applyBackgroundBenefits } from "@/lib/benefit-application";
import type { Subclass } from "@/lib/subclasses";
import type { Background } from "@/lib/backgrounds";
import type { DragonType } from "@/lib/dragon-types";


// Atributos D&D 5e
const ATTRIBUTES = [
  { key: "strength", label: "Força", abbr: "FOR" },
  { key: "dexterity", label: "Destreza", abbr: "DES" },
  { key: "constitution", label: "Constituição", abbr: "CON" },
  { key: "intelligence", label: "Inteligência", abbr: "INT" },
  { key: "wisdom", label: "Sabedoria", abbr: "SAB" },
  { key: "charisma", label: "Carisma", abbr: "CAR" },
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

const ALIGNMENTS = [
  "Leal e Bom",
  "Neutro e Bom",
  "Caótico e Bom",
  "Leal e Neutro",
  "Neutro",
  "Caótico e Neutro",
  "Leal e Mau",
  "Neutro e Mau",
  "Caótico e Mau",
];

// Estrutura de raças por expansão
interface RaceBonus {
  strength?: number;
  dexterity?: number;
  constitution?: number;
  intelligence?: number;
  wisdom?: number;
  charisma?: number;
}

interface Subrace {
  name: string;
  attributeBonuses: RaceBonus;
  advantages?: string[];
}

interface Race {
  name: string;
  attributeBonuses: RaceBonus;
  subraces?: Subrace[];
  advantages: string[];
  guaranteedSkills?: string[]; // Perícias garantidas pela raça
  chooseableSkills?: number; // Número de perícias que o jogador pode escolher
  chooseableAttributes?: number; // Número de atributos que o jogador pode escolher para +1
  speed?: number;
  size?: string;
}

interface RaceExpansion {
  name: string;
  races: Race[];
}

const RACE_EXPANSIONS: RaceExpansion[] = [
  {
    name: "Livro do Jogador (PHB)",
    races: [
      {
        name: "Anão",
        attributeBonuses: { constitution: 2 },
        subraces: [
          {
            name: "Hill",
            attributeBonuses: { wisdom: 1 },
            advantages: ["+1 HP por nível"],
          },
          {
            name: "Mountain",
            attributeBonuses: { strength: 2 },
            advantages: ["Proficiência em light/medium armor"],
          },
        ],
        advantages: ["Darkvision", "Resiliência a veneno", "Proficiência com armas anãs"],
      },
      {
        name: "Elfo",
        attributeBonuses: { dexterity: 2 },
        guaranteedSkills: ["perception"],
        subraces: [
          {
            name: "High",
            attributeBonuses: { intelligence: 1 },
            advantages: ["Cantrip"],
          },
          {
            name: "Wood",
            attributeBonuses: { wisdom: 1 },
            advantages: ["Velocidade 35ft"],
          },
          {
            name: "Drow",
            attributeBonuses: { charisma: 1 },
            advantages: ["Magia drow"],
          },
        ],
        advantages: ["Darkvision", "Perception", "Fey Ancestry"],
      },
      {
        name: "Halfling",
        attributeBonuses: { dexterity: 2 },
        subraces: [
          {
            name: "Lightfoot",
            attributeBonuses: { charisma: 1 },
          },
          {
            name: "Stout",
            attributeBonuses: { constitution: 1 },
          },
        ],
        advantages: ["Lucky", "Brave", "Passar por espaços estreitos"],
      },
      {
        name: "Humano",
        attributeBonuses: { strength: 1, dexterity: 1, constitution: 1, intelligence: 1, wisdom: 1, charisma: 1 },
        chooseableSkills: 1, // Variante humana
        advantages: ["Variante: +1 em 2 atributos, 1 feat, 1 skill"],
      },
      {
        name: "Draconato",
        attributeBonuses: { strength: 2, charisma: 1 },
        advantages: ["Sopro + resistência de acordo com o tipo"],
      },
      {
        name: "Gnomo",
        attributeBonuses: { intelligence: 2 },
        subraces: [
          {
            name: "Forest",
            attributeBonuses: { dexterity: 1 },
          },
          {
            name: "Rock",
            attributeBonuses: { constitution: 1 },
          },
        ],
        advantages: ["Gnome Cunning", "Darkvision"],
      },
      {
        name: "Meio-Elfo",
        attributeBonuses: { charisma: 2 },
        chooseableAttributes: 2, // +1 em 2 atributos à escolha
        chooseableSkills: 2,
        advantages: ["+1 em 2 atributos à escolha", "Darkvision", "Fey ancestry", "2 skills extras"],
      },
      {
        name: "Meio-Orc",
        attributeBonuses: { strength: 2, constitution: 1 },
        guaranteedSkills: ["intimidation"],
        advantages: ["Darkvision", "Savage Attacks", "Relentless Endurance"],
      },
      {
        name: "Tiefling",
        attributeBonuses: { charisma: 2, intelligence: 1 },
        advantages: ["Resistência a fogo", "Feitiços infernais"],
      },
    ],
  },
  {
    name: "Volo's Guide to Monsters",
    races: [
      {
        name: "Aasimar",
        attributeBonuses: { charisma: 2 },
        subraces: [
          {
            name: "Protector",
            attributeBonuses: { wisdom: 1 },
          },
          {
            name: "Scourge",
            attributeBonuses: { constitution: 1 },
          },
          {
            name: "Fallen",
            attributeBonuses: { strength: 1 },
          },
        ],
        advantages: ["Resistência radiante/necrótica", "Poderes celestiais"],
      },
      {
        name: "Firbolg",
        attributeBonuses: { wisdom: 2, strength: 1 },
        advantages: ["Comunicação com animais/plantas", "Magias raciais"],
      },
      {
        name: "Goliath",
        attributeBonuses: { strength: 2, constitution: 1 },
        advantages: ["Stone's Endurance", "Resistência ao frio", "Atleta natural"],
      },
      {
        name: "Kenku",
        attributeBonuses: { dexterity: 2, wisdom: 1 },
        guaranteedSkills: ["stealth", "sleightOfHand"],
        advantages: ["Mimicry", "Vantagem em furtividade e perícia manual"],
      },
      {
        name: "Lizardfolk",
        attributeBonuses: { constitution: 2, wisdom: 1 },
        advantages: ["Natural Armor", "Hungry Jaws", "Natação"],
      },
      {
        name: "Tabaxi",
        attributeBonuses: { dexterity: 2, charisma: 1 },
        guaranteedSkills: ["perception", "stealth"],
        advantages: ["Velocidade explosiva (Feline Agility)", "Garras", "Perception e Stealth"],
      },
      {
        name: "Triton",
        attributeBonuses: { strength: 1, constitution: 1, charisma: 1 },
        advantages: ["Magias aquáticas", "Respirar embaixo d'água", "Natação"],
      },
      {
        name: "Bugbear",
        attributeBonuses: { strength: 2, dexterity: 1 },
        advantages: ["Furtividade surpreendente", "Alcance aumentado"],
      },
      {
        name: "Goblin",
        attributeBonuses: { dexterity: 2, constitution: 1 },
        advantages: ["Fury of the Small", "Nimble Escape"],
      },
      {
        name: "Hobgoblin",
        attributeBonuses: { constitution: 2, intelligence: 1 },
        advantages: ["Song of Victory / Saving Face"],
      },
      {
        name: "Kobold",
        attributeBonuses: { dexterity: 2, strength: -2 },
        advantages: ["Pack Tactics", "Sunlight Sensitivity"],
      },
      {
        name: "Orc",
        attributeBonuses: { strength: 2, constitution: 1, intelligence: -2 },
        guaranteedSkills: ["intimidation"],
        advantages: ["Menacing", "Aggressive"],
      },
    ],
  },
  {
    name: "Eberron: Rising from the Last War",
    races: [
      {
        name: "Changeling",
        attributeBonuses: { charisma: 2 },
        advantages: ["+1 à escolha", "Mudar aparência", "Duas personalidades sociais"],
      },
      {
        name: "Kalashtar",
        attributeBonuses: { wisdom: 2, charisma: 1 },
        advantages: ["Resistência psíquica", "Telepatia"],
      },
      {
        name: "Shifter",
        attributeBonuses: { dexterity: 2 },
        subraces: [
          {
            name: "Beasthide",
            attributeBonuses: { constitution: 1 },
          },
          {
            name: "Longtooth",
            attributeBonuses: { strength: 1 },
          },
          {
            name: "Swiftstride",
            attributeBonuses: { dexterity: 1 },
          },
          {
            name: "Wildhunt",
            attributeBonuses: { wisdom: 1 },
          },
        ],
        advantages: ["Shifting (transformação temporária)"],
      },
      {
        name: "Warforged",
        attributeBonuses: { constitution: 2 },
        advantages: ["+1 à escolha", "Armadura integrada", "Imunidades parciais", "Não precisa comer/dormir"],
      },
    ],
  },
  {
    name: "Ravnica – Guildmaster's Guide",
    races: [
      {
        name: "Centaur",
        attributeBonuses: { strength: 2, wisdom: 1 },
        advantages: ["Movimento 40ft", "Ataques de casco"],
      },
      {
        name: "Loxodon",
        attributeBonuses: { constitution: 2, wisdom: 1 },
        advantages: ["Tromba", "Natural Armor", "Calma loxodônica"],
      },
      {
        name: "Vedalken",
        attributeBonuses: { intelligence: 2, wisdom: 1 },
        advantages: ["Vantagem em todos testes mentais contra efeitos", "Precisão vedalken"],
      },
      {
        name: "Simic Hybrid",
        attributeBonuses: { constitution: 2 },
        advantages: ["+1 à escolha", "Adaptações biológicas (nado, garras, salto etc.)"],
      },
      {
        name: "Minotaur",
        attributeBonuses: { strength: 2, constitution: 1 },
        advantages: ["Chifres", "Ataque de investida"],
      },
    ],
  },
  {
    name: "Mythic Odysseys of Theros",
    races: [
      {
        name: "Leonin",
        attributeBonuses: { constitution: 2, strength: 1 },
        advantages: ["Rugido", "Sentidos aguçados"],
      },
      {
        name: "Satyr",
        attributeBonuses: { charisma: 2, dexterity: 1 },
        guaranteedSkills: ["performance", "persuasion"],
        advantages: ["Resistência a magia", "Chifres", "Salto melhorado"],
      },
    ],
  },
  {
    name: "Wildemount (Explorer's Guide)",
    races: [
      {
        name: "Pallid Elf",
        attributeBonuses: { dexterity: 2, wisdom: 1 },
        guaranteedSkills: ["perception", "insight"],
        advantages: ["Insights sobrenaturais", "Magias raciais"],
      },
      {
        name: "Lotusden Halfling",
        attributeBonuses: { dexterity: 2, wisdom: 1 },
        advantages: ["Magias druídicas"],
      },
    ],
  },
];

// Estrutura de classes
interface ClassBonus {
  hitDie: number; // Dado de vida (8, 10, 12)
  hitPoints: number; // PV base (sem CON)
  armorProficiencies: string[];
  weaponProficiencies: string[];
  savingThrows: string[]; // Testes de resistência fixos
  guaranteedSkills: string[]; // Perícias fixas
  chooseableSkills: number; // Número de perícias que o jogador pode escolher
  skillOptions?: string[]; // Opções de perícias para escolher
  toolProficiencies?: string[];
  unarmoredDefense?: string; // Fórmula de CA sem armadura (ex: "10 + DES + CON")
  primaryAttributes: string[]; // Atributos principais
}

interface CharacterClass {
  name: string;
  bonuses: ClassBonus;
}

const CHARACTER_CLASSES: CharacterClass[] = [
  {
    name: "Bárbaro",
    bonuses: {
      hitDie: 12,
      hitPoints: 12,
      armorProficiencies: ["leves", "médias", "escudos"],
      weaponProficiencies: ["simples", "marciais"],
      savingThrows: ["strength", "constitution"],
      guaranteedSkills: [],
      chooseableSkills: 2,
      skillOptions: ["athletics", "intimidation", "nature", "perception", "survival", "animalHandling"],
      primaryAttributes: ["strength"],
      unarmoredDefense: "10 + DES + CON",
    },
  },
  {
    name: "Bardo",
    bonuses: {
      hitDie: 8,
      hitPoints: 8,
      armorProficiencies: ["leves"],
      weaponProficiencies: ["simples", "espada curta", "espada longa", "besta leve"],
      savingThrows: ["dexterity", "charisma"],
      guaranteedSkills: [],
      chooseableSkills: 3,
      skillOptions: [], // Qualquer perícia
      toolProficiencies: ["3 instrumentos musicais"],
      primaryAttributes: ["charisma"],
    },
  },
  {
    name: "Bruxo",
    bonuses: {
      hitDie: 8,
      hitPoints: 8,
      armorProficiencies: ["leves"],
      weaponProficiencies: ["simples"],
      savingThrows: ["wisdom", "charisma"],
      guaranteedSkills: [],
      chooseableSkills: 2,
      skillOptions: ["arcana", "deception", "history", "intimidation", "investigation", "nature", "religion"],
      primaryAttributes: ["charisma"],
    },
  },
  {
    name: "Clérigo",
    bonuses: {
      hitDie: 8,
      hitPoints: 8,
      armorProficiencies: ["leves", "médias", "escudos"],
      weaponProficiencies: ["simples"],
      savingThrows: ["wisdom", "charisma"],
      guaranteedSkills: [],
      chooseableSkills: 2,
      skillOptions: ["history", "insight", "medicine", "persuasion", "religion"],
      primaryAttributes: ["wisdom"],
    },
  },
  {
    name: "Druida",
    bonuses: {
      hitDie: 8,
      hitPoints: 8,
      armorProficiencies: ["leves não metálicas", "médias não metálicas", "escudos não metálicos"],
      weaponProficiencies: ["simples", "clava", "adaga", "dardo", "lança", "maça", "bordão", "cimitarra", "foice"],
      savingThrows: ["wisdom", "intelligence"],
      guaranteedSkills: [],
      chooseableSkills: 2,
      skillOptions: ["arcana", "animalHandling", "insight", "medicine", "nature", "perception", "religion", "survival"],
      toolProficiencies: ["kit de herbalismo"],
      primaryAttributes: ["wisdom"],
    },
  },
  {
    name: "Feiticeiro",
    bonuses: {
      hitDie: 6,
      hitPoints: 6,
      armorProficiencies: [],
      weaponProficiencies: ["adagas", "dardos", "fundas", "bordões", "bestas leves"],
      savingThrows: ["constitution", "charisma"],
      guaranteedSkills: [],
      chooseableSkills: 2,
      skillOptions: ["arcana", "deception", "insight", "intimidation", "persuasion", "religion"],
      primaryAttributes: ["charisma"],
    },
  },
  {
    name: "Guerreiro",
    bonuses: {
      hitDie: 10,
      hitPoints: 10,
      armorProficiencies: ["todas", "escudos"],
      weaponProficiencies: ["simples", "marciais"],
      savingThrows: ["strength", "constitution"],
      guaranteedSkills: [],
      chooseableSkills: 2,
      skillOptions: ["acrobatics", "athletics", "insight", "intimidation", "athletics", "survival"],
      primaryAttributes: ["strength", "dexterity"],
    },
  },
  {
    name: "Ladino",
    bonuses: {
      hitDie: 8,
      hitPoints: 8,
      armorProficiencies: ["leves"],
      weaponProficiencies: ["simples", "rapieira", "shortbow", "shortsword"],
      savingThrows: ["dexterity", "intelligence"],
      guaranteedSkills: [],
      chooseableSkills: 4,
      skillOptions: [], // Muitas opções
      toolProficiencies: ["kit de ladrão"],
      primaryAttributes: ["dexterity"],
    },
  },
  {
    name: "Mago",
    bonuses: {
      hitDie: 6,
      hitPoints: 6,
      armorProficiencies: [],
      weaponProficiencies: ["adagas", "bordões", "bestas leves", "dardos"],
      savingThrows: ["intelligence", "wisdom"],
      guaranteedSkills: [],
      chooseableSkills: 2,
      skillOptions: ["arcana", "history", "insight", "investigation", "medicine", "religion"],
      primaryAttributes: ["intelligence"],
    },
  },
  {
    name: "Monge",
    bonuses: {
      hitDie: 8,
      hitPoints: 8,
      armorProficiencies: [],
      weaponProficiencies: ["simples", "armas de monge"],
      savingThrows: ["strength", "dexterity"],
      guaranteedSkills: [],
      chooseableSkills: 2,
      skillOptions: ["acrobatics", "athletics", "deception", "insight", "religion", "stealth"],
      primaryAttributes: ["dexterity", "wisdom"],
      unarmoredDefense: "10 + DES + SAB",
    },
  },
  {
    name: "Paladino",
    bonuses: {
      hitDie: 10,
      hitPoints: 10,
      armorProficiencies: ["todas", "escudos"],
      weaponProficiencies: ["simples", "marciais"],
      savingThrows: ["wisdom", "charisma"],
      guaranteedSkills: [],
      chooseableSkills: 2,
      skillOptions: ["athletics", "insight", "intimidation", "medicine", "persuasion", "religion"],
      primaryAttributes: ["charisma", "strength"],
    },
  },
  {
    name: "Patrulheiro",
    bonuses: {
      hitDie: 10,
      hitPoints: 10,
      armorProficiencies: ["leves", "médias", "escudos"],
      weaponProficiencies: ["simples", "marciais"],
      savingThrows: ["strength", "dexterity"],
      guaranteedSkills: [],
      chooseableSkills: 3,
      skillOptions: ["animalHandling", "athletics", "insight", "investigation", "nature", "perception", "stealth", "survival"],
      primaryAttributes: ["dexterity", "wisdom"],
    },
  },
];

function NewCharacterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignId = searchParams?.get("campaignId") || null;

  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isDM, setIsDM] = useState(false);
  const [existingCharacter, setExistingCharacter] = useState<any>(null);
  const [checkingCharacter, setCheckingCharacter] = useState(true);
  const [rolledValues, setRolledValues] = useState<number[]>([]);
  const [rollDetails, setRollDetails] = useState<Array<{ total: number; dice: number[] }>>([]); // Armazena os 4 valores de cada rolagem
  const [attributeAssignments, setAttributeAssignments] = useState<Record<string, number | null>>({
    strength: null,
    dexterity: null,
    constitution: null,
    intelligence: null,
    wisdom: null,
    charisma: null,
  });
  const [assignedRollIndices, setAssignedRollIndices] = useState<Record<string, number | null>>({
    strength: null,
    dexterity: null,
    constitution: null,
    intelligence: null,
    wisdom: null,
    charisma: null,
  });
  const [hasRolled, setHasRolled] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});
  const [campaignData, setCampaignData] = useState<{ attributeSystem?: string; initialMoney?: string } | null>(null);
  const previousCharacterClassRef = useRef<string>("");
  const [pointBuyAttributes, setPointBuyAttributes] = useState<Record<string, number>>({
    strength: 8,
    dexterity: 8,
    constitution: 8,
    intelligence: 8,
    wisdom: 8,
    charisma: 8,
  });
  const [pointBuyPointsUsed, setPointBuyPointsUsed] = useState(0);
  const [selectedExpansion, setSelectedExpansion] = useState<string>("");
  const [selectedRace, setSelectedRace] = useState<string>("");
  const [availableCampaigns, setAvailableCampaigns] = useState<Array<{ id: string; title: string }>>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(campaignId || "");
  const [selectedSubrace, setSelectedSubrace] = useState<string>("");
  const [previousRaceBonuses, setPreviousRaceBonuses] = useState<RaceBonus>({});
  const [previousRaceSkills, setPreviousRaceSkills] = useState<string[]>([]); // Perícias garantidas
  const [chosenRaceSkills, setChosenRaceSkills] = useState<string[]>([]); // Perícias escolhidas pelo jogador
  const [chosenRaceAttributes, setChosenRaceAttributes] = useState<string[]>([]); // Atributos escolhidos para +1
  const [previousClassSavingThrows, setPreviousClassSavingThrows] = useState<string[]>([]);
  const [previousClassSkills, setPreviousClassSkills] = useState<string[]>([]);
  const [chosenClassSkills, setChosenClassSkills] = useState<string[]>([]);
  const [selectedSpells, setSelectedSpells] = useState<string[]>([]);
  const [availableSpells, setAvailableSpells] = useState<any[]>([]);
  const [showSpellDialog, setShowSpellDialog] = useState(false);
  const [showShopDialog, setShowShopDialog] = useState(false);
  const [showSubclassSelector, setShowSubclassSelector] = useState(false);
  const [showBackgroundSelector, setShowBackgroundSelector] = useState(false);
  const [showDragonTypeSelector, setShowDragonTypeSelector] = useState(false);
  const [characterType, setCharacterType] = useState<"campaign" | "standalone">("campaign");
  const [hasExistingCharacter, setHasExistingCharacter] = useState(false);

  // Homebrew Integration State
  const [allRaceExpansions, setAllRaceExpansions] = useState<RaceExpansion[]>(RACE_EXPANSIONS);
  const [allCharacterClasses, setAllCharacterClasses] = useState<CharacterClass[]>(CHARACTER_CLASSES);

  useEffect(() => {
    const fetchHomebrew = async () => {
      try {
        // Fetch Homebrew Races
        const racesRes = await fetch("/api/homebrew?type=race");
        if (racesRes.ok) {
          const racesData = await racesRes.json();
          const homebrewRaces: Race[] = racesData.map((item: any) => ({
            name: item.data.name,
            attributeBonuses: item.data.abilityBonuses || {},
            advantages: Array.isArray(item.data.traits)
              ? item.data.traits.map((t: any) => `${t.name}: ${t.description}`)
              : typeof item.data.traits === 'string'
                ? [item.data.traits]
                : [],
            // Map other fields if necessary
            speed: item.data.speed,
            size: item.data.size,
          }));

          if (homebrewRaces.length > 0) {
            setAllRaceExpansions(prev => [
              ...RACE_EXPANSIONS,
              {
                name: "Homebrew",
                races: homebrewRaces
              }
            ]);
          }
        }

        // Fetch Homebrew Classes
        const classesRes = await fetch("/api/homebrew?type=class");
        if (classesRes.ok) {
          const classesData = await classesRes.json();
          const homebrewClasses: CharacterClass[] = classesData.map((item: any) => ({
            name: item.data.name,
            bonuses: {
              hitDie: parseInt(item.data.hitDie?.replace('d', '') || '8'),
              hitPoints: parseInt(item.data.hitDie?.replace('d', '') || '8'), // Max HP at level 1
              armorProficiencies: [], // TODO: Add to form
              weaponProficiencies: [], // TODO: Add to form
              savingThrows: Object.keys(item.data.savingThrows || {}).filter(k => item.data.savingThrows[k]),
              guaranteedSkills: [],
              chooseableSkills: 2, // Default
              skillOptions: item.data.skills ? item.data.skills.split(',').map((s: string) => s.trim()) : [],
              primaryAttributes: [], // TODO: Add to form
            }
          }));

          if (homebrewClasses.length > 0) {
            setAllCharacterClasses(prev => [
              ...CHARACTER_CLASSES,
              ...homebrewClasses
            ]);
          }
        }
      } catch (error) {
        console.error("Error fetching homebrew content:", error);
      }
    };

    fetchHomebrew();
  }, []);

  const [formData, setFormData] = useState({
    // Informações Básicas
    name: "",
    expansion: "",
    race: "",
    subrace: "",
    characterClass: "",
    subclass: "",
    dragonType: "", // Para Linhagem Dracônica
    level: 1,
    background: "",
    alignment: "",
    experiencePoints: 0,
    image: "",

    // Atributos
    attributes: {
      strength: 0,
      dexterity: 0,
      constitution: 0,
      intelligence: 0,
      wisdom: 0,
      charisma: 0,
    },

    // Proficiência
    proficiencyBonus: 2,

    // Habilidades (skills) - objeto com chave da habilidade e valor booleano para proficiente
    skills: {} as Record<string, boolean>,

    // Testes de Resistência (saving throws)
    savingThrows: {} as Record<string, boolean>,

    // Combate
    armorClass: 10,
    initiative: 0,
    speed: 30,
    currentHp: 10,
    maxHp: 10,
    tempHp: 0,
    hitDice: "1d8",

    // Personalidade
    personalityTraits: "",
    ideals: "",
    bonds: "",
    flaws: "",

    // Outros
    languages: [] as string[],
    proficiencies: [] as string[],
    equipment: "",
    inventory: [] as Array<{ index: string; name: string; quantity: number; cost: number }>,
    currency: {
      pp: 0,
      gp: 0,
      ep: 0,
      sp: 0,
      cp: 0,
    },
    backstory: "",
    notes: "",
  });

  useEffect(() => {
    // Buscar ID do usuário e verificar se já tem personagem
    const fetchUserData = async () => {
      try {
        const userRes = await fetch("/api/auth/me");
        const userData = await userRes.json();
        if (userData.user?.id) {
          setUserId(userData.user.id);
        }

        // Verificar role do usuário
        const roleRes = await fetch("/api/users/me");
        let userIsDM = false;
        if (roleRes.ok) {
          const roleData = await roleRes.json();
          userIsDM = roleData.role === "dm";
          setIsDM(userIsDM);
        }

        // Se não tiver campaignId na URL e não for DM, buscar campanhas disponíveis
        if (!campaignId && !userIsDM) {
          try {
            const campaignsRes = await fetch("/api/campaigns/my-campaigns");
            if (campaignsRes.ok) {
              const campaignsData = await campaignsRes.json();
              setAvailableCampaigns(campaignsData.campaigns || []);
              // Se houver apenas uma campanha, selecionar automaticamente
              if (campaignsData.campaigns && campaignsData.campaigns.length === 1) {
                setSelectedCampaignId(campaignsData.campaigns[0].id);
                router.push(`/characters/new?campaignId=${campaignsData.campaigns[0].id}`);
              }
            }
          } catch (error) {
            console.error("Error fetching campaigns:", error);
          }
        }

        // Se tiver campaignId, buscar dados da campanha e verificar se já existe personagem
        if (campaignId && userData.user?.id) {
          // Buscar dados da campanha
          let campaignAttributeSystem = "fixed";
          try {
            console.log("🔍 Buscando dados da campanha:", campaignId);
            const campaignRes = await fetch(`/api/campaigns/${campaignId}`);
            console.log("📡 Resposta da API:", campaignRes.status, campaignRes.ok);
            if (campaignRes.ok) {
              const campaign = await campaignRes.json();
              console.log("📦 Dados recebidos da API:", campaign);
              campaignAttributeSystem = campaign.attributeSystem || "fixed";
              console.log("📋 Dados da campanha carregados:", {
                id: campaign.id,
                title: campaign.title,
                attributeSystem: campaign.attributeSystem,
                campaignAttributeSystem
              });
              const newCampaignData = {
                attributeSystem: campaignAttributeSystem,
                initialMoney: campaign.initialMoney || "0",
              };
              setCampaignData(newCampaignData);
              console.log("✅ campaignData setado:", newCampaignData);

              // Aplicar dinheiro inicial se houver
              if (campaign.initialMoney && campaign.initialMoney !== "0") {
                const initialMoneyValue = calculateInitialMoney(campaign.initialMoney);
                // Converter para moedas de ouro (gp) - assumindo que o valor é em gp
                setFormData(prev => ({
                  ...prev,
                  currency: {
                    ...prev.currency,
                    gp: initialMoneyValue,
                  },
                }));
              }
            }
          } catch (error) {
            console.error("Error fetching campaign data:", error);
          }

          // Buscar ID do usuário no banco de dados
          const userMeRes = await fetch("/api/users/me");
          let dbUserId = userData.user.id;
          if (userMeRes.ok) {
            const userMeData = await userMeRes.json();
            dbUserId = userMeData.id || userData.user.id;
          }

          // Verificar se há rolagem salva no localStorage
          const storageKey = `character_rolls_${campaignId}_${dbUserId}`;
          const savedRolls = localStorage.getItem(storageKey);
          // Usar o valor da campanha recém-buscada
          const currentSystem = campaignAttributeSystem;

          console.log("🔍 Verificando rolagem salva. Sistema atual:", currentSystem, "campaignAttributeSystem:", campaignAttributeSystem);

          if (savedRolls) {
            try {
              const parsed = JSON.parse(savedRolls);
              console.log("📦 Rolagem salva encontrada:", parsed);
              // Verificar se a rolagem salva corresponde ao sistema atual
              // Se não tiver attributeSystem ou for diferente, limpar
              if (!parsed.attributeSystem || parsed.attributeSystem !== currentSystem) {
                localStorage.removeItem(storageKey);
                console.log("🗑️ Rolagem antiga removida no useEffect. Sistema antigo:", parsed.attributeSystem, "Sistema atual:", currentSystem);
              } else if (parsed.attributeSystem === currentSystem) {
                if (currentSystem === "point_buy") {
                  // Restaurar point buy
                  if (parsed.pointBuyAttributes) {
                    setPointBuyAttributes(parsed.pointBuyAttributes);
                    setPointBuyPointsUsed(parsed.pointBuyPointsUsed || 0);
                    setHasRolled(true);
                    // Restaurar atributos no formData
                    setFormData(prev => {
                      const newAttributes: Record<string, number> = {};
                      ATTRIBUTES.forEach(attr => {
                        const raceBonus = previousRaceBonuses[attr.key as keyof RaceBonus] || 0;
                        newAttributes[attr.key] = (parsed.pointBuyAttributes[attr.key] || 8) + raceBonus;
                      });
                      return {
                        ...prev,
                        attributes: {
                          ...prev.attributes,
                          ...newAttributes,
                        },
                      };
                    });
                  }
                } else if (parsed.rolls && Array.isArray(parsed.rolls) && parsed.rolls.length === 6) {
                  // Restaurar rolagem normal
                  console.log("✅ Restaurando rolagem salva:", parsed.rolls, "Sistema:", parsed.attributeSystem);
                  setRolledValues(parsed.rolls);
                  if (parsed.rollDetails && Array.isArray(parsed.rollDetails)) {
                    setRollDetails(parsed.rollDetails);
                  } else {
                    setRollDetails([]);
                  }
                  setHasRolled(true);
                  setAttributeAssignments(parsed.assignments || {
                    strength: null,
                    dexterity: null,
                    constitution: null,
                    intelligence: null,
                    wisdom: null,
                    charisma: null,
                  });
                  setAssignedRollIndices(parsed.assignedIndices || {
                    strength: null,
                    dexterity: null,
                    constitution: null,
                    intelligence: null,
                    wisdom: null,
                    charisma: null,
                  });

                  // Restaurar valores nos atributos se houver atribuições
                  const restoredAttributes: any = {};
                  if (parsed.assignments) {
                    Object.entries(parsed.assignments).forEach(([key, value]) => {
                      if (value !== null && typeof value === 'number') {
                        restoredAttributes[key] = value;
                      }
                    });

                    if (Object.keys(restoredAttributes).length > 0) {
                      setFormData(prev => ({
                        ...prev,
                        attributes: {
                          ...prev.attributes,
                          ...restoredAttributes,
                        },
                        // Restaurar iniciativa se destreza foi atribuída
                        ...(restoredAttributes.dexterity && {
                          initiative: Math.max(0, calculateModifier(restoredAttributes.dexterity)),
                        }),
                      }));
                    }
                  }
                }
              } else if (!parsed.attributeSystem) {
                // Rolagem antiga sem sistema definido, limpar
                console.log("🗑️ Limpando rolagem antiga sem sistema definido");
                localStorage.removeItem(storageKey);
              }
            } catch (error) {
              console.error("Error loading saved rolls:", error);
              // Em caso de erro, limpar rolagem antiga
              localStorage.removeItem(storageKey);
            }
          }

          const charactersRes = await fetch("/api/characters");
          if (charactersRes.ok) {
            const characters = await charactersRes.json();
            // Verificar por ambos os IDs possíveis
            const campaignCharacters = characters.filter(
              (char: any) =>
                char.campaignId === campaignId &&
                (char.playerId === userData.user.id || char.playerId === dbUserId)
            );

            // Verificar se há personagem vivo
            const aliveCharacter = campaignCharacters.find(
              (char: any) => (char.currentHp ?? 0) > 0
            );

            if (aliveCharacter) {
              setExistingCharacter(aliveCharacter);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Erro ao carregar dados do usuário");
      } finally {
        setCheckingCharacter(false);
      }
    };

    fetchUserData();
  }, [campaignId, router, previousRaceBonuses]);

  const calculateTotalPointCost = useCallback((attributes: Record<string, number>): number => {
    return Object.values(attributes).reduce((total, value) => total + getPointCost(value), 0);
  }, []);

  // Calcular pontos usados no sistema point_buy
  useEffect(() => {
    if (campaignData?.attributeSystem === "point_buy") {
      const totalCost = calculateTotalPointCost(pointBuyAttributes);
      setPointBuyPointsUsed(totalCost);
    }
  }, [pointBuyAttributes, campaignData?.attributeSystem, calculateTotalPointCost]);

  // Recalcular PV e CA quando atributos ou classe mudarem
  useEffect(() => {
    if (!formData.characterClass) return;

    const charClass = allCharacterClasses.find(c => c.name === formData.characterClass);
    if (!charClass) return;

    setFormData(prev => {
      const bonuses = charClass.bonuses;
      const conModifier = calculateModifier(prev.attributes.constitution || 0);

      // HP base é sempre hitPoints da classe + CON (nível 1)
      const newMaxHp = bonuses.hitPoints + conModifier;

      // Atualizar dado de vida baseado na classe
      const hitDiceValue = `1d${bonuses.hitDie}`;

      // Calcular CA se tiver defesa sem armadura
      let newArmorClass = prev.armorClass;
      if (bonuses.unarmoredDefense) {
        const dexModifier = calculateModifier(prev.attributes.dexterity || 0);
        if (bonuses.unarmoredDefense.includes("CON")) {
          const conMod = calculateModifier(prev.attributes.constitution || 0);
          newArmorClass = 10 + dexModifier + conMod;
        } else if (bonuses.unarmoredDefense.includes("SAB")) {
          const wisMod = calculateModifier(prev.attributes.wisdom || 0);
          newArmorClass = 10 + dexModifier + wisMod;
        }
      }

      // Ao criar personagem, sempre atualizar currentHp para maxHp
      // Quando a classe ou atributos mudam, atualizar para o novo máximo
      const newCurrentHp = Math.max(1, newMaxHp);

      // Atualizar a referência da classe anterior
      previousCharacterClassRef.current = formData.characterClass;

      return {
        ...prev,
        maxHp: newMaxHp,
        currentHp: newCurrentHp,
        hitDice: hitDiceValue,
        armorClass: bonuses.unarmoredDefense ? newArmorClass : prev.armorClass,
      };
    });
  }, [formData.attributes.constitution, formData.attributes.dexterity, formData.attributes.wisdom, formData.characterClass]);

  const calculateModifier = (value: number): number => {
    return Math.floor((value - 10) / 2);
  };

  // Função para calcular dinheiro de uma fórmula (ex: "100" ou "2d4x10")
  const calculateInitialMoney = (formula: string): number => {
    if (!formula || formula.trim() === "") return 0;

    // Se for apenas um número, retornar direto
    const numMatch = formula.match(/^\d+$/);
    if (numMatch) {
      return parseInt(numMatch[0]);
    }

    // Tentar parsear fórmulas de dados (ex: "2d4x10", "1d6x100")
    const diceMatch = formula.match(/(\d+)d(\d+)(?:x(\d+))?/i);
    if (diceMatch) {
      const numDice = parseInt(diceMatch[1]);
      const diceSize = parseInt(diceMatch[2]);
      const multiplier = diceMatch[3] ? parseInt(diceMatch[3]) : 1;

      let total = 0;
      for (let i = 0; i < numDice; i++) {
        total += Math.floor(Math.random() * diceSize) + 1;
      }
      return total * multiplier;
    }

    // Se não conseguir parsear, retornar 0
    console.warn(`Não foi possível parsear fórmula de dinheiro: ${formula}`);
    return 0;
  };

  // Tabela de custo de pontos para Point Buy
  const getPointCost = (value: number): number => {
    const costTable: Record<number, number> = {
      8: 0,
      9: 1,
      10: 2,
      11: 3,
      12: 4,
      13: 5,
      14: 7,
      15: 9,
    };
    return costTable[value] ?? 0;
  };

  const rollD20 = (): number => {
    const roll = Math.floor(Math.random() * 20) + 1;
    return Math.max(8, roll); // Garantir mínimo de 8
  };

  const rollD6 = (): number => {
    return Math.floor(Math.random() * 6) + 1;
  };

  const roll4d6DropLowest = (): { total: number; dice: number[] } => {
    const rolls = [rollD6(), rollD6(), rollD6(), rollD6()];
    const sortedRolls = [...rolls].sort((a, b) => b - a); // Ordenar do maior para o menor
    const total = sortedRolls[0] + sortedRolls[1] + sortedRolls[2]; // Somar os 3 maiores
    return { total, dice: rolls }; // Retornar o total e os 4 valores originais
  };

  // Função para aplicar bônus de classe
  const applyClassBonuses = (className: string) => {
    const charClass = allCharacterClasses.find(c => c.name === className);
    if (!charClass) return;

    setFormData(prev => {
      const bonuses = charClass.bonuses;

      // Remover testes de resistência anteriores da classe
      const newSavingThrows = { ...prev.savingThrows };
      previousClassSavingThrows.forEach(attrKey => {
        delete newSavingThrows[attrKey];
      });

      // Aplicar testes de resistência da classe
      const newClassSavingThrows: string[] = [];
      if (bonuses.savingThrows && bonuses.savingThrows.length > 0) {
        bonuses.savingThrows.forEach(attrKey => {
          newSavingThrows[attrKey] = true;
          newClassSavingThrows.push(attrKey);
        });
      }
      setPreviousClassSavingThrows(newClassSavingThrows);

      // Remover APENAS perícias anteriores da classe (preservando raça e background)
      const newSkills = { ...prev.skills };

      // Remove apenas as perícias que vieram da classe anterior
      [...previousClassSkills, ...chosenClassSkills].forEach(skillKey => {
        delete newSkills[skillKey];
      });

      // Aplicar perícias garantidas da classe (não duplica se já existe)
      const newClassSkills: string[] = [];
      if (bonuses.guaranteedSkills && bonuses.guaranteedSkills.length > 0) {
        bonuses.guaranteedSkills.forEach(skillKey => {
          if (!newSkills[skillKey]) {
            newSkills[skillKey] = true;
            newClassSkills.push(skillKey);
          }
        });
      }
      setPreviousClassSkills(newClassSkills);
      setChosenClassSkills([]);

      // Calcular PV máximo baseado no dado de vida + CON
      const conModifier = calculateModifier(prev.attributes.constitution || 0);
      const newMaxHp = bonuses.hitPoints + conModifier;
      const newCurrentHp = Math.max(1, newMaxHp); // Garantir pelo menos 1 PV

      // Atualizar dado de vida baseado na classe
      const hitDiceValue = `1d${bonuses.hitDie}`;

      // Calcular CA se tiver defesa sem armadura
      let newArmorClass = prev.armorClass;
      if (bonuses.unarmoredDefense) {
        const dexModifier = calculateModifier(prev.attributes.dexterity || 0);
        if (bonuses.unarmoredDefense.includes("CON")) {
          const conMod = calculateModifier(prev.attributes.constitution || 0);
          newArmorClass = 10 + dexModifier + conMod;
        } else if (bonuses.unarmoredDefense.includes("SAB")) {
          const wisMod = calculateModifier(prev.attributes.wisdom || 0);
          newArmorClass = 10 + dexModifier + wisMod;
        }
      }

      return {
        ...prev,
        savingThrows: newSavingThrows,
        skills: newSkills,
        maxHp: newMaxHp,
        currentHp: newCurrentHp,
        hitDice: hitDiceValue,
        armorClass: newArmorClass,
      };
    });

    // Se a classe pode conjurar magias, buscar magias disponíveis
    if (canCastSpells(className)) {
      fetchSpellsForClass(className, 1);
    } else {
      setAvailableSpells([]);
      setSelectedSpells([]);
    }
  };

  // Função para buscar magias disponíveis para uma classe
  const fetchSpellsForClass = async (className: string, level: number) => {
    try {
      const spellsRes = await fetch(`https://www.dnd5eapi.co/api/2014/spells`);
      if (!spellsRes.ok) return;

      const spellsData = await spellsRes.json();
      const allSpells: any[] = spellsData.results || [];
      const maxSpellLevel = getSpellcastingLevel(className, level);

      // Filtrar magias por nível máximo
      const filteredSpells: any[] = [];
      const spellPromises = allSpells.slice(0, 200).map(async (spell: any) => {
        try {
          const detailRes = await fetch(`https://www.dnd5eapi.co${spell.url}`);
          if (detailRes.ok) {
            const detail = await detailRes.json();
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
      const validSpells = results.filter((s): s is any => s !== null && s.level !== undefined);

      setAvailableSpells(validSpells);

      // Resetar seleção quando mudar de classe
      setSelectedSpells([]);
    } catch (error) {
      console.error("Error fetching spells:", error);
    }
  };

  // Função para aplicar bônus de raça aos atributos
  const applyRaceBonuses = (expansionName: string, raceName: string, subraceName?: string, chosenAttributes?: string[]) => {
    // Usar os atributos escolhidos passados como parâmetro ou do estado
    const attributesToUse = chosenAttributes !== undefined ? chosenAttributes : chosenRaceAttributes;
    const expansion = allRaceExpansions.find(exp => exp.name === expansionName);
    if (!expansion) return;

    const race = expansion.races.find(r => r.name === raceName);
    if (!race) return;

    setFormData(prev => {
      // Remover bônus anteriores e obter valores base
      // Se houver valores atribuídos, usar esses valores base; senão, usar valores atuais menos bônus anteriores
      const newAttributes = { ...prev.attributes };
      Object.keys(previousRaceBonuses).forEach((key) => {
        const attrKey = key as keyof RaceBonus;
        if (previousRaceBonuses[attrKey]) {
          // Se há um valor atribuído (valor base), usar ele; senão, remover bônus do valor atual
          const baseValue = attributeAssignments[attrKey];
          if (baseValue !== null && baseValue !== undefined) {
            newAttributes[attrKey as keyof typeof newAttributes] = baseValue;
          } else {
            newAttributes[attrKey as keyof typeof newAttributes] = Math.max(0,
              (newAttributes[attrKey as keyof typeof newAttributes] || 0) - (previousRaceBonuses[attrKey] || 0)
            );
          }
        }
      });

      // Aplicar bônus da raça base
      const baseBonuses = { ...race.attributeBonuses };
      Object.keys(baseBonuses).forEach((key) => {
        const attrKey = key as keyof RaceBonus;
        if (baseBonuses[attrKey]) {
          // Se há um valor atribuído (valor base), usar ele; senão, usar valor atual
          const baseValue = attributeAssignments[attrKey];
          const currentBase = baseValue !== null && baseValue !== undefined
            ? baseValue
            : (newAttributes[attrKey as keyof typeof newAttributes] || 0);
          newAttributes[attrKey as keyof typeof newAttributes] = currentBase + (baseBonuses[attrKey] || 0);
        }
      });

      // Aplicar bônus da sub-raça se houver
      let subraceBonuses: RaceBonus = {};
      if (subraceName && race.subraces) {
        const subrace = race.subraces.find(sr => sr.name === subraceName);
        if (subrace) {
          subraceBonuses = { ...subrace.attributeBonuses };
          Object.keys(subraceBonuses).forEach((key) => {
            const attrKey = key as keyof RaceBonus;
            if (subraceBonuses[attrKey]) {
              // Usar o valor atual (que já tem bônus da raça base) e somar bônus da sub-raça
              newAttributes[attrKey as keyof typeof newAttributes] =
                (newAttributes[attrKey as keyof typeof newAttributes] || 0) + (subraceBonuses[attrKey] || 0);
            }
          });
        }
      }

      // Aplicar bônus dos atributos escolhidos (para raças como Meio-Elfo)
      // Como já removemos todos os bônus anteriores no início da função,
      // podemos simplesmente aplicar os bônus dos atributos escolhidos
      if (race.chooseableAttributes && attributesToUse.length > 0) {
        attributesToUse.forEach((attrKey) => {
          const key = attrKey as keyof RaceBonus;
          if (key in newAttributes) {
            newAttributes[key as keyof typeof newAttributes] =
              (newAttributes[key as keyof typeof newAttributes] || 0) + 1;
          }
        });
      }

      // Salvar bônus aplicados para poder remover depois
      const totalBonuses: RaceBonus = { ...baseBonuses };
      Object.keys(baseBonuses).forEach((key) => {
        const attrKey = key as keyof RaceBonus;
        totalBonuses[attrKey] = (baseBonuses[attrKey] || 0) + (subraceBonuses[attrKey] || 0);
      });
      Object.keys(subraceBonuses).forEach((key) => {
        const attrKey = key as keyof RaceBonus;
        if (!totalBonuses[attrKey]) {
          totalBonuses[attrKey] = subraceBonuses[attrKey];
        }
      });
      // Adicionar bônus dos atributos escolhidos
      attributesToUse.forEach((attrKey) => {
        const key = attrKey as keyof RaceBonus;
        totalBonuses[key] = (totalBonuses[key] || 0) + 1;
      });
      setPreviousRaceBonuses(totalBonuses);

      // Adicionar vantagens nas notas
      let advantagesText = "";
      if (race.advantages && race.advantages.length > 0) {
        advantagesText += `\n\n=== VANTAGENS RACIAIS (${raceName}) ===\n`;
        advantagesText += race.advantages.join("\n");

        // Adicionar informações sobre atributos escolhidos
        if (race.chooseableAttributes && attributesToUse.length > 0) {
          const attributeNames: Record<string, string> = {
            strength: "Força",
            dexterity: "Destreza",
            constitution: "Constituição",
            intelligence: "Inteligência",
            wisdom: "Sabedoria",
            charisma: "Carisma",
          };
          const chosenNames = attributesToUse.map(attr => attributeNames[attr] || attr);
          advantagesText += `\n\nAtributos escolhidos para +1: ${chosenNames.join(", ")}`;
        }
      }
      if (subraceName && race.subraces) {
        const subrace = race.subraces.find(sr => sr.name === subraceName);
        if (subrace && subrace.advantages && subrace.advantages.length > 0) {
          advantagesText += `\n\n=== VANTAGENS DA SUB-RAÇA (${subraceName}) ===\n`;
          advantagesText += subrace.advantages.join("\n");
        }
      }

      // Remover vantagens anteriores e adicionar novas
      let newNotes = prev.notes || "";
      // Usar replaceAll com regex alternativo para compatibilidade
      newNotes = newNotes.replace(/\n\n=== VANTAGENS RACIAIS[\s\S]*?(?=\n\n===|$)/g, "");
      newNotes = newNotes.replace(/\n\n=== VANTAGENS DA SUB-RAÇA[\s\S]*?(?=\n\n===|$)/g, "");
      if (advantagesText) {
        newNotes += advantagesText;
      }

      // Remover perícias anteriores da raça (garantidas e escolhidas)
      const newSkills = { ...prev.skills };
      [...previousRaceSkills, ...chosenRaceSkills].forEach(skillKey => {
        delete newSkills[skillKey];
      });

      // Aplicar perícias garantidas da nova raça
      const newRaceSkills: string[] = [];
      if (race.guaranteedSkills && race.guaranteedSkills.length > 0) {
        race.guaranteedSkills.forEach(skillKey => {
          newSkills[skillKey] = true;
          newRaceSkills.push(skillKey);
        });
      }
      setPreviousRaceSkills(newRaceSkills);
      // Limpar perícias escolhidas quando trocar de raça
      // NOTA: Não limpar chosenRaceAttributes aqui, pois pode ser chamado após selecionar atributos
      // A limpeza será feita apenas quando trocar de raça no onChange

      return {
        ...prev,
        attributes: newAttributes,
        // Atualizar iniciativa se destreza mudou
        initiative: Math.max(0, calculateModifier(newAttributes.dexterity || 0)),
        notes: newNotes,
        skills: newSkills,
        speed: race.speed || 30, // Apply race speed or default to 30
      };
    });
  };

  const rollAttributes = () => {
    // Verificar se já existe rolagem salva
    if (campaignId && userId) {
      const storageKey = `character_rolls_${campaignId}_${userId}`;
      const savedRolls = localStorage.getItem(storageKey);
      const currentSystem = campaignData?.attributeSystem || "fixed";

      if (savedRolls) {
        try {
          const parsed = JSON.parse(savedRolls);
          // Verificar se a rolagem salva corresponde ao sistema atual
          // Se o sistema mudou, limpar e permitir nova rolagem
          if (parsed.attributeSystem && parsed.attributeSystem !== currentSystem) {
            localStorage.removeItem(storageKey);
            toast.info("Sistema de atributos mudou. Faça uma nova rolagem.");
            // Continuar para fazer nova rolagem
          } else if (parsed.rolls && Array.isArray(parsed.rolls) && parsed.rolls.length === 6 && parsed.attributeSystem === currentSystem) {
            setRolledValues(parsed.rolls);
            if (parsed.rollDetails && Array.isArray(parsed.rollDetails)) {
              setRollDetails(parsed.rollDetails);
            } else {
              setRollDetails([]);
            }
            setHasRolled(true);
            setAttributeAssignments(parsed.assignments || {
              strength: null,
              dexterity: null,
              constitution: null,
              intelligence: null,
              wisdom: null,
              charisma: null,
            });

            // Restaurar valores nos atributos
            if (parsed.assignments) {
              const restoredAttributes: any = {};
              Object.entries(parsed.assignments).forEach(([key, value]) => {
                if (value !== null && typeof value === 'number') {
                  restoredAttributes[key] = value;
                }
              });

              if (Object.keys(restoredAttributes).length > 0) {
                setFormData(prev => ({
                  ...prev,
                  attributes: {
                    ...prev.attributes,
                    ...restoredAttributes,
                  },
                  // Restaurar iniciativa se destreza foi atribuída
                  ...(restoredAttributes.dexterity && {
                    initiative: Math.max(0, calculateModifier(restoredAttributes.dexterity)),
                  }),
                }));
              }
            }

            // Restaurar point buy se aplicável
            if (currentSystem === "point_buy" && parsed.pointBuyAttributes) {
              setPointBuyAttributes(parsed.pointBuyAttributes);
              setPointBuyPointsUsed(parsed.pointBuyPointsUsed || 0);
            }

            toast.info("Rolagem anterior restaurada. Você não pode rolar novamente para este personagem.");
            return;
          } else {
            // Sistema diferente ou rolagem antiga sem sistema definido - limpar e fazer nova
            localStorage.removeItem(storageKey);
            if (parsed.attributeSystem && parsed.attributeSystem !== currentSystem) {
              toast.info("Sistema de atributos mudou. Fazendo nova rolagem...");
            }
            // Continuar para fazer nova rolagem abaixo
          }
        } catch (error) {
          console.error("Error parsing saved rolls:", error);
          // Em caso de erro, limpar e fazer nova rolagem
          localStorage.removeItem(storageKey);
        }
      }
    }

    // Se não há rolagem salva ou foi limpa, fazer nova rolagem baseada no sistema da campanha
    // Verificar se campaignData foi carregado
    if (!campaignData) {
      console.warn("⚠️ campaignData não carregado ainda. Tentando buscar novamente...");
      toast.error("Aguarde, carregando dados da campanha...");
      // Tentar buscar novamente
      if (campaignId) {
        fetch(`/api/campaigns/${campaignId}`)
          .then(res => res.json())
          .then(campaign => {
            const system = campaign.attributeSystem || "fixed";
            setCampaignData({
              attributeSystem: system,
              initialMoney: campaign.initialMoney || "0",
            });
            console.log("✅ campaignData carregado após retry:", system);
            toast.info("Dados da campanha carregados. Tente rolar novamente.");
          })
          .catch(err => {
            console.error("Erro ao buscar campanha:", err);
            toast.error("Erro ao carregar dados da campanha");
          });
      }
      return;
    }

    const attributeSystem = campaignData.attributeSystem || "fixed";

    // Debug: verificar qual sistema está sendo usado
    console.log("🎲 Rolando atributos com sistema:", attributeSystem, "campaignData:", campaignData);
    let rolls: number[] = [];

    if (attributeSystem === "fixed") {
      // Valores fixos: 15, 14, 13, 12, 10, 8
      rolls = [15, 14, 13, 12, 10, 8];
      console.log("✅ Valores fixos gerados:", rolls);
      setRolledValues(rolls);
      setHasRolled(true);
    } else if (attributeSystem === "roll_4d6") {
      // Rolagem 4d6 ignorando o menor
      console.log("🎲 Iniciando rolagem 4d6...");
      const rollDetailsArray: Array<{ total: number; dice: number[] }> = [];
      for (let i = 0; i < 6; i++) {
        const rollResult = roll4d6DropLowest();
        rolls.push(rollResult.total);
        rollDetailsArray.push(rollResult);
        console.log(`  Rolagem ${i + 1}: ${rollResult.total} (dados: ${rollResult.dice.join(", ")})`);
      }
      console.log("✅ Valores 4d6 gerados:", rolls);
      setRolledValues(rolls);
      setRollDetails(rollDetailsArray);
      setHasRolled(true);
    } else if (attributeSystem === "point_buy") {
      // Point buy - não precisa rolar, apenas marcar como "rolado"
      setHasRolled(true);
      // Inicializar valores com 8 (padrão)
      const initialAttrs: Record<string, number> = {};
      ATTRIBUTES.forEach(attr => {
        initialAttrs[attr.key] = 8;
      });
      setPointBuyAttributes(initialAttrs);
      setPointBuyPointsUsed(0);
      // Atualizar formData com valores iniciais + bônus de raça
      setFormData(prev => {
        const newAttributes: Record<string, number> = {};
        ATTRIBUTES.forEach(attr => {
          const raceBonus = previousRaceBonuses[attr.key as keyof RaceBonus] || 0;
          newAttributes[attr.key] = 8 + raceBonus;
        });
        return {
          ...prev,
          attributes: {
            ...prev.attributes,
            ...newAttributes,
          },
        };
      });
      toast.success("Sistema de compra de pontos ativado! Use os botões +/- para ajustar os atributos.");
      // Salvar no localStorage
      if (campaignId && userId) {
        const storageKey = `character_rolls_${campaignId}_${userId}`;
        localStorage.setItem(storageKey, JSON.stringify({
          attributeSystem: "point_buy",
          pointBuyAttributes: initialAttrs,
          pointBuyPointsUsed: 0,
          rolls: [],
          assignments: {
            strength: null,
            dexterity: null,
            constitution: null,
            intelligence: null,
            wisdom: null,
            charisma: null,
          },
          assignedIndices: {
            strength: null,
            dexterity: null,
            constitution: null,
            intelligence: null,
            wisdom: null,
            charisma: null,
          },
          timestamp: Date.now(),
        }));
      }
      return;
    }

    // Salvar no localStorage
    if (campaignId && userId) {
      const storageKey = `character_rolls_${campaignId}_${userId}`;
      const attributeSystem = campaignData?.attributeSystem || "fixed";

      const saveData: any = {
        attributeSystem,
        assignments: {
          strength: null,
          dexterity: null,
          constitution: null,
          intelligence: null,
          wisdom: null,
          charisma: null,
        },
        assignedIndices: {
          strength: null,
          dexterity: null,
          constitution: null,
          intelligence: null,
          wisdom: null,
          charisma: null,
        },
        timestamp: Date.now(),
      };

      if (attributeSystem === "point_buy") {
        saveData.pointBuyAttributes = pointBuyAttributes;
        saveData.pointBuyPointsUsed = pointBuyPointsUsed;
        saveData.rolls = [];
        saveData.rollDetails = [];
      } else {
        saveData.rolls = rolls;
        if (attributeSystem === "roll_4d6" && rollDetails.length > 0) {
          saveData.rollDetails = rollDetails;
        } else {
          saveData.rollDetails = [];
        }
      }

      localStorage.setItem(storageKey, JSON.stringify(saveData));
      toast.success("Rolagem realizada! Os valores foram salvos e não podem ser alterados.");
    }
  };

  const resetRolls = () => {
    if (!campaignId || !userId) return;

    // Confirmar com o usuário
    if (!confirm("Tem certeza que deseja resetar a rolagem? Todos os valores atribuídos serão perdidos.")) {
      return;
    }

    const storageKey = `character_rolls_${campaignId}_${userId}`;

    // Limpar estados de rolagem
    setRolledValues([]);
    setRollDetails([]);
    setHasRolled(false);
    setAttributeAssignments({
      strength: null,
      dexterity: null,
      constitution: null,
      intelligence: null,
      wisdom: null,
      charisma: null,
    });
    setAssignedRollIndices({
      strength: null,
      dexterity: null,
      constitution: null,
      intelligence: null,
      wisdom: null,
      charisma: null,
    });

    // Resetar atributos removendo apenas os valores atribuídos, mantendo bônus de raça
    setFormData(prev => {
      const newAttributes = { ...prev.attributes };
      ATTRIBUTES.forEach(attr => {
        const raceBonus = previousRaceBonuses[attr.key as keyof RaceBonus] || 0;
        newAttributes[attr.key as keyof typeof newAttributes] = raceBonus; // Manter apenas bônus de raça
      });

      return {
        ...prev,
        attributes: newAttributes,
        initiative: 0, // Resetar iniciativa
      };
    });

    // Limpar localStorage
    localStorage.removeItem(storageKey);

    // Limpar erros de validação
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      ATTRIBUTES.forEach(attr => {
        delete newErrors[`attribute_${attr.key}`];
      });
      return newErrors;
    });

    toast.success("Rolagem resetada! Você pode rolar novamente.");
  };

  const assignValueToAttribute = (attributeKey: string, value: number, rollIndex: number) => {
    // Verificar se o índice já está atribuído a outro atributo
    const currentAssignment = Object.entries(assignedRollIndices).find(
      ([_, idx]) => idx === rollIndex
    );

    let newAssignments: Record<string, number | null>;
    let newAssignedIndices: Record<string, number | null>;

    if (currentAssignment && currentAssignment[0] !== attributeKey) {
      // Remover atribuição anterior
      newAssignments = {
        ...attributeAssignments,
        [currentAssignment[0]]: null,
        [attributeKey]: value,
      };
      newAssignedIndices = {
        ...assignedRollIndices,
        [currentAssignment[0]]: null,
        [attributeKey]: rollIndex,
      };
    } else {
      newAssignments = {
        ...attributeAssignments,
        [attributeKey]: value,
      };
      newAssignedIndices = {
        ...assignedRollIndices,
        [attributeKey]: rollIndex,
      };
    }

    setAttributeAssignments(newAssignments);
    setAssignedRollIndices(newAssignedIndices);

    // Limpar erro de validação para este atributo
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[`attribute_${attributeKey}`];
      return newErrors;
    });

    // Atualizar o atributo no formData
    // O valor atribuído é o valor base (sem bônus), então precisamos somar os bônus de raça
    const raceBonus = previousRaceBonuses[attributeKey as keyof RaceBonus] || 0;
    const finalValue = value + raceBonus;
    const dexModifier = attributeKey === "dexterity" ? calculateModifier(finalValue) : undefined;
    const conModifier = attributeKey === "constitution" ? calculateModifier(finalValue) : undefined;

    setFormData(prev => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [attributeKey]: finalValue,
      },
      // Se for destreza, atualizar iniciativa automaticamente
      ...(attributeKey === "dexterity" && dexModifier !== undefined && {
        initiative: Math.max(0, dexModifier),
      }),
    }));

    // Salvar atribuições no localStorage
    if (campaignId && userId && rolledValues.length > 0) {
      const storageKey = `character_rolls_${campaignId}_${userId}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        localStorage.setItem(storageKey, JSON.stringify({
          ...parsed,
          assignments: newAssignments,
          assignedIndices: newAssignedIndices,
        }));
      }
    }
  };

  const removeAssignment = (attributeKey: string) => {
    const newAssignments = {
      ...attributeAssignments,
      [attributeKey]: null,
    };

    const newAssignedIndices = {
      ...assignedRollIndices,
      [attributeKey]: null,
    };

    setAttributeAssignments(newAssignments);
    setAssignedRollIndices(newAssignedIndices);

    // Resetar para 0 + bônus de raça (se houver)
    const raceBonus = previousRaceBonuses[attributeKey as keyof RaceBonus] || 0;
    const newValue = 0 + raceBonus;
    const conModifier = attributeKey === "constitution" ? calculateModifier(newValue) : undefined;

    setFormData(prev => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [attributeKey]: newValue,
      },
      // Se for destreza, resetar iniciativa
      ...(attributeKey === "dexterity" && {
        initiative: Math.max(0, calculateModifier(newValue)),
      }),
    }));

    // Salvar atribuições no localStorage
    if (campaignId && userId && rolledValues.length > 0) {
      const storageKey = `character_rolls_${campaignId}_${userId}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        localStorage.setItem(storageKey, JSON.stringify({
          ...parsed,
          assignments: newAssignments,
          assignedIndices: newAssignedIndices,
        }));
      }
    }
  };

  const getSkillModifier = (skillKey: string): number => {
    const skill = SKILLS.find((s) => s.key === skillKey);
    if (!skill) return 0;

    const attributeValue = formData.attributes[skill.attribute as keyof typeof formData.attributes] || 0;
    const baseModifier = calculateModifier(attributeValue);
    const isProficient = formData.skills[skillKey] || false;

    return Math.max(0, baseModifier + (isProficient ? formData.proficiencyBonus : 0));
  };

  const getSavingThrowModifier = (attributeKey: string): number => {
    const attributeValue = formData.attributes[attributeKey as keyof typeof formData.attributes] || 0;
    const baseModifier = calculateModifier(attributeValue);
    const isProficient = formData.savingThrows[attributeKey] || false;

    return Math.max(0, baseModifier + (isProficient ? formData.proficiencyBonus : 0));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, boolean> = {};
    let hasErrors = false;

    // Validar campos obrigatórios básicos
    if (!formData.name || formData.name.trim() === "") {
      errors.name = true;
      hasErrors = true;
    }

    if (!selectedExpansion || selectedExpansion === "") {
      errors.expansion = true;
      hasErrors = true;
    }

    if (!selectedRace || selectedRace === "") {
      errors.race = true;
      hasErrors = true;
    }

    if (!formData.characterClass) {
      errors.characterClass = true;
      hasErrors = true;
    }

    // Validar atributos baseado no sistema escolhido
    const attributeSystem = campaignData?.attributeSystem || "fixed";

    if (attributeSystem === "point_buy") {
      // Validar se usou exatamente 27 pontos
      if (pointBuyPointsUsed !== 27) {
        ATTRIBUTES.forEach((attr) => {
          errors[`attribute_${attr.key}`] = true;
        });
        hasErrors = true;
      }
    } else if (attributeSystem === "fixed") {
      // Valores fixos - verificar se todos foram atribuídos
      if (!isDM && hasRolled && rolledValues.length > 0) {
        ATTRIBUTES.forEach((attr) => {
          const assignedValue = attributeAssignments[attr.key];
          if (assignedValue === null || assignedValue === undefined) {
            errors[`attribute_${attr.key}`] = true;
            hasErrors = true;
          }
        });
      }
    } else if (attributeSystem === "roll_4d6") {
      // Rolagem 4d6 - verificar se todos foram atribuídos
      if (!isDM && hasRolled && rolledValues.length > 0) {
        ATTRIBUTES.forEach((attr) => {
          const assignedValue = attributeAssignments[attr.key];
          if (assignedValue === null || assignedValue === undefined) {
            errors[`attribute_${attr.key}`] = true;
            hasErrors = true;
          }
        });
      }
    }

    setValidationErrors(errors);

    if (hasErrors) {
      const attributeSystem = campaignData?.attributeSystem || "fixed";
      let errorMessage = "Por favor, preencha todos os campos obrigatórios";
      if (attributeSystem === "point_buy") {
        errorMessage += " e use exatamente 27 pontos nos atributos.";
      } else {
        errorMessage += " e atribua todos os valores aos atributos.";
      }
      toast.error(errorMessage);
      // Scroll para o primeiro erro (apenas campos obrigatórios, não moedas)
      const firstErrorField = Object.keys(errors).find(key =>
        !key.includes('currency') && !key.includes('pp') && !key.includes('gp') &&
        !key.includes('ep') && !key.includes('sp') && !key.includes('cp')
      );
      if (firstErrorField) {
        const fieldId = firstErrorField.replace('attribute_', '');
        const errorElement = document.getElementById(fieldId) ||
          document.querySelector(`[name="${fieldId}"]`) ||
          document.querySelector(`#${fieldId}`);
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Se for um input, focar nele
          if (errorElement instanceof HTMLInputElement || errorElement instanceof HTMLTextAreaElement) {
            errorElement.focus();
          }
        }
      }
    }

    return !hasErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalCampaignId = campaignId || selectedCampaignId;
    if (!finalCampaignId) {
      setValidationErrors(prev => ({ ...prev, campaign: true }));
      toast.error("Por favor, selecione uma campanha");
      return;
    }

    if (!userId) {
      toast.error("Usuário não autenticado");
      return;
    }

    // Validar formulário antes de salvar
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Buscar ID correto do usuário no banco de dados
      let finalUserId = userId;
      try {
        const userMeRes = await fetch("/api/users/me");
        if (userMeRes.ok) {
          const userMeData = await userMeRes.json();
          finalUserId = userMeData.id || userId;
        }
      } catch (error) {
        console.error("Error fetching user ID:", error);
      }

      // Preparar payload removendo campos vazios
      const finalCampaignId = characterType === "standalone" ? null : (selectedCampaignId || campaignId);
      const payload: any = {
        campaignId: finalCampaignId,
        playerId: finalUserId,
        system: "dnd5e",
        name: formData.name,
        characterClass: formData.characterClass,
        level: formData.level,
        experiencePoints: formData.experiencePoints || 0,
        armorClass: formData.armorClass,
        initiative: formData.initiative || 0,
        speed: formData.speed,
        currentHp: formData.currentHp,
        maxHp: formData.maxHp,
        tempHp: formData.tempHp || 0,
        attributes: formData.attributes,
        savingThrows: formData.savingThrows,
        skills: formData.skills,
        proficiencyBonus: formData.proficiencyBonus,
      };

      // Adicionar campos opcionais apenas se tiverem valor
      if (formData.expansion) payload.expansion = formData.expansion;
      if (formData.race) payload.race = formData.race;
      if (formData.subrace) payload.subrace = formData.subrace;
      if (formData.subclass) payload.subclass = formData.subclass;
      if (formData.background) payload.background = formData.background;
      if (formData.alignment) payload.alignment = formData.alignment;
      if (formData.hitDice) payload.hitDice = formData.hitDice;
      if (formData.proficiencies && formData.proficiencies.length > 0) payload.proficiencies = formData.proficiencies;
      if (formData.languages && formData.languages.length > 0) payload.languages = formData.languages;
      if (formData.equipment) payload.equipment = { notes: formData.equipment };
      payload.currency = formData.currency || { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 };
      payload.inventory = Array.isArray(formData.inventory) ? formData.inventory : [];
      if (formData.personalityTraits) payload.personalityTraits = formData.personalityTraits;
      if (formData.ideals) payload.ideals = formData.ideals;
      if (formData.bonds) payload.bonds = formData.bonds;
      if (formData.flaws) payload.flaws = formData.flaws;
      if (formData.backstory) payload.backstory = formData.backstory;
      if (formData.notes) payload.notes = formData.notes;
      if (formData.image) payload.image = formData.image;

      // Adicionar features da classe
      if (formData.characterClass) {
        const features = getClassFeatures(formData.characterClass, formData.level);
        const featuresByLevel: Record<number, any[]> = {};
        features.forEach(feature => {
          if (!featuresByLevel[feature.level]) {
            featuresByLevel[feature.level] = [];
          }
          featuresByLevel[feature.level].push({
            name: feature.name,
            description: feature.description,
            type: feature.type,
          });
        });
        payload.features = featuresByLevel;
      }

      // Adicionar spellcasting se a classe pode conjurar magias
      if (canCastSpells(formData.characterClass) && selectedSpells.length > 0) {
        const spellSlots = getSpellSlots(formData.characterClass, formData.level);
        payload.spellcasting = {
          knownSpells: selectedSpells,
          spellSlots: spellSlots,
        };
      }

      // Validar dados antes de enviar
      if (!payload.currency) {
        payload.currency = { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 };
      }
      if (!Array.isArray(payload.inventory)) {
        payload.inventory = [];
      }

      const res = await fetch("/api/characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        console.error("API Error:", error);

        // Se o erro for sobre personagem existente, mostrar mensagem específica
        if (error.error && error.error.includes("personagem vivo")) {
          throw new Error(error.error);
        }

        throw new Error(error.error || error.message || "Erro ao criar personagem");
      }

      const character = await res.json();

      // Limpar rolagem salva após criar personagem com sucesso
      if (campaignId && userId) {
        const storageKey = `character_rolls_${campaignId}_${userId}`;
        localStorage.removeItem(storageKey);
      }

      toast.success("Personagem criado com sucesso!");
      router.push(`/characters/${character.id}`);
    } catch (error: any) {
      console.error("Error creating character:", error);
      toast.error(error.message || "Erro ao criar personagem");
    } finally {
      setLoading(false);
    }
  };

  // Se está verificando, mostrar loading
  if (checkingCharacter) {
    return (
      <FantasyLayout>
        <div className="text-center py-12 text-muted-foreground">
          Verificando personagens existentes...
        </div>
      </FantasyLayout>
    );
  }

  // Se não é DM e já tem personagem vivo, mostrar aviso
  if (!isDM && existingCharacter && (existingCharacter.currentHp ?? 0) > 0) {
    return (
      <FantasyLayout>
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.back()} className="gap-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold font-cinzel text-primary">
                Criar Personagem
              </h1>
            </div>
          </div>
          <Card className="bg-card/60 border-yellow-500/50">
            <CardHeader>
              <CardTitle className="text-xl font-cinzel text-yellow-400">
                Personagem Já Existe
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Você já possui um personagem vivo nesta campanha:
              </p>
              <div className="p-4 bg-card/40 rounded border border-yellow-500/30">
                <p className="font-semibold text-lg">{existingCharacter.name}</p>
                <p className="text-sm text-muted-foreground">
                  {existingCharacter.characterClass} • Nível {existingCharacter.level}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  PV: {existingCharacter.currentHp} / {existingCharacter.maxHp}
                </p>
              </div>
              <p className="text-muted-foreground">
                Você só pode criar um novo personagem se o personagem atual estiver morto (PV = 0).
              </p>
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => router.back()}>
                  Voltar
                </Button>
                {campaignId && (
                  <Button onClick={() => router.push(`/campaigns/${campaignId}`)}>
                    Ver Personagem
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </FantasyLayout>
    );
  }

  return (
    <FantasyLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()} className="gap-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold font-cinzel text-primary">
              Criar Personagem
            </h1>
            <p className="text-muted-foreground mt-2">
              Preencha a ficha de D&D 5e
            </p>
            {!isDM && existingCharacter && (
              <p className="text-sm text-yellow-400 mt-1">
                ⚠️ Você está criando um novo personagem porque o anterior está morto
              </p>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Character Type and Campaign Selection */}
          <CharacterTypeSelection
            characterType={characterType}
            onCharacterTypeChange={setCharacterType}
            selectedCampaignId={selectedCampaignId}
            onCampaignChange={(id) => {
              setSelectedCampaignId(id);
              if (!campaignId) {
                router.push(`/characters/new?campaignId=${id}`);
              }
            }}
            availableCampaigns={availableCampaigns}
            hasExistingCharacter={hasExistingCharacter}
            userId={userId}
            startingLevel={formData.level}
            onLevelChange={(level) => setFormData(prev => ({ ...prev, level }))}
          />

          {/* Informações Básicas */}
          <Card className="bg-card/60 border-white/10">
            <CardHeader>
              <CardTitle className="text-xl font-cinzel">Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="name">Nome do Personagem *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    // Limpar erro ao digitar
                    setValidationErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.name;
                      return newErrors;
                    });
                  }}
                  className={validationErrors.name ? "border-red-500 border-2" : ""}
                  required
                />
                {validationErrors.name && (
                  <p className="text-xs text-red-400 mt-1">Nome é obrigatório</p>
                )}
              </div>
              <div>
                <Label htmlFor="expansion">Expansão *</Label>
                <select
                  id="expansion"
                  className={`w-full h-10 px-3 rounded-md border bg-background ${validationErrors.expansion ? "border-red-500 border-2" : "border-input"}`}
                  value={selectedExpansion}
                  onChange={(e) => {
                    setSelectedExpansion(e.target.value);
                    setSelectedRace("");
                    setSelectedSubrace("");
                    // Limpar erro ao selecionar
                    setValidationErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.expansion;
                      return newErrors;
                    });
                    // Remover bônus anteriores
                    setFormData(prev => {
                      const newAttributes = { ...prev.attributes };
                      const newSkills = { ...prev.skills };

                      // Remover bônus de atributos anteriores
                      if (Object.keys(previousRaceBonuses).length > 0) {
                        Object.keys(previousRaceBonuses).forEach((key) => {
                          const attrKey = key as keyof RaceBonus;
                          if (previousRaceBonuses[attrKey]) {
                            newAttributes[attrKey as keyof typeof newAttributes] = Math.max(0,
                              (newAttributes[attrKey as keyof typeof newAttributes] || 0) - (previousRaceBonuses[attrKey] || 0)
                            );
                          }
                        });
                        setPreviousRaceBonuses({});
                      }

                      // Remover perícias anteriores (garantidas e escolhidas)
                      [...previousRaceSkills, ...chosenRaceSkills].forEach(skillKey => {
                        delete newSkills[skillKey];
                      });
                      setPreviousRaceSkills([]);
                      setChosenRaceSkills([]);
                      setChosenRaceAttributes([]);

                      return {
                        ...prev,
                        expansion: e.target.value,
                        race: "",
                        subrace: "",
                        attributes: newAttributes,
                        skills: newSkills,
                        initiative: Math.max(0, calculateModifier(newAttributes.dexterity || 0)),
                      };
                    });
                  }}
                  required
                >
                  <option value="">Selecione a expansão...</option>
                  {allRaceExpansions.map((exp) => (
                    <option key={exp.name} value={exp.name}>
                      {exp.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="race">Raça *</Label>
                <select
                  id="race"
                  className={`w-full h-10 px-3 rounded-md border bg-background ${validationErrors.race ? "border-red-500 border-2" : "border-input"}`}
                  value={selectedRace}
                  onChange={(e) => {
                    setSelectedRace(e.target.value);
                    setSelectedSubrace("");
                    // Limpar atributos escolhidos quando trocar de raça
                    setChosenRaceAttributes([]);
                    setFormData({ ...formData, race: e.target.value, subrace: "" });
                    // Limpar erro ao selecionar
                    setValidationErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.race;
                      return newErrors;
                    });
                    // Resetar atributos escolhidos quando a raça muda
                    setChosenRaceAttributes([]);
                    if (selectedExpansion && e.target.value) {
                      applyRaceBonuses(selectedExpansion, e.target.value);
                    }
                  }}
                  disabled={!selectedExpansion}
                  required
                >
                  <option value="">Selecione a raça...</option>
                  {selectedExpansion && allRaceExpansions
                    .find(exp => exp.name === selectedExpansion)
                    ?.races.map((race) => (
                      <option key={race.name} value={race.name}>
                        {race.name}
                      </option>
                    ))}
                </select>
              </div>
              {selectedRace && selectedExpansion && (() => {
                const expansion = allRaceExpansions.find(exp => exp.name === selectedExpansion);
                const race = expansion?.races.find(r => r.name === selectedRace);

                if (!race) return null;

                return (
                  <>
                    {race.subraces && race.subraces.length > 0 && (
                      <div>
                        <Label htmlFor="subrace">Sub-raça</Label>
                        <select
                          id="subrace"
                          className="w-full h-10 px-3 rounded-md border border-input bg-background"
                          value={selectedSubrace}
                          onChange={(e) => {
                            setSelectedSubrace(e.target.value);
                            setFormData(prev => ({ ...prev, subrace: e.target.value }));
                            if (selectedExpansion && selectedRace) {
                              applyRaceBonuses(selectedExpansion, selectedRace, e.target.value || undefined);
                            }
                          }}
                        >
                          <option value="">Nenhuma</option>
                          {race.subraces.map((subrace) => (
                            <option key={subrace.name} value={subrace.name}>
                              {subrace.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    {race?.chooseableAttributes && race.chooseableAttributes > 0 && (
                      <div className="md:col-span-3">
                        <Label>Escolha {race.chooseableAttributes} {race.chooseableAttributes === 1 ? 'atributo' : 'atributos'} para +1:</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mt-2">
                          {[
                            { key: "strength", label: "Força" },
                            { key: "dexterity", label: "Destreza" },
                            { key: "constitution", label: "Constituição" },
                            { key: "intelligence", label: "Inteligência" },
                            { key: "wisdom", label: "Sabedoria" },
                            { key: "charisma", label: "Carisma" },
                          ].map((attr) => {
                            const isChosen = chosenRaceAttributes.includes(attr.key);
                            const chosenCount = chosenRaceAttributes.length;
                            const maxChoices = race.chooseableAttributes || 0;
                            const canSelect = !isChosen && chosenCount < maxChoices;

                            return (
                              <button
                                key={attr.key}
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();

                                  if (canSelect) {
                                    const newChosen = [...chosenRaceAttributes, attr.key];
                                    setChosenRaceAttributes(newChosen);
                                    // Aplicar bônus passando os atributos escolhidos atualizados
                                    if (selectedExpansion && selectedRace) {
                                      setTimeout(() => {
                                        applyRaceBonuses(selectedExpansion, selectedRace, selectedSubrace || undefined, newChosen);
                                      }, 50);
                                    }
                                  } else if (isChosen) {
                                    const newChosen = chosenRaceAttributes.filter(a => a !== attr.key);
                                    setChosenRaceAttributes(newChosen);
                                    // Remover bônus passando os atributos escolhidos atualizados
                                    if (selectedExpansion && selectedRace) {
                                      setTimeout(() => {
                                        applyRaceBonuses(selectedExpansion, selectedRace, selectedSubrace || undefined, newChosen);
                                      }, 50);
                                    }
                                  }
                                }}
                                disabled={!canSelect && !isChosen}
                                className={`flex items-center gap-2 p-2 rounded border transition-colors ${isChosen
                                  ? "bg-primary/20 border-primary cursor-pointer"
                                  : canSelect
                                    ? "bg-card/40 border-border hover:bg-card/60 cursor-pointer"
                                    : "bg-card/20 border-border opacity-50 cursor-not-allowed"
                                  }`}
                                style={{ pointerEvents: (!canSelect && !isChosen) ? 'none' : 'auto' }}
                              >
                                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${isChosen
                                  ? "bg-primary border-primary"
                                  : "border-border"
                                  }`}>
                                  {isChosen && (
                                    <span className="text-white text-xs">✓</span>
                                  )}
                                </div>
                                <span className="text-sm">{attr.label}</span>
                              </button>
                            );
                          })}
                        </div>
                        {chosenRaceAttributes.length < race.chooseableAttributes && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Selecione {race.chooseableAttributes} {race.chooseableAttributes === 1 ? 'atributo' : 'atributos'} da lista acima para receber +1.
                          </p>
                        )}
                      </div>
                    )}
                    {race?.chooseableSkills && race.chooseableSkills > 0 && (
                      <div className="md:col-span-3">
                        <Label>Escolha {race.chooseableSkills} {race.chooseableSkills === 1 ? 'perícia' : 'perícias'} da raça:</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-2">
                          {SKILLS.map((skill) => {
                            const isGuaranteed = previousRaceSkills.includes(skill.key);
                            const isChosen = chosenRaceSkills.includes(skill.key);
                            const chosenCount = chosenRaceSkills.length;
                            const canSelect = !isGuaranteed && !isChosen && chosenCount < race.chooseableSkills!;

                            return (
                              <button
                                key={skill.key}
                                type="button"
                                onClick={() => {
                                  if (canSelect) {
                                    // Adicionar perícia escolhida e marcar como proficiente automaticamente
                                    setFormData(prev => ({
                                      ...prev,
                                      skills: {
                                        ...prev.skills,
                                        [skill.key]: true,
                                      },
                                    }));
                                    setChosenRaceSkills(prev => [...prev, skill.key]);
                                  } else if (isChosen) {
                                    // Remover perícia escolhida
                                    setFormData(prev => ({
                                      ...prev,
                                      skills: {
                                        ...prev.skills,
                                        [skill.key]: false,
                                      },
                                    }));
                                    setChosenRaceSkills(prev => prev.filter(s => s !== skill.key));
                                  }
                                }}
                                disabled={!canSelect && !isChosen}
                                className={`flex items-center gap-2 p-2 rounded border transition-colors ${isChosen
                                  ? "bg-primary/20 border-primary cursor-pointer"
                                  : isGuaranteed
                                    ? "bg-primary/10 border-primary/50 cursor-default"
                                    : canSelect
                                      ? "bg-card/40 border-border hover:bg-card/60 cursor-pointer"
                                      : "bg-card/20 border-border opacity-50 cursor-not-allowed"
                                  }`}
                              >
                                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${isChosen || isGuaranteed
                                  ? "bg-primary border-primary"
                                  : "border-border"
                                  }`}>
                                  {(isChosen || isGuaranteed) && (
                                    <span className="text-white text-xs">✓</span>
                                  )}
                                </div>
                                <span className="text-sm text-left">{skill.label}</span>
                                {isChosen && (
                                  <span className="ml-auto text-xs text-primary">Escolhida</span>
                                )}
                                {isGuaranteed && (
                                  <span className="ml-auto text-xs text-muted-foreground">Garantida</span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Selecione {race.chooseableSkills} {race.chooseableSkills === 1 ? 'perícia' : 'perícias'} da lista acima.
                        </p>
                      </div>
                    )}
                  </>
                );
              })()}
              <div>
                <Label htmlFor="characterClass">Classe *</Label>
                <select
                  id="characterClass"
                  className={`w-full h-10 px-3 rounded-md border bg-background ${validationErrors.characterClass ? "border-red-500 border-2" : "border-input"}`}
                  value={formData.characterClass}
                  onChange={(e) => {
                    // Limpar erro ao selecionar
                    setValidationErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.characterClass;
                      return newErrors;
                    });

                    // Limpar subclasse e dragonType ao trocar de classe
                    setFormData(prev => ({
                      ...prev,
                      characterClass: e.target.value,
                      subclass: "", // Limpar subclasse
                      dragonType: "" // Limpar tipo de dragão
                    }));

                    if (e.target.value) {
                      applyClassBonuses(e.target.value);
                    }
                  }}
                  required
                >
                  <option value="">Selecione...</option>
                  {allCharacterClasses.map((cls) => (
                    <option key={cls.name} value={cls.name}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Seleção de Subclasse */}
              {formData.characterClass && (() => {
                const subclassLevel = getSubclassLevel(formData.characterClass);
                const needsSubclass = formData.level >= subclassLevel;

                if (!needsSubclass) return null;

                return (
                  <div>
                    <Label htmlFor="subclass">
                      Subclasse {formData.characterClass === 'Bruxo' ? '(Patrono)' : ''}
                      {needsSubclass && ' *'}
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="subclass"
                        value={formData.subclass}
                        readOnly
                        placeholder={`Selecione ${formData.characterClass === 'Bruxo' ? 'seu patrono' : 'sua subclasse'}...`}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowSubclassSelector(true)}
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Escolher
                      </Button>
                    </div>
                  </div>
                );
              })()}

              {/* Seleção de Tipo de Dragão (Linhagem Dracônica) */}
              {formData.subclass === "Linhagem Dracônica" && (
                <div>
                  <Label htmlFor="dragonType">Dragão Ancestral *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="dragonType"
                      value={formData.dragonType}
                      readOnly
                      placeholder="Selecione seu dragão ancestral..."
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowDragonTypeSelector(true)}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Escolher
                    </Button>
                  </div>
                </div>
              )}

              {/* Seleção de Antecedente */}
              <div>
                <Label htmlFor="background">Antecedente</Label>
                <div className="flex gap-2">
                  <Input
                    id="background"
                    value={formData.background}
                    readOnly
                    placeholder="Selecione seu antecedente..."
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowBackgroundSelector(true)}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Escolher
                  </Button>
                </div>
              </div>

              {formData.characterClass && (() => {
                const charClass = CHARACTER_CLASSES.find(c => c.name === formData.characterClass);
                if (!charClass || !charClass.bonuses.chooseableSkills || charClass.bonuses.chooseableSkills === 0) return null;

                const skillOptions = charClass.bonuses.skillOptions && charClass.bonuses.skillOptions.length > 0
                  ? charClass.bonuses.skillOptions
                  : SKILLS.map(s => s.key);

                return (
                  <div className="md:col-span-3">
                    <Label>Escolha {charClass.bonuses.chooseableSkills} {charClass.bonuses.chooseableSkills === 1 ? 'perícia' : 'perícias'} da classe:</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-2">
                      {SKILLS.filter(skill => skillOptions.includes(skill.key)).map((skill) => {
                        const isGuaranteed = previousClassSkills.includes(skill.key);
                        const isChosen = chosenClassSkills.includes(skill.key);
                        const chosenCount = chosenClassSkills.length;
                        const canSelect = !isGuaranteed && !isChosen && chosenCount < charClass.bonuses.chooseableSkills!;

                        return (
                          <button
                            key={skill.key}
                            type="button"
                            onClick={() => {
                              if (canSelect) {
                                setFormData(prev => ({
                                  ...prev,
                                  skills: {
                                    ...prev.skills,
                                    [skill.key]: true,
                                  },
                                }));
                                setChosenClassSkills(prev => [...prev, skill.key]);
                              } else if (isChosen) {
                                setFormData(prev => ({
                                  ...prev,
                                  skills: {
                                    ...prev.skills,
                                    [skill.key]: false,
                                  },
                                }));
                                setChosenClassSkills(prev => prev.filter(s => s !== skill.key));
                              }
                            }}
                            disabled={!canSelect && !isChosen}
                            className={`flex items-center gap-2 p-2 rounded border transition-colors ${isChosen
                              ? "bg-primary/20 border-primary cursor-pointer"
                              : isGuaranteed
                                ? "bg-primary/10 border-primary/50 cursor-default"
                                : canSelect
                                  ? "bg-card/40 border-border hover:bg-card/60 cursor-pointer"
                                  : "bg-card/20 border-border opacity-50 cursor-not-allowed"
                              }`}
                          >
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${isChosen || isGuaranteed
                              ? "bg-primary border-primary"
                              : "border-border"
                              }`}>
                              {(isChosen || isGuaranteed) && (
                                <span className="text-white text-xs">✓</span>
                              )}
                            </div>
                            <span className="text-sm text-left">{skill.label}</span>
                            {isChosen && (
                              <span className="ml-auto text-xs text-primary">Escolhida</span>
                            )}
                            {isGuaranteed && (
                              <span className="ml-auto text-xs text-muted-foreground">Garantida</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Clique em {charClass.bonuses.chooseableSkills} {charClass.bonuses.chooseableSkills === 1 ? 'perícia' : 'perícias'} da lista acima.
                    </p>
                  </div>
                );
              })()}
              <div>
                <Label htmlFor="level">Nível</Label>
                <Input
                  id="level"
                  type="number"
                  min="1"
                  max="20"
                  value={formData.level}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      level: parseInt(e.target.value) || 1,
                      proficiencyBonus: Math.ceil((parseInt(e.target.value) || 1) / 4) + 1,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="alignment">Alinhamento</Label>
                <select
                  id="alignment"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  value={formData.alignment}
                  onChange={(e) => setFormData({ ...formData, alignment: e.target.value })}
                >
                  <option value="">Selecione...</option>
                  {ALIGNMENTS.map((align) => (
                    <option key={align} value={align}>
                      {align}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="experiencePoints">Pontos de Experiência</Label>
                <Input
                  id="experiencePoints"
                  type="number"
                  min="0"
                  value={formData.experiencePoints}
                  onChange={(e) =>
                    setFormData({ ...formData, experiencePoints: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="md:col-span-3">
                <Label htmlFor="image">URL do Avatar do Personagem</Label>
                <Input
                  id="image"
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://exemplo.com/imagem.jpg"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Cole a URL da imagem do avatar do personagem (opcional)
                </p>
                <p className="text-xs text-blue-400/80 mt-1 flex items-center gap-1">
                  <span className="font-semibold">💡 Dica:</span>
                  <span>Tamanho ideal: 512x512px ou 1024x1024px (formato quadrado), formato PNG ou JPG, máximo 1MB</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Atributos e Modificadores */}
          <Card className="bg-card/60 border-white/10">
            <CardHeader>
              <CardTitle className="text-xl font-cinzel">Atributos</CardTitle>
              {!isDM && (
                <p className="text-sm text-muted-foreground mt-2">
                  {campaignData ? (
                    <>
                      {campaignData.attributeSystem === "fixed" && "Use os valores fixos (15, 14, 13, 12, 10, 8) e atribua aos atributos."}
                      {campaignData.attributeSystem === "point_buy" && "Distribua 27 pontos entre os atributos usando a tabela de custos."}
                      {campaignData.attributeSystem === "roll_4d6" && "Role 4d6 para cada atributo (ignorando o menor valor) e atribua aos atributos."}
                      {!campaignData.attributeSystem && "Sistema de atributos não definido. Entre em contato com o mestre."}
                    </>
                  ) : (
                    "Carregando dados da campanha..."
                  )}
                  {" A iniciativa será calculada automaticamente baseada no modificador de Destreza."}
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {!isDM && campaignData && campaignData.attributeSystem === "point_buy" && (
                <div className="space-y-4">
                  <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">Compra de Pontos</h3>
                      <div className="text-lg font-bold">
                        <span className={pointBuyPointsUsed > 27 ? "text-red-400" : pointBuyPointsUsed === 27 ? "text-green-400" : "text-yellow-400"}>
                          {pointBuyPointsUsed} / 27 pontos
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Ajuste os valores dos atributos abaixo. Cada valor tem um custo em pontos conforme a tabela oficial.
                    </p>
                    <div className="mt-3 text-xs bg-card/40 p-2 rounded">
                      <strong>Tabela de Custos:</strong> 8=0, 9=1, 10=2, 11=3, 12=4, 13=5, 14=7, 15=9 pontos
                    </div>
                  </div>
                </div>
              )}
              {!isDM && campaignData && campaignData.attributeSystem !== "point_buy" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold mb-2">
                        {campaignData?.attributeSystem === "fixed" ? "Valores Fixos" : campaignData?.attributeSystem === "roll_4d6" ? "Rolagem 4d6" : "Rolagem de Dados"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {campaignData?.attributeSystem === "fixed" && "Use os valores fixos abaixo e atribua aos atributos."}
                        {campaignData?.attributeSystem === "roll_4d6" && "Clique no botão para rolar 4d6 (ignorando menor) para cada atributo. Depois, clique nos valores para atribuí-los."}
                        {!campaignData?.attributeSystem && "Clique no botão para rolar 6 D20. Depois, clique nos valores para atribuí-los aos atributos."}
                      </p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Button
                        type="button"
                        onClick={rollAttributes}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer active:scale-95 transition-transform duration-150"
                        disabled={hasRolled && rolledValues.length > 0}
                      >
                        {hasRolled && rolledValues.length > 0 ? "✓ Rolagem Realizada" : "🎲 Rolagem de Atributos"}
                      </Button>
                      {hasRolled && rolledValues.length > 0 && (
                        <Button
                          type="button"
                          onClick={resetRolls}
                          variant="outline"
                          size="icon"
                          title="Resetar rolagem e permitir rolar novamente"
                          className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500 cursor-pointer active:scale-90 transition-transform duration-150"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {hasRolled && rolledValues.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Você já realizou a rolagem para este personagem. Os valores são salvos automaticamente.
                        <br />
                        <span className="text-yellow-400">Clique no ícone de resetar ao lado para rolar novamente.</span>
                      </p>
                    )}
                  </div>

                  {hasRolled && rolledValues.length > 0 && (
                    <div className="space-y-3">
                      <Label>Valores Rolados (clique para atribuir):</Label>
                      <TooltipProvider>
                        <div className="flex flex-wrap gap-2">
                          {rolledValues.map((value, index) => {
                            // Verificar se este índice específico está atribuído
                            const assignedTo = Object.entries(assignedRollIndices).find(
                              ([_, idx]) => idx === index
                            )?.[0];
                            const attrLabel = assignedTo ? ATTRIBUTES.find(a => a.key === assignedTo)?.label : null;
                            const isAssigned = assignedTo !== undefined;
                            const is4d6System = campaignData?.attributeSystem === "roll_4d6";
                            const rollDetail = rollDetails[index];

                            const buttonContent = (
                              <button
                                key={`roll-${index}`}
                                type="button"
                                onClick={() => {
                                  // Se já está atribuído, remover atribuição
                                  if (isAssigned && assignedTo) {
                                    removeAssignment(assignedTo);
                                  }
                                }}
                                className={`px-4 py-2 rounded-lg border-2 font-bold text-lg transition-all active:scale-95 ${isAssigned
                                  ? "bg-green-500/20 border-green-500 text-green-400 cursor-pointer"
                                  : "bg-primary/10 border-primary/30 text-primary hover:bg-primary/20 cursor-pointer"
                                  }`}
                                title={isAssigned ? `Atribuído a: ${attrLabel}` : "Clique em um atributo abaixo para atribuir este valor"}
                              >
                                {value}
                                {isAssigned && attrLabel && (
                                  <span className="ml-2 text-xs">✓ {attrLabel}</span>
                                )}
                              </button>
                            );

                            // Se for sistema 4d6 e tiver detalhes da rolagem, mostrar tooltip
                            if (is4d6System && rollDetail && rollDetail.dice) {
                              const sortedDice = [...rollDetail.dice].sort((a, b) => b - a);
                              const lowestDice = sortedDice[3];
                              const usedDice = sortedDice.slice(0, 3);

                              return (
                                <Tooltip key={`roll-${index}`}>
                                  <TooltipTrigger asChild>
                                    {buttonContent}
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <div className="space-y-1">
                                      <div className="font-semibold">4d6: {rollDetail.dice.join(", ")}</div>
                                      <div className="text-xs opacity-90">
                                        Usados: {usedDice.join(" + ")} = {rollDetail.total}
                                      </div>
                                      <div className="text-xs opacity-70">
                                        Descartado: {lowestDice}
                                      </div>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              );
                            }

                            return buttonContent;
                          })}
                        </div>
                      </TooltipProvider>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {ATTRIBUTES.map((attr) => {
                  const value = formData.attributes[attr.key as keyof typeof formData.attributes] || 0;
                  const modifier = calculateModifier(value);
                  const assignedValue = attributeAssignments[attr.key];
                  const assignedIndex = assignedRollIndices[attr.key];
                  const raceBonus = previousRaceBonuses[attr.key as keyof RaceBonus] || 0;
                  const baseValue = assignedValue !== null && assignedValue !== undefined ? assignedValue : (value - raceBonus);
                  const isPointBuy = campaignData?.attributeSystem === "point_buy";
                  const pointBuyValue = pointBuyAttributes[attr.key] || 8;
                  const pointCost = getPointCost(pointBuyValue);
                  const hasError = validationErrors[`attribute_${attr.key}`] && (!isDM && ((isPointBuy && pointBuyPointsUsed !== 27) || (!isPointBuy && hasRolled && (assignedValue === null || assignedValue === undefined))));

                  return (
                    <div key={attr.key} className="space-y-2">
                      <Label htmlFor={attr.key} className="text-center block">
                        {attr.label} ({attr.abbr})
                      </Label>
                      <div className="text-center">
                        {isPointBuy && !isDM && (
                          <div className="mb-2 space-y-1">
                            <div className="text-xs text-muted-foreground">
                              Custo: <span className="font-bold">{pointCost} pontos</span>
                            </div>
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-6 w-6 cursor-pointer active:scale-90 transition-transform duration-150"
                                onClick={() => {
                                  if (pointBuyValue > 8) {
                                    const newValue = pointBuyValue - 1;
                                    const newAttrs = { ...pointBuyAttributes, [attr.key]: newValue };
                                    setPointBuyAttributes(newAttrs);
                                    const totalCost = calculateTotalPointCost(newAttrs);
                                    setPointBuyPointsUsed(totalCost);
                                    // Atualizar formData com o novo valor + bônus de raça
                                    setFormData(prev => ({
                                      ...prev,
                                      attributes: {
                                        ...prev.attributes,
                                        [attr.key]: newValue + raceBonus,
                                      },
                                      ...(attr.key === "dexterity" && {
                                        initiative: Math.max(0, calculateModifier(newValue + raceBonus)),
                                      }),
                                    }));
                                  }
                                }}
                                disabled={pointBuyValue <= 8}
                              >
                                -
                              </Button>
                              <span className="text-sm font-bold min-w-[2rem]">{pointBuyValue}</span>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-6 w-6 cursor-pointer active:scale-90 transition-transform duration-150"
                                onClick={() => {
                                  if (pointBuyValue < 15) {
                                    const newValue = pointBuyValue + 1;
                                    const newAttrs = { ...pointBuyAttributes, [attr.key]: newValue };
                                    const totalCost = calculateTotalPointCost(newAttrs);
                                    if (totalCost <= 27) {
                                      setPointBuyAttributes(newAttrs);
                                      setPointBuyPointsUsed(totalCost);
                                      // Atualizar formData com o novo valor + bônus de raça
                                      setFormData(prev => ({
                                        ...prev,
                                        attributes: {
                                          ...prev.attributes,
                                          [attr.key]: newValue + raceBonus,
                                        },
                                        ...(attr.key === "dexterity" && {
                                          initiative: Math.max(0, calculateModifier(newValue + raceBonus)),
                                        }),
                                      }));
                                    } else {
                                      toast.error("Você não tem pontos suficientes!");
                                    }
                                  }
                                }}
                                disabled={pointBuyValue >= 15 || calculateTotalPointCost({ ...pointBuyAttributes, [attr.key]: pointBuyValue + 1 }) > 27}
                              >
                                +
                              </Button>
                            </div>
                          </div>
                        )}
                        {!isPointBuy && !isDM && hasRolled && (
                          <div className="mb-2">
                            {assignedValue !== null && assignedIndex !== null ? (
                              <div className="text-xs text-green-400 mb-1">
                                ✓ Valor {assignedValue} atribuído (dado #{assignedIndex + 1})
                                {raceBonus > 0 && (
                                  <span className="text-yellow-400 ml-1">+{raceBonus} raça</span>
                                )}
                              </div>
                            ) : (
                              <div className={`text-xs mb-1 ${hasError ? 'text-red-400 font-bold' : 'text-muted-foreground'}`}>
                                {hasError ? '⚠ Atribua um valor!' : 'Clique em um valor acima para atribuir'}
                              </div>
                            )}
                            {assignedValue !== null && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeAssignment(attr.key)}
                                className="text-xs h-6"
                              >
                                Remover
                              </Button>
                            )}
                          </div>
                        )}
                        {raceBonus > 0 && (
                          <div className="text-xs text-yellow-400 mb-1">
                            Bônus de raça: +{raceBonus}
                          </div>
                        )}
                        <Input
                          id={attr.key}
                          type="number"
                          min="0"
                          max="30"
                          value={value || 0}
                          placeholder="0"
                          className={`text-center font-bold text-lg ${!isDM && hasRolled && assignedValue === null
                            ? "cursor-not-allowed"
                            : ""
                            } ${hasError ? "border-red-500 border-2" : ""}`}
                          onBlur={(e) => {
                            // Validar apenas quando o campo perde o foco
                            const inputValue = e.target.value.trim();
                            const newValue = inputValue === "" ? 0 : parseInt(inputValue) || 0;

                            // Se for jogador e já rolou, validar que o valor está nos valores rolados
                            if (!isDM && hasRolled && rolledValues.length > 0) {
                              // Se resetou para 0, remover atribuição
                              if (newValue === 0) {
                                removeAssignment(attr.key);
                                // Forçar atualização do input
                                e.target.value = "0";
                                return;
                              }

                              // Verificar se o valor está nos valores rolados
                              if (!rolledValues.includes(newValue)) {
                                toast.error(`O valor ${newValue} não foi rolado. Use apenas valores dos dados.`);
                                // Reverter para o valor anterior (que está no estado)
                                const currentValue = formData.attributes[attr.key as keyof typeof formData.attributes] || 0;
                                // Forçar atualização do estado para garantir re-render
                                setFormData(prev => ({
                                  ...prev,
                                  attributes: {
                                    ...prev.attributes,
                                    [attr.key]: currentValue,
                                  },
                                }));
                                // Usar setTimeout para garantir que o valor do input seja atualizado após o re-render
                                setTimeout(() => {
                                  e.target.value = String(currentValue);
                                }, 0);
                                return;
                              }

                              // Se o atributo já tinha um valor atribuído, liberar o índice anterior primeiro
                              const previousIndex = assignedRollIndices[attr.key];

                              // Encontrar um índice disponível com este valor
                              // Se o atributo já tinha um índice atribuído, considerar esse índice também como disponível
                              const availableIndex = rolledValues.findIndex((v, idx) => {
                                if (v !== newValue) return false;
                                // Se é o índice que já estava atribuído a este atributo, está disponível
                                if (idx === previousIndex) return true;
                                // Caso contrário, verificar se o índice não está atribuído a nenhum outro atributo
                                const isIndexAssigned = Object.values(assignedRollIndices).includes(idx);
                                return !isIndexAssigned;
                              });

                              if (availableIndex === -1) {
                                toast.error(`Todos os valores ${newValue} já foram atribuídos.`);
                                // Reverter para o valor anterior (que está no estado)
                                const currentValue = formData.attributes[attr.key as keyof typeof formData.attributes] || 0;
                                // Forçar atualização do estado para garantir re-render
                                setFormData(prev => ({
                                  ...prev,
                                  attributes: {
                                    ...prev.attributes,
                                    [attr.key]: currentValue,
                                  },
                                }));
                                // Usar setTimeout para garantir que o valor do input seja atualizado após o re-render
                                setTimeout(() => {
                                  e.target.value = String(currentValue);
                                }, 0);
                                return;
                              }

                              // Se passou todas as validações, atualizar
                              // O valor digitado é o valor base (sem bônus), então precisamos somar os bônus de raça
                              const raceBonus = previousRaceBonuses[attr.key as keyof RaceBonus] || 0;
                              const finalValue = newValue + raceBonus;

                              setFormData(prev => ({
                                ...prev,
                                attributes: {
                                  ...prev.attributes,
                                  [attr.key]: finalValue,
                                },
                                // Se for destreza, atualizar iniciativa
                                ...(attr.key === "dexterity" && {
                                  initiative: Math.max(0, calculateModifier(finalValue)),
                                }),
                              }));

                              setAttributeAssignments(prev => ({
                                ...prev,
                                [attr.key]: newValue, // Salvar o valor base (sem bônus)
                              }));
                              setAssignedRollIndices(prev => ({
                                ...prev,
                                [attr.key]: availableIndex,
                              }));

                              // Salvar no localStorage
                              if (campaignId && userId) {
                                const storageKey = `character_rolls_${campaignId}_${userId}`;
                                const saved = localStorage.getItem(storageKey);
                                if (saved) {
                                  const parsed = JSON.parse(saved);
                                  localStorage.setItem(storageKey, JSON.stringify({
                                    ...parsed,
                                    assignments: {
                                      ...parsed.assignments || attributeAssignments,
                                      [attr.key]: newValue,
                                    },
                                    assignedIndices: {
                                      ...parsed.assignedIndices || assignedRollIndices,
                                      [attr.key]: availableIndex,
                                    },
                                  }));
                                }
                              }
                            } else {
                              // Para DM ou quando não rolou, permitir qualquer valor
                              // O valor digitado é o valor base (sem bônus), então precisamos somar os bônus de raça
                              const raceBonus = previousRaceBonuses[attr.key as keyof RaceBonus] || 0;
                              const finalValue = newValue + raceBonus;

                              setFormData(prev => ({
                                ...prev,
                                attributes: {
                                  ...prev.attributes,
                                  [attr.key]: finalValue,
                                },
                                // Se for destreza, atualizar iniciativa
                                ...(attr.key === "dexterity" && {
                                  initiative: Math.max(0, calculateModifier(finalValue)),
                                }),
                              }));
                            }
                          }}
                          onChange={(e) => {
                            // Para jogadores que já rolaram, não atualizar o estado ainda
                            // Apenas permitir digitação visual, validação será feita no onBlur
                            if (!isDM && hasRolled && rolledValues.length > 0) {
                              // Não atualizar o estado, apenas permitir digitação
                              return;
                            }
                            // Para DM ou quando não rolou, atualizar normalmente
                            // O valor digitado é o valor base (sem bônus), então precisamos somar os bônus de raça
                            const newValue = parseInt(e.target.value) || 0;
                            const raceBonus = previousRaceBonuses[attr.key as keyof RaceBonus] || 0;
                            const finalValue = newValue + raceBonus;
                            setFormData({
                              ...formData,
                              attributes: {
                                ...formData.attributes,
                                [attr.key]: finalValue,
                              },
                            });
                          }}
                          readOnly={!isDM && hasRolled && assignedValue === null}
                        />
                        <div className="mt-2 p-2 bg-primary/10 rounded border border-primary/20">
                          <div className="text-xs text-muted-foreground">Modificador</div>
                          <div className="text-xl font-bold text-primary">
                            {modifier >= 0 ? "+" : ""}
                            {modifier}
                          </div>
                        </div>
                        {!isDM && hasRolled && rolledValues.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {assignedValue !== null ? (
                              // Mostrar qual valor rolado está atribuído a este atributo
                              <div className="px-2 py-1 text-xs bg-green-500/20 rounded border border-green-500/30 text-green-400 text-center">
                                ✓ Valor {assignedValue} atribuído
                              </div>
                            ) : (
                              // Mostrar botões para valores disponíveis
                              rolledValues
                                .map((rollValue, idx) => {
                                  // Verificar se este índice já está atribuído
                                  const isIndexAssigned = Object.values(assignedRollIndices).includes(idx);
                                  if (isIndexAssigned) return null;

                                  return (
                                    <button
                                      key={`assign-${idx}`}
                                      type="button"
                                      onClick={() => assignValueToAttribute(attr.key, rollValue, idx)}
                                      className="w-full px-2 py-1 text-xs bg-primary/20 hover:bg-primary/30 rounded border border-primary/30 text-primary transition-all cursor-pointer active:scale-95"
                                    >
                                      Atribuir {rollValue}
                                    </button>
                                  );
                                })
                                .filter(Boolean)
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Testes de Resistência e Perícias */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Testes de Resistência */}
            <Card className="bg-card/60 border-white/10">
              <CardHeader>
                <CardTitle className="text-xl font-cinzel">Testes de Resistência</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {ATTRIBUTES.map((attr) => {
                  const modifier = getSavingThrowModifier(attr.key);
                  const isProficient = formData.savingThrows[attr.key] || false;
                  const isFromClass = previousClassSavingThrows.includes(attr.key);

                  return (
                    <div key={attr.key} className="flex items-center justify-between p-2 bg-card/40 rounded">
                      <div className="flex items-center gap-2">
                        <Label className="font-semibold">{attr.abbr}</Label>
                        {isFromClass && (
                          <span className="text-xs text-primary" title="Da classe">✓</span>
                        )}
                      </div>
                      <div className="text-lg font-bold">
                        {modifier >= 0 ? "+" : ""}
                        {modifier}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Perícias */}
            <Card className="bg-card/60 border-white/10">
              <CardHeader>
                <CardTitle className="text-xl font-cinzel">Perícias</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Bônus de Proficiência: +{formData.proficiencyBonus}
                </p>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
                {SKILLS.map((skill) => {
                  const modifier = getSkillModifier(skill.key);
                  const isProficient = formData.skills[skill.key] || false;
                  const attributeAbbr = ATTRIBUTES.find(
                    (a) => a.key === skill.attribute
                  )?.abbr || "";
                  const isFromRace = previousRaceSkills.includes(skill.key) || chosenRaceSkills.includes(skill.key);
                  const isFromClass = previousClassSkills.includes(skill.key) || chosenClassSkills.includes(skill.key);

                  return (
                    <div key={skill.key} className="flex items-center justify-between p-2 bg-card/40 rounded">
                      <div className="flex items-center gap-2">
                        <div>
                          <Label className="font-semibold">{skill.label}</Label>
                          <span className="text-xs text-muted-foreground ml-2">({attributeAbbr})</span>
                        </div>
                        {isProficient && (isFromRace || isFromClass) && (
                          <span className="text-xs text-primary" title={isFromRace ? "Da raça" : "Da classe"}>✓</span>
                        )}
                      </div>
                      <div className="text-lg font-bold">
                        {modifier >= 0 ? "+" : ""}
                        {modifier}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Combate */}
          <Card className="bg-card/60 border-white/10">
            <CardHeader>
              <CardTitle className="text-xl font-cinzel">Combate</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Estatísticas de Combate */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="armorClass">Classe de Armadura (CA)</Label>
                  <Input
                    id="armorClass"
                    type="number"
                    value={formData.armorClass}
                    onChange={(e) =>
                      setFormData({ ...formData, armorClass: parseInt(e.target.value) || 10 })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="initiative">Iniciativa</Label>
                  <Input
                    id="initiative"
                    type="number"
                    value={formData.initiative}
                    onChange={(e) =>
                      setFormData({ ...formData, initiative: parseInt(e.target.value) || 0 })
                    }
                    readOnly={!isDM}
                    className={!isDM ? "bg-muted cursor-not-allowed" : ""}
                  />
                  {!isDM && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Calculado automaticamente pelo modificador de Destreza
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="speed">Deslocamento</Label>
                  <Input
                    id="speed"
                    type="number"
                    value={formData.speed}
                    onChange={(e) =>
                      setFormData({ ...formData, speed: parseInt(e.target.value) || 30 })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="hitDice">Dados de Vida</Label>
                  <Input
                    id="hitDice"
                    value={formData.hitDice}
                    onChange={(e) => setFormData({ ...formData, hitDice: e.target.value })}
                    placeholder="1d8"
                  />
                </div>
                {/* Testes de Resistência (apenas os da classe) */}
                {ATTRIBUTES.filter(attr => previousClassSavingThrows.includes(attr.key)).map((attr) => {
                  const modifier = getSavingThrowModifier(attr.key);
                  const baseModifier = calculateModifier(formData.attributes[attr.key as keyof typeof formData.attributes] || 0);

                  return (
                    <div key={attr.key}>
                      <Label htmlFor={`savingThrow-${attr.key}`}>
                        Teste de {attr.label} ({attr.abbr})
                      </Label>
                      <Input
                        id={`savingThrow-${attr.key}`}
                        type="number"
                        value={modifier}
                        readOnly
                        className="bg-muted cursor-not-allowed"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {baseModifier >= 0 ? "+" : ""}{baseModifier} + {formData.proficiencyBonus} prof.
                      </p>
                    </div>
                  );
                })}
                <div>
                  <Label htmlFor="currentHp">PV Atuais</Label>
                  <Input
                    id="currentHp"
                    type="number"
                    value={formData.currentHp}
                    onChange={(e) =>
                      setFormData({ ...formData, currentHp: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="maxHp">PV Máximos</Label>
                  <Input
                    id="maxHp"
                    type="number"
                    value={formData.maxHp}
                    onChange={(e) => {
                      const newMaxHp = parseInt(e.target.value) || 10;
                      setFormData({
                        ...formData,
                        maxHp: newMaxHp,
                        currentHp: Math.max(1, newMaxHp) // Atualizar currentHp para igual ao maxHp ao criar personagem
                      });
                    }}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    HP base da classe + modificador de CON (calculado automaticamente)
                  </p>
                </div>
                <div>
                  <Label htmlFor="tempHp">PV Temporários</Label>
                  <Input
                    id="tempHp"
                    type="number"
                    value={formData.tempHp}
                    onChange={(e) =>
                      setFormData({ ...formData, tempHp: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personalidade */}
          <Card className="bg-card/60 border-white/10">
            <CardHeader>
              <CardTitle className="text-xl font-cinzel">Personalidade</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="personalityTraits">Traços de Personalidade</Label>
                <Textarea
                  id="personalityTraits"
                  value={formData.personalityTraits}
                  onChange={(e) => setFormData({ ...formData, personalityTraits: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="ideals">Ideais</Label>
                <Textarea
                  id="ideals"
                  value={formData.ideals}
                  onChange={(e) => setFormData({ ...formData, ideals: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="bonds">Vínculos</Label>
                <Textarea
                  id="bonds"
                  value={formData.bonds}
                  onChange={(e) => setFormData({ ...formData, bonds: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="flaws">Defeitos</Label>
                <Textarea
                  id="flaws"
                  value={formData.flaws}
                  onChange={(e) => setFormData({ ...formData, flaws: e.target.value })}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Equipamento e Moedas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card/60 border-white/10">
              <CardHeader>
                <CardTitle className="text-xl font-cinzel">Equipamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Inventário (itens comprados) */}
                {formData.inventory && formData.inventory.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Itens Comprados:</Label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {formData.inventory.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-card/40 rounded text-sm">
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            {item.quantity > 1 && (
                              <p className="text-xs text-muted-foreground">Quantidade: {item.quantity}</p>
                            )}
                            {item.cost && (
                              <p className="text-xs text-muted-foreground">
                                Custo: {item.cost.toFixed(2)} po {item.quantity > 1 && `(Total: ${(item.cost * item.quantity).toFixed(2)} po)`}
                              </p>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newInventory = formData.inventory.filter((_, i) => i !== index);
                              setFormData({ ...formData, inventory: newInventory });
                            }}
                            className="text-red-400 hover:text-red-300"
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notas de equipamento (texto livre) */}
                <div>
                  <Label htmlFor="equipment-notes" className="text-sm font-semibold">
                    Notas de Equipamento:
                  </Label>
                  <Textarea
                    id="equipment-notes"
                    value={formData.equipment}
                    onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                    rows={4}
                    placeholder="Anotações adicionais sobre equipamentos..."
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/60 border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-cinzel">Moedas</CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowShopDialog(true)}
                    className="flex items-center gap-2"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Loja
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pp">Platinas (PL)</Label>
                  <Input
                    id="pp"
                    type="number"
                    min="0"
                    step="1"
                    value={Math.floor(formData.currency.pp || 0)}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currency: { ...formData.currency, pp: Math.max(0, Math.floor(parseFloat(e.target.value) || 0)) },
                      })
                    }
                    disabled={!isDM}
                    className={!isDM ? "bg-muted cursor-not-allowed" : ""}
                    readOnly={!isDM}
                  />
                  {!isDM && (
                    <p className="text-xs text-muted-foreground mt-1">Definido pela campanha</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="gp">Peças de Ouro (PO)</Label>
                  <Input
                    id="gp"
                    type="number"
                    min="0"
                    step="1"
                    value={Math.floor(formData.currency.gp || 0)}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currency: { ...formData.currency, gp: Math.max(0, Math.floor(parseFloat(e.target.value) || 0)) },
                      })
                    }
                    disabled={!isDM}
                    className={!isDM ? "bg-muted cursor-not-allowed" : ""}
                    readOnly={!isDM}
                  />
                  {!isDM && (
                    <p className="text-xs text-muted-foreground mt-1">Definido pela campanha</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="ep">Peças de Electrum (PE)</Label>
                  <Input
                    id="ep"
                    type="number"
                    min="0"
                    step="1"
                    value={Math.floor(formData.currency.ep || 0)}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currency: { ...formData.currency, ep: Math.max(0, Math.floor(parseFloat(e.target.value) || 0)) },
                      })
                    }
                    disabled={!isDM}
                    className={!isDM ? "bg-muted cursor-not-allowed" : ""}
                    readOnly={!isDM}
                  />
                  {!isDM && (
                    <p className="text-xs text-muted-foreground mt-1">Definido pela campanha</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="sp">Peças de Prata (PP)</Label>
                  <Input
                    id="sp"
                    type="number"
                    min="0"
                    step="1"
                    value={Math.floor(formData.currency.sp || 0)}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currency: { ...formData.currency, sp: Math.max(0, Math.floor(parseFloat(e.target.value) || 0)) },
                      })
                    }
                    disabled={!isDM}
                    className={!isDM ? "bg-muted cursor-not-allowed" : ""}
                    readOnly={!isDM}
                  />
                  {!isDM && (
                    <p className="text-xs text-muted-foreground mt-1">Definido pela campanha</p>
                  )}
                </div>
                <div className="col-span-2">
                  <Label htmlFor="cp">Peças de Cobre (PC)</Label>
                  <Input
                    id="cp"
                    type="number"
                    min="0"
                    step="1"
                    value={Math.floor(formData.currency.cp || 0)}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currency: { ...formData.currency, cp: Math.max(0, Math.floor(parseFloat(e.target.value) || 0)) },
                      })
                    }
                    disabled={!isDM}
                    className={!isDM ? "bg-muted cursor-not-allowed" : ""}
                    readOnly={!isDM}
                  />
                  {!isDM && (
                    <p className="text-xs text-muted-foreground mt-1">Definido pela campanha</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Seleção de Magias */}
          {canCastSpells(formData.characterClass) && formData.characterClass && (
            <Card className="bg-card/60 border-white/10">
              <CardHeader>
                <CardTitle className="text-xl font-cinzel flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Magias Conhecidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(() => {
                  const spellSlots = getSpellSlots(formData.characterClass, formData.level);
                  const maxSpellLevel = getSpellcastingLevel(formData.characterClass, formData.level);
                  const spellType = getSpellType(formData.characterClass);

                  // Calcular quantidade de truques e magias baseado na tabela
                  const cantripsCount = getCantripsCount(formData.characterClass, formData.level);

                  // Calcular modificador de Sabedoria para classes preparadas
                  const wisModifier = formData.attributes?.wisdom
                    ? Math.floor((formData.attributes.wisdom - 10) / 2)
                    : 0;

                  const spellsCountValue = getSpellsCount(formData.characterClass, formData.level, wisModifier);
                  const spellsToSelect = typeof spellsCountValue === "number"
                    ? spellsCountValue
                    : (spellsCountValue === "1 + WIS_mod" ? 1 + wisModifier : 0);

                  // Separar truques de magias de nível 1+
                  const selectedCantrips = selectedSpells.filter(spellIndex => {
                    const spell = availableSpells.find(s => s.index === spellIndex);
                    return spell?.level === 0;
                  });

                  const selectedSpellsLevel1Plus = selectedSpells.filter(spellIndex => {
                    const spell = availableSpells.find(s => s.index === spellIndex);
                    return spell?.level && spell.level > 0;
                  });

                  return (
                    <>
                      {spellSlots && (
                        <div>
                          <Label className="mb-2 block">Slots de Magia</Label>
                          <div className="grid grid-cols-5 gap-2">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => {
                              const slots = spellSlots[`level${level}` as keyof typeof spellSlots] || 0;
                              if (slots === 0 && level > 1) return null;
                              return (
                                <div key={level} className="text-center p-2 bg-card/40 rounded">
                                  <p className="text-xs text-muted-foreground">{level}º</p>
                                  <p className="text-lg font-bold">{slots}</p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      {(cantripsCount > 0 || spellsToSelect > 0) && (
                        <div className="space-y-4">
                          {/* Seleção de Truques */}
                          {cantripsCount > 0 && (
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <Label>Truques (Cantrips)</Label>
                                <Badge variant="outline">
                                  {selectedCantrips.length} / {cantripsCount} selecionados
                                </Badge>
                              </div>
                              {selectedCantrips.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-2">
                                  {selectedCantrips.map((spellIndex) => {
                                    const spell = availableSpells.find(s => s.index === spellIndex);
                                    return (
                                      <Badge key={spellIndex} variant="outline" className="p-2">
                                        {spell?.name || spellIndex}
                                        <button
                                          type="button"
                                          onClick={() => setSelectedSpells(prev => prev.filter(s => s !== spellIndex))}
                                          className="ml-2 text-red-400 hover:text-red-300"
                                        >
                                          ×
                                        </button>
                                      </Badge>
                                    );
                                  })}
                                </div>
                              )}
                              <Button
                                type="button"
                                onClick={() => setShowSpellDialog(true)}
                                variant="outline"
                                className="w-full"
                                disabled={selectedCantrips.length >= cantripsCount}
                              >
                                {selectedCantrips.length >= cantripsCount
                                  ? "Todos os truques selecionados"
                                  : `Selecionar Truques (${selectedCantrips.length}/${cantripsCount})`}
                              </Button>
                            </div>
                          )}

                          {/* Seleção de Magias */}
                          {spellsToSelect > 0 && (
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <Label>
                                  Magias {spellType === "prepared" ? "(Preparadas)" : spellType === "spellbook" ? "(Grimório)" : spellType === "pact" ? "(Pacto)" : "(Conhecidas)"}
                                </Label>
                                <Badge variant="outline">
                                  {selectedSpellsLevel1Plus.length} / {spellsToSelect} selecionadas
                                </Badge>
                              </div>
                              {selectedSpellsLevel1Plus.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-2">
                                  {selectedSpellsLevel1Plus.map((spellIndex) => {
                                    const spell = availableSpells.find(s => s.index === spellIndex);
                                    return (
                                      <Badge key={spellIndex} variant="outline" className="p-2">
                                        {spell?.name || spellIndex}
                                        <button
                                          type="button"
                                          onClick={() => setSelectedSpells(prev => prev.filter(s => s !== spellIndex))}
                                          className="ml-2 text-red-400 hover:text-red-300"
                                        >
                                          ×
                                        </button>
                                      </Badge>
                                    );
                                  })}
                                </div>
                              )}
                              <Button
                                type="button"
                                onClick={() => setShowSpellDialog(true)}
                                variant="outline"
                                className="w-full"
                                disabled={selectedSpellsLevel1Plus.length >= spellsToSelect}
                              >
                                {selectedSpellsLevel1Plus.length >= spellsToSelect
                                  ? "Todas as magias selecionadas"
                                  : `Selecionar Magias (${selectedSpellsLevel1Plus.length}/${spellsToSelect})`}
                              </Button>
                              {spellType === "prepared" && (
                                <p className="text-xs text-muted-foreground mt-2">
                                  Você prepara {spellsToSelect} magias por dia (1 + modificador de Sabedoria).
                                </p>
                              )}
                              {spellType === "spellbook" && (
                                <p className="text-xs text-muted-foreground mt-2">
                                  Você tem {spellsToSelect} magias em seu grimório. Você prepara magias diariamente.
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          )}

          {/* História e Notas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card/60 border-white/10">
              <CardHeader>
                <CardTitle className="text-xl font-cinzel">História</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.backstory}
                  onChange={(e) => setFormData({ ...formData, backstory: e.target.value })}
                  rows={8}
                  placeholder="Conte a história do seu personagem..."
                />
              </CardContent>
            </Card>

            <Card className="bg-card/60 border-white/10">
              <CardHeader>
                <CardTitle className="text-xl font-cinzel">Notas</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={8}
                  placeholder="Anotações adicionais..."
                />
              </CardContent>
            </Card>
          </div>

          {/* Dialog de Seleção de Magias */}
          {showSpellDialog && canCastSpells(formData.characterClass) && (
            <SpellSelectionDialog
              open={showSpellDialog}
              onOpenChange={setShowSpellDialog}
              availableSpells={availableSpells}
              selectedSpells={selectedSpells}
              onSpellsChange={setSelectedSpells}
              maxSpells={(() => {
                const wisModifier = formData.attributes?.wisdom
                  ? Math.floor((formData.attributes.wisdom - 10) / 2)
                  : 0;
                const spellsCountValue = getSpellsCount(formData.characterClass, formData.level, wisModifier);
                return typeof spellsCountValue === "number"
                  ? spellsCountValue
                  : (spellsCountValue === "1 + WIS_mod" ? 1 + wisModifier : 0);
              })()}
              maxCantrips={getCantripsCount(formData.characterClass, formData.level)}
              characterClass={formData.characterClass}
              characterLevel={formData.level}
            />
          )}

          {/* Botões */}
          <div className="flex gap-4 justify-end">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? "Salvando..." : "Salvar Personagem"}
            </Button>
          </div>
        </form>


        {/* Dialog de Seleção de Subclasse */}
        {formData.characterClass && (
          <SubclassSelector
            open={showSubclassSelector}
            onOpenChange={setShowSubclassSelector}
            className={formData.characterClass}
            characterLevel={formData.level}
            type={formData.characterClass === 'Bruxo' ? 'patron' : undefined}
            onSelect={(subclass: Subclass) => {
              // Aplicar benefícios automaticamente
              const characterData = {
                ...formData,
                subclass: subclass.name,
              };

              const updatedCharacter = applySubclassBenefits(characterData as any, subclass);

              // Atualizar formData com os benefícios aplicados
              setFormData({
                ...formData,
                subclass: subclass.name,
                skills: updatedCharacter.skills || formData.skills,
                proficiencies: updatedCharacter.proficiencies || formData.proficiencies,
                languages: updatedCharacter.languages || formData.languages,
              });

              toast.success(`Subclasse "${subclass.name}" selecionada! Benefícios aplicados.`);
            }}
          />
        )}

        {/* Dialog de Seleção de Antecedente */}
        <BackgroundSelector
          open={showBackgroundSelector}
          onOpenChange={setShowBackgroundSelector}
          onSelect={(background: Background) => {
            // Aplicar benefícios automaticamente
            const characterData = {
              ...formData,
              background: background.name,
            };

            const updatedCharacter = applyBackgroundBenefits(characterData as any, background);

            // Atualizar formData com os benefícios aplicados
            setFormData({
              ...formData,
              background: background.name,
              skills: updatedCharacter.skills || formData.skills,
              proficiencies: updatedCharacter.proficiencies || formData.proficiencies,
              languages: updatedCharacter.languages || formData.languages,
              inventory: (updatedCharacter as any).inventory || formData.inventory,
            });

            toast.success(`Antecedente "${background.name}" selecionado! Benefícios e equipamentos aplicados.`);
          }}
        />

        {/* Dialog de Seleção de Tipo de Dragão */}
        <DragonTypeSelector
          open={showDragonTypeSelector}
          onOpenChange={setShowDragonTypeSelector}
          onSelect={(dragonType: DragonType) => {
            // Atualizar formData com o tipo de dragão selecionado
            setFormData({
              ...formData,
              dragonType: dragonType.name,
            });

            toast.success(`Dragão Ancestral "${dragonType.name}" selecionado! Você ganhará resistência a ${dragonType.damageType} no nível 6.`);
          }}
        />

        {/* Dialog de Loja */}
        <ShopDialog
          open={showShopDialog}
          onOpenChange={setShowShopDialog}
          currentMoney={formData.currency.gp}
          onPurchase={(items) => {
            const totalCost = items.reduce((sum, item) => sum + (item.cost * item.quantity), 0);
            if (totalCost > formData.currency.gp) {
              toast.error("Você não tem dinheiro suficiente!");
              return;
            }

            // Adicionar itens ao inventário
            const newInventory = [...formData.inventory];
            items.forEach(purchasedItem => {
              const existingItem = newInventory.find(i => i.index === purchasedItem.index);
              if (existingItem) {
                existingItem.quantity += purchasedItem.quantity;
              } else {
                newInventory.push({
                  index: purchasedItem.index,
                  name: purchasedItem.name,
                  quantity: purchasedItem.quantity,
                  cost: purchasedItem.cost,
                });
              }
            });

            // Deduzir dinheiro (sempre em valores inteiros)
            // Converter o total para ouro e depois converter para as moedas corretas
            const totalCostInt = Math.floor(totalCost);
            const remainingGold = Math.max(0, Math.floor(formData.currency.gp || 0) - totalCostInt);

            // Garantir que todas as moedas sejam inteiras
            const newCurrency = {
              pp: Math.floor(formData.currency.pp || 0),
              gp: remainingGold,
              ep: Math.floor(formData.currency.ep || 0),
              sp: Math.floor(formData.currency.sp || 0),
              cp: Math.floor(formData.currency.cp || 0),
            };

            setFormData({
              ...formData,
              inventory: newInventory,
              currency: newCurrency,
            });

            toast.success(`Compra realizada! ${items.length} item(ns) adicionado(s) ao inventário.`);
          }}
        />
      </div>
    </FantasyLayout>
  );
}

export default function NewCharacterPage() {
  return (
    <Suspense fallback={
      <FantasyLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </FantasyLayout>
    }>
      <NewCharacterPageContent />
    </Suspense>
  );
}

