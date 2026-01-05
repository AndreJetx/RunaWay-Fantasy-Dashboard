'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Zap, Plus, Minus, RefreshCw, RotateCcw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface SorceryPointManagerProps {
    character: any;
    onUpdate: () => void;
    canEdit: boolean;
}

export function SorceryPointManager({ character, onUpdate, canEdit }: SorceryPointManagerProps) {
    const [showConvertToSlot, setShowConvertToSlot] = useState(false);
    const [showConvertToPF, setShowConvertToPF] = useState(false);
    const [showMetamagicUse, setShowMetamagicUse] = useState(false);
    const [selectedSlotLevel, setSelectedSlotLevel] = useState<number>(1);
    const [selectedMetamagic, setSelectedMetamagic] = useState<string>('');

    const currentPF = character.sorceryPoints || 0;
    const maxPF = character.maxSorceryPoints || character.level;
    const metamagics = character.metamagics || [];
    const spellSlots = character.spellcasting?.spellSlots || {};
    const usedSlots = character.usedSpellSlots || {};

    const createdSlots = character.createdSpellSlots || {};

    // Custo para criar slot de magia (nível do slot = PF necessários)
    const slotCosts: Record<number, number> = {
        1: 2, 2: 3, 3: 5, 4: 6, 5: 7
    };

    // Conversão de slot em PF (nível do slot = PF ganhos)
    const slotToPFConversion: Record<number, number> = {
        1: 2, 2: 3, 3: 5, 4: 6, 5: 7
    };

    const handleCreateSlot = async (level: number) => {
        const cost = slotCosts[level];
        if (currentPF < cost) {
            toast.error(`Você precisa de ${cost} Pontos de Feitiçaria para criar um slot de ${level}º nível`);
            return;
        }

        try {
            // Criar slot aumentando os createdSlots
            const newCreatedSlots = { ...createdSlots };
            const key = `level${level}`;
            newCreatedSlots[key] = (newCreatedSlots[key] || 0) + 1;

            const res = await fetch(`/api/characters/${character.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sorceryPoints: currentPF - cost,
                    createdSpellSlots: newCreatedSlots,
                }),
            });

            if (!res.ok) throw new Error('Erro ao criar slot');
            toast.success(`Slot de ${level}º nível criado! (${cost} PF gastos)`);
            setShowConvertToSlot(false);
            onUpdate();
        } catch (error) {
            toast.error('Erro ao criar slot');
        }
    };

    const handleConvertSlotToPF = async (level: number) => {
        const key = `level${level}`;
        const base = spellSlots[key] || 0;
        const created = createdSlots[key] || 0;
        const used = usedSlots[key] || 0;
        const slotsAvailable = (base + created) - used;

        if (slotsAvailable <= 0) {
            toast.error(`Você não tem slots de ${level}º nível disponíveis`);
            return;
        }

        const pfGained = slotToPFConversion[level];

        try {
            const updatePayload: any = {
                sorceryPoints: Math.min(currentPF + pfGained, maxPF),
            };

            if (created > 0) {
                // Lógica inteligente: Se tiver slot bônus, remove ele em vez de marcar como usado
                const newCreatedSlots = { ...createdSlots };
                newCreatedSlots[key] = created - 1;
                updatePayload.createdSpellSlots = newCreatedSlots;
            } else {
                // Se não tiver bônus, consome um slot natural (marca como usado)
                const newUsedSlots = { ...usedSlots };
                newUsedSlots[key] = (newUsedSlots[key] || 0) + 1;
                updatePayload.usedSpellSlots = newUsedSlots;
            }

            const res = await fetch(`/api/characters/${character.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatePayload),
            });

            if (!res.ok) throw new Error('Erro ao converter slot');
            toast.success(`Slot de ${level}º nível convertido! (+${pfGained} PF)`);
            setShowConvertToPF(false);
            onUpdate();
        } catch (error) {
            toast.error('Erro ao converter slot');
        }
    };

    const handleUseMetamagic = async (metamagicId: string) => {
        const { METAMAGICS } = require('@/lib/metamagic');
        const metamagic = METAMAGICS[metamagicId];

        if (!metamagic) return;

        if (currentPF < metamagic.cost) {
            toast.error(`Você precisa de ${metamagic.cost} Pontos de Feitiçaria para usar ${metamagic.name}`);
            return;
        }

        try {
            const res = await fetch(`/api/characters/${character.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sorceryPoints: currentPF - metamagic.cost,
                }),
            });

            if (!res.ok) throw new Error('Erro ao usar metamágica');
            toast.success(`${metamagic.name} usada! (${metamagic.cost} PF gastos)`);
            setShowMetamagicUse(false);
            onUpdate();
        } catch (error) {
            toast.error('Erro ao usar metamágica');
        }
    };

    const handleLongRest = async () => {
        try {
            const res = await fetch(`/api/characters/${character.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sorceryPoints: maxPF,
                    usedSpellSlots: {},
                    createdSpellSlots: {}, // Reseta slots criados
                }),
            });

            if (!res.ok) throw new Error('Erro ao restaurar pontos');
            toast.success('Todos os pontos e slots restaurados após descanso longo!');
            onUpdate();
        } catch (error) {
            toast.error('Erro ao restaurar pontos');
        }
    };

    const handleShortRest = async () => {
        try {
            const res = await fetch(`/api/characters/${character.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sorceryPoints: Math.min(currentPF + 4, maxPF),
                }),
            });

            if (!res.ok) throw new Error('Erro ao restaurar pontos via descanso curto');
            toast.success('4 Pontos de Feitiçaria restaurados! (Restauração Feiticeira)');
            onUpdate();
        } catch (error) {
            toast.error('Erro ao restaurar pontos');
        }
    };

    if (character.characterClass !== 'Feiticeiro' || character.level < 2) {
        return null;
    }

    return (
        <>
            <Card className="bg-card/60 border-white/10 mb-6">
                <CardHeader>
                    <CardTitle className="text-xl font-cinzel flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                        Pontos de Feitiçaria
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Display de Pontos */}
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
                            <div>
                                <p className="text-sm text-muted-foreground">Pontos Atuais</p>
                                <p className="text-3xl font-bold text-purple-400">{currentPF}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground">Pontos Máximos</p>
                                <p className="text-2xl font-bold">{maxPF}</p>
                            </div>
                        </div>

                        {canEdit && (
                            <>
                                {/* Botões de Ação */}
                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowConvertToSlot(true)}
                                        className="border-blue-500/30 hover:bg-blue-500/10"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Criar Slot
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowConvertToPF(true)}
                                        className="border-green-500/30 hover:bg-green-500/10"
                                    >
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        Converter Slot
                                    </Button>
                                    {metamagics.length > 0 && (
                                        <Button
                                            variant="outline"
                                            onClick={() => setShowMetamagicUse(true)}
                                            className="border-purple-500/30 hover:bg-purple-500/10"
                                        >
                                            <Zap className="w-4 h-4 mr-2" />
                                            Usar Metamágica
                                        </Button>
                                    )}
                                    {character.level >= 20 && (
                                        <Button
                                            variant="outline"
                                            onClick={handleShortRest}
                                            className="border-indigo-500/30 hover:bg-indigo-500/10"
                                            title="Restauração Feiticeira: Recupere 4 Pontos de Feitiçaria"
                                        >
                                            <Sparkles className="w-4 h-4 mr-2" />
                                            Descanso Curto (+4 PF)
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        onClick={handleLongRest}
                                        className="border-amber-500/30 hover:bg-amber-500/10"
                                    >
                                        <RotateCcw className="w-4 h-4 mr-2" />
                                        Descanso Longo
                                    </Button>
                                </div>

                                {/* Informações */}
                                <div className="text-xs text-muted-foreground bg-card/40 p-3 rounded border border-border/50">
                                    <p className="font-semibold mb-2">Como usar:</p>
                                    <ul className="space-y-1 list-disc list-inside">
                                        <li><strong>Criar Slot:</strong> Gaste PF para criar slots de magia temporários (até 5º nível)</li>
                                        <li><strong>Converter Slot:</strong> Sacrifique slots de magia para ganhar PF</li>
                                        <li><strong>Usar Metamágica:</strong> Gaste PF para aplicar efeitos nas suas magias</li>
                                        <li><strong>Descanso Longo:</strong> Recupere todos os PF</li>
                                    </ul>
                                </div>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Dialog: Criar Slot de Magia */}
            <Dialog open={showConvertToSlot} onOpenChange={setShowConvertToSlot}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Criar Slot de Magia</DialogTitle>
                        <DialogDescription>
                            Gaste Pontos de Feitiçaria para criar um slot de magia temporário (máximo 5º nível)
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm mb-2">Nível do Slot:</p>
                            <Select value={selectedSlotLevel.toString()} onValueChange={(v) => setSelectedSlotLevel(Number(v))}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {[1, 2, 3, 4, 5].map((level) => (
                                        <SelectItem key={level} value={level.toString()}>
                                            {level}º Nível - {slotCosts[level]} PF
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setShowConvertToSlot(false)} className="flex-1">
                                Cancelar
                            </Button>
                            <Button
                                onClick={() => handleCreateSlot(selectedSlotLevel)}
                                disabled={currentPF < slotCosts[selectedSlotLevel]}
                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                            >
                                Criar Slot ({slotCosts[selectedSlotLevel]} PF)
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Dialog: Converter Slot em PF */}
            <Dialog open={showConvertToPF} onOpenChange={setShowConvertToPF}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Converter Slot em Pontos</DialogTitle>
                        <DialogDescription>
                            Sacrifique um slot de magia para ganhar Pontos de Feitiçaria
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm mb-2">Selecione o Slot para Converter:</p>
                            <Select value={selectedSlotLevel.toString()} onValueChange={(v) => setSelectedSlotLevel(Number(v))}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {[1, 2, 3, 4, 5].map((level) => {
                                        const key = `level${level}`;
                                        const base = spellSlots[key] || 0;
                                        const created = createdSlots[key] || 0;
                                        const used = usedSlots[key] || 0;
                                        const available = (base + created) - used;

                                        return (
                                            <SelectItem key={level} value={level.toString()} disabled={available <= 0}>
                                                {level}º Nível - +{slotToPFConversion[level]} PF {available > 0 ? `(${available} disponível)` : '(nenhum disponível)'}
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setShowConvertToPF(false)} className="flex-1">
                                Cancelar
                            </Button>
                            <Button
                                onClick={() => handleConvertSlotToPF(selectedSlotLevel)}
                                className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                                Converter (+{slotToPFConversion[selectedSlotLevel]} PF)
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Dialog: Usar Metamágica */}
            <Dialog open={showMetamagicUse} onOpenChange={setShowMetamagicUse}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Usar Metamágica</DialogTitle>
                        <DialogDescription>
                            Escolha uma metamágica para usar (gasta Pontos de Feitiçaria)
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        {metamagics.length === 0 ? (
                            <p className="text-muted-foreground text-center py-4">
                                Você ainda não tem metamágicas. Aprenda metamágicas no nível 3!
                            </p>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    {metamagics.map((metamagicId: string) => {
                                        const { METAMAGICS } = require('@/lib/metamagic');
                                        const metamagic = METAMAGICS[metamagicId];
                                        if (!metamagic) return null;

                                        const canAfford = currentPF >= metamagic.cost;

                                        return (
                                            <div
                                                key={metamagicId}
                                                className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedMetamagic === metamagicId
                                                    ? 'bg-purple-500/20 border-purple-500/40'
                                                    : canAfford
                                                        ? 'bg-card/40 border-border hover:border-purple-500/30'
                                                        : 'bg-card/20 border-border opacity-50 cursor-not-allowed'
                                                    }`}
                                                onClick={() => canAfford && setSelectedMetamagic(metamagicId)}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h4 className="font-semibold">{metamagic.name}</h4>
                                                        <p className="text-xs text-muted-foreground">{metamagic.description}</p>
                                                    </div>
                                                    <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                                                        {metamagic.cost} PF
                                                    </Badge>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={() => setShowMetamagicUse(false)} className="flex-1">
                                        Cancelar
                                    </Button>
                                    <Button
                                        onClick={() => handleUseMetamagic(selectedMetamagic)}
                                        disabled={!selectedMetamagic}
                                        className="flex-1 bg-purple-600 hover:bg-purple-700"
                                    >
                                        Usar Metamágica
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
