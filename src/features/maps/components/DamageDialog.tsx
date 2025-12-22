import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HeartPulse, Swords } from "lucide-react";

interface DamageDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (amount: number) => void;
    tokenName: string;
}

export function DamageDialog({ isOpen, onClose, onApply, tokenName }: DamageDialogProps) {
    const [value, setValue] = useState("");

    const handleApply = (isHealing: boolean) => {
        const amount = parseInt(value);
        if (isNaN(amount)) return;

        onApply(isHealing ? -amount : amount);
        setValue("");
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-xs">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Swords className="w-5 h-5 text-red-500" />
                        Gerenciar PV: {tokenName}
                    </DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <Input
                        type="number"
                        placeholder="Valor do dano/cura..."
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleApply(false);
                            if (e.key === 'Escape') onClose();
                        }}
                    />
                    <p className="text-[10px] text-muted-foreground mt-2">
                        Digite o valor e clique em Dano ou Cura.
                    </p>
                </div>
                <DialogFooter className="flex-row gap-2 sm:justify-center">
                    <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => handleApply(false)}
                        disabled={!value}
                    >
                        <Swords className="w-4 h-4 mr-2" /> Dano
                    </Button>
                    <Button
                        variant="default"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => handleApply(true)}
                        disabled={!value}
                    >
                        <HeartPulse className="w-4 h-4 mr-2" /> Cura
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
