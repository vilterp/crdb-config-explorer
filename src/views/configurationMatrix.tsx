import * as React from "react";
import {
  Configuration,
  getAZStatus,
  getRegionStatus,
  getReplicationStatus,
  LocalityStatus,
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
  ZoneConfig,
} from "../model";
import { allocate, Allocation } from "../allocate";
import classNames from "classnames";
import { removeAt, union, without } from "../arrays";

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
          {props.config.formation.regions.map(region => {
            const status = getRegionStatus(region, props.downNodeIDs);
            return (
              <th
                key={region.name}
                colSpan={numNodesInRegion(region)}
                className={classNameForFormationNode(status)}
                onClick={() => {
                  toggleFormationNodeDown(
                    status,
                    props.downNodeIDs,
                    nodesInRegion(region).map(n => n.id),
                    props.setDownNodeIDs,
                  );
                }}
              >
                {region.name}
              </th>
            );
          })}
        </tr>
        <tr>
          <th className="formation-level-label">AZ</th>
          <th colSpan={3} />
          {/* az's */}
          {props.config.formation.regions.map(region =>
            region.azs.map(az => {
              const status = getAZStatus(az, props.downNodeIDs);
              return (
                <th
                  key={az.name}
                  colSpan={numNodesInAZ(az)}
                  className={classNameForFormationNode(status)}
                  onClick={() => {
                    toggleFormationNodeDown(
                      status,
                      props.downNodeIDs,
                      az.nodes.map(n => n.id),
                      props.setDownNodeIDs,
                    );
                  }}
                >
                  {az.name}
                </th>
              );
            }),
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
                    toggleNodeDown(
                      props.downNodeIDs,
                      node.id,
                      props.setDownNodeIDs,
                    )
                  }
                  className={classNames(
                    "formation-node",
                    "formation-node-leaf",
                    {
                      "formation-node-fully-down":
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
          index.partitions.map((partition, partitionIdx) => {
            const schemaPath = {
              table: props.config.table,
              index: index,
              partition: partition,
            };
            const replStatus = getReplicationStatus(schemaPath, {
              config: props.config,
              downNodeIDs: props.downNodeIDs,
            });
            return (
              <tr key={`${index.name}/${partition.name}`}>
                <td />
                {indexIdx === 0 && partitionIdx === 0 ? (
                  <td
                    className={classNames("schema-node")}
                    rowSpan={partitionsInTable(table)}
                  >
                    {withZCIndicator(table.name, table.zoneConfig)}
                  </td>
                ) : null}
                {partitionIdx === 0 ? (
                  <td
                    className={classNames("schema-node")}
                    rowSpan={partitionsInIndex(index)}
                  >
                    {withZCIndicator(index.name, index.zoneConfig)}
                  </td>
                ) : null}
                <td
                  className={classNames("schema-node", "schema-node-leaf", {
                    "schema-node-underreplicated":
                      replStatus === "Underreplicated",
                    "schema-node-unavailable": replStatus === "Unavailable",
                  })}
                >
                  {withZCIndicator(partition.name, partition.zoneConfig)}
                </td>
                {nodePathsForFormation(props.config.formation).map(nodePath =>
                  renderCell(nodePath, schemaPath, props.downNodeIDs),
                )}
              </tr>
            );
          }),
        )}
      </tbody>
    </table>
  );
}

function withZCIndicator(
  name: string,
  zc: ZoneConfig | undefined,
): React.ReactNode {
  const title = zc === undefined ? "" : zcDesc(zc);
  return (
    <span title={title}>
      {name}
      {zc === undefined ? "" : "*"}
    </span>
  );
}

function zcDesc(zc: ZoneConfig): string {
  if (zc.leaseholdersRegion) {
    return `zone config pinning leaseholders to region ${zc.leaseholdersRegion}`;
  }
  if (zc.dataRegion) {
    return `zone config pinning data to region ${zc.dataRegion}`;
  }
  return "";
}

function classNameForFormationNode(localityStatus: LocalityStatus): string {
  return classNames("formation-node", {
    "formation-node-partially-down": localityStatus === "PartiallyDown",
    "formation-node-fully-down": localityStatus === "FullyDown",
  });
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

function toggleNodeDown(
  ids: number[],
  id: number,
  setIDs: (newIDs: number[]) => void,
) {
  const newIDs = toggleDownList(ids, id);
  setIDs(newIDs);
}

export function toggleFormationNodeDown(
  status: LocalityStatus,
  downNodeIDs: number[],
  nodesHere: number[],
  setDownNodeIDs: (newIDs: number[]) => void,
) {
  if (status === "OK") {
    setDownNodeIDs(union(downNodeIDs, nodesHere));
  } else {
    setDownNodeIDs(without(downNodeIDs, nodesHere));
  }
}

function toggleDownList(ids: number[], id: number): number[] {
  const index = ids.indexOf(id);
  if (index === -1) {
    return [...ids, id];
  }
  return removeAt(ids, index);
}
