<h1>Teste Bis2Bis/Integrado</h1>
João Vitor Specht Kogut
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

