import { parseWordBlock } from './_parse';

const RAW = `
ile için üzerinde altında arasında sırasında da çok iyi olabilir yapmak etmek demek gitmek görmek bilmek istemek gerekmek almak vermek gelmek inanmak geçmek
konuşmak sormak kalmak duymak koymak sevmek yaşamak görünmek bırakmak düşünmek bakmak takip etmek taşımak varmak hizmet beklemek aramak saymak dönmek girmek çıkmak
ev dünya zaman gün gece yıl ay hafta saat dakika şey kişi aile çocuk erkek kadın arkadaş aşk kalp el baş göz su ateş toprak gökyüzü güneş ay yıldız deniz çiçek
ağaç hayvan kedi köpek kuş kapı pencere masa sandalye kitap okul şehir ülke yol köprü beyaz siyah kırmızı mavi yeşil sarı büyük küçük yeni eski güçlü kısa uzun
geniş dar sıcak soğuk yumuşak sert kolay zor doğru yanlış serbest dolu boş
`;

export const WORDS = parseWordBlock(RAW);
