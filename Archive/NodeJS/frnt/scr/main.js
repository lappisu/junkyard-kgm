const axios = require('axios')
const xml2js = require('xml2js')
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, 'MapExtracted')
const MAPS = path.join(ROOT, 'maps')
const SOURCES = path.join(ROOT, 'sources')
const DOTS = path.join(ROOT, '.paths')

fs.mkdirSync(MAPS, { recursive: true })
fs.mkdirSync(SOURCES, { recursive: true })
fs.mkdirSync(DOTS, { recursive: true })

const safePath = p =>
    p.replace(/^webpack:\/\//, '')
     .replace(/^\.\//, '')
     .replace(/\/\.\.\//g, '/__dotdot__/')
     .replace(/\.\.\//g, '__dotdot__/')
     .replace(/[<>:"|?*]/g, '_')

const fetchLatestMap = async () => {
    const xml = await axios.get('https://static.kogstatic.com/')
    const parsed = await xml2js.parseStringPromise(xml.data)
    const files = parsed.ListBucketResult.Contents
        .filter(e => e.Key[0].endsWith('app.js.map'))
        .map(e => ({
            key: e.Key[0],
            time: new Date(e.LastModified[0])
        }))
        .sort((a, b) => b.time - a.time)

    if (!files.length) throw new Error('No app.js.map found')
    return files[0].key
}

const run = async () => {
    const key = await fetchLatestMap()
    const url = `https://static.kogstatic.com/${key}`
    const mapFile = path.join(MAPS, 'app.js.map')

    const mapData = await axios.get(url)
    fs.writeFileSync(mapFile, JSON.stringify(mapData.data))

    const { sources, sourcesContent } = mapData.data

    fs.writeFileSync(
        path.join(ROOT, 'sources.json'),
        JSON.stringify({ sources }, null, 4)
    )

    sources.forEach((src, i) => {
        if (!sourcesContent[i]) return

        const clean = safePath(src)
        const base = clean.includes('__dotdot__') ? DOTS : SOURCES
        const out = path.join(base, clean)

        fs.mkdirSync(path.dirname(out), { recursive: true })
        fs.writeFileSync(out, sourcesContent[i])
    })
}

run().catch(e => {
    console.error(e.message)
    process.exit(1)
})
