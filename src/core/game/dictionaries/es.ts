import { parseWordBlock } from './_parse';

const RAW = `
con sin para por sobre bajo entre desde hasta durante mientras también muy bien puede ser hecho hacer tener decir ir ver saber querer poder deber tomar dar venir creer
pasar hablar pedir quedarse oír poner amar vivir parecer dejar pensar mirar seguir llevar llegar servir esperar buscar contar parecer volver entrar salir volver casa
mundo tiempo día noche año mes semana hora minuto cosa persona familia niño hombre mujer amigo amor corazón mano cabeza ojos agua fuego tierra cielo sol luna
estrella mar flor árbol animal gato perro pájaro puerta ventana mesa silla libro escuela ciudad país camino puente blanco negro rojo azul verde amarillo grande
pequeño nuevo viejo fuerte corto largo ancho estrecho caliente frío suave duro fácil difícil verdadero falso libre lleno vacío nada algo nadie alguien
`;

export const WORDS = parseWordBlock(RAW);
