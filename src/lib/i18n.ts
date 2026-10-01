/**
 * src/lib/i18n.ts
 *
 * All user-facing UI strings for Life Energy.
 * Rules:
 *   - Never hardcode label strings in components. Always use useTranslation().
 *   - When adding a new string, add it to ALL four locales simultaneously.
 *   - Numbers, currency, and hours are formatted by src/lib/format.ts using Intl
 *     and are NOT duplicated here.
 *   - Arabic (ar) is RTL — I18nManager.forceRTL is handled in locale.store.ts.
 */

export type Locale = 'en-US' | 'id' | 'ja' | 'ar';

export const LOCALE_LABELS: Record<Locale, string> = {
  'en-US': 'English',
  'id':    'Bahasa Indonesia',
  'ja':    '日本語',
  'ar':    'العربية',
};

export interface Strings {
  common: {
    loading:   string;
    save:      string;
    saving:    string;
    cancel:    string;
    done:      string;
    close:     string;
    notSet:    string;
    error:     string;
    retry:     string;
    next:      string;
    back:      string;
    hours:     string;
    items:     string; // singular e.g. "1 item" — count formatting done in component
    itemsPlural: string; // plural e.g. "3 items"
  };
  tabs: {
    lens:    string;
    log:     string;
    month:   string;
    profile: string;
  };
  locale: {
    title:    string;
    subtitle: string;
    cta:      string;
  };
  onboarding: {
    welcome: {
      title: string;
      body1: string;
      body2: string;
      cta:   string;
    };
    pay: {
      title:    string;
      netPay:   string;
      period:   string;
      periods: {
        weekly:       string;
        biweekly:     string;
        semimonthly:  string;
        monthly:      string;
      };
      next: string;
    };
    hours: {
      title:   string;
      label:   string;
      hint:    string;
      perWeek: string;
      next:    string;
    };
    commute: {
      title:    string;
      subtitle: string;
      minutes:  string;
      cost:     string;
      next:     string;
    };
    reveal: {
      title:           string;
      nominal:         string;
      real:            string;
      gap:             string;
      perHour:         string;
      gapNote:         string; // contains "{pct}" placeholder
      lifeEnergyNote:  string;
      cta:             string;
      errorNegative:   string;
      goBack:          string;
    };
  };
  lens: {
    noPermissionTitle: string;
    noPermissionBody:  string;
    noPermissionCta:   string;
    noCamera:          string;
    freeze:            string;
    live:              string;
    toggleTorch:       string;
    cameraLabel:       string;
    editPrice:         string;
    lifeEnergy:        string;
    logIt:             string;
    worthItPrompt:     string; // "Worth it?" — section header in LabelSheet
    worthIt:           string;
    notSure:           string;
    notWorthIt:        string;
  };
  log: {
    title:    string;
    empty:    string;
    emptyCta: string;
  };
  month: {
    wallChart:   string;
    crossover:   string;
    income:      string;
    noExpenses:  string;
    item:        string;
    items:       string;
  };
  income: {
    title:             string;
    addButton:         string;
    empty:             string;
    amountLabel:       string;
    sourceLabel:       string;
    sourcePlaceholder: string;
    total:             string;
  };
  review: {
    title:    string;
    subtitle: string;
    q1:       string;
    q2:       string;
    q3:       string;
    verdicts: {
      worth_it:     string;
      not_sure:     string;
      not_worth_it: string;
    };
  };
  wallChart: {
    title:            string;
    subtitle:         string;
    expenses:         string;
    income:           string;
    investmentIncome: string;
    crossoverReached: string;
    noData:           string;
  };
  crossover: {
    title:          string;
    subtitle:       string;
    capitalLabel:   string;
    expensesLabel:  string;
    savingsLabel:   string;
    rateLabel:      string;
    timeToGo:       string;
    projectedDate:  string;
    capitalNeeded:  string;
    disclaimer:     string;
    alreadyCrossed: string;
    enterExpenses:  string;
    yearsAbbr:      string;
    monthsAbbr:     string;
  };
  paywall: {
    title:       string;
    subtitle:    string;
    features: {
      wallChart:      string;
      crossover:      string;
      threeQuestions: string;
      sync:           string;
      categories:     string;
    };
    subscribe:   string;
    restore:     string;
    notNow:      string;
    legal:       string;
    unavailable: string;
  };
  profile: {
    title:               string;
    sectionWage:         string;
    sectionSubscription: string;
    sectionData:         string;
    sectionAbout:        string;
    realWageLabel:       string;
    payPeriodLabel:      string;
    effectiveFromLabel:  string;
    planLabel:           string;
    planFree:            string;
    planPro:             string;
    manageSubscription:  string;
    exportData:          string;
    exporting:           string;
    deleteData:          string;
    deleteTitle:         string;
    deleteBody:          string;
    deleteAction:        string;
    deleteConfirmed:     string;
    bookCredit:          string;
    notFinancialAdvice:  string;
    footer:              string;
  };
}

