/**
 * Legacy mock category tree. V1 single source of truth: hubs.v1.ts (mainHubs, specialHubs, themeFilters, piercingCategories).
 * This file is not used by app routes; kept for reference only.
 * Each node: { id, name, slug, icon, children? }
 */

export type CategoryNode = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  children?: CategoryNode[];
};

export const categoriesTree: CategoryNode[] = [
  {
    id: "tattoo",
    name: "Tattoo",
    slug: "tattoo",
    icon: "Ink",
    children: [
      {
        id: "tattoo-styles",
        name: "Styles",
        slug: "tattoo/styles",
        icon: "Palette",
        children: [
          { id: "style-fine-line", name: "Fine Line", slug: "tattoo/styles/fine-line", icon: "Minus" },
          { id: "style-realism", name: "Realism", slug: "tattoo/styles/realism", icon: "Image" },
          { id: "style-traditional", name: "Traditional", slug: "tattoo/styles/traditional", icon: "Star" },
          { id: "style-minimal", name: "Minimal", slug: "tattoo/styles/minimal", icon: "Circle" },
          { id: "style-lettering", name: "Lettering", slug: "tattoo/styles/lettering", icon: "Type" },
        ],
      },
      {
        id: "tattoo-placements",
        name: "Placements",
        slug: "tattoo/placements",
        icon: "MapPin",
        children: [
          { id: "place-arm", name: "Arm", slug: "tattoo/placements/arm", icon: "Circle" },
          { id: "place-forearm", name: "Forearm", slug: "tattoo/placements/forearm", icon: "Circle" },
          { id: "place-back", name: "Back", slug: "tattoo/placements/back", icon: "Circle" },
          { id: "place-chest", name: "Chest", slug: "tattoo/placements/chest", icon: "Circle" },
          { id: "place-leg", name: "Leg", slug: "tattoo/placements/leg", icon: "Circle" },
        ],
      },
      {
        id: "tattoo-ideas",
        name: "Ideas",
        slug: "tattoo/ideas",
        icon: "Lightbulb",
        children: [
          { id: "idea-small", name: "Small", slug: "tattoo/ideas/small", icon: "Circle" },
          { id: "idea-meaningful", name: "Meaningful", slug: "tattoo/ideas/meaningful", icon: "Heart" },
          { id: "idea-couple", name: "Couple", slug: "tattoo/ideas/couple", icon: "Users" },
          { id: "idea-cover-up", name: "Cover-up", slug: "tattoo/ideas/cover-up", icon: "RefreshCw" },
        ],
      },
    ],
  },
  {
    id: "piercing",
    name: "Piercing",
    slug: "piercing",
    icon: "Circle",
    children: [
      {
        id: "piercing-ear",
        name: "Ear",
        slug: "piercing/ear",
        icon: "Ear",
        children: [
          { id: "ear-helix", name: "Helix", slug: "piercing/ear/helix", icon: "Circle" },
          { id: "ear-tragus", name: "Tragus", slug: "piercing/ear/tragus", icon: "Circle" },
          { id: "ear-lobe", name: "Lobe", slug: "piercing/ear/lobe", icon: "Circle" },
        ],
      },
      {
        id: "piercing-nose",
        name: "Nose",
        slug: "piercing/nose",
        icon: "Smile",
        children: [
          { id: "nose-nostril", name: "Nostril", slug: "piercing/nose/nostril", icon: "Circle" },
          { id: "nose-septum", name: "Septum", slug: "piercing/nose/septum", icon: "Circle" },
        ],
      },
      {
        id: "piercing-body",
        name: "Body",
        slug: "piercing/body",
        icon: "User",
        children: [
          { id: "body-navel", name: "Navel", slug: "piercing/body/navel", icon: "Circle" },
          { id: "body-etc", name: "Diğer", slug: "piercing/body/other", icon: "Circle" },
        ],
      },
    ],
  },
  { id: "aftercare", name: "Aftercare", slug: "aftercare", icon: "Heart" },
  { id: "studio", name: "Studio", slug: "studio", icon: "Building2" },
  { id: "artists", name: "Artists", slug: "artists", icon: "Users" },
  { id: "faq", name: "FAQ", slug: "faq", icon: "HelpCircle" },
];
