import React, { useState, useEffect } from "react";
import { ForceGraph2D } from "react-force-graph";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import Papa from "papaparse";
import _ from "lodash";

const Visualization = () => {
  const [networkData, setNetworkData] = useState({ nodes: [], links: [] });
  const [selectedMember, setSelectedMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [votingData, setVotingData] = useState([]);
  const [filter, setFilter] = useState({
    party: "all",
    role: "all",
    coalition: "all",
    searchTerm: "",
  });
  const [viewMode, setViewMode] = useState("network"); // 'network', 'voting'

  // Coalition parties - in a real implementation, this could be determined from data
  // or provided via configuration
  const coalitionParties = [
    "Likud",
    "Shas",
    "United Torah Judaism",
    "Religious Zionism",
    "Otzma Yehudit",
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load MK data
        const mkData = await loadCsvFile("mk_individual.csv");
        // Find current MKs
        const currentMKs = mkData.filter((mk) => mk.IsCurrent === true);

        // Load attendance and position data
        const attendanceData = await loadCsvFile("knesset_20_all_meetings.csv");

        // Load faction data
        const factionData = await loadCsvFile("mk_individual_factions.csv");

        // Load voting data
        const votingData = await loadCsvFile(
          "details_knesset_20_all_meetings.csv"
        );

        // Process and join data
        const processedData = processData(
          currentMKs,
          attendanceData,
          factionData,
          votingData
        );

        // Process voting statistics
        const votingStats = processVotingData(votingData);
        setVotingData(votingStats);

        setNetworkData(processedData);
        setLoading(false);
      } catch (error) {
        console.error("Error loading data:", error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Load CSV file
  const loadCsvFile = async (filename) => {
    try {
      const response = await fetch(filename);
      const text = await response.text();
      return new Promise((resolve) => {
        Papa.parse(text, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            resolve(results.data);
          },
        });
      });
    } catch (error) {
      console.error(`Error loading ${filename}:`, error);
      return [];
    }
  };

  // Process voting data to get statistics
  const processVotingData = (votingData) => {
    if (!votingData || votingData.length === 0) return [];

    // Group by faction
    const factionVoting = _.groupBy(votingData, "faction_name");

    // Calculate voting statistics by faction
    const factionStats = Object.entries(factionVoting).map(
      ([faction, votes]) => {
        // Count votes with the majority and against
        const withMajority = votes.filter(
          (v) => v.vote_majority === "with_majority"
        ).length;
        const againstMajority = votes.filter(
          (v) => v.vote_majority === "against_majority"
        ).length;
        const total = votes.length;

        return {
          faction,
          withMajority,
          againstMajority,
          total,
          disciplineRate: Math.round((withMajority / total) * 100),
        };
      }
    );

    return _.orderBy(factionStats, ["disciplineRate"], ["desc"]);
  };

  const processData = (mkData, attendanceData, factionData, votingData) => {
    // Create a map of voting patterns by MK ID
    const votesByMk = _.groupBy(votingData, "mk_id");

    // Join MK data with attendance, position, and voting data
    const combinedData = mkData.map((mk) => {
      const attendance = attendanceData.find(
        (a) => a.mk === mk.mk_individual_name
      );
      const faction = factionData.find(
        (f) => f.mk_individual_id === mk.mk_individual_id
      );
      const votes = votesByMk[mk.mk_individual_id] || [];

      // Calculate voting statistics
      const totalVotes = votes.length;
      const withMajority = votes.filter(
        (v) => v.vote_majority === "with_majority"
      ).length;
      const againstMajority = votes.filter(
        (v) => v.vote_majority === "against_majority"
      ).length;
      const disciplineRate =
        totalVotes > 0 ? Math.round((withMajority / totalVotes) * 100) : 0;

      // Determine faction - use data from multiple sources
      const factionName =
        attendance?.factions ||
        faction?.faction_name ||
        votes[0]?.faction_name ||
        "Unknown";

      // Determine if in coalition
      const isCoalition = coalitionParties.includes(factionName);

      return {
        ...mk,
        faction: factionName,
        attendance: attendance ? attendance.attendance_percent : 0,
        position: attendance ? attendance.position : "",
        ministry: attendance ? attendance.govministry : "",
        totalVotes,
        withMajority,
        againstMajority,
        disciplineRate,
        isCoalition,
      };
    });

    // Create nodes for network graph
    const nodes = combinedData.map((mk, index) => {
      const isPrimeMinister =
        mk.position === "Prime Minister" ||
        mk.position?.includes("ראש הממשלה") ||
        mk.ministry?.includes("Prime Minister");

      const isMinister =
        mk.position?.includes("Minister") ||
        mk.position?.includes("שר") ||
        isPrimeMinister;

      const isCommitteeChair =
        mk.position?.includes("Committee Chair") ||
        mk.position?.includes("יושב ראש הוועדה");

      return {
        id: mk.mk_individual_id,
        name: mk.mk_individual_name,
        faction: mk.faction,
        position: mk.position,
        ministry: mk.ministry,
        attendance: mk.attendance,
        photo: mk.mk_individual_photo || `/api/placeholder/100/100`,
        totalVotes: mk.totalVotes,
        withMajority: mk.withMajority,
        againstMajority: mk.againstMajority,
        disciplineRate: mk.disciplineRate,
        isPrimeMinister,
        isMinister,
        isCommitteeChair,
        isCoalition: mk.isCoalition,
        // Position nodes by role and faction for initial layout
        x: isPrimeMinister
          ? 0
          : (mk.isCoalition ? -100 : 100) + Math.random() * 50,
        y: isPrimeMinister ? 0 : (index % 10) * 30,
      };
    });

    // Create faction groups
    const factionGroups = _.groupBy(nodes, "faction");

    // Create links between nodes based on faction
    let links = [];

    // Connect all members of the same faction
    Object.values(factionGroups).forEach((members) => {
      for (let i = 0; i < members.length; i++) {
        for (let j = i + 1; j < members.length; j++) {
          links.push({
            source: members[i].id,
            target: members[j].id,
            value: 1, // basic connection strength
            type: "faction",
          });
        }
      }
    });

    // Connect ministers to Prime Minister
    const primeMinister = nodes.find((n) => n.isPrimeMinister);
    if (primeMinister) {
      nodes.forEach((node) => {
        if (node.isMinister && !node.isPrimeMinister) {
          links.push({
            source: primeMinister.id,
            target: node.id,
            value: 2, // stronger connection
            type: "government",
          });
        }
      });
    }

    return { nodes, links };
  };

  // Filter nodes based on selected filters
  const getFilteredData = () => {
    if (!networkData.nodes.length) return { nodes: [], links: [] };

    let filteredNodes = networkData.nodes;

    // Apply party filter
    if (filter.party !== "all") {
      filteredNodes = filteredNodes.filter(
        (node) => node.faction === filter.party
      );
    }

    // Apply role filter
    if (filter.role !== "all") {
      switch (filter.role) {
        case "minister":
          filteredNodes = filteredNodes.filter((node) => node.isMinister);
          break;
        case "primeMinister":
          filteredNodes = filteredNodes.filter((node) => node.isPrimeMinister);
          break;
        case "committeeChair":
          filteredNodes = filteredNodes.filter((node) => node.isCommitteeChair);
          break;
        default:
          break;
      }
    }

    // Apply coalition filter
    if (filter.coalition !== "all") {
      const inCoalition = filter.coalition === "coalition";
      filteredNodes = filteredNodes.filter(
        (node) => node.isCoalition === inCoalition
      );
    }

    // Apply search filter
    if (filter.searchTerm) {
      const term = filter.searchTerm.toLowerCase();
      filteredNodes = filteredNodes.filter(
        (node) =>
          node.name.toLowerCase().includes(term) ||
          node.faction.toLowerCase().includes(term) ||
          (node.position && node.position.toLowerCase().includes(term))
      );
    }

    // Get filtered node IDs
    const nodeIds = filteredNodes.map((node) => node.id);

    // Filter links to only include connections between filtered nodes
    const filteredLinks = networkData.links.filter(
      (link) =>
        nodeIds.includes(link.source.id || link.source) &&
        nodeIds.includes(link.target.id || link.target)
    );

    return { nodes: filteredNodes, links: filteredLinks };
  };

  const filteredData = getFilteredData();

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-blue-800 text-white p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Knesset Visualization</h1>

        {/* View Mode Toggle */}
        <div className="flex">
          <button
            className={`px-4 py-2 rounded-l-md ${
              viewMode === "network"
                ? "bg-white text-blue-800 font-bold"
                : "bg-blue-700 text-white"
            }`}
            onClick={() => setViewMode("network")}
          >
            Network View
          </button>
          <button
            className={`px-4 py-2 rounded-r-md ${
              viewMode === "voting"
                ? "bg-white text-blue-800 font-bold"
                : "bg-blue-700 text-white"
            }`}
            onClick={() => setViewMode("voting")}
          >
            Voting Stats
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel - Visualization */}
        <div className="flex-1 bg-white shadow-md m-2 rounded-lg overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-lg">Loading visualization...</p>
            </div>
          ) : viewMode === "network" ? (
            <ForceGraph2D
              graphData={filteredData}
              nodeLabel={(node) => `${node.name} (${node.faction})`}
              nodeColor={(node) =>
                node.isPrimeMinister
                  ? "#FF0000"
                  : node.isMinister
                  ? "#FFA500"
                  : node.isCommitteeChair
                  ? "#00A000"
                  : node.isCoalition
                  ? "#0000FF"
                  : "#888888"
              }
              nodeRelSize={(node) =>
                node.isPrimeMinister
                  ? 10
                  : node.isMinister
                  ? 8
                  : node.isCommitteeChair
                  ? 7
                  : 5
              }
              linkColor={(link) =>
                link.type === "government" ? "#FF0000" : "#CCCCCC"
              }
              linkWidth={(link) => (link.type === "government" ? 2 : 1)}
              onNodeClick={(node) => setSelectedMember(node)}
            />
          ) : (
            <div className="p-4 h-full">
              <h2 className="text-xl font-bold mb-4">
                Party Voting Discipline
              </h2>
              <ResponsiveContainer width="100%" height="80%">
                <BarChart
                  data={votingData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                >
                  <XAxis
                    dataKey="faction"
                    angle={-45}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis
                    label={{
                      value: "Discipline Rate (%)",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <Tooltip
                    formatter={(value) => [`${value}%`, "Discipline Rate"]}
                  />
                  <Legend />
                  <Bar
                    dataKey="disciplineRate"
                    name="Party Discipline"
                    fill="#8884d8"
                    onClick={(data) => {
                      setFilter({ ...filter, party: data.faction });
                      setViewMode("network");
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-sm text-gray-600 italic text-center mt-2">
                Click on a bar to filter network view by that party
              </p>
            </div>
          )}
        </div>

        {/* Right panel - Filters & Details */}
        <div className="w-80 bg-white shadow-md m-2 rounded-lg p-4 overflow-y-auto">
          {/* Filters */}
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-2">Filters</h2>

            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">
                Party/Faction
              </label>
              <select
                className="w-full p-2 border rounded"
                value={filter.party}
                onChange={(e) =>
                  setFilter({ ...filter, party: e.target.value })
                }
              >
                <option value="all">All Parties</option>
                {_.uniqBy(networkData.nodes, "faction").map((node) => (
                  <option key={node.faction} value={node.faction}>
                    {node.faction}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Role</label>
              <select
                className="w-full p-2 border rounded"
                value={filter.role}
                onChange={(e) => setFilter({ ...filter, role: e.target.value })}
              >
                <option value="all">All Roles</option>
                <option value="minister">Ministers</option>
                <option value="primeMinister">Prime Minister</option>
                <option value="committeeChair">Committee Chairs</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">
                Alignment
              </label>
              <select
                className="w-full p-2 border rounded"
                value={filter.coalition}
                onChange={(e) =>
                  setFilter({ ...filter, coalition: e.target.value })
                }
              >
                <option value="all">All Members</option>
                <option value="coalition">Coalition</option>
                <option value="opposition">Opposition</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Search</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={filter.searchTerm}
                onChange={(e) =>
                  setFilter({ ...filter, searchTerm: e.target.value })
                }
                placeholder="Search members..."
              />
            </div>
          </div>

          {/* Member Details */}
          {selectedMember ? (
            <div>
              <h2 className="text-lg font-bold mb-2">Member Details</h2>

              <div className="flex items-center mb-4">
                <img
                  src={selectedMember.photo}
                  alt={selectedMember.name}
                  className="w-16 h-16 rounded-full mr-4"
                />
                <div>
                  <h3 className="font-bold">{selectedMember.name}</h3>
                  <p>{selectedMember.faction}</p>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium">Position</h4>
                <p>{selectedMember.position || "Member of Knesset"}</p>
                {selectedMember.ministry && (
                  <p className="italic">{selectedMember.ministry}</p>
                )}
              </div>

              <div className="mb-4">
                <h4 className="font-medium">Attendance</h4>
                <div className="w-full bg-gray-200 rounded">
                  <div
                    className="bg-blue-500 rounded p-1 text-white text-xs text-right"
                    style={{ width: `${selectedMember.attendance}%` }}
                  >
                    {selectedMember.attendance}%
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium">Alignment</h4>
                <p>{selectedMember.isCoalition ? "Coalition" : "Opposition"}</p>
              </div>

              {/* Voting statistics */}
              <div className="mb-4">
                <h4 className="font-medium">Voting Discipline</h4>
                <div className="flex justify-between text-sm mb-1">
                  <span>Votes with party majority:</span>
                  <span className="font-medium">
                    {selectedMember.withMajority || 0} /{" "}
                    {selectedMember.totalVotes || 0}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded">
                  <div
                    className="bg-purple-500 rounded p-1 text-white text-xs text-right"
                    style={{ width: `${selectedMember.disciplineRate || 0}%` }}
                  >
                    {selectedMember.disciplineRate || 0}%
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedMember.disciplineRate > 90
                    ? "High party loyalty"
                    : selectedMember.disciplineRate > 70
                    ? "Moderate party loyalty"
                    : "Often votes independently"}
                </p>
              </div>

              {/* Bill information */}
              <div>
                <h4 className="font-medium">Recent Bills</h4>
                <p className="text-sm text-gray-600 italic">
                  Bill information would be displayed here, connecting with bill
                  data from kns_bill.csv and kns_billinitiator.csv
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 mt-10">
              <p>Select a member from the visualization to see details</p>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white shadow-md m-2 p-3 rounded-lg">
        <h3 className="font-bold mb-2">Legend</h3>
        <div className="flex flex-wrap">
          <div className="flex items-center mr-4 mb-1">
            <div className="w-4 h-4 rounded-full bg-red-600 mr-1"></div>
            <span className="text-sm">Prime Minister</span>
          </div>
          <div className="flex items-center mr-4 mb-1">
            <div className="w-4 h-4 rounded-full bg-orange-500 mr-1"></div>
            <span className="text-sm">Ministers</span>
          </div>
          <div className="flex items-center mr-4 mb-1">
            <div className="w-4 h-4 rounded-full bg-green-600 mr-1"></div>
            <span className="text-sm">Committee Chairs</span>
          </div>
          <div className="flex items-center mr-4 mb-1">
            <div className="w-4 h-4 rounded-full bg-blue-600 mr-1"></div>
            <span className="text-sm">Coalition Members</span>
          </div>
          <div className="flex items-center mr-4 mb-1">
            <div className="w-4 h-4 rounded-full bg-gray-500 mr-1"></div>
            <span className="text-sm">Opposition Members</span>
          </div>
          <div className="flex items-center mr-4 mb-1">
            <div className="w-1 h-4 bg-red-600 mr-1"></div>
            <span className="text-sm">Government Links</span>
          </div>
          <div className="flex items-center mr-4 mb-1">
            <div className="w-1 h-4 bg-gray-400 mr-1"></div>
            <span className="text-sm">Faction Links</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Visualization;
