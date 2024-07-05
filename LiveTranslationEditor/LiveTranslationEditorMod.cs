using Colossal.IO.AssetDatabase;
using Game;
using Game.Modding;
using Game.SceneFlow;
using System;
using System.Collections.Generic;
using System.IO;

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
    }
}
