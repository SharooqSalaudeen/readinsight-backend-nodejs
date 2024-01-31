import { CohereClient } from 'cohere-ai'
import { config } from '../../config/config'

async function NewsArticleGenerator(articles: string) {
    const cohere = new CohereClient({
        token: config.cohere_api_key, // This is your trial API key
    })

    const completion = await cohere.generate({
        model: 'command',
        prompt: `${config.cohere_api_prompt}${articles}`,
        maxTokens: 4096,
        temperature: 0.9,
        k: 0,
        stopSequences: [],
        returnLikelihoods: 'NONE',
        truncate: 'END',
    })
    const response = completion.generations[0].text
    console.log(response)

    if (response) {
        // Using regex to split the text into title and content based on the first line
        const [title, ...contentLines] = response.split(/\n/)

        // The content is the rest of the lines
        const content: string = contentLines.join('\n')

        // Remove hashtags
        const cleanedTitle = title.replace(/#/g, '')

        return {
            title: cleanedTitle,
            content,
        }
    }

    return null
}

export default NewsArticleGenerator