// ─── English (US) ────────────────────────────────────────────────────────────

const en: Strings = {
  common: {
    loading:      'Loading…',
    save:         'Save',
    saving:       'Saving…',
    cancel:       'Cancel',
    done:         'Done',
    close:        'Close',
    notSet:       'Not set',
    error:        'Something went wrong.',
    retry:        'Retry',
    next:         'Next',
    back:         'Back',
    hours:        'hours',
    items:        'item',
    itemsPlural:  'items',
  },
  tabs: {
    lens:    'Lens',
    log:     'Log',
    month:   'Month',
    profile: 'Profile',
  },
  locale: {
    title:    'Choose your language',
    subtitle: 'You can change this later in Profile.',
    cta:      'Continue',
  },
  onboarding: {
    welcome: {
      title: "What's your real hourly wage?",
      body1: "Most people think they earn more than they do once you count unpaid job time and work-related costs.",
      body2: "We'll calculate your actual wage in 3 quick steps.",
      cta:   'Get started',
    },
    pay: {
      title:   'Your pay',
      netPay:  'Net pay (take-home)',
      period:  'Pay period',
      periods: {
        weekly:      'Weekly',
        biweekly:    'Every 2 weeks',
        semimonthly: 'Twice a month',
        monthly:     'Monthly',
      },
      next: 'Next',
    },
    hours: {
      title:   'Your hours',
      label:   'Paid hours per week',
      hint:    'Hours you are actually paid for.',
      perWeek: 'hours per week',
      next:    'Next',
    },
    commute: {
      title:    'Job costs',
      subtitle: 'Round-trip commute time per day, and monthly costs for transport, lunches, work clothes, etc.',
      minutes:  'Commute (minutes/day)',
      cost:     'Monthly job costs ($)',
      next:     'Next',
    },
    reveal: {
      title:          'Your real wage',
      nominal:        'Nominal',
      real:           'Real',
      gap:            'Gap',
      perHour:        'per hour',
      gapNote:        'Job costs and unpaid time reduce your hourly wage by {pct}%.',
      lifeEnergyNote: 'Every price tag shows how many hours of your life it costs.',
      cta:            "Let's scan prices",
      errorNegative:  'Your job costs exceed your pay. Please review your inputs.',
      goBack:         'Go back',
    },
  },
  lens: {
    noPermissionTitle: 'Camera access needed',
    noPermissionBody:  'Life Energy needs camera access to read price tags.',
    noPermissionCta:   'Grant access',
    noCamera:          'No back camera found.',
    freeze:            'Freeze',
    live:              'Live',
    toggleTorch:       'Toggle torch',
    cameraLabel:       'Price lens camera',
    editPrice:         'Edit price',
    lifeEnergy:        'Life energy',
    logIt:             'Log it',
    worthItPrompt:     'Worth it?',
    worthIt:           'Worth it',
    notSure:           'Not sure',
    notWorthIt:        'Not worth it',
  },
  log: {
    title:    'This month',
    empty:    'No expenses yet.\nScan something with the lens!',
    emptyCta: 'Open Lens',
  },
  month: {
    wallChart:  'Wall Chart →',
    crossover:  'Crossover →',
    income:     'Income →',
    noExpenses: 'No expenses this month.',
    item:       'item',
    items:      'items',
  },
  income: {
    title:             'Income',
    addButton:         'Add income',
    empty:             'No income logged this month.',
    amountLabel:       'Amount ($)',
    sourceLabel:       'Source',
    sourcePlaceholder: 'e.g. Salary, Freelance',
    total:             'Total',
  },
  review: {
    title:    'Three Questions',
    subtitle: 'Review your spending',
    q1:       'Did this spending bring you fulfillment proportional to the life energy spent?',
    q2:       'Was this expense in alignment with your values and life purpose?',
    q3:       "How would this change if you didn't need the money from work?",
    verdicts: {
      worth_it:     'Worth it',
      not_sure:     'Not sure',
      not_worth_it: 'Not worth it',
    },
  },
  wallChart: {
    title:            'Wall Chart',
    subtitle:         'Trailing 36 months',
    expenses:         'Expenses',
    income:           'Income',
    investmentIncome: 'Investment income',
    crossoverReached: 'Crossover reached:',
    noData:           'No data yet. Log expenses and income to build your Wall Chart.',
  },
  crossover: {
    title:          'Crossover Projection',
    subtitle:       'The point where investment income covers your expenses — financial independence.',
    capitalLabel:   'Invested capital ($)',
    expensesLabel:  'Monthly expenses ($)',
    savingsLabel:   'Monthly savings ($)',
    rateLabel:      'Annual return rate (%)',
    timeToGo:       'Time to crossover',
    projectedDate:  'Projected date',
    capitalNeeded:  'Capital needed',
    disclaimer:     'Estimates only. Not financial advice. Returns not guaranteed.',
    alreadyCrossed: 'Already crossed over!',
    enterExpenses:  'Enter your monthly expenses above to see a projection.',
    yearsAbbr:      'yr',
    monthsAbbr:     'mo',
  },
  paywall: {
    title:    'Upgrade to Life Energy Pro',
    subtitle: 'Unlock v2 features for a complete picture of your financial independence journey.',
    features: {
      wallChart:      'Wall Chart — 36-month income vs expenses view',
      crossover:      'Crossover Projection — see when investment income covers life',
      threeQuestions: 'Three Questions monthly review per category',
      sync:           'Supabase cloud sync across devices',
      categories:     'Spending categories with custom names',
    },
    subscribe:   'Subscribe',
    restore:     'Restore purchases',
    notNow:      'Not now',
    legal:       "Subscriptions auto-renew unless cancelled. Manage in your device's subscription settings. Not financial advice.",
    unavailable: 'Purchases are not available in this build. Install the production build to subscribe.',
  },
  profile: {
    title:               'Profile',
    sectionWage:         'REAL WAGE',
    sectionSubscription: 'SUBSCRIPTION',
    sectionData:         'DATA',
    sectionAbout:        'ABOUT',
    realWageLabel:       'Real hourly wage',
    payPeriodLabel:      'Pay period',
    effectiveFromLabel:  'Effective from',
    planLabel:           'Plan',
    planFree:            'Free',
    planPro:             'Pro',
    manageSubscription:  'Manage subscription',
    exportData:          'Export my data',
    exporting:           'Exporting…',
    deleteData:          'Delete all data',
    deleteTitle:         'Delete all data',
    deleteBody:          'This will permanently delete all your expenses, income, and profile data. This cannot be undone.',
    deleteAction:        'Delete',
    deleteConfirmed:     'All local data has been removed.',
    bookCredit:          'Based on Your Money or Your Life',
    notFinancialAdvice:  'Not financial advice',
    footer:              'Life Energy · All calculations run on-device. Nothing leaves your phone.',
  },
};

