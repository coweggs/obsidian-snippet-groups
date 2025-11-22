import en from "locales/en.json";
import ru from "locales/ru.json";

export class LocalisationManager {
    static i18next: any;

    static init()
    {
        this.setRef();

        const namespace = "snippet-groups";

        this.i18next.addResourceBundle("en", namespace, en);
        this.i18next.addResourceBundle("ru", namespace, ru);
    }

    static setRef()
    {
        this.i18next = (window as any).i18next;
    }

    static get(key: string)
    {
        if (!this.i18next) this.setRef();
        return this.i18next.t(key);
    }

    static getNs(key: string, ns?: string | null)
    {
        if (!this.i18next) this.setRef();
        ns = ns ?? "snippet-groups";
        return this.i18next.t(key, { ns: ns });
    }

    static getNsVars(key: string, ns: string | null, varData: {key: string, value: string}[])
    {
        if (!this.i18next) this.setRef();
        ns = ns ?? "snippet-groups";
        const vars: Record<string, string> = {};
        for (const vd of varData)
        {
            vars[vd.key] = vd.value;
        }
        return this.i18next.t(key, { ns: ns, ...vars });
    }
}