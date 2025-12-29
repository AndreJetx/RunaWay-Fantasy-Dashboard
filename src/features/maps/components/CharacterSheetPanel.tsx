import React, { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Shield, Heart, Zap, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { canPrepareSpells } from "@/lib/prepared-spells-helper";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
    characterClass?: string;
    referenceId?: string; // ID do personagem original no banco
}

interface CharacterSheetPanelProps {
    character: CharacterData | null;
    onClose: () => void;
}

export function CharacterSheetPanel({ character, onClose }: CharacterSheetPanelProps) {
    const [preparedSpells, setPreparedSpells] = useState<string[]>([]);
    const [spellDetails, setSpellDetails] = useState<Record<string, any>>({});
    const [loadingSpells, setLoadingSpells] = useState(false);
    const [isPreparedSpellsOpen, setIsPreparedSpellsOpen] = useState(false);

    useEffect(() => {
        if (character?.referenceId) {
            loadPreparedSpells();
        }
    }, [character?.referenceId]);

    const loadPreparedSpells = async () => {
        if (!character?.referenceId) return;

        try {
            setLoadingSpells(true);
            const res = await fetch(`/api/characters/${character.referenceId}`);
            if (res.ok) {
                const data = await res.json();
                const prepared = data.character?.preparedSpells || data.character?.prepared_spells || [];
                setPreparedSpells(prepared);

                // Buscar detalhes das magias preparadas
                if (prepared.length > 0) {
                    const details: Record<string, any> = {};
                    await Promise.all(
                        prepared.map(async (spellIndex: string) => {
                            try {
                                const spellRes = await fetch(`https://www.dnd5eapi.co/api/spells/${spellIndex}`);
                                if (spellRes.ok) {
                                    details[spellIndex] = await spellRes.json();
                                }
                            } catch (err) {
                                console.error(`Error fetching spell ${spellIndex}:`, err);
                            }
                        })
                    );
                    setSpellDetails(details);
                }
            }
        } catch (error) {
            console.error("Error loading prepared spells:", error);
        } finally {
            setLoadingSpells(false);
        }
    };

    if (!character) return null;

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

    const getMod = (score: number) => Math.floor((score - 10) / 2);
    const formatMod = (mod: number) => (mod >= 0 ? `+${mod}` : `${mod}`);

    const showPreparedSpells = canPrepareSpells(className);

    // Tradução simples de nomes de magias
    const translateSpell = (name: string) => {
        const translations: Record<string, string> = {
            "cure wounds": "Curar Ferimentos",
            "healing word": "Palavra Curativa",
            "shield": "Escudo",
            "magic missile": "Mísseis Mágicos",
            "fireball": "Bola de Fogo",
            "bless": "Bênção",
            "guiding bolt": "Raio Guiador",
        };
        return translations[name.toLowerCase()] || name;
    };

    return (
        <Card className="flex flex-col h-full bg-black/60 border-0 border-r border-white/10 rounded-none w-80 animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-primary/5">
                <div className="min-w-0">
                    <h3 className="font-cinzel font-bold text-lg text-primary truncate leading-tight">{character.name}</h3>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-none mt-1">Ficha do Personagem</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white" onClick={onClose}>
                    <X className="w-4 h-4" />
                </Button>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-4 space-y-6">
                    {/* Header: Imagem e Status básico */}
                    <div className="flex gap-4 items-start">
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-white/20 shrink-0 bg-muted/20">
                            {character.image ? (
                                <Image src={character.image} alt={character.name} fill className="object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Shield className="w-8 h-8 text-white/10" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium text-white/90">{character.race || "Sem Raça"}</p>
                            <p className="text-xs text-primary/70">{className}</p>

                            <div className="flex gap-2 mt-4">
                                <div className="flex-1 flex flex-col items-center bg-white/5 p-1 rounded border border-white/5">
                                    <Shield className="w-3 h-3 text-blue-400 mb-1" />
                                    <span className="text-[10px] text-muted-foreground uppercase">CA</span>
                                    <span className="font-bold text-sm">{ac}</span>
                                </div>
                                <div className="flex-1 flex flex-col items-center bg-white/5 p-1 rounded border border-white/5">
                                    <Zap className="w-3 h-3 text-yellow-400 mb-1" />
                                    <span className="text-[10px] text-muted-foreground uppercase">Desl.</span>
                                    <span className="font-bold text-sm">{speed}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Vida */}
                    <div className="space-y-2 bg-green-500/5 p-3 rounded-lg border border-green-500/10">
                        <div className="flex justify-between items-center text-xs uppercase tracking-wider font-bold text-green-400/80">
                            <div className="flex items-center gap-1">
                                <Heart className="w-3 h-3" />
                                Pontos de Vida
                            </div>
                            <span>{hp.current} / {hp.max}</span>
                        </div>
                        <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
                            <div
                                className="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-500"
                                style={{ width: `${(hp.current / hp.max) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Atributos */}
                    <div className="grid grid-cols-3 gap-2">
                        {Object.entries(attributes).map(([attr, score]) => {
                            const mod = getMod(score);
                            return (
                                <div key={attr} className="flex flex-col items-center bg-white/5 p-2 rounded-lg border border-white/5 hover:bg-white/10 transition-colors">
                                    <span className="text-[9px] uppercase font-bold text-primary/60 mb-1">{attr.slice(0, 3)}</span>
                                    <span className="text-lg font-bold text-white">{formatMod(mod)}</span>
                                    <span className="text-[9px] text-muted-foreground font-mono">{score}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Magias Preparadas */}
                    {showPreparedSpells && (
                        <Collapsible open={isPreparedSpellsOpen} onOpenChange={setIsPreparedSpellsOpen}>
                            <div className="space-y-2 bg-purple-500/5 p-3 rounded-lg border border-purple-500/10">
                                <CollapsibleTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="w-full flex items-center justify-between p-0 h-auto hover:bg-transparent"
                                    >
                                        <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-purple-400/80">
                                            <Sparkles className="w-3 h-3" />
                                            Magias Preparadas
                                            <Badge variant="outline" className="ml-1 border-purple-500/30 text-purple-400">
                                                {preparedSpells.length}
                                            </Badge>
                                        </div>
                                        {isPreparedSpellsOpen ? (
                                            <ChevronUp className="w-4 h-4 text-purple-400/50" />
                                        ) : (
                                            <ChevronDown className="w-4 h-4 text-purple-400/50" />
                                        )}
                                    </Button>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="space-y-2 mt-2">
                                    {loadingSpells ? (
                                        <p className="text-xs text-muted-foreground text-center py-2">Carregando...</p>
                                    ) : preparedSpells.length === 0 ? (
                                        <p className="text-xs text-muted-foreground text-center py-2">
                                            Nenhuma magia preparada
                                        </p>
                                    ) : (
                                        <div className="space-y-1 max-h-40 overflow-y-auto">
                                            {preparedSpells.map((spellIndex) => {
                                                const detail = spellDetails[spellIndex];
                                                return (
                                                    <div
                                                        key={spellIndex}
                                                        className="p-2 rounded bg-white/5 text-[11px] border border-purple-500/10 hover:bg-purple-500/10 transition-colors"
                                                    >
                                                        <p className="text-purple-300 font-bold">
                                                            {detail ? translateSpell(detail.name) : spellIndex}
                                                        </p>
                                                        {detail && (
                                                            <p className="text-white/40 text-[10px] mt-0.5">
                                                                Nível {detail.level} • {detail.school?.name || ""}
                                                            </p>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </CollapsibleContent>
                            </div>
                        </Collapsible>
                    )}

                    {/* Divisória Decorativa */}
                    <div className="relative py-4 flex items-center">
                        <div className="flex-grow border-t border-white/5"></div>
                        <span className="flex-shrink mx-4 text-white/10 italic text-[10px] items-center flex gap-1"><Shield className="w-2 h-2" /> D&D 5E <Shield className="w-2 h-2" /></span>
                        <div className="flex-grow border-t border-white/5"></div>
                    </div>

                    {/* Simulação de conteúdo extra */}
                    <div className="space-y-3">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Habilidades Passivas</p>
                        <div className="space-y-2">
                            <div className="p-2 rounded bg-white/5 text-[11px] border border-white/5">
                                <p className="text-primary/80 font-bold mb-1">Percepção Passiva</p>
                                <p className="text-white/60">{10 + getMod(attributes.wis || 10)}</p>
                            </div>
                            <div className="p-2 rounded bg-white/5 text-[11px] border border-white/5">
                                <p className="text-primary/80 font-bold mb-1">Investigação Passiva</p>
                                <p className="text-white/60">{10 + getMod(attributes.int || 10)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-primary/5 p-3 rounded text-[11px] text-muted-foreground/60 text-center italic border border-primary/10">
                        Clique em um token no mapa para visualizar os detalhes básicos de combate aqui. Para a ficha completa, use a biblioteca.
                    </div>
                </div>
            </ScrollArea>
        </Card>
    );
}
