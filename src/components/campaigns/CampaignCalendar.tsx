"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, Plus, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
    parseDate,
    parseTime,
    formatDate,
    formatTime,
    addTime,
    dateToString,
    timeToString,
    FAERUN_MONTHS,
    getDaysInMonth,
} from "@/lib/calendar-helper";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CampaignCalendarProps {
    campaignId: string;
    initialDate?: string;
    initialTime?: string;
}

export function CampaignCalendar({
    campaignId,
    initialDate = "1-1-1490",
    initialTime = "08:00",
}: CampaignCalendarProps) {
    const [currentDate, setCurrentDate] = useState(initialDate);
    const [currentTime, setCurrentTime] = useState(initialTime);
    const [loading, setLoading] = useState(false);
    const [showDayChangeAlert, setShowDayChangeAlert] = useState(false);
    const [pendingUpdate, setPendingUpdate] = useState<{
        date: string;
        time: string;
    } | null>(null);

    // Parse current values
    const date = parseDate(currentDate);
    const time = parseTime(currentTime);

    // Carregar calendário atual
    useEffect(() => {
        loadCalendar();
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
        }
    };

    const updateCalendar = async (newDate: string, newTime: string, skipAlert = false) => {
        // Verificar se o dia mudou
        const oldDate = parseDate(currentDate);
        const updatedDate = parseDate(newDate);
        const dayChanged =
            oldDate.day !== updatedDate.day ||
            oldDate.month !== updatedDate.month ||
            oldDate.year !== updatedDate.year;

        // Se o dia mudou e não pulamos o alerta, mostrar confirmação
        if (dayChanged && !skipAlert) {
            setPendingUpdate({ date: newDate, time: newTime });
            setShowDayChangeAlert(true);
            return;
        }

        try {
            setLoading(true);
            const res = await fetch(`/api/campaigns/${campaignId}/calendar`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentDate: newDate,
                    currentTime: newTime,
                }),
            });

            if (!res.ok) {
                throw new Error("Erro ao atualizar calendário");
            }

            const data = await res.json();
            setCurrentDate(newDate);
            setCurrentTime(newTime);

            if (data.dayChanged) {
                toast.success("Calendário atualizado! Magias preparadas foram resetadas.");
            } else {
                toast.success("Calendário atualizado com sucesso!");
            }
        } catch (error: any) {
            console.error("Error updating calendar:", error);
            toast.error(error.message || "Erro ao atualizar calendário");
        } finally {
            setLoading(false);
            setPendingUpdate(null);
        }
    };

    const handleQuickAdvance = (hours: number = 0, days: number = 0) => {
        const result = addTime(currentDate, currentTime, { hours, days });
        updateCalendar(result.date, result.time);
    };

    const handleManualUpdate = () => {
        updateCalendar(currentDate, currentTime);
    };

    const handleDateChange = (field: "day" | "month" | "year", value: number) => {
        const newDate = { ...date };
        newDate[field] = value;

        // Validar dia máximo do mês
        if (field === "month" || field === "day") {
            const maxDays = getDaysInMonth(newDate.month);
            if (newDate.day > maxDays) {
                newDate.day = maxDays;
            }
        }

        setCurrentDate(dateToString(newDate));
    };

    const handleTimeChange = (field: "hour" | "minute", value: number) => {
        const newTime = { ...time };
        newTime[field] = value;

        // Validar limites
        if (field === "hour" && (value < 0 || value > 23)) return;
        if (field === "minute" && (value < 0 || value > 59)) return;

        setCurrentTime(timeToString(newTime));
    };

    return (
        <>
            <Card className="bg-card/60 border-primary/20">
                <CardHeader>
                    <CardTitle className="text-xl font-cinzel flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Calendário da Campanha
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Display Atual */}
                    <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground mb-1">Data e Hora Atual</p>
                            <p className="text-2xl font-bold text-primary">
                                {formatDate(date)}
                            </p>
                            <p className="text-lg text-muted-foreground mt-1">
                                {formatTime(time)}
                            </p>
                        </div>
                    </div>

                    {/* Controles de Data */}
                    <div className="space-y-4">
                        <h3 className="font-semibold flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Ajustar Data
                        </h3>
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <Label htmlFor="day">Dia</Label>
                                <Input
                                    id="day"
                                    type="number"
                                    min={1}
                                    max={getDaysInMonth(date.month)}
                                    value={date.day}
                                    onChange={(e) => handleDateChange("day", parseInt(e.target.value) || 1)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="month">Mês</Label>
                                <select
                                    id="month"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                    value={date.month}
                                    onChange={(e) => handleDateChange("month", parseInt(e.target.value))}
                                >
                                    {FAERUN_MONTHS.map((month) => (
                                        <option key={month.number} value={month.number}>
                                            {month.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <Label htmlFor="year">Ano (DR)</Label>
                                <Input
                                    id="year"
                                    type="number"
                                    min={1}
                                    value={date.year}
                                    onChange={(e) => handleDateChange("year", parseInt(e.target.value) || 1490)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Controles de Hora */}
                    <div className="space-y-4">
                        <h3 className="font-semibold flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Ajustar Hora
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="hour">Hora</Label>
                                <Input
                                    id="hour"
                                    type="number"
                                    min={0}
                                    max={23}
                                    value={time.hour}
                                    onChange={(e) => handleTimeChange("hour", parseInt(e.target.value) || 0)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="minute">Minuto</Label>
                                <Input
                                    id="minute"
                                    type="number"
                                    min={0}
                                    max={59}
                                    value={time.minute}
                                    onChange={(e) => handleTimeChange("minute", parseInt(e.target.value) || 0)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Botões de Ação Rápida */}
                    <div className="space-y-3">
                        <h3 className="font-semibold flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Avançar Tempo
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                variant="outline"
                                onClick={() => handleQuickAdvance(1)}
                                disabled={loading}
                                className="border-primary/30 hover:bg-primary/10"
                            >
                                +1 Hora
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => handleQuickAdvance(8)}
                                disabled={loading}
                                className="border-primary/30 hover:bg-primary/10"
                            >
                                +8 Horas
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => handleQuickAdvance(0, 1)}
                                disabled={loading}
                                className="border-primary/30 hover:bg-primary/10"
                            >
                                +1 Dia
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => handleQuickAdvance(0, 7)}
                                disabled={loading}
                                className="border-primary/30 hover:bg-primary/10"
                            >
                                +7 Dias
                            </Button>
                        </div>
                    </div>

                    {/* Botão de Atualização Manual */}
                    <Button
                        onClick={handleManualUpdate}
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary/90"
                    >
                        {loading ? "Atualizando..." : "Atualizar Calendário"}
                    </Button>
                </CardContent>
            </Card>

            {/* Alert Dialog para mudança de dia */}
            <AlertDialog open={showDayChangeAlert} onOpenChange={setShowDayChangeAlert}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-yellow-500" />
                            Mudar o Dia da Campanha?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Você está prestes a mudar o dia da campanha. Isso irá resetar todas as magias
                            preparadas dos personagens que preparam magias (Clérigo, Druida, Paladino, Mago).
                            <br />
                            <br />
                            Os jogadores serão alertados para preparar novas magias.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setPendingUpdate(null)}>
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (pendingUpdate) {
                                    updateCalendar(pendingUpdate.date, pendingUpdate.time, true);
                                }
                                setShowDayChangeAlert(false);
                            }}
                        >
                            Confirmar Mudança
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
