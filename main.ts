import { App, Modal, Notice, Plugin, Menu, Setting } from 'obsidian';

interface SnippetGroup {
    name: string;
    snippets: string[];
    collapsed: boolean;
    order: number;
}

interface Settings {
    snippetGroups: SnippetGroup[];
}

const DEFAULT_SETTINGS: Settings = {
	snippetGroups: []
}

export default class MyPlugin extends Plugin {
	settings: Settings;
    observer: MutationObserver;
    settingsObserver: MutationObserver

	async onload() {
		await this.loadSettings();
        
        this.watchAppearanceButton();
        this.initModalObserver();
        this.initNoticeObserver();
	}

	onunload() {
        this.observer.disconnect();
        this.settingsObserver.disconnect();
	}

    initModalObserver()
    {
        if (this.settingsObserver) this.settingsObserver.disconnect();
        this.settingsObserver = new MutationObserver((mutations, obs) => {
            for (let mutation of mutations)
            {
                for (let node of Array.from(mutation.addedNodes))
                {
                    if (node instanceof HTMLElement && node.querySelector(".mod-settings"))
                    {
                        let appearanceMenu = Array.from(document.querySelectorAll(".vertical-tab-nav-item"))
                                                        .find(e => e.textContent == "Appearance");
                        if (appearanceMenu)
                        {
                            this.RedrawAppearanceMenu();
                        }
                    }
                }
            }
        })
        this.settingsObserver.observe(document.body, { childList: true, subtree: true });
    }

    watchAppearanceButton()
    {
        const AppearanceButton = Array.from(document.querySelectorAll(".vertical-tab-nav-item"))
                                      .find(e => e.textContent == "Appearance") as HTMLElement;
        if (AppearanceButton)
        {
            this.registerDomEvent(AppearanceButton, "click", () => {
                this.RedrawAppearanceMenu();
            })
        }
    }

    initNoticeObserver()
    {
        if (this.observer) this.observer.disconnect();
        this.observer = new MutationObserver((mutations, obs) => {
            outer: for (let mutation of mutations)
            {
                for (let node of Array.from(mutation.addedNodes))
                {
                    if (node instanceof HTMLElement && node.querySelector(".notice-message"))
                    {
                        if (node.querySelector(".notice-message")?.textContent == "Reloaded CSS snippets.")
                        {
                            let appearanceMenuClosed = Array.from(document.querySelectorAll(".vertical-tab-nav-item"))
                                                            .find(e => e.textContent == "Appearance") == null;
                            if (!appearanceMenuClosed) this.RedrawAppearanceMenu();
                            this.observer.disconnect();
                            break outer;
                        }
                    }
                }
            }
        })
    }

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

