'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Zap } from 'lucide-react';
import { METAMAGIC_LIST, Metamagic } from '@/lib/metamagic';

interface MetamagicSelectorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (metamagics: string[]) => void;
    currentMetamagics: string[];
    maxMetamagics: number;
}

export function MetamagicSelector({
    open,
    onOpenChange,
    onSelect,
    currentMetamagics,
    maxMetamagics,
}: MetamagicSelectorProps) {
    const [selectedMetamagics, setSelectedMetamagics] = useState<string[]>(currentMetamagics);

    const toggleMetamagic = (metamagicId: string) => {
        setSelectedMetamagics((prev) => {
            // Se já está selecionada, remove
            if (prev.includes(metamagicId)) {
                return prev.filter((id) => id !== metamagicId);
            }

            // Se atingiu o máximo, não adiciona
            if (prev.length >= maxMetamagics) {
                return prev;
            }

            // Adiciona
            return [...prev, metamagicId];
        });
    };

    const handleConfirm = () => {
        onSelect(selectedMetamagics);
        onOpenChange(false);
    };

    const canConfirm = selectedMetamagics.length === maxMetamagics;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-cinzel flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-purple-400" />
                        Escolha suas Metamágicas
                    </DialogTitle>
                    <DialogDescription>
                        Selecione {maxMetamagics} opção(ões) de metamágica. Você pode usar pontos de feitiçaria para modificar suas magias.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex items-center justify-between p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <div>
                        <p className="text-sm text-muted-foreground">Metamágicas Selecionadas</p>
                        <p className="text-2xl font-bold text-purple-400">
                            {selectedMetamagics.length} / {maxMetamagics}
                        </p>
                    </div>
                    {selectedMetamagics.length >= maxMetamagics && (
                        <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                            Completo
                        </Badge>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto pr-4">
                    <div className="space-y-3">
                        {METAMAGIC_LIST.map((metamagic) => {
                            const isSelected = selectedMetamagics.includes(metamagic.id);
                            const canSelect = selectedMetamagics.length < maxMetamagics || isSelected;

                            return (
                                <div
                                    key={metamagic.id}
                                    className={`p-4 rounded-lg border transition-all ${isSelected
                                        ? 'bg-purple-500/10 border-purple-500/30'
                                        : canSelect
                                            ? 'bg-card/40 border-white/5 hover:border-purple-500/20 cursor-pointer'
                                            : 'bg-card/20 border-white/5 opacity-50'
                                        }`}
                                    onClick={() => canSelect && toggleMetamagic(metamagic.id)}
                                >
                                    <div className="flex items-start gap-3">
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() => canSelect && toggleMetamagic(metamagic.id)}
                                            disabled={!canSelect}
                                            className="mt-1"
                                        />
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-semibold text-lg">{metamagic.name}</h3>
                                                <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                                                    <Zap className="w-3 h-3 mr-1" />
                                                    {metamagic.cost === 1 ? `${metamagic.cost} ponto` : `${metamagic.cost} pontos`}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                {metamagic.description}
                                            </p>
                                            {metamagic.requirements && (
                                                <p className="text-xs text-yellow-400 italic">
                                                    ⚠️ {metamagic.requirements}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="flex-1"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={!canConfirm}
                        className="flex-1 bg-purple-600 hover:bg-purple-700"
                    >
                        Confirmar Seleção
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
