import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Swords, Zap, Dice5, ShieldAlert } from "lucide-react";
import { rollAttack, rollDamage, RollResult } from "@/lib/dice-helper";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";

interface AttackRollDialogProps {
    isOpen: boolean;
    onClose: () => void;
    tokenName: string;
    attacks: Array<{
        name: string;
        bonus: number;
        damage: string;
        type: string;
        description: string;
    }>;
}

export function AttackRollDialog({ isOpen, onClose, tokenName, attacks }: AttackRollDialogProps) {
    const [lastRoll, setLastRoll] = React.useState<{
        type: 'attack' | 'damage';
        name: string;
        result: RollResult;
    } | null>(null);

    const formatMod = (mod: number) => (mod >= 0 ? `+${mod}` : `${mod}`);

    const handleAttackRoll = (name: string, bonus: number) => {
        const result = rollAttack(name, bonus);
        setLastRoll({ type: 'attack', name, result });
    };

    const handleDamageRoll = (name: string, formula: string, type: string) => {
        const result = rollDamage(name, formula, type);
        setLastRoll({ type: 'damage', name, result });
    };

    // Reseta o resultado ao fechar/reabrir
    React.useEffect(() => {
        if (!isOpen) setLastRoll(null);
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-stone-900 border-stone-800 p-0 overflow-hidden">
                <div className="bg-primary/10 border-b border-primary/20 p-6">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 font-cinzel text-primary text-xl">
                            <Swords className="w-6 h-6" />
                            Ações: {tokenName}
                        </DialogTitle>
                    </DialogHeader>

                    {/* Área de Resultado */}
                    <AnimatePresence mode="wait">
                        {lastRoll ? (
                            <motion.div
                                key={`${lastRoll.type}-${lastRoll.name}-${lastRoll.result.total}`}
                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                                className="mt-6 p-4 rounded-xl bg-black/40 border border-primary/30 shadow-2xl relative overflow-hidden group"
                            >
                                <div className="absolute top-0 right-0 p-2 opacity-10">
                                    <Dice5 className="w-16 h-16 text-primary" />
                                </div>
                                <div className="relative z-10 flex flex-col items-center">
                                    <span className="text-[10px] uppercase tracking-widest text-primary/70 font-bold mb-1">
                                        Resultado de {lastRoll.type === 'attack' ? 'Ataque' : 'Dano'}: {lastRoll.name}
                                    </span>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-5xl font-cinzel font-bold text-white drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]">
                                            {lastRoll.result.total}
                                        </span>
                                        {lastRoll.type === 'attack' && lastRoll.result.rolls[0] === 20 && (
                                            <span className="text-sm font-bold text-yellow-500 animate-pulse uppercase">¡Crítico!</span>
                                        )}
                                        {lastRoll.type === 'attack' && lastRoll.result.rolls[0] === 1 && (
                                            <span className="text-sm font-bold text-red-500 uppercase">Falha...</span>
                                        )}
                                    </div>
                                    <div className="mt-2 text-xs text-muted-foreground font-mono bg-black/30 px-3 py-1 rounded-full border border-white/5">
                                        {lastRoll.result.rolls.join(" + ")}
                                        {lastRoll.result.modifier !== 0 && (
                                            <span className={lastRoll.result.modifier > 0 ? "text-green-400" : "text-red-400"}>
                                                {lastRoll.result.modifier > 0 ? " + " : " - "}{Math.abs(lastRoll.result.modifier)}
                                            </span>
                                        )}
                                        <span className="mx-1">=</span>
                                        <span className="text-primary/80 font-bold">{lastRoll.result.total}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="mt-6 h-28 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-xl bg-black/10">
                                <Dice5 className="w-8 h-8 text-white/10 mb-2" />
                                <p className="text-xs text-white/20 italic">Aguardando rolagem...</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="p-6 pt-0">
                    <ScrollArea className="max-h-[40vh] pr-4 mt-6">
                        <div className="space-y-4">
                            {attacks && attacks.length > 0 ? (
                                attacks.map((attack, idx) => (
                                    <div
                                        key={`${attack.name}-${idx}`}
                                        className="p-4 rounded-lg bg-black/40 border border-white/5 space-y-3 hover:border-primary/30 transition-all group"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="text-primary font-bold text-base">{attack.name}</h4>
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{attack.type}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    className="bg-primary/20 hover:bg-primary/40 text-primary border border-primary/30 h-8 font-bold px-4 transition-all hover:scale-105 active:scale-95"
                                                    onClick={() => handleAttackRoll(attack.name, attack.bonus)}
                                                >
                                                    Acerto ({formatMod(attack.bonus)})
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    className="h-8 font-bold bg-red-900/40 hover:bg-red-900/60 border border-red-500/30 px-4 transition-all hover:scale-105 active:scale-95"
                                                    onClick={() => handleDamageRoll(attack.name, attack.damage, attack.type)}
                                                >
                                                    Dano ({attack.damage})
                                                </Button>
                                            </div>
                                        </div>

                                        {attack.description && (
                                            <p className="text-xs text-stone-400 leading-relaxed italic border-t border-white/5 pt-2">
                                                {attack.description}
                                            </p>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-muted-foreground italic bg-black/20 rounded-lg border border-white/5">
                                    Nenhuma ação de ataque cadastrada para este token.
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    <div className="text-[10px] text-muted-foreground text-center pt-6 italic flex items-center justify-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-primary/40" />
                        Os resultados salvos somem ao fechar a janela
                        <div className="w-1 h-1 rounded-full bg-primary/40" />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
