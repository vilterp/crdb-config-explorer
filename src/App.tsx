import React from "react";
import {
  singleNode,
  threeNodesOneRegion,
  threeNodesThreeRegions,
  usersTableDupIndexes,
  usersTableLeaseholderPartitioned,
  usersTablePartitioned,
  usersTableUnPartitioned,
} from "./configurations";
import "./App.css";
import { SituationView } from "./views/situationView";

function App() {
  return (
    <div className="container">
      <h1>Topology Patterns Illustration</h1>
      <p>
        An alternative illustration of the patterns documented here:{" "}
        <a href="https://www.cockroachlabs.com/docs/stable/topology-patterns.html">
          Topology Patterns
        </a>
        .
      </p>

      <h2>Single-Region Patterns</h2>

      <h3>Development</h3>
      <SituationView
        config={{
          formation: singleNode,
          table: usersTableUnPartitioned,
          downNodeIDs: [],
        }}
        writes={[]}
      />

      <h3>Basic Production</h3>
      <SituationView
        config={{
          formation: threeNodesOneRegion,
          table: usersTableUnPartitioned,
          downNodeIDs: [],
        }}
        writes={[
          {
            desc: null,
            write: {
              gateWayNodeID: 1,
              tableName: "users",
              partitionName: "default",
            },
          },
        ]}
      />

      <h2>Multi-Region Patterns</h2>
      <p>These patterns involve a cluster with servers in multiple regions.</p>

      <h3>Naive Multiregion</h3>
      <SituationView
        config={{
          formation: threeNodesThreeRegions,
          table: usersTableUnPartitioned,
          downNodeIDs: [],
        }}
        writes={[
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
        ]}
      />

      <h3>Geo-partitioned replicas</h3>
      <SituationView
        config={{
          formation: threeNodesThreeRegions,
          table: usersTablePartitioned,
          downNodeIDs: [2, 3],
        }}
        writes={[
          {
            desc: "Local, partitioned write (good!)",
            write: {
              gateWayNodeID: 2,
              tableName: "users",
              partitionName: "west",
            },
          },
        ]}
      />

      <h3>Geo-partitioned leaseholders</h3>
      <SituationView
        config={{
          formation: threeNodesThreeRegions,
          table: usersTableLeaseholderPartitioned,
          downNodeIDs: [],
        }}
        writes={[
          {
            desc: null,
            write: {
              partitionName: "west",
              tableName: "postal_codes",
              gateWayNodeID: 2,
            },
          },
        ]}
      />

      <h3>Duplicate Indexes</h3>
      <SituationView
        config={{
          formation: threeNodesThreeRegions,
          table: usersTableDupIndexes,
          downNodeIDs: [],
        }}
        writes={[
          {
            desc: null,
            write: {
              partitionName: "default",
              tableName: "postal_codes",
              gateWayNodeID: 2,
            },
          },
        ]}
      />
    </div>
  );
}

export default App;
