import {
  KVWrite,
  Leaf,
  nodeForID,
  NodePath,
  nodePathsForFormation,
  Par,
  RPC,
  schemaPathForKVWrite,
  Situation,
  SQLWrite,
  Table,
  TraceNode,
} from "./model";
import { allocate } from "./allocate";
import { filterMap } from "./arrays";

export function traceForSQLWrite(
  situation: Situation,
  sqlWrite: SQLWrite,
): TraceNode {
  const kvWrites = kvWritesForSQLWrite(situation.config.table, sqlWrite);
  const gwNodePath = nodeForID(
    situation.config.formation,
    sqlWrite.gateWayNodeID,
  );
  if (!gwNodePath) {
    throw new Error("gateway node not found");
  }
  return {
    nodePath: gwNodePath,
    process: Par(
      kvWrites.map(kvWrite => {
        const possLHNodes = possibleLeaseholderNodesForKVWrite(
          situation,
          kvWrite,
        );
        const lhNode = possLHNodes[0];
        const replicaNodes = possLHNodes.slice(1, 3);
        return RPC(
          lhNode,
          `request leaseholder to write to index ${kvWrite.indexName}, partition ${kvWrite.partitionName}`,
          Par([
            Leaf("write data", 1),
            ...replicaNodes.map(rn =>
              RPC(rn, "replicate data to follower", Leaf("write data", 1)),
            ),
          ]),
        );
      }),
    ),
  };
}

function kvWritesForSQLWrite(table: Table, write: SQLWrite): KVWrite[] {
  // TODO: detect if secondary indices don't have that partition
  return table.indexes.map(idx => ({
    tableName: table.name,
    indexName: idx.name,
    partitionName: write.partitionName,
  }));
}

function possibleLeaseholderNodesForKVWrite(
  situation: Situation,
  kvWrite: KVWrite,
): NodePath[] {
  const possibilities = filterMap(
    nodePathsForFormation(situation.config.formation),
    nodePath => {
      const schemaPath = schemaPathForKVWrite(situation.config.table, kvWrite);
      const allocation = allocate(nodePath, schemaPath, situation.downNodeIDs);
      if (allocation.type === "NoData") {
        return null;
      }
      return {
        nodePath,
        leaseholdersPinned: allocation.pinnedLeaseholders,
      };
    },
  );
  const anyLeaseholdersPinned = possibilities.some(p => p.leaseholdersPinned);
  return (anyLeaseholdersPinned
    ? possibilities.filter(p => p.leaseholdersPinned)
    : possibilities
  ).map(p => p.nodePath);
}
