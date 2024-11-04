const express = require("express")
const movies = require("./movies.json")
const cors = require("cors")
const crypto = require("node:crypto")
const { validateMovie, validatePartialMovie } = require("./schemas/movies")

const ACCEPTED_ORIGINS = [
    'http://localhost:8080',
    'http://localhost:1234',
    'https://movies.com',
    'https://midu.dev',
    'http://192.168.1.2:8080',
    'http://172.16.0.2:8080'
  ]

const app = express()
app.disable("x-powered-by")
app.use(express.json())

// solucion cors con extension 
app.use(cors({
    origin: (origin, callback) => {
  
      if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
        return callback(null, true)
      }
  
      return callback(new Error('Not allowed by CORS'))
    }
  }))

app.get("/movies", (req, res) => {

    res.header('Access-Control-Allow-Origin', '*')

    const { genre } = req.query
    if (genre) {
        const bygenre = movies.filter(
            m => m.genre.some( g => g.toLowerCase() === genre.toLowerCase())
        )
        return res.json(bygenre)
    }
    return res.json(movies)
})

/*app.get("/movies/:id", (req, res) => {
    const { id } = req.params
    const movie = movies.find(m => m.id === id)
    if (movie) return res.json(movie)
    
    res.status(404).json({ message: "Movie not found" })
})*/

app.post("/movies", (req, res)=>{
    
    const result = validateMovie(req.body)

    console.log(result.error)
    console.log(result.data)

    if (result.error) {
        res.status(400).json({ error: JSON.parse(result.error.message)})
    }

    // base de datos ***
    const newmovie = {
        id: crypto.randomUUID(),
        // sirve para pasar argumentos
        ...result.data
    }

    movies.push(newmovie)
    res.status(201).json(newmovie)
})

app.patch("/movies/:id", (req, res) => {

    /// primer filtro, cambios propuestos por el body
    const { id } = req.params
    const result = validatePartialMovie(req.body)

    if (!result.success) {
        return res.status(404).json(
            { error: JSON.parse(result.error.message) })
    }

    // segundo filtro... buscar en el array de peliculas pa pocision
    const movieIndex = movies.findIndex(m => m.id === id)

    if (movieIndex === -1) {
        return res.status(404).json(
            { message: 'Movie not found'})
    }

    // variable que contenga todo lo actualizado
    const updateMovie = {
        ...movies[movieIndex],
        ...result.data
    }

    /// actualizamos la peli, por el indice
    movies[movieIndex] = updateMovie

    /// devolvemos la peli
    return res.status(201).json(updateMovie)
})

app.delete("/movies/:id", (req, res) =>{
    // buscar idenx de la pelicula por id
    const { id } = req.params
    const movieIndex = movies.findIndex(m => m.id === id)

    if (movieIndex === -1) {
        return res.status(404).json({ message: 'Movie not found'})
    }

    // eliminar la pelicula por index
    movies.splice(movieIndex, 1)

    return res.json({ message: "Movie deleted" })
})

app.options('/movies:id', (req, res) => {
    const origin = req.header('origin')
  
    if (ACCEPTED_ORIGINS.includes(origin) || !origin){
        res.header('Access-Control-Allow-Origin', origin),
        res.header('Access-Control-Allow-Method', 
            'GET, POST, PATCH, DELETE')
    }
    res.send(200)
})

const PORT = process.env.PORT ?? 1234

app.listen(PORT, () => {
    console.log(`server listening on port http://localhost:${PORT}`)
})