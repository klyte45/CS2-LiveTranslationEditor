///<reference path="euis.d.ts" />
import { Cs2FormLine, Cs2Select, DefaultPanelScreen, ErrorBoundary, GameScrollComponent } from "@klyte45/euis-components";
import "@klyte45/euis-components/src/styles/basiic-main.scss";
import { Component } from "react";
import { FileService } from "./FileService";
import { I18nEditorBody } from "./I18EditorBody";
import { EntriesData, ModEntry } from "./ModEntry";
import { jsx, jsxs } from "react/jsx-runtime";
import React from "react";
import { K45Markdown } from "./K45Markdown";

export type State = {
  availableMods?: ModEntry[]
  selectedMod?: ModEntry
  loadedEntries?: EntriesData,
  loadedError?: number,
  sourceLanguage?: string,
  targetLanguage?: string,
  extraLoadedLangs?: { [lang: string]: Record<string, string> }
  filterKeys?: string,
  gameSupportedLangs?: { [lang: string]: string },
  langSelectedToAdd?: string,
  isSavingFile?: boolean,
  fileSavedMsg?: boolean,
  errorCodeSaving?: number
  keyGroups?: Record<string, string>
  selectedGroup?: string,
  instructionsView?: boolean
  loadedMdText?: string
}


export default class Root extends Component<any, State> {
  constructor(props) {
    super(props);
    this.state = {}
  }
  componentDidMount() {
    engine.whenReady.then(async () => {
      FileService.getModsAvailableToTranslate().then(x => { console.log(x); this.setState({ availableMods: x }) })
      FileService.getGameLanguages().then(x => this.setState({ gameSupportedLangs: x }))
    })
  }

  getLoadingContent() {
    return
  }

  getButtons() {
    if (!(this.state.selectedMod && !this.state.loadedError && this.state.loadedEntries)) return;
    const filledLanguages = this.state.loadedEntries.availLangs.concat(Object.keys(this.state.extraLoadedLangs ?? {}))
    const missingDefaultGameLanguages = Object.keys(this.state.gameSupportedLangs).filter(x => !filledLanguages.includes(x));
    return <>
      <button className="positiveBtn" disabled={!this.state.targetLanguage || this.state.isSavingFile || this.state.fileSavedMsg} onClick={() => this.saveCurrentFile()}>{
        this.state.errorCodeSaving ? "Error saving file: " + this.state.errorCodeSaving
          : this.state.fileSavedMsg ? "File saved!"
            : this.state.isSavingFile ? "Saving file..."
              : "Save current target language file"}</button>
      <button className="neutralBtn" onClick={() => FileService.openFileInExplorer(this.state.selectedMod.mainFile)}>Go to translations folder</button>
      <div style={{ flexGrow: 1 }} />
      {
        this.state.instructionsView
          ? <button className="neutralBtn" onClick={() => this.setState({ instructionsView: false })}>Back to editor</button>
          : <button className="neutralBtn" onClick={() => this.loadMdInstructions()}>Check mod dev instructions</button>
      }
      <div style={{ flexGrow: 1 }} />
      {
        missingDefaultGameLanguages && <div className="belowSelectorWithBtn"><Cs2Select
          options={missingDefaultGameLanguages.map(x => { return { lang: x } })}
          getOptionLabel={(x) => x.lang && `${this.state.gameSupportedLangs[x.lang]} (${x.lang})`}
          getOptionValue={(x) => x.lang}
          onChange={(x) => this.setLangToAdd(x.lang)}
          value={{ lang: this.state.langSelectedToAdd }}
        /><button disabled={!this.state.langSelectedToAdd} className="positiveBtn" onClick={() => this.addLang()}>Add Translation</button></div>
      }
    </>
  }
  async loadMdInstructions() {
    const mdText = await FileService.loadInstructions(this.state.selectedMod.modId, this.state.selectedMod.mainFile);
    this.setState({ instructionsView: true, loadedMdText: mdText || "???" });
  }

  saveCurrentFile(): void {
    this.setState({ isSavingFile: true }, async () => {
      const result = await FileService.saveI18nCsv(this.state.selectedMod.modId, this.state.selectedMod.mainFile, this.state.targetLanguage, Object.entries(this.state.extraLoadedLangs[this.state.targetLanguage] ?? {}))
      if (typeof result == "number")
        this.setState({ errorCodeSaving: result }, () => {
          setTimeout(() => this.setState({ isSavingFile: false, fileSavedMsg: false }), 5000);
        })
      else
        this.setState({ fileSavedMsg: true }, () => {
          setTimeout(() => this.setState({ isSavingFile: false, fileSavedMsg: false }), 5000);
        })
    })
  }
  addLang(): void {
    if (!this.state.langSelectedToAdd) return;
    this.state.extraLoadedLangs[this.state.langSelectedToAdd] = {}
    this.setState({ extraLoadedLangs: this.state.extraLoadedLangs, targetLanguage: this.state.targetLanguage ?? this.state.langSelectedToAdd, langSelectedToAdd: undefined })
  }

