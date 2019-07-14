import * as React from "react";
import {
  Configuration,
  NodePath,
  nodePathsForFormation,
  nodePathToStr,
  nodesInAZ,
  nodesInFormation,
  nodesInRegion,
  partitionsInIndex,
  partitionsInTable,
  SchemaPath,
} from "../model";
import { allocate, Allocation } from "../allocate";
import classNames from "classnames";

export function ConfigurationView(props: { config: Configuration }) {
  const table = props.config.table;

  return (
    <table className="config-view">
      <thead>
        <tr>
          <td />
          <td className="schema-level-label">Table</td>
          <td className="schema-level-label">Index</td>
          <td className="schema-level-label">Partition</td>
          <td colSpan={nodesInFormation(props.config.formation)} />
        </tr>
        <tr>
          <th className="formation-level-label">Region</th>
          <th colSpan={3} />
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
          <th colSpan={3} />
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
            )),
          )}
        </tr>
        <tr>
          <th className="formation-level-label">Node</th>
          <td colSpan={3} />
          {/* nodes */}
          {props.config.formation.regions.map(region =>
            region.azs.map(az =>
              az.nodes.map(node => (
                <th
                  key={node.id}
                  className={classNames(
                    "formation-node",
                    "formation-node-leaf",
                    {
                      "formation-node-down":
                        props.config.downNodeIDs.indexOf(node.id) !== -1,
                    },
                  )}
                >
                  n{node.id}
                </th>
              )),
            ),
          )}
        </tr>
      </thead>
      <tbody>
        {table.indexes.map((index, indexIdx) =>
          index.partitions.map((partition, partitionIdx) => (
            <tr key={`${index.name}/${partition.name}`}>
              <td />
              {indexIdx === 0 && partitionIdx === 0 ? (
                <td className="schema-node" rowSpan={partitionsInTable(table)}>
                  {table.name}
                </td>
              ) : null}
              {partitionIdx === 0 ? (
                <td className="schema-node" rowSpan={partitionsInIndex(index)}>
                  {index.name}
                </td>
              ) : null}
              <td className="schema-node schema-node-leaf">{partition.name}</td>
              {nodePathsForFormation(props.config.formation).map(nodePath =>
                renderCell(
                  nodePath,
                  {
                    table: props.config.table,
                    index: index,
                    partition: partition,
                  },
                  props.config,
                ),
              )}
            </tr>
          )),
        )}
      </tbody>
    </table>
  );
}

function renderCell(
  nodePath: NodePath,
  schemaPath: SchemaPath,
  config: Configuration,
): React.ReactNode {
  const key = nodePathToStr(nodePath);
  const allocation = allocate(nodePath, schemaPath, config.downNodeIDs);
  const explanation = cellExplanation(schemaPath, nodePath, allocation);
  const className = (() => {
    switch (allocation.type) {
      case "Data":
        return "cell cell-data";
      case "NoData":
        return "cell cell-no-data";
      case "WouldHaveDataButDown":
        return "cell cell-data-but-down";
    }
  })();
  return (
    <td key={key} title={explanation} className={className}>
      {allocation.type === "Data" && allocation.pinnedLeaseholders ? "LH" : ""}
    </td>
  );
}

function cellExplanation(
  schemaPath: SchemaPath,
  nodePath: NodePath,
  all: Allocation,
) {
  const presence =
    all.type === "Data"
      ? "is present"
      : all.type === "NoData"
      ? "is not present"
      : "would be present if the node were not down";
  const leaseholdersPinned =
    all.type === "Data" && all.pinnedLeaseholders
      ? "Leaseholders have been pinned to this region."
      : "";
  return `Data for partition "${schemaPath.partition.name}" of index "${schemaPath.index.name}" of table "${schemaPath.table.name}" ${presence} on node ${nodePath.nodeID} in AZ ${nodePath.azName} of region ${nodePath.regionName}. ${leaseholdersPinned}`;
}
