const z = require("zod")

const movieSchema = z.object({
    title: z.string({
        invalid_type_error: "Movie title must be a string",
        required_error: "Movie title is required"
    }),
    year: z.number().int().min(1900).max(2030),
    director: z.string() ,
    duration: z.number().min(1).max(999).optional(),
    rate: z.number().min(0).max(10).optional(),
    poster: z.string().url().optional(),
    genre: z.array(
        z.enum(["Action", "Drama", "Anime", "Comedy", "Horror", "Adventure"])
    ).optional()
})

function validateMovie (input) {
return movieSchema.safeParse(input)
}

function validatePartialMovie (input) {
    return movieSchema.partial().safeParse(input)
}

module.exports = { validateMovie, validatePartialMovie }