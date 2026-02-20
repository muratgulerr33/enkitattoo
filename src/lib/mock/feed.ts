/**
 * Mock feed/story items — styleguide only (V1 Hub architecture does not use feed on Home).
 * Used by: StoriesRow, PostCard, FeedSkeleton in /styleguide "Removed (examples)" tab.
 * hasMedia: when true, UI shows Skeleton for media (no external images).
 */

export type StoryItem = {
  id: string;
  name: string;
  initials: string;
  isNew: boolean;
};

export const storyItems: StoryItem[] = [
  { id: "s1", name: "Enki Studio", initials: "EN", isNew: true },
  { id: "s2", name: "Ayşe K.", initials: "AK", isNew: false },
  { id: "s3", name: "Can Y.", initials: "CY", isNew: false },
  { id: "s4", name: "Merve A.", initials: "MA", isNew: true },
  { id: "s5", name: "Burak T.", initials: "BT", isNew: false },
  { id: "s6", name: "Elif S.", initials: "ES", isNew: false },
  { id: "s7", name: "Deniz M.", initials: "DM", isNew: true },
  { id: "s8", name: "Selin Ö.", initials: "SÖ", isNew: false },
  { id: "s9", name: "Kerem L.", initials: "KL", isNew: false },
  { id: "s10", name: "Zeynep D.", initials: "ZD", isNew: false },
];

export type FeedItem = {
  id: string;
  authorName: string;
  authorRole: string;
  text: string;
  createdAt: string;
  createdAtISO: string;
  tags: string[];
  likes: number;
  comments: number;
  hasMedia: boolean;
};

export const feedItems: FeedItem[] = [
  {
    id: "1",
    authorName: "Ayşe K.",
    authorRole: "Guest",
    text: "İlk dövmem burada yapıldı, çok memnun kaldım. Stüdyo tertemiz ve sanatçılar ilgili.",
    createdAt: "2h",
    createdAtISO: "2026-02-09T10:00:00Z",
    tags: ["first tattoo", "minimal"],
    likes: 24,
    comments: 3,
    hasMedia: true,
  },
  {
    id: "2",
    authorName: "Enki Studio",
    authorRole: "Studio",
    text: "Bu hafta sonu walk-in kabul ediyoruz. Küçük motifler ve piercing için randevu alabilirsiniz.",
    createdAt: "5h",
    createdAtISO: "2026-02-09T07:00:00Z",
    tags: ["walk-in", "weekend"],
    likes: 56,
    comments: 12,
    hasMedia: false,
  },
  {
    id: "3",
    authorName: "Can Y.",
    authorRole: "Guest",
    text: "Piercing işlemi çok hızlı ve steril yapıldı. Kesinlikle tavsiye ederim.",
    createdAt: "1d",
    createdAtISO: "2026-02-08T12:00:00Z",
    tags: ["piercing", "ear"],
    likes: 18,
    comments: 2,
    hasMedia: true,
  },
  {
    id: "4",
    authorName: "Merve A.",
    authorRole: "Guest",
    text: "Sleeve projem devam ediyor. Her seans sonrası bakım önerileri için teşekkürler.",
    createdAt: "1d",
    createdAtISO: "2026-02-08T09:00:00Z",
    tags: ["sleeve", "aftercare"],
    likes: 42,
    comments: 8,
    hasMedia: false,
  },
  {
    id: "5",
    authorName: "Enki Studio",
    authorRole: "Studio",
    text: "Yeni tasarımlar: minimalist çizgiler ve botanik motifler. Galeri sayfamızdan inceleyebilirsiniz.",
    createdAt: "2d",
    createdAtISO: "2026-02-07T14:00:00Z",
    tags: ["new designs", "minimal", "botanical"],
    likes: 89,
    comments: 15,
    hasMedia: true,
  },
  {
    id: "6",
    authorName: "Burak T.",
    authorRole: "Guest",
    text: "Randevu sistemi çok pratik, online rezervasyon yaptım ve sorunsuz geçti.",
    createdAt: "2d",
    createdAtISO: "2026-02-07T11:00:00Z",
    tags: ["booking", "review"],
    likes: 31,
    comments: 1,
    hasMedia: false,
  },
  {
    id: "7",
    authorName: "Elif S.",
    authorRole: "Guest",
    text: "Küpe deldirme ve küçük bir tattoo aynı gün yaptırdım. İkisi de harika oldu.",
    createdAt: "3d",
    createdAtISO: "2026-02-06T16:00:00Z",
    tags: ["ear piercing", "small tattoo"],
    likes: 27,
    comments: 4,
    hasMedia: true,
  },
  {
    id: "8",
    authorName: "Enki Studio",
    authorRole: "Studio",
    text: "Sanatçı portfolyo güncellemesi: son çalışmalarımızı Artists sayfasında görebilirsiniz.",
    createdAt: "4d",
    createdAtISO: "2026-02-05T10:00:00Z",
    tags: ["artists", "portfolio"],
    likes: 67,
    comments: 9,
    hasMedia: true,
  },
  {
    id: "9",
    authorName: "Deniz M.",
    authorRole: "Guest",
    text: "Aftercare ürünleri stüdyoda satılıyor, işimizi çok kolaylaştırdı.",
    createdAt: "5d",
    createdAtISO: "2026-02-04T13:00:00Z",
    tags: ["aftercare", "products"],
    likes: 19,
    comments: 0,
    hasMedia: false,
  },
  {
    id: "10",
    authorName: "Enki Studio",
    authorRole: "Studio",
    text: "Sık sorulan sorular için FAQ sayfamızı güncelledik. Önce oraya göz atmanızı öneririz.",
    createdAt: "1w",
    createdAtISO: "2026-02-02T09:00:00Z",
    tags: ["FAQ", "info"],
    likes: 44,
    comments: 6,
    hasMedia: false,
  },
  {
    id: "11",
    authorName: "Oğuz K.",
    authorRole: "Guest",
    text: "Fine line dövme için randevu aldım, önümüzdeki hafta ilk seans. Çok heyecanlıyım.",
    createdAt: "1w",
    createdAtISO: "2026-02-01T14:00:00Z",
    tags: ["fine line", "booking"],
    likes: 12,
    comments: 2,
    hasMedia: false,
  },
  {
    id: "12",
    authorName: "Enki Studio",
    authorRole: "Studio",
    text: "Realism ve blackwork slotları bu ay doluyor. Erken randevu almanızı öneririz.",
    createdAt: "2w",
    createdAtISO: "2026-01-28T10:00:00Z",
    tags: ["realism", "blackwork", "slots"],
    likes: 78,
    comments: 11,
    hasMedia: true,
  },
];
