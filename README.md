# বাংলাদেশ জিন্দাবাদ — বাংলাদেশী জাতীয়তাবাদের সহজপাঠ

সৌজন্য ডিজিটাল সংস্করণ · বাংলা ই-বুক ওয়েব রিডার

মূল পুস্তিকা **“বাংলাদেশ জিন্দাবাদ — বাংলাদেশী জাতীয়তাবাদের সহজপাঠ” (৩য় সংস্করণ)**-এর স্ক্যান থেকে প্রতিলিপি করে তৈরি একটি আধুনিক, মোবাইল-বান্ধব ই-বুক ওয়েব অ্যাপ। এতে আছে:

- 📖 **পাঠক** — ৬টি অধ্যায়, দিন/সেপিয়া/রাত থিম, ফন্ট ও আকার নিয়ন্ত্রণ, প্রগ্রেস বার, সূচিপত্র
- 🎧 **শ্রবণ** — Web Speech API দিয়ে প্রতি অধ্যায় বাংলা অডিও (গতি নিয়ন্ত্রণসহ)
- 🔗 **শেয়ার** — WhatsApp, Messenger, Facebook, LinkedIn, X/Twitter, Telegram, ইমেইল, লিঙ্ক কপি ও Native Share; প্রতিটি অধ্যায়ের নিজস্ব লিঙ্ক (`#ch1`, `#ch2` …)
- 📄 **মুদ্রণ-উপযোগী PDF** — `bangladesh-zindabad-ebook.pdf` (A4, পৃষ্ঠা নম্বরসহ)
- 🖼 **সোশ্যাল প্রিভিউ** — Open Graph / Twitter Card ইমেজ (`og-image.jpg`), আইকন ও PWA manifest
- 🔍 **SEO** — JSON-LD Book schema, পরিষ্কার meta ট্যাগ

## লোকাল প্রিভিউ

```bash
cd bangladesh-zindabad
python3 -m http.server 8000
# ব্রাউজারে: http://localhost:8000
```

(সরাসরি `index.html` ডাবল-ক্লিক করলেও চলবে, তবে সার্ভারে চালানো ভালো।)

> **নোট:** `file://` দিয়ে খুললে কনসোলে ফন্ট-প্রিলোড নিয়ে কিছু CORS ওয়ার্নিং দেখাতে পারে — সেটা ব্রাউজারের লোকাল-ফাইল সীমাবদ্ধতা, ফন্ট তবুও লোড হয় এবং GitHub Pages-এ এই ওয়ার্নিং আসে না।

## GitHub Pages-এ ডিপ্লয়

1. GitHub-এ নতুন **public** রিপো তৈরি করুন, যেমন `bangladesh-zindabad`।
2. এই ফোল্ডারের সব ফাইল রিপোতে দিন:

   ```bash
   cd bangladesh-zindabad
   git init
   git add .
   git commit -m "বাংলাদেশ জিন্দাবাদ — ই-বুক ওয়েব রিডার"
   git branch -M main
   git remote add origin https://github.com/<আপনার-ইউজারনেম>/bangladesh-zindabad.git
   git push -u origin main
   ```

3. GitHub রিপোর **Settings → Pages** → Source: `Deploy from a branch` → Branch: `main` / `(root)` → Save।
4. কয়েক মিনিটে সাইট লাইভ হবে: `https://<ইউজারনেম>.github.io/bangladesh-zindabad/`

### ⚠️ ডিপ্লয়ের আগে একটাই কাজ: ইউজারনেম বসানো

সাইটের ঠিকানা শেয়ার-লিঙ্ক ও meta ট্যাগে ব্যবহার হয়। `moniruzjaman` ঘটে এমন সব জায়গা আপনার আসল ইউজারনেম দিয়ে বদলে নিন:

```bash
grep -rl "moniruzjaman" . | xargs sed -i 's/moniruzjaman/আপনার-ইউজারনেম/g'
```

যে ফাইলগুলোতে আছে: `index.html`, `js/share.js`, `js/reader.js`। ম্যানুয়ালি খুঁজতে: `grep -rn "moniruzjaman" .`

## ঐচ্ছিক: GA4 অ্যানালিটিক্স

`js/analytics.js`-এ `const GA_ID = '';` — এখানে আপনার GA4 আইডি (`G-XXXXXXX`) বসালেই ট্র্যাকিং চালু। খালি থাকলে কোনো রিকোয়েস্ট যায় না (ডিফল্ট বন্ধ)।

## ফোল্ডার কাঠামো

```
bangladesh-zindabad/
├── index.html                  # মূল পাঠক পেজ
├── css/reader.css              # থিম ও লেআউট
├── js/
│   ├── content.js              # পুরো বইয়ের পাঠ্য (সম্পাদনাযোগ্য)
│   ├── reader.js               # পাঠক কন্ট্রোলার
│   ├── tts.js                  # বাংলা অডিও (Web Speech API)
│   ├── share.js                # শেয়ারিং
│   └── analytics.js            # GA4 (ঐচ্ছিক)
├── assets/                     # Noto Bengali ফন্ট (সেরিফ+স্যান্স, রেগুলার+বোল্ড)
├── icons/                      # PWA আইকন
├── source/original-booklet.pdf # মূল পুস্তিকার স্ক্যান (সংরক্ষণাগার)
├── og-image.html               # OG ইমেজের সোর্স (সম্পাদনাযোগ্য)
├── og-image.jpg / og-image.png # সোশ্যাল প্রিভিউ ইমেজ (1200×630)
├── favicon.png / apple-touch-icon.png
├── manifest.webmanifest        # PWA manifest
├── bangladesh-zindabad-ebook.pdf # মুদ্রণ-উপযোগী সংস্করণ (A4)
└── README.md
```

## স্বত্ব ও সৌজন্য নোট

মূল পুস্তিকার পাঠ্যের সব স্বত্ব সংশ্লিষ্ট লেখক/প্রকাশকের। পুস্তিকায় লেখক-প্রকাশকের নাম ছাপা নেই; তথ্য পাওয়া গেলে `js/content.js`-এর “এই সংস্করণ সম্পর্কে” অংশে যুক্ত করুন। এই ডিজিটাল সংস্করণ শুধু পাঠ, শ্রবণ ও অবাণিজ্যিক শেয়ারের জন্য। মূল পুস্তিকার স্ক্যান `source/original-booklet.pdf`-এ সংরক্ষিত।

**পাঠ্য প্রস্তুতি:** স্ক্যান থেকে OCR-এ পাঠ্য উদ্ধার করে স্পষ্ট মুদ্রণ-ত্রুটি ও বানান সংশোধন করা হয়েছে; অর্থ ও বক্তব্য অপরিবর্তিত। তথ্যসূত্রের ওয়েব-লিঙ্কগুলো স্ক্যানে অস্পষ্ট থাকায় উৎসের নাম-তারিখ পর্যন্তই দেওয়া হয়েছে।

**ফন্ট:** [Noto Serif Bengali](https://fonts.google.com/noto/specimen/Noto+Serif+Bengali) ও [Noto Sans Bengali](https://fonts.google.com/noto/specimen/Noto+Sans+Bengali) (Google Noto, SIL Open Font License) — এই রিপোতেই হোস্ট করা, বাইরের কোনো রিকোয়েস্ট ছাড়াই চলে।
