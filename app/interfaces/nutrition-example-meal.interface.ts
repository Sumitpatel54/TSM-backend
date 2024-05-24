import mongoose from "mongoose"

export interface NutritionExampleMealDocument extends mongoose.Document {
    meal: number,
    image: string,
    title: string,
    ingredients: string,
    recipe: string,
    nutrition: string
    categoryName: string
    categoryId: string
    dietType: string
    mealType: string
}
