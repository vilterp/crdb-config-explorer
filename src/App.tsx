import React from "react";
import { ConfigurationView } from "./views/configurationMatrix";
import {
  singleNode,
  threeNodesOneRegion,
  threeNodesThreeRegions,
  usersTableLeaseholderPartitioned,
  usersTablePartitioned,
  usersTableUnPartitioned
} from "./configurations";
import "./App.css";

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
      <h3>Geo-partitioned replicas</h3>
      <ConfigurationView
        config={{
          formation: threeNodesThreeRegions,
          table: usersTablePartitioned
        }}
      />
      <h3>Geo-partitioned leaseholders</h3>
      <ConfigurationView
        config={{
          formation: threeNodesThreeRegions,
          table: usersTableLeaseholderPartitioned
        }}
      />
    </div>
  );
}

export default App;
