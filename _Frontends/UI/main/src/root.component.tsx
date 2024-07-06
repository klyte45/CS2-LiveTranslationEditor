///<reference path="euis.d.ts" />
import { Cs2FormLine, Cs2Select, DefaultPanelScreen, ErrorBoundary, GameScrollComponent, Input, SimpleInput } from "@klyte45/euis-components";
import "@klyte45/euis-components/src/styles/basiic-main.scss"
import { Component } from "react";
import { FileService } from "./FileService";
import { EntriesData, ModEntry } from "./ModEntry";

type State = {
  availableMods?: ModEntry[]
  selectedMod?: ModEntry
  loadedEntries?: EntriesData,
  loadedError?: number,
  sourceLanguage?: string,
  targetLanguage?: string,
  extraLoadedLangs?: { [lang: string]: Record<string, string> }
  filterKeysStarting?: string,
  gameSupportedLangs?: { [lang: string]: string },
  langSelectedToAdd?: string,
  isSavingFile?: boolean,
  fileSavedMsg?: boolean,
  errorCodeSaving?: number
}


export default class Root extends Component<any, State> {
  constructor(props) {
    super(props);
    this.state = {}
  }
  componentDidMount() {
    engine.whenReady.then(async () => {
      FileService.getModsAvailableToTranslate().then(x => this.setState({ availableMods: x }))
      FileService.getGameLanguages().then(x => this.setState({ gameSupportedLangs: x }))
    })
  }

  getLoadingContent() {
    return <h3>Loading</h3>
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

  getLoadedContent() {
    return <>
      <Cs2FormLine title={"Select mod"}>
        <Cs2Select
          options={Object.values(this.state.availableMods)}
          getOptionLabel={(x: ModEntry) => x?.modName.split(",")[0]}
          getOptionValue={(x: ModEntry) => x?.modId}
          onChange={(x: ModEntry) => this.selectEditingMod(x)}
          value={this.state.selectedMod}
        />
      </Cs2FormLine>
      {this.state.selectedMod && !this.state.loadedError && this.state.loadedEntries &&
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-around" }}>
          <Cs2FormLine title={"Source Language"} className="thirdSelect">
            {this.state.loadedEntries.availLangs.length > 1 ? <Cs2Select
              options={this.state.loadedEntries.availLangs.map(x => { return { lang: x } })}
              getOptionLabel={(x) => x.lang}
              getOptionValue={(x) => x.lang}
              onChange={(x) => this.setSourceLanguage(x.lang)}
              value={{ lang: this.state.sourceLanguage }}
            /> : this.state.loadedEntries.availLangs[0]}
          </Cs2FormLine>
          <Cs2FormLine title={"Target Language"} className="thirdSelect">
            {Object.keys(this.state.extraLoadedLangs ?? {}).length > 1 ? <><Cs2Select
              options={Object.keys(this.state.extraLoadedLangs).map(x => { return { lang: x } })}
              getOptionLabel={(x) => x.lang}
              getOptionValue={(x) => x.lang}
              onChange={(x) => this.setTargetLanguage(x.lang)}
              value={{ lang: this.state.targetLanguage }}
            /></> : this.state.targetLanguage ?? "<None>"}
          </Cs2FormLine>
          <Cs2FormLine title={"Filter keys starting with"} className="thirdSelect">
            <SimpleInput getValue={() => this.state.filterKeysStarting} onValueChanged={(x) => {
              this.setState({ filterKeysStarting: x });
              return x;
            }} />
          </Cs2FormLine>
        </div>}
      <GameScrollComponent>
        {this.state.selectedMod && <>
          {this.state.loadedError
            ? <>ERROR! {this.state.loadedError}</>
            : (Object.entries(this.state.loadedEntries?.entries ?? {})).filter(x => x[0].startsWith(this.state.filterKeysStarting ?? "")).map((e, i) => <Cs2FormLine
              className="entryLine"
              key={i}
              title={e[1].languages[this.state.sourceLanguage]}
              subtitle={<><i className="key">{e[0]}</i>{e[1].comments && <div className="comment">{e[1].comments}</div>}</>}>
              {this.state.targetLanguage && <textarea style={{ width: "40%" }}
                onChange={(x) => {
                  this.state.extraLoadedLangs[this.state.targetLanguage][e[0]] = x.target.value;
                  this.setState({ extraLoadedLangs: this.state.extraLoadedLangs });
                }}
                value={this.state.extraLoadedLangs[this.state.targetLanguage][e[0]] ?? ""}
              />}
            </Cs2FormLine>)}
        </>}
      </GameScrollComponent>
    </>
  }
  setSourceLanguage(x: string): void {
    this.setState({ sourceLanguage: x })
  }
  setTargetLanguage(x: string): void {
    this.setState({ targetLanguage: x })
  }

  selectEditingMod(entry: ModEntry) {
    this.setState({ selectedMod: entry }, () => this.loadEntries())
  }
  async loadEntries() {
    if (!this.state.selectedMod) return this.setState({ loadedEntries: undefined, loadedError: undefined });
    const newLoadedEntries: EntriesData = {
      availLangs: [],
      entries: {}
    }
    const mainFile = await FileService.readI18nCsv(this.state.selectedMod.mainFile, true);
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
    for (let extraFilePath of this.state.selectedMod.additionalFiles) {
      const extraFile = await FileService.readI18nCsv(extraFilePath, false);
      if (typeof extraFile == "number") continue;
      newExtraFilesAvail[extraFilePath.match(/[^a-zA-Z]([a-zA-Z0-9\-]+).csv/g)[1]] = Object.fromEntries(extraFile.entries.concat([extraFile.columnsInformation]));
    }
    return this.setState({ loadedEntries: newLoadedEntries, loadedError: undefined, sourceLanguage: "en-US", extraLoadedLangs: newExtraFilesAvail, targetLanguage: Object.keys(newExtraFilesAvail)[0] });
  }

  render() {
    return <>
      {/* <button style={{ position: "fixed", right: 0, top: 0, zIndex: 999 }} onClick={() => location.reload()}>RELOAD!!!</button> */}
      <ErrorBoundary>
        <DefaultPanelScreen title="Live Translation Editor" subtitle="Open csv translation files from mods to edit them ingame; share them with devs later!" buttonsRowContent={this.getButtons()}>
          {this.state.availableMods ? this.getLoadedContent() : this.getLoadingContent()}
        </DefaultPanelScreen>
      </ErrorBoundary>
    </>;
  }
}