"use client";

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Clock, Target, Shield, Zap, Activity } from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";

interface SpellDetailDialogProps {
    isOpen: boolean;
    onClose: () => void;
    spell: any | null;
}

export function SpellDetailDialog({
    isOpen,
    onClose,
    spell,
}: SpellDetailDialogProps) {
    const { translateSpell, translateDnd5e } = useTranslation();

    if (!spell) return null;

    // Normalizar a descrição - pode vir como string (description) ou array (desc)
    const description = spell.descriptionPT || spell.description || (Array.isArray(spell.desc) ? spell.desc.join('\n\n') : spell.desc);
    const higherLevel = spell.higherLevel || (Array.isArray(spell.higher_level) ? spell.higher_level.join('\n\n') : spell.higher_level);

    // Formatar componentes
    const components = Array.isArray(spell.components)
        ? spell.components.map((c: string) => translateDnd5e(c)).join(", ")
        : (spell.components || "");

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] bg-gradient-to-br from-background via-background to-primary/5 border-primary/20 overflow-hidden flex flex-col p-0">
                <DialogHeader className="p-6 pb-2">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                            <Sparkles className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1 space-y-1">
                            <DialogTitle className="text-3xl font-cinzel text-primary leading-tight">
                                {spell.namePT || translateSpell(spell.name) || spell.name}
                            </DialogTitle>
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30">
                                    {spell.level === 0 ? "Truque" : `${spell.level}º Nível`}
                                </Badge>
                                <Badge variant="outline" className="bg-background/50 text-muted-foreground border-border">
                                    {translateDnd5e(spell.school?.name || spell.school)}
                                </Badge>
                                {spell.ritual && (
                                    <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                                        Ritual
                                    </Badge>
                                )}
                                {spell.concentration && (
                                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
                                        Concentração
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-1 p-6 pt-2">
                    <div className="space-y-6">
                        {/* Grade de Atributos da Magia */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="bg-card/40 p-3 rounded-lg border border-border/50">
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase font-semibold mb-1">
                                    <Clock className="w-3 h-3" />
                                    Conjuração
                                </div>
                                <p className="text-sm font-medium">{translateDnd5e(spell.casting_time || spell.castingTime || "")}</p>
                            </div>
                            <div className="bg-card/40 p-3 rounded-lg border border-border/50">
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase font-semibold mb-1">
                                    <Target className="w-3 h-3" />
                                    Alcance
                                </div>
                                <p className="text-sm font-medium">{translateDnd5e(spell.range || "")}</p>
                            </div>
                            <div className="bg-card/40 p-3 rounded-lg border border-border/50">
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase font-semibold mb-1">
                                    <Activity className="w-3 h-3" />
                                    Duração
                                </div>
                                <p className="text-sm font-medium">{translateDnd5e(spell.duration || "")}</p>
                            </div>
                            <div className="bg-card/40 p-3 rounded-lg border border-border/50">
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase font-semibold mb-1">
                                    <Zap className="w-3 h-3" />
                                    Componentes
                                </div>
                                <p className="text-sm font-medium">{components}</p>
                            </div>
                        </div>

                        {spell.material && (
                            <div className="bg-secondary/10 p-3 rounded-lg border border-secondary/20 block">
                                <p className="text-xs text-muted-foreground italic">
                                    <strong>Material:</strong> {spell.material}
                                </p>
                            </div>
                        )}

                        {/* Descrição Principal */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-primary uppercase tracking-wider">Descrição</h4>
                            <div className="text-foreground leading-relaxed whitespace-pre-wrap space-y-4">
                                {Array.isArray(spell.desc) ? (
                                    spell.desc.map((p: string, i: number) => (
                                        <p key={i} className="text-base text-muted-foreground">{p}</p>
                                    ))
                                ) : (
                                    <p className="text-base text-muted-foreground">{description}</p>
                                )}
                            </div>
                        </div>

                        {/* Níveis Superiores */}
                        {higherLevel && (
                            <div className="bg-primary/5 rounded-xl p-4 border border-primary/10 space-y-2">
                                <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" />
                                    Em Níveis Superiores
                                </h4>
                                <p className="text-sm text-muted-foreground leading-relaxed italic">
                                    {higherLevel}
                                </p>
                            </div>
                        )}

                        {/* Dano / DC se disponível */}
                        {(spell.damage || spell.dc) && (
                            <div className="border-t border-border/50 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {spell.damage && (
                                    <div className="space-y-1">
                                        <p className="text-xs font-semibold text-muted-foreground uppercase">Dano/Efeito</p>
                                        <p className="font-mono text-primary">
                                            {spell.damage.damage_at_character_level
                                                ? "Escala com nível"
                                                : spell.damage.damage_at_slot_level
                                                    ? "Escala com slot"
                                                    : "Fixo"}
                                        </p>
                                    </div>
                                )}
                                {spell.dc && (
                                    <div className="space-y-1">
                                        <p className="text-xs font-semibold text-muted-foreground uppercase">Teste de Resistência</p>
                                        <p className="font-medium">
                                            {translateDnd5e(spell.dc.dc_type?.name || "")}
                                            {spell.dc.dc_success && ` (${translateDnd5e(spell.dc.dc_success)})`}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </ScrollArea>

                <div className="p-4 border-t border-border/50 bg-background/50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-primary/10 hover:bg-primary/20 text-primary font-cinzel rounded-md transition-colors border border-primary/20"
                    >
                        Fechar
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
