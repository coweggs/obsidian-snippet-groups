declare global {
    export interface i18next {
        t(...args: unknown[]): string;
        addResourceBundle(...args: unknown[]): unknown;
    }

    export interface Window {
        i18next: i18next;
    }
}

export {}