import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const ForceDirectedGraph = () => {
  const svgRef = useRef(null);

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
    // Core Leadership
    {
      id: "Netanyahu",
      name: "Benjamin Netanyahu",
      role: "Prime Minister",
      group: "Likud",
      size: 25,
    },
    {
      id: "Levin",
      name: "Yariv Levin",
      role: "Deputy PM & Justice",
      group: "Likud",
      size: 22,
    },

    // Senior Ministers
    {
      id: "Smotrich",
      name: "Bezalel Smotrich",
      role: "Finance",
      group: "Mafdal–Religious Zionism",
      size: 20,
    },
    {
      id: "Ben-Gvir",
      name: "Itamar Ben-Gvir",
      role: "National Security",
      group: "Otzma Yehudit",
      size: 20,
    },
    {
      id: "Katz",
      name: "Israel Katz",
      role: "Foreign Affairs",
      group: "Likud",
      size: 20,
    },

    // Ministers
    {
      id: "Arbel",
      name: "Moshe Arbel",
      role: "Interior",
      group: "Shas",
      size: 18,
    },
    { id: "Buso", name: "Uriel Buso", role: "Health", group: "Shas", size: 18 },
    {
      id: "Wasserlauf",
      name: "Yitzhak Wasserlauf",
      role: "Negev & Galilee",
      group: "Otzma Yehudit",
      size: 18,
    },
    {
      id: "Golan",
      name: "May Golan",
      role: "Social Equality",
      group: "Likud",
      size: 18,
    },
    {
      id: "Goldknopf",
      name: "Yitzhak Goldknopf",
      role: "Housing",
      group: "United Torah Judaism",
      size: 18,
    },
    {
      id: "Dichter",
      name: "Avi Dichter",
      role: "Agriculture",
      group: "Likud",
      size: 18,
    },
    {
      id: "Sofer",
      name: "Ofir Sofer",
      role: "Aliyah",
      group: "Mafdal–Religious Zionism",
      size: 18,
    },
    {
      id: "Karhi",
      name: "Shlomo Karhi",
      role: "Communications",
      group: "Likud",
      size: 18,
    },
    {
      id: "Zohar",
      name: "Miki Zohar",
      role: "Culture & Sport",
      group: "Likud",
      size: 18,
    },
    {
      id: "Barkat",
      name: "Nir Barkat",
      role: "Economy",
      group: "Likud",
      size: 18,
    },
    {
      id: "Kisch",
      name: "Yoav Kisch",
      role: "Education",
      group: "Likud",
      size: 18,
    },
    {
      id: "Amsalem",
      name: "Dudi Amsalem",
      role: "Regional Cooperation",
      group: "Likud",
      size: 18,
    },
    {
      id: "Cohen",
      name: "Eli Cohen",
      role: "Energy",
      group: "Likud",
      size: 18,
    },
    {
      id: "Gamliel",
      name: "Gila Gamliel",
      role: "Science & Technology",
      group: "Likud",
      size: 18,
    },
    {
      id: "Eliyahu",
      name: "Amihai Eliyahu",
      role: "Heritage",
      group: "Otzma Yehudit",
      size: 18,
    },
    {
      id: "Porush",
      name: "Meir Porush",
      role: "Jerusalem Affairs",
      group: "United Torah Judaism",
      size: 18,
    },
    {
      id: "Margi",
      name: "Ya'akov Margi",
      role: "Labor & Social Affairs",
      group: "Shas",
      size: 18,
    },
    {
      id: "Strook",
      name: "Orit Strook",
      role: "Settlements",
      group: "Mafdal–Religious Zionism",
      size: 18,
    },
    {
      id: "Malchieli",
      name: "Michael Malchieli",
      role: "Religious Affairs",
      group: "Shas",
      size: 18,
    },
    {
      id: "Dermer",
      name: "Ron Dermer",
      role: "Strategic Affairs",
      group: "Likud",
      size: 18,
    },
    {
      id: "HKatz",
      name: "Haim Katz",
      role: "Tourism",
      group: "Likud",
      size: 18,
    },
    {
      id: "Regev",
      name: "Miri Regev",
      role: "Transportation",
      group: "Likud",
      size: 18,
    },

    // Ministers without Portfolio
    {
      id: "Gantz",
      name: "Benny Gantz",
      role: "Minister",
      group: "National Unity",
      size: 18,
    },
    {
      id: "Saar",
      name: "Gideon Sa'ar",
      role: "Minister",
      group: "New Hope",
      size: 18,
    },
    {
      id: "Eisenkot",
      name: "Gadi Eisenkot",
      role: "Minister",
      group: "National Unity",
      size: 18,
    },
    {
      id: "Tropper",
      name: "Hili Tropper",
      role: "Minister",
      group: "National Unity",
      size: 18,
    },
  ];

  const links = [
    // Core leadership connections
    { source: "Netanyahu", target: "Levin", value: 3, type: "party" },

    // Coalition connections
    { source: "Netanyahu", target: "Smotrich", value: 2, type: "coalition" },
    { source: "Netanyahu", target: "Ben-Gvir", value: 2, type: "coalition" },
    { source: "Netanyahu", target: "Arbel", value: 2, type: "coalition" },
    { source: "Netanyahu", target: "Goldknopf", value: 2, type: "coalition" },

    // Emergency government connections
    { source: "Netanyahu", target: "Gantz", value: 1, type: "emergency" },
    { source: "Netanyahu", target: "Saar", value: 1, type: "emergency" },
    { source: "Netanyahu", target: "Eisenkot", value: 1, type: "emergency" },
    { source: "Netanyahu", target: "Tropper", value: 1, type: "emergency" },

    // Party connections - Likud
    ...[
      "Katz",
      "Barkat",
      "Kisch",
      "Amsalem",
      "Cohen",
      "Gamliel",
      "Dermer",
      "HKatz",
      "Regev",
      "Golan",
      "Dichter",
      "Karhi",
      "Zohar",
    ].map((id) => ({
      source: "Netanyahu",
      target: id,
      value: 2,
      type: "party",
    })),

    // Religious Zionism connections
    ...["Strook", "Sofer"].map((id) => ({
      source: "Smotrich",
      target: id,
      value: 2,
      type: "party",
    })),

    // Otzma Yehudit connections
    ...["Wasserlauf", "Eliyahu"].map((id) => ({
      source: "Ben-Gvir",
      target: id,
      value: 2,
      type: "party",
    })),

    // Shas connections
    ...["Buso", "Margi", "Malchieli"].map((id) => ({
      source: "Arbel",
      target: id,
      value: 2,
      type: "party",
    })),
  ];

  const linkStyles = {
    party: "#666",
    coalition: "#090",
    emergency: "#f00",
  };

  useEffect(() => {
    if (!svgRef.current) return;

    d3.select(svgRef.current).selectAll("*").remove();

    const width = window.innerWidth; // Adjust padding as needed
    const height = window.innerHeight;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("class", "bg-white rounded-lg shadow-lg");

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d) => d.id)
          .distance(180)
      )
      .force("charge", d3.forceManyBody().strength(-1500))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(70));

    const link = svg
      .append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .style("stroke", (d) => linkStyles[d.type])
      .style("stroke-width", (d) => Math.sqrt(d.value) * 2)
      .style("stroke-opacity", 0.6);

    const node = svg.append("g").selectAll("g").data(nodes).join("g");

    // Add circles
    node
      .append("circle")
      .attr("r", (d) => d.size)
      .style("fill", (d) => partyColors[d.group])
      .style("stroke", "#fff")
      .style("stroke-width", "2px");

    // Add foreignObject for HTML-based text
    const foreignObject = node
      .append("foreignObject")
      .attr("x", (d) => -65)
      .attr("y", (d) => -d.size - 45)
      .attr("width", 130)
      .attr("height", 80)
      .attr("class", "overflow-visible");

    // Add HTML content with improved styling
    foreignObject
      .append("xhtml:div")
      .attr("class", "text-center")
      .html(
        (d) => `
        <div class="shadow-lg" style="
          background: white;
          border: 2px solid ${partyColors[d.group]};
          border-radius: 4px;
          padding: 4px 8px;
          margin: 2px;
        ">
          <div style="
            font-size: 12px;
            font-weight: 700;
            color: ${partyColors[d.group]};
            text-shadow: 1px 1px 1px rgba(255,255,255,0.5);
            line-height: 1.2;
          ">${d.name}</div>
          <div style="
            font-size: 11px;
            font-weight: 600;
            color: #4A5568;
            background: rgba(255,255,255,0.9);
            padding: 2px;
            margin-top: 2px;
            border-radius: 2px;
          ">${d.role}</div>
        </div>
      `
      );

    // Add party label with improved visibility
    node
      .append("text")
      .attr("dy", (d) => d.size + 15)
      .text((d) => d.group)
      .style("text-anchor", "middle")
      .style("font-family", "Arial, sans-serif")
      .style("font-size", "10px")
      .style("font-weight", "bold")
      .style("fill", (d) => partyColors[d.group])
      .style("stroke", "white")
      .style("stroke-width", "2px")
      .style("paint-order", "stroke");

    function dragstarted(event, simulation) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragEnded(event, simulation) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    node.call(
      d3
        .drag()
        .on("start", (event) => dragstarted(event, simulation))
        .on("drag", dragged)
        .on("end", (event) => dragEnded(event, simulation))
    );

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, []);

  return (
    <div className="w-full mx-auto p-4">
      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{
          minHeight: "90vh",
        }}
      />
    </div>
  );
};

export default ForceDirectedGraph;
