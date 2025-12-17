'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpen, Briefcase, Languages, Package } from 'lucide-react';
import { Background, BACKGROUNDS } from '@/lib/backgrounds';

interface BackgroundSelectorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentBackground?: string;
    onSelect: (background: Background) => void;
}

export function BackgroundSelector({
    open,
    onOpenChange,
    onSelect,
}: BackgroundSelectorProps) {
    const [selectedBackground, setSelectedBackground] = useState<Background | null>(null);
    const [homebrewBackgrounds, setHomebrewBackgrounds] = useState<Background[]>([]);

    useEffect(() => {
        if (open) {
            fetchHomebrewBackgrounds();
        }
    }, [open]);

    const fetchHomebrewBackgrounds = async () => {
        try {
            const res = await fetch("/api/homebrew?type=background");
            if (res.ok) {
                const data = await res.json();
                const formattedBackgrounds: Background[] = data.map((item: any) => ({
                    name: item.name,
                    description: item.description,
                    skillProficiencies: item.data.skillProficiencies || [],
                    toolProficiencies: item.data.toolProficiencies || [],
                    languages: item.data.languages || 0,
                    equipment: item.data.equipment || [],
                    feature: item.data.feature || { name: "Feature", description: "Descrição da feature" },
                    source: "Homebrew"
                }));
                setHomebrewBackgrounds(formattedBackgrounds);
            }
        } catch (error) {
            console.error("Error fetching homebrew backgrounds:", error);
        }
    };

    const allBackgrounds = [...BACKGROUNDS, ...homebrewBackgrounds];

    const handleSelect = () => {
        if (selectedBackground) {
            onSelect(selectedBackground);
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden flex flex-col">
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle className="flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-primary" />
                        Escolha seu Antecedente
                    </DialogTitle>
                    <DialogDescription>
                        Seu antecedente representa sua vida antes de se tornar um aventureiro
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-hidden min-h-0">
                    {/* Lista de Antecedentes */}
                    <ScrollArea className="h-full pr-2">
                        <div className="space-y-2">
                            {allBackgrounds.map((background) => (
                                <Card
                                    key={background.name}
                                    className={`cursor-pointer transition-all hover:border-primary/50 ${selectedBackground?.name === background.name
                                        ? 'border-primary bg-primary/5'
                                        : 'border-border/50'
                                        }`}
                                    onClick={() => setSelectedBackground(background)}
                                >
                                    <CardHeader className="p-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <CardTitle className="text-sm">{background.name}</CardTitle>
                                            {(background as any).source === "Homebrew" && (
                                                <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/50" variant="outline">
                                                    Homebrew
                                                </Badge>
                                            )}
                                        </div>
                                        <CardDescription className="text-xs">
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {background.skillProficiencies.map((skill) => (
                                                    <Badge key={skill} variant="secondary" className="text-xs">
                                                        {skill}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </CardDescription>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                    </ScrollArea>

                    {/* Detalhes do Antecedente Selecionado */}
                    <ScrollArea className="h-full">
                        {selectedBackground ? (
                            <div className="space-y-3 pr-2">
                                <div>
                                    <h3 className="text-base font-semibold mb-1">{selectedBackground.name}</h3>
                                </div>

                                {/* Benefícios */}
                                <div>
                                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                        <Package className="w-4 h-4" />
                                        Benefícios
                                    </h4>
                                    <Card className="bg-primary/5 border-primary/20">
                                        <CardContent className="p-2 space-y-2">
                                            {/* Perícias */}
                                            <div>
                                                <p className="text-xs font-medium text-muted-foreground mb-1">
                                                    Proficiência em Perícias:
                                                </p>
                                                <div className="flex flex-wrap gap-1">
                                                    {selectedBackground.skillProficiencies.map((skill) => (
                                                        <Badge key={skill} variant="secondary" className="text-xs">
                                                            {skill}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Ferramentas */}
                                            {selectedBackground.toolProficiencies && selectedBackground.toolProficiencies.length > 0 && (
                                                <div>
                                                    <p className="text-xs font-medium text-muted-foreground mb-1">
                                                        Proficiência em Ferramentas:
                                                    </p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {selectedBackground.toolProficiencies.map((tool) => (
                                                            <Badge key={tool} variant="secondary" className="text-xs">
                                                                {tool}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Idiomas */}
                                            {selectedBackground.languages && selectedBackground.languages > 0 && (
                                                <div>
                                                    <p className="text-xs font-medium text-muted-foreground mb-1">
                                                        <Languages className="w-3 h-3 inline mr-1" />
                                                        Idiomas Extras:
                                                    </p>
                                                    <Badge variant="secondary" className="text-xs">
                                                        {selectedBackground.languages} idioma(s) à escolha
                                                    </Badge>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Feature */}
                                <div>
                                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                        <BookOpen className="w-4 h-4" />
                                        Feature: {selectedBackground.feature.name}
                                    </h4>
                                    <Card className="bg-card/50">
                                        <CardContent className="p-2">
                                            <p className="text-xs text-muted-foreground">
                                                {selectedBackground.feature.description}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Equipamento */}
                                <div>
                                    <h4 className="text-sm font-semibold mb-2">Equipamento Inicial</h4>
                                    <Card className="bg-card/50">
                                        <CardContent className="p-2">
                                            <ul className="text-xs text-muted-foreground space-y-0.5">
                                                {selectedBackground.equipment.map((item) => (
                                                    <li key={item} className="flex items-start gap-2">
                                                        <span className="text-primary mt-0.5">•</span>
                                                        <span>{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                <p className="text-sm">Selecione um antecedente para ver os detalhes</p>
                            </div>
                        )}
                    </ScrollArea>
                </div>

                {/* Botões de Ação */}
                <div className="flex justify-end gap-2 mt-4 flex-shrink-0">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSelect} disabled={!selectedBackground}>
                        Confirmar Seleção
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
