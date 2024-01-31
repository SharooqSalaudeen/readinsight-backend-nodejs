export const config = {
    node_env: process.env.NODE_ENV || 'development',
    mongodb_uri: process.env.MONGO_URL || 'mongodb://localhost/',
    cohere_api_key: process.env.COHERE_API_KEY || '',
    cohere_api_prompt: process.env.COHERE_API_PROMPT || '',
    gpt_model: process.env.GPT_MODEL || '',
    nytimes_base_url: process.env.NYTIMES_BASE_URL || '',
    nytimes_api_key: process.env.NYTIMES_API_KEY || '',
    newsapi_base_url: process.env.NEWSAPI_BASE_URL || '',
    newsapi_key: process.env.NEWSAPI_KEY || '',
    ghost_key: process.env.GHOST_KEY || '',
    ghost_port: process.env.GHOST_PORT || '',
}
