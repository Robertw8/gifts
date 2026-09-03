import { GiftRarity, GiftSource, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  { slug: 'free-drops', name: 'Free Drops', artwork: '🎁', accent: '#ffbf13', sortOrder: 0 },
  { slug: 'cosmic', name: 'Cosmic', artwork: '🚀', accent: '#38bdf8', sortOrder: 1 },
  { slug: 'luxe', name: 'Luxe', artwork: '💎', accent: '#a78bfa', sortOrder: 2 },
  { slug: 'playful', name: 'Playful', artwork: '🍭', accent: '#1cc88f', sortOrder: 3 },
  { slug: 'seasonal', name: 'Seasonal', artwork: '🌸', accent: '#f09e8e', sortOrder: 4 },
  { slug: 'tech', name: 'Tech', artwork: '🎮', accent: '#8269df', sortOrder: 5 },
] as const;

const gifts = [
  ['aurora-bloom', 'Aurora Bloom', '🌸', 'seasonal', GiftRarity.LEGENDARY, '840', 500, 42, true, 980, 'A luminous blossom gathered from the edge of a midnight sky.'],
  ['lucky-croissant', 'Lucky Croissant', '🥐', 'playful', GiftRarity.EPIC, '320', 1800, 216, true, 920, 'Freshly minted, impossibly flaky, and rumored to bring good luck.'],
  ['starlight-ring', 'Starlight Ring', '💍', 'luxe', GiftRarity.RARE, '145', 4200, 864, true, 895, 'A tiny orbit of stardust for collectors who shine after dark.'],
  ['moon-capsule', 'Moon Capsule', '🚀', 'cosmic', GiftRarity.EPIC, '410', 1500, 108, true, 880, 'A pocket-sized launch vehicle with a one-way ticket to wonder.'],
  ['candy-comet', 'Candy Comet', '🍭', 'playful', GiftRarity.RARE, '96', 8000, 1204, true, 850, 'A sweet streak of color that only appears once per season.'],
  ['cosmic-cap', 'Cosmic Cap', '🧢', 'cosmic', GiftRarity.COMMON, '48', 12000, 3810, true, 820, 'Streetwear from a friendlier corner of the universe.'],
  ['crystal-frog', 'Crystal Frog', '🐸', 'luxe', GiftRarity.LEGENDARY, '980', 333, 19, true, 810, 'A cheerful guardian of rare stones and very small treasures.'],
  ['velvet-heart', 'Velvet Heart', '💜', 'seasonal', GiftRarity.COMMON, '32', 25000, 7280, false, 790, 'Soft to the eye, scarce by design, and made to be shared.'],
  ['neon-console', 'Neon Console', '🎮', 'tech', GiftRarity.EPIC, '360', 2200, 415, false, 760, 'A glowing pocket arcade built for the after-hours collector.'],
  ['golden-key', 'Golden Key', '🔑', 'luxe', GiftRarity.LEGENDARY, '760', 777, 81, false, 735, 'Unlocks no doors, but opens every conversation.'],
  ['mystery-box', 'Mystery Box', '🎁', 'free-drops', GiftRarity.COMMON, '24', 50000, 11420, false, 710, 'A small surprise wrapped for curious collectors.'],
  ['pixel-potion', 'Pixel Potion', '🧪', 'tech', GiftRarity.RARE, '118', 6400, 902, false, 690, 'A bright digital tonic with a perfectly square sparkle.'],
  ['sunset-shell', 'Sunset Shell', '🐚', 'seasonal', GiftRarity.RARE, '132', 4500, 622, false, 670, 'Keeps the last light of summer close at hand.'],
  ['royal-crown', 'Royal Crown', '👑', 'luxe', GiftRarity.LEGENDARY, '1250', 250, 14, false, 660, 'A limited crown for collectors who never queue.'],
  ['turbo-skates', 'Turbo Skates', '🛼', 'playful', GiftRarity.EPIC, '285', 2400, 322, false, 640, 'Retro wheels tuned for impossible speed.'],
  ['cloud-nine', 'Cloud Nine', '☁️', 'cosmic', GiftRarity.COMMON, '28', 30000, 8440, false, 620, 'A tiny piece of sky with nowhere else to be.'],
  ['magic-mushroom', 'Magic Mushroom', '🍄', 'seasonal', GiftRarity.RARE, '105', 7000, 1240, false, 610, 'A bright forest find with an unusually cheerful glow.'],
  ['diamond-bow', 'Diamond Bow', '🎀', 'luxe', GiftRarity.EPIC, '455', 1200, 144, false, 600, 'A polished bow finished with a crystal edge.'],
  ['space-dog', 'Space Dog', '🐕', 'cosmic', GiftRarity.EPIC, '390', 1900, 208, false, 580, 'A loyal explorer from the quiet side of the moon.'],
  ['arcade-token', 'Arcade Token', '🪙', 'tech', GiftRarity.COMMON, '18', 60000, 19200, false, 560, 'One more round, preserved forever.'],
  ['peachy-day', 'Peachy Day', '🍑', 'seasonal', GiftRarity.COMMON, '36', 22000, 5680, false, 540, 'A warm little reminder that today can be sweet.'],
  ['flying-sneaker', 'Flying Sneaker', '👟', 'playful', GiftRarity.RARE, '154', 3600, 480, false, 520, 'Laces tied, gravity optional.'],
  ['hologram-cat', 'Hologram Cat', '🐈', 'tech', GiftRarity.LEGENDARY, '1100', 300, 23, false, 510, 'A rare companion rendered entirely in light.'],
  ['meteor-badge', 'Meteor Badge', '☄️', 'cosmic', GiftRarity.RARE, '126', 5100, 740, false, 500, 'Proof that you were there when the sky lit up.'],
  ['party-parrot', 'Party Parrot', '🦜', 'playful', GiftRarity.EPIC, '275', 2600, 351, false, 480, 'Always dressed for the next celebration.'],
  ['winter-orb', 'Winter Orb', '🔮', 'seasonal', GiftRarity.EPIC, '340', 2000, 286, false, 460, 'A frozen scene that never melts.'],
  ['mini-vault', 'Mini Vault', '🔐', 'free-drops', GiftRarity.RARE, '88', 9000, 1550, false, 440, 'Small enough for a pocket, secure enough for secrets.'],
  ['lucky-clover', 'Lucky Clover', '🍀', 'free-drops', GiftRarity.COMMON, '20', 45000, 13300, false, 420, 'Four leaves and one very good day.'],
  ['laser-watch', 'Laser Watch', '⌚', 'tech', GiftRarity.EPIC, '430', 1400, 170, false, 400, 'Keeps time in several dimensions at once.'],
  ['pearl-star', 'Pearl Star', '⭐', 'luxe', GiftRarity.RARE, '168', 3200, 438, false, 380, 'A soft-glowing star with a pearlescent finish.'],
  ['bubble-tea', 'Bubble Tea', '🧋', 'playful', GiftRarity.COMMON, '30', 28000, 7880, false, 360, 'A collectible refreshment with unlimited shelf life.'],
  ['galaxy-lamp', 'Galaxy Lamp', '🏮', 'cosmic', GiftRarity.LEGENDARY, '890', 420, 37, false, 340, 'Lights a room with a miniature spiral galaxy.'],
] as const;

