import React, { useState } from "react";
import { geoPartitionedReplicas, PATTERNS } from "./patterns";
import { Pattern } from "./model";
import { PatternView } from "./views/patternView";
import { Link } from "react-router-dom";

export function PlaygroundPage() {
  const [patternJSONStr, setPatternJSONStr] = useState<string>(
    JSON.stringify(geoPartitionedReplicas, null, 2),
  );

  const [presetPatternID, setPresetPatternID] = useState(
    geoPartitionedReplicas.id,
  );

  return (
    <>
      <p>
        <Link to="/">&lt; Patterns</Link>
      </p>

      <h1>Playground</h1>

      <p>Edit and simulate a pattern, either visually or as JSON.</p>

      <p>
        Try a preset pattern:{" "}
        <select
          value={presetPatternID}
          onChange={evt => {
            setPresetPatternID(evt.target.value);
            setPatternJSONStr(
              JSON.stringify(
                PATTERNS.find(p => p.id === evt.target.value) ||
                  geoPartitionedReplicas,
                null,
                2,
              ),
            );
          }}
        >
          {PATTERNS.map(p => (
            <option value={p.id}>{p.name}</option>
          ))}
        </select>
      </p>

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
            <td style={{ paddingLeft: 20 }}>
              <PatternOrError
                res={parsePattern(patternJSONStr)}
                setPattern={p => setPatternJSONStr(JSON.stringify(p, null, 2))}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
}

function PatternOrError(props: {
  res: Res<Pattern, string>;
  setPattern: (p: Pattern) => void;
}) {
  switch (props.res.type) {
    case "Ok":
      return (
        <>
          <h2>{props.res.res.name}</h2>
          <PatternView pattern={props.res.res} setPattern={props.setPattern} />
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
