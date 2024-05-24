import mongoose from "mongoose"
import mongoosePaginate from "mongoose-paginate"
import aggregatePaginate from "mongoose-aggregate-paginate-v2"

import { NutritionExampleMealDocument } from "../interfaces/nutrition-example-meal.interface"

const nutritionExampleMealsSchema = new mongoose.Schema(
    {
        meal: {
            type: Number,
            required: true
        },
        image: String,
        title: String,
        ingredients: String,
        recipe: String,
        nutrition: String,
        categoryName: String,
        categoryId: String,
        dietType: String,
        mealType: String
    }
)

nutritionExampleMealsSchema.plugin(mongoosePaginate)

nutritionExampleMealsSchema.plugin(aggregatePaginate)

nutritionExampleMealsSchema.index({
    title: "text",
    ingredients: "text",
    recipe: "text",
    nutrition: "text",
    dietType: "text"
})

export default mongoose.model<NutritionExampleMealDocument>("NutritionExampleMeal", nutritionExampleMealsSchema)
