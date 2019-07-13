import * as React from "react";
import { Configuration, SQLWrite } from "../model";
import { ConfigurationView } from "./configurationMatrix";
import { hopSequenceForSQLWrite } from "../readWrite";
import { HopSequenceView } from "./hopSequence";

export function SituationView(props: {
  config: Configuration;
  write: SQLWrite;
}) {
  const hopSequence = hopSequenceForSQLWrite(props.config, props.write);
  return (
    <>
      <ConfigurationView config={props.config} />
      <h4>Simulated Write</h4>
      <WriteDesc write={props.write} />
      <HopSequenceView
        formation={props.config.formation}
        sequence={hopSequence}
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
