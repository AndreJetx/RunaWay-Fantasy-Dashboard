'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, BookOpen, Shield, Zap } from 'lucide-react';
import { Subclass, getSubclassesByClass, getSubclassBenefitsSummary } from '@/lib/subclasses';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

// Perícias disponíveis
const SKILLS = [
    { key: "acrobatics", label: "Acrobacia" },
    { key: "animalHandling", label: "Adestrar Animais" },
    { key: "arcana", label: "Arcanismo" },
    { key: "athletics", label: "Atletismo" },
    { key: "deception", label: "Enganação" },
    { key: "history", label: "História" },
    { key: "insight", label: "Intuição" },
    { key: "intimidation", label: "Intimidação" },
    { key: "investigation", label: "Investigação" },
    { key: "medicine", label: "Medicina" },
    { key: "nature", label: "Natureza" },
    { key: "perception", label: "Percepção" },
    { key: "performance", label: "Atuação" },
    { key: "persuasion", label: "Persuasão" },
    { key: "religion", label: "Religião" },
    { key: "sleightOfHand", label: "Prestidigitação" },
    { key: "stealth", label: "Furtividade" },
    { key: "survival", label: "Sobrevivência" },
];

// Estilos de Luta disponíveis
const FIGHTING_STYLES = [
    {
        key: "archery",
        label: "Arquearia",
        description: "+2 de bônus nas jogadas de ataque com armas de ataque à distância"
    },
    {
        key: "defense",
        label: "Defesa",
        description: "+1 de bônus na CA enquanto estiver usando armadura"
    },
    {
        key: "dueling",
        label: "Duelo",
        description: "+2 de bônus no dano quando empunhar uma arma corpo a corpo em uma mão"
    },
    {
        key: "great-weapon",
        label: "Arma Grande",
        description: "Pode rolar novamente 1 ou 2 no dado de dano de armas corpo a corpo de duas mãos"
    },
    {
        key: "protection",
        label: "Proteção",
        description: "Impor desvantagem em ataques contra aliados próximos (requer escudo)"
    },
    {
        key: "two-weapon",
        label: "Duas Armas",
        description: "Adiciona modificador de habilidade ao dano do ataque com a segunda arma"
    },
];

interface SubclassSelectorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    className: string;
    characterLevel: number;
    currentSubclass?: string;
    type?: 'patron' | 'pact';
    onSelect: (subclass: Subclass) => void;
}

