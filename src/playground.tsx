import React, { useState } from "react";
import { geoPartitionedReplicas } from "./patterns";
import { Pattern } from "./model";
import { SituationView } from "./views/situationView";

export function PlaygroundPage() {
  const [patternJSONStr, setPatternJSONStr] = useState<string>(
    JSON.stringify(geoPartitionedReplicas, null, 2),
  );

  return (
    <div className="container">
      <h1>Playground</h1>

      <table>
        <tbody>
          <tr style={{ verticalAlign: "top" }}>
            <td>
              <textarea
                className="playground"
                value={patternJSONStr}
                onChange={evt => setPatternJSONStr(evt.target.value)}
                rows={50}
                cols={70}
              >
                {patternJSONStr}
              </textarea>
            </td>
            <td style={{ padding: 20 }}>
              <PatternOrError res={parsePattern(patternJSONStr)} />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function PatternOrError(props: { res: Res<Pattern, string> }) {
  switch (props.res.type) {
    case "Ok":
      return (
        <>
          <h2>{props.res.res.name}</h2>
          <SituationView
            situation={props.res.res.situation}
            writes={props.res.res.writes}
          />
        </>
      );
    case "Err":
      return (
        <>
          <h3>Parse Error:</h3>
          <pre>{props.res.err}</pre>
        </>
      );
  }
}

type Res<A, E> = { type: "Ok"; res: A } | { type: "Err"; err: E };

function parsePattern(jsonStr: string): Res<Pattern, string> {
  let situ: Pattern;
  try {
    situ = JSON.parse(jsonStr);
  } catch (e) {
    return { type: "Err", err: e.toString() };
  }
  // TODO: validate the situation
  return { type: "Ok", res: situ };
}
