/**
 * Various constants to eager load database entries.
 *
 * @module
 */
import type { Prisma } from '@prisma/client';

/** @constant */
export const competition = {
  include: {
    competitors: {
      include: {
        team: true,
      },
    },
    federation: true,
    tier: {
      include: {
        league: true,
      },
    },
  },
};

/** @constant */
export const continent = {
  include: { countries: true },
};

/** @constant */
export const email = {
  include: {
    from: true,
    dialogues: true,
  },
};

/** @constant */
export const match = {
  include: {
    _count: {
      select: { events: true },
    },
    competition: {
      include: competition.include,
    },
    competitors: {
      include: {
        team: {
          include: {
            country: true,
            players: {
              include: {
                country: true,
              },
            },
          },
        },
      },
    },
    games: {
      include: {
        teams: {
          include: {
            team: true,
          },
        },
      },
    },
  },
};

/** @constant */
export const matchEvents = {
  include: {
    ...match.include,
    events: {
      orderBy: {
        // @note: otherwise we'd have to import `Prisma.SortOrder`.
        timestamp: 'asc' as unknown as 'asc',
      },
      include: {
        attacker: true,
        assist: true,
        victim: true,
        winner: {
          include: {
            team: true,
          },
        },
      },
    },
    players: { include: { country: true } },
  },
};

/** @constant */
export const player = {
  include: { country: true, team: true },
};

/** @constant */
export const profile = {
  include: {
    team: {
      include: {
        personas: true,
        players: player,
      },
    },
    player: {
      include: {
        country: true,
      },
    },
  },
};

/** @constant */
export const sponsor = {
  include: {
    sponsorships: {
      include: {
        offers: true,
        team: true,
      },
    },
  },
};

/** @constant */
export const sponsorship = {
  include: {
    offers: true,
    sponsor: true,
    team: {
      include: {
        personas: true,
      },
    },
  },
};

/** @constant */
export const team = {
  include: { country: true, players: true },
};

/** @constant */
export const tier = {
  include: {
    league: {
      include: {
        federations: true,
      },
    },
  },
};

/** @constant */
export const transfer = {
  include: {
    from: {
      include: {
        country: true,
        players: true,
        personas: true,
      },
    },
    offers: { orderBy: { id: 'desc' as Prisma.SortOrder } },
    target: player,
    to: {
      include: {
        country: true,
        players: true,
        personas: true,
      },
    },
  },
};
