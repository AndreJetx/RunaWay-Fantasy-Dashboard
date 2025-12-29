// Shared bestiary data for D&D 5e enemies
export interface BestiaryEnemy {
    name: string;
    cr: number;
    type: string;
    size: string;
    alignment: string;
    ac: number;
    hp: string;
    speed: string;
    abilities: {
        str: number;
        dex: number;
        con: number;
        int: number;
        wis: number;
        cha: number;
    };
    saving_throws: string[];
    skills: string[];
    damage_vulnerabilities: string[];
    damage_resistances: string[];
    damage_immunities: string[];
    condition_immunities: string[];
    senses: string;
    languages: string;
    actions: Array<{
        name: string;
        bonus: number;
        damage: string;
        type: string;
        description: string;
    }>;
    special_traits: Array<{
        name: string;
        description: string;
    }>;
}

export const ENEMY_DATA: BestiaryEnemy[] = [
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
