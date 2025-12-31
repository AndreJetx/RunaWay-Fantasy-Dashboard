"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Shield, Swords, Target, Zap } from "lucide-react";
import type { FightingStyle } from "@/lib/fighting-styles";

interface FightingStyleSelectorProps {
    availableStyles: FightingStyle[];
    selectedStyle: FightingStyle | null;
    onSelect: (style: FightingStyle) => void;
    onClose: () => void;
}

const STYLE_ICONS: Record<string, any> = {
    archery: Target,
    defense: Shield,
    dueling: Swords,
    great_weapon_fighting: Zap,
    protection: Shield,
    two_weapon_fighting: Swords,
};

export function FightingStyleSelector({
    availableStyles,
    selectedStyle,
    onSelect,
    onClose,
}: FightingStyleSelectorProps) {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-card/95 border-primary/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <Swords className="h-6 w-6 text-primary" />
                        Escolha seu Estilo de Combate
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-2">
                        Selecione um estilo de combate que define como você luta em batalha.
                    </p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <RadioGroup
                        value={selectedStyle?.id || ""}
                        onValueChange={(value) => {
                            const style = availableStyles.find((s) => s.id === value);
                            if (style) onSelect(style);
                        }}
                    >
                        {availableStyles.map((style) => {
                            const Icon = STYLE_ICONS[style.id] || Swords;
                            const isSelected = selectedStyle?.id === style.id;

                            return (
                                <div
                                    key={style.id}
                                    className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all ${isSelected
                                            ? "border-primary bg-primary/10"
                                            : "border-border hover:border-primary/50 hover:bg-primary/5"
                                        }`}
                                    onClick={() => onSelect(style)}
                                >
                                    <div className="flex items-start gap-4">
                                        <RadioGroupItem value={style.id} id={style.id} className="mt-1" />
                                        <div className="flex-1">
                                            <Label
                                                htmlFor={style.id}
                                                className="flex items-center gap-2 text-lg font-bold cursor-pointer"
                                            >
                                                <Icon className={`h-5 w-5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                                                {style.name}
                                            </Label>
                                            <p className="text-sm text-muted-foreground mt-2">{style.description}</p>
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {style.benefits.map((benefit, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary border border-primary/30"
                                                    >
                                                        {benefit}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </RadioGroup>

                    <div className="flex gap-3 pt-4">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="flex-1"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={onClose}
                            disabled={!selectedStyle}
                            className="flex-1 bg-primary hover:bg-primary/90"
                        >
                            Confirmar Escolha
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
