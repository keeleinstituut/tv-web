/* eslint-disable @typescript-eslint/no-var-requires */
const { Octokit } = require('octokit')
const fs = require('fs')
const termsMarkup = require('./markups/terms.js')

const octokit = new Octokit({})

const convertMarkdownToHtml = async () => {
  return await octokit.request('POST /markdown', {
    text: termsMarkup,
    headers: {
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })
}

const storeHtmlInFile = async (content) => {
  fs.writeFileSync(
    `${__dirname}/../src/static/terms.json`,
    JSON.stringify({ content: content?.data }, null, 2)
  )
}

const syncTerms = async () => {
  const termsMarkup = await convertMarkdownToHtml()
  storeHtmlInFile(termsMarkup)
}

syncTerms()
