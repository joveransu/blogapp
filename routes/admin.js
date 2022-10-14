const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../modulos/Categoria')
const Categoria = mongoose.model('categorias')
require('../modulos/Postagem')
const Postagem = mongoose.model('postagens')
//importando a função de ver se é admin
const {eAdmin} = require('../helpers/eAdmin')

//adicionando a função da verificação se é admin antes de funcionar
router.get('/', eAdmin, (req, res) => {
    res.render('admin/index')
})

//Postagens

router.get('/postagens', eAdmin, (req, res) => {
    //categoria aqui é o nome do campo que ta registrado na postagens
    Postagem.find().lean().populate('categoria').sort({data:'desc'}).then((postagens) => {
        res.render('admin/postagens', {postagens: postagens})
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao listar as postagens.\n' + err)
        res.redirect('/admin')
    })   
})


router.get('/postagens/add', eAdmin, (req, res) => {
    Categoria.find().then((categorias) => {
        res.render('admin/addpostagem', {categorias: categorias})
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao carregar as categorias.')
        res.redirect('/admin')
    })
})

router.post('/postagens/nova', eAdmin, (req, res) => {
    //Validando dados
    var erros = []

    if(!req.body.titulo && req.body.titulo == undefined || req.body.titulo == null || req.body.titulo.length <= 2){
        erros.push({texto: "Titulo inválido"}) 
    }

    if(!req.body.slug && req.body.slug == undefined || req.body.slug == null || req.body.slug.length <= 2){
        erros.push({texto: "Slug inválido"}) 
    }

    if(!req.body.descricao && req.body.descricao == undefined || req.body.descricao == null || req.body.descricao.length <= 2){
        erros.push({texto: "Descrição inválida"}) 
    }

    if(!req.body.conteudo && req.body.conteudo == undefined || req.body.conteudo == null || req.body.conteudo.length <= 2){
        erros.push({texto: "Conteúdo inválido"}) 
    }

    if(req.body.categoria == 0){
        erros.push({texto: 'Categoria inválida, registre uma categoria.'})
    }

    if(erros.length > 0){
        res.render('admin/addpostagem', {erros: erros})
    }else{
        const novaPostagem = {
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
        }
        new Postagem(novaPostagem).save().then(() => {
            req.flash('success_msg', 'Postagem criada com sucesso.')
            res.redirect('/admin/postagens')
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro durante o salvamento da postagem')
            res.redirect('/admin/postagens')
        })
    }
})

router.get('/postagens/edit/:id', eAdmin, (req, res) => {
    //Fazendo duas pesquisas no mongo para enviar dados para postagens

    Postagem.findOne({_id: req.params.id}).then((postagem) => {
        Categoria.find().then((categorias) => {
            res.render('admin/editpostagens', {categorias: categorias, postagem: postagem})
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao listar as categorias')
            res.redirect('/admin/postagens')
        })
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao carregar o formulario de editção.')
        res.redirect('/admin/postagens')
    })

})

router.post('/postagens/edit', eAdmin, (req, res) => {
    //Validando dados
    var erros = []

    if(!req.body.titulo && req.body.titulo == undefined || req.body.titulo == null || req.body.titulo.length <= 2){
        erros.push({texto: "Titulo inválido"}) 
    }

    if(!req.body.slug && req.body.slug == undefined || req.body.slug == null || req.body.slug.length <= 2){
        erros.push({texto: "Slug inválido"}) 
    }

    if(!req.body.descricao && req.body.descricao == undefined || req.body.descricao == null || req.body.descricao.length <= 2){
        erros.push({texto: "Descrição inválida"}) 
    }

    if(!req.body.conteudo && req.body.conteudo == undefined || req.body.conteudo == null || req.body.conteudo.length <= 2){
        erros.push({texto: "Conteúdo inválido"}) 
    }

    if(req.body.categoria == 0){
        erros.push({texto: 'Categoria inválida, registre uma categoria.'})
    }

    if(erros.length > 0){
        res.render('admin/postagens', {erros: erros})
    }else{
        Postagem.findOne({_id: req.body.id}).then((postagem)=>{
            postagem.titulo = req.body.titulo
            postagem.slug = req.body.slug
            postagem.conteudo = req.body.conteudo
            postagem.descricao = req.body.descricao
            postagem.categoria = req.body.categoria

            postagem.save().then(() => {
                req.flash('success_msg', 'Postagem editada com sucesso.')
                res.redirect('/admin/postagens')
            }).catch((err) => {
                req.flash('error_msg', 'Houve um erro ao salvar a edição.')
                res.redirect('/admin/postagens')
            })
        }).catch((err)=>{
            req.flash('error_msg', 'Postagem não existe/encontrada, tente novamente')
            res.redirect('/admin/postagens')
        })
    }
})

