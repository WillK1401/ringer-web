/**
 * Sample Sporting World — the coherent demo cast behind the four core
 * experiences (Discover, Game Detail, Network, Gather).
 *
 * The new experiences are driven by relationship data the backend doesn't
 * capture yet (reciprocity, routines, atmosphere, met-stories). This module
 * is the single source of that data so all screens tell the same story.
 * As graph features land in ringer-api, replace these exports with API calls.
 */

export interface Person {
  id: string;
  name: string;
  first: string;
  init: string;
  color: string;
  live?: boolean;
}

export const PEOPLE: Record<string, Person> = {
  marcus: { id: 'marcus', name: 'Marcus Bell',  first: 'Marcus', init: 'MB', color: '#B0714F', live: true },
  priya:  { id: 'priya',  name: 'Priya Nair',   first: 'Priya',  init: 'PN', color: '#5B7AA8', live: true },
  dan:    { id: 'dan',    name: 'Dan Kerr',     first: 'Dan',    init: 'DK', color: '#6E9A82' },
  sofia:  { id: 'sofia',  name: 'Sofia Reyes',  first: 'Sofia',  init: 'SR', color: '#8E7BA8' },
  leon:   { id: 'leon',   name: 'Leon Tran',    first: 'Leon',   init: 'LT', color: '#A8935B' },
  nadia:  { id: 'nadia',  name: 'Nadia Khan',   first: 'Nadia',  init: 'NK', color: '#7E8B5B' },
  emma:   { id: 'emma',   name: 'Emma Ward',    first: 'Emma',   init: 'Em', color: '#A8635B' },
  raj:    { id: 'raj',    name: 'Raj Mehta',    first: 'Raj',    init: 'Rj', color: '#5B8FA8' },
  sam:    { id: 'sam',    name: 'Sam Okafor',   first: 'Sam',    init: 'Sm', color: '#8A7B5B' },
  jordan: { id: 'jordan', name: 'Jordan Lee',   first: 'Jordan', init: 'Jo', color: '#5B8FA8' },
  mia:    { id: 'mia',    name: 'Mia Chen',     first: 'Mia',    init: 'Mi', color: '#7E8B5B' },
  jonah:  { id: 'jonah',  name: 'Jonah Fry',    first: 'Jonah',  init: 'Jo', color: '#8A7B5B' },
  tyler:  { id: 'tyler',  name: 'Tyler Ross',   first: 'Tyler',  init: 'Ty', color: '#5B7A6E' },
  lena:   { id: 'lena',   name: 'Lena Torres',  first: 'Lena',   init: 'LT', color: '#A8935B' },
  aiden:  { id: 'aiden',  name: 'Aiden Obi',    first: 'Aiden',  init: 'AO', color: '#A8635B' },
  kyle:   { id: 'kyle',   name: 'Kyle Nash',    first: 'Kyle',   init: 'Ky', color: '#5B7A6E' },
  rosa:   { id: 'rosa',   name: 'Rosa Vidal',   first: 'Rosa',   init: 'Ro', color: '#5B7A6E' },
  tara:   { id: 'tara',   name: 'Tara Singh',   first: 'Tara',   init: 'Ta', color: '#5B7A6E' },
};

// ── Network: relationship worlds ────────────────────────────────────────

export interface World {
  person: Person;
  role: string;
  nowLine: string;
  story: string;
  games: string;
  since: string;
  usual: string;
  youToThem: string;
  themToYou: string;
  sports: string[];
  shared: Person[];
  sharedLabel: string;
  future: string;
  futureSub: string;
  metStory: string;
}

const P = PEOPLE;

export const WORLDS: Record<string, World> = {
  marcus: {
    person: P.marcus, role: 'Your Wednesday host', nowLine: 'Hosting your football tonight',
    story: "Your first friend in Toronto — you met at his Wednesday football the week you arrived, and he's anchored your week ever since.",
    games: '23', since: 'Oct', usual: 'Wed',
    youToThem: "You've turned up to 20 of Marcus's games.",
    themToYou: 'Marcus backed the two games you organised.',
    sports: ['Football', 'Running'], shared: [P.priya, P.dan, P.sofia], sharedLabel: '9 people you both know',
    future: 'Tonight · Wednesday football', futureSub: '7:30 · Trinity Bellwoods',
    metStory: "You joined The Wednesday Regulars last October. Marcus captained your first game — you've barely missed one since.",
  },
  priya: {
    person: P.priya, role: 'The connector', nowLine: 'Just joined Sunday basketball',
    story: 'The connector of your circle — Priya has pulled you into two new sports this year, and you\'ve returned the favour.',
    games: '19', since: 'Oct', usual: 'Wed',
    youToThem: 'You brought Priya into the Saturday Run Club.',
    themToYou: 'Priya introduced you to padel and tennis.',
    sports: ['Football', 'Padel', 'Tennis'], shared: [P.marcus, P.dan, P.leon], sharedLabel: '12 people you both know',
    future: "Saturday · padel with Leon's group", futureSub: '10:00 · Padel Haus',
    metStory: 'You met Priya through Wednesday football. She later brought you into your first padel game — and you pulled her into running.',
  },
  dan: {
    person: P.dan, role: 'Your teammate', nowLine: '',
    story: "Your steadiest teammate — picked on the same five-a-side side so often it's become a running joke.",
    games: '17', since: 'Nov', usual: 'Wed',
    youToThem: 'You introduced Dan to Thursday tennis.',
    themToYou: 'Dan brought you into the Friday basketball run.',
    sports: ['Football', 'Basketball'], shared: [P.marcus, P.priya, P.nadia], sharedLabel: '7 people you both know',
    future: 'Tonight · Wednesday football', futureSub: 'Same team, probably',
    metStory: 'You and Dan kept being drawn on the same team last winter. It stuck — now you seek each other out at every game.',
  },
  sofia: {
    person: P.sofia, role: 'Your tennis partner', nowLine: '',
    story: 'Your Thursday tennis has quietly become one of the fixtures of your week.',
    games: '11', since: 'Feb', usual: 'Thu',
    youToThem: "You've been Sofia's regular fourth since February.",
    themToYou: 'Sofia got you your first High Park court booking.',
    sports: ['Tennis'], shared: [P.priya, P.emma], sharedLabel: '5 people you both know',
    future: 'Thursday · tennis at High Park', futureSub: '6:00 · your usual court',
    metStory: "Sofia needed a fourth for a tennis ladder in February. You've played nearly every Thursday since.",
  },
};

export interface CircleRow {
  id: string;
  name: string;
  role: string;
  history: string;
  reciprocity: string;
  live: boolean;
  nowChip: string;
}

export const CIRCLE: CircleRow[] = [
  { id: 'marcus', name: 'Marcus', role: 'your Wednesday host', history: 'Played together 23 times since October', reciprocity: "You back each other's games", live: true, nowChip: 'Hosting tonight' },
  { id: 'priya',  name: 'Priya',  role: 'the connector',       history: 'Brought you into padel — you brought her to running', reciprocity: 'Two sports each way', live: true, nowChip: 'Playing Sunday' },
  { id: 'dan',    name: 'Dan',    role: 'your teammate',       history: 'Usually on your team · 17 games together', reciprocity: 'You each opened a new sport', live: false, nowChip: '' },
  { id: 'sofia',  name: 'Sofia',  role: 'your tennis partner', history: 'Every Thursday at High Park since February', reciprocity: 'Her fourth, your court', live: false, nowChip: '' },
];

export const ACTIVE_NOW = [
  { person: P.marcus, text: 'Marcus is hosting your football tonight.', time: 'Starts 7:30 · in 2 hours' },
  { person: P.priya,  text: 'Priya just joined Sunday basketball.',     time: '20 minutes ago' },
  { person: P.leon,   text: 'Leon opened 2 spots in Saturday padel.',   time: 'This morning' },
];

// ── Gather: trust circles ───────────────────────────────────────────────

export const GATHER = {
  session: 'Wednesday Football · this week',
  core: [P.marcus, P.priya, P.dan, P.sofia, P.leon],
  trusted: [
    { person: P.emma,   reason: 'Emma — Marcus trusts her' },
    { person: P.sam,    reason: 'Sam — plays with Priya every Thursday' },
    { person: P.jordan, reason: 'Jordan — has been looking for football' },
  ],
  discovery: [P.kyle, P.rosa, P.tara],
};

// ── Sporting Life (You tab) ─────────────────────────────────────────────

export const ME = {
  name: 'Will Sutton',
  init: 'W',
  color: '#5B7A6E',
  city: 'Toronto',
  since: 'on Ringer since 2025',
  oneLiner: 'Wednesday football. Sunday tennis.',
  journeyLine: 'Eight months. One sport became three.',
};

export interface Trait {
  id: string;
  label: string;
  detail: string;
}

export const TRAITS: Trait[] = [
  { id: 't1', label: 'Plays Football & Padel', detail: 'Will plays football every Wednesday and picked up padel six weeks ago through his network.' },
  { id: 't2', label: 'Wednesday Regular', detail: "Hasn't missed a Wednesday football session in 11 weeks straight." },
  { id: 't3', label: 'Usually Organises', detail: "Will has hosted 28 games — usually stepping in when Marcus can't make it." },
  { id: 't4', label: 'Competitive but Social', detail: 'Regulars describe his games as competitive on the pitch, relaxed after — always a pint at the Foxes.' },
  { id: 't5', label: 'Loves Trying New Sports', detail: 'Padel this year, tennis last year — Will tries something new almost every season.' },
];

export const ROUTINE = [
  { day: 'Wed', time: '7:30',  title: 'Wednesday Football', sub: 'Trinity Bellwoods · organises sometimes', color: '#B0714F' },
  { day: 'Sun', time: '10:00', title: 'Sunday Tennis',      sub: 'High Park · with Sofia',                  color: '#8E7BA8' },
  { day: 'Sat', time: '10:00', title: 'Padel (new)',        sub: 'Padel Haus · every other week',           color: '#A8935B' },
];

