//valores default
window.media = "valido"
window.todos = "valido"
window.turno = "valido"
window.grafico_media = null
window.grafico_todos = null
window.grafico_turno = null
window.data_media = null
window.data_todos = null
window.data_turno = null

width = $(window).width()*0.9
margin = 100

//div para linha de 50%
var div_turno = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

function desenha_pesquisas() {
    intencao_voto();
    media_edados();
    segundo_turno();
}

function intencao_voto() {
    var svg = dimple.newSvg("#todos_institutos", width, 500);
      d3.csv("dados/todos_institutos.csv", function (data) {
        window.data_todos = data
        //filtra votos totais ou validos
        recorte = window.todos   
        var myChart = new dimple.chart(svg, data);
        myChart = arruma_tooltip(myChart,"todos")
        

        data = dimple.filterData(data,"voto",recorte)
        ibope_datafolha = dimple.filterData(data,"instituto",["Ibope","Datafolha"])
        
        myChart.setBounds(60, 30, width-margin, 405);
        var x = myChart.addTimeAxis("x", "data","%Y-%m-%dT%H","%d/%m");
        x.title = ""

        y = myChart.addMeasureAxis("y", "valor");
        y.overrideMax = 50.0
        
        //primeira série, linha com datafolha e ibope apenas
        series = myChart.addSeries("candidato", dimple.plot.line);
        series.data = ibope_datafolha
        series.lineWeight = 1.8;
        series.interpolation = "cardinal";
                
        //segunda série, só as bolhas. são duas séries apenas para eu pegar o valor do instituto na tooltip
        series2 = myChart.addSeries(["candidato","instituto"], dimple.plot.bubble)
        series2.data = data

        myChart.assignColor("Aécio Neves","#1C4587");
        myChart.assignColor("Dilma Rousseff","#CC0000");
        myChart.assignColor("Eduardo Campos","#E69138");
        myChart.assignColor("Marina Silva","#E69138");
        myChart.assignColor("Outros","#2E2B2D");

        //faz uma série nova que será a linha cinza de 50%
        datas = dimple.getUniqueValues(data,"data")
        var s3 = myChart.addSeries("metade", dimple.plot.line);
        
        primeira_data = datas[0]
        ultima_data = datas[datas.length-1]

        s3.data = [
            { "metade" : "metade", "valor" : 50, "data" : primeira_data }, 
            { "metade" : "metade", "valor" : 50, "data" :  ultima_data}];

        //arruma ordem da legenda
        legenda = myChart.addLegend(70, 8, width, 20, "left");
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
        $("text[class*='dimple-eduardo-campos']").text("Ed. Campos")
        $("text[class*='dimple-pastor-everaldo']").text("P. Everaldo")
        
     });
}
/*
function bolinhas_preto() {
    data = window.data_todos
    //muda bolinhas pra preto
    jQuery("#todos_institutos").find("circle").each(function (){
        //aumenta o raio
        $(this).attr("r","6")
                .css({"stroke-width":"2px"})
        
        //agora muda as cores
        var date = new Date(this.id.split("_")[1])
        var month = (1 + date.getMonth()).toString();
        month = month.length > 1 ? month : '0' + month;
        var day = date.getDate().toString();
        day = day.length > 1 ? day : '0' + day;
        data_string = "2014-" + month + "-" + day

        var bola = data.filter(function (a) { return a["data"] == data_string})[0]
        if (bola){
            instituto = bola["instituto"]
            var candidato = this.id.split("_")[0]

            if (["Ibope","Datafolha"].indexOf(instituto) > -1) {
                if (candidato == "Dilma Rousseff") {
                    jQuery(this).attr("fill","#CC0000")
                } else if (candidato == "Aécio Neves") {
                    jQuery(this).attr("fill","#1C4587")
                } else if (candidato == "Eduardo Campos" || candidato == "Marina Silva") {
                    jQuery(this).attr("fill","#E69138")
                } else if (candidato == "Pastor Everaldo") {
                    jQuery(this).attr("fill","#6AA84F")
                } else {
                    jQuery(this).attr("fill","#2E2B2D")
                }
            }
            
        }
    })
}*/

