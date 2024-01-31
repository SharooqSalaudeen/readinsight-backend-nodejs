import mongoose from 'mongoose'
import { INYTimesNews } from '@/types'

const nYTimesNewsSchema = new mongoose.Schema({
    newsId: { type: String, required: false },
})

const NYTimesNews = mongoose.model<INYTimesNews>(
    'nytimesnews',
    nYTimesNewsSchema
)
export default NYTimesNews
