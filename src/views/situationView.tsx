import * as React from "react";
import { Configuration, SQLWrite } from "../model";
import { ConfigurationView } from "./configurationMatrix";
import { hopSequenceForSQLWrite } from "../readWrite";

export function SituationView(props: {
  config: Configuration;
  write: SQLWrite;
}) {
  const hopSequence = hopSequenceForSQLWrite(props.config, props.write);
  return (
    <>
      <ConfigurationView config={props.config} />
      <h4>Simulated Write</h4>
      <pre>{JSON.stringify(hopSequence, null, 2)}</pre>
    </>
  );
}
