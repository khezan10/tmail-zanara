// Nama inbox acak: akar kata Yunani (filsafat, sains, mitologi, sejarah) + sufiks 10 karakter.
// Contoh: anthropos_aiue983hnf

export type NameSeed = {
  word: string;
  meaning: string;
  origin: string;
};

export type Identity = NameSeed & { local: string; suffix: string };

export const NAME_SEEDS: NameSeed[] = [
  // Filsafat & gagasan
  { word: "anthropos", meaning: "human being", origin: "greek" },
  { word: "logos", meaning: "word, reason", origin: "greek" },
  { word: "physis", meaning: "nature", origin: "greek" },
  { word: "psyche", meaning: "soul, breath", origin: "greek" },
  { word: "sophia", meaning: "wisdom", origin: "greek" },
  { word: "philosophia", meaning: "love of wisdom", origin: "greek" },
  { word: "aletheia", meaning: "truth, unconcealment", origin: "greek" },
  { word: "eudaimonia", meaning: "human flourishing", origin: "greek" },
  { word: "arete", meaning: "excellence", origin: "greek" },
  { word: "ethos", meaning: "character, custom", origin: "greek" },
  { word: "pathos", meaning: "feeling", origin: "greek" },
  { word: "mythos", meaning: "story", origin: "greek" },
  { word: "nous", meaning: "intellect", origin: "greek" },
  { word: "gnosis", meaning: "knowledge", origin: "greek" },
  { word: "arche", meaning: "beginning, principle", origin: "greek" },
  { word: "telos", meaning: "end, purpose", origin: "greek" },
  { word: "entelecheia", meaning: "being-at-work", origin: "greek" },
  { word: "energeia", meaning: "activity", origin: "greek" },
  { word: "dynamis", meaning: "power, potential", origin: "greek" },
  { word: "kairos", meaning: "the opportune moment", origin: "greek" },
  { word: "chronos", meaning: "time, duration", origin: "greek" },
  { word: "morphe", meaning: "form", origin: "greek" },
  { word: "eidos", meaning: "shape, idea", origin: "greek" },
  { word: "schema", meaning: "shape", origin: "greek" },
  { word: "typos", meaning: "impression", origin: "greek" },
  { word: "mimesis", meaning: "imitation", origin: "greek" },
  { word: "catharsis", meaning: "purification", origin: "greek" },
  { word: "hamartia", meaning: "missing the mark", origin: "greek" },
  { word: "hubris", meaning: "overreach", origin: "greek" },
  { word: "nemesis", meaning: "retribution", origin: "greek" },
  { word: "moira", meaning: "portion, fate", origin: "greek" },
  { word: "tyche", meaning: "fortune", origin: "greek" },
  { word: "sophrosyne", meaning: "temperance", origin: "greek" },
  { word: "andreia", meaning: "courage", origin: "greek" },
  { word: "dikaiosyne", meaning: "justice", origin: "greek" },
  { word: "eleutheria", meaning: "freedom", origin: "greek" },
  { word: "isonomia", meaning: "equality before the law", origin: "greek" },
  { word: "agape", meaning: "selfless love", origin: "greek" },
  { word: "eros", meaning: "desire", origin: "greek" },
  { word: "philia", meaning: "friendship", origin: "greek" },
  { word: "storge", meaning: "familial affection", origin: "greek" },
  { word: "xenia", meaning: "hospitality", origin: "greek" },
  { word: "harmonia", meaning: "joining, harmony", origin: "greek" },
  { word: "rhythmos", meaning: "measured flow", origin: "greek" },
  { word: "symmetria", meaning: "measured together", origin: "greek" },
  { word: "analogia", meaning: "proportion", origin: "greek" },
  { word: "metron", meaning: "measure", origin: "greek" },
  { word: "horos", meaning: "boundary", origin: "greek" },
  { word: "kosmos", meaning: "order, world", origin: "greek" },
  { word: "chaos", meaning: "gap, void", origin: "greek" },
  { word: "aether", meaning: "upper air", origin: "greek" },
  { word: "pneuma", meaning: "breath, spirit", origin: "greek" },
  { word: "soma", meaning: "body", origin: "greek" },
  { word: "genesis", meaning: "origin, birth", origin: "greek" },
  { word: "kosmogonia", meaning: "birth of the world", origin: "greek" },
  { word: "metamorphosis", meaning: "change of form", origin: "greek" },
  { word: "apoptosis", meaning: "falling off", origin: "greek, modern science" },
  { word: "kinesis", meaning: "motion", origin: "greek" },
  { word: "stasis", meaning: "standing still", origin: "greek" },

  // Sains & matematika
  { word: "mathema", meaning: "that which is learned", origin: "greek" },
  { word: "techne", meaning: "craft, skill", origin: "greek" },
  { word: "stoicheion", meaning: "element, letter", origin: "greek" },
  { word: "atomos", meaning: "indivisible", origin: "greek" },
  { word: "electron", meaning: "amber", origin: "greek" },
  { word: "magnetis", meaning: "lodestone of Magnesia", origin: "greek" },
  { word: "neuron", meaning: "sinew, string", origin: "greek" },
  { word: "helix", meaning: "spiral", origin: "greek" },
  { word: "protos", meaning: "first", origin: "greek" },
  { word: "astron", meaning: "star", origin: "greek" },
  { word: "aster", meaning: "star", origin: "greek" },
  { word: "galaxias", meaning: "milky", origin: "greek" },
  { word: "planetes", meaning: "wanderer", origin: "greek" },
  { word: "kometes", meaning: "long-haired", origin: "greek" },
  { word: "ouranos", meaning: "sky", origin: "greek" },
  { word: "helios", meaning: "sun", origin: "greek" },
  { word: "selene", meaning: "moon", origin: "greek" },
  { word: "gaia", meaning: "earth", origin: "greek" },
  { word: "thalassa", meaning: "sea", origin: "greek" },
  { word: "okeanos", meaning: "ocean", origin: "greek" },
  { word: "potamos", meaning: "river", origin: "greek" },
  { word: "anemos", meaning: "wind", origin: "greek" },
  { word: "nephos", meaning: "cloud", origin: "greek" },
  { word: "krystallos", meaning: "ice", origin: "greek" },
  { word: "lithos", meaning: "stone", origin: "greek" },
  { word: "metallon", meaning: "mine, metal", origin: "greek" },
  { word: "pyr", meaning: "fire", origin: "greek" },
  { word: "hydor", meaning: "water", origin: "greek" },
  { word: "aer", meaning: "air", origin: "greek" },
  { word: "phos", meaning: "light", origin: "greek" },
  { word: "skotos", meaning: "darkness", origin: "greek" },
  { word: "hemera", meaning: "day", origin: "greek" },
  { word: "gramma", meaning: "written mark", origin: "greek" },
  { word: "graphein", meaning: "to write", origin: "greek" },
  { word: "arithmos", meaning: "number", origin: "greek" },
  { word: "geometria", meaning: "measuring the earth", origin: "greek" },
  { word: "methodos", meaning: "way of pursuit", origin: "greek" },
  { word: "theoria", meaning: "contemplation", origin: "greek" },
  { word: "praxis", meaning: "practice, doing", origin: "greek" },
  { word: "thesis", meaning: "placing, proposition", origin: "greek" },

  // Mitologi & budaya
  { word: "nyx", meaning: "night", origin: "greek · mythology" },
  { word: "atlas", meaning: "the bearer of the sky", origin: "greek · mythology" },
  { word: "hermes", meaning: "messenger of the gods", origin: "greek · mythology" },
  { word: "athena", meaning: "goddess of wisdom", origin: "greek · mythology" },
  { word: "apollon", meaning: "light and order", origin: "greek · mythology" },
  { word: "artemis", meaning: "hunt and wilderness", origin: "greek · mythology" },
  { word: "demeter", meaning: "grain and harvest", origin: "greek · mythology" },
  { word: "iris", meaning: "rainbow messenger", origin: "greek · mythology" },
  { word: "muse", meaning: "source of inspiration", origin: "greek · mythology" },
  { word: "oracle", meaning: "the one who speaks", origin: "greek · religion" },
  { word: "delphi", meaning: "womb, sanctuary", origin: "greek · place" },
  { word: "olympia", meaning: "mountain of the gods", origin: "greek · place" },
  { word: "ithaka", meaning: "the long way home", origin: "greek · place" },
  { word: "athenai", meaning: "city of Athena", origin: "greek · place" },
  { word: "sparte", meaning: "the disciplined city", origin: "greek · place" },
  { word: "korinthos", meaning: "the adorned city", origin: "greek · place" },
  { word: "byzantion", meaning: "the crossing city", origin: "greek · place" },
  { word: "ephesos", meaning: "the great harbour city", origin: "greek · place" },
  { word: "miletos", meaning: "birthplace of philosophy", origin: "greek · place" },
  { word: "syrakousai", meaning: "the Sicilian city of Archimedes", origin: "greek · place" },
  { word: "alexandreia", meaning: "city of the library", origin: "greek · place" },
  { word: "agora", meaning: "marketplace of ideas", origin: "greek · culture" },
  { word: "akropolis", meaning: "high city", origin: "greek · culture" },
  { word: "lykeion", meaning: "Aristotle's school", origin: "greek · culture" },
  { word: "akademia", meaning: "Plato's grove", origin: "greek · culture" },
  { word: "mouseion", meaning: "seat of the Muses", origin: "greek · culture" },
  { word: "bibliotheke", meaning: "book collection", origin: "greek · culture" },
  { word: "theatron", meaning: "place of viewing", origin: "greek · culture" },
  { word: "odeion", meaning: "singing hall", origin: "greek · culture" },
  { word: "gymnasion", meaning: "place of training", origin: "greek · culture" },
  { word: "stadion", meaning: "running course", origin: "greek · culture" },
  { word: "demos", meaning: "the people", origin: "greek · politics" },
  { word: "kratos", meaning: "power, rule", origin: "greek · politics" },
  { word: "polis", meaning: "city-state", origin: "greek · politics" },
  { word: "oikos", meaning: "household", origin: "greek · culture" },
  { word: "nomos", meaning: "law, custom", origin: "greek · politics" },

  // Sejarah sains: orang
  { word: "pythagoras", meaning: "the measure of harmony", origin: "greek · science" },
  { word: "eukleides", meaning: "the father of geometry", origin: "greek · science" },
  { word: "archimedes", meaning: "the lever and the sphere", origin: "greek · science" },
  { word: "thales", meaning: "all is water", origin: "greek · science" },
  { word: "demokritos", meaning: "the laughing atomist", origin: "greek · science" },
  { word: "heraklitos", meaning: "all things flow", origin: "greek · philosophy" },
  { word: "parmenides", meaning: "being is one", origin: "greek · philosophy" },
  { word: "empedokles", meaning: "four roots of matter", origin: "greek · science" },
  { word: "anaxagoras", meaning: "mind orders all", origin: "greek · science" },
  { word: "hippokrates", meaning: "the oath of care", origin: "greek · medicine" },
  { word: "herodotos", meaning: "the first historian", origin: "greek · history" },
  { word: "thukydides", meaning: "history as evidence", origin: "greek · history" },
  { word: "eratosthenes", meaning: "measurer of the earth", origin: "greek · science" },
  { word: "aristarchos", meaning: "the sun at the centre", origin: "greek · science" },
  { word: "ptolemaios", meaning: "the star catalogue", origin: "greek · science" },
  { word: "galenos", meaning: "the anatomy of care", origin: "greek · medicine" },
  { word: "hypatia", meaning: "the last librarian of Alexandria", origin: "greek · science" },
  { word: "theano", meaning: "the first woman of numbers", origin: "greek · science" },
  { word: "diotima", meaning: "the teacher of love", origin: "greek · philosophy" },
  { word: "sappho", meaning: "the tenth muse", origin: "greek · poetry" },
  { word: "homeros", meaning: "the singer of journeys", origin: "greek · poetry" },
  { word: "hesiodos", meaning: "the genealogy of gods", origin: "greek · poetry" },
  { word: "aeschylos", meaning: "the first tragedian", origin: "greek · theatre" },
  { word: "sophokles", meaning: "the measured tragedy", origin: "greek · theatre" },
  { word: "euripides", meaning: "the human tragedy", origin: "greek · theatre" },
  { word: "aristophanes", meaning: "the comic mirror", origin: "greek · theatre" },
  { word: "sokrates", meaning: "know thyself", origin: "greek · philosophy" },
  { word: "platon", meaning: "the world of forms", origin: "greek · philosophy" },
  { word: "aristoteles", meaning: "the first systematiser", origin: "greek · philosophy" },
  { word: "diogenes", meaning: "the honest beggar", origin: "greek · philosophy" },
  { word: "epikouros", meaning: "the garden of quiet joy", origin: "greek · philosophy" },
  { word: "zenon", meaning: "the porch of duty", origin: "greek · philosophy" },
  { word: "plotinos", meaning: "the ascent to the one", origin: "greek · philosophy" },
];

const ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";
const SUFFIX_LENGTH = 10;

/** 10 karakter [a-z0-9], dipilih dengan crypto.getRandomValues. */
export function randomSuffix(length = SUFFIX_LENGTH): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < length; i += 1) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
}

function randomIndex(max: number): number {
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  return bytes[0] % max;
}

/** `word_suffix` + makna etimologisnya. */
export function randomIdentity(seed?: NameSeed): Identity {
  const picked = seed ?? NAME_SEEDS[randomIndex(NAME_SEEDS.length)];
  const suffix = randomSuffix();
  return { ...picked, suffix, local: `${picked.word}_${suffix}` };
}

/** Cari seed berdasarkan kata (tanpa sufiks). */
export function findSeed(word: string): NameSeed | undefined {
  const clean = word.trim().toLowerCase().split("_")[0];
  return NAME_SEEDS.find((s) => s.word === clean);
}
