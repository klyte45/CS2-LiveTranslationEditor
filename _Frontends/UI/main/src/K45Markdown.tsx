import React from "react";
import "#styles/k45Markdown.scss"
import { FileService } from "./FileService";

const regexOlUl = /^(\s*([0-9]+\.|[+\-*])\s+)/g

enum OrderType {
  None,
  Ordered,
  Unordered
}


export function K45Markdown(props: { text: string }) {

  // function parseUL(textArr:string[], currentIdx: number, outputList: [])
  function tokenizeInlines(text: string) {
    if (text.match(/^ *#+ +/)) return [text.trimStart()];
    let output: (string | JSX.Element)[] = []
    let currentPosition = 0;
    let lineStart: string;
    if (lineStart = [...text.matchAll(regexOlUl)][0]?.[0]) {
      output.push(lineStart);
      currentPosition = lineStart.length;
    }

    const links = [...text.substring(currentPosition).matchAll(/\[([^\]]+)\]\((https?:\/\/[\-:+()~a-zA-Z0-9.\/?&#%=]+)\)/g)].sort((a, b) => text.indexOf(a[0]) - text.indexOf(b[0]));

    for (let link of links) {
      const nextPos = text.indexOf(link[0], currentPosition);
      parseAsterisks(text.substring(currentPosition, nextPos), 0, output)
      output.push(React.createElement("button", { onClick: () => FileService.openArbitraryUrl(link[2]) }, link[1]))
      currentPosition = nextPos + link[0].length;
    }

    currentPosition = parseAsterisks(text, currentPosition, output);
    return output;
  }

  function parseAsterisks(text: string, currentPosition: number, output: (string | JSX.Element)[]) {
    do {
      let nextOcurrence: number;
      if ((nextOcurrence = text.indexOf("*", currentPosition)) >= 0) {
        if (text[nextOcurrence - 1] == "\\" && text[nextOcurrence - 2] != "\\") {
          output.push(...ensureStartSpaces(text.substring(currentPosition, nextOcurrence - 1) + text[nextOcurrence]));
          currentPosition = nextOcurrence + 1;
          continue;
        }
        output.push(...ensureStartSpaces(text.substring(currentPosition, nextOcurrence)));
        currentPosition = nextOcurrence;
        let asteriskCount = 1;
        while (text[++currentPosition] == "*") {
          asteriskCount++;
        }
        let seekingDelimiter = "*".repeat(asteriskCount);
        if ((nextOcurrence = text.indexOf(seekingDelimiter, currentPosition)) >= 0) {
          const targetClass = asteriskCount == 1 ? "md_ital" : asteriskCount == 2 ? "md_bold" : "md_boldItal";
          output.push(React.createElement("div", { className: targetClass }, ensureStartSpaces(text.substring(currentPosition, nextOcurrence))));
          currentPosition = nextOcurrence + asteriskCount;
        }
      }
      else {
        output.push(...ensureStartSpaces(text.substring(currentPosition,)));
        break;
      }

    } while (currentPosition < text.length);
    return currentPosition;
  }

  function ensureStartSpaces(text: string) {
    return (text.startsWith(" ") ?
      "\u00a0" + text.substring(1)
      : text).replace("\\\\", "$%$%$%$%$%$%").replace(/\\(^$)/, "$1").replace("$%$%$%$%$%$%", "\\").split("\n").flatMap((x, i, arr) => {
        return i == arr.length - 1 ? [x] : x.trimEnd().match(/\\$/) ? [x.trimEnd().substring(0, x.trimEnd().length - 1), React.createElement("br")] : [x + " "];
      });
  }

  function processOlUl(bufferUlOl: (string | JSX.Element)[][], inheritedDepth: number = -1) {
    let refOffset = inheritedDepth;
    let orderType = OrderType.None;
    const elementOutput: JSX.Element[] = []

    let nextLine: (string | JSX.Element)[]
    let listCounter = 0;

    while (nextLine = bufferUlOl.shift()) {
      let indexIl = nextLine.shift() as string;
      const currentOffset = indexIl.match(/^ */)[0].length;
      const currentOrderType = indexIl.match(/^ *[\-+*]/) ? OrderType.Unordered : OrderType.Ordered
      if (refOffset < 0) refOffset = currentOffset
      if (orderType == OrderType.None) orderType = currentOrderType;
      if (Math.abs(refOffset + .5 - currentOffset) > 1) {
        nextLine.unshift(indexIl);
        bufferUlOl.unshift(nextLine);
        if (currentOffset > refOffset) {
          const prevEl = elementOutput.pop();
          prevEl.props.children[1].props.children.push(processOlUl(bufferUlOl, currentOffset))
          elementOutput.push(prevEl)
          continue;
        } else {
          break;
        }
      } else if (orderType != currentOrderType) {
        nextLine.unshift(indexIl);
        bufferUlOl.unshift(nextLine);
        break;
      }
      elementOutput.push(React.createElement("li", null, [
        React.createElement("div", { className: "listItemBefore" }, orderType == OrderType.Ordered ? `${++listCounter})` : `\u2022`),
        React.createElement("div", { className: "listContent" },
          [React.createElement("div", { className: "title" }, nextLine)]
        )]))
    }
    return React.createElement(orderType == OrderType.Ordered ? "ol" : "ul", null, elementOutput);
  }

  const componentList: (string | JSX.Element)[] = []
  const lines = props.text?.split("\n");
  let keyCtr = 0;
  let bufferUlOl: (string | JSX.Element)[][] = [];
  for (let index = 0; index < lines.length; index++) {
    let line = lines[index];
    if (line.trim().length == 0) continue;
    if (line.match(/^#+ /)) {
      const spaceIdx = line.indexOf(" ");
      const headerLvl = Math.min(6, spaceIdx)
      componentList.push(React.createElement("h" + headerLvl as any, { key: keyCtr++ }, line.substring(spaceIdx + 1)))
    } else {
      if (!line.match(regexOlUl)) {
        let nextLine: string
        while ((nextLine = lines[index + 1]) && nextLine.trim().length > 0 && !nextLine.startsWith("#") && !nextLine.match(regexOlUl)) {
          line += "\n" + nextLine;
          index++
        }
      }

      const tokens = tokenizeInlines(line);

      if (typeof tokens[0] == 'string' && tokens[0].match(regexOlUl)) {
        bufferUlOl.push(tokens);
      } else {
        if (bufferUlOl.length) {
          do {
            componentList.push(processOlUl(bufferUlOl));
          } while (bufferUlOl.length > 0)
        }
        componentList.push(React.createElement("p", null, tokens))
      }
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

  if (bufferUlOl.length) {
    do {
      componentList.push(processOlUl(bufferUlOl));
    } while (bufferUlOl.length > 0)
  }
  return <div className="k45_mdContainer">{componentList}</div>
}
