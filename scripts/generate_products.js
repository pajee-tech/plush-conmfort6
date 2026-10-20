import fs from 'fs';

const rawProducts = JSON.parse(fs.readFileSync('scripts/prepared_19_products.json', 'utf-8'));

console.log(`Loaded ${rawProducts.length} raw products`);

// Map categories and details
const categoryMap = {
  'luxury-grey-crushed-velvet-u-shape-sofa': {
    categoryId: 'cat-corner-sofas',
    subcategoryId: 'sub-u-shape',
    materials: ['Crushed Velvet', 'Kiln-Dried Hardwood', 'High-Density Reflex Foam', 'Chrome Glides'],
    colours: [{ name: 'Champagne Grey', hex: '#A8A49D' }, { name: 'Silver Slate', hex: '#8E9094' }],
    dimensions: { width: 340, height: 90, depth: 200, seatHeight: 48 },
    seoTitle: 'Luxury Grey Crushed Velvet U-Shape Sofa | Plush Comfort UK',
    seoDescription: 'Shop the Luxury Grey Crushed Velvet U-Shape Sofa at Plush Comfort UK. Grand 340cm dual-chaise layout, deep foam seating, and bespoke craftsmanship in Yorkshire.',
    tags: ['U-Shape Sofa', 'Crushed Velvet', 'Corner Sofa', 'Living Room', 'Bespoke']
  },
  'verona-plush-velvet-corner-sofa-grey-fabric-chesterfield-style-l-shape-settee-with-scatter-cushions': {
    categoryId: 'cat-corner-sofas',
    subcategoryId: 'sub-corner-l-shape',
    materials: ['Premium Plush Velvet', 'Solid Beech Frame', 'Pocket Sprung Core', 'Carved Wood Feet'],
    colours: [{ name: 'Mink Grey', hex: '#8E877F' }, { name: 'Pebble Grey', hex: '#9E9E9E' }],
    dimensions: { width: 260, height: 88, depth: 260, seatHeight: 46 },
    seoTitle: 'Verona Plush Velvet Corner Sofa – Grey Fabric Chesterfield Style | Plush Comfort UK',
    seoDescription: 'The Verona Plush Velvet Corner Sofa combines Chesterfield scrolled buttoning with relaxed scatter cushions. Handcrafted with kiln-dried timber frames in Yorkshire.',
    tags: ['Verona Sofa', 'Plush Velvet', 'Chesterfield Corner', 'Scatter Cushions', 'Grey Sofa']
  },
  'ambassador-luxury-deep-buttoned-upholstered-bed-frame': {
    categoryId: 'cat-beds-bed-frames',
    subcategoryId: 'sub-upholstered-beds',
    materials: ['Heavyweight Velvet Upholstery', 'Reinforced Timber Slat Base', 'Chunky Chrome Feet', 'High-Density Padding'],
    colours: [{ name: 'Deep Anthracite', hex: '#3B3B3B' }, { name: 'Champagne Beige', hex: '#D6CDBF' }, { name: 'Silver Ice', hex: '#C2C4C6' }],
    dimensions: { width: 165, height: 137, depth: 215, mattressSize: 'King (5ft)' },
    sizes: ['Double (4ft 6)', 'King (5ft)', 'Super King (6ft)'],
    seoTitle: 'Ambassador Luxury Deep-Buttoned Upholstered Bed Frame | Plush Comfort UK',
    seoDescription: 'The Ambassador Luxury Bed Frame features an opulent 54-inch floor-standing headboard with deep diamond buttoning. Built to last in Yorkshire with solid slats.',
    tags: ['Ambassador Bed', 'Deep Buttoned', 'Upholstered Bed', 'Luxury Beds', 'Yorkshire Made']
  },
  'nicole-3-seater-chesterfield-sofa-in-soft-cream-fabric': {
    categoryId: 'cat-chesterfield-sofas',
    subcategoryId: 'sub-3-seater',
    materials: ['Soft Cream Chenille Weave', 'Kiln-Dried European Hardwood', 'Antiqued Brass Studding', 'Turned Dark Oak Feet'],
    colours: [{ name: 'Soft Cream', hex: '#F3EFE6' }, { name: 'Oatmeal', hex: '#D8CCA3' }],
    dimensions: { width: 220, height: 84, depth: 96, seatHeight: 48 },
    seoTitle: 'Nicole 3-Seater Chesterfield Sofa in Soft Cream Fabric | Plush Comfort UK',
    seoDescription: 'Discover the Nicole 3-Seater Chesterfield Sofa in soft cream fabric. Signature scrolled arms, hand-applied brass studs, and deep buttoned backrest.',
    tags: ['Chesterfield Sofa', '3 Seater', 'Cream Fabric', 'Scrolled Arms', 'Handcrafted']
  },
  'nicole-luxury-chesterfield-corner-sofa-in-cream-soft-velvet': {
    categoryId: 'cat-chesterfield-sofas',
    subcategoryId: 'sub-chesterfield-corner',
    materials: ['Plush Cream Velvet', 'Solid Birchwood Inner Frame', 'Hand-Pleated Scrolled Arms', 'Chrome Corner Glides'],
    colours: [{ name: 'Cream Velvet', hex: '#F5F0E8' }, { name: 'Soft Champagne', hex: '#DED3BF' }],
    dimensions: { width: 275, height: 86, depth: 275, seatHeight: 47 },
    seoTitle: 'Nicole Luxury Chesterfield Corner Sofa in Cream Soft Velvet | Plush Comfort UK',
    seoDescription: 'Make a glamorous statement with the Nicole Luxury Chesterfield Corner Sofa. Symmetrical corner design, sumptuous cream velvet, and hand-tufted detailing.',
    tags: ['Nicole Corner', 'Chesterfield Corner', 'Cream Velvet', 'Luxury Living', 'Hand-Tufted']
  },
  'oxford-fabric-corner-sofa-in-light-grey-textured-chenille': {
    categoryId: 'cat-corner-sofas',
    subcategoryId: 'sub-corner-l-shape',
    materials: ['Textured Chenille Weave', 'Kiln-Dried Structural Frame', 'Fibre-Filled Scatter Backs', 'Solid Black Tapered Feet'],
    colours: [{ name: 'Light Grey Chenille', hex: '#C7C9CC' }, { name: 'Charcoal', hex: '#4A4D52' }],
    dimensions: { width: 250, height: 85, depth: 180, seatHeight: 45 },
    seoTitle: 'Oxford Fabric Corner Sofa in Light Grey Textured Chenille | Plush Comfort UK',
    seoDescription: 'The Oxford Corner Sofa combines tactile light grey chenille with deep lounge seating and plush scatter cushions. Durable, family-ready British comfort.',
    tags: ['Oxford Sofa', 'Chenille Fabric', 'Corner Sofa', 'Light Grey', 'Family Sofa']
  },
  'classic-oxblood-antique-leather-2-seater-chesterfield-sofa': {
    categoryId: 'cat-chesterfield-sofas',
    subcategoryId: 'sub-2-seater',
    materials: ['100% Genuine Antique Leather', 'Hand-Rubbed Oxblood Finish', 'Kiln-Dried Beechwood Frame', 'Individual Brass Studs'],
    colours: [{ name: 'Antique Oxblood', hex: '#631B22' }],
    dimensions: { width: 168, height: 78, depth: 92, seatHeight: 46 },
    seoTitle: 'Classic Oxblood Antique Leather 2-Seater Chesterfield Sofa | Plush Comfort UK',
    seoDescription: 'Genuine hand-rubbed antique oxblood leather 2-seater Chesterfield sofa. Authentic British craftsmanship with hand-tied serpentine springs and button tufting.',
    tags: ['Oxblood Leather', 'Chesterfield 2-Seater', 'Antique Leather', 'British Heritage']
  },
  'classic-oxblood-antique-leather-3-seater-chesterfield-sofa': {
    categoryId: 'cat-chesterfield-sofas',
    subcategoryId: 'sub-3-seater',
    materials: ['100% Genuine Antique Leather', 'Traditional Hand-Rubbed Patina', 'Solid Hardwood Frame', 'Hand-Turned Mahogany Bun Feet'],
    colours: [{ name: 'Antique Oxblood', hex: '#631B22' }],
    dimensions: { width: 215, height: 78, depth: 92, seatHeight: 46 },
    seoTitle: 'Classic Oxblood Antique Leather 3-Seater Chesterfield Sofa | Plush Comfort UK',
    seoDescription: 'The ultimate British icon. Classic Oxblood Antique Leather 3-Seater Chesterfield sofa with deep diamond tufting and hand-hammered brass studwork.',
    tags: ['Oxblood Chesterfield', '3 Seater Leather Sofa', 'Antique British', 'Handcrafted']
  },
  'luxury-u-shape-sofa': {
    categoryId: 'cat-corner-sofas',
    subcategoryId: 'sub-u-shape',
    materials: ['Soft Structured Fabric', 'Reinforced Timber Frame', 'Fibre-Filled Cushions', 'Low Profile Block Feet'],
    colours: [{ name: 'Slate Grey', hex: '#707378' }, { name: 'Mink Beige', hex: '#BFB5A6' }],
    dimensions: { width: 330, height: 88, depth: 195, seatHeight: 47 },
    seoTitle: 'Luxury U Shape Sofa – Extra Large Family Seating | Plush Comfort UK',
    seoDescription: 'Spacious Luxury U Shape Sofa designed for large living rooms and family movie nights. Double chaise layout upholstered in hard-wearing plush fabric.',
    tags: ['U Shape Sofa', 'Extra Large Sofa', 'Family Living Room', 'Plush Comfort']
  },
  'nicole-32-chesterfield-sofa-set-in-soft-fabric-with-studded-detail': {
    categoryId: 'cat-chesterfield-sofas',
    subcategoryId: 'sub-sofa-sets',
    materials: ['Linen-Touch Soft Upholstery', 'Dual Hardwood Construction', 'Individually Pinned Studs', 'High-Resilience Core'],
    colours: [{ name: 'Warm Cream', hex: '#F0E8DC' }, { name: 'Ash Grey', hex: '#A2A4A8' }],
    dimensions: { width: 220, height: 84, depth: 96, seatHeight: 48 },
    seoTitle: 'Nicole 3+2 Chesterfield Sofa Set with Studded Detail | Plush Comfort UK',
    seoDescription: 'Complete suite living: the Nicole 3+2 Chesterfield Sofa Set includes both a 3-seater and a 2-seater sofa with traditional scroll arms and studded trim.',
    tags: ['3+2 Sofa Set', 'Chesterfield Suite', 'Living Room Set', 'Nicole Chesterfield']
  },
  'double-ottoman-divan-bed-set-with-orthopaedic-mattress-vertical-panelled-headboard': {
    categoryId: 'cat-divan-beds',
    subcategoryId: 'sub-ottoman-divans',
    materials: ['Gas-Lift Hydraulic Pistons', 'Reinforced Divan Base', 'Orthopaedic Tufted Mattress', 'Vertical Panelled Padded Headboard'],
    colours: [{ name: 'Silver Grey Plush', hex: '#BDBEC0' }, { name: 'Charcoal Linen', hex: '#3C3E42' }, { name: 'Oatmeal', hex: '#D7CEBD' }],
    dimensions: { width: 140, height: 130, depth: 200, storageDepth: 28, mattressSize: 'Double (4ft 6)' },
    sizes: ['Double (4ft 6)', 'King (5ft)'],
    seoTitle: 'Double Ottoman Divan Bed Set with Orthopaedic Mattress & Headboard | Plush Comfort UK',
    seoDescription: 'Maximize bedroom storage with our Double Ottoman Divan Bed set. Features smooth gas-lift pistons, 54-inch vertical panel headboard, and medium-firm orthopaedic mattress.',
    tags: ['Ottoman Bed', 'Divan Bed Set', 'Orthopaedic Mattress', 'Storage Bed', 'Underbed Storage']
  },
  'lilly-corner-sofa-luxury-plush-fabric-with-bolster-cushions': {
    categoryId: 'cat-corner-sofas',
    subcategoryId: 'sub-corner-l-shape',
    materials: ['Luxury Plush Soft-Touch Fabric', 'Stitched Fluted Arm Detail', 'Reflex Foam Cushioning', 'Matching Cylindrical Bolsters'],
    colours: [{ name: 'Plush Dove Grey', hex: '#A8AAAD' }, { name: 'Emerald Forest', hex: '#264A38' }],
    dimensions: { width: 245, height: 86, depth: 165, seatHeight: 46 },
    seoTitle: 'Lilly Corner Sofa – Luxury Plush Fabric with Bolster Cushions | Plush Comfort UK',
    seoDescription: 'The Lilly Corner Sofa delivers contemporary elegance with distinctive vertical fluting along the sides, plush back cushions, and matching cylindrical bolsters.',
    tags: ['Lilly Corner Sofa', 'Bolster Cushions', 'Fluted Arms', 'Plush Fabric', 'Corner Settee']
  },
  'luxury-u-shaped-velvet-corner-sofa-with-double-chaise': {
    categoryId: 'cat-corner-sofas',
    subcategoryId: 'sub-u-shape',
    materials: ['Silky Smooth Velvet', 'Double Chaise Lounge Layout', 'Heavy-Duty Timber Framing', 'Chrome Bracket Supports'],
    colours: [{ name: 'Champagne Taupe', hex: '#C2B8A6' }, { name: 'Midnight Charcoal', hex: '#2C2E33' }],
    dimensions: { width: 325, height: 89, depth: 190, seatHeight: 48 },
    seoTitle: 'Luxury U-Shaped Velvet Corner Sofa with Double Chaise | Plush Comfort UK',
    seoDescription: 'Indulge in spacious comfort with our Luxury U-Shaped Velvet Corner Sofa featuring dual chaise ends. Perfect for family lounging and cinema rooms.',
    tags: ['Double Chaise Sofa', 'Velvet U-Shape', 'Luxury Settee', 'Plush Seating']
  },
  'verona-corner-sofa-luxury-light-grey-fabric-sofa-with-deep-seating': {
    categoryId: 'cat-fabric-sofas',
    subcategoryId: 'sub-fabric-corner',
    materials: ['Soft Weave Chenille-Polyester Fabric', 'Deep Reflex Foam Seats', 'Tufted Scroll Trim', 'Solid Wood Tapered Legs'],
    colours: [{ name: 'Light Grey Weave', hex: '#B8B9BB' }],
    dimensions: { width: 255, height: 87, depth: 255, seatHeight: 46 },
    seoTitle: 'Verona Corner Sofa – Luxury Light Grey Fabric Sofa with Deep Seating | Plush Comfort UK',
    seoDescription: 'Sink into the deep seating of the Verona Corner Sofa. Soft-touch light grey weave, classic rolled detailing, and durable construction handcrafted in the UK.',
    tags: ['Verona Fabric Sofa', 'Deep Seating', 'Light Grey Sofa', 'Corner Fabric']
  },
  'luxurious-bella-modern-chesterfield-corner-sofa': {
    categoryId: 'cat-chesterfield-sofas',
    subcategoryId: 'sub-chesterfield-corner',
    materials: ['Gleaming Crushed Velvet', 'Deep Diamond Buttoned Arms & Back', 'Hand-Finished Chrome Studs', 'Metallic Cabriole Feet'],
    colours: [{ name: 'Glacier Silver', hex: '#C0C2C7' }, { name: 'Deep Onyx', hex: '#232426' }],
    dimensions: { width: 280, height: 88, depth: 280, seatHeight: 48 },
    seoTitle: 'Luxurious Bella Chesterfield Corner Sofa | Plush Comfort UK',
    seoDescription: 'The Bella Chesterfield Corner Sofa is a showstopper. Deep diamond buttoning, studded borders, and luxurious velvet finish built by Yorkshire artisans.',
    tags: ['Bella Chesterfield', 'Crushed Velvet', 'Chesterfield Corner', 'Showstopper Sofa']
  },
  'beige-armchair': {
    categoryId: 'cat-armchairs',
    subcategoryId: 'sub-accent-chairs',
    materials: ['Soft Bouclé-Linen Fabric', 'Solid Turned Wooden Legs', 'Supportive Foam Core', 'Ergonomic Curved Backrest'],
    colours: [{ name: 'Warm Beige', hex: '#DED5C7' }],
    dimensions: { width: 82, height: 84, depth: 80, seatHeight: 45 },
    seoTitle: 'Beige Armchair – Cosy Scandi Accent Chair | Plush Comfort UK',
    seoDescription: 'Add warmth and versatile seating to any room with this beige armchair, designed for comfort with plush cushioning and sturdy wooden legs.',
    tags: ['Beige Armchair', 'Accent Chair', 'Living Room Seating', 'Bedroom Chair']
  },
  'white-wardrobe': {
    categoryId: 'cat-wardrobes',
    subcategoryId: 'sub-freestanding-wardrobes',
    materials: ['Engineered Solid Core Wood', 'White Matte Finish', 'Full-Length Bevelled Mirror Panels', 'Smooth Glide Metal Drawer Runners'],
    colours: [{ name: 'Pure White Matte', hex: '#FDFDFD' }],
    dimensions: { width: 120, height: 195, depth: 55 },
    seoTitle: 'White Wardrobe with Full-Length Mirrors | Plush Comfort UK',
    seoDescription: 'Keep your bedroom tidy and bright with this elegant white wardrobe, featuring generous hanging storage, shelving, and full-length mirrors.',
    tags: ['White Wardrobe', 'Mirrored Wardrobe', 'Bedroom Storage', 'Double Wardrobe']
  },
  'king-mattress': {
    categoryId: 'cat-mattresses',
    subcategoryId: 'sub-orthopaedic-mattresses',
    materials: ['Individually Encased Pocket Springs', 'High-Density Memory Foam Layer', 'Breathable Bamboo Cover', 'Hypoallergenic Fillings'],
    colours: [{ name: 'Pure White & Grey Border', hex: '#EEEEEE' }],
    dimensions: { width: 150, height: 26, depth: 200, mattressSize: 'King (5ft)' },
    sizes: ['King (5ft)'],
    seoTitle: 'King Size Memory Foam & Pocket Sprung Mattress | Plush Comfort UK',
    seoDescription: 'Experience restful nights with this king-size mattress featuring advanced memory foam layers and supportive pocket springs for pressure-relieving sleep.',
    tags: ['King Mattress', 'Memory Foam', 'Pocket Sprung', 'Orthopaedic Mattress']
  },
  'modern-grey-sofa': {
    categoryId: 'cat-fabric-sofas',
    subcategoryId: 'sub-fabric-3-seater',
    materials: ['Durable Textured Grey Upholstery', 'Kiln-Dried European Beech Frame', 'High-Density Cushioning', 'Sleek Powder-Coated Metal Legs'],
    colours: [{ name: 'Contemporary Grey', hex: '#7D8085' }],
    dimensions: { width: 210, height: 85, depth: 92, seatHeight: 46 },
    seoTitle: 'Modern Grey Sofa – Contemporary British Living | Plush Comfort UK',
    seoDescription: 'This contemporary grey sofa blends comfort and style, featuring soft fabric upholstery and supportive cushions perfect for relaxing after a long day.',
    tags: ['Modern Grey Sofa', 'Fabric Sofa', 'Contemporary Living', 'Minimalist Settee']
  }
};

