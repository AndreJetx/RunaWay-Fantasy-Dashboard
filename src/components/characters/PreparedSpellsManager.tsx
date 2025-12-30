"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Sparkles, AlertCircle, CheckCircle2, Eye, EyeOff, X } from "lucide-react";
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

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
    const [showOnlyPrepared, setShowOnlyPrepared] = useState(false);
    const [selectedSpell, setSelectedSpell] = useState<string | null>(null);
    const [availableSpells, setAvailableSpells] = useState<string[]>([]);
    const [loadingSpells, setLoadingSpells] = useState(true);
    const [localSpellDetails, setLocalSpellDetails] = useState<Record<string, any>>({});
    const [editMode, setEditMode] = useState(false);

    console.log('[PreparedSpellsManager] Component rendering for:', character.characterClass);
    console.log('[PreparedSpellsManager] Can prepare spells?', canPrepareSpells(character.characterClass));

    // Verificar se a classe prepara magias
    if (!canPrepareSpells(character.characterClass)) {
        console.log('[PreparedSpellsManager] Class cannot prepare spells, returning null');
        return null;
    }

    console.log('[PreparedSpellsManager] Component will render!');

    // Buscar TODAS as magias da classe automaticamente da base de dados local
    useEffect(() => {
        const loadClassSpells = () => {
            try {
                setLoadingSpells(true);

                // Mapear nome da classe para o formato da API
                const classNameMap: Record<string, string> = {
                    'Paladino': 'Paladin',
                    'Clérigo': 'Cleric',
                    'Druida': 'Druid',
                    'Ranger': 'Ranger',
                    // Mago NÃO está aqui - prepara do grimório (knownSpells)
                };

                const apiClassName = classNameMap[character.characterClass];
                if (!apiClassName) {
                    setLoadingSpells(false);
                    return;
                }

                // Buscar da base de dados local (INSTANTÂNEO!)
                const { getSpellsByClass, getSpellDetails } = require('@/lib/data/spell-data');

                // Filtrar por nível de slot disponível
                const spellSlots = character.spellcasting?.spellSlots || {};
                console.log('[PreparedSpells] Spell slots:', spellSlots);

                let maxSpellLevel = 0;
                for (let i = 1; i <= 9; i++) {
                    if (spellSlots[`level${i}`] > 0) {
                        maxSpellLevel = i;
                    }
                }

                console.log('[PreparedSpells] Max spell level:', maxSpellLevel);
                console.log('[PreparedSpells] Character class:', character.characterClass, '→', apiClassName);

                const classSpells = getSpellsByClass(apiClassName, maxSpellLevel);
                console.log('[PreparedSpells] Found spells:', classSpells.length);

                setAvailableSpells(classSpells);

                // Carregar detalhes de todas as magias
                const details: Record<string, any> = {};
                classSpells.forEach((spellIndex: string) => {
                    const detail = getSpellDetails(spellIndex);
                    if (detail) {
                        details[spellIndex] = detail;
                    }
                });
                console.log('[PreparedSpells] Loaded spell details:', Object.keys(details).length);
                setLocalSpellDetails(details);

                setLoadingSpells(false);
            } catch (error) {
                console.error('Error loading class spells:', error);
                setLoadingSpells(false);
            }
        };

        loadClassSpells();
    }, [character.characterClass, character.level, character.spellcasting?.spellSlots]);

    // Calcular informações de preparação
    const spellAbility = getSpellcastingAbility(character.characterClass);
    const abilityValue = character.attributes?.[spellAbility] || 10;
    const abilityModifier = calculateModifier(abilityValue);
    const maxPrepared = getMaxPreparedSpells(
        character.characterClass,
        character.level || 1,
        abilityModifier
    );

    // Usar lista de magias disponíveis
    // Para Mago: usa grimório (knownSpells)
    // Para outras classes que preparam: usa lista completa da classe (availableSpells)
    const spellsToUse = character.characterClass === 'Mago'
        ? (character.spellcasting?.knownSpells || [])
        : availableSpells;

    console.log('[PreparedSpells] Spells to use:', spellsToUse.length);
    console.log('[PreparedSpells] Local spell details available:', Object.keys(localSpellDetails).length);

    const preparableSpells = filterPreparableSpells(spellsToUse, localSpellDetails);
    console.log('[PreparedSpells] Preparable spells (level > 0):', preparableSpells.length);

    // Agrupar magias por nível
    const groupedSpells = preparableSpells.reduce((acc: Record<number, string[]>, spellIndex) => {
        const detail = localSpellDetails[spellIndex];
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
        // Se já está salvo, não permite desmarcar (apenas visualizar)
        if (!hasChanges && preparedSpells.includes(spellIndex)) {
            setSelectedSpell(spellIndex);
            return;
        }

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
            setShowOnlyPrepared(true); // Mostrar apenas preparadas após salvar
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
        setShowOnlyPrepared(false);
        toast.info("Magias despreparadas. Clique em 'Salvar' para confirmar.");
    };

    const hasChanges =
        JSON.stringify(preparedSpells.sort()) !==
        JSON.stringify((character.preparedSpells || character.prepared_spells || []).sort());

    // Filtrar magias para exibição
    const spellsToDisplay = showOnlyPrepared
        ? Object.keys(groupedSpells).reduce((acc: Record<number, string[]>, level) => {
            const levelNum = Number(level);
            const prepared = groupedSpells[levelNum].filter((spell) =>
                preparedSpells.includes(spell)
            );
            if (prepared.length > 0) {
                acc[levelNum] = prepared;
            }
            return acc;
        }, {})
        : groupedSpells;

    const selectedSpellDetail = selectedSpell ? localSpellDetails[selectedSpell] : null;

    return (
        <>
            <Card className="bg-card/60 border-white/10 mb-6">
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

                    {/* Botões de ação */}
                    <div className="flex gap-2">
                        {!editMode && !hasChanges ? (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setEditMode(true);
                                    toast.info("Modo de edição ativado. Selecione suas magias e clique em 'Salvar'.");
                                }}
                            >
                                {preparedSpells.length > 0 ? "Editar Magias" : "Preparar Magias"}
                            </Button>
                        ) : (editMode || hasChanges) ? (
                            <>
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => {
                                        handleSave();
                                        setEditMode(false);
                                    }}
                                    disabled={saving || preparedSpells.length !== maxPrepared}
                                >
                                    {saving ? "Salvando..." : "Salvar"}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setPreparedSpells(character.preparedSpells || character.prepared_spells || []);
                                        setEditMode(false);
                                        toast.info("Alterações canceladas");
                                    }}
                                >
                                    Cancelar
                                </Button>
                            </>
                        ) : null}
                    </div>

                    {/* Toggle para mostrar apenas preparadas */}
                    {preparedSpells.length > 0 && !hasChanges && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowOnlyPrepared(!showOnlyPrepared)}
                            className="w-full border-primary/30"
                        >
                            {showOnlyPrepared ? (
                                <>
                                    <Eye className="w-4 h-4 mr-2" />
                                    Mostrar Todas as Magias
                                </>
                            ) : (
                                <>
                                    <EyeOff className="w-4 h-4 mr-2" />
                                    Mostrar Apenas Preparadas
                                </>
                            )}
                        </Button>
                    )}

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

                    {/* Alerta se não preparou todas as magias */}
                    {preparedSpells.length > 0 && preparedSpells.length < maxPrepared && hasChanges && (
                        <div className="bg-orange-500/10 rounded-lg p-3 border border-orange-500/20 flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-sm font-semibold text-orange-500">
                                    Você deve preparar todas as {maxPrepared} magias!
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Atualmente: {preparedSpells.length} / {maxPrepared} preparadas. Selecione mais {maxPrepared - preparedSpells.length} magia(s).
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Lista de Magias por Nível */}
                    {loadingSpells ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                            <p className="text-muted-foreground">Carregando magias disponíveis...</p>
                            <p className="text-xs text-muted-foreground mt-1">Buscando lista completa de magias de {character.characterClass}</p>
                        </div>
                    ) : preparableSpells.length === 0 ? (
                        <div className="text-center py-4">
                            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
                            <p className="text-muted-foreground">
                                {character.characterClass === 'Mago'
                                    ? 'Você ainda não tem magias no seu grimório.'
                                    : 'Nenhuma magia disponível para preparar.'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                                {character.characterClass === 'Mago'
                                    ? 'Adicione magias ao grimório na seção "Magias Conhecidas"'
                                    : 'Verifique se você tem slots de magia disponíveis'}
                            </p>
                        </div>
                    ) : Object.keys(spellsToDisplay).length === 0 && showOnlyPrepared ? (
                        <p className="text-muted-foreground text-center py-4">
                            Nenhuma magia preparada ainda.
                        </p>
                    ) : (
                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                            {Object.keys(spellsToDisplay)
                                .map(Number)
                                .sort((a, b) => a - b)
                                .map((level) => (
                                    <div key={level} className="space-y-2">
                                        <h4 className="font-semibold text-sm text-primary">{level}º Nível</h4>
                                        <div className="space-y-2">
                                            {spellsToDisplay[level].map((spellIndex) => {
                                                const detail = localSpellDetails[spellIndex];
                                                const isPrepared = preparedSpells.includes(spellIndex);
                                                const isSaved = !hasChanges && !editMode;

                                                return (
                                                    <div
                                                        key={spellIndex}
                                                        className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${isPrepared
                                                            ? "bg-primary/10 border-primary/30"
                                                            : "bg-card/40 border-white/5 hover:border-white/10"
                                                            } ${!isSaved ? "cursor-pointer hover:bg-primary/5" : ""} ${isSaved && isPrepared ? "cursor-pointer hover:bg-primary/20" : ""}`}
                                                        onClick={() => {
                                                            if (isSaved && isPrepared) {
                                                                // Modo visualização: abrir detalhes
                                                                setSelectedSpell(spellIndex);
                                                            } else if (!isSaved) {
                                                                // Modo edição: toggle seleção
                                                                handleToggleSpell(spellIndex);
                                                            }
                                                        }}
                                                    >
                                                        {!isSaved && (
                                                            <Checkbox
                                                                id={spellIndex}
                                                                checked={isPrepared}
                                                                onCheckedChange={() => handleToggleSpell(spellIndex)}
                                                                className="mt-1"
                                                            />
                                                        )}
                                                        <div className="flex-1 space-y-1">
                                                            <div className="flex items-center justify-between">
                                                                <span className="font-medium">
                                                                    {detail ? (detail.namePT || detail.name) : spellIndex}
                                                                </span>
                                                                {isPrepared && (
                                                                    <CheckCircle2 className="w-4 h-4 text-primary" />
                                                                )}
                                                            </div>
                                                            {detail && !isSaved && (
                                                                <div className="text-xs text-muted-foreground space-y-0.5">
                                                                    {detail.school && (
                                                                        <p>
                                                                            <strong>Escola:</strong> {translateDnd5e(detail.school.name)}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
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
                            {hasChanges && (
                                <Button
                                    onClick={handleSave}
                                    disabled={saving || preparedSpells.length < maxPrepared}
                                    className="flex-1 bg-primary hover:bg-primary/90"
                                >
                                    {saving ? "Salvando..." : "Salvar Preparação"}
                                </Button>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Modal de Detalhes da Magia */}
            <Dialog open={!!selectedSpell} onOpenChange={() => setSelectedSpell(null)}>
                <DialogContent className="max-w-2xl max-h-[90vh] bg-card border-white/10">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-cinzel text-primary flex items-center gap-2">
                            <Sparkles className="w-6 h-6" />
                            {selectedSpellDetail ? (selectedSpellDetail.namePT || selectedSpellDetail.name) : ""}
                        </DialogTitle>
                    </DialogHeader>
                    {selectedSpellDetail && (
                        <div className="space-y-4 overflow-y-auto pr-2" style={{ maxHeight: 'calc(90vh - 120px)' }}>
                            <div className="bg-primary/5 p-3 rounded-md border border-primary/20 mb-4">
                                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                                    {selectedSpellDetail.descriptionPT || selectedSpellDetail.description}
                                </p>
                                {!selectedSpellDetail.descriptionPT && (
                                    <p className="text-xs text-yellow-500 mt-2 italic">
                                        ⚠️ Tradução de descrição não disponível
                                    </p>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase">Nível</p>
                                    <p className="font-semibold">{selectedSpellDetail.level}º Nível</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase">Escola</p>
                                    <p className="font-semibold">
                                        {translateDnd5e(selectedSpellDetail.school)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase">Tempo de Conjuração</p>
                                    <p className="font-semibold">
                                        {translateDnd5e(selectedSpellDetail.casting_time || "")}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase">Alcance</p>
                                    <p className="font-semibold">{translateDnd5e(selectedSpellDetail.range || "")}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase">Componentes</p>
                                    <p className="font-semibold">
                                        {selectedSpellDetail.components?.join(", ") || ""}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase">Duração</p>
                                    <p className="font-semibold">
                                        {translateDnd5e(selectedSpellDetail.duration || "")}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs text-muted-foreground uppercase mb-2">Descrição</p>
                                <div className="space-y-2 text-sm">
                                    {selectedSpellDetail.desc?.map((paragraph: string, index: number) => (
                                        <p key={index}>{translateDnd5e(paragraph)}</p>
                                    ))}
                                </div>
                            </div>

                            {selectedSpellDetail.higher_level && selectedSpellDetail.higher_level.length > 0 && (
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase mb-2">Em Níveis Superiores</p>
                                    <div className="space-y-2 text-sm">
                                        {selectedSpellDetail.higher_level.map((paragraph: string, index: number) => (
                                            <p key={index}>{translateDnd5e(paragraph)}</p>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
