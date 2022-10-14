const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../modulos/Usuario')
const Usuario = mongoose.model('usuarios')
const bcrypt = require('bcryptjs')
const passaport = require('passport')

//Registro

router.get('/registro', (req, res) => {
    res.render('usuarios/registro')
})

//Caso nao tenha action, ele fara ação para propria pagina 
router.post('/registro', (req, res) => {
    var erros = []
    
    if(!req.body.nome && req.body.nome == undefined || req.body.nome == null || req.body.nome.length < 4){
        erros.push({texto: "Nome inválido"}) 
    }

    if(!req.body.email && req.body.email == undefined || req.body.email == null || req.body.email.length < 4){
        erros.push({texto: "E-mail inválido"}) 
    }

    if(!req.body.senha && req.body.senha == undefined || req.body.senha == null || req.body.senha.length < 8){
        erros.push({texto: "Senha inválida"}) 
    }

    if(!req.body.senha2 && req.body.senha2 == undefined || req.body.senha2 == null || req.body.senha2.length < 8){
        erros.push({texto: "Senha inválida"}) 
    }

    if(req.body.senha !== req.body.senha2){
        erros.push({texto: "Senhas não são iguais"}) 
    }

    if(erros.length > 0){
        res.render('usuarios/registro', {erros: erros})
    }else{
        //Verificar se o usuario ja existe
        Usuario.findOne({email: req.body.email}).then((usuario) => {
            if(usuario){
                req.flash('error_msg', 'Já existe uma conta com esse E-mail.')
                res.redirect('/usuarios/registro')
            }else{
                var salt = bcrypt.genSaltSync(10)
                var hash = bcrypt.hashSync(req.body.senha, salt)
               
                const novoUsuario = {
                    nome : req.body.nome,
                    email : req.body.email,
                    senha : hash
                }
               
                new Usuario(novoUsuario).save().then(() => {
                    req.flash('success_msg', 'Usuario cadastrado com sucesso!')
                    res.redirect('/')
                }).catch((err) => {
                    req.flash('error_msg', 'Erro ao cadastrar o usuario')
                    res.redirect("/usuarios/registro")
                })
            }
        })
    }
})

//Login

router.get('/login', (req, res) => {
    res.render('usuarios/login')
})

router.post('/login', (req, res, next) => {
    passaport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/usuarios/login',
        failureFlash: true
    })(req, res, next)
})

//Sair

router.get('/logout', (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err) }
        req.flash('success_msg', 'Deslogado com sucesso.')
        res.redirect('/')
      })
})

module.exports = router