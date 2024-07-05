import { TransportType } from "#enum/TransportType";
import { AutoColorService } from "#service/AutoColorService";
import { PaletteData, PaletteService } from "#service/PaletteService";
import { Cs2FormLine, Cs2Select } from "@klyte45/euis-components";
import translate from "#utility/translate"
import { ObjectTyped } from "object-typed";
import { Component } from "react";

type State = {
    availablePalettes: Record<string, PaletteData>,
    availablePassenger: TransportType[],
    availableCargo: TransportType[],
    passengerSettings: Partial<Record<TransportType, string>>,
    cargoSettings: Partial<Record<TransportType, string>>
}

function cargoNameFor(modal: TransportType) {
    return engine.translate(`Transport.ROUTES[${modal}]`);
}
function passengerNameFor(modal: TransportType) {
    return engine.translate(`Transport.LINES[${modal}]`);
}



export default class PaletteSetupSettings extends Component<any, State> {

    constructor(props) {
        super(props);
        this.state = {
            availableCargo: [],
            availablePalettes: {},
            availablePassenger: [],
            cargoSettings: {},
            passengerSettings: {}
        }
    }
    componentDidMount() {
        const _this = this;
        engine.whenReady.then(async () => {
            _this.reloadEverything();
            AutoColorService.doOnAutoColorSettingsChanged(() => _this.reloadEverything())
            PaletteService.doOnCityPalettesUpdated(() => _this.updatePalettes())
        })
    }
    private async reloadEverything() {
        await this.updatePalettes();
        await AutoColorService.cargoModalAvailable().then(x => this.setState({ availableCargo: x }));
        await AutoColorService.passengerModalAvailable().then(x => this.setState({ availablePassenger: x }));
        await AutoColorService.passengerModalSettings().then(x => this.setState({ passengerSettings: x }));
        await AutoColorService.cargoModalSettings().then(x => this.setState({ cargoSettings: x }));
    }

    private async updatePalettes() {
        const palettesSaved = await PaletteService.listCityPalettes();
        const defaultOptions = ([[void 0,
        {
            Name: translate("autoColorDisabled")
        } as PaletteData]] as [string, PaletteData][])
        this.setState({
            availablePalettes: ObjectTyped.fromEntries(defaultOptions.concat(palettesSaved.sort((a, b) => a.Name.localeCompare(b.Name, undefined, { sensitivity: "base" })).map(x => [x.GuidString, x])) as [string, PaletteData][])
        });
    }

    render() {
        return <>
            <h1>{translate("palettesSettings.title")}</h1>
            <section>
                <h2>{translate("palettesSettings.modalSettings")}</h2>
                <div className="sectionColumnContainer">
                    <section className="w50">
                        <h3>{translate("palettesSettings.passengerModalsTitle")}</h3>
                        {this.state.availablePassenger.map((tt, i) => {
                            return <Cs2FormLine title={passengerNameFor(tt)} key={i}>
                                <Cs2Select
                                    options={Object.values(this.state.availablePalettes)}
                                    getOptionLabel={(x) => x?.Name}
                                    getOptionValue={(x) => x?.GuidString}
                                    onChange={(x) => this.setPassengerPaletteGuid(tt, x.GuidString)}
                                    value={this.state.availablePalettes[this.state.passengerSettings[tt]]}
                                />
                            </Cs2FormLine>
                        })}
                    </section>
                    <section className="w50">
                        <h3>{translate("palettesSettings.cargoModalsTitle")}</h3>
                        {this.state.availableCargo.map((tt, i) => {
                            return <Cs2FormLine title={cargoNameFor(tt)} key={i}>
                                <Cs2Select
                                    options={Object.values(this.state.availablePalettes)}
                                    getOptionLabel={(x) => x?.Name}
                                    getOptionValue={(x) => x?.GuidString}
                                    onChange={(x) => this.setCargoPaletteGuid(tt, x.GuidString)}
                                    value={this.state.availablePalettes[this.state.cargoSettings[tt]]}
                                />
                            </Cs2FormLine>
                        })}
                    </section>
                </div>
            </section>
        </>;
    }
    setPassengerPaletteGuid(tt: TransportType, guid: string): void {
        AutoColorService.setModalAutoColor(tt, false, guid)
    }
    setCargoPaletteGuid(tt: TransportType, guid: string): void {
        AutoColorService.setModalAutoColor(tt, true, guid)
    }
}