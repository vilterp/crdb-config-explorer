import { useState } from "react";
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
import { DecisionTreePage } from "./decisionTreePage";

function IndexPage() {
  return (
    <>
      <h1>Topology Patterns Explorer</h1>
      <p>
        An{" "}
        <a href="http://worrydream.com/ExplorableExplanations/">
          explorable explanation
        </a>{" "}
        of the patterns documented here for deploying CockroachDB:{" "}
        <a href="https://www.cockroachlabs.com/docs/stable/topology-patterns.html">
          Topology Patterns
        </a>
        .
      </p>

      <h2>Decision Tree</h2>
      <p>
        Not sure where to start? Go through the{" "}
        <Link to="/decision-tree">decision tree</Link>.
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
      <p>
        Edit a pattern as JSON, so you can try out arbitrary patterns and
        import/export.
      </p>
    </>
  );
}

function PatternPreview(props: { pattern: Pattern }) {
  const [situation, setSituation] = useState<Situation>(
    props.pattern.situation,
  );
  return (
    <>
      <h3>
        <Link to={`/pattern/${props.pattern.id}`}>{props.pattern.name}</Link>
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
    <>
      <p>
        <Link to="/">&lt; Patterns</Link>
      </p>
      <h1>{pattern.name}</h1>
      <PatternView pattern={pattern} setPattern={setPattern} />
      <p className="disclaimer">
        Disclaimer: this is a simulator, which uses a very simplified
        reimplementation of CockroachDB's data distribution logic. Always test
        with an actual CockroachDB cluster before going to production.
      </p>
    </>
  );
}

function App() {
  return (
    <div className="container">
      <Router>
        <Route path="/" component={IndexPage} exact />
        <Route path="/playground" component={PlaygroundPage} exact />
        <Route path="/decision-tree" component={DecisionTreePage} />
        {PATTERNS.map(p => (
          <Route
            key={p.id}
            path={`/pattern/${p.id}`}
            component={() => <PatternPage pattern={p} />}
          />
        ))}
      </Router>
    </div>
  );
}

export default App;
