const express = require('express')
const request = require('request')
const bodyParser = require('body-parser')
var mongoDB = require("./controller_MongoDB")
const { json } = require('body-parser')
const app = express()
const port = 3000

// Funções do express para lifar com JSON no post
app.use(express.json({limit:'1mb'}))

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

// get de faculdades com filtro para pais e paginação |country=XXX & page=XXX|
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

// get ded faculdade por id
app.get('/universities/:_id', async(req, res) => {
    var resultado = await mongoDB.get_faculdade_id(req.params._id);
    res.send(resultado);
})

// post para adicionar uma nova faculdade via JSON
app.post('/universities', async(req, res) => {
    const data = req.body;

    if(data == undefined || data == null){
        res.status(400).send("Favor incluir os dados!");
        return;
    }

    // confere se os dados necessarios estão presentes
    if(data.alpha_two_code==undefined || data.web_pages==undefined || data.name==undefined || data.country==undefined || data.domains==undefined || data.state_province==undefined){
        res.status(400).send("Favor verificar os campos sendo enviados!");
        return;
    }
    
    // verifica se os dados são arrays, caso não sejam, são corrigidos para o padrão do BD
    if( typeof(data.web_pages) == "string" ){
        data.web_pages = [data.web_pages]
    }
    if( typeof(data.domains) == "string" ){
        data.domains = [data.domains]
    }
    
    // confere se a faculdade ja esta cadastrada
    if( await mongoDB.check_if_uni_exists(data)){
        res.status(400).send("Faculdade ja cadastrada!");
        return;
    }
    
    await mongoDB.add_faculdade(data);

    res.status(200).send("Faculdade inserida com sucesso!");
})


app.listen(port, () => {
  console.log(`Server de teste para Bis2Bis rodando na porta ${port}`)
})