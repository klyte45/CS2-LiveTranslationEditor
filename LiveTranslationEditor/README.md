This mod is an utility for mod creators and translators to test and create new translations for mods directly from inside the game. Modders can provide methods to hot reloading the translations and translators can check if the written translation makes sense where it is used.

Regular users (that not translates nor develop mods) ***DON'T NEED THIS MOD***

> NOTICE: EUIS applications integration reference at bottom of this page - for those coming from EUIS mod page

## References for translators

- This mod only have screens inside EUIS overlay/monitor. You will see a icon in the EUIS taskbar after adding this mod.
- Don't forget to enable EUIS mod to use this mod. You don't need to have more than on monitor, since that mod offers an option to open it over the main game screen (by default, when using Ctrl+Tab).
- After saving a translation file **be aware that they may be erased if the mod gets updated!** So copying it somewhere else after saving is highly recommended
- By now (07/JUL/24) only my mods (Klyte45) are using this system, but you only need this mod if you want to contribute with new translations.
- **YOU DON'T NEED THIS MOD TO USE ANY OTHER MOD THAT USES THIS TO CREATE TRANSLATIONS!**

### Utilities in this mod

- When translating an entry, you can use the buttons *Copy from source* to copy the value from the current source language to the translation you are doing.
- Also, you have an option to send the reference source value to be translated in Google Translator - it will open a window in your PC. You will need to manually copy the value from the site to the game.
- You can create a new translation file in the translation editor for any language currently registered in the game. 
    - Custom translations mods that registers itself at LocaleManager are added automatically
    - You can also create a file in the translations directory for a custom language not registered in the game, just follow the pattern `<language code>.csv` in the name. Ex: `uk.csv` might represent Ukranian language.
    - Custom languages may not work properly when asking translations to Google Translator. Feel free to ask me for a fix if necessary in this mod forums.
- You can select any language as reference for you translation.

## Mod developers reference

### Structure of i18n.csv 
It's a simple file with 2+ columns separated by **Tabs characters**. The first line is used to identify what are the contents in the other lines in file.

There are currently 3 column types that can be described in this file:

- Column **key**: Mandatory column that contains the key used by the game to find the translatin
- Language name columns: Columns with the translations for the key in the give language:
  - Use the game language code in the first line.
  - The column **en-US** (for English values) is required, but others can be added.
  - Languages added in this file cannot be translated inside the LTE screen
- Column **//**: Optional column with commentaries about this entry. Use it to tell important information about the entry, like where it is used in game.

### Structure of additional language files

The other language files - the ones created by this mod - are simpler than the i18n.csv file. They have just 2 columns:]

 - The first is the translation key
 - The second is the displayed string

### Escaping tabs and line breaks in the translation files

Use literally `\t` to represent tabs and `\n` to represent line breaks in translation contents. They shall be replaced internally by loader when loading the csv files.

### I18n files loader reference

[Belzont Commons library have a implementation compatible with files read/saved by this mod.](https://github.com/klyte45/CS2-BelzontCommons/blob/655cc16e347e4c4ce4ed707faeb4342d171c1fc9/Utils/BasicIMod.cs#L163)
You can freely use this code in your own projects, or fork the Belzont Commons to use the library itself. I don't recommend to use my version of the library since I can make breaking changes on it at any moment.


### Translation entries groups
Add a file named **keyGroups.json** with a sigle JSON object inside:
- The keys of the object will be used as REGEX expression against the translations keys to filter them
- The values will be displayed as group name at the dropdown selector

Example file based on EUIS Mod uses:
```json
{
    "^::":"Options menu",
    "^K45::EUIS.main":"EUIS Extra Screen OS",
    "^K45::EUIS.root":"Application selection app (\"start menu\")"
}
```

The order of the entries will be kept in the dropdown - the users may filter them by name there too.

### In-game instructions
Add a file with name **devInstructions.md** at the same folder of the main translation file to show instructions here as reference for the translator people working in your mod.
 
Interesting topics:
- How to test the saved translation in game? (hot reload files)
- Where to share files?
- Where is the main discussion of this mod translation work?

Supported markdown: 
  
- Headings using # (1x for biggest, 6x for smallest)   
- Lists:
  - Unordered lists using -, \\* or + at start of line
  - Ordered lists using ***1.*** pattern
  - Use two spaces to create a sublist. You may mix both types in different levels   
- Asterisks to emphasize text:
  - 1 asterisk *tuns text with the current accent color*
  - 2 asterisks **makes text bold**
  - 3 or more asterisks ***mixes color and boldness***  
- Links are allowed and will open the address in user browser.
  - Use pattern [<text to show>](<url to go, with protocol>)
  - Only http and https protocols supported
  - The link will appear in the text like a button and can be placed anywhere in text  
- To force line break in the end of a line, end it with a backslash (\\).
  - The backslash may be used to escape the below characters too
  - use two backslashes to show the backslash char: \\\\

Notice that it's a very simple markdown implementation and not all edge cases are tested due COUI limitations. Test your markdown before distributing with your mod.

## EUIS integration reference

- Go to `LiveTranslationEditorMod.cs` file
- Copy whole `#region EUIS utility` to the mod you want to integrate with EUIS
- Change the fields `EuisModderIdentifier`, `EuisModAcronym` and `LocalPort` for desired values (following EUIS rules)
- Replace closure contents of `EuisCallersRegister`, `SendEventToEuis` and `EuisTriggersRegister` to bind triggers/calls (read comments above them for details)
- Replace the content of the Dictionary `EuisApps`, using the application name as key and declaring a new app record like the sample from this mod. You can add how many apps you want.
- Add the line `GameManager.instance.RegisterUpdater(RegisterAtEuis);` inside your `OnLoad` method
- Done! Your mod EUIS applications will appear in all screens enabled.