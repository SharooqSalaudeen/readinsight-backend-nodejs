import { config } from '../../config/config'
import OpenAI from 'openai'

const openai = new OpenAI()

const keywordCount = 4

function joinWordsWithAnd(inputString: string): string {
    // Split the string into an array of words
    const wordsArray = inputString?.split(/\s*,\s*/)

    // Split compound words into individual words
    const wordsSplit = wordsArray?.map((word) => word.split(/\s+/)).flat()

    // Join the array elements using the word "AND"
    const stringWithAnd = wordsSplit?.join(' AND ')

    console.log(stringWithAnd)
    return stringWithAnd
}

async function keywordExtractor(newsData: string) {
    const completion = await openai.chat.completions.create({
        messages: [
            {
                role: 'system',
                content: `Pick top ${keywordCount} single worded keywords from the following news data that captures the story.`,
            },
            {
                role: 'user',
                content: newsData,
            },
        ],
        model: config.gpt_model,
    })

    const response = completion.choices[0].message.content

    console.log(response)
    const result = joinWordsWithAnd(response ?? '')
    return result
}

export default keywordExtractor
