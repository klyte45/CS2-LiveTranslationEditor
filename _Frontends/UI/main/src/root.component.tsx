///<reference path="euis.d.ts" />
import { Component } from "react";

type State = {
  lastIdx: number
  otherX: number
}


export default class Root extends Component<any, State> {
  constructor(props) {
    super(props);
    this.state = {
      lastIdx: -1,
      otherX: 92,
    }
  }
  componentDidMount() {
    engine.whenReady.then(() => {
      
    })
  }



  render() {
 
    return <>
      {/* <button style={{ position: "fixed", right: 0, top: 0, zIndex: 999 }} onClick={() => location.reload()}>RELOAD!!!</button> */}

    </>;


  }
}
