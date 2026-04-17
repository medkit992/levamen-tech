export type DemoTheme = {
  gradientFrom: string;
  gradientVia: string;
  gradientTo: string;
  accentSoft: string;
  accentStrong: string;
  surfaceTint: string;
};

export type DemoService = {
  title: string;
  description: string;
};

export type DemoStat = {
  label: string;
  value: string;
};

export type DemoTestimonial = {
  name: string;
  role?: string;
  quote: string;
};

export type DemoProcessStep = {
  title: string;
  description: string;
};

export type DemoFaq = {
  question: string;
  answer: string;
};

export type DemoPageData = {
  businessName: string;
  industryLabel: string;
  location?: string;

  heroEyebrow: string;
  heroTitle: string;
  heroGradientWord?: string;
  heroDescription: string;

  primaryCtaText: string;
  primaryCtaHref?: string;
  secondaryCtaText: string;
  secondaryCtaHref?: string;

  aboutTitle: string;
  aboutDescription: string;
  aboutPoints: string[];

  servicesTitle: string;
  services: DemoService[];

  stats: DemoStat[];

  testimonialSectionTitle: string;
  testimonials: DemoTestimonial[];

  processTitle: string;
  processSteps: DemoProcessStep[];

  faqTitle: string;
  faqs: DemoFaq[];

  finalCtaTitle: string;
  finalCtaDescription: string;
  finalCtaPrimaryText: string;
  finalCtaSecondaryText: string;

  theme: DemoTheme;
};