// Default high-performance seed apps to guarantee that the store is instantly populated and highly appealing
import { AppItem } from '../types';

export const fallbackApps: AppItem[] = [
  {
    id: "premium-app-cyberpunk-console",
    name: "Cyberpunk Remote Console Pro",
    developerId: "dev-mkdesign-corporation-01",
    developerName: "Arctos Nexus Games",
    description: "Monitore estatísticas do seu terminal em tempo real. Compatível com servidores de simulação de sub-redes e consoles virtuais de hacking de dados. Executa com eficiência extrema de compressão sob rede CDN e caches de banda ultra-alta.",
    category: "Utilitários Gamers",
    iconDataUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%2318181b'/><circle cx='50' cy='50' r='30' stroke='%2339ff14' stroke-width='4' fill='none'/><path d='M35 50h30M50 35v30' stroke='%2339ff14' stroke-width='4'/></svg>",
    rating: 4.9,
    reviews: [
      {
        id: "r1",
        userName: "Gamer_Cyber2077",
        rating: 5,
        text: "Incrível! Consegui carregar scripts direto no console do meu celular a quase zero latência no Cloudflare.",
        date: "2026-05-30T10:00:00.000Z"
      },
      {
        id: "r2",
        userName: "Hacker_X",
        rating: 4.8,
        text: "Uma ferramenta refinada de dar inveja a grandes estúdios. O instalador direto copiou o cache em segundos.",
        date: "2026-05-29T14:30:00.000Z"
      }
    ],
    downloads: 12450,
    size: "1.4 GB",
    version: "2.1.4",
    createdAt: "2026-05-30T20:00:00.000Z"
  },
  {
    id: "premium-app-vintage-emulator",
    name: "Classic Retro-Boy Plus Emulator",
    developerId: "dev-mkdesign-corporation-02",
    developerName: "RetroLabs Inc.",
    description: "Emulador retro completo para GameBoy, NES e Sega Master System. Otimizado com algoritmos de renderização de shader de pixel-art para simular telas CRT reais com realismo impressionante.",
    category: "Emuladores Retro",
    iconDataUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%2327272a'/><rect x='30' y='25' width='40' height='30' rx='5' fill='%2339ff14' opacity='0.3'/><circle cx='40' cy='70' r='6' fill='%2339ff14'/><circle cx='60' cy='70' r='6' fill='%2339ff14'/></svg>",
    rating: 4.8,
    reviews: [
      {
        id: "r3",
        userName: "LuigiGamer",
        rating: 5,
        text: "Instalei no meu Android sem estresse em 5 segundos usando a instalação rápida de rede. Muito estável!",
        date: "2026-05-28T18:00:00.000Z"
      }
    ],
    downloads: 9840,
    size: "450 MB",
    version: "1.0.8",
    createdAt: "2026-05-29T11:20:00.000Z"
  },
  {
    id: "premium-app-asphalt-neon",
    name: "Asphalt Overdrive: Neon Grid",
    developerId: "dev-mkdesign-corporation-03",
    developerName: "Synthwave Velocity",
    description: "Pilote sob o ritmo eletrônico de trilhas sonoras synthwave licenciadas. Desvie de veículos cibernéticos e ultrapasse as barreiras de dados em um jogo de corrida futurista imersivo.",
    category: "Jogos de Ação",
    iconDataUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%2309090b'/><path d='M20 75 L50 25 L80 75 Z' stroke='%2339ff14' stroke-width='4' fill='none'/><circle cx='50' cy='55' r='10' fill='%2339ff14' opacity='0.5'/></svg>",
    rating: 4.7,
    reviews: [
      {
        id: "r4",
        userName: "Pilot_Wave",
        rating: 4.9,
        text: "O visual neon é absurdo e flui muito bem no celular. Sem anúncios ou microtransações irritantes.",
        date: "2026-05-27T08:15:00.000Z"
      }
    ],
    downloads: 34100,
    size: "2.8 GB",
    version: "3.2-CF",
    createdAt: "2026-05-26T15:40:00.000Z"
  },
  {
    id: "premium-app-tactical-commander",
    name: "Alpha Strike: Tactical Commander",
    developerId: "dev-mkdesign-corporation-04",
    developerName: "Arctos Nexus Games",
    description: "Comande esquadrões de elite em um sistema estratégico tático em turnos em mapas hiperdetalhados de ficção científica militar. Inclui suporte a partidas multiplayer locais offline em rede persistente.",
    category: "Simuladores / RPG",
    iconDataUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%231c1917'/><polygon points='50,20 80,75 20,75' fill='none' stroke='%2339ff14' stroke-width='4'/><line x1='50' y1='35' x2='50' y2='70' stroke='%2339ff14' stroke-width='3'/></svg>",
    rating: 4.9,
    reviews: [],
    downloads: 15600,
    size: "1.9 GB",
    version: "1.2.0",
    createdAt: "2026-05-25T09:10:00.000Z"
  }
];
