
export type ModEntry = {
  modId: string;
  modName: string;
  mainFile: string;
  additionalFiles: string[];
};

export type EntriesData = {
  availLangs: string[],
  entries: {
    [key: string]: {
      languages: {
        [langId: string]: string,
      },
      arguments: string[],
      comments?: string,
      opts?: number,
    }
  }
}