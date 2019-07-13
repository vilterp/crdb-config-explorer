import * as React from "react";
import { Formation, HopSequence, nodePathsForFormation } from "../model";
import { max } from "../arrays";

const HORIZ_SPACING_PX = 30;
const LEFT_PADDING = 20;
const NODE_LINES_START = 30;

export function HopSequenceView(props: {
  formation: Formation;
  sequence: HopSequence;
}) {
  const maxTime = max(props.sequence.hops.map(h => yForTime(h.end)));
  const linesEnd = yForTime(maxTime);
  return (
    <svg className="hop-seq" height={linesEnd}>
      <g>
        {nodePathsForFormation(props.formation).map(nodePath => {
          const x = xForNode(nodePath.nodeID);
          return (
            <g key={nodePath.nodeID}>
              <text x={x - 10} y={20} className="node-label">
                n{nodePath.nodeID}
              </text>
              <line
                className="node-line"
                x1={x}
                x2={x}
                y1={NODE_LINES_START}
                y2={linesEnd}
              />
            </g>
          );
        })}
      </g>
      <g>
        {props.sequence.hops.map((hop, idx) => (
          <line
            key={idx}
            className={"hop-line"}
            x1={xForNode(hop.from.nodeID)}
            x2={xForNode(hop.to.nodeID)}
            y1={yForTime(hop.start)}
            y2={yForTime(hop.end)}
          />
        ))}
      </g>
    </svg>
  );
}

// relies on nodeIDs increasing from left to right
function xForNode(nodeID: number): number {
  return nodeID * HORIZ_SPACING_PX + LEFT_PADDING;
}

function yForTime(time: number): number {
  return NODE_LINES_START + time;
}
