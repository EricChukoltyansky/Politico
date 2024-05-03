import * as d3 from "d3";
import coalitionData from "../../data/coalition.json";
import * as React from "react";
import { useEffect, useRef } from "react";

interface ParticipationStats {
  sessions_attended: number;
  total_sessions: number;
}

interface VoteStats {
  for: number;
  against: number;
  abstained: number;
  missed: number;
}

interface Minister {
  title: string;
  name: string;
  party: string;
  stats: {
    votes: VoteStats;
    participation: ParticipationStats;
  };
}

interface PrimeMinister {
  name: string;
  party: string;
}

interface Government {
  prime_minister: PrimeMinister;
  ministers: Minister[];
}

interface HierarchyNode {
  name: string;
  children?: HierarchyNode[];
}

const Visualization: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);

      const width = 800;
      const height = 400;

      // Define the tree layout
      const treeLayout = d3.tree().size([width, height]);

      // Helper function to create a hierarchy
      const hierarchyData = (data: Government): HierarchyNode => {
        return {
          name: data.prime_minister.name, // Root node
          children: data.ministers.map((minister) => ({
            name: minister.name,
            children: [], // Adjust this if ministers have further nested structures
          })),
        };
      };

      // Convert the data to a hierarchy and compute the layout
      const root = d3.hierarchy(
        hierarchyData(coalitionData.government) as HierarchyNode
      );
      treeLayout(root);

      // Draw lines for links
      svg
        .selectAll("line")
        .data(root.links())
        .enter()
        .append("line")
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y)
        .attr("stroke", "black");

      // Draw circles for nodes
      svg
        .selectAll("circle")
        .data(root.descendants())
        .enter()
        .append("circle")
        .attr("cx", (d) => d.x)
        .attr("cy", (d) => d.y)
        .attr("r", 5)
        .attr("fill", "black");
    }

    return () => {
      console.log("cleanup");
    };
  }, [svgRef]);

  return <svg ref={svgRef} width={800} height={400}></svg>;
};

export default Visualization;
