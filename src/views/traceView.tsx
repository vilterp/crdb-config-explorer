import React from "react";
import { ProcessNode, TraceNode } from "../model";
import classNames from "classnames";

export function TraceView(props: {
  trace: TraceNode;
  highlightedProc: ProcessNode | undefined;
  setHighlightedProc: (hp: ProcessNode | undefined) => void;
}) {
  return (
    <ul className="trace-view">
      <li>
        On n{props.trace.nodePath.nodeID}:{" "}
        <ProcessNodeView
          process={props.trace.process}
          highlightedProc={props.highlightedProc}
          setHighlightedProc={props.setHighlightedProc}
        />
      </li>
    </ul>
  );
}

function ProcessNodeView(props: {
  process: ProcessNode;
  highlightedProc: ProcessNode | undefined;
  setHighlightedProc: (hp: ProcessNode | undefined) => void;
}) {
  return (
    <span
      onMouseEnter={() => props.setHighlightedProc(props.process)}
      onMouseLeave={() => props.setHighlightedProc(undefined)}
      className={classNames("trace-node", {
        "trace-node-highlighted":
          JSON.stringify(props.highlightedProc) ===
          JSON.stringify(props.process),
      })}
    >
      {procContent(props)}
    </span>
  );
}

function procContent(props: {
  process: ProcessNode;
  highlightedProc: ProcessNode | undefined;
  setHighlightedProc: (hp: ProcessNode | undefined) => void;
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
                  setHighlightedProc={props.setHighlightedProc}
                  highlightedProc={props.highlightedProc}
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
            setHighlightedProc={props.setHighlightedProc}
            highlightedProc={props.highlightedProc}
          />
        </>
      );
  }
}

// export function TraceView(props: {
//   trace: TraceNode;
//   highlightedProc: ProcessNode | undefined;
//   setHighlightedProc: (hp: ProcessNode | undefined) => void;
// }) {
//   return (
//     <ul className="trace-view">
//       <TraceNodeView
//         traceNode={props.trace}
//         highlightedProc={props.highlightedProc}
//         setHighlightedProc={props.setHighlightedProc}
//       />
//     </ul>
//   );
// }
//
// function TraceNodeView(props: {
//   traceNode: TraceNode;
//   highlightedProc: ProcessNode | undefined;
//   setHighlightedProc: (hp: ProcessNode | undefined) => void;
// }) {
//   const children = renderChildren(props);
//   return (
//     <li
//       className={classNames("trace-node", {
//         "trace-node-highlighted":
//           // TODO: use just ===...
//           //   I can't tell why object identity is being lost...
//           //   sigh
//           JSON.stringify(props.traceNode.process) ===
//           JSON.stringify(props.highlightedProc),
//       })}
//       onMouseEnter={() => props.setHighlightedProc(props.traceNode.process)}
//       onMouseLeave={() => props.setHighlightedProc(undefined)}
//     >
//       On n{props.traceNode.nodePath.nodeID}: {descr(props.traceNode.process)}
//       {children.length > 0 ? (
//         <ul>
//           {children.map(c => (
//             <li>{c}</li>
//           ))}
//         </ul>
//       ) : null}
//     </li>
//   );
// }
//
// function descr(proc: ProcessNode): string {
//   switch (proc.type) {
//     case "Leaf":
//       return proc.desc;
//     case "Parallel":
//       return "in parallel:";
//     case "RPC":
//       return `call to n${proc.remoteTrace.nodePath.nodeID} to ${proc.desc}:`;
//   }
// }
//
// function renderChildren(props: {
//   traceNode: TraceNode;
//   highlightedProc: ProcessNode | undefined;
//   setHighlightedProc: (hp: ProcessNode | undefined) => void;
// }): React.ReactNode[] {
//   switch (props.traceNode.process.type) {
//     case "Leaf":
//       return [];
//     case "RPC":
//       return [
//         <TraceNodeView
//           traceNode={props.traceNode.process.remoteTrace}
//           highlightedProc={props.highlightedProc}
//           setHighlightedProc={props.setHighlightedProc}
//         />,
//       ];
//     case "Parallel":
//       return props.traceNode.process.children.map(c => (
//         <TraceNodeView
//           traceNode={{ nodePath: props.traceNode.nodePath, process: c }}
//           highlightedProc={props.highlightedProc}
//           setHighlightedProc={props.setHighlightedProc}
//         />
//       ));
//   }
// }

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
