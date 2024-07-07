using Colossal;
using Colossal.IO.AssetDatabase;
using Game;
using Game.Modding;
using Game.SceneFlow;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Web;
using UnityEngine;

namespace LiveTranslationEditor
{
    public class LiveTranslationEditorMod : IMod
    {
        public const string CouiHost = "lte.k45";
        public void OnDispose()
        {

        }

        public void OnLoad(UpdateSystem updateSystem)
        {
            GameManager.instance.userInterface.view.uiSystem.AddHostLocation(CouiHost, new HashSet<string> { ModInstallFolder });
        }

        private static string m_modInstallFolder;
        public static string ModInstallFolder
        {
            get
            {
                if (m_modInstallFolder is null)
                {
                    var thisFullName = typeof(LiveTranslationEditorMod).Assembly.FullName;
                    ExecutableAsset thisInfo = AssetDatabase.global.GetAsset(SearchFilter<ExecutableAsset>.ByCondition(x => x.definition?.FullName == thisFullName));
                    if (thisInfo is null)
                    {
                        throw new Exception("This mod info was not found!!!!");
                    }
                    m_modInstallFolder = Path.GetDirectoryName(thisInfo.GetMeta().path);
                }
                return m_modInstallFolder;
            }
        }

        public static readonly Action<Action<string, Delegate>> EuisCallersRegister = (eventCaller) =>
        {
            eventCaller("getModsAvailableToTranslate", GetModsAvailableToTranslate);
            eventCaller("readI18nCsv", ReadI18nCsv);
            eventCaller("saveI18nCsv", SaveI18nCsv);
            eventCaller("getGameLanguages", GetGameLanguages);
            eventCaller("openFileInExplorer", OpenFileInExplorer);
            eventCaller("launchGoogleTranslateInBrowser", LaunchGoogleTranslateInBrowser);
            eventCaller("loadKeysGroups", LoadKeysGroups);
            eventCaller("openArbitraryUrl", OpenArbitraryUrl);
            eventCaller("loadInstructions", LoadInstructions);
        };

        public struct ModEntry
        {
            public string modId;
            public string modName;
            public string mainFile;
            public string[] additionalFiles;
        }

        public struct I18nFileContents
        {
            public string filename;
            public string[] columnsInformation;
            public string[][] entries;
        }

        private static List<ModEntry> GetModsAvailableToTranslate()
        {
            var allEuisAssemblies = AssetDatabase.global.GetAssets<ExecutableAsset>()
                .Where(x => x.isMod)
                .SelectMany(mod => Directory.GetFiles(Path.GetDirectoryName(mod.GetMeta().path), "i18n.csv", SearchOption.AllDirectories).Select(file => (mod, file)))
                .ToHashSet();
            var result = new List<ModEntry>();
            foreach (var item in allEuisAssemblies)
            {
                result.Add(new ModEntry
                {
                    modId = item.mod.identifier,
                    modName = item.mod.GetMeta().displayName,
                    mainFile = item.file,
                    additionalFiles = Directory.GetFiles(Path.GetDirectoryName(item.file), "*.csv").Where(x => !x.EndsWith("i18n.csv")).ToArray()
                });
            }
            return result;
        }
        private static object ReadI18nCsv(string filePath, bool isMain)
        {
            if (isMain && !filePath.EndsWith($"{Path.DirectorySeparatorChar}i18n.csv")) return -1;
            if (!isMain && !filePath.EndsWith($".csv")) return -6;
            if (!File.Exists(filePath)) return -2;
            var fileContents = new Queue<string>(File.ReadAllLines(filePath));
            if (!fileContents.TryDequeue(out var firstLine)) return -3;
            var splittedFirstLine = firstLine.Split("\t");
            return isMain && splittedFirstLine[0] != "key" ? -4
                : isMain && !splittedFirstLine.Contains("en-US") ? -5
                : new I18nFileContents
                {
                    filename = filePath,
                    columnsInformation = isMain ? splittedFirstLine : null,
                    entries = fileContents.Select(x => x.Split("\t").Select(x => x.Replace("\\t", "\t").Replace("\\n", "\n")).ToArray()).Concat(isMain ? new string[][] { } : new[] { splittedFirstLine }).ToArray()
                };
        }
        private static object SaveI18nCsv(string modId, string refFile, string language, string[][] entries)
        {
            if (!Regex.IsMatch(language, "^[A-Za-z]{1,8}(-[A-Za-z0-9]{1,8})*$")) return -5;
            if (!refFile.EndsWith($"{Path.DirectorySeparatorChar}i18n.csv")) return -1;
            if (!File.Exists(refFile)) return -2;
            var mod = AssetDatabase.global.GetAssets<ExecutableAsset>().Where(x => x.identifier == modId).FirstOrDefault();
            if (mod is null) return -3;
            if (!refFile.StartsWith(Path.GetDirectoryName(mod.GetMeta().path))) return -4;

