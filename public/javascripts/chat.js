$(function() {

	var socket = io.connect(document.URL);
	var easing = 2000;

	$("#usuario").focus();

	function getSala() {
		return $("#sala strong").html();
	}

	function setSala(sala) {
		$("#sala strong").html(sala);
	}

	function getUsuario() {
		return $("#usuario").val();
	}

	$("#login form").submit(function(event) {
		var usuario = getUsuario();		
		if(usuario !== "") {
			$("#usuario").attr("disabled", "disabled");
			$(this).hide(easing, function() {
				$(".header h3").html($(".header h3").html() + " - " + usuario);
				$("#lista-salas").show(easing);
			});
		}
		event.preventDefault();
	});

	$("#lista-salas a").on("click", function() {
		setSala($(this).parent().data("sala"));		
		socket.emit("entrar-na-sala", { usuario: getUsuario(), sala: getSala() });		
	});

	$("#sala form").submit(function(event) {
		socket.emit("nova-mensagem-enviada", $("#mensagem").val());
		$("#mensagem").val("");
		event.preventDefault();
	});

	$("#sair").on("click", function() {		
		$("#sala").hide(easing, function() {
			socket.emit("sair-da-sala");
			$("#lista-mensagens").empty();
			$("#lista-salas").show(easing);
		});
	});

	socket.on("entrou-na-sala", function() {
		$("#lista-salas").hide(easing);
		$("#sala").show(easing);
	});

	socket.on("sala-cheia", function() {
		alert("Sala Cheia"); //to do
	});

	socket.on("nova-mensagem-recebida", function(mensagem) {
		$("#lista-mensagens").append($("<li class=\"list-group-item\">" + mensagem + "</li>"));
		$("#lista-mensagens").animate({scrollTop: '10000px'});
	});
});