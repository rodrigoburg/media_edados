//onde estão os dados
path = "http://blog.estadaodados.com/projs/media_edados/"
//path = ""
//cria as tabs e deixa ativa a que for informada na url
jQuery(function() {
  jQuery( "#tabs" ).tabs();

  var variaveis = getUrlVars()
      tab = "2aecio" //valor default

  if ("grafico" in variaveis) {
      tab = variaveis["grafico"];
  } else { //coloca default media na url
      location.hash = "#grafico=media"
  }

  var numero = 0

  if (tab == "media")
      numero = 0
  else if (tab == "1turno")
      numero = 1
  else if (tab == "2marina")
      numero = 2
   else if (tab == "2aecio")
       numero = 3

  //desenha o primeiro gráfico
  desenha_pesquisas(tab)

  //deixa ativa a tab correta
  jQuery( "#tabs" ).tabs( "option", "active", numero );

  //coloca função para redesenhar gráfico quando mudar Tab e mudar endereço da barra
  jQuery( "#tabs" ).tabs({
    activate: function( event, ui ) {
        var grafico = ui.newPanel.selector.split("-")[1]
        if (grafico == "1") {
            if (window.grafico_media == null)
                desenha_pesquisas("media")
            muda_media("valido")
            location.hash = "#grafico=media";
        }
        else if (grafico == "2") {
            if (window.grafico_todos == null)
                desenha_pesquisas("1turno")
            muda_todos("valido")
            location.hash = "#grafico=1turno";
        }
        else if (grafico == "3") {
            muda_turno("valido")
            if (window.grafico_turno == null)
                desenha_pesquisas("2marina")
            location.hash = "#grafico=2marina";
        }
        else if (grafico == "4") {
            muda_turno_aecio("valido")
            if (window.grafico_turno_aecio == null)
                desenha_pesquisas("2aecio")
            location.hash = "#grafico=2aecio";
        }
    }
  });

});

//valores default
window.media = "valido"
window.todos = "valido"
window.turno = "valido"
window.turno_aecio = "valido"
window.grafico_media = null
window.grafico_todos = null
window.grafico_turno = null
window.grafico_turno_aecio = null
window.data_media = null
window.data_todos = null
window.data_turno = null
window.data_turno_aecio = null

width = jQuery(window).width()
margin = Math.max(width/8,90)

//div para linha de 50%
var div_turno = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

function desenha_pesquisas(tab) {
    if (tab == "1turno")
        intencao_voto();
    else if (tab == "media")
        media_edados();
    else if (tab == "2marina")
        segundo_turno();
    else if (tab == "2aecio")
        segundo_turno_aecio();
}