    async RedrawAppearanceMenu()
    {
        const Header = Array.from(document.querySelectorAll(".setting-item.setting-item-heading"))
                            .find(e => e.querySelector(".setting-item-name")?.textContent == "CSS snippets");
        const MenuContents = Header?.parentElement;

        if (!MenuContents || !Header) return;

        // Plugin Buttons
        const HeaderControls = Header?.querySelector(".setting-item-control");
        let ReloadSnippetsBtn = HeaderControls?.querySelector("[aria-label=\"Reload snippets\"]");
        if (HeaderControls)
        {
            const ManageGroupsBtn = document.createElement("div");
            ManageGroupsBtn.className = "clickable-icon extra-setting-button";
            ManageGroupsBtn.ariaLabel = "Manage Snippet Groups";
            ManageGroupsBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" style="width: var(--icon-size); height: var(--icon-size);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-group-icon lucide-group">
                <path d="M12 5.56006H22" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
                <path d="M14.22 2H19.78C21.56 2 22 2.44 22 4.2V8.31C22 10.07 21.56 10.51 19.78 10.51H14.22C12.44 10.51 12 10.07 12 8.31V4.2C12 2.44 12.44 2 14.22 2Z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                <path d="M2 17.0601H12" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
                <path d="M4.22 13.5H9.78C11.56 13.5 12 13.94 12 15.7V19.81C12 21.57 11.56 22.01 9.78 22.01H4.22C2.44 22.01 2 21.57 2 19.81V15.7C2 13.94 2.44 13.5 4.22 13.5Z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                <path d="M22 15C22 18.87 18.87 22 15 22L16.05 20.25" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                <path d="M2 9C2 5.13 5.13 2 9 2L7.95001 3.75" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>`;
            ManageGroupsBtn.style.maxWidth = (HeaderControls.childNodes[0] as HTMLElement).style.width;
            ManageGroupsBtn.style.maxHeight = (HeaderControls.childNodes[0] as HTMLElement).style.height;
            HeaderControls.insertBefore(ManageGroupsBtn, HeaderControls.childNodes[0]);
            ManageGroupsBtn.addEventListener("click", () => {
                new ManageGroupsModal(this.app, this, () => {
                    // this.RefreshSnippets(snippets, groups, MenuContents);
                    // this.RefreshGroups(groups);
                    (ReloadSnippetsBtn as HTMLElement).click();
                }).open();
            })

            if (ReloadSnippetsBtn)
            {
                ReloadSnippetsBtn.addEventListener("click", () => {
                    this.observer.observe(document.body, { childList: true, subtree: true });
                }, { once: true })
            }
        }

        const groups : HTMLElement[] = [];
        const snippets : HTMLElement[] = [];
        
        // collect snippets
        let _s = Header?.nextElementSibling;
        while (_s)
        {
            snippets.push(_s as HTMLElement)
            _s = _s.nextElementSibling;
        }

        for (const group of this.settings.snippetGroups) {
            const groupElement = await this.NewGroupElement(group);
            Header?.parentElement?.append(groupElement);
            groups.push(groupElement);

            // drag n drop
            //#region
            groupElement.ondragover = (e) => {
                e.preventDefault();
                e.stopPropagation();
                groupElement.classList.add("is-being-dragged-over");
            }
            groupElement.ondragleave = (e) => {
                groupElement.classList.remove("is-being-dragged-over");
            }
            groupElement.ondrop = (e) => {
                e.stopPropagation();
                groupElement.classList.remove("is-being-dragged-over");
                const snippet = snippets[parseInt(e.dataTransfer?.getData("text/plain") ?? "-1")];
                let arrivingSnippetName = snippet.querySelector(".setting-item-name")?.textContent;
                if (snippet && arrivingSnippetName && snippet.parentElement)
                {
                    // is it already in another group?
                    if (snippet.parentElement.className == "tree-item-children"
                        && snippet.parentElement.parentElement?.parentElement)
                    {
                        let fromGroup = groups.indexOf(snippet.parentElement.parentElement?.parentElement);
                        if (fromGroup != -1)
                        {
                            this.settings.snippetGroups[fromGroup].snippets.remove(arrivingSnippetName);
                            group.snippets.push(arrivingSnippetName);
                            this.saveSettings();
                        }
                    }
                    groupElement.querySelector(".tree-item-children")?.appendChild(snippet);
                    group.snippets.push(arrivingSnippetName);
                    this.saveSettings();
                }
                this.RefreshSnippets(snippets, groups, MenuContents);
                this.RefreshGroups(groups);
            }
            //#endregion
        }

        for (const snippet of snippets)
        {
            snippet.style.pointerEvents = "auto";

            // move groups context menu
            snippet.oncontextmenu = (e) => {
                new Menu()
                    .addItem(item => item
                        .setTitle("Move snippet to...")
                        .setIcon("send-to-back")
                        .onClick((e) => {
                            let snippetsMenu = new Menu();
                            // move to "none"
                            snippetsMenu.addItem(item => item
                                .setTitle("None")
                                .onClick(() => {
                                    const name = snippet.querySelector(".setting-item-name")?.textContent;
                                    if (name)
                                    {
                                        // remove from old group
                                        const isInGroup = this.settings.snippetGroups.find(g => g.snippets.includes(name));
                                        if (isInGroup)
                                        {
                                            isInGroup.snippets.remove(name);
                                        }
                                        this.RefreshSnippets(snippets, groups, MenuContents);
                                        this.RefreshGroups(groups);
                                        new Notice(`Moved css snippet "${name}" into root area.`);
                                    }
                                })
                            )
                            // make option for each group
                            this.settings.snippetGroups.forEach(g => {
                                snippetsMenu.addItem(item => item
                                    .setTitle(g.name)
                                    .onClick(() => {
                                        const name = snippet.querySelector(".setting-item-name")?.textContent;
                                        if (name)
                                        {
                                            // remove from old group
                                            const isInGroup = this.settings.snippetGroups.find(g => g.snippets.includes(name));
                                            if (isInGroup)
                                            {
                                                isInGroup.snippets.remove(name);
                                            }
                                            g.snippets.push(name);
                                            this.RefreshSnippets(snippets, groups, MenuContents);
                                            this.RefreshGroups(groups);
                                            new Notice(`Moved css snippet "${name}" into snippet group "${g.name}".`);
                                        }
                                    })
                                )
                            })
                            snippetsMenu.showAtMouseEvent(e as MouseEvent);
                        })
                    )
                    .showAtMouseEvent(e);
            }

            // drag n drop
            snippet.draggable = true;
            snippet.ondragstart = (e) => {
                e.dataTransfer?.setData("text/plain", snippets.indexOf(snippet).toString());
            }
        }

        // drag n drop outside
        //#region
        MenuContents.ondragover = (e) => {
            e.preventDefault();
            MenuContents.classList.add("is-being-dragged-over");
        }
        MenuContents.ondragleave = (e) => {
            MenuContents.classList.remove("is-being-dragged-over");
        }
        MenuContents.ondrop = (e) => {
            MenuContents.classList.remove("is-being-dragged-over");
            const snippet = snippets[parseInt(e.dataTransfer?.getData("text/plain") ?? "-1")];
            let arrivingSnippetName = snippet.querySelector(".setting-item-name")?.textContent;
            if (snippet && arrivingSnippetName && snippet.parentElement)
            {
                // is it already in another group?
                if (snippet.parentElement.className == "tree-item-children"
                    && snippet.parentElement.parentElement?.parentElement)
                {
                    let fromGroup = groups.indexOf(snippet.parentElement.parentElement?.parentElement);
                    if (fromGroup != -1)
                    {
                        this.settings.snippetGroups[fromGroup].snippets.remove(arrivingSnippetName);
                        this.saveSettings();
                    }
                }

                MenuContents.appendChild(snippet);
            }
            this.RefreshSnippets(snippets, groups, MenuContents);
            this.RefreshGroups(groups);
        }
        //#endregion

        let scrollHeight = MenuContents?.scrollHeight ?? null;

        this.RefreshSnippets(snippets, groups, MenuContents);
        this.RefreshGroups(groups, true);
        
        // scroll height maintainer
        if (scrollHeight)
        {
            const ScrollMaintainer = document.createElement("div");
            Object.assign(ScrollMaintainer.style, {
                position: "absolute",
                top: "0",
                left: "0",
                width: "100%",
                height: scrollHeight + "px",
                pointerEvents: "none",
                visibility: "hidden",
                zIndex: "0",
            });
            MenuContents?.appendChild(ScrollMaintainer);
        }
    }

