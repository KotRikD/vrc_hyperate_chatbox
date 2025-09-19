export const validateHyperateCode = (value: string): string => {
    if (!value) {
        return 'Hyperate code is required';
    }
    if (value.length < 4) {
        return 'Code must be at least 4 characters';
    }
    return '';
};
