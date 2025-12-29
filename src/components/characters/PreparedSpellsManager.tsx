"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import {
    canPrepareSpells,
    getMaxPreparedSpells,
    getSpellcastingAbility,
    calculateModifier,
    filterPreparableSpells,
    groupPreparedSpellsByLevel,
} from "@/lib/prepared-spells-helper";
import { useTranslation } from "@/lib/i18n/context";

interface PreparedSpellsManagerProps {
    character: any;
    spellDetails: Record<string, any>;
    onUpdate: () => void;
}

export function PreparedSpellsManager({
    character,
    spellDetails,
    onUpdate,
}: PreparedSpellsManagerProps) {
    const { translateSpell, translateDnd5e } = useTranslation();
    const [preparedSpells, setPreparedSpells] = useState<string[]>(
        character.preparedSpells || character.prepared_spells || []
    );
    const [saving, setSaving] = useState(false);

    // Verificar se a classe prepara magias
    if (!canPrepareSpells(character.characterClass)) {
        return null;
    }

    // Calcular informações de preparação
    const spellAbility = getSpellcastingAbility(character.characterClass);
    const abilityValue = character.attributes?.[spellAbility] || 10;
    const abilityModifier = calculateModifier(abilityValue);
    const maxPrepared = getMaxPreparedSpells(
        character.characterClass,
        character.level || 1,
        abilityModifier
    );

    // Filtrar magias que podem ser preparadas (excluir truques)
    const knownSpells = character.spellcasting?.knownSpells || [];
    const preparableSpells = filterPreparableSpells(knownSpells, spellDetails);

    // Agrupar magias por nível
    const groupedSpells = preparableSpells.reduce((acc: Record<number, string[]>, spellIndex) => {
        const detail = spellDetails[spellIndex];
        if (detail && detail.level > 0) {
            const level = detail.level;
            if (!acc[level]) {
                acc[level] = [];
            }
            acc[level].push(spellIndex);
        }
        return acc;
    }, {});

    const handleToggleSpell = (spellIndex: string) => {
        setPreparedSpells((prev) => {
            if (prev.includes(spellIndex)) {
                return prev.filter((s) => s !== spellIndex);
            } else {
                if (prev.length >= maxPrepared) {
                    toast.error(`Você pode preparar no máximo ${maxPrepared} magia(s)`);
                    return prev;
                }
                return [...prev, spellIndex];
            }
        });
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            // Obter data atual da campanha
            const campaignRes = await fetch(`/api/campaigns/${character.campaignId}/calendar`);
            let currentDate = "1-1-1490";
            if (campaignRes.ok) {
                const campaignData = await campaignRes.json();
                currentDate = campaignData.currentDate;
            }

            const res = await fetch(`/api/characters/${character.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    preparedSpells,
                    lastSpellPrepDate: currentDate,
                }),
            });

            if (!res.ok) {
                throw new Error("Erro ao salvar magias preparadas");
            }

            toast.success("Magias preparadas salvas com sucesso!");
            onUpdate();
        } catch (error: any) {
            console.error("Error saving prepared spells:", error);
            toast.error(error.message || "Erro ao salvar magias preparadas");
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        setPreparedSpells([]);
        toast.info("Magias despreparadas. Clique em 'Salvar' para confirmar.");
    };

    const hasChanges =
        JSON.stringify(preparedSpells.sort()) !==
        JSON.stringify((character.preparedSpells || character.prepared_spells || []).sort());

    return (
        <Card className="bg-card/60 border-white/10">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-cinzel flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        Magias Preparadas
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Badge variant={preparedSpells.length >= maxPrepared ? "destructive" : "secondary"}>
                            {preparedSpells.length} / {maxPrepared}
                        </Badge>
                        {hasChanges && (
                            <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                                Não salvo
                            </Badge>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Informações */}
                <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
                    <p className="text-sm text-muted-foreground">
                        Você pode preparar <strong>{maxPrepared}</strong> magia(s) por dia.
                        <br />
                        <span className="text-xs">
                            (Modificador de {translateDnd5e(spellAbility)} [{abilityModifier >= 0 ? "+" : ""}
                            {abilityModifier}] + Nível [{character.level}])
                        </span>
                    </p>
                </div>

                {/* Alerta se precisa preparar */}
                {preparedSpells.length === 0 && (
                    <div className="bg-yellow-500/10 rounded-lg p-3 border border-yellow-500/20 flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-sm font-semibold text-yellow-500">
                                Você precisa preparar suas magias!
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Selecione até {maxPrepared} magia(s) da lista abaixo e clique em "Salvar".
                            </p>
                        </div>
                    </div>
                )}

                {/* Lista de Magias por Nível */}
                {preparableSpells.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                        Você ainda não conhece nenhuma magia que possa ser preparada.
                    </p>
                ) : (
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                        {Object.keys(groupedSpells)
                            .map(Number)
                            .sort((a, b) => a - b)
                            .map((level) => (
                                <div key={level} className="space-y-2">
                                    <h4 className="font-semibold text-sm text-primary">{level}º Nível</h4>
                                    <div className="space-y-2">
                                        {groupedSpells[level].map((spellIndex) => {
                                            const detail = spellDetails[spellIndex];
                                            const isPrepared = preparedSpells.includes(spellIndex);

                                            return (
                                                <div
                                                    key={spellIndex}
                                                    className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${isPrepared
                                                            ? "bg-primary/10 border-primary/30"
                                                            : "bg-card/40 border-white/5 hover:border-white/10"
                                                        }`}
                                                >
                                                    <Checkbox
                                                        id={spellIndex}
                                                        checked={isPrepared}
                                                        onCheckedChange={() => handleToggleSpell(spellIndex)}
                                                        className="mt-1"
                                                    />
                                                    <label
                                                        htmlFor={spellIndex}
                                                        className="flex-1 cursor-pointer space-y-1"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-medium">
                                                                {detail ? translateSpell(detail.name) : spellIndex}
                                                            </span>
                                                            {isPrepared && (
                                                                <CheckCircle2 className="w-4 h-4 text-primary" />
                                                            )}
                                                        </div>
                                                        {detail && (
                                                            <div className="text-xs text-muted-foreground space-y-0.5">
                                                                {detail.school && (
                                                                    <p>
                                                                        <strong>Escola:</strong> {translateDnd5e(detail.school.name)}
                                                                    </p>
                                                                )}
                                                                {detail.casting_time && (
                                                                    <p>
                                                                        <strong>Tempo:</strong> {translateDnd5e(detail.casting_time)}
                                                                    </p>
                                                                )}
                                                                {detail.range && (
                                                                    <p>
                                                                        <strong>Alcance:</strong> {translateDnd5e(detail.range)}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </label>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                    </div>
                )}

                {/* Botões de Ação */}
                {preparableSpells.length > 0 && (
                    <div className="flex gap-2 pt-4 border-t border-white/10">
                        <Button
                            variant="outline"
                            onClick={handleReset}
                            disabled={saving || preparedSpells.length === 0}
                            className="flex-1 border-red-500/30 hover:bg-red-500/10 text-red-500"
                        >
                            Limpar Tudo
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={saving || !hasChanges}
                            className="flex-1 bg-primary hover:bg-primary/90"
                        >
                            {saving ? "Salvando..." : "Salvar Preparação"}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
