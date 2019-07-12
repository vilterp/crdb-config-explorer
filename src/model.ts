export interface Situation {
  config: Configuration;
  downNodeIDs: number[];
}

export interface Configuration {
  schema: Table;
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
  indexes: Index[];
  zoneConfig: ZoneConfig | null;
}

export interface Index {
  name: string;
  partitions: Partition[];
  zoneConfig: ZoneConfig | null;
}

export interface Partition {
  name: string;
  zoneConfig: ZoneConfig | null;
}

interface ZoneConfig {
  // ...
}

export interface HopSequence {
  hops: Hop[];
}

interface Hop {
  fromLoc: string;
  toLoc: string;
  start: number;
  end: number;
}

// helper funcs

export function nodesInRegion(reg: Region): number {
  return reg.azs.reduce((sum, az) => sum + nodesInAZ(az), 0);
}

export function nodesInAZ(az: AZ): number {
  return az.nodes.length;
}

interface NodePath {
  regionName: string;
  azName: string;
  nodeID: number;
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
    nodeID: node.id
  }));
}

export function nodePathToStr(np: NodePath): string {
  return `${np.regionName}/${np.azName}/${np.azName}`;
}
