import { parseWordBlock } from './_parse';

const RAW = `
avec sans dans pour sur sous chez comme aussi alors encore toujours jamais très bien peut être fait faire avoir dire aller voir savoir vouloir pouvoir devoir prendre
donner venir tenir croire passer parler demander rester entendre mettre aimer vivre sembler laisser penser regarder suivre porter arriver servir attendre chercher
compter paraître devenir entrer revenir paraître maison monde temps jour nuit année mois semaine heure minute chose personne famille enfant homme femme ami amour
coeur main tête yeux eau feu terre ciel soleil lune étoile mer fleur arbre animal chat chien oiseau porte fenêtre table chaise livre école ville pays route pont
blanc noir rouge bleu vert jaune grand petit nouveau vieux fort court long large étroit chaud froid doux dur facile difficile vrai faux libre plein vide
`;

export const WORDS = parseWordBlock(RAW);
