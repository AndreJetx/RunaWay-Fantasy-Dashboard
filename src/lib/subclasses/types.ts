// Tipos e interfaces compartilhadas para subclasses

export interface SubclassFeature {
    level: number;
    name: string;
    description: string;
}

export interface SubclassBenefit {
    type: 'skill' | 'spell' | 'feature' | 'proficiency' | 'language' | 'resistance';
    value: string | string[];
    level: number;
    description?: string;
}

export interface Subclass {
    name: string;
    className: string;
    level: number; // Nível em que é obtida
    type?: 'patron' | 'pact'; // Apenas para Bruxo
    description: string;
    source: 'PHB' | 'SCAG' | 'XGtE' | 'TCoE';
    features: SubclassFeature[];
    benefits: SubclassBenefit[];
}
