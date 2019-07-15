import * as React from "react";
import { ProcessNode, Situation, SQLWrite, TraceNode } from "../model";
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
  const [highlightedTrace, setHighlightedTrace] = useState<TraceNode>();

  const trace = collapseTrace(
    traceForSQLWrite(props.situation, props.write.write),
  );
  const hopSequence = hopSequenceForTrace(trace);
  return (
    <>
      <h5>{props.write.desc}</h5>
      <WriteDesc write={props.write.write} />
      <HopSequenceView
        formation={props.situation.config.formation}
        sequence={hopSequence}
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

function WriteDesc(props: { write: SQLWrite }) {
  const write = props.write;
  return (
    <p>
      Write from node <strong>n{write.gateWayNodeID}</strong> to table{" "}
      <strong>{write.tableName}</strong>, partition{" "}
      <strong>{write.partitionName}</strong>:
    </p>
  );
}
