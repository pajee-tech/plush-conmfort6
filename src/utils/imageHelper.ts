/**
 * High-fidelity vector renders and image representations for Plush Comfort UK.
 * Guarantees zero broken images across all sandbox environments and browsers.
 */

export const FURNITURE_IMAGES = {
  // Hero Accent Chair (as seen in approved screenshot)
  heroAccentChair: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
    <defs>
      <radialGradient id="shadow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="%238C7A6B" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="%238C7A6B" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="chairBoucle" x1="20%" y1="10%" x2="80%" y2="90%">
        <stop offset="0%" stop-color="%23FBF8F3"/>
        <stop offset="45%" stop-color="%23F2ECE3"/>
        <stop offset="100%" stop-color="%23DED4C7"/>
      </linearGradient>
      <linearGradient id="cushionShadow" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="%23ECE3D7"/>
        <stop offset="100%" stop-color="%23C8BCAE"/>
      </linearGradient>
      <linearGradient id="oakLeg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="%23A87B51"/>
        <stop offset="50%" stop-color="%238C5E35"/>
        <stop offset="100%" stop-color="%23684120"/>
      </linearGradient>
    </defs>
    <!-- Background Soft Floor Ambient -->
    <ellipse cx="300" cy="510" rx="200" ry="28" fill="url(%23shadow)"/>
    
    <!-- Wooden Legs -->
    <!-- Back-left leg -->
    <polygon points="210,390 195,490 205,492 225,390" fill="%23684120"/>
    <!-- Back-right leg -->
    <polygon points="380,390 405,490 395,492 365,390" fill="%23684120"/>
    <!-- Front-left leg -->
    <polygon points="230,410 205,515 220,518 250,410" fill="url(%23oakLeg)"/>
    <!-- Front-right leg -->
    <polygon points="360,410 395,515 380,518 340,410" fill="url(%23oakLeg)"/>
    <!-- Leg stretcher crossbar -->
    <rect x="235" y="420" width="120" height="10" rx="3" fill="%238C5E35" transform="rotate(-2 295 425)"/>

    <!-- Chair Main Shell Backrest & Arms -->
    <path d="M 160 260 C 150 180, 210 100, 300 100 C 390 100, 450 180, 440 260 C 435 310, 420 370, 395 395 C 370 415, 230 415, 205 395 C 180 370, 165 310, 160 260 Z" fill="url(%23chairBoucle)"/>
    
    <!-- Inner Sculpted Back Cushion -->
    <path d="M 190 240 C 185 170, 230 125, 300 125 C 370 125, 415 170, 410 240 C 405 285, 385 340, 300 340 C 215 340, 195 285, 190 240 Z" fill="%23F7F2EB" opacity="0.85"/>
    
    <!-- Curved Left Armrest Fold -->
    <path d="M 160 250 C 155 310, 185 365, 225 380 C 235 345, 215 290, 195 240 Z" fill="%23E4DACE"/>
    <!-- Curved Right Armrest Fold -->
    <path d="M 440 250 C 445 310, 415 365, 375 380 C 365 345, 385 290, 405 240 Z" fill="%23D7CCC0"/>

    <!-- Thick Plush Deep Seat Cushion -->
    <path d="M 195 350 C 190 320, 410 320, 405 350 C 400 395, 375 420, 300 422 C 225 420, 200 395, 195 350 Z" fill="url(%23cushionShadow)"/>
    <ellipse cx="300" cy="358" rx="100" ry="32" fill="url(%23chairBoucle)"/>
    
    <!-- Boucle Texture Piping Seams -->
    <path d="M 200 370 Q 300 395 400 370" stroke="%23CABDB0" stroke-width="2.5" fill="none"/>
    <path d="M 230 180 Q 300 195 370 180" stroke="%23DDD2C5" stroke-width="1.5" stroke-dasharray="3,3" fill="none"/>
  </svg>`,

  // Living Room Sofa Scene (as seen in Card 1)
  livingRoomSofa: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 460" width="100%" height="100%">
    <defs>
      <radialGradient id="roomShadow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="%23685A4E" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="%23685A4E" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="sofaFabric" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="%23FAF6F0"/>
        <stop offset="70%" stop-color="%23EDE4D8"/>
        <stop offset="100%" stop-color="%23D8CABE"/>
      </linearGradient>
      <linearGradient id="flutedOak" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="%238E613B"/>
        <stop offset="50%" stop-color="%23B07D4F"/>
        <stop offset="100%" stop-color="%238E613B"/>
      </linearGradient>
    </defs>
    <!-- Room Floor Shadow -->
    <ellipse cx="320" cy="410" rx="270" ry="30" fill="url(%23roomShadow)"/>
    
    <!-- Sofa Legs -->
    <polygon points="120,330 110,400 122,402 135,330" fill="%23634024"/>
    <polygon points="500,330 510,400 498,402 485,330" fill="%23634024"/>
    <polygon points="210,330 205,400 215,400 220,330" fill="%23634024"/>
    <polygon points="410,330 415,400 405,400 400,330" fill="%23634024"/>

    <!-- Sofa Main Backrest Frame -->
    <rect x="100" y="160" width="420" height="150" rx="24" fill="url(%23sofaFabric)"/>
    
    <!-- Backrest Cushions -->
    <rect x="120" y="150" width="125" height="120" rx="16" fill="%23F5EFE6" stroke="%23D5C7B7" stroke-width="1.5"/>
    <rect x="255" y="150" width="125" height="120" rx="16" fill="%23F8F2EA" stroke="%23D5C7B7" stroke-width="1.5"/>
    <rect x="390" y="150" width="125" height="120" rx="16" fill="%23F3EDE3" stroke="%23D5C7B7" stroke-width="1.5"/>

    <!-- Left & Right Track Armrests -->
    <rect x="90" y="210" width="40" height="130" rx="14" fill="%23ECE3D6" stroke="%23D0C2B2" stroke-width="1"/>
    <rect x="505" y="210" width="40" height="130" rx="14" fill="%23ECE3D6" stroke="%23D0C2B2" stroke-width="1"/>

    <!-- Plump Deep Seat Base Cushions -->
    <rect x="120" y="260" width="130" height="75" rx="14" fill="%23FDFBF7" stroke="%23D2C4B3" stroke-width="1.5"/>
    <rect x="255" y="260" width="130" height="75" rx="14" fill="%23FAF5EE" stroke="%23D2C4B3" stroke-width="1.5"/>
    <rect x="390" y="260" width="130" height="75" rx="14" fill="%23F6EFE6" stroke="%23D2C4B3" stroke-width="1.5"/>

    <!-- Scatter Cushions -->
    <!-- Left soft throw cushion -->
    <rect x="140" y="215" width="55" height="55" rx="10" transform="rotate(-12 165 240)" fill="%23DFD3C3" stroke="%23C2B3A1" stroke-width="1"/>
    <!-- Right caramel accent cushion -->
    <rect x="440" y="215" width="55" height="55" rx="10" transform="rotate(10 465 240)" fill="%23BA7A4C" stroke="%239E5F34" stroke-width="1"/>

    <!-- Round Fluted Coffee Table In Front -->
    <ellipse cx="320" cy="400" rx="80" ry="24" fill="%23A17045"/>
    <path d="M 240 375 L 240 410 Q 320 432 400 410 L 400 375 Z" fill="url(%23flutedOak)"/>
    <!-- Fluted vertical lines on table -->
    <line x1="260" y1="380" x2="260" y2="415" stroke="%237A4E29" stroke-width="2"/>
    <line x1="280" y1="383" x2="280" y2="418" stroke="%237A4E29" stroke-width="2"/>
    <line x1="300" y1="385" x2="300" y2="420" stroke="%237A4E29" stroke-width="2"/>
    <line x1="320" y1="385" x2="320" y2="420" stroke="%237A4E29" stroke-width="2"/>
    <line x1="340" y1="385" x2="340" y2="420" stroke="%237A4E29" stroke-width="2"/>
    <line x1="360" y1="383" x2="360" y2="418" stroke="%237A4E29" stroke-width="2"/>
    <line x1="380" y1="380" x2="380" y2="415" stroke="%237A4E29" stroke-width="2"/>
    <ellipse cx="320" cy="375" rx="80" ry="22" fill="%23C9986B"/>

    <!-- Ceramic Bowl On Table -->
    <ellipse cx="318" cy="370" rx="30" ry="9" fill="%23ECE6DC"/>
    <ellipse cx="318" cy="368" rx="25" ry="7" fill="%23DBD3C6"/>

    <!-- Decorative Fiddle-Leaf Fig Plant in background right -->
    <path d="M 545 190 Q 565 160 595 180 Q 575 210 545 190 Z" fill="%23536B4D"/>
    <path d="M 540 215 Q 575 220 585 245 Q 555 255 540 215 Z" fill="%2343583E"/>
    <path d="M 535 240 Q 560 260 575 285 Q 545 290 535 240 Z" fill="%235A7553"/>
  </svg>`,

  // Luxury Bed Scene (Card 2)
  luxuryBed: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 460" width="100%" height="100%">
    <defs>
      <radialGradient id="bedShadow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="%23685A4E" stop-opacity="0.32"/>
        <stop offset="100%" stop-color="%23685A4E" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="headboardFabric" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="%23F6EFE7"/>
        <stop offset="50%" stop-color="%23E8DFD3"/>
        <stop offset="100%" stop-color="%23D5C8B8"/>
      </linearGradient>
      <linearGradient id="linenCover" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="%23FDFDFB"/>
        <stop offset="60%" stop-color="%23F3EDE3"/>
        <stop offset="100%" stop-color="%23DFD5C7"/>
      </linearGradient>
    </defs>
    <!-- Bed Ambient Shadow -->
    <ellipse cx="320" cy="415" rx="260" ry="25" fill="url(%23bedShadow)"/>

    <!-- Deep Channel Tufted Headboard -->
    <rect x="140" y="80" width="360" height="230" rx="16" fill="url(%23headboardFabric)" stroke="%23C9BCAB" stroke-width="2"/>
    <!-- Vertical Channels -->
    <line x1="200" y1="82" x2="200" y2="305" stroke="%23BBAE9C" stroke-width="3"/>
    <line x1="260" y1="82" x2="260" y2="305" stroke="%23BBAE9C" stroke-width="3"/>
    <line x1="320" y1="82" x2="320" y2="305" stroke="%23BBAE9C" stroke-width="3"/>
    <line x1="380" y1="82" x2="380" y2="305" stroke="%23BBAE9C" stroke-width="3"/>
    <line x1="440" y1="82" x2="440" y2="305" stroke="%23BBAE9C" stroke-width="3"/>

    <!-- Left Nightstand & Lamp -->
    <rect x="70" y="260" width="60" height="90" rx="8" fill="%23BA885B"/>
    <rect x="75" y="300" width="50" height="40" rx="4" fill="%23A17147"/>
    <circle cx="100" cy="320" r="3" fill="%23E2BE8D"/>
    <!-- Lamp -->
    <path d="M 90 260 L 100 210 L 110 260 Z" fill="%23EFE9DF"/>
    <polygon points="85,210 115,210 120,185 80,185" fill="%23FAF7F2" stroke="%23DFD6C8" stroke-width="1"/>

    <!-- Right Nightstand -->
    <rect x="510" y="260" width="60" height="90" rx="8" fill="%23BA885B"/>
    <rect x="515" y="300" width="50" height="40" rx="4" fill="%23A17147"/>
    <circle cx="540" cy="320" r="3" fill="%23E2BE8D"/>

    <!-- Bed Upholstered Mattress & Base -->
    <polygon points="140,290 500,290 480,405 160,405" fill="%23DFD6C9"/>
    
    <!-- Plush Layered Pillows -->
    <rect x="170" y="220" width="130" height="70" rx="14" fill="%23FFFFFF" stroke="%23DDD2C4" stroke-width="1.5"/>
    <rect x="340" y="220" width="130" height="70" rx="14" fill="%23FFFFFF" stroke="%23DDD2C4" stroke-width="1.5"/>
    <rect x="185" y="245" width="105" height="55" rx="10" fill="%23EFE7DB" stroke="%23CFC3B3" stroke-width="1.5"/>
    <rect x="350" y="245" width="105" height="55" rx="10" fill="%23B77549" stroke="%239D5F34" stroke-width="1.5"/>

    <!-- Folded Linen Duvet -->
    <path d="M 155 285 L 485 285 L 475 395 L 165 395 Z" fill="url(%23linenCover)"/>
    <path d="M 155 285 Q 320 305 485 285 L 480 325 Q 320 345 160 325 Z" fill="%23EDE3D4"/>
    
    <!-- End of Bed Waffle Throw Blanket -->
    <path d="M 165 360 L 475 360 L 470 405 L 170 405 Z" fill="%23A65F32" stroke="%238C4C24" stroke-width="1"/>
  </svg>`,

  // Limited Time Promo Credenza Scene
  promoCredenza: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 400" width="100%" height="100%">
    <defs>
      <linearGradient id="credenzaOak" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="%23C5996D"/>
        <stop offset="50%" stop-color="%23AC7F53"/>
        <stop offset="100%" stop-color="%238C5F36"/>
      </linearGradient>
      <linearGradient id="brassLamp" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="%23DFBA74"/>
        <stop offset="100%" stop-color="%23A9823C"/>
      </linearGradient>
    </defs>
    <!-- Background subtle oval line decoration -->
    <ellipse cx="400" cy="220" rx="240" ry="140" fill="none" stroke="%23E2D0BE" stroke-width="1.5" stroke-dasharray="6,4"/>

    <!-- Floor Shadow -->
    <ellipse cx="400" cy="355" rx="270" ry="20" fill="%237D6E60" opacity="0.25"/>

    <!-- Credenza Cabinet Sideboard -->
    <!-- Legs -->
    <polygon points="170,290 160,350 170,352 180,290" fill="%23674321"/>
    <polygon points="340,290 350,350 340,352 330,290" fill="%23674321"/>
    <!-- Body -->
    <rect x="150" y="170" width="210" height="130" rx="8" fill="url(%23credenzaOak)"/>
    <!-- 3 Doors -->
    <rect x="155" y="175" width="65" height="120" rx="4" fill="%23BA8D61" stroke="%23966D44" stroke-width="1"/>
    <rect x="223" y="175" width="65" height="120" rx="4" fill="%23C29569" stroke="%23966D44" stroke-width="1"/>
    <rect x="291" y="175" width="65" height="120" rx="4" fill="%23BA8D61" stroke="%23966D44" stroke-width="1"/>
    <!-- Minimalist Knobs -->
    <circle cx="210" cy="235" r="3" fill="%2356371A"/>
    <circle cx="233" cy="235" r="3" fill="%2356371A"/>
    <circle cx="345" cy="235" r="3" fill="%2356371A"/>

    <!-- Ceramic Vase & Botanical Branch on Credenza -->
    <path d="M 270 170 C 265 155, 260 145, 275 145 C 290 145, 285 155, 280 170 Z" fill="%23ECE4D8" stroke="%23CCC0B2" stroke-width="1"/>
    <path d="M 275 145 Q 260 105 250 85" stroke="%2358483B" stroke-width="2" fill="none"/>
    <ellipse cx="250" cy="90" rx="6" ry="12" transform="rotate(-30 250 90)" fill="%23859678"/>
    <ellipse cx="265" cy="115" rx="6" ry="10" transform="rotate(25 265 115)" fill="%23859678"/>

    <!-- Mid-Century Armchair -->
    <!-- Chair Legs -->
    <polygon points="410,280 395,355 405,357 425,280" fill="%235A391D"/>
    <polygon points="530,280 550,355 540,357 515,280" fill="%235A391D"/>
    <!-- Seat & Backrest -->
    <rect x="410" y="180" width="115" height="100" rx="14" fill="%23ECE5DA" stroke="%23D3C6B5" stroke-width="1.5"/>
    <rect x="420" y="250" width="95" height="35" rx="8" fill="%23FAF6F0"/>
    <!-- Sculpted Wooden Arms -->
    <path d="M 395 240 Q 450 220 515 240" stroke="%238C5F36" stroke-width="6" stroke-linecap="round" fill="none"/>

    <!-- Brass Arched Floor Lamp -->
    <ellipse cx="600" cy="350" rx="25" ry="6" fill="%238C6E33"/>
    <line x1="600" y1="350" x2="600" y2="120" stroke="url(%23brassLamp)" stroke-width="3"/>
    <path d="M 600 120 Q 600 90 575 90" stroke="url(%23brassLamp)" stroke-width="3" fill="none"/>
    <!-- Lamp Shade -->
    <path d="M 560 120 L 590 120 L 580 90 L 570 90 Z" fill="%23FAF7F0" stroke="%23D8CFBE" stroke-width="1"/>
    <!-- Warm Light Glow -->
    <polygon points="560,120 590,120 620,240 530,240" fill="%23FEEBC8" opacity="0.18"/>
  </svg>`,

  // Brand imagery
  workshop: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 440" width="100%" height="100%">
    <defs>
      <linearGradient id="woodTable" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="%23A7784A"/>
        <stop offset="100%" stop-color="%237D532A"/>
      </linearGradient>
    </defs>
    <!-- Background Workshop Wall -->
    <rect width="640" height="440" fill="%23F4EFE8"/>
    <!-- Timber Planks on Wall -->
    <rect x="60" y="40" width="520" height="15" fill="%23D8CABB"/>
    <rect x="60" y="70" width="520" height="15" fill="%23D8CABB"/>
    <!-- Hanging Master Joinery Tools -->
    <rect x="120" y="85" width="8" height="60" fill="%238E5E35"/>
    <polygon points="120,145 128,145 126,170 122,170" fill="%239EA5AB"/>
    <rect x="160" y="85" width="10" height="40" rx="2" fill="%23BA7A48"/>
    <rect x="200" y="85" width="14" height="70" fill="%23563B23"/>

    <!-- Artisan Solid Wood Workbench -->
    <rect x="40" y="220" width="560" height="40" rx="4" fill="url(%23woodTable)"/>
    <rect x="70" y="260" width="35" height="160" fill="%23674320"/>
    <rect x="535" y="260" width="35" height="160" fill="%23674320"/>

    <!-- Handcrafted Sofa Solid Beech Wood Frame Being Built -->
    <rect x="140" y="170" width="360" height="18" rx="2" fill="%23D1A572" stroke="%239D7241" stroke-width="1"/>
    <rect x="150" y="110" width="16" height="60" fill="%23D1A572"/>
    <rect x="470" y="110" width="16" height="60" fill="%23D1A572"/>
    <rect x="140" y="100" width="360" height="18" rx="2" fill="%23D1A572"/>

    <!-- Rolls of Luxurious Boucle & Velvet Fabric -->
    <ellipse cx="490" cy="210" rx="25" ry="12" fill="%23A15A2B"/>
    <rect x="465" y="160" width="50" height="50" fill="%23B86B38"/>
    <ellipse cx="490" cy="160" rx="25" ry="12" fill="%23D68651"/>

    <ellipse cx="540" cy="210" rx="22" ry="10" fill="%234A5642"/>
    <rect x="518" y="170" width="44" height="40" fill="%235C6C52"/>
    <ellipse cx="540" cy="170" rx="22" ry="10" fill="%23728667"/>

    <!-- Yellow Traditional Tailor Measuring Tape -->
    <path d="M 120 220 Q 240 235 380 215" stroke="%23E5B537" stroke-width="5" fill="none"/>
  </svg>`
};

/**
 * Fallback generator for category or product if an image fails to load.
 */
export function getProductFallbackImage(name: string, category: string): string {
  const bgColors: Record<string, string> = {
    sofas: '%23F7F2EC',
    beds: '%23F3EDE5',
    'dining-furniture': '%23EFEAE2',
    wardrobes: '%23ECE7DF',
    default: '%23F8F5F0',
  };
  const bg = bgColors[category] || bgColors.default;

  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 400" width="100%" height="100%">
    <rect width="500" height="400" fill="${bg}"/>
    <circle cx="250" cy="180" r="70" fill="%23E2D8CC" opacity="0.6"/>
    <path d="M 210 200 C 210 160, 290 160, 290 200 Z" fill="%23A25828" opacity="0.8"/>
    <rect x="190" y="200" width="120" height="30" rx="8" fill="%23B3642C" opacity="0.85"/>
    <polygon points="205,230 200,260 210,260 215,230" fill="%23684120"/>
    <polygon points="295,230 300,260 290,260 285,230" fill="%23684120"/>
    <text x="250" y="320" font-family="sans-serif" font-size="14" font-weight="600" fill="%23736961" text-anchor="middle">${encodeURIComponent(
      name
    )}</text>
  </svg>`;
}
