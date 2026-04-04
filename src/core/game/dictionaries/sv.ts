import { parseWordBlock } from './_parse';

const RAW = `
med utan för på under mellan under också mycket bra kan vara gjord göra ha säga gå se veta vilja måste kunna ta ge komma tro gå tala be stanna höra sätta älska
leva verka lämna tänka titta följa bära komma tjäna vänta söka räkna verka återvända gå in gå ut hus värld tid dag natt år månad vecka timme minut sak person
familj barn man kvinna vän kärlek hjärta hand huvud ögon vatten eld jord himmel sol måne stjärna hav blomma träd djur katt hund fågel dörr fönster bord stol bok
skola stad land väg bro vit svart röd blå grön gul stor liten ny gammal stark kort lång bred smal varm kall mjuk hård lätt svår sann falsk fri full tom
`;

export const WORDS = parseWordBlock(RAW);
