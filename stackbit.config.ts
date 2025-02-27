import { defineStackbitConfig, SiteMapEntry } from '@stackbit/types';
import { GitContentSource } from '@stackbit/cms-git';

export default defineStackbitConfig({
  stackbitVersion: '~0.6.0',
  contentSources: [
    new GitContentSource({
      rootPath: __dirname,
      contentDirs: ['src/content'],
      models: [
        // Page models
        {
          name: 'Page',
          type: 'page',
          urlPath: '/{slug}',
          filePath: 'src/content/pages/{slug}.md',
          fields: [
            { name: 'title', type: 'string', required: true },
            { name: 'slug', type: 'slug', required: true },
            { name: 'content', type: 'markdown', required: true },
            { name: 'seo', type: 'object', fields: [
              { name: 'title', type: 'string' },
              { name: 'description', type: 'string' },
              { name: 'keywords', type: 'list', items: { type: 'string' } }
            ]}
          ]
        },
        // Component models
        {
          name: 'Hero',
          type: 'object',
          fields: [
            { name: 'heading', type: 'string', required: true },
            { name: 'subheading', type: 'string' },
            { name: 'image', type: 'image' },
            { name: 'ctaButton', type: 'object', fields: [
              { name: 'label', type: 'string' },
              { name: 'url', type: 'string' }
            ]}
          ]
        }
      ]
    })
  ],
  // Define site map to help the visual editor navigate between pages
  siteMap: ({ documents, models }) => {
    // Filter all page models
    const pageModels = models.filter((m) => m.type === 'page');

    return documents
      // Filter all documents which are of a page model
      .filter((d) => pageModels.some(m => m.name === d.modelName))
      // Map each document to a SiteMapEntry
      .map((document) => {
        const slug = document.fields.slug || '';
        
        return {
          stableId: document.id,
          urlPath: slug === 'home' ? '/' : `/${slug}`,
          document,
          isHomePage: slug === 'home',
        };
      })
      .filter(Boolean) as SiteMapEntry[];
  },
  // Customize the visual editor experience
  visual: {
    // Enable inline editing
    inlineEditing: true,
    // Define components that can be added to content
    components: {
      // Map component models to React components
      Hero: {
        // This would be the path to your Hero component
        component: 'src/components/Hero'
      }
    }
  }
});