function intencao_voto() {
    var svg = dimple.newSvg("#todos_institutos", width, 500);
      d3.csv(path+"dados/todos_institutos.csv", function (data) {
        window.data_todos = data
        //filtra votos totais ou validos
        var recorte = window.todos
        var myChart = new dimple.chart(svg, data);
        myChart = arruma_tooltip(myChart,"todos")

        data = dimple.filterData(data,"voto",recorte)
        var ibope_datafolha = dimple.filterData(data,"instituto",["Ibope","Datafolha"])

        myChart.setBounds(25, 30, width-margin, 405);
        var x = myChart.addTimeAxis("x", "data","%Y-%m-%dT%H","%d/%m");
        x.title = ""

        var y = myChart.addMeasureAxis("y", "valor");
        y.overrideMax = 50.0

        //primeira série, linha com datafolha e ibope apenas
        var series = myChart.addSeries("candidato", dimple.plot.line);
        series.data = ibope_datafolha
        series.lineWeight = 1.8;
        series.interpolation = "cardinal";

        //segunda série, só as bolhas. são duas séries apenas para eu pegar o valor do instituto na tooltip
        var series2 = myChart.addSeries(["candidato","instituto"], dimple.plot.bubble)
        series2.data = data

        myChart.assignColor("Aécio Neves","#1C4587");
        myChart.assignColor("Dilma Rousseff","#CC0000");
        myChart.assignColor("Eduardo Campos","#E69138");
        myChart.assignColor("Marina Silva","#E69138");
        myChart.assignColor("Outros","#2E2B2D");

        //faz uma série nova que será a linha cinza de 50%
        var datas = dimple.getUniqueValues(data,"data");
        var s3 = myChart.addSeries("metade", dimple.plot.line);

        var primeira_data = datas[0];
        var ultima_data = datas[datas.length-1];

        s3.data = [
            { "metade" : "metade", "valor" : 50, "data" : primeira_data },
            { "metade" : "metade", "valor" : 50, "data" :  ultima_data}];

        var s4 = myChart.addSeries("segturno", dimple.plot.line);
            s4.data = [
                { "segturno": "segturno", "valor": 0, "data": "2014-10-06T00"},
                { "segturno": "segturno", "valor": 100, "data": "2014-10-06T01"}
            ];

        //arruma ordem da legenda
        var legenda = myChart.addLegend(25, 8, width, 30, "left");
        legenda._getEntries = function () {
           return arruma_legenda(myChart,recorte)
        }

        myChart.draw();

        //translada labels do eixo x
        x.shapes.selectAll("text").attr("transform",
            function (d) {
              return d3.select(this).attr("transform") + " translate(0, 15) rotate(-60)";
            });

        //muda tamanho do texto
        jQuery("#todos_institutos").find("text").css({"font-size":"12px"})

        window.grafico_todos = myChart

        myChart = arruma_tooltip(myChart,"todos")

        //arruma campos na legenda
        jQuery("text[class*='dimple-eduardo-campos']").text("Ed. Campos")
        jQuery("text[class*='dimple-pastor-everaldo']").text("P. Everaldo")

        //arruma a barra de 50%
        arruma_50()

     });
}

function media_edados() {
    var svg = dimple.newSvg("#media_edados", width, 500);
      d3.csv(path+"dados/media_edados.csv", function (data) {
        window.data_media = data
        //filtra votos totais ou validos
        var recorte = window.media


        data = dimple.filterData(data,"voto",recorte)
        var myChart = new dimple.chart(svg, data);
        myChart.setBounds(25, 30, width-margin, 405);
        var x = myChart.addTimeAxis("x", "data","%Y-%m-%dT%H","%d/%m");
        x.title = ""

        var y = myChart.addMeasureAxis("y", "valor");
        y.overrideMax = 50.0

        var series = myChart.addSeries("candidato", dimple.plot.line);
        series.lineWeight = 2;

        //faz uma série nova que será a linha cinza de 50%
        var datas = dimple.getUniqueValues(data,"data")
        var s3 = myChart.addSeries("metade", dimple.plot.line);

        var primeira_data = datas[0]
        var ultima_data = datas[datas.length-1]

        s3.data = [
            { "metade" : "metade", "valor" : 50, "data" : primeira_data },
            { "metade" : "metade", "valor" : 50, "data" :  ultima_data}];

        var s4 = myChart.addSeries("segturno", dimple.plot.line);
            s4.data = [
                { "segturno": "segturno", "valor": 0, "data": "2014-10-06T00"},
                { "segturno": "segturno", "valor": 100, "data": "2014-10-06T01"}
            ];

        myChart.assignColor("Aécio Neves","#1C4587");
        myChart.assignColor("Dilma Rousseff","#CC0000");
        
        myChart.assignColor("Eduardo Campos","#E69138");
        myChart.assignColor("Marina Silva","#E69138");
        myChart.assignColor("Outros","#2E2B2D");

        myChart = arruma_tooltip(myChart,"media")

        //arruma ordem da legenda
        var legenda = myChart.addLegend(25, 8, width, 30, "left");
        legenda._getEntries = function () {
           return arruma_legenda(myChart,recorte)
        }

        myChart.draw();

        //translada labels do eixo x
        x.shapes.selectAll("text").attr("transform",
            function (d) {
              return d3.select(this).attr("transform") + " translate(0, 15) rotate(-60)";
            });

        //muda tamanho do texto
        jQuery("#media_edados").find("text").css({"font-size":"12px"})

        //arruma campos na legenda
        jQuery("text[class*='dimple-eduardo-campos']").text("Ed. Campos")
        jQuery("text[class*='dimple-pastor-everaldo']").text("P. Everaldo")

        window.grafico_media = myChart

        //arruma a barra de 50%
        arruma_50()
      });

}


