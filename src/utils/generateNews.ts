import axios from 'axios'
import keywordExtractor from './GAI models/keywordExtractor'
import fetchArticleContent from './newsScrapper'
import NewsArticleGenerator from './GAI models/newsArticleGenerator'
import createGhostPost from './createGhostPost'
import { createNewsID, findNewsID } from '../services'
import cron from 'node-cron'
import { config } from '../config/config'
import countWords from './countWords'

// const period = 7
const NYTIMES_API_KEY = config.nytimes_api_key
const NYTIMES_BASE_URL = config.nytimes_base_url

// List of sections you want to fetch news for
let currentSection = 0
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

function extractLastPart(string: string) {
    const parts = string.split('/')
    const lastPart = parts[parts.length - 1]
    return lastPart
}

// Function to fetch news for a specific section
async function fetchNews(url: string): Promise<void> {
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

                const articlesJsonString = JSON.stringify(similarArticles)
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
                    const tag = sections[currentSection]
                    createGhostPost(title, content, tag)
                }

                await createNewsID(nYTimesArticleID)
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
    fetchNews(url)
}

// Schedule the task to run every day at a specific time (adjust the cron expression as needed)
cron.schedule('0 */1 * * *', () => {
    console.log('Fetching news for today...')
    generateNews()
})

// Initial fetch when the application starts
console.log('Fetching initial news...')
function generateNews() {
    fetchSectionsNews(sections[currentSection])
    // Increment the variable and loop it from 0 to 6
    currentSection = (currentSection = 0 + 1) % 8
}

export default generateNews
