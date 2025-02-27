# Visual Editor Setup for Netlify

This document explains how to use the Visual Editor with your Netlify site.

## Prerequisites

- A Netlify account
- Your site deployed on Netlify
- Git repository connected to Netlify

## How to Enable the Visual Editor

1. In your Netlify dashboard, navigate to your site
2. Go to "Site configuration" > "Visual editor"
3. Click "Enable visual editor"
4. Set the working branch to "preview" (or your preferred branch)
5. Set the runnable directory to "/"
6. Set the visual editor landing page to "/"
7. Click "Save" to apply the settings

## Content Structure

The content for this site is stored in the `src/content` directory:

- `src/content/pages/`: Contains markdown files for each page
- Each page has frontmatter with metadata and markdown content

## Editing Content

1. Navigate to your site in the Netlify dashboard
2. Click on the "Visual Editor" tab
3. You'll be taken to a preview of your site where you can:
   - Click on editable elements to modify them
   - Use the sidebar to navigate between pages
   - Add new components to pages
   - Create new pages

## Publishing Changes

1. After making changes in the Visual Editor, click the "Publish" button
2. Your changes will be committed to the specified branch
3. If you've set up continuous deployment, your site will automatically rebuild with the new content

## Developer Notes

- The visual editor configuration is in `stackbit.config.ts`
- Components with the `data-sb-object-id` and `data-sb-field-path` attributes are editable
- To make a new component editable, add these attributes to the relevant elements