function segundo_turno() {
    var svg = dimple.newSvg("#turno", width, 500);
      d3.csv(path+"dados/segundo_turno.csv", function (data) {
        window.data_turno = data
        //filtra votos totais ou validos
        var recorte = window.turno
        var myChart = new dimple.chart(svg, data);
        myChart = arruma_tooltip(myChart,"todos")

        data = dimple.filterData(data,"voto",recorte)
        var ibope_datafolha = dimple.filterData(data,"instituto",["Ibope","Datafolha"])

        myChart.setBounds(25, 30, width-margin, 405);
        var x = myChart.addTimeAxis("x", "data","%Y-%m-%dT%H","%d/%m");
        x.title = ""

        var y = myChart.addMeasureAxis("y", "valor");
        y.overrideMax = 60.0

        //primeira série, linha com datafolha e ibope apenas
        var series = myChart.addSeries("candidato", dimple.plot.line);
        series.data = ibope_datafolha
        series.lineWeight = 1.8;
        series.interpolation = "cardinal";

        //segunda série, só as bolhas. são duas séries apenas para eu pegar o valor do instituto na tooltip
        var series2 = myChart.addSeries(["candidato","instituto"], dimple.plot.bubble)
        series2.data = data

        //faz uma série nova que será a linha cinza de 50%
        var datas = dimple.getUniqueValues(data,"data")
        var s3 = myChart.addSeries("metade", dimple.plot.line);

        var primeira_data = datas[0]
        var ultima_data = datas[datas.length-1]

        s3.data = [
            { "metade" : "metade", "valor" : 50, "data" : primeira_data },
            { "metade" : "metade", "valor" : 50, "data" :  ultima_data}];

        var s4 = myChart.addSeries("segturno", dimple.plot.line);
            s4.data = [
                { "segturno": "segturno", "valor": 0, "data": "2014-10-06T00"},
                { "segturno": "segturno", "valor": 100, "data": "2014-10-06T01"}
            ];



        myChart.assignColor("Dilma Rousseff","#CC0000");
        myChart.assignColor("Marina Silva","#E69138");

        //arruma ordem da legenda
        var legenda = myChart.addLegend(25, 8, width, 20, "left");
        legenda._getEntries = function () {
           return arruma_legenda(myChart,"turno")
        }

        myChart.draw();

        //translada labels do eixo x
        x.shapes.selectAll("text").attr("transform",
            function (d) {
              return d3.select(this).attr("transform") + " translate(0, 15) rotate(-60)";
            });

        //muda tamanho do texto
        jQuery("#turno").find("text").css({"font-size":"12px"})

        window.grafico_turno = myChart

        myChart = arruma_tooltip(myChart,"todos")

        //arruma a barra de 50%
        arruma_50()
     });
}

