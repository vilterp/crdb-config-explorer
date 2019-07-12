import { Formation, Table } from "./model";

// FORMATIONS

export const singleNode: Formation = {
  regions: [
    {
      name: "us-east",
      azs: [
        {
          name: "a",
          nodes: [
            {
              id: 1
            }
          ]
        }
      ]
    }
  ]
};

export const singleRegion: Formation = {
  regions: [
    {
      name: "us-east",
      azs: ["a", "b", "c"].map((az, idx) => ({
        name: az,
        nodes: [
          {
            id: idx + 1
          }
        ]
      }))
    }
  ]
};

export const threeRegions: Formation = {
  regions: ["us-west", "us-central", "us-east"].map((regName, regIdx) => ({
    name: regName,
    azs: ["a", "b", "c"].map((azName, azIdx) => ({
      name: azName,
      nodes: [
        {
          id: regIdx * 3 + azIdx + 1
        }
      ]
    }))
  }))
};

// TABLES

export const usersTable: Table = {
  name: "users",
  indexes: [
    {
      name: "primary",
      partitions: [
        {
          name: "west",
          zoneConfig: { leaseholdersRegion: null, dataRegion: "us-west" }
        },
        {
          name: "central",
          zoneConfig: { leaseholdersRegion: null, dataRegion: "us-central" }
        },
        {
          name: "east",
          zoneConfig: { leaseholdersRegion: null, dataRegion: "us-east" }
        }
      ],
      zoneConfig: null
    }
  ],
  zoneConfig: null
};
