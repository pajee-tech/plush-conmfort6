import { Category, Product, BlogPost, StoreSettings, Order, HomepageSection } from '../types/index';
import { FURNITURE_IMAGES } from '../utils/imageHelper';

export const DEFAULT_HOMEPAGE_SECTIONS: HomepageSection[] = [
  {
    id: 'hero',
    type: 'hero',
    title: 'Flagship Interactive Hero Showcase',
    subtitle: 'Premium UK Online Furniture Store',
    description: 'Luxury sofas & ottoman beds delivered across the UK',
    order: 1,
    isVisible: true,
  },
  {
    id: 'dual_promos',
    type: 'dual_promos',
    title: 'Featured Collection Cards',
    subtitle: 'Living Room Collection',
    description: 'Direct showcase cards for Corner Sofas and Luxury Beds',
    image: '/uploads/products/nicole-3-seater-chesterfield-sofa-in-soft-cream-fabric-1.webp',
    order: 2,
    isVisible: true,
  },
  {
    id: 'categories',
    type: 'categories',
    title: 'Shop by Category',
    subtitle: 'Curated British Catalog',
    description: 'Explore all handcrafted living and bedroom collections',
    order: 3,
    isVisible: true,
  },
  {
    id: 'trending',
    type: 'trending',
    title: 'Trending Customer Favourites',
    subtitle: 'Plush Comfort UK Bestsellers',
    description: 'Our most-loved sofas and beds — free UK delivery, 1 year warranty and cash on delivery.',
    productIds: ['prod-216', 'prod-194', 'prod-223', 'prod-180', 'prod-130'],
    order: 4,
    isVisible: true,
  },
  {
    id: 'under_2500',
    type: 'under_2500',
    title: 'Shop Furniture Under £2,500',
    subtitle: 'Luxury Within Reach',
    description: 'Luxury suites, corner sofas and storage beds at honest online prices.',
    productIds: ['prod-216', 'prod-194', 'prod-180', 'prod-130'],
    order: 5,
    isVisible: true,
  },
  {
    id: 'sofas',
    type: 'sofas',
    title: 'Sofas & Living Room Suites',
    subtitle: 'Sofas & Living Room',
    description: 'Kiln-dried beech frames, high-tensile serpentine springs, and stain-resistant luxury velvets.',
    productIds: ['prod-216', 'prod-223', 'prod-180', 'prod-181'],
    order: 6,
    isVisible: true,
  },
  {
    id: 'beds',
    type: 'beds',
    title: 'Luxury Beds & Ottoman Frames',
    subtitle: 'Bespoke Bedroom Storage',
    description: 'German hydraulic gas pistons, reinforced timber slats, and deep diamond wingback headboards.',
    productIds: ['prod-194', 'prod-130', 'prod-195', 'prod-131'],
    order: 7,
    isVisible: true,
  },
  {
    id: 'deal_banner',
    type: 'deal_banner',
    title: 'Save up to £400 Off Handcrafted Suites',
    subtitle: 'Limited Autumn Promotion · Free UK Delivery',
    description: 'Every order includes free UK mainland delivery, a 1 year warranty, 30-day exchange or return, and cash on delivery.',
    image: '/uploads/products/nicole-32-chesterfield-sofa-set-in-soft-fabric-with-studded-detail-1.webp',
    ctaText: 'Shop Autumn Sale',
    ctaLink: '/shop',
    order: 8,
    isVisible: true,
  },
  {
    id: 'guides',
    type: 'guides',
    title: 'Home Inspiration & Buying Guides',
    subtitle: 'Expert British upholstery guides, doorway clearances & hydraulic ottoman storage advice.',
    order: 9,
    isVisible: true,
  },
];

