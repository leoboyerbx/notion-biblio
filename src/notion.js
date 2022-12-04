const {Client} = require('@notionhq/client')
const fs = require('node:fs/promises')

async function setCache(value) {
    const str = JSON.stringify(value)
    await fs.writeFile('tmp/cached.json', str)
}
async function getCached() {
    const str = await fs.readFile('tmp/cached.json')
    return JSON.parse(str.toString())
}

async function getNotionBiblio(refresh = false) {
    let references
    if (refresh) {
        const notion = new Client({auth: process.env.NOTION_KEY})
        const database_id = process.env.NOTION_DATABASE_ID

        const {results} = await notion.databases.query({database_id,
            sorts: [
                {
                    timestamp: 'created_time',
                    direction: 'ascending',
                },
            ]
        })
        await setCache(results)
        references = results
    } else {
        references = await getCached()
    }
    return references.map(r => {
        const {properties} = r
        const title = properties.Title.title[0].plain_text
        const authors = properties.Auteur.rich_text[0]?.plain_text.split('\n')
        let author = ''
        if (authors.length > 1) {
            authors.forEach((a, i) => {
                    author += a
                if (i < authors.length - 2) {
                    author += ', '
                } else if (i === authors.length - 2) {
                    author += ' et '
                }
            })
        } else {
            author = authors[0]
        }
        const owner = properties.Owner.rich_text[0]?.plain_text
        const type  = properties["Type"]["select"].name

        const formatter = new Intl.DateTimeFormat('fr-FR', {
        })
        let pubDate = properties['Publié le']?.date?.start
        if (pubDate) {
            const date = new Date(pubDate)
            pubDate = formatter.format(date)
        }
        const url = properties.URL.url

        let consultDate = properties['Consulté le'].created_time
        if (consultDate) {
            const date = new Date(consultDate)
            consultDate = formatter.format(date)
        }
        return {
            title,
            author,
            owner,
            pubDate,
            type,
            url,
            pubDate,
            consultDate
        }
    })
        .sort((a, b) => {
        return a.author.localeCompare(b.author)
    })
        .reduce((result, ref) => {
            result[ref.type] = result[ref.type] || []
            result[ref.type].push(ref)
            if (['Vidéo'].includes(ref.type)) {
                ref.feminin = true
            }
            return result
        }, {})

}

module.exports = {getNotionBiblio}
