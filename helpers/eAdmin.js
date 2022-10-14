module.exports = {
    eAdmin: function(req, res, next){
        if(req.isAuthenticated() && req.user.eAdmin == 1){
            //eAdmin é do banco de dados usuarios, user é var global
            return next();
        }

        req.flash('error_msg', 'Você precisa ser um admin.')
        res.redirect('/')
    }
}