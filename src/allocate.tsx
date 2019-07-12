import { NodePath, SchemaPath, ZoneConfig } from "./model";

// TODO: leaseholders pinned
export type Allocation =
  | { type: "NoData" }
  | { type: "Data"; pinnedLeaseholders: boolean };

export function allocate(
  nodePath: NodePath,
  schemaPath: SchemaPath
): Allocation {
  // TODO: this is pretty faulty.
  //   kind of just trying to make it pass for the given cases.
  const zoneConfig = getZoneConfig(schemaPath);
  if (zoneConfig === undefined) {
    return { type: "Data", pinnedLeaseholders: false };
  }
  if (zoneConfig.dataRegion === nodePath.regionName) {
    return { type: "Data", pinnedLeaseholders: false };
  } else if (zoneConfig.leaseholdersRegion !== null) {
    return {
      type: "Data",
      pinnedLeaseholders: zoneConfig.leaseholdersRegion === nodePath.regionName
    };
  } else {
    return { type: "NoData" };
  }
}

function getZoneConfig(schemaPath: SchemaPath): ZoneConfig | undefined {
  if (schemaPath.partition.zoneConfig) {
    return schemaPath.partition.zoneConfig;
  } else {
    return schemaPath.index.zoneConfig;
  }
}
