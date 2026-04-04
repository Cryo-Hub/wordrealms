import { parseWordBlock } from './_parse';

const RAW = `
und der die das nicht mit sich eine ein es aber auf sie dem den noch was nur man kann wenn schon hat sein hier auch wie uns ihn haben ihm ihr vom zum zur aus bei nach vor über unter wieder sehr mehr also oder ohne doch durch alle
arbeit augen auto bank baum berg bild blau brief bringen bruder bürger dorf drei dunkel einfach ende essen familie fenster finden frage frau frei freund früh führen
garten geben gelb genug gesicht gewinnen glauben groß grün gut hand haus heute hoch holz horen kind klein kalt kaufen kennen kinder kirche kopf kosten krank kurz
land lange laufen lernen leben licht liebe liegen machen mann minute monat mutter nacht name natur neu nichts nimmer offen ort park platz punkt richtig rot sache
sagen schlecht schon schule schwer see spielen sprechen springen stadt stehen stern stunde stuck tag tante tisch tragen treffen tur uhr vater verlieren viel wagen
wahr warten wasser weg weiss welt wenig werfen werk wichtig winter wissen woche wohnen wolke wort wunder zeit zimmer zehn ziehen zimmer
`;

export const WORDS = parseWordBlock(RAW);
