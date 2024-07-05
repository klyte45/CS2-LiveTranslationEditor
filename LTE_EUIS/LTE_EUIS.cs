//#define LOCALURL

using K45EUIS_Ext;
using LiveTranslationEditor;
using System;

namespace z_WE_EUIS
{
    public class WE_EUIS : IEUISModRegister
    {
        public string ModderIdentifier => "k45";
        public string ModAcronym => "lte";
        public Action<Action<string, object[]>> OnGetEventEmitter => (eventCaller) => LiveTranslationEditorMod.Instance.SetupCaller(eventCaller);
        public Action<Action<string, Delegate>> OnGetEventsBinder => (eventCaller) => LiveTranslationEditorMod.Instance.SetupEventBinder(eventCaller);
        public Action<Action<string, Delegate>> OnGetCallsBinder => (eventCaller) => LiveTranslationEditorMod.Instance.SetupCallBinder(eventCaller);
    }
    public class WE_EUIS_Main : IEUISAppRegister
    {
        public string ModAppIdentifier => "main";

        public string DisplayName => "Write Everywhere - Main";

#if LOCALURL
        public string UrlJs => "http://localhost:8775/k45-we-main.js";//
        public string UrlCss => "http://localhost:8775/k45-we-main.css";//
        public string UrlIcon => $"coui://{LiveTranslationEditorMod.Instance.CouiHost}/UI/images/WE.svg";
#else
        public string UrlJs => $"coui://{LiveTranslationEditorMod.Instance.CouiHost}/UI/k45-we-main.js";
        public string UrlCss => $"coui://{LiveTranslationEditorMod.Instance.CouiHost}/UI/k45-we-main.css";
        public string UrlIcon => $"coui://{LiveTranslationEditorMod.Instance.CouiHost}/UI/images/WE.svg";
#endif

        public string ModderIdentifier => "k45";

        public string ModAcronym => "we";
    }
}
