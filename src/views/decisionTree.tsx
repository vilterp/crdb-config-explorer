import React, { useState } from "react";
import {
  AnswerNode,
  DecisionNode,
  Option,
  QuestionNode,
  TopologyPatternDesc,
} from "../decisionTree";
import { Link } from "react-router-dom";

export function DecisionTreeView(props: {
  tree: DecisionNode<TopologyPatternDesc>;
}) {
  switch (props.tree.type) {
    case "ANSWER":
      return <AnswerView answer={props.tree} />;
    case "QUESTION":
      return <QuestionView question={props.tree} />;
  }
}

function QuestionView(props: { question: QuestionNode<TopologyPatternDesc> }) {
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(
    null,
  );

  return (
    <>
      <p>{props.question.question}</p>
      <ul>
        {props.question.options.map((opt, idx) => (
          <li key={idx} onClick={() => setSelectedOptionIdx(idx)}>
            {opt.name}
            {idx === selectedOptionIdx ? <OptionView option={opt} /> : null}
          </li>
        ))}
      </ul>
    </>
  );
}

function OptionView(props: { option: Option<TopologyPatternDesc> }) {
  return (
    <>
      <DecisionTreeView tree={props.option.node} />
    </>
  );
}

function AnswerView(props: { answer: AnswerNode<TopologyPatternDesc> }) {
  const patternDesc = props.answer.answer;
  return (
    <>
      <h2>{patternDesc.name}</h2>
      <p>{patternDesc.explanation}</p>
      <p>
        <Link to={`/pattern/${patternDesc.id}`}>Simulate &gt;</Link>
      </p>
    </>
  );
}
