import { CohereClient } from 'cohere-ai'
import { config } from '../../config/config'

function extractTitleAndContent(apiResponse: string) {
    const titleStartIndex = apiResponse.indexOf('Title:') + 'Title:'.length
    const contentStartIndex =
        apiResponse.indexOf('Content:') + 'Content:'.length

    const title = apiResponse
        .slice(titleStartIndex, apiResponse.indexOf('Content:'))
        .trim()
    const content = apiResponse.slice(contentStartIndex).trim()

    return { title, content }
}

async function NewsArticleGenerator(articles: string) {
    const cohere = new CohereClient({
        token: config.cohere_api_key, // This is your trial API key
    })

    const completion = await cohere.generate({
        model: 'command',
        prompt: `${config.cohere_api_prompt}${articles}`,
        maxTokens: 4095,
        temperature: 0.9,
        k: 0,
        stopSequences: [],
        returnLikelihoods: 'NONE',
        truncate: 'END',
    })
    const response = completion.generations[0].text
    // console.log(response)

    if (response) {
        const { title, content } = extractTitleAndContent(response)
        console.log(title)
        console.log(content)

        return {
            title,
            content,
        }
    }

    return null
}

export default NewsArticleGenerator
