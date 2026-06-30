export type CanonicalCategorySlug =
  | 'farm-machinery-equipment'
  | 'seeds'
  | 'fertilizers'
  | 'crop-protection'
  | 'livestock-supplies'
  | 'irrigation-watering'

export interface CanonicalCategory {
  slug: CanonicalCategorySlug
  name: string
  description: string
  shortDescription: string
  icon: string
  aliases: string[]
  keywords: string[]
}

export interface CategoryLike {
  id: string
  name: string
  parent_id?: string | null
  slug?: string | null
}

export interface ProductCategoryLike {
  title?: string | null
  description?: string | null
  category?: string | null
  category_name?: string | null
  category_id?: string | null
}

export const CANONICAL_CATEGORIES: CanonicalCategory[] = [
  {
    slug: 'farm-machinery-equipment',
    name: 'Farm Machinery & Equipment',
    icon: '🚜',
    shortDescription: 'Sprayers, tools, machinery, tractors, and farm equipment.',
    description:
      'Browse farm machinery and agricultural equipment from trusted sellers in Ghana. Find knapsack sprayers, irrigation tools, farm tools, and equipment for crop production, pest control, and farm operations.',
    aliases: [
      'Machinery & Tools',
      'Farm Machinery',
      'Farm Machinery & Equipment',
      'Equipment',
      'Sprayers',
      'Farm Tools',
      'Farm Machinery / Equipment',
      'Agricultural Equipment',
      'Agricultural Tractors',
    ],
    keywords: [
      'machinery',
      'equipment',
      'sprayer',
      'sprayers',
      'knapsack',
      'tractor',
      'tractors',
      'farm tools',
      'power tools',
      'drill',
      'chainsaw',
      'tiller',
      'cultivator',
    ],
  },
  {
    slug: 'seeds',
    name: 'Seeds',
    icon: '🌱',
    shortDescription: 'Crop seeds, seedlings, cereals, vegetables, and fruit seeds.',
    description:
      'Browse crop seeds, seedlings, cereals, vegetables, and fruit tree seeds from trusted agricultural sellers in Ghana.',
    aliases: ['Seeds', 'Crop Seeds', 'Seedlings', 'Seed', 'Cereal Seeds', 'Fruit Tree Seeds', 'Vegetable Seeds'],
    keywords: ['seed', 'seeds', 'seedling', 'seedlings', 'cereal seeds', 'fruit tree seeds', 'vegetable seeds'],
  },
  {
    slug: 'fertilizers',
    name: 'Fertilizers',
    icon: '🌾',
    shortDescription: 'Organic fertilizers, NPK, manure, substrates, and soil nutrients.',
    description:
      'Find fertilizers, soil nutrients, manure, growing substrates, and organic fertilizer products for farms in Ghana.',
    aliases: [
      'Fertilizers',
      'Fertiliser',
      'Fertilizers & Substrates',
      'Organic Fertilizer',
      'Organic Fertiliser',
      'Liquid Fertilizer',
      'Liquid Fertiliser',
      'Manure',
      'NPK & Mineral Fertilizers',
      'Nitrogen Fertilizers',
      'Professional Growing Substrates',
    ],
    keywords: ['fertilizer', 'fertiliser', 'npk', 'manure', 'substrate', 'compost', 'nitrogen', 'soil nutrient'],
  },
  {
    slug: 'crop-protection',
    name: 'Crop Protection',
    icon: '🛡️',
    shortDescription: 'Pesticides, herbicides, fungicides, insecticides, and agrochemicals.',
    description:
      'Find crop protection products in Ghana including pesticides, herbicides, fungicides, insecticides, and pest control products.',
    aliases: [
      'Crop Protection',
      'Plant Protection',
      'Pesticides',
      'Herbicides',
      'Fungicides',
      'Insecticides',
      'Agrochemicals',
      'Pest Control',
      'Nematicides',
      'Biological Control - Predators',
    ],
    keywords: [
      'crop protection',
      'plant protection',
      'pesticide',
      'pesticides',
      'herbicide',
      'fungicide',
      'insecticide',
      'agrochemical',
      'pest control',
      'nematicide',
    ],
  },
  {
    slug: 'livestock-supplies',
    name: 'Livestock Supplies',
    icon: '🐄',
    shortDescription: 'Animal feed, poultry supplies, animal health, housing, and feeders.',
    description:
      'Browse livestock supplies in Ghana including animal feed, poultry supplies, animal health products, housing, fencing, feeders, and watering equipment.',
    aliases: [
      'Livestock',
      'Livestock Supplies',
      'Livestock & Pets',
      'Animal Feed',
      'Poultry',
      'Animal Health',
      'Cattle Feed',
      'Poultry Feed',
      'Livestock Feeders',
      'Animal Housing & Fencing',
    ],
    keywords: ['livestock', 'animal feed', 'poultry', 'cattle', 'animal health', 'feeders', 'fencing'],
  },
  {
    slug: 'irrigation-watering',
    name: 'Irrigation & Watering',
    icon: '💧',
    shortDescription: 'Irrigation systems, watering tools, hoses, pumps, and water equipment.',
    description:
      'Find irrigation and watering equipment in Ghana including drip irrigation hoses, pumps, sprinklers, and water systems for farms.',
    aliases: ['Irrigation', 'Watering', 'Irrigation & Watering', 'Pumps', 'Water Pumps', 'Drip Irrigation Hoses'],
    keywords: ['irrigation', 'watering', 'water pump', 'pump', 'pumps', 'drip irrigation', 'hose', 'hoses', 'sprinkler'],
  },
]

