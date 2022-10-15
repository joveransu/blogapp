//rodando em ambiente e3xterno
if(process.env.NODE_ENV == 'production'){
    module.exports = {mongoURI: "mongodb+srv://ansu:2377@cluster0.31deqra.mongodb.net/?retryWrites=true&w=majority"}
//                               mongodb+srv://ansu:2377@cluster0.16vdayl.mongodb.net/?retryWrites=true&w=majority"
}else{
    module.exports = {mongoURI: 'mongodb://localhost/blogapp'}
}