// ─── Bahasa Indonesia ─────────────────────────────────────────────────────────

const id: Strings = {
  common: {
    loading:     'Memuat…',
    save:        'Simpan',
    saving:      'Menyimpan…',
    cancel:      'Batal',
    done:        'Selesai',
    close:       'Tutup',
    notSet:      'Belum diatur',
    error:       'Terjadi kesalahan.',
    retry:       'Coba lagi',
    next:        'Lanjut',
    back:        'Kembali',
    hours:       'jam',
    items:       'item',
    itemsPlural: 'item',
  },
  tabs: {
    lens:    'Lensa',
    log:     'Catatan',
    month:   'Bulanan',
    profile: 'Profil',
  },
  locale: {
    title:    'Pilih bahasa',
    subtitle: 'Anda dapat mengubah ini nanti di Profil.',
    cta:      'Lanjutkan',
  },
  onboarding: {
    welcome: {
      title: 'Berapa upah nyata per jammu?',
      body1: 'Kebanyakan orang mengira penghasilan mereka lebih besar setelah memperhitungkan waktu tidak dibayar dan biaya pekerjaan.',
      body2: 'Kami akan menghitung upah sebenarnya dalam 3 langkah cepat.',
      cta:   'Mulai',
    },
    pay: {
      title:   'Gaji Anda',
      netPay:  'Gaji bersih (take-home)',
      period:  'Periode gaji',
      periods: {
        weekly:      'Mingguan',
        biweekly:    'Setiap 2 minggu',
        semimonthly: 'Dua kali sebulan',
        monthly:     'Bulanan',
      },
      next: 'Lanjut',
    },
    hours: {
      title:   'Jam kerja Anda',
      label:   'Jam kerja berbayar per minggu',
      hint:    'Jam yang benar-benar Anda dibayar.',
      perWeek: 'jam per minggu',
      next:    'Lanjut',
    },
    commute: {
      title:    'Biaya pekerjaan',
      subtitle: 'Waktu perjalanan pulang-pergi per hari, dan biaya bulanan untuk transportasi, makan siang, pakaian kerja, dll.',
      minutes:  'Perjalanan (menit/hari)',
      cost:     'Biaya pekerjaan bulanan',
      next:     'Lanjut',
    },
    reveal: {
      title:          'Upah nyata Anda',
      nominal:        'Nominal',
      real:           'Nyata',
      gap:            'Selisih',
      perHour:        'per jam',
      gapNote:        'Biaya pekerjaan dan waktu tidak berbayar mengurangi upah per jam Anda sebesar {pct}%.',
      lifeEnergyNote: 'Setiap label harga menunjukkan berapa jam hidup Anda yang diperlukan.',
      cta:            'Mari pindai harga',
      errorNegative:  'Biaya pekerjaan melebihi gaji Anda. Periksa kembali input Anda.',
      goBack:         'Kembali',
    },
  },
  lens: {
    noPermissionTitle: 'Akses kamera diperlukan',
    noPermissionBody:  'Life Energy membutuhkan akses kamera untuk membaca label harga.',
    noPermissionCta:   'Izinkan akses',
    noCamera:          'Kamera belakang tidak ditemukan.',
    freeze:            'Bekukan',
    live:              'Langsung',
    toggleTorch:       'Nyalakan lampu',
    cameraLabel:       'Kamera lensa harga',
    editPrice:         'Edit harga',
    lifeEnergy:        'Energi hidup',
    logIt:             'Catat',
    worthItPrompt:     'Sepadan?',
    worthIt:           'Sepadan',
    notSure:           'Tidak yakin',
    notWorthIt:        'Tidak sepadan',
  },
  log: {
    title:    'Bulan ini',
    empty:    'Belum ada pengeluaran.\nPindai sesuatu dengan lensa!',
    emptyCta: 'Buka Lensa',
  },
  month: {
    wallChart:  'Grafik Dinding →',
    crossover:  'Titik Impas →',
    income:     'Penghasilan →',
    noExpenses: 'Tidak ada pengeluaran bulan ini.',
    item:       'item',
    items:      'item',
  },
  income: {
    title:             'Penghasilan',
    addButton:         'Tambah penghasilan',
    empty:             'Belum ada penghasilan dicatat bulan ini.',
    amountLabel:       'Jumlah',
    sourceLabel:       'Sumber',
    sourcePlaceholder: 'mis. Gaji, Lepas',
    total:             'Total',
  },
  review: {
    title:    'Tiga Pertanyaan',
    subtitle: 'Tinjau pengeluaran Anda',
    q1:       'Apakah pengeluaran ini memberikan kepuasan sebanding dengan energi hidup yang dikeluarkan?',
    q2:       'Apakah pengeluaran ini sesuai dengan nilai dan tujuan hidup Anda?',
    q3:       'Bagaimana ini akan berubah jika Anda tidak membutuhkan uang dari pekerjaan?',
    verdicts: {
      worth_it:     'Sepadan',
      not_sure:     'Tidak yakin',
      not_worth_it: 'Tidak sepadan',
    },
  },
  wallChart: {
    title:            'Grafik Dinding',
    subtitle:         '36 bulan terakhir',
    expenses:         'Pengeluaran',
    income:           'Penghasilan',
    investmentIncome: 'Pendapatan investasi',
    crossoverReached: 'Titik impas tercapai:',
    noData:           'Belum ada data. Catat pengeluaran dan penghasilan untuk membangun Grafik Dinding.',
  },
  crossover: {
    title:          'Proyeksi Titik Impas',
    subtitle:       'Titik di mana pendapatan investasi menutupi pengeluaran — kebebasan finansial.',
    capitalLabel:   'Modal yang diinvestasikan',
    expensesLabel:  'Pengeluaran bulanan',
    savingsLabel:   'Tabungan bulanan',
    rateLabel:      'Tingkat pengembalian tahunan (%)',
    timeToGo:       'Waktu menuju titik impas',
    projectedDate:  'Tanggal perkiraan',
    capitalNeeded:  'Modal yang diperlukan',
    disclaimer:     'Hanya perkiraan. Bukan saran keuangan. Pengembalian tidak dijamin.',
    alreadyCrossed: 'Sudah melampaui titik impas!',
    enterExpenses:  'Masukkan pengeluaran bulanan Anda di atas untuk melihat proyeksi.',
    yearsAbbr:      'thn',
    monthsAbbr:     'bln',
  },
  paywall: {
    title:    'Tingkatkan ke Life Energy Pro',
    subtitle: 'Buka fitur v2 untuk gambaran lengkap perjalanan kebebasan finansial Anda.',
    features: {
      wallChart:      'Grafik Dinding — tampilan 36 bulan penghasilan vs pengeluaran',
      crossover:      'Proyeksi Titik Impas — lihat kapan pendapatan investasi menutupi biaya hidup',
      threeQuestions: 'Ulasan bulanan Tiga Pertanyaan per kategori',
      sync:           'Sinkronisasi cloud Supabase di semua perangkat',
      categories:     'Kategori pengeluaran dengan nama kustom',
    },
    subscribe:   'Berlangganan',
    restore:     'Pulihkan pembelian',
    notNow:      'Nanti saja',
    legal:       'Langganan diperpanjang otomatis kecuali dibatalkan. Kelola di pengaturan langganan perangkat Anda. Bukan saran keuangan.',
    unavailable: 'Pembelian tidak tersedia di build ini. Instal build produksi untuk berlangganan.',
  },
  profile: {
    title:               'Profil',
    sectionWage:         'UPAH NYATA',
    sectionSubscription: 'LANGGANAN',
    sectionData:         'DATA',
    sectionAbout:        'TENTANG',
    realWageLabel:       'Upah nyata per jam',
    payPeriodLabel:      'Periode gaji',
    effectiveFromLabel:  'Berlaku sejak',
    planLabel:           'Paket',
    planFree:            'Gratis',
    planPro:             'Pro',
    manageSubscription:  'Kelola langganan',
    exportData:          'Ekspor data saya',
    exporting:           'Mengekspor…',
    deleteData:          'Hapus semua data',
    deleteTitle:         'Hapus semua data',
    deleteBody:          'Ini akan menghapus permanen semua pengeluaran, penghasilan, dan data profil Anda. Tindakan ini tidak dapat dibatalkan.',
    deleteAction:        'Hapus',
    deleteConfirmed:     'Semua data lokal telah dihapus.',
    bookCredit:          'Berdasarkan Your Money or Your Life',
    notFinancialAdvice:  'Bukan saran keuangan',
    footer:              'Life Energy · Semua kalkulasi berjalan di perangkat. Tidak ada yang meninggalkan ponsel Anda.',
  },
};

