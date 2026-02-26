export function toSlug(input: string): string {
    return input
        .toLowerCase()
        .replace(/&/g, ' and ')
        .replace(/[^a-z0-9\s-]/g, ' ')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}
