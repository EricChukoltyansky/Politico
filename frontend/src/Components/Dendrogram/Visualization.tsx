import * as d3 from "d3";
import coalitionData from "../../data/coalition.json";
import * as React from "react";
import { useEffect, useRef } from "react";

const Visualization: React.FC = () => {
  const svgRef = React.useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);

      const width = 800;
      const height = 400;
      const margin = { top: 20, right: 20, bottom: 20, left: 20 };

      const treeLayout = d3.tree().size([width, height]);

      const root = d3.hierarchy(coalitionData);
      treeLayout(root);

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
