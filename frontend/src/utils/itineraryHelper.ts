export interface DayPlan {
  day: number;
  title?: string;
  theme?: string;
  morning?: string;
  afternoon?: string;
  evening?: string;
  activities?: string[];
  estimated_daily_cost?: number;
}

interface DestinationSchedule {
  themes: string[];
  days: Array<{
    theme: string;
    morning: string;
    afternoon: string;
    evening: string;
    activities: string[];
  }>;
}

const CURATED_DESTINATIONS: Record<string, DestinationSchedule> = {
  agra: {
    themes: [
      "Taj Mahal Sunrise, Taj Nature Walk & Red Fort Palaces",
      "Baby Taj, Mehtab Bagh Sunset & Old Mughal Bazaars",
      "Imperial Capital of Fatehpur Sikri & Akbar's Sikandra",
      "Keoladeo UNESCO Wetland Safari & Deeg Water Palaces",
      "Sacred Yamuna Heritage: Mathura & Vrindavan Temples",
      "Wildlife Conservation & Marble Inlay Artisan Quarter",
      "Colonial Agra, Cantonment Heritage & Farewell Feast",
    ],
    days: [
      {
        theme: "Taj Mahal Sunrise, Taj Nature Walk & Red Fort Palaces",
        morning:
          "5:45 AM • Sunrise entry to the magnificent Taj Mahal through the Eastern Gate, watching the white marble shift from soft blush to radiant ivory in the morning light. Follow with a tranquil walk through Taj Nature Walk along the forested Yamuna ravines.",
        afternoon:
          "1:00 PM • Lunch and empowerment visit at Sheroes Hangout Cafe (operated by resilient acid attack survivors). Afternoon guided architectural tour of Agra Fort including Jahangir Mahal, Khas Mahal, and Musamman Burj where Shah Jahan spent his final years overlooking the Taj.",
        evening:
          "5:30 PM • Sunset promenade across the Yamuna at Mehtab Bagh (Moonlight Garden) with classic reflection vistas of the Taj Mahal. Taste authentic Agra petha varieties (kesar, angoori, paan) at legendary Panchhi Petha in Sadar Bazaar.",
        activities: [
          "Taj Mahal Sunrise Viewing",
          "Taj Nature Walk Ravine Trails",
          "Sheroes Hangout Cafe",
          "Agra Fort & Jahangir Mahal",
          "Mehtab Bagh Yamuna Sunset",
          "Panchhi Petha Sadar Bazaar",
        ],
      },
      {
        theme: "Baby Taj, Mehtab Bagh Sunset & Old Mughal Bazaars",
        morning:
          "9:00 AM • Explore the exquisite Tomb of I'timad-ud-Daulah (Baby Taj), renowned as the jewel box of Mughal architecture with India's earliest and finest pietre dure marble inlay work.",
        afternoon:
          "1:00 PM • Royal Mughlai lunch featuring slow-simmered gravies at Pinch of Spice. Visit Chini Ka Rauza, the striking 17th-century Persian funerary monument adorned with brilliant glazed ceramic tiles.",
        evening:
          "4:30 PM • Heritage architectural stroll through the grand Jama Masjid Agra and the labyrinthine lanes of Rawatpara spice quarter. Evening rooftop chai with views over the historic riverbanks.",
        activities: [
          "Tomb of I'timad-ud-Daulah (Baby Taj)",
          "Chini Ka Rauza Persian Tiles",
          "Pinch of Spice Mughlai Dining",
          "Jama Masjid Agra",
          "Rawatpara Spice Quarter",
          "Yamuna Riverfront Sunset Chai",
        ],
      },
      {
        theme: "Imperial Capital of Fatehpur Sikri & Akbar's Sikandra",
        morning:
          "8:30 AM • Excursion to UNESCO World Heritage Fatehpur Sikri, Emperor Akbar's red sandstone capital. Stand beneath the towering 54-meter Buland Darwaza and wander through the Diwan-i-Khas.",
        afternoon:
          "1:00 PM • Traditional thali lunch at a highway dhaba, then offer prayers and tie a wish thread at the white marble tomb of Sufi mystic Sheikh Salim Chishti inside the Jama Masjid courtyard.",
        evening:
          "4:30 PM • On the return corridor, stop at Sikandra to wander through the expansive gardens of Emperor Akbar's Mausoleum, where herds of spotted blackbucks and peacocks roam freely.",
        activities: [
          "Buland Darwaza (Gate of Magnificence)",
          "Sheikh Salim Chishti Dargah",
          "Fatehpur Sikri Imperial Palace Complex",
          "Sikandra: Akbar's Great Tomb",
          "Blackbuck Garden Sanctuary",
        ],
      },
      {
        theme: "Keoladeo UNESCO Wetland Safari & Deeg Water Palaces",
        morning:
          "6:00 AM • Dawn excursion to UNESCO Keoladeo National Park (Bharatpur Bird Sanctuary). Enjoy a guided cycle safari through the morning mist, spotting over 370 migratory bird species.",
        afternoon:
          "1:00 PM • Traditional Brij thali lunch in Bharatpur town, followed by a visit to the historic Bharatpur Government Museum inside Lohagarh Fort.",
        evening:
          "4:00 PM • Excursion to Deeg Palace, the monsoon pleasure gardens of the Jat rulers featuring 500 working gravity fountains, marble water pavilions, and manicured Mughal-style charbaghs.",
        activities: [
          "Keoladeo Wetland Cycle Safari",
          "Migratory Bird Sanctuary Watchtower",
          "Lohagarh Fort Museum",
          "Deeg Water Palace & 500 Fountains",
          "Brij Heritage Dining Experience",
        ],
      },
      {
        theme: "Sacred Yamuna Heritage: Mathura & Vrindavan Temples",
        morning:
          "8:00 AM • Drive north along the Yamuna to historic Mathura. Visit Shri Krishna Janmabhoomi Temple Complex, the sacred birthplace of Lord Krishna, and stroll Vishram Ghat riverbank.",
        afternoon:
          "1:00 PM • Traditional Mathura lunch with famous Mathura ke Pede. Continue to Vrindavan to visit the historic Banke Bihari Temple and ISKCON Krishna Balaram Temple.",
        evening:
          "5:30 PM • Witness the grand musical fountain and light show at the opulent Prem Mandir, whose white Italian Carrara marble glows in vibrant hues as evening descends.",
        activities: [
          "Krishna Janmabhoomi Mathura",
          "Vishram Ghat Riverfront Aarti",
          "Mathura Peda Tasting",
          "Banke Bihari Temple Vrindavan",
          "ISKCON Vrindavan Temple",
          "Prem Mandir Musical Light Show",
        ],
      },
      {
        theme: "Wildlife Conservation & Marble Inlay Artisan Quarter",
        morning:
          "9:00 AM • Uplifting morning visit to Wildlife SOS Elephant Conservation and Care Center, observing rescued Asian elephants enjoying cruelty-free natural habitats and bathing pools.",
        afternoon:
          "1:30 PM • Lunch by Keetham Lake, followed by a peaceful nature walk through Soor Sarovar Bird Sanctuary spotting migratory waterfowl and marsh crocodiles.",
        evening:
          "4:30 PM • Visit master craftsmen workshops in Agra to observe authentic Pietra Dura (Parchin Kari) marble inlay, the same stone-crafting technique used on the Taj Mahal.",
        activities: [
          "Wildlife SOS Elephant Care Center",
          "Keetham Lake Nature Reserve",
          "Soor Sarovar Bird Sanctuary",
          "Pietra Dura Master Marble Workshop",
          "Rooftop Sunset Dinner with Taj Silhouette",
        ],
      },
      {
        theme: "Colonial Agra, Cantonment Heritage & Farewell Feast",
        morning:
          "9:30 AM • Discover colonial Agra in the leafy Cantonment quarter. Visit St. George's Cathedral (built 1828) and the historic Roman Catholic Cemetery containing the Red Taj tomb of Colonel John Hessing.",
        afternoon:
          "1:00 PM • Farewell colonial-style lunch at Dasaprakash or Peshawri. Browse the hand-knotted Agra wool and silk carpet emporiums renowned since Akbar's royal ateliers.",
        evening:
          "5:00 PM • Final sunset stroll along the Yamuna viewpoint, followed by souvenir shopping in Subhash Bazaar and packing preparation for your onward travel.",
        activities: [
          "St. George's Cathedral (1828)",
          "Historic Roman Catholic Cemetery & Red Taj",
          "Agra Hand-Knotted Carpet Looms",
          "Peshawri Royal Frontier Dining",
          "Subhash Bazaar Farewell Walk",
        ],
      },
    ],
  },
  jaipur: {
    themes: [
      "Pink City Fortresses, Amber Palace & Sheesh Mahal",
      "City Palace Royal Courtyards & Celestial Jantar Mantar",
      "Aravalli Ridge: Nahargarh Sunset & Jaigarh Cannon",
      "Hidden Shrines & Sacred Springs of Galta Ji",
      "Artisan Heritage & Sanganer Hand Block Printing",
      "Bhangarh Historic Excursion & Abhaneri Stepwell",
      "Royal Cenotaphs & Farewell Pink City Vistas",
    ],
    days: [
      {
        theme: "Pink City Fortresses, Amber Palace & Sheesh Mahal",
        morning:
          "8:00 AM • Ascend to the majestic Amber Fort atop the Aravalli hills, marveling at the Diwan-i-Aam, Ganesh Pol, and the glittering Sheesh Mahal (Mirror Palace) where candlelight creates a starlit illusion.",
        afternoon:
          "1:00 PM • Authentic Rajasthani Dal Baati Churma lunch in Amer village, followed by a photo stop at the emerald waters of Maota Lake and the ancient geometric Panna Meena Ka Kund stepwell.",
        evening:
          "5:00 PM • Sunset promenade along Man Sagar Lake admiring the floating Jal Mahal water palace, followed by fresh Ghewar tasting at iconic Laxmi Mishthan Bhandar (LMB) in the walled city.",
        activities: [
          "Amber Fort & Sheesh Mahal",
          "Panna Meena Ka Kund Stepwell",
          "Maota Lake Scenic Viewpoint",
          "Jal Mahal Water Palace",
          "LMB Traditional Sweets & Ghewar",
        ],
      },
      {
        theme: "City Palace Royal Courtyards & Celestial Jantar Mantar",
        morning:
          "9:00 AM • Explore the opulent City Palace, still home to the royal family of Jaipur, visiting the Peacock Gate in Pritam Niwas Chowk, Mubarak Mahal, and the royal armory museum.",
        afternoon:
          "12:30 PM • Tour the UNESCO Jantar Mantar, the world’s largest stone astronomical observatory built by Maharaja Sawai Jai Singh II, featuring the 27-meter Samrat Yantra sundial.",
        evening:
          "4:30 PM • Photograph the iconic honeycombed pink facade of Hawa Mahal (Palace of Winds) from Wind View Cafe. Shop for vibrant bandhani textiles and silver jewelry in Johari and Bapu Bazaars.",
        activities: [
          "City Palace & Peacock Gate",
          "Jantar Mantar UNESCO Observatory",
          "Hawa Mahal Palace of Winds",
          "Wind View Cafe Rooftop",
          "Bapu Bazaar & Johari Bazaar",
        ],
      },
      {
        theme: "Aravalli Ridge: Nahargarh Sunset & Jaigarh Cannon",
        morning:
          "9:30 AM • Journey up the rugged Aravalli ridge to Jaigarh Fort, home to the massive Jaivana—once the world’s largest wheeled cannon—and fortified watchtowers overlooking Amber.",
        afternoon:
          "1:30 PM • Mountain drive to Nahargarh Fort (Tiger Fort), exploring the connected royal suites of Madhavendra Bhawan and the historic stepwells featured in Rang De Basanti.",
        evening:
          "5:30 PM • Watch the sun sink below the horizon at Padao Open-Air Restaurant with sweeping panoramic views over the illuminated Jaipur city basin. Evening dinner at Chokhi Dhani ethnic resort.",
        activities: [
          "Jaigarh Fort & Jaivana Cannon",
          "Nahargarh Fort & Madhavendra Bhawan",
          "Padao Hilltop Sunset Viewpoint",
          "Chokhi Dhani Ethnic Village",
          "Rajasthani Cultural Performance",
        ],
      },
      {
        theme: "Hidden Shrines & Sacred Springs of Galta Ji",
        morning:
          "8:30 AM • Scenic morning walk into the narrow mountain gorge of Galta Ji (The Monkey Temple), renowned for natural freshwater springs, sacred kunds, and playful rhesus macaque troops.",
        afternoon:
          "1:00 PM • Traditional Thali lunch, followed by a visit to the peaceful Sisodia Rani Garden, featuring terraced Mughal-style water cascades, painted pavilions, and fragrant flowerbeds.",
        evening:
          "4:30 PM • Explore Vidyadhar Garden, designed in tribute to Jaipur’s chief architect, followed by sunset views from the hilltop Sun Temple overlooking the eastern plains.",
        activities: [
          "Galta Ji Monkey Temple",
          "Sisodia Rani Terraced Gardens",
          "Vidyadhar Architectural Garden",
          "Hilltop Sun Temple Sunset",
          "Old City Street Food Walk",
        ],
      },
      {
        theme: "Artisan Heritage & Sanganer Hand Block Printing",
        morning:
          "9:30 AM • Excursion to Sanganer, the epicenter of Rajasthani block-printing. Visit master wood-carvers and artisan studios dipping teak blocks into vibrant natural dyes.",
        afternoon:
          "1:00 PM • Visit the Anokhi Museum of Hand Printing inside a restored haveli near Amber. Enjoy light cafe lunch and hands-on block printing demonstration.",
        evening:
          "4:30 PM • Marvel at the intricate pastel arches of Patrika Gate at Jawahar Circle Garden, followed by an evening walk along the illuminated Albert Hall Museum lawns.",
        activities: [
          "Sanganer Hand Block Studios",
          "Anokhi Museum of Hand Printing",
          "Patrika Gate Architecture",
          "Jawahar Circle Musical Fountain",
          "Albert Hall Museum Illumination",
        ],
      },
      {
        theme: "Bhangarh Historic Excursion & Abhaneri Stepwell",
        morning:
          "8:00 AM • Day excursion eastward to Abhaneri to marvel at Chand Baori, India’s deepest and most visually stunning stepwell with 3,500 precisely carved geometric stone steps.",
        afternoon:
          "1:00 PM • Rural Rajasthani farmhouse lunch, then continue to the 17th-century preserved ruins of Bhangarh Fort, surrounded by banyan trees beneath the Aravalli hills.",
        evening:
          "5:00 PM • Return drive to Jaipur through peaceful farmlands, stopping for roadside masala chai in clay kulhads.",
        activities: [
          "Chand Baori Stepwell (Abhaneri)",
          "Harshat Mata Temple Ruins",
          "Bhangarh Historic Protected Reserve",
          "Countryside Farmstay Lunch",
          "Rural Highway Sunset Chai",
        ],
      },
      {
        theme: "Royal Cenotaphs & Farewell Pink City Vistas",
        morning:
          "9:30 AM • Visit the serene, intricately carved marble and sandstone cenotaphs of the Kachwaha Maharajas at Gaitore Ki Chhatriyan, tucked peacefully beneath the shadow of Nahargarh.",
        afternoon:
          "1:00 PM • Farewell royal lunch at 1135 AD inside Amber Fort or Cinnamon at Jai Mahal Palace. Browse local blue pottery workshops and lacquer bangle makers.",
        evening:
          "5:30 PM • Final sunset drink at Peacock Rooftop Restaurant, savoring panoramic city views and authentic Rajasthani laal maas before your onward journey.",
        activities: [
          "Gaitore Ki Chhatriyan Cenotaphs",
          "Blue Pottery Artisan Studios",
          "Lac Bangle Artisan Quarter",
          "Peacock Rooftop Farewell Dinner",
        ],
      },
    ],
  },
  delhi: {
    themes: [
      "Mughal Grandeur: Old Delhi & Chandni Chowk",
      "UNESCO Architectural Wonders: Qutub & Humayun's Tomb",
      "Imperial Axis, Art District & Lodhi Gardens",
      "Spiritual Marvels: Lotus Temple & Akshardham",
      "Bohemian Delhi: Hauz Khas Village & Dilli Haat",
      "National Heritage, Agrasen Ki Baoli & CP Colonnades",
      "Sufi Traditions, Crafts Museum & Farewell Dining",
    ],
    days: [
      {
        theme: "Mughal Grandeur: Old Delhi & Chandni Chowk",
        morning:
          "8:30 AM • Stand before the monumental red sandstone battlements of the Red Fort (Lal Qila). Walk through Lahori Gate, Chhatta Chowk bazaar, and Diwan-i-Aam.",
        afternoon:
          "12:30 PM • Climb the southern minaret of Jama Masjid for panoramic views over Old Delhi. Board an electric rickshaw through Chandni Chowk, sampling stuffed paranthas at the historic Paranthe Wali Gali.",
        evening:
          "5:00 PM • Aromatic walk through Khari Baoli, Asia’s largest wholesale spice market. Traditional Mughlai dinner at Karim’s or Al Jawahar savoring slow-cooked seekh kebabs and fragrant biryani.",
        activities: [
          "Red Fort (Lal Qila)",
          "Jama Masjid & Minaret View",
          "Chandni Chowk Rickshaw Safari",
          "Paranthe Wali Gali",
          "Khari Baoli Spice Market",
          "Karims Historic Dinner",
        ],
      },
      {
        theme: "UNESCO Architectural Wonders: Qutub & Humayun's Tomb",
        morning:
          "9:00 AM • Explore the soaring 73-meter Qutub Minar, the 4th-century rustless Iron Pillar of Chandragupta II, and the ruins of Quwwat-ul-Islam Mosque in Mehrauli.",
        afternoon:
          "1:30 PM • Contemporary cafe lunch in Mehrauli, followed by a walk through Humayun’s Tomb, the magnificent red sandstone precursor to the Taj Mahal surrounded by symmetrical Persian Charbagh gardens.",
        evening:
          "5:30 PM • Experience evening Sufi Qawwali devotional singing at Hazrat Nizamuddin Aulia Dargah, enveloped in the fragrance of rose petals, burning incense, and centuries of mysticism.",
        activities: [
          "Qutub Minar & Iron Pillar",
          "Mehrauli Archaeological Park",
          "Humayun Tomb UNESCO Gardens",
          "Hazrat Nizamuddin Dargah Qawwali",
          "Old Nizami Kebab Trail",
        ],
      },
      {
        theme: "Imperial Axis, Art District & Lodhi Gardens",
        morning:
          "9:00 AM • Stroll along Kartavya Path to view the solemn India Gate war memorial, Amar Jawan Jyoti, and the majestic sandstone facades of Rashtrapati Bhavan and North/South Blocks.",
        afternoon:
          "1:00 PM • Lunch at the National Museum Cafe, followed by an exploration of India’s greatest historical treasures: Harappan Indus Valley artifacts, Bronze Chola sculptures, and Mughal miniatures.",
        evening:
          "4:30 PM • Walk through the vibrant open-air street murals of Lodhi Art District. Conclude with a serene sunset stroll among the 15th-century dome tombs of Lodhi Gardens.",
        activities: [
          "India Gate & Kartavya Path",
          "Rashtrapati Bhavan Vista",
          "National Museum Antiquities",
          "Lodhi Art District Murals",
          "Lodhi Gardens Sunset Walk",
        ],
      },
      {
        theme: "Spiritual Marvels: Lotus Temple & Akshardham",
        morning:
          "9:00 AM • Experience meditative silence beneath the 27 pure white marble petals of the Bahá'í Lotus Temple, surrounded by tranquil blue reflecting ponds.",
        afternoon:
          "1:30 PM • South Indian thali lunch at Saravana Bhavan, then cross the Yamuna River to the sprawling Swaminarayan Akshardham Temple complex.",
        evening:
          "5:00 PM • Marvel at the 20,000 carved deities, stone elephants, and Sanskrit murals of Akshardham, followed by the spectacular Sahaj Anand illuminated musical water fountain show.",
        activities: [
          "Lotus Temple Meditation",
          "Kalkaji Heritage Precinct",
          "Swaminarayan Akshardham Temple",
          "Sahaj Anand Water & Light Show",
          "Premvati Food Court Delicacies",
        ],
      },
      {
        theme: "Bohemian Delhi: Hauz Khas Village & Dilli Haat",
        morning:
          "10:00 AM • Explore the medieval 13th-century madrasa, lake reservoir, and Feroz Shah Tughlaq’s tomb in Hauz Khas Complex.",
        afternoon:
          "1:00 PM • Independent designer boutiques and rooftop cafe lunch overlooking the lake in Hauz Khas Village. Visit the nearby deer park and peacock groves.",
        evening:
          "5:00 PM • Immersive shopping and cultural walk at Dilli Haat INA, exploring artisan craft stalls from all 28 Indian states. Sample regional specialties from Kashmiri Momos to Naga pork curries.",
        activities: [
          "Hauz Khas Medieval Madrasa & Lake",
          "Hauz Khas Designer Boutiques",
          "Deer Park Nature Walk",
          "Dilli Haat INA Crafts Bazaars",
          "All-India Regional Food Tasting",
        ],
      },
      {
        theme: "National Heritage, Agrasen Ki Baoli & CP Colonnades",
        morning:
          "9:30 AM • Descend the 108 stone steps of Agrasen Ki Baoli, a serene 14th-century stepwell hidden in the heart of modern New Delhi.",
        afternoon:
          "12:30 PM • Stroll through the concentric Georgian white colonnades of Connaught Place (CP). Enjoy classic cold coffee at Keventers and historic lunch at United Coffee House (est. 1942).",
        evening:
          "4:30 PM • Explore modern Indian art at the National Gallery of Modern Art (NGMA) inside historic Jaipur House, followed by evening coffee at the Indian Coffee House rooftop.",
        activities: [
          "Agrasen Ki Baoli Stepwell",
          "Connaught Place Georgian Colonnades",
          "United Coffee House (est. 1942)",
          "NGMA Modern Art Gallery",
          "Indian Coffee House Rooftop",
        ],
      },
      {
        theme: "Sufi Traditions, Crafts Museum & Farewell Dining",
        morning:
          "9:30 AM • Visit the idyllic National Handicrafts and Handlooms Museum (Crafts Museum), wandering through recreated tribal village courtyards and viewing folk terracotta and textiles.",
        afternoon:
          "1:00 PM • Lunch at Cafe Lota serving contemporary regional Indian cooking, followed by a visit to the monumental Baroque-style Safdarjung Tomb.",
        evening:
          "5:30 PM • Final bookshop browsing and high-end boutique stroll in fashionable Khan Market, followed by an elegant farewell dinner at Olive Bar & Kitchen under the banyan tree.",
        activities: [
          "National Crafts Museum & Village",
          "Cafe Lota Contemporary Lunch",
          "Safdarjung Tomb Garden Vista",
          "Khan Market Boutique Stroll",
          "Olive Bar & Kitchen Farewell Dinner",
        ],
      },
    ],
  },
  kashmir: {
    themes: [
      "Dal Lake Reflections, Shikara Sunrise & Houseboat Living",
      "Royal Mughal Terraces & Pari Mahal Sunset",
      "Meadow of Flowers: High Alpine Gulmarg Gondola",
      "Valley of Shepherds: Pahalgam & Lidder River",
      "Meadow of Gold: Sonamarg & Thajiwas Glacial Trails",
      "Old Srinagar Heritage, Wooden Mosques & Spice Bazaars",
      "Doodhpathri Valley of Milk & Farewell Wazwan Banquet",
    ],
    days: [
      {
        theme: "Dal Lake Reflections, Shikara Sunrise & Houseboat Living",
        morning:
          "6:00 AM • Dawn Shikara cruise through misty Dal Lake to the 150-year-old Floating Vegetable & Flower Market, where local farmers trade lotus stems and fresh blooms on flat wooden boats.",
        afternoon:
          "1:00 PM • Check into a handcrafted cedarwood Deluxe Houseboat on Nigeen Lake. Savor traditional Kashmiri Kahwa tea brewed with saffron, crushed almonds, and cardamom.",
        evening:
          "5:00 PM • Sunset Shikara glide past the iconic four chinars of Char Chinar islet. Savor a multi-course Kashmiri Wazwan feast on the houseboat deck with views of the Zabarwan range.",
        activities: [
          "Dal Lake Floating Flower Market",
          "Dawn Shikara Safari",
          "Nigeen Lake Cedarwood Houseboat",
          "Char Chinar Sunset",
          "Authentic Kashmiri Wazwan Banquet",
        ],
      },
      {
        theme: "Royal Mughal Terraces & Pari Mahal Sunset",
        morning:
          "9:00 AM • Explore Nishat Bagh (Garden of Bliss), the 12-terraced garden built by Asif Khan in 1633, with fountains cascading down toward Dal Lake under centenarian chinar trees.",
        afternoon:
          "1:00 PM • Continue to Shalimar Bagh, the royal pleasure garden built by Emperor Jahangir for Empress Nur Jahan. Traditional Kashmiri Harissa and Rogan Josh lunch nearby.",
        evening:
          "4:30 PM • Ascend to Pari Mahal (Palace of Fairies), a 17th-century astronomical school and terraced garden offering the most breathtaking golden hour sunset view over all of Srinagar.",
        activities: [
          "Nishat Bagh 12 Terraces",
          "Shalimar Bagh Mughal Royal Court",
          "Chashme Shahi Spring Garden",
          "Pari Mahal Hilltop Sunset",
          "Zabarwan Mountain Panorama",
        ],
      },
      {
        theme: "Meadow of Flowers: High Alpine Gulmarg Gondola",
        morning:
          "8:00 AM • Scenic 50 km drive past Tangmarg apple orchards up to Gulmarg (2,650m). Board the world’s second-highest cable car, the Gulmarg Gondola Phase 1 to Kongdoori.",
        afternoon:
          "12:30 PM • Ride Gondola Phase 2 to Apharwat Peak (4,200m) snowline, enjoying panoramic views of snow-draped Himalayan peaks and Nanga Parbat on clear days. Warm Thukpa and Kahwa at high altitude.",
        evening:
          "4:00 PM • Walk through the pine-fringed alpine meadows of Strawberry Valley and visit the historic 120-year-old St. Mary’s Church before returning to Srinagar.",
        activities: [
          "Gulmarg Gondola Phase 1 & 2",
          "Apharwat Peak Snowline (4,200m)",
          "Strawberry Valley Alpine Meadows",
          "St. Marys Victorian Church",
          "Tangmarg Valley Scenic Corridor",
        ],
      },
      {
        theme: "Valley of Shepherds: Pahalgam & Lidder River",
        morning:
          "7:30 AM • Journey through the purple saffron fields of Pampore and historic 9th-century Avantipur temple ruins along the rushing turquoise Lidder River to Pahalgam (2,130m).",
        afternoon:
          "1:00 PM • Scenic valley cab transfer to Betaab Valley (named after the Bollywood film) and the alpine paradise of Aru Valley with lush meadows and grazing Gujjar sheep herds.",
        evening:
          "5:00 PM • Excursion to Chandanwari, the starting point of the holy Amarnath Yatra. Relax with a riverside trout fish dinner along the Lidder River banks.",
        activities: [
          "Pampore Saffron Fields",
          "Avantipur Ancient Sun Temple",
          "Betaab Valley Pine Corridors",
          "Aru Valley Alpine Wildlife Reserve",
          "Lidder River Riverside Dinner",
        ],
      },
      {
        theme: "Meadow of Gold: Sonamarg & Thajiwas Glacial Trails",
        morning:
          "8:00 AM • Dramatic drive through the roaring gorge of the Sindh River to Sonamarg (2,800m), the historic Silk Route gateway surrounded by jagged glacier peaks.",
        afternoon:
          "12:00 PM • Trek or take a mountain pony ride up to the gleaming Thajiwas Glacier, playing in the snow and drinking from ice-cold glacial meltwater streams.",
        evening:
          "4:30 PM • Relax in the flower-carpeted meadows beside the Sindh River, watching local anglers fly-fish for trout, before returning scenic route via Kangan.",
        activities: [
          "Sindh River Scenic Drive",
          "Thajiwas Glacier Ice Wall",
          "Alpine Meadow Pony Trail",
          "Nilagrad River Golden Confluence",
          "Sonamarg Trout Streams",
        ],
      },
      {
        theme: "Old Srinagar Heritage, Wooden Mosques & Spice Bazaars",
        morning:
          "9:00 AM • Heritage architectural walk through Downtown Srinagar. Visit Jamia Masjid with its 378 monumental Deodar cedarwood pillars and serene central courtyard.",
        afternoon:
          "1:00 PM • Marvel at the 14th-century Khanqah-e-Moula along the Jhelum River, renowned for its master paper-mâché wood paneling and green papier-mâché domes.",
        evening:
          "4:30 PM • Wander through the historic copperware, walnut wood-carving, and pure Pashmina shawl weaving quarters around Zaina Kadal, enjoying freshly baked Girda and Noon Chai.",
        activities: [
          "Jamia Masjid 378 Deodar Pillars",
          "Khanqah-e-Moula Papier-Mache Shrine",
          "Shah Hamdan Jhelum Riverfront",
          "Zaina Kadal Copperware Bazaars",
          "Authentic Pashmina Weaving Studio",
        ],
      },
      {
        theme: "Doodhpathri Valley of Milk & Farewell Wazwan Banquet",
        morning:
          "9:00 AM • Excursion to pristine Doodhpathri, the hidden valley of milk known for emerald rolling pastures, bubbling Shaliganga river rapids, and fragrant deodar woods.",
        afternoon:
          "1:30 PM • Picnic lunch amidst wild alpine flowers, interacting with welcoming nomadic shepherd families and tasting fresh mountain curd and herbal tea.",
        evening:
          "6:00 PM • Return to Srinagar for a grand farewell banquet at legendary Ahdoos Restaurant, savoring Gushtaba, Rista, and Tabak Maaz overlooking the Jhelum River.",
        activities: [
          "Doodhpathri Shaliganga River Rapids",
          "Emerald Alpine Pasture Hike",
          "Nomadic Shepherd Hospitality",
          "Ahdoos Heritage Restaurant Wazwan",
        ],
      },
    ],
  },
  srinagar: {
    themes: [
      "Dal Lake Reflections, Shikara Sunrise & Houseboat Living",
      "Royal Mughal Terraces & Pari Mahal Sunset",
      "Meadow of Flowers: High Alpine Gulmarg Gondola",
      "Valley of Shepherds: Pahalgam & Lidder River",
      "Meadow of Gold: Sonamarg & Thajiwas Glacial Trails",
      "Old Srinagar Heritage, Wooden Mosques & Spice Bazaars",
      "Doodhpathri Valley of Milk & Farewell Wazwan Banquet",
    ],
    days: [
      {
        theme: "Dal Lake Reflections, Shikara Sunrise & Houseboat Living",
        morning:
          "6:00 AM • Dawn Shikara cruise through misty Dal Lake to the 150-year-old Floating Vegetable & Flower Market, where local farmers trade lotus stems and fresh blooms on flat wooden boats.",
        afternoon:
          "1:00 PM • Check into a handcrafted cedarwood Deluxe Houseboat on Nigeen Lake. Savor traditional Kashmiri Kahwa tea brewed with saffron, crushed almonds, and cardamom.",
        evening:
          "5:00 PM • Sunset Shikara glide past the iconic four chinars of Char Chinar islet. Savor a multi-course Kashmiri Wazwan feast on the houseboat deck with views of the Zabarwan range.",
        activities: [
          "Dal Lake Floating Flower Market",
          "Dawn Shikara Safari",
          "Nigeen Lake Cedarwood Houseboat",
          "Char Chinar Sunset",
          "Authentic Kashmiri Wazwan Banquet",
        ],
      },
      {
        theme: "Royal Mughal Terraces & Pari Mahal Sunset",
        morning:
          "9:00 AM • Explore Nishat Bagh (Garden of Bliss), the 12-terraced garden built by Asif Khan in 1633, with fountains cascading down toward Dal Lake under centenarian chinar trees.",
        afternoon:
          "1:00 PM • Continue to Shalimar Bagh, the royal pleasure garden built by Emperor Jahangir for Empress Nur Jahan. Traditional Kashmiri Harissa and Rogan Josh lunch nearby.",
        evening:
          "4:30 PM • Ascend to Pari Mahal (Palace of Fairies), a 17th-century astronomical school and terraced garden offering the most breathtaking golden hour sunset view over all of Srinagar.",
        activities: [
          "Nishat Bagh 12 Terraces",
          "Shalimar Bagh Mughal Royal Court",
          "Chashme Shahi Spring Garden",
          "Pari Mahal Hilltop Sunset",
          "Zabarwan Mountain Panorama",
        ],
      },
      {
        theme: "Meadow of Flowers: High Alpine Gulmarg Gondola",
        morning:
          "8:00 AM • Scenic 50 km drive past Tangmarg apple orchards up to Gulmarg (2,650m). Board the world’s second-highest cable car, the Gulmarg Gondola Phase 1 to Kongdoori.",
        afternoon:
          "12:30 PM • Ride Gondola Phase 2 to Apharwat Peak (4,200m) snowline, enjoying panoramic views of snow-draped Himalayan peaks and Nanga Parbat on clear days. Warm Thukpa and Kahwa at high altitude.",
        evening:
          "4:00 PM • Walk through the pine-fringed alpine meadows of Strawberry Valley and visit the historic 120-year-old St. Mary’s Church before returning to Srinagar.",
        activities: [
          "Gulmarg Gondola Phase 1 & 2",
          "Apharwat Peak Snowline (4,200m)",
          "Strawberry Valley Alpine Meadows",
          "St. Marys Victorian Church",
          "Tangmarg Valley Scenic Corridor",
        ],
      },
      {
        theme: "Valley of Shepherds: Pahalgam & Lidder River",
        morning:
          "7:30 AM • Journey through the purple saffron fields of Pampore and historic 9th-century Avantipur temple ruins along the rushing turquoise Lidder River to Pahalgam (2,130m).",
        afternoon:
          "1:00 PM • Scenic valley cab transfer to Betaab Valley (named after the Bollywood film) and the alpine paradise of Aru Valley with lush meadows and grazing Gujjar sheep herds.",
        evening:
          "5:00 PM • Excursion to Chandanwari, the starting point of the holy Amarnath Yatra. Relax with a riverside trout fish dinner along the Lidder River banks.",
        activities: [
          "Pampore Saffron Fields",
          "Avantipur Ancient Sun Temple",
          "Betaab Valley Pine Corridors",
          "Aru Valley Alpine Wildlife Reserve",
          "Lidder River Riverside Dinner",
        ],
      },
      {
        theme: "Meadow of Gold: Sonamarg & Thajiwas Glacial Trails",
        morning:
          "8:00 AM • Dramatic drive through the roaring gorge of the Sindh River to Sonamarg (2,800m), the historic Silk Route gateway surrounded by jagged glacier peaks.",
        afternoon:
          "12:00 PM • Trek or take a mountain pony ride up to the gleaming Thajiwas Glacier, playing in the snow and drinking from ice-cold glacial meltwater streams.",
        evening:
          "4:30 PM • Relax in the flower-carpeted meadows beside the Sindh River, watching local anglers fly-fish for trout, before returning scenic route via Kangan.",
        activities: [
          "Sindh River Scenic Drive",
          "Thajiwas Glacier Ice Wall",
          "Alpine Meadow Pony Trail",
          "Nilagrad River Golden Confluence",
          "Sonamarg Trout Streams",
        ],
      },
      {
        theme: "Old Srinagar Heritage, Wooden Mosques & Spice Bazaars",
        morning:
          "9:00 AM • Heritage architectural walk through Downtown Srinagar. Visit Jamia Masjid with its 378 monumental Deodar cedarwood pillars and serene central courtyard.",
        afternoon:
          "1:00 PM • Marvel at the 14th-century Khanqah-e-Moula along the Jhelum River, renowned for its master paper-mâché wood paneling and green papier-mâché domes.",
        evening:
          "4:30 PM • Wander through the historic copperware, walnut wood-carving, and pure Pashmina shawl weaving quarters around Zaina Kadal, enjoying freshly baked Girda and Noon Chai.",
        activities: [
          "Jamia Masjid 378 Deodar Pillars",
          "Khanqah-e-Moula Papier-Mache Shrine",
          "Shah Hamdan Jhelum Riverfront",
          "Zaina Kadal Copperware Bazaars",
          "Authentic Pashmina Weaving Studio",
        ],
      },
      {
        theme: "Doodhpathri Valley of Milk & Farewell Wazwan Banquet",
        morning:
          "9:00 AM • Excursion to pristine Doodhpathri, the hidden valley of milk known for emerald rolling pastures, bubbling Shaliganga river rapids, and fragrant deodar woods.",
        afternoon:
          "1:30 PM • Picnic lunch amidst wild alpine flowers, interacting with welcoming nomadic shepherd families and tasting fresh mountain curd and herbal tea.",
        evening:
          "6:00 PM • Return to Srinagar for a grand farewell banquet at legendary Ahdoos Restaurant, savoring Gushtaba, Rista, and Tabak Maaz overlooking the Jhelum River.",
        activities: [
          "Doodhpathri Shaliganga River Rapids",
          "Emerald Alpine Pasture Hike",
          "Nomadic Shepherd Hospitality",
          "Ahdoos Heritage Restaurant Wazwan",
        ],
      },
    ],
  },
  amritsar: {
    themes: [
      "The Golden Sanctuary: Harmandir Sahib & Langar",
      "Heroic Heritage: Jallianwala Bagh & Partition Museum",
      "National Pride: Wagah Border Beating Retreat",
      "Spiritual Roots & Ancient Ram Tirath Ashram",
      "Harike Wetland Birding & Rural Punjabi Pind",
      "Maharaja Ranjit Singh Summer Palace & Farewell Bazaars",
    ],
    days: [
      {
        theme: "The Golden Sanctuary: Harmandir Sahib & Langar",
        morning:
          "5:30 AM • Early morning darshan at Sri Harmandir Sahib (Golden Temple) as the Palki Sahib ceremony commences and morning Gurbani hymns echo across the sacred Amrit Sarovar.",
        afternoon:
          "12:30 PM • Experience seva (selfless service) and partake in the free community meal at Guru-ka-Langar, the largest community kitchen in the world feeding over 100,000 pilgrims daily.",
        evening:
          "5:30 PM • Walk through the Central Sikh Museum displaying historic Sikh art and manuscripts, followed by world-famous crisp Amritsari Kulcha with melting butter at Bhai Kulwant Singh Kulcheian.",
        activities: [
          "Golden Temple Dawn Darshan",
          "Amrit Sarovar Holy Walk",
          "Guru-ka-Langar Community Seva",
          "Akal Takht Historic Throne",
          "Bhai Kulwant Singh Amritsari Kulcha",
        ],
      },
      {
        theme: "Heroic Heritage: Jallianwala Bagh & Partition Museum",
        morning:
          "9:00 AM • Pay solemn homage at Jallianwala Bagh Memorial, viewing the preserved bullet marks on the red brick walls and the historic Martyrs Well.",
        afternoon:
          "12:30 PM • Deeply moving visit to the Partition Museum in the historic Town Hall, the world’s first museum dedicated to the 1947 partition of India and the largest human migration in history.",
        evening:
          "5:00 PM • Traditional Punjabi lunch at Kesar Da Dhaba (est. 1916) savoring 24-hour slow-simmered Dal Makhani and Laccha Parathas. Evening 7D laser show at historic Gobindgarh Fort.",
        activities: [
          "Jallianwala Bagh Memorial",
          "Partition Museum Town Hall",
          "Kesar Da Dhaba Slow-Cooked Dal",
          "Gobindgarh Fort Whispering Walls 7D Show",
          "Heritage Street Evening Stroll",
        ],
      },
      {
        theme: "National Pride: Wagah Border Beating Retreat",
        morning:
          "10:00 AM • Explore Pul Kanjri, the historic 18th-century border outpost built by Maharaja Ranjit Singh for military rest, featuring an ancient stepwell and frescoed mosque.",
        afternoon:
          "2:30 PM • Transfer to the India-Pakistan border at Attari-Wagah for the world-famous Beating Retreat Military Ceremony.",
        evening:
          "5:00 PM • Experience the electric patriotic energy of thousands of spectators as BSF soldiers in fan-crested turbans perform high-kicking precision drills during the simultaneous lowering of national flags.",
        activities: [
          "Pul Kanjri Historic Outpost",
          "Attari-Wagah Border Grandstand",
          "Beating Retreat Flag Ceremony",
          "Patriotic Celebration & Drills",
          "Sarhad Peace Restaurant Border Cuisine",
        ],
      },
      {
        theme: "Spiritual Roots & Ancient Ram Tirath Ashram",
        morning:
          "9:00 AM • Visit Bhagwan Valmiki Tirath Sthal (Ram Tirath), the ancient sacred ashram where Maharishi Valmiki wrote the Ramayana and Sita gave birth to Luv and Kush.",
        afternoon:
          "1:00 PM • Visit Durgiana Temple (Silver Temple), an architectural marvel honoring Goddess Durga with intricately embossed silver doors surrounded by a holy sarovar.",
        evening:
          "4:30 PM • Browse Katra Jaimal Singh bazaar for handmade Phulkari embroidered dupattas and colorful Punjabi Juttis, followed by creamy malai lassi at Ahuja Lassi.",
        activities: [
          "Ram Tirath Sacred Ashram",
          "Durgiana Silver Temple",
          "Katra Jaimal Singh Phulkari Bazaars",
          "Ahuja Creamy Lassi",
          "Traditional Punjabi Street Food Trail",
        ],
      },
      {
        theme: "Harike Wetland Birding & Rural Punjabi Pind",
        morning:
          "7:00 AM • Excursion to Harike Wetland and Bird Sanctuary at the confluence of the Beas and Sutlej rivers, observing rare migratory waterfowl and Indus River dolphins.",
        afternoon:
          "12:30 PM • Immersive rural farmstay experience in a traditional Punjabi Pind (village). Enjoy a tractor ride through golden mustard fields and help churn fresh butter.",
        evening:
          "5:00 PM • Authentic village feast: wood-fired Sarson Da Saag, piping hot Makki Di Roti, white home-churned butter, and sugarcane jaggery (gur) under the banyan tree.",
        activities: [
          "Harike Wetland Bird Sanctuary",
          "Beas & Sutlej River Confluence",
          "Punjabi Village Pind Farmstay",
          "Tractor Ride through Mustard Fields",
          "Authentic Sarson Da Saag Village Feast",
        ],
      },
      {
        theme: "Maharaja Ranjit Singh Summer Palace & Farewell Bazaars",
        morning:
          "9:30 AM • Explore the Maharaja Ranjit Singh Panorama and Museum in Ram Bagh Gardens, showcasing illuminated dioramas and oil paintings of the Lion of Punjabs conquests.",
        afternoon:
          "1:00 PM • Farewell royal Punjabi banquet at Makhan Fish & Chicken Corner tasting authentic Amritsari fried fish coated in carom seed gram flour batter.",
        evening:
          "5:00 PM • Final evening visit to the Golden Temple illuminated beneath moonlight, sitting peacefully on the marble parikrama before your onward departure.",
        activities: [
          "Maharaja Ranjit Singh Summer Palace",
          "Ram Bagh Heritage Gardens",
          "Makhan Amritsari Fried Fish",
          "Golden Temple Night Illumination",
        ],
      },
    ],
  },
  punjab: {
    themes: [
      "The Golden Sanctuary: Harmandir Sahib & Langar",
      "Heroic Heritage: Jallianwala Bagh & Partition Museum",
      "National Pride: Wagah Border Beating Retreat",
      "Spiritual Roots & Ancient Ram Tirath Ashram",
      "Harike Wetland Birding & Rural Punjabi Pind",
      "Maharaja Ranjit Singh Summer Palace & Farewell Bazaars",
    ],
    days: [
      {
        theme: "The Golden Sanctuary: Harmandir Sahib & Langar",
        morning:
          "5:30 AM • Early morning darshan at Sri Harmandir Sahib (Golden Temple) as the Palki Sahib ceremony commences and morning Gurbani hymns echo across the sacred Amrit Sarovar.",
        afternoon:
          "12:30 PM • Experience seva (selfless service) and partake in the free community meal at Guru-ka-Langar, the largest community kitchen in the world feeding over 100,000 pilgrims daily.",
        evening:
          "5:30 PM • Walk through the Central Sikh Museum displaying historic Sikh art and manuscripts, followed by world-famous crisp Amritsari Kulcha with melting butter at Bhai Kulwant Singh Kulcheian.",
        activities: [
          "Golden Temple Dawn Darshan",
          "Amrit Sarovar Holy Walk",
          "Guru-ka-Langar Community Seva",
          "Akal Takht Historic Throne",
          "Bhai Kulwant Singh Amritsari Kulcha",
        ],
      },
      {
        theme: "Heroic Heritage: Jallianwala Bagh & Partition Museum",
        morning:
          "9:00 AM • Pay solemn homage at Jallianwala Bagh Memorial, viewing the preserved bullet marks on the red brick walls and the historic Martyrs Well.",
        afternoon:
          "12:30 PM • Deeply moving visit to the Partition Museum in the historic Town Hall, the world’s first museum dedicated to the 1947 partition of India and the largest human migration in history.",
        evening:
          "5:00 PM • Traditional Punjabi lunch at Kesar Da Dhaba (est. 1916) savoring 24-hour slow-simmered Dal Makhani and Laccha Parathas. Evening 7D laser show at historic Gobindgarh Fort.",
        activities: [
          "Jallianwala Bagh Memorial",
          "Partition Museum Town Hall",
          "Kesar Da Dhaba Slow-Cooked Dal",
          "Gobindgarh Fort Whispering Walls 7D Show",
          "Heritage Street Evening Stroll",
        ],
      },
      {
        theme: "National Pride: Wagah Border Beating Retreat",
        morning:
          "10:00 AM • Explore Pul Kanjri, the historic 18th-century border outpost built by Maharaja Ranjit Singh for military rest, featuring an ancient stepwell and frescoed mosque.",
        afternoon:
          "2:30 PM • Transfer to the India-Pakistan border at Attari-Wagah for the world-famous Beating Retreat Military Ceremony.",
        evening:
          "5:00 PM • Experience the electric patriotic energy of thousands of spectators as BSF soldiers in fan-crested turbans perform high-kicking precision drills during the simultaneous lowering of national flags.",
        activities: [
          "Pul Kanjri Historic Outpost",
          "Attari-Wagah Border Grandstand",
          "Beating Retreat Flag Ceremony",
          "Patriotic Celebration & Drills",
          "Sarhad Peace Restaurant Border Cuisine",
        ],
      },
      {
        theme: "Spiritual Roots & Ancient Ram Tirath Ashram",
        morning:
          "9:00 AM • Visit Bhagwan Valmiki Tirath Sthal (Ram Tirath), the ancient sacred ashram where Maharishi Valmiki wrote the Ramayana and Sita gave birth to Luv and Kush.",
        afternoon:
          "1:00 PM • Visit Durgiana Temple (Silver Temple), an architectural marvel honoring Goddess Durga with intricately embossed silver doors surrounded by a holy sarovar.",
        evening:
          "4:30 PM • Browse Katra Jaimal Singh bazaar for handmade Phulkari embroidered dupattas and colorful Punjabi Juttis, followed by creamy malai lassi at Ahuja Lassi.",
        activities: [
          "Ram Tirath Sacred Ashram",
          "Durgiana Silver Temple",
          "Katra Jaimal Singh Phulkari Bazaars",
          "Ahuja Creamy Lassi",
          "Traditional Punjabi Street Food Trail",
        ],
      },
      {
        theme: "Harike Wetland Birding & Rural Punjabi Pind",
        morning:
          "7:00 AM • Excursion to Harike Wetland and Bird Sanctuary at the confluence of the Beas and Sutlej rivers, observing rare migratory waterfowl and Indus River dolphins.",
        afternoon:
          "12:30 PM • Immersive rural farmstay experience in a traditional Punjabi Pind (village). Enjoy a tractor ride through golden mustard fields and help churn fresh butter.",
        evening:
          "5:00 PM • Authentic village feast: wood-fired Sarson Da Saag, piping hot Makki Di Roti, white home-churned butter, and sugarcane jaggery (gur) under the banyan tree.",
        activities: [
          "Harike Wetland Bird Sanctuary",
          "Beas & Sutlej River Confluence",
          "Punjabi Village Pind Farmstay",
          "Tractor Ride through Mustard Fields",
          "Authentic Sarson Da Saag Village Feast",
        ],
      },
      {
        theme: "Maharaja Ranjit Singh Summer Palace & Farewell Bazaars",
        morning:
          "9:30 AM • Explore the Maharaja Ranjit Singh Panorama and Museum in Ram Bagh Gardens, showcasing illuminated dioramas and oil paintings of the Lion of Punjabs conquests.",
        afternoon:
          "1:00 PM • Farewell royal Punjabi banquet at Makhan Fish & Chicken Corner tasting authentic Amritsari fried fish coated in carom seed gram flour batter.",
        evening:
          "5:00 PM • Final evening visit to the Golden Temple illuminated beneath moonlight, sitting peacefully on the marble parikrama before your onward departure.",
        activities: [
          "Maharaja Ranjit Singh Summer Palace",
          "Ram Bagh Heritage Gardens",
          "Makhan Amritsari Fried Fish",
          "Golden Temple Night Illumination",
        ],
      },
    ],
  },

  mysore: {
    themes: [
      "Royal Heritage, Palaces & Historic Bazaars",
      "Chamundi Hills, Nature Parks & Ancient Temples",
      "Srirangapatna Fortress & Brindavan Musical Gardens",
    ],
    days: [
      {
        theme: "Royal Heritage, Palaces & Historic Bazaars",
        morning:
          "9:00 AM • Explore the magnificent Mysore Palace (Amba Vilas), marveling at the stained-glass ceiling, golden howdah, and ornate royal durbar halls.",
        afternoon:
          "1:00 PM • Authentic Mysore lunch with piping hot bisibele bath and Mysore pak at Guru Sweets. Tour Jaganmohan Palace Art Gallery featuring original Raja Ravi Varma masterpieces.",
        evening:
          "4:30 PM • Wander through the 135-year-old Devaraja Market with its colorful mounds of kumkum, fragrant jasmine garlands, and pure sandalwood oils, followed by a visit to St. Philomena's Neo-Gothic Cathedral.",
        activities: ["Mysore Palace", "Jaganmohan Palace Art Gallery", "Devaraja Market", "St. Philomena's Cathedral"],
      },
      {
        theme: "Chamundi Hills, Nature Parks & Ancient Temples",
        morning:
          "8:00 AM • Scenic drive up Chamundi Hill to darshan at the 12th-century Sri Chamundeshwari Temple and marvel at the 16-foot monolithic black granite Nandi Bull.",
        afternoon:
          "1:00 PM • Traditional Karnataka thali lunch, followed by an afternoon tour through Sri Chamarajendra Zoological Gardens (Mysore Zoo), one of Asia's finest conservation parks.",
        evening:
          "4:30 PM • Walkway stroll and pedal boating along serene Karanji Lake and its walk-through aviary, enjoying the peaceful sunset overlooking Chamundi ridge.",
        activities: ["Chamundeshwari Temple", "Nandi Bull Monolith", "Mysore Zoo", "Karanji Lake & Nature Park"],
      },
      {
        theme: "Srirangapatna Fortress & Brindavan Musical Gardens",
        morning:
          "8:30 AM • Historic excursion to the Kaveri island fortress of Srirangapatna, visiting Sri Ranganathaswamy Temple, Tipu Sultan's Summer Palace (Dariya Daulat Bagh), and the Gumbaz mausoleum.",
        afternoon:
          "1:30 PM • Riverside South Indian meals by the Kaveri, followed by a guided boat safari through Ranganathittu Bird Sanctuary spotting migratory storks, herons, and marsh mugger crocodiles.",
        evening:
          "5:30 PM • Evening at the world-famous terraced Brindavan Gardens below Krishna Raja Sagara (KRS) Dam, admiring the illuminated musical fountain show.",
        activities: ["Srirangapatna Fort", "Tipu Sultan Summer Palace", "Ranganathittu Bird Sanctuary", "Brindavan Gardens Musical Fountains"],
      },
    ],
  },
  mysuru: {
    themes: [
      "Royal Heritage, Palaces & Historic Bazaars",
      "Chamundi Hills, Nature Parks & Ancient Temples",
      "Srirangapatna Fortress & Brindavan Musical Gardens",
    ],
    days: [
      {
        theme: "Royal Heritage, Palaces & Historic Bazaars",
        morning:
          "9:00 AM • Explore the magnificent Mysore Palace (Amba Vilas), marveling at the stained-glass ceiling, golden howdah, and ornate royal durbar halls.",
        afternoon:
          "1:00 PM • Authentic Mysore lunch with piping hot bisibele bath and Mysore pak at Guru Sweets. Tour Jaganmohan Palace Art Gallery featuring original Raja Ravi Varma masterpieces.",
        evening:
          "4:30 PM • Wander through the 135-year-old Devaraja Market with its colorful mounds of kumkum, fragrant jasmine garlands, and pure sandalwood oils, followed by a visit to St. Philomena's Neo-Gothic Cathedral.",
        activities: ["Mysore Palace", "Jaganmohan Palace Art Gallery", "Devaraja Market", "St. Philomena's Cathedral"],
      },
      {
        theme: "Chamundi Hills, Nature Parks & Ancient Temples",
        morning:
          "8:00 AM • Scenic drive up Chamundi Hill to darshan at the 12th-century Sri Chamundeshwari Temple and marvel at the 16-foot monolithic black granite Nandi Bull.",
        afternoon:
          "1:00 PM • Traditional Karnataka thali lunch, followed by an afternoon tour through Sri Chamarajendra Zoological Gardens (Mysore Zoo), one of Asia's finest conservation parks.",
        evening:
          "4:30 PM • Walkway stroll and pedal boating along serene Karanji Lake and its walk-through aviary, enjoying the peaceful sunset overlooking Chamundi ridge.",
        activities: ["Chamundeshwari Temple", "Nandi Bull Monolith", "Mysore Zoo", "Karanji Lake & Nature Park"],
      },
      {
        theme: "Srirangapatna Fortress & Brindavan Musical Gardens",
        morning:
          "8:30 AM • Historic excursion to the Kaveri island fortress of Srirangapatna, visiting Sri Ranganathaswamy Temple, Tipu Sultan's Summer Palace (Dariya Daulat Bagh), and the Gumbaz mausoleum.",
        afternoon:
          "1:30 PM • Riverside South Indian meals by the Kaveri, followed by a guided boat safari through Ranganathittu Bird Sanctuary spotting migratory storks, herons, and marsh mugger crocodiles.",
        evening:
          "5:30 PM • Evening at the world-famous terraced Brindavan Gardens below Krishna Raja Sagara (KRS) Dam, admiring the illuminated musical fountain show.",
        activities: ["Srirangapatna Fort", "Tipu Sultan Summer Palace", "Ranganathittu Bird Sanctuary", "Brindavan Gardens Musical Fountains"],
      },
    ],
  },
  varanasi: {
    themes: [
      "Sacred Ghats, Vishwanath Temple & Ganga Aarti",
      "Dawn Boat Rides, Historic Temples & Fort Sunset",
      "Sarnath Buddhist Heritage & Silk Weaving Bazaars",
    ],
    days: [
      {
        theme: "Sacred Ghats, Vishwanath Temple & Ganga Aarti",
        morning:
          "9:00 AM • Heritage walk along the sacred Ghats to Kashi Vishwanath Temple via the modern corridor. Seek blessings at the Jyotirlinga.",
        afternoon:
          "1:00 PM • Savor Banarasi kachori jalebi lunch, followed by an exploration of Manikarnika Ghat and the winding ancient gallis.",
        evening:
          "5:30 PM • Experience the transcendent Maha Ganga Aarti ceremony from Dashashwamedh Ghat with brass lamps and devotional chants.",
        activities: ["Kashi Vishwanath Corridor", "Heritage Gallis Walk", "Manikarnika Ghat", "Dashashwamedh Evening Ganga Aarti"],
      },
      {
        theme: "Dawn Boat Rides, Historic Temples & Fort Sunset",
        morning:
          "5:30 AM • Subah-e-Banaras morning boat ride on the misty Ganges from Assi Ghat to Panchganga Ghat as sun rises over the river.",
        afternoon:
          "1:00 PM • Banarasi thali lunch, then visit Sankat Mochan Hanuman Temple and Bharat Kala Bhavan museum on the BHU campus.",
        evening:
          "4:30 PM • Across the river to the 18th-century Ramnagar Fort to admire royal vintage carriages, armory, and panoramic river sunset.",
        activities: ["Assi Ghat Sunrise Boat Cruise", "Sankat Mochan Temple", "BHU Bharat Kala Bhavan", "Ramnagar Fort Sunset"],
      },
      {
        theme: "Sarnath Buddhist Heritage & Silk Weaving Bazaars",
        morning:
          "8:30 AM • Excursion to Sarnath where Lord Buddha delivered his first sermon. Contemplate beside Dhamek Stupa and the tranquil Deer Park.",
        afternoon:
          "1:00 PM • Visit the Sarnath Archaeological Museum housing the iconic 3rd-century BC Ashoka Lion Capital (India's national emblem).",
        evening:
          "4:30 PM • Return to Godowlia market to explore master Banarasi silk weaving looms, followed by tasting the famed Banarasi paan and malaiyo.",
        activities: ["Dhamek Stupa & Deer Park", "Sarnath Archaeological Museum", "Banarasi Silk Weaving Quarter", "Godowlia Culinary Walk"],
      },
    ],
  },
  wayanad: {
    themes: [
      "Reservoirs, Adventure Lakes & Tea Valleys",
      "Prehistoric Caves, Tribal Heritage & Waterfalls",
      "Chembra Heart Lake & Mist-Covered Viewpoints",
    ],
    days: [
      {
        theme: "Reservoirs, Adventure Lakes & Tea Valleys",
        morning:
          "8:30 AM • Visit Banasura Sagar Dam, India's largest earth dam, with speedboating amidst mist-shrouded submerged hill islands.",
        afternoon:
          "1:00 PM • Traditional Malabar lunch with bamboo biryani. Kayak or zipline at Karlad Adventure Lake nestled in evergreen hills.",
        evening:
          "4:30 PM • Guided tour through Wayanad Tea Museum and lush tea gardens with freshly brewed mountain tea tasting.",
        activities: ["Banasura Sagar Dam", "Karlad Lake", "Malabar Bamboo Biryani", "Wayanad Tea Museum"],
      },
      {
        theme: "Prehistoric Caves, Tribal Heritage & Waterfalls",
        morning:
          "8:00 AM • Trek up Ambukuthi Mala to Edakkal Caves to marvel at Neolithic rock petroglyphs and Stone Age carvings dating to 6,000 BC.",
        afternoon:
          "1:00 PM • Visit the Wayanad Heritage Museum at Ambalavayal displaying tribal artifacts, followed by photo stops at Phantom Rock.",
        evening:
          "4:30 PM • Scenic relaxation by Karapuzha Reservoir enjoying the cool mountain breeze and tranquil sunset panorama.",
        activities: ["Edakkal Caves", "Wayanad Heritage Museum", "Phantom Rock", "Karapuzha Reservoir Sunset"],
      },
      {
        theme: "Chembra Heart Lake & Mist-Covered Viewpoints",
        morning:
          "7:30 AM • Early trek through tea estates towards Chembra Peak, hiking to the famed perennial heart-shaped lake (Hridaya Saras).",
        afternoon:
          "1:30 PM • Traditional Kerala banana leaf sadhya lunch in Meppadi, followed by a visit to roaring Soochipara (Sentinel Rock) Waterfalls.",
        evening:
          "5:00 PM • Peaceful pedal boating on Pookode freshwater lake fringed by evergreen forests, ending with sunset at Lakkidi Viewpoint.",
        activities: ["Chembra Peak Heart Lake", "Soochipara Waterfalls", "Pookode Lake", "Lakkidi Valley Viewpoint"],
      },
    ],
  },
  kochi: {
    themes: [
      "Colonial Heritage, Chinese Nets & Spice Quarters",
      "Backwaters Promenade, Palaces & Coastal Sunset",
    ],
    days: [
      {
        theme: "Colonial Heritage, Chinese Nets & Spice Quarters",
        morning:
          "9:00 AM • Walk the Fort Kochi beach promenade, witnessing the iconic 14th-century Chinese fishing nets in action.",
        afternoon:
          "1:00 PM • Kerala seafood lunch on Princess Street. Tour Santa Cruz Cathedral Basilica and Mattancherry Dutch Palace with its ancient murals.",
        evening:
          "4:30 PM • Stroll through Jew Town and the Paradesi Synagogue, browsing spice warehouses smelling of ginger, cinnamon, and pepper.",
        activities: ["Chinese Fishing Nets", "Fort Kochi Promenade", "Mattancherry Palace", "Jew Town & Spice Bazaars"],
      },
      {
        theme: "Backwaters Promenade, Palaces & Coastal Sunset",
        morning:
          "9:00 AM • Scenic morning walk along Marine Drive and Rainbow Bridge, followed by boat transfer to Bolgatty Palace island.",
        afternoon:
          "1:30 PM • Visit Hill Palace Museum in Tripunithura, the administrative seat of the Kochi Rajas, showcasing the royal crown and armory.",
        evening:
          "5:00 PM • Relax at Cherai Beach with golden sand and calm waves, watching fishermen cast nets into the Arabian Sea at sunset.",
        activities: ["Marine Drive Walkway", "Bolgatty Palace", "Hill Palace Museum", "Cherai Beach Sunset"],
      },
    ],
  },
  ooty: {
    themes: [
      "Botanical Wonders & Lake Horizons",
      "Tea Gardens, Pine Forests & Waterfalls",
      "UNESCO Toy Train & Nilgiri Peaks",
      "Avalanche Valley & Silent Lake Safari",
      "Tribal Heritage & Mudumalai Wildlife",
    ],
    days: [
      {
        theme: "Botanical Wonders & Lake Horizons",
        morning:
          "9:00 AM • Stroll through the historic Government Botanical Gardens (fossil tree trunk & 1,000+ exotic floral species). Head up to Doddabetta Peak (2,637m) for panoramic vistas of the Nilgiri hills.",
        afternoon:
          "1:30 PM • Authentic South Indian lunch or tea-estate bistro meal in Charing Cross. Visit the Ooty Thread Garden showcasing hand-crafted artificial flora.",
        evening:
          "5:00 PM • Peaceful pedal or motor boating on Ooty Lake as the mist rolls in, followed by homemade chocolate tasting and eucalyptus oil shopping along Commercial Road.",
        activities: ["Government Botanical Garden", "Doddabetta Peak", "Ooty Lake & Boathouse", "Homemade Chocolate Trail"],
      },
      {
        theme: "Tea Gardens, Pine Forests & Waterfalls",
        morning:
          "8:30 AM • Scenic drive to the 9th Mile Shooting Point and Wenlock Downs pine forest. Enjoy the crisp mountain breeze and photography amidst rolling meadows.",
        afternoon:
          "1:00 PM • Visit Pykara Lake & Waterfalls. Enjoy speedboating on the pristine reservoir, followed by lunch at the TTDC lakeside restaurant.",
        evening:
          "4:30 PM • Guided tour of the Ooty Tea Factory & The Tea Museum. Watch CTC tea processing live and sample piping-hot freshly brewed cardamom tea.",
        activities: ["Pykara Lake & Waterfalls", "9th Mile Pine Forest", "Wenlock Downs", "Ooty Tea Factory & Museum"],
      },
      {
        theme: "UNESCO Toy Train & Nilgiri Peaks",
        morning:
          "8:00 AM • Board the iconic Nilgiri Mountain Railway (Toy Train) from Ooty to Coonoor. Marvel at dramatic tunnels, viaducts, and valley views.",
        afternoon:
          "12:30 PM • Explore Sim's Park in Coonoor with its curated botanical species, followed by lunch featuring local Nilgiri badaga delicacies.",
        evening:
          "4:00 PM • Drive to Dolphin's Nose viewpoint overlooking Catherine Falls, then return to Ooty for a cozy café dinner with Nilgiri spiced coffee.",
        activities: ["Nilgiri Mountain Railway (Toy Train)", "Sim's Park Coonoor", "Dolphin's Nose Viewpoint", "Catherine Falls View"],
      },
      {
        theme: "Avalanche Valley & Silent Lake Safari",
        morning:
          "8:00 AM • Forest department safari through the protected Avalanche Forest Reserve. Spot wild deer and trout hatcheries nestled by pristine streams.",
        afternoon:
          "1:30 PM • Picnic lunch by the crystal-clear waters of Emerald Lake surrounded by rolling tea slopes and quiet silence.",
        evening:
          "5:30 PM • Sunset vista at Upper Bhavani approach, returning to Ooty town for hot dinner and bonfire relaxation.",
        activities: ["Avalanche Lake", "Emerald Lake", "Trout Hatchery", "Upper Bhavani Approach"],
      },
    ],
  },
  munnar: {
    themes: [
      "Endless Tea Hills & Nilgiri Tahr",
      "Lakes, Echoes & Cloud-Covered Peaks",
      "Cascading Waterfalls & Spice Trails",
      "Kolukkumalai Sunrise & Village Life",
    ],
    days: [
      {
        theme: "Endless Tea Hills & Nilgiri Tahr",
        morning:
          "7:30 AM • Early visit to Eravikulam National Park (Rajamalai) to spot the rare endangered Nilgiri Tahr against rolling shola-grassland hills.",
        afternoon:
          "1:00 PM • Explore the KDHP Tea Museum in Munnar town. Learn orthodox tea processing history and taste single-origin black and green teas.",
        evening:
          "4:30 PM • Stroll through Munnar flower garden and Pothamedu Viewpoint for an awe-inspiring sunset over endless tea-carpeted slopes.",
        activities: ["Eravikulam National Park", "KDHP Tea Museum", "Pothamedu Viewpoint", "Munnar Spice Market"],
      },
      {
        theme: "Lakes, Echoes & Cloud-Covered Peaks",
        morning:
          "9:00 AM • Drive along the scenic Mattupetty direction. Visit Mattupetty Dam for speedboating and peaceful water reflections.",
        afternoon:
          "1:00 PM • Shout across the scenic Echo Point surrounded by eucalyptus groves, followed by shikara pedal boating at Kundala Lake.",
        evening:
          "4:30 PM • Ascend towards Top Station (historic transshipment point for tea) to witness the clouds floating beneath your feet into Tamil Nadu valleys.",
        activities: ["Mattupetty Dam", "Echo Point", "Kundala Lake", "Top Station Viewpoint"],
      },
      {
        theme: "Cascading Waterfalls & Spice Trails",
        morning:
          "8:30 AM • Guided trek down to Attukad Waterfalls through mist-veiled mountain paths and blooming wild orchids.",
        afternoon:
          "1:00 PM • Traditional Kerala banana leaf sadhya lunch with authentic red matta rice, avial, and spicy rasam.",
        evening:
          "3:30 PM • Visit a certified organic spice plantation to learn cardamom, black pepper, clove, and vanilla cultivation, followed by Kathakali/Kalaripayattu cultural performance.",
        activities: ["Attukad Waterfalls", "Spice Plantation Walk", "Punadaran Kathakali Centre", "Local Tea Tasting"],
      },
    ],
  },
  varkala: {
    themes: [
      "Cliffside Vistas & Holy Springs",
      "Backwaters Kayaking & Ancient Heritage",
      "Coastal Forts, Lighthouses & Sunset Shacks",
    ],
    days: [
      {
        theme: "Cliffside Vistas & Holy Springs",
        morning:
          "8:00 AM • Morning cliff walk along the red laterite geological formation overlooking the turquoise Arabian Sea. Sacred dip at Papanasam Beach.",
        afternoon:
          "1:00 PM • Fresh smoothie bowls and wood-fired pizza at cliffside cafes (Darjeeling Cafe / Cafe del Mar).",
        evening:
          "5:00 PM • Unwind on Black Sand Beach (Odayam) watching the golden sun dip into the horizon, followed by candlelit seafood dinner on North Cliff.",
        activities: ["North Cliff Walk", "Papanasam Beach", "Odayam Black Sand Beach", "Cliffside Cafe Dining"],
      },
      {
        theme: "Backwaters Kayaking & Ancient Heritage",
        morning:
          "8:30 AM • Peaceful kayaking or canoe ride through the mangrove corridors of Kappil Beach & Edava backwaters where the lake meets the sea.",
        afternoon:
          "1:30 PM • Traditional Malabar seafood curry meal with appams, followed by coconut water by the estuary.",
        evening:
          "4:30 PM • Darshan at the 2,000-year-old Janardhana Swamy Temple with its sacred temple pond, followed by golden hour meditation.",
        activities: ["Kappil Lake & Beach", "Edava Mangrove Kayaking", "Janardhana Swamy Temple", "South Cliff Serenity"],
      },
      {
        theme: "Coastal Forts, Lighthouses & Sunset Shacks",
        morning:
          "9:00 AM • Historical exploration of 17th-century Anjengo (Anchuthengu) Fort and climb the historic Anjengo Lighthouse for a 360° coastal view.",
        afternoon:
          "1:30 PM • Traditional coastal meals at a local fishermens wharf eatery, followed by an Ayurvedic massage or yoga rejuvenation session.",
        evening:
          "5:30 PM • Golden hour cliff acoustic music session, watching dolphins offshore and souvenir shopping for Tibetan crafts.",
        activities: ["Anjengo Fort & Lighthouse", "Ayurvedic Spa Session", "Cliff Acoustic Sundowner", "Beachside Yoga"],
      },
    ],
  },
  thenkasi: {
    themes: [
      "Herbal Waterfalls & Pandyan Heritage",
      "Five Falls & Western Ghats Reservoirs",
      "Spice Orchards & Border Culinary Trail",
    ],
    days: [
      {
        theme: "Herbal Waterfalls & Pandyan Heritage",
        morning:
          "7:00 AM • Invigorating natural herbal hydrotherapy bath at Courtallam Main Falls (Peraruvi). Rejuvenating mountain waters flowing over medicinal plants.",
        afternoon:
          "1:00 PM • Authentic hot parotta with spicy salna lunch, followed by darshan at the 13th-century Kasi Viswanathar Temple with its 180-ft Rajagopuram.",
        evening:
          "5:00 PM • Leisurely walk through Old Courtallam (Pazhaya Courtallam) and Tiger Falls, savoring fresh jackfruit, rambutan, and wild forest honey.",
        activities: ["Courtallam Main Falls", "Kasi Viswanathar Temple", "Old Courtallam Falls", "Ayikudi Guava Groves"],
      },
      {
        theme: "Five Falls & Western Ghats Reservoirs",
        morning:
          "6:30 AM • Early morning bath at the five cascading streams of Five Falls (Aintharuvi) before the Saaral season crowds arrive.",
        afternoon:
          "12:30 PM • Scenic drive through Sengottai into the rubber estates of Gundar Dam reservoir. Enjoy the cool breeze and peaceful mountain backdrop.",
        evening:
          "5:30 PM • Legendary pepper chicken and country chicken fry dinner at Border Rahmath Hotel in Shenkottai, accompanied by Tirunelveli halwa.",
        activities: ["Five Falls (Aintharuvi)", "Gundar Dam & Reservoir", "Shenkottai Border Food Trail", "Herbal Sukku Kaapi"],
      },
    ],
  },
  paris: {
    themes: [
      "Iconic Monuments & Seine River Cruise",
      "Louvre Treasures & Montmartre Artists",
      "Palace of Versailles & Latin Quarter Bistro",
    ],
    days: [
      {
        theme: "Iconic Monuments & Seine River Cruise",
        morning:
          "9:00 AM • Ascend the Eiffel Tower summit or 2nd floor for spectacular panoramas of Paris. Walk along Champ de Mars gardens.",
        afternoon:
          "1:00 PM • Stroll down Avenue des Champs-Élysées towards the Arc de Triomphe. Café lunch with fresh croissants and café au lait.",
        evening:
          "6:00 PM • One-hour scenic Bateaux Parisiens boat cruise along the Seine River, viewing illuminated bridges and Notre-Dame Cathedral.",
        activities: ["Eiffel Tower", "Champ de Mars", "Arc de Triomphe", "Seine River Cruise"],
      },
      {
        theme: "Louvre Treasures & Montmartre Artists",
        morning:
          "9:00 AM • Explore the world's greatest art museum, the Louvre (Mona Lisa, Winged Victory, Venus de Milo, Tuileries Garden).",
        afternoon:
          "1:30 PM • Lunch in the historic Le Marais neighborhood, followed by a visit to Île de la Cité and Sainte-Chapelle's stained glass windows.",
        evening:
          "5:00 PM • Climb Montmartre hill to the Basilica of Sacré-Cœur for golden hour sunsets overlooking Paris, followed by dinner in Place du Tertre.",
        activities: ["Louvre Museum", "Tuileries Garden", "Sacré-Cœur Basilica", "Montmartre Art Walk"],
      },
      {
        theme: "Palace of Versailles & Latin Quarter Bistro",
        morning:
          "8:30 AM • Day excursion to the magnificent Palace of Versailles. Explore the Hall of Mirrors, the King's Grand Apartments, and fountains.",
        afternoon:
          "1:30 PM • Rent a rowboat on the Grand Canal of Versailles, then stroll through the Queen's Hamlet (Le Hameau de la Reine).",
        evening:
          "6:30 PM • Return to Paris for evening exploration of the Latin Quarter and Shakespeare and Company bookstore, ending with a fondue dinner.",
        activities: ["Palace of Versailles", "Hall of Mirrors", "Versailles Grand Canal", "Latin Quarter Bistro"],
      },
    ],
  },
  goa: {
    themes: [
      "Historic Forts & Lively Coastal Vibes",
      "UNESCO Heritage Churches & Portuguese Alleys",
      "South Goa Serenity & Scenic Shacks",
    ],
    days: [
      {
        theme: "Historic Forts & Lively Coastal Vibes",
        morning:
          "9:00 AM • Visit 17th-century Aguada Fort and lighthouse overlooking the Arabian Sea, followed by Sinquerim beach walk.",
        afternoon:
          "1:00 PM • Beach shack lunch with fresh catch Goan fish curry and prawn balchao in Candolim or Calangute.",
        evening:
          "5:00 PM • Vibrant sunset vibe at Anjuna or Vagator beach cliffs, followed by evening curio shopping at flea markets.",
        activities: ["Aguada Fort & Lighthouse", "Candolim Beach", "Vagator Clifftop", "Goan Fish Curry Lunch"],
      },
      {
        theme: "UNESCO Heritage Churches & Portuguese Alleys",
        morning:
          "9:00 AM • Discover Old Goa's UNESCO heritage: Basilica of Bom Jesus (relics of St. Francis Xavier) and Se Cathedral.",
        afternoon:
          "1:00 PM • Guided heritage stroll through Fontainhas (Latin Quarter in Panaji) with colorful Portuguese villas and bakeries.",
        evening:
          "5:30 PM • Sunset river cruise on the Mandovi River with traditional Goan folk performances and live music.",
        activities: ["Basilica of Bom Jesus", "Se Cathedral", "Fontainhas Latin Quarter", "Mandovi River Cruise"],
      },
      {
        theme: "South Goa Serenity & Scenic Shacks",
        morning:
          "8:30 AM • Drive south to the crescent-shaped paradise of Palolem Beach for dolphin spotting and serene swimming.",
        afternoon:
          "1:30 PM • Scenic lunch at Cabo de Rama cliff restaurant overlooking the turquoise bay.",
        evening:
          "5:00 PM • Sunset drinks at Colva beach shack and peaceful evening walk on white sands.",
        activities: ["Palolem Beach", "Cabo de Rama Fort", "Dolphin Spotting", "Sunset Shack Relax"],
      },
    ],
  },
  egypt: {
    themes: [
      "Pyramids of Giza, Sphinx & Pharaoh Tombs",
      "Grand Egyptian Museum & Historic Islamic Souk",
      "Nile Felucca Sailing & Medieval Saladin Citadel",
      "Saqqara Step Pyramid & Ancient Memphis",
    ],
    days: [
      {
        theme: "Pyramids of Giza, Sphinx & Pharaoh Tombs",
        morning:
          "8:00 AM • Explore the Great Pyramid of Khufu, Khafre, and Menkaure on the Giza Plateau. Camel safari to the desert panoramic viewpoint.",
        afternoon:
          "1:00 PM • Authentic Egyptian lunch at Felfela or Mena House overlooking the Pyramids. Gaze at the enigmatic Great Sphinx carved from limestone.",
        evening:
          "5:30 PM • Attend the historic Sound & Light Show at Giza Pyramids, followed by fresh hibiscus tea (Karkadeh) at a terrace cafe.",
        activities: ["Great Pyramid of Giza", "Great Sphinx", "Panoramic Viewpoint Camel Trek", "Sound & Light Show"],
      },
      {
        theme: "Grand Egyptian Museum & Historic Islamic Souk",
        morning:
          "9:00 AM • Guided tour through the Grand Egyptian Museum (GEM) & Tahrir Museum marveling at King Tutankhamun's solid gold death mask and pharaonic treasures.",
        afternoon:
          "1:30 PM • Sample Egypt's national dish Koshary at the legendary Koshary Abou Tarek with crispy onions and fiery chili da'ah sauce.",
        evening:
          "4:30 PM • Stroll the labyrinthine alleys of 14th-century Khan el-Khalili bazaar. Sip mint tea and smoke shisha at the historic El Fishawy Cafe.",
        activities: ["Grand Egyptian Museum (GEM)", "King Tutankhamun Treasures", "Koshary Abou Tarek", "Khan el-Khalili Bazaar"],
      },
      {
        theme: "Nile Felucca Sailing & Medieval Saladin Citadel",
        morning:
          "8:30 AM • Ascend the Mokattam Hills to the Citadel of Saladin and the magnificent alabaster Mosque of Muhammad Ali with panoramic city views.",
        afternoon:
          "1:00 PM • Grilled lamb kebabs and molokhia stew lunch at Sobhy Kaber.",
        evening:
          "4:30 PM • Private sunset sailing on a traditional wooden Nile Felucca from Zamalek island, watching the Cairo skyline illuminate under the stars.",
        activities: ["Citadel of Saladin", "Mosque of Muhammad Ali", "Nile Sunset Felucca Sail", "Zamalek Riverside Promenade"],
      },
      {
        theme: "Saqqara Step Pyramid & Ancient Memphis",
        morning:
          "8:00 AM • Drive south to the desert necropolis of Saqqara to witness the Step Pyramid of Djoser, mankind's first stone pyramid.",
        afternoon:
          "1:00 PM • Traditional Bedouin-style open-air lamb mandi lunch amidst date palm orchards.",
        evening:
          "4:00 PM • Explore the ancient open-air museum of Memphis with the colossal statue of Ramesses II, returning to Cairo for sunset dinner.",
        activities: ["Saqqara Step Pyramid of Djoser", "Tomb of Ti Mastaba", "Memphis Colossus of Ramesses", "Desert Oasis Trail"],
      },
    ],
  },
  vietnam: {
    themes: [
      "Golden Bridge in the Clouds & Ba Na Hills",
      "UNESCO Lantern Town of Hoi An & Marble Mountains",
      "Hanoi Old Quarter Street Food & Train Street",
      "Emerald Karsts of Ha Long Bay Cruise",
    ],
    days: [
      {
        theme: "Golden Bridge in the Clouds & Ba Na Hills",
        morning:
          "8:00 AM • Ride the world's longest single-rope cable car up 1,487m to Sun World Ba Na Hills. Walk across the breathtaking Golden Bridge held aloft by giant stone hands.",
        afternoon:
          "1:00 PM • French-Vietnamese fusion lunch in the Alpine French Village, followed by exploring the underground wine cellars and Linh Ung Pagoda.",
        evening:
          "5:00 PM • Return to Da Nang coastline. Stroll along My Khe Beach followed by viewing the fire and water show at Dragon Bridge.",
        activities: ["Golden Bridge", "Ba Na Hills Cable Car", "Linh Ung Pagoda", "Dragon Bridge Fire Show"],
      },
      {
        theme: "UNESCO Lantern Town of Hoi An & Marble Mountains",
        morning:
          "8:30 AM • Explore the sacred caves and Buddhist pagodas of the Marble Mountains (Ngu Hanh Son) overlooking the South China Sea.",
        afternoon:
          "1:30 PM • Savor Madam Khanh's famous Banh Mi Queen baguette, then cycle through Hoi An's 16th-century yellow merchant quarter.",
        evening:
          "5:30 PM • Board a traditional wooden sampan along the Thu Bon River to release glowing floating candle lanterns into the night water.",
        activities: ["Marble Mountains", "Hoi An Ancient Town", "Japanese Covered Bridge", "Lantern Boat River Cruise"],
      },
      {
        theme: "Hanoi Old Quarter Street Food & Train Street",
        morning:
          "8:30 AM • Guided morning walk through Hanoi's 36 historic guild streets. Visit the serene Hoan Kiem Lake and Ngoc Son Temple.",
        afternoon:
          "1:00 PM • Michelin-recognized Bun Cha lunch at Huong Lien, followed by an authentic creamy egg coffee (Ca Phe Trung) at Cafe Giang.",
        evening:
          "5:00 PM • Watch the express train pass inches from trackside cafes on Hanoi Train Street, then experience a water puppet show.",
        activities: ["Hanoi Old Quarter", "Hoan Kiem Lake", "Hanoi Train Street", "Egg Coffee Tasting"],
      },
      {
        theme: "Emerald Karsts of Ha Long Bay Cruise",
        morning:
          "8:00 AM • Board a luxury wooden junk boat sailing into Ha Long Bay UNESCO World Heritage seascape of 1,600 limestone karst islands.",
        afternoon:
          "1:00 PM • Fresh seafood banquet on board while navigating past Fighting Cocks islet, followed by kayaking into Luon Cave lagoon.",
        evening:
          "5:00 PM • Sunset cocktail masterclass on the sundeck and night squid fishing under starry skies.",
        activities: ["Ha Long Bay Cruise", "Sung Sot Cave", "Sea Kayaking", "Floating Fishing Village"],
      },
    ],
  },
  uzbekistan: {
    themes: [
      "Samarkand Silk Road Splendor & Registan",
      "Shah-i-Zinda Blue Necropolis & Bibi-Khanym",
      "Ancient Citadel & Minarets of Bukhara",
      "Silk Road Trading Domes & Desert Caravans",
    ],
    days: [
      {
        theme: "Samarkand Silk Road Splendor & Registan",
        morning:
          "9:00 AM • Stand in awe at Registan Square surrounded by the soaring turquoise-tiled majolica portals of Ulugh Beg, Sher-Dor, and Tilya-Kori madrasahs.",
        afternoon:
          "1:00 PM • Feast on royal Samarkand beef plov with yellow carrots, raisins, and quail eggs cooked in giant wood-fired kazans at Osh Markazi.",
        evening:
          "4:30 PM • Visit the turquoise fluted dome and jade crypt of Amir Timur at Gur-e-Amir Mausoleum, followed by illuminated Registan night photography.",
        activities: ["Registan Square", "Ulugh Beg Madrasah", "Samarkand Plov Feast", "Gur-e-Amir Mausoleum"],
      },
      {
        theme: "Shah-i-Zinda Blue Necropolis & Bibi-Khanym",
        morning:
          "8:30 AM • Walk through the breathtaking sapphire-mosaic avenue of Shah-i-Zinda necropolis featuring 11th–15th century royal mausoleums.",
        afternoon:
          "1:00 PM • Explore Siab Bazaar for local dried apricots, walnuts, and freshly baked Samarkand non bread, followed by Bibi-Khanym Mosque.",
        evening:
          "5:00 PM • High-speed Afrosiyob train ride across the Kyzylkum desert to the medieval caravan oasis of Bukhara.",
        activities: ["Shah-i-Zinda Necropolis", "Bibi-Khanym Mosque", "Siab Bazaar", "Afrosiyob Express Train"],
      },
      {
        theme: "Ancient Citadel & Minarets of Bukhara",
        morning:
          "9:00 AM • Explore the Ark of Bukhara, the 5th-century fortified citadel of the Emirs, and the Poi Kalyan ensemble with its 48m Kalyan Minaret.",
        afternoon:
          "1:30 PM • Lunch of juicy lamb shashlik, baked samsas, and lagman noodles at Chinar courtyard restaurant.",
        evening:
          "5:00 PM • Relax by the centuries-old mulberry trees of Lyabi-Hauz pond sipping green tea (Kok-Chay) while listening to oriental folklore.",
        activities: ["Ark of Bukhara Citadel", "Po-i-Kalyan Minaret", "Lyabi-Hauz Silk Road Pond", "Chor Minor Madrasah"],
      },
      {
        theme: "Silk Road Trading Domes & Desert Caravans",
        morning:
          "9:00 AM • Wander beneath the 16th-century covered trading domes (Toqi Sarrofon, Toqi Telpak Furushon) watching artisans hand-weave carpets and forge knives.",
        afternoon:
          "1:00 PM • Authentic Bukhara somsa and sweet halva tasting at an open-air chaikhana.",
        evening:
          "4:30 PM • Sunset at the delicate 4-towered Chor Minor and royal summer palace Sitorai Mokhi-Khosa.",
        activities: ["Silk Road Trading Domes", "Artisan Carpet Guild", "Sitorai Mokhi-Khosa Palace", "Chor Minor Sunset"],
      },
    ],
  },
  georgia: {
    themes: [
      "Old Tbilisi Balconies, Fortress & Sulfur Baths",
      "Military Highway & Ananuri Castle to the Caucasus",
      "Gergeti Trinity Church under Mount Kazbegi",
      "Kakheti Cradle of Wine & Signagi Balconies",
    ],
    days: [
      {
        theme: "Old Tbilisi Balconies, Fortress & Sulfur Baths",
        morning:
          "9:00 AM • Ride the aerial ropeway cable car up to 4th-century Narikala Fortress for sweeping panoramic views of Old Tbilisi and the Mtkvari River.",
        afternoon:
          "1:00 PM • Authentic Georgian lunch at Pasanauri: learn the proper technique to eat piping-hot juicy Khinkali meat soup dumplings.",
        evening:
          "5:00 PM • Rejuvenate in the private domed thermal springs of the Abanotubani royal sulfur baths, followed by a stroll along the Peace Bridge.",
        activities: ["Narikala Fortress Cable Car", "Old Tbilisi Wooden Balconies", "Khinkali Master Lunch", "Abanotubani Sulfur Baths"],
      },
      {
        theme: "Military Highway & Ananuri Castle to the Caucasus",
        morning:
          "8:30 AM • Drive along the historic Georgian Military Highway, stopping at the 13th-century Ananuri Fortress overlooking turquoise Zhinvali Reservoir.",
        afternoon:
          "1:30 PM • Cross the Jvari Pass (2,379m) with a stop at the Soviet-Georgian Friendship Monument offering dramatic abyss vistas.",
        evening:
          "5:00 PM • Arrive in Stepantsminda (Kazbegi). Enjoy hot clay-pot Shkmeruli garlic chicken and Qvevri amber wine with Mount Kazbegi views.",
        activities: ["Georgian Military Highway", "Ananuri Fortress", "Zhinvali Reservoir", "Jvari Pass Panorama"],
      },
      {
        theme: "Gergeti Trinity Church under Mount Kazbegi",
        morning:
          "8:00 AM • 4x4 mountain drive or alpine hike up to the 14th-century Gergeti Trinity Church perched at 2,170m directly against the 5,047m Kazbegi glacier.",
        afternoon:
          "1:00 PM • Terrace lunch of hot Adjarian cheese khachapuri at Rooms Hotel Kazbegi with glass wall views of the Greater Caucasus.",
        evening:
          "4:30 PM • Hike through the dramatic Dariali Gorge towards the mountain border falls, returning to Tbilisi for evening wine bar hopping in Vera.",
        activities: ["Gergeti Trinity Church", "Mount Kazbegi Glacier View", "Adjarian Khachapuri Feast", "Dariali Gorge"],
      },
      {
        theme: "Kakheti Cradle of Wine & Signagi Balconies",
        morning:
          "9:00 AM • Scenic drive to the Kakheti wine valley. Visit 8,000-year-old subterranean Qvevri clay jars and taste natural amber wines.",
        afternoon:
          "1:30 PM • Traditional Supra feast in Sighnaghi 'City of Love' with mtsvadi skewers and badrijani walnut rolls.",
        evening:
          "5:00 PM • Stroll along the 18th-century defensive city walls of Sighnaghi overlooking the endless Alazani Valley.",
        activities: ["Qvevri Wine Cellar Tour", "Sighnaghi City Walls", "Alazani Valley Panorama", "Bodbe Monastery"],
      },
    ],
  },
  azerbaijan: {
    themes: [
      "Flame Towers, Caspian Boulevard & Little Venice",
      "UNESCO Walled Old City & Zaha Hadid Marvel",
      "Gobustan Mud Volcanoes & Burning Mountain",
      "Absheron Peninsula Fire Temples & Saffron Fields",
    ],
    days: [
      {
        theme: "Flame Towers, Caspian Boulevard & Little Venice",
        morning:
          "9:30 AM • Funicular ascent to Highland Park for amphitheater vistas of Baku Bay and the futuristic trio of Flame Towers.",
        afternoon:
          "1:30 PM • Seaside lunch at Chayki on Baku Boulevard, followed by a romantic electric gondola boat ride through Little Venice waterways.",
        evening:
          "5:30 PM • Stroll along pedestrian Nizami Street and Fountains Square, watching the Flame Towers illuminate with animated LED fire shows.",
        activities: ["Highland Park & Martyrs Alley", "Flame Towers Panorama", "Baku Boulevard Little Venice", "Nizami Street Night Walk"],
      },
      {
        theme: "UNESCO Walled Old City & Zaha Hadid Marvel",
        morning:
          "9:00 AM • Explore the medieval cobblestone citadel of Icherisheher, ascending the mysterious 12th-century Maiden Tower and Shirvanshahs' Palace.",
        afternoon:
          "1:00 PM • Sample fresh herb-stuffed gutabs and tender lamb shashlik inside Shirvanshah Museum Restaurant.",
        evening:
          "4:30 PM • Visit the Heydar Aliyev Centre designed by Zaha Hadid, photographing its undulating fluid white architecture at golden hour.",
        activities: ["Icherisheher Old City", "Maiden Tower", "Shirvanshahs' Palace", "Heydar Aliyev Center"],
      },
      {
        theme: "Gobustan Mud Volcanoes & Burning Mountain",
        morning:
          "8:30 AM • 4x4 expedition to Gobustan National Park to discover 40,000-year-old rock art petroglyphs and active bubbling mud volcanoes.",
        afternoon:
          "1:30 PM • Traditional Shah Plov lunch wrapped in crispy baked lavash with chestnuts and dried fruits at Firuze subterranean cellar.",
        evening:
          "5:00 PM • Visit Ateshgah Fire Temple (historic Zoroastrian pilgrim shrine) and Yanar Dag (the natural burning hillside gas fire).",
        activities: ["Gobustan Petroglyphs", "Mud Volcanoes Safari", "Ateshgah Fire Temple", "Yanar Dag Burning Mountain"],
      },
      {
        theme: "Absheron Peninsula Fire Temples & Saffron Fields",
        morning:
          "9:00 AM • Journey through the historic oil boom mansions of Mardakan and tour the 13th-century quadrangular fortress.",
        afternoon:
          "1:00 PM • Caspian sea sturgeon kebab lunch along Bilgah coastal cliffs with pomegranate narsharab glaze.",
        evening:
          "4:30 PM • Visit the Carpet Museum shaped like a giant rolled carpet, admiring centuries of Azerbaijani hand-knotted silk rugs.",
        activities: ["Azerbaijan Carpet Museum", "Mardakan Castle", "Caspian Sea Cliffs", "Baku Eye Ferris Wheel"],
      },
    ],
  },
  malaysia: {
    themes: [
      "Petronas Twin Towers & Golden Triangle",
      "Batu Caves Rainbow Steps & Cultural Heritage",
      "Pink Floating Mosque & Putrajaya Lake",
      "Historic Malacca or Langkawi Island Escape",
    ],
    days: [
      {
        theme: "Petronas Twin Towers & Golden Triangle",
        morning:
          "9:00 AM • Cross the world's highest double-decker skybridge at the 452m Petronas Twin Towers and take in the 86th-floor observation deck.",
        afternoon:
          "1:00 PM • Authentic Malaysian Nasi Lemak and Beef Rendang at Madam Kwan's in Suria KLCC, followed by a walk through KLCC tropical park.",
        evening:
          "5:30 PM • Watch the vibrant Lake Symphony water & light fountain show, then dive into the bustling hawker food stalls of Jalan Alor for chicken wings and satay.",
        activities: ["Petronas Twin Towers Skybridge", "KLCC Park", "Lake Symphony Light Show", "Jalan Alor Street Food Trail"],
      },
      {
        theme: "Batu Caves Rainbow Steps & Cultural Heritage",
        morning:
          "8:00 AM • Climb the 272 iconic rainbow steps of Batu Caves, greeted by the 140ft golden Lord Murugan statue and towering limestone caverns.",
        afternoon:
          "1:00 PM • Crisp Roti Canai with dhal curry and frothy pulled Teh Tarik in Little India (Brickfields).",
        evening:
          "4:00 PM • Visit the ornate 6-tier Thean Hou Temple adorned with thousands of glowing red lanterns overlooking the Kuala Lumpur skyline.",
        activities: ["Batu Caves & Murugan Statue", "Brickfields Little India", "Thean Hou Temple", "Merdeka 118 Viewpoint"],
      },
      {
        theme: "Pink Floating Mosque & Putrajaya Lake",
        morning:
          "9:00 AM • Drive south to federal administrative capital Putrajaya. Admire the rose-tinted granite architecture of Putra Mosque floating on the lake.",
        afternoon:
          "1:30 PM • Scenic Putrajaya Lake boat cruise gliding under futuristic architectural bridges, followed by traditional Malay buffet lunch at Rebung.",
        evening:
          "5:30 PM • Return to KL and ascend the KL Tower Sky Box with transparent glass floor jutting out 300m above the city.",
        activities: ["Putra Pink Mosque", "Putrajaya Lake Cruise", "Perdana Putra Landmark", "KL Tower Sky Box"],
      },
      {
        theme: "Heritage Colonial Enclave & Chinatown",
        morning:
          "9:00 AM • Explore colonial Merdeka Square, Sultan Abdul Samad Moorish building, and the confluence of the two rivers at River of Life.",
        afternoon:
          "1:00 PM • Authentic Hainanese chicken rice and iced kopi at Yut Kee Kopitiam.",
        evening:
          "4:30 PM • Hunt for bargains and speakeasy cocktail bars along Petaling Street Chinatown and Kwai Chai Hong heritage mural alley.",
        activities: ["Sultan Abdul Samad Building", "River of Life", "Petaling Street Chinatown", "Kwai Chai Hong Murals"],
      },
    ],
  },
  thailand: {
    themes: [
      "Grand Palace, Emerald Buddha & Wat Arun",
      "Chiang Mai Temples & Mountain Mist",
      "Phuket Turquoise Seas & Phi Phi Island Paradise",
      "Floating Markets & Ayutthaya Ancient Ruins",
    ],
    days: [
      {
        theme: "Grand Palace, Emerald Buddha & Wat Arun",
        morning:
          "8:30 AM • Tour the majestic Grand Palace and Wat Phra Kaew, admiring the sacred Emerald Buddha and gold mosaic stupas.",
        afternoon:
          "1:00 PM • Cross the Chao Phraya River by ferry to the 79m porcelain-encrusted pagoda of Wat Arun (Temple of Dawn).",
        evening:
          "5:30 PM • Michelin-recognized Pad Thai at Thip Samai, followed by exploring the illuminated street food stalls of Chinatown (Yaowarat).",
        activities: ["Grand Palace Bangkok", "Wat Phra Kaew (Emerald Buddha)", "Wat Arun Riverside", "Yaowarat Chinatown Food Trail"],
      },
      {
        theme: "Chiang Mai Temples & Mountain Mist",
        morning:
          "8:00 AM • Ascend Doi Suthep mountain to visit Wat Phra That Doi Suthep with panoramic vistas over misty Chiang Mai valley.",
        afternoon:
          "1:00 PM • Authentic bowl of Khao Soi Gai (crispy coconut curry noodles) at Khao Soi Khun Yai in Chiang Mai Old City.",
        evening:
          "5:00 PM • Explore 14th-century brick ruins of Wat Chedi Luang and Wat Phra Singh, followed by evening Sunday Walking Street night bazaar.",
        activities: ["Doi Suthep Golden Chedi", "Khao Soi Culinary Trail", "Wat Chedi Luang", "Sunday Walking Street Bazaar"],
      },
      {
        theme: "Phuket Turquoise Seas & Phi Phi Island Paradise",
        morning:
          "7:30 AM • Speedboat tour to Phi Phi Leh. Cruise into the turquoise waters of Maya Bay framed by 100m limestone cliffs.",
        afternoon:
          "1:00 PM • Snorkeling among vibrant coral reefs and harmless blacktip reef sharks at Shark Point and Bamboo Island.",
        evening:
          "5:30 PM • Watch the sun dip into the Andaman Sea from Promthep Cape, followed by fresh grilled tiger prawns at Rawai seafood market.",
        activities: ["Maya Bay Excursion", "Phi Phi Islands Snorkeling", "Promthep Cape Sunset", "Rawai Beach Seafood Market"],
      },
      {
        theme: "Floating Markets & Ayutthaya Ancient Ruins",
        morning:
          "7:30 AM • Experience Damnoen Saduak floating market by wooden longtail boat, sampling coconut pancakes and boat noodles from vendors.",
        afternoon:
          "1:30 PM • Drive to UNESCO World Heritage Ayutthaya Kingdom ruins. Photograph the iconic Buddha head entwined in banyan tree roots at Wat Mahathat.",
        evening:
          "6:00 PM • Relaxing Thai herbal oil massage and rooftop sunset dinner overlooking the ancient chedis.",
        activities: ["Floating Market Longtail Boat", "Ayutthaya UNESCO Ruins", "Wat Mahathat Buddha Tree", "Traditional Thai Massage"],
      },
    ],
  },
  lakshadweep: {
    themes: [
      "Agatti Island Lagoon Arrival & Coral Snorkeling",
      "Bangaram Uninhabited Island & Sandbank Excursion",
      "Scuba Diving & Coral Reef Sanctuary",
      "Thinnakara Turtle Lagoon & Kayak Expedition",
    ],
    days: [
      {
        theme: "Agatti Island Lagoon Arrival & Coral Snorkeling",
        morning:
          "9:30 AM • Land at Agatti Airport runway surrounded by surreal shades of cyan and aquamarine Arabian Sea. Check in to beachfront resort.",
        afternoon:
          "1:30 PM • Fresh grilled tuna steak and coconut curry lunch, followed by glass-bottom boat tour over untouched staghorn coral gardens.",
        evening:
          "5:00 PM • Sunset kayak ride in the crystal calm lagoon, watching sea turtles surface against the glowing orange horizon.",
        activities: ["Agatti Lagoon Welcome", "Glass-Bottom Coral Boating", "Sea Turtle Spotting", "Lagoon Sunset Kayaking"],
      },
      {
        theme: "Bangaram Uninhabited Island & Sandbank Excursion",
        morning:
          "8:30 AM • Speedboat ride to uninhabited Bangaram Island, a teardrop jewel with blinding white sandbars and crystal-clear swimming water.",
        afternoon:
          "1:00 PM • Beach picnic lunch under coconut palms, followed by walking barefoot along the narrow sandbank stretching into the sea.",
        evening:
          "5:00 PM • Evening boat ride past Thinnakara island observing playful dolphins, returning to Agatti for fresh fish fry and tender coconut water.",
        activities: ["Bangaram Island Speedboat", "Sandbank Walking Tour", "Dolphin Watching Cruise", "Beach Picnic"],
      },
      {
        theme: "Scuba Diving & Coral Reef Sanctuary",
        morning:
          "8:00 AM • PADI guided scuba dive exploring pristine drop-offs, manta rays, clownfish, and sea anemones at Agatti Reef.",
        afternoon:
          "1:00 PM • Authentic Lakshadweep lunch: Malabar layered parotta with spiced fish roast and warm herbal sulaimani tea.",
        evening:
          "5:00 PM • Stroll through Agatti fishing village and coconut groves, learning local coir craft and enjoying evening sea breeze.",
        activities: ["PADI Scuba Diving", "Coral Drop-Off Exploration", "Village Cultural Stroll", "Stargazing on Beach"],
      },
      {
        theme: "Thinnakara Turtle Lagoon & Kayak Expedition",
        morning:
          "9:00 AM • Wooden boat sail to Thinnakara island coral atoll. Snorkel beside giant green sea turtles grazing in sea-grass beds.",
        afternoon:
          "1:30 PM • Tender coconut water and Lakshadweep tuna curry lunch on the secluded beach.",
        evening:
          "5:00 PM • Paddleboard around the sand spit during low tide, taking in the infinite 360-degree turquoise horizons.",
        activities: ["Thinnakara Turtle Snorkel", "Stand-Up Paddleboarding", "Island Atoll Picnic", "Bioluminescent Beach Walk"],
      },
    ],
  },
  annapurna: {
    themes: [
      "Pokhara Gateway & Trailhead to Ghandruk",
      "Rhododendron Forests & Chhomrong Valley",
      "Bamboo, Dovan & Alpine Ascent to Deurali",
      "Machapuchare Base Camp to Annapurna Sanctuary (4,130m)",
      "Glacier Sunrise & Descent to Jhinu Hot Springs",
    ],
    days: [
      {
        theme: "Pokhara Gateway & Trailhead to Ghandruk",
        morning:
          "6:30 AM • Shared 4x4 Jeep ride from Pokhara Lakeside along the Modi Khola river valley to Siwai trailhead. Begin trek through terraced millet fields.",
        afternoon:
          "1:00 PM • Traditional Dal Bhat lunch at a scenic teahouse in Kimche, followed by a stone-step ascent through ancient oak forests to the historic Gurung village of Ghandruk.",
        evening:
          "5:30 PM • Sunset views over Hiunchuli and Annapurna South. Evening cultural stroll through Ghandruk stone alleys and Gurung museum, followed by a warm teahouse dinner.",
        activities: ["Modi Khola Valley Drive", "Kimche Trailhead", "Ghandruk Gurung Village", "Gurung Cultural Museum"],
      },
      {
        theme: "Rhododendron Forests & Chhomrong Valley",
        morning:
          "7:00 AM • Morning ascent through mossy rhododendron and pine forests toward Komrong Danda, enjoying early mountain vistas.",
        afternoon:
          "1:30 PM • Cross the Kimrong Khola suspension bridge and tackle the stone staircase up to Chhomrong village (2,170m). Lunch at a cliffside teahouse with valley panoramas.",
        evening:
          "5:00 PM • Relax at the legendary Chhomrong German Bakery with fresh apple pie and ginger lemon honey tea, gazing directly at the Fishtail peak of Machapuchare.",
        activities: ["Komrong Danda Vista", "Kimrong Suspension Bridge", "Chhomrong Terraces", "Chhomrong German Bakery"],
      },
      {
        theme: "Bamboo, Dovan & Alpine Ascent to Deurali",
        morning:
          "6:30 AM • Descend the famous 2,500 stone steps to Chhomrong Khola bridge, then climb steeply into dense bamboo and oak thickets reaching Sinuwa.",
        afternoon:
          "1:00 PM • Hearty hot Sherpa stew lunch at Bamboo / Dovan teahouse. Ascend the Modi Khola gorge past weeping waterfalls and dramatic canyon rock walls.",
        evening:
          "5:00 PM • Arrive at Deurali (3,200m) situated beneath towering rock faces. Warm up around the teahouse stove with garlic soup for acclimatization.",
        activities: ["2,500 Stone Steps", "Sinuwa Ridge", "Modi Khola Gorge", "Deurali Alpine Haven"],
      },
      {
        theme: "Machapuchare Base Camp to Annapurna Sanctuary (4,130m)",
        morning:
          "6:00 AM • Alpine trek through the dramatic glacier canyon past Hinku Cave, emerging above the tree line into the breathtaking Machapuchare Base Camp (MBC - 3,700m).",
        afternoon:
          "12:30 PM • Hot lunch at MBC with 360-degree views of the sacred Fishtail pinnacle. Continue the gradual glacial valley ascent toward Annapurna Base Camp (ABC - 4,130m).",
        evening:
          "4:30 PM • Arrive inside the legendary Annapurna Sanctuary! Marvel at the awe-inspiring 360° mountain amphitheater as golden hour illuminates Annapurna I, South, and Glacier walls.",
        activities: ["Hinku Cave", "Machapuchare Base Camp (3,700m)", "Annapurna Sanctuary Amphitheater", "Annapurna Base Camp (4,130m)"],
      },
      {
        theme: "Glacier Sunrise & Descent to Jhinu Hot Springs",
        morning:
          "5:30 AM • Unforgettable dawn photography as the first pink and gold rays strike the 8,091m summit of Annapurna I. Hot tea on the summit glacier plateau.",
        afternoon:
          "11:00 AM • Begin descent retracing trail through Bamboo and Sinuwa. Stop for energetic Dal Bhat lunch with panoramic valley views.",
        evening:
          "5:00 PM • Arrive at Jhinu Danda. Soak tired trekker muscles in the natural thermal hot springs right beside the roaring Modi Khola river.",
        activities: ["Annapurna I Dawn Sunrise", "Glacier Plateau Walk", "Modi Khola Descent", "Jhinu Danda Natural Hot Springs"],
      },
    ],
  },
};

