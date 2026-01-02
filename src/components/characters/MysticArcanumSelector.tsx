"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Sparkles, CheckCircle2 } from "lucide-react";
import { getSpellsByClass, getSpellDetails } from "@/lib/data/spell-data";

interface Spell {
    index: string;
    name: string;
    namePT?: string;
    level: number;
    school?: string;
    concentration?: boolean;
    ritual?: boolean;
    desc?: string[];
    descriptionPT?: string;
}

interface MysticArcanumSelectorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (spellIndex: string) => void;
    spellLevel: number; // 6, 7, 8, or 9
    currentSelection?: string;
}

export function MysticArcanumSelector({
    open,
    onOpenChange,
    onSelect,
    spellLevel,
    currentSelection,
}: MysticArcanumSelectorProps) {
    const [selectedSpell, setSelectedSpell] = useState<string>(currentSelection || "");
    const [searchQuery, setSearchQuery] = useState("");
    const [spells, setSpells] = useState<Spell[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (open) {
            setSelectedSpell(currentSelection || "");
            fetchSpells();
        }
    }, [open, currentSelection, spellLevel]);

    const fetchSpells = async () => {
        try {
            setLoading(true);
            // Get all Warlock spell indices
            const warlockSpellIndices = await getSpellsByClass("Warlock");

            // Get full spell details for each index
            const allSpells = await Promise.all(
                warlockSpellIndices.map(async (index: string) => {
                    const details = await getSpellDetails(index);
                    return details;
                })
            );

            // Filter by spell level and remove nulls
            const filteredByLevel: Spell[] = allSpells
                .filter((s): s is any => s !== null && s.level === spellLevel);

            setSpells(filteredByLevel);
        } catch (error) {
            console.error("Error fetching Mystic Arcanum spells:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredSpells = spells.filter((spell) => {
        const matchesSearch =
            spell.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            spell.index.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    const handleConfirm = () => {
        if (selectedSpell) {
            onSelect(selectedSpell);
            onOpenChange(false);
        }
    };

    const getLevelName = (level: number): string => {
        const names: Record<number, string> = {
            6: "6º Nível",
            7: "7º Nível",
            8: "8º Nível",
            9: "9º Nível",
        };
        return names[level] || `${level}º Nível`;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 font-cinzel text-2xl">
                        <Sparkles className="w-6 h-6 text-purple-400" />
                        Mystic Arcanum - {getLevelName(spellLevel)}
                    </DialogTitle>
                    <DialogDescription>
                        Escolha uma magia de {getLevelName(spellLevel).toLowerCase()} da lista de Bruxo. Esta magia pode ser conjurada uma vez por descanso longo sem gastar espaço de magia.
                    </DialogDescription>
                </DialogHeader>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                        placeholder="Buscar magias..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Selection Counter */}
                <div className="flex items-center justify-between px-1">
                    <p className="text-sm text-muted-foreground">
                        {selectedSpell ? "1 magia selecionada" : "Nenhuma magia selecionada"}
                    </p>
                    {selectedSpell && (
                        <Badge variant="secondary">
                            {spells.find(s => s.index === selectedSpell)?.namePT || spells.find(s => s.index === selectedSpell)?.name}
                        </Badge>
                    )}
                </div>

                {/* Spells List */}
                <ScrollArea className="h-[500px] pr-4">
                    {loading ? (
                        <div className="flex items-center justify-center h-32">
                            <p className="text-muted-foreground">Carregando magias...</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredSpells.map((spell) => {
                                const isSelected = selectedSpell === spell.index;

                                return (
                                    <div
                                        key={spell.index}
                                        onClick={() => setSelectedSpell(spell.index)}
                                        className={`
                      p-4 rounded-lg border-2 transition-all cursor-pointer
                      ${isSelected
                                                ? "border-purple-500 bg-purple-500/10"
                                                : "border-border hover:border-purple-400 hover:bg-purple-400/5"
                                            }
                    `}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 space-y-2">
                                                {/* Title */}
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="font-semibold text-lg">{spell.namePT || spell.name}</h3>
                                                    <Badge variant="outline" className="text-xs">
                                                        Nível {spell.level}
                                                    </Badge>
                                                    {spell.concentration && (
                                                        <Badge variant="outline" className="text-xs">
                                                            Concentração
                                                        </Badge>
                                                    )}
                                                    {spell.ritual && (
                                                        <Badge variant="outline" className="text-xs">
                                                            Ritual
                                                        </Badge>
                                                    )}
                                                </div>

                                                {/* School */}
                                                {spell.school && (
                                                    <p className="text-sm text-muted-foreground">
                                                        Escola: {spell.school}
                                                    </p>
                                                )}

                                                {/* Description */}
                                                {(spell.descriptionPT || (spell.desc && spell.desc.length > 0)) && (
                                                    <p className="text-sm leading-relaxed line-clamp-3">
                                                        {spell.descriptionPT || (spell.desc && spell.desc[0])}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Selection Indicator */}
                                            {isSelected && (
                                                <div className="flex-shrink-0">
                                                    <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                                                        <CheckCircle2 className="w-4 h-4 text-white" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </ScrollArea>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={!selectedSpell}
                        className="bg-purple-600 hover:bg-purple-700"
                    >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Confirmar Seleção
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
