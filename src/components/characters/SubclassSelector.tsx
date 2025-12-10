'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, BookOpen, Shield, Zap } from 'lucide-react';
import { Subclass, getSubclassesByClass, getSubclassBenefitsSummary } from '@/lib/subclasses';

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
    const availableSubclasses = getSubclassesByClass(className, type);

    const handleSelect = () => {
        if (selectedSubclass) {
            onSelect(selectedSubclass);
            onOpenChange(false);
        }
    };

    const getSourceBadgeColor = (source: string) => {
        switch (source) {
            case 'PHB': return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
            case 'SCAG': return 'bg-purple-500/20 text-purple-300 border-purple-500/50';
            case 'XGtE': return 'bg-green-500/20 text-green-300 border-green-500/50';
            case 'TCoE': return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
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
