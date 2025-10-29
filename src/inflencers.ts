//src/data/influencers.ts
export interface Influencer {
  name: string;
  about: string;
  channelLink: string;
  country: string;
  profileImage: string;
  tags: string[];
  practitionerBookingUrl?: string; // For booking calls with this influencer
}

export const influencers: Influencer[] = [
  {
    name: "Lena Petrova",
    about: "Lena is a former finance professional with a background in business and international relations whose channel focuses on the intersection of finance, geopolitics, and economics. Shorts and longer form interviews and discussions, so excellent up to date snapshots as well as more in-depth commentary.",
    channelLink: "https://youtube.com/@lenapetrova?si=OCu4_BjiOnDKBkXb",
    country: "United States",
    profileImage: "/assets/youtube/lena.jpg",
    tags: ["Finance", "Geopolitics", "Geoeconomics"]
  },
  {
    name: "Neutrality Studies Pascal Lottaz",
    about: "Pascal is an Associate Professor, based in Japan. Neutrality Studies presents commentary that explores the issues of security and conflict through the lens of neutrality.",
    channelLink: "https://youtube.com/@neutralitystudies?si=aj053bBINjkE8C62",
    country: "Japan",
    profileImage: "/assets/youtube/pascal.jpg",
    tags: ["Neutrality", "International Relations", "IR", "Conflict", "Security"]
  },
  {
    name: "Danny Haiphong",
    about: "Danny is an independent journalist providing regular coverage and commentary on geopolitics from around the world.",
    channelLink: "https://youtube.com/@geopoliticshaiphong?si=zk3rr-zvOCG67m_N",
    country: "United States",
    profileImage: "/assets/youtube/danny.jpg",
    tags: ["Geopolitics", "Political Economy", "Global South", "Hegemony"]
  },
  {
    name: "Jerry's Take on China Jerry Grey",
    about: "Jerry is a long term China resident, and presents lots of interesting takes - his own and from guests - about what's going on in China and the world generally. His mild manner is soothing but don't let that lull you into a false sense of confidence.",
    channelLink: "https://youtube.com/@jerrystakeonchina799?si=9ehEqaEHOMLJYM-H",
    country: "China",
    profileImage: "/assets/youtube/jerry.jpg",
    tags: ["China", "Geopolitics"]
  },
  {
    name: "Cyrus Janssen",
    about: "Cyrus is a champion of greater collaboration between the United States and China. He's a sporting professional who's spent almost two decades living in China and Asia.",
    channelLink: "https://youtube.com/@cyrusjanssen?si=qJwx7b7s63q61ULl",
    country: "United States",
    profileImage: "/assets/youtube/cyrus.jpg",
    tags: ["Geopolitics", "Finance", "China", "United States", "Economics"]
  },
  {
    name: "The New Atlas Brian Berletic",
    about: "Brian is an ex US Marine. He's now based in Asia, focusing his work on exposing the ongoing efforts of the US to influence the politics of countries and pursue regime change. Brian covers the military dimensions of the Ukraine conflict in detail, and uses western news sources to expose western myths.",
    channelLink: "https://youtube.com/@thenewatlas?si=Y3cnL00UMU4448KF",
    country: "SE Asia",
    profileImage: "/assets/youtube/brian.jpg",
    tags: ["Geopolitics", "War", "Regime Change", "United States"]
  },
  {
    name: "Arnaud Bertrand",
    about: "Arnaud is a highly regarded commentator on global affairs. He's an entrepreneur from France, and has lived in China. He's now based in SE Asia. His is well known for his Twitter-X threads, though with the newer expanded X post ability, we don't get threads anymore, just solid commentary and analysis.",
    channelLink: "https://x.com/RnaudBertrand",
    country: "SE Asia",
    profileImage: "/assets/youtube/arnaud.jpg",
    tags: ["Geopolitics"]
  },
  {
    name: "Geopolitical Trends David Oualaalou",
    about: "David is a Washington security analyst veteran and author. He brings a swagger to the discussion of global issues. As he is want to say, geopolitics affects our lives in more ways than we can imagine.",
    channelLink: "https://youtube.com/@geopoliticaltrends?si=Oo2RtjJSMSkZ8wge",
    country: "United States",
    profileImage: "/assets/youtube/david.jpg",
    tags: ["Geopolitics"]
  },
  {
    name: "The Burning Archive Jeff Rich",
    about: "Jeff is a former public servant (don't hold that against him, I don't), in Australia. In his semi-retirement, he runs a history-oriented channel that aims to illuminate and educate. I particularly love Jeff's slow readings of texts, they really give you time to absorb them and think about them.",
    channelLink: "https://youtube.com/@theburningarchive?si=2H93e9lOVBqARxtU",
    country: "Australia",
    profileImage: "/assets/youtube/jeff.jpg",
    tags: ["Geopolitics", "History", "Australia"]
  },
  {
    name: "Geopolitical Demystified SL Kanthan",
    about: "SL is a geopolitics 'machine'. He produces a bunch of independent content, which takes a no-nonsense approach to what's shaping the world today.",
    channelLink: "https://www.youtube.com/@GeopoliticsDemystified",
    country: "India",
    profileImage: "/assets/youtube/sl.jpg",
    tags: ["Geopolitics"]
  },
  {
    name: "The Duran",
    about: "The team at The Duran have for a long time set something of a standard. Daily programs and detailed updates, particularly on events impacting Europe, the US and West Asia are a specialty. Special guest programming has become a real feature of this Dynamic Duo (Alexander Mercouris and Alex Christoforou).",
    channelLink: "https://www.youtube.com/@TheDuran",
    country: "Cyprus",
    profileImage: "/assets/youtube/duran.jpg",
    tags: ["Geopolitics", "Politics"]
  },
  {
    name: "i5TV Warwick Powell",
    about: "Yours truly. My own little channel is here to bring you some interviews with scholars that I find interesting.",
    channelLink: "https://www.youtube.com/@i5TVLearn",
    country: "Australia",
    profileImage: "/assets/youtube/warwick.jpg",
    tags: ["Political Economy", "Technology", "Finance", "Economics", "Geopolitics"]
  },
  {
    name: "Glenn Diesen",
    about: "Glenn is Norway's most famous professor. He also spent quite a few years in Australia. Glenn is a prolific publisher and commentator on Russian politics, the emergence of Eurasia, the possibilities of multipolarity with a revitalized Westphalia and much more.",
    channelLink: "https://www.youtube.com/@GDiesen1",
    country: "Norway",
    profileImage: "/assets/youtube/glenn.jpg",
    tags: ["Eurasia", "International Relations", "IR", "Conflict", "Security", "Russia"]
  },
  {
    name: "Silk and Steel Carl Zha",
    about: "Carl is a rocket, whose energy and vitality shines through in all of his programming. He tackles serious issues with enthusiasm that leaves you with little doubt as to what he really thinks about stuff.",
    channelLink: "https://www.youtube.com/@CarlZha",
    country: "SE Asia",
    profileImage: "/assets/youtube/carl.jpg",
    tags: ["Geopolitics", "Political Economy", "Global South", "Hegemony"]
  },
  {
    name: "Li Jingjing",
    about: "Jingjing is Beijing-based but seems to pop up all over the world. Her energy cuts through no matter how heavy the topic. A real specialty is reporting from across western China.",
    channelLink: "https://www.youtube.com/@Jingjing_Li",
    country: "China",
    profileImage: "/assets/youtube/jingjing.jpg",
    tags: ["China", "Geopolitics"]
  },
  {
    name: "Geopolitical Economy Report Ben Norton",
    about: "Ben delivers multiple programs each week, which are all deep dives into critical issues of the day. He has a strong geopolitical economy focus, rather than 'straight' international relations, which adds a dimension and depth to his take on things.",
    channelLink: "https://www.youtube.com/@GeopoliticalEconomyReport",
    country: "Asia",
    profileImage: "/assets/youtube/ben.jpg",
    tags: ["Geopolitics", "Political Economy", "Global South", "Hegemony"]
  },
  {
    name: "Alexander Mercouris",
    about: "Alexander is often called the Oracle from London, and is best known for daily, detailed reviews of key developments in global affairs, international relations and diplomacy. He also hosts at the Duran interview shows where guests cover diverse topics, focusing on the geopolitical issues of the day.",
    channelLink: "https://www.youtube.com/@AlexMercouris",
    country: "London",
    profileImage: "/assets/youtube/alexander.jpg",
    tags: ["Geopolitics", "Politics"]
  },
  {
    name: "Alex Christoforou",
    about: "Alex is the founder of The Duran, and does a daily 'walk and talk' show where he 'talks about some news'. At the same time, he shows off the places he's visiting. His Clown World segments are worth their weight in gold, as they bring home the sheer madness of much of what today's political elite are up to.",
    channelLink: "https://www.youtube.com/@AlexChristoforou",
    country: "Cyprus",
    profileImage: "/assets/youtube/alex.jpg",
    tags: ["Geopolitics", "Politics"]
  },
  {
    name: "Reports on China Andy Borham",
    about: "Andy works a day job at Shanghai Daily as a journalist, and also produces his own independent content via his Reports on China program. Reports on China is a 'to the point' take on how western media covers China, and also features guests discussing topical issues. The principal focus is on debunking China myths.",
    channelLink: "https://www.youtube.com/@ReportsOnChina",
    country: "China",
    profileImage: "/assets/youtube/andy.jpg",
    tags: ["Geopolitics", "Politics", "China", "Media"]
  },
  {
    name: "Belt and Road Institute of Sweden Hussein Askary",
    about: "Hussein is the VP of the Belt and Road Institute Sweden, and is a leading authority on the design and rollout of BRI infrastructure initiatives globally.",
    channelLink: "https://www.youtube.com/@brixsweden6615",
    country: "Sweden",
    profileImage: "/assets/youtube/hussein.jpg",
    tags: ["Belt and Road Initiative", "West Asia", "Infrastructure", "Economics", "Development"]
  },
  {
    name: "Thomas Fazi",
    about: "Thomas is an independent journalist and author, based in Italy. He is a columnist and his work can be found at tfazi.substack.com",
    channelLink: "https://twitter.com/battleforeurope",
    country: "Italy",
    profileImage: "/assets/youtube/thomas.jpg",
    tags: ["Geopolitics", "Politics", "Political Economy", "Europe"]
  },
  {
    name: "Nuri Vittachi",
    about: "Nuri is an independent journalist in Hong Kong. He has decades of experience covering developments in Hong Kong and through that lens, addresses issues impacting Asia at large. He has debunked the Hong Kong riots and has shown them to have been externally instigated, funded and fueled regime change efforts.",
    channelLink: "https://www.youtube.com/@NuryVittachi",
    country: "Hong Kong",
    profileImage: "/assets/youtube/nuri.jpg",
    tags: ["Hong Kong", "Geopolitics", "Asia", "China"]
  },
  {
    name: "John Pang",
    about: "",
    channelLink: "https://x.com/jynpang?s=11&t=othvCEsuDP6aEQAa2xLQTg",
    country: "Hong Kong",
    profileImage: "/assets/youtube/pang.jpg",
    tags: ["Hong Kong", "Geopolitics", "Asia", "China"]
  },
  {
    name: "Dialogue Works",
    about: "",
    channelLink: "https://www.youtube.com/@dialogueworks01",
    country: "Brazil",
    profileImage: "/assets/youtube/dialogue.jpg",
    tags: ["Hong Kong", "Geopolitics", "Asia", "China"]
  },
  {
    name: "Einar Tangen",
    about: "Einar Tangen, a US citizen based in Beijing, founded and Chairs Asia Narratives.",
    channelLink: "https://www.linkedin.com/in/ehtangen",
    country: "US",
    profileImage: "/assets/youtube/einar.jpg",
    tags: ["Beijing", "Geopolitics", "Asia", "China"]
  },
  {
    name: "Dr Yasir Masood",
    about: "Dr. Yasir Masood (PhD) is a Pakistani Political and Security Analyst based in Beijing. He is also an Academic, Multimedia Journalist and Communication expert. His policy analysis is broadcasted on national and International media outlets and his pieces have been widely published in International English Dailies.",
    channelLink: "https://www.youtube.com/@yasirmasoodforu",
    country: "Pakistan",
    profileImage: "/assets/youtube/yasir.jpg",
    tags: ["Beijing", "Geopolitics", "Asia", "China"]
  },
  {
    name: "Anna Rosario Malindog-Uy",
    about: "Anna is the Vice President for External Affairs at the Asian Century Philippines Strategic Studies Institute. She's also a writer at The Manila Times.",
    channelLink: "https://www.youtube.com/@AnnaMalindogUy",
    country: "Philippines",
    profileImage: "/assets/youtube/anna.jpg",
    tags: ["Geopolitics", "Asia", "ASEAN", "Economics"]
  },
  {
    name: "Kathleen Tyson",
    about: "Kathleen is a former central banker and author of Multicurrency Mercantlism: The New International Monetary Order. She is an active campaigner for social justice.",
    channelLink: "https://x.com/Kathleen_Tyson_/",
    country: "UK",
    profileImage: "/assets/youtube/kathleen.jpg",
    tags: ["Mercantalism", "Finance", "Global Finance", "Dedollarisation"]
  },
  {
    name: "Warwick Powell",
    about: "Warwick is a geopolitical analyst, academic, and founding contributor to Multipolar Peace. He brings extensive expertise in international relations, technology policy, and political economy to discussions about building a more peaceful multipolar world.",
    channelLink: "https://www.youtube.com/@i5TVLearn",
    country: "Australia", 
    profileImage: "/assets/youtube/warwick.jpg",
    tags: ["Political Economy", "Technology", "Finance", "Economics", "Geopolitics", "Multipolarity"],
    practitionerBookingUrl: "/sessions/practitioner-calendar/684530057bb2388bfb7e2425" // TODO: Replace with actual practitioner ID
  }
]
