import * as React from "react";
import { Situation, SQLWrite } from "../model";
import { ConfigurationView } from "./configurationMatrix";
import { hopSequenceForSQLWrite, traceForSQLWrite } from "../readWrite";
import { HopSequenceView } from "./hopSequence";
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
          {props.writes.map((write, idx) => {
            const hopSequence = hopSequenceForSQLWrite(
              props.situation,
              write.write,
            );
            const trace = collapseTrace(
              traceForSQLWrite(props.situation, write.write),
            );
            return (
              <div key={idx}>
                <h5>{write.desc}</h5>
                <WriteDesc write={write.write} />
                <TraceView trace={trace} />
                {/*<HopSequenceView*/}
                {/*  formation={props.situation.config.formation}*/}
                {/*  sequence={hopSequence}*/}
                {/*/>*/}
              </div>
            );
          })}
        </>
      )}
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
