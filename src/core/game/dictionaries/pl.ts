import { parseWordBlock } from './_parse';

const RAW = `
z bez dla na pod między podczas także bardzo dobrze może być zrobić mieć mówić iść widzieć wiedzieć chcieć musieć móc brać dawać przyjść wierzyć przechodzić
mówić prosić zostawać słyszeć kochać żyć wydawać zostawiać myśleć patrzeć iść nieść przychodzić służyć czekać szukać liczyć wracać wchodzić wychodzić dom świat
czas dzień noc rok miesiąc tydzień godzina minuta rzecz osoba rodzina dziecko mężczyzna kobieta przyjaciel miłość serce ręka głowa oczy woda ogień ziemia niebo
słońce księżyc gwiazda morze kwiat drzewo zwierzę kot pies ptak drzwi okno stół krzesło książka szkoła miasto kraj droga most biały czarny czerwony niebieski
zielony żółty duży mały nowy stary silny krótki długi szeroki wąski gorący zimny miękki twardy łatwy trudny prawdziwy fałszywy wolny pełny pusty
`;

export const WORDS = parseWordBlock(RAW);