// ─── Japanese ─────────────────────────────────────────────────────────────────

const ja: Strings = {
  common: {
    loading:     '読み込み中…',
    save:        '保存',
    saving:      '保存中…',
    cancel:      'キャンセル',
    done:        '完了',
    close:       '閉じる',
    notSet:      '未設定',
    error:       'エラーが発生しました。',
    retry:       '再試行',
    next:        '次へ',
    back:        '戻る',
    hours:       '時間',
    items:       '件',
    itemsPlural: '件',
  },
  tabs: {
    lens:    'レンズ',
    log:     '記録',
    month:   '月次',
    profile: 'プロフィール',
  },
  locale: {
    title:    '言語を選んでください',
    subtitle: '後でプロフィールから変更できます。',
    cta:      '続ける',
  },
  onboarding: {
    welcome: {
      title: 'あなたの本当の時給は？',
      body1: '多くの人は、無給の労働時間や仕事関連のコストを考慮すると、実際には思ったより稼いでいないことに気づきます。',
      body2: '3つの簡単なステップで実際の時給を計算します。',
      cta:   'はじめる',
    },
    pay: {
      title:   '給与',
      netPay:  '手取り収入',
      period:  '給与サイクル',
      periods: {
        weekly:      '毎週',
        biweekly:    '隔週',
        semimonthly: '月2回',
        monthly:     '月1回',
      },
      next: '次へ',
    },
    hours: {
      title:   '労働時間',
      label:   '週あたりの有給労働時間',
      hint:    '実際に給与が支払われる時間。',
      perWeek: '時間/週',
      next:    '次へ',
    },
    commute: {
      title:    '仕事関連費用',
      subtitle: '1日の往復通勤時間、および交通費・昼食代・仕事用衣服代などの月次費用。',
      minutes:  '通勤時間（分/日）',
      cost:     '月次仕事関連費用',
      next:     '次へ',
    },
    reveal: {
      title:          'あなたの本当の時給',
      nominal:        '名目',
      real:           '実質',
      gap:            '差額',
      perHour:        '時給',
      gapNote:        '仕事のコストと無給時間により、時給が{pct}%減少します。',
      lifeEnergyNote: '価格タグはあなたの人生の何時間分かを示しています。',
      cta:            '価格をスキャンしよう',
      errorNegative:  '仕事関連費用が給与を上回っています。入力内容をご確認ください。',
      goBack:         '戻る',
    },
  },
  lens: {
    noPermissionTitle: 'カメラのアクセスが必要です',
    noPermissionBody:  'Life Energyが価格タグを読み取るためにカメラのアクセスが必要です。',
    noPermissionCta:   'アクセスを許可',
    noCamera:          'バックカメラが見つかりません。',
    freeze:            '静止',
    live:              'ライブ',
    toggleTorch:       'ライト切替',
    cameraLabel:       '価格レンズカメラ',
    editPrice:         '価格を編集',
    lifeEnergy:        'ライフエネルギー',
    logIt:             '記録する',
    worthItPrompt:     '価値がありますか？',
    worthIt:           '価値あり',
    notSure:           '不明',
    notWorthIt:        '価値なし',
  },
  log: {
    title:    '今月',
    empty:    'まだ支出がありません。\nレンズで何かスキャンしてみましょう！',
    emptyCta: 'レンズを開く',
  },
  month: {
    wallChart:  'ウォールチャート →',
    crossover:  '交差点 →',
    income:     '収入 →',
    noExpenses: '今月の支出はありません。',
    item:       '件',
    items:      '件',
  },
  income: {
    title:             '収入',
    addButton:         '収入を追加',
    empty:             '今月は収入が記録されていません。',
    amountLabel:       '金額',
    sourceLabel:       '収入源',
    sourcePlaceholder: '例：給与、フリーランス',
    total:             '合計',
  },
  review: {
    title:    '3つの質問',
    subtitle: '支出を振り返る',
    q1:       'この支出は、費やしたライフエネルギーに見合った充実感をもたらしましたか？',
    q2:       'この支出はあなたの価値観と人生の目的に沿っていましたか？',
    q3:       '仕事からお金を必要としなければ、これはどのように変わるでしょうか？',
    verdicts: {
      worth_it:     '価値あり',
      not_sure:     '不明',
      not_worth_it: '価値なし',
    },
  },
  wallChart: {
    title:            'ウォールチャート',
    subtitle:         '過去36ヶ月',
    expenses:         '支出',
    income:           '収入',
    investmentIncome: '投資収益',
    crossoverReached: '交差点到達:',
    noData:           'データがまだありません。支出と収入を記録してウォールチャートを構築しましょう。',
  },
  crossover: {
    title:          '交差点予測',
    subtitle:       '投資収益が支出をカバーする時点 — 経済的自由。',
    capitalLabel:   '投資資本（円）',
    expensesLabel:  '月次支出（円）',
    savingsLabel:   '月次貯蓄（円）',
    rateLabel:      '年間利回り（%）',
    timeToGo:       '交差点まであと',
    projectedDate:  '予測日',
    capitalNeeded:  '必要資本',
    disclaimer:     '推定値のみ。投資アドバイスではありません。リターンは保証されません。',
    alreadyCrossed: 'すでに交差点を超えています！',
    enterExpenses:  '上記に月次支出を入力して予測を確認してください。',
    yearsAbbr:      '年',
    monthsAbbr:     'ヶ月',
  },
  paywall: {
    title:    'Life Energy Proにアップグレード',
    subtitle: 'v2機能を解放して、経済的自由への旅の全体像を把握しましょう。',
    features: {
      wallChart:      'ウォールチャート — 36ヶ月の収入vs支出ビュー',
      crossover:      '交差点予測 — 投資収益が生活費をカバーする時期を確認',
      threeQuestions: 'カテゴリ別月次3つの質問レビュー',
      sync:           'Supabaseクラウド同期（全デバイス対応）',
      categories:     'カスタム名の支出カテゴリ',
    },
    subscribe:   '購読する',
    restore:     '購入を復元',
    notNow:      'あとで',
    legal:       'サブスクリプションはキャンセルするまで自動更新されます。デバイスのサブスクリプション設定で管理してください。投資アドバイスではありません。',
    unavailable: 'このビルドでは購入できません。本番ビルドをインストールして購読してください。',
  },
  profile: {
    title:               'プロフィール',
    sectionWage:         '実質賃金',
    sectionSubscription: 'サブスクリプション',
    sectionData:         'データ',
    sectionAbout:        'について',
    realWageLabel:       '実質時給',
    payPeriodLabel:      '給与サイクル',
    effectiveFromLabel:  '適用開始日',
    planLabel:           'プラン',
    planFree:            '無料',
    planPro:             'Pro',
    manageSubscription:  'サブスクリプションを管理',
    exportData:          'データをエクスポート',
    exporting:           'エクスポート中…',
    deleteData:          'すべてのデータを削除',
    deleteTitle:         'すべてのデータを削除',
    deleteBody:          'これにより、すべての支出、収入、プロフィールデータが完全に削除されます。この操作は取り消せません。',
    deleteAction:        '削除',
    deleteConfirmed:     'すべてのローカルデータが削除されました。',
    bookCredit:          'Your Money or Your Lifeより',
    notFinancialAdvice:  '投資アドバイスではありません',
    footer:              'Life Energy · すべての計算はデバイス上で実行されます。何もあなたの電話から出ません。',
  },
};

