# Visual Editor Troubleshooting Guide

## Common Issues and Solutions

### Visual Editor Unavailable

If you're seeing the "Visual editor unavailable" message, follow these steps:

1. **Check Stackbit Configuration**
   - Ensure `stackbit.config.ts` is correctly configured
   - Verify content models match your project structure
   - Check that content directories exist

2. **Verify Dependencies**
   - Install Stackbit dependencies:
     ```bash
     npm install @stackbit/types @stackbit/cms-git @stackbit/cli
     ```

3. **Netlify Configuration**
   - Add Stackbit-specific settings in `netlify.toml`
   - Ensure preview environment is correctly set up

4. **Content Structure**
   - Create content directories: `src/content/pages`
   - Ensure markdown files have correct frontmatter
   - Use consistent model names in configuration

5. **Debugging Steps**
   - Run `npm run stackbit-dev` locally
   - Check Netlify build logs
   - Verify environment variables

### Recommended Project Structure

```
project-root/
├── src/
│   ├── content/
│   │   └── pages/
│   │       ├── home.md
│   │       ├── about.md
│   │       └── contact.md
│   └── components/
│       └── Hero/
│           └── index.tsx
├── stackbit.config.ts
├── netlify.toml
└── package.json
```

### Stackbit Configuration Tips

- Use `type: 'page'` for page models
- Define `urlPath` and `filePath` for each page model
- Include all necessary fields in model definitions
- Implement `siteMap` function for custom URL handling

### Netlify Settings

1. Go to Site Settings > Build & Deploy
2. Ensure preview branch is set up
3. Configure environment variables if needed

### Inline Editing

- Add `data-sb-object-id` and `data-sb-field-path` attributes to components
- Map React components to Stackbit models in configuration

## Troubleshooting Checklist

- [ ] Stackbit dependencies installed
- [ ] `stackbit.config.ts` configured
- [ ] Content directories created
- [ ] Markdown files have correct frontmatter
- [ ] Netlify configuration updated
- [ ] Preview environment set up

## Getting Help

- Check Stackbit documentation
- Review Netlify build logs
- Contact Stackbit or Netlify support