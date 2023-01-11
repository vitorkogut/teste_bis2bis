const {MongoClient} = require('mongodb');
const mongoose = require('mongoose');



// FUNÇÃO DE INICIALIZAÇÃO DO MONGO
async function start_mongo(){
    try{
        await mongoose.connect('mongodb://127.0.0.1:27017/teste_bis2bis');
    }catch(e){
        console.log("Um erro ocorreu na conexão com o Mongo " + e);
    }
    
}


// SCHEMAS E MODELS
const faculdadeSchema = new mongoose.Schema({ // schema do modelo "faculdade"
    web_pages : [String],
    state_province : String,
    alpha_two_code : String,
    name : String,
    country : String,
    domains : [String]
})
const faculdade = mongoose.model("faculdade", faculdadeSchema); // model da faculdade


// FUNÇÔES
async function add_faculdade(nova_faculdade){
    try{
        const nova_faculdade_temp = await new faculdade(nova_faculdade);
        await nova_faculdade_temp.save();
        return true;
    }catch(e){
        console.log(e);
        return false;
    }
}

async function remove_all_faculdades(){
    try{
        await faculdade.deleteMany({});
    }catch(e){
        console.log(e);
    }
}

async function get_faculdades(filtro, pagina_atual){
    var result =[];
    result = await faculdade.find(filtro, '_id name country',{skip: pagina_atual*20, limit:20});
    return result;
}

async function get_faculdade_id(id){
    var result = await faculdade.findById({_id: mongoose.Types.ObjectId(id)});
    return result;
}

module.exports = { 
    start_mongo, 
    add_faculdade,
    remove_all_faculdades,
    get_faculdades,
    get_faculdade_id
}