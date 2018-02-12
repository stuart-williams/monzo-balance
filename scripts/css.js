const fs = require('fs')
const { resolve } = require('path')
const { promisify } = require('util')
const CleanCSS = require('clean-css')

const writeFile = promisify(fs.writeFile)

async function run () {
  try {
    const file = resolve(__dirname, '../views/main.min.css')
    const output = new CleanCSS().minify([
      resolve(__dirname, '../node_modules/normalize.css/normalize.css'),
      resolve(__dirname, '../src/main.css')
    ])
    await writeFile(file, output.styles)
    console.log(`Wrote to file ${file}`)
  } catch (error) {
    console.log(error)
  }
}

run()
