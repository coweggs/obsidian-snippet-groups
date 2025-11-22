import SnippetGroupsPlugin from "main";
import { AppearanceHookManager } from "managers/AppearanceHookManager";
import { LocalisationManager } from "managers/LocalisationManager";

/*
 * Looks for the "Reloaded CSS snippets." notice, and reloads the appearance menu hook.
 */
export class NoticeObserver {
    plugin: SnippetGroupsPlugin;
    observer: MutationObserver;
    MenuContents: HTMLElement;

    init(_plugin: SnippetGroupsPlugin)
    {
        this.plugin = _plugin;

        if (this.observer) this.observer.disconnect();
        this.observer = new MutationObserver((mutations, obs) => {
            outer: for (const mutation of mutations)
            {
                for (const node of Array.from(mutation.addedNodes))
                {
                    if (node instanceof HTMLElement && node.querySelector(".notice-message"))
                    {
                        const noticeText = LocalisationManager.get("setting.appearance.msg-reloaded-snippets");
                        if (node.querySelector(".notice-message")?.textContent == noticeText)
                        {
                            const appearanceText = LocalisationManager.get("setting.appearance.name");
                            const appearanceMenuClosed = Array.from(document.querySelectorAll(".vertical-tab-nav-item"))
                                                            .find(e => e.textContent == appearanceText) == null;
                            if (!appearanceMenuClosed)
                            {
                                AppearanceHookManager.RedrawAppearanceMenu(this.plugin);
                                if (this.MenuContents) AppearanceHookManager.RestoreScrollState(this.MenuContents);
                            }
                            this.observer.disconnect();
                            break outer;
                        }
                    }
                }
            }
        })
    }

    reconnect(_menuContents?: HTMLElement)
    {
        if (this.observer)
        {
            this.observer.disconnect();
            this.observer.observe(document.body, { childList: true, subtree: true });
        }

        if (_menuContents) this.MenuContents = _menuContents;
    }

    disconnect()
    {
        this.observer.disconnect();
    }
}