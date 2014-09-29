//valores default
window.media = "valido"
window.todos = "valido"
window.turno = null
window.grafico_media = null
window.grafico_todos = null
window.grafico_turno = null
window.data_media = null
window.data_todos = null
window.data_turno = null

width = $(window).width()*0.9
margin = 100

function desenha_pesquisas() {
    intencao_voto();
    media_edados();
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
        outros =  dimple.filterData(data,"instituto",["Vox Populi","MDA","Sensus"])
        
        myChart.setBounds(60, 30, width-margin, 405);
        var x = myChart.addTimeAxis("x", "data","%Y-%m-%d","%d/%m");
        x.title = ""

        myChart.addMeasureAxis("y", "valor");

        //primeira série, linha com datafolha e ibope apenas
        series = myChart.addSeries("candidato", dimple.plot.line);
        series.data = ibope_datafolha
        series.lineMarkers = true;
        series.lineWeight = 1.8;
        series.interpolation = "cardinal";
                
        //segunda série, bolhas com outros institutos
        series2 = myChart.addSeries("candidato", dimple.plot.bubble)
        series2.data = outros        

        myChart.assignColor("Aécio Neves","#1C4587");
        myChart.assignColor("Dilma Rousseff","#CC0000");
        myChart.assignColor("Eduardo Campos","#E69138");
        myChart.assignColor("Marina Silva","#E69138");
        myChart.assignColor("Outros","#2E2B2D");


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

function muda_todos(recorte) {
    myChart = window.grafico_todos
    data = window.data_todos
    data = dimple.filterData(data,"voto",recorte)
    ibope_datafolha = dimple.filterData(data,"instituto",["Ibope","Datafolha"])
    outros =  dimple.filterData(data,"instituto",["Vox Populi","MDA","Sensus"])
    
    legenda = myChart.legends
    legenda_getEntries = function () {
       return arruma_legenda(myChart,recorte)
    }
    
    myChart.series[0].data = ibope_datafolha
    myChart.series[1].data = outros
    
    myChart = arruma_tooltip(myChart,"todos")
    
    myChart.draw(500)
    //muda tamanho do texto
    jQuery("#todos_institutos").find("text").css({"font-size":"12px"})

//    setTimeout(function () { bolinhas_preto();    }, 500);

    window.grafico_todos = myChart

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
    
    myChart.draw(500)
    //muda tamanho do texto
    jQuery("#media_edados").find("text").css({"font-size":"12px"})

//    setTimeout(function () { bolinhas_preto();    }, 500);

    window.grafico_media = myChart
    
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
        var x = myChart.addTimeAxis("x", "data","%Y-%m-%d","%d/%m");
        x.title = ""

        myChart.addMeasureAxis("y", "valor");

        series = myChart.addSeries("candidato", dimple.plot.line);
        series.lineWeight = 2;

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
            data_string = "2014-" + month + "-" + day

            //se for o gráfico com mais de um instituto
            if (qual_dos_dois == "todos") {

                //pega o nome do instituto a partir dos dados originais do gráfico
                var instituto = chart.data.filter(function (a) { return a["data"] == data_string})[0]["instituto"]

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
