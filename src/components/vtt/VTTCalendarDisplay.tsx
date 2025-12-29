"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { formatDate, formatTime, parseDate, parseTime, addTime, dateToString, timeToString } from "@/lib/calendar-helper";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface VTTCalendarDisplayProps {
    campaignId: string;
}

export function VTTCalendarDisplay({ campaignId }: VTTCalendarDisplayProps) {
    const [currentDate, setCurrentDate] = useState("1-1-1490");
    const [currentTime, setCurrentTime] = useState("08:00");
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        loadCalendar();

        // Poll para atualizar a cada 30 segundos
        const interval = setInterval(loadCalendar, 30000);

        return () => clearInterval(interval);
    }, [campaignId]);

    const loadCalendar = async () => {
        try {
            const res = await fetch(`/api/campaigns/${campaignId}/calendar`);
            if (res.ok) {
                const data = await res.json();
                setCurrentDate(data.currentDate);
                setCurrentTime(data.currentTime);
            }
        } catch (error) {
            console.error("Error loading calendar:", error);
        } finally {
            setLoading(false);
        }
    };

    const advanceTime = async (hours: number = 0, days: number = 0) => {
        try {
            setUpdating(true);
            const result = addTime(currentDate, currentTime, { hours, days });

            const res = await fetch(`/api/campaigns/${campaignId}/calendar`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentDate: result.date,
                    currentTime: result.time,
                }),
            });

            if (!res.ok) {
                throw new Error("Erro ao atualizar calendário");
            }

            const data = await res.json();
            setCurrentDate(result.date);
            setCurrentTime(result.time);

            if (data.dayChanged) {
                toast.success("Dia mudou! Magias preparadas foram resetadas.", { duration: 5000 });
            } else {
                toast.success(`Tempo avançado: ${hours > 0 ? `+${hours}h` : ''}${days > 0 ? ` +${days}d` : ''}`);
            }
        } catch (error: any) {
            console.error("Error advancing time:", error);
            toast.error(error.message || "Erro ao avançar tempo");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return null;
    }

    const date = parseDate(currentDate);
    const time = parseTime(currentTime);

    return (
        <Popover open={isExpanded} onOpenChange={setIsExpanded}>
            <PopoverTrigger asChild>
                <div className="absolute top-4 right-4 bg-black/90 backdrop-blur-sm border border-primary/30 rounded-lg p-3 shadow-lg z-10 cursor-pointer hover:bg-black/95 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium text-white">
                                {date.day}/{date.month}/{date.year}
                            </span>
                        </div>
                        <div className="h-4 w-px bg-primary/30" />
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium text-white">
                                {formatTime(time)}
                            </span>
                        </div>
                        {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-primary/50" />
                        ) : (
                            <ChevronDown className="w-4 h-4 text-primary/50" />
                        )}
                    </div>
                </div>
            </PopoverTrigger>
            <PopoverContent
                className="w-80 bg-black/95 border-primary/30 backdrop-blur-sm"
                align="end"
                side="bottom"
            >
                <div className="space-y-4">
                    <div>
                        <p className="font-semibold text-primary mb-1">{formatDate(date)}</p>
                        <p className="text-sm text-muted-foreground">
                            Hora: {formatTime(time)}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase">
                            Avançar Tempo
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => advanceTime(1)}
                                disabled={updating}
                                className="border-primary/30 hover:bg-primary/10"
                            >
                                <Plus className="w-3 h-3 mr-1" />
                                1 Hora
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => advanceTime(4)}
                                disabled={updating}
                                className="border-primary/30 hover:bg-primary/10"
                            >
                                <Plus className="w-3 h-3 mr-1" />
                                4 Horas
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => advanceTime(8)}
                                disabled={updating}
                                className="border-primary/30 hover:bg-primary/10"
                            >
                                <Plus className="w-3 h-3 mr-1" />
                                8 Horas
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => advanceTime(0, 1)}
                                disabled={updating}
                                className="border-primary/30 hover:bg-primary/10"
                            >
                                <Plus className="w-3 h-3 mr-1" />
                                1 Dia
                            </Button>
                        </div>
                    </div>

                    <p className="text-xs text-muted-foreground">
                        Clique para avançar o tempo da campanha. Mudanças de dia resetam magias preparadas.
                    </p>
                </div>
            </PopoverContent>
        </Popover>
    );
}
