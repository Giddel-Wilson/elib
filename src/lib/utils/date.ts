type DateFormat = 'short' | 'medium' | 'long';

interface DateFormatOptions {
    format?: DateFormat;
    includeTime?: boolean;
    locale?: string;
}

const DEFAULT_OPTIONS: DateFormatOptions = {
    format: 'medium',
    includeTime: false,
    locale: 'en-US'
};

function getFormatOptions(format: DateFormat): Intl.DateTimeFormatOptions {
    switch (format) {
        case 'short':
            return {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric'
            } as const;
        case 'medium':
            return {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            } as const;
        case 'long':
            return {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
            } as const;
        default:
            return {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            } as const;
    }
}

function isValidDateString(date: string | Date | null | undefined): boolean {
    if (!date) return false;
    const timestamp = new Date(date).getTime();
    return !isNaN(timestamp) && timestamp > 0;
}

export function formatDate(date: string | Date | null | undefined, options?: DateFormatOptions): string {
    if (!date || !isValidDateString(date)) {
        console.warn('Invalid date provided to formatDate:', date);
        return 'No date';
    }
    
    const opts = { ...DEFAULT_OPTIONS, ...options };
    
    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        const formatOptions: Intl.DateTimeFormatOptions = {
            ...getFormatOptions(opts.format!),
            ...(opts.includeTime && {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            })
        };

        return new Intl.DateTimeFormat(opts.locale, formatOptions).format(dateObj);
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid date';
    }
}

export function getRelativeTime(date: string | Date | null | undefined): string {
    if (!date || !isValidDateString(date)) {
        console.warn('Invalid date provided to getRelativeTime:', date);
        return 'No date';
    }

    try {
        const dateObj = new Date(date);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - dateObj.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
        return `${Math.floor(diffDays / 365)} years ago`;
    } catch (error) {
        console.error('Error calculating relative time:', error);
        return 'No date';
    }
}