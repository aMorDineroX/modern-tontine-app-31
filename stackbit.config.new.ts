import { defineStackbitConfig, SiteMapEntry } from '@stackbit/types';
import { GitContentSource } from '@stackbit/cms-git';

export default defineStackbitConfig({
  stackbitVersion: '~0.6.0',
  contentSources: [
    new GitContentSource({
      rootPath: __dirname,
      contentDirs: ['src/content'],
      branches: ['main', 'preview'], // Supporter plusieurs branches
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
  // Définir la carte du site pour aider à la navigation dans l'éditeur visuel
  siteMap: ({ documents, models }) => {
    // Filtrer tous les modèles de pages
    const pageModels = models.filter((m) => m.type === 'page');

    return documents
      // Filtrer tous les documents qui sont des modèles de pages
      .filter((d) => pageModels.some(m => m.name === d.modelName))
      // Mapper chaque document à une entrée de carte du site
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
  // Personnaliser l'expérience de l'éditeur visuel
  visual: {
    // Activer l'édition en ligne
    inlineEditing: true,
    // Définir les composants qui peuvent être ajoutés au contenu
    components: {
      // Mapper les modèles de composants aux composants React
      Hero: {
        // Chemin vers votre composant Hero
        component: 'src/components/Hero'
      }
    }
  }
});