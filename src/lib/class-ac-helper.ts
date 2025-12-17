/**
 * Helper para determinar o tipo de Unarmored Defense baseado na classe do personagem
 */

/**
 * Determina o tipo de Unarmored Defense baseado na classe
 * @param characterClass Nome da classe do personagem
 * @returns Tipo de Unarmored Defense ou undefined se não tiver
 */
export function getUnarmoredDefenseType(
  characterClass: string | null | undefined
): { type: "CON" | "WIS" } | undefined {
  if (!characterClass) {
    console.log("getUnarmoredDefenseType: characterClass is null/undefined");
    return undefined;
  }

  const classLower = characterClass.toLowerCase().trim();
  console.log("getUnarmoredDefenseType: checking class:", classLower);

  // Bárbaro: 10 + DEX + CON
  if (classLower === "bárbaro" || classLower === "barbaro" || classLower === "barbarian") {
    console.log("getUnarmoredDefenseType: detected Bárbaro, returning CON");
    return { type: "CON" };
  }

  // Monge: 10 + DEX + WIS
  if (classLower === "monge" || classLower === "monk") {
    console.log("getUnarmoredDefenseType: detected Monge, returning WIS");
    return { type: "WIS" };
  }

  console.log("getUnarmoredDefenseType: no Unarmored Defense for class:", classLower);
  return undefined;
}

