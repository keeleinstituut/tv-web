import { Octokit } from 'octokit'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import termsMarkup from './markups/terms.js'
import manualMarkup from './markups/manual.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Use octokit to access github API and convert markdown to html

const octokit = new Octokit({})

const convertMarkdownToHtml = async (text) => {
  return await octokit.request('POST /markdown', {
    text: text,
    mode: 'gfm',
    headers: {
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })
}

// Function to split the markup into sections based on [START], [BREAK], and [END] markers
const splitMarkupIntoSections = (markup) => {
  const sections = []
  // Regular expression to capture sections with or without [BREAK]
  const regex =
    /\[START\]\s*##\s*(.*?)\n([\s\S]*?)(?:\n\[BREAK\]([\s\S]*?))?\n\[END\]/g

  let match

  // Process each match found by the regex
  while ((match = regex.exec(markup)) !== null) {
    const title = match[1].trim() // Extract title
    const content = (match[2] + (match[3] || '')).trim() // Extract content, combining if [BREAK] exists
    const tooltipContent = match[3] ? match[2].trim() : content // Extract tooltip content (before [BREAK] if it exists)

    sections.push({
      title: title,
      content: content,
      tooltipContent: tooltipContent,
    })
  }

  return sections
}

// Store manual content as json
const storeManualHtmlInFile = async (content) => {
  fs.writeFileSync(
    `${__dirname}/../src/static/manual.json`,
    JSON.stringify(content, null, 2)
  )
}

// Store terms content as json
const storeTermsHtmlInFile = async (content) => {
  fs.writeFileSync(
    `${__dirname}/../src/static/terms.json`,
    JSON.stringify({ content: content?.data }, null, 2)
  )
}

const orderOfKeys = [
  'usersManagement',
  'addUsers',
  'roleManagement',
  'projects',
  'projectDetails',
  'subProject',
  'myTasks',
  'editProjectDetails',
  'cancelProject',
  'acceptProject',
  'vendorsDatabase',
  'priceList',
  'vendorTasks',
  'translationMemory',
  'volumeAnalysis',
  'newTranslationMemory',
  'translationTool',
  'projectsReportExport',
  'tags',
  'institutionManagement',
  'technicalSettings',
  'logs',
]

const syncManual = async () => {
  // Split the manual markup into sections
  const sections = splitMarkupIntoSections(manualMarkup)
  const jsonContent = {}

  // Process each section
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i]
    // Convert section content and tooltip content to HTML
    const htmlContent = await convertMarkdownToHtml(section.content)
    const tooltipHtmlContent = await convertMarkdownToHtml(
      section.tooltipContent
    )

    // Add the processed section to the final JSON structure
    // Take the keys based on the order
    jsonContent[orderOfKeys[i]] = {
      title: section.title,
      content: htmlContent.data,
      tooltipContent: tooltipHtmlContent.data,
    }
  }

  // Store the final JSON content into a file
  await storeManualHtmlInFile(jsonContent)
}

const syncTerms = async () => {
  const termsHtml = await convertMarkdownToHtml(termsMarkup)
  storeTermsHtmlInFile(termsHtml)
}

const syncStatic = async () => {
  await syncTerms()
  await syncManual()
}

syncStatic()
