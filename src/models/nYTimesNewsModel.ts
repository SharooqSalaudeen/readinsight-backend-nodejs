import mongoose from 'mongoose'
import { INYTimesNews } from '@/types'
import { config } from '../config/config'

const nYTimesNewsSchema = new mongoose.Schema({
    newsId: { type: String, required: false },
})

const NYTimesNews = mongoose.model<INYTimesNews>(
    config.mongodb_collection,
    nYTimesNewsSchema
)
export default NYTimesNews
