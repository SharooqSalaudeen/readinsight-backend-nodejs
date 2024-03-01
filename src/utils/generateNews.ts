import fs from 'fs'
import axios from 'axios'
import keywordExtractor from './GAImodels/keywordExtractor'
import fetchArticleContent from './newsScrapper'
import NewsArticleGenerator from './GAImodels/newsArticleGenerator'
import createGhostPost from './createGhostPost'
import { createNewsID, findNewsID } from '../services'
import cron from 'node-cron'
import { config } from '../config/config'
import countWords from './countWords'

// const period = 7
const NYTIMES_API_KEY = config.nytimes_api_key
const NYTIMES_BASE_URL = config.nytimes_base_url

// List of sections you want to fetch news for
const sections: string[] = [
    'politics',
    'business',
    'technology',
    'science',
    'health',
    'sports',
    'movies',
    'automobiles',
]

if (!fs.existsSync('sectionCounter.txt')) {
    fs.writeFileSync('sectionCounter.txt', '0')
}
function incrementSectionCounter() {
    // Read current counter value from file
    const currentValue = parseInt(fs.readFileSync('sectionCounter.txt', 'utf8'))
    // Increment the counter (looping from 0 to 7)
    const newValue = (currentValue + 1) % 8
    // Write the new counter value back to file
    fs.writeFileSync('sectionCounter.txt', newValue.toString())
    return newValue
}

function extractLastPart(string: string) {
    const parts = string.split('/')
    const lastPart = parts[parts.length - 1]
    return lastPart
}

// Function to fetch news for a specific section
async function fetchNews({
    url,
    section,
}: {
    url: string
    section: string
}): Promise<void> {
    try {
        const response = await axios.get(`${url}`)
        // const articles = response.data.results
        const articles = await response.data.results
        console.log('articles', articles[0])

        for (const article of articles) {
            const nYTimesArticleID = extractLastPart(article.uri)

            console.log('article id', nYTimesArticleID)
            const existingArticle = await findNewsID(nYTimesArticleID)

            if (!existingArticle) {
                console.log(
                    `Processing article: ${article.title} - ${article.url}`
                )

                const urlSlug = extractLastPart(article.url)
                const query = keywordExtractor(`${article.title} ${urlSlug}`)
                console.log('query:', query)

                const similarArticles = await fetchArticleContent(await query)

                if (similarArticles.length === 0) continue

                const articlesJsonString = JSON.stringify(
                    similarArticles[0].content
                )
                const generatedNewsArticle = await NewsArticleGenerator(
                    articlesJsonString
                )

                if (generatedNewsArticle) {
                    const content = generatedNewsArticle.content
                    // If there is not enough content, avoid posting the article
                    if (countWords(content) < 100) {
                        console.log('Post skipped due to less content')
                        continue
                    }
                    const title = generatedNewsArticle.title
                    const tag = section
                    const postURL = createGhostPost(title, content, tag)
                    await createNewsID({
                        newsId: nYTimesArticleID,
                        category: section,
                        originalNewsURL: similarArticles[0].url,
                        createdNewsURL: (await postURL) ?? '',
                    })
                }

                break
            }
        }
    } catch (error) {
        console.error(`Error fetching news:`, error)
    }
}

// Function to fetch news for all sections
function fetchSectionsNews(section: string): void {
    const url = `${NYTIMES_BASE_URL}${section}.json?api-key=${NYTIMES_API_KEY}`
    fetchNews({ url, section })
}

// Schedule the task to run every day at a specific time (adjust the cron expression as needed)
cron.schedule('0 */1 * * *', () => {
    console.log('Fetching news for today...')
    generateNews()
})

// Initial fetch when the application starts
console.log('Fetching initial news...')
function generateNews() {
    fetchSectionsNews(sections[incrementSectionCounter()])
    // Increment the variable and loop it from 0 to 6
}

export default generateNews
