import React, { useState } from "react";
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
import { SituationView } from "./views/situationView";
import { Route, BrowserRouter as Router, Link } from "react-router-dom";
import "./App.css";
import { Situation, SQLWrite } from "./model";
import { ConfigurationView } from "./views/configurationMatrix";

interface Pattern {
  id: string;
  name: string;
  situation: Situation;
  writes: { desc: string; write: SQLWrite }[];
}

const development: Pattern = {
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

const basicProduction: Pattern = {
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

const naiveMultiregion: Pattern = {
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

const geoPartitionedReplicas: Pattern = {
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

const geoPartitionedLeaseholders: Pattern = {
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

const duplicateIndexes: Pattern = {
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

const oneNodePerRegion: Pattern = {
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

function IndexPage() {
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

      <PatternPreview pattern={development} />

      <PatternPreview pattern={basicProduction} />

      <h2>Multi-Region Patterns</h2>
      <p>These patterns involve a cluster with servers in multiple regions.</p>

      <PatternPreview pattern={naiveMultiregion} />

      <PatternPreview pattern={geoPartitionedReplicas} />

      <PatternPreview pattern={geoPartitionedLeaseholders} />

      <PatternPreview pattern={duplicateIndexes} />

      <h2>Anti-Patterns</h2>

      <PatternPreview pattern={oneNodePerRegion} />
    </div>
  );
}

function PatternPreview(props: { pattern: Pattern }) {
  const [downNodes, setDownNodes] = useState<number[]>([]);
  return (
    <>
      <h3>
        <Link to={props.pattern.id}>{props.pattern.name}</Link>
      </h3>
      <ConfigurationView
        config={props.pattern.situation.config}
        omitLabels={true}
        downNodeIDs={downNodes}
        setDownNodeIDs={setDownNodes}
      />
    </>
  );
}

function PatternPage(props: { pattern: Pattern }) {
  return (
    <div className="container">
      <p>
        <Link to="/">&lt; Patterns</Link>
      </p>
      <h1>{props.pattern.name}</h1>
      <SituationView
        situation={props.pattern.situation}
        writes={props.pattern.writes}
      />
    </div>
  );
}

const PATTERNS = [
  development,
  basicProduction,
  naiveMultiregion,
  geoPartitionedReplicas,
  geoPartitionedLeaseholders,
  duplicateIndexes,
  oneNodePerRegion,
];

function App() {
  return (
    <Router>
      <Route path="/" component={IndexPage} exact />
      {PATTERNS.map(p => (
        <Route
          key={p.id}
          path={`/${p.id}`}
          component={() => <PatternPage pattern={p} />}
        />
      ))}
    </Router>
  );
}

export default App;
