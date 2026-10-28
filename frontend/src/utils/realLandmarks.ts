/**
 * Comprehensive Real Landmark GPS Catalog & Geocoding Resolver
 * Provides verified geographic coordinates for hundreds of attractions,
 * monuments, beaches, viewpoints, temples, and palaces worldwide.
 */

export interface LandmarkEntry {
  keywords: string[];
  name: string;
  lat: number;
  lon: number;
  type: string;
  category: "start" | "sight" | "culture" | "market";
  desc?: string;
}

export const VERIFIED_LANDMARKS: LandmarkEntry[] = [
  // ==================== DELHI ====================
  { keywords: ["india gate", "kartavya path"], name: "India Gate", lat: 28.6129, lon: 77.2295, type: "National Memorial", category: "start" },
  { keywords: ["red fort", "lal qila"], name: "Red Fort (Lal Qila)", lat: 28.6562, lon: 77.2410, type: "Mughal Palace Fortress", category: "sight" },
  { keywords: ["qutub minar", "qutb minar", "mehrauli"], name: "Qutub Minar", lat: 28.5244, lon: 77.1855, type: "UNESCO Minaret", category: "culture" },
  { keywords: ["humayun", "humayun's tomb"], name: "Humayun's Tomb", lat: 28.5933, lon: 77.2507, type: "Mughal Architecture", category: "culture" },
  { keywords: ["lotus temple", "bahai"], name: "Lotus Temple", lat: 28.5535, lon: 77.2588, type: "Modern Landmark", category: "sight" },
  { keywords: ["akshardham"], name: "Swaminarayan Akshardham", lat: 28.6127, lon: 77.2773, type: "Cultural Temple Complex", category: "culture" },
  { keywords: ["jama masjid"], name: "Jama Masjid Delhi", lat: 28.6507, lon: 77.2334, type: "Historic Mosque", category: "sight" },
  { keywords: ["chandni chowk", "paranthe wali"], name: "Chandni Chowk", lat: 28.6506, lon: 77.2303, type: "Historic Bazaar", category: "market" },
  { keywords: ["connaught place", "cp", "janpath"], name: "Connaught Place", lat: 28.6315, lon: 77.2167, type: "Heritage Shopping District", category: "market" },
  { keywords: ["lodhi garden", "lodi garden"], name: "Lodhi Gardens", lat: 28.5931, lon: 77.2197, type: "Botanical Parkland", category: "sight" },
  { keywords: ["rashtrapati bhavan", "presidential palace"], name: "Rashtrapati Bhavan", lat: 28.6143, lon: 77.1994, type: "Presidential Estate", category: "start" },
  { keywords: ["raj ghat", "gandhi memorial"], name: "Raj Ghat", lat: 28.6406, lon: 77.2495, type: "Peace Memorial", category: "culture" },
  { keywords: ["sundar nursery"], name: "Sundar Nursery", lat: 28.5956, lon: 77.2447, type: "Mughal Heritage Park", category: "sight" },
  { keywords: ["hauz khas", "deer park"], name: "Hauz Khas Village & Fort", lat: 28.5494, lon: 77.1950, type: "Medieval Reservoir & Boutiques", category: "culture" },
  { keywords: ["bangla sahib"], name: "Gurudwara Bangla Sahib", lat: 28.6263, lon: 77.2091, type: "Sikh Shrine", category: "culture" },

  // ==================== KERALA: MUNNAR ====================
  { keywords: ["mattupetty", "mattupetti"], name: "Mattupetty Dam & Lake", lat: 10.1065, lon: 77.1248, type: "Masonry Dam & Boating", category: "sight" },
  { keywords: ["echo point"], name: "Echo Point Munnar", lat: 10.1265, lon: 77.1582, type: "Panoramic Mountain Lake", category: "sight" },
  { keywords: ["tea museum", "lockhart", "kdhp"], name: "Tata Tea Museum", lat: 10.0768, lon: 77.0605, type: "Plantation Heritage", category: "culture" },
  { keywords: ["top station"], name: "Top Station Ridge", lat: 10.1246, lon: 77.2445, type: "Highest Valley Viewpoint", category: "sight" },
  { keywords: ["kundala", "kundale"], name: "Kundala Arch Dam & Lake", lat: 10.1342, lon: 77.1789, type: "Alpine Lake & Shikara", category: "sight" },
  { keywords: ["eravikulam", "rajamalai", "tahr"], name: "Eravikulam National Park", lat: 10.1873, lon: 77.0583, type: "Wildlife Sanctuary", category: "start" },
  { keywords: ["anamudi", "anmudi"], name: "Anamudi Peak", lat: 10.1706, lon: 77.0644, type: "Highest Peak South India", category: "sight" },
  { keywords: ["pothamedu", "pothanmedu"], name: "Pothamedu View Point", lat: 10.0631, lon: 77.0468, type: "Sunset Tea Valley Vista", category: "sight" },
  { keywords: ["attukad", "attukal waterfall"], name: "Attukad Waterfalls", lat: 10.0526, lon: 77.0392, type: "Cascade & Jungle Trek", category: "sight" },
  { keywords: ["blossom hydel", "blossom park"], name: "Blossom Hydel Park", lat: 10.0694, lon: 77.0594, type: "Floral Riverside Parkland", category: "market" },
  { keywords: ["chinnar", "chinnar wildlife"], name: "Chinnar Wildlife Sanctuary", lat: 10.3200, lon: 77.2100, type: "Dry Thorn Forest Safari", category: "sight" },
  { keywords: ["marayoor", "marayur", "sandalwood"], name: "Marayoor Sandalwood Forest", lat: 10.2800, lon: 77.1600, type: "Natural Sandalwood Grove", category: "culture" },

  // ==================== KERALA: VARKALA ====================
  { keywords: ["varkala cliff", "north cliff"], name: "Varkala North Cliff Promenade", lat: 8.7368, lon: 76.7056, type: "Laterite Ocean Cliff", category: "sight" },
  { keywords: ["papanasam", "papanasham"], name: "Papanasam Beach", lat: 8.7303, lon: 76.7103, type: "Sacred Golden Sand Beach", category: "start" },
  { keywords: ["janardhana", "janardhanaswamy"], name: "Janardhana Swami Temple", lat: 8.7297, lon: 76.7161, type: "2000-Yr Vaishnavite Shrine", category: "culture" },
  { keywords: ["sivagiri", "sree narayana guru"], name: "Sivagiri Mutt", lat: 8.7423, lon: 76.7381, type: "Spiritual Pilgrimage Center", category: "culture" },
  { keywords: ["kappil", "kappil beach"], name: "Kappil Beach & Backwater Estuary", lat: 8.7845, lon: 76.6789, type: "Coastal Estuary Drive", category: "sight" },
  { keywords: ["anjengo", "anchuthengu fort"], name: "Anjengo Fort & Lighthouse", lat: 8.6817, lon: 76.7578, type: "Colonial British Fortress", category: "sight" },
  { keywords: ["odayam"], name: "Odayam Beach", lat: 8.7445, lon: 76.7012, type: "Secluded Surfing Beach", category: "sight" },
  { keywords: ["black beach", "black sand"], name: "Varkala Black Sand Beach", lat: 8.7392, lon: 76.7034, type: "Coastal Geological Beach", category: "sight" },
  { keywords: ["edava", "nadayara"], name: "Edava Beach & Blue Lagoon", lat: 8.7610, lon: 76.6900, type: "Serene Backwater Beach", category: "sight" },

  // ==================== KERALA: KOCHI & ERNAKULAM ====================
  { keywords: ["fort kochi", "fort cochin"], name: "Fort Kochi Heritage District", lat: 9.9658, lon: 76.2421, type: "Colonial Port Quarter", category: "start" },
  { keywords: ["chinese fishing", "cheena vala"], name: "Chinese Fishing Nets", lat: 9.9675, lon: 76.2415, type: "Iconic Harbor Cantilevers", category: "sight" },
  { keywords: ["mattancherry", "dutch palace"], name: "Mattancherry Dutch Palace", lat: 9.9583, lon: 76.2592, type: "Kerala Mural Museum", category: "culture" },
  { keywords: ["jewish synagogue", "paradesi"], name: "Paradesi Jewish Synagogue", lat: 9.9575, lon: 76.2594, type: "Historic 1568 Synagogue", category: "culture" },
  { keywords: ["jew town", "antique street"], name: "Jew Town Antique Street", lat: 9.9570, lon: 76.2600, type: "Curio & Spice Street", category: "market" },
  { keywords: ["marine drive kochi", "marine drive", "rainbow bridge"], name: "Marine Drive Waterfront Promenade", lat: 9.9796, lon: 76.2775, type: "Vembanad Waterfront", category: "market" },
  { keywords: ["cherai", "cherai beach"], name: "Cherai Beach", lat: 10.1416, lon: 76.1783, type: "Golden Sand Swimming Beach", category: "sight" },
  { keywords: ["hill palace"], name: "Hill Palace Museum Tripunithura", lat: 9.9535, lon: 76.3639, type: "Royal Artifacts & Heritage", category: "culture" },
  { keywords: ["bolgatty"], name: "Bolgatty Palace & Island", lat: 9.9867, lon: 76.2675, type: "Dutch Heritage Island", category: "sight" },
  { keywords: ["lulu mall", "edapally"], name: "LuLu International Shopping Mall", lat: 10.0275, lon: 76.3080, type: "Premier Lifestyle Destination", category: "market" },
  { keywords: ["kuzhupilly"], name: "Kuzhupilly Beach", lat: 10.1050, lon: 76.1850, type: "Eco Pine Coast", category: "sight" },

  // ==================== KERALA: THEKKADY & PERIYAR ====================
  { keywords: ["periyar lake", "periyar safari", "periyar national"], name: "Periyar Lake Wildlife Boat Safari", lat: 9.6005, lon: 77.1650, type: "Tiger Reserve Sanctuary", category: "start" },
  { keywords: ["spice plantation", "spice garden", "cardamom"], name: "Abraham's Spice Garden & Plantation", lat: 9.6080, lon: 77.1720, type: "Aromatic Spice Agriculture", category: "sight" },
  { keywords: ["kadathanadan", "kalaripayattu", "kalari"], name: "Kadathanadan Kalari & Kathakali Center", lat: 9.6041, lon: 77.1664, type: "Traditional Martial Arts Arena", category: "culture" },
  { keywords: ["elephant junction", "elephant ride"], name: "Elephant Junction Thekkady", lat: 9.6045, lon: 77.1790, type: "Ethical Elephant Sanctuary", category: "sight" },
  { keywords: ["mangala devi"], name: "Mangala Devi Kannagi Temple", lat: 9.5786, lon: 77.2003, type: "Ancient 1000-Yr Forest Shrine", category: "culture" },
  { keywords: ["chellarkovil"], name: "Chellarkovil Waterfalls & Viewpoint", lat: 9.6389, lon: 77.2289, type: "Valley Overlook & Bamboo Forest", category: "sight" },
  { keywords: ["pandikuzhi"], name: "Pandikuzhi Viewpoint", lat: 9.6125, lon: 77.2014, type: "Picturesque Picnic Ridge", category: "sight" },
  { keywords: ["kumily", "kumily market"], name: "Kumily Spice & Handicraft Market", lat: 9.6062, lon: 77.1685, type: "Highland Spice Bazaar", category: "market" },

  // ==================== KERALA: ALLEPPEY ====================
  { keywords: ["alleppey beach", "alappuzha beach", "alleppey lighthouse"], name: "Alappuzha Beach & Historic Pier", lat: 9.4939, lon: 76.3183, type: "Colonial Lighthouse Coast", category: "start" },
  { keywords: ["punnamada", "nehru trophy"], name: "Punnamada Lake Houseboat Hub", lat: 9.5167, lon: 76.3472, type: "Houseboat Embarkation Jetty", category: "sight" },
  { keywords: ["kuttanad", "below sea level"], name: "Kuttanad Backwater Paddy Fields", lat: 9.4333, lon: 76.4667, type: "Farming Below Sea Level", category: "sight" },
  { keywords: ["marari", "mararikulam"], name: "Marari Pristine Beach", lat: 9.6006, lon: 76.2974, type: "Palm-Fringed Golden Sand Coast", category: "sight" },
  { keywords: ["pathiramanal"], name: "Pathiramanal Bird Island", lat: 9.6192, lon: 76.3861, type: "Vembanad Migratory Bird Sanctuary", category: "sight" },
  { keywords: ["revi karunakaran", "rkk museum"], name: "Revi Karunakaran Memorial Museum", lat: 9.4975, lon: 76.3317, type: "Crystal & Tanjore Art Museum", category: "culture" },
  { keywords: ["champakulam", "st mary"], name: "Champakulam Kalloorkad Basilica", lat: 9.4050, lon: 76.4150, type: "AD 427 St. Thomas Church", category: "culture" },

  // ==================== KERALA: WAYANAD ====================
  { keywords: ["banasura", "banasura sagar"], name: "Banasura Sagar Dam", lat: 11.6687, lon: 75.9573, type: "Largest Earthen Dam in India", category: "sight" },
  { keywords: ["edakkal", "edakkal caves"], name: "Edakkal Prehistoric Rock Caves", lat: 11.6289, lon: 76.2347, type: "Neolithic Petroglyph Caves", category: "culture" },
  { keywords: ["chembra", "chembra peak", "heart lake"], name: "Chembra Peak & Heart-Shaped Lake", lat: 11.5133, lon: 76.0875, type: "High Altitude Rainforest Trek", category: "start" },
  { keywords: ["soochipara", "sentinel rock"], name: "Soochipara Waterfalls", lat: 11.5126, lon: 76.1624, type: "Three-Tiered Jungle Cascade", category: "sight" },
  { keywords: ["pookode", "pookot lake"], name: "Pookode Freshwater Lake", lat: 11.5414, lon: 76.0264, type: "Evergreen Forest Boating", category: "sight" },
  { keywords: ["lakkidi", "lakkidi viewpoint"], name: "Lakkidi View Point & Ghat Pass", lat: 11.5147, lon: 76.0232, type: "Thamarassery Churam Gateway", category: "sight" },
  { keywords: ["kuruva", "kuruvadweep"], name: "Kuruva Island (Kuruvadweep)", lat: 11.8219, lon: 76.0906, type: "Kabini River Forest Delta", category: "sight" },
  { keywords: ["muthanga", "wayanad wildlife"], name: "Muthanga Wildlife Sanctuary", lat: 11.6708, lon: 76.3653, type: "Elephant Corridor Safari", category: "sight" },
  { keywords: ["meenmutty"], name: "Meenmutty Waterfalls Wayanad", lat: 11.5303, lon: 76.2428, type: "Triple Drop Forest Falls", category: "sight" },

  // ==================== GOA ====================
  { keywords: ["baga", "baga beach", "tito"], name: "Baga Beach", lat: 15.5553, lon: 73.7517, type: "Vibrant Beach & Watersports", category: "start" },
  { keywords: ["calangute", "queen of beaches"], name: "Calangute Beach", lat: 15.5439, lon: 73.7553, type: "Premier Coastal Hub", category: "sight" },
  { keywords: ["anjuna", "flea market", "curlies"], name: "Anjuna Beach & Flea Market", lat: 15.5733, lon: 73.7410, type: "Bohemian Shore & Sunset Cliff", category: "market" },
  { keywords: ["aguada", "fort aguada", "sinquerim"], name: "Fort Aguada & Lighthouse", lat: 15.4924, lon: 73.7737, type: "17th-Century Portuguese Fortress", category: "sight" },
  { keywords: ["chapora", "dil chahta hai"], name: "Chapora Fort & Vagator Coast", lat: 15.6057, lon: 73.7371, type: "Iconic Hilltop Ruin & Vista", category: "sight" },
  { keywords: ["bom jesus", "basilica"], name: "Basilica of Bom Jesus", lat: 15.5009, lon: 73.9116, type: "UNESCO Baroque Relic Church", category: "culture" },
  { keywords: ["se cathedral"], name: "Se Cathedral Old Goa", lat: 15.5034, lon: 73.9126, type: "Grand Portuguese Cathedral", category: "culture" },
  { keywords: ["dudhsagar", "sea of milk"], name: "Dudhsagar Waterfalls", lat: 15.3144, lon: 74.3143, type: "Four-Tiered Western Ghats Cascade", category: "sight" },
  { keywords: ["palolem", "canacona"], name: "Palolem Crescent Beach", lat: 15.0100, lon: 74.0232, type: "Tranquil South Goa Bay", category: "sight" },
  { keywords: ["fontainhas", "latin quarter", "panjim"], name: "Fontainhas Latin Quarter", lat: 15.4989, lon: 73.8315, type: "Portuguese Heritage Streetscape", category: "culture" },
  { keywords: ["vagator", "little vagator", "thalassa"], name: "Vagator Beach & Red Cliffs", lat: 15.5990, lon: 73.7440, type: "Scenic Red Cliff Shoreline", category: "sight" },
  { keywords: ["candolim"], name: "Candolim Beach", lat: 15.5160, lon: 73.7630, type: "Dune-Backed Coastal Stretch", category: "sight" },
  { keywords: ["colva"], name: "Colva Beach South Goa", lat: 15.2780, lon: 73.9120, type: "White Sand Coconut Strand", category: "sight" },

  // ==================== AGRA ====================
  { keywords: ["taj mahal", "tajmahal"], name: "Taj Mahal", lat: 27.1751, lon: 78.0421, type: "UNESCO Wonder of the World", category: "start" },
  { keywords: ["agra fort", "lal qila agra"], name: "Agra Fort", lat: 27.1795, lon: 78.0211, type: "Mughal Imperial Palace", category: "sight" },
  { keywords: ["mehtab bagh", "moonlight garden"], name: "Mehtab Bagh", lat: 27.1800, lon: 78.0450, type: "Yamuna Sunset Reflection Garden", category: "sight" },
  { keywords: ["fatehpur sikri", "buland darwaza"], name: "Fatehpur Sikri & Buland Darwaza", lat: 27.0945, lon: 77.6679, type: "UNESCO Akbar Capital Fortress", category: "culture" },
  { keywords: ["itimad", "baby taj"], name: "Tomb of I'timād-ud-Daulah", lat: 27.1929, lon: 78.0310, type: "Pietra Dura Marble Mausoleum", category: "culture" },
  { keywords: ["sikandra", "akbar tomb"], name: "Akbar's Mausoleum at Sikandra", lat: 27.2206, lon: 77.9507, type: "Red Sandstone Forest Tomb", category: "culture" },

  // ==================== JAIPUR ====================
  { keywords: ["hawa mahal", "palace of winds"], name: "Hawa Mahal", lat: 26.9239, lon: 75.8267, type: "Pink City Honeycombed Facade", category: "start" },
  { keywords: ["amber fort", "amer fort", "maota lake"], name: "Amber Fort & Palace", lat: 26.9855, lon: 75.8513, type: "UNESCO Rajput Hill Fortress", category: "sight" },
  { keywords: ["city palace jaipur", "city palace"], name: "City Palace Jaipur", lat: 26.9258, lon: 75.8236, type: "Royal Kachwaha Palace & Museum", category: "culture" },
  { keywords: ["jantar mantar"], name: "Jantar Mantar Astronomical Observatory", lat: 26.9248, lon: 75.8246, type: "World's Largest Stone Sundial", category: "culture" },
  { keywords: ["nahargarh", "tiger fort"], name: "Nahargarh Fort", lat: 26.9378, lon: 75.8156, type: "Hilltop Ramparts & Sunset Vista", category: "sight" },
  { keywords: ["jal mahal", "water palace"], name: "Jal Mahal", lat: 26.9535, lon: 75.8462, type: "Palace in Man Sagar Lake", category: "sight" },
  { keywords: ["jaigarh"], name: "Jaigarh Fort & Jaivana Cannon", lat: 26.9846, lon: 75.8458, type: "Victory Fort & Cannon Foundry", category: "sight" },
  { keywords: ["albert hall", "ram niwas"], name: "Albert Hall State Central Museum", lat: 26.9116, lon: 75.8195, type: "Indo-Saracenic Art Museum", category: "culture" },
  { keywords: ["patrika gate", "jawahar circle"], name: "Patrika Gate", lat: 26.8396, lon: 75.8038, type: "Hand-Painted Architectural Arch", category: "market" },
  { keywords: ["chokhi dhani"], name: "Chokhi Dhani Ethnic Resort", lat: 26.7667, lon: 75.8344, type: "Rajasthani Cultural Village", category: "market" },

  // ==================== VARANASI ====================
  { keywords: ["kashi vishwanath", "vishwanath"], name: "Kashi Vishwanath Corridor & Temple", lat: 25.3109, lon: 83.0107, type: "Spiritual Jyotirlinga Shrine", category: "start" },
  { keywords: ["dashashwamedh", "ganga aarti"], name: "Dashashwamedh Ghat & Evening Aarti", lat: 25.3076, lon: 83.0104, type: "Grand Sacred Riverfront", category: "culture" },
  { keywords: ["manikarnika"], name: "Manikarnika Ghat", lat: 25.3108, lon: 83.0139, type: "Historic Cremation Ghat", category: "culture" },
  { keywords: ["assi ghat", "subah-e-banaras"], name: "Assi Ghat", lat: 25.2885, lon: 83.0062, type: "Dawn Yoga & Cultural Confluence", category: "start" },
  { keywords: ["sarnath", "dhamek"], name: "Sarnath Deer Park & Dhamek Stupa", lat: 25.3811, lon: 83.0232, type: "First Sermon Buddhist Heritage", category: "sight" },
  { keywords: ["bhu", "bharat kala bhavan"], name: "Banaras Hindu University & Museum", lat: 25.2677, lon: 82.9913, type: "Heritage Educational Campus", category: "culture" },
  { keywords: ["ramnagar fort"], name: "Ramnagar Fort & Museum", lat: 25.2687, lon: 83.0253, type: "Royal Sandstone Palace on Ganges", category: "sight" },

  // ==================== MYSORE ====================
  { keywords: ["mysore palace", "amba vilas"], name: "Mysore Palace (Amba Vilas)", lat: 12.3052, lon: 76.6552, type: "Wadiyar Royal Palace", category: "start" },
  { keywords: ["chamundi", "chamundeshwari"], name: "Sri Chamundeshwari Temple & Hill", lat: 12.2725, lon: 76.6705, type: "Highland Shrine & Valley Vista", category: "sight" },
  { keywords: ["brindavan", "krs dam"], name: "Brindavan Gardens & Musical Fountains", lat: 12.4224, lon: 76.5724, type: "Illuminated Terraced Gardens", category: "market" },
  { keywords: ["philomena"], name: "St. Philomena's Cathedral", lat: 12.3211, lon: 76.6582, type: "Neo-Gothic Twin Spire Basilica", category: "culture" },
  { keywords: ["mysore zoo", "chamarajendra"], name: "Mysore Zoo", lat: 12.3021, lon: 76.6645, type: "Conservation Zoological Gardens", category: "sight" },
  { keywords: ["jaganmohan"], name: "Jaganmohan Palace Art Gallery", lat: 12.3072, lon: 76.6495, type: "Raja Ravi Varma Gallery", category: "culture" },
  { keywords: ["ranganathittu"], name: "Ranganathittu Bird Sanctuary", lat: 12.4244, lon: 76.6555, type: "Kaveri Islet Boat Safari", category: "sight" },

  // ==================== OOTY ====================
  { keywords: ["doddabetta", "doddabetta peak"], name: "Doddabetta Peak", lat: 11.4014, lon: 76.7358, type: "Highest Nilgiri Mountain Vista", category: "sight" },
  { keywords: ["ooty lake", "boat house"], name: "Ooty Lake & Boating", lat: 11.4086, lon: 76.6896, type: "Picturesque Mountain Lake", category: "sight" },
  { keywords: ["botanical garden ooty", "botanical garden"], name: "Government Botanical Garden", lat: 11.4178, lon: 76.7118, type: "Terraced Nilgiri Flora Parkland", category: "start" },
  { keywords: ["rose garden"], name: "Government Rose Garden Ooty", lat: 11.4081, lon: 76.7142, type: "Elk Hill Terraced Rose Reserve", category: "sight" },
  { keywords: ["pykara", "pykara lake"], name: "Pykara Lake & Waterfalls", lat: 11.4589, lon: 76.5986, type: "Scenic Toda Sacred Reservoir", category: "sight" },
  { keywords: ["avalanche lake", "avalanche"], name: "Avalanche Lake & Sanctuary", lat: 11.3006, lon: 76.5772, type: "Untouched Trout Lake Forest", category: "sight" },
  { keywords: ["toy train", "nilgiri mountain"], name: "Nilgiri Mountain Railway", lat: 11.4076, lon: 76.7025, type: "UNESCO Heritage Steam Railway", category: "culture" },

  // ==================== INTERNATIONAL: PARIS ====================
  { keywords: ["eiffel", "eiffel tower", "tour eiffel"], name: "Eiffel Tower", lat: 48.8584, lon: 2.2945, type: "Global Architectural Icon", category: "start" },
  { keywords: ["louvre", "musee du louvre", "mona lisa"], name: "Louvre Museum", lat: 48.8606, lon: 2.3376, type: "World's Largest Art Museum", category: "culture" },
  { keywords: ["notre dame", "notre-dame"], name: "Notre-Dame de Paris", lat: 48.8530, lon: 2.3499, type: "Medieval Gothic Cathedral", category: "culture" },
  { keywords: ["arc de triomphe", "champs elysees", "champs-elysees"], name: "Arc de Triomphe & Champs-Élysées", lat: 48.8738, lon: 2.2950, type: "Monumental Triumphal Arch", category: "sight" },
  { keywords: ["sacre coeur", "sacre-coeur", "montmartre"], name: "Sacré-Cœur Basilica & Montmartre", lat: 48.8867, lon: 2.3431, type: "Hilltop Travertine Basilica", category: "sight" },
  { keywords: ["seine", "bateaux mouches"], name: "Seine River Cruise", lat: 48.8588, lon: 2.2975, type: "Riverfront Architectural Cruise", category: "market" },

  // ==================== INTERNATIONAL: DUBAI ====================
  { keywords: ["burj khalifa"], name: "Burj Khalifa Skydeck", lat: 25.1972, lon: 55.2744, type: "World's Tallest Skyscraper", category: "start" },
  { keywords: ["dubai mall", "dubai fountain"], name: "The Dubai Mall & Fountain Show", lat: 25.1985, lon: 55.2796, type: "World's Largest Shopping & Leisure Hub", category: "market" },
  { keywords: ["dubai marina", "jbr", "marina walk"], name: "Dubai Marina & JBR Promenade", lat: 25.0805, lon: 55.1403, type: "Luxury Yachting Boulevard", category: "sight" },
  { keywords: ["palm jumeirah", "atlantis"], name: "Palm Jumeirah & Atlantis", lat: 25.1124, lon: 55.1390, type: "Archipelago & Aquaventure", category: "sight" },
  { keywords: ["museum of the future"], name: "Museum of the Future", lat: 25.2192, lon: 55.2819, type: "Futuristic Calligraphic Monument", category: "culture" },
  { keywords: ["dubai frame"], name: "Dubai Frame", lat: 25.2355, lon: 55.3003, type: "Historic & Modern Panorama Frame", category: "sight" },
  { keywords: ["gold souk", "spice souk"], name: "Deira Gold & Spice Souk", lat: 25.2687, lon: 55.2974, type: "Traditional Arabian Bazaars", category: "market" },
];

