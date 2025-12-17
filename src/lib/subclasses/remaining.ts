import { Subclass } from './types';

// Mago - Tradições Arcanas (Nível 2)
export const wizardSubclasses: Subclass[] = [
    { name: "Escola de Abjuração", className: "Mago", level: 2, source: "PHB", description: "Especialista em magias protetoras", features: [{ level: 2, name: "Proteção Arcana", description: "Você cria uma proteção mágica" }], benefits: [] },
    { name: "Escola de Adivinhação", className: "Mago", level: 2, source: "PHB", description: "Mestre em prever o futuro", features: [{ level: 2, name: "Portento", description: "Você pode substituir rolagens" }], benefits: [] },
    { name: "Escola de Conjuração", className: "Mago", level: 2, source: "PHB", description: "Especialista em invocar criaturas", features: [{ level: 2, name: "Conjuração Menor", description: "Você pode criar objetos" }], benefits: [] },
    { name: "Escola de Encantamento", className: "Mago", level: 2, source: "PHB", description: "Mestre em encantar mentes", features: [{ level: 2, name: "Encantamento Hipnótico", description: "Você pode encantar criaturas" }], benefits: [] },
    { name: "Escola de Evocação", className: "Mago", level: 2, source: "PHB", description: "Especialista em magias de dano", features: [{ level: 2, name: "Esculpir Magias", description: "Você pode proteger aliados de suas magias" }], benefits: [] },
    { name: "Escola de Ilusão", className: "Mago", level: 2, source: "PHB", description: "Mestre em criar ilusões", features: [{ level: 2, name: "Ilusão Aprimorada", description: "Suas ilusões são mais reais" }], benefits: [] },
    { name: "Escola de Necromancia", className: "Mago", level: 2, source: "PHB", description: "Especialista em magia da morte", features: [{ level: 2, name: "Colheita Sombria", description: "Você ganha vida ao matar" }], benefits: [] },
    { name: "Escola de Transmutação", className: "Mago", level: 2, source: "PHB", description: "Mestre em transformar matéria", features: [{ level: 2, name: "Alquimia Menor", description: "Você pode transformar materiais" }], benefits: [] },
    { name: "Magia de Guerra", className: "Mago", level: 2, source: "XGtE", description: "Combina magia com combate", features: [{ level: 2, name: "Deflexão Arcana", description: "Você pode aumentar sua CA" }], benefits: [] },
    { name: "Ordem dos Escribas", className: "Mago", level: 2, source: "TCoE", description: "Mestre em grimórios mágicos", features: [{ level: 2, name: "Grimório Desperto", description: "Seu grimório ganha consciência" }], benefits: [] },
    { name: "Magia da Bexiga", className: "Mago", level: 2, source: "TCoE", description: "Manipula a realidade", features: [{ level: 2, name: "Realidade Alterada", description: "Você pode alterar magias" }], benefits: [] },
];

// Monge - Tradições Monásticas (Nível 3)
export const monkSubclasses: Subclass[] = [
    { name: "Caminho da Mão Aberta", className: "Monge", level: 3, source: "PHB", description: "Mestre em técnicas de combate desarmado", features: [{ level: 3, name: "Técnica da Mão Aberta", description: "Seus golpes podem derrubar inimigos" }], benefits: [] },
    { name: "Caminho das Sombras", className: "Monge", level: 3, source: "PHB", description: "Ninja furtivo", features: [{ level: 3, name: "Artes das Sombras", description: "Você aprende magias de sombra" }], benefits: [{ type: 'spell', value: ['darkness', 'pass-without-trace'], level: 3, description: 'Magias de sombra' }] },
    { name: "Caminho dos Quatro Elementos", className: "Monge", level: 3, source: "PHB", description: "Controla os elementos", features: [{ level: 3, name: "Discípulo dos Elementos", description: "Você aprende disciplinas elementais" }], benefits: [] },
    { name: "Caminho do Sol", className: "Monge", level: 3, source: "XGtE", description: "Canaliza energia radiante", features: [{ level: 3, name: "Explosão Radiante", description: "Você pode causar dano radiante" }], benefits: [] },
    { name: "Caminho da Misericórdia", className: "Monge", level: 3, source: "TCoE", description: "Cura e mata com igual maestria", features: [{ level: 3, name: "Mãos da Cura", description: "Você pode curar com ki" }], benefits: [] },
    { name: "Caminho da Alma Astral", className: "Monge", level: 3, source: "TCoE", description: "Manifesta braços astrais", features: [{ level: 3, name: "Braços do Espírito Astral", description: "Você invoca braços espectrais" }], benefits: [] },
];

