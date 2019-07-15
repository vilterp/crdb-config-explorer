import React from "react";
import { ProcessNode, TraceNode } from "../model";
import classNames from "classnames";

export function TraceView(props: {
  trace: TraceNode;
  highlightedTrace: TraceNode | undefined;
  setHighlightedTrace: (hp: TraceNode | undefined) => void;
}) {
  return (
    <ul className="trace-view">
      <li
        className={classNames("trace-node", {
          "trace-node-highlighted":
            JSON.stringify(props.highlightedTrace) ===
            JSON.stringify(props.trace),
        })}
        onMouseEnter={() => {
          console.log("setting", JSON.stringify(props.trace));
          props.setHighlightedTrace(props.trace);
        }}
        onMouseLeave={() => props.setHighlightedTrace(undefined)}
      >
        On n{props.trace.nodePath.nodeID}:{" "}
        <ProcessNodeView
          process={props.trace.process}
          highlightedTrace={props.highlightedTrace}
          setHighlightedTrace={props.setHighlightedTrace}
        />
      </li>
    </ul>
  );
}

function ProcessNodeView(props: {
  process: ProcessNode;
  highlightedTrace: TraceNode | undefined;
  setHighlightedTrace: (hp: TraceNode | undefined) => void;
}) {
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
                <ProcessNodeView
                  process={proc}
                  setHighlightedTrace={props.setHighlightedTrace}
                  highlightedTrace={props.highlightedTrace}
                />
              </li>
            ))}
          </ul>
        </>
      );
    case "RPC":
      return (
        <>
          call n{props.process.remoteTrace.nodePath.nodeID} to{" "}
          {props.process.desc}
          <TraceView
            trace={props.process.remoteTrace}
            setHighlightedTrace={props.setHighlightedTrace}
            highlightedTrace={props.highlightedTrace}
          />
        </>
      );
  }
}

export function collapseTrace(trace: TraceNode): TraceNode {
  switch (trace.process.type) {
    case "RPC":
      if (trace.nodePath.nodeID === trace.process.remoteTrace.nodePath.nodeID) {
        return collapseTrace(trace.process.remoteTrace);
      }
      return trace;
    case "Parallel":
      if (trace.process.children.length === 1) {
        return { nodePath: trace.nodePath, process: trace.process.children[0] };
      }
      return trace;
    default:
      return trace;
  }
}
