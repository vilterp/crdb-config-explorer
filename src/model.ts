import React from "react";
import { replicasForSchemaPath } from "./allocate";

export interface Situation {
  config: Configuration;
  downNodeIDs: number[];
}

export interface Configuration {
  table: Table;
  formation: Formation;
}

export interface Formation {
  regions: Region[];
}

export interface Region {
  name: string;
  azs: AZ[];
}

export interface AZ {
  name: string;
  nodes: Node[];
}

export interface Node {
  id: number;
}

export interface Table {
  name: string;
  indexes: Index[];
  zoneConfig?: ZoneConfig;
}

export interface Index {
  name: string;
  partitions: Partition[];
  zoneConfig?: ZoneConfig;
}

export interface Partition {
  name: string;
  zoneConfig?: ZoneConfig;
}

export interface ZoneConfig {
  leaseholdersRegion: string | null;
  dataRegion: string | null;
}

export interface HopSequence {
  hops: Hop[];
}

export interface Hop {
  from: NodePath;
  to: NodePath;
  start: number;
  end: number;
  desc: React.ReactNode;
}

// helper funcs

export function numNodesInFormation(f: Formation): number {
  return f.regions.reduce((sum, region) => sum + numNodesInRegion(region), 0);
}

export function numNodesInRegion(reg: Region): number {
  return reg.azs.reduce((sum, az) => sum + numNodesInAZ(az), 0);
}

export function nodesInRegion(reg: Region): Node[] {
  return reg.azs.flatMap(az => az.nodes);
}

export function numNodesInAZ(az: AZ): number {
  return az.nodes.length;
}

export interface NodePath {
  regionName: string;
  azName: string;
  nodeID: number;
}

export interface SchemaPath {
  table: Table;
  index: Index;
  partition: Partition;
}

export function nodePathsForFormation(formation: Formation): NodePath[] {
  return formation.regions.flatMap(nodePathsForRegion);
}

function nodePathsForRegion(region: Region): NodePath[] {
  return region.azs.flatMap(az => nodePathsForAZ(region.name, az));
}

function nodePathsForAZ(regionName: string, az: AZ): NodePath[] {
  return az.nodes.map(node => ({
    regionName,
    azName: az.name,
    nodeID: node.id,
  }));
}

export function nodePathToStr(np: NodePath): string {
  return `${np.regionName}/${np.azName}/${np.azName}`;
}

export function partitionsInTable(table: Table): number {
  return table.indexes.reduce((sum, idx) => sum + partitionsInIndex(idx), 0);
}

export function partitionsInIndex(index: Index): number {
  return index.partitions.length;
}

export type RegionName = string;

export function schemaPathForKVWrite(
  table: Table,
  kvWrite: KVWrite,
): SchemaPath {
  const index = table.indexes.find(i => i.name === kvWrite.indexName);
  if (!index) {
    throw new Error("index not found"); // bah
  }
  const partition = index.partitions.find(
    p => p.name === kvWrite.partitionName,
  );
  if (!partition) {
    throw new Error(
      `partition "${
        kvWrite.partitionName
      }" not found in [${index.partitions.map(p => `"${p.name}"`).join(", ")}]`,
    );
  }
  return {
    table,
    index,
    partition,
  };
}

export function nodeForID(f: Formation, nodeID: number): NodePath | undefined {
  return nodePathsForFormation(f).find(np => np.nodeID === nodeID);
}

export function allNodesDown(nodes: Node[], downNodeIDs: number[]): boolean {
  return nodes.every(n => downNodeIDs.indexOf(n.id) !== -1);
}

// Writes

export interface SQLWrite {
  gateWayNodeID: number;
  tableName: string;
  partitionName: string;
}

export interface KVWrite {
  tableName: string;
  indexName: string;
  partitionName: string;
}

// vulnerability

type ReplicationStatus = "OK" | "Underreplicated" | "Unavailable";

export function getReplicationStatus(
  schemaPath: SchemaPath,
  situ: Situation,
): ReplicationStatus {
  const numReplicas = replicasForSchemaPath(schemaPath, situ).length;
  const totalNodes = numNodesInFormation(situ.config.formation);
  const desiredReplicas = 3; // TODO: get from zone config
  const quorumReplicas = Math.min(totalNodes, Math.ceil(desiredReplicas / 2));
  if (numReplicas >= desiredReplicas) {
    return "OK";
  }
  if (numReplicas < quorumReplicas) {
    return "Unavailable";
  }
  return "Underreplicated";
}
