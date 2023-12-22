/* eslint-disable @typescript-eslint/no-var-requires */
const { Octokit } = require('octokit')
const fs = require('fs')
const manualsMarkup = require('./markups/manuals.js')

const octokit = new Octokit({})

const convertMarkdownToHtml = () => {
  const splitManuals = manualsMarkup.split('[BREAK]')
  console.warn('splitManuals', splitManuals)
  return new Promise(async (resolve, reject) => {
    const results = await Promise.allSettled(
      splitManuals.map(async (manualPiece) => {
        const result = await octokit.request('POST /markdown', {
          text: manualPiece,
          headers: {
            'X-GitHub-Api-Version': '2022-11-28',
          },
        })
        return result
      })
    )

    resolve(results)
  })
}

const storeHtmlInFile = async (content) => {
  fs.writeFileSync(
    `${__dirname}/../src/static/manuals.json`,
    JSON.stringify({ content: content?.data }, null, 2)
  )
}

const syncManuals = async () => {
  const manualsHtml = await convertMarkdownToHtml()
  console.warn('manualsMarkup', manualsHtml)
  // storeHtmlInFile(termsMarkup)
}

syncManuals()