function segundo_turno_aecio() {
    var svg = dimple.newSvg("#turno_aecio", width, 500);
      d3.csv(path+"dados/segundo_turno_aecio.csv", function (data) {
        window.data_turno_aecio = data
        //filtra votos totais ou validos
        var recorte = window.turno_aecio
        var myChart = new dimple.chart(svg, data);
        myChart = arruma_tooltip(myChart,"todos")

        data = dimple.filterData(data,"voto",recorte)
        var ibope_datafolha = dimple.filterData(data,"instituto",["Ibope","Datafolha"])

        myChart.setBounds(25, 30, width-margin, 405);
        var x = myChart.addTimeAxis("x", "data","%Y-%m-%dT%H","%d/%m");
        x.title = ""

        var y = myChart.addMeasureAxis("y", "valor");
        y.overrideMax = 60.0

        //primeira série, linha com datafolha e ibope apenas
        var series = myChart.addSeries("candidato", dimple.plot.line);
        series.data = ibope_datafolha
        series.lineWeight = 1.8;
        series.interpolation = "cardinal";

        //segunda série, só as bolhas. são duas séries apenas para eu pegar o valor do instituto na tooltip
        var series2 = myChart.addSeries(["candidato","instituto"], dimple.plot.bubble)
        series2.data = data

        //faz uma série nova que será a linha cinza de 50%
        var datas = dimple.getUniqueValues(data,"data")
        var s3 = myChart.addSeries("metade", dimple.plot.line);

        var primeira_data = datas[0]
        var ultima_data = datas[datas.length-1]

        s3.data = [
            { "metade" : "metade", "valor" : 50, "data" : primeira_data },
            { "metade" : "metade", "valor" : 50, "data" :  ultima_data}];

        var s4 = myChart.addSeries("segturno", dimple.plot.line);
            s4.data = [
                { "segturno": "segturno", "valor": 0, "data": "2014-10-06T00"},
                { "segturno": "segturno", "valor": 100, "data": "2014-10-06T01"}
            ];



        myChart.assignColor("Dilma Rousseff","#CC0000");
        myChart.assignColor("Aécio Neves","#1C4587");
        myChart.assignColor("Aécio Neves2","#1C4587");
        myChart.assignColor("Dilma Rousseff2","#CC0000");

        //arruma ordem da legenda
        var legenda = myChart.addLegend(25, 8, width, 20, "left");
        legenda._getEntries = function () {
           return arruma_legenda(myChart,"turno_aecio")
        }

        myChart.draw();

        //translada labels do eixo x
        x.shapes.selectAll("text").attr("transform",
            function (d) {
              return d3.select(this).attr("transform") + " translate(0, 15) rotate(-60)";
            });

        //muda tamanho do texto
        jQuery("#turno_aecio").find("text").css({"font-size":"12px"})

        window.grafico_turno_aecio = myChart

        myChart = arruma_tooltip(myChart,"todos")

        //arruma a barra de 50%
        arruma_50()
     });
}


function arruma_50() {
    //jQuery("circle[id*='metade']").remove()
    jQuery("circle[id*='segturno']").remove()
    jQuery("circle[id*='metade']").remove()

    jQuery("path[id*='metade']")
        .css({
            "stroke": "#000000",
            "stroke-dasharray":"5.5",
            "stroke-width":"2",
            "stroke-opacity":"0.5"
        })
        .attr("stroke","#000000")
        .attr("opacity","#0.5")

    d3.select("path[id*='metade']")
        .on("mouseover",function(d){
            div_turno.transition()
                .duration(0)
                .style("opacity", 1)
            div_turno.html("Metade dos votos válidos; acima disso, significa vitória")
                .style("left", (d3.event.pageX - 10) + "px")
                .style("top", (d3.event.pageY - 28) + "px")})
        .on("mouseout", function(d) {
            div_turno.transition()
            .duration(1500)
            .style("opacity", 0);
        });

    jQuery("path[id*='segturno']")
        .css({
            "stroke": "#000000",
            "stroke-dasharray":"5.5",
            "stroke-width":"2",
            "stroke-opacity":"0.5"
        })
        .attr("stroke","#000000")
        .attr("opacity","#0.5")

    d3.select("path[id*='segturno']")
        .on("mouseover",function(d){
            div_turno.transition()
                .duration(0)
                .style("opacity", 1)
            div_turno.html("Linha que separa primeiro e segundo turno.")
                .style("left", (d3.event.pageX - 10) + "px")
                .style("top", (d3.event.pageY - 28) + "px")})
        .on("mouseout", function(d) {
            div_turno.transition()
            .duration(1500)
            .style("opacity", 0);
        });

}

function muda_todos(recorte) {
    var myChart = window.grafico_todos
    if (myChart != null) {
        var data = window.data_todos
        data = dimple.filterData(data,"voto",recorte)
        var ibope_datafolha = dimple.filterData(data,"instituto",["Ibope","Datafolha"])

        var legenda = myChart.legends
        legenda_getEntries = function () {
           return arruma_legenda(myChart,recorte)
        }

        myChart.series[0].data = ibope_datafolha
        myChart.series[1].data = data

        myChart = arruma_tooltip(myChart,"todos")

        //arruma linha de 50% para começar lá no início
        var datas = dimple.getUniqueValues(data,"data")
        var primeira_data = datas[0]
        var ultima_data = datas[datas.length-1]

        if (recorte == "valido") {
            myChart.series[2].data = [
                { "metade" : "metade", "valor" : 50, "data" : primeira_data },
                { "metade" : "metade", "valor" : 50, "data" :  ultima_data}];
        } else {
            //soma a linha se for votos totais
            myChart.series[2].data = [
                { "metade" : "metade", "valor" : 0, "data" : primeira_data },
                { "metade" : "metade", "valor" : 0, "data" :  primeira_data}];
        }


        myChart.draw(500)
        //muda tamanho do texto
        jQuery("#todos_institutos").find("text").css({"font-size":"12px"})

    //    setTimeout(function () { bolinhas_preto();    }, 500);

        window.grafico_todos = myChart

        arruma_50();
    }
}

function muda_media(recorte) {
    var myChart = window.grafico_media
    if (myChart != null) {

        var data = window.data_media
        data = dimple.filterData(data,"voto",recorte)

        myChart.data = data

        var legenda = myChart.legends
        legenda_getEntries = function () {
           return arruma_legenda(myChart,recorte)
        }

        myChart = arruma_tooltip(myChart,"media")

        //arruma linha de 50% para começar lá no início
        var datas = dimple.getUniqueValues(data,"data")
        var primeira_data = datas[0]
        var ultima_data = datas[datas.length-1]

        if (recorte == "valido") {
            myChart.series[1].data = [
                { "metade" : "metade", "valor" : 50, "data" : primeira_data },
                { "metade" : "metade", "valor" : 50, "data" :  ultima_data}];
        } else {
            //soma a linha se for votos totais
            myChart.series[1].data = [
                { "metade" : "metade", "valor" : 0, "data" : primeira_data },
                { "metade" : "metade", "valor" : 0, "data" :  primeira_data}];
        }

        myChart.draw(500)
        //muda tamanho do texto
        jQuery("#media_edados").find("text").css({"font-size":"12px"})

    //    setTimeout(function () { bolinhas_preto();    }, 500);

        window.grafico_media = myChart

        arruma_50();
    }
}

function muda_turno(recorte) {
    var myChart = window.grafico_turno
    if (myChart != null) {
        var data = window.data_turno
        data = dimple.filterData(data,"voto",recorte)
        var ibope_datafolha = dimple.filterData(data,"instituto",["Ibope","Datafolha"])

        var legenda = myChart.legends
        legenda_getEntries = function () {
           return arruma_legenda(myChart,"turno")
        }

        myChart.series[0].data = ibope_datafolha
        myChart.series[1].data = data

        //arruma linha de 50% para começar lá no início
        var datas = dimple.getUniqueValues(data,"data")
        var primeira_data = datas[0]
        var ultima_data = datas[datas.length-1]

        if (recorte == "valido") {
            myChart.series[2].data = [
                { "metade" : "metade", "valor" : 50, "data" : primeira_data },
                { "metade" : "metade", "valor" : 50, "data" :  ultima_data}];
        } else {
            //soma a linha se for votos totais
            myChart.series[2].data = [
                { "metade" : "metade", "valor" : 0, "data" : primeira_data },
                { "metade" : "metade", "valor" : 0, "data" :  primeira_data}];
        }
        myChart = arruma_tooltip(myChart,"todos")
        myChart.draw(500)
        //muda tamanho do texto
        jQuery("#turno").find("text").css({"font-size":"12px"})

    //    setTimeout(function () { bolinhas_preto();    }, 500);

        window.grafico_turno = myChart

        arruma_50();
    }
}

