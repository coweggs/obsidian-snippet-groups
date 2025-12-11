declare global {
    export interface i18next {
        t(...args: unknown[]): void;
        addResourceBundle(...args: unknown[]): void;
    }

    export interface Window {
        i18next: i18next;
    }
}

export {}