const mongoose = require('mongoose')
const Schema = mongoose.Schema

//Criando a tabela
const Categoria = new Schema({
    nome: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        //Se não passar a data no cadastro, vai pegar o horario atual
        default: Date.now()
    }
})

mongoose.model('categorias', Categoria)