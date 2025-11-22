import SnippetGroupsPlugin from "main";
import { AppearanceHookManager } from "managers/AppearanceHookManager";
import { LocalisationManager } from "managers/LocalisationManager";

/*
 * Looks for the Settings Modal opening, as well as the interaction with the Appearance tab button,
 * and reloads the appearance menu hook.
 */
export class ModalObserver {
    plugin: SnippetGroupsPlugin;
    observer: MutationObserver;

    init(_plugin: SnippetGroupsPlugin)
    {
        this.plugin = _plugin;

        let watchingAppearance = false;
        if (document.querySelector(".mod-settings"))
        {
            if (!watchingAppearance)
            {
                this.watchAppearanceButton();
                watchingAppearance = true;
            }
        }
        if (this.observer) this.observer.disconnect();
        this.observer = new MutationObserver((mutations, obs) => {
            for (const mutation of mutations)
            {
                for (const node of Array.from(mutation.addedNodes))
                {
                    if (node instanceof HTMLElement && node.querySelector(".mod-settings"))
                    {
                        if (!watchingAppearance)
                        {
                            this.watchAppearanceButton();
                            watchingAppearance = true;
                        }

                        const localised = LocalisationManager.get("setting.appearance.name");
                        const appearanceMenu = Array.from(document.querySelectorAll(".vertical-tab-nav-item"))
                                                        .find(e => e.textContent == localised);
                        if (appearanceMenu)
                        {
                            AppearanceHookManager.RedrawAppearanceMenu(this.plugin);
                        }
                    }
                }
            }
        })
        this.observer.observe(document.body, { childList: true, subtree: true });
    }

    watchAppearanceButton()
    {
        const localised = LocalisationManager.get("setting.appearance.name");
        const AppearanceButton = Array.from(document.querySelectorAll(".vertical-tab-nav-item"))
                                        .find(e => e.textContent == localised) as HTMLElement;
        if (AppearanceButton)
        {
            if (!AppearanceButton.onclick)
            {
                this.plugin.registerDomEvent(AppearanceButton, "click", () => {
                    AppearanceHookManager.RedrawAppearanceMenu(this.plugin);
                })
            }
        }
    }

    disconnect()
    {
        this.observer.disconnect();
    }
}
