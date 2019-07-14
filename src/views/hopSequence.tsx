import * as React from "react";
import { Formation, HopSequence, nodePathsForFormation } from "../model";
import { max } from "../arrays";
import classNames from "classnames";
import { useState } from "react";

const HORIZ_SPACING_PX = 30;
const LEFT_PADDING = 20;
const NODE_LINES_START = 30;

export function HopSequenceView(props: {
  formation: Formation;
  sequence: HopSequence;
}) {
  const [hoveredHopIdx, setHoveredHop] = useState<number | null>(null);

  const maxTime = max(props.sequence.hops.map(h => yForTime(h.end)));
  const linesHeight = yForTime(maxTime);
  return (
    <div className="hop-seq">
      <svg height={linesHeight}>
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
                  y2={linesHeight}
                />
              </g>
            );
          })}
        </g>
        <g>
          {props.sequence.hops.map((hop, idx) => (
            <line
              key={idx}
              className={classNames("hop-line", {
                "hop-line-cross-region":
                  hop.from.regionName !== hop.to.regionName,
                "hop-line-hovered": idx === hoveredHopIdx,
              })}
              // TODO: these are very thin and hard to mouse over...
              onMouseOver={() => setHoveredHop(idx)}
              onMouseOut={() => setHoveredHop(null)}
              x1={xForNode(hop.from.nodeID)}
              x2={xForNode(hop.to.nodeID)}
              y1={yForTime(hop.start)}
              y2={yForTime(hop.end)}
            />
          ))}
        </g>
      </svg>
      <ol>
        {props.sequence.hops.map((hop, idx) => (
          <li
            key={idx}
            className={classNames("hop-desc", {
              "hop-desc-hovered": idx === hoveredHopIdx,
            })}
            onMouseOver={() => setHoveredHop(idx)}
            onMouseOut={() => setHoveredHop(null)}
          >
            {hop.desc}
          </li>
        ))}
      </ol>
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
