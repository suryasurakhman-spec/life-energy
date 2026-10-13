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
    choice: {
      title: string;
      body:  string;
      quick: string;
      full:  string;
    };
    costs: {
      title:         string;
      subtitle:      string;
      monthlyCosts:  string;
      meals:         string;
      clothes:       string;
      childcare:     string;
      decompression: string;
      health:        string;
      weeklyHours:   string;
      gettingReady:  string;
      decompressing: string;
      overtime:      string;
      next:          string;
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
  auth: {
    title: string;
    body: string;
    emailLabel: string;
    emailPlaceholder: string;
    send: string;
    sending: string;
    invalidEmail: string;
    sentTitle: string;
    sentBody: string; // contains "{email}" placeholder
    resend: string;
    useDifferent: string;
    sendFailed: string;
    linkFailed: string;
    completing: string;
    section: string;
    signOut: string;
    continueWithGoogle: string;
    or: string;
    socialFailed: string;
  };
  lens: {
    noPermissionTitle: string;
    noPermissionBody:  string;
    noPermissionCta:   string;
    noCameraTitle:     string;
    noCameraBody:      string;
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
    typePriceManually: string;
    typePrice:         string;
    notHomeCurrency:   string; // contains "{currency}" placeholder
    rateAsOf:          string; // contains "{date}" placeholder
  };
  log: {
    title:    string;
    empty:    string;
    emptyCta: string;
    addExpense: string;
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
    currencyLabel:       string;
    currencyTitle:       string;
    currencyBody:        string;
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
    exportFormatTitle:   string;
    exportFormatBody:    string;
    exportJson:          string;
    exportCsv:           string;
    exportFailed:        string;
    deleteFailed:        string;
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
      title:    'Your commute',
      subtitle: 'Round-trip time to work each day, and what getting there costs each month.',
      minutes:  'Commute (minutes/day)',
      cost:     'Commute cost per month',
      next:     'Next',
    },
    choice: {
      title: 'Add more job costs?',
      body:  'Work clothes, meals at work, childcare and time spent getting ready all lower your real wage. You can add them now or later in Profile.',
      quick: 'Good enough for now',
      full:  'Add more job costs',
    },
    costs: {
      title:         'More job costs',
      subtitle:      'Only what you spend or give because of the job. Leave a field at 0 if it does not apply.',
      monthlyCosts:  'Costs per month',
      meals:         'Meals and coffee at work',
      clothes:       'Work clothes',
      childcare:     'Childcare during work',
      decompression: 'Spending to unwind after work',
      health:        'Job-related health costs',
      weeklyHours:   'Unpaid hours per week',
      gettingReady:  'Getting ready for work',
      decompressing: 'Unwinding after work',
      overtime:      'Unpaid overtime',
      next:          'See my real wage',
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
  auth: {
    title:             'Sign in',
    body:              'No password needed. We only keep your sign-in; prices, wages and logs stay on this phone.',
    emailLabel:        'Email',
    emailPlaceholder:  'you@example.com',
    send:              'Email me a sign-in link',
    sending:           'Sending…',
    invalidEmail:      'Enter a valid email address.',
    sentTitle:         'Check your email',
    sentBody:          'We sent a sign-in link to {email}. Open it on this phone.',
    resend:            'Send again',
    useDifferent:      'Use a different email',
    sendFailed:        'Couldn\'t send the link. Check your connection and try again.',
    linkFailed:        'That link didn\'t work. It may have expired — request a new one.',
    completing:        'Signing you in…',
    section:           'Account',
    signOut:           'Sign out',
    continueWithGoogle: 'Continue with Google',
    or:                'or',
    socialFailed:      'Sign-in didn\'t finish. Try again, or use your email.',
  },
  lens: {
    noPermissionTitle: 'Camera access needed',
    noPermissionBody:  'Life Energy needs camera access to read price tags. Frames are read in memory; nothing leaves your phone.',
    noPermissionCta:   'Grant access',
    noCameraTitle:     'No camera found',
    noCameraBody:      'This phone has no back camera the app can use. You can still type a price to see its life-energy cost.',
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
    typePriceManually: 'Type a price manually',
    typePrice:         'Type a price',
    notHomeCurrency:   'not {currency}', // contains "{currency}" placeholder
    rateAsOf:          'rate of {date}',
  },
  log: {
    title:    'This month',
    empty:    'No expenses yet.\nScan something with the lens!',
    emptyCta: 'Open Lens',
    addExpense: 'Add expense',
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
    currencyLabel:       'Currency',
    currencyTitle:       'Your currency',
    currencyBody:        'Your wage and the prices you scan are read in this currency. Changing it keeps your wage amounts and relabels them.',
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
    exportFormatTitle:   'Export format',
    exportFormatBody:    'Both include everything: wages, logs, reviews and scanned prices.',
    exportJson:          'JSON',
    exportCsv:           'CSV (spreadsheet)',
    exportFailed:        'Could not export your data. Please try again.',
    deleteFailed:        'Could not delete your data. Please try again.',
    bookCredit:          'Based on Your Money or Your Life',
    notFinancialAdvice:  'Not financial advice',
    footer:              'Life Energy · All calculations run on-device. Your prices, wages and logs never leave your phone.',
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
      title:    'Perjalanan kerja',
      subtitle: 'Waktu pulang-pergi ke tempat kerja per hari, dan biaya perjalanannya per bulan.',
      minutes:  'Perjalanan (menit/hari)',
      cost:     'Biaya perjalanan per bulan',
      next:     'Lanjut',
    },
    choice: {
      title: 'Tambah biaya pekerjaan lain?',
      body:  'Pakaian kerja, makan di tempat kerja, penitipan anak, dan waktu bersiap-siap menurunkan upah nyata Anda. Anda bisa menambahkannya sekarang atau nanti di Profil.',
      quick: 'Cukup untuk sekarang',
      full:  'Tambah biaya pekerjaan',
    },
    costs: {
      title:         'Biaya pekerjaan lain',
      subtitle:      'Hanya yang Anda keluarkan atau korbankan karena pekerjaan. Biarkan 0 jika tidak berlaku.',
      monthlyCosts:  'Biaya per bulan',
      meals:         'Makan dan kopi di tempat kerja',
      clothes:       'Pakaian kerja',
      childcare:     'Penitipan anak saat bekerja',
      decompression: 'Pengeluaran untuk melepas penat',
      health:        'Biaya kesehatan terkait pekerjaan',
      weeklyHours:   'Jam tidak dibayar per minggu',
      gettingReady:  'Bersiap-siap untuk bekerja',
      decompressing: 'Melepas penat setelah bekerja',
      overtime:      'Lembur tidak dibayar',
      next:          'Lihat upah nyata saya',
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
  auth: {
    title:             'Masuk',
    body:              'Tanpa kata sandi. Kami hanya menyimpan data masuk Anda; harga, gaji, dan catatan tetap di ponsel ini.',
    emailLabel:        'Email',
    emailPlaceholder:  'anda@contoh.com',
    send:              'Kirim tautan masuk',
    sending:           'Mengirim…',
    invalidEmail:      'Masukkan alamat email yang valid.',
    sentTitle:         'Periksa email Anda',
    sentBody:          'Kami mengirim tautan masuk ke {email}. Buka di ponsel ini.',
    resend:            'Kirim lagi',
    useDifferent:      'Gunakan email lain',
    sendFailed:        'Tautan gagal dikirim. Periksa koneksi lalu coba lagi.',
    linkFailed:        'Tautan itu tidak berfungsi. Mungkin sudah kedaluwarsa — minta tautan baru.',
    completing:        'Sedang masuk…',
    section:           'Akun',
    signOut:           'Keluar',
    continueWithGoogle: 'Lanjutkan dengan Google',
    or:                'atau',
    socialFailed:      'Masuk tidak selesai. Coba lagi, atau gunakan email Anda.',
  },
  lens: {
    noPermissionTitle: 'Akses kamera diperlukan',
    noPermissionBody:  'Life Energy membutuhkan akses kamera untuk membaca label harga. Gambar hanya dibaca di memori; tidak ada yang keluar dari ponsel Anda.',
    noPermissionCta:   'Izinkan akses',
    noCameraTitle:     'Kamera tidak ditemukan',
    noCameraBody:      'Ponsel ini tidak memiliki kamera belakang yang bisa dipakai aplikasi. Anda tetap bisa mengetik harga untuk melihat biaya energi hidupnya.',
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
    typePriceManually: 'Ketik harga secara manual',
    typePrice:         'Ketik harga',
    notHomeCurrency:   'bukan {currency}',
    rateAsOf:          'kurs {date}',
  },
  log: {
    title:    'Bulan ini',
    empty:    'Belum ada pengeluaran.\nPindai sesuatu dengan lensa!',
    emptyCta: 'Buka Lensa',
    addExpense: 'Tambah pengeluaran',
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
    currencyLabel:       'Mata uang',
    currencyTitle:       'Mata uang Anda',
    currencyBody:        'Upah Anda dan harga yang dipindai dibaca dalam mata uang ini. Mengubahnya tidak mengubah angka upah, hanya label mata uangnya.',
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
    exportFormatTitle:   'Format ekspor',
    exportFormatBody:    'Keduanya berisi semua data: upah, catatan, tinjauan, dan harga yang dipindai.',
    exportJson:          'JSON',
    exportCsv:           'CSV (spreadsheet)',
    exportFailed:        'Tidak dapat mengekspor data Anda. Silakan coba lagi.',
    deleteFailed:        'Tidak dapat menghapus data Anda. Silakan coba lagi.',
    bookCredit:          'Berdasarkan Your Money or Your Life',
    notFinancialAdvice:  'Bukan saran keuangan',
    footer:              'Life Energy · Semua kalkulasi berjalan di perangkat. Harga, gaji, dan catatan Anda tidak pernah meninggalkan ponsel.',
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
      title:    '通勤',
      subtitle: '1日の往復通勤時間と、毎月の通勤費。',
      minutes:  '通勤時間（分/日）',
      cost:     '月々の通勤費',
      next:     '次へ',
    },
    choice: {
      title: 'ほかの仕事関連費用も追加しますか？',
      body:  '仕事着、職場での食事、保育、身支度の時間も実質時給を下げます。今すぐ、またはあとでプロフィールから追加できます。',
      quick: '今はこれで十分',
      full:  '仕事関連費用を追加',
    },
    costs: {
      title:         'ほかの仕事関連費用',
      subtitle:      '仕事のために使うお金と時間だけを入力してください。当てはまらない項目は0のままで構いません。',
      monthlyCosts:  '月々の費用',
      meals:         '職場での食事・コーヒー',
      clothes:       '仕事着',
      childcare:     '勤務中の保育',
      decompression: '仕事後の気晴らしの出費',
      health:        '仕事関連の医療・健康費',
      weeklyHours:   '週あたりの無給時間',
      gettingReady:  '出勤の身支度',
      decompressing: '仕事後の気分転換',
      overtime:      'サービス残業',
      next:          '実質時給を見る',
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
  auth: {
    title:             'サインイン',
    body:              'パスワードは不要です。保存するのはサインイン情報だけで、価格・給与・記録はこの端末に残ります。',
    emailLabel:        'メールアドレス',
    emailPlaceholder:  'you@example.com',
    send:              'サインインリンクを送信',
    sending:           '送信中…',
    invalidEmail:      '有効なメールアドレスを入力してください。',
    sentTitle:         'メールを確認してください',
    sentBody:          '{email} にサインインリンクを送りました。この端末で開いてください。',
    resend:            'もう一度送信',
    useDifferent:      '別のメールアドレスを使う',
    sendFailed:        'リンクを送信できませんでした。接続を確認して、もう一度お試しください。',
    linkFailed:        'このリンクは使えませんでした。期限切れの可能性があります。新しいリンクを送信してください。',
    completing:        'サインインしています…',
    section:           'アカウント',
    signOut:           'サインアウト',
    continueWithGoogle: 'Google で続ける',
    or:                'または',
    socialFailed:      'サインインが完了しませんでした。もう一度お試しいただくか、メールをご利用ください。',
  },
  lens: {
    noPermissionTitle: 'カメラのアクセスが必要です',
    noPermissionBody:  'Life Energyが価格タグを読み取るためにカメラのアクセスが必要です。映像はメモリ上で読み取るだけで、端末の外には何も送信されません。',
    noPermissionCta:   'アクセスを許可',
    noCameraTitle:     'カメラが見つかりません',
    noCameraBody:      'この端末にはアプリで使える背面カメラがありません。価格を入力すれば、ライフエネルギーのコストを確認できます。',
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
    typePriceManually: '価格を手入力',
    typePrice:         '価格を入力',
    notHomeCurrency:   '{currency}以外',
    rateAsOf:          '{date}のレート',
  },
  log: {
    title:    '今月',
    empty:    'まだ支出がありません。\nレンズで何かスキャンしてみましょう！',
    emptyCta: 'レンズを開く',
    addExpense: '支出を追加',
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
    currencyLabel:       '通貨',
    currencyTitle:       'あなたの通貨',
    currencyBody:        '時給とスキャンした価格はこの通貨で扱われます。変更しても金額の数字はそのままで、通貨の表示だけが変わります。',
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
    exportFormatTitle:   'エクスポート形式',
    exportFormatBody:    'どちらにも、時給・記録・振り返り・スキャンした価格のすべてが含まれます。',
    exportJson:          'JSON',
    exportCsv:           'CSV（スプレッドシート）',
    exportFailed:        'データをエクスポートできませんでした。もう一度お試しください。',
    deleteFailed:        'データを削除できませんでした。もう一度お試しください。',
    bookCredit:          'Your Money or Your Lifeより',
    notFinancialAdvice:  '投資アドバイスではありません',
    footer:              'Life Energy · すべての計算は端末上で行われます。価格・給与・記録が端末の外に出ることはありません。',
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
      title:    'التنقل إلى العمل',
      subtitle: 'وقت التنقل ذهاباً وإياباً يومياً، وتكلفة التنقل الشهرية.',
      minutes:  'وقت التنقل (دقيقة/يوم)',
      cost:     'تكلفة التنقل الشهرية',
      next:     'التالي',
    },
    choice: {
      title: 'هل تريد إضافة تكاليف عمل أخرى؟',
      body:  'ملابس العمل والوجبات في العمل ورعاية الأطفال ووقت الاستعداد كلها تخفض أجرك الحقيقي. يمكنك إضافتها الآن أو لاحقاً من الملف الشخصي.',
      quick: 'يكفي الآن',
      full:  'إضافة تكاليف عمل',
    },
    costs: {
      title:         'تكاليف عمل أخرى',
      subtitle:      'أدخل فقط ما تنفقه أو تبذله بسبب العمل. اترك الحقل 0 إذا لم ينطبق.',
      monthlyCosts:  'التكاليف الشهرية',
      meals:         'الوجبات والقهوة في العمل',
      clothes:       'ملابس العمل',
      childcare:     'رعاية الأطفال أثناء العمل',
      decompression: 'الإنفاق للاسترخاء بعد العمل',
      health:        'تكاليف صحية مرتبطة بالعمل',
      weeklyHours:   'ساعات غير مدفوعة أسبوعياً',
      gettingReady:  'الاستعداد للعمل',
      decompressing: 'الاسترخاء بعد العمل',
      overtime:      'العمل الإضافي غير المدفوع',
      next:          'اعرض أجري الحقيقي',
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
  auth: {
    title:             'تسجيل الدخول',
    body:              'لا حاجة إلى كلمة مرور. نحتفظ ببيانات الدخول فقط؛ الأسعار والأجور والسجلات تبقى على هذا الهاتف.',
    emailLabel:        'البريد الإلكتروني',
    emailPlaceholder:  'you@example.com',
    send:              'أرسل لي رابط الدخول',
    sending:           'جارٍ الإرسال…',
    invalidEmail:      'أدخل بريدًا إلكترونيًا صالحًا.',
    sentTitle:         'تحقّق من بريدك',
    sentBody:          'أرسلنا رابط الدخول إلى {email}. افتحه على هذا الهاتف.',
    resend:            'أرسل مرة أخرى',
    useDifferent:      'استخدم بريدًا آخر',
    sendFailed:        'تعذّر إرسال الرابط. تحقّق من الاتصال وحاول مجددًا.',
    linkFailed:        'لم يعمل هذا الرابط. ربما انتهت صلاحيته — اطلب رابطًا جديدًا.',
    completing:        'جارٍ تسجيل الدخول…',
    section:           'الحساب',
    signOut:           'تسجيل الخروج',
    continueWithGoogle: 'المتابعة باستخدام Google',
    or:                'أو',
    socialFailed:      'لم يكتمل تسجيل الدخول. حاول مجددًا أو استخدم بريدك الإلكتروني.',
  },
  lens: {
    noPermissionTitle: 'مطلوب الوصول إلى الكاميرا',
    noPermissionBody:  'يحتاج Life Energy إلى الوصول إلى الكاميرا لقراءة بطاقات الأسعار. تُقرأ الصور في الذاكرة فقط، ولا يغادر أي شيء هاتفك.',
    noPermissionCta:   'منح الإذن',
    noCameraTitle:     'لم يتم العثور على كاميرا',
    noCameraBody:      'لا يحتوي هذا الهاتف على كاميرا خلفية يمكن للتطبيق استخدامها. لا يزال بإمكانك كتابة السعر لمعرفة تكلفته من طاقة الحياة.',
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
    typePriceManually: 'اكتب السعر يدوياً',
    typePrice:         'اكتب سعراً',
    notHomeCurrency:   'ليس {currency}',
    rateAsOf:          'سعر {date}',
  },
  log: {
    title:    'هذا الشهر',
    empty:    'لا توجد مصروفات حتى الآن.\nامسح شيئاً بالعدسة!',
    emptyCta: 'فتح العدسة',
    addExpense: 'إضافة مصروف',
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
    currencyLabel:       'العملة',
    currencyTitle:       'عملتك',
    currencyBody:        'يُقرأ أجرك والأسعار التي تمسحها بهذه العملة. تغييرها يُبقي أرقام أجرك كما هي ويغيّر العملة فقط.',
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
    exportFormatTitle:   'صيغة التصدير',
    exportFormatBody:    'كلتاهما تتضمن كل شيء: الأجور والسجلات والمراجعات والأسعار الممسوحة.',
    exportJson:          'JSON',
    exportCsv:           'CSV (جدول بيانات)',
    exportFailed:        'تعذّر تصدير بياناتك. يرجى المحاولة مرة أخرى.',
    deleteFailed:        'تعذّر حذف بياناتك. يرجى المحاولة مرة أخرى.',
    bookCredit:          'مستوحى من Your Money or Your Life',
    notFinancialAdvice:  'ليست نصيحة مالية',
    footer:              'Life Energy · جميع الحسابات تعمل على الجهاز. أسعارك وأجورك وسجلاتك لا تغادر هاتفك أبدًا.',
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
