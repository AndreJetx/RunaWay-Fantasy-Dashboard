/**
 * Features automáticas que são aplicadas ao atingir determinado nível
 * Estas features modificam atributos, proficiências, etc automaticamente
 */

export interface AutoFeature {
    className: string;
    level: number;
    name: string;
    apply: (attributes: Record<string, number>) => Record<string, number>;
}

export const AUTO_FEATURES: AutoFeature[] = [
    {
        className: "Bárbaro",
        level: 20,
        name: "Campeão Primitivo",
        apply: (attributes) => {
            const updated = { ...attributes };
            // +4 em Força (máximo 24)
            const currentStr = updated.strength || 10;
            updated.strength = Math.min(24, currentStr + 4);

            // +4 em Constituição (máximo 24)
            const currentCon = updated.constitution || 10;
            updated.constitution = Math.min(24, currentCon + 4);

            return updated;
        }
    },
    // Adicione mais features automáticas aqui conforme necessário
    // Exemplo: Monge nível 20 poderia ter algo similar
];

/**
 * Aplica features automáticas para uma classe em um nível específico
 */
export function applyAutoFeatures(
    className: string,
    level: number,
    currentAttributes: Record<string, number>
): Record<string, number> {
    let attributes = { ...currentAttributes };

    const applicableFeatures = AUTO_FEATURES.filter(
        f => f.className === className && f.level === level
    );

    for (const feature of applicableFeatures) {
        console.log(`[Auto Feature] Aplicando ${feature.name} para ${className} nível ${level}`);
        attributes = feature.apply(attributes);
    }

    return attributes;
}