export function SubclassSelector({
    open,
    onOpenChange,
    className,
    characterLevel,
    type,
    onSelect,
}: SubclassSelectorProps) {
    const [selectedSubclass, setSelectedSubclass] = useState<Subclass | null>(null);
    const [homebrewSubclasses, setHomebrewSubclasses] = useState<Subclass[]>([]);
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [selectedFightingStyle, setSelectedFightingStyle] = useState<string>('');
    const availableSubclasses = [...getSubclassesByClass(className, type), ...homebrewSubclasses];

    useEffect(() => {
        if (open) {
            fetchHomebrewSubclasses();
        }
    }, [open, className]);

    const fetchHomebrewSubclasses = async () => {
        try {
            const res = await fetch("/api/homebrew?type=subclass");
            if (res.ok) {
                const data = await res.json();
                const formattedSubclasses: Subclass[] = data
                    .filter((item: any) => item.data.baseClass === className)
                    .map((item: any) => ({
                        name: item.name,
                        description: item.description,
                        source: "Homebrew",
                        features: item.data.features || [],
                        benefits: item.data.benefits || []
                    }));
                setHomebrewSubclasses(formattedSubclasses);
            }
        } catch (error) {
            console.error("Error fetching homebrew subclasses:", error);
        }
    };

    const toggleSkill = (skillKey: string, maxSkills: number) => {
        setSelectedSkills(prev => {
            if (prev.includes(skillKey)) {
                return prev.filter(s => s !== skillKey);
            } else if (prev.length < maxSkills) {
                return [...prev, skillKey];
            }
            return prev;
        });
    };

    const handleSelect = () => {
        if (selectedSubclass) {
            // Validar escolhas necessárias
            const skillBenefit = selectedSubclass.benefits?.find(b =>
                b.type === 'skill' && typeof b.value === 'string' && b.value.includes('choose')
            );

            if (skillBenefit && typeof skillBenefit.value === 'string') {
                const requiredCount = parseInt(skillBenefit.value.match(/\d+/)?.[0] || '0');
                if (selectedSkills.length < requiredCount) {
                    return; // Não permite confirmar sem todas as perícias
                }
            }

            const needsFightingStyle = selectedSubclass.features.some(f =>
                f.name === 'Estilo de Luta' && f.level === 3
            );

            if (needsFightingStyle && !selectedFightingStyle) {
                return; // Não permite confirmar sem estilo de luta
            }

            // Passar as escolhas junto com a subclasse
            const subclassWithChoices = {
                ...selectedSubclass,
                choices: {
                    skills: selectedSkills,
                    fightingStyle: selectedFightingStyle
                }
            };

            onSelect(subclassWithChoices as Subclass);
            onOpenChange(false);

            // Reset
            setSelectedSkills([]);
            setSelectedFightingStyle('');
        }
    };

    const getSourceBadgeColor = (source: string) => {
        switch (source) {
            case 'PHB': return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
            case 'SCAG': return 'bg-purple-500/20 text-purple-300 border-purple-500/50';
            case 'XGtE': return 'bg-green-500/20 text-green-300 border-green-500/50';
            case 'TCoE': return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
            case 'Homebrew': return 'bg-pink-500/20 text-pink-300 border-pink-500/50';
            default: return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
        }
    };

    const getTitle = () => {
        if (className === 'Bruxo') {
            return type === 'patron' ? 'Escolha seu Patrono' : 'Escolha seu Pacto';
        }
        return `Escolha sua Subclasse`;
    };

    const getDescription = () => {
        if (className === 'Bruxo') {
            return type === 'patron'
                ? 'Seu patrono é a fonte do seu poder arcano'
                : 'Seu pacto define como você manifesta o poder do seu patrono';
        }
        return 'Esta escolha definirá suas habilidades especiais';
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden flex flex-col">
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        {getTitle()}
                    </DialogTitle>
                    <DialogDescription>{getDescription()}</DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-hidden min-h-0">
                    {/* Lista de Subclasses */}
                    <ScrollArea className="h-full pr-2">
                        <div className="space-y-2">
                            {availableSubclasses.map((subclass) => (
                                <Card
                                    key={subclass.name}
                                    className={`cursor-pointer transition-all hover:border-primary/50 ${selectedSubclass?.name === subclass.name
                                        ? 'border-primary bg-primary/5'
                                        : 'border-border/50'
                                        }`}
                                    onClick={() => setSelectedSubclass(subclass)}
                                >
                                    <CardHeader className="p-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className="text-sm font-semibold">{subclass.name}</h3>
                                            <Badge className={getSourceBadgeColor(subclass.source)} variant="outline">
                                                {subclass.source}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                            {subclass.description}
                                        </p>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                    </ScrollArea>

                    {/* Detalhes da Subclasse Selecionada */}
                    <ScrollArea className="h-full">
                        {selectedSubclass ? (
                            <div className="space-y-3 pr-2">
                                <div>
                                    <h3 className="text-base font-semibold mb-1">{selectedSubclass.name}</h3>
                                    <p className="text-xs text-muted-foreground">{selectedSubclass.description}</p>
                                </div>

                                {/* Features */}
                                <div>
                                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                        <BookOpen className="w-4 h-4" />
                                        Features
                                    </h4>
                                    <div className="space-y-2">
                                        {selectedSubclass.features.map((feature) => (
                                            <Card key={`${feature.level}-${feature.name}`} className="bg-card/50">
                                                <CardContent className="p-2">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex-1">
                                                            <p className="font-medium text-xs">{feature.name}</p>
                                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                                {feature.description}
                                                            </p>
                                                        </div>
                                                        <Badge variant="outline" className="text-xs flex-shrink-0">
                                                            Nv. {feature.level}
                                                        </Badge>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>

                                {/* Benefícios */}
                                {(() => {
                                    const summary = getSubclassBenefitsSummary(selectedSubclass, characterLevel);
                                    const hasBenefits =
                                        summary.skills.length > 0 ||
                                        summary.proficiencies.length > 0 ||
                                        summary.spells.length > 0 ||
                                        summary.resistances.length > 0;

                                    return hasBenefits ? (
                                        <div>
                                            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                                <Zap className="w-4 h-4" />
                                                Benefícios Imediatos
                                            </h4>
                                            <Card className="bg-primary/5 border-primary/20">
                                                <CardContent className="p-2 space-y-2">
                                                    {summary.skills.length > 0 && (
                                                        <div>
                                                            <p className="text-xs font-medium text-muted-foreground">Perícias:</p>
                                                            <div className="flex flex-wrap gap-1 mt-1">
                                                                {summary.skills.map((skill) => (
                                                                    <Badge key={skill} variant="secondary" className="text-xs">
                                                                        {skill}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {summary.proficiencies.length > 0 && (
                                                        <div>
                                                            <p className="text-xs font-medium text-muted-foreground">Proficiências:</p>
                                                            <div className="flex flex-wrap gap-1 mt-1">
                                                                {summary.proficiencies.map((prof) => (
                                                                    <Badge key={prof} variant="secondary" className="text-xs">
                                                                        <Shield className="w-3 h-3 mr-1" />
                                                                        {prof}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {summary.spells.length > 0 && (
                                                        <div>
                                                            <p className="text-xs font-medium text-muted-foreground">Magias:</p>
                                                            <div className="flex flex-wrap gap-1 mt-1">
                                                                {summary.spells.map((spell) => (
                                                                    <Badge key={spell} variant="secondary" className="text-xs">
                                                                        {spell}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {summary.resistances.length > 0 && (
                                                        <div>
                                                            <p className="text-xs font-medium text-muted-foreground">Resistências:</p>
                                                            <div className="flex flex-wrap gap-1 mt-1">
                                                                {summary.resistances.map((res) => (
                                                                    <Badge key={res} variant="secondary" className="text-xs">
                                                                        {res}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </div>
                                    ) : null;
                                })()}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                <p className="text-sm">Selecione uma subclasse para ver os detalhes</p>
                            </div>
                        )}
                    </ScrollArea>
                </div>

                {/* Escolhas Necessárias */}
                {selectedSubclass && (() => {
                    const skillBenefit = selectedSubclass.benefits?.find(b =>
                        b.type === 'skill' && typeof b.value === 'string' && b.value.includes('choose')
                    );
                    const needsFightingStyle = selectedSubclass.features.some(f =>
                        f.name === 'Estilo de Luta' && f.level === 3
                    );
                    const requiredSkills = skillBenefit && typeof skillBenefit.value === 'string'
                        ? parseInt(skillBenefit.value.match(/\d+/)?.[0] || '0')
                        : 0;

                    return (skillBenefit || needsFightingStyle) ? (
                        <div className="border-t pt-4 space-y-4 mt-4">
                            <h3 className="text-sm font-semibold text-amber-400 flex items-center gap-2">
                                <Sparkles className="w-4 h-4" />
                                Escolhas Necessárias
                            </h3>

                            {/* Seletor de Perícias */}
                            {skillBenefit && (
                                <Card className="bg-card/50 border-primary/20">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm flex items-center justify-between">
                                            <span>Escolha {requiredSkills} Perícia{requiredSkills > 1 ? 's' : ''}</span>
                                            <Badge variant="outline" className={selectedSkills.length === requiredSkills ? "bg-green-500/20 text-green-300" : "bg-amber-500/20 text-amber-300"}>
                                                {selectedSkills.length}/{requiredSkills}
                                            </Badge>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 gap-2">
                                            {SKILLS.map(skill => (
                                                <div key={skill.key} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`skill-${skill.key}`}
                                                        checked={selectedSkills.includes(skill.key)}
                                                        onCheckedChange={() => toggleSkill(skill.key, requiredSkills)}
                                                        disabled={!selectedSkills.includes(skill.key) && selectedSkills.length >= requiredSkills}
                                                    />
                                                    <Label
                                                        htmlFor={`skill-${skill.key}`}
                                                        className="text-xs cursor-pointer"
                                                    >
                                                        {skill.label}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Seletor de Estilo de Luta */}
                            {needsFightingStyle && (
                                <Card className="bg-card/50 border-primary/20">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm flex items-center justify-between">
                                            <span>Escolha um Estilo de Luta</span>
                                            {selectedFightingStyle && (
                                                <Badge variant="outline" className="bg-green-500/20 text-green-300">
                                                    Selecionado
                                                </Badge>
                                            )}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <RadioGroup value={selectedFightingStyle} onValueChange={setSelectedFightingStyle}>
                                            <div className="space-y-3">
                                                {FIGHTING_STYLES.map(style => (
                                                    <div key={style.key} className="flex items-start space-x-2">
                                                        <RadioGroupItem value={style.key} id={`style-${style.key}`} className="mt-1" />
                                                        <Label htmlFor={`style-${style.key}`} className="cursor-pointer flex-1">
                                                            <span className="font-medium text-sm block">{style.label}</span>
                                                            <span className="text-xs text-muted-foreground block mt-0.5">{style.description}</span>
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                        </RadioGroup>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    ) : null;
                })()}

                {/* Botões de Ação */}
                <div className="flex justify-end gap-2 mt-4 flex-shrink-0">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSelect} disabled={!selectedSubclass}>
                        Confirmar Seleção
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