const processedProducts = rawProducts.map((p, index) => {
  const meta = categoryMap[p.slug] || {
    categoryId: 'cat-sofas',
    materials: ['Solid Hardwood', 'High Resilience Foam', 'Premium Fabric'],
    colours: [{ name: 'Natural', hex: '#CCCCCC' }],
    dimensions: { width: 200, height: 85, depth: 90, seatHeight: 45 },
    seoTitle: `${p.name} | Plush Comfort UK`,
    seoDescription: p.shortDescription || `Shop ${p.name} at Plush Comfort UK. Handcrafted British furniture with 10-year warranty.`,
    tags: ['Plush Comfort', 'UK Furniture']
  };

  // Clean html tags in descriptions
  const cleanFullDesc = (p.fullDescription || '')
    .replace(/<p>/g, '')
    .replace(/<\/p>/g, '\n\n')
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#038;/g, '&')
    .replace(/&amp;/g, '&')
    .trim();

  const shortDesc = p.shortDescription || cleanFullDesc.split('\n')[0] || p.name;

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku || `PC-UK-${String(index + 101).padStart(3, '0')}`,
    categoryId: meta.categoryId,
    subcategoryId: meta.subcategoryId,
    price: p.price,
    salePrice: p.salePrice && p.salePrice < p.price ? p.salePrice : undefined,
    stock: 8,
    lowStockThreshold: 2,
    images: p.images && p.images.length > 0 ? p.images : ['/uploads/products/placeholder.jpg'],
    shortDescription: shortDesc,
    fullDescription: cleanFullDesc || shortDesc,
    dimensions: meta.dimensions,
    materials: meta.materials,
    colours: meta.colours,
    sizes: meta.sizes,
    tags: meta.tags,
    isPublished: true,
    isFeatured: index < 6, // top 6 featured on homepage
    isTrending: [0, 1, 2, 4, 6, 8, 10].includes(index),
    deliveryInfo: 'Free 2-man room-of-choice UK delivery. Handcrafted to order and delivered in 5–10 working days.',
    careInstructions: 'Gently vacuum upholstery with a soft brush attachment. Blot liquid spills immediately with an absorbent uncoloured cloth. Professional cleaning recommended.',
    assemblyRequired: meta.categoryId.includes('bed') || meta.categoryId === 'cat-wardrobes',
    seoTitle: meta.seoTitle,
    seoDescription: meta.seoDescription,
    rating: 4.8,
    reviewCount: 14 + (index * 3) % 20,
    relatedProductIds: [],
    complementaryProductIds: [],
    reviews: []
  };
});

// Setup related products
processedProducts.forEach(p => {
  const sameCat = processedProducts
    .filter(o => o.id !== p.id && o.categoryId === p.categoryId)
    .map(o => o.id);
  p.relatedProductIds = sameCat.slice(0, 4);

  // Complementary: e.g. bed -> mattress, sofa -> armchair
  if (p.categoryId.includes('bed')) {
    const mattress = processedProducts.find(o => o.categoryId === 'cat-mattresses');
    if (mattress) p.complementaryProductIds = [mattress.id];
  } else if (p.categoryId.includes('sofa')) {
    const chair = processedProducts.find(o => o.categoryId === 'cat-armchairs');
    if (chair) p.complementaryProductIds = [chair.id];
  }
});

fs.writeFileSync('scripts/final_19_products.json', JSON.stringify(processedProducts, null, 2));
console.log('Saved 19 fully formatted products to scripts/final_19_products.json!');
