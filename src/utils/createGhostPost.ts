// Create a token without the client
import jwt from 'jsonwebtoken'
import axios from 'axios'
import { marked } from 'marked'
import { config } from '../config/config'

// Admin API key goes here
const ghostUrl = config.ghost_url
const key = config.ghost_key

const createGhostPost = async (
    title: string,
    content: string,
    tag: string = ''
): Promise<string | undefined> => {
    // Split the key into ID and SECRET
    const [id, secret] = key.split(':')

    // Create the token (including decoding secret)
    const token = jwt.sign({}, Buffer.from(secret, 'hex'), {
        keyid: id,
        algorithm: 'HS256',
        expiresIn: '5m',
        audience: `/admin/`,
    })
    const htmlContent = marked(content)

    console.log('html content', htmlContent)

    // Make an authenticated request to create a post
    const url = `${ghostUrl}/ghost/api/admin/posts/?source=html`
    const headers = { Authorization: `Ghost ${token}` }
    const payload = {
        posts: [
            {
                title: title,
                html: htmlContent,
                tags: [tag],
                status: 'published',
            },
        ],
    }

    try {
        const response = await axios.post(url, payload, { headers })
        console.log('ghost post status:', response?.statusText)
        return response?.data?.posts[0]?.url
    } catch (error) {
        console.error('ghost post error:', error)
    }
}

// Example usage
// const exampleTitle = 'Hello World 3'
// const exampleContent = 'This is the content of the post.'
// createGhostPost(exampleTitle, exampleContent)

export default createGhostPost
