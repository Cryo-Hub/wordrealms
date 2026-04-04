import { parseWordBlock } from './_parse';

const RAW = `
com sem para por sobre entre durante também muito bem pode ser feito fazer ter dizer ir ver saber querer poder dever tomar dar vir crer passar falar pedir ficar
ouvir pôr amar viver parecer deixar pensar olhar seguir levar chegar servir esperar procurar contar parecer voltar entrar sair casa mundo tempo dia noite ano mês
semana hora minuto coisa pessoa família criança homem mulher amigo amor coração mão cabeça olhos água fogo terra céu sol lua estrela mar flor árvore animal gato
cão pássaro porta janela mesa cadeira livro escola cidade país caminho ponte branco preto vermelho azul verde amarelo grande pequeno novo velho forte curto longo
largo estreito quente frio macio duro fácil difícil verdadeiro falso livre cheio vazio
`;

export const WORDS = parseWordBlock(RAW);
