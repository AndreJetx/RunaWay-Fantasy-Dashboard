import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Swords, Dices, ArrowDownZA, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";

export interface Combatant {
    id: string;
    name: string;
    initiative: number;
    dexterityModifier: number;
    totalInitiative: number; // Novo campo
    type: "player" | "npc" | "enemy";
    image?: string | null;
    isDead?: boolean;
    damageTaken?: number;
}

interface InitiativeTrackerProps {
    combatants: Combatant[];
    onUpdateInitiative: (id: string, value: number) => void;
    onSort: () => void;
    onRollNPCs: () => void;
    onRemove?: (id: string) => void;
    currentTurnId?: string;
    onNextTurn: () => void;
}

export function InitiativeTracker({
    combatants,
    onUpdateInitiative,
    onSort,
    onRollNPCs,
    onRemove,
    currentTurnId,
    onNextTurn,
}: InitiativeTrackerProps) {
    return (
        <div className="w-80 bg-black/80 border-l border-white/10 flex flex-col h-full backdrop-blur-sm">
            <div className="p-4 border-b border-white/10">
                <h3 className="text-lg font-cinzel font-bold flex items-center gap-2 mb-4">
                    <Swords className="w-5 h-5 text-primary" />
                    Ordem de Combate
                </h3>

                <div className="flex gap-2 mb-2">
                    <Button
                        size="sm"
                        variant="secondary"
                        className="flex-1 text-xs"
                        onClick={onRollNPCs}
                    >
                        <Dices className="w-3 h-3 mr-1" />
                        Rolar NPCs
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs"
                        onClick={onSort}
                    >
                        <ArrowDownZA className="w-3 h-3 mr-1" />
                        Ordenar
                    </Button>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="space-y-3 p-4 overflow-visible">
                    {combatants.map((combatant, index) => (
                        <div
                            key={combatant.id}
                            className={`flex items-center gap-3 p-2 rounded-lg border-2 transition-all mx-2 ${currentTurnId === combatant.id
                                ? "bg-primary/25 border-primary shadow-[0_0_15px_rgba(212,175,55,0.4)] scale-[1.03] z-10"
                                : combatant.isDead
                                    ? "bg-red-950/20 border-red-500/30 opacity-60 grayscale"
                                    : "bg-card/40 border-white/5 hover:bg-card/60"
                                }`}
                        >
                            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/20 shrink-0">
                                {combatant.image ? (
                                    <Image src={combatant.image} alt={combatant.name} fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-muted flex items-center justify-center text-xs font-bold">
                                        {combatant.name.charAt(0)}
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-sm truncate">{combatant.name}</span>
                                    {combatant.type === "enemy" && (
                                        <Badge variant="outline" className="text-[10px] h-4 px-1 border-red-500/50 text-red-400">Inimigo</Badge>
                                    )}
                                    {combatant.isDead && (
                                        <Badge variant="destructive" className="text-[10px] h-4 px-1 bg-red-600 animate-pulse">MORTO</Badge>
                                    )}
                                </div>
                                <div className="text-xs text-muted-foreground flex items-center gap-2">
                                    <span>Mod: {combatant.dexterityModifier >= 0 ? "+" : ""}{combatant.dexterityModifier}</span>
                                    <span className="font-bold text-primary">I: {combatant.totalInitiative}</span>
                                    {(combatant.damageTaken ?? 0) > 0 && (
                                        <span className="text-red-400 font-bold ml-1">D: {combatant.damageTaken}</span>
                                    )}
                                </div>
                            </div>

                            <div className="w-16 flex items-center gap-1">
                                <Input
                                    type="number"
                                    value={combatant.initiative}
                                    placeholder="d20"
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        onUpdateInitiative(combatant.id, isNaN(val) ? 0 : val);
                                    }}
                                    className="h-8 text-center font-bold px-1"
                                />
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                    onClick={() => onRemove && onRemove(combatant.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))}

                    {combatants.length === 0 && (
                        <div className="text-center text-muted-foreground text-sm py-4">
                            Adicione combatentes ao mapa
                        </div>
                    )}
                </div>
            </ScrollArea>

            <div className="p-4 border-t border-white/10">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" onClick={onNextTurn}>
                    Próximo Turno
                </Button>
            </div>
        </div>
    );
}
