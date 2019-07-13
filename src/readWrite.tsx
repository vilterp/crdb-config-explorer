import {
  Configuration,
  HopSequence,
  KVWrite,
  nodeForID,
  NodePath,
  nodePathsForFormation,
  RegionName,
  schemaPathForKVWrite,
  SQLWrite,
  Table
} from "./model";
import { allocate } from "./allocate";
import { filterMap } from "./arrays";

export function hopSequenceForSQLWrite(
  config: Configuration,
  sqlWrite: SQLWrite
): HopSequence {
  // TODO: don't hardcode primary partition... hmmm
  const kvWrites = kvWritesForSQLWrite(config.table, sqlWrite);
  return {
    hops: kvWrites.flatMap(kvWrite => {
      const fromNode = nodeForID(config.formation, sqlWrite.gateWayNodeID);
      if (!fromNode) {
        throw new Error("couldn't find gateway node");
      }
      const toNodes = possibleNodesForKVWrite(config, kvWrite);
      const toNode = toNodes[0];
      const hopLatency = latency(fromNode, toNode);
      return [
        {
          from: fromNode,
          to: toNode,
          start: 0,
          end: hopLatency
        },
        {
          from: toNode,
          to: fromNode,
          start: hopLatency + 1,
          end: hopLatency * 2 + 1
        }
      ];
    })
  };
}

function latency(fromNode: NodePath, toNode: NodePath): number {
  // TODO: more realistic...
  if (fromNode.regionName === toNode.regionName) {
    return 1;
  }
  return 100;
}

function kvWritesForSQLWrite(table: Table, write: SQLWrite): KVWrite[] {
  // TODO: detect if secondary indices don't have that partition
  return table.indexes.map(idx => ({
    tableName: table.name,
    indexName: idx.name,
    partitionName: write.partitionName
  }));
}

function possibleNodesForKVWrite(
  config: Configuration,
  kvWrite: KVWrite
): NodePath[] {
  const possibilities = filterMap(
    nodePathsForFormation(config.formation),
    nodePath => {
      const schemaPath = schemaPathForKVWrite(config.table, kvWrite);
      const allocation = allocate(nodePath, schemaPath);
      if (allocation.type === "NoData") {
        return null;
      }
      return {
        nodePath,
        leaseholdersPinned: allocation.pinnedLeaseholders
      };
    }
  );
  const anyLeaseholdersPinned = possibilities.some(p => p.leaseholdersPinned);
  return (anyLeaseholdersPinned
    ? possibilities.filter(p => p.leaseholdersPinned)
    : possibilities
  ).map(p => p.nodePath);
}
