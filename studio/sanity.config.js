import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {postType} from './schemas/post.js'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || import.meta.env.SANITY_STUDIO_PROJECT_ID
const dataset = process.env.SANITY_STUDIO_DATASET || import.meta.env.SANITY_STUDIO_DATASET || 'production'

if (!projectId) throw new Error('Missing SANITY_STUDIO_PROJECT_ID in studio/.env')

export default defineConfig({
  name: 'seven-travel-guide',
  title: 'Seven Travel — Vietnam Travel Guide',
  projectId,
  dataset,
  basePath: '/',
  plugins: [structureTool()],
  schema: {types: [postType]},
})
