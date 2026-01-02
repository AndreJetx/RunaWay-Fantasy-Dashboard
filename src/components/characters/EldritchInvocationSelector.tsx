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
import { Search, Sparkles, Lock, CheckCircle2 } from "lucide-react";
import { type EldritchInvocation, ELDRITCH_INVOCATIONS, meetsInvocationPrerequisites } from "@/lib/eldritch-invocations";

interface EldritchInvocationSelectorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (invocations: string[]) => void;
    currentInvocations: string[];
    maxInvocations: number;
    characterLevel: number;
    pactBoon?: string;
    knownSpells?: string[];
}

export function EldritchInvocationSelector({
    open,
    onOpenChange,
    onSelect,
    currentInvocations,
    maxInvocations,
    characterLevel,
    pactBoon,
    knownSpells = [],
}: EldritchInvocationSelectorProps) {
    const [selectedInvocations, setSelectedInvocations] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    // Initialize with current invocations
    useEffect(() => {
        if (open) {
            setSelectedInvocations([...currentInvocations]);
        }
    }, [open, currentInvocations]);

    const filteredInvocations = ELDRITCH_INVOCATIONS.filter((inv) => {
        const matchesSearch =
            inv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inv.nameEN.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inv.description.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesSearch;
    });

    const toggleInvocation = (invocationId: string) => {
        if (currentInvocations.includes(invocationId)) {
            // Can't deselect already learned invocations
            return;
        }

        if (selectedInvocations.includes(invocationId)) {
            setSelectedInvocations(selectedInvocations.filter((id) => id !== invocationId));
        } else {
            if (selectedInvocations.length < maxInvocations) {
                setSelectedInvocations([...selectedInvocations, invocationId]);
            }
        }
    };

    const handleConfirm = () => {
        onSelect(selectedInvocations);
        onOpenChange(false);
    };

    const canSelect = selectedInvocations.length === maxInvocations;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 font-cinzel text-2xl">
                        <Sparkles className="w-6 h-6 text-purple-400" />
                        Invocações Arcanas
                    </DialogTitle>
                    <DialogDescription>
                        Selecione {maxInvocations - currentInvocations.length} invocação(ões).
                        {currentInvocations.length > 0 && ` Você já possui ${currentInvocations.length} invocação(ões).`}
                    </DialogDescription>
                </DialogHeader>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                        placeholder="Buscar invocações..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Selection Counter */}
                <div className="flex items-center justify-between px-1">
                    <p className="text-sm text-muted-foreground">
                        {selectedInvocations.length} / {maxInvocations} selecionadas
                    </p>
                    {!canSelect && (
                        <p className="text-sm text-amber-500">
                            Selecione mais {maxInvocations - selectedInvocations.length}
                        </p>
                    )}
                </div>

                {/* Invocations List */}
                <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-3">
                        {filteredInvocations.map((invocation) => {
                            const isSelected = selectedInvocations.includes(invocation.id);
                            const isAlreadyLearned = currentInvocations.includes(invocation.id);
                            const meetsPrereqs = meetsInvocationPrerequisites(
                                invocation,
                                characterLevel,
                                pactBoon,
                                knownSpells
                            );
                            const cannotSelect = !meetsPrereqs || isAlreadyLearned;

                            return (
                                <div
                                    key={invocation.id}
                                    onClick={() => !cannotSelect && toggleInvocation(invocation.id)}
                                    className={`
                    p-4 rounded-lg border-2 transition-all cursor-pointer
                    ${isSelected
                                            ? "border-purple-500 bg-purple-500/10"
                                            : cannotSelect
                                                ? "border-muted bg-muted/30 cursor-not-allowed opacity-60"
                                                : "border-border hover:border-purple-400 hover:bg-purple-400/5"
                                        }
                  `}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 space-y-2">
                                            {/* Title */}
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-lg">{invocation.name}</h3>
                                                {isAlreadyLearned && (
                                                    <Badge variant="secondary" className="gap-1">
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        Aprendida
                                                    </Badge>
                                                )}
                                                {!meetsPrereqs && !isAlreadyLearned && (
                                                    <Badge variant="destructive" className="gap-1">
                                                        <Lock className="w-3 h-3" />
                                                        Bloqueada
                                                    </Badge>
                                                )}
                                            </div>

                                            {/* English Name */}
                                            <p className="text-sm text-muted-foreground italic">
                                                {invocation.nameEN}
                                            </p>

                                            {/* Prerequisites */}
                                            {invocation.prerequisites && (
                                                <div className="flex flex-wrap gap-2">
                                                    {invocation.prerequisites.level && (
                                                        <Badge variant="outline" className="text-xs">
                                                            Nível {invocation.prerequisites.level}+
                                                        </Badge>
                                                    )}
                                                    {invocation.prerequisites.pact && (
                                                        <Badge variant="outline" className="text-xs">
                                                            Pacto: {invocation.prerequisites.pact}
                                                        </Badge>
                                                    )}
                                                    {invocation.prerequisites.spell && (
                                                        <Badge variant="outline" className="text-xs">
                                                            Requer: eldritch blast
                                                        </Badge>
                                                    )}
                                                </div>
                                            )}

                                            {/* Description */}
                                            <p className="text-sm leading-relaxed">
                                                {invocation.description}
                                            </p>
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
                </ScrollArea>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={!canSelect}
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
