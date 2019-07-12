import * as React from "react";
import {
  Configuration,
  NodePath,
  nodePathsForFormation,
  nodePathToStr,
  nodesInAZ,
  nodesInFormation,
  nodesInRegion,
  SchemaPath
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
          <td className="schema-node">Table "{props.config.table.name}"</td>
          <td colSpan={nodesInFormation(props.config.formation)} />
        </tr>
        {props.config.table.indexes.map(index => (
          <React.Fragment key={index.name}>
            <tr key={index.name}>
              <td style={schemaNodeStyle(1)} className="schema-node">
                Index "{index.name}"
              </td>
              <td colSpan={nodesInFormation(props.config.formation)} />
            </tr>
            {index.partitions.map(partition => (
              <tr key={`${index.name}/${partition.name}`}>
                <td
                  style={schemaNodeStyle(2)}
                  className="schema-node partition-node"
                >
                  Partition "{partition.name}"
                </td>
                {nodePathsForFormation(props.config.formation).map(nodePath =>
                  renderCell(nodePath, {
                    table: props.config.table,
                    index: index,
                    partition: partition
                  })
                )}
              </tr>
            ))}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );
}

function renderCell(
  nodePath: NodePath,
  schemaPath: SchemaPath
): React.ReactNode {
  const key = nodePathToStr(nodePath);
  const allocation = allocate(nodePath, schemaPath);
  const explanation = cellExplanation(schemaPath, nodePath, allocation);
  const className =
    allocation.type === "Data" ? "cell cell-data" : "cell cell-no-data";
  return <td key={key} title={explanation} className={className} />;
}

function schemaNodeStyle(depth: number) {
  return { paddingLeft: depth * 20 };
}

function cellExplanation(
  schemaPath: SchemaPath,
  nodePath: NodePath,
  all: Allocation
) {
  const presence = all.type === "Data" ? "present" : "not present";
  return `Data for partition "${schemaPath.partition.name}" of index "${schemaPath.index.name}" of table "${schemaPath.table.name}" is ${presence} on node ${nodePath.nodeID} in AZ ${nodePath.azName} of region ${nodePath.regionName}`;
}
