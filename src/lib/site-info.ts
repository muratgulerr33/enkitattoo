export const SITE_INFO = {
  name: "Enki Tattoo Studio Mersin",
  shortName: "Enki Tattoo Studio",
  addressText: "İnönü, 1404. Sk. no:17 D:E, 33130 Yenişehir/Mersin",
  address: {
    street: "İnönü, 1404. Sk. no:17 D:E",
    district: "Yenişehir",
    city: "Mersin",
    postalCode: "33130",
    country: "TR",
  },
  phoneDisplay: "+90 553 710 80 33",
  phoneE164: "+905537108033",
  openingHoursText: "Hafta içi 10:00–20:00 • Pazar 12:00–20:00",
  openingHours: {
    weekday: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    sunday: ["Sunday"],
    weekdayLabel: "Hafta içi 10:00–20:00",
    sundayLabel: "Pazar 12:00–20:00",
    weekdayOpen: "10:00",
    weekdayClose: "20:00",
    sundayOpen: "12:00",
    sundayClose: "20:00",
  },
  googleMapsUrl: "https://maps.app.goo.gl/jQk7m7YNVXsoHitG9",
  googleMapsEmbedSrc:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3195.5217084656683!2d34.59194307625566!3d36.78203996872248!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1527f5d852fbfb95%3A0xc04051bc529ace4e!2sEnki%20Tattoo%20Studio%20Mersin!5e0!3m2!1str!2str!4v1772010964988!5m2!1str!2str",
  geo: {
    lat: 36.78203996872248,
    lng: 34.59194307625566,
  },
} as const;
