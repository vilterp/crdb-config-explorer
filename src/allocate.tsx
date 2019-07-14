import { NodePath, SchemaPath, ZoneConfig } from "./model";

// TODO: leaseholders pinned
export type Allocation =
  | { type: "NoData" }
  | { type: "Data"; pinnedLeaseholders: boolean }
  | { type: "WouldHaveDataButDown"; pinnedLeaseholders: boolean };

export function allocate(
  nodePath: NodePath,
  schemaPath: SchemaPath,
  downNodeIDs: number[],
): Allocation {
  // TODO: this is pretty faulty.
  //   kind of just trying to make it pass for the given cases.
  const zoneConfig = getZoneConfig(schemaPath);
  if (zoneConfig === undefined) {
    return dataIfNotDown(downNodeIDs, nodePath, false);
  }
  if (zoneConfig.dataRegion === nodePath.regionName) {
    return dataIfNotDown(downNodeIDs, nodePath, false);
  }
  if (zoneConfig.leaseholdersRegion !== null) {
    return dataIfNotDown(
      downNodeIDs,
      nodePath,
      zoneConfig.leaseholdersRegion === nodePath.regionName,
    );
  } else {
    return { type: "NoData" };
  }
}

function dataIfNotDown(
  downNodeIDs: number[],
  nodePath: NodePath,
  lhsPinned: boolean,
): Allocation {
  if (nodeDown(downNodeIDs, nodePath)) {
    return { type: "WouldHaveDataButDown", pinnedLeaseholders: lhsPinned };
  }
  return { type: "Data", pinnedLeaseholders: lhsPinned };
}

export function nodeDown(downNodeIDs: number[], node: NodePath): boolean {
  return downNodeIDs.indexOf(node.nodeID) !== -1;
}

function getZoneConfig(schemaPath: SchemaPath): ZoneConfig | undefined {
  if (schemaPath.partition.zoneConfig) {
    return schemaPath.partition.zoneConfig;
  } else {
    return schemaPath.index.zoneConfig;
  }
}
