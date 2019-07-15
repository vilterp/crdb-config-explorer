import React from "react";
import { ProcessNode, TraceNode } from "../model";

export function TraceView(props: { trace: TraceNode }) {
  return (
    <div>
      On n{props.trace.nodeID}, {props.trace.desc}.{" "}
      <ProcessNodeView process={props.trace.process} />
    </div>
  );
}

function ProcessNodeView(props: { process: ProcessNode }) {
  switch (props.process.type) {
    case "Leaf":
      return <>{props.process.desc}</>;
    case "Parallel":
      return (
        <>
          In parallel:
          <ul>
            {props.process.children.map((proc, idx) => (
              <li key={idx}>
                <ProcessNodeView process={proc} />
              </li>
            ))}
          </ul>
        </>
      );
    case "Sequence":
      return (
        <>
          In sequence:
          <ul>
            {props.process.children.map((proc, idx) => (
              <li key={idx}>
                <ProcessNodeView process={proc} />
              </li>
            ))}
          </ul>
        </>
      );
    case "RPC":
      return <TraceView trace={props.process.remoteTrace} />;
  }
}
