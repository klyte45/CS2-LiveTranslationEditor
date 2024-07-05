import { Component } from "react";
import { VanillaComponentResolver } from "../VanillaComponentResolver";

type VectorSectionProps = {
    title: string;
    valueGetter: () => string[];
};

export class VectorSection extends Component<VectorSectionProps> {

    render() {
        return <>
            <VanillaComponentResolver.instance.Section title={this.props.title}>
                {this.props.valueGetter()?.map((x, i) => <div key={i} className={VanillaComponentResolver.instance.mouseToolOptionsTheme.numberField}>{x}</div>)}
            </VanillaComponentResolver.instance.Section>
        </>;

    }
}

type VectorSectionEditableProps = {
    title: string;
    valueGetterFormatted: () => string[];
    valueGetter: () => string[];
    onValueChanged: (i: number, x: string) => any
};
export class VectorSectionEditable extends Component<VectorSectionEditableProps, { editingValue: string[], editingIdx: number }> {


    constructor(props: VectorSectionEditableProps) {
        super(props)
        this.state = {
            editingValue: [],
            editingIdx: -1
        }
    }

    render() {
        const formattedVals = this.props.valueGetterFormatted();
        const width = `${68 * 3 / formattedVals?.length ?? 1}rem`;
        return <>
            <VanillaComponentResolver.instance.Section title={this.props.title}>
                {this.props.valueGetter()?.map((x, i) => {
                    const onBlur = (x: any) => { this.props.onValueChanged(i, x.value); this.setState({ editingValue: [], editingIdx: -1 }) };
                    return <div key={i} style={{ position: "relative", width: width }} className={VanillaComponentResolver.instance.mouseToolOptionsTheme.numberField}>
                        <div style={{
                            opacity: this.state.editingIdx == i ? 0 : 1, pointerEvents: "none", display: "flex",
                            position: "absolute",
                            left: 0,
                            right: 0,
                            top: 0,
                            bottom: 0, width: width
                        }} className={VanillaComponentResolver.instance.mouseToolOptionsTheme.numberField}>{formattedVals[i]}</div>
                        <div style={{
                            opacity: this.state.editingIdx == i ? 1 : 0,
                            display: "flex",
                            position: "absolute",
                            left: 0,
                            right: 0,
                            top: 0,
                            bottom: 0, width: width
                        }} className={VanillaComponentResolver.instance.mouseToolOptionsTheme.numberField} onClick={() => {
                            var editingValue = [];
                            editingValue[i] = x;
                            return this.setState({ editingIdx: i, editingValue });
                        }}>
                            <input key={i}
                                className={VanillaComponentResolver.instance.mouseToolOptionsTheme.numberField}
                                style={{
                                    display: "flex",
                                    position: "absolute",
                                    left: 0,
                                    right: 0,
                                    top: 0,
                                    bottom: 0,
                                    border: "none",
                                    background: "none",
                                    color: "white",
                                    textAlign: "center",
                                    fontWeight: "normal",
                                    paddingTop: "5rem", width: width
                                }}
                                value={this.state.editingValue[i]}
                                onChange={e => {
                                    const newVal = this.state.editingValue;
                                    newVal[i] = e.target.value;
                                    this.setState({ editingValue: newVal });
                                }}
                                onBlur={(x) => onBlur(x.target)}
                                onKeyDownCapture={(x) => {
                                    if (x.key === "Enter") {
                                        onBlur(x.target);
                                        x.stopPropagation()
                                    } else if (x.key == "Escape") {
                                        // this.setState({ editingValue: [], editingIdx: -1 });
                                        // x.stopPropagation()
                                    }
                                }} />
                        </div>
                    </div>;
                })}
            </VanillaComponentResolver.instance.Section>
        </>;

    }
}
