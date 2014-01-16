
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

var server = http.createServer(app);
var io = require('socket.io').listen(server);

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

var salas = [
	{ numero: 1, vagas: 2, ocupadas: 0 },
	{ numero: 2, vagas: 3, ocupadas: 0 },
	{ numero: 3, vagas: 5, ocupadas: 0 }
];

io.on("connection", function(client) {

	function getSala(numero) {
		for(i in salas) {
			if(numero == salas[i].numero) {
				return salas[i];
			}
		}
	}

	function temVaga(numero) {
		var sala = getSala(numero);
		return (sala.vagas > sala.ocupadas);
	}

	function preencheVaga(numero) {
		var sala = getSala(numero);
		sala.ocupadas++;
	}

	function sairDaSala() {
		client.get("dados", function(error, data) {
			if(data !== null) {
				client.leave(data.sala);
				io.sockets.in(data.sala).emit("nova-mensagem-recebida", "<strong>" + data.usuario + "</strong> saiu da sala");
			}
		});
	}

	client.on("entrar-na-sala", function(data) {
		//if(temVaga(data.sala)) {
			io.sockets.in(data.sala).emit("nova-mensagem-recebida", "<strong>" + data.usuario + "</strong> acabou de entrar");
			client.emit("nova-mensagem-recebida", "<strong>" + data.usuario + "</strong>, seja bem vindo a sala " + data.sala);
			client.join(data.sala);
			client.set("dados", data);
		//	preencheVaga(data.sala);
		//} else {
		//	client.emit("sala-cheia", data.sala);
		//}
		
	});

	client.on("nova-mensagem-enviada", function(mensagem) {
		if (mensagem !== "") {
			client.get("dados", function(error, data) {
				io.sockets.in(data.sala).emit("nova-mensagem-recebida", "<strong>" + data.usuario + "</strong>: " + mensagem);
			});
		}
	});

	client.on("sair-da-sala", sairDaSala);
	client.on("disconnect", sairDaSala);
});