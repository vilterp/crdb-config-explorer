import * as React from "react";
import {
  Configuration,
  Pattern,
  Situation,
  SQLWrite,
  TraceNode,
} from "../model";
import { SituationView } from "./configurationMatrix";
import { traceForSQLWrite } from "../readWrite";
import { hopSequenceForTrace, HopSequenceView } from "./hopSequence";
import { useState } from "react";
import { collapseTrace, TraceView } from "./traceView";
import { replaceAtIdx } from "../arrays";

export function PatternView(props: {
  pattern: Pattern;
  setPattern: (p: Pattern) => void;
}) {
  return (
    <>
      <SituationView
        situation={props.pattern.situation}
        setSituation={s => {
          props.setPattern({ ...props.pattern, situation: s });
        }}
      />
      {props.pattern.writes.length > 0 && (
        <>
          <h4>Simulated Writes</h4>
          {props.pattern.writes.map((write, idx) => (
            <WriteView
              key={idx}
              situation={props.pattern.situation}
              write={write}
              setWrite={(w) => {
                props.setPattern({
                  ...props.pattern,
                  writes: replaceAtIdx(props.pattern.writes, idx, {write: w, desc: write.desc})
                })
              }}
            />
          ))}
        </>
      )}
    </>
  );
}

function WriteView(props: {
  situation: Situation;
  write: { desc: React.ReactNode; write: SQLWrite };
  setWrite: (w: SQLWrite) => void;
}) {
  const [highlightedTrace, setHighlightedTrace] = useState<TraceNode>();

  const trace = collapseTrace(traceForSQLWrite(props.situation, props.write.write));
  const hopSequence = hopSequenceForTrace(trace);
  return (
    <>
      <h5>{props.write.desc}</h5>
      <WriteDesc
        write={props.write.write}
        setWrite={props.setWrite}
        config={props.situation.config}
      />
      <HopSequenceView
        formation={props.situation.config.formation}
        sequence={hopSequence}
        write={props.write.write}
        setWrite={props.setWrite}
        highlightedTrace={highlightedTrace}
        setHighlightedTrace={setHighlightedTrace}
      />
      <TraceView
        trace={trace}
        highlightedTrace={highlightedTrace}
        setHighlightedTrace={setHighlightedTrace}
      />
    </>
  );
}

function WriteDesc(props: {
  write: SQLWrite;
  setWrite: (w: SQLWrite) => void;
  config: Configuration;
}) {
  const write = props.write;
  const partitionNames = props.config.table.indexes[0].partitions.map(
    p => p.name,
  );
  return (
    <p>
      Write from node <strong>n{props.write.gateWayNodeID}</strong> to table{" "}
      <strong>{write.tableName}</strong>, partition{" "}
      <select
        value={write.partitionName}
        onChange={evt =>
          props.setWrite({ ...props.write, partitionName: evt.target.value })
        }
      >
        {partitionNames.map(pn => (
          <option>{pn}</option>
        ))}
      </select>
      :
    </p>
  );
}
