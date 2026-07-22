// Health advisory text per AQI band, based on India's National AQI
// categories (CPCB). Kept as static content so it works instantly
// without needing another model or API call.

export const ADVISORY = {
  Good: {
    en: {
      risk: "Minimal risk",
      message: "Air quality is satisfactory. Enjoy outdoor activities as usual.",
      precautions: [],
    },
    hi: {
      risk: "न्यूनतम जोखिम",
      message: "वायु गुणवत्ता संतोषजनक है। सामान्य रूप से बाहरी गतिविधियाँ करें।",
      precautions: [],
    },
  },
  Satisfactory: {
    en: {
      risk: "Minor discomfort possible",
      message: "Air quality is acceptable. Unusually sensitive people should consider limiting prolonged outdoor exertion.",
      precautions: ["Sensitive groups: reduce prolonged outdoor exertion"],
    },
    hi: {
      risk: "मामूली असुविधा संभव",
      message: "वायु गुणवत्ता स्वीकार्य है। अति संवेदनशील लोग लंबे समय तक बाहरी श्रम सीमित करें।",
      precautions: ["संवेदनशील समूह: लंबे समय तक बाहरी श्रम कम करें"],
    },
  },
  Moderate: {
    en: {
      risk: "Breathing discomfort to sensitive groups",
      message: "People with lung disease, asthma, children, and the elderly should limit prolonged outdoor exertion.",
      precautions: [
        "Children & elderly: limit prolonged outdoor exertion",
        "Asthma/lung conditions: keep reliever medication handy",
      ],
    },
    hi: {
      risk: "संवेदनशील समूहों को साँस लेने में असुविधा",
      message: "फेफड़ों की बीमारी, अस्थमा, बच्चों और बुज़ुर्गों को लंबे समय तक बाहरी श्रम सीमित करना चाहिए।",
      precautions: [
        "बच्चे और बुज़ुर्ग: लंबे समय तक बाहरी श्रम सीमित करें",
        "अस्थमा/फेफड़ों की स्थिति: दवा साथ रखें",
      ],
    },
  },
  Poor: {
    en: {
      risk: "Breathing discomfort to most people",
      message: "Avoid prolonged or heavy outdoor exertion. Sensitive groups should avoid outdoor activity entirely.",
      precautions: [
        "General public: avoid heavy outdoor exertion",
        "Sensitive groups: avoid outdoor activity",
        "Consider wearing an N95 mask outdoors",
      ],
    },
    hi: {
      risk: "अधिकांश लोगों को साँस लेने में असुविधा",
      message: "लंबे समय तक या भारी बाहरी श्रम से बचें। संवेदनशील समूह बाहरी गतिविधि पूरी तरह टालें।",
      precautions: [
        "सामान्य जन: भारी बाहरी श्रम से बचें",
        "संवेदनशील समूह: बाहरी गतिविधि से बचें",
        "बाहर N95 मास्क पहनने पर विचार करें",
      ],
    },
  },
  "Very Poor": {
    en: {
      risk: "Respiratory illness on prolonged exposure",
      message: "Avoid outdoor activity. Sensitive groups should stay indoors and keep windows closed.",
      precautions: [
        "Avoid all outdoor physical activity",
        "Keep windows closed, use air purifier if available",
        "Sensitive groups: consult a doctor if symptoms occur",
      ],
    },
    hi: {
      risk: "लंबे समय तक संपर्क में रहने पर श्वसन संबंधी बीमारी",
      message: "बाहरी गतिविधि से बचें। संवेदनशील समूह घर के अंदर रहें और खिड़कियाँ बंद रखें।",
      precautions: [
        "सभी बाहरी शारीरिक गतिविधि से बचें",
        "खिड़कियाँ बंद रखें, उपलब्ध हो तो एयर प्यूरीफायर का उपयोग करें",
        "संवेदनशील समूह: लक्षण होने पर डॉक्टर से सलाह लें",
      ],
    },
  },
  Severe: {
    en: {
      risk: "Serious risk to everyone",
      message: "Health emergency conditions. Everyone should avoid all outdoor exertion. Stay indoors.",
      precautions: [
        "Stay indoors, avoid all outdoor exertion",
        "Wear N95/N99 mask if you must go outside",
        "Seek medical attention if experiencing breathlessness or chest pain",
      ],
    },
    hi: {
      risk: "सभी के लिए गंभीर जोखिम",
      message: "स्वास्थ्य आपातकालीन स्थिति। सभी को बाहरी श्रम पूरी तरह टालना चाहिए। घर के अंदर रहें।",
      precautions: [
        "घर के अंदर रहें, सभी बाहरी श्रम से बचें",
        "बाहर जाना ज़रूरी हो तो N95/N99 मास्क पहनें",
        "साँस फूलने या सीने में दर्द होने पर तुरंत डॉक्टर से संपर्क करें",
      ],
    },
  },
};

export function getAdvisory(aqiLabel, lang = "en") {
  const entry = ADVISORY[aqiLabel];
  if (!entry) return null;
  return entry[lang] || entry.en;
}
