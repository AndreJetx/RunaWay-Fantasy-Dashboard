/**
 * Helper para converter dados JSON de monstros/criaturas para o formato do schema
 */

export interface MonsterJsonData {
  name: string;
  cr: number | string;
  type: string;
  size?: string;
  alignment?: string;
  ac: number;
  hp: string; // Ex: "13 (2d8+4)"
  speed?: string;
  abilities?: {
    str?: number;
    dex?: number;
    con?: number;
    int?: number;
    wis?: number;
    cha?: number;
  };
  saving_throws?: string[];
  skills?: string[];
  damage_vulnerabilities?: string[];
  damage_resistances?: string[];
  damage_immunities?: string[];
  condition_immunities?: string[];
  senses?: string;
  languages?: string;
  actions?: Array<{
    name: string;
    bonus?: number;
    damage?: string;
    type?: string;
    description?: string;
  }>;
  special_traits?: Array<{
    name: string;
    description: string;
  }>;
}

/**
 * Extrai HP numérico de uma string como "13 (2d8+4)"
 */
function extractHp(hpString: string): number {
  const match = hpString.match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : 10;
}

/**
 * Extrai dados de velocidade de uma string como "30 ft."
 */
function extractSpeed(speedString?: string): number {
  if (!speedString) return 30;
  const match = speedString.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 30;
}

/**
 * Converte dados JSON de monstro para o formato do schema de NPC
 */
export function convertMonsterToNpc(
  monsterData: MonsterJsonData,
  campaignId: string,
  chapterId?: string | null
) {
  const hp = extractHp(monsterData.hp);
  const speed = extractSpeed(monsterData.speed);

  // Converter habilidades para o formato do schema
  const abilities = monsterData.abilities
    ? {
        strength: monsterData.abilities.str || 10,
        dexterity: monsterData.abilities.dex || 10,
        constitution: monsterData.abilities.con || 10,
        intelligence: monsterData.abilities.int || 10,
        wisdom: monsterData.abilities.wis || 10,
        charisma: monsterData.abilities.cha || 10,
      }
    : {};

  // Converter ações para o formato do schema
  const attacks = (monsterData.actions || []).map((action) => ({
    name: action.name,
    bonus: action.bonus || 0,
    damage: action.damage || "",
    type: action.type || "melee",
    description: action.description || "",
  }));

  // Converter special traits para abilities
  const abilitiesList = (monsterData.special_traits || []).map((trait) => ({
    name: trait.name,
    description: trait.description,
  }));

  // Converter saving throws de array para objeto
  const savingThrowsObj = (monsterData.saving_throws || []).reduce(
    (acc: Record<string, boolean>, st: string) => {
      acc[st.toLowerCase().replace(/\s+/g, "")] = true;
      return acc;
    },
    {}
  );

  // Converter skills de array para objeto
  const skillsObj = (monsterData.skills || []).reduce(
    (acc: Record<string, number>, skill: string) => {
      const match = skill.match(/(.+?)\s*\+?\s*(\d+)/);
      if (match) {
        acc[match[1].trim()] = parseInt(match[2], 10);
      } else {
        acc[skill] = 0;
      }
      return acc;
    },
    {}
  );

  return {
    campaignId,
    name: monsterData.name,
    challengeRating: monsterData.cr?.toString() || null,
    type: monsterData.type || null,
    alignment: monsterData.alignment || null,
    armorClass: monsterData.ac || 10,
    maxHp: hp,
    currentHp: hp,
    speed,
    hitDice: monsterData.hp.includes("(") 
      ? monsterData.hp.match(/\(([^)]+)\)/)?.[1] || null 
      : null,
    attributes: abilities,
    savingThrows: savingThrowsObj,
    skills: skillsObj,
    attacks,
    abilities: abilitiesList,
    resistances: monsterData.damage_resistances || [],
    immunities: [
      ...(monsterData.damage_immunities || []),
      ...(monsterData.condition_immunities || []),
    ],
    vulnerabilities: monsterData.damage_vulnerabilities || [],
    description: monsterData.senses || null,
    isHostile: true, // Por padrão, monstros são hostis
    chapterId: chapterId || null,
  };
}

/**
 * Lista pré-definida de monstros disponíveis
 */
export const MONSTER_TEMPLATES: MonsterJsonData[] = [
  {
    name: "Skeleton",
    cr: 0,
    type: "undead",
    alignment: "lawful evil",
    ac: 13,
    hp: "13 (2d8+4)",
    speed: "30 ft.",
    abilities: { str: 10, dex: 14, con: 15, int: 6, wis: 8, cha: 5 },
    saving_throws: [],
    skills: ["Perception +2"],
    damage_vulnerabilities: ["bludgeoning"],
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
    alignment: "neutral evil",
    ac: 8,
    hp: "22 (3d8+9)",
    speed: "20 ft.",
    abilities: { str: 13, dex: 6, con: 16, int: 3, wis: 6, cha: 5 },
    saving_throws: [],
    skills: [],
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
    name: "Goblin",
    cr: 0.25,
    type: "humanoid",
    alignment: "neutral evil",
    ac: 15,
    hp: "7 (2d6)",
    speed: "30 ft.",
    abilities: { str: 8, dex: 14, con: 10, int: 10, wis: 8, cha: 8 },
    saving_throws: [],
    skills: ["Stealth +6"],
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
    name: "Orc",
    cr: 0.5,
    type: "humanoid",
    alignment: "chaotic evil",
    ac: 13,
    hp: "15 (2d8+6)",
    speed: "30 ft.",
    abilities: { str: 16, dex: 12, con: 16, int: 7, wis: 11, cha: 10 },
    saving_throws: [],
    skills: ["Intimidation +2"],
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
    name: "Ogre",
    cr: 2,
    type: "giant",
    alignment: "chaotic evil",
    ac: 11,
    hp: "59 (7d10+21)",
    speed: "40 ft.",
    abilities: { str: 19, dex: 8, con: 16, int: 5, wis: 7, cha: 7 },
    saving_throws: [],
    skills: [],
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
];

