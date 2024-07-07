import { I18nFileContents } from "./I18nFileContents";
import { ModEntry } from "./ModEntry";


export class FileService {
  public static async getModsAvailableToTranslate(): Promise<ModEntry[]> {
    return await engine.call("k45::lte.getModsAvailableToTranslate");
  }
  public static async readI18nCsv(filePath: string, isMain: boolean): Promise<I18nFileContents | number> {
    return await engine.call("k45::lte.readI18nCsv", filePath, isMain);
  }
  public static async saveI18nCsv(modId: string, refFile: string, language: string, entries: string[][]): Promise<string | number> {
    return await engine.call("k45::lte.saveI18nCsv", modId, refFile, language, entries);
  }
  public static async getGameLanguages(): Promise<{ [lang: string]: string }> {
    return await engine.call("k45::lte.getGameLanguages");
  }
  public static async openFileInExplorer(file: string): Promise<void> {
    return await engine.call("k45::lte.openFileInExplorer", file);
  }
  public static async launchGoogleTranslateInBrowser(src: string, dst: string, text: string): Promise<void> {
    return await engine.call("k45::lte.launchGoogleTranslateInBrowser", src, dst, text);
  }
  public static async openArbitraryUrl(url: string): Promise<void> {
    return await engine.call("k45::lte.openArbitraryUrl", url);
  }
  public static async loadInstructions(modId: string, refFile: string): Promise<string> {
    const result = await engine.call("k45::lte.loadInstructions", modId, refFile);
    if (result == -5) return null;
    if (typeof result == "number") return undefined;
    return result;
  }
  public static async loadKeysGroups(modId: string, refFile: string): Promise<[string, string][] | null> {
    const result = await engine.call("k45::lte.loadKeysGroups", modId, refFile);
    if (result == -5) return null
    if (typeof result == "number") return undefined;
    try {
      return Object.entries(JSON.parse(result));
    } catch {
      return null;
    }
  }
}
