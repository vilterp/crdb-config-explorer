import * as React from "react";
import {
  allNodesDown,
  Configuration,
  NodePath,
  nodePathsForFormation,
  nodePathToStr,
  nodesInRegion,
  numNodesInAZ,
  numNodesInFormation,
  numNodesInRegion,
  partitionsInIndex,
  partitionsInTable,
  SchemaPath,
} from "../model";
import { allocate, Allocation } from "../allocate";
import classNames from "classnames";
import { removeAt } from "../arrays";

export function ConfigurationView(props: {
  config: Configuration;
  downNodeIDs: number[];
  setDownNodeIDs: (nowDown: number[]) => void;
}) {
  const table = props.config.table;

  return (
    <table className="config-view">
      <thead>
        <tr>
          <td />
          <td className="schema-level-label">Table</td>
          <td className="schema-level-label">Index</td>
          <td className="schema-level-label">Partition</td>
          <td colSpan={numNodesInFormation(props.config.formation)} />
        </tr>
        <tr>
          <th className="formation-level-label">Region</th>
          <th colSpan={3} />
          {/* regions */}
          {props.config.formation.regions.map(region => (
            <th
              key={region.name}
              colSpan={numNodesInRegion(region)}
              className={classNames("formation-node", {
                "formation-node-down": allNodesDown(
                  nodesInRegion(region),
                  props.downNodeIDs,
                ),
              })}
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
                colSpan={numNodesInAZ(az)}
                className={classNames("formation-node", {
                  "formation-node-down": allNodesDown(
                    az.nodes,
                    props.downNodeIDs,
                  ),
                })}
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
                  onClick={() =>
                    toggleDown(props.downNodeIDs, node.id, props.setDownNodeIDs)
                  }
                  className={classNames(
                    "formation-node",
                    "formation-node-leaf",
                    {
                      "formation-node-down":
                        props.downNodeIDs.indexOf(node.id) !== -1,
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
                  props.downNodeIDs,
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
  downNodeIDs: number[],
): React.ReactNode {
  const key = nodePathToStr(nodePath);
  const allocation = allocate(nodePath, schemaPath, downNodeIDs);
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

function toggleDown(
  ids: number[],
  id: number,
  setIDs: (newIDs: number[]) => void,
) {
  const newIDs = toggleDownList(ids, id);
  setIDs(newIDs);
}

function toggleDownList(ids: number[], id: number): number[] {
  const index = ids.indexOf(id);
  if (index === -1) {
    return [...ids, id];
  }
  return removeAt(ids, index);
}
