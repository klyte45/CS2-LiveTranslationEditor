import { Component } from "react";
import { VanillaComponentResolver } from "../VanillaComponentResolver";

type AmountValueSectionProps = {
    title?: string | JSX.Element;
    down: {
        tooltip?: string;
        onSelect: () => any;
        disabledFn?: () => boolean;
    };
    up: {
        tooltip?: string;
        onSelect: () => any;
        disabledFn?: () => boolean;
    };
    widthContent?: number,
    valueGetter: () => string;
    actions?: {
        icon: string,
        onSelect: () => any,
        tooltip?: string,
        selected?: boolean,
        disabledFn?: () => boolean
    }[]
};
export class AmountValueSection extends Component<AmountValueSectionProps> {

    render() {
        const baseUrl = "coui://GameUI/Media/Glyphs/";
        const arrowDownSrc = baseUrl + "ThickStrokeArrowDown.svg";
        const arrowUpSrc = baseUrl + "ThickStrokeArrowUp.svg";

        return <>
            <VanillaComponentResolver.instance.Section title={this.props.title}>
                <VanillaComponentResolver.instance.ToolButton
                    className={VanillaComponentResolver.instance.mouseToolOptionsTheme.startButton}
                    tooltip={this.props.down.tooltip}
                    onSelect={this.props.down.onSelect}
                    src={arrowDownSrc}
                    focusKey={VanillaComponentResolver.instance.FOCUS_DISABLED}
                    disabled={this.props.down.disabledFn?.()}
                ></VanillaComponentResolver.instance.ToolButton>
                <div className={VanillaComponentResolver.instance.mouseToolOptionsTheme.numberField} style={this.props.widthContent!! > 20 && this.props.widthContent!! < 247 ? { width: this.props.widthContent + "rem" } : this.props.title ? {} : { width: "247rem" }}>{this.props.valueGetter()}</div>
                <VanillaComponentResolver.instance.ToolButton
                    className={VanillaComponentResolver.instance.mouseToolOptionsTheme.endButton}
                    tooltip={this.props.up.tooltip}
                    onSelect={this.props.up.onSelect}
                    src={arrowUpSrc}
                    focusKey={VanillaComponentResolver.instance.FOCUS_DISABLED}
                    disabled={this.props.up.disabledFn?.()}
                ></VanillaComponentResolver.instance.ToolButton>
                {
                    <>
                        {this.props.actions?.map((x, i) =>
                            <VanillaComponentResolver.instance.ToolButton
                                key={i}
                                className={VanillaComponentResolver.instance.toolButtonTheme.button}
                                tooltip={x.tooltip}
                                onSelect={x.onSelect}
                                src={x.icon}
                                focusKey={VanillaComponentResolver.instance.FOCUS_DISABLED}
                                disabled={x.disabledFn?.()}
                            ></VanillaComponentResolver.instance.ToolButton>
                        )}
                    </>
                }
            </VanillaComponentResolver.instance.Section>
        </>

    }
}


