export interface SnippetGroup {
    name: string;
    snippets: string[];
    collapsed: boolean;
    order: number;
}

export interface Settings {
    snippetGroups: SnippetGroup[];
}

export const DEFAULT_SETTINGS: Settings = {
    snippetGroups: []
}