export const INITIAL_SETTINGS: StoreSettings = {
  brandName: 'Plush Comfort UK',
  phone: '+44 7923 119077',
  whatsapp: '+44 7923 119077',
  email: 'plushcomfort@gmail.com',
  address: 'Registered in England & Wales',
  businessHours: 'Monday – Saturday: 9:00 AM – 6:00 PM (Closed Sundays)',
  freeDeliveryThreshold: 150,
  standardDeliveryFee: 39.99,
  whiteGloveDeliveryFee: 79.99,
  promoBannerText: 'Autumn Living Event: Up to 40% off handcrafted sofas & bespoke beds + Free UK delivery over £150',
  isPromoBannerActive: true,
  announcementLink: '/shop',
  logoUrl: '/assets/brand/plush-comfort-official-logo.webp',
  logoAlt: 'Plush Comfort UK Official Logo',
  faviconUrl: '/favicon.ico',
  heroDesign: {
    heading: 'British Craftsmanship, Tailored for Comfort',
    subheading: 'Premium sofas, corner suites and ottoman beds — ordered online and delivered free to your door.',
    description: 'Deep-seated comfort, premium velvets and solid frames — with free UK mainland delivery and cash on delivery.',
    desktopImage: '/uploads/products/verona-plush-velvet-corner-sofa-grey-fabric-chesterfield-style-l-shape-settee-with-scatter-cushions-1.webp',
    mobileImage: '/uploads/products/verona-plush-velvet-corner-sofa-grey-fabric-chesterfield-style-l-shape-settee-with-scatter-cushions-2.webp',
    imageAlt: 'Verona plush velvet corner sofa',
    primaryCtaText: 'Shop Handcrafted Sofas',
    primaryCtaLink: '/category/sofas',
    secondaryCtaText: 'Explore Bespoke Beds',
    secondaryCtaLink: '/category/beds-bed-frames',
    alignment: 'left',
    showTrustBadges: true,
    showFloatingCard: true,
    isVisible: true,
  },
  megaMenuDesign: {
    columns: [
      {
        id: 'col-sofas',
        title: 'Sofas & Sectionals',
        links: [
          { title: 'All Sofas', url: '/category/sofas' },
          { title: 'Chesterfield Sofas', url: '/category/chesterfield-sofas', badge: 'Popular' },
          { title: 'Corner Sofas & L-Shape', url: '/category/corner-sofas' },
          { title: 'Fabric & Velvet Sofas', url: '/category/fabric-sofas' },
          { title: 'Armchairs & Cuddle Chairs', url: '/category/armchairs' },
        ],
      },
      {
        id: 'col-beds',
        title: 'Beds & Sleep',
        links: [
          { title: 'Beds & Bed Frames', url: '/category/beds-bed-frames' },
          { title: 'Ottoman Storage Beds', url: '/category/ottoman-beds', badge: 'Best Seller' },
          { title: 'Orthopaedic Mattresses', url: '/category/mattresses' },
          { title: 'Living Room Furniture', url: '/category/living-room-furniture' },
        ],
      },
      {
        id: 'col-guides',
        title: 'Buying Guides & Care',
        links: [
          { title: 'Sofa Buying Guide 2026', url: '/blog' },
          { title: 'Ottoman Bed Storage Guide', url: '/blog' },
          { title: 'Velvet Fabric Care Guide', url: '/blog' },
          { title: 'Measuring Your Living Room', url: '/blog' },
        ],
      },
    ],
    promoImage: '/uploads/products/ambassador-luxury-deep-buttoned-upholstered-bed-frame-1.webp',
    promoTitle: 'Ambassador Deep-Tufted Ottoman Bed',
    promoTag: 'Special Offer',
    promoLink: '/product/ambassador-luxury-deep-buttoned-upholstered-bed-frame',
    promoDescription: 'Gas-lift hydraulic storage with handcrafted buttoned chesterfield headboard. Made to order.',
    isVisible: true,
  },
  footerDesign: {
    aboutText: 'Plush Comfort UK is an online furniture store delivering luxury sofas, corner suites and ottoman beds across the UK — with free delivery, a 1 year warranty and cash on delivery.',
    columns: [
      {
        id: 'col-shop',
        title: 'Shop Collections',
        links: [
          { title: 'Handcrafted Sofas', url: '/category/sofas' },
          { title: 'Chesterfield Suites', url: '/category/chesterfield-sofas' },
          { title: 'Corner & U-Shape Sofas', url: '/category/corner-sofas' },
          { title: 'Ottoman Storage Beds', url: '/category/ottoman-beds' },
          { title: 'Pocket Sprung Mattresses', url: '/category/mattresses' },
          { title: 'Shop All Products', url: '/shop' },
        ],
      },
      {
        id: 'col-care',
        title: 'Customer Care',
        links: [
          { title: 'UK Delivery & White Glove', url: '/delivery' },
          { title: '30-Day Exchange & Returns', url: '/returns' },
          { title: 'Track Your Order', url: '/account' },
          { title: 'Saved Wishlist', url: '/wishlist' },
          { title: 'Frequently Asked Questions', url: '/faqs' },
          { title: 'Contact Customer Care', url: '/contact' },
        ],
      },
      {
        id: 'col-guides',
        title: 'Inspiration & Guides',
        links: [
          { title: 'Sofa Buying Guide', url: '/blog' },
          { title: 'Fabric & Velvet Care', url: '/blog' },
          { title: 'Room Measuring Tips', url: '/blog' },
          { title: 'About Plush Comfort', url: '/about' },
        ],
      },
    ],
    phone: '+44 7923 119077',
    whatsapp: '+44 7923 119077',
    email: 'plushcomfort@gmail.com',
    address: '',
    openingHours: 'Mon - Sat: 9:00 AM - 6:00 PM | Sun: Closed',
    socialInstagram: 'https://instagram.com/plushcomfortuk',
    socialFacebook: 'https://facebook.com/plushcomfortuk',
    socialPinterest: 'https://pinterest.com/plushcomfortuk',
    copyrightText: '© 2026 Plush Comfort UK. All rights reserved. Registered in England & Wales.',
  },
  homepageSections: DEFAULT_HOMEPAGE_SECTIONS,
};

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-sofas',
    name: 'Sofas',
    slug: 'sofas',
    seoTitle: 'Luxury Handcrafted Sofas UK | Bespoke British Living | Plush Comfort',
    seoDescription: 'Shop handcrafted British sofas delivered across the UK. Explore corner sofas, 3-seaters, loveseats and sofa beds with European hardwood frames and 1 year warranty.',
    description: 'Bespoke, handcrafted British sofas engineered for cloud-like comfort and timeless elegance.',
    bottomSeoDescription: 'At Plush Comfort, every sofa is built using kiln-dried European hardwood frames and high-density pocket-sprung bases. Whether you are seeking a grand corner sofa for family gatherings, an elegant 3-seater for a formal living room, or a space-saving chaise sofa bed, our collections offer unmatched durability and bespoke British tailoring. All frames come backed by our 1 year warranty, delivered directly to your room of choice with our specialist two-man delivery team. Read our comprehensive sofa guide at /blog/uk-sofa-buying-guide for expert advice on sizing and fabric care.',
    image: '/uploads/products/luxury-u-shape-sofa-1.webp',
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
      { question: 'Do you deliver sofas across the UK?', answer: 'Yes. Every Plush Comfort sofa is delivered free to UK mainland addresses, comes with a 1 year warranty, and you pay by cash on delivery.' },
      { question: 'How do I measure my doorway for sofa delivery?', answer: 'We recommend checking the narrowest doorway width, hallway turns, and ceiling height. Our delivery team offers two-man room-of-choice delivery and removable wooden sofa feet to ensure smooth access.' },
      { question: 'What fabric protection is included?', answer: 'Our fabrics are treated with high-grade Scotchgard stain resistance, and removable cushion covers can be professionally dry cleaned.' }
    ]
  },
  {
    id: 'cat-chesterfield-sofas',
    name: 'Chesterfield Sofas',
    slug: 'chesterfield-sofas',
    seoTitle: 'Chesterfield Sofas UK | Hand-Buttoned Leather & Velvet | Plush Comfort',
    seoDescription: 'Authentic British Chesterfield sofas delivered across the UK. Deep button-tufting, scroll arms, pocket sprung seating and solid hardwood frames.',
    description: 'Iconic British heritage Chesterfield sofas featuring deep hand-tufted diamond buttoning, sweeping rolled arms, and opulent upholstery.',
    bottomSeoDescription: 'An undisputed icon of British furniture making, the Chesterfield sofa embodies timeless grandeur and artisan pride. Each deep button is hand-pulled through individually pleated leather or plush velvet, anchored firmly into solid beech framework. Fitted with heavy-duty serpentine spring suspension and high-resilience reflex foam cores, our Chesterfields marry historical grandeur with contemporary everyday comfort. Available in antique hand-rubbed leathers and sumptuous stain-resistant velvets.',
    image: '/uploads/products/nicole-3-seater-chesterfield-sofa-in-soft-cream-fabric-1.webp',
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
    seoDescription: 'Explore deep modular corner sofas and chaise sectionals delivered across the UK. Stain-resistant velvets, pocket springs, and room of choice 2-man delivery.',
    description: 'Sprawling modular and L-shaped corner sofas designed to optimize seating space, social relaxation, and generous family lounging.',
    bottomSeoDescription: 'Maximize your living space with Plush Comfort’s modular and L-shaped corner sofas. Built using solid European beech frames, each sectional is engineered for flexible home layouts with interchangeable left and right-hand chaise units. Features high-tensile steel serpentine springs, memory foam core toppers, and high-performance spill-shield fabrics that wipe clean effortlessly. Delivered in interlocking sections for effortless navigation through narrow UK doorways.',
    image: '/uploads/products/verona-plush-velvet-corner-sofa-grey-fabric-chesterfield-style-l-shape-settee-with-scatter-cushions-1.webp',
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
    seoDescription: 'Discover handcrafted British fabric sofas in premium Italian bouclé, Belgian linen and stain-resistant velvet. 1 year warranty and white glove delivery.',
    description: 'Tactile, breathable fabric sofas tailored in textured Italian bouclés, Belgian linens, and soft performance velvets.',
    bottomSeoDescription: 'Wrap your home in tactile British warmth with our bespoke fabric sofas. Every piece is dressed in upholstery sourced from trusted European textile mills, rated at 60,000 to 100,000 Martindale rubs for exceptional domestic durability. Pre-treated with Scotchgard stain resistance, our fabrics repel liquid spills while retaining luxurious softness. Built over double-dowelled hardwood skeletons with a 1 year warranty.',
    image: '/uploads/products/oxford-fabric-corner-sofa-in-light-grey-textured-chenille-1.webp',
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
    seoTitle: 'Bespoke Armchairs & Accent Chairs UK | Plush Comfort',
    seoDescription: 'Elevate your living space with handcrafted British armchairs, sculptural bouclé accent chairs and fireside wingback seating delivered across the UK.',
    description: 'Sculptural accent chairs, supportive reading armchairs, and fireside wingback seating handcrafted to make a refined design statement.',
    bottomSeoDescription: 'An artisan armchair is the defining focal point of any curated living room, reading nook, or master bedroom suite. At Plush Comfort, our armchairs feature steam-bent timber frames, turned oak legs, and cold-cure ergonomic foam cushioning that maintains its silhouette year after year. From tactile bouclé swivel armchairs to traditional high-back wing chairs, discover personal sanctuary comfort.',
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
    id: 'cat-beds-bed-frames',
    name: 'Beds & Bed Frames',
    slug: 'beds-bed-frames',
    seoTitle: 'Luxury Beds & Bed Frames UK | Handcrafted Ottoman & Wingback Beds | Plush Comfort',
    seoDescription: 'Discover bespoke hydraulic ottoman storage beds and luxury upholstered wingback frames delivered across the UK. Up to 850L dust-free bedroom storage.',
    description: 'Luxury upholstered beds and heavy-duty gas-lift ottoman storage beds delivered across the UK.',
    bottomSeoDescription: 'Transform your bedroom into a tranquil sanctuary with Plush Comfort’s bespoke British bed frames. Our signature ottoman beds feature heavy-duty German gas-lift pistons that effortlessly reveal up to 4x the storage capacity of traditional divan drawers, concealing extra duvets, seasonal clothing, and bedding neatly beneath your mattress. Crafted from sustainably sourced timber with reinforced solid wooden slats and deep-padded wingback headboards, each bed is customisable in over 30 luxury bouclés, velvets, and textured linens.',
    image: '/uploads/products/ambassador-luxury-deep-buttoned-upholstered-bed-frame-1.webp',
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
    seoTitle: 'British Divan Beds & Bases with Storage | Plush Comfort UK',
    seoDescription: 'Handcrafted UK divan beds with continental drawer storage and deep-tufted headboards. Solid timber frames with 1 year warranty.',
    description: 'Classic British divan bases with reinforced solid timber frames, smooth-gliding storage drawers, and floor-standing tufted headboards.',
    bottomSeoDescription: 'The quintessence of British bedroom craftsmanship, our Divan Beds combine sturdy solid pine box construction with custom continental drawer arrangements. Choose 2-drawer, 4-drawer, or continental head-end drawer layouts designed to open smoothly even with bedside tables in place. Upholstered in a full palette of linens and velvets, with optional matching Chesterfield and fluted headboards.',
    image: '/uploads/products/double-ottoman-divan-bed-set-with-orthopaedic-mattress-vertical-panelled-headboard-1.webp',
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
    bottomSeoDescription: 'Engineered for optimal spinal alignment and pressure relief, Plush Comfort mattresses are hand-tufted using up to 3,000 individually responsive pocket springs. Layered with natural breathable fillings including British sheep wool, organic cotton, and cool-gel infused reflex foam, our mattresses prevent motion transfer between sleeping partners. Tested to UK BS 7177 flammability standards with a 100-night sleep trial guarantee.',
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

export const INITIAL_PRODUCTS: Product[] = [
  {
    "id": "prod-223",
    "name": "Luxury Grey Crushed Velvet U-Shape Sofa",
    "slug": "luxury-grey-crushed-velvet-u-shape-sofa",
    "sku": "PC-UK-223",
    "categoryId": "cat-corner-sofas",
    "subcategoryId": "sub-u-shape",
    "price": 1799,
    "salePrice": 1449,
    "stock": 8,
    "lowStockThreshold": 2,
    "images": [
      "/uploads/products/luxury-grey-crushed-velvet-u-shape-sofa-1.webp",
      "/uploads/products/luxury-grey-crushed-velvet-u-shape-sofa-2.webp",
      "/uploads/products/luxury-grey-crushed-velvet-u-shape-sofa-3.webp",
      "/uploads/products/luxury-grey-crushed-velvet-u-shape-sofa-4.webp",
      "/uploads/products/luxury-grey-crushed-velvet-u-shape-sofa-5.webp",
      "/uploads/products/luxury-grey-crushed-velvet-u-shape-sofa-6.webp"
    ],
    "shortDescription": "Upgrade your living room with this ultra-luxury U-shaped corner sofa in shimmering champagne-grey crushed velvet. Designed for spacious UK homes, this large modular settee features deep foam-filled seating, plush scatter cushions, sleek modern chrome feet, and a matching padded footstool to create the ultimate lounge experience for family relaxation and entertaining.",
    "fullDescription": "Transform your home into a high-end sanctuary with our Luxury Crushed Velvet U-Shape Corner Sofa. Tailored specifically for modern UK living interiors, this expansive modular settee seamlessly blends glamorous aesthetics with sink-in comfort, making it the perfect focal point for open-plan lounge areas and modern living rooms.\n\n\nUpholstered in premium, shimmer-effect crushed velvet fabric, this U-shaped sofa catches the light beautifully while delivering a soft, luxurious touch. The grand U-shape configuration provides generous seating space, paired with a versatile matching footstool that creates a seamless lounge setup. Deep, high-resilience foam seats ensure exceptional support that maintains its shape over time, complemented by plush back cushions and stylish striped accent pillows.\n\n\nBuilt on a sturdy, reinforced wooden frame, this large settee is finished with low-profile modern metallic feet for superior structural stability and contemporary flair.\n\n\nKey Features\n\n\nHigh-Search UK Keywords: Luxury U-Shape Sofa, Large Modular Settee, Crushed Velvet Corner Sofa, Grey U-Shaped Sectional.\n\n\nPremium Fabric Upholstery: Durable, soft-touch crushed velvet with a multi-tonal luxury sheen.\n\n\nSpacious U-Shape Layout: Maximizes seating capacity, perfect for large families and hosting guests.\n\n\nComplete Lounge Set: Includes a matching oversized footstool and decorative accent cushions.\n\n\nSuperior Comfort Construction: High-density foam seating with a sturdy frame and modern chrome feet.",
    "dimensions": {
      "width": 340,
      "height": 90,
      "depth": 200,
      "seatHeight": 48
    },
    "materials": [
      "Crushed Velvet",
      "Kiln-Dried Hardwood",
      "High-Density Reflex Foam",
      "Chrome Glides"
    ],
    "colours": [
      {
        "name": "Champagne Grey",
        "hex": "#A8A49D"
      },
      {
        "name": "Silver Slate",
        "hex": "#8E9094"
      }
    ],
    "tags": [
      "U-Shape Sofa",
      "Crushed Velvet",
      "Corner Sofa",
      "Living Room",
      "Bespoke"
    ],
    "isPublished": true,
    "isFeatured": true,
    "isTrending": true,
    "deliveryInfo": "Free 2-man room-of-choice UK delivery. Handcrafted to order and delivered in 5–10 working days.",
    "careInstructions": "Gently vacuum upholstery with a soft brush attachment. Blot liquid spills immediately with an absorbent uncoloured cloth. Professional cleaning recommended.",
    "assemblyRequired": false,
    "seoTitle": "Luxury Grey Crushed Velvet U-Shape Sofa | Plush Comfort UK",
    "seoDescription": "Shop the Luxury Grey Crushed Velvet U-Shape Sofa at Plush Comfort UK. Grand 340cm dual-chaise layout, deep foam seating, and premium craftsmanship.",
    "rating": 4.8,
    "reviewCount": 14,
    "relatedProductIds": [
      "prod-216",
      "prod-174",
      "prod-152",
      "prod-124"
    ],
    "complementaryProductIds": [
      "prod-23"
    ],
    "reviews": []
  },
  {
    "id": "prod-216",
    "name": "Verona Plush Velvet Corner Sofa – Grey Fabric Chesterfield Style L-Shape Settee with Scatter Cushions",
    "slug": "verona-plush-velvet-corner-sofa-grey-fabric-chesterfield-style-l-shape-settee-with-scatter-cushions",
    "sku": "PC-UK-216",
    "categoryId": "cat-corner-sofas",
    "subcategoryId": "sub-corner-l-shape",
    "price": 1250,
    "salePrice": 849,
    "stock": 8,
    "lowStockThreshold": 2,
    "images": [
      "/uploads/products/verona-plush-velvet-corner-sofa-grey-fabric-chesterfield-style-l-shape-settee-with-scatter-cushions-1.webp",
      "/uploads/products/verona-plush-velvet-corner-sofa-grey-fabric-chesterfield-style-l-shape-settee-with-scatter-cushions-2.webp",
      "/uploads/products/verona-plush-velvet-corner-sofa-grey-fabric-chesterfield-style-l-shape-settee-with-scatter-cushions-3.webp",
      "/uploads/products/verona-plush-velvet-corner-sofa-grey-fabric-chesterfield-style-l-shape-settee-with-scatter-cushions-4.webp"
    ],
    "shortDescription": "Transform your living room with the luxury Verona Plush Velvet Corner Sofa in sleek grey. Combining classic Chesterfield deep-tufted scroll arms with contemporary plush velvet upholstery, this spacious L-shaped settee features high-density foam seat cushions, modern chrome feet, and a mix of patterned scatter cushions for ultimate comfort and style.",
    "fullDescription": "Elevate your home decor with the exquisite Verona Plush Velvet Corner Sofa, designed to bring timeless grandeur and relaxed comfort into any modern UK living area. Blending classic British upholstery heritage with modern interior trends, this grey corner sofa serves as a stunning centerpiece for family lounging or entertaining guests.\n\n\nCrafted with attention to detail, the Verona features signature Chesterfield-inspired rolled arms adorned with classic button tufting, paired with sleek silver chrome feet that add a clean, contemporary edge. Covered in a soft-touch, durable plush velvet fabric, it offers a luxurious feel while standing up to daily family life.\n\n\nThe soft scatter-back arrangement includes a mix of plain velvet, cozy plaid tartan patterns, and subtle stag motif cushions, allowing you to tailor your seating comfort. High-resilience foam-filled seat cushions ensure long-lasting support without losing shape, providing the ideal blend of sink-in softness and sturdy ergonomics.\n\n\nKey Features\n\n\nPremium Upholstery: Soft, heavy-duty grey plush velvet fabric designed for comfort and longevity.\n\n\nChesterfield Detailing: Deep-buttoned, rolled scroll arms for a classic touch.\n\n\nScatter-Back Design: Includes coordinating plain, tartan plaid, and stag-print accent cushions.\n\n\nSuperior Comfort: Deep, foam-filled seat cushions paired with a strong internal hardwood frame.\n\n\nModern Accents: Sleek, low-profile chrome feet for clean support.",
    "dimensions": {
      "width": 260,
      "height": 88,
      "depth": 260,
      "seatHeight": 46
    },
    "materials": [
      "Premium Plush Velvet",
      "Solid Beech Frame",
      "Pocket Sprung Core",
      "Carved Wood Feet"
    ],
    "colours": [
      {
        "name": "Mink Grey",
        "hex": "#8E877F"
      },
      {
        "name": "Pebble Grey",
        "hex": "#9E9E9E"
      }
    ],
    "tags": [
      "Verona Sofa",
      "Plush Velvet",
      "Chesterfield Corner",
      "Scatter Cushions",
      "Grey Sofa"
    ],
    "isPublished": true,
    "isFeatured": true,
    "isTrending": true,
    "deliveryInfo": "Free 2-man room-of-choice UK delivery. Handcrafted to order and delivered in 5–10 working days.",
    "careInstructions": "Gently vacuum upholstery with a soft brush attachment. Blot liquid spills immediately with an absorbent uncoloured cloth. Professional cleaning recommended.",
    "assemblyRequired": false,
    "seoTitle": "Verona Plush Velvet Corner Sofa – Grey Fabric Chesterfield Style | Plush Comfort UK",
    "seoDescription": "The Verona Plush Velvet Corner Sofa combines Chesterfield scrolled buttoning with relaxed scatter cushions. Handcrafted with kiln-dried timber frames.",
    "rating": 4.8,
    "reviewCount": 17,
    "relatedProductIds": [
      "prod-223",
      "prod-174",
      "prod-152",
      "prod-124"
    ],
    "complementaryProductIds": [
      "prod-23"
    ],
    "reviews": []
  },
  {
    "id": "prod-194",
    "name": "Ambassador Luxury Deep-Buttoned Upholstered Bed Frame",
    "slug": "ambassador-luxury-deep-buttoned-upholstered-bed-frame",
    "sku": "PC-UK-194",
    "categoryId": "cat-beds-bed-frames",
    "subcategoryId": "sub-upholstered-beds",
    "price": 1150,
    "salePrice": 899,
    "stock": 8,
    "lowStockThreshold": 2,
    "images": [
      "/uploads/products/ambassador-luxury-deep-buttoned-upholstered-bed-frame-1.webp",
      "/uploads/products/ambassador-luxury-deep-buttoned-upholstered-bed-frame-2.webp",
      "/uploads/products/ambassador-luxury-deep-buttoned-upholstered-bed-frame-3.webp",
      "/uploads/products/ambassador-luxury-deep-buttoned-upholstered-bed-frame-4.webp",
      "/uploads/products/ambassador-luxury-deep-buttoned-upholstered-bed-frame-5.webp"
    ],
    "shortDescription": "Transform your bedroom into a opulent retreat with the Ambassador Upholstered Bed Frame. Featuring a grand floor-standing headboard, matching deep-buttoned footboard, and padded side rails, this bespoke frame combines grand Chesterfield styling with premium comfort. Available in Double, King, and Super King sizes across a wide selection of bespoke velvet fabric colours.",
    "fullDescription": "Grand Luxury Design for the Modern Bedroom\n\n\nMake an unmistakable statement with the Ambassador Bed Frame, designed to bring boutique hotel grandeur directly to your master bedroom. Defined by its impressive floor-standing headboard, matching low footboard, and thick plush upholstery, the Ambassador frame features all-over deep diamond tufting that creates an ultra-luxurious, grand silhouette.\n\n\nBespoke UK Craftsmanship & Premium Fabrics\n\n\nHand-upholstered to the highest standards, the Ambassador bed frame is built with quality and comfort in mind:\n\n\nAll-Over Deep Button Tufting: Features deep diamond-tufted detailing across the headboard, footboard, and extended side rails for 360-degree luxury.\n\n\nGrand Floor-Standing Headboard: Creates a striking focal point, providing soft, padded support for late-night reading or relaxing.\n\n\nCustom Colour & Fabric Options: Personalise your bed to match your decor, with choices ranging from deep Navy Blue, Royal Blue, and Slate Grey to Cream, Beige, and Plush Pink.\n\n\nSturdy Frame & Slatted Base: Constructed from solid timber with heavy-duty slatted support, ensuring optimal mattress ventilation, stability, and a sound night&#8217;s sleep.\n\n\nAvailable Sizes & Tailored Fit\n\n\nWhether upgrading a guest room or designing a grand master suite, the Ambassador bed frame comes in standard UK sizing options:\n\n\nDouble (4ft 6in): Ideal for compact master bedrooms without compromising on style.\n\n\nKing Size (5ft): The perfect balance of spacious comfort and striking proportions.\n\n\nSuper King Size (6ft): The ultimate luxury choice for maximum sleeping space and dramatic visual impact.\n\n\nSpecifications\n\n\nModel: Ambassador Bed Frame\n\n\nSizes Available: Double (4ft 6&#8243;), King Size (5ft), Super King Size (6ft)\n\n\nUpholstery Options: Plush Velvet, Crushed Velvet, Soft Linen, or Chenille\n\n\nColour Options: Navy Blue, Grey, Cream, Beige, Black, Pink, Emerald Green (Custom samples available)\n\n\nDesign: Deep Diamond Buttoned Headboard, Footboard, & Padded Side Rails\n\n\nBase Type: Solid Wooden Slatted Base with Reinforced Center Support Rail\n\n\nProduct Features\n\n\nGrand floor-standing headboard design adds height and elegance to any bedroom\n\n\nDeeply padded upholstery provides extra comfort and plush tactile feel\n\n\nCompatible with all standard UK size mattresses\n\n\nHeavy-duty wooden slatted support system extends mattress lifespan\n\n\nCare & Maintenance Instructions\n\n\nFabric Care: Gently brush or vacuum using a soft upholstery attachment to keep velvet fibers plush.\n\n\nSpills: Blot liquid spills immediately with a clean, dry cloth; do not rub liquid into the velvet pile.\n\n\nFrame Maintenance: Periodically check and tighten frame fixings to maintain structural firmness.\n\n\nWould you like me to add options for an gas-lift ottoman storage base or specific mattress pairing bundles to this listing?",
    "dimensions": {
      "width": 165,
      "height": 137,
      "depth": 215,
      "mattressSize": "King (5ft)"
    },
    "materials": [
      "Heavyweight Velvet Upholstery",
      "Reinforced Timber Slat Base",
      "Chunky Chrome Feet",
      "High-Density Padding"
    ],
    "colours": [
      {
        "name": "Deep Anthracite",
        "hex": "#3B3B3B"
      },
      {
        "name": "Champagne Beige",
        "hex": "#D6CDBF"
      },
      {
        "name": "Silver Ice",
        "hex": "#C2C4C6"
      }
    ],
    "sizes": [
      "Double (4ft 6)",
      "King (5ft)",
      "Super King (6ft)"
    ],
    "tags": [
      "Ambassador Bed",
      "Deep Buttoned",
      "Upholstered Bed",
      "Luxury Beds",
      "UK Delivery"
    ],
    "isPublished": true,
    "isFeatured": true,
    "isTrending": true,
    "deliveryInfo": "Free 2-man room-of-choice UK delivery. Handcrafted to order and delivered in 5–10 working days.",
    "careInstructions": "Gently vacuum upholstery with a soft brush attachment. Blot liquid spills immediately with an absorbent uncoloured cloth. Professional cleaning recommended.",
    "assemblyRequired": true,
    "seoTitle": "Ambassador Luxury Deep-Buttoned Upholstered Bed Frame | Plush Comfort UK",
    "seoDescription": "The Ambassador Luxury Bed Frame features an opulent 54-inch floor-standing headboard with deep diamond buttoning. Built to last with solid slats.",
    "rating": 4.8,
    "reviewCount": 20,
    "relatedProductIds": [],
    "complementaryProductIds": [
      "prod-19"
    ],
    "reviews": []
  },
  {
    "id": "prod-187",
    "name": "Nicole 3-Seater Chesterfield Sofa in Soft Cream Fabric",
    "slug": "nicole-3-seater-chesterfield-sofa-in-soft-cream-fabric",
    "sku": "PC-UK-187",
    "categoryId": "cat-chesterfield-sofas",
    "subcategoryId": "sub-3-seater",
    "price": 999,
    "salePrice": 699,
    "stock": 8,
    "lowStockThreshold": 2,
    "images": [
      "/uploads/products/nicole-3-seater-chesterfield-sofa-in-soft-cream-fabric-1.webp",
      "/uploads/products/nicole-3-seater-chesterfield-sofa-in-soft-cream-fabric-2.webp",
      "/uploads/products/nicole-3-seater-chesterfield-sofa-in-soft-cream-fabric-3.webp",
      "/uploads/products/nicole-3-seater-chesterfield-sofa-in-soft-cream-fabric-4.webp",
      "/uploads/products/nicole-3-seater-chesterfield-sofa-in-soft-cream-fabric-5.webp",
      "/uploads/products/nicole-3-seater-chesterfield-sofa-in-soft-cream-fabric-6.webp"
    ],
    "shortDescription": "Bring modern luxury to your living room with the Nicole 3-Seater Sofa in soft cream fabric. Blending classic Chesterfield scrolled arms with deeply cushioned scatter-back pillows and piped seat edges, this spacious three-seater settee provides the perfect combination of timeless elegance and cozy everyday comfort.",
    "fullDescription": "Classic British Silhouette Meets Contemporary Comfort\n\n\nEnhance your living space with the Nicole 3-Seater Sofa, a sophisticated piece designed to blend period charm with relaxed modern living. Upholstered in a high-grade, velvety soft cream fabric, this three-seater settee creates a warm, airy atmosphere in both modern apartments and traditional UK homes.\n\n\nCrafted with Premium Details\n\n\nEvery element of the Nicole sofa reflects thoughtful design and quality tailoring:\n\n\nSignature Scrolled Arms: Elegant Chesterfield-inspired wide scroll arms add a stately, classic touch to the modern silhouette.\n\n\nPlush Scatter-Back Design: Layered pillow-back cushions offer customizable support, making it effortless to sink in and unwind.\n\n\nDeep Cushion Seating: Generously filled seat cushions feature fine piped edges, ensuring maximum comfort while maintaining a sleek, tailored shape.\n\n\nBuilt to Last: Engineered with a heavy-duty hardwood frame and anchored by dark turned wooden feet for robust stability.\n\n\nThe Perfect Centerpiece for Modern Living\n\n\nDesigned to seat three adults comfortably, the Nicole sofa serves as a versatile focal point for living rooms, snugs, or open-plan lounge areas. Its soft neutral hue pairs effortlessly with bold accent throws, natural wood tones, or minimalist interior decor.\n\n\nSpecifications\n\n\nModel: Nicole 3-Seater Sofa\n\n\nUpholstery: Premium Soft-Touch Fabric / Soft Velvet\n\n\nColour: Cream / Warm Off-White\n\n\nCapacity: 3-Seater\n\n\nFrame Material: Kiln-Dried Solid Hardwood & Reinforced Composites\n\n\nSeat Cushions: High-Resilience Foam with Fiber Wrap\n\n\nBack Style: Loose Scatter Cushion Pillows\n\n\nLegs: Dark Turned Solid Wood Feet\n\n\nProduct Features\n\n\nSweeping Chesterfield-style scroll arms for a classic luxury look\n\n\nDeep, spacious seating capacity designed for everyday relaxation\n\n\nUltra-soft fabric finish that is durable and simple to keep fresh\n\n\nIncludes extra accent scatter cushions for tailored back support\n\n\nCare & Maintenance Instructions\n\n\nRoutine Cleaning: Vacuum gently using an upholstery brush attachment to clear dust and maintain fabric texture.\n\n\nCushion Care: Plump and rotate back cushions regularly to preserve loft and shape.\n\n\nSpills: Blot liquid spills immediately with a clean, dry white cloth; do not rub into the weave.\n\n\nDeep Cleaning: Professional fabric cleaning recommended for tough spots.\n\n\nWould you like me to create the matching 2-seater version or the armchair listing to complete the full Nicole collection?",
    "dimensions": {
      "width": 220,
      "height": 84,
      "depth": 96,
      "seatHeight": 48
    },
    "materials": [
      "Soft Cream Chenille Weave",
      "Kiln-Dried European Hardwood",
      "Antiqued Brass Studding",
      "Turned Dark Oak Feet"
    ],
    "colours": [
      {
        "name": "Soft Cream",
        "hex": "#F3EFE6"
      },
      {
        "name": "Oatmeal",
        "hex": "#D8CCA3"
      }
    ],
    "tags": [
      "Chesterfield Sofa",
      "3 Seater",
      "Cream Fabric",
      "Scrolled Arms",
      "Handcrafted"
    ],
    "isPublished": true,
    "isFeatured": true,
    "isTrending": false,
    "deliveryInfo": "Free 2-man room-of-choice UK delivery. Handcrafted to order and delivered in 5–10 working days.",
    "careInstructions": "Gently vacuum upholstery with a soft brush attachment. Blot liquid spills immediately with an absorbent uncoloured cloth. Professional cleaning recommended.",
    "assemblyRequired": false,
    "seoTitle": "Nicole 3-Seater Chesterfield Sofa in Soft Cream Fabric | Plush Comfort UK",
    "seoDescription": "Discover the Nicole 3-Seater Chesterfield Sofa in soft cream fabric. Signature scrolled arms, hand-applied brass studs, and deep buttoned backrest.",
    "rating": 4.8,
    "reviewCount": 23,
    "relatedProductIds": [
      "prod-180",
      "prod-166",
      "prod-160",
      "prod-136"
    ],
    "complementaryProductIds": [
      "prod-23"
    ],
    "reviews": []
  },
  {
    "id": "prod-180",
    "name": "Nicole Luxury Chesterfield Corner Sofa in Cream Soft Velvet",
    "slug": "nicole-luxury-chesterfield-corner-sofa-in-cream-soft-velvet",
    "sku": "PC-UK-180",
    "categoryId": "cat-chesterfield-sofas",
    "subcategoryId": "sub-chesterfield-corner",
    "price": 1450,
    "salePrice": 1199,
    "stock": 8,
    "lowStockThreshold": 2,
    "images": [
      "/uploads/products/nicole-luxury-chesterfield-corner-sofa-in-cream-soft-velvet-1.webp",
      "/uploads/products/nicole-luxury-chesterfield-corner-sofa-in-cream-soft-velvet-2.webp",
      "/uploads/products/nicole-luxury-chesterfield-corner-sofa-in-cream-soft-velvet-3.webp",
      "/uploads/products/nicole-luxury-chesterfield-corner-sofa-in-cream-soft-velvet-4.webp",
      "/uploads/products/nicole-luxury-chesterfield-corner-sofa-in-cream-soft-velvet-5.webp",
      "/uploads/products/nicole-luxury-chesterfield-corner-sofa-in-cream-soft-velvet-6.webp"
    ],
    "shortDescription": "Bring modern grandeur home with the Nicole Chesterfield Corner Sofa in elegant cream velvet. Combining timeless scroll arms, deep button detailing, and plush scatter-back cushions, this spacious L-shaped sofa offers ultimate comfort and high-end UK living room style. Optional matching buttoned footstool available.",
    "fullDescription": "Statement Elegance Meets Modern Comfort\n\n\nTransform your interior with the Nicole Corner Sofa, a striking fusion of classic Chesterfield craftsmanship and contemporary British design. Upholstered in a high-grade, ultra-soft cream fabric, this corner settee brightens up open-plan living rooms, lounge suites, and modern family homes with an inviting, luxurious aesthetic.\n\n\nHandcrafted Quality & Period Details\n\n\nDesigned for those who appreciate detailed craftsmanship, the Nicole sofa showcases exquisite elements from every angle:\n\n\nClassic Scroll Arms: Elegant deep-tufted rolled arms offer a sophisticated, traditional Chesterfield silhouette.\n\n\nPlush Cushioning: Abundant pillow-back scatter cushions give you tailored support, making relaxing, lounging, or socialising effortless.\n\n\nDeep Comfort Seating: High-resilience foam seat cushions feature fine piped edges to retain their structured shape without sacrificing plush softness.\n\n\nDurable Construction: Supported by a heavy-duty solid hardwood frame and finished with dark turned wooden feet for excellent longevity.\n\n\nDesigned for Spacious UK Living\n\n\nThe expansive symmetrical corner layout comfortably seats 5 to 6 adults, making it an ideal centerpiece for family gatherings or entertaining guests. Pair it with the matching button-tufted ottoman footstool for complete footrest comfort or additional coffee table functionality.\n\n\nSpecifications\n\n\nModel: Nicole Corner Sofa\n\n\nFabric: Premium Soft Velvet / Brushed Chenille\n\n\nColour: Cream / Light Beige\n\n\nConfiguration: Symmetrical Corner (L-Shape)\n\n\nFrame Material: Kiln-Dried Solid Hardwood\n\n\nSeat Cushioning: High-Density Foam with Fiber Wrap\n\n\nBack Style: Full Scatter-Back Pillow Cushions\n\n\nLegs: Dark Turned Solid Wood Feet\n\n\nProduct Features\n\n\nHigh-end Chesterfield rolled arms with deep button tufting\n\n\nGenerous multi-seater capacity ideal for modern family homes\n\n\nVelvet fabric with a soft-touch texture that is durable and easy to maintain\n\n\nIncludes deep, piped seat cushions and matching scatter pillows\n\n\nCare & Maintenance Instructions\n\n\nRoutine Care: Vacuum gently using a soft upholstery brush attachment to keep the fabric fresh.\n\n\nCushion Maintenance: Plump and rotate back cushions weekly to maintain shape and loft.\n\n\nSpills: Blot liquid spills immediately with a dry, lint-free white cloth. Avoid scrubbing fabric fibers.\n\n\nCleaning: Professional upholstery cleaning recommended for stubborn stains.",
    "dimensions": {
      "width": 275,
      "height": 86,
      "depth": 275,
      "seatHeight": 47
    },
    "materials": [
      "Plush Cream Velvet",
      "Solid Birchwood Inner Frame",
      "Hand-Pleated Scrolled Arms",
      "Chrome Corner Glides"
    ],
    "colours": [
      {
        "name": "Cream Velvet",
        "hex": "#F5F0E8"
      },
      {
        "name": "Soft Champagne",
        "hex": "#DED3BF"
      }
    ],
    "tags": [
      "Nicole Corner",
      "Chesterfield Corner",
      "Cream Velvet",
      "Luxury Living",
      "Hand-Tufted"
    ],
    "isPublished": true,
    "isFeatured": true,
    "isTrending": true,
    "deliveryInfo": "Free 2-man room-of-choice UK delivery. Handcrafted to order and delivered in 5–10 working days.",
    "careInstructions": "Gently vacuum upholstery with a soft brush attachment. Blot liquid spills immediately with an absorbent uncoloured cloth. Professional cleaning recommended.",
    "assemblyRequired": false,
    "seoTitle": "Nicole Luxury Chesterfield Corner Sofa in Cream Soft Velvet | Plush Comfort UK",
    "seoDescription": "Make a glamorous statement with the Nicole Luxury Chesterfield Corner Sofa. Symmetrical corner design, sumptuous cream velvet, and hand-tufted detailing.",
    "rating": 4.8,
    "reviewCount": 26,
    "relatedProductIds": [
      "prod-187",
      "prod-166",
      "prod-160",
      "prod-136"
    ],
    "complementaryProductIds": [
      "prod-23"
    ],
    "reviews": []
  },
  {
    "id": "prod-174",
    "name": "Oxford Fabric Corner Sofa in Light Grey Textured Chenille",
    "slug": "oxford-fabric-corner-sofa-in-light-grey-textured-chenille",
    "sku": "PC-UK-174",
    "categoryId": "cat-corner-sofas",
    "subcategoryId": "sub-corner-l-shape",
    "price": 1250,
    "salePrice": 899,
    "stock": 8,
    "lowStockThreshold": 2,
    "images": [
      "/uploads/products/oxford-fabric-corner-sofa-in-light-grey-textured-chenille-1.webp",
      "/uploads/products/oxford-fabric-corner-sofa-in-light-grey-textured-chenille-2.webp",
      "/uploads/products/oxford-fabric-corner-sofa-in-light-grey-textured-chenille-3.webp",
      "/uploads/products/oxford-fabric-corner-sofa-in-light-grey-textured-chenille-4.webp"
    ],
    "shortDescription": "Transform your living space with the Oxford Corner Sofa in a sophisticated light grey textured fabric. Featuring spacious L-shaped seating, plush scatter-back cushions, clean square armrests, and deep-cushioned comfort, this modern corner settee brings effortless style, warmth, and generous seating to any contemporary UK home.",
    "fullDescription": "Contemporary Style Meets Everyday Comfort\n\n\nUpgrade your home with the modern elegance of the Oxford Corner Sofa. Designed to maximize floor space while offering generous seating, this contemporary L-shaped sofa seamlessly blends understated luxury with cozy functionality. Wrapped in a rich, textured chenille fabric in an on-trend light grey hue, the Oxford sofa instantly brightens up your living room, lounge, or open-plan family area.\n\n\nTailored Design & Premium Details\n\n\nCrafted with attention to detail, the Oxford features a balanced mix of crisp structure and sumptuously soft lounging:\n\n\nTextured Fabric Finish: Durable, soft-touch fabric with subtle tonal variations that add warmth and depth to your décor.\n\n\nSupportive & Plush Seating: Deep, high-density foam seat cushions designed to retain their shape while delivering exceptional relaxing comfort.\n\n\nScatter-Back Cushioning: Generously filled back cushions and accent scatter cushions allow you to customize your support for relaxed lounging or hosting guests.\n\n\nModern Silhouette: Broad, square armrests and piping trim details give the sofa a sleek, tailored edge.\n\n\nSturdy Frame Construction: Built around a heavy-duty hardwood frame engineered to withstand the demands of everyday family life.\n\n\nDesigned for Modern Living\n\n\nMeasuring 230cm x 230cm, the symmetrical corner layout provides ample seating room for family and friends, making it an ideal anchor piece for entertainment areas or cozy evenings in.\n\n\nSpecifications\n\n\nModel: Oxford Corner Sofa\n\n\nConfiguration: Symmetrical L-Shape\n\n\nDimensions: 230 cm x 230 cm\n\n\nUpholstery: Soft Textured Chenille Fabric\n\n\nColour: Light Grey / Silver Neutral\n\n\nFrame Material: Kiln-Dried Solid Hardwood & Reinforced Composites\n\n\nCushion Filling: High-Resilience Foam (Seats) & Fiber-Filled (Backs)\n\n\nProduct Features\n\n\nGenerous corner design optimizes floor space while maximizing seating capacity\n\n\nSoft-touch, durable textured fabric designed for busy modern households\n\n\nDeep-cushioned seats with coordinating accent cushions included\n\n\nVersatile neutral grey tones easily match with bold accent cushions or minimalist interior schemes\n\n\nCare & Maintenance Instructions\n\n\nRoutine Care: Vacuum gently using an upholstery attachment to remove dust and debris.\n\n\nCushion Maintenance: Plump and rotate back cushions regularly to maintain shape and even wear.\n\n\nSpills: Blot spills immediately with a dry, clean white cloth; do not rub into the fabric weave.\n\n\nCleaning: Professional fabric cleaning recommended for stubborn stains.\n\n\nWould you like me to adjust the dimensions or add color variation options (such as dark grey, beige, or corduroy) to match your exact stock levels?",
    "dimensions": {
      "width": 250,
      "height": 85,
      "depth": 180,
      "seatHeight": 45
    },
    "materials": [
      "Textured Chenille Weave",
      "Kiln-Dried Structural Frame",
      "Fibre-Filled Scatter Backs",
      "Solid Black Tapered Feet"
    ],
    "colours": [
      {
        "name": "Light Grey Chenille",
        "hex": "#C7C9CC"
      },
      {
        "name": "Charcoal",
        "hex": "#4A4D52"
      }
    ],
    "tags": [
      "Oxford Sofa",
      "Chenille Fabric",
      "Corner Sofa",
      "Light Grey",
      "Family Sofa"
    ],
    "isPublished": true,
    "isFeatured": true,
    "isTrending": false,
    "deliveryInfo": "Free 2-man room-of-choice UK delivery. Handcrafted to order and delivered in 5–10 working days.",
    "careInstructions": "Gently vacuum upholstery with a soft brush attachment. Blot liquid spills immediately with an absorbent uncoloured cloth. Professional cleaning recommended.",
    "assemblyRequired": false,
    "seoTitle": "Oxford Fabric Corner Sofa in Light Grey Textured Chenille | Plush Comfort UK",
    "seoDescription": "The Oxford Corner Sofa combines tactile light grey chenille with deep lounge seating and plush scatter cushions. Durable, family-ready British comfort.",
    "rating": 4.8,
    "reviewCount": 29,
    "relatedProductIds": [
      "prod-223",
      "prod-216",
      "prod-152",
      "prod-124"
    ],
    "complementaryProductIds": [
      "prod-23"
    ],
    "reviews": []
  },
  {
    "id": "prod-166",
    "name": "Classic Oxblood Antique Leather 2-Seater Chesterfield Sofa",
    "slug": "classic-oxblood-antique-leather-2-seater-chesterfield-sofa",
    "sku": "PC-UK-166",
    "categoryId": "cat-chesterfield-sofas",
    "subcategoryId": "sub-2-seater",
    "price": 1050,
    "salePrice": 699,
    "stock": 8,
    "lowStockThreshold": 2,
    "images": [
      "/uploads/products/classic-oxblood-antique-leather-2-seater-chesterfield-sofa-1.webp",
      "/uploads/products/classic-oxblood-antique-leather-2-seater-chesterfield-sofa-2.webp",
      "/uploads/products/classic-oxblood-antique-leather-2-seater-chesterfield-sofa-3.webp",
      "/uploads/products/classic-oxblood-antique-leather-2-seater-chesterfield-sofa-4.webp",
      "/uploads/products/classic-oxblood-antique-leather-2-seater-chesterfield-sofa-5.webp",
      "/uploads/products/classic-oxblood-antique-leather-2-seater-chesterfield-sofa-6.webp",
      "/uploads/products/classic-oxblood-antique-leather-2-seater-chesterfield-sofa-7.webp"
    ],
    "shortDescription": "Add compact elegance to your living space with our Classic Oxblood Leather 2-Seater Chesterfield Sofa. Handcrafted in the UK using 100% genuine antique leather, this classic love seat features iconic deep button tufting, hand-tacked brass studs, and traditional scrolled arms—perfect for smaller living rooms, snugs, or home offices.",
    "fullDescription": "Compact Luxury with Vintage British Style\n\n\nMaximize your seating space without compromising on style. Our Classic Oxblood 2-Seater Chesterfield Sofa delivers all the iconic heritage design of a traditional Chesterfield in a space-saving footprint. Ideal for compact living rooms, reading nooks, or private offices, this two-seater love seat brings warmth, richness, and effortless British sophistication to any room.\n\n\nMaster-Crafted Construction & Premium Finish\n\n\nBuilt by skilled craftsmen, every element reflects authentic period detailing:\n\n\n100% Genuine Antique Leather: Finished in a rich, two-tone Oxblood burgundy that deepens in character and develops a unique vintage patina over time.\n\n\nHand-Tufted Detailing: Featuring classic diamond buttoning across the back, rolled arms, and front apron for a timeless look.\n\n\nIndividual Brass Studding: Hand-hammered brass studwork meticulously outlines the classic scroll arms.\n\n\nSturdy Frame: Built around a solid hardwood frame and finished with hand-turned solid timber feet for long-lasting stability.\n\n\nDesigned for Everyday Comfort\n\n\nEngineered for both relaxation and durability, the twin high-density foam seat cushions provide a firm, supportive sit that maintains its shape over time. Designed to offer comfortable seating for two, it strikes the ideal balance between traditional craftsmanship and modern convenience.\n\n\nSpecifications\n\n\nType: 2-Seater Chesterfield Sofa / Love Seat\n\n\nUpholstery: 100% Genuine Antique Leather\n\n\nColour: Oxblood Red / Deep Burgundy\n\n\nFrame Material: Kiln-Dried Solid Hardwood\n\n\nDetails: Deep Button Tufting & Brass Stud Work\n\n\nLegs: Solid Wood Feet\n\n\nProduct Features\n\n\nCompact 2-person capacity designed for versatile space arrangement\n\n\nAuthentic British heritage silhouette with classic scroll arms\n\n\nPremium real leather upholstery that easy to maintain and ages gracefully\n\n\nLow-maintenance leather—wipes clean easily with a soft cloth\n\n\nCare & Maintenance Instructions\n\n\nRoutine Cleaning: Dust regularly using a clean, soft cloth.\n\n\nSpills: Blot liquid spills immediately with a dry cloth; avoid abrasive solvents or harsh chemicals.\n\n\nLeather Care: Treat with a good-quality leather conditioner every 6 to 12 months to maintain suppleness and lustre.\n\n\nPlacement: Keep clear of direct heat sources and direct sunlight to prevent drying or premature fading.",
    "dimensions": {
      "width": 168,
      "height": 78,
      "depth": 92,
      "seatHeight": 46
    },
    "materials": [
      "100% Genuine Antique Leather",
      "Hand-Rubbed Oxblood Finish",
      "Kiln-Dried Beechwood Frame",
      "Individual Brass Studs"
    ],
    "colours": [
      {
        "name": "Antique Oxblood",
        "hex": "#631B22"
      }
    ],
    "tags": [
      "Oxblood Leather",
      "Chesterfield 2-Seater",
      "Antique Leather",
      "British Heritage"
    ],
    "isPublished": true,
    "isFeatured": false,
    "isTrending": true,
    "deliveryInfo": "Free 2-man room-of-choice UK delivery. Handcrafted to order and delivered in 5–10 working days.",
    "careInstructions": "Gently vacuum upholstery with a soft brush attachment. Blot liquid spills immediately with an absorbent uncoloured cloth. Professional cleaning recommended.",
    "assemblyRequired": false,
    "seoTitle": "Classic Oxblood Antique Leather 2-Seater Chesterfield Sofa | Plush Comfort UK",
    "seoDescription": "Genuine hand-rubbed antique oxblood leather 2-seater Chesterfield sofa. Authentic British craftsmanship with hand-tied serpentine springs and button tufting.",
    "rating": 4.8,
    "reviewCount": 32,
    "relatedProductIds": [
      "prod-187",
      "prod-180",
      "prod-160",
      "prod-136"
    ],
    "complementaryProductIds": [
      "prod-23"
    ],
    "reviews": []
  },
  {
    "id": "prod-160",
    "name": "Classic Oxblood Antique Leather 3-Seater Chesterfield Sofa",
    "slug": "classic-oxblood-antique-leather-3-seater-chesterfield-sofa",
    "sku": "PC-UK-160",
    "categoryId": "cat-chesterfield-sofas",
    "subcategoryId": "sub-3-seater",
    "price": 950,
    "salePrice": 799,
    "stock": 8,
    "lowStockThreshold": 2,
    "images": [
      "/uploads/products/classic-oxblood-antique-leather-3-seater-chesterfield-sofa-1.webp",
      "/uploads/products/classic-oxblood-antique-leather-3-seater-chesterfield-sofa-2.webp",
      "/uploads/products/classic-oxblood-antique-leather-3-seater-chesterfield-sofa-3.webp",
      "/uploads/products/classic-oxblood-antique-leather-3-seater-chesterfield-sofa-4.webp",
      "/uploads/products/classic-oxblood-antique-leather-3-seater-chesterfield-sofa-5.webp"
    ],
    "shortDescription": "Bring timeless British elegance into your home with our Classic Oxblood Leather 3-Seater Chesterfield Sofa. Hand-crafted using 100% genuine antique leather, this iconic settee features deep button tufting, hand-tacked brass studding, and classic scrolled arms—offering unparalleled comfort, durability, and quintessential heritage style.",
    "fullDescription": "The Ultimate British Design Classic\n\n\nElevate your living room, study, or commercial space with the enduring elegance of our Classic Oxblood 3-Seater Chesterfield Sofa. Renowned worldwide for its regal presence and historic British charm, this sofa combines traditional craftsmanship with luxurious everyday comfort. Whether placed in a modern apartment or a period country home, its rich antique finish effortlessly becomes the focal point of any interior.\n\n\nSuperior Craftsmanship & Premium Materials\n\n\nHandmade by skilled artisans, every detail of this Chesterfield is crafted to perfection:\n\n\n100% Real Antique Leather: Upholstered in top-grain leather featuring a distinct two-tone Oxblood red wash-off finish that deepens in character over time.\n\n\nDeep Buttoned Back & Arms: Classic hand-tufted diamond buttoning across the backrest, high rolled arms, and front border.\n\n\nHand-Studded Detailing: Individual brass studding individually hammered along the scroll arms for an authentic, refined touch.\n\n\nBuilt to Last: Supported by a robust hardwood frame and finished with hand-turned solid wood feet, ensuring stability and long-lasting durability.\n\n\nUncompromising Comfort\n\n\nDesigned for both style and relaxation, the deep-cushioned 3-seater design offers generous seating room. The high-density foam seat cushions provide a supportive yet comfortable sit, retaining their shape year after year while providing an ideal balance between vintage structure and modern relaxation.\n\n\nSpecifications\n\n\nType: 3-Seater Chesterfield Sofa\n\n\nUpholstery: 100% Genuine Antique Leather\n\n\nColour: Oxblood Red / Wash-Off Burgundy\n\n\nFrame Material: Kiln-Dried Solid Hardwood\n\n\nDetails: Deep Button Tufting & Brass Stud Work\n\n\nLegs: Solid Wood Feet\n\n\nProduct Features\n\n\nAuthentic British heritage silhouette with classic scroll arms\n\n\nDurable 100% genuine leather that develops a rich vintage patina over time\n\n\nGenerous 3-person seating capacity ideal for modern or traditional spaces\n\n\nLow-maintenance leather—easy to wipe clean and maintain with leather conditioner\n\n\nCare & Maintenance Instructions\n\n\nRoutine Cleaning: Dust regularly with a soft, clean cloth.\n\n\nSpills: Wipe liquid spills immediately using a dry absorbent cloth; avoid harsh chemical detergents.\n\n\nLeather Care: Apply a quality leather conditioner every 6 to 12 months to preserve warmth, flexibility, and colour luster.",
    "dimensions": {
      "width": 215,
      "height": 78,
      "depth": 92,
      "seatHeight": 46
    },
    "materials": [
      "100% Genuine Antique Leather",
      "Traditional Hand-Rubbed Patina",
      "Solid Hardwood Frame",
      "Hand-Turned Mahogany Bun Feet"
    ],
    "colours": [
      {
        "name": "Antique Oxblood",
        "hex": "#631B22"
      }
    ],
    "tags": [
      "Oxblood Chesterfield",
      "3 Seater Leather Sofa",
      "Antique British",
      "Handcrafted"
    ],
    "isPublished": true,
    "isFeatured": false,
    "isTrending": false,
    "deliveryInfo": "Free 2-man room-of-choice UK delivery. Handcrafted to order and delivered in 5–10 working days.",
    "careInstructions": "Gently vacuum upholstery with a soft brush attachment. Blot liquid spills immediately with an absorbent uncoloured cloth. Professional cleaning recommended.",
    "assemblyRequired": false,
    "seoTitle": "Classic Oxblood Antique Leather 3-Seater Chesterfield Sofa | Plush Comfort UK",
    "seoDescription": "The ultimate British icon. Classic Oxblood Antique Leather 3-Seater Chesterfield sofa with deep diamond tufting and hand-hammered brass studwork.",
    "rating": 4.8,
    "reviewCount": 15,
    "relatedProductIds": [
      "prod-187",
      "prod-180",
      "prod-166",
      "prod-136"
    ],
    "complementaryProductIds": [
      "prod-23"
    ],
    "reviews": []
  },
  {
    "id": "prod-152",
    "name": "Luxury U Shape Sofa",
    "slug": "luxury-u-shape-sofa",
    "sku": "PC-UK-152",
    "categoryId": "cat-corner-sofas",
    "subcategoryId": "sub-u-shape",
    "price": 1699,
    "salePrice": 1449,
    "stock": 8,
    "lowStockThreshold": 2,
    "images": [
      "/uploads/products/luxury-u-shape-sofa-1.webp",
      "/uploads/products/luxury-u-shape-sofa-2.webp",
      "/uploads/products/luxury-u-shape-sofa-3.webp",
      "/uploads/products/luxury-u-shape-sofa-4.webp",
      "/uploads/products/luxury-u-shape-sofa-5.webp",
      "/uploads/products/luxury-u-shape-sofa-6.webp",
      "/uploads/products/luxury-u-shape-sofa-7.webp"
    ],
    "shortDescription": "Transform your living room with our Luxury U Shape Sofa, designed for spacious comfort, modern style and everyday relaxation. Available in a range of colours and fabric options, this generously sized U-shaped sofa is perfect for family living rooms, entertaining guests and creating a stylish focal point in your home.",
    "fullDescription": "Bring comfort and contemporary elegance into your home with our Luxury U Shape Sofa, a beautifully designed statement piece made for modern UK living. With its generous U-shaped layout, this sofa provides plenty of seating space for family and guests while creating a warm and inviting atmosphere in your living room.\n\n\nDesigned with comfort, style and versatility in mind, the sofa features deep, supportive seating and a spacious chaise-style configuration, giving everyone room to sit back, relax and enjoy their space. Its sophisticated appearance works beautifully with both modern and classic interiors, making it an excellent choice for living rooms, open-plan spaces and larger family homes.\n\n\nMultiple colours are available, allowing you to choose a finish that complements your existing décor. Whether you prefer a soft neutral shade for a light and elegant look or a deeper colour for a bold contemporary feel, you can create a sofa that suits your personal style and home.\n\n\nThe Luxury U Shape Sofa is ideal for relaxing after a long day, family movie nights, entertaining friends or simply enjoying a comfortable weekend at home. Its spacious design makes excellent use of your living area while providing the premium look and feel expected from a modern luxury sofa.\n\n\nKey Features\n\n\nLuxury U-shaped design for generous seating\n\n\nMultiple colours available to suit different interiors\n\n\nSpacious and comfortable seating for family and guests\n\n\nContemporary design suitable for modern UK homes\n\n\nPerfect for living rooms and larger open-plan spaces\n\n\nStylish statement piece with a sophisticated finish\n\n\nIdeal for relaxing, entertaining and family gatherings\n\n\nDesigned to combine comfort, practicality and luxury\n\n\nUpgrade your living space with a luxury U-shaped corner sofa that offers the perfect balance of style and comfort. Choose your preferred colour and create a welcoming centrepiece your whole family can enjoy.\n\n\nLuxury U Shape Sofa, U Shaped Sofa UK, Luxury Corner Sofa, Large U Shape Sofa, U Shape Corner Sofa, Modern U Shaped Sofa, Fabric U Shape Sofa, Luxury Sofa UK, Large Corner Sofa UK, Living Room Sofa, U Shaped Couch.",
    "dimensions": {
      "width": 330,
      "height": 88,
      "depth": 195,
      "seatHeight": 47
    },
    "materials": [
      "Soft Structured Fabric",
      "Reinforced Timber Frame",
      "Fibre-Filled Cushions",
      "Low Profile Block Feet"
    ],
    "colours": [
      {
        "name": "Slate Grey",
        "hex": "#707378"
      },
      {
        "name": "Mink Beige",
        "hex": "#BFB5A6"
      }
    ],
    "tags": [
      "U Shape Sofa",
      "Extra Large Sofa",
      "Family Living Room",
      "Plush Comfort"
    ],
    "isPublished": true,
    "isFeatured": false,
    "isTrending": true,
    "deliveryInfo": "Free 2-man room-of-choice UK delivery. Handcrafted to order and delivered in 5–10 working days.",
    "careInstructions": "Gently vacuum upholstery with a soft brush attachment. Blot liquid spills immediately with an absorbent uncoloured cloth. Professional cleaning recommended.",
    "assemblyRequired": false,
    "seoTitle": "Luxury U Shape Sofa – Extra Large Family Seating | Plush Comfort UK",
    "seoDescription": "Spacious Luxury U Shape Sofa designed for large living rooms and family movie nights. Double chaise layout upholstered in hard-wearing plush fabric.",
    "rating": 4.8,
    "reviewCount": 18,
    "relatedProductIds": [
      "prod-223",
      "prod-216",
      "prod-174",
      "prod-124"
    ],
    "complementaryProductIds": [
      "prod-23"
    ],
    "reviews": []
  },
  {
    "id": "prod-136",
    "name": "Nicole 3+2 Chesterfield Sofa Set in Soft Fabric with Studded Detail",
    "slug": "nicole-32-chesterfield-sofa-set-in-soft-fabric-with-studded-detail",
    "sku": "PC-UK-136",
    "categoryId": "cat-chesterfield-sofas",
    "subcategoryId": "sub-sofa-sets",
    "price": 1299,
    "salePrice": 999,
    "stock": 8,
    "lowStockThreshold": 2,
    "images": [
      "/uploads/products/nicole-32-chesterfield-sofa-set-in-soft-fabric-with-studded-detail-1.webp",
      "/uploads/products/nicole-32-chesterfield-sofa-set-in-soft-fabric-with-studded-detail-2.webp",
      "/uploads/products/nicole-32-chesterfield-sofa-set-in-soft-fabric-with-studded-detail-3.webp",
      "/uploads/products/nicole-32-chesterfield-sofa-set-in-soft-fabric-with-studded-detail-4.webp",
      "/uploads/products/nicole-32-chesterfield-sofa-set-in-soft-fabric-with-studded-detail-5.webp"
    ],
    "shortDescription": "Bring timeless luxury to your living space with the Nicole 3+2 Sofa Set. Reimagining the iconic Chesterfield silhouette in a soft-touch upholstered fabric, this suite features elegant scroll arms, classic button-tufted trim, and metallic studding alongside a plush scatter-back design. Available in a versatile array of premium shades to suit any British home.",
    "fullDescription": "Elevate your home’s interior with the Nicole 3+2 Sofa Set, a masterclass in grand style and relaxed comfort tailored for UK living rooms. Combining a spacious 3-seater and a matching 2-seater couch, this suite blends the heritage charm of traditional Chesterfield tailoring with modern, sink-in comfort.\n\n\nThe Nicole features dramatic rolled arms lined with refined silver stud detailing, complemented by deep button-tufting along the front apron and arms. Unlike traditional rigid leather designs, the Nicole is upholstered in a tactile, velvet-touch fabric and features deep, high-resilience foam seat cushions paired with a plush array of scatter-back cushions—giving you the perfect balance of structured elegance and cozy relaxation.\n\n\nClassic Chesterfield Styling: Hand-studded trim, buttoned details, and sweeping scroll arms for a timeless, high-end look.\n\n\nExtensive Shade Range: Personalise your set with options including Cream, Champagne, Slate Grey, Charcoal, Forest Green, and Royal Blue.\n\n\nGenerous Seating Suite: Includes both a 3-seater sofa for entertaining and a compact 2-seater ideal for complete room arrangement.\n\n\nUK Fire & Safety Compliant: Engineered on a reinforced timber frame and fully certified to British Furniture Safety Regulations (BS 5852).",
    "dimensions": {
      "width": 220,
      "height": 84,
      "depth": 96,
      "seatHeight": 48
    },
    "materials": [
      "Linen-Touch Soft Upholstery",
      "Dual Hardwood Construction",
      "Individually Pinned Studs",
      "High-Resilience Core"
    ],
    "colours": [
      {
        "name": "Warm Cream",
        "hex": "#F0E8DC"
      },
      {
        "name": "Ash Grey",
        "hex": "#A2A4A8"
      }
    ],
    "tags": [
      "3+2 Sofa Set",
      "Chesterfield Suite",
      "Living Room Set",
      "Nicole Chesterfield"
    ],
    "isPublished": true,
    "isFeatured": false,
    "isTrending": false,
    "deliveryInfo": "Free 2-man room-of-choice UK delivery. Handcrafted to order and delivered in 5–10 working days.",
    "careInstructions": "Gently vacuum upholstery with a soft brush attachment. Blot liquid spills immediately with an absorbent uncoloured cloth. Professional cleaning recommended.",
    "assemblyRequired": false,
    "seoTitle": "Nicole 3+2 Chesterfield Sofa Set with Studded Detail | Plush Comfort UK",
    "seoDescription": "Complete suite living: the Nicole 3+2 Chesterfield Sofa Set includes both a 3-seater and a 2-seater sofa with traditional scroll arms and studded trim.",
    "rating": 4.8,
    "reviewCount": 21,
    "relatedProductIds": [
      "prod-187",
      "prod-180",
      "prod-166",
      "prod-160"
    ],
    "complementaryProductIds": [
      "prod-23"
    ],
    "reviews": []
  },
  {
    "id": "prod-130",
    "name": "Double Ottoman Divan Bed Set with Orthopaedic Mattress & Vertical Panelled Headboard",
    "slug": "double-ottoman-divan-bed-set-with-orthopaedic-mattress-vertical-panelled-headboard",
    "sku": "PC-UK-130",
    "categoryId": "cat-divan-beds",
    "subcategoryId": "sub-ottoman-divans",
    "price": 850,
    "salePrice": 699,
    "stock": 8,
    "lowStockThreshold": 2,
    "images": [
      "/uploads/products/double-ottoman-divan-bed-set-with-orthopaedic-mattress-vertical-panelled-headboard-1.webp",
      "/uploads/products/double-ottoman-divan-bed-set-with-orthopaedic-mattress-vertical-panelled-headboard-2.webp",
      "/uploads/products/double-ottoman-divan-bed-set-with-orthopaedic-mattress-vertical-panelled-headboard-3.webp",
      "/uploads/products/double-ottoman-divan-bed-set-with-orthopaedic-mattress-vertical-panelled-headboard-4.webp",
      "/uploads/products/double-ottoman-divan-bed-set-with-orthopaedic-mattress-vertical-panelled-headboard-5.webp"
    ],
    "shortDescription": "Maximize your bedroom space without sacrificing luxury with this Double Ottoman Divan Bed set. Paired with a supportive medium-firm mattress and an upholstered vertical padded headboard, this complete sleep solution features a side- or end-opening gas-lift ottoman base to conceal bedding, clothes, and seasonal essentials. Available in a spectrum of premium fabric colors to match any interior.",
    "fullDescription": "Transform your master bedroom or guest room into an organized, hotel-inspired haven with our Double Ottoman Divan Bed Set. Designed specifically for contemporary UK homes where space optimization is essential, this all-in-one set seamlessly combines full under-bed storage with exceptional sleep support and modern aesthetic appeal.\n\n\nThe core feature is the smooth, powerful gas-strut ottoman mechanism, which effortlessly lifts the entire mattress platform to reveal a deep, dust-free storage compartment underneath. Upholstered in soft-touch fabric, the base is complemented by a bold floor-standing or strutted headboard featuring clean vertical fluting that serves as an eye-catching focal point.\n\n\nComplete with an orthopaedic sprung mattress, this bed set provides optimal spinal alignment, pressure relief, and breathable comfort for a peaceful night&#8217;s sleep.\n\n\nEffortless Gas-Lift Storage: Smooth hydraulics allow easy, hands-free access to under-bed storage—ideal for extra linen, pillows, or suitcases.\n\n\nBespoke Fabric & Colour Options: Tailor your bed to your decor with options including Crushed Velvet, Plush Velvet, Linen, or Classic Bouclé in Grey, Beige, Charcoal, Navy, and Blush Pink.\n\n\nComplete Sleep Package: Includes a double ottoman base, matching vertical-panel headboard, and a deep, quilted medium-firm mattress.\n\n\nBritish Craftsmanship & Safety: Handcrafted in the UK and fully certified to conform with UK Fire Safety Regulations (BS 7177 / BS 5852).",
    "dimensions": {
      "width": 140,
      "height": 130,
      "depth": 200,
      "storageDepth": 28,
      "mattressSize": "Double (4ft 6)"
    },
    "materials": [
      "Gas-Lift Hydraulic Pistons",
      "Reinforced Divan Base",
      "Orthopaedic Tufted Mattress",
      "Vertical Panelled Padded Headboard"
    ],
    "colours": [
      {
        "name": "Silver Grey Plush",
        "hex": "#BDBEC0"
      },
      {
        "name": "Charcoal Linen",
        "hex": "#3C3E42"
      },
      {
        "name": "Oatmeal",
        "hex": "#D7CEBD"
      }
    ],
    "sizes": [
      "Double (4ft 6)",
      "King (5ft)"
    ],
    "tags": [
      "Ottoman Bed",
      "Divan Bed Set",
      "Orthopaedic Mattress",
      "Storage Bed",
      "Underbed Storage"
    ],
    "isPublished": true,
    "isFeatured": false,
    "isTrending": true,
    "deliveryInfo": "Free 2-man room-of-choice UK delivery. Handcrafted to order and delivered in 5–10 working days.",
    "careInstructions": "Gently vacuum upholstery with a soft brush attachment. Blot liquid spills immediately with an absorbent uncoloured cloth. Professional cleaning recommended.",
    "assemblyRequired": true,
    "seoTitle": "Double Ottoman Divan Bed Set with Orthopaedic Mattress & Headboard | Plush Comfort UK",
    "seoDescription": "Maximize bedroom storage with our Double Ottoman Divan Bed set. Features smooth gas-lift pistons, 54-inch vertical panel headboard, and medium-firm orthopaedic mattress.",
    "rating": 4.8,
    "reviewCount": 24,
    "relatedProductIds": [],
    "complementaryProductIds": [
      "prod-19"
    ],
    "reviews": []
  },
  {
    "id": "prod-124",
    "name": "Lilly Corner Sofa – Luxury Plush Fabric with Bolster Cushions",
    "slug": "lilly-corner-sofa-luxury-plush-fabric-with-bolster-cushions",
    "sku": "PC-UK-124",
    "categoryId": "cat-corner-sofas",
    "subcategoryId": "sub-corner-l-shape",
    "price": 1250,
    "salePrice": 999,
    "stock": 8,
    "lowStockThreshold": 2,
    "images": [
      "/uploads/products/lilly-corner-sofa-luxury-plush-fabric-with-bolster-cushions-1.webp",
      "/uploads/products/lilly-corner-sofa-luxury-plush-fabric-with-bolster-cushions-2.webp",
      "/uploads/products/lilly-corner-sofa-luxury-plush-fabric-with-bolster-cushions-3.webp",
      "/uploads/products/lilly-corner-sofa-luxury-plush-fabric-with-bolster-cushions-4.webp",
      "/uploads/products/lilly-corner-sofa-luxury-plush-fabric-with-bolster-cushions-5.webp"
    ],
    "shortDescription": "Bring timeless elegance and deep-seated comfort to your living area with the Lilly Corner Sofa. Featuring distinctive stitched vertical paneling along the apron and wide curved armrests, paired with matching cylindrical bolster cushions, this corner sofa blends traditional warmth with contemporary British styling. Available in a wide spectrum of rich, neutral, and vibrant upholstery shades.",
    "fullDescription": "Upgrade your living room with the Lilly Corner Sofa, a masterpiece of modern British upholstery designed for exceptional comfort and refined visual appeal. Crafted to maximize floor space without compromising on seating area, this L-shaped corner unit offers an inviting setting for relaxing, reading, or social gatherings.\n\n\nThe Lilly is defined by its thoughtful design details—including subtle vertical panel stitching along the front base and rounded armrests, which complement its soft, micro-suede or matte velvet texture. Generously padded back supports and thick seat cushions offer a balance of gentle sink-in feel and long-lasting firm support. Included cylindrical bolster pillows add both ergonomic wrist/arm support and a distinct touch of designer flair.\n\n\nBespoke Shade Range: Select from classic neutrals like Beige, Cream, and Slate Grey, or bold options such as Forest Green, Mustard, and Deep Blue.\n\n\nPremium Upholstery: Covered in ultra-soft, durable fabric designed to resist daily wear while remaining gentle to the touch.\n\n\nBuilt to Last: Frame constructed using ethically sourced, reinforced timber designed to withstand everyday family use.\n\n\nUK Safety Certified: Fully compliant with British Furniture and Furnishings Fire Safety Regulations (BS 5852).",
    "dimensions": {
      "width": 245,
      "height": 86,
      "depth": 165,
      "seatHeight": 46
    },
    "materials": [
      "Luxury Plush Soft-Touch Fabric",
      "Stitched Fluted Arm Detail",
      "Reflex Foam Cushioning",
      "Matching Cylindrical Bolsters"
    ],
    "colours": [
      {
        "name": "Plush Dove Grey",
        "hex": "#A8AAAD"
      },
      {
        "name": "Emerald Forest",
        "hex": "#264A38"
      }
    ],
    "tags": [
      "Lilly Corner Sofa",
      "Bolster Cushions",
      "Fluted Arms",
      "Plush Fabric",
      "Corner Settee"
    ],
    "isPublished": true,
    "isFeatured": false,
    "isTrending": false,
    "deliveryInfo": "Free 2-man room-of-choice UK delivery. Handcrafted to order and delivered in 5–10 working days.",
    "careInstructions": "Gently vacuum upholstery with a soft brush attachment. Blot liquid spills immediately with an absorbent uncoloured cloth. Professional cleaning recommended.",
    "assemblyRequired": false,
    "seoTitle": "Lilly Corner Sofa – Luxury Plush Fabric with Bolster Cushions | Plush Comfort UK",
    "seoDescription": "The Lilly Corner Sofa delivers contemporary elegance with distinctive vertical fluting along the sides, plush back cushions, and matching cylindrical bolsters.",
    "rating": 4.8,
    "reviewCount": 27,
    "relatedProductIds": [
      "prod-223",
      "prod-216",
      "prod-174",
      "prod-152"
    ],
    "complementaryProductIds": [
      "prod-23"
    ],
    "reviews": []
  },
  {
    "id": "prod-119",
    "name": "Luxury U-Shaped Velvet Corner Sofa with Double Chaise",
    "slug": "luxury-u-shaped-velvet-corner-sofa-with-double-chaise",
    "sku": "PC-UK-119",
    "categoryId": "cat-corner-sofas",
    "subcategoryId": "sub-u-shape",
    "price": 1199,
    "salePrice": 999,
    "stock": 8,
    "lowStockThreshold": 2,
    "images": [
      "/uploads/products/luxury-u-shaped-velvet-corner-sofa-with-double-chaise-1.webp",
      "/uploads/products/luxury-u-shaped-velvet-corner-sofa-with-double-chaise-2.webp",
      "/uploads/products/luxury-u-shaped-velvet-corner-sofa-with-double-chaise-3.webp",
      "/uploads/products/luxury-u-shaped-velvet-corner-sofa-with-double-chaise-4.webp"
    ],
    "shortDescription": "Elevate your living space with this spacious UK-styled U-shaped sectional sofa. Featuring dual chaise lounges, ultra-plush cushioning, and a modern neutral aesthetic, it offers the ultimate combination of luxury and relaxed family seating. Available in a wide selection of premium fabrics and vibrant or subtle colors to suit any interior.",
    "fullDescription": "Transform your living room into a sophisticated retreat with this luxury U-shaped sectional sofa. Designed specifically for contemporary UK homes, this statement piece blends clean-lined modern elegance with generous proportions, making it the ideal focal point for family movie nights, entertaining, or simply unwinding in comfort.\n\n\nThe symmetrical U-shaped layout features dual extended chaises, allowing multiple people to stretch out with full-leg support at the same time. Deep, high-density foam seat cushions provide resilient, medium-firm support, while a plush array of back cushions and contrasting accent pillows offer tailored comfort for any seating position.\n\n\nUpholstered in soft-touch, premium chenille-velvet fabric, this sofa is engineered for both style and daily durability. Built on a reinforced hardwood frame with low-profile legs, it delivers exceptional stability and long-lasting quality.\n\n\nVersatile Color Selection: Available in multiple shades including Cream, Pebble Grey, Charcoal, Mink, Forest Green, and Midnight Blue.\n\n\nFamily-Friendly Durability: Treated fabric provides superior wear resistance for everyday British household use.",
    "dimensions": {
      "width": 325,
      "height": 89,
      "depth": 190,
      "seatHeight": 48
    },
    "materials": [
      "Silky Smooth Velvet",
      "Double Chaise Lounge Layout",
      "Heavy-Duty Timber Framing",
      "Chrome Bracket Supports"
    ],
    "colours": [
      {
        "name": "Champagne Taupe",
        "hex": "#C2B8A6"
      },
      {
        "name": "Midnight Charcoal",
        "hex": "#2C2E33"
      }
    ],
    "tags": [
      "Double Chaise Sofa",
      "Velvet U-Shape",
      "Luxury Settee",
      "Plush Seating"
    ],
    "isPublished": true,
    "isFeatured": false,
    "isTrending": false,
    "deliveryInfo": "Free 2-man room-of-choice UK delivery. Handcrafted to order and delivered in 5–10 working days.",
    "careInstructions": "Gently vacuum upholstery with a soft brush attachment. Blot liquid spills immediately with an absorbent uncoloured cloth. Professional cleaning recommended.",
    "assemblyRequired": false,
    "seoTitle": "Luxury U-Shaped Velvet Corner Sofa with Double Chaise | Plush Comfort UK",
    "seoDescription": "Indulge in spacious comfort with our Luxury U-Shaped Velvet Corner Sofa featuring dual chaise ends. Perfect for family lounging and cinema rooms.",
    "rating": 4.8,
    "reviewCount": 30,
    "relatedProductIds": [
      "prod-223",
      "prod-216",
      "prod-174",
      "prod-152"
    ],
    "complementaryProductIds": [
      "prod-23"
    ],
    "reviews": []
  },
  {
    "id": "prod-112",
    "name": "Verona Corner Sofa – Luxury Light Grey Fabric Sofa with Deep Seating",
    "slug": "verona-corner-sofa-luxury-light-grey-fabric-sofa-with-deep-seating",
    "sku": "PC-UK-112",
    "categoryId": "cat-fabric-sofas",
    "subcategoryId": "sub-fabric-corner",
    "price": 1250,
    "salePrice": 849,
    "stock": 8,
    "lowStockThreshold": 2,
    "images": [
      "/uploads/products/verona-corner-sofa-luxury-light-grey-fabric-sofa-with-deep-seating-1.webp",
      "/uploads/products/verona-corner-sofa-luxury-light-grey-fabric-sofa-with-deep-seating-2.webp",
      "/uploads/products/verona-corner-sofa-luxury-light-grey-fabric-sofa-with-deep-seating-3.webp",
      "/uploads/products/verona-corner-sofa-luxury-light-grey-fabric-sofa-with-deep-seating-4.webp",
      "/uploads/products/verona-corner-sofa-luxury-light-grey-fabric-sofa-with-deep-seating-5.webp"
    ],
    "shortDescription": "Verona Corner Sofa Bring timeless elegance and everyday comfort to your living room with the Verona Corner Sofa. Upholstered in a sophisticated light-grey fabric, this spacious corner sofa features deep seating, generously filled cushions and beautifully rolled, button-tufted arms. Its classic design makes it a stylish focal point for both traditional and contemporary UK homes.",
    "fullDescription": "The Verona Corner Sofa combines classic British-inspired styling with the comfort your home deserves. Designed for relaxed family living and entertaining, its generous corner configuration provides plenty of room to stretch out, while the deep cushioned seating creates a welcoming place to unwind.\n\n\nFinished in an elegant light-grey upholstery, the Verona offers a versatile look that complements a wide range of interiors, from modern neutral spaces to more traditional living rooms. The distinctive rolled arms and deep button tufting add a refined touch, while the soft, coordinating scatter cushions provide additional comfort and a layered, luxurious appearance.\n\n\nWhether you&#8217;re enjoying a quiet evening, hosting friends or bringing the family together, the Verona Corner Sofa provides an inviting combination of style, space and everyday comfort.\n\n\nKey Features:\n\n\nElegant light-grey upholstered finish\n\n\nSpacious corner design, ideal for family living rooms\n\n\nDeep, comfortable seating\n\n\nClassic rolled arms with button-tufted detailing\n\n\nIncludes coordinating scatter cushions\n\n\nTimeless design suited to both traditional and contemporary interiors\n\n\nA stylish statement piece for the modern UK home",
    "dimensions": {
      "width": 255,
      "height": 87,
      "depth": 255,
      "seatHeight": 46
    },
    "materials": [
      "Soft Weave Chenille-Polyester Fabric",
      "Deep Reflex Foam Seats",
      "Tufted Scroll Trim",
      "Solid Wood Tapered Legs"
    ],
    "colours": [
      {
        "name": "Light Grey Weave",
        "hex": "#B8B9BB"
      }
    ],
    "tags": [
      "Verona Fabric Sofa",
      "Deep Seating",
      "Light Grey Sofa",
      "Corner Fabric"
    ],
    "isPublished": true,
    "isFeatured": false,
    "isTrending": false,
    "deliveryInfo": "Free 2-man room-of-choice UK delivery. Handcrafted to order and delivered in 5–10 working days.",
    "careInstructions": "Gently vacuum upholstery with a soft brush attachment. Blot liquid spills immediately with an absorbent uncoloured cloth. Professional cleaning recommended.",
    "assemblyRequired": false,
    "seoTitle": "Verona Corner Sofa – Luxury Light Grey Fabric Sofa with Deep Seating | Plush Comfort UK",
    "seoDescription": "Sink into the deep seating of the Verona Corner Sofa. Soft-touch light grey weave, classic rolled detailing, and durable construction handcrafted in the UK.",
    "rating": 4.8,
    "reviewCount": 33,
    "relatedProductIds": [
      "prod-15"
    ],
    "complementaryProductIds": [
      "prod-23"
    ],
    "reviews": []
  },
  {
    "id": "prod-96",
    "name": "Luxurious Bella Chesterfield Corner Sofa",
    "slug": "luxurious-bella-modern-chesterfield-corner-sofa",
    "sku": "PC-UK-96",
    "categoryId": "cat-chesterfield-sofas",
    "subcategoryId": "sub-chesterfield-corner",
    "price": 1699,
    "salePrice": 1299,
    "stock": 8,
    "lowStockThreshold": 2,
    "images": [
      "/uploads/products/luxurious-bella-modern-chesterfield-corner-sofa-1.webp",
      "/uploads/products/luxurious-bella-modern-chesterfield-corner-sofa-2.webp",
      "/uploads/products/luxurious-bella-modern-chesterfield-corner-sofa-3.webp",
      "/uploads/products/luxurious-bella-modern-chesterfield-corner-sofa-4.webp",
      "/uploads/products/luxurious-bella-modern-chesterfield-corner-sofa-5.webp",
      "/uploads/products/luxurious-bella-modern-chesterfield-corner-sofa-6.webp"
    ],
    "shortDescription": "Transform your living space with the Bella Chesterfield Corner Sofa. Combining timeless British heritage with modern glamour, this stunning corner group features vertical channel tufting, striking gold-tone metallic strip detailing, and deep plush cushioning for ultimate relaxation. Complete with a matching footstool and coordinating scatter cushions, it’s the ultimate statement piece for any stylish UK home.",
    "fullDescription": "Elevate your home decor with the sophisticated Bella Chesterfield Corner Sofa. Designed to make an impression, this luxurious corner sofa set seamlessly blends classic Chesterfield charm with sleek, modern design elements.\n\n\nCrafted with premium soft-touch upholstery, the sofa features elegant vertical channel stitching accented by eye-catching gold chrome strip inserts along the backrest, frame, and matching Ottoman coffee table. Deep-filled foam seats and generous back support ensure maximum comfort without sacrificing style.\n\n\nWhether you&#8217;re hosting guests or unwinding after a long day, the spacious L-shaped layout offers ample seating space for the whole family.\n\n\nKey Features:\n\n\nModern Luxury Design: Unique vertical channel paneling highlighted with polished gold trim details.\n\n\nSpacious L-Shape Corner Layout: Maximises living room space while offering comfortable seating for family and guests.\n\n\nPremium Upholstery: Upholstered in a high-grade, plush soft-touch fabric (Off-White / Cream) that is smooth and easy to maintain.\n\n\nMatching Ottoman Footstool / Coffee Table Included: Features a glass top inset for added practicality and luxury appeal.\n\n\nMatching Scatter Cushions Included: Includes plush cushions with decorative gold accents to complete the look.\n\n\nSturdy Frame: Built with a durable hardwood frame designed to handle everyday UK family life.\n\n\nSpecifications:\n\n\nSofa Style: Chesterfield / Modern Channel Tufted\n\n\nOrientation: Corner / Sectional Group\n\n\nColor: Cream / Off-White with Gold Metal Trim\n\n\nUpholstery: Soft Plush Fabric\n\n\nIncludes: Corner Sofa Unit + Matching Ottoman/Coffee Table + Matching Cushions",
    "dimensions": {
      "width": 280,
      "height": 88,
      "depth": 280,
      "seatHeight": 48
    },
    "materials": [
      "Gleaming Crushed Velvet",
      "Deep Diamond Buttoned Arms & Back",
      "Hand-Finished Chrome Studs",
      "Metallic Cabriole Feet"
    ],
    "colours": [
      {
        "name": "Glacier Silver",
        "hex": "#C0C2C7"
      },
      {
        "name": "Deep Onyx",
        "hex": "#232426"
      }
    ],
    "tags": [
      "Bella Chesterfield",
      "Crushed Velvet",
      "Chesterfield Corner",
      "Showstopper Sofa"
    ],
    "isPublished": true,
    "isFeatured": false,
    "isTrending": false,
    "deliveryInfo": "Free 2-man room-of-choice UK delivery. Handcrafted to order and delivered in 5–10 working days.",
    "careInstructions": "Gently vacuum upholstery with a soft brush attachment. Blot liquid spills immediately with an absorbent uncoloured cloth. Professional cleaning recommended.",
    "assemblyRequired": false,
    "seoTitle": "Luxurious Bella Chesterfield Corner Sofa | Plush Comfort UK",
    "seoDescription": "The Bella Chesterfield Corner Sofa is a showstopper. Deep diamond buttoning, studded borders, and luxurious velvet finish finished by skilled upholsterers.",
    "rating": 4.8,
    "reviewCount": 16,
    "relatedProductIds": [
      "prod-187",
      "prod-180",
      "prod-166",
      "prod-160"
    ],
    "complementaryProductIds": [
      "prod-23"
    ],
    "reviews": []
  },
  {
    "id": "prod-23",
    "name": "Beige Armchair",
    "slug": "beige-armchair",
    "sku": "PC-UK-23",
    "categoryId": "cat-armchairs",
    "subcategoryId": "sub-accent-chairs",
    "price": 320,
    "stock": 8,
    "lowStockThreshold": 2,
    "images": [
      "https://images.unsplash.com/photo-1675767528117-963ce219b52a?q=85&w=1200&h=900"
    ],
    "shortDescription": "Add a touch of warmth to any room with this beige armchair, designed for comfort with plush cushioning and sturdy wooden legs.",
    "fullDescription": "Add a touch of warmth to any room with this beige armchair, designed for comfort with plush cushioning and sturdy wooden legs.",
    "dimensions": {
      "width": 82,
      "height": 84,
      "depth": 80,
      "seatHeight": 45
    },
    "materials": [
      "Soft Bouclé-Linen Fabric",
      "Solid Turned Wooden Legs",
      "Supportive Foam Core",
      "Ergonomic Curved Backrest"
    ],
    "colours": [
      {
        "name": "Warm Beige",
        "hex": "#DED5C7"
      }
    ],
    "tags": [
      "Beige Armchair",
      "Accent Chair",
      "Living Room Seating",
      "Bedroom Chair"
    ],
    "isPublished": true,
    "isFeatured": false,
    "isTrending": false,
    "deliveryInfo": "Free 2-man room-of-choice UK delivery. Handcrafted to order and delivered in 5–10 working days.",
    "careInstructions": "Gently vacuum upholstery with a soft brush attachment. Blot liquid spills immediately with an absorbent uncoloured cloth. Professional cleaning recommended.",
    "assemblyRequired": false,
    "seoTitle": "Beige Armchair – Cosy Scandi Accent Chair | Plush Comfort UK",
    "seoDescription": "Add warmth and versatile seating to any room with this beige armchair, designed for comfort with plush cushioning and sturdy wooden legs.",
    "rating": 4.8,
    "reviewCount": 19,
    "relatedProductIds": [],
    "complementaryProductIds": [],
    "reviews": []
  },
  {
    "id": "prod-21",
    "name": "White Wardrobe",
    "slug": "white-wardrobe",
    "sku": "PC-UK-21",
    "categoryId": "cat-wardrobes",
    "subcategoryId": "sub-freestanding-wardrobes",
    "price": 540,
    "stock": 8,
    "lowStockThreshold": 2,
    "images": [
      "https://images.unsplash.com/photo-1681381606316-426c1605dde3?q=85&w=1200&h=900"
    ],
    "shortDescription": "Keep your bedroom tidy with this elegant white wardrobe, featuring ample storage space and full-length mirrors to brighten your room.",
    "fullDescription": "Keep your bedroom tidy with this elegant white wardrobe, featuring ample storage space and full-length mirrors to brighten your room.",
    "dimensions": {
      "width": 120,
      "height": 195,
      "depth": 55
    },
    "materials": [
      "Engineered Solid Core Wood",
      "White Matte Finish",
      "Full-Length Bevelled Mirror Panels",
      "Smooth Glide Metal Drawer Runners"
    ],
    "colours": [
      {
        "name": "Pure White Matte",
        "hex": "#FDFDFD"
      }
    ],
    "tags": [
      "White Wardrobe",
      "Mirrored Wardrobe",
      "Bedroom Storage",
      "Double Wardrobe"
    ],
    "isPublished": true,
    "isFeatured": false,
    "isTrending": false,
    "deliveryInfo": "Free 2-man room-of-choice UK delivery. Handcrafted to order and delivered in 5–10 working days.",
    "careInstructions": "Gently vacuum upholstery with a soft brush attachment. Blot liquid spills immediately with an absorbent uncoloured cloth. Professional cleaning recommended.",
    "assemblyRequired": true,
    "seoTitle": "White Wardrobe with Full-Length Mirrors | Plush Comfort UK",
    "seoDescription": "Keep your bedroom tidy and bright with this elegant white wardrobe, featuring generous hanging storage, shelving, and full-length mirrors.",
    "rating": 4.8,
    "reviewCount": 22,
    "relatedProductIds": [],
    "complementaryProductIds": [],
    "reviews": []
  },
  {
    "id": "prod-19",
    "name": "King Mattress",
    "slug": "king-mattress",
    "sku": "PC-UK-19",
    "categoryId": "cat-mattresses",
    "subcategoryId": "sub-orthopaedic-mattresses",
    "price": 650,
    "stock": 8,
    "lowStockThreshold": 2,
    "images": [
      "https://images.unsplash.com/photo-1545858899-278ffaa47025?q=85&w=1200&h=900"
    ],
    "shortDescription": "Experience restful nights with this king-size mattress featuring advanced memory foam layers that adapt to your body for ultimate comfort.",
    "fullDescription": "Experience restful nights with this king-size mattress featuring advanced memory foam layers that adapt to your body for ultimate comfort.",
    "dimensions": {
      "width": 150,
      "height": 26,
      "depth": 200,
      "mattressSize": "King (5ft)"
    },
    "materials": [
      "Individually Encased Pocket Springs",
      "High-Density Memory Foam Layer",
      "Breathable Bamboo Cover",
      "Hypoallergenic Fillings"
    ],
    "colours": [
      {
        "name": "Pure White & Grey Border",
        "hex": "#EEEEEE"
      }
    ],
    "sizes": [
      "King (5ft)"
    ],
    "tags": [
      "King Mattress",
      "Memory Foam",
      "Pocket Sprung",
      "Orthopaedic Mattress"
    ],
    "isPublished": true,
    "isFeatured": false,
    "isTrending": false,
    "deliveryInfo": "Free 2-man room-of-choice UK delivery. Handcrafted to order and delivered in 5–10 working days.",
    "careInstructions": "Gently vacuum upholstery with a soft brush attachment. Blot liquid spills immediately with an absorbent uncoloured cloth. Professional cleaning recommended.",
    "assemblyRequired": false,
    "seoTitle": "King Size Memory Foam & Pocket Sprung Mattress | Plush Comfort UK",
    "seoDescription": "Experience restful nights with this king-size mattress featuring advanced memory foam layers and supportive pocket springs for pressure-relieving sleep.",
    "rating": 4.8,
    "reviewCount": 25,
    "relatedProductIds": [],
    "complementaryProductIds": [],
    "reviews": []
  },
  {
    "id": "prod-15",
    "name": "Modern Grey Sofa",
    "slug": "modern-grey-sofa",
    "sku": "PC-UK-15",
    "categoryId": "cat-fabric-sofas",
    "subcategoryId": "sub-fabric-3-seater",
    "price": 799,
    "stock": 8,
    "lowStockThreshold": 2,
    "images": [
      "https://images.unsplash.com/photo-1602374078449-4ac1a50b7a25?q=85&w=1200&h=900"
    ],
    "shortDescription": "This contemporary grey sofa blends comfort and style, featuring soft fabric upholstery and supportive cushions perfect for relaxing after a long day.",
    "fullDescription": "This contemporary grey sofa blends comfort and style, featuring soft fabric upholstery and supportive cushions perfect for relaxing after a long day.",
    "dimensions": {
      "width": 210,
      "height": 85,
      "depth": 92,
      "seatHeight": 46
    },
    "materials": [
      "Durable Textured Grey Upholstery",
      "Kiln-Dried European Beech Frame",
      "High-Density Cushioning",
      "Sleek Powder-Coated Metal Legs"
    ],
    "colours": [
      {
        "name": "Contemporary Grey",
        "hex": "#7D8085"
      }
    ],
    "tags": [
      "Modern Grey Sofa",
      "Fabric Sofa",
      "Contemporary Living",
      "Minimalist Settee"
    ],
    "isPublished": true,
    "isFeatured": false,
    "isTrending": false,
    "deliveryInfo": "Free 2-man room-of-choice UK delivery. Handcrafted to order and delivered in 5–10 working days.",
    "careInstructions": "Gently vacuum upholstery with a soft brush attachment. Blot liquid spills immediately with an absorbent uncoloured cloth. Professional cleaning recommended.",
    "assemblyRequired": false,
    "seoTitle": "Modern Grey Sofa – Contemporary British Living | Plush Comfort UK",
    "seoDescription": "This contemporary grey sofa blends comfort and style, featuring soft fabric upholstery and supportive cushions perfect for relaxing after a long day.",
    "rating": 4.8,
    "reviewCount": 28,
    "relatedProductIds": [
      "prod-112"
    ],
    "complementaryProductIds": [
      "prod-23"
    ],
    "reviews": []
  }
];

export { INITIAL_BLOG_POSTS } from './blogPosts';

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-101',
    orderNumber: 'PC-UK-82914',
    createdAt: '2026-10-09T14:22:00Z',
    customer: {
      fullName: 'Gareth Edwards',
      email: 'gareth.edwards@gmail.com',
      phone: '+44 7700 900123',
      addressLine1: '14 Chapel Lane',
      city: 'Harrogate',
      county: 'North Yorkshire',
      postcode: 'HG1 2PW',
      country: 'United Kingdom'
    },
    items: [
      {
        productId: 'prod-kensington-chair',
        name: 'The Kensington Bouclé Accent Armchair',
        sku: 'PC-CHR-KEN-01',
        price: 389.00,
        quantity: 1,
        selectedColour: 'Cozy Bouclé Beige',
        image: FURNITURE_IMAGES.heroAccentChair
      },
      {
        productId: 'prod-airedale-table',
        name: 'The Airedale Natural Oak Minimalist Side Table',
        sku: 'PC-ACC-AIR-ST',
        price: 99.00,
        quantity: 1,
        selectedColour: 'Natural Honey Oak',
        image: FURNITURE_IMAGES.heroAccentChair
      }
    ],
    subtotal: 488.00,
    deliveryFee: 0,
    discountAmount: 0,
    total: 488.00,
    paymentMethod: 'card',
    paymentStatus: 'paid',
    fulfilmentStatus: 'processing',
    deliveryOption: 'standard',
    courier: 'DX Freight Specialists',
    trackingNumber: 'DX-GB-99214401',
    estimatedDeliveryDate: '14 Oct 2026',
    timeline: [
      { status: 'Order Placed', timestamp: '2026-10-09T14:22:00Z', note: 'Payment verified via Stripe UK (£488.00)' },
      { status: 'Processing', timestamp: '2026-10-09T16:00:00Z', note: 'Quality check passed. Allocated to delivery route.' }
    ]
  },
  {
    id: 'ord-102',
    orderNumber: 'PC-UK-82855',
    createdAt: '2026-10-08T10:15:00Z',
    customer: {
      fullName: 'Charlotte Willoughby',
      email: 'c.willoughby@outlook.com',
      phone: '+44 7800 456789',
      addressLine1: '28 Lansdowne Road',
      city: 'London',
      county: 'Greater London',
      postcode: 'W11 2LS',
      country: 'United Kingdom'
    },
    items: [
      {
        productId: 'prod-dewsbury-bed',
        name: 'Ambassador Luxury Deep-Buttoned Upholstered Bed Frame',
        sku: 'PC-BED-DEW-01',
        price: 749.00,
        quantity: 1,
        selectedColour: 'Oatmeal Tweed',
        selectedSize: 'King Size (5ft)',
        image: FURNITURE_IMAGES.luxuryBed
      }
    ],
    subtotal: 749.00,
    deliveryFee: 79.99,
    discountAmount: 0,
    total: 828.99,
    paymentMethod: 'klarna',
    paymentStatus: 'paid',
    fulfilmentStatus: 'dispatched',
    deliveryOption: 'white_glove',
    courier: 'Panther 2-Man White Glove',
    trackingNumber: 'PANTHER-UK-441092',
    estimatedDeliveryDate: '12 Oct 2026',
    timeline: [
      { status: 'Order Placed', timestamp: '2026-10-08T10:15:00Z', note: 'Paid with Klarna Pay in 3 (£828.99)' },
      { status: 'Processing', timestamp: '2026-10-08T11:30:00Z', note: 'Bed frame quality audit complete.' },
      { status: 'Dispatched', timestamp: '2026-10-09T08:00:00Z', note: 'Collected by Panther Logistics for 2-man room delivery and assembly.' }
    ]
  }
];

