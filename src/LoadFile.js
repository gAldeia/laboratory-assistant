// Script para fazer a leitura dos dados digitados pelo usuário ou carregados
// via arquivo .csv. O script faz a verificação da integridade da entrada
// antes de efetivamente carregá-la, para evitar dados inconsistentes (nesses
// casos, mensagens de erro são enviadas ao usuário).


var labels = [];
var Xtemp = [];
var ytemp = [];

function readData(lines){

	Xtemp = [];
	ytemp = [];

	lines.forEach(function(line, index){
		Xtemp.push(line.slice(0, -1));
		ytemp.push(line.slice(-1)[0]);
	});
}


function showMessage(elementID, message, success=false){
	if (message=="clear"){
		$('#' + elementID).empty();
	}
	else{
		if (success){
			$('#' + elementID).html("<div class='alert alert-success' role='alert'><h5 class='alert-heading'><b>Sucesso!</b></h5><hr><div id='notification-text'></div></div>");
		}
		else{
			$('#' + elementID).html("<div class='alert alert-danger' role='alert'><h5 class='alert-heading'><b>Atenção!</b></h5><hr><div id='notification-text'></div></div>");
		}
		$('#' + elementID + ' > div > #notification-text').html(message);	
	}
	
	return message;
}


function csvUpload(elementID){

	let reader = new FileReader();
	let csv = $("#" + elementID).prop('files')[0];

	if (csv==undefined)	
		throw showMessage("input-notification", "O site só aceita arquivos de extensão .csv, e o algoritmo precisa de pelo menos uma linha de entrada para funcionar!");
	
	reader.readAsText(csv);

	reader.onload = function(event) {
		return loadHandler(event.target.result);
	}
}


function manualUpload(elementID){

	return loadHandler($("#" + elementID).val());
}


function loadHandler(inputData){
	
	let lines = [ ];
	labels = [ ];

	let allTextLines = inputData.split(/\r\n|\n/);
	
	if ($('#labeled').is(':checked')){
		
		allTextLines[0].split(/\ |,|\t/).forEach(function(textLine, index){
			if (textLine.length>0)
				labels.push(textLine)
		});

		allTextLines.shift();
	}

	allTextLines.forEach(function(textLine, index){
		let tarr = [];

		textLine.split(/\ |,|\t/).forEach(function(itemLine, index){
			itemLine = parseFloat(itemLine);
			if (!isNaN(itemLine))
				tarr.push(itemLine);
		});
		
		if (tarr.length>0) {
			lines.push(tarr);

			if (lines[0].length != tarr.length)
				throw showMessage("input-notification", "Nem todas as suas linhas de entrada contém a mesma quantidade de números!");
		}
	});

	if (lines.length==0)
		throw showMessage("input-notification", "O algoritmo precisa de pelo menos uma linha de entrada para funcionar!");
	
	if (lines[0].length==1)
		throw showMessage("input-notification", "cada linha precisa de pelo menos 2 valores!");  
	
	showMessage("input-notification", "Os dados foram carregados!", true);  
	showMessage("results-notification", "clear");  

	readData(lines);
}