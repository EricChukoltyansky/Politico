import { hierarchy, cluster, HierarchyNode } from "d3-hierarchy";
import { select } from "d3-selection";
import coalitionData from "../../data/coalition.json";
import * as React from "react";
import { useEffect, useRef } from "react";
import { Government } from "./interfaces";

const Visualization: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (svgRef.current) {
      const svgElement = svgRef.current;
      const width = 800;
      const height = 800;
      const radius = Math.min(width, height) / 2;

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

      const root = hierarchy(hierarchyData)
        .sum((d) => d.children?.length || 0)
        .sort(
          (a, b) =>
            a.height - b.height || a.data.name.localeCompare(b.data.name)
        ) as HierarchyNode<unknown>;

      const layout = cluster()
        .size([360, radius - 100])
        .separation((a, b) => (a.parent == b.parent ? 1 : 2) / a.depth);

      layout(root);

      root.each((d) => {
        const angle = ((d.x - 90) / 180) * Math.PI;
        d.x = radius + d.y * Math.cos(angle);
        d.y = radius + d.y * Math.sin(angle);
      });

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

      select(svgElement)
        .selectAll("text")
        .data(root.descendants())
        .enter()
        .append("text")
        .attr("x", (d) => d.x || 0)
        .attr("y", (d) => d.y || 0)
        .attr("dy", "0.35em")
        .attr("text-anchor", (d) => (d.x < width / 2 ? "start" : "end"))
        .attr(
          "transform",
          (d) => `rotate(${d.x < width / 2 ? d.x - 90 : d.x + 90})`
        )
        .text((d) => d.data.name)
        .style("font-size", "12px")
        .style("user-select", "none");
    }
  }, [svgRef]);

  return (
    <svg
      ref={svgRef}
      width="800"
      height="800"
      style={{ transform: "rotate(-90deg)" }}
    ></svg>
  );
};

export default Visualization;