/**
 * Searches the verified catalog for an activity string
 */
export function matchRealLandmark(
  activityName: string,
  cityName?: string
): LandmarkEntry | null {
  if (!activityName) return null;
  const cleanAct = activityName.toLowerCase().replace(/[^a-z0-9\s]/g, " ");

  // 1. Direct keyword match
  for (const entry of VERIFIED_LANDMARKS) {
    for (const kw of entry.keywords) {
      if (cleanAct.includes(kw)) {
        return entry;
      }
    }
  }

  return null;
}

/**
 * Local storage caching for geocoded stops
 */
export function getCachedGeocode(key: string): { lat: number; lon: number } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`tg_geo_${key.toLowerCase()}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed.lat === "number" && typeof parsed.lon === "number") {
        return parsed;
      }
    }
  } catch {}
  return null;
}

export function saveCachedGeocode(
  key: string,
  coords: { lat: number; lon: number }
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`tg_geo_${key.toLowerCase()}`, JSON.stringify(coords));
  } catch {}
}

/**
 * Deterministic organic city dispersion fallback (NO straight lines, NO spoke starbursts).
 * Distributes unlisted activities along realistic winding routes in the city's real bounds.
 */
export function getOrganicCityOffset(
  name: string,
  stopIdx: number,
  dayIdx: number,
  baseLat: number,
  baseLon: number
): { lat: number; lon: number } {
  let hash = 0;
  const seed = `${name}_${stopIdx}_day${dayIdx}`;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);

  // Stop 1 is always in the central quarter (0.3 to 1.2 km from base)
  // Subsequent stops follow realistic street progressions without radiating spoke angles
  const dayBaseAngle = (dayIdx * 1.05 + ((absHash % 40) * 0.02)) % (2 * Math.PI);
  const distanceKm = stopIdx === 0 ? 0.005 : 0.009 + (stopIdx * 0.005) + ((absHash % 25) * 0.0003);
  const angle = dayBaseAngle + (stopIdx * 0.45) + (((absHash >> 3) % 20) * 0.015);

  const latOffset = distanceKm * Math.cos(angle);
  const lonOffset = (distanceKm * Math.sin(angle)) / Math.cos((baseLat * Math.PI) / 180);

  return {
    lat: Number((baseLat + latOffset).toFixed(5)),
    lon: Number((baseLon + lonOffset).toFixed(5)),
  };
}
