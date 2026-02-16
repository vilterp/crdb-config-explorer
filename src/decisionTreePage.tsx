import { DecisionTreeView } from "./views/decisionTree";
import { DECISION_TREE } from "./decisionTree";
import { Link } from "react-router-dom";

export function DecisionTreePage() {
  return (
    <>
      <p>
        <Link to="/">&lt; Patterns</Link>
      </p>
      <h1>Decision Tree</h1>

      <DecisionTreeView tree={DECISION_TREE} />
    </>
  );
}
