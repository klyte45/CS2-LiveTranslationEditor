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
}
