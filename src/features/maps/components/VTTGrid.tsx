import React from "react";

interface VTTGridProps {
    width: number;
    height: number;
    cellSize: number;
    offsetX: number;
    offsetY: number;
    opacity: number;
    color: string;
}

export function VTTGrid({
    width,
    height,
    cellSize,
    offsetX,
    offsetY,
    opacity,
    color,
}: VTTGridProps) {
    // Calcular linhas e colunas visíveis
    const cols = Math.ceil(width / cellSize);
    const rows = Math.ceil(height / cellSize);

    // Gerar labels de colunas (A, B, C...) e linhas (1, 2, 3...)
    const getColLabel = (index: number) => {
        let label = "";
        let i = index;
        while (i >= 0) {
            label = String.fromCharCode(65 + (i % 26)) + label;
            i = Math.floor(i / 26) - 1;
        }
        return label;
    };

    return (
        <div
            className="absolute inset-0 pointer-events-none overflow-hidden"
            style={{
                width: width,
                height: height,
                transform: `translate(${offsetX}px, ${offsetY}px)`,
            }}
        >
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern
                        id="grid"
                        width={cellSize}
                        height={cellSize}
                        patternUnits="userSpaceOnUse"
                    >
                        <path
                            d={`M ${cellSize} 0 L 0 0 0 ${cellSize}`}
                            fill="none"
                            stroke={color}
                            strokeWidth="1"
                            strokeOpacity={opacity}
                        />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* Labels - Opcional, pode pesar se forem muitos */}
                <g className="grid-labels" style={{ opacity: Math.min(1, opacity + 0.2) }}>
                    {/* Desenhando apenas alguns labels para referência se necessário, 
                 ou podemos renderizá-los em um layer HTML separado para melhor performance */}
                </g>
            </svg>

            {/* Labels em HTML para melhor legibilidade */}
            <div className="absolute top-0 left-0 w-full h-full">
                {Array.from({ length: cols }).map((_, i) => (
                    <div
                        key={`col-${i}`}
                        className="absolute top-0 text-[10px] font-bold text-white bg-black/50 px-1 rounded-sm select-none"
                        style={{ left: i * cellSize + 2, textShadow: '1px 1px 1px #000' }}
                    >
                        {getColLabel(i)}
                    </div>
                ))}
                {Array.from({ length: rows }).map((_, i) => (
                    <div
                        key={`row-${i}`}
                        className="absolute left-0 text-[10px] font-bold text-white bg-black/50 px-1 rounded-sm select-none"
                        style={{ top: i * cellSize + 2, textShadow: '1px 1px 1px #000' }}
                    >
                        {i + 1}
                    </div>
                ))}
            </div>
        </div>
    );
}
