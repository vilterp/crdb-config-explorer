import {
  Hop,
  HopSequence,
  KVWrite,
  nodeForID,
  NodePath,
  nodePathsForFormation,
  schemaPathForKVWrite,
  Situation,
  SQLWrite,
  Table,
} from "./model";
import { allocate } from "./allocate";
import { filterMap, min } from "./arrays";

export function hopSequenceForSQLWrite(
  situation: Situation,
  sqlWrite: SQLWrite,
): HopSequence {
  // TODO: don't hardcode primary partition... hmmm
  const kvWrites = kvWritesForSQLWrite(situation.config.table, sqlWrite);
  return {
    hops: kvWrites.flatMap(kvWrite => {
      const gatewayNode = nodeForID(
        situation.config.formation,
        sqlWrite.gateWayNodeID,
      );
      if (!gatewayNode) {
        throw new Error("couldn't find gateway node");
      }
      const possLHNodes = possibleLeaseholderNodesForKVWrite(
        situation,
        kvWrite,
      );
      const lhNode = possLHNodes[0];
      const replicaNodes = possLHNodes.slice(1, 3);
      const gateWayToLHLatency = latency(gatewayNode, lhNode);
      const gatewayToLHHop =
        gatewayNode.nodeID !== lhNode.nodeID
          ? [
              {
                from: gatewayNode,
                to: lhNode,
                start: 0,
                end: gateWayToLHLatency,
                desc: "request from gateway node to leaseholder",
              },
            ]
          : [];
      const replHops = replicaNodes.flatMap(replNode => {
        const replHopLatency = latency(lhNode, replNode);
        return [
          {
            from: lhNode,
            to: replNode,
            start: gateWayToLHLatency,
            end: gateWayToLHLatency + replHopLatency,
            desc: "request to follower to replicate data",
          },
          {
            from: replNode,
            to: lhNode,
            start: gateWayToLHLatency + replHopLatency,
            end: gateWayToLHLatency + replHopLatency * 2,
            desc: "response from replicating data to follower",
          },
        ];
      });
      const replDone = replDoneTimestamp(lhNode, replHops);
      const lhToGatewayHop =
        gatewayNode.nodeID !== lhNode.nodeID
          ? [
              {
                from: lhNode,
                to: gatewayNode,
                start: replDone,
                end: replDone + gateWayToLHLatency,
                desc: "response from leaseholder to gateway node",
              },
            ]
          : [];
      return [
        // TODO: there might be no hop if gateway node is leaseholder
        ...gatewayToLHHop,
        ...replHops,
        ...lhToGatewayHop,
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
