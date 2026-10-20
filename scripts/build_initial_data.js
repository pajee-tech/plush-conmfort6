import fs from 'fs';

const currentFile = fs.readFileSync('src/data/initialData.ts', 'utf-8');
const final19 = JSON.parse(fs.readFileSync('scripts/final_19_products.json', 'utf-8'));

// Extract blogs and orders from currentFile
const blogIdx = currentFile.indexOf('export const INITIAL_BLOG_POSTS: BlogPost[] = [');
if (blogIdx === -1) {
  throw new Error('Could not find INITIAL_BLOG_POSTS');
}
const remainder = currentFile.slice(blogIdx);

const fileContent = `import { Category, Product, BlogPost, StoreSettings, Order } from '../types';
import { FURNITURE_IMAGES } from '../utils/imageHelper';

export const INITIAL_SETTINGS: StoreSettings = {
  brandName: 'Plush Comfort UK',
  phone: '+44 7923 119077',
  whatsapp: '+44 7923 119077',
  email: 'plushcomfort@gmail.com',
  address: 'Calder Road, Dewsbury, WF12 9EA, United Kingdom',
  businessHours: 'Monday – Saturday: 9:00 AM – 6:00 PM (Closed Sundays)',
  freeDeliveryThreshold: 150,
  standardDeliveryFee: 39.99,
  whiteGloveDeliveryFee: 79.99,
  promoBannerText: 'Autumn Living Event: Up to 40% off handcrafted sofas & bespoke beds + Free UK delivery over £150',
  isPromoBannerActive: true,
  announcementLink: '/shop',
  logoUrl: '/assets/brand/plush-comfort-official-logo.png',
  logoAlt: 'Plush Comfort UK Official Logo',
};

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-sofas',
    name: 'Sofas',
    slug: 'sofas',
    seoTitle: 'Luxury Handcrafted Sofas UK | Bespoke British Living | Plush Comfort',
    seoDescription: 'Shop handcrafted British sofas made in Yorkshire. Explore corner sofas, 3-seaters, loveseats and sofa beds with European hardwood frames and 10-year warranty.',
    description: 'Bespoke, handcrafted British sofas engineered for cloud-like comfort and timeless elegance.',
    bottomSeoDescription: 'At Plush Comfort, every sofa is meticulously bench-crafted by master upholsterers right here in Yorkshire using kiln-dried European hardwood frames and high-density pocket-sprung bases. Whether you are seeking a grand corner sofa for family gatherings, an elegant 3-seater for a formal living room, or a space-saving chaise sofa bed, our collections offer unmatched durability and bespoke British tailoring. All frames come backed by our comprehensive 10-year structural warranty, delivered directly to your room of choice with our specialist two-man delivery team. Read our comprehensive sofa guide at /blog/uk-sofa-buying-guide for expert advice on sizing and fabric care.',
    image: '/uploads/products/luxury-u-shape-sofa-1.jpg',
    isActive: true,
    order: 1,
    subcategories: [
      { id: 'sub-sofa-corner', name: 'Corner Sofas', slug: 'corner-sofas', description: 'Generous modular and L-shaped sectional sofas designed to maximise seating and living space.' },
      { id: 'sub-sofa-3seater', name: '3-Seater Sofas', slug: '3-seater-sofas', description: 'Classic British family sofas offering deep cushioning and refined proportions.' },
      { id: 'sub-sofa-2seater', name: '2-Seater Sofas', slug: '2-seater-sofas', description: 'Compact loveseats and 2-seater sofas ideal for apartments, snugs, and bay windows.' },
      { id: 'sub-sofa-recliner', name: 'Recliner Sofas', slug: 'recliner-sofas', description: 'Smooth power and manual reclining sofas engineered for ultimate ergonomic relaxation.' },
      { id: 'sub-sofa-bed', name: 'Sofa Beds', slug: 'sofa-beds', description: 'Dual-purpose click-clack and pull-out sofa beds with luxury guest mattresses.' },
      { id: 'sub-sofa-chaise', name: 'Chaise Longues', slug: 'chaise-longues', description: 'Sculptural reading loungers and extended chaise pieces for timeless decadence.' }
    ],
    faqs: [
      { question: 'Are your sofas made in the UK?', answer: 'Yes, every Plush Comfort sofa is handcrafted by skilled upholsterers in our Dewsbury, West Yorkshire workshops using solid hardwood frames and premium fabrics.' },
      { question: 'How do I measure my doorway for sofa delivery?', answer: 'We recommend checking the narrowest doorway width, hallway turns, and ceiling height. Our delivery team offers two-man room-of-choice delivery and removable wooden sofa feet to ensure smooth access.' },
      { question: 'What fabric protection is included?', answer: 'Our fabrics are treated with high-grade Scotchgard stain resistance, and removable cushion covers can be professionally dry cleaned.' }
    ]
  },
  {
    id: 'cat-chesterfield',
    name: 'Chesterfield Sofas',
    slug: 'chesterfield-sofas',
    seoTitle: 'Chesterfield Sofas UK | Hand-Buttoned Leather & Velvet | Plush Comfort',
    seoDescription: 'Authentic British Chesterfield sofas handcrafted in West Yorkshire. Deep button-tufting, scroll arms, pocket sprung seating and solid hardwood frames.',
    description: 'Iconic British heritage Chesterfield sofas featuring deep hand-tufted diamond buttoning, sweeping rolled arms, and opulent upholstery.',
    bottomSeoDescription: 'An undisputed icon of British furniture making, the Chesterfield sofa embodies timeless grandeur and artisan pride. In our Dewsbury workshop, each deep button is hand-pulled through individually pleated leather or plush velvet, anchored firmly into solid beech framework. Fitted with heavy-duty serpentine spring suspension and high-resilience reflex foam cores, our Chesterfields marry historical grandeur with contemporary everyday comfort. Available in antique hand-rubbed leathers and sumptuous stain-resistant velvets.',
    image: '/uploads/products/nicole-3-seater-chesterfield-sofa-in-soft-cream-fabric-1.png',
    isActive: true,
    order: 2,
    subcategories: [
      { id: 'sub-chesterfield-3seater', name: '3-Seater Chesterfields', slug: '3-seater-chesterfields' },
      { id: 'sub-chesterfield-corner', name: 'Chesterfield Corner Sofas', slug: 'chesterfield-corner-sofas' },
      { id: 'sub-chesterfield-chair', name: 'Chesterfield Club Chairs', slug: 'chesterfield-club-chairs' }
    ],
    faqs: [
      { question: 'What makes an authentic Chesterfield sofa?', answer: 'Authentic Chesterfields feature deep diamond button tufting where the folds are manually pleated rather than machine-stitched, rolled arms at equal height to the back, and turned solid wood bun feet.' },
      { question: 'Are Chesterfield sofas comfortable for daily lounging?', answer: 'Yes. While traditional Chesterfields could be quite firm, Plush Comfort combines traditional hand-pleating with modern pocket-sprung bases and high-resilience foam toppers for deep, ergonomic comfort.' }
    ]
  },
  {
    id: 'cat-corner-sofas',
    name: 'Corner Sofas',
    slug: 'corner-sofas',
    seoTitle: 'Luxury Corner & Chaise Sofas UK | Modular Living | Plush Comfort',
    seoDescription: 'Explore deep modular corner sofas and chaise sectionals handcrafted in Yorkshire. Stain-resistant velvets, pocket springs, and room of choice 2-man delivery.',
    description: 'Sprawling modular and L-shaped corner sofas designed to optimize seating space, social relaxation, and generous family lounging.',
    bottomSeoDescription: 'Maximize your living space with Plush Comfort’s modular and L-shaped corner sofas. Hand-built in Yorkshire using solid European beech frames, each sectional is engineered for flexible home layouts with interchangeable left and right-hand chaise units. Features high-tensile steel serpentine springs, memory foam core toppers, and high-performance spill-shield fabrics that wipe clean effortlessly. Delivered in interlocking sections for effortless navigation through narrow UK doorways.',
    image: '/uploads/products/verona-plush-velvet-corner-sofa-grey-fabric-chesterfield-style-l-shape-settee-with-scatter-cushions-1.png',
    isActive: true,
    order: 3,
    subcategories: [
      { id: 'sub-corner-lshape', name: 'L-Shaped Sofas', slug: 'l-shaped-sofas' },
      { id: 'sub-corner-modular', name: 'Modular Sectionals', slug: 'modular-sectionals' },
      { id: 'sub-corner-ushape', name: 'U-Shaped Large Sofas', slug: 'u-shaped-sofas' }
    ],
    faqs: [
      { question: 'Can corner sofas fit through narrow doorways?', answer: 'Yes. All Plush Comfort corner sofas are delivered in modular interlocking sections with removable feet to guarantee seamless passage through standard UK hallways and doorframes.' },
      { question: 'Can I choose left or right chaise orientation?', answer: 'Most of our corner sofas are available with dedicated left-hand, right-hand, or universal reversible chaise configurations.' }
    ]
  },
  {
    id: 'cat-fabric-sofas',
    name: 'Fabric Sofas',
    slug: 'fabric-sofas',
    seoTitle: 'Luxury Fabric Sofas UK | Bouclé, Linen & Velvet | Plush Comfort',
    seoDescription: 'Discover handcrafted British fabric sofas in premium Italian bouclé, Belgian linen and stain-resistant velvet. 10-year frame warranty and white glove delivery.',
    description: 'Tactile, breathable fabric sofas tailored in textured Italian bouclés, Belgian linens, and soft performance velvets.',
    bottomSeoDescription: 'Wrap your home in tactile British warmth with our bespoke fabric sofas. Every piece is dressed in upholstery sourced from historic European and Yorkshire textile mills, rated at 60,000 to 100,000 Martindale rubs for exceptional domestic durability. Pre-treated with Scotchgard stain resistance, our fabrics repel liquid spills while retaining luxurious softness. Built over double-dowelled hardwood skeletons with a 10-year structural guarantee.',
    image: '/uploads/products/oxford-fabric-corner-sofa-in-light-grey-textured-chenille-1.jpg',
    isActive: true,
    order: 4,
    subcategories: [
      { id: 'sub-fabric-linen', name: 'Belgian Linen Sofas', slug: 'linen-sofas' },
      { id: 'sub-fabric-boucle', name: 'Bouclé Sofas', slug: 'boucle-sofas' },
      { id: 'sub-fabric-velvet', name: 'Performance Velvet Sofas', slug: 'velvet-sofas' }
    ],
    faqs: [
      { question: 'Are your sofa fabrics stain-resistant?', answer: 'Yes, our fabrics undergo hydrophobic performance treatment causing liquids to bead on the surface for easy blot-cleaning with a clean cloth.' }
    ]
  },
  {
    id: 'cat-armchairs',
    name: 'Armchairs',
    slug: 'armchairs',
    seoTitle: 'Bespoke Armchairs & Accent Chairs UK | Handcrafted in Yorkshire | Plush Comfort',
    seoDescription: 'Elevate your living space with handcrafted British armchairs, sculptural bouclé accent chairs and fireside wingback seating made in West Yorkshire.',
    description: 'Sculptural accent chairs, supportive reading armchairs, and fireside wingback seating handcrafted to make a refined design statement.',
    bottomSeoDescription: 'An artisan armchair is the defining focal point of any curated living room, reading nook, or master bedroom suite. At Plush Comfort, our armchairs feature steam-bent timber frames, solid Yorkshire-turned oak legs, and cold-cure ergonomic foam cushioning that maintains its silhouette year after year. From tactile bouclé swivel armchairs to traditional high-back wing chairs, discover personal sanctuary comfort.',
    image: 'https://images.unsplash.com/photo-1675767528117-963ce219b52a?q=85&w=1200&h=900',
    isActive: true,
    order: 5,
    subcategories: [
      { id: 'sub-armchair-accent', name: 'Accent Chairs', slug: 'accent-chairs' },
      { id: 'sub-armchair-wingback', name: 'Wingback Armchairs', slug: 'wingback-armchairs' },
      { id: 'sub-armchair-boucle', name: 'Bouclé Armchairs', slug: 'boucle-armchairs' }
    ],
    faqs: [
      { question: 'Do armchairs arrive fully assembled?', answer: 'Yes, the majority of our armchairs arrive fully assembled. Only the solid oak legs may require simple hand-screwing into pre-drilled steel brackets without tools.' }
    ]
  },
  {
    id: 'cat-beds',
    name: 'Beds & Bed Frames',
    slug: 'beds-bed-frames',
    seoTitle: 'Luxury Beds & Bed Frames UK | Handcrafted Ottoman & Wingback Beds | Plush Comfort',
    seoDescription: 'Discover bespoke hydraulic ottoman storage beds and luxury upholstered wingback frames handcrafted in West Yorkshire. Up to 850L dust-free bedroom storage.',
    description: 'Luxury upholstered beds and heavy-duty gas-lift ottoman storage beds handcrafted in West Yorkshire.',
    bottomSeoDescription: 'Transform your bedroom into a tranquil sanctuary with Plush Comfort’s bespoke British bed frames. Our signature ottoman beds feature heavy-duty German gas-lift pistons that effortlessly reveal up to 4x the storage capacity of traditional divan drawers, concealing extra duvets, seasonal clothing, and bedding neatly beneath your mattress. Crafted from sustainably sourced timber with reinforced solid wooden slats and deep-padded wingback headboards, each bed is customisable in over 30 luxury bouclés, velvets, and textured linens.',
    image: '/uploads/products/ambassador-luxury-deep-buttoned-upholstered-bed-frame-1.jpg',
    isActive: true,
    order: 6,
    subcategories: [
      { id: 'sub-bed-ottoman', name: 'Ottoman Beds', slug: 'ottoman-beds', description: 'End-lift and side-lift hydraulic gas-lift storage beds maximizing bedroom floor space.' },
      { id: 'sub-bed-upholstered', name: 'Upholstered Beds', slug: 'upholstered-beds', description: 'Plush winged and channel-tufted fabric beds designed as architectural focal points.' },
      { id: 'sub-bed-wooden', name: 'Wooden Bed Frames', slug: 'wooden-bed-frames', description: 'Solid natural oak, walnut, and pine frames showcasing organic grain craftsmanship.' }
    ],
    faqs: [
      { question: 'How much weight can your Ottoman beds support?', answer: 'Our reinforced steel sub-frames and hydraulic pistons safely support up to 300kg of mattress and occupant weight while remaining feather-light to lift.' },
      { question: 'Which bed sizes are available?', answer: 'All of our beds follow standard UK sizing: Single (3ft), Small Double (4ft), Double (4ft6), King (5ft), and Super King (6ft).' },
      { question: 'Is assembly included?', answer: 'We offer white-glove assembly across mainland UK where our drivers build the bed in your room of choice and remove all packaging.' }
    ]
  },
  {
    id: 'cat-divan-beds',
    name: 'Divan Beds',
    slug: 'divan-beds',
    seoTitle: 'British Divan Beds & Bases with Storage | Plush Comfort Yorkshire',
    seoDescription: 'Handcrafted UK divan beds with continental drawer storage and deep-tufted headboards. Solid timber frames with 10-year structural warranty.',
    description: 'Classic British divan bases with reinforced solid timber frames, smooth-gliding storage drawers, and floor-standing tufted headboards.',
    bottomSeoDescription: 'The quintessence of British bedroom craftsmanship, our Divan Beds combine sturdy solid pine box construction with custom continental drawer arrangements. Choose 2-drawer, 4-drawer, or continental head-end drawer layouts designed to open smoothly even with bedside tables in place. Upholstered in our full palette of Yorkshire linens and velvets, with optional matching Chesterfield and fluted headboards.',
    image: '/uploads/products/double-ottoman-divan-bed-set-with-orthopaedic-mattress-vertical-panelled-headboard-1.jpg',
    isActive: true,
    order: 7,
    subcategories: [
      { id: 'sub-divan-2drawer', name: '2-Drawer Divans', slug: '2-drawer-divans' },
      { id: 'sub-divan-4drawer', name: '4-Drawer Divans', slug: '4-drawer-divans' },
      { id: 'sub-divan-reinforced', name: 'Heavy Duty Divans', slug: 'heavy-duty-divans' }
    ],
    faqs: [
      { question: 'What is a continental drawer layout?', answer: 'Continental drawers feature smaller drawers at the head-end of the bed so they can be pulled out freely without colliding with bedside tables.' }
    ]
  },
  {
    id: 'cat-mattresses',
    name: 'Mattresses',
    slug: 'mattresses',
    seoTitle: 'Orthopaedic & Pocket Sprung Luxury Mattresses UK | Plush Comfort',
    seoDescription: 'Experience restorative British sleep with hand-tufted pocket sprung, natural wool and cooling memory foam mattresses. 100-night trial and free UK delivery.',
    description: 'Orthopaedic pocket-sprung, pure British wool, and temperature-regulating memory foam mattresses for restorative slumber.',
    bottomSeoDescription: 'Engineered for optimal spinal alignment and pressure relief, Plush Comfort mattresses are hand-tufted in Yorkshire using up to 3,000 individually responsive pocket springs. Layered with natural breathable fillings including British sheep wool, organic cotton, and cool-gel infused reflex foam, our mattresses prevent motion transfer between sleeping partners. Tested to UK BS 7177 flammability standards with a 100-night sleep trial guarantee.',
    image: 'https://images.unsplash.com/photo-1545858899-278ffaa47025?q=85&w=1200&h=900',
    isActive: true,
    order: 8,
    subcategories: [
      { id: 'sub-mat-pocket', name: 'Pocket Sprung Mattresses', slug: 'pocket-sprung-mattresses' },
      { id: 'sub-mat-ortho', name: 'Orthopaedic Firm Mattresses', slug: 'orthopaedic-mattresses' },
      { id: 'sub-mat-natural', name: 'Natural Wool Mattresses', slug: 'natural-wool-mattresses' }
    ],
    faqs: [
      { question: 'Do your mattresses come with a trial period?', answer: 'Yes! We provide a 100-night comfort trial. If your new mattress is not providing perfect sleep, we will exchange or refund it hassle-free.' },
      { question: 'What firmness ratings are available?', answer: 'We offer Medium-Soft, Medium-Firm (our most popular balance for back and side sleepers), and Extra Firm Orthopaedic support.' }
    ]
  },
  {
    id: 'cat-wardrobes',
    name: 'Wardrobes',
    slug: 'wardrobes',
    seoTitle: 'Luxury Bedroom Wardrobes & Storage Solutions UK | Plush Comfort',
    seoDescription: 'Premium British freestanding and sliding wardrobes with soft-close mechanisms, custom internal shelving and solid timber finishes.',
    description: 'Freestanding, sliding-door, and fitted-look wardrobes engineered for smart, dust-free bedroom organization.',
    bottomSeoDescription: 'Elevate your bedroom storage with Plush Comfort’s precision-engineered wardrobes. Featuring German soft-close door dampers, full-extension hanging rails, and modular interior shelf partitions, each wardrobe combines clean contemporary architectural aesthetics with heavy-duty construction. Built to harmonize seamlessly with our handcrafted beds and sideboards.',
    image: 'https://images.unsplash.com/photo-1681381606316-426c1605dde3?q=85&w=1200&h=900',
    isActive: true,
    order: 9,
    subcategories: [
      { id: 'sub-wardrobes-sliding', name: 'Sliding Wardrobes', slug: 'sliding-wardrobes' },
      { id: 'sub-wardrobes-hinged', name: 'Hinged 2 & 3 Door Wardrobes', slug: 'hinged-wardrobes' },
      { id: 'sub-wardrobes-mirrored', name: 'Mirrored Wardrobes', slug: 'mirrored-wardrobes' }
    ],
    faqs: [
      { question: 'Is wardrobe assembly available?', answer: 'Yes, our two-man white-glove logistics team offers full assembly and packaging removal right inside your bedroom.' }
    ]
  }
];

export const INITIAL_PRODUCTS: Product[] = ${JSON.stringify(final19, null, 2)};

${remainder}
`;

fs.writeFileSync('src/data/initialData.ts', fileContent);
console.log('Successfully wrote src/data/initialData.ts with all 19 authentic products, 9 categories and official logo!');
