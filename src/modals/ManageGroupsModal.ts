import { App, Modal, Setting } from "obsidian";
import { SnippetGroup } from "types/Settings";
import { ConfirmationModal } from "./ConfirmationModal"
import SnippetGroupsPlugin from "main";

export class ManageGroupsModal extends Modal {
    plugin: SnippetGroupsPlugin
    PreselectedGroup: SnippetGroup | undefined

    constructor(app: App, plugin: SnippetGroupsPlugin, closeCallback: () => void, preselectedGroup?: SnippetGroup) {
        super(app);
        this.plugin = plugin;
        this.PreselectedGroup = preselectedGroup;
        this.setTitle("Manage snippet groups");
        this.setCloseCallback(closeCallback)
    }

    onOpen() {
        this.contentEl.empty();
        this.plugin.settings.snippetGroups.forEach((group, i) => {
            let nameEntry: HTMLInputElement | undefined;
            new Setting(this.contentEl)
                .setName((i + 1).toString())
                .addText(text => {
                    text.setValue(group.name)
                        .setPlaceholder("Name")
                        .onChange(async value => {
                            group.name = value;
                            await this.plugin.saveSettings();
                        })
                    nameEntry = text.inputEl;
                })
                .addButton(button => button
                    .setIcon("arrow-up")
                    .onClick(async () => {
                        const arr = this.plugin.settings.snippetGroups;
                        if (i > 0) {
                            [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
                        }
                        await this.plugin.saveSettings();
                        this.onOpen();
                    })
                )
                .addButton(button => button
                    .setIcon("arrow-down")
                    .onClick(async () => {
                        const arr = this.plugin.settings.snippetGroups;
                        if (i < arr.length - 1) {
                            [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
                        }
                        await this.plugin.saveSettings();
                        this.onOpen();
                    })
                )
                .addButton(button => button
                    .setIcon("delete")
                    .setWarning()
                    .onClick(() => {
                        new ConfirmationModal(this.app, `Are you sure you want to delete "${group.name}"?`, async () => {
                            // confirmation callback
                            this.plugin.settings.snippetGroups.remove(group);
                            await this.plugin.saveSettings();
                            this.onOpen();
                        }).open()
                    })
                );
            if (group == this.PreselectedGroup && nameEntry)
            {
                requestAnimationFrame(() => {
                    (nameEntry as HTMLInputElement).focus();
                })
            }
        });

        new Setting(this.contentEl)
            .addButton(btn => btn
                .setButtonText("Add group")
                .setCta()
                .onClick(async () => {
                    this.plugin.settings.snippetGroups.push({
                        name: "New Group",
                        snippets: [],
                        collapsed: true,
                        order: this.plugin.settings.snippetGroups.length
                    });
                    await this.plugin.saveSettings();
                    this.onOpen();
                })
            );
    }
}