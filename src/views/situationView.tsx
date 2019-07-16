import * as React from "react";
import {
  Configuration,
  nodesInFormation,
  Situation,
  SQLWrite,
  TraceNode,
} from "../model";
import { ConfigurationView } from "./configurationMatrix";
import { traceForSQLWrite } from "../readWrite";
import { hopSequenceForTrace, HopSequenceView } from "./hopSequence";
import { useState } from "react";
import { collapseTrace, TraceView } from "./traceView";

export function SituationView(props: {
  situation: Situation;
  writes: { write: SQLWrite; desc: React.ReactNode }[];
}) {
  const [downNodeIDs, setDownNodeIDs] = useState(props.situation.downNodeIDs);

  return (
    <>
      <ConfigurationView
        config={props.situation.config}
        downNodeIDs={downNodeIDs}
        setDownNodeIDs={setDownNodeIDs}
      />
      {props.writes.length > 0 && (
        <>
          <h4>Simulated Writes</h4>
          {props.writes.map((write, idx) => (
            <WriteView key={idx} situation={props.situation} write={write} />
          ))}
        </>
      )}
    </>
  );
}

function WriteView(props: {
  situation: Situation;
  write: { desc: React.ReactNode; write: SQLWrite };
}) {
  const [write, setWrite] = useState<SQLWrite>(props.write.write);
  const [highlightedTrace, setHighlightedTrace] = useState<TraceNode>();

  const trace = collapseTrace(traceForSQLWrite(props.situation, write));
  const hopSequence = hopSequenceForTrace(trace);
  return (
    <>
      <h5>{props.write.desc}</h5>
      <WriteDesc
        write={write}
        setWrite={setWrite}
        config={props.situation.config}
      />
      <HopSequenceView
        formation={props.situation.config.formation}
        sequence={hopSequence}
        write={write}
        setWrite={setWrite}
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
          <option key={pn}>{pn}</option>
        ))}
      </select>
      :
    </p>
  );
}