    RefreshSnippets(snippets : HTMLElement[], groups : HTMLElement[], MenuContents : HTMLElement)
    {
        for (const snippet of snippets)
        {
            const name = snippet.querySelector(".setting-item-name")?.textContent;
            if (name)
            {
                const group = this.settings.snippetGroups.find(g => g.snippets.includes(name));
                if (group)
                {
                    groups[this.settings.snippetGroups.indexOf(group)].querySelector(".tree-item-children")?.append(snippet);
                }
                else
                {
                    MenuContents?.append(snippet);
                }
            }
            else
            {
                MenuContents?.append(snippet);
            }
        }
    }

    RefreshGroups(groups : HTMLElement[], skipAnimation? : boolean)
    {
        groups.forEach(groupElement => {
            let group = this.settings.snippetGroups.find(g => g.name == groupElement.querySelector(".setting-item-name")?.textContent);
            if (group)
            {
                let collapsed = this.RedrawGroupSize(groupElement, group.collapsed, skipAnimation);
                group.collapsed = collapsed;
            }
            else
            {
                this.RedrawGroupSize(groupElement, undefined, skipAnimation);
            }
        })
    }

    NewGroupElement(group : SnippetGroup)
    {
        const groupElement = document.createElement("div");
        groupElement.className = "setting-item  nav-folder";
        groupElement.innerHTML = `
        <div class="setting-item-info" style="pointer-events: none;">
            <div class="nav-file-title" style="display: inline-flex; padding-left: 0px; width: 100%; pointer-events: auto;">
                <div class="collapse-icon is-collapsed" style="max-width: fit-content; margin-right: 10px">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon right-triangle">
                        <path d="M3 8L12 17L21 8"></path>
                    </svg>
                </div>
                <div class="setting-item-name" style="max-width: fit-content;">${group.name}</div>
            </div>
            <div style="padding-left: 3em; overflow: hidden; height: 0; display: none;
                        transition: height var(--anim-duration-moderate) var(--anim-motion-smooth);"
                        class="tree-item-children">
            </div>
        </div>`;

        groupElement.querySelector(".nav-file-title")?.addEventListener("click", HandleGroupClick.bind(this));
        if (group.collapsed == false) this.RedrawGroupSize(groupElement, false);

        function HandleGroupClick()
        {
            group.collapsed = !group.collapsed;
            group.collapsed = this.RedrawGroupSize(groupElement, group.collapsed);
            this.saveSettings();
        }

        return groupElement;
    }

