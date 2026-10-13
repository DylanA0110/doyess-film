export type TmdbCastSnapshotEntry = {
  id: number;
  name: string;
  gender: number;
  profile_path: string | null;
  character?: string;
  order?: number;
};

export type TmdbCrewSnapshotEntry = {
  id: number;
  name: string;
  job: string;
  profile_path: string | null;
};
