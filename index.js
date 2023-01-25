const express = require('express')
const request = require('request')
const bodyParser = require('body-parser')
var mongoDB = require("./controller_MongoDB")
const { json } = require('body-parser')
var schedule = require('node-schedule');
const basicAuth = require('express-basic-auth')


const app = express()
const port = 3000


// Schedules
var schedule_1 = schedule.scheduleJob('30 19 * * *', async function(){  // Atualizar o banco todo dia as 19:30
    const result = await update_BD();
    if(result == "OK"){
        console.log("Faculdades atualizadas automaticamente!");
    }else{
        console.log("Erro ao atualizar faculdades automaticamente!");
    }
});

// Configs do Express
app.use(express.json({limit:'1mb'}))
app.use(basicAuth({ authorizer: basicAuthorizer, authorizeAsync: true, unauthorizedResponse: getUnauthorizedResponse }))

async function basicAuthorizer(username, password, cb) {
    return cb(null,false);
}
function getUnauthorizedResponse(req) {
    return req.auth
        ? ('Credentials ' + req.auth.user + ':' + req.auth.password + ' rejected')
        : 'No credentials provided'
}

// inicialização do mongoDB
mongoDB.start_mongo();


// ROTAS DA API
// rota para atualizar/obter dados das faculdades
app.get('/getFaculdades', async (req, res)  => {
    const result = await update_BD();
    if(result == "OK"){
        res.status(200).send("Faculdades atualizadas!");
    }else{
        res.status(500).send(result);
    }
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

// get de faculdade por id
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
    
    data.manual_insert = true; // indica que a faculdade foi inserida manualmente
    await mongoDB.add_faculdade(data);

    res.status(200).send("Faculdade inserida com sucesso!");
})

// put para atualizar uma universidade, pode alterar web_pages, name e domains
app.put('/universities/:id', basicAuthorizer,  async(req, res) => {
    const data = req.body;
    const id = req.params.id;

    if(data == undefined || data == null){
        res.status(400).send("Favor incluir os dados!");
        return;
    }

    // verifica se os dados são arrays, caso não sejam, são corrigidos para o padrão do BD
    if( typeof(data.web_pages) == "string" ){
        data.web_pages = [data.web_pages]
    }
    if( typeof(data.domains) == "string" ){
        data.domains = [data.domains]
    }

    data.modified = true; // indica que a faculdade foi modificada manualmente
    result = await mongoDB.modify_faculdade(id,data);

    if (result){
        res.status(200).send("Dados salvos!");
    }else{
        res.status(400).send("ID não encontrado!");
    }
    
})

// remoção de faculdade do BD por ID
app.delete('/universities/:id', async(req, res) => {
    const id = req.params.id;
    await mongoDB.delete_faculdade(id);
    res.status(200).send("Faculdade removida!");
})

app.listen(port, () => {
  console.log(`Server de teste para Bis2Bis rodando na porta ${port}`)
})


async function update_BD(){
    await mongoDB.remove_automatic_faculdades(); // limpa a collection de dados antigos
    const paises = ["argentina","brazil","chile","colombia","paraguai","peru","suriname","uruguay"]
    const base_url = "http://universities.hipolabs.com/search?country="

    paises.forEach(async pais => { // para cada pais da lista
        var lista_faculdades = [];

        request(base_url+pais,{json:true}, async (error, res, body) => { // obtenção das faculdades via JSON
            if (error) {
                return('Erro ao obter dados! ' + error );
            };
            if (!error && res.statusCode == 200) { // caso não tenha erro na request
                lista_faculdades = body; 
                lista_faculdades.forEach(async faculdade =>{ // adiciona cada uma das faculdades no Mongo
                    if( await mongoDB.check_if_uni_exists(faculdade) == false){ // confere se a faculdade não ficou por ser manual ou modificada
                        var result = await mongoDB.add_faculdade(faculdade);
                        if(result == false){console.log("\nERRO AO INSERIR FACULDADE DO " + pais)}
                    }
                });
            };
        });
    });
    return"OK";
}