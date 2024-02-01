import axios from 'axios'
import { JSDOM } from 'jsdom'
import { Readability } from '@mozilla/readability'
import * as cheerio from 'cheerio'
import { config } from '../config/config'

// const
// const ArticlesCount = 3
const ArticlesCount = 1
const wordCount = 3000

const NEWSAPI_KEY = config.newsapi_key
const NEWSAPI_BASE_URL = config.newsapi_base_url
const options = `sortBy=publishedAt&language=en&pageSize=${ArticlesCount}&excludeDomains=nytimes.com`

interface ArticleContent {
    title: string
    content: string
}

interface NewsArticle {
    source: {
        id: string | null
        name: string
    }
    author: string | null
    title: string
    description: string | null
    url: string
    urlToImage: string | null
    publishedAt: string
    content: string | null
}

function cleanUpContent(content: string): string {
    const $ = cheerio.load(content, { xmlMode: true })

    // Remove unnecessary elements or sections based on your specific requirements
    $('script').remove()
    $('style').remove()
    // Add more removals or modifications as needed

    // Remove newline characters and unnecessary whitespace from all elements
    $('body')
        .find('*')
        .each((index, element) => {
            const textContent = $(element).text()
            const cleanedText = textContent.replace(/\s+/g, ' ').trim() // Remove unnecessary whitespace
            $(element).text(cleanedText)
        })

    // Get the cleaned-up content
    let cleanedContent = $.root().html() || ''

    // Remove specific example text discrepancy
    cleanedContent = cleanedContent.replace(/\s*"\s*/g, '"') // Remove spaces around double quotes

    // Remove all "\n" symbols
    cleanedContent = cleanedContent.replace(/\n/g, '')

    // Remove consecutive regular space characters and reduce them to a single space
    cleanedContent = cleanedContent.replace(/ +/g, ' ')

    // Remove trailing white spaces at the end
    cleanedContent = cleanedContent.replace(/\s+$/g, '')

    return cleanedContent || ''
}

function truncateString(inputString: string, limit: number) {
    // Split the input string into an array of words
    const words = inputString.split(' ')

    // Check if the number of words is greater than the limit
    if (words.length > limit) {
        // If yes, slice the array up to the specified limit
        const truncatedWords = words.slice(0, limit)

        // Join the truncated array back into a string and append '...' to indicate truncation
        return truncatedWords.join(' ') + '...'
    } else {
        // If the number of words is within the limit, return the original string
        return inputString
    }
}

async function fetchArticleContent(query: string): Promise<ArticleContent[]> {
    const today = new Date()
    const pastDate = new Date(today)
    pastDate.setDate(today.getDate() - 5)

    const from = pastDate.toISOString().split('T')[0]
    const to = today.toISOString().split('T')[0]
    try {
        // Make the request with axios' get() function
        const searchResults = await axios.get(
            `${NEWSAPI_BASE_URL}q=${query}&${options}&${from}&to=${to}&apiKey=${NEWSAPI_KEY}`
        )

        // Take the first search result
        const results = searchResults.data.articles
        console.log('searchResults', results)

        const articleContents = await Promise.all(
            results.map(async (result: NewsArticle) => {
                try {
                    const articleHtml = await axios.get(result.url)
                    const dom = new JSDOM(articleHtml.data, { url: result.url })
                    const article = new Readability(dom.window.document).parse()

                    if (!article?.textContent || article?.textContent == '') {
                        return
                    }

                    const cleanedContent: string = cleanUpContent(
                        article?.textContent || ''
                    )

                    const truncatedContent = truncateString(
                        cleanedContent,
                        wordCount
                    )

                    return {
                        // title: result.title,
                        content: truncatedContent || '',
                    }
                } catch (error) {
                    console.error(
                        `Error fetching or parsing content for ${result.title}: ${error}`
                    )
                    return { title: result.title, content: '' } // Return an empty string for failed articles
                }
            })
        )
        console.log('content:', await articleContents)
        return articleContents
    } catch (error) {
        throw new Error(`Error fetching or parsing article content: ${error}`)
    }
}

// Example usage:

// fetchArticleContent(query)
//     .then((contents) => {
//         console.log('length', contents.length)
//         console.log(contents)
//     })
//     .catch((error) => {
//         console.error(error.message)
//     })

export default fetchArticleContent
