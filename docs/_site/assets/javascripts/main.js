var expression    = undefined;
var configuration = undefined;

function get_example(element, type){

    $("#" + element).val(localStorage.getItem("chosen-example"));
    $('#labeled').prop('checked', true);

    performUpload(element, type);
}


function performUpload(element, type){
    try{
        type == 'csv' ? csvUpload(element) : manualUpload(element);
    }
    catch(err){
    }
}


function performRegression(algorithm){
    try{
        runRegression(algorithm);
    }
    catch(err){
    }
}

function runRegression(algorithm){

    if (Xtemp.length==0){
        throw showMessage("results-notification", "Você não enviou nenhuma entrada de dados para o site!");
    }
    
    //showMessage("results-notification", "clear");

    $("#results-div").attr("style", "display:inline");

    expression    = undefined; 
    configuration = undefined;

    let startTime = performance.now(); 
    
    if (algorithm==="SymTree"){
        let iteractions = parseInt($('#symtree-iteractions').val());
        let minI        = parseInt($('#symtree-inv').val());
        let minT        = parseInt($('#symtree-transf').val());
        let threshold   = parseFloat($('#symtree-threshold').val());
        let stopscore   = parseFloat($('#symtree-stopscore').val());

        configuration = {
            iteractions       : iteractions,
            threshold         : threshold,
            minInverse        : minI,
            minTransformation : minT,
            stopscore         : stopscore
        }
        
        //(Xs, ts, iterations, threshold, minI, minT, stopScore)
        expression = SYMTREE(Xtemp, ytemp, iteractions, threshold, minI, minT, stopscore);
    }

    if (algorithm==="ITLS"){
        let popsize     = Number($('#itls-popsize').val());
        let startsize   = Number($('#itls-startsize').val());
        let endsize     = Number($('#itls-endsize').val());
        let expolim     = Number($('#itls-expolim').val());
        let iteractions = Number($('#itls-iteractions').val());
        let stopscore   = Number($('#itls-stopscore').val());

        configuration = {
            popsize     : popsize,
            startsize   : startsize,
            endsize     : endsize,
            expolim     : expolim,
            iteractions : iteractions,
            stopscore   : stopscore   
        }

        //(Xs, ys, popSize, minSize, maxSize, expolim, iterations, stopScore)
        expression = ITLS(Xtemp, ytemp, popsize, startsize, startsize+endsize, expolim, iteractions, stopscore);
    }
        
    if (algorithm==="ITES"){
        let popsize    = Number($('#ites-popsize').val());
        let startsize  = Number($('#ites-startsize').val());
        let endsize    = Number($('#ites-endsize').val());
        let selecsize  = Number($('#ites-selecsize').val());
        let expolim    = Number($('#ites-expolim').val());
        let gens       = Number($('#ites-gens').val());
        let stopscore  = Number($('#ites-stopscore').val());
        
        configuration = {
            popsize    : popsize,
            startsize  : startsize,
            endsize    : endsize,
            selecsize  : selecsize,
            expolim    : expolim,
            gens       : gens,
            stopscore  : stopscore
        }

        //(Xs, ys, popSize, selectedSize, minSize, maxSize, expolim, generations, stopScore)
        expression = ITES(Xtemp, ytemp, popsize, selecsize, startsize, startsize+endsize, expolim, gens, stopscore);
    }

    console.log(expression);

    // valores para o resultado
    let elapsedTime = performance.now() - startTime;

    let exp_str   = printIT_html(expression);
    let exp_latex = printIT_latex(expression);
    
    for(let i=0; i<labels.length; i++){
        exp_latex = exp_latex.split("x"+i).join(labels[i]);
        exp_str   = exp_str.split("x"+i).join(labels[i]);
    }

    $('#results-log').html("$$" + exp_latex + "$$");
    $('#results-log').append("<pre></pre>");
    
    $('#results-log > pre').append('Algoritmo:              ' + algorithm + '\n');
    $('#results-log > pre').append('Expressão simplificada: ' + exp_str + '\n');
    $('#results-log > pre').append('Tempo de execução:      ' + elapsedTime + ' (ms)\n');
    $('#results-log > pre').append('Score final:            ' + expression.score + '\n');
    $('#results-log > pre').append("Configurações:\n");

    for(let i in configuration) {
        $('#results-log > pre').append("\t" + i + " = " + configuration[i] + '\n');
    }

    $("#graphics-control").html("<p><strong> Termos</strong>:</p><form id='terms'></form>");
    $("#graphics-control").append("<p><strong> Variáveis</strong>:</p><form id='vars'></form>");

    printIT_latex(expression, join=false).forEach(function(term, tindex){
        labels.forEach(function(label, lindex){
            term = term.split("x"+lindex).join(label);
        });

        $("#graphics-control > #terms").append("<input type='checkbox' id='ck" + tindex + "' value='true' checked>");
        $("#graphics-control > #terms").append(" <label for='ck" + tindex + "'> \\(" + term + "\\)</label><br>");
    });

    Xtemp[0].forEach(function(xi, xindex){
        
        $("#graphics-control > #vars").append("<input type='radio' name='variable' value=" + xindex + " id='xi" + xindex + "'>");
        $("#graphics-control > #vars").append(
            " <label for='xi" + xindex + "'>\\(" + (xindex < labels.length ? labels[xindex] : "x" + xindex) + "\\)</label><br>"
        );
    });
    
    // Selecionando uma opção (se o algoritmo executou, sabemos que a entrada é consistente)
    //aqui é para garantir que o radio vai começar com uma opção, para não ter que verificar mais pra frente
    $("#xi0").attr("checked", true);

    MathJax.Hub.Queue([ "Typeset", MathJax.Hub, $("#results-div")[0] ]);
    
    return [expression, configuration];
}

function get_composed_expr(){
    let choosen = [];

    expression.terms.forEach(function(_, tindex){
        if ($('#ck'+tindex).is(':checked'))
            choosen.push({
                term:  expression.terms[tindex],
                func:  expression.funcs[tindex],
                coeff: expression.coeffs[tindex]
            });
    });

    if (choosen.length==0)
        throw showMessage("results-notification", "Você não selecionou nenhum termo para compor uma expressão!");

    let withSelected = choosen.reduce((newIT, term) => composeIT(newIT, term), {
        terms: [],
        funcs: [],
        coeffs: [],
        length: 0
    });

    //console.log(printIT_debug(withSelected));

    //Escrevendo a expressão composta no campo em baixo do gráfico
    let exp_latex = printIT_latex(withSelected);
    
    for(let i=0; i<labels.length; i++){
        exp_latex = exp_latex.split("x"+i).join(labels[i]);
    }
    
    let MAE = zip(Xtemp, ytemp).map(function([X, y]){
        return Math.abs(evalIT(withSelected, X) - y);
    }).reduce(sum, 0) / Xtemp.length;

    let score = 1/(1 + MAE);


    $("#func-latex").html("<hr><p class='text-center'><strong>Função composta</strong> (score: "+ (isFinite(score) ? score : 0.0) +")</p>");
    $("#func-latex").append("<p>$$" + exp_latex + "$$</p>");
    
    MathJax.Hub.Queue([ "Typeset", MathJax.Hub, $("#func-latex")[0] ]);

    return withSelected;
}

function update_plot(){
    let plot = undefined;

    try{
        plot = get_composed_expr();
    }
    catch(err){
        return;
    }

    showMessage("results-notification", "clear");

    let yaxis = Xtemp.map(X => evalIT(plot, X));
    let xaxis = ytemp;

    let trace = {
        y          : yaxis,
        x          : xaxis,
        mode       : 'markers',
        marker     : {size: 10},
        showlegend : false
    };

    var trace2 = {
        type       :'scatter',
        y          : [yaxis.reduce(maximum), 0, yaxis.reduce(minimum)],
        x          : [yaxis.reduce(maximum), 0, yaxis.reduce(minimum)],
        mode       : 'lines',
        opacity    : 0.5,
        line       : {
                        color : '#000000',
                        width : 2,
                        dash  : 'dashdot',
                     },
        showlegend : false
      };

    var layout = { 
        title    : '<b>Valor predito versus valor real</b>',
        yaxis    : {title: "Predito"},
        xaxis    : {title: "Real"},
        autosize : true,
        margin   : {
                       l   : 50,
                       r   : 50,
                       b   : 50,
                       t   : 50,
                       pad : 0
                   },
    };
    
    Plotly.newPlot('func-ploter', [trace, trace2], layout, {responsive: true, displayModeBar: false});
}


function update_variable_plot(){
    
    let index = $('input[name=variable]:checked', '#vars').val()

    let plot = undefined;

    try{
        plot = get_composed_expr();
    }
    catch(err){
        return;
    }

    showMessage("results-notification", "clear");

    let newPoints = [ ];

    function extract(X) {return X[index]};

    let min = Xtemp.map(extract).reduce(minimum);
    let max = Xtemp.map(extract).reduce(maximum);

    let h = (max-min)*0.02;

    let xaxis = [ ];
    let yaxis = [ ];

    range(0, 50).forEach(function(item, rindex){
        let fixed    = new Array(Xtemp[0].length).fill(1);
        fixed[index] = min + h*rindex;
        
        xaxis.push(min + h*rindex);
        yaxis.push(evalIT(plot, fixed));
    });
    
    let trace = {
        type       :'scatter',
        x          : xaxis,
        y          : yaxis,
        mode       : 'lines',
        line       : {
                         color: '#000000',
                         width: 2,
                         dash: 'solid',
                     },
        showlegend : false
    };

    var layout = { 
        title    : '<b>Valor predito versus valor da variável</b>',
        yaxis    : {title: "Predito"},
        xaxis    : {title: "Variável selecionada"},
        autosize : true,
        margin   : {
                      l: 50,
                      r: 50,
                      b: 50,
                      t: 50,
                      pad: -10
                   },
        tracetoggle : false
    };

    Plotly.newPlot('func-ploter', [trace], layout, {responsive: true, displayModeBar: false});
}

/*
window.onresize = function() {
    Plotly.Plots.resize(gd);
};
*/