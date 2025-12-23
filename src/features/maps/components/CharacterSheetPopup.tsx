import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { rollAttack, rollDamage } from "@/lib/dice-helper";

interface CharacterData {
    id: string;
    name: string;
    image?: string | null;
    race?: string | null;
    class?: string | null;
    hp?: { current: number; max: number; temp?: number };
    stats?: {
        hp: { current: number; max: number; temp?: number };
        ac: number;
        speed: number;
        attributes: Record<string, number>;
        attacks?: Array<{
            name: string;
            bonus: number;
            damage: string;
            type: string;
            description: string;
        }>;
    };
    ac?: number;
    speed?: number;
    attributes?: Record<string, number>;
    attacks?: Array<{
        name: string;
        bonus: number;
        damage: string;
        type: string;
        description: string;
    }>;
    characterClass?: string; // Alternativa para class
    // Pode ser estendido com mais dados reais da ficha
}

interface CharacterSheetPopupProps {
    isOpen: boolean;
    onClose: () => void;
    character: CharacterData | null;
}

export function CharacterSheetPopup({
    isOpen,
    onClose,
    character,
}: CharacterSheetPopupProps) {
    if (!character) return null;

    // Normalização dos dados (pode vir direto ou dentro de stats)
    const stats = character.stats || {
        hp: character.hp || { current: 10, max: 10 },
        ac: character.ac || 10,
        speed: character.speed || 30,
        attributes: character.attributes || {}
    };

    const hp = stats.hp || { current: 10, max: 10 };
    const ac = stats.ac || 10;
    const speed = stats.speed || 30;
    const attributes = stats.attributes || {};
    const className = character.class || character.characterClass || "Desconhecido";

    // Calculador de modificador
    const getMod = (score: number) => Math.floor((score - 10) / 2);
    const formatMod = (mod: number) => (mod >= 0 ? `+${mod}` : `${mod}`);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="fixed right-20 top-20 z-50 w-[400px] shadow-2xl pointer-events-none" // pointer-events-none no wrapper para não bloquear
                >
                    {/* Card interno com pointer-events-auto */}
                    <Card className="bg-black/90 border border-primary/30 backdrop-blur-md pointer-events-auto overflow-hidden flex flex-col max-h-[80vh]">
                        <div className="flex items-center justify-between p-3 border-b border-white/10 bg-primary/10 cursor-move" id="sheet-drag-handle">
                            <h3 className="font-cinzel font-bold text-lg text-primary truncate">{character.name}</h3>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-4">
                                {/* Header: Imagem e Status básico */}
                                <div className="flex gap-4">
                                    <div className="relative w-20 h-20 rounded-md overflow-hidden border border-white/20 shrink-0">
                                        {character.image ? (
                                            <Image src={character.image} alt={character.name} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-muted" />
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <p className="text-sm text-muted-foreground">{character.race} {className}</p>
                                        <div className="flex justify-between text-center gap-2">
                                            <div className="bg-card/50 p-1 rounded border border-white/5 flex-1">
                                                <span className="text-[10px] text-muted-foreground block uppercase">CA</span>
                                                <span className="font-bold text-lg text-white">{ac}</span>
                                            </div>
                                            <div className="bg-card/50 p-1 rounded border border-white/5 flex-1">
                                                <span className="text-[10px] text-muted-foreground block uppercase">HP</span>
                                                <span className="font-bold text-lg text-green-400">{hp.current}</span>
                                                <span className="text-[10px] text-muted-foreground">/{hp.max}</span>
                                            </div>
                                            <div className="bg-card/50 p-1 rounded border border-white/5 flex-1">
                                                <span className="text-[10px] text-muted-foreground block uppercase">Desl.</span>
                                                <span className="font-bold text-lg text-white">{speed}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Atributos */}
                                <div className="grid grid-cols-6 gap-1">
                                    {Object.entries(attributes).map(([attr, score]) => (
                                        <div key={attr} className="flex flex-col items-center bg-card/30 p-1 rounded">
                                            <span className="text-[9px] uppercase font-bold text-muted-foreground">{attr.slice(0, 3)}</span>
                                            <span className="text-sm font-bold">{getMod(score)}</span>
                                            <span className="text-[9px] text-muted-foreground">{score}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Ataques/Ações - Excluisivo para Inimigos/NPCs que possuem attacks */}
                                {character.attacks && character.attacks.length > 0 && (
                                    <div className="space-y-3">
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1">
                                            <Swords className="w-3 h-3" /> Ações de Ataque
                                        </p>
                                        <div className="space-y-2">
                                            {character.attacks.map((attack, idx) => (
                                                <div key={`${attack.name}-${idx}`} className="p-3 rounded bg-white/5 border border-white/5 space-y-2 hover:bg-white/10 transition-colors">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="text-primary/90 font-bold text-xs">{attack.name}</p>
                                                            <p className="text-[10px] text-muted-foreground italic">{attack.type}</p>
                                                        </div>
                                                        <div className="flex gap-1">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-7 text-[10px] px-2 bg-primary/10 border-primary/30 hover:bg-primary/20"
                                                                onClick={() => rollAttack(attack.name, attack.bonus)}
                                                            >
                                                                Acerto ({formatMod(attack.bonus)})
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-7 text-[10px] px-2 bg-red-500/10 border-red-500/30 hover:bg-red-500/20"
                                                                onClick={() => rollDamage(attack.name, attack.damage, attack.type)}
                                                            >
                                                                Dano ({attack.damage})
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    {attack.description && (
                                                        <p className="text-[10px] text-white/50 leading-tight border-t border-white/5 pt-1 mt-1">
                                                            {attack.description}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Simulação de conteúdo extra (ataques, skills) */}
                                <div className="bg-card/20 p-3 rounded text-sm text-muted-foreground text-center italic">
                                    Detalhes completos da ficha seriam renderizados aqui (Ataques, Habilidades, Inventário).
                                    Para esta versão, foca-se nos status vitais do combate.
                                </div>
                            </div>
                        </ScrollArea>
                    </Card>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