    RedrawGroupSize(groupElement : HTMLElement, shouldDrawCollapsed? : boolean, skipAnimation? : boolean)
    {
        let container = groupElement.querySelector(".tree-item-children") as HTMLElement;
        let collapseIcon = groupElement.querySelector(".collapse-icon") as HTMLElement;
        let empty = container.childElementCount <= 0;

        if (shouldDrawCollapsed == null) shouldDrawCollapsed = container.style.height == "0px";
        if (empty) shouldDrawCollapsed = true;
        
        container.style.display = "";

        if (shouldDrawCollapsed)
        {
            container.style.height = "0px";
            collapseIcon.classList.add("is-collapsed");
        } 
        else
        {
            let svg = collapseIcon.querySelector("svg");
            let currentHeight = container.offsetHeight;
            container.style.height = "auto"
            // Directly setting auto doesnt animate, so we need to find its height
            // then set it back to normal, and then set the height in pixels.
            requestAnimationFrame(() => {
                let fitHeight = container.scrollHeight;
                container.style.height = currentHeight + "px";
                collapseIcon.classList.remove("is-collapsed");
                if (skipAnimation)
                {
                    container.style.height = fitHeight + "px";
                    if (svg)
                    {
                        svg.style.transition = "none";
                    }
                }
                requestAnimationFrame(() => {
                    container.style.height = fitHeight + "px";
                    if (skipAnimation && svg)
                    {
                        svg.style.transition = "";
                    }
                })
            })
        }

        container.addEventListener("transitionend", OnTransitionEnd);
        function OnTransitionEnd()
        {
            const isNowCollapsed = container.style.height == "0px";
            if (isNowCollapsed)
            {
                container.style.display = "none";
                container.removeEventListener("transitionend", OnTransitionEnd)
            }
        }

        return shouldDrawCollapsed;
    }
}

class ManageGroupsModal extends Modal {
    plugin: MyPlugin

    constructor(app: App, plugin: MyPlugin, closeCallback : () => void) {
        super(app);
        this.setTitle("Manage Snippet Groups");
        this.plugin = plugin;
        this.setCloseCallback(closeCallback)
    }

    onOpen() {
        this.contentEl.empty();

        console.log(this.plugin.settings.snippetGroups);
        this.plugin.settings.snippetGroups.forEach((group, i) => {
            new Setting(this.contentEl)
                .setName((i + 1).toString())
                .addText(text => text
                    .setValue(group.name)
                    .setPlaceholder("Name")
                    .onChange(value => {
                        group.name = value;
                        this.plugin.saveSettings();
                    })
                )
                .addButton(button => button
                    .setIcon("arrow-up")
                    .onClick(() => {
                        let arr = this.plugin.settings.snippetGroups;
                        if (i > 0) {
                            [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
                        }
                        this.plugin.saveSettings();
                        this.onOpen();
                    })
                )
                .addButton(button => button
                    .setIcon("arrow-down")
                    .onClick(() => {
                        let arr = this.plugin.settings.snippetGroups;
                        if (i < arr.length - 1) {
                            [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
                        }
                        this.plugin.saveSettings();
                        this.onOpen();
                    })
                )
                .addButton(button => button
                    .setIcon("delete")
                    .setWarning()
                    .onClick(() => {
                        this.plugin.settings.snippetGroups.remove(group);
                        this.plugin.saveSettings();
                        this.onOpen();
                    })
                );
        });

        new Setting(this.contentEl)
            .addButton(btn => btn
                .setButtonText("Add Group")
                .setCta()
                .onClick(() => {
                    this.plugin.settings.snippetGroups.push({
                        name: "New Group",
                        snippets: [],
                        collapsed: true,
                        order: this.plugin.settings.snippetGroups.length
                    });
                    this.plugin.saveSettings();
                    this.onOpen();
                })
            );
    }
}
