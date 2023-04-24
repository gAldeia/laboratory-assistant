# **Laboratory** Assistant: Lightweight Symbolic Regression

This project was developed to show the possibility of applying the SymTree algorithm as a lightweight alternative to common Symbolic Regression algorithms. This tool can be used as an assistent to physics and engineering experimental labs to verify equations and functions seen in theory classes.

The algorithm was entirely developed in JavaScript.

---

## Getting Started

The project is hosted at http://gAldeia.github.io, where you can use the SymTree algorithm online without any further requirements.

Also, the project page contains a brief tutorial on how to use the tool, some pre made examples to try out the algorithm and a theorical fundamentation of the project (in portuguese);

---

## Installation and Usage

In case you only want the algorithm source code, you'll need to download and include in your HTML two files:

|[LoadFile.js](https://github.com/gAldeia/gAldeia.github.io/blob/master/scripts/LoadFile.js)|[SymbolicRegression.js](https://github.com/gAldeia/gAldeia.github.io/blob/master/scripts/SymbolicRegression.js)|
|---|---|
|The *LoadFile.js* deals with the user input, reading it from a `html <input type=text>` tag or from a `html <input type=file>`, and converting it to an array of DataPoints (an object created to make notation more meanfull)|The *SymbolicRegression.js* contains three algorithms, all based on the new data structure recently introduced by Fabrício Olivetti de França ([GitHub](https://github.com/folivetti)) called *IT - iteraction transformation*.|
  
### Pre requisites

The project depends on the [math.js](http://mathjs.org/) library to handle matrix operations, [ploty.js](https://plot.ly/javascript/) for plotting the results, [Mathajax](https://www.mathjax.org/) for displaying LaTeX equations, [Bootstrap](https://getbootstrap.com/) for the structure of the site, [jQuery](https://jquery.com/) for the interactiveness, and [Font Awesome](https://fontawesome.com/) for the icons on the menus.

It is important to notice that is possible to use those libraries without installing it (via CDN).

### Running

1. Read the user input using one of the methods:
  ```javascript
    performUpload('my-manualinput', 'manual');
    performUpload('my-csvinput', 'csv');
  ```
  
2. Use one of the regression algorithms and store the result in a variable:
  ```javascript
    performRegression('SymTree');
    performRegression('ITLS');
    performRegression('ITES');
   ```
   
3. The performRegression method will search for some tags to set the parameters of the models:
```javascript
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
```

4. Now to retrieve informations from the returned expression:
  ```javascript
    let exp_str   = printIT_html(expression);
    let exp_latex = printIT_latex(expression);
  ```
---

## License

See the [LICENSE.md](LICENSE.md) file for details.