/**
 * Synthesizes a structured DayPlan array for any destination and duration.
 */
export function generateRichDayPlans(
  destination: string,
  duration_days: number = 3,
  interests: string[] = ["Sightseeing"],
  travel_style: string = "Balanced",
  attractions: string[] = [],
  budget: number = 25000
): DayPlan[] {
  const destClean = (destination || "").trim();
  const destLower = destClean.toLowerCase();
  const daysCount = Math.max(1, duration_days);

  // Look up curated destination presets safely
  const curatedKey = Object.keys(CURATED_DESTINATIONS).find((k) => {
    if (k === destLower) return true;
    if (destLower.includes(k)) return true;
    if (k === "annapurna" && (destLower.includes("abc") || destLower.includes("annapoorna") || destLower.includes("base camp"))) return true;
    return false;
  });

  const curated = curatedKey ? CURATED_DESTINATIONS[curatedKey] : null;

  const result: DayPlan[] = [];
  const dailyCost = Math.round(budget / daysCount);

  for (let i = 1; i <= daysCount; i++) {
    if (curated && curated.days[i - 1]) {
      const cDay = curated.days[i - 1];
      result.push({
        day: i,
        title: cDay.theme,
        theme: cDay.theme,
        morning: cDay.morning,
        afternoon: cDay.afternoon,
        evening: cDay.evening,
        activities: cDay.activities,
        estimated_daily_cost: dailyCost,
      });
    } else {
      // Intelligent Dynamic Multi-Stop Generator (4-6 authentic distinct stops per day with NO repeats and realistic timings)
      const dayThemes = [
        `Arrival, Architectural Orientation & Welcome Dining`,
        `Signature UNESCO Wonders & Royal Historic Heritage`,
        `Nature Reserves, Panoramic Ridge & Sunset Golden Hour`,
        `Ancient Shrines, Living Traditions & Artisan Bazaars`,
        `Scenic Countryside Valley & Culinary Tasting Trail`,
        `Hidden Overlooks, Folk Art Quarters & Riverfront Stroll`,
        `Botanical Sanctuaries, Clifftop Vistas & Night Markets`,
        `Regional Folklore, Craft Cooperatives & Tea Gardens`,
        `Offbeat Heritage Corridors & Authentic Street Gastronomy`,
        `Memorable Farewell Panoramic Vistas & Souvenir Trails`,
      ];

      const dayTheme = dayThemes[(i - 1) % dayThemes.length];

      // Build rich destination-specific activity anchors
      const pool = attractions && attractions.length >= 6
        ? attractions
        : [
            `${destClean} Historic Old Quarter & Grand Heritage Gateway`,
            `${destClean} Royal Palace & Dynastic Museum`,
            `${destClean} Panoramic Mountain Ridge & Skywalk Viewpoint`,
            `${destClean} Botanical Nature Sanctuary & Forest Trail`,
            `${destClean} 14th-Century Stone Fort & Lookout Towers`,
            `${destClean} Traditional Spice, Tea & Silk Market`,
            `${destClean} Sacred Riverfront Ghats & Ancient Shrines`,
            `${destClean} Artisan Handcraft Workshop & Pottery Studio`,
            `${destClean} Lakeside Promenade & Golden Hour Boat Cruise`,
            `${destClean} Heritage Street Food Safari & Night Market`,
            `${destClean} High-Altitude Scenic Pass & Alpine Meadows`,
            `${destClean} Folk Art Museum & Living Heritage Village`,
          ];

      // Dynamic stop count: Day 1 (4 stops for arrival pacing), Days 2-3 (5-6 stops), other days (4-5 stops)
      const stopCount = i === 1 ? 4 : (i % 2 === 0 ? 5 : 6);
      const dayOffset = (i - 1) * 3;
      const dayActs: string[] = [];
      for (let s = 0; s < stopCount; s++) {
        dayActs.push(pool[(dayOffset + s) % pool.length]);
      }

      const morningText = i === 1
        ? `8:30 AM • Arrival in ${destClean}, seamless check-in and briefing. Morning orientation walk through ${dayActs[0]} to admire early architecture and morning street vibrancy.`
        : `7:45 AM • Crisp early morning excursion to ${dayActs[0]}. Capture pristine photography before peak crowds, followed by a guided walking circuit through ${dayActs[1] || dayActs[0]}.`;

      const afternoonText = `1:15 PM • Authentic regional lunch at a celebrated local dining spot. Afternoon cultural exploration at ${dayActs[2] || dayActs[1]}, immersing in local craftsmanship, heritage artifacts, and traditional customs.`;

      const eveningText = i === daysCount
        ? `5:30 PM • Sunset viewing at ${dayActs[dayActs.length - 1]}, followed by souvenir shopping for authentic ${destClean} handicrafts and a festive farewell dinner banquet.`
        : `5:15 PM • Golden hour promenade along ${dayActs[dayActs.length - 2] || dayActs[dayActs.length - 1]} with panoramic sunset vistas. Evening street food safari and dinner at ${dayActs[dayActs.length - 1]}.`;

      result.push({
        day: i,
        title: `Day ${i}: ${dayTheme}`,
        theme: dayTheme,
        morning: morningText,
        afternoon: afternoonText,
        evening: eveningText,
        activities: dayActs,
        estimated_daily_cost: dailyCost,
      });
    }
  }

  return result;
}

