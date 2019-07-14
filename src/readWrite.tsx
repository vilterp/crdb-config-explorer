import {
  Configuration,
  Hop,
  HopSequence,
  KVWrite,
  nodeForID,
  NodePath,
  nodePathsForFormation,
  schemaPathForKVWrite,
  SQLWrite,
  Table,
} from "./model";
import { allocate } from "./allocate";
import { filterMap, min } from "./arrays";

export function hopSequenceForSQLWrite(
  config: Configuration,
  sqlWrite: SQLWrite,
): HopSequence {
  // TODO: don't hardcode primary partition... hmmm
  const kvWrites = kvWritesForSQLWrite(config.table, sqlWrite);
  return {
    hops: kvWrites.flatMap(kvWrite => {
      const gatewayNode = nodeForID(config.formation, sqlWrite.gateWayNodeID);
      if (!gatewayNode) {
        throw new Error("couldn't find gateway node");
      }
      const possLHNodes = possibleLeaseholderNodesForKVWrite(config, kvWrite);
      const lhNode = possLHNodes[0];
      const replicaNodes = possLHNodes.slice(1, 3);
      const gateWayToLHLatency = latency(gatewayNode, lhNode);
      const replHops = replicaNodes.flatMap(replNode => {
        const replHopLatency = latency(lhNode, replNode);
        return [
          {
            from: lhNode,
            to: replNode,
            start: gateWayToLHLatency,
            end: gateWayToLHLatency + replHopLatency,
          },
          {
            from: replNode,
            to: lhNode,
            start: gateWayToLHLatency + replHopLatency,
            end: gateWayToLHLatency + replHopLatency * 2,
          },
        ];
      });
      const replDone = replDoneTimestamp(lhNode, replHops);
      return [
        // TODO: there might be no hop if gateway node is leaseholder
        {
          from: gatewayNode,
          to: lhNode,
          start: 0,
          end: gateWayToLHLatency,
        },
        ...replHops,
        {
          from: lhNode,
          to: gatewayNode,
          start: replDone,
          end: replDone + gateWayToLHLatency,
        },
      ];
    }),
  };
}

function replDoneTimestamp(lhNode: NodePath, hops: Hop[]): number {
  const returnHops = hops.filter(h => h.to === lhNode);
  const returnDoneTimestamps = returnHops.map(h => h.end);
  return min(returnDoneTimestamps);
}

function latency(fromNode: NodePath, toNode: NodePath): number {
  // TODO: more realistic...
  if (fromNode.regionName === toNode.regionName) {
    return 10;
  }
  return 100;
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
  config: Configuration,
  kvWrite: KVWrite,
): NodePath[] {
  const possibilities = filterMap(
    nodePathsForFormation(config.formation),
    nodePath => {
      const schemaPath = schemaPathForKVWrite(config.table, kvWrite);
      const allocation = allocate(nodePath, schemaPath, config.downNodeIDs);
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