// Paladino - Juramentos Sagrados (Nível 3)
export const paladinSubclasses: Subclass[] = [
    { name: "Juramento de Devoção", className: "Paladino", level: 3, source: "PHB", description: "Campeão da honra e justiça", features: [{ level: 3, name: "Arma Sagrada", description: "Sua arma brilha com luz divina" }], benefits: [{ type: 'spell', value: ['protection-from-evil-and-good', 'sanctuary'], level: 3, description: 'Magias de juramento' }] },
    { name: "Juramento dos Anciões", className: "Paladino", level: 3, source: "PHB", description: "Protetor da natureza", features: [{ level: 3, name: "Ira da Natureza", description: "Você pode prender inimigos com vinhas" }], benefits: [{ type: 'spell', value: ['ensnaring-strike', 'speak-with-animals'], level: 3, description: 'Magias de juramento' }] },
    { name: "Juramento de Vingança", className: "Paladino", level: 3, source: "PHB", description: "Caçador implacável do mal", features: [{ level: 3, name: "Inimigo Abjurado", description: "Você marca um inimigo para destruição" }], benefits: [{ type: 'spell', value: ['bane', 'hunters-mark'], level: 3, description: 'Magias de juramento' }] },
    { name: "Juramento da Conquista", className: "Paladino", level: 3, source: "XGtE", description: "Domina através do medo", features: [{ level: 3, name: "Presença Conquistadora", description: "Você aterroriza inimigos" }], benefits: [{ type: 'spell', value: ['armor-of-agathys', 'command'], level: 3, description: 'Magias de juramento' }] },
    { name: "Juramento da Redenção", className: "Paladino", level: 3, source: "XGtE", description: "Busca redimir os caídos", features: [{ level: 3, name: "Emissário da Paz", description: "Você ganha bônus em Persuasion" }], benefits: [{ type: 'spell', value: ['sanctuary', 'sleep'], level: 3, description: 'Magias de juramento' }] },
    { name: "Juramento da Glória", className: "Paladino", level: 3, source: "TCoE", description: "Busca a glória lendária", features: [{ level: 3, name: "Presença Inspiradora", description: "Você inspira aliados" }], benefits: [{ type: 'spell', value: ['guiding-bolt', 'heroism'], level: 3, description: 'Magias de juramento' }] },
    { name: "Juramento dos Vigilantes", className: "Paladino", level: 3, source: "TCoE", description: "Guarda contra ameaças planares", features: [{ level: 3, name: "Vontade Vigilante", description: "Você e aliados ganham bônus em iniciativa" }], benefits: [{ type: 'spell', value: ['alarm', 'detect-magic'], level: 3, description: 'Magias de juramento' }] },
];

// Patrulheiro - Arquétipos (Nível 3)
export const rangerSubclasses: Subclass[] = [
    { name: "Caçador", className: "Patrulheiro", level: 3, source: "PHB", description: "Mestre em caçar presas específicas", features: [{ level: 3, name: "Presa do Caçador", description: "Você ganha habilidades de caça" }], benefits: [] },
    { name: "Mestre das Feras", className: "Patrulheiro", level: 3, source: "PHB", description: "Companheiro animal poderoso", features: [{ level: 3, name: "Companheiro do Patrulheiro", description: "Você ganha um companheiro animal" }], benefits: [] },
    { name: "Andarilho do Horizonte", className: "Patrulheiro", level: 3, source: "XGtE", description: "Viajante planar", features: [{ level: 3, name: "Detectar Portal", description: "Você pode sentir portais" }], benefits: [] },
    { name: "Caçador de Monstros", className: "Patrulheiro", level: 3, source: "XGtE", description: "Especialista em caçar monstros", features: [{ level: 3, name: "Sentidos do Caçador", description: "Você pode detectar criaturas" }], benefits: [] },
    { name: "Guardião Fey", className: "Patrulheiro", level: 3, source: "TCoE", description: "Protetor feérico", features: [{ level: 3, name: "Presença Fey", description: "Você pode encantar ou aterrorizar" }], benefits: [{ type: 'spell', value: ['charm-person', 'misty-step'], level: 3, description: 'Magias feéricas' }] },
    { name: "Andarilho das Sombras", className: "Patrulheiro", level: 3, source: "TCoE", description: "Mestre das sombras", features: [{ level: 3, name: "Forma Umbral", description: "Você pode se transformar em sombra" }], benefits: [{ type: 'spell', value: ['disguise-self', 'rope-trick'], level: 3, description: 'Magias de sombra' }] },
];
