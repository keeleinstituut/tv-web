import { Octokit } from 'octokit'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import termsMarkup from './markups/terms.js'
import manualMarkup from './markups/manual.js'
import translationAgencyManualMarkup from './markups/translationAgencyManual.js'

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

// Function to split the markup into sections based on [START], [BREAK], and [END] markers.
// A section may contain any number of [BREAK] markers (including zero): tooltipContent is
// everything before the first one, content is the whole section with the markers removed.
const splitMarkupIntoSections = (markup) => {
  const sections = []
  const regex = /\[START\]\s*##\s*(.*?)\n([\s\S]*?)\n\[END\]/g

  let match

  // Process each match found by the regex
  while ((match = regex.exec(markup)) !== null) {
    const title = match[1].trim() // Extract title
    const parts = match[2].split('[BREAK]')
    const tooltipContent = parts[0].trim() // Everything before the first [BREAK]
    const content = parts.join('').trim() // Whole section, markers stripped

    sections.push({
      title: title,
      content: content,
      tooltipContent: tooltipContent,
    })
  }

  return sections
}

// Guarantee every [START]/[BREAK]/[END] marker sits alone between blank lines before sending
// markup to the API for conversion. A few spots in the markup files have a marker immediately
// adjacent to the next line with no blank line between them (e.g. "[END]\n[START]"). Per
// CommonMark's lazy-continuation rule that would merge into the surrounding paragraph instead
// of rendering as its own <p>, breaking the HTML-side split below. Idempotent.
const isolateMarkers = (markup) =>
  markup.replace(/\[(START|BREAK|END)\]/g, '\n\n[$1]\n\n')

// Slice a single HTML blob (a whole markup file, converted in one API call) into per-section
// { title, content, tooltipContent } pieces, using the same markers - now rendered as their
// own literal paragraphs (e.g. <p>[START]</p>) - to find section boundaries.
const splitHtmlIntoSections = (html) => {
  const pieces = html.split('<p>[START]</p>').slice(1) // drop preamble before the first START

  return pieces.map((piece) => {
    const endIdx = piece.indexOf('<p>[END]</p>')
    const body = endIdx === -1 ? piece : piece.slice(0, endIdx)
    const headingMatch = body.match(/^\s*<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>\s*/)
    const withoutHeading = headingMatch
      ? body.slice(headingMatch[0].length)
      : body

    const parts = withoutHeading.split('<p>[BREAK]</p>')

    return {
      title: headingMatch ? headingMatch[1].trim() : null,
      tooltipContent: parts[0].trim(),
      // Re-join with a single newline instead of parts.join('') - the marker's own
      // surrounding blank line would otherwise leave a leftover blank line at the join point.
      content: parts
        .map((part) => part.trim())
        .filter(Boolean)
        .join('\n'),
    }
  })
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
  'requests',
  'editProjectDetails',
  'cancelProject',
  'acceptProject',
  'calendar',
  'vendorsDatabase',
  'institutionPartnersDatabase',
  'priceList',
  'vendorTasks',
  'translationMemory',
  'volumeAnalysis',
  'newTranslationMemory',
  'translationTool',
  'projectsReportExport',
  'languageTools',
  'tags',
  'institutionManagement',
  'technicalSettings',
  'logs',
  'statistics',
]

const translationAgencyOrderOfKeys = [
  'usersManagement',
  'addUsers',
  'roleManagement',
  'projects',
  'subProject',
  'myTasks',
  'editProjectDetails',
  'requests',
  'vendorsDatabase',
  'vendorTasks',
  'translationTool',
  'institutionManagement',
  'logs',
]

// Convert a whole markup file in a single API call, split the result into per-section HTML,
// and write the resulting { [key]: { title, content, tooltipContent } } map to outputPath.
const syncManualFile = async (markup, keys, outputPath) => {
  const sections = splitMarkupIntoSections(markup)

  if (sections.length !== keys.length) {
    throw new Error(
      `syncManualFile: found ${sections.length} sections in the markup but keys has ${keys.length} entries for ${outputPath}. Keep the order-of-keys array in sync with the markup.`
    )
  }

  const { data: html } = await convertMarkdownToHtml(isolateMarkers(markup))
  const htmlSections = splitHtmlIntoSections(html)

  if (htmlSections.length !== sections.length) {
    throw new Error(
      `syncManualFile: markdown parsing found ${sections.length} sections but the converted HTML produced ${htmlSections.length} for ${outputPath}. Marker rendering may have changed - inspect the raw HTML response.`
    )
  }

  const jsonContent = {}

  sections.forEach((section, i) => {
    const htmlSection = htmlSections[i]

    if (htmlSection.title !== section.title) {
      throw new Error(
        `syncManualFile: section ${i} title mismatch for ${outputPath} ("${section.title}" vs HTML "${htmlSection.title}") - sections may be misaligned.`
      )
    }

    if (
      /\[START\]|\[BREAK\]|\[END\]/.test(htmlSection.content) ||
      /\[START\]|\[BREAK\]|\[END\]/.test(htmlSection.tooltipContent)
    ) {
      throw new Error(
        `syncManualFile: a marker leaked into the rendered HTML for key "${keys[i]}" in ${outputPath}.`
      )
    }

    const stripBrNewline = (html) => html.replace(/(<br\s*\/?>)\n+/g, '$1')

    // Take the keys based on the order
    jsonContent[keys[i]] = {
      title: section.title,
      content: stripBrNewline(htmlSection.content),
      tooltipContent: stripBrNewline(htmlSection.tooltipContent),
    }
  })

  // Store the final JSON content into a file
  fs.writeFileSync(outputPath, JSON.stringify(jsonContent, null, 2))
}

const syncManual = () =>
  syncManualFile(
    manualMarkup,
    orderOfKeys,
    `${__dirname}/../src/static/manual.json`
  )

const syncTranslationAgencyManual = () =>
  syncManualFile(
    translationAgencyManualMarkup,
    translationAgencyOrderOfKeys,
    `${__dirname}/../src/static/translationAgencyManual.json`
  )

const syncTerms = async () => {
  const termsHtml = await convertMarkdownToHtml(termsMarkup)
  storeTermsHtmlInFile(termsHtml)
}

const syncStatic = async () => {
  await syncTerms()
  await syncManual()
  await syncTranslationAgencyManual()
}

syncStatic()
