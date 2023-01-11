const express = require('express')
const request = require('request')
var mongoDB = require("./controller_MongoDB")
const app = express()
const port = 3000

// inicialização do mongoDB
mongoDB.start_mongo();


// ROTAS DA API

// rota para atualizar/obter dados das faculdades
app.get('/getFaculdades', (req, res) => {
    mongoDB.remove_all_faculdades(); // limpa a collection de dados antigos
    const paises = ["argentina","brazil","chile","colombia","paraguai","peru","suriname","uruguay"]
    const base_url = "http://universities.hipolabs.com/search?country="

    paises.forEach(pais => { // para cada pais da lista
        var lista_faculdades = [];

        request(base_url+pais,{json:true}, (error, res, body) => { // obtenção das faculdades via JSON
            if (error) {
                return  console.log(error);
            };
            if (!error && res.statusCode == 200) { // caso não tenha erro na request

                lista_faculdades = body; 
                lista_faculdades.forEach(faculdade =>{ // adiciona cada uma das faculdades no Mongo
                    var result = mongoDB.add_faculdade(faculdade);
                    if(result == false){console.log("\nERRO AO INSERIR FACULDADE DO " + pais)}
                });
            };
        });
    });
    res.send('Dados das faculdades obtidos!');
})

app.get('/universities', async(req, res) => {
    const page_limit = 20;
    const filtro = req.query;

    if (filtro.page == null){ // caso não possua o numero da pagina vai para incial
        filtro.page = 0;
    }
    const pagina_atual = filtro.page;
    delete filtro.page;

    if (filtro.country != null){
        var resultado = await mongoDB.get_faculdades(filtro, pagina_atual);
        res.send(resultado);
    }else{
        var resultado = await mongoDB.get_faculdades({}, pagina_atual);
        res.send(resultado);
    }
    
})

app.get('/universities/:_id', async(req, res) => {
    var resultado = await mongoDB.get_faculdade_id(req.params._id);
    res.send(resultado);
})

app.listen(port, () => {
  console.log(`Server de teste para Bis2Bis rodando na porta ${port}`)
})