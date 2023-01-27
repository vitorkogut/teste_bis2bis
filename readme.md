<h1>Teste Bis2Bis/Integrado</h1>
João Vitor Specht Kogut
<br>
<br>
<h2>Considerações</h2>
Universidades inseridas manualmente não serão atualizadas automaticamente, nem as que forem modificadas manualmente, estas ficam marcadas no banco para não perderem seus dados.<br>
É necessario apresentar usuario e senha via Basic Auth para todas as rotas, para adicionar o primeiro usuario consulte o desenvolvedor para ele te apresentar a gambiarra.<br>
Os dados do banco serão atualizados todos os dias automaticamente as 19:30 para evitar lentidão ou erros durante o periodo comercial.

<br>
<br>
<h2>Deploy</h2>
Para realizar o deploy basta clonar este repositorio e instalar suas dependencias:

```
npm install
```
E executar o app
```
node index.js
```
Isso considerando que o MongoDB esteja operacional, é possivel alterar o endereço do banco e sua porta no arquivo "controller_MongoDB.js"

<br>
<br>
<h2>Rotas</h2>
<h4>POST  /addUser </h4>
Rota utilizada para adicionar usuarios via JSON
<br>Exemplo:<br>

```
{
	"username":"joao",
	"password":"senha2"
}
```

<h4>POST  /modifyUser</h4>
Rota utilizada para modificar a senha de um usuario via JSON, apenas o próprio user pode alterar sua senha.
<br>Exemplo:<br>

```
{
	"username":"joao",
	"password":"novaSenha"
}
```

<h4>GET  /getFaculdades</h4>
Rota utilizada para atualizar os dados do banco, atualiza todos as entradas que não tenham sido modificadas manualmente ou inseridas manualmente.

<br>

<h4>GET  /universities</h4>
Rota utilizada para obter os dados basicos das faculdades, podendo filtrar por pais e possui paginação de 20 itens/pagina.
<br>Exemplo:<br>

```
http://localhost:3000/universities?page=1&country=Brazil
```
Retorno:<br>
```
[
	{
		"_id": "63d40a92cff503964b330645",
		"name": "Universidade Mackenzie",
		"country": "Brazil"
	},

	(...),

	{
		"_id": "63d40a92cff503964b33066b",
		"name": "Universidade Católica de Pelotas",
		"country": "Brazil"
	}
]
```

<h4>GET  /universities/_id</h4>
Rota utilizada para obter os dados completos de uma faculdade.
<br>Exemplo:<br>

```
localhost:3000/universities/63d40a91cff503964b330417
```
Retorno:<br>
```
{
	"_id": "63d40a91cff503964b330417",
	"web_pages": [
		"http://www.uamericas.cl/"
	],
	"alpha_two_code": "CL",
	"name": "Universidad de Las Américas",
	"country": "Chile",
	"domains": [
		"uamericas.cl"
	],
	"modified": false,
	"manual_insert": false,
	"last_update": "2023-01-27T17:32:01.966Z",
	"__v": 0
}
```

<h4>POST /universities</h4>
Rota utilizada para inserir uma universidade atravez de JSON.
<br>Exemplo:<br>

```
{
    "web_pages" : ["valor"],
    "state_province" : "String",
    "alpha_two_code" : "String",
    "name" : "String",
    "country" : "String",
    "domains" : ["String"]
}
```
Retorno:<br>
```
Faculdade inserida com sucesso!
```

<h4>PUT /universities/_id</h4>
Rota utilizada para modificar os dominios e paginas de uma universidade atravez de JSON.
<br>Exemplo:<br>

```
localhost:3000/universities/63d419e321e69361019c50eb


{
	"web_pages":["site.com"],
	"domains":["dominio.com"] 
}
```
Retorno:<br>
```
Dados salvos!
```


<h4>DELETE /universities/_id</h4>
Rota utilizada para remover uma universidade.
<br>Exemplo:<br>

```
localhost:3000/universities/63d419e321e69361019c50eb
```
