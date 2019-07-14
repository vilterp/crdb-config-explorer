import * as React from "react";
import { Configuration, SQLWrite } from "../model";
import { ConfigurationView } from "./configurationMatrix";
import { hopSequenceForSQLWrite } from "../readWrite";
import { HopSequenceView } from "./hopSequence";

export function SituationView(props: {
  config: Configuration;
  writes: { write: SQLWrite; desc: React.ReactNode }[];
}) {
  return (
    <>
      <ConfigurationView config={props.config} />
      {props.writes.length > 0 && (
        <>
          <h4>Simulated Writes</h4>
          {props.writes.map((write, idx) => {
            const hopSequence = hopSequenceForSQLWrite(
              props.config,
              write.write,
            );
            return (
              <div key={idx}>
                <h5>{write.desc}</h5>
                <WriteDesc write={write.write} />
                <HopSequenceView
                  formation={props.config.formation}
                  sequence={hopSequence}
                />
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
