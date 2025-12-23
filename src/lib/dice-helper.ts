import { toast } from "sonner";

export interface RollResult {
    total: number;
    rolls: number[];
    modifier: number;
    formula: string;
}

/**
 * Rola um dado ou fórmula (ex: "1d20+5", "2d6+3", "d20")
 */
export function rollDice(formula: string): RollResult {
    const cleanFormula = formula.toLowerCase().replace(/\s+/g, "");
    // Regex mais flexível: permite capturar a parte inicial (dados e modificadores) 
    // e ignorar o restante (como tipo de dano: "1d8+4 slashing")
    const match = cleanFormula.match(/^(\d*)d(\d+)([+-]\d+)?/);

    if (!match) {
        // Tenta apenas um número fixo no início
        const fixedMatch = cleanFormula.match(/^([+-]?\d+)/);
        const fixed = fixedMatch ? parseInt(fixedMatch[1]) : NaN;
        if (!isNaN(fixed)) return { total: fixed, rolls: [], modifier: fixed, formula };
        return { total: 0, rolls: [], modifier: 0, formula };
    }

    const numDice = parseInt(match[1] || "1");
    const sides = parseInt(match[2]);
    const modifier = parseInt(match[3] || "0");

    const rolls: number[] = [];
    let total = 0;

    for (let i = 0; i < numDice; i++) {
        const roll = Math.floor(Math.random() * sides) + 1;
        rolls.push(roll);
        total += roll;
    }

    total += modifier;

    return { total, rolls, modifier, formula };
}

/**
 * Realiza uma rolagem de ataque (d20 + bônus) e exibe no toast
 */
export function rollAttack(name: string, bonus: number) {
    const result = rollDice(`1d20${bonus >= 0 ? "+" : ""}${bonus}`);
    const d20Roll = result.rolls[0];

    let message = `${name}: ${result.total} (${d20Roll}${bonus >= 0 ? "+" : ""}${bonus})`;

    if (d20Roll === 20) {
        toast.success(`CRÍTICO! ${message}`, {
            description: "Um sucesso automático e dano extra garantido!",
            duration: 5000,
        });
    } else if (d20Roll === 1) {
        toast.error(`FALHA CRÍTICA! ${message}`, {
            description: "Um erro desastroso...",
            duration: 5000,
        });
    } else {
        toast.info(`Rolagem de Ataque`, {
            description: message,
            duration: 4000,
        });
    }

    return result;
}

/**
 * Realiza uma rolagem de dano e exibe no toast
 */
export function rollDamage(name: string, formula: string, type?: string) {
    const result = rollDice(formula);

    toast(`Rolagem de Dano: ${name}`, {
        description: `${result.total} ${type ? type : ""} (${result.rolls.join(" + ")}${result.modifier !== 0 ? (result.modifier > 0 ? " + " : " - ") + Math.abs(result.modifier) : ""})`,
        duration: 4000,
    });

    return result;
}
