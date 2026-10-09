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
import { Search, BookOpen, CheckCircle2 } from "lucide-react";
import { getSpellsFromAllClasses, getSpellDetails } from "@/lib/data/spell-data";

interface Spell {
    index: string;
    name: string;
    level: number;
    school?: string;
    classes?: string[];
}

interface BookOfShadowsSelectorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (cantrips: string[]) => void;
    currentCantrips: string[];
    characterLevel: number;
}

export function BookOfShadowsSelector({
    open,
    onOpenChange,
    onSelect,
    currentCantrips,
    characterLevel,
}: BookOfShadowsSelectorProps) {
    const [selectedCantrips, setSelectedCantrips] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [allCantrips, setAllCantrips] = useState<Spell[]>([]);
    const [loading, setLoading] = useState(true);

    // Initialize with current cantrips
    useEffect(() => {
        if (open) {
            setSelectedCantrips([...currentCantrips]);
            fetchAllCantrips();
        }
    }, [open, currentCantrips]);

    const fetchAllCantrips = async () => {
        try {
            setLoading(true);
            // Get all spell IDs
            const allSpellIds = getSpellsFromAllClasses();

            // Map IDs to full spell objects and filter for cantrips (level 0)
            const cantripsOnly = allSpellIds
                .map(id => getSpellDetails(id))
                .filter((spell): spell is any => spell !== null && spell.level === 0)
                .map(spell => ({
                    index: spell.index,
                    name: spell.name,
                    level: spell.level,
                    school: spell.school,
                    classes: spell.classes
                }));

            setAllCantrips(cantripsOnly);
        } catch (error) {
            console.error("Error fetching cantrips:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCantrips = allCantrips.filter((spell) => {
        const matchesSearch =
            spell.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            spell.index.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    const toggleCantrip = (spellIndex: string) => {
        if (currentCantrips.includes(spellIndex)) {
            // Can't deselect already learned cantrips
            return;
        }

        if (selectedCantrips.includes(spellIndex)) {
            setSelectedCantrips(selectedCantrips.filter((id) => id !== spellIndex));
        } else {
            if (selectedCantrips.length < 3) {
                setSelectedCantrips([...selectedCantrips, spellIndex]);
            }
        }
    };

    const handleConfirm = () => {
        onSelect(selectedCantrips);
        onOpenChange(false);
    };

    const canConfirm = selectedCantrips.length === 3;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 font-cinzel text-2xl">
                        <BookOpen className="w-6 h-6 text-purple-400" />
                        Livro das Sombras - Escolha 3 Truques
                    </DialogTitle>
                    <DialogDescription>
                        Escolha 3 truques de qualquer classe. Eles não contam contra seu número de truques conhecidos.
                    </DialogDescription>
                </DialogHeader>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                        placeholder="Buscar truques..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Selection Counter */}
                <div className="flex items-center justify-between px-1">
                    <p className="text-sm text-muted-foreground">
                        {selectedCantrips.length} / 3 selecionados
                    </p>
                    {!canConfirm && (
                        <p className="text-sm text-amber-500">
                            Selecione mais {3 - selectedCantrips.length}
                        </p>
                    )}
                </div>

                {/* Cantrips List */}
                <ScrollArea className="h-[500px] pr-4">
                    {loading ? (
                        <div className="flex items-center justify-center h-32">
                            <p className="text-muted-foreground">Carregando truques...</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredCantrips.map((spell) => {
                                const isSelected = selectedCantrips.includes(spell.index);
                                const isAlreadyLearned = currentCantrips.includes(spell.index);

                                return (
                                    <div
                                        key={spell.index}
                                        onClick={() => !isAlreadyLearned && toggleCantrip(spell.index)}
                                        className={`
                      p-4 rounded-lg border-2 transition-all cursor-pointer
                      ${isSelected
                                                ? "border-purple-500 bg-purple-500/10"
                                                : isAlreadyLearned
                                                    ? "border-muted bg-muted/30 cursor-not-allowed opacity-60"
                                                    : "border-border hover:border-purple-400 hover:bg-purple-400/5"
                                            }
                    `}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 space-y-2">
                                                {/* Title */}
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold text-lg">{spell.name}</h3>
                                                    {isAlreadyLearned && (
                                                        <Badge variant="secondary" className="gap-1">
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            Já Selecionado
                                                        </Badge>
                                                    )}
                                                </div>

                                                {/* Classes */}
                                                {spell.classes && spell.classes.length > 0 && (
                                                    <div className="flex flex-wrap gap-2">
                                                        {spell.classes.map((className) => (
                                                            <Badge key={className} variant="outline" className="text-xs">
                                                                {className}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* School */}
                                                {spell.school && (
                                                    <p className="text-sm text-muted-foreground">
                                                        Escola: {spell.school}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Selection Indicator */}
                                            {isSelected && !isAlreadyLearned && (
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
                        disabled={!canConfirm}
                        className="bg-purple-600 hover:bg-purple-700"
                    >
                        <BookOpen className="w-4 h-4 mr-2" />
                        Confirmar Seleção
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
