import { Formation } from "./model";

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
  regions: ["us-east", "us-west", "us-central"].map((regName, regIdx) => ({
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
