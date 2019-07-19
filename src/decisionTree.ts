import {
  basicProduction,
  development,
  duplicateIndexes,
  geoPartitionedLeaseholders,
  geoPartitionedReplicas,
} from "./patterns";

export type DecisionNode<T> = QuestionNode<T> | AnswerNode<T>;

export interface QuestionNode<T> {
  type: "QUESTION";
  question: string;
  options: Option<T>[];
}

export interface AnswerNode<T> {
  type: "ANSWER";
  answer: T;
}

export interface Option<T> {
  name: string;
  node: DecisionNode<T>;
}

function Question<T>(q: string, opts: Option<T>[]): QuestionNode<T> {
  return {
    type: "QUESTION",
    question: q,
    options: opts,
  };
}

function Answer<T>(a: T): AnswerNode<T> {
  return {
    type: "ANSWER",
    answer: a,
  };
}

function Option<T>(name: string, node: DecisionNode<T>): Option<T> {
  return {
    name,
    node,
  };
}

export interface TopologyPatternDesc {
  name: string;
  explanation: string;
  id: string;
}

export const DECISION_TREE: DecisionNode<TopologyPatternDesc> = Question(
  "Does your business operate in a single-region or multi-region?",
  [
    Option(
      "Single-region",
      Question(
        "Do you want to build a prototype or do you want to go into production in a single-region?",
        [
          Option(
            "Prototype",
            Answer({
              name: "Development",
              explanation:
                "While developing an application against CockroachDB, it's sufficient to deploy a single-node cluster close to your test application, whether that's on a single VM or on your laptop.",
              id: development.id,
            }),
          ),
          Option(
            "Basic production",
            Answer({
              name: "Basic Production",
              explanation:
                "When you're ready to run CockroachDB in production in a single region, it's important to deploy at least 3 CockroachDB nodes to take advantage of CockroachDB's automatic replication, distribution, rebalancing, and resiliency capabilities.",
              id: basicProduction.id,
            }),
          ),
        ],
      ),
    ),
    Option(
      "Multi-region",
      Question(
        "Do you know from which region your customer requests originate?",
        [
          Option(
            "Yes, I know the origin of customer requests",
            Question(
              "Is surviving one availability zone sufficient for your business?",
              [
                Option(
                  "Yes",
                  Answer({
                    name: "partitioning",
                    explanation:
                      "In a multi-region deployment, the geo-partitioned replicas topology is a good choice for tables with the following requirements: Read and write latency must be low. Rows in the table, and all latency-sensitive queries, can be tied to specific geographies, e.g., city, state, region. Regional data must remain available during an AZ failure, but it's OK for regional data to become unavailable during a region-wide failure.",
                    id: geoPartitionedReplicas.id,
                  }),
                ),
                Option(
                  "No",
                  Answer({
                    name: "Geo-partitioned Leaseholders",
                    explanation:
                      "In a multi-region deployment, the geo-partitioned leaseholders topology is a good choice for tables with the following requirements: Read latency must be low, but write latency can be higher. Reads must be up-to-date for business reasons or because the table is reference by foreign keys. Rows in the table, and all latency-sensitive queries, can be tied to specific geographies, e.g., city, state, region. Table data must remain available during a region failure.",
                    id: geoPartitionedLeaseholders.id,
                  }),
                ),
              ],
            ),
          ),
          Option(
            "No, I don’t know the origin of requests",
            Question("How important are reads as compared to writes?", [
              Option(
                "Reads are much more important",
                Question("Can you tolerate stale reads?", [
                  Option(
                    "Yes",
                    Answer({
                      name: "Follower Reads",
                      explanation:
                        "In a multi-region deployment, the follower reads pattern is a good choice for tables with the following requirements: Read latency must be low, but write latency can be higher. Reads can be historical (48 seconds or more in the past). Rows in the table, and all latency-sensitive queries, cannot be tied to specific geographies (e.g., a reference table). Table data must remain available during a region failure.",
                      id: "follower-reads", // TODO: create a pattern for this so it doesn't 404...
                    }),
                  ),
                  Option(
                    "No",
                    Answer({
                      name: "Duplicate Indexes",
                      explanation:
                        "In a multi-region deployment, the duplicate indexes pattern is a good choice for tables with the following requirements: Read latency must be low, but write latency can be much higher. Reads must be up-to-date for business reasons or because the table is reference by foreign keys. Rows in the table, and all latency-sensitive queries, cannot be tied to specific geographies. Table data must remain available during a region failure. In general, this pattern is suited well for immutable/reference tables that are rarely or never updated.",
                      id: duplicateIndexes.id,
                    }),
                  ),
                ]),
              ),
              Option(
                "Reads are more important",
                Answer({
                  name: "Follow-the-Workload",
                  explanation:
                    "In a multi-region deployment, follow-the-workload is the default pattern for tables that use no other pattern. In general, this default pattern is a good choice only for tables with the following requirements: The table is active mostly in one region at a time, e.g., following the sun. In the active region, read latency must be low, but write latency can be higher. In non-active regions, both read and write latency can be higher. Table data must remain available during a region failure.",
                  id: "follow-the-workload", // TODO: create a pattern for this one
                }),
              ),
              Option(
                "Reads and writes are equally important",
                Answer({
                  name: "Follow-the-Workload",
                  explanation:
                    "In a multi-region deployment, follow-the-workload is the default pattern for tables that use no other pattern. In general, this default pattern is a good choice only for tables with the following requirements: The table is active mostly in one region at a time, e.g., following the sun. In the active region, read latency must be low, but write latency can be higher. In non-active regions, both read and write latency can be higher. Table data must remain available during a region failure.",
                  id: "follow-the-workload",
                }),
              ),
            ]),
          ),
        ],
      ),
    ),
  ],
);
