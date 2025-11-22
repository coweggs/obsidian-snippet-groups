import { getLanguage } from "obsidian";

export class LocalisationManager {
    static i18next: any;

    static init()
    {
        this.i18next = (window as any).i18next;
    }

    static get(key: string)
    {
        if (!this.i18next) this.init();
        return this.i18next.t(key);
    }
}