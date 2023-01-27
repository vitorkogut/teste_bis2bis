const {MongoClient} = require('mongodb');
const mongoose = require('mongoose');


//////////////////////////////////////////
const URL_MONGO = "127.0.0.1"
const PORT_MONGO = "27017"
const NOME_BD = "teste_bis2bis"
//////////////////////////////////////////


// FUNÇÃO DE INICIALIZAÇÃO DO MONGO
async function start_mongo(){
    try{
        await mongoose.connect(`mongodb://${URL_MONGO}:${PORT_MONGO}/${NOME_BD}`);
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
    domains : [String],
    modified: {type:Boolean, default:false},
    manual_insert: {type:Boolean, default:false},
    last_update:{type:Date, default:Date.now}
})
const faculdade = mongoose.model("faculdade", faculdadeSchema); // model da faculdade

const userSchema= new mongoose.Schema({
    username:{type:String, required:true, unique:true},
    password:{type:String, required:true},
    createdAt:{type:Date, default:Date.now}
})
const usuario = mongoose.model("usuario",userSchema);

// FUNÇÔES
// procura User por username
async function getUserByUsername(username){
    try{
        result = usuario.findOne({username:username});
        if(result){
            return result;
        }else{
            return null;
        }
    }catch(e){
        console.log(e)
    }
}

//adiciona novo user
async function add_user(userBody){
    try{
        const novo_user = await new usuario(userBody);
        await novo_user.save();
        return true;
    }catch(e){
        console.log(e);
        return false;
    }
}

async function modify_user(id,newPass){
    try{
        await usuario.findByIdAndUpdate({_id:id}, {password:newPass}, {new:true})
    }catch(e){
        console.log(e)
    }
}

// função para adicionar uma nova faculdade (Dados devem ser previmante verificados)
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

// !! REMOVE TODOS OS ITENS DO BD !!
async function remove_all_faculdades(){
    try{
        await faculdade.deleteMany({});
    }catch(e){
        console.log(e);
    }
}

// remove apenas as faculdades obtidas automaticamente
async function remove_automatic_faculdades(){
    try{
        await faculdade.deleteMany({modified:false,manual_insert:false});
    }catch(e){
        console.log(e);
    }
}

// função para obter dados de faculdades, filtro facultativo (20 itens max)
async function get_faculdades(filtro, pagina_atual){
    try{
        var result =[];
        result = await faculdade.find(filtro, '_id name country',{skip: pagina_atual*20, limit:20});
        return result;
    }catch(e){
        console.log(e)
    }
}

// função para obter todos os dados de uma unica faculdade
async function get_faculdade_id(id){
    try{
        var result = await faculdade.findById({_id: mongoose.Types.ObjectId(id)});
        return result;
    }catch(e){
        console.log(e);
    }
}

// função para conferir se uma facudlade ja esta cadastrada (true = existe)
async function check_if_uni_exists(universidade){
    try{
        var result = await faculdade.find({country:universidade.country, state_province:universidade.state_province, name:universidade.name});
        if(result.length){
            return true;
        }else{
            return false;
        }
    }catch(e){
        console.log(e);
    }
}

// função para modificar faculdade com base no ID, qualquer campo pode ser inserido no "data" (Dados devem ser previmante verificados)
async function modify_faculdade(id,data){
    data.last_update = Date.now()
    try{
        var modificado = await faculdade.findByIdAndUpdate({_id:mongoose.Types.ObjectId(id)}, data, {new:true})
        if(modificado == null){
            return false;
        }
        await modificado.save();
        return true;
    }catch(e){
        console.log(e);
    }
}

// função de remoção de faculdade por ID
async function delete_faculdade(id){
    try{
        await faculdade.deleteOne({_id:mongoose.Types.ObjectId(id)});
    }catch(e){
        console.log(e);
    }
}

module.exports = { 
    start_mongo, 
    add_faculdade,
    remove_all_faculdades,
    remove_automatic_faculdades,
    get_faculdades,
    get_faculdade_id,
    check_if_uni_exists,
    modify_faculdade,
    delete_faculdade,
    getUserByUsername,
    add_user,
    modify_user
}