const aliasToSlug = new Map<string, CanonicalCategorySlug>()

for (const category of CANONICAL_CATEGORIES) {
  aliasToSlug.set(normalizeCategoryTerm(category.slug), category.slug)
  aliasToSlug.set(normalizeCategoryTerm(category.name), category.slug)
  for (const alias of category.aliases) {
    aliasToSlug.set(normalizeCategoryTerm(alias), category.slug)
  }
}

export function normalizeCategoryTerm(value?: string | null): string {
  return (value || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

export function toCategorySlug(value: string): string {
  return normalizeCategoryTerm(value).replace(/\s+/g, '-')
}

export function getCanonicalCategory(slug?: string | null): CanonicalCategory | undefined {
  if (!slug) return undefined
  return CANONICAL_CATEGORIES.find((category) => category.slug === slug)
}

export function getCanonicalCategorySlugForName(value?: string | null): CanonicalCategorySlug | null {
  if (!value) return null
  const normalized = normalizeCategoryTerm(value)
  return aliasToSlug.get(normalized) || null
}

export function categoryMatchesCanonicalSlug(category: CategoryLike, slug: CanonicalCategorySlug): boolean {
  return (
    getCanonicalCategorySlugForName(category.slug) === slug ||
    getCanonicalCategorySlugForName(category.name) === slug
  )
}

export function getCanonicalCategoryIds(categories: CategoryLike[], slug: CanonicalCategorySlug): string[] {
  const ids = new Set<string>()

  for (const category of categories) {
    if (categoryMatchesCanonicalSlug(category, slug)) {
      ids.add(category.id)
    }
  }

  let changed = true
  while (changed) {
    changed = false
    for (const category of categories) {
      if (category.parent_id && ids.has(category.parent_id) && !ids.has(category.id)) {
        ids.add(category.id)
        changed = true
      }
    }
  }

  return Array.from(ids)
}

export function inferProductCanonicalCategorySlug(
  product: ProductCategoryLike,
  categoryName?: string | null
): CanonicalCategorySlug | null {
  const directCategory =
    getCanonicalCategorySlugForName(categoryName) ||
    getCanonicalCategorySlugForName(product.category_name) ||
    getCanonicalCategorySlugForName(product.category)

  if (directCategory) return directCategory

  const title = normalizeCategoryTerm(product.title)
  const description = normalizeCategoryTerm(product.description)
  let best: { slug: CanonicalCategorySlug; score: number } | null = null

  for (const category of CANONICAL_CATEGORIES) {
    let score = 0
    for (const keyword of category.keywords) {
      const normalizedKeyword = normalizeCategoryTerm(keyword)
      if (!normalizedKeyword) continue
      if (title.includes(normalizedKeyword)) score += 5
      if (description.includes(normalizedKeyword)) score += 1
    }

    if (score > 0 && (!best || score > best.score)) {
      best = { slug: category.slug, score }
    }
  }

  return best?.slug || null
}

export function productMatchesCanonicalCategory(
  product: ProductCategoryLike,
  slug: CanonicalCategorySlug,
  categoriesById: ReadonlyMap<string, CategoryLike>
): boolean {
  const productCategory = product.category_id ? categoriesById.get(product.category_id) : undefined

  if (productCategory && categoryMatchesCanonicalSlug(productCategory, slug)) {
    return true
  }

  const inferredSlug = inferProductCanonicalCategorySlug(product, productCategory?.name)
  return inferredSlug === slug
}
