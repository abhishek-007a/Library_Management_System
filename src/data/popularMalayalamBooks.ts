export interface MalayalamCatalogEntry {
  isbn?: string;
  isbns?: string[];
  title: string;
  titleEnglish: string;
  author: string;
  authorEnglish: string;
  publisher: string;
  genre: string;
  publishedDate?: string;
  coverUrl: string;
  description: string;
}

/**
 * Curated from Goodreads Popular Malayalam Books Shelf
 * (https://share.google/QR8X4QAVmLGYSZXyR / https://www.goodreads.com/shelf/show/malayalam)
 */
export const POPULAR_MALAYALAM_BOOKS: MalayalamCatalogEntry[] = [
  {
    isbns: ['9788184231175', '9788126424252', '9788184230437', '8184231178'],
    isbn: '9788184231175',
    title: 'ആടുജീവിതം',
    titleEnglish: 'Aadujeevitham (Goat Days)',
    author: 'ബെന്യാമിൻ',
    authorEnglish: 'Benyamin',
    publisher: 'Green Books',
    genre: 'Novel (നോവൽ)',
    publishedDate: '2008',
    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80',
    description: 'A masterpiece survival drama of Najeeb, an Indian migrant worker who gets trapped in the remote deserts of Saudi Arabia.'
  },
  {
    isbns: ['9788126402489', '9788171300068', '9788126410408', '8126402483'],
    isbn: '9788126402489',
    title: 'രണ്ടാമൂഴം',
    titleEnglish: 'Randamoozham',
    author: 'എം.ടി. വാസുദേവൻ നായർ',
    authorEnglish: 'M. T. Vasudevan Nair',
    publisher: 'DC Books',
    genre: 'Classic Fiction',
    publishedDate: '1984',
    coverUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&auto=format&fit=crop&q=80',
    description: 'The Mahabharata retold through the eyes and raw emotions of Bhima, second of the Pandava brothers.'
  },
  {
    isbns: ['9788126401062', '9788171300075', '9788126405237', '8126401061'],
    isbn: '9788126401062',
    title: 'ഖസാക്കിന്റെ ഇതിഹാസം',
    titleEnglish: 'Khasakkinte Ithihasam',
    author: 'ഒ.വി. വിജയൻ',
    authorEnglish: 'O. V. Vijayan',
    publisher: 'DC Books',
    genre: 'Novel (നോവൽ)',
    publishedDate: '1969',
    coverUrl: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=400&auto=format&fit=crop&q=80',
    description: 'A milestone in Malayalam literature depicting the arrival of Ravi at the enchanting village of Khasak.'
  },
  {
    isbns: ['9788126400928', '9788171301072', '8126400928'],
    isbn: '9788126400928',
    title: 'മയ്യഴിപ്പുഴയുടെ തീരങ്ങളിൽ',
    titleEnglish: 'Mayyazhippuzhayude Theerangalil',
    author: 'എം. മുകുന്ദൻ',
    authorEnglish: 'M. Mukundan',
    publisher: 'DC Books',
    genre: 'Novel (നോവൽ)',
    publishedDate: '1974',
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&auto=format&fit=crop&q=80',
    description: 'A vivid social and romantic chronicle of life in the French-ruled territory of Mahe.'
  },
  {
    isbns: ['9788126401031', '9788171301058', '8126401037'],
    isbn: '9788126401031',
    title: 'പാത്തുമ്മായുടെ ആട്',
    titleEnglish: 'Pathummayude Aadu',
    author: 'വൈക്കം മുഹമ്മദ് ബഷീർ',
    authorEnglish: 'Vaikom Muhammad Basheer',
    publisher: 'DC Books',
    genre: 'Humor & Classic',
    publishedDate: '1959',
    coverUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&auto=format&fit=crop&q=80',
    description: 'Delightful autobiographical humor about Basheer’s large family and his sister Pathumma’s voracious goat.'
  },
  {
    isbns: ['9788126401017', '9788171301034', '8126401010'],
    isbn: '9788126401017',
    title: 'ബാല്യകാലസഖി',
    titleEnglish: 'Balyakalasakhi',
    author: 'വൈക്കം മുഹമ്മദ് ബഷീർ',
    authorEnglish: 'Vaikom Muhammad Basheer',
    publisher: 'DC Books',
    genre: 'Romantic Tragedy',
    publishedDate: '1944',
    coverUrl: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&auto=format&fit=crop&q=80',
    description: 'The poignant and immortal tragic love story of childhood sweethearts Majeed and Suhra.'
  },
  {
    isbns: ['9788126402496', '9788171300082', '8126402491'],
    isbn: '9788126402496',
    title: 'നാലുകെട്ട്',
    titleEnglish: 'Naalukettu',
    author: 'എം.ടി. വാസുദേവൻ നായർ',
    authorEnglish: 'M. T. Vasudevan Nair',
    publisher: 'Current Books',
    genre: 'Classic Fiction',
    publishedDate: '1958',
    coverUrl: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=400&auto=format&fit=crop&q=80',
    description: 'Appunni’s revenge and search for identity amidst the crumbling matrilineal joint family system of Kerala.'
  },
  {
    isbns: ['9788126401024', '9788171301041'],
    isbn: '9788126401024',
    title: 'പ്രേമലേഖനം',
    titleEnglish: 'Premalekhanam',
    author: 'വൈക്കം മുഹമ്മദ് ബഷീർ',
    authorEnglish: 'Vaikom Muhammad Basheer',
    publisher: 'DC Books',
    genre: 'Romance / Humor',
    publishedDate: '1943',
    coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&auto=format&fit=crop&q=80',
    description: 'A humorous love story written in prison between Kesavan Nair and Saramma.'
  },
  {
    isbns: ['9788126401048', '9788171301065'],
    isbn: '9788126401048',
    title: 'മതിലുകൾ',
    titleEnglish: 'Mathilukal',
    author: 'വൈക്കം മുഹമ്മദ് ബഷീർ',
    authorEnglish: 'Vaikom Muhammad Basheer',
    publisher: 'DC Books',
    genre: 'Autobiographical Fiction',
    publishedDate: '1965',
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&auto=format&fit=crop&q=80',
    description: 'Basheer’s tender love affair with Narayani across the high prison walls, communicating only by voice.'
  },
  {
    isbns: ['9788126402519', '9788171300105'],
    isbn: '9788126402519',
    title: 'മഞ്ഞ്',
    titleEnglish: 'Manju (Mist)',
    author: 'എം.ടി. വാസുദേവൻ നായർ',
    authorEnglish: 'M. T. Vasudevan Nair',
    publisher: 'Current Books',
    genre: 'Novel (നോവൽ)',
    publishedDate: '1964',
    coverUrl: 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=400&auto=format&fit=crop&q=80',
    description: 'Vimala’s unending wait at the misty mountain resort of Nainital for her lover Sudhir.'
  },
  {
    isbns: ['9788126402502', '9788171300099'],
    isbn: '9788126402502',
    title: 'കാലം',
    titleEnglish: 'Kaalam (Time)',
    author: 'എം.ടി. വാസുദേവൻ നായർ',
    authorEnglish: 'M. T. Vasudevan Nair',
    publisher: 'Current Books',
    genre: 'Classic Fiction',
    publishedDate: '1969',
    coverUrl: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400&auto=format&fit=crop&q=80',
    description: 'The journey of Sethumadhavan from an ambitious rural youth to a disillusioned city success.'
  },
  {
    isbns: ['9788171300228', '9788126400225'],
    isbn: '9788171300228',
    title: 'ഒരു ദേശത്തിന്റെ കഥ',
    titleEnglish: 'Oru Desathinte Katha',
    author: 'എസ്. കെ. പൊറ്റെക്കാട്ട്',
    authorEnglish: 'S. K. Pottekkatt',
    publisher: 'DC Books',
    genre: 'Novel (നോവൽ)',
    publishedDate: '1971',
    coverUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&auto=format&fit=crop&q=80',
    description: 'Jnanpith award-winning autobiographical chronicle of Athiranippadam and its vibrant personalities.'
  },
  {
    isbns: ['9788171300211', '9788126400218'],
    isbn: '9788171300211',
    title: 'ഒരു തെരുവിന്റെ കഥ',
    titleEnglish: 'Oru Theruvinte Kadha',
    author: 'എസ്. കെ. പൊറ്റെക്കാട്ട്',
    authorEnglish: 'S. K. Pottekkatt',
    publisher: 'DC Books',
    genre: 'Novel (നോവൽ)',
    publishedDate: '1960',
    coverUrl: 'https://images.unsplash.com/photo-1463320726281-696a485928c7?w=400&auto=format&fit=crop&q=80',
    description: 'The bustling life, characters, joys, and tragedies centering around SM Street in Kozhikode.'
  },
  {
    isbns: ['9788126435944', '9788126437146'],
    isbn: '9788126435944',
    title: 'ആരാച്ചാർ',
    titleEnglish: 'Aaraachaar (Hangwoman)',
    author: 'കെ. ആർ. മീര',
    authorEnglish: 'K. R. Meera',
    publisher: 'DC Books',
    genre: 'Novel (നോവൽ)',
    publishedDate: '2012',
    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80',
    description: 'Chetna Grddha Mullick becomes the first woman executioner in India, exploring themes of destiny, power, and media.'
  },
  {
    isbns: ['9788126400195', '9788171300198'],
    isbn: '9788126400195',
    title: 'എന്റെ കഥ',
    titleEnglish: 'Ente Katha (My Story)',
    author: 'മാധവിക്കുട്ടി (കമല സുരയ്യ)',
    authorEnglish: 'Madhavikutty (Kamala Surayya)',
    publisher: 'DC Books',
    genre: 'Autobiography (ജീവചരിത്രം)',
    publishedDate: '1973',
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&auto=format&fit=crop&q=80',
    description: 'Kamala Das’s groundbreaking, candid, and passionate autobiography that challenged conventions.'
  },
  {
    isbns: ['9788126400201', '9788171300204'],
    isbn: '9788126400201',
    title: 'നീർമാതളം പൂത്തകാലം',
    titleEnglish: 'Neermathalam Pootha Kaalam',
    author: 'മാധവിക്കുട്ടി (കമല സുരയ്യ)',
    authorEnglish: 'Madhavikutty (Kamala Surayya)',
    publisher: 'DC Books',
    genre: 'Memoir (ഓർമ്മക്കുറിപ്പുകൾ)',
    publishedDate: '1993',
    coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&auto=format&fit=crop&q=80',
    description: 'Lyrical childhood memories of Punnayurkulam, grandma’s affection, and blooming Neermathalam flowers.'
  },
  {
    isbns: ['9788126400843', '9788171300846'],
    isbn: '9788126400843',
    title: 'ഒരു സങ്കീർത്തനം പോലെ',
    titleEnglish: 'Oru Sangeerthanam Pole',
    author: 'പെരുമ്പടവം ശ്രീധരൻ',
    authorEnglish: 'Perumbadavam Sreedharan',
    publisher: 'DC Books',
    genre: 'Biographical Novel',
    publishedDate: '1993',
    coverUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&auto=format&fit=crop&q=80',
    description: 'The intense 21-day love story and creative frenzy between Fyodor Dostoevsky and his stenographer Anna Snitkina.'
  },
  {
    isbns: ['9788126428410', '9788126435340'],
    isbn: '9788126428410',
    title: 'ഫ്രാൻസിസ് ഇട്ടിക്കോര',
    titleEnglish: 'Francis Itty Cora',
    author: 'ടി. ഡി. രാമകൃഷ്ണൻ',
    authorEnglish: 'T. D. Ramakrishnan',
    publisher: 'DC Books',
    genre: 'Historical Thriller',
    publishedDate: '2009',
    coverUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&auto=format&fit=crop&q=80',
    description: 'A 15th-century pepper merchant from Kunnamkulam connects to modern secret global societies, art, and mathematics.'
  },
  {
    isbns: ['9788126437153', '9788126442651'],
    isbn: '9788126437153',
    title: 'മഞ്ഞവെയിൽ മരണങ്ങൾ',
    titleEnglish: 'Manjaveyil Maranangal (Yellow Lights of Death)',
    author: 'ബെന്യാമിൻ',
    authorEnglish: 'Benyamin',
    publisher: 'DC Books',
    genre: 'Mystery & Thriller',
    publishedDate: '2011',
    coverUrl: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=400&auto=format&fit=crop&q=80',
    description: 'An intriguing mystery set between Diego Garcia island and Kerala investigating the death of Christy Andrapper.'
  },
  {
    isbns: ['9788126400553', '9788171300556'],
    isbn: '9788126400553',
    title: 'യക്ഷി',
    titleEnglish: 'Yakshi',
    author: 'മലയാറ്റൂർ രാമകൃഷ്ണൻ',
    authorEnglish: 'Malayattoor Ramakrishnan',
    publisher: 'DC Books',
    genre: 'Psychological Thriller',
    publishedDate: '1967',
    coverUrl: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&auto=format&fit=crop&q=80',
    description: 'A disfigured college lecturer falls in love with a breathtaking beauty, succumbing to delusions and suspicion.'
  },
  {
    isbns: ['9788126400560', '9788171300563'],
    isbn: '9788126400560',
    title: 'വേരുകൾ',
    titleEnglish: 'Verukal (Roots)',
    author: 'മലയാറ്റൂർ രാമകൃഷ്ണൻ',
    authorEnglish: 'Malayattoor Ramakrishnan',
    publisher: 'DC Books',
    genre: 'Classic Fiction',
    publishedDate: '1966',
    coverUrl: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=400&auto=format&fit=crop&q=80',
    description: 'Raghu travels from Delhi to his ancestral village to sell the family property, but rediscovers his familial roots.'
  },
  {
    isbns: ['9788126400454', '9788171300457'],
    isbn: '9788126400454',
    title: 'അഗ്നിസാക്ഷി',
    titleEnglish: 'Agnisakshi',
    author: 'ലളിതാംബിക അന്തർജ്ജനം',
    authorEnglish: 'Lalithambika Antharjanam',
    publisher: 'Current Books',
    genre: 'Social Novel',
    publishedDate: '1976',
    coverUrl: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400&auto=format&fit=crop&q=80',
    description: 'Devaki Manampalli renounces orthodoxy and marital life to join the freedom struggle and social reform.'
  },
  {
    isbns: ['9788126400812', '9788171300815'],
    isbn: '9788126400812',
    title: 'ഇനി ഞാൻ ഉറങ്ങട്ടെ',
    titleEnglish: 'Ini Njan Urangatte',
    author: 'പി. കെ. ബാലകൃഷ്ണൻ',
    authorEnglish: 'P. K. Balakrishnan',
    publisher: 'DC Books',
    genre: 'Epic Retelling',
    publishedDate: '1973',
    coverUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&auto=format&fit=crop&q=80',
    description: 'Draupadi reflects on Karna and the Mahabharata war from the ashes of victory and profound sorrow.'
  },
  {
    isbns: ['9788126477876', '9788126485000'],
    isbn: '9788126477876',
    title: 'മീശ',
    titleEnglish: 'Meesha (Moustache)',
    author: 'എസ്. ഹരീഷ്',
    authorEnglish: 'S. Hareesh',
    publisher: 'DC Books',
    genre: 'Socio-Political Fiction',
    publishedDate: '2018',
    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80',
    description: 'Set in Kuttanad, the epic tale of Vavachan whose imposing moustache defies caste subjugation.'
  },
  {
    isbns: ['9788126400010', '9788171300013'],
    isbn: '9788126400010',
    title: 'ചെമ്മീൻ',
    titleEnglish: 'Chemmeen',
    author: 'തകഴി ശിവശങ്കരപ്പിള്ള',
    authorEnglish: 'Thakazhi Sivasankara Pillai',
    publisher: 'DC Books',
    genre: 'Classic Fiction',
    publishedDate: '1956',
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&auto=format&fit=crop&q=80',
    description: 'The tragic love of Karuthamma and Pareekutty against the mythical traditions of the Arabian sea coast.'
  },
  {
    isbns: ['9788126400027', '9788171300020'],
    isbn: '9788126400027',
    title: 'കയർ',
    titleEnglish: 'Kayar (Coir)',
    author: 'തകഴി ശിവശങ്കരപ്പിള്ള',
    authorEnglish: 'Thakazhi Sivasankara Pillai',
    publisher: 'DC Books',
    genre: 'Epic Chronicle',
    publishedDate: '1978',
    coverUrl: 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=400&auto=format&fit=crop&q=80',
    description: 'An immense 1000-page saga charting two and a half centuries of transformation in the Kuttanad region.'
  },
  {
    isbns: ['9788126400034', '9788171300037'],
    isbn: '9788126400034',
    title: 'തോട്ടിയുടെ മകൻ',
    titleEnglish: "Thottiyude Makan (Scavenger's Son)",
    author: 'തകഴി ശിവശങ്കരപ്പിള്ള',
    authorEnglish: 'Thakazhi Sivasankara Pillai',
    publisher: 'DC Books',
    genre: 'Social Realism',
    publishedDate: '1947',
    coverUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&auto=format&fit=crop&q=80',
    description: 'The powerful generational struggle of night-soil scavengers in the town of Alappuzha.'
  },
  {
    isbns: ['9788126400041', '9788171300044'],
    isbn: '9788126400041',
    title: 'രണ്ടിടങ്ങഴി',
    titleEnglish: 'Randidangazhi (Two Measures of Rice)',
    author: 'തകഴി ശിവശങ്കരപ്പിള്ള',
    authorEnglish: 'Thakazhi Sivasankara Pillai',
    publisher: 'DC Books',
    genre: 'Social Realism',
    publishedDate: '1948',
    coverUrl: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=400&auto=format&fit=crop&q=80',
    description: 'The uprising of impoverished agricultural laborers in the emerald paddy fields of Kuttanad.'
  },
  {
    isbns: ['9788126400713', '9788171300716'],
    isbn: '9788126400713',
    title: 'ഇന്ദുലേഖ',
    titleEnglish: 'Indulekha',
    author: 'ഒ. ചന്തുമേനോൻ',
    authorEnglish: 'O. Chandu Menon',
    publisher: 'DC Books',
    genre: 'First Malayalam Novel',
    publishedDate: '1889',
    coverUrl: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&auto=format&fit=crop&q=80',
    description: 'The first major modern novel in Malayalam championing women\'s education, romance, and cultural transformation.'
  },
  {
    isbns: ['9788126400829', '9788171300822'],
    isbn: '9788126400829',
    title: 'സുന്ദരികളും സുന്ദരന്മാരും',
    titleEnglish: 'Sundarikalum Sundaranmarum',
    author: 'ഉറൂബ് (പി. സി. കുട്ടികൃഷ്ണൻ)',
    authorEnglish: 'Uroob (P. C. Kuttikrishnan)',
    publisher: 'DC Books',
    genre: 'Classic Fiction',
    publishedDate: '1958',
    coverUrl: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=400&auto=format&fit=crop&q=80',
    description: 'Spanning multiple generations, a profound ode to humanity across World War II and the Malabar uprising.'
  },
  {
    isbns: ['9788126400836', '9788171300839'],
    isbn: '9788126400836',
    title: 'ഉമ്മാച്ചു',
    titleEnglish: 'Ummachu',
    author: 'ഉറൂബ് (പി. സി. കുട്ടികൃഷ്ണൻ)',
    authorEnglish: 'Uroob (P. C. Kuttikrishnan)',
    publisher: 'DC Books',
    genre: 'Classic Fiction',
    publishedDate: '1954',
    coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&auto=format&fit=crop&q=80',
    description: 'The intense human drama and retribution surrounding Ummachu, Mayan, and Beeran in Malabar.'
  },
  {
    isbns: ['9788126400935', '9788171300938'],
    isbn: '9788126400935',
    title: 'ദൈവത്തിന്റെ വികൃതികൾ',
    titleEnglish: 'Daivathinte Vikrithikal',
    author: 'എം. മുകുന്ദൻ',
    authorEnglish: 'M. Mukundan',
    publisher: 'DC Books',
    genre: 'Novel (നോവൽ)',
    publishedDate: '1989',
    coverUrl: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400&auto=format&fit=crop&q=80',
    description: 'Magical and heartbreaking life in post-colonial Mahe through Father Alfonso and the magician Kumaran.'
  },
  {
    isbns: ['9788126410200', '9788171301201'],
    isbn: '9788126410200',
    title: 'കേശവദേവിന്റെ അയൽക്കാർ',
    titleEnglish: 'Ayalkkar (The Neighbors)',
    author: 'പി. കേശവദേവ്',
    authorEnglish: 'P. Kesavadev',
    publisher: 'DC Books',
    genre: 'Social Saga',
    publishedDate: '1963',
    coverUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&auto=format&fit=crop&q=80',
    description: 'Sahitya Akademi-winning epic chronicling the rise and fall of Nair, Ezhava, and Christian families in Travancore.'
  },
  {
    isbns: ['9788126410217', '9788171301218'],
    isbn: '9788126410217',
    title: 'ഓടയിൽ നിന്ന്',
    titleEnglish: 'Odayil Ninnu (From the Gutter)',
    author: 'പി. കേശവദേവ്',
    authorEnglish: 'P. Kesavadev',
    publisher: 'DC Books',
    genre: 'Social Realism',
    publishedDate: '1942',
    coverUrl: 'https://images.unsplash.com/photo-1463320726281-696a485928c7?w=400&auto=format&fit=crop&q=80',
    description: 'Pappu, an uncompromising rickshaw puller, dedicates his entire life to raising an orphaned girl.'
  },
  {
    isbns: ['9788126401055', '9788171301058'],
    isbn: '9788126401055',
    title: 'ശബ്ദങ്ങൾ',
    titleEnglish: 'Shabdangal (Voices)',
    author: 'വൈക്കം മുഹമ്മദ് ബഷീർ',
    authorEnglish: 'Vaikom Muhammad Basheer',
    publisher: 'DC Books',
    genre: 'Existential Fiction',
    publishedDate: '1947',
    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80',
    description: 'A revolutionary, raw, and dark dialogue confronting the horrors of disease, war, poverty, and human cruelty.'
  },
  {
    isbns: ['9788126401079', '9788171301072'],
    isbn: '9788126401079',
    title: 'ന്റുപ്പുപ്പാക്കൊരാനേണ്ടാർന്ന്!',
    titleEnglish: "Ntuppuppakkoranendarnnu! (Me Grandad 'Ad an Elephant!)",
    author: 'വൈക്കം മുഹമ്മദ് ബഷീർ',
    authorEnglish: 'Vaikom Muhammad Basheer',
    publisher: 'DC Books',
    genre: 'Social Satire',
    publishedDate: '1951',
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&auto=format&fit=crop&q=80',
    description: 'Kunjupathumma overcomes orthodox family pride and illusions through simple love and education.'
  },
  {
    isbns: ['9788126489008', '9788126489015'],
    isbn: '9788126489008',
    title: 'റാം C/O ആനന്ദി',
    titleEnglish: 'Ram C/O Anandhi',
    author: 'അഖിൽ പി. ധർമ്മജൻ',
    authorEnglish: 'Akhil P. Dharmajan',
    publisher: 'DC Books',
    genre: 'Contemporary Romance',
    publishedDate: '2020',
    coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&auto=format&fit=crop&q=80',
    description: 'The Chennai college romance and emotional journey of Ram and Anandhi that captured the youth of Kerala.'
  }
];

