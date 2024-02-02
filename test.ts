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

// Example usage:
const apiResponse =
    "Title: US temporarily pauses 'additional' funding for key UN agency in Gaza Strip over allegations of Hamas links\n\nContent: The United States has temporarily paused additional funding for the United Nations Relief and Works Agency (UNRWA) in the Gaza Strip over allegations that some of its employees were involved in the Oct. 7 Hamas terrorist attack in Israel. The United States has alleged that twelve UNRWA employees were involved in the"

const { title, content } = extractTitleAndContent(apiResponse)
console.log(title)
console.log(content)
