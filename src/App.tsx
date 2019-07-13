import React from "react";
import { ConfigurationView } from "./views/configurationMatrix";
import {
  singleNode,
  threeNodesOneRegion,
  threeNodesThreeRegions,
  usersTableDupIndexes,
  usersTableLeaseholderPartitioned,
  usersTablePartitioned,
  usersTableUnPartitioned
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
      <ConfigurationView
        config={{ formation: singleNode, table: usersTableUnPartitioned }}
      />

      <h3>Basic Production</h3>
      <ConfigurationView
        config={{
          formation: threeNodesOneRegion,
          table: usersTableUnPartitioned
        }}
      />

      <h2>Multi-Region Patterns</h2>
      <p>These patterns involve a cluster with servers in multiple regions.</p>

      <h3>Naive Multiregion</h3>
      <SituationView
        config={{
          formation: threeNodesThreeRegions,
          table: usersTableUnPartitioned
        }}
        writes={[
          {
            desc: "local write (lucky!)",
            write: {
              tableName: "users",
              partitionName: "default",
              gateWayNodeID: 3
            }
          },
          {
            desc: "non-local write (bad!)",
            write: {
              tableName: "users",
              partitionName: "default",
              gateWayNodeID: 4
            }
          }
        ]}
      />

      <h3>Geo-partitioned replicas</h3>
      <SituationView
        config={{
          formation: threeNodesThreeRegions,
          table: usersTablePartitioned
        }}
        writes={[
          {
            desc: "Local, partitioned write (good!)",
            write: {
              gateWayNodeID: 2,
              tableName: "users",
              partitionName: "west"
            }
          }
        ]}
      />

      <h3>Geo-partitioned leaseholders</h3>
      <ConfigurationView
        config={{
          formation: threeNodesThreeRegions,
          table: usersTableLeaseholderPartitioned
        }}
      />

      <h3>Duplicate Indexes</h3>
      <ConfigurationView
        config={{
          formation: threeNodesThreeRegions,
          table: usersTableDupIndexes
        }}
      />
    </div>
  );
}

export default App;
