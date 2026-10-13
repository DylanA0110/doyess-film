export type ImdbExportRow = {
  Const: string;
  'Your Rating': string;
  'Date Rated': string;
  Title: string;
  'Original Title': string;
  URL: string;
  'Title Type': string;
  'IMDb Rating': string;
  'Runtime (mins)': string;
  Year: string;
  Genres: string;
  'Num Votes': string;
  'Release Date': string;
  Directors: string;
};

export type ImportedTitle = {
  imdbId: string;
  yourRating: number | null;
  dateRated: string | null;
  title: string;
  originalTitle: string;
  url: string;
  titleType: string;
  imdbRating: number | null;
  runtimeMinutes: number | null;
  year: number | null;
  genres: string[];
  numVotes: number | null;
  releaseDate: string | null;
  directors: string[];
};