// ─── Arabic ───────────────────────────────────────────────────────────────────
// RTL language — I18nManager.forceRTL(true) is applied via locale.store.ts

const ar: Strings = {
  common: {
    loading:     'جارٍ التحميل…',
    save:        'حفظ',
    saving:      'جارٍ الحفظ…',
    cancel:      'إلغاء',
    done:        'تم',
    close:       'إغلاق',
    notSet:      'غير محدد',
    error:       'حدث خطأ ما.',
    retry:       'إعادة المحاولة',
    next:        'التالي',
    back:        'رجوع',
    hours:       'ساعات',
    items:       'عنصر',
    itemsPlural: 'عناصر',
  },
  tabs: {
    lens:    'العدسة',
    log:     'السجل',
    month:   'الشهر',
    profile: 'الملف الشخصي',
  },
  locale: {
    title:    'اختر لغتك',
    subtitle: 'يمكنك تغيير هذا لاحقاً في الملف الشخصي.',
    cta:      'متابعة',
  },
  onboarding: {
    welcome: {
      title: 'ما هو أجرك الحقيقي بالساعة؟',
      body1: 'معظم الناس يعتقدون أنهم يكسبون أكثر مما يكسبون فعلاً عند احتساب ساعات العمل غير المدفوعة وتكاليف العمل.',
      body2: 'سنحسب أجرك الفعلي في 3 خطوات سريعة.',
      cta:   'ابدأ',
    },
    pay: {
      title:   'راتبك',
      netPay:  'الراتب الصافي',
      period:  'فترة الرواتب',
      periods: {
        weekly:      'أسبوعي',
        biweekly:    'كل أسبوعين',
        semimonthly: 'مرتين في الشهر',
        monthly:     'شهري',
      },
      next: 'التالي',
    },
    hours: {
      title:   'ساعات عملك',
      label:   'ساعات العمل المدفوعة في الأسبوع',
      hint:    'الساعات التي تُدفع لك فعلاً.',
      perWeek: 'ساعة أسبوعياً',
      next:    'التالي',
    },
    commute: {
      title:    'تكاليف العمل',
      subtitle: 'وقت التنقل ذهاباً وإياباً يومياً، والتكاليف الشهرية للمواصلات والغداء وملابس العمل وغيرها.',
      minutes:  'وقت التنقل (دقيقة/يوم)',
      cost:     'تكاليف العمل الشهرية',
      next:     'التالي',
    },
    reveal: {
      title:          'أجرك الحقيقي',
      nominal:        'الاسمي',
      real:           'الحقيقي',
      gap:            'الفارق',
      perHour:        'في الساعة',
      gapNote:        'تكاليف العمل والوقت غير المدفوع تقلل أجرك بالساعة بنسبة {pct}%.',
      lifeEnergyNote: 'كل بطاقة سعر تُظهر عدد ساعات حياتك التي تكلفها.',
      cta:            'لنبدأ بمسح الأسعار',
      errorNegative:  'تكاليف عملك تتجاوز راتبك. يرجى مراجعة مدخلاتك.',
      goBack:         'رجوع',
    },
  },
  lens: {
    noPermissionTitle: 'مطلوب الوصول إلى الكاميرا',
    noPermissionBody:  'يحتاج Life Energy إلى الوصول إلى الكاميرا لقراءة بطاقات الأسعار.',
    noPermissionCta:   'منح الإذن',
    noCamera:          'لم يتم العثور على كاميرا خلفية.',
    freeze:            'تجميد',
    live:              'مباشر',
    toggleTorch:       'تبديل الضوء',
    cameraLabel:       'كاميرا عدسة الأسعار',
    editPrice:         'تعديل السعر',
    lifeEnergy:        'طاقة الحياة',
    logIt:             'تسجيل',
    worthItPrompt:     'هل يستحق؟',
    worthIt:           'يستحق',
    notSure:           'غير متأكد',
    notWorthIt:        'لا يستحق',
  },
  log: {
    title:    'هذا الشهر',
    empty:    'لا توجد مصروفات حتى الآن.\nامسح شيئاً بالعدسة!',
    emptyCta: 'فتح العدسة',
  },
  month: {
    wallChart:  'مخطط الجدار ←',
    crossover:  'نقطة التقاطع ←',
    income:     'الدخل ←',
    noExpenses: 'لا توجد مصروفات هذا الشهر.',
    item:       'عنصر',
    items:      'عناصر',
  },
  income: {
    title:             'الدخل',
    addButton:         'إضافة دخل',
    empty:             'لم يتم تسجيل أي دخل هذا الشهر.',
    amountLabel:       'المبلغ',
    sourceLabel:       'المصدر',
    sourcePlaceholder: 'مثال: راتب، عمل حر',
    total:             'الإجمالي',
  },
  review: {
    title:    'الأسئلة الثلاثة',
    subtitle: 'راجع إنفاقك',
    q1:       'هل أعطاك هذا الإنفاق رضاً يتناسب مع طاقة الحياة المُنفقة؟',
    q2:       'هل كان هذا الإنفاق متوافقاً مع قيمك وهدف حياتك؟',
    q3:       'كيف سيتغير هذا لو لم تكن بحاجة إلى المال من العمل؟',
    verdicts: {
      worth_it:     'يستحق',
      not_sure:     'غير متأكد',
      not_worth_it: 'لا يستحق',
    },
  },
  wallChart: {
    title:            'مخطط الجدار',
    subtitle:         'آخر 36 شهراً',
    expenses:         'المصروفات',
    income:           'الدخل',
    investmentIncome: 'دخل الاستثمار',
    crossoverReached: 'تم الوصول لنقطة التقاطع:',
    noData:           'لا توجد بيانات حتى الآن. سجّل المصروفات والدخل لبناء مخطط الجدار.',
  },
  crossover: {
    title:          'توقعات نقطة التقاطع',
    subtitle:       'النقطة التي يغطي فيها دخل الاستثمار مصروفاتك — الاستقلال المالي.',
    capitalLabel:   'رأس المال المستثمر',
    expensesLabel:  'المصروفات الشهرية',
    savingsLabel:   'المدخرات الشهرية',
    rateLabel:      'معدل العائد السنوي (%)',
    timeToGo:       'الوقت حتى نقطة التقاطع',
    projectedDate:  'التاريخ المتوقع',
    capitalNeeded:  'رأس المال المطلوب',
    disclaimer:     'تقديرات فقط. ليست نصيحة مالية. العوائد غير مضمونة.',
    alreadyCrossed: 'لقد تجاوزت نقطة التقاطع بالفعل!',
    enterExpenses:  'أدخل مصروفاتك الشهرية أعلاه لعرض التوقعات.',
    yearsAbbr:      'سنة',
    monthsAbbr:     'شهر',
  },
  paywall: {
    title:    'الترقية إلى Life Energy Pro',
    subtitle: 'افتح ميزات v2 للحصول على صورة كاملة عن رحلة استقلالك المالي.',
    features: {
      wallChart:      'مخطط الجدار — عرض الدخل مقابل المصروفات لـ 36 شهراً',
      crossover:      'توقعات نقطة التقاطع — اعرف متى يغطي دخل الاستثمار نفقات حياتك',
      threeQuestions: 'مراجعة الأسئلة الثلاثة الشهرية لكل فئة',
      sync:           'المزامنة السحابية عبر Supabase على جميع الأجهزة',
      categories:     'فئات الإنفاق بأسماء مخصصة',
    },
    subscribe:   'اشترك',
    restore:     'استعادة المشتريات',
    notNow:      'ليس الآن',
    legal:       'تتجدد الاشتراكات تلقائياً ما لم يتم إلغاؤها. إدارة اشتراكاتك في إعدادات الجهاز. ليست نصيحة مالية.',
    unavailable: 'المشتريات غير متاحة في هذا الإصدار. قم بتثبيت الإصدار الإنتاجي للاشتراك.',
  },
  profile: {
    title:               'الملف الشخصي',
    sectionWage:         'الأجر الحقيقي',
    sectionSubscription: 'الاشتراك',
    sectionData:         'البيانات',
    sectionAbout:        'حول',
    realWageLabel:       'الأجر الحقيقي بالساعة',
    payPeriodLabel:      'فترة الرواتب',
    effectiveFromLabel:  'ساري منذ',
    planLabel:           'الخطة',
    planFree:            'مجاني',
    planPro:             'Pro',
    manageSubscription:  'إدارة الاشتراك',
    exportData:          'تصدير بياناتي',
    exporting:           'جارٍ التصدير…',
    deleteData:          'حذف جميع البيانات',
    deleteTitle:         'حذف جميع البيانات',
    deleteBody:          'سيؤدي هذا إلى حذف دائم لجميع مصروفاتك ودخلك وبيانات ملفك الشخصي. لا يمكن التراجع عن هذا الإجراء.',
    deleteAction:        'حذف',
    deleteConfirmed:     'تمت إزالة جميع البيانات المحلية.',
    bookCredit:          'مستوحى من Your Money or Your Life',
    notFinancialAdvice:  'ليست نصيحة مالية',
    footer:              'Life Energy · جميع الحسابات تعمل على الجهاز. لا شيء يغادر هاتفك.',
  },
};

// ─── Translation map ──────────────────────────────────────────────────────────

export const translations: Record<Locale, Strings> = {
  'en-US': en,
  'id':    id,
  'ja':    ja,
  'ar':    ar,
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
// Import is deferred so this file stays free of React/store deps at the top level.

import { useLocaleStore } from '@/presentation/stores/locale.store';

export function useTranslation(): Strings {
  const locale = useLocaleStore((s) => s.locale);
  return translations[locale];
}
