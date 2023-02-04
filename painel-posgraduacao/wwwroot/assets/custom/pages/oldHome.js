window.ChartPortletSales = null;
// ReSharper disable once NativeTypePrototypeExtending
Number.prototype.toBRLCurrency = function () {
    return this.toLocaleString('pt-BR', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
};

// ReSharper disable once NativeTypePrototypeExtending
Number.prototype.toBRLCurrencyString = function () {
    return "R$ ".concat(this.toBRLCurrency());
};
 
var Dashboard = function () {
    var portletBlockConfig = { opacity: 0.1 },
        localStorageKey = '70a17ffa722a3985b86d30b034ad06d7',
        pieChart,
        barChart,
        lineChart,
        morrisChart,
        lineChartActivity;    

    
   
    var unixToMoment = function (date) {
        return moment(
            new Date(Number(date.replace(/[^\d]+/g, '')))
        );
    }; 
    
    var datePickerLocale = {
        "format": "DD/MM/YYYY",
        "separator": " - ",
        "applyLabel": "Aplicar",
        "cancelLabel": "Cancelar",
        "fromLabel": "De",
        "toLabel": "Até",
        "customRangeLabel": "Customizado",
        "weekLabel": "S",
        "daysOfWeek": [
            "Do",
            "Se",
            "Te",
            "Qua",
            "Qui",
            "Se",
            "Sa"
        ],
        "monthNames": [
            "Janeiro",
            "Fevereiro",
            "Março",
            "Abril",
            "Maio",
            "Junho",
            "Julho",
            "Agosto",
            "Setembro",
            "Outubro",
            "Novembro",
            "Dezembro"
        ],
        "firstDay": 1
    };

    var $year = $("#year_resume_input").val();

    return {   
        getDatePeriod(startDate, finalDate, format) {
            format = format || 'DD/MM';
            startDate = moment(startDate).startOf('day');
            finalDate = moment(finalDate).startOf('day');
            
            if (startDate.isSame(finalDate)) {
                return `(${startDate.format(format)})`;
            } else {
                return `(${startDate.format(format)} - ${finalDate.format(format)})`;
            }
        },

        barChartInit() {
            var $element = $("#m_chart_hours_sales");

            if ($element.length === 0) {
                return;
            }

            var data = {
                labels: new Array(24).fill(undefined).map((_, index) => `${index} hrs`),
                datasets: [
                    {
                        backgroundColor: mApp.getColor("success"),
                        data: []
                    }
                ]
            };

            barChart = new Chart($element,
            {               
                type: "bar",
                data: data,
                options: {
                    title: {
                        display: false
                    },
                    tooltips: {
                        intersect: false,
                        mode: "nearest",
                        xPadding: 10,
                        yPadding: 10,
                        caretPadding: 10
                    },
                    legend: {
                        display: false
                    },
                    responsive: true,
                    scaleBeginAtZero: false,
                    maintainAspectRatio: false,
                    barRadius: 4,
                    scales: {
                        xAxes: [
                            {
                                display: false,
                                gridLines: false,
                                stacked: true
                            }
                        ],
                        yAxes: [
                            {
                                display: false,
                                stacked: true,
                                gridLines: false
                            }
                        ]
                    },
                    layout: {
                        padding: {
                            left: 0,
                            right: 0,
                            top: 0,
                            bottom: 0
                        }
                    }
                }
            });
        },
        
        morrisChartInit(totalChamados, comAtraso,emDia) {
            if ($("#m_morris_4").length === 0) {
                return;
            }

            $("#m_morris_4").empty();
            $('#salesDescriptions').empty();
            
            morrisChart = Morris.Donut({
                element: "m_morris_4",
                data: [{
                    label: "Atrasados",
                    value: comAtraso
                },
                {
                    label: "Em dia",
                    value: emDia
                }],
                colors: ["#F4516C", "#716ACA"],
                formatter: function (value) {
                    if (totalChamados > 0) {
                        return Math.floor(value / totalChamados * 100) + '%';
                    } else {
                        return value + '%';
                    }                  
                }
            });

            morrisChart.options.data.forEach(function (label, i) {
                var legendItem = "";
                if (label['label'] == "Atrasados") {

                    legendItem = $('<span></span>').text(label['label'] + " + de 2 dias úteis (" + label['value'] + ")").prepend('<br><span>&nbsp;</span>');
                } else {
                    legendItem = $('<span></span>').text(label['label'] + " (" + label['value'] + ")").prepend('<br><span>&nbsp;</span>');
                }
                legendItem.find('span')
                    .css('backgroundColor', morrisChart.options.colors[i])
                    .css('width', '20px')
                    .css('display', 'inline-block')
                    .css('margin', '5px');
                $('#salesDescriptions').append(legendItem)
            });      
            
        },

        lineChartInit() {

            if ($('#m_chart_trends_stats').length == 0) {
                return;
            }

            var ctx = document.getElementById("m_chart_trends_stats").getContext("2d");

            var gradient = ctx.createLinearGradient(0, 0, 0, 100);
            gradient.addColorStop(0, Chart.helpers.color('#00c5dc').alpha(0.7).rgbString());
            gradient.addColorStop(1, Chart.helpers.color('#f2feff').alpha(0).rgbString());


            var config = {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [
                        {
                            label: "Valor",
                            borderColor: mApp.getColor('brand'),
                            borderWidth: 2,
                            pointBackgroundColor: mApp.getColor('brand'),
                            backgroundColor: mApp.getColor('accent'),
                            pointHoverBackgroundColor: mApp.getColor('danger'),
                            pointHoverBorderColor: Chart.helpers.color(mApp.getColor('danger')).alpha(0.2).rgbString(),

                            data: []
                        }
                    ]
                },
                options: {
                    title: {
                        display: false,
                    },
                    tooltips: {
                        intersect: false,
                        mode: 'nearest',
                        xPadding: 15,
                        yPadding: 15,
                        caretPadding: 10,
                        callbacks: {
                            label: function (item) {
                                return Number(item.yLabel).toBRLCurrencyString();
                            }
                        }
                    },
                    legend: {
                        display: false,
                        labels: {
                            usePointStyle: false
                        }
                    },
                    responsive: true,
                    maintainAspectRatio: false,
                    hover: {
                        mode: 'index'
                    },
                    scales: {
                        xAxes: [
                            {
                                display: false,
                                gridLines: false,
                                scaleLabel: {
                                    display: true,
                                    labelString: 'Mês'
                                }
                            }
                        ],
                        yAxes: [
                            {
                                display: false,
                                gridLines: false,
                                scaleLabel: {
                                    display: true,
                                    labelString: 'Valor'
                                }
                            }
                        ]
                    },
                    elements: {
                        point: {
                            radius: 3,
                            borderWidth: 0,

                            hoverRadius: 8,
                            hoverBorderWidth: 2
                        }
                    },
                    layout: {
                        padding: {
                            left: 5,
                            right: 5,
                            top: 5,
                            bottom: 0
                        }
                    }
                }
            };

            lineChart = new Chart(ctx, config);
            
        },

		VendasStatus(status_id) {
			$.ajax({
				type: 'GET',
				url: '/AjaxIndicator/resumostatus',
				data: { status_id: status_id },
				beforeSend: function () {
					mApp.block("#tabela_vendas_status", { overlayColor: "#000000", type: "loader", state: "success", message: "Carregando..." });
				},
				success: function (dataValores) {
					setTimeout(function () { mApp.unblock("#tabela_vendas_status"); }, 500);

					if (dataValores.sucesso) {
						$("#ValorHoje").text("R$ " + dataValores.valor_hoje);
						$("#ValorOntem").text("R$ " + dataValores.valor_ontem);
						$("#ValorMesAtual").text("R$ " + dataValores.mes_atual);
						$("#ValorMesAnterior").text("R$ " + dataValores.mes_anterior);
						$("#QuantidadeHoje").text(dataValores.quantidade_hoje);
						$("#QuantidadeOntem").text(dataValores.quantidade_ontem);
						$("#QuantidadeMesAtual").text(dataValores.quantidade_mes_atual);
						$("#QuantidadeMesAnterior").text(dataValores.quantidade_mes_anterior);
					} else {
						swal("Falha ao carregar relatório!", "Tente novamente mais tarde.", "error");
					}
				},
				error: function () {
					mApp.unblock("#tabela_vendas_status");
					swal("Falha ao carregar relatório!", "Tente novamente mais tarde.", "error");
				}
			});
        },

        initActivity(de, ate) {
           
           	var box = $("#PortletActivity");

			if (box.length > 0) {
				mApp.block("#PortletActivity", { overlayColor: "#000000", type: "loader", state: "success", message: "Carregando, aguarde..." });

                $.ajax({
                    type: 'GET',
                    url: '/AjaxIndicator/Activity',
                    data: { de: de, ate: ate },
                    success: function (data) {
                        mApp.unblock("#PortletActivity");

                        box.html(data);

                        $(".navegacao-status .nav-link.active").click();

                        //if ($("#m_chart_activities").length > 0) {
                        //	var e = document.getElementById("m_chart_activities").getContext("2d"), t = e.createLinearGradient(0, 0, 0, 240);

                        //	t.addColorStop(0, Chart.helpers.color("#e14c86").alpha(1).rgbString()),
                        //		t.addColorStop(1, Chart.helpers.color("#e14c86").alpha(.3).rgbString());

                        //	var a = { type: "line", data: { labels: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro"], datasets: [{ label: "Sales Stats", backgroundColor: t, borderColor: "#e13a58", pointBackgroundColor: Chart.helpers.color("#000000").alpha(0).rgbString(), pointBorderColor: Chart.helpers.color("#000000").alpha(0).rgbString(), pointHoverBackgroundColor: mApp.getColor("light"), pointHoverBorderColor: Chart.helpers.color("#ffffff").alpha(.1).rgbString(), data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }] }, options: { title: { display: !1 }, tooltips: { mode: "nearest", intersect: !1, position: "nearest", xPadding: 10, yPadding: 10, caretPadding: 10 }, legend: { display: !1 }, responsive: !0, maintainAspectRatio: !1, scales: { xAxes: [{ display: !1, gridLines: !1, scaleLabel: { display: !0, labelString: "Month" } }], yAxes: [{ display: !1, gridLines: !1, scaleLabel: { display: !0, labelString: "Value" }, ticks: { beginAtZero: !0 } }] }, elements: { line: { tension: 1e-7 }, point: { radius: 4, borderWidth: 12 } }, layout: { padding: { left: 0, right: 0, top: 10, bottom: 0 } } } };

                        //	new Chart(e, a);
                        //                  }                       

                        mApp.init();
                    },
                    error: function () {
                        mApp.unblock("#PortletActivity");
                    }
                }).then(function () {
                   
                    $('#m_portlet_sales_resume_title').text(
                        `Vendas ${Dashboard.getDatePeriod(de,ate)}`
                    );
                    $('#title_estatisticas').text(
                        `Estatísticas ${Dashboard.getDatePeriod(de,ate)}`
                    );
                    
                });
            }
            
        },   
        
        dateRangePickerInit() {         
          
            var $picker = $('#m_dashboard_daterangepicker'),
                startDate = moment().startOf("month"),
                endDate = moment().endOf("month");
           
            if ($picker.length === 0) {
                return;
            }

            function callback(start, end, label) {
                var title = '';
                var range = '';

                if ((end - start) < 100) {
                    title = 'Hoje:';
                    range = start.format('MMM D');
                } else if (label === 'Ontem') {
                    title = 'Ontem:';
                    range = start.format('MMM D');
                } else {
                    range = start.format('MMM D') + ' - ' + end.format('MMM D');
                }

                $picker.find('.m-subheader__daterange-date').html(range);
                $picker.find('.m-subheader__daterange-title').html(title);

               // onChange(start.toISOString(), end.toISOString());
            }
         
            $picker.daterangepicker({
                startDate: startDate,
                endDate: endDate,
                opens: 'left',
                ranges: {
                    'Este Mês': [moment().startOf('month'), moment().endOf('month')],
                    'Hoje': [moment(), moment()],
                    'Ontem': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                    'Últimos 7 Dias': [moment().subtract(6, 'days'), moment()],
                    'Últimos 30 Dias': [moment().subtract(29, 'days'), moment()],
                    'Último Mês': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
                },
                locale: datePickerLocale
            }, callback);
          
            callback(startDate, endDate, '');  
        },
       
        dateFromYearMonth(date) {
        
            return moment(date, 'M/YYYY');
        },

        yearSalesResumeChart() {
            var $year = $("#year_resume_input").val();
            var $container = $('#m_annual_resume_portlet');
            mApp.block($container, portletBlockConfig);
            
            $.ajax({
                type: 'GET',
                contentType: 'application/json',
                url: '/AjaxIndicator/GetSalesYearReport',
                data: { ano: $year }
            }).done((data) => {
                var dataFormat = 'MM[/]YYYY';
                if (data.result.Ano) {
                    $('#m_portlet_year_resume_title').text(`Resumo (${data.result.Ano})`);
                }
                if (data.result.DataInicio && data.result.DataFinal) {
                    var dataInicio = unixToMoment(data.result.DataInicio).format(dataFormat),
                        dataFinal = unixToMoment(data.result.DataFinal).format(dataFormat);

                    $('#m_portlet_year_resume_title')
                        .text(`Resumo (${dataInicio} - ${dataFinal})`);
                }

                if (data.result.Resultados && lineChart) {
                    
                    var res = data.result.Resultados.map((item) => {
                        item.MesAno = Dashboard.dateFromYearMonth(item.MesAno);                        
                        return item;
                    });
                    res.sort((o1, o2) => o1.MesAno.diff(o2.MesAno));
                    lineChart.data.labels = res.map((item) => item.MesAno.format(dataFormat));
                    lineChart.data.datasets[0].data = res.map((item) => item.ValorTotal);
                    lineChart.update();
                   
                }
                $("#totalRCA").text(data.result.TotalVendasRCA + ' vendas');
                
                $("#vendasRCA").text(data.result.TotalValorRCA.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
                
                $("#totalTel").text(data.result.TotalVendasOperador + ' vendas');
                
                $("#vendasTel").text(data.result.TotalValorOperador.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
               
                $("#totalNativa").text(data.result.TotalVendasNativa + ' vendas');
               
                $("#vendasNativa").text(data.result.TotalValorNativa.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));

                $("#totalSite").text(data.result.TotalVendasSite + ' vendas');

                $("#vendasSite").text(data.result.TotalValorSite.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
                
            }).fail(() => {
                //toastr.error("Falha ao carregar as vendas do ano!", "Tente novamente mais tarde.");
            }).always(() => {
                mApp.unblock($container);
            })          
        },

        salesByHour(data, inicio, final) {
           

            $('#m-widget14__title').text(
                `Vendas ${Dashboard.getDatePeriod(inicio, final)}`
            );

            var orders = [];
            data.sort((o1, o2) => o1.Hora - o2.Hora);

            for (var hora = 0; hora < 24; hora++) {
                var value = data.find((item) => item.Hora === hora);
                if (value) {
                    orders.push(value.TotalItens);
                } else {
                    orders.push(0);
                }
            }

            if (barChart) {
                barChart.data.datasets[0].data = orders;
                barChart.update();
            }

           
        },

        hourSalesResumeChart(inicio, final) {          
            var $container = $('#m_hours_resume_portlet');
            mApp.block($container, portletBlockConfig);

           
            $.ajax({
                type: 'GET',
                contentType: 'application/json',
                url: '/AjaxIndicator/GetSalesHoursReport',
                data: {
                    de:inicio, ate:final
                }
            }).done((data) => {
                var result = data.result;
                Dashboard.salesByHour(result, inicio, final);          


            }).fail(() => {

                toastr.error('Falha ao carregar as vendas do período!', 'Tente novamente mais tarde.');

            }).always(() => {
                mApp.unblock($container);               
            });

            //$('.modal-orders-report .modal-body table tbody').html("");
        },             

        reportSLA(de, ate) {
            var $container = $('#m_chart_entregas_atrasadas');
            mApp.block($container);
            $.ajax({
                type: 'GET',
                contentType: 'application/json',
                url: '/AjaxIndicator/GetSLAReport',
                data: { de: de, ate: ate }
            }).done((data) => {
                $('#span_title_entrega_atrasada').text(
                    `${Dashboard.getDatePeriod(de, ate)}`
                );
                $('#span_title_cancelados').text(
                    `${Dashboard.getDatePeriod(de, ate)}`
                );
                $('#span_title_entregas').text(
                    `${Dashboard.getDatePeriod(de, ate)}`
                );
                $('#span_title_chamados').text(
                    `${Dashboard.getDatePeriod(de, ate)}`
                );

                result = data.result;           
                
                GaugeInit(result.PorcentagemEntregasAtrasadas); //Grafico das entregas atrasadas
                XYChart3DInit(result.PorcentagemCancelados); //Grafico dos pedidos cancelados
                Dashboard.morrisChartInit(result.TotalChamados, result.ChamadosAtrasados, result.ChamadosEmDia); //Graficos dos chamados

                $('#span_entregues').text(result.PedidosEntregue);

                console.log('Entregas', result.PedidosEntregue, result.EntreguesNoPrazo, result.EntreguesComAtraso)
                var pEntreguesNoPrazo = 0;
                var pEntreguesComAtraso = 0;
                var pEncaminhadoComAtraso = 0;
                if (result.EntreguesNoPrazo > 0)
                    pEntreguesNoPrazo = parseFloat((result.EntreguesNoPrazo / result.PedidosEntregue * 100)).toFixed(2);
                if (result.EntreguesComAtraso > 0)
                    pEntreguesComAtraso = parseFloat((result.EntreguesComAtraso / result.PedidosEntregue * 100)).toFixed(2);
                if (result.EncaminhadosAtrasados > 0) {
                    pEncaminhadoComAtraso = parseFloat((result.EncaminhadosAtrasados / result.TotalEncaminhados * 100)).toFixed(2);
                }


                $('#span_entreguesPrazo').text(result.EntreguesNoPrazo);
                $('#span_pEntreguesPrazo').text(" - " + pEntreguesNoPrazo + "%");
                $('#span_entreguesAtrasado').text(result.EntreguesComAtraso );
                $('#span_pEntreguesAtrasado').text(" - " + pEntreguesComAtraso + "%");
                
                $('#span_encaminhado').text(result.TotalEncaminhados);
                $('#span_encaminhadoAtrasado').text(result.EncaminhadosAtrasados);
                $('#span_pEncaminhadoAtrasado').text(" - " + pEncaminhadoComAtraso + "%");
                
                //id="span_entregues"
            }).fail(() => {
                toastr.error("Falha ao carregar relatório SLA!", "Tente novamente mais tarde.");
            }).always(() => {
                mApp.unblock($container);
            });
        },

        initStatistic(de, ate) {
            var box = $("#PortletStatistic");

            if (box.length > 0) {
                mApp.block("#PortletStatistic", { overlayColor: "#000000", type: "loader", state: "success", message: "Carregando, aguarde..." });

                $.ajax({
                    type: 'GET',
                    url: '/AjaxIndicator/Statistic',
                    data: { de: de,ate:ate },                  
                    success: function (data) {
                        mApp.unblock("#PortletStatistic");
                        box.html(data);

                        $(".navegacao-status .nav-link.active").click();

                        //if ($("#m_chart_activities").length > 0) {
                        //    var e = document.getElementById("m_chart_activities").getContext("2d"), t = e.createLinearGradient(0, 0, 0, 240);

                        //    t.addColorStop(0, Chart.helpers.color("#e14c86").alpha(1).rgbString()),
                        //        t.addColorStop(1, Chart.helpers.color("#e14c86").alpha(.3).rgbString());

                        //    var a = { type: "line", data: { labels: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October"], datasets: [{ label: "Sales Stats", backgroundColor: t, borderColor: "#e13a58", pointBackgroundColor: Chart.helpers.color("#000000").alpha(0).rgbString(), pointBorderColor: Chart.helpers.color("#000000").alpha(0).rgbString(), pointHoverBackgroundColor: mApp.getColor("light"), pointHoverBorderColor: Chart.helpers.color("#ffffff").alpha(.1).rgbString(), data: [10, 14, 12, 16, 9, 11, 13, 9, 13, 15] }] }, options: { title: { display: !1 }, tooltips: { mode: "nearest", intersect: !1, position: "nearest", xPadding: 10, yPadding: 10, caretPadding: 10 }, legend: { display: !1 }, responsive: !0, maintainAspectRatio: !1, scales: { xAxes: [{ display: !1, gridLines: !1, scaleLabel: { display: !0, labelString: "Month" } }], yAxes: [{ display: !1, gridLines: !1, scaleLabel: { display: !0, labelString: "Value" }, ticks: { beginAtZero: !0 } }] }, elements: { line: { tension: 1e-7 }, point: { radius: 4, borderWidth: 12 } }, layout: { padding: { left: 0, right: 0, top: 10, bottom: 0 } } } };

                        //    new Chart(e, a);
                        //}

                        mApp.init();
                    },
                    error: function () {
                        mApp.unblock("#PortletStatistic");
                    }
                }).then(function () {
                   
                    $('#m_portlet_sales_resume_title').text(
                        `Vendas ${Dashboard.getDatePeriod(de, ate)}`
                    );
                    $('#title_estatisticas').text(
                        `Estatísticas ${Dashboard.getDatePeriod(de, ate)}`
                    );
                });
            }
        },        

        init: function () {                   
            Dashboard.lineChartInit();
            Dashboard.barChartInit();          
            Dashboard.initStatistic(Date(moment().startOf('month').format('DD/MM/YYYY HH:mm:ss.SSS')), Date(moment().endOf('month').format('DD/MM/YYYY HH:mm:ss.SSS')));
            Dashboard.dateRangePickerInit();   
            Dashboard.yearSalesResumeChart();
            Dashboard.hourSalesResumeChart(Date(moment().startOf('month').format('DD/MM/YYYY HH:mm:ss.SSS')), Date(moment().endOf('month').format('DD/MM/YYYY HH:mm:ss.SSS')));
            //Dashboard.reportSLA(Date(moment().startOf('month').format('DD/MM/YYYY HH:mm:ss.SSS')), Date(moment().endOf('month').format('DD/MM/YYYY HH:mm:ss.SSS')));
            Dashboard.initActivity(Date(moment().startOf('month').format('DD/MM/YYYY HH:mm:ss.SSS')), Date(moment().endOf('month').format('DD/MM/YYYY HH:mm:ss.SSS')));
            countSolicitacaoCancelamento();
            countNotificacoes();
        },
        initYearSalesResumeChart: function (el, year) {
           
            $("#year_resume_input").val(year);
            $('#m_portlet_year_resume_title').text(`Resumo (` + year +`)`);
            $(el).closest(".m-portlet__nav-item").children("a").text($(el).text());
            Dashboard.yearSalesResumeChart();
            
        },
	};
}();



function GaugeInit(entregasAtrasadas) {
    am4core.ready(function () {
        // Themes begin
        am4core.useTheme(am4themes_animated);
        // Themes end


        // create chart
        var chart = am4core.create("m_chart_entregas_atrasadas", am4charts.GaugeChart);
        chart.innerRadius = -15;

        var axis = chart.xAxes.push(new am4charts.ValueAxis());
        axis.min = 0;
        axis.max = 10;
        axis.strictMinMax = true;
        //axis.renderer.baseGrid.disabled = true;
        axis.renderer.labels.template.adapter.add("text", function (text) {
            
            if (text == "10%") {
                return ">=" + text;
            }
            else {
                return text;
            }
        });
        //axis.title.text = "Entregas Atrasadas (%)";
        //axis.title.align = "left";
        //axis.title.valign = "top";
        //axis.title.fontWeight = "bold";
        axis.numberFormatter = new am4core.NumberFormatter();
        axis.numberFormatter.numberFormat = "#'%'";
        axis.adjustLabelPrecision = false;


        //heatLegend.minColor = am4core.color("#F5DBCB");
        //heatLegend.maxColor = am4core.color("#ED7B84");


        var label = chart.radarContainer.createChild(am4core.Label);
        label.isMeasured = false;
        label.fontSize = 45;
        label.x = am4core.percent(50);
        label.y = am4core.percent(50);
        label.horizontalCenter = "middle";
        label.verticalCenter = "bottom";
        label.text = "0%";
        if (entregasAtrasadas <= 5) {
            label.fill = am4core.color("green");
        } else if (entregasAtrasadas <= 8)
        {
            label.fill = am4core.color("orange");
        } else
        {
            label.fill = am4core.color("red");
        }
        

        //gradient.stops.push({ color: am4core.color("red") })
        //


        // axis.renderer.line.stroke = gradient;
        // axis.renderer.line.strokeWidth = 15;
        // axis.renderer.line.strokeOpacity = 1;

        var gradientGreen = new am4core.LinearGradient();
        gradientGreen.addColor(am4core.color("green"));
        gradientGreen.addColor(am4core.color("yellow"));

        //var range0 = axis.axisRanges.create();
        //range0.category = "0%";
        //range0.endCategory = "3%";
        //range0.axisFill.fillOpacity = 1;
        //range0.axisFill.fill = gradientGreen;
        //range0.axisFill.zIndex = -1;
        //range0.locations.category = 0.5;
        //range0.locations.endCategory = 0.5;
        //range0.label.text = "";
        //range0.grid.disabled = true;

        var range = axis.axisRanges.create();

        range.value = 0;
        range.endValue = 5;
        range.axisFill.fillOpacity = 1;
        range.axisFill.fill = gradientGreen;
        range.axisFill.zIndex = -1;
        range.label.text = ""
        range.contents.stroke = gradientGreen;

        var gradientYellow = new am4core.LinearGradient();
        gradientYellow.addColor(am4core.color("yellow"));
        gradientYellow.addColor(am4core.color("red"));

        
        var range2 = axis.axisRanges.create();
        range2.value = 5;
        range2.endValue = 8;
        range2.axisFill.fillOpacity = 1;
        range2.axisFill.fill = gradientYellow;
        range2.axisFill.zIndex = -1;
        range2.label.text = ""

        var gradientRed = new am4core.LinearGradient(); 
        gradientRed.addColor(am4core.color("red"));

      

        var range3 = axis.axisRanges.create();
        range3.value = 8;
        range3.endValue = 10;       
        range3.axisFill.fillOpacity = 1;
        range3.axisFill.fill = gradientRed;
        range3.axisFill.zIndex = -1;
        range3.contents.stroke = gradientRed;
        range3.label.text = ""


        var legend = new am4charts.Legend();
        legend.parent = chart.chartContainer;

        legend.data = [{
            "name": "Aceitável - até 5%",
            "fill": am4core.color("green")
        }, {
            "name": "Atenção",
            "fill": am4core.color("orange")
        }, {
            "name": "Crítico",
            "fill": am4core.color("red")
        }];
        legend.maxWidth = 30;
        legend.position = "bottom"
        axis.renderer.grid.template.disabled = true;

        var hand = chart.hands.push(new am4charts.ClockHand());
        hand.radius = am4core.percent(97);
        hand.value = entregasAtrasadas == 0? 5 : 0;
        var valorPorcentagem = entregasAtrasadas > 10 ? 10 : entregasAtrasadas;
        //setInterval(() => {
        //    var value = valorPorcentagem;//Math.round(Math.random() * 100);
        //    label.text = entregasAtrasadas + "%";
        //    var animation = new am4core.Animation(hand, {
        //        property: "value",
        //        to: value
        //    }, 2000, am4core.ease.cubicOut).start();
        //}, 3000);

        //setInterval(function () {
        //    var value = valorPorcentagem;//Math.round(Math.random() * 100);           
        //    var animation = new am4core.Animation(hand, {
        //        property: "value",
        //        to: value
        //    }, 1000, am4core.ease.cubicOut).start();
        //}, 2000);

        setInterval(function () {
            var value = valorPorcentagem;
            hand.showValue(value, 1000, am4core.ease.cubicOut);
        }, 2000);

        label.text = entregasAtrasadas + "%";
    }); // end am4core.ready()
}

function XYChart3DInit(cancelados) {
    am4core.ready(function () {

        var color = am4core.color("green");
        
        if (cancelados > 5) {
            color = am4core.color("red");
        }
        // Themes begin
        am4core.useTheme(am4themes_animated);
        // Themes end

        // Create chart instance
        var chart = am4core.create("m_chart_cancelados", am4charts.XYChart3D);

        //chart.titles.create().text = "Pedidos";
      
        // Add data
        chart.data = [{
            "category": "Pedidos Cancelados",
            "value1": cancelados > 10 ? 10 : cancelados,
            "value2": (10 - cancelados)  
            
        }];

        // Create axes
        var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        categoryAxis.dataFields.category = "category";
        categoryAxis.renderer.grid.template.location = 0;
        categoryAxis.renderer.grid.template.strokeOpacity = 0;


       

        var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        valueAxis.renderer.grid.template.strokeOpacity = 0;
        valueAxis.min = 0;
        valueAxis.max = 10;
        valueAxis.strictMinMax = true;
        valueAxis.renderer.baseGrid.disabled = true;
        valueAxis.renderer.labels.template.adapter.add("text", function (text) {
            
            if (text > 9) {
                return ">=" +text + "%";
            }
            else {
                return text + "%";
            }
        });

        //var range = valueAxis.axisRanges.create();
        //range.value = 0;
        //range.endValue = 3.5;
        //range.label.text = "3.5 %";

        //var range2 = valueAxis.axisRanges.create();
        //range2.value = 3.5;
        //range2.endValue = 5;
        //range2.label.text = "5%"

        //var range3 = valueAxis.axisRanges.create();
        //range3.value = 5;
        //range3.endValue = 100;
        //range3.label.text = "100 %"

       // valueAxis.max = 100;
        
        // Create series
        var series1 = chart.series.push(new am4charts.ConeSeries());
        series1.dataFields.valueY = "value1";
        series1.dataFields.categoryX = "category";
        series1.columns.template.width = am4core.percent(30);
        series1.columns.template.fillOpacity = 0.9;
        series1.columns.template.strokeOpacity = 1;
        series1.columns.template.strokeWidth = 2;
        series1.columns.template.fill = color;
        series1.columns.text = "[bold]" + cancelados + "%[/]";
        //series1.tooltipText = "Pedidos Cancelados: " + cancelados + "%";
        //series1.strokeWidth = 2;
        series1.tooltipText = "Cancelados: [bold]" + cancelados + "%[/]";


        
        var valueLabel = series1.bullets.push(new am4charts.LabelBullet());
        valueLabel.label.text = cancelados +"%";
        valueLabel.label.fontSize = 18;
        valueLabel.label.truncate = false;
        valueLabel.label.hideOversized = false;
        //valueLabel.label.fill = am4core.color("yellow");
        //valueLabel.label.dy = -15;
        valueLabel.label.adapter.add("verticalCenter", function (center, target) {
            if (!target.dataItem) {
                return center;
            }
            var values = target.dataItem.values;           
            return values.valueY.value < 8
                ? "bottom"
                : "top";
        });
       
        
        var series2 = chart.series.push(new am4charts.ConeSeries());
        series2.dataFields.valueY = "value2";
        series2.dataFields.categoryX = "category";
        series2.stacked = true;
        series2.columns.template.width = am4core.percent(30);
        series2.columns.template.fill = am4core.color("#000");
        series2.columns.template.fillOpacity = 0.1;
        series2.columns.template.stroke = am4core.color("#000");
        series2.columns.template.strokeOpacity = 0.2;
        series2.columns.template.strokeWidth = 2;

        var gradientGreen = new am4core.LinearGradient();
        gradientGreen.addColor(am4core.color("green"));
        gradientGreen.addColor(am4core.color("yellow"));

        chart.legend = new am4charts.Legend();
        chart.legend.position = "right";
        chart.legend.valign = "top";
        
        chart.legend.data = [{
            "name": "Aceitável - até 5%",
            "fill": am4core.color("green")
        }];
        
    }); // end am4core.ready()
}
        
function SalesMonthResume() {
	$.ajax({
		type: 'POST',
		contentType: "application/json",
		url: '/Ajax/GetSalesStatusMonth',
		success: function (data) {
			if (data.success) {
				var one = parseFloat(data.totalOrders.replace('.', '').replace('.', '').replace(',', '.')).toFixed(2);
				var two = parseFloat(data.numOrders).toFixed(2);
				var medio = one / two;

				if (isNaN(medio))
					medio = 0;

				$('#monthTotal').text("R$ " + data.totalOrders);
				$('#monthFrete').text("R$ " + data.totalFreight);
				$('#monthTicket').text("R$ " + medio.toFixed(2).replace('.', ','));
			}
		},
		error: function () {
			swal("Falha ao carregar as vendas do mês!", "Tente novamente mais tarde.", "error");
		}
	});
}

jQuery(document).ready(function () {
    setTimeout(function () {
       
        Dashboard.lineChartInit();
        Dashboard.barChartInit();        
        Dashboard.dateRangePickerInit();
        Dashboard.yearSalesResumeChart();
        var picker = $('#m_dashboard_daterangepicker').data('daterangepicker');
        Dashboard.initActivity(picker.startDate.toISOString(), picker.endDate.toISOString())
        Dashboard.initStatistic(picker.startDate.toISOString(), picker.endDate.toISOString())
        Dashboard.hourSalesResumeChart(picker.startDate.toISOString(), picker.endDate.toISOString())
        Dashboard.reportSLA(picker.startDate.toISOString(), picker.endDate.toISOString())    
        countSolicitacaoCancelamento();
        countNotificacoes();
    }, 500);
    
    $("body").removeClass("m-brand--minimize").removeClass("m-aside-left--minimize");
    
});

$(document).on("click", '[data-range-key]', function () {
    var picker = $('#m_dashboard_daterangepicker').data('daterangepicker');
    Dashboard.initActivity(picker.startDate.toISOString(), picker.endDate.toISOString())
    Dashboard.initStatistic(picker.startDate.toISOString(), picker.endDate.toISOString())    
    Dashboard.hourSalesResumeChart(picker.startDate.toISOString(), picker.endDate.toISOString())    
    Dashboard.reportSLA(picker.startDate.toISOString(), picker.endDate.toISOString())    
   
});
$(document).on("click", '.applyBtn', function () {
    var picker = $('#m_dashboard_daterangepicker').data('daterangepicker');
    Dashboard.initActivity(picker.startDate.toISOString(), picker.endDate.toISOString())
    Dashboard.initStatistic(picker.startDate.toISOString(), picker.endDate.toISOString())    
    Dashboard.hourSalesResumeChart(picker.startDate.toISOString(), picker.endDate.toISOString())    
    Dashboard.reportSLA(picker.startDate.toISOString(), picker.endDate.toISOString())    
});

$(document).on("change", 'input[name="options-top-10"]', function () {
    var picker = $('#m_dashboard_daterangepicker').data('daterangepicker');

    var $filter = $("input[name='options-top-10']:checked").val();
    if ($filter === "product") {
        $("#contentCategorias").hide();
        $("#contentProdutos").show();      
    }
    else if ($filter === "category") {
        $("#contentProdutos").hide();
        $("#contentCategorias").show();
      
    }
});

$(document).on("click", ".navegacao-status .nav-link", function () {
	Dashboard.VendasStatus($(this).attr("data-status"));
});

$('[data-toggle="m-popover"]').each(function () {

    $(this).popover({
        htm: true,
        skin:'dark',
        delay: {
            hide: 2000
        }
    });
});

function showSlaBySeller() {
    var picker = $('#m_dashboard_daterangepicker').data('daterangepicker'); 
    window.location.href = '/Seller/sellerSLA?de=' + picker.startDate.toISOString() + '&ate=' + picker.endDate.toISOString()
}

function goSlaFull() {
    var picker = $('#m_dashboard_daterangepicker').data('daterangepicker');
    window.location.href = '/Home/SLAs?de=' + picker.startDate.toISOString() + '&ate=' + picker.endDate.toISOString()
}


function RefreshCockPit() {
    $.ajax({
        type: 'POST',
        url: '/Home/RefreshCockPit',
        cache: false,
        success: function (data) {
            if (data.success) {
                changeLastUpdateTitle();
                loadCockPit();   
            } else {
                toastr.error("Falha atualizar CockPit", "Tente novamente mais tarde.");
            }
        },
        error: function () {
            toastr.error("Falha atualizar CockPit", "Tente novamente mais tarde.");
        }
    });
}