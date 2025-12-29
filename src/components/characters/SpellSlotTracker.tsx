"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Circle, CircleDot, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { canCastSpells } from "@/lib/spell-slots";

interface SpellSlotTrackerProps {
    character: any;
    onUpdate: () => void;
    canEdit: boolean;
}

export function SpellSlotTracker({ character, onUpdate, canEdit }: SpellSlotTrackerProps) {
    const [saving, setSaving] = useState(false);
    const [usedSlots, setUsedSlots] = useState<Record<string, number>>(
        character.usedSpellSlots || character.used_spell_slots || {}
    );

    if (!canCastSpells(character.characterClass)) {
        return null;
    }

    const spellSlots = character.spellcasting?.spellSlots || {};

    const handleToggleSlot = (level: number, slotIndex: number) => {
        if (!canEdit) return;

        const key = `level${level}`;
        const currentUsed = usedSlots[key] || 0;
        const totalSlots = spellSlots[key] || 0;

        setUsedSlots((prev) => {
            const newUsed = { ...prev };

            // Se clicar em um slot usado, desmarcar ele e todos depois dele
            if (slotIndex < currentUsed) {
                newUsed[key] = slotIndex;
            } else {
                // Marcar até esse slot
                newUsed[key] = slotIndex + 1;
            }

            return newUsed;
        });
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            const res = await fetch(`/api/characters/${character.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    usedSpellSlots: usedSlots,
                }),
            });

            if (!res.ok) {
                throw new Error("Erro ao salvar slots de magia");
            }

            toast.success("Slots de magia salvos!");
            onUpdate();
        } catch (error: any) {
            console.error("Error saving spell slots:", error);
            toast.error(error.message || "Erro ao salvar slots");
        } finally {
            setSaving(false);
        }
    };

    const handleReset = async () => {
        try {
            setSaving(true);
            setUsedSlots({});

            const res = await fetch(`/api/characters/${character.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    usedSpellSlots: {},
                }),
            });

            if (!res.ok) {
                throw new Error("Erro ao resetar slots");
            }

            toast.success("Todos os slots foram restaurados!");
            onUpdate();
        } catch (error: any) {
            console.error("Error resetting spell slots:", error);
            toast.error(error.message || "Erro ao resetar slots");
        } finally {
            setSaving(false);
        }
    };

    const hasChanges =
        JSON.stringify(usedSlots) !==
        JSON.stringify(character.usedSpellSlots || character.used_spell_slots || {});

    // Verificar se há slots disponíveis
    const hasSlots = Object.keys(spellSlots).some((key) => spellSlots[key] > 0);

    if (!hasSlots) {
        return null;
    }

    return (
        <Card className="bg-card/60 border-white/10 mb-6">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-cinzel flex items-center gap-2">
                        <CircleDot className="w-5 h-5" />
                        Rastreador de Slots
                    </CardTitle>
                    {canEdit && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleReset}
                            disabled={saving}
                            className="border-primary/30 hover:bg-primary/10"
                        >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Descanso Longo
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                    Clique nos círculos para marcar slots usados. Slots usados ficam preenchidos.
                </p>

                <div className="space-y-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => {
                        const key = `level${level}`;
                        const total = spellSlots[key] || 0;
                        if (total === 0) return null;

                        const used = usedSlots[key] || 0;
                        const available = total - used;

                        return (
                            <div key={level} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-primary">
                                        Nível {level}
                                    </span>
                                    <Badge
                                        variant={available === 0 ? "destructive" : "secondary"}
                                        className="text-xs"
                                    >
                                        {available} / {total} disponíveis
                                    </Badge>
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    {Array.from({ length: total }).map((_, index) => {
                                        const isUsed = index < used;
                                        return (
                                            <button
                                                key={index}
                                                onClick={() => handleToggleSlot(level, index)}
                                                disabled={!canEdit}
                                                className={`w-10 h-10 rounded-full border-2 transition-all ${isUsed
                                                    ? "bg-primary/20 border-primary text-primary"
                                                    : "bg-card/40 border-white/20 text-white/40 hover:border-primary/50"
                                                    } ${canEdit ? "cursor-pointer hover:scale-110" : "cursor-not-allowed opacity-50"}`}
                                                title={`Slot ${index + 1} - ${isUsed ? "Usado" : "Disponível"}`}
                                            >
                                                {isUsed ? (
                                                    <CircleDot className="w-6 h-6 mx-auto" />
                                                ) : (
                                                    <Circle className="w-6 h-6 mx-auto" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {canEdit && hasChanges && (
                    <div className="pt-4 border-t border-white/10">
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full bg-primary hover:bg-primary/90"
                        >
                            {saving ? "Salvando..." : "Salvar Alterações"}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
