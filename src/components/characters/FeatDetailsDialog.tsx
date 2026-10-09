"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Award, TrendingUp, CheckCircle2 } from "lucide-react";
import { getFeatByName, Feat } from "@/lib/feats";

interface FeatDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    featName: string;
}

export function FeatDetailsDialog({
    open,
    onOpenChange,
    featName,
}: FeatDetailsDialogProps) {
    const feat = getFeatByName(featName);

    if (!feat) {
        return null;
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                        <Award className="w-6 h-6 text-amber-400" />
                        {feat.name}
                    </DialogTitle>
                    <DialogDescription>
                        {feat.description}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                    {/* Pré-requisito */}
                    {feat.prerequisite && (
                        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                            <h3 className="font-semibold text-amber-400 text-sm mb-1">📋 Pré-requisito</h3>
                            <p className="text-sm">{feat.prerequisite}</p>
                        </div>
                    )}

                    {/* Bônus de Atributo */}
                    {feat.attributeBonus && (
                        <div className="p-3 bg-primary/10 border border-primary/30 rounded-lg">
                            <h3 className="font-semibold text-primary flex items-center gap-2 text-sm mb-2">
                                <TrendingUp className="w-4 h-4" />
                                Bônus de Atributo
                            </h3>
                            <p className="text-sm">
                                +{feat.attributeBonus.bonus} em{" "}
                                {feat.attributeBonus.attribute === "any"
                                    ? "um atributo à escolha"
                                    : feat.attributeBonus.attribute === "strength"
                                        ? "Força"
                                        : feat.attributeBonus.attribute === "dexterity"
                                            ? "Destreza"
                                            : feat.attributeBonus.attribute === "constitution"
                                                ? "Constituição"
                                                : feat.attributeBonus.attribute === "intelligence"
                                                    ? "Inteligência"
                                                    : feat.attributeBonus.attribute === "wisdom"
                                                        ? "Sabedoria"
                                                        : "Carisma"}
                            </p>
                        </div>
                    )}

                    {/* Benefícios */}
                    <div>
                        <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5" />
                            Benefícios
                        </h3>
                        <ul className="space-y-2">
                            {feat.benefits.map((benefit, idx) => (
                                <li
                                    key={idx}
                                    className="flex gap-2 bg-background/50 rounded p-3 text-sm"
                                >
                                    <span className="text-green-400 flex-shrink-0">✓</span>
                                    <span>{benefit}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
