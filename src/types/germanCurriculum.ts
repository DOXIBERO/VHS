export interface GermanChallenge {
  id: string;
  germanText: string;
  phonetic: string;
  darijaMeaning: string;
  darijaHint: string;
  soundHighlight: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  targetSound: string;
}

export interface DrinkLesson {
  drinkId: string;
  drinkNameAr: string;
  drinkIcon: string;
  titleAr: string;
  descriptionAr: string;
  challenges: GermanChallenge[];
}

export const GERMAN_CURRICULUM: DrinkLesson[] = [
  {
    drinkId: 'atay',
    drinkNameAr: 'أتاي مشحر بالنعناع',
    drinkIcon: '🍵',
    titleAr: 'الحروف والأصوات الألمانية الأساسية (A0 Core Sounds)',
    descriptionAr: 'كل جغمة صحيحة كتنقص من الكاس. غلطتي؟ الكاراج كيعمر ليك الكاس (+2 جغيمات عقوبة)!',
    challenges: [
      {
        id: 'c1_ich',
        germanText: 'Ich',
        phonetic: 'إيش [ɪç]',
        darijaMeaning: 'أنا',
        darijaHint: 'حرف CH كيتنطق خفيف بزاف بين الشين والخاء، حط لسانك لتحت وخرج النفس.',
        soundHighlight: 'CH',
        category: 'أصوات الحلق',
        difficulty: 'easy',
        targetSound: 'ich',
      },
      {
        id: 'c2_tschuess',
        germanText: 'Tschüss',
        phonetic: 'تشوس [tʃʏs]',
        darijaMeaning: 'بسلامة / إلى اللقاء',
        darijaHint: 'حرف Ü: جمع فمك بحال باغي تصفر (بحال O) ولكن نطق "إي" (i).',
        soundHighlight: 'Ü',
        category: 'أصوات الـ Umlaut',
        difficulty: 'medium',
        targetSound: 'tschüss',
      },
      {
        id: 'c3_zimmer',
        germanText: 'Zimmer',
        phonetic: 'تْسيمَر [ˈtsɪmɐ]',
        darijaMeaning: 'بيت / غرفة',
        darijaHint: 'حرف Z ديما كيتنطق بحال TS (تاء + سين) ماشي زاي عادية!',
        soundHighlight: 'Z',
        category: 'قواعد النطق',
        difficulty: 'easy',
        targetSound: 'zimmer',
      },
      {
        id: 'c4_schoen',
        germanText: 'Schön',
        phonetic: 'شُون [ʃøːn]',
        darijaMeaning: 'زوين / جميل',
        darijaHint: 'حرف Ö: دور فمك بحال O وقول "إي". و SCH كتنطق شين مفخمة.',
        soundHighlight: 'Ö & SCH',
        category: 'أصوات الـ Umlaut',
        difficulty: 'medium',
        targetSound: 'schön',
      },
      {
        id: 'c5_danke',
        germanText: 'Danke',
        phonetic: 'دانْكِه [ˈdaŋkə]',
        darijaMeaning: 'شكراً',
        darijaHint: 'الراء والأصوات الأخيرة كتنطق واضحة وخفيفة، مع إمالة خفيفة للـ E.',
        soundHighlight: 'E في الآخر',
        category: 'كلمات الشكر',
        difficulty: 'easy',
        targetSound: 'danke',
      },
      {
        id: 'c6_kaese',
        germanText: 'Käse',
        phonetic: 'كيزِه [ˈkɛːzə]',
        darijaMeaning: 'فرماج / جبن',
        darijaHint: 'حرف Ä كيتنطق بحال "È" الفرنسية المفتوحة أو ألف ممالة.',
        soundHighlight: 'Ä',
        category: 'أصوات الـ Umlaut',
        difficulty: 'medium',
        targetSound: 'käse',
      },
      {
        id: 'c7_wasser',
        germanText: 'Wasser',
        phonetic: 'فاسَر [ˈvasɐ]',
        darijaMeaning: 'الما',
        darijaHint: 'حرف W في الألمانية ديما كيتنطق V (فاء مثلثة).',
        soundHighlight: 'W = V',
        category: 'قواعد النطق',
        difficulty: 'easy',
        targetSound: 'wasser',
      },
      {
        id: 'c8_bitte',
        germanText: 'Bitte',
        phonetic: 'بيتِه [ˈbɪtə]',
        darijaMeaning: 'عفاك / من فضلك',
        darijaHint: 'حرف T مشدد، وحرف E فالأخير خفيف وسريع.',
        soundHighlight: 'TT',
        category: 'أدب الحديث',
        difficulty: 'easy',
        targetSound: 'bitte',
      },
    ],
  },
  {
    drinkId: 'qahwa',
    drinkNameAr: 'قهوة كحلة معصرة',
    drinkIcon: '☕',
    titleAr: 'الأرقام وحساب الكاراج (Die Zahlen 0-20)',
    descriptionAr: 'حساب الصرف وثمن القهوة بالألمانية. غلطتي فالحساب؟ خود عقوبة!',
    challenges: [
      {
        id: 'c_eins',
        germanText: 'Eins',
        phonetic: 'آيْنْس [aɪ̯ns]',
        darijaMeaning: 'واحد (1)',
        darijaHint: 'حرفي EI كيتنطقو "آي" (بحال عين).',
        soundHighlight: 'EI = AY',
        category: 'الأرقام',
        difficulty: 'easy',
        targetSound: 'eins',
      },
      {
        id: 'c_zwei',
        germanText: 'Zwei',
        phonetic: 'تْسْفاي [tsvaɪ̯]',
        darijaMeaning: 'جوج (2)',
        darijaHint: 'Z = TS و W = V => كتنطق "تسفاي".',
        soundHighlight: 'ZW = TSV',
        category: 'الأرقام',
        difficulty: 'medium',
        targetSound: 'zwei',
      },
      {
        id: 'c_drei',
        germanText: 'Drei',
        phonetic: 'دْغاي [dʁaɪ̯]',
        darijaMeaning: 'تلاتة (3)',
        darijaHint: 'الراء كتنطق غين خفيفة فالحلق.',
        soundHighlight: 'R حلقية',
        category: 'الأرقام',
        difficulty: 'easy',
        targetSound: 'drei',
      },
      {
        id: 'c_zehn',
        germanText: 'Zehn',
        phonetic: 'تْسِين [tseːn]',
        darijaMeaning: 'عشرة (10)',
        darijaHint: 'حرف H مورا الحرف الصوتي كيطول الصوت وما كيتنطقش.',
        soundHighlight: 'H الممدودة',
        category: 'الأرقام',
        difficulty: 'medium',
        targetSound: 'zehn',
      },
    ],
  },
];
