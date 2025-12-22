import React, { useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Skull, Shield, HeartPulse, Swords, Ghost } from "lucide-react";
import { motion } from "framer-motion";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
    ContextMenuSeparator,
} from "@/components/ui/context-menu";

interface TokenMarkerProps {
    id: string;
    name: string;
    image: string | null;
    x: number;
    y: number;
    size: number;
    type: "player" | "npc" | "enemy";
    isHostile?: boolean;
    isDead?: boolean;
    selected?: boolean;
    isCurrentTurn?: boolean;
    onSelect?: () => void;
    onDragEnd?: (x: number, y: number) => void;
    onApplyDamage?: (amount: number) => void;
}

export function TokenMarker({
    id,
    name,
    image,
    x,
    y,
    size,
    type,
    isHostile = false,
    isDead = false,
    selected = false,
    isCurrentTurn = false,
    onSelect,
    onDragEnd,
    onApplyDamage,
}: TokenMarkerProps) {
    const constraintsRef = useRef(null);

    // Cores de borda baseadas no tipo/hostilidade
    const borderColor = isHostile || type === "enemy"
        ? "border-red-500"
        : type === "npc"
            ? "border-yellow-500"
            : "border-green-500";

    const shadowColor = isHostile || type === "enemy"
        ? "shadow-red-500/50"
        : type === "npc"
            ? "shadow-yellow-500/50"
            : "shadow-green-500/50";

    return (
        <motion.div
            className="absolute cursor-grab active:cursor-grabbing z-10 token-marker"
            style={{
                width: size,
                height: size,
                left: x * size,
                top: y * size,
            }}
            drag
            dragMomentum={false}
            onPointerDown={(e) => {
                // Impede que o evento passe para o mapa (que iniciaria o pan)
                e.stopPropagation();
            }}
            onDragEnd={(_, info) => {
                // Calcular nova posição baseada no grid
                const newX = Math.round((x * size + info.offset.x) / size);
                const newY = Math.round((y * size + info.offset.y) / size);
                if (onDragEnd) onDragEnd(newX, newY);
            }}
            onTap={(e) => {
                e.stopPropagation();
                if (onSelect) onSelect();
            }}
            whileHover={{ scale: 1.1, zIndex: 20 }}
            whileTap={{ scale: 0.95 }}
        >
            <ContextMenu>
                <ContextMenuTrigger>
                    <div
                        className={cn(
                            "w-full h-full rounded-full border-2 bg-background overflow-hidden relative transition-all duration-200 pointer-events-none flex items-center justify-center", // pointer-events-none na imagem para não interferir no drag
                            borderColor,
                            selected ? `ring-2 ring-white ${shadowColor} shadow-lg scale-110` : "shadow-md",
                            isCurrentTurn && "ring-4 ring-primary shadow-[0_0_20px_rgba(212,175,55,0.8)] scale-110",
                            isDead && "grayscale opacity-60"
                        )}
                    >
                        {image ? (
                            <Image
                                src={image}
                                alt={name}
                                fill
                                className="object-cover"
                                draggable={false}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                                {isHostile ? <Skull className="w-1/2 h-1/2" /> : <Shield className="w-1/2 h-1/2" />}
                            </div>
                        )}

                        {/* Indicadores de Turno e Morte */}
                        {isCurrentTurn && (
                            <div className="absolute inset-0 bg-primary/20 animate-pulse z-10 flex items-center justify-center">
                                <Swords className="w-1/2 h-1/2 text-primary animate-bounce shadow-xl" />
                            </div>
                        )}
                        {isDead && (
                            <div className="absolute inset-0 flex items-center justify-center bg-red-950/20 z-10">
                                <Ghost className="w-2/3 h-2/3 text-red-500 drop-shadow-[0_0_5px_rgba(0,0,0,1)]" />
                            </div>
                        )}
                    </div>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-48">
                    <ContextMenuItem onClick={() => onApplyDamage?.(0)} className="flex items-center gap-2">
                        <Swords className="w-4 h-4 text-red-500" />
                        Aplica Dano/Cura
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem disabled className="text-[10px] text-muted-foreground">
                        {name} {isDead ? "(Morto)" : ""}
                    </ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>

            {/* Tooltip de nome simples sempre visível ou on hover */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                {name}
            </div>
        </motion.div>
    );
}
