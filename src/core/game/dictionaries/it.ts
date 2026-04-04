import { parseWordBlock } from './_parse';

const RAW = `
con senza per su sotto tra durante mentre anche molto bene può essere fatto fare avere dire andare vedere sapere volere potere dovere prendere dare venire credere
passare parlare chiedere restare sentire mettere amare vivere sembrare lasciare pensare guardare seguire portare arrivare servire aspettare cercare contare sembrare
tornare entrare uscire casa mondo tempo giorno notte anno mese settimana ora minuto cosa persona famiglia bambino uomo donna amico amore cuore mano testa occhi
acqua fuoco terra cielo sole luna stella mare fiore albero animale gatto cane uccello porta finestra tavolo sedia libro scuola città paese strada ponte bianco
nero rosso blu verde giallo grande piccolo nuovo vecchio forte corto lungo largo stretto caldo freddo morbido duro facile difficile vero falso libero pieno vuoto
`;

export const WORDS = parseWordBlock(RAW);
