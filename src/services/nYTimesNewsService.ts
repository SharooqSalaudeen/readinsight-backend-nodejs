import { NYTimesNews } from '../models'
import { INYTimesNews } from '@/types'

export const createNewsID = async (id: string): Promise<INYTimesNews> => {
    const nYTimesNews = new NYTimesNews({ newsId: id })
    return nYTimesNews.save()
}

export const getAllNewsID = async (): Promise<INYTimesNews[]> => {
    return NYTimesNews.find({})
}

export const findNewsID = async (id: string): Promise<INYTimesNews | null> => {
    const existingArticle = await NYTimesNews.findOne({ newsId: id })
    console.log('existingArticle', existingArticle)

    return existingArticle
}
