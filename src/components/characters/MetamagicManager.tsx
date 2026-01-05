"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap } from "lucide-react";
import { toast } from "sonner";
import { METAMAGICS, Metamagic } from "@/lib/metamagic";

interface MetamagicManagerProps {
    character: any;
    onUpdate: () => void;
    canEdit: boolean;
}

export function MetamagicManager({ character, onUpdate, canEdit }: MetamagicManagerProps) {
    const [usingId, setUsingId] = useState<string | null>(null);

    const metamagicIds = character.metamagics || [];
    const currentPF = character.sorceryPoints || 0;

    if (character.characterClass !== 'Feiticeiro' || character.level < 3 || metamagicIds.length === 0) {
        return null;
    }

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
                            <Card key={metamagicId} className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base flex items-center justify-between">
                                        <span>{metamagic.name}</span>
                                        <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                                            {metamagic.cost} PF
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {metamagic.description}
                                    </p>
                                    {metamagic.requirements && (
                                        <p className="text-xs text-yellow-400 italic">
                                            ⚠️ {metamagic.requirements}
                                        </p>
                                    )}

                                    {canEdit && (
                                        <Button
                                            size="sm"
                                            variant={canAfford ? "default" : "outline"}
                                            className={`w-full ${canAfford ? "bg-purple-600 hover:bg-purple-700" : "opacity-50 cursor-not-allowed"}`}
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
