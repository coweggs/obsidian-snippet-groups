<div align=center>
  <img width="250" height="250" alt="Snippet Groups Logo(1)" src="https://github.com/user-attachments/assets/5bd63119-eeca-45c8-a6f8-92293211adc4" />
  <br>
  Obsidian Snippet Groups hooks into the native obsidian settings appearance menu, letting you group your css snippets into categories (and a search bar).
  <br>
  <img src="https://img.shields.io/github/downloads/coweggs/obsidian-snippet-groups/total?style=plastic">
</div>

# Preview
<img width="1716" height="1025" alt="image" src="https://github.com/user-attachments/assets/f29f6362-8b89-4835-a21d-26410d6bc821" />
<img width="1237" height="787" alt="image" src="https://github.com/user-attachments/assets/ee18f35a-5212-4e23-9e35-5caf7b47e0e9" />

# How to Use:
1. Install the plugin (as of now via BRAT, or releases)
2. Head to the appearance tab, where your snippets usually are.
3. Press "Manage Snippet Groups" in the right toolbar (or right click a snippet, `Move snippet to > New Group`)<br><br><img width="400" height="168.3" alt="image" src="https://github.com/user-attachments/assets/a4bbdb83-08b9-4167-9e1a-ba56c7d102ce" />
4. Here you can create, delete, rename, and re-order your snippet groups.<br><br><img width="400" height="237" alt="image" src="https://github.com/user-attachments/assets/f1e5f65e-6969-4098-b459-38f19a4438ad" />
5. To add a snippet to a snippet group, simply drag and drop onto the snippet group, or you can right click the snippet, and move the snippet from there.<br><br><img width="400" height="39" alt="image" src="https://github.com/user-attachments/assets/ddf68e4a-9fd7-4f5f-92b7-44fcdffde42e" />

# Known Issues:
- Using [Obsidian Settings Search](https://github.com/javalent/settings-search) with a delay on [Lazy Plugin Loader](https://github.com/alangrainger/obsidian-lazy-plugins) causes settings modal to refresh, removing the plugin's effects. Simply reopnening the appearance tab fixes this.

# Supported Languages:
| Language | Status |
| --- | --- |
| English (en) | ✅ |
| Русский (ru) | ✅ |

### Want to help translate?
1. Fork the repo
2. Navigate to src/locales
3. Create a file, named `<language_code>.json` (Use [Obsidian's Translation Repo](https://github.com/obsidianmd/obsidian-translations) to find language codes.)
4. Copy over the format from `en.json`, and edit the values (dont touch `{{- snippet}` or anything similar)
5. Submit a pull request
