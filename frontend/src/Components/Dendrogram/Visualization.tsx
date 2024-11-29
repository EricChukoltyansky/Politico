import React, { useEffect, useRef, useCallback } from "react";
import * as d3 from "d3";

const Visualization = () => {
  const svgRef = useRef(null);

  // Constants and data
  const partyColors = {
    Likud: "#0052A5",
    Shas: "#FFA500",
    "Mafdal–Religious Zionism": "#8B4513",
    "United Torah Judaism": "#4B0082",
    "Otzma Yehudit": "#8B0000",
    "National Unity": "#006400",
    "New Hope": "#4169E1",
  };

  const nodes = [
    {
      id: "Netanyahu",
      label: "Benjamin Netanyahu\nPrime Minister",
      group: "Likud",
      size: 25,
    },
    {
      id: "Levin",
      label: "Yariv Levin\nDeputy PM & Justice",
      group: "Likud",
      size: 20,
    },
    {
      id: "Deri",
      label: "Aryeh Deri\nFormer Deputy PM",
      group: "Shas",
      size: 20,
    },
    {
      id: "Smotrich",
      label: "Bezalel Smotrich\nFinance",
      group: "Mafdal–Religious Zionism",
      size: 20,
    },
    {
      id: "Ben-Gvir",
      label: "Itamar Ben-Gvir\nNational Security",
      group: "Otzma Yehudit",
      size: 20,
    },
    {
      id: "Gantz",
      label: "Benny Gantz\nMinister",
      group: "National Unity",
      size: 20,
    },
    { id: "Gallant", label: "Yoav Gallant\nDefense", group: "Likud", size: 18 },
    {
      id: "Katz",
      label: "Israel Katz\nForeign Affairs",
      group: "Likud",
      size: 18,
    },
    { id: "Barkat", label: "Nir Barkat\nEconomy", group: "Likud", size: 18 },
  ];

  const links = [
    { source: "Netanyahu", target: "Levin", value: 3, type: "party" },
    { source: "Netanyahu", target: "Deri", value: 2, type: "coalition" },
    { source: "Netanyahu", target: "Smotrich", value: 2, type: "coalition" },
    { source: "Netanyahu", target: "Ben-Gvir", value: 2, type: "coalition" },
    { source: "Netanyahu", target: "Gantz", value: 1, type: "emergency" },
    { source: "Netanyahu", target: "Gallant", value: 2, type: "party" },
    { source: "Netanyahu", target: "Katz", value: 2, type: "party" },
    { source: "Netanyahu", target: "Barkat", value: 2, type: "party" },
  ];

  const linkStyles = {
    party: "#666",
    coalition: "#090",
    emergency: "#f00",
  };

  // Drag handlers
  const dragStarted = useCallback((event, simulation) => {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }, []);

  const dragged = useCallback((event) => {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }, []);

  const dragEnded = useCallback((event, simulation) => {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    const width = 800;
    const height = 600;

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("class", "bg-white rounded-lg shadow-lg");

    // Initialize force simulation
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d) => d.id)
          .distance(150)
      )
      .force("charge", d3.forceManyBody().strength(-1000))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(50));

    // Create links
    const link = svg
      .append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .style("stroke", (d) => linkStyles[d.type])
      .style("stroke-width", (d) => Math.sqrt(d.value) * 2)
      .style("stroke-opacity", 0.6);

    // Create nodes
    const node = svg.append("g").selectAll("g").data(nodes).join("g");

    // Add circles to nodes
    node
      .append("circle")
      .attr("r", (d) => d.size)
      .style("fill", (d) => partyColors[d.group])
      .style("stroke", "#fff")
      .style("stroke-width", "2px");

    // Add labels
    node
      .append("text")
      .attr("dy", (d) => -d.size - 5)
      .text((d) => d.label)
      .style("text-anchor", "middle")
      .style("font-family", "Arial, sans-serif")
      .style("font-size", "11px")
      .style("pointer-events", "none");

    // Add drag behavior
    node.call(
      d3
        .drag()
        .on("start", (event) => dragStarted(event, simulation))
        .on("drag", dragged)
        .on("end", (event) => dragEnded(event, simulation))
    );

    // Update positions on simulation tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    // Cleanup on unmount
    return () => {
      simulation.stop();
    };
  }, []); // Empty dependency array since we want this to run once on mount

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{
          maxHeight: "600px",
        }}
      />
    </div>
  );
};

export default Visualization;
