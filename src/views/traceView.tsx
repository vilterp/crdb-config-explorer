import React from "react";
import { ProcessNode, TraceNode } from "../model";

export function TraceView(props: { trace: TraceNode }) {
  return (
    <ul>
      <TraceNodeView traceNode={props.trace} />
    </ul>
  );
}

function TraceNodeView(props: { traceNode: TraceNode }) {
  const children = renderChildren(props.traceNode);
  return (
    <li>
      On n{props.traceNode.nodeID}: {descr(props.traceNode.process)}
      {children.length > 0 ? (
        <ul>
          {children.map(c => (
            <li>{c}</li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function descr(proc: ProcessNode): string {
  switch (proc.type) {
    case "Leaf":
      return proc.desc;
    case "Parallel":
      return "in parallel:";
    case "Sequence":
      return "in sequence:";
    case "RPC":
      return `call to n${proc.remoteTrace.nodeID} to ${proc.desc}:`;
  }
}

function renderChildren(trace: TraceNode): React.ReactNode[] {
  switch (trace.process.type) {
    case "Leaf":
      return [];
    case "RPC":
      return [<TraceNodeView traceNode={trace.process.remoteTrace} />];
    case "Sequence":
      return trace.process.children.map(c => (
        <TraceNodeView traceNode={{ nodeID: trace.nodeID, process: c }} />
      ));
    case "Parallel":
      return trace.process.children.map(c => (
        <TraceNodeView traceNode={{ nodeID: trace.nodeID, process: c }} />
      ));
  }
}
