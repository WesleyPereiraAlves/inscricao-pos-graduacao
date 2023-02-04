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
        
        weekChartInit() {
            var $element = $("#m_chart_days_sales");

            if ($element.length === 0) {
                return;
            }

            var data = {
                labels: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sabado'],
                datasets: [
                    {
                        backgroundColor: "#0079be",
                        data: []
                    }
                ]
            };

            weekChart = new Chart($element,
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

                        //$(".navegacao-status .nav-link.active").click();

                        //if ($("#m_chart_activities").length > 0) {
                        //	var e = document.getElementById("m_chart_activities").getContext("2d"), t = e.createLinearGradient(0, 0, 0, 240);

                        //	t.addColorStop(0, Chart.helpers.color("#e14c86").alpha(1).rgbString()),
                        //		t.addColorStop(1, Chart.helpers.color("#e14c86").alpha(.3).rgbString());

                        //	var a = { type: "line", data: { labels: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro"], datasets: [{ label: "Sales Stats", backgroundColor: t, borderColor: "#e13a58", pointBackgroundColor: Chart.helpers.color("#000000").alpha(0).rgbString(), pointBorderColor: Chart.helpers.color("#000000").alpha(0).rgbString(), pointHoverBackgroundColor: mApp.getColor("light"), pointHoverBorderColor: Chart.helpers.color("#ffffff").alpha(.1).rgbString(), data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }] }, options: { title: { display: !1 }, tooltips: { mode: "nearest", intersect: !1, position: "nearest", xPadding: 10, yPadding: 10, caretPadding: 10 }, legend: { display: !1 }, responsive: !0, maintainAspectRatio: !1, scales: { xAxes: [{ display: !1, gridLines: !1, scaleLabel: { display: !0, labelString: "Month" } }], yAxes: [{ display: !1, gridLines: !1, scaleLabel: { display: !0, labelString: "Value" }, ticks: { beginAtZero: !0 } }] }, elements: { line: { tension: 1e-7 }, point: { radius: 4, borderWidth: 12 } }, layout: { padding: { left: 0, right: 0, top: 10, bottom: 0 } } } };

                        //	new Chart(e, a);
                        //                  }                       

                        //mApp.init();
                    },
                    error: function () {
                        mApp.unblock("#PortletActivity");
                    }
                }).then(function () {
                   
                    $('#m_portlet_sales_resume_title').text(
                        `Vendas no Período ${Dashboard.getDatePeriod(de,ate)}`
                    );
                    $('#title_estatisticas').text(
                        `Estatísticas ${Dashboard.getDatePeriod(de,ate)}`
                    );
                    
                });
            }
            
        },   
        
        initSalesSummary(de, ate) {

            var box = $("#SalesSummary");

            if (box.length > 0) {
                mApp.block("#SalesSummary", { overlayColor: "#000000", type: "loader", state: "success", message: "Carregando, aguarde..." });
                $.ajax({
                    type: 'GET',
                    url: '/AjaxIndicator/SalesSummary',
                    data: { de: de, ate: ate },
                    success: function (data) {
                        mApp.unblock("#SalesSummary");

                        box.html(data);

                        $(".nav-link.active").click();

                        //mApp.init();
                    },
                    error: function () {
                        mApp.unblock("#SalesSummary");
                    }
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

        yearSalesResumeChart(month) {
            var $year = $("#year_resume_input").val();
            var $container = $('#m_annual_resume_portlet');
            mApp.block($container, portletBlockConfig);
            
            $.ajax({
                type: 'GET',
                contentType: 'application/json',
                url: '/AjaxIndicator/GetSalesYearReport',
                data: { ano: $year, mes: month }
            }).done((data) => {

                am5.disposeAllRootElements();

                if (data.result.Resultados.length > 0) {
                    $("#GraphSalesYear").html("");
                    
                    if (month != undefined) {
                        NewYearSales(data.result.Resultados, "day");
                        $('#m_portlet_year_resume_title').text(`Resumo (` + ("0" + month).slice(-2) + "/" + $year.slice(-2) + `)`);
                    }
                    else {
                        NewYearSales(data.result.Resultados, "month");
                        $('#m_portlet_year_resume_title').text('Resumo (' + $year + ')');
                    }
                }
                else {
                    $("#GraphSalesYear").html("<br><p><strong> Ops!</strong> Nenhum Resultado Encontrado.</p>");
                   
                    if (month != undefined) {
                        $('#m_portlet_year_resume_title').text(`Resumo (` + ("0" + month).slice(-2) + "/" + $year.slice(-2) + `)`);
                    }
                    else {
                        $('#m_portlet_year_resume_title').text('Resumo (' + $year + ')');
                }
                }
                var totalValorMartins = data.result.TotalValorRCA + data.result.TotalValorOperador + data.result.TotalValorNativa;

                $("#totalRCA").text(data.result.TotalVendasRCA + ' vendas');
                
                $("#vendasRCA").text(data.result.TotalValorRCA.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) + "(" + getPercentage(data.result.TotalValorRCA, totalValorMartins) + ")");
                
                $("#totalTel").text(data.result.TotalVendasOperador + ' vendas');
                
                $("#vendasTel").text(data.result.TotalValorOperador.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) + "(" + getPercentage(data.result.TotalValorOperador, totalValorMartins) + ")");
               
                $("#totalNativa").text(data.result.TotalVendasNativa + ' vendas');
               
                $("#vendasNativa").text(data.result.TotalValorNativa.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) + "(" + getPercentage(data.result.TotalValorNativa, totalValorMartins) + ")" );

                $("#totalSite").text(data.result.TotalVendasSite + ' vendas');

                $("#vendasSite").text(data.result.TotalValorSite.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
                
            }).fail(() => {
                //toastr.error("Falha ao carregar as vendas do ano!", "Tente novamente mais tarde.");
            }).always(() => {
                mApp.unblock($container);
            })          
        },

        percentDelayDeliveryChart(year) {
            var $year = $("#year_delay_delivery_input").val();
            var $container = $('#m_annual_delay_delivery_portlet');
            mApp.block($container, portletBlockConfig);

            $.ajax({
                type: 'GET',
                contentType: 'application/json',
                url: '/AjaxIndicator/GetPercentageDelayDelivery',
                data: { ano: $year }
            }).done((data) => {

                am5.disposeAllRootElements();

                var ano_split = "/" + data.result.Ano.toString().substring(2);

                if (data.result != undefined) {
                    $('#m_portlet_delay_delivery_title').text('% Pedidos com atraso na entrega (' + data.result.Ano + ')');
                    DelayDeliveryChart(data.result, ano_split); //Carrega Gáfico
                }
                else
                {
                    $('#m_portlet_delay_delivery_title').text('% Pedidos com atraso na entrega (' + data.result.Ano + ')');
                    $("#GraphDelayDelivery").html("<br><p><strong> Ops!</strong> Nenhum Resultado Encontrado.</p>");
                }
           
            }).fail(() => {
                //toastr.error("Falha ao carregar as entregas do ano!", "Tente novamente mais tarde.");
            }).always(() => {
                mApp.unblock($container);
            })
        },

        salesByHour(data, inicio, final) {
            $('#m-widget14__title').text(
                `Horário ${Dashboard.getDatePeriod(inicio, final)}`
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

        salesByWeek(data, inicio, final) {
            $('#SaleDaysTitle').text(
                `Dia da Semana ${Dashboard.getDatePeriod(inicio, final)}`
            );

            var orders = [];
            //data.sort((o1, o2) => o1.Hora - o2.Hora);

            for (var dia = 1; dia <= 7; dia++) {
                var value = data.find((item) => item.Dia === dia);
                if (value) {
                    orders.push(value.TotalItens);
                } else {
                    orders.push(0);
                }
            }

            if (weekChart) {
                weekChart.data.datasets[0].data = orders;
                weekChart.update();
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

        weekSalesResumeChart(inicio, final) {
            var $container = $('#m_hours_resume_portlet');
            mApp.block($container, portletBlockConfig);

           
            $.ajax({
                type: 'GET',
                contentType: 'application/json',
                url: '/AjaxIndicator/GetSalesWeekReport',
                data: {
                    de:inicio, ate:final
                }
            }).done((data) => {
                var result = data.result;
                Dashboard.salesByWeek(result, inicio, final);

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
                $('#span_title_encaminhado').text(
                    `${Dashboard.getDatePeriod(de, ate)}`
                );

                result = data.result;           
                
                GaugeInit(result.PorcentagemEntregasAtrasadas); //Grafico das entregas atrasadas
                XYChart3DInit(result.PorcentagemCancelados); //Grafico dos pedidos cancelados
                Dashboard.morrisChartInit(result.TotalChamados, result.ChamadosAtrasados, result.ChamadosEmDia); //Graficos dos chamados

                $('#span_entregues').text(result.PedidosEntregue);

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
                $('#span_pEntreguesPrazo').text(pEntreguesNoPrazo + "%");
                $('#span_entreguesAtrasado').text(result.EntreguesComAtraso );
                $('#span_pEntreguesAtrasado').text(pEntreguesComAtraso + "%");
                
                $('#span_encaminhado').text(result.TotalEncaminhados);
                $('#span_encaminhadoAtrasado').text(result.EncaminhadosAtrasados);
                $('#span_pEncaminhadoAtrasado').text(pEncaminhadoComAtraso + "%");
                
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

                       //$(".navegacao-status .nav-link.active").click();

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
                   
                    /*$('#m_portlet_sales_resume_title').text(
                        `Vendas ${Dashboard.getDatePeriod(de, ate)}`
                    );*/
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
            Dashboard.initSalesSummary(Date(moment().startOf('month').format('DD/MM/YYYY HH:mm:ss.SSS')), Date(moment().endOf('month').format('DD/MM/YYYY HH:mm:ss.SSS')));
            countSolicitacaoCancelamento();
            countNotificacoes();
        },
           
        initYearSalesResumeChart: function (year, month) {
            $("#year_resume_input").val(year);
            
            //$(el).closest(".m-portlet__nav-item").children("a").text($(el).text());
            Dashboard.yearSalesResumeChart(month);
            
        },

        initpercentageDelayDeliveryChart: function (year) {
            $("#year_delay_delivery_input").val(year);
            Dashboard.percentDelayDeliveryChart(year);
        },
	};
}();

//SLA
function showSlaBySeller() {
    var picker = $('#m_dashboard_daterangepicker').data('daterangepicker');
    window.location.href = '/Seller/sellerSLA?de=' + picker.startDate.toISOString() + '&ate=' + picker.endDate.toISOString()
}

function goSlaFull() {
    var picker = $('#m_dashboard_daterangepicker').data('daterangepicker');
    window.location.href = '/Home/SLAs?de=' + picker.startDate.toISOString() + '&ate=' + picker.endDate.toISOString()
}

//Povoamento Graficos
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

function ContactRating(jsonObj) {
    //Themes
    am4core.useTheme(am4themes_animated);

    // Create chart instance
    var chart = am4core.create("ContactRating", am4charts.XYChart);

    //Locales
    chart.language.locale = am4lang_pt_BR;

    // Add data
    chart.data = [{
        "Mes": "Mês Anterior",
        "Atendimentos": jsonObj.MesAnterior
    },
    {
        "Mes": "Mês Atual",
        "Atendimentos": jsonObj.MesAtual
    }];

    //Colors
    chart.colors.list = [
        am4core.color("#009688"),
        am4core.color("#4CAF50")
    ];

    // Create axes
    var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "Mes";
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 60;
    categoryAxis.renderer.labels.template.horizontalCenter = "middle";
    categoryAxis.renderer.labels.template.verticalCenter = "middle";
    categoryAxis.renderer.labels.template.rotation = 0;
    categoryAxis.tooltip.disabled = true;
    categoryAxis.renderer.minHeight = 110;

    var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.renderer.minWidth = 50;
    valueAxis.min = 0;
    valueAxis.cursorTooltipEnabled = false;

    // Create series
    var series = chart.series.push(new am4charts.ColumnSeries());
    series.sequencedInterpolation = true;
    series.dataFields.valueY = "Atendimentos";
    series.dataFields.categoryX = "Mes";
    series.tooltipText = "[{categoryX}: bold]{valueY}[/]";
    series.columns.template.strokeWidth = 0;
    series.tooltip.pointerOrientation = "vertical";
    series.columns.template.column.cornerRadiusTopLeft = 10;
    series.columns.template.column.cornerRadiusTopRight = 10;
    series.columns.template.column.fillOpacity = 0.8;
    series.columns.template.maxWidth = 70

    // on hover, make corner radiuses bigger
    var hoverState = series.columns.template.column.states.create("hover");
    hoverState.properties.cornerRadiusTopLeft = 0;
    hoverState.properties.cornerRadiusTopRight = 0;
    hoverState.properties.fillOpacity = 1;

    series.columns.template.adapter.add("fill", function (fill, target) {
        return chart.colors.getIndex(target.dataItem.index);
    });

    // Cursor
    chart.cursor = new am4charts.XYCursor();
}

function PorcentagemVendasCanceladas(jsonObj) {    
    //Themes
    am4core.useTheme(am4themes_animated);

    // Create chart instance
    var chart = am4core.create("PorcentagemVendasCanceladas", am4charts.XYChart);

    // Add data
    chart.data = jsonObj

    //Colors
    /*chart.colors.list = [
        am4core.color("#8BC34A"),
        am4core.color("#CDDC39")
    ];*/

    // Create axes
    var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "MesAno";
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 60;
    categoryAxis.renderer.labels.template.horizontalCenter = "middle";
    categoryAxis.renderer.labels.template.verticalCenter = "middle";
    categoryAxis.renderer.labels.template.rotation = 0;
    categoryAxis.tooltip.disabled = true;
    categoryAxis.renderer.minHeight = 110;
    //categoryAxis.renderer.labels.template.rotation = 270;

    var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.renderer.minWidth = 50;
    valueAxis.min = 0;
    valueAxis.cursorTooltipEnabled = false;
    valueAxis.renderer.labels.template.adapter.add("text", (label, target, key) => { return label + " % "; });

    // Create series
    var series = chart.series.push(new am4charts.ColumnSeries());
    series.sequencedInterpolation = true;
    series.dataFields.valueY = "PorcentagemCancelados";
    series.dataFields.categoryX = "MesAno";
    series.tooltipText = "[{categoryX}: bold]{valueY}[/] %";
    series.columns.template.strokeWidth = 0;
    series.tooltip.pointerOrientation = "vertical";
    series.columns.template.column.cornerRadiusTopLeft = 10;
    series.columns.template.column.cornerRadiusTopRight = 10;
    series.columns.template.column.fillOpacity = 0.8;
    series.columns.template.maxWidth = 70

    // on hover, make corner radiuses bigger
    var hoverState = series.columns.template.column.states.create("hover");
    hoverState.properties.cornerRadiusTopLeft = 0;
    hoverState.properties.cornerRadiusTopRight = 0;
    hoverState.properties.fillOpacity = 1;

    series.columns.template.adapter.add("fill", function (fill, target) {
        return chart.colors.getIndex(target.dataItem.index);
    });

    // Cursor
    chart.cursor = new am4charts.XYCursor();
}

/*function SellerXMotivos(jsonObj) {
    //Themes
    am4core.useTheme(am4themes_animated);

    // Create chart instance
    var chart = am4core.create("SellerXMotivos", am4charts.XYChart);

    // Add data
    chart.data = jsonObj

    //Colors
    chart.colors.list = [
        am4core.color("#e91e63"),
        am4core.color("#9c27b0"),
        am4core.color("#673ab7")
    ];

    // Create axes
    var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "NomeSeller";
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 60;
    categoryAxis.renderer.labels.template.horizontalCenter = "middle";
    categoryAxis.renderer.labels.template.verticalCenter = "middle";
    categoryAxis.renderer.labels.template.rotation = 0;
    categoryAxis.tooltip.disabled = true;
    categoryAxis.renderer.minHeight = 110;
    categoryAxis.renderer.labels.template.disabled = true;

    var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.renderer.minWidth = 50;
    valueAxis.min = 0;
    valueAxis.cursorTooltipEnabled = false;

    // Create series
    var series = chart.series.push(new am4charts.ColumnSeries());
    series.sequencedInterpolation = true;
    series.dataFields.valueY = "TotalChamados";
    series.dataFields.categoryX = "NomeSeller";
    series.tooltipText = "[{categoryX}: bold]{valueY}[/]";
    series.columns.template.strokeWidth = 0;
    series.tooltip.pointerOrientation = "vertical";
    series.columns.template.column.cornerRadiusTopLeft = 10;
    series.columns.template.column.cornerRadiusTopRight = 10;
    series.columns.template.column.fillOpacity = 0.8;
    series.columns.template.maxWidth = 70

    // on hover, make corner radiuses bigger
    var hoverState = series.columns.template.column.states.create("hover");
    hoverState.properties.cornerRadiusTopLeft = 0;
    hoverState.properties.cornerRadiusTopRight = 0;
    hoverState.properties.fillOpacity = 1;

    series.columns.template.adapter.add("fill", function (fill, target) {
        return chart.colors.getIndex(target.dataItem.index);
    });

    chart.legend = new am4charts.Legend();
    chart.legend.position = "top";
    chart.legend.parent = chart.chartContainer;
    chart.legend.itemContainers.template.togglable = false;
    chart.legend.marginTop = 0;
    chart.legend.marginBottom = 40;

    series.events.on("ready", function (ev) {
        let legenddata = [];
        series.columns.each(function (column) {
            legenddata.push({
                name: column.dataItem.categoryX,
                fill: column.fill
            })
        });
        chart.legend.data = legenddata;
    });
    
    // Cursor
    chart.cursor = new am4charts.XYCursor();
}

function CancelamentosXSeller(cancelamentosSeller) {
    am4core.ready(function () {

        // Themes begin
        am4core.useTheme(am4themes_animated);

        // Create chart instance
        var chart = am4core.create("m_chart_cancelamento_seller", am4charts.XYChart);
        chart.padding(40, 40, 40, 40);

        //Colors
        chart.colors.list = [
            am4core.color("#ff0000")
        ];

        //Create chart data
        chart.data = cancelamentosSeller

        // Create axes
        var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
        categoryAxis.dataFields.category = "nome_curto";
        categoryAxis.numberFormatter.numberFormat = "#";
        categoryAxis.renderer.inversed = true;

        var valueAxis = chart.xAxes.push(new am4charts.ValueAxis());

        // Create series
        var series = chart.series.push(new am4charts.ColumnSeries3D());
        series.dataFields.valueX = "total";
        series.dataFields.categoryY = "nome_curto";
        series.name = "Total";
        series.columns.template.propertyFields.fill = "color";
        series.columns.template.tooltipText = "{valueX}";
        series.columns.template.column3D.stroke = am4core.color("#fff");
        series.columns.template.column3D.strokeOpacity = 0.2;
        series.columns.template.maxWidth = 70

    });
}

function MotivosCancelamentos(motivosCancelamentos) {
    am4core.ready(function () {

        // Themes begin
        am4core.useTheme(am4themes_animated);

        // Create chart instance
        var chart = am4core.create("m_chart_motivos_cancelamento", am4charts.XYChart);

        console.log(motivosCancelamentos);
        chart.data = motivosCancelamentos

        chart.colors.list = [
            am4core.color("#e91e63"),
            am4core.color("#9c27b0"),
            am4core.color("#673ab7")
        ];

        // Create axes
        var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        categoryAxis.dataFields.category = "Motivo";
        categoryAxis.renderer.grid.template.location = 0;
        categoryAxis.renderer.minGridDistance = 60;
        categoryAxis.renderer.labels.template.horizontalCenter = "middle";
        categoryAxis.renderer.labels.template.verticalCenter = "middle";
        categoryAxis.renderer.labels.template.rotation = 0;
        categoryAxis.tooltip.disabled = true;
        categoryAxis.renderer.minHeight = 110;
        categoryAxis.renderer.labels.template.disabled = true;

        var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        valueAxis.renderer.minWidth = 50;
        valueAxis.min = 0;
        valueAxis.cursorTooltipEnabled = false;

        // Create series
        var series = chart.series.push(new am4charts.ColumnSeries());
        series.sequencedInterpolation = true;
        series.dataFields.valueY = "TotalCancelamentos";
        series.dataFields.categoryX = "Motivo";
        series.tooltipText = "[{categoryX}: bold]{valueY}[/]";
        series.columns.template.strokeWidth = 0;
        series.tooltip.pointerOrientation = "vertical";
        series.columns.template.column.cornerRadiusTopLeft = 10;
        series.columns.template.column.cornerRadiusTopRight = 10;
        series.columns.template.column.fillOpacity = 0.8;
        series.columns.template.maxWidth = 70

        // on hover, make corner radiuses bigger
        var hoverState = series.columns.template.column.states.create("hover");
        hoverState.properties.cornerRadiusTopLeft = 0;
        hoverState.properties.cornerRadiusTopRight = 0;
        hoverState.properties.fillOpacity = 1;

        series.columns.template.adapter.add("fill", function (fill, target) {
            return chart.colors.getIndex(target.dataItem.index);
        });

        //Legendas
        chart.legend = new am4charts.Legend();
        chart.legend.position = "top";
        chart.legend.parent = chart.chartContainer;
        chart.legend.itemContainers.template.togglable = false;
        chart.legend.marginTop = 0;
        chart.legend.marginBottom = 25;

        series.events.on("ready", function (ev) {
            let legenddata = [];
            series.columns.each(function (column) {
                legenddata.push({
                    name: column.dataItem.categoryX,
                    fill: column.fill
                })
            });
            chart.legend.data = legenddata;
        });

        // Cursor
        chart.cursor = new am4charts.XYCursor();

    });
}*/

function NewYearSales(vendasNoAno, timeUnit) {

    // Create root element
    // https://www.amcharts.com/docs/v5/getting-started/#Root_element
    var root = am5.Root.new("GraphSalesYear");
    /*if (root.container != undefined)
        root.container.children.clear();

    root = root.new("GraphSalesYear");*/

    // Set themes
    // https://www.amcharts.com/docs/v5/concepts/themes/
    root.setThemes([am5themes_Animated.new(root)]);

    //Locales
    root.locale = am5locales_pt_BR;

    // Create chart
    // https://www.amcharts.com/docs/v5/charts/xy-chart/
    var chart = root.container.children.push(
        am5xy.XYChart.new(root, {
            panX: false,
            panY: false,
            //wheelX: "panX",
            //wheelY: "zoomX",
            layout: root.verticalLayout
        })
    );

    var easing = am5.ease.linear;
    chart.get("colors").set("step", 2);
   
    //Data   
    var data = vendasNoAno
        
    // Create axes
    // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
    var xAxis = chart.xAxes.push(
        am5xy.DateAxis.new(root, {
            maxDeviation: 0.1,
            groupData: false,
            baseInterval: {
                timeUnit: timeUnit,
                count: 1
            },
            renderer: am5xy.AxisRendererX.new(root, {}),
            tooltip: am5.Tooltip.new(root, {}),
            //maxWidth: 400
        })
    );

    function createAxisAndSeries(opposite, axis_y_name, seriesType, legend_name ) {

        //Axis
        var yRenderer = am5xy.AxisRendererY.new(root, {
            opposite: opposite
        });

        var yAxis = chart.yAxes.push(
            am5xy.ValueAxis.new(root, {
                maxDeviation: 1,
                renderer: yRenderer
            })
        );

        if (chart.yAxes.indexOf(yAxis) > 0) {
            yAxis.set("syncWithAxis", chart.yAxes.getIndex(0));
        }

        //Series
        if (seriesType == "LineSeries") {
            var series = chart.series.push(
                am5xy.LineSeries.new(root, {
                    name: legend_name,
                    xAxis: xAxis,
                    yAxis: yAxis,
                    valueYField: axis_y_name,
                    valueXField: "MesAno",
                    tooltip: am5.Tooltip.new(root, {
                        pointerOrientation: "horizontal",
                        labelText: "{valueY}"
                    })
                })
            );

            series.strokes.template.setAll({ strokeWidth: 1 });
        }
        else if (seriesType == "ColumnSeries") {
            var series = chart.series.push(
                am5xy.ColumnSeries.new(root, {
                    name: legend_name,
                    xAxis: xAxis,
                    yAxis: yAxis,
                    valueYField: axis_y_name,
                    valueXField: "MesAno",
                    tooltip: am5.Tooltip.new(root, {
                        pointerOrientation: "horizontal",
                        labelText: "{valueY}"
                    }),
                    
                })
            );

            series.columns.template.setAll({
                maxWidth: 70
            });

            series.columns.template.events.on("click", function (ev) {
                console.log("Clicked on a column", ev.target.dataItem.dataContext.MesAno);

                if (timeUnit == "month") {
                    let data_coluna = new Date(ev.target.dataItem.dataContext.MesAno);
                    let ano = data_coluna.getFullYear();
                    let mes = data_coluna.getMonth() + 1;

                    Dashboard.initYearSalesResumeChart(ano, mes);
                    changeDropDownSelect(ano, mes);
                }
            });

            if (timeUnit == "day") {
                var button = chart.plotContainer.children.push(am5.Button.new(root, {
                    dx: 7,
                    dy: 7,
                    layer: 40,
                    icon: am5.Graphics.new(root, {
                        fill: am5.color(0xffffff),
                        svgPath: "M11.739,13.962c-0.087,0.086-0.199,0.131-0.312,0.131c-0.112,0-0.226-0.045-0.312-0.131l-3.738-3.736c-0.173-0.173-0.173-0.454,0-0.626l3.559-3.562c0.173-0.175,0.454-0.173,0.626,0c0.173,0.172,0.173,0.451,0,0.624l-3.248,3.25l3.425,3.426C11.911,13.511,11.911,13.789,11.739,13.962 M18.406,10c0,4.644-3.763,8.406-8.406,8.406S1.594,14.644,1.594,10S5.356,1.594,10,1.594S18.406,5.356,18.406,10 M17.521,10c0-4.148-3.373-7.521-7.521-7.521c-4.148,0-7.521,3.374-7.521,7.521c0,4.148,3.374,7.521,7.521,7.521C14.147,17.521,17.521,14.148,17.521,10",
                        height: 5,
                        width: 5
                    }),
                    
                }));

                button.events.on("click", function (ev) {
                    var $year = $("#year_resume_input").val();
                    Dashboard.initYearSalesResumeChart($year);
                    changeDropDownSelect($year)
                });
            }

            series.columns.template.maxWidth = 75;
        }

        //series.fills.template.setAll({ fillOpacity: 0.2, visible: true });

        yRenderer.grid.template.set("strokeOpacity", 0.05);
        yRenderer.labels.template.set("fill", series.get("fill"));
        yRenderer.setAll({
            stroke: series.get("fill"),
            strokeOpacity: 1,
            opacity: 1
        });

        // Set up data processor to parse string dates
        // https://www.amcharts.com/docs/v5/concepts/data/#Pre_processing_data
        series.data.processor = am5.DataProcessor.new(root, {
            dateFormat: "dd/MM/yyyy HH:mm:ss",
            dateFields: ["MesAno"]
        });

        series.data.setAll(data);
    }

    // Add cursor
    // https://www.amcharts.com/docs/v5/charts/xy-chart/cursor/
    var cursor = chart.set("cursor", am5xy.XYCursor.new(root, {
        xAxis: xAxis,
        behavior: "none"
    }));
    cursor.lineY.set("visible", false);

    // Add series
    // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
    createAxisAndSeries(true, "TotalItens", "ColumnSeries", "Quantidade Pedidos");
    createAxisAndSeries(false, "ValorTotal", "LineSeries", "Valor Total");
    

    // Add legend
    // https://www.amcharts.com/docs/v5/charts/xy-chart/legend-xy-series/
    var legend = chart.children.push(
        am5.Legend.new(root, {
            centerX: am5.p50,
            x: am5.p50
        })
    );
    legend.data.setAll(chart.series.values);

    // Make stuff animate on load
    // https://www.amcharts.com/docs/v5/concepts/animations/
    chart.appear(1000, 100);
   
}

function StatusDonutChart(numPedidosByStatus) {

    // Themes begin
    am4core.useTheme(am4themes_animated);
    // Themes end

    // Create chart instance
    var chart = am4core.create("StatusDonutChart", am4charts.PieChart);

    //Locales
    chart.language.locale = am4lang_pt_BR;

    // Add data
    chart.data = numPedidosByStatus;

    // Add and configure Series
    var pieSeries = chart.series.push(new am4charts.PieSeries());
    pieSeries.dataFields.value = "NumPedidos";
    pieSeries.dataFields.category = "Status";
    pieSeries.slices.template.stroke = am4core.color("#fff");
    pieSeries.slices.template.strokeOpacity = 1;

    // This creates initial animation
    pieSeries.hiddenState.properties.opacity = 1;
    pieSeries.hiddenState.properties.endAngle = -90;
    pieSeries.hiddenState.properties.startAngle = -90;

    chart.hiddenState.properties.radius = am4core.percent(0);
}

function anoDropDownSet(ano) {

    if (ano != undefined) {
        $("#anoDropdownAtrasoEntregas").text(ano);
    }
}

function DelayDeliveryChart(atrasoEntregas, ano_split) {

    //  Apply chart themes
        am4core.useTheme(am4themes_animated);
    //  am4core.useTheme(am4themes_kelly);

    //  Create chart instance
    var chart = am4core.create("GraphDelayDelivery", am4charts.XYChart);

    var maxY = 100;
    var minY = 0;

    // Add data
    chart.data = [{
        "year": "jan" + ano_split,
         "value": atrasoEntregas.porcentagemJaneiro
    }, {
        "year": "fev" + ano_split,
        "value": atrasoEntregas.porcentagemFevereiro
    }, {
        "year": "mar" + ano_split,
        "value": atrasoEntregas.porcentagemMarco
    }, {
        "year": "abr" + ano_split,
        "value": atrasoEntregas.porcentagemAbril
    }, {
        "year": "mai" + ano_split,
        "value": atrasoEntregas.porcentagemMaio
    }, {
        "year": "jun" + ano_split,
        "value": atrasoEntregas.porcentagemJunho
    }, {
        "year": "jul" + ano_split,
        "value": atrasoEntregas.porcentagemJulho
    }, {
        "year": "ago" + ano_split,
        "value": atrasoEntregas.porcentagemAgosto
    }, {
        "year": "set" + ano_split,
        "value": atrasoEntregas.porcentagemSetembro
    }, {
        "year": "out" + ano_split,
        "value": atrasoEntregas.porcentagemOutubro
    }, {
        "year": "nov" + ano_split,
        "value": atrasoEntregas.porcentagemNovembro
    },{
         "year": "dez" + ano_split,
         "value": atrasoEntregas.porcentagemDezembro
    }];
        
    // Create axes
    var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "year";
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 20;
    

    var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.calculateTotals = true;
    valueAxis.min = 0;
    valueAxis.max = 100;
    valueAxis.strictMinMax = true;
    valueAxis.min = minY - 5;
    valueAxis.max = maxY + 5
    valueAxis.renderer.labels.template.adapter.add("text", function (text) {
        return text + "%";
    });

    // Create series
    var series = chart.series.push(new am4charts.LineSeries());
    series.dataFields.valueY = "value";
    series.dataFields.categoryX = "year";
    series.name = "%";
    series.tooltipText = "[bold]{valueY}[/]{name}";
    series.strokeWidth = 3;

    var valueLabel = series.bullets.push(new am4charts.LabelBullet());
    valueLabel.name = "%";
    valueLabel.label.text = "{valueY}{name}";
    valueLabel.valign = "middle";
    valueLabel.dx = 25;
    valueLabel.strokeWidth = 0;
    valueLabel.label.hideOversized = false;
    valueLabel.label.truncate = false;
    valueLabel.label.paddingRight = 25;

    // Add cursor
    chart.cursor = new am4charts.XYCursor();
}

function ChamadosPorStatusChart(chamados) {
    //Themes
    am4core.useTheme(am4themes_animated);

    // Create chart instance
    var chart = am4core.create("ChamadosPorStatus", am4charts.XYChart);

    // Add data
    chart.data = chamados

    var maxY = -999;
    for (var i = 0; i < chamados.length; i++) {
        if (maxY < chamados[i].TotalChamados) {
            maxY = chamados[i].TotalChamados;
        }
    }

    // Create axes
    var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "NomeStatus";
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 60;
    categoryAxis.renderer.labels.template.horizontalCenter = "middle";
    categoryAxis.renderer.labels.template.verticalCenter = "middle";
    categoryAxis.renderer.labels.template.rotation = 0;
    categoryAxis.tooltip.disabled = true;
    categoryAxis.renderer.minHeight = 110;
    //categoryAxis.renderer.labels.template.rotation = 270;
    categoryAxis.renderer.labels.template.disabled = true;

    var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.renderer.minWidth = 50;
    valueAxis.min = 0;
    valueAxis.max = maxY;
    valueAxis.cursorTooltipEnabled = false;

    // Create series
    var series = chart.series.push(new am4charts.ColumnSeries());
    series.sequencedInterpolation = true;
    series.dataFields.valueY = "TotalChamados";
    series.dataFields.categoryX = "NomeStatus";
    series.tooltipText = "[{categoryX}: bold]{valueY}";
    series.columns.template.strokeWidth = 0;
    series.tooltip.pointerOrientation = "vertical";
    series.columns.template.column.cornerRadiusTopLeft = 10;
    series.columns.template.column.cornerRadiusTopRight = 10;
    series.columns.template.column.fillOpacity = 0.8;
    series.columns.template.maxWidth = 70

    // on hover, make corner radiuses bigger
    var hoverState = series.columns.template.column.states.create("hover");
    hoverState.properties.cornerRadiusTopLeft = 0;
    hoverState.properties.cornerRadiusTopRight = 0;
    hoverState.properties.fillOpacity = 1;

    series.columns.template.adapter.add("fill", function (fill, target) {
        return chart.colors.getIndex(target.dataItem.index);
    });

    chart.legend = new am4charts.Legend();
    chart.legend.position = "bottom";
    chart.legend.parent = chart.chartContainer;
    chart.legend.itemContainers.template.togglable = false;
    chart.legend.marginTop = -75;
    chart.legend.marginBottom = 25;

    series.events.on("ready", function (ev) {
        let legenddata = [];
        series.columns.each(function (column) {
            legenddata.push({
                name: column.dataItem.categoryX,
                fill: column.fill
            })
        });
        chart.legend.data = legenddata;
    });

    // Cursor
    chart.cursor = new am4charts.XYCursor();
}

function ChamadosPorMesAnoChart(chamados) {

    //  Apply chart themes
    am4core.useTheme(am4themes_animated);

    //  Create chart instance
    var chart = am4core.create("ChamadosPorMesAno", am4charts.XYChart);

    var maxY = -999;
    for (var i = 0; i < chamados.length; i++) {
        if (maxY < chamados[i].TotalChamados) {
            maxY = chamados[i].TotalChamados;
        }
    }

    var minY = 0;

    // Add data
    chart.data = chamados

    // Create axes
    var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "MesAno";
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 20;

    var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.calculateTotals = true;
    valueAxis.strictMinMax = true;
    valueAxis.min = minY - 5;
    valueAxis.max = maxY + 5

    // Create series
    var series = chart.series.push(new am4charts.LineSeries());
    series.dataFields.valueY = "TotalChamados";
    series.dataFields.categoryX = "MesAno";
    series.tooltipText = "[bold]{valueY}[/]{name}";
    series.strokeWidth = 3;

    var valueLabel = series.bullets.push(new am4charts.LabelBullet());
    valueLabel.name = "%";
    valueLabel.label.text = "{valueY}{name}";
    valueLabel.valign = "middle";
    valueLabel.dx = 25;
    valueLabel.strokeWidth = 0;
    valueLabel.label.hideOversized = false;
    valueLabel.label.truncate = false;
    valueLabel.label.paddingRight = 25;

    // Add cursor
    chart.cursor = new am4charts.XYCursor();
}

//Carrega dados Graficos
function loadPrincipaisMotivos() {
    $.ajax({
        type: 'POST',
        url: '/AjaxIndicator/PrincipaisMotivosChamadoSeller',
        data: {
            date: $('#m_dashboard_daterangepicker').data('daterangepicker').startDate.toISOString()
        },
        beforeSend: function () {
            mApp.block("#MotivosChamadosSeller", { overlayColor: "#000000", type: "loader", state: "success", message: "Carregando..." });
        },
        complete: function () {
            var spanTitleDate = $("#MotivosChamadosTitleDate");
            changeGraphTitleDate(spanTitleDate);
        },
        success: function (data) {
            $("#MotivosChamadosSeller").html(data);
            mApp.unblock("#MotivosChamadosSeller");
        },
        error: function () {
            mApp.unblock("#MotivosChamadosSeller");
            toastr.error("Falha ao carregar Principais Motivos!", "Tente novamente mais tarde.");
        }
    });
}

function loadPrincipaisMotivosChamado() {
    $.ajax({
        type: 'POST',
        url: '/AjaxIndicator/GetPrincipaisMotivosOcorrencia',
        data: {
            date: $('#m_dashboard_daterangepicker').data('daterangepicker').startDate.toISOString()
        },
        beforeSend: function () {
            mApp.block("#m_chart_motivos_chamado", { overlayColor: "#000000", type: "loader", state: "success", message: "Carregando..." });
        },
        complete: function () {
            var spanTitleDate = $("#span_title_motivos_chamado");
            changeGraphTitleDate(spanTitleDate);
        },
        success: function (data) {
            $("#m_chart_motivos_chamado").html(data);
            mApp.unblock("#m_chart_motivos_chamado");
        },
        error: function () {
            mApp.unblock("#m_chart_motivos_chamado");
            toastr.error("Falha ao carregar Principais Motivos!", "Tente novamente mais tarde.");
        }
    });
}

function loadContactRating() {
    $.ajax({
        type: 'POST',
        url: '/AjaxIndicator/ContactRating',
        data: {
            date: $('#m_dashboard_daterangepicker').data('daterangepicker').startDate.toISOString()
        },
        beforeSend: function () {
            mApp.block("#ContactRating", { overlayColor: "#000000", type: "loader", state: "success", message: "Carregando..." });
        },
        complete: function () {
            var spanTitleDate = $("#ContactRatingTitleDate");
            changeGraphTitleDate(spanTitleDate);
        },
        success: function (result) {
            jsonObj = JSON.parse(result.data);

            if (jsonObj == null) {
                $("#ContactRating").html("<p><strong> Ops!</strong> Nenhum Resultado Encontrado.</p>");
            }
            else {
                ContactRating(jsonObj);
            }

            mApp.unblock("#ContactRating");
        },
        error: function () {
            mApp.unblock("#ContactRating");
            toastr.error("Falha ao carregar gráfico ContactRating!", "Tente novamente mais tarde.");
        }
    });
}

function loadPorcentagemVendasCanceladas() {   
    $.ajax({
        type: 'POST',
        url: '/AjaxIndicator/VendasCanceladas',
        data: {
            date: $('#m_dashboard_daterangepicker').data('daterangepicker').startDate.toISOString()
        },
        beforeSend: function () {
            mApp.block("#PorcentagemVendasCanceladas", { overlayColor: "#000000", type: "loader", state: "success", message: "Carregando..." });
        },
        complete: function () {
            var spanTitleDate = $("#PorcentagemVendasCanceladasTitleDate");
            changeGraphTitleDate(spanTitleDate);
        },
        success: function (result) {
           // jsonObj = JSON.parse(result.data);
            
            if (result.data == null || result.data.length <= 0) {
                $("#PorcentagemVendasCanceladas").html("<p><strong> Ops!</strong> Nenhum Resultado Encontrado.</p>");
            }
            else {
                PorcentagemVendasCanceladas(result.data);
            }

            mApp.unblock("#PorcentagemVendasCanceladas");
        },
        error: function () {
            mApp.unblock("#PorcentagemVendasCanceladas");
            toastr.error("Falha ao carregar gráfico Porcentagem Vendas Canceladas!", "Tente novamente mais tarde.");
        }
    });
}

function loadYearSalesResume() {
    $.ajax({
        type: 'POST',
        url: '/AjaxIndicator/GetPartialYearSalesResume',
        beforeSend: function () {
            mApp.block("#PortletSalesYear", { overlayColor: "#000000", type: "loader", state: "success", message: "Carregando..." });
        },
        success: function (data) {
       
            $("#PortletSalesYear").html(data);
            //Dashboard.lineChartInit();
            Dashboard.yearSalesResumeChart();

            mApp.unblock("#PortletSalesYear");
        },
        error: function () {
            mApp.unblock("#PortletSalesYear");
            toastr.error("Falha ao carregar Resumo Vendas Anual!", "Tente novamente mais tarde.");
        }
    });
}

function percentDelayDelivery() {
    $.ajax({
        type: 'POST',
        url: '/AjaxIndicator/GetPartialpercentDelayDelivery',
        beforeSend: function () {
            mApp.block("#PortletDelayDelivery", { overlayColor: "#000000", type: "loader", state: "success", message: "Carregando..." });
        },
        success: function (data) {

            $('#m_portlet_year_resume_title').text('Atraso de Entrega (' + data.Ano + ')');

            $("#PortletDelayDelivery").html(data);
            Dashboard.percentDelayDeliveryChart();

            mApp.unblock("#PortletDelayDelivery");
        },
        error: function () {
            mApp.unblock("#PortletDelayDelivery");
            toastr.error("Falha ao carregar Atraso de Entregas!", "Tente novamente mais tarde.");
        }
    });
}

function loadHoursSalesResume() {
    $.ajax({
        type: 'POST',
        url: '/AjaxIndicator/GetPartialHoursSalesResume',
        beforeSend: function () {
            mApp.block("#PortletSalesHour", { overlayColor: "#000000", type: "loader", state: "success", message: "Carregando..." });
        },
        success: function (data) {
            $("#PortletSalesHour").html(data);

            var picker = $('#m_dashboard_daterangepicker').data('daterangepicker');
        Dashboard.barChartInit();        
            Dashboard.hourSalesResumeChart(picker.startDate.toISOString(), picker.endDate.toISOString());


            mApp.unblock("#PortletSalesHour")
        },
        error: function () {
            mApp.unblock("#PortletSalesHour");
            toastr.error("Falha ao carregar Resumo Vendas Por Horario!", "Tente novamente mais tarde.");
        }
    });
}

function loadWeekSalesResume() {
    $.ajax({
        type: 'POST',
        url: '/AjaxIndicator/GetPartialWeekSalesResume',
        beforeSend: function () {
            mApp.block("#PortletSalesWeek", { overlayColor: "#000000", type: "loader", state: "success", message: "Carregando..." });
        },
        success: function (data) {
            $("#PortletSalesWeek").html(data);

            var picker = $('#m_dashboard_daterangepicker').data('daterangepicker');
            Dashboard.weekChartInit();
            Dashboard.weekSalesResumeChart(picker.startDate.toISOString(), picker.endDate.toISOString());


            mApp.unblock("#PortletSalesWeek")
        },
        error: function () {
            mApp.unblock("#PortletSalesWeek");
            toastr.error("Falha ao carregar Resumo Vendas Por Dia da Semana!", "Tente novamente mais tarde.");
        }
    });
}

function loadMotivosCancelamento() {
    $.ajax({
        type: 'POST',
        url: '/AjaxIndicator/GetSlaMotivosCancelamento',
        data: {
            date: $('#m_dashboard_daterangepicker').data('daterangepicker').startDate.toISOString()
        },
        beforeSend: function () {
            mApp.block("#m_chart_motivos_cancelamento", { overlayColor: "#000000", type: "loader", state: "success", message: "Carregando..." });
        },
        complete: function () {
            var spanTitleDate = $("#span_title_motivos_cancelamento");
            changeGraphTitleDate(spanTitleDate);
        },
        success: function (result) {

            //motivosCancelamentos = JSON.parse(result.data); //Pega o array de informações sobre nome e total de Motivos de Cancelamentos.

            /*if (motivosCancelamentos.length == 0)
                $("#m_chart_motivos_cancelamento").html("<p><strong> Ops!</strong> Nenhum Resultado Encontrado.</p>");
            else
                MotivosCancelamentos(motivosCancelamentos);

            mApp.unblock("#m_chart_motivos_cancelamento");*/

            $("#m_chart_motivos_cancelamento").html(result);

            mApp.unblock("m_chart_motivos_cancelamento");
        },
        error: function () {
            mApp.unblock("#m_chart_motivos_cancelamento");
            toastr.error("Falha ao carregar gráfico Motivos Cancelamento!", "Tente novamente mais tarde.");
        }
    });
}

function loadCancelamentosXSeller() {
    $.ajax({
        type: 'POST',
        url: '/AjaxIndicator/GetSlaCancelamentosSeller',
        data: {
            date: $('#m_dashboard_daterangepicker').data('daterangepicker').startDate.toISOString()
        },
        beforeSend: function () {
            mApp.block("#m_chart_cancelamento_seller", { overlayColor: "#000000", type: "loader", state: "success", message: "Carregando..." });
        },
        complete: function () {
            var spanTitleDate = $("#span_title_cancelamento_seller");
            changeGraphTitleDate(spanTitleDate);
        },
        success: function (result) {
            /*cancelamentosSeller = JSON.parse(result.data);

            if (cancelamentosSeller.length == 0)
                $("#m_chart_cancelamento_seller").html("<p><strong> Ops!</strong> Nenhum Resultado Encontrado.</p>");
            else
                CancelamentosXSeller(cancelamentosSeller);*/

            $("#m_chart_cancelamento_seller").html(result);

            mApp.unblock("#m_chart_cancelamento_seller");
        },
        error: function () {
            mApp.unblock("#m_chart_cancelamento_seller");
            toastr.error("Falha ao carregar gráfico Cancelamento X Seller!", "Tente novamente mais tarde.");
        }
    });
}

function loadStatusDonut() {
    var picker = $('#m_dashboard_daterangepicker').data('daterangepicker');
    var inicio = picker.startDate.toISOString();
    var fim = picker.endDate.toISOString();

    $.ajax({
        type: 'POST',
        url: '/AjaxIndicator/GetPedidosByStatus',
        data: {
            inicio: inicio,
            fim : fim
        },
        beforeSend: function () {
            mApp.block("#StatusDonutChart", { overlayColor: "#000000", type: "loader", state: "success", message: "Carregando..." });
        },
        complete: function () {
            $('#StatusTitleDate').text(
                `Status ${Dashboard.getDatePeriod(inicio, fim)}`
            );
        },
        success: function (result) {

            if (result.result.length == 0)
                $("#StatusDonutChart").html("<br><p><strong> Ops!</strong> Nenhum Resultado Encontrado.</p>");
            else
                StatusDonutChart(result.result);

            mApp.unblock("#StatusDonutChart");
        },
        error: function () {
            mApp.unblock("#StatusDonutChart");
            toastr.error("Falha ao carregar gráfico donuts status!", "Tente novamente mais tarde.");
        }
    });
}

//Regiao Chamados
/*
function loadChamadosFilters() { 
    $.ajax({
        url: "/AjaxIndicator/GetFiltersAbaChamado",
        type: "POST",
        data: {},
        beforeSend: () => mApp.block("#regiaoChamados", { overlayColor: "#000000", type: "loader", state: "success", message: "Carregando..." }),
        success: (data) => {
            $("#chamadosFilters").html(data);
            $(".m-select2").select2();

            //GetDadosAbaChamado();
        },
        error: () => {
            swal("Erro!", "Erro Interno, tente novamento mais tarde!", "error");
        },
        complete: () => mApp.unblock("#regiaoChamados")
    });
}*/

function loadChamadosMesAno() {
    var dataInicial = $('#m_dashboard_daterangepicker').data('daterangepicker').startDate.toISOString();
    var statusSelected = $("#statusChamado").val();
    var motivosSelected = $("#motivoChamado").val();
    var sellerSelected = $("#sellerChamado").val();
    var mplaceChecked = $("#mplace_check").is(":checked");
    var sellerChecked = $("#seller_check").is(":checked");

    $.ajax({
        type: 'POST',
        url: '/AjaxIndicator/ChamadosMesAno',
        data: {
            dataInicial: dataInicial,
            status_chamado: statusSelected,
            motivos_chamado: motivosSelected,
            sellers: sellerSelected,
            mplaceChecked: mplaceChecked,
            sellerChecked: sellerChecked
        },
        beforeSend: function () {
            mApp.block("#ChamadosPorMesAno", { overlayColor: "#000000", type: "loader", state: "success", message: "Carregando..." });
        },
        complete: function () {
            $("#ChamadosPorMesAnoTitleDate").html(
                `(${new Date(dataInicial).getFullYear()})`
            );

            mApp.unblock("#ChamadosPorMesAno");
        },
        success: function (result) {
            console.log(result);
            
            if (result.length == 0)
                $("#ChamadosPorMesAno").html("<br><p><strong> Ops!</strong> Nenhum Resultado Encontrado.</p>");
            else
                ChamadosPorMesAnoChart(result);

        },
        error: function () {
            toastr.error("Falha ao carregar gráfico de chamados mes/ano!", "Tente novamente mais tarde.");
        }
    });
}

function loadChamadosByStatus() {
    
    var dataInicial = $('#m_dashboard_daterangepicker').data('daterangepicker').startDate.toISOString();
    var dataFinal = $("#m_dashboard_daterangepicker").data("daterangepicker").endDate.toISOString();
    var statusSelected = $("#statusChamado").val();
    var motivosSelected = $("#motivoChamado").val();
    var sellerSelected = $("#sellerChamado").val();
    var mplaceChecked = $("#mplace_check").is(":checked");
    var sellerChecked = $("#seller_check").is(":checked");

    $.ajax({
        type: 'POST',
        url: '/AjaxIndicator/ChamadosPorStatus',
        data: {
            dataInicial: dataInicial,
            dataFinal: dataFinal,
            status_chamado: statusSelected,
            motivos_chamado: motivosSelected,
            sellers: sellerSelected,
            mplaceChecked: mplaceChecked,
            sellerChecked: sellerChecked
        },
        beforeSend: function () {
            mApp.block("#ChamadosPorStatus", { overlayColor: "#000000", type: "loader", state: "success", message: "Carregando..." });
        },
        complete: function () {
            $('#ChamadosPorStatusTitleDate').text(
                Dashboard.getDatePeriod(dataInicial, dataFinal)
            );

            mApp.unblock("#ChamadosPorStatus");
        },
        success: function (result) {
            console.log(result);

            if (result.length == 0)
                $("#ChamadosPorStatus").html("<br><p><strong> Ops!</strong> Nenhum Resultado Encontrado.</p>");
            else
                ChamadosPorStatusChart(result);

        },
        error: function () {
            toastr.error("Falha ao carregar gráfico de chamados mes/ano!", "Tente novamente mais tarde.");
        }
    });
}

function loadSellerXMotivos(CurrentPage) {
    var dataInicial = $('#m_dashboard_daterangepicker').data('daterangepicker').startDate.toISOString();
    var dataFinal = $("#m_dashboard_daterangepicker").data("daterangepicker").endDate.toISOString();
    var statusSelected = $("#statusChamado").val();
    var motivosSelected = $("#motivoChamado").val();
    var sellerSelected = $("#sellerChamado").val();
    var mplaceChecked = $("#mplace_check").is(":checked");
    var sellerChecked = $("#seller_check").is(":checked");

    $.ajax({
        type: 'POST',
        url: '/AjaxIndicator/TotalMotivosChamadoSeller',
        data: {
            dataInicial: dataInicial,
            dataFinal: dataFinal,
            status_chamado: statusSelected,
            motivos_chamado: motivosSelected,
            sellers: sellerSelected,
            mplaceChecked: mplaceChecked,
            sellerChecked: sellerChecked,
            CurrentPage: CurrentPage
        },
        beforeSend: function () {
            mApp.block("#SellerXMotivos", { overlayColor: "#000000", type: "loader", state: "success", message: "Carregando..." });
        },
        complete: function () {
            $('#SellerXMotivosTitleDate').text(
                Dashboard.getDatePeriod(dataInicial, dataFinal)
            );
            mApp.unblock("#SellerXMotivos");
        },
        success: function (result) {
           $("#SellerXMotivos").html(result);
        },
        error: function () {
            toastr.error("Falha ao carregar gráfico Seller X Motivos!", "Tente novamente mais tarde.");
        }
    });
}

function loadTableAtendimentoXPedidos(CurrentPage) {
    var dataInicial = $('#m_dashboard_daterangepicker').data('daterangepicker').startDate.toISOString();
    var dataFinal = $("#m_dashboard_daterangepicker").data("daterangepicker").endDate.toISOString();
    var statusSelected = $("#statusChamado").val();
    var motivosSelected = $("#motivoChamado").val();
    var sellerSelected = $("#sellerChamado").val();
    var mplaceChecked = $("#mplace_check").is(":checked");
    var sellerChecked = $("#seller_check").is(":checked");

    $.ajax({
        type: 'POST',
        url: '/AjaxIndicator/TableChamadosXPedidos',
        data: {
            dataInicial: dataInicial,
            dataFinal: dataFinal,
            status_chamado: statusSelected,
            motivos_chamado: motivosSelected,
            sellers: sellerSelected,
            mplaceChecked: mplaceChecked,
            sellerChecked: sellerChecked,
            CurrentPage: CurrentPage
        },
        beforeSend: function () {
            mApp.block("#ChamadosXPedidos", { overlayColor: "#000000", type: "loader", state: "success", message: "Carregando..." });
        },
        complete: function () {
            $('#ChamadosXPedidosTitleDate').text(
                Dashboard.getDatePeriod(dataInicial, dataFinal)
            );
            mApp.unblock("#ChamadosXPedidos");
        },
        success: function (result) {
            $("#ChamadosXPedidos").html(result);
            $("#NumTotalChamados").html(
                `<b> ${$("#totalChamados").val() == undefined ? "0" : $("#totalChamados").val()} </b>`
            )
        },
        error: function () {
            toastr.error("Falha ao carregar Tabela Chamados X Pedidos!", "Tente novamente mais tarde.");
        }
    });
}

function setTimeoutTableChamadosXPedido(valor) {
    if (valor == 1) {
        setTimeout(function () {
        console.log("Entrou dentro do setTimeout");
        //Carregando
        $(".loading-icon").removeClass("hide");
        $(".flaticon-file").attr("style", "display: none");
        $(".pull-right").attr("disabled", true);
        $(".btn-txt").text(" Aguarde");
        }, 100);
        console.log("Entrou no setTimeout - Valor 1");
    }
    else
    {
        setTimeout(function () {
        //Finalizou o Download
        $(".loading-icon").addClass("hide");
        $(".flaticon-file").attr("style", "");
        $(".pull-right").attr("disabled", false);
        $(".btn-txt").text(" Exportar");
            console.log("Saiu do setTimeout - Valor 2");
        }, 3000);
    }
}

$("#ExportarTableAtendimentoXPedidos").click(function (event) {
    event.preventDefault();
    var dataInicial = $('#m_dashboard_daterangepicker').data('daterangepicker').startDate.toISOString();
    var dataFinal = $("#m_dashboard_daterangepicker").data("daterangepicker").endDate.toISOString();
    var statusSelected = $("#statusChamado").val();
    var motivosSelected = $("#motivoChamado").val();
    var sellerSelected = $("#sellerChamado").val();
    var mplaceChecked = $("#mplace_check").is(":checked");
    var sellerChecked = $("#seller_check").is(":checked");

    setTimeoutTableChamadosXPedido(1);

    window.location.href = 'AjaxIndicator/ExportTableChamadosXPedidos?dataInicial=' + dataInicial + '&dataFinal=' + dataFinal + '&status_chamado=' + '"' + statusSelected + '"' +
        '&motivos_chamado=' + '"' + motivosSelected + '"' + '&sellers=' + '"' + sellerSelected + '"' + '&mplaceChecked=' + mplaceChecked + '&sellerChecked=' + sellerChecked;

    setTimeoutTableChamadosXPedido(2);

});
//Utils
//Muda Titulo Graficos FORMATO MM/YY
function changeGraphTitleDate(spanTitleDate) {
    var date = new Date($('#m_dashboard_daterangepicker').data('daterangepicker').startDate.toISOString());

    var month = date.getMonth()+1;
    var year = date.getUTCFullYear().toString().substr(2, 4);

    if (month < 10)
        spanTitleDate.html(" (0" + month + "/" + year + ")");
    else
        spanTitleDate.html(" (" + month + "/" + year + ")");
}

//Pega o valor de Porcentagem
function getPercentage(valor, total) {
    if (total <= 0)
        return "< 0.1 %";

    var percentage = valor * 100 / total

    if (percentage < 0.1)
        return "< 0.1  %";

    return percentage.toFixed(2) + " %"
}

//Muda Abas
function changeAba(aba) {
    if (aba == "CockPit") {
        $("#cockPitOpt").removeClass("nav-link m-tabs__link active show").addClass("nav-link m-tabs__link active show");
        $("#dashBoardSLAOpt").removeClass("nav-link m-tabs__link active show").addClass("nav-link m-tabs__link");
        $("#dashBoardResumeOpt").removeClass("nav-link m-tabs__link active show").addClass("nav-link m-tabs__link");
        $("#chamadosOpt").removeClass("nav-link m-tabs__link active show").addClass("nav-link m-tabs__link");

        $("#regiaoCockPit").show();
        $("#regiaoSLA").hide();
        $("#regiaoResumes").hide();
        $("#regiaoChamados").hide();

        $("#btnSlas").hide();
        $("#m_dashboard_daterangepicker").hide();


        $("#cockPitTitle").show();
        $("#dashBoardResumeTitle").hide();
        $("#dashBoardSLATitle").hide();
        $("#chamadosTitle").hide();
    }

    else if (aba == "DashBoardSLA") {
    
        $("#dashBoardSLAOpt").removeClass("nav-link m-tabs__link active show").addClass("nav-link m-tabs__link active show");
        $("#cockPitOpt").removeClass("nav-link m-tabs__link active show").addClass("nav-link m-tabs__link");
        $("#dashBoardResumeOpt").removeClass("nav-link m-tabs__link active show").addClass("nav-link m-tabs__link");
        $("#chamadosOpt").removeClass("nav-link m-tabs__link active show").addClass("nav-link m-tabs__link");

        $("#regiaoSLA").show();
        $("#regiaoCockPit").hide();
        $("#regiaoResumes").hide();
        $("#regiaoChamados").hide();

        $("#btnSlas").show();
        $("#m_dashboard_daterangepicker").show();

        $("#dashBoardSLATitle").show();
        $("#cockPitTitle").hide();
        $("#dashBoardResumeTitle").hide();
        $("#chamadosTitle").hide();
    }

    else if (aba == "DashBoardResume") {
        $("#dashBoardResumeOpt").removeClass("nav-link m-tabs__link active show").addClass("nav-link m-tabs__link active show");
        $("#dashBoardSLAOpt").removeClass("nav-link m-tabs__link active show").addClass("nav-link m-tabs__link");
        $("#cockPitOpt").removeClass("nav-link m-tabs__link active show").addClass("nav-link m-tabs__link");
        $("#chamadosOpt").removeClass("nav-link m-tabs__link active show").addClass("nav-link m-tabs__link");

        $("#regiaoResumes").show();
        $("#regiaoSLA").hide();
        $("#regiaoCockPit").hide();
        $("#regiaoChamados").hide();

        $("#btnSlas").hide();
        $("#m_dashboard_daterangepicker").show();

        $(".popover").popover("hide");

        $("#dashBoardResumeTitle").show();
        $("#dashBoardSLATitle").hide();
        $("#cockPitTitle").hide();
        $("#chamadosTitle").hide();
    }
    else if (aba == "Chamados") {
        $("#chamadosOpt").removeClass("nav-link m-tabs__link active show").addClass("nav-link m-tabs__link active show");
        $("#dashBoardResumeOpt").removeClass("nav-link m-tabs__link active show").addClass("nav-link m-tabs__link");
        $("#dashBoardSLAOpt").removeClass("nav-link m-tabs__link active show").addClass("nav-link m-tabs__link");
        $("#cockPitOpt").removeClass("nav-link m-tabs__link active show").addClass("nav-link m-tabs__link");

        $("#regiaoChamados").show();
        $("#regiaoResumes").hide();
        $("#regiaoSLA").hide();
        $("#regiaoCockPit").hide();

        $("#btnSlas").hide();
        $("#m_dashboard_daterangepicker").show();        

        $("#chamadosTitle").show();
        $("#cockPitTitle").hide();
        $("#dashBoardResumeTitle").hide();
        $("#dashBoardSLATitle").hide();
        $("#responsiveRegionChamados").css('padding-left', '0px');
    }
}

function changeAbaGestaoStatistic(aba) {

    let abaText = $(aba).text().trim()

    if (abaText == "Produtos") {
        $("#sellerStatus").hide();
        $("#produtoStatus").show();
    }

    if (abaText == "Sellers") {
        $("#produtoStatus").hide();
        $("#sellerStatus").show();
    }
}

function changeDropDownSelect(ano, mes) {
    if (mes != undefined)
        $("#dropDownSelected").text(("0" + mes).slice(-2) + "/" + ano.toString().slice(-2));
    else
        $("#dropDownSelected").text(ano);
}

function changeDropDownSelectChamados(ano) {
    $("#dropDownChamadosSelected").text(ano);
}

//Atualiza Graficos
function Region_Update() {
    var picker = $('#m_dashboard_daterangepicker').data('daterangepicker');

    Dashboard.initActivity(picker.startDate.toISOString(), picker.endDate.toISOString());
    Dashboard.initStatistic(picker.startDate.toISOString(), picker.endDate.toISOString());

    loadHoursSalesResume();
    loadWeekSalesResume();
    loadStatusDonut();
}

function SLA_Update() {
    var picker = $('#m_dashboard_daterangepicker').data('daterangepicker');

    Dashboard.reportSLA(picker.startDate.toISOString(), picker.endDate.toISOString());

    loadPrincipaisMotivos();
    loadContactRating();
    loadPorcentagemVendasCanceladas();
    loadMotivosCancelamento();
    loadCancelamentosXSeller();
    loadPrincipaisMotivosChamado();
}


$("#gridSearchChamados").click(function (event) {
    event.preventDefault();
    Chamados_Update();
});


$("#mplace_check").change(function (event) {
    event.preventDefault();
    Chamados_Update();
});

$("#seller_check").change(function (event) {
    event.preventDefault();
    Chamados_Update();
});

function gridSearch(CurrentPage) {
    loadTableAtendimentoXPedidos(CurrentPage);
}

function gridSearch2(CurrentPage) {
    loadSellerXMotivos(CurrentPage);
}

function Chamados_Update() {
    loadSellerXMotivos(0);
    loadChamadosMesAno();
    loadChamadosByStatus();
    loadTableAtendimentoXPedidos(0)
}

//Events
jQuery(document).ready(function () {
    setTimeout(function () {    
        Dashboard.dateRangePickerInit();
        var picker = $('#m_dashboard_daterangepicker').data('daterangepicker');

        Dashboard.initSalesSummary(picker.startDate.toISOString(), picker.endDate.toISOString());

        loadYearSalesResume();

        percentDelayDelivery(); //carrega view SLA - _PortletDelayDelivery

        Region_Update();

        countSolicitacaoCancelamento();
        countNotificacoes();
    }, 500);
    
    $("body").removeClass("m-brand--minimize").removeClass("m-aside-left--minimize");

});

$(document).on("click", '[data-range-key]', function () {

    console.log(this);

    if ($(this).attr("data-range-key") != "Customizado") {
    var activeTab = $(".active");

    if (activeTab.attr("id") == "dashBoardSLAOpt") {
        SLA_Update();

        $("body").off("click", "#dashBoardResumeOpt", Region_Update);
        $("body").one("click", "#dashBoardResumeOpt", Region_Update);

            $("body").off("click", "#chamadosOpt", Region_Update);
            $("body").one("click", "#chamadosOpt", Region_Update);
    }
    else if (activeTab.attr("id") == "dashBoardResumeOpt") {
        Region_Update();
   
            $("body").off("click", "#dashBoardSLAOpt", SLA_Update);
            $("body").one("click", "#dashBoardSLAOpt", SLA_Update);

            $("body").off("click", "#chamadosOpt", Region_Update);
            $("body").one("click", "#chamadosOpt", Region_Update);
        }
        else if (activeTab.attr("id") == "chamadosOpt") {
            Chamados_Update();

            $("body").off("click", "#dashBoardResumeOpt", Region_Update);
            $("body").one("click", "#dashBoardResumeOpt", Region_Update);

            $("body").off("click", "#dashBoardSLAOpt", SLA_Update);
            $("body").one("click", "#dashBoardSLAOpt", SLA_Update);
        }
    }
});

$(document).on("click", '.applyBtn', function () {
    var activeTab = $(".active");

    if (activeTab.attr("id") == "dashBoardSLAOpt") {
        SLA_Update();

        $("body").off("click", "#dashBoardResumeOpt", Region_Update);
        $("body").one("click", "#dashBoardResumeOpt", Region_Update);

        $("body").off("click", "#chamadosOpt", Region_Update);
        $("body").one("click", "#chamadosOpt", Region_Update);
    }
    else if (activeTab.attr("id") == "dashBoardResumeOpt") {
        Region_Update();

        $("body").off("click", "#dashBoardSLAOpt", SLA_Update);
        $("body").one("click", "#dashBoardSLAOpt", SLA_Update);

        $("body").off("click", "#chamadosOpt", Region_Update);
        $("body").one("click", "#chamadosOpt", Region_Update);
    }
    else if (activeTab.attr("id") == "chamadosOpt") {
        Chamados_Update();

        $("body").off("click", "#dashBoardResumeOpt", Region_Update);
        $("body").one("click", "#dashBoardResumeOpt", Region_Update);

        $("body").off("click", "#dashBoardSLAOpt", SLA_Update);
        $("body").one("click", "#dashBoardSLAOpt", SLA_Update);
    }
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

$(document).on("click", "#salesSummaryPendent, #salesSummaryApproved, #salesSummaryDelivered, #salesSummaryCancel", function () {
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

$(document).on("click", "#cockPitOpt", () => changeAba("CockPit"));

$(document).on("click", "#dashBoardSLAOpt", () => changeAba("DashBoardSLA"));

$(document).on("click", "#dashBoardResumeOpt", () => changeAba("DashBoardResume"));

$(document).on("click", "#chamadosOpt", () => changeAba("Chamados"));

$("body").one("click", "#dashBoardSLAOpt", SLA_Update);

$("body").one("click", "#chamadosOpt", () => {
    Chamados_Update();
});


//Regiao Estatísticas - Gestão - Produtos/Sellers

function loadOfflineSheetsGridProductOrSellerByStatisticStatus(parameters, type) {

    console.log("Caiu na função loadOfflineSheetsGridProductOrSellerByStatisticStatus");

    $.ajax({
        type: 'POST',
        url: '/AjaxIndicator/GetOfflineSheetsProductOrSellerByStatisticStatus',
        //url: '@Url.Action("GetOfflineSheets", "Order")',
        data: {
            product_seller: parameters,
            typeStatisticsStatus: type
        },
        cache: false,
        beforeSend: () => mApp.block("body", { overlayColor: "#000000", type: "loader", state: "success", message: "Enviando solicitação, aguarde..." }),
        success: (result) => {
            console.log(result);
            $("#modal_offline_sheets_body").html(result);
            $("#modal_offline_sheets").modal();
            $("#modal_offline_sheets_body").attr('data-modal-offline-sheets-param', parameters); //Setando o valor do parâmetro da query
            $("#modal_offline_sheets_body").attr('data-modal-offline-sheets-type', type); //Setando o valor do tipo da query
        },
        error: () => swal({ backdrop: false, title: "Erro!", text: "Erro no servidor, tente novamente em alguns minutos.", type: "error" }),
        complete: () => mApp.unblock("body")
});

}

function TryExportPlanilha() {

    console.log("caiu no TryExportPlanilha");

    var product_seller = $("#modal_offline_sheets_body").attr("data-modal-offline-sheets-param");
    var typeStatic = $("#modal_offline_sheets_body").attr("data-modal-offline-sheets-type");

    console.log("product_seller: ", product_seller);
    console.log("typeStatic: ", typeStatic);

    $.ajax({
        type: "POST",
        url: '/AjaxIndicator/TryExportSheetProductOrSeller',
        //url: "@Url.Action("TryExportSheet", "Order")",
        data: {
            product_seller: product_seller,
            typeStatisticsStatus: typeStatic
        },
        beforeSend: () => mApp.block("body", { overlayColor: "#000000", type: "loader", state: "success", message: "Enviando solicitação, aguarde..." }),
        success: (result) => {
            console.log(result);
            mApp.unblock("body");

            if (result.success) {
                swal({ backdrop: false, title: "Sucesso!", text: result.message, type: "success" });
                loadOfflineSheetsGridProductOrSellerByStatisticStatus(product_seller, typeStatic);
            }

            else
                swal({ backdrop: false, title: "Erro!", text: result.message, type: "error" });
        },
        error: () => {
            mApp.unblock("body");
            swal({ backdrop: false, title: "Erro!", text: "Erro no servidor, por favor tente novamente em alguns minutos.", type: "error" });
        }
});
}

function download_planilha(id) {

    const a = $('#modal_offline_sheets_body').children().children().next().children().children().next().next().next().next().children().attr('href', 'javascript:void(null)');
    window.location.href = '/OfflineReport/DownloadPlanilha?planilha_id=' + id;
    return true;
}