function muda_turno_aecio(recorte) {
    var myChart = window.grafico_turno_aecio
    if (myChart != null) {
        var data = window.data_turno_aecio
        data = dimple.filterData(data,"voto",recorte)
        var ibope_datafolha = dimple.filterData(data,"instituto",["Ibope","Datafolha"])

        var legenda = myChart.legends
        legenda_getEntries = function () {
           return arruma_legenda(myChart,"turno_aecio")
        }

        myChart.series[0].data = ibope_datafolha
        myChart.series[1].data = data

        //arruma linha de 50% para começar lá no início
        var datas = dimple.getUniqueValues(data,"data")
        var primeira_data = datas[0]
        var ultima_data = datas[datas.length-1]

        if (recorte == "valido") {
            myChart.series[2].data = [
                { "metade" : "metade", "valor" : 50, "data" : primeira_data },
                { "metade" : "metade", "valor" : 50, "data" :  ultima_data}];
        } else {
            //soma a linha se for votos totais
            myChart.series[2].data = [
                { "metade" : "metade", "valor" : 0, "data" : primeira_data },
                { "metade" : "metade", "valor" : 0, "data" :  primeira_data}];
        }
        myChart = arruma_tooltip(myChart,"todos")
        myChart.draw(500)
        //muda tamanho do texto
        jQuery("#turno_aecio").find("text").css({"font-size":"12px"})

    //    setTimeout(function () { bolinhas_preto();    }, 500);

        window.grafico_turno_aecio = myChart

        arruma_50();
    }
}


function arruma_tooltip(chart,qual_dos_dois) {
    for (s in chart.series) {
        chart.series[s].getTooltipText = function (e) {
            //pega a data e transforma em string no formato em que os dados estão
            var data = e.xField[0]
            var month = (1 + data.getMonth()).toString();
            month = month.length > 1 ? month : '0' + month;
            var day = data.getDate().toString();
            day = day.length > 1 ? day : '0' + day;

            //se for o gráfico de todos
            if (qual_dos_dois == "todos") {
                //acha o instituto se ele houver, usando a série do Dimple
               var instituto = e.key.split("/")[1].split("_")[0]
               //checa se é 2o turno - e, se for, tira o 2 do final do nome do cabra
               var nome = e.aggField[0]
               if (nome.slice(-1) == "2") { nome = nome.substring(0, nome.length - 1);}
                return [
                nome+": "+e.cy,
                "Data: "+day+"/"+month,
                "Instituto: "+instituto
                ];
            } else { //se for só o da média estadão dados
                return [
                e.aggField[0]+": "+e.cy,
                "Data: "+day+"/"+month,
                ];
            }

        };
    }
    return chart;
}

function arruma_legenda(grafico, recorte) {
    cores = {
        "Aécio":"#1C4587",
        "Dilma":"#CC0000",
        "Eduardo":"#E69138",
        "Marina":"#E69138"
    }

    var orderedValues = []
    if (recorte == "total")
        orderedValues = ["Dilma", "Aécio", "Marina", "Eduardo"];
    else if (recorte == "turno")
        orderedValues = ["Dilma", "Marina"];
    else if (recorte == "turno_aecio")
        orderedValues = ["Dilma", "Aécio"];
    else
        orderedValues = ["Dilma", "Aécio", "Marina"];

    var entries = [];
    orderedValues.forEach(function (v) {
        entries.push(
        {
                key: v,
                fill: cores[v],
                stroke: cores[v],
                opacity: grafico.getColor(v).opacity,
                series: grafico.series[0],
                aggField: [v]
            }
        );
    }, this);
    return entries

}


function mudaVotoMedia(el) {
    window.media = el.value;
    jQuery(el).prop('checked',true);
    jQuery('input[name="seletor-media"][value!="' + window.media + '"]').prop('checked', false);
    muda_media(window.media)
}

function mudaVotoTodos(el) {
    window.todos = el.value;
    jQuery(el).prop('checked',true);
    jQuery('input[name="seletor-todos"][value!="' + window.todos + '"]').prop('checked', false);
    muda_todos(window.todos)
}

function mudaVotoTurno(el) {
    window.turno = el.value;
    jQuery(el).prop('checked',true);
    jQuery('input[name="seletor-turno"][value!="' + window.turno + '"]').prop('checked', false);
    muda_turno(window.turno)
}

function mudaVotoTurnoAecio(el) {
    window.turno_aecio = el.value;
    jQuery(el).prop('checked',true);
    jQuery('input[name="seletor-turno_aecio"][value!="' + window.turno_aecio + '"]').prop('checked', false);
    muda_turno_aecio(window.turno_aecio)
}

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[#&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = decodeURIComponent(value);
    });
    return vars;
}