const banners = [
  { slug: 'rocket-run', label: 'HOT!', title: 'ROCKET', subtitle: 'Limited cosmic drops', artwork: '🚀', style: 'rocket', gradientFrom: '#77baf7', gradientTo: '#55a6ee', targetPath: '/gifts?category=cosmic', sortOrder: 0 },
  { slug: 'collector-pvp', label: 'NEW!', title: 'PVP', subtitle: 'Top collector picks', artwork: '⚔️', style: 'pvp', gradientFrom: '#ffbb0a', gradientTo: '#f08600', targetPath: '/gifts?sort=popular', sortOrder: 1 },
  { slug: 'play-hub', label: 'HOT', title: 'PLAY HUB', subtitle: 'Playful limited editions', artwork: '🎮', style: 'play', gradientFrom: '#361174', gradientTo: '#9c22dc', targetPath: '/gifts?category=playful', sortOrder: 2 },
] as const;

async function main() {
  if (process.env.NODE_ENV === 'production' || process.env.ENABLE_DEVELOPMENT_SEED !== 'true') {
    throw new Error('Development seed is disabled. Set ENABLE_DEVELOPMENT_SEED=true outside production to use the fallback catalog.');
  }

  const categoryIds = new Map<string, string>();
  for (const category of categories) {
    const saved = await prisma.category.upsert({ where: { slug: category.slug }, update: category, create: category });
    categoryIds.set(category.slug, saved.id);
  }

  for (const [slug, name, artwork, categorySlug, rarity, price, supply, available, featured, popularity, description] of gifts) {
    const data = {
      name, artwork, rarity, price, supply, available, featured, popularity, description,
      source: GiftSource.INTERNAL,
      imageUrl: '',
      categoryId: categoryIds.get(categorySlug)!,
    };
    await prisma.gift.upsert({ where: { slug }, update: data, create: { slug, ...data } });
  }

  await prisma.category.deleteMany({ where: { slug: 'collectibles', gifts: { none: {} } } });

  for (const banner of banners) {
    await prisma.banner.upsert({
      where: { slug: banner.slug },
      update: { ...banner, imageUrl: '', active: true },
      create: { ...banner, imageUrl: '', active: true },
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
