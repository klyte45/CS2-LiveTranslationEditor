import React from "react";
import "#styles/k45Markdown.scss"

export function K45Markdown(props: { text: string }) {

  // function parseUL(textArr:string[], currentIdx: number, outputList: [])
  function tokenizeInlines(text: string) {
    if (text.match(/^ *#+ +/)) return [text];
    let output: (string | JSX.Element)[] = []
    let currentPosition = 0;
    let lineStart: string;
    if (lineStart = [...text.matchAll(/^(\w*([0-9]+\.|[+\-*])\w+)/g)][0]?.[1]) {
      output.push(lineStart);
      currentPosition = lineStart.length;
    }

    do {
      let nextOcurrence: number
      if ((nextOcurrence = text.indexOf("*", currentPosition)) > 0) {
        if (text[nextOcurrence - 1] == "\\" && text[nextOcurrence - 2] != "\\") {
          output.push(...ensureStartSpaces(text.substring(currentPosition, nextOcurrence - 1) + text[nextOcurrence]));
          currentPosition = nextOcurrence + 1;
          continue;
        }
        output.push(...ensureStartSpaces(text.substring(currentPosition, nextOcurrence)));
        currentPosition = nextOcurrence
        let asteriskCount = 1;
        while (text[++currentPosition] == "*") {
          asteriskCount++;
        }
        let seekingDelimiter = "*".repeat(asteriskCount);
        if ((nextOcurrence = text.indexOf(seekingDelimiter, currentPosition)) >= 0) {
          const targetClass = asteriskCount == 1 ? "md_ital" : asteriskCount == 2 ? "md_bold" : "md_boldItal"
          output.push(React.createElement("div", { className: targetClass }, ensureStartSpaces(text.substring(currentPosition, nextOcurrence))));
          currentPosition = nextOcurrence + asteriskCount;
        }
      }
      else break;

    } while (currentPosition < text.length);
    return output;
  }

  function ensureStartSpaces(text: string) {
    return (text.startsWith(" ") ?
      "\u00a0" + text.substring(1)
      : text).replace("\\\\", "$%$%$%$%$%$%").replace("\\", "").replace("$%$%$%$%$%$%", "\\").split("\n").flatMap((x, i, arr) => i == arr.length - 1 ? [x] : [x, React.createElement("br")]);
  }


  const componentList: (string | JSX.Element)[] = []
  const lines = props.text?.split("\n");
  let keyCtr = 0;
  for (let index = 0; index < lines.length; index++) {
    let line = lines[index];
    if (line.trim().length == 0) continue;
    if (line.match(/^#+ /)) {
      const spaceIdx = line.indexOf(" ");
      const headerLvl = Math.min(6, spaceIdx)
      componentList.push(React.createElement("h" + headerLvl as any, { key: keyCtr++ }, line.substring(spaceIdx + 1)))
    } else {
      let nextLine: string
      while ((nextLine = lines[index + 1]) && nextLine.trim().length > 0 && !nextLine.startsWith("#")) {
        console.log("nextLine =>", nextLine, nextLine.trim().length)
        line += "\n" + nextLine;
        index++
      }
      componentList.push(React.createElement("p", null, tokenizeInlines(line)))
    }

    // if (line.match(/^[+\-*] /)) {
    //   const spaceIdx = line.indexOf(" ");
    //   const el = [React.createElement("li", { key: keyCtr++ }, line.substring(spaceIdx + 1))];
    //   let nextLine: string
    //   while ((nextLine = lines[++index]) && nextLine.match(/^[+\-*] /)) {
    //     el.push(React.createElement("li", { key: keyCtr++ }, nextLine.substring(nextLine.indexOf(" ") + 1)))
    //   }
    //   index--;
    //   componentList.push(React.createElement("ul", { key: keyCtr++ }, el))
    // }
  }

  return <div className="k45_mdContainer">{componentList}</div>
}
