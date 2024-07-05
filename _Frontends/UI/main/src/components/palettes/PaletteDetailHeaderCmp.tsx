import { PaletteData } from "#service/PaletteService";
import { ColorUtils, GameScrollComponent } from "@klyte45/euis-components";
import { CSSProperties, Component } from "react";

export class PaletteDetailHeaderCmp extends Component<{ paletteData: PaletteData; }> {
    render() {
        return <>
            <div style={{ textAlign: "center", width: "100%", fontSize: "30rem" } as CSSProperties}>{this.props.paletteData.Name.split("/").pop()}</div>
            <div className="fullDivider" />
            <div className="colorShowcaseContainer" style={{ alignItems: "center", "--lineIconSizeMultiplier": 2 } as CSSProperties}>
                <GameScrollComponent>
                    <div className="colorShowcase">
                        {this.props.paletteData.ColorsRGB.map((clr, j) =>
                            <div className="lineIconContainer" key={j}>
                                <div className="lineIcon" style={{ "--lineColor": clr, "--contrastColor": ColorUtils.toRGBA(ColorUtils.getContrastColorFor(ColorUtils.toColor01(clr))) } as CSSProperties}>
                                    <div className={`routeNum singleLine chars${(j + 1)?.toString().length}`}> {j + 1}</div>
                                </div>
                            </div>
                        )}
                    </div>
                </GameScrollComponent>
            </div>
            <div className="fullDivider" />
        </>;
    }
}
