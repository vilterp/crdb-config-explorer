import * as React from "react";
import {
  Configuration,
  nodePathsForFormation,
  nodePathToStr,
  nodesInAZ,
  nodesInRegion
} from "../model";

export function ConfigurationView(props: { config: Configuration }) {
  return (
    <table className="config-view">
      <thead>
        <tr>
          <th className="formation-level-label">Region</th>
          {/* regions */}
          {props.config.formation.regions.map(region => (
            <th
              key={region.name}
              colSpan={nodesInRegion(region)}
              className="formation-node"
            >
              {region.name}
            </th>
          ))}
        </tr>
        <tr>
          <th className="formation-level-label">AZ</th>
          {/* az's */}
          {props.config.formation.regions.map(region =>
            region.azs.map(az => (
              <th
                key={az.name}
                colSpan={nodesInAZ(az)}
                className="formation-node"
              >
                {az.name}
              </th>
            ))
          )}
        </tr>
        <tr>
          <th className="formation-level-label">Node</th>
          {/* nodes */}
          {props.config.formation.regions.map(region =>
            region.azs.map(az =>
              az.nodes.map(node => (
                <th key={node.id} className="formation-node">
                  n{node.id}
                </th>
              ))
            )
          )}
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Table</td>
          {nodePathsForFormation(props.config.formation).map(path => (
            <td key={nodePathToStr(path)} className="cell">
              X
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  );
}
