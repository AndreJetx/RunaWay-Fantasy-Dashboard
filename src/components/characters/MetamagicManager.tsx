"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { METAMAGICS, Metamagic } from "@/lib/metamagic";
import { MetamagicSelector } from "@/components/characters/MetamagicSelector";

interface MetamagicManagerProps {
    character: any;
    onUpdate: () => void;
    canEdit: boolean;
}

export function MetamagicManager({ character, onUpdate, canEdit }: MetamagicManagerProps) {
    const [usingId, setUsingId] = useState<string | null>(null);
    const [showSelector, setShowSelector] = useState(false);
    const [savingSelection, setSavingSelection] = useState(false);

    const metamagicIds = character.metamagics || [];
    const currentPF = character.sorceryPoints || 0;

    if (character.characterClass !== 'Feiticeiro' || character.level < 3) {
        return null;
    }

    // Calcula quantas metamágicas o personagem deveria ter
    const maxMetamagics = character.level >= 17 ? 4 : character.level >= 10 ? 3 : 2;
    const missingMetamagics = metamagicIds.length === 0;

    const handleUseMetamagic = async (metamagicId: string) => {
        const metamagic = METAMAGICS[metamagicId];
        if (!metamagic) return;

        if (currentPF < metamagic.cost) {
            toast.error(`Você precisa de ${metamagic.cost} Pontos de Feitiçaria para usar ${metamagic.name}`);
            return;
        }

        try {
            setUsingId(metamagicId);
            const res = await fetch(`/api/characters/${character.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sorceryPoints: currentPF - metamagic.cost,
                }),
            });

            if (!res.ok) throw new Error('Erro ao usar metamágica');
            toast.success(`${metamagic.name} usada! (${metamagic.cost} PF gastos)`);
            onUpdate();
        } catch (error) {
            toast.error('Erro ao usar metamágica');
        } finally {
            setUsingId(null);
        }
    };

    const handleSaveSelection = async (selected: string[]) => {
        try {
            setSavingSelection(true);
            const res = await fetch(`/api/characters/${character.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    metamagics: selected,
                }),
            });

            if (!res.ok) throw new Error('Erro ao salvar metamágicas');
            toast.success('Metamágicas aprendidas com sucesso!');
            setShowSelector(false);
            onUpdate();
        } catch (error) {
            toast.error('Erro ao salvar metamágicas');
        } finally {
            setSavingSelection(false);
        }
    };

    if (missingMetamagics) {
        return (
            <>
                <Card className="bg-card/60 border-yellow-500/20 mb-6">
                    <CardHeader>
                        <CardTitle className="text-xl font-cinzel flex items-center gap-2 text-yellow-400">
                            <Sparkles className="w-5 h-5" />
                            Metamágicas
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground">
                            Você desbloqueou a habilidade de usar Metamágicas, mas ainda não escolheu quais deseja aprender.
                        </p>
                        {canEdit && (
                            <Button
                                onClick={() => setShowSelector(true)}
                                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                            >
                                <PlusCircle className="w-4 h-4 mr-2" />
                                Escolher Metamágicas (0/{maxMetamagics})
                            </Button>
                        )}
                    </CardContent>
                </Card>

                <MetamagicSelector
                    open={showSelector}
                    onOpenChange={setShowSelector}
                    onSelect={handleSaveSelection}
                    currentMetamagics={[]}
                    maxMetamagics={maxMetamagics}
                />
            </>
        );
    }

    return (
        <Card className="bg-card/60 border-white/10 mb-6">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-cinzel flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                        Metamágicas
                    </CardTitle>
                    <Badge variant="outline" className="text-purple-400 border-purple-500/30">
                        {currentPF} PF Disponíveis
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {metamagicIds.map((metamagicId: string) => {
                        const metamagic = METAMAGICS[metamagicId];
                        if (!metamagic) return null;

                        const canAfford = currentPF >= metamagic.cost;

                        return (
                            <Card key={metamagicId} className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 flex flex-col h-full">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base flex items-center justify-between">
                                        <span>{metamagic.name}</span>
                                        <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                                            {metamagic.cost} PF
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-col flex-1 space-y-3">
                                    <div className="flex-1">
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {metamagic.description}
                                        </p>
                                        {metamagic.requirements && (
                                            <p className="text-xs text-yellow-400 italic mt-2">
                                                ⚠️ {metamagic.requirements}
                                            </p>
                                        )}
                                    </div>

                                    {canEdit && (
                                        <Button
                                            size="sm"
                                            variant={canAfford ? "default" : "outline"}
                                            className={`w-full mt-auto ${canAfford ? "bg-purple-600 hover:bg-purple-700" : "opacity-50 cursor-not-allowed"}`}
                                            disabled={!canAfford || usingId === metamagicId}
                                            onClick={() => handleUseMetamagic(metamagicId)}
                                        >
                                            <Zap className="w-3 h-3 mr-2" />
                                            {usingId === metamagicId ? "Usando..." : canAfford ? "Usar (-" + metamagic.cost + " PF)" : "PF Insuficientes"}
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