export const MY_COMMUNITIES = [
  { name: 'Wednesday Regulars',  color: '#B0714F', groupId: 'wed'    },
  { name: 'High Park Tennis',    color: '#8E7BA8', groupId: 'tennis' },
  { name: 'North Toronto Padel', color: '#A8935B', groupId: 'padel'  },
];

export const TRUSTED_BY = [
  { value: '47', label: 'played with' },
  { value: '28', label: 'games hosted' },
  { value: '14', label: 'people introduced' },
];

export const JOURNEY = [
  { date: 'Last October', title: 'Joined Ringer',          body: 'Moved to Toronto and joined The Wednesday Regulars.',          color: '#B0714F', init: 'W'  },
  { date: 'October',      title: 'Met Marcus',             body: "Captained Will's first game — became his anchor in the city.", color: '#B0714F', init: 'MB' },
  { date: 'December',     title: 'Introduced to running',  body: 'Priya brought him into the Saturday Run Club.',                color: '#6E9A82', init: 'PN' },
  { date: 'February',     title: 'Started tennis',         body: "Sofia needed a fourth — Will's barely missed a Thursday since.", color: '#8E7BA8', init: 'SR' },
  { date: '6 weeks ago',  title: 'Tried padel',            body: "His first new sport in years, through Leon's group.",          color: '#A8935B', init: 'LT' },
];

export const MEMORIES = [
  { label: 'First Wednesday game', color: '#B0714F' },
  { label: 'Run Club 10k',         color: '#6E9A82' },
  { label: 'First padel win',      color: '#A8935B' },
];

// ── Activity (groups home) ──────────────────────────────────────────────

export interface PendingAction {
  id: string;
  init: string;
  color: string;
  title: string;
  sub: string;
  primaryLabel: string;
  secondaryLabel: string;
}

export const PENDING_ACTIONS: PendingAction[] = [
  { id: 'p1', init: 'MB', color: '#B0714F', title: 'Marcus needs 1 more for Wednesday', sub: 'Trinity Bellwoods · 7:30 PM',        primaryLabel: 'Join',    secondaryLabel: 'Not tonight' },
  { id: 'p2', init: 'SR', color: '#8E7BA8', title: 'Confirm tennis with Sofia',          sub: 'Thursday · High Park · 6:00 PM',    primaryLabel: 'Confirm', secondaryLabel: 'Change time' },
];

export interface ActivityGroup {
  id: string;
  name: string;
  init: string;
  color: string;
  last: string;
  time: string;
  unread: boolean;
}

export const ACTIVITY_GROUPS: ActivityGroup[] = [
  { id: 'wed',    name: 'Wednesday Football',  init: 'WF', color: '#B0714F', last: 'Marcus: Pitch is booked, see you at 7:30', time: '6:40', unread: true  },
  { id: 'tennis', name: 'High Park Tennis',    init: 'HT', color: '#8E7BA8', last: 'Sofia: same court as last week?',          time: 'Tue',  unread: false },
  { id: 'run',    name: 'Saturday Run Club',   init: 'RC', color: '#6E9A82', last: 'Photos from this week are up',             time: 'Sat',  unread: false },
  { id: 'padel',  name: 'North Toronto Padel', init: 'NP', color: '#A8935B', last: 'Leon: great session today',                time: 'Mon',  unread: false },
];

export const GROUP_MESSAGES = [
  { init: 'MB', color: '#B0714F', name: 'Marcus', time: '6:40 PM', text: 'Pitch is booked, see you all at 7:30' },
  { init: 'PN', color: '#5B7AA8', name: 'Priya',  time: '6:52 PM', text: 'Running 5 late, save me a spot!' },
];

export const QUICK_ACTIONS = ["I'm in", 'Running late', "Can't make it", 'Need one more'];

export const GROUP_PHOTOS = ['#B0714F', '#8E7BA8', '#6E9A82', '#A8935B', '#5B7AA8', '#A8635B', '#B0714F', '#6E9A82', '#8E7BA8'];

export const GROUP_HISTORY = [
  { when: 'Yesterday',      text: '9 players, 3-2 final score, everyone paid on time.' },
  { when: 'Last Wednesday', text: 'Emma joined for the first time, introduced by Alex.' },
  { when: '3 weeks ago',    text: 'Rained out — Marcus rescheduled to Thursday.' },
  { when: 'A month ago',    text: 'Hit 100 sessions together as a group.' },
];

export const GROUP_PAYMENTS = {
  stats: [
    { value: '$72',  label: 'collected'   },
    { value: '$16',  label: 'outstanding' },
    { value: '9/11', label: 'paid'        },
  ],
  rows: [
    { init: 'MB', color: '#B0714F', name: 'Marcus', status: 'Paid',          statusColor: '#1C7C54' },
    { init: 'PN', color: '#5B7AA8', name: 'Priya',  status: 'Paid',          statusColor: '#1C7C54' },
    { init: 'EL', color: '#A8635B', name: 'Emma',   status: 'Reminder sent', statusColor: '#B0714F' },
    { init: 'W',  color: '#5B7A6E', name: 'You',    status: 'Paid',          statusColor: '#1C7C54' },
  ],
};
