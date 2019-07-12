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
  zoneConfig: ZoneConfig;
}

export interface Index {
  name: string;
  partitions: Partition[];
  zoneConfig: ZoneConfig;
}

export interface Partition {
  name: string;
  zoneConfig: ZoneConfig;
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
