const K_FACTOR_NEW = 40;
const K_FACTOR_STANDARD = 20;
const K_FACTOR_MASTER = 10;
const GAMES_NEW_THRESHOLD = 30;
const RATING_MASTER_THRESHOLD = 2400;

function getKFactor(rating: number, gamesPlayed: number): number {
  if (gamesPlayed < GAMES_NEW_THRESHOLD) return K_FACTOR_NEW;
  if (rating >= RATING_MASTER_THRESHOLD) return K_FACTOR_MASTER;
  return K_FACTOR_STANDARD;
}

function expectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

export interface EloResult {
  whiteNewRating: number;
  blackNewRating: number;
  whiteChange: number;
  blackChange: number;
}

export function calculateElo(
  whiteRating: number,
  blackRating: number,
  whiteGamesPlayed: number,
  blackGamesPlayed: number,
  result: "white" | "black" | "draw"
): EloResult {
  const whiteK = getKFactor(whiteRating, whiteGamesPlayed);
  const blackK = getKFactor(blackRating, blackGamesPlayed);

  const whiteExpected = expectedScore(whiteRating, blackRating);
  const blackExpected = expectedScore(blackRating, whiteRating);

  let whiteScore: number;
  let blackScore: number;

  if (result === "white") {
    whiteScore = 1;
    blackScore = 0;
  } else if (result === "black") {
    whiteScore = 0;
    blackScore = 1;
  } else {
    whiteScore = 0.5;
    blackScore = 0.5;
  }

  const whiteChange = Math.round(whiteK * (whiteScore - whiteExpected));
  const blackChange = Math.round(blackK * (blackScore - blackExpected));

  return {
    whiteNewRating: Math.max(100, whiteRating + whiteChange),
    blackNewRating: Math.max(100, blackRating + blackChange),
    whiteChange,
    blackChange,
  };
}