export function findMalayalamBook(queryOrIsbn: string): MalayalamCatalogEntry | undefined {
  if (!queryOrIsbn) return undefined;
  const clean = queryOrIsbn.replace(/[^0-9a-zA-Z\u0D00-\u0D7F]/g, '').toLowerCase().trim();
  if (!clean) return undefined;

  // 1. Direct ISBN match
  const byIsbn = POPULAR_MALAYALAM_BOOKS.find(b => {
    if (b.isbn && b.isbn.replace(/[^0-9X]/gi, '') === clean) return true;
    if (b.isbns && b.isbns.some(i => i.replace(/[^0-9X]/gi, '') === clean)) return true;
    return false;
  });
  if (byIsbn) return byIsbn;

  // 2. Exact or substring title/author match in Malayalam or English
  return POPULAR_MALAYALAM_BOOKS.find(b => {
    const cleanTitle = b.title.replace(/[^0-9a-zA-Z\u0D00-\u0D7F]/g, '').toLowerCase();
    const cleanTitleEng = b.titleEnglish.replace(/[^0-9a-zA-Z\u0D00-\u0D7F]/g, '').toLowerCase();
    const cleanAuthor = b.author.replace(/[^0-9a-zA-Z\u0D00-\u0D7F]/g, '').toLowerCase();
    const cleanAuthorEng = b.authorEnglish.replace(/[^0-9a-zA-Z\u0D00-\u0D7F]/g, '').toLowerCase();

    return (
      cleanTitle.includes(clean) ||
      cleanTitleEng.includes(clean) ||
      clean.includes(cleanTitle) ||
      clean.includes(cleanTitleEng) ||
      cleanAuthor.includes(clean) ||
      cleanAuthorEng.includes(clean)
    );
  });
}