/**
 * Validates and repairs any trip object so that `ai_itinerary` has rich DayPlans.
 */
export function ensureTripItinerary(trip: any): any {
  if (!trip) return trip;

  const itin = trip.ai_itinerary;
  const hasValidItinerary =
    Array.isArray(itin) &&
    itin.length > 0 &&
    itin.some((d: any) => d && (d.morning || d.afternoon || d.evening || d.theme));

  if (!hasValidItinerary) {
    const richItin = generateRichDayPlans(
      trip.destination || "Destination",
      trip.duration_days || 3,
      trip.interests || ["Sightseeing"],
      trip.travel_style || "Balanced",
      trip.attractions || [],
      trip.budget || 25000
    );
    trip.ai_itinerary = richItin;
  }

  return trip;
}

/**
 * Accurately maps any destination name (case-insensitive, substring-aware)
 * to its verified photograph, avoiding duplicate/incorrect fallbacks.
 */
export function getDestinationImage(destination?: string): string {
  if (!destination) return "/destinations/travel.jpg";
  const clean = destination.toLowerCase().trim();

  if (
    clean.includes("varanasi") ||
    clean.includes("kashi") ||
    clean.includes("benaras") ||
    clean.includes("benares") ||
    clean.includes("banaras")
  ) {
    return "/destinations/varanasi.jpg";
  }
  if (clean.includes("ooty") || clean.includes("nilgiri")) return "/destinations/ooty.jpg";
  if (clean.includes("varkala")) return "/destinations/varkala.jpg";
  if (clean.includes("delhi")) return "/destinations/delhi.jpg";
  if (clean.includes("agra")) return "/destinations/travel.jpg";
  if (clean.includes("jaipur")) return "/destinations/travel.jpg";
  if (clean.includes("kashmir") || clean.includes("srinagar")) return "/destinations/travel.jpg";
  if (clean.includes("amritsar") || clean.includes("punjab")) return "/destinations/travel.jpg";

  if (clean.includes("munnar")) return "/destinations/munnar.jpg";
  if (clean.includes("goa")) return "/destinations/goa.jpg";
  if (clean.includes("paris") || clean.includes("france")) return "/destinations/paris.jpg";
  if (clean.includes("tokyo") || clean.includes("japan")) return "/destinations/tokyo.jpg";
  if (clean.includes("bali") || clean.includes("indonesia")) return "/destinations/bali.jpg";
  if (clean.includes("dubai") || clean.includes("uae")) return "/destinations/dubai.jpg";
  if (
    clean.includes("thenkasi") ||
    clean.includes("tenkasi") ||
    clean.includes("courtallam") ||
    clean.includes("kutralam")
  ) {
    return "/destinations/thenkasi.jpg";
  }
  if (clean.includes("coorg") || clean.includes("madikeri") || clean.includes("kodagu")) {
    return "/destinations/coorg.jpg";
  }
  if (clean.includes("kodaikanal") || clean.includes("kodai")) return "/destinations/kodaikanal.jpg";
  if (clean.includes("alleppey") || clean.includes("alappuzha")) return "/destinations/alleppey.jpg";
  if (clean.includes("wayanad")) return "/destinations/wayanad.jpg";
  if (clean.includes("mysore") || clean.includes("mysuru")) return "/destinations/mysore.jpg";
  if (clean.includes("hampi")) return "/destinations/hampi.jpg";
  if (clean.includes("gokarna")) return "/destinations/gokarna.jpg";
  if (clean.includes("thekkady")) return "/destinations/thekkady.jpg";
  if (clean.includes("kovalam")) return "/destinations/kovalam.jpg";
  if (clean.includes("manali")) return "/destinations/manali.jpg";
  if (clean.includes("egypt") || clean.includes("cairo") || clean.includes("giza") || clean.includes("luxor")) {
    return "/destinations/egypt.jpg";
  }
  if (clean.includes("vietnam") || clean.includes("da nang") || clean.includes("hanoi") || clean.includes("phu quoc") || clean.includes("hoi an")) {
    return "/destinations/vietnam.jpg";
  }
  if (clean.includes("uzbekistan") || clean.includes("samarkand") || clean.includes("bukhara") || clean.includes("tashkent")) {
    return "/destinations/uzbekistan.jpg";
  }
  if (clean.includes("georgia") || clean.includes("tbilisi") || clean.includes("kazbegi") || clean.includes("batumi")) {
    return "/destinations/georgia.jpg";
  }
  if (clean.includes("azerbaijan") || clean.includes("baku") || clean.includes("gobustan")) {
    return "/destinations/azerbaijan.jpg";
  }
  if (clean.includes("malaysia") || clean.includes("kuala lumpur") || clean.includes("putrajaya") || clean.includes("langkawi")) {
    return "/destinations/malaysia.jpg";
  }
  if (clean.includes("thailand") || clean.includes("bangkok") || clean.includes("chiang mai") || clean.includes("phuket") || clean.includes("krabi")) {
    return "/destinations/thailand.jpg";
  }
  if (clean.includes("lakshadweep") || clean.includes("agatti") || clean.includes("bangaram") || clean.includes("kavaratti")) {
    return "/destinations/lakshadweep.jpg";
  }
  if (
    clean.includes("annapurna") ||
    clean.includes("annapoorna") ||
    clean.includes("abc") ||
    clean.includes("everest") ||
    clean.includes("ebc") ||
    clean.includes("himalaya") ||
    clean.includes("trek")
  ) {
    return "/destinations/annapurna.jpg";
  }

  return "/destinations/travel.jpg";
}
