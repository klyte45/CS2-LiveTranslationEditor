
export type ModEntry = {
  modId: string;
  modName: string;
  mainFile: string;
  additionalFiles: string[];
};

export type LanguageEntry = {
  languages: {
    [langId: string]: string;
  };
  arguments: string[];
  comments?: string;
  opts?: number;
};

export type EntriesData = {
  availLangs: string[],
  entries: {
    [key: string]: LanguageEntry
  }
}