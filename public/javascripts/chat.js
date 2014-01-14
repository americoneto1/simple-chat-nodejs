$(function() {

	var socket = io.connect(document.URL);
	var easing = 2000;

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
		$("#usuario").attr("disabled", "disabled");
		if(usuario !== "") {
			$(this).hide(easing, function() {
				$(".header h3").html($(".header h3").html() + " - " + usuario);
				$("#lista-salas").show(easing);
			});
		}
		event.preventDefault();
	});

	$("#lista-salas a").on("click", function() {
		$(this).parent().parent().hide(easing);
		setSala($(this).parent().data("sala"));
		$("#sala").show(easing, function() {
			socket.emit("entrar-na-sala", { usuario: getUsuario(), sala: getSala() });
		});
	});

	$("#sala form").submit(function(event) {
		socket.emit("nova-mensagem-enviada", $("#mensagem").val());
		$("#mensagem").val("");
		event.preventDefault();
	});

	socket.on("nova-mensagem-recebida", function(mensagem) {
		$("#lista-mensagens").append($("<li class=\"list-group-item\">" + mensagem + "</li>"));
		$("#lista-mensagens").animate({scrollTop: '10000px'});
	});
});