import { parseWordBlock } from './_parse';

const RAW = `
met zonder voor op onder tussen tijdens ook zeer goed kan zijn gedaan doen hebben zeggen gaan zien weten willen moeten kunnen nemen geven komen geloven gaan
praten vragen blijven horen zetten houden leven lijken laten denken kijken volgen dragen komen dienen wachten zoeken tellen lijken teruggaan binnen gaan buiten gaan
huis wereld tijd dag nacht jaar maand week uur minuut ding persoon familie kind man vrouw vriend liefde hart hand hoofd ogen water vuur aarde hemel zon maan
ster zee bloem boom dier kat hond vogel deur raam tafel stoel boek school stad land weg brug wit zwart rood blauw groen geel groot klein nieuw oud sterk kort
lang breed smal warm koud zacht hard makkelijk moeilijk waar nep vrij vol leeg
`;

export const WORDS = parseWordBlock(RAW);