            var newFileName = Path.Combine(Path.GetDirectoryName(refFile), $"{language}.csv");
            File.WriteAllLines(newFileName, entries.Select(x => string.Join("\t", x.Select(y => y.Replace("\t", "\\t").Replace("\n", "\\n")))));

            return newFileName;
        }

        private static Dictionary<string, string> GetGameLanguages()
        {
            return GameManager.instance.localizationManager.GetSupportedLocales().ToDictionary(x => x, x => GameManager.instance.localizationManager.GetLocalizedName(x));
        }

        private static void OpenFileInExplorer(string filename)
        {
            RemoteProcess.OpenFolder(Path.GetDirectoryName(filename));
        }
        private static void LaunchGoogleTranslateInBrowser(string srcLang, string dstLang, string text)
        {
            Application.OpenURL($"https://translate.google.com/?sl={Cs2LangToGoogleLang(srcLang)}&tl={Cs2LangToGoogleLang(dstLang)}&text={HttpUtility.UrlEncode(text)}&op=translate");
        }
        private static void OpenArbitraryUrl(string url)
        {
            Application.OpenURL(url);
        }

        private static string Cs2LangToGoogleLang(string lang)
        {
            return lang switch
            {
                "zh-HANS" => "zh-CN",
                "zh-HANT" => "zh-TW",
                "pt-PT" => "pt-PT",
                _ => lang.Split("-")[0]
            };
        }

        private static object LoadKeysGroups(string modId, string refFile)
        {
            if (!refFile.EndsWith($"{Path.DirectorySeparatorChar}i18n.csv")) return -1;
            if (!File.Exists(refFile)) return -2;
            var mod = AssetDatabase.global.GetAssets<ExecutableAsset>().Where(x => x.identifier == modId).FirstOrDefault();
            if (mod is null) return -3;
            if (!refFile.StartsWith(Path.GetDirectoryName(mod.GetMeta().path))) return -4;
            var targetFile = Path.Combine(Path.GetDirectoryName(refFile), "keyGroups.json");
            return !File.Exists(targetFile) ? -5
                : File.ReadAllText(targetFile);
        }
        private static object LoadInstructions(string modId, string refFile)
        {
            if (!refFile.EndsWith($"{Path.DirectorySeparatorChar}i18n.csv")) return -1;
            if (!File.Exists(refFile)) return -2;
            var mod = AssetDatabase.global.GetAssets<ExecutableAsset>().Where(x => x.identifier == modId).FirstOrDefault();
            if (mod is null) return -3;
            if (!refFile.StartsWith(Path.GetDirectoryName(mod.GetMeta().path))) return -4;
            var targetFile = Path.Combine(Path.GetDirectoryName(refFile), "devInstructions.md");
            return !File.Exists(targetFile) ? -5
                : File.ReadAllText(targetFile);
        }
    }
}
