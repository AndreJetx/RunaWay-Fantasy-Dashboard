/**
 * Calendar Helper Functions
 * Funções auxiliares para gerenciar o calendário de campanha
 */

// Meses do calendário de Faerûn (D&D 5e)
export const FAERUN_MONTHS = [
    { number: 1, name: 'Martelo', days: 30 },
    { number: 2, name: 'Alturiak', days: 30 },
    { number: 3, name: 'Ches', days: 30 },
    { number: 4, name: 'Tarsakh', days: 30 },
    { number: 5, name: 'Mirtul', days: 30 },
    { number: 6, name: 'Kythorn', days: 30 },
    { number: 7, name: 'Flamerule', days: 30 },
    { number: 8, name: 'Eleasias', days: 30 },
    { number: 9, name: 'Eleint', days: 30 },
    { number: 10, name: 'Marpenoth', days: 30 },
    { number: 11, name: 'Uktar', days: 30 },
    { number: 12, name: 'Nightal', days: 30 },
];

export interface CampaignDate {
    day: number;
    month: number;
    year: number;
}

export interface CampaignTime {
    hour: number;
    minute: number;
}

/**
 * Converte uma string de data no formato "dia-mês-ano" para objeto
 */
export function parseDate(dateString: string): CampaignDate {
    const parts = dateString.split('-');
    return {
        day: parseInt(parts[0]) || 1,
        month: parseInt(parts[1]) || 1,
        year: parseInt(parts[2]) || 1490,
    };
}

/**
 * Converte uma string de hora no formato "HH:mm" para objeto
 */
export function parseTime(timeString: string): CampaignTime {
    const parts = timeString.split(':');
    return {
        hour: parseInt(parts[0]) || 0,
        minute: parseInt(parts[1]) || 0,
    };
}

/**
 * Formata uma data para exibição
 */
export function formatDate(date: CampaignDate, includeMonthName: boolean = true): string {
    if (includeMonthName) {
        const monthName = getFaerunMonthName(date.month);
        return `${date.day} de ${monthName}, ${date.year} DR`;
    }
    return `${date.day}/${date.month}/${date.year}`;
}

/**
 * Formata uma hora para exibição
 */
export function formatTime(time: CampaignTime): string {
    const hour = time.hour.toString().padStart(2, '0');
    const minute = time.minute.toString().padStart(2, '0');
    return `${hour}:${minute}`;
}

/**
 * Retorna o nome do mês de Faerûn
 */
export function getFaerunMonthName(month: number): string {
    const monthData = FAERUN_MONTHS.find(m => m.number === month);
    return monthData?.name || 'Desconhecido';
}

/**
 * Retorna o número de dias em um mês
 */
export function getDaysInMonth(month: number): number {
    const monthData = FAERUN_MONTHS.find(m => m.number === month);
    return monthData?.days || 30;
}

/**
 * Adiciona tempo a uma data/hora
 */
export function addTime(
    dateString: string,
    timeString: string,
    options: {
        minutes?: number;
        hours?: number;
        days?: number;
    }
): { date: string; time: string } {
    const date = parseDate(dateString);
    const time = parseTime(timeString);

    // Adicionar minutos
    let totalMinutes = time.minute + (options.minutes || 0);
    let extraHours = Math.floor(totalMinutes / 60);
    time.minute = totalMinutes % 60;

    // Adicionar horas
    let totalHours = time.hour + (options.hours || 0) + extraHours;
    let extraDays = Math.floor(totalHours / 24);
    time.hour = totalHours % 24;

    // Adicionar dias
    let totalDays = date.day + (options.days || 0) + extraDays;

    // Ajustar mês e ano
    while (totalDays > getDaysInMonth(date.month)) {
        totalDays -= getDaysInMonth(date.month);
        date.month++;
        if (date.month > 12) {
            date.month = 1;
            date.year++;
        }
    }

    date.day = totalDays;

    return {
        date: `${date.day}-${date.month}-${date.year}`,
        time: formatTime(time),
    };
}

/**
 * Verifica se duas datas são o mesmo dia
 */
export function isSameDay(date1String: string, date2String: string): boolean {
    const date1 = parseDate(date1String);
    const date2 = parseDate(date2String);

    return (
        date1.day === date2.day &&
        date1.month === date2.month &&
        date1.year === date2.year
    );
}

/**
 * Converte data para string no formato de armazenamento
 */
export function dateToString(date: CampaignDate): string {
    return `${date.day}-${date.month}-${date.year}`;
}

/**
 * Converte hora para string no formato de armazenamento
 */
export function timeToString(time: CampaignTime): string {
    return formatTime(time);
}

/**
 * Retorna a data/hora atual formatada para exibição
 */
export function formatDateTime(dateString: string, timeString: string): string {
    const date = parseDate(dateString);
    const time = parseTime(timeString);
    return `${formatDate(date)} às ${formatTime(time)}`;
}
