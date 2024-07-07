import { Cs2FormLine, Cs2Select, SimpleInput, GameScrollComponent } from "@klyte45/euis-components";
import { EntriesData, LanguageEntry, ModEntry } from "./ModEntry";
import { State } from "./root.component";
import { FileService } from "./FileService";

type SetStateFn = (x: Partial<State>, callback?: () => any) => void;

export function getLangLabel(lang: string, props: State) {
  return lang ? `[${lang}] ${props.gameSupportedLangs[lang] ?? "???"}` : "<NONE>"
}

export function I18nEditorBody(props: State & { setState: SetStateFn }) {

  function setSourceLanguage(x: string): void {
    props.setState({ sourceLanguage: x })
  }
  function setTargetLanguage(x: string): void {
    props.setState({ targetLanguage: x })
  }

  function setGroupRegex(regex: string) {
    props.setState({ selectedGroup: regex })
  }

  const filteredEntries = Object.entries(props.loadedEntries?.entries ?? {})
    .filter(x => (!props.selectedGroup || x[0].match(props.selectedGroup)) && (!props.filterKeys?.trim() || x[0].match(props.filterKeys.trim())));

  const translated = props.targetLanguage && props.extraLoadedLangs?.[props.targetLanguage] && filteredEntries.filter(x => props.extraLoadedLangs[props.targetLanguage][x[0]]).length;

  return <>
    {props.selectedMod && !props.loadedError && props.loadedEntries &&
      <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-around", flexWrap: "wrap" }}>
        <Cs2FormLine title={"Source Language"} className="thirdSelect">
          {props.loadedEntries.availLangs.length + Object.keys(props.extraLoadedLangs ?? {}).length > 1 ? <Cs2Select
            options={props.loadedEntries.availLangs.concat(Object.keys(props.extraLoadedLangs ?? {})).map(x => { return { lang: x }; })}
            getOptionLabel={(x) => getLangLabel(x.lang, props)}
            getOptionValue={(x) => x.lang}
            onChange={(x) => setSourceLanguage(x.lang)}
            value={{ lang: props.sourceLanguage }} /> : getLangLabel(props.loadedEntries.availLangs[0], props)}
        </Cs2FormLine>
        <Cs2FormLine title={"Target Language"} className="thirdSelect">
          {Object.keys(props.extraLoadedLangs ?? {}).length > 1 ? <><Cs2Select
            options={Object.keys(props.extraLoadedLangs).map(x => { return { lang: x }; })}
            getOptionLabel={(x) => getLangLabel(x.lang, props)}
            getOptionValue={(x) => x.lang}
            onChange={(x) => setTargetLanguage(x.lang)}
            value={{ lang: props.targetLanguage }} /></> : getLangLabel(props.targetLanguage, props)}
        </Cs2FormLine>
        <Cs2FormLine title={"Key group"} className="halfSelect">
          {Object.keys(props.keyGroups ?? {}).length ? <Cs2Select
            options={[""].concat(Object.keys(props.keyGroups ?? {})).map(x => { return { regex: x }; })}
            getOptionLabel={(x) => x.regex ? props.keyGroups[x.regex] : "<ALL>"}
            getOptionValue={(x) => x.regex}
            onChange={(x) => setGroupRegex(x.regex)}
            value={{ regex: props.selectedGroup }} /> : "<ALL>"}
        </Cs2FormLine>
        <Cs2FormLine title={"Filter keys (regex)"} className="thirdSelect">
          <SimpleInput getValue={() => props.filterKeys} onValueChanged={(x) => {
            props.setState({ filterKeys: x });
            return x;
          }} />
        </Cs2FormLine>
      </div>}
    <GameScrollComponent>
      {props.selectedMod && <>
        {props.loadedError
          ? <>ERROR! {props.loadedError}</>
          : filteredEntries.map((e, i) => <EntryEditingColumn key={i} entry={e} state={props} setState={props.setState} />)}
      </>}
    </GameScrollComponent>
    {props.selectedMod && props.targetLanguage && <div className="footResume">{`${translated}/${filteredEntries.length} entries translated (${(translated / (filteredEntries?.length || 1) * 100).toFixed(1)}%)`}</div>}
  </>;
}


export function EntryEditingColumn(props: { key: number, entry: [string, LanguageEntry], state: State, setState: SetStateFn }): JSX.Element {
  const { entry, state, setState } = props;
  let missingArgs: string[]
  if (state.targetLanguage) {
    const currentValue = state.extraLoadedLangs[state.targetLanguage][entry[0]] ?? "";
    missingArgs = currentValue.trim().length > 0 ? entry[1].arguments.filter(x => currentValue.indexOf(`{${x}}`) < 0) : []
  }
  const srcText = entry[1].languages[state.sourceLanguage] ?? state.extraLoadedLangs[state.sourceLanguage][entry[0]];
  return <Cs2FormLine
    className="entryLine"
    title={srcText ?? <div className="emptyEntry">{"<EMPTY>"}</div>}
    subtitle={<><i className="key">{entry[0]}</i>{entry[1].comments && <div className="comment">{entry[1].comments}</div>}</>}>
    {state.targetLanguage && <>
      {!!missingArgs.length && <div className="validationErrors">{"Missing arguments!\n" + missingArgs.map(x => `{${x}}`).join(" ")}</div>}
      <textarea style={{ width: "30%" }}
        className={missingArgs.length ? "invalid" : ""}
        onChange={(x) => {
          state.extraLoadedLangs[state.targetLanguage][entry[0]] = x.target.value;
          setState({ extraLoadedLangs: state.extraLoadedLangs });
        }}
        value={state.extraLoadedLangs[state.targetLanguage][entry[0]] ?? ""} />
      <div className="actionBtns">
        <button className="neutralBtn" onClick={() => {
          state.extraLoadedLangs[state.targetLanguage][entry[0]] = srcText;
          setState({ extraLoadedLangs: state.extraLoadedLangs });
        }}>Copy from Source</button>
        <button className="neutralBtn" disabled={!srcText} onClick={() => {
          FileService.launchGoogleTranslateInBrowser(state.sourceLanguage, state.targetLanguage, srcText)
        }}>Try Google Translate</button>
      </div>
    </>}
  </Cs2FormLine>;
}
