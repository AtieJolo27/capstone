export const formatDateTime = (value: string | null | undefined): string => {
    if (!value) {
        return '—';
    }

    return new Intl.DateTimeFormat('en-PH', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
};

export const formatDate = (value: string | null | undefined): string => {
    if (!value) {
        return '—';
    }

    return new Intl.DateTimeFormat('en-PH', {
        dateStyle: 'medium',
    }).format(new Date(value));
};

export const formatNumber = (value: number | null | undefined, digits = 1): string => {
    if (value === null || value === undefined) {
        return '—';
    }

    return new Intl.NumberFormat('en-PH', {
        maximumFractionDigits: digits,
    }).format(value);
};
