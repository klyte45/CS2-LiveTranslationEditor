//#define LOCALURL

using K45EUIS_Ext;
using System;

namespace z_WE_EUIS
{
    public class LTE_EUIS : IEUISModRegister
    {
        public string ModderIdentifier => "k45";
        public string ModAcronym => "lte";

        public const string HOST = "lte.k45";
        public Action<Action<string, object[]>> OnGetEventEmitter => (eventCaller) => { };
        public Action<Action<string, Delegate>> OnGetEventsBinder => (eventCaller) => { };
        public Action<Action<string, Delegate>> OnGetCallsBinder => (eventCaller) => { };
    }
    public class LTE_EUIS_Main : IEUISAppRegister
    {
        public string ModAppIdentifier => "main";

        public string DisplayName => "Live Translation Editor";

#if LOCALURL
        public string UrlJs => "http://localhost:8780/k45-lte-main.js";//
        public string UrlCss => "http://localhost:8780/k45-lte-main.css";//
        public string UrlIcon => $"coui://{LTE_EUIS.HOST}/UI/images/LTE.svg";
#else
        public string UrlJs => $"coui://{LTE_EUIS.HOST}/UI/k45-lte-main.js";
        public string UrlCss => $"coui://{LTE_EUIS.HOST}/UI/k45-lte-main.css";
        public string UrlIcon => $"coui://{LTE_EUIS.HOST}/UI/images/LTE.svg";
#endif

        public string ModderIdentifier => "k45";

        public string ModAcronym => "lte";
    }
}
