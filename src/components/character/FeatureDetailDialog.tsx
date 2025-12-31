"use client";

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Award, Star } from "lucide-react";

interface FeatureDetailDialogProps {
    isOpen: boolean;
    onClose: () => void;
    feature: {
        name: string;
        description: string;
        level: number;
        type?: 'feature' | 'ability_score_improvement' | 'spellcasting' | 'subclass';
    } | null;
    featureType: 'class' | 'subclass';
    className?: string;
    subclassName?: string;
}

export function FeatureDetailDialog({
    isOpen,
    onClose,
    feature,
    featureType,
    className,
    subclassName,
}: FeatureDetailDialogProps) {
    if (!feature) return null;

    const getFeatureIcon = () => {
        if (featureType === 'subclass') {
            return <Star className="w-6 h-6 text-primary" />;
        }
        if (feature.type === 'spellcasting') {
            return <Sparkles className="w-6 h-6 text-purple-400" />;
        }
        return <Award className="w-6 h-6 text-amber-400" />;
    };

    const getFeatureTypeLabel = () => {
        if (featureType === 'subclass') {
            return 'Habilidade de Subclasse';
        }
        switch (feature.type) {
            case 'spellcasting':
                return 'Conjuração';
            case 'ability_score_improvement':
                return 'Aumento de Atributo';
            case 'subclass':
                return 'Escolha de Subclasse';
            default:
                return 'Habilidade de Classe';
        }
    };

    const getFeatureTypeBadgeColor = () => {
        if (featureType === 'subclass') {
            return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
        }
        switch (feature.type) {
            case 'spellcasting':
                return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
            case 'ability_score_improvement':
                return 'bg-green-500/20 text-green-300 border-green-500/30';
            case 'subclass':
                return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
            default:
                return 'bg-primary/20 text-primary border-primary/30';
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh] bg-gradient-to-br from-background via-background to-primary/5 border-primary/20">
                <DialogHeader>
                    <div className="flex items-start gap-3">
                        <div className="mt-1">{getFeatureIcon()}</div>
                        <div className="flex-1 space-y-2">
                            <DialogTitle className="text-2xl font-cinzel text-primary">
                                {feature.name}
                            </DialogTitle>
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge
                                    variant="outline"
                                    className={`${getFeatureTypeBadgeColor()} font-medium`}
                                >
                                    {getFeatureTypeLabel()}
                                </Badge>
                                <Badge
                                    variant="outline"
                                    className="bg-background/50 text-muted-foreground border-border"
                                >
                                    Nível {feature.level}
                                </Badge>
                                {className && (
                                    <Badge
                                        variant="outline"
                                        className="bg-background/50 text-muted-foreground border-border"
                                    >
                                        {className}
                                    </Badge>
                                )}
                                {subclassName && (
                                    <Badge
                                        variant="outline"
                                        className="bg-primary/10 text-primary border-primary/30"
                                    >
                                        {subclassName}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                <ScrollArea className="max-h-[50vh] pr-4">
                    <DialogDescription asChild>
                        <div className="space-y-4 text-base">
                            {/* Descrição Principal */}
                            <div className="bg-card/60 rounded-lg p-4 border border-border/50">
                                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                                    {feature.description}
                                </p>
                            </div>

                            {/* Informações Adicionais baseadas no tipo */}
                            {feature.type === 'ability_score_improvement' && (
                                <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                                    <h4 className="font-semibold text-green-300 mb-2 flex items-center gap-2">
                                        <Sparkles className="w-4 h-4" />
                                        Como Funciona
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        Você pode escolher uma das seguintes opções:
                                    </p>
                                    <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
                                        <li>Aumentar um atributo em 2 pontos (máximo 20)</li>
                                        <li>Aumentar dois atributos diferentes em 1 ponto cada (máximo 20 cada)</li>
                                        <li>Escolher um talento (feat) em vez do aumento de atributo</li>
                                    </ul>
                                </div>
                            )}

                            {feature.type === 'spellcasting' && (
                                <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
                                    <h4 className="font-semibold text-purple-300 mb-2 flex items-center gap-2">
                                        <Sparkles className="w-4 h-4" />
                                        Conjuração
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        Esta habilidade permite que você conjure magias. Consulte a aba "Magias"
                                        para gerenciar suas magias conhecidas, preparadas e slots de magia disponíveis.
                                    </p>
                                </div>
                            )}

                            {feature.type === 'subclass' && (
                                <div className="bg-amber-500/10 rounded-lg p-4 border border-amber-500/20">
                                    <h4 className="font-semibold text-amber-300 mb-2 flex items-center gap-2">
                                        <Star className="w-4 h-4" />
                                        Escolha de Subclasse
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        Neste nível, você deve escolher uma subclasse que define a especialização
                                        do seu personagem. Esta escolha é permanente e concede habilidades únicas
                                        conforme você avança de nível.
                                    </p>
                                </div>
                            )}

                            {/* Dica de Jogo */}
                            <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
                                <p className="text-xs text-muted-foreground italic">
                                    💡 <strong>Dica:</strong> Consulte o Manual do Jogador (Player's Handbook)
                                    para detalhes completos sobre como esta habilidade funciona em jogo.
                                </p>
                            </div>
                        </div>
                    </DialogDescription>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
