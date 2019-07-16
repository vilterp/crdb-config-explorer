import * as React from "react";
import {
  Formation,
  Hop,
  HopSequence,
  NodePath,
  nodePathsForFormation,
  SQLWrite,
  TraceNode,
} from "../model";
import { max } from "../arrays";
import classNames from "classnames";

const HORIZ_SPACING_PX = 30;
const LEFT_PADDING = 20;
const NODE_LINES_START = 30;

export function HopSequenceView(props: {
  formation: Formation;
  sequence: HopSequence;
  highlightedTrace: TraceNode | undefined;
  setHighlightedTrace: (hp: TraceNode | undefined) => void;
  write: SQLWrite;
  setWrite: (w: SQLWrite) => void;
}) {
  const maxTime = max(props.sequence.map(h => yForTime(h.end)));
  const linesHeight = yForTime(maxTime);
  return (
    <div className="hop-seq">
      <svg height={linesHeight}>
        <g>
          {nodePathsForFormation(props.formation).map(nodePath => {
            const x = xForNode(nodePath.nodeID);
            return (
              <g key={nodePath.nodeID}>
                <text
                  className="node-label"
                  x={x - 10}
                  y={20}
                  onClick={() =>
                    props.setWrite({
                      ...props.write,
                      gateWayNodeID: nodePath.nodeID,
                    })
                  }
                >
                  n{nodePath.nodeID}
                </text>
                <line
                  className="node-line"
                  x1={x}
                  x2={x}
                  y1={NODE_LINES_START}
                  y2={linesHeight}
                />
              </g>
            );
          })}
        </g>
        <g>
          {props.sequence.map((hop, idx) => (
            <line
              key={idx}
              className={classNames("hop-line", {
                "hop-line-cross-region":
                  hop.from.regionName !== hop.to.regionName,
                // TODO: use just ===...
                //   I can't tell why object identity is being lost...
                //   sigh
                "hop-line-hovered":
                  JSON.stringify(hop.traceNode) ===
                  JSON.stringify(props.highlightedTrace),
              })}
              // TODO: these are very thin and hard to mouse over...
              onMouseOver={() => props.setHighlightedTrace(hop.traceNode)}
              onMouseOut={() => props.setHighlightedTrace(undefined)}
              x1={xForNode(hop.from.nodeID)}
              x2={xForNode(hop.to.nodeID)}
              y1={yForTime(hop.start)}
              y2={yForTime(hop.end)}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}

// relies on nodeIDs increasing from left to right
function xForNode(nodeID: number): number {
  return nodeID * HORIZ_SPACING_PX + LEFT_PADDING;
}

function yForTime(time: number): number {
  return NODE_LINES_START + time;
}

export function hopSequenceForTrace(trace: TraceNode): Hop[] {
  return hopSequenceRecurse(0, trace);
}

function latency(fromNode: NodePath, toNode: NodePath): number {
  // TODO: more realistic...
  if (fromNode.regionName === toNode.regionName) {
    return 10;
  }
  return 100;
}

function hopSequenceRecurse(start: number, trace: TraceNode): Hop[] {
  const proc = trace.process;
  const nodePath = trace.nodePath;
  switch (proc.type) {
    case "Parallel":
      return proc.children.flatMap(child =>
        hopSequenceRecurse(start, { nodePath, process: child }),
      );
    case "RPC":
      const hopLatency = latency(nodePath, proc.remoteTrace.nodePath);
      const remoteNodePath = proc.remoteTrace.nodePath;
      const remoteHops = hopSequenceRecurse(start + hopLatency, {
        nodePath: remoteNodePath,
        process: proc.remoteTrace.process,
      });
      const remoteHopsDone = max(remoteHops.map(h => h.end));
      return [
        {
          from: nodePath,
          to: remoteNodePath,
          start: start,
          end: start + hopLatency,
          traceNode: trace,
        },
        ...remoteHops,
        {
          from: remoteNodePath,
          to: nodePath,
          start: remoteHopsDone,
          end: remoteHopsDone + hopLatency,
          traceNode: trace,
        },
      ];
    case "Leaf":
      return [
        {
          from: nodePath,
          to: nodePath,
          start: start,
          end: start + proc.duration,
          traceNode: trace,
        },
      ];
  }
}