function segundo_turno() {
    var svg = dimple.newSvg("#turno", width, 500);
      d3.csv("dados/segundo_turno.csv", function (data) {
        window.data_turno = data
        //filtra votos totais ou validos
        recorte = window.turno   
        var myChart = new dimple.chart(svg, data);
        myChart = arruma_tooltip(myChart,"todos")        

        data = dimple.filterData(data,"voto",recorte)
        ibope_datafolha = dimple.filterData(data,"instituto",["Ibope","Datafolha"])
        
        myChart.setBounds(60, 30, width-margin, 405);
        var x = myChart.addTimeAxis("x", "data","%Y-%m-%dT%H","%d/%m");
        x.title = ""

        y = myChart.addMeasureAxis("y", "valor");
        y.overrideMax = 60.0
        
        //primeira série, linha com datafolha e ibope apenas
        series = myChart.addSeries("candidato", dimple.plot.line);
        series.data = ibope_datafolha
        series.lineWeight = 1.8;
        series.interpolation = "cardinal";
                
        //segunda série, só as bolhas. são duas séries apenas para eu pegar o valor do instituto na tooltip
        series2 = myChart.addSeries(["candidato","instituto"], dimple.plot.bubble)
        series2.data = data

        //faz uma série nova que será a linha cinza de 50%
        datas = dimple.getUniqueValues(data,"data")
        var s3 = myChart.addSeries("metade", dimple.plot.line);
        
        primeira_data = datas[0]
        ultima_data = datas[datas.length-1]

        s3.data = [
            { "metade" : "metade", "valor" : 50, "data" : primeira_data }, 
            { "metade" : "metade", "valor" : 50, "data" :  ultima_data}];
        
        
        myChart.assignColor("Dilma Rousseff","#CC0000");
        myChart.assignColor("Marina Silva","#E69138");

        //arruma ordem da legenda
        legenda = myChart.addLegend(70, 8, width, 20, "left");
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

function arruma_50() {
    $("circle[id*='metade']").remove()
    
    $("path[id*='metade']")
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
}
function muda_todos(recorte) {
    myChart = window.grafico_todos
    data = window.data_todos
    data = dimple.filterData(data,"voto",recorte)
    ibope_datafolha = dimple.filterData(data,"instituto",["Ibope","Datafolha"])
    
    legenda = myChart.legends
    legenda_getEntries = function () {
       return arruma_legenda(myChart,recorte)
    }
    
    myChart.series[0].data = ibope_datafolha
    myChart.series[1].data = data
    
    myChart = arruma_tooltip(myChart,"todos")
    
    if (recorte == "valido") {
        //arruma linha de 50% para começar lá no início
        datas = dimple.getUniqueValues(data,"data")
        primeira_data = datas[0]
        ultima_data = datas[datas.length-1]
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

function muda_turno(recorte) {
    myChart = window.grafico_turno
    data = window.data_turno
    data = dimple.filterData(data,"voto",recorte)
    ibope_datafolha = dimple.filterData(data,"instituto",["Ibope","Datafolha"])
    
    legenda = myChart.legends
    legenda_getEntries = function () {
       return arruma_legenda(myChart,"turno")
    }
    
    myChart.series[0].data = ibope_datafolha
    myChart.series[1].data = data
    
    if (recorte == "valido") {
        //arruma linha de 50% para começar lá no início
        datas = dimple.getUniqueValues(data,"data")
        primeira_data = datas[0]
        ultima_data = datas[datas.length-1]
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



function muda_media(recorte) {
    myChart = window.grafico_media
    data = window.data_media
    data = dimple.filterData(data,"voto",recorte)
    
    myChart.data = data
    
    legenda = myChart.legends
    legenda_getEntries = function () {
       return arruma_legenda(myChart,recorte)
    }
    
    myChart = arruma_tooltip(myChart,"media")

    if (recorte == "valido") {
        //arruma linha de 50% para começar lá no início
        datas = dimple.getUniqueValues(data,"data")
        primeira_data = datas[0]
        ultima_data = datas[datas.length-1]
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

function media_edados() {
    var svg = dimple.newSvg("#media_edados", width, 500);
      d3.csv("dados/media_edados.csv", function (data) {
        window.data_media = data
        //filtra votos totais ou validos
        recorte = window.media
        
        
        data = dimple.filterData(data,"voto",recorte)
        var myChart = new dimple.chart(svg, data);        
        myChart.setBounds(60, 30, width-margin, 405);
        var x = myChart.addTimeAxis("x", "data","%Y-%m-%dT%H","%d/%m");
        x.title = ""

        y = myChart.addMeasureAxis("y", "valor");
        y.overrideMax = 50.0

        series = myChart.addSeries("candidato", dimple.plot.line);
        series.lineWeight = 2;

        //faz uma série nova que será a linha cinza de 50%
        datas = dimple.getUniqueValues(data,"data")
        var s3 = myChart.addSeries("metade", dimple.plot.line);
        
        primeira_data = datas[0]
        ultima_data = datas[datas.length-1]

        s3.data = [
            { "metade" : "metade", "valor" : 50, "data" : primeira_data }, 
            { "metade" : "metade", "valor" : 50, "data" :  ultima_data}];

        myChart.assignColor("Aécio Neves","#1C4587");
        myChart.assignColor("Dilma Rousseff","#CC0000");
        myChart.assignColor("Eduardo Campos","#E69138");
        myChart.assignColor("Marina Silva","#E69138");
        myChart.assignColor("Outros","#2E2B2D");

        myChart = arruma_tooltip(myChart,"media")

        //arruma ordem da legenda
        legenda = myChart.addLegend(70, 8, width, 30, "left");
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
        $("text[class*='dimple-eduardo-campos']").text("Ed. Campos")
        $("text[class*='dimple-pastor-everaldo']").text("P. Everaldo")

        window.grafico_media = myChart

        //arruma a barra de 50%
        arruma_50()
      });


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
                
                return [
                e.aggField[0]+": "+e.cy,
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
    if (recorte == "total")
        orderedValues = ["Dilma Rousseff", "Aécio Neves", "Marina Silva", "Eduardo Campos","Outros"];
    else if (recorte == "turno")
        orderedValues = ["Dilma Rousseff", "Marina Silva"];
    else 
        orderedValues = ["Dilma Rousseff", "Aécio Neves", "Marina Silva", "Outros"];

    var entries = [];
    orderedValues.forEach(function (v) {
        entries.push(
        {
                key: v,
                fill: grafico.getColor(v).fill,
                stroke: grafico.getColor(v).stroke,
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


