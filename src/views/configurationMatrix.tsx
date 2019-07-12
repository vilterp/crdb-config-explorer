import * as React from "react";
import {
  Configuration,
  nodePathsForFormation,
  nodePathToStr,
  nodesInAZ,
  nodesInFormation,
  nodesInRegion
} from "../model";
import { allocate, Allocation } from "../simulate";

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
          <td>Table "{props.config.table.name}"</td>
          <td colSpan={nodesInFormation(props.config.formation)} />
        </tr>
        {props.config.table.indexes.map(index => (
          <React.Fragment key={index.name}>
            <tr key={index.name}>
              <td style={schemaNodeStyle(1)}>Index "{index.name}"</td>
              <td colSpan={nodesInFormation(props.config.formation)} />
            </tr>
            {index.partitions.map(partition => (
              <tr key={`${index.name}/${partition.name}`}>
                <td style={schemaNodeStyle(2)}>Partition "{partition.name}"</td>
                {nodePathsForFormation(props.config.formation).map(nodePath =>
                  renderCell(
                    nodePathToStr(nodePath),
                    allocate(nodePath, {
                      index: index,
                      partition: partition
                    })
                  )
                )}
              </tr>
            ))}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );
}

function renderCell(key: string, allocation: Allocation): React.ReactNode {
  switch (allocation.type) {
    case "Data":
      return <td key={key} className="cell cell-data" />;
    case "NoData":
      return <td key={key} className="cell cell-no-data" />;
  }
}

function schemaNodeStyle(depth: number) {
  return { paddingLeft: depth * 20 };
}
