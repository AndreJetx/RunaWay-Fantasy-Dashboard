'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Flame, Zap } from 'lucide-react';
import { DragonType, DRAGON_TYPES, getDamageTypeLabel } from '@/lib/dragon-types';

interface DragonTypeSelectorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (dragonType: DragonType) => void;
}

export function DragonTypeSelector({
    open,
    onOpenChange,
    onSelect,
}: DragonTypeSelectorProps) {
    const [selectedDragon, setSelectedDragon] = useState<DragonType | null>(null);

    const handleSelect = () => {
        if (selectedDragon) {
            onSelect(selectedDragon);
            onOpenChange(false);
        }
    };

    const getDragonColor = (color: string) => {
        const colors: Record<string, string> = {
            'black': 'bg-gray-900 text-white border-gray-700',
            'blue': 'bg-blue-600 text-white border-blue-500',
            'bronze': 'bg-amber-700 text-white border-amber-600',
            'copper': 'bg-orange-700 text-white border-orange-600',
            'gold': 'bg-yellow-500 text-black border-yellow-400',
            'green': 'bg-green-700 text-white border-green-600',
            'brass': 'bg-yellow-700 text-white border-yellow-600',
            'silver': 'bg-gray-300 text-black border-gray-400',
            'white': 'bg-white text-black border-gray-300',
            'red': 'bg-red-600 text-white border-red-500',
        };
        return colors[color] || 'bg-gray-500 text-white border-gray-400';
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle className="flex items-center gap-2">
                        <Flame className="w-5 h-5 text-primary" />
                        Escolha seu Dragão Ancestral
                    </DialogTitle>
                    <DialogDescription>
                        Seu dragão ancestral determina o tipo de dano de seu sopro e sua resistência
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-hidden min-h-0">
                    {/* Lista de Dragões */}
                    <ScrollArea className="h-full pr-2">
                        <div className="space-y-2">
                            {DRAGON_TYPES.map((dragon) => (
                                <Card
                                    key={dragon.name}
                                    className={`cursor-pointer transition-all hover:border-primary/50 ${selectedDragon?.name === dragon.name
                                            ? 'border-primary bg-primary/5'
                                            : 'border-border/50'
                                        }`}
                                    onClick={() => setSelectedDragon(dragon)}
                                >
                                    <CardHeader className="p-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className="text-sm font-semibold">{dragon.name}</h3>
                                            <Badge className={getDragonColor(dragon.color)} variant="outline">
                                                {getDamageTypeLabel(dragon.damageType)}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                    </ScrollArea>

                    {/* Detalhes do Dragão Selecionado */}
                    <ScrollArea className="h-full">
                        {selectedDragon ? (
                            <div className="space-y-3 pr-2">
                                <div>
                                    <h3 className="text-base font-semibold mb-1">{selectedDragon.name}</h3>
                                    <Badge className={getDragonColor(selectedDragon.color)} variant="outline">
                                        {getDamageTypeLabel(selectedDragon.damageType)}
                                    </Badge>
                                </div>

                                {/* Benefícios */}
                                <div>
                                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                        <Zap className="w-4 h-4" />
                                        Benefícios
                                    </h4>
                                    <Card className="bg-primary/5 border-primary/20">
                                        <CardContent className="p-2 space-y-2">
                                            <div>
                                                <p className="text-xs font-medium text-muted-foreground mb-1">
                                                    Tipo de Dano:
                                                </p>
                                                <Badge variant="secondary" className="text-xs">
                                                    {getDamageTypeLabel(selectedDragon.damageType)}
                                                </Badge>
                                            </div>

                                            <div>
                                                <p className="text-xs font-medium text-muted-foreground mb-1">
                                                    Arma de Sopro:
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {selectedDragon.breathWeapon}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs font-medium text-muted-foreground mb-1">
                                                    Resistência (Nível 6):
                                                </p>
                                                <Badge variant="secondary" className="text-xs">
                                                    Resistência a {getDamageTypeLabel(selectedDragon.damageType)}
                                                </Badge>
                                            </div>

                                            <div className="pt-2 border-t border-border/50">
                                                <p className="text-xs text-muted-foreground">
                                                    <strong>Afinidade Elemental:</strong> Quando você conjura uma magia que causa dano de {getDamageTypeLabel(selectedDragon.damageType).toLowerCase()}, você pode adicionar seu modificador de Carisma ao dano.
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                <p className="text-sm">Selecione um dragão para ver os detalhes</p>
                            </div>
                        )}
                    </ScrollArea>
                </div>

                {/* Botões de Ação */}
                <div className="flex justify-end gap-2 mt-4 flex-shrink-0">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSelect} disabled={!selectedDragon}>
                        Confirmar Seleção
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
