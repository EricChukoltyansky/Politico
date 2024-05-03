import { hierarchy, tree } from "d3-hierarchy";
import { select } from "d3-selection";
import { HierarchyNode } from "d3-hierarchy";
import coalitionData from "../../data/coalition.json";
import * as React from "react";
import { useEffect, useRef } from "react";

// interface VoteStats {
//   for: number;
//   against: number;
//   abstained: number;
//   missed: number;
// }

// interface Minister {
//   title: string;
//   name: string;
//   party: string;
//   stats: {
//     votes: VoteStats;
//     participation: ParticipationStats;
//   };
// }

// interface ParticipationStats {
//   sessions_attended: number;
//   total_sessions: number;
// }

// interface PrimeMinister {
//   name: string;
//   party: string;
// }

// interface Government {
//   prime_minister: PrimeMinister;
//   ministers: Minister[];
// }

interface MinisterStats {
  votes: {
    for: number;
    against: number;
    abstained: number;
    missed: number;
  };
  participation: {
    sessions_attended: number;
    total_sessions: number;
  };
}

interface Minister {
  name: string;
  party: string;
  stats: MinisterStats;
}

interface Government {
  prime_minister: {
    name: string;
  };
  ministers: Minister[];
}

const Visualization: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (svgRef.current) {
      const svgElement = svgRef.current;
      const width = 800;
      const height = 400;

      const governmentData = coalitionData.government as Government;

      const hierarchyData = {
        name: "Government",
        children: [
          {
            name: governmentData.prime_minister.name,
            children: governmentData.ministers.map((minister) => ({
              name: `${minister.name} (${minister.party})`,
              children: [
                {
                  name: "Vote Stats",
                  children: [
                    { name: `For: ${minister.stats.votes.for}` },
                    { name: `Against: ${minister.stats.votes.against}` },
                    { name: `Abstained: ${minister.stats.votes.abstained}` },
                    { name: `Missed: ${minister.stats.votes.missed}` },
                  ],
                },
                {
                  name: "Participation Stats",
                  children: [
                    {
                      name: `Sessions Attended: ${minister.stats.participation.sessions_attended}`,
                    },
                    {
                      name: `Total Sessions: ${minister.stats.participation.total_sessions}`,
                    },
                  ],
                },
              ],
            })),
          },
        ],
      };

      const root: HierarchyNode<unknown> = hierarchy(
        hierarchyData
      ) as HierarchyNode<unknown>;

      const layout = tree().size([width, height]);
      layout(root);

      select(svgElement)
        .selectAll("line")
        .data(root.links())
        .enter()
        .append("line")
        .attr("x1", (d) => d.source.x || 0)
        .attr("y1", (d) => d.source.y || 0)
        .attr("x2", (d) => d.target.x || 0)
        .attr("y2", (d) => d.target.y || 0)
        .attr("stroke", "black");

      select(svgElement)
        .selectAll("circle")
        .data(root.descendants())
        .enter()
        .append("circle")
        .attr("cx", (d) => d.x || 0)
        .attr("cy", (d) => d.y || 0)
        .attr("r", 5)
        .attr("fill", "black");
    }
  }, [svgRef]);

  return <svg ref={svgRef} width="800" height="400"></svg>;
};

export default Visualization;
