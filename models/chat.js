function Sala(numero, qtdVagas) {
	
	this.numero = numero;
	this.qtdVagas = qtdVagas;
	this.ocupadas = 0;

	this.temVaga = function() {
		return this.qtdVagas > this.ocupadas;
	}

	this.preencheVaga = function() {
		this.ocupadas++;
	}

	this.liberaVaga = function() {
		this.ocupadas--;
	}
}

function Chat(salas) {

	var self = this;
	this.listSalas = salas;

	this.entrarSala = function(numeroSala, aoEntrar) {
		var sala = procurarSala(numeroSala);
		if (sala.temVaga()) {
			aoEntrar();
			sala.preencheVaga();
		} else {
			console.log("erro");
			throw new Exception("Sala Cheia");
		}
	}

	this.sairSala = function(numeroSala, aoSair) {
		var sala = procurarSala(numeroSala);
		aoSair();
		sala.liberaVaga();
	}

	function procurarSala(numero) {
		for (var i = self.listSalas.length - 1; i >= 0; i--) {
			if (self.listSalas[i].numero == numero)
				return self.listSalas[i];
		}
		return null;
	}
}

module.exports.Sala = Sala;
module.exports.Chat = Chat;