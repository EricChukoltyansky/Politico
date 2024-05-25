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

export type { Government };
