function countWords(text: string) {
    // Remove leading and trailing whitespaces
    const trimmedText = text.trim()

    // Split the text into an array of words
    let words = trimmedText.split(/\s+/)

    // Filter out empty strings (occurs if there are multiple spaces)
    words = words.filter((word) => word.length > 0)

    // Return the count of words
    return words.length
}

export default countWords