  setLangToAdd(lang: string): void {
    this.setState({ langSelectedToAdd: lang })
  }


  async selectEditingMod(entry: ModEntry) {
    await new Promise((x) => this.setState({
      selectedMod: undefined,
      langSelectedToAdd: undefined,
      selectedGroup: undefined,
      keyGroups: undefined,
      loadedEntries: undefined,
      loadedError: undefined,
      sourceLanguage: undefined,
      extraLoadedLangs: undefined,
      targetLanguage: undefined
    }, () => x(0)));
    if (!entry) return;
    const newLoadedEntries: EntriesData = {
      availLangs: [],
      entries: {}
    }
    const mainFile = await FileService.readI18nCsv(entry.mainFile, true);
    if (typeof mainFile == "number") return this.setState({ loadedEntries: undefined, loadedError: mainFile });
    newLoadedEntries.availLangs.push(...mainFile.columnsInformation.filter(x => !["key", "//", "/opt"].includes(x)))
    const keyIdx = mainFile.columnsInformation.indexOf("key");
    const commIdx = mainFile.columnsInformation.indexOf("//");
    const optIdx = mainFile.columnsInformation.indexOf("/opt");
    const enIdx = mainFile.columnsInformation.indexOf("en-US");
    for (let entry of mainFile.entries.sort((a, b) => a[keyIdx].localeCompare(b[keyIdx]))) {
      const key = entry[keyIdx].trim();
      if (!key) continue;
      newLoadedEntries.entries[key] = {
        languages: {},
        comments: entry[commIdx] ?? undefined,
        opts: parseInt(entry[optIdx]) || 0,
        arguments: [...entry[enIdx].matchAll(/\{([^}]+)\}/g)].map(x => x[1])
      }
      for (let j = 0; j < mainFile.columnsInformation.length; j++) {
        if ([keyIdx, commIdx, optIdx].includes(j)) continue;
        newLoadedEntries.entries[key].languages[mainFile.columnsInformation[j].trim()] = entry[j];
      }
    }
    const newExtraFilesAvail: { [lang: string]: Record<string, string> } = {}
    for (let extraFilePath of entry.additionalFiles) {
      const extraFile = await FileService.readI18nCsv(extraFilePath, false);
      if (typeof extraFile == "number") {
        console.log(extraFile)
        continue;
      }
      newExtraFilesAvail[[...extraFilePath.matchAll(/[^a-zA-Z]([a-zA-Z0-9\-]+).csv/g)][0][1]] = Object.fromEntries(extraFile.entries);
    }
    const keyGroups = await FileService.loadKeysGroups(entry.modId, entry.mainFile);

    this.setState({
      selectedMod: entry,
      langSelectedToAdd: undefined,
      selectedGroup: undefined,
      keyGroups: Object.fromEntries(keyGroups || []),
      loadedEntries: newLoadedEntries,
      loadedError: undefined,
      sourceLanguage: "en-US",
      extraLoadedLangs: newExtraFilesAvail,
      targetLanguage: Object.keys(newExtraFilesAvail)[0]
    });
  }

  render() {
    return <>
      <button style={{ position: "fixed", right: 0, top: 0, zIndex: 999 }} onClick={() => location.reload()}>RELOAD!!!</button>
      <ErrorBoundary>
        <DefaultPanelScreen title="Live Translation Editor" subtitle="Open csv translation files from mods to edit them ingame; share them with devs later!" buttonsRowContent={this.getButtons()}>
          {
            this.state.availableMods && <>
              <Cs2FormLine title={"Select mod"}>
                <Cs2Select
                  options={Object.values(this.state.availableMods)}
                  getOptionLabel={(x: ModEntry) => x?.modName.split(",")[0]}
                  getOptionValue={(x: ModEntry) => x?.modId}
                  onChange={(x: ModEntry) => this.selectEditingMod(x)}
                  value={this.state.selectedMod} />
              </Cs2FormLine>
              {this.state.instructionsView ? <>
                <GameScrollComponent>
                  <K45Markdown text={this.state.loadedMdText} />
                </GameScrollComponent>
              </> : <I18nEditorBody {...this.state} setState={(a, b) => this.setState(a, b)} />}
            </>
          }
          {!this.state.availableMods && <h3>Loading</h3>}

        </DefaultPanelScreen>

      </ErrorBoundary>
    </>;
  }
}

