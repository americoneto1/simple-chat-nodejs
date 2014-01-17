
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
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

var server = http.createServer(app);
var io = require('socket.io').listen(server);

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

var modelsChat = require('./models/chat');
var salas = new Array();
salas.push(new modelsChat.Sala(1, 2));
salas.push(new modelsChat.Sala(2, 2));
salas.push(new modelsChat.Sala(3, 3));

var chat = new modelsChat.Chat(salas);

io.on("connection", function(client) {

	function sairDaSala() {		
		client.get("dados", function(error, data) {
			if(data !== null) {
				chat.sairSala(data.sala, function() {
					client.leave(data.sala);
					io.sockets.in(data.sala).emit("nova-mensagem-recebida", "<strong>" + data.usuario + "</strong> saiu da sala");
				});
			}
		});
	}

	client.on("entrar-na-sala", function(data) {
		try {
			chat.entrarSala(data.sala, function() {				
				io.sockets.in(data.sala).emit("nova-mensagem-recebida", "<strong>" + data.usuario + "</strong> acabou de entrar");
				client.join(data.sala);
				client.emit("nova-mensagem-recebida", "<strong>" + data.usuario + "</strong>, seja bem vindo a sala " + data.sala);
				client.set("dados", data);
				client.emit("entrou-na-sala");
			});
		} catch(e) {
			client.emit("sala-cheia");
		}		
	});

	client.on("digitou-mensagem", function() {
		client.get("dados", function(error, data) {
			io.sockets.in(data.sala).except(client.id).emit("esta-digitando", data.usuario + " está digitando...");
		});
	});

	client.on("parou-de-digitar", function() {
		client.get("dados", function(error, data) {
			io.sockets.in(data.sala).emit("nao-esta-digitando");
		});
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