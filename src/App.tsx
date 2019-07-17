import React, { useState } from "react";
import { PatternView } from "./views/patternView";
import { Route, BrowserRouter as Router, Link } from "react-router-dom";
import "./App.css";
import { Pattern, Situation } from "./model";
import { SituationView } from "./views/configurationMatrix";
import {
  basicProduction,
  development,
  duplicateIndexes,
  geoPartitionedLeaseholders,
  geoPartitionedReplicas,
  naiveMultiregion,
  oneNodePerRegion,
  PATTERNS,
} from "./patterns";
import { PlaygroundPage } from "./playground";

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

      <h2>
        <Link to="/playground">Playground</Link>
      </h2>
    </div>
  );
}

function PatternPreview(props: { pattern: Pattern }) {
  const [situation, setSituation] = useState<Situation>(
    props.pattern.situation,
  );
  return (
    <>
      <h3>
        <Link to={props.pattern.id}>{props.pattern.name}</Link>
      </h3>
      <SituationView
        situation={situation}
        setSituation={setSituation}
        omitLabels={true}
      />
    </>
  );
}

function PatternPage(props: { pattern: Pattern }) {
  const [pattern, setPattern] = useState(props.pattern);

  return (
    <div className="container">
      <p>
        <Link to="/">&lt; Patterns</Link>
      </p>
      <h1>{pattern.name}</h1>
      <PatternView pattern={pattern} setPattern={setPattern} />
    </div>
  );
}

function App() {
  return (
    <Router>
      <Route path="/" component={IndexPage} exact />
      <Route path="/playground" component={PlaygroundPage} exact />
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
