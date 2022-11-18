const {Client} = require('@notionhq/client')

async function getNotionBiblio() {
    const notion = new Client({auth: process.env.NOTION_KEY})
    const database_id = process.env.NOTION_DATABASE_ID

    const {results: references} = await notion.databases.query({database_id
        sorts: [
            {
                timestamp: 'created_time',
                direction: 'descending',
            },
        ]
    })
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
        return {
            title,
            author,
            owner
            // published
        }
    }).sort((a, b) => {
        if (a.author < b.author) {
            return -1;
        }
        if (b.author < a.author) {
            return 1;
        }
        return 0;
    })

}

module.exports = {getNotionBiblio}
