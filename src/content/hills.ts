// The seven hills of Tirumala (the Seshachalam range), as told in local legend.
export const SEVEN_HILLS = [
  { name: "Seshadri", te: "శేషాద్రి", story: "Named after Adisesha, the serpent on whom Lord Vishnu rests." },
  { name: "Neeladri", te: "నీలాద్రి", story: "Named after Neela Devi, remembered for offering her hair to the Lord." },
  { name: "Garudadri", te: "గరుడాద్రి", story: "Named after Garuda, the divine eagle who carries Lord Vishnu." },
  { name: "Anjanadri", te: "అంజనాద్రి", story: "Named after Anjana Devi, mother of Hanuman, who is said to have prayed here." },
  { name: "Vrushabhadri", te: "వృషభాద్రి", story: "Named after Vrushabha, from an old legend of the hills." },
  { name: "Narayanadri", te: "నారాయణాద్రి", story: "Named after Lord Narayana, who is said to have rested here." },
  { name: "Venkatadri", te: "వేంకటాద్రి", story: "The hill of Sri Venkateswara, where the temple stands." },
];

// Telugu greeting by the hour in Tirupati, shown in every language as a local touch.
export function tirupatiTime(now = new Date()) {
  const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Asia/Kolkata" }).format(now));
  const time = new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" }).format(now);
  if (hour >= 4 && hour < 12) return { te: "శుభోదయం", greeting: "Good morning from Tirupati", time };
  if (hour >= 12 && hour < 16) return { te: "శుభ మధ్యాహ్నం", greeting: "Good afternoon from Tirupati", time };
  if (hour >= 16 && hour < 21) return { te: "శుభ సాయంత్రం", greeting: "Good evening from Tirupati", time };
  return { te: "శుభ రాత్రి", greeting: "Good night from Tirupati", time };
}
