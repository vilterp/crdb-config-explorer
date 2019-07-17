import { Pattern } from "./model";
import {
  oneNodePerRegionF,
  singleNode,
  threeNodesOneRegion,
  threeNodesThreeRegions,
  usersTableDupIndexes,
  usersTableLeaseholderPartitioned,
  usersTablePartitioned,
  usersTableUnPartitioned,
} from "./configurations";

export const development: Pattern = {
  id: "development",
  name: "Development",
  situation: {
    config: {
      formation: singleNode,
      table: usersTableUnPartitioned,
    },
    downNodeIDs: [],
  },
  writes: [
    {
      desc: "simple write",
      write: {
        gateWayNodeID: 1,
        tableName: "users",
        partitionName: "default",
      },
    },
  ],
};

export const basicProduction: Pattern = {
  id: "basic-production",
  name: "Basic Production",
  situation: {
    config: {
      formation: threeNodesOneRegion,
      table: usersTableUnPartitioned,
    },
    downNodeIDs: [],
  },
  writes: [
    {
      desc: "",
      write: {
        gateWayNodeID: 1,
        tableName: "users",
        partitionName: "default",
      },
    },
  ],
};

export const naiveMultiregion: Pattern = {
  id: "naive-multiregion",
  name: "Naive Multiregion",
  situation: {
    config: {
      formation: threeNodesThreeRegions,
      table: usersTableUnPartitioned,
    },
    downNodeIDs: [],
  },
  writes: [
    {
      desc: "local write (lucky!)",
      write: {
        tableName: "users",
        partitionName: "default",
        gateWayNodeID: 3,
      },
    },
    {
      desc: "non-local write (bad!)",
      write: {
        tableName: "users",
        partitionName: "default",
        gateWayNodeID: 4,
      },
    },
  ],
};

export const geoPartitionedReplicas: Pattern = {
  id: "geo-partitioned-replicas",
  name: "Geo-Partitioned Replicas",
  situation: {
    config: {
      formation: threeNodesThreeRegions,
      table: usersTablePartitioned,
    },
    downNodeIDs: [],
  },
  writes: [
    {
      desc: "Local, partitioned write (good!)",
      write: {
        gateWayNodeID: 2,
        tableName: "users",
        partitionName: "west",
      },
    },
  ],
};

export const geoPartitionedLeaseholders: Pattern = {
  id: "geo-partitioned-leaseholders",
  name: "Geo-Partitioned Leaseholders",
  situation: {
    config: {
      formation: threeNodesThreeRegions,
      table: usersTableLeaseholderPartitioned,
    },
    downNodeIDs: [],
  },
  writes: [
    {
      desc: "",
      write: {
        partitionName: "west",
        tableName: "postal_codes",
        gateWayNodeID: 2,
      },
    },
  ],
};

export const duplicateIndexes: Pattern = {
  id: "duplicate-indexes",
  name: "Duplicate Indexes",
  situation: {
    config: {
      formation: threeNodesThreeRegions,
      table: usersTableDupIndexes,
    },
    downNodeIDs: [],
  },
  writes: [
    {
      desc: "",
      write: {
        partitionName: "default",
        tableName: "postal_codes",
        gateWayNodeID: 2,
      },
    },
  ],
};

export const oneNodePerRegion: Pattern = {
  id: "one-node-per-region",
  name: "One Node Per Region",
  situation: {
    config: {
      table: usersTableUnPartitioned,
      formation: oneNodePerRegionF,
    },
    downNodeIDs: [],
  },
  writes: [
    {
      desc: "",
      write: {
        partitionName: "default",
        gateWayNodeID: 1,
        tableName: "users",
      },
    },
  ],
};

export const PATTERNS = [
  development,
  basicProduction,
  naiveMultiregion,
  geoPartitionedReplicas,
  geoPartitionedLeaseholders,
  duplicateIndexes,
  oneNodePerRegion,
];