//Não é tão segura pois é rota get, se alguem tiver acesso aos ids das postagens, podem deletar usando URL
router.get('/postagens/deletar/:id', eAdmin, (req, res) => {
    Postagem.deleteOne({_id: req.params.id}).then(() => {
        req.flash('success_msg', 'Postagem foi deletada com sucesso.')
        res.redirect('/admin/postagens')
    }).catch((err) => {
        req.flash('error_msg', 'Postagem não encontrada/existe.')
        res.redirect('/admin/postagens')
    })
})

//Categorias

router.get('/categorias', eAdmin, (req, res) => {
    //Ordenar por data -> Categoria.find().sort({date: 'desc'}).then((categorias) => {
    Categoria.find().then((categorias) => {
        res.render('admin/categorias', {categorias: categorias})
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro na exibição das categorias.')
        res.redirect('/admin')
    })    
})

router.get('/categorias/add', eAdmin, (req, res) => {
    res.render('admin/addcategorias')
})

router.get('/categorias/edit/:id', eAdmin, (req, res) => {
    Categoria.findOne({_id: req.params.id}).then((categoria) => {
        res.render('admin/editcategoria', {categoria: categoria})
    }).catch((err) => {
        req.flash('error_msg', 'Esta categoria não existe')
        res.redirect('/admin/categorias')
    })
})

router.post('/categorias/edit', eAdmin, (req, res) => {
    //Validando dados
    var erros = []

    if(!req.body.nome && req.body.nome == undefined || req.body.nome == null || req.body.nome.length <= 2){
        erros.push({texto: "Nome inválido"}) 
    }

    if(!req.body.slug && req.body.slug == undefined || req.body.slug == null || req.body.slug.length <= 2){
        erros.push({texto: "Slug inválido"}) 
    }

    if(erros.length > 0){
        req.flash('error_msg', 'Houve um erro ao editar a categoria')
        res.redirect('/admin/categorias')
    }else{
        Categoria.findOne({_id: req.body.id}).then((categoria) => {
            //Mudar o nome da categoria
            categoria.nome = req.body.nome
            //Mudar o slug
            categoria.slug = req.body.slug
            categoria.save().then(() => {
                req.flash('success_msg', 'Categoria editada com sucesso.')
                res.redirect('/admin/categorias')
            }).catch((err) => {
                req.flash('error_msg', 'Houve um erro ao salvar a categoria.')
                res.redirect('/admin/categorias')
            })

        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao editar a categoria')
            res.redirect('/admin/categorias')
        })
    }
})

router.post('/categorias/deletar', eAdmin, (req, res) =>{
    Categoria.deleteOne({_id: req.body.id}).then(() =>{
        req.flash('success_msg', 'Categoria deletada com sucesso!')
        res.redirect('/admin/categorias')
    }).catch((err) =>{
        req.flash('error_msg', 'Houve um erro ao deletar a categoria.')
        res.redirect('/admin/categorias')
    })
})

router.post('/categorias/nova', eAdmin, (req, res) => {

    //Validando dados
    var erros = []

    if(!req.body.nome && req.body.nome == undefined || req.body.nome == null || req.body.nome.length <= 2){
        erros.push({texto: "Nome inválido"}) 
    }

    if(!req.body.slug && req.body.slug == undefined || req.body.slug == null || req.body.slug.length <= 2){
        erros.push({texto: "Slug inválido"}) 
    }

    if(erros.length > 0){
        res.render('admin/addcategorias', {erros: erros})
    }else{
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
    
        new Categoria(novaCategoria).save().then(() => {
            console.log(`Categoria "${req.body.nome}" foi criada com sucesso!`)
            //Passando valores para variaveis globais
            req.flash('success_msg', 'Categoria criada com sucesso!')
            res.redirect('/admin/categorias')//Será redirecionado para essa rota se cadastro der certo.
        }).catch((err) => {
            //Passando valores para variaveis globais
            req.flash('error_msg', 'Hove um erro ao salvar a Categoria, tente novamente!')
            console.log('Houve um erro na criação da categoria: '+err)
            res.redirect('/admin')
        })
    }
})


module.exports = router