import { describe, it, expect } from 'vitest';
import { getSection, resolveSections } from './sectionRegistry';

describe('sectionRegistry', () => {
  it('hero plugin exposes defaultConfig and configSchema', () => {
    const hero = getSection('hero');
    expect(hero).toBeDefined();
    expect(hero?.defaultConfig).toMatchObject({ showDashboard: true });
    expect(hero?.configSchema?.map((f) => f.prop)).toEqual([
      'backgroundImage',
      'title',
      'subtitle',
      'ctaPrimary',
      'ctaSecondary',
      'showDashboard',
    ]);
  });

  it('resolveSections merges hero defaultConfig with CMS section config', () => {
    const sections = resolveSections({
      sections: [
        {
          type: 'hero',
          sortOrder: 0,
          isActive: true,
          config: { title: 'CMS Title' },
        },
      ],
    });

    const hero = sections.find((s) => s.key === 'hero');
    expect(hero).toBeDefined();
    expect(hero?.config).toEqual({
      showDashboard: true,
      title: 'CMS Title',
    });
  });

  it('CMS config can override hero defaultConfig values', () => {
    const sections = resolveSections({
      sections: [
        {
          type: 'hero',
          sortOrder: 0,
          isActive: true,
          config: { showDashboard: false, backgroundImage: 'https://cdn.example.com/bg.jpg' },
        },
      ],
    });

    const hero = sections.find((s) => s.key === 'hero');
    expect(hero?.config).toEqual({
      showDashboard: false,
      backgroundImage: 'https://cdn.example.com/bg.jpg',
    });
  });
});
