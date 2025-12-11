import { Plugin } from 'obsidian';
import { Settings, DEFAULT_SETTINGS } from "types/Settings";
import { ModalObserver, NoticeObserver } from 'observers';
import { LocalisationManager } from 'managers/LocalisationManager';

export default class SnippetGroupsPlugin extends Plugin {
	settings: Settings;
    modalObserver: ModalObserver;
    noticeObserver: NoticeObserver;

	async onload() {
		await this.loadSettings();

        LocalisationManager.init();

        this.modalObserver = new ModalObserver();
        this.modalObserver.init(this);
        this.noticeObserver = new NoticeObserver();
        this.noticeObserver.init(this);
	}

	onunload() {
        this.modalObserver.disconnect();
        this.noticeObserver.disconnect();
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
