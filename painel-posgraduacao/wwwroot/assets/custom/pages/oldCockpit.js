//-------------------------------------------------------- FUNCTIONS ---------------------------------------------------------
function carregaGrid() {
	onBeginLoad(); 
	$.ajax({
		type: 'POST',
		url: '/Home/AjaxCockPit',
		cache: false,
		data: {
			opcaoFiltroTela: $("input[name=\"dataConsulta\"]:checked").val(),
            inicio: $('#data_pedido').val().split('-')[0].trim(),
            fim: $('#data_pedido').val().split('-')[1].trim(),
			lojaId: $("#loja_id").val(),
			tipoD0: $('input[name="tipod0"]:checked').val()
		},
		dataType: 'text',
        beforeSend: function () {
            mApp.block("#container-grid", { overlayColor: "#000000", type: "loader", state: "success", message: "Carregando..." });
        },
        success: function (txt) {
            $("#container-grid").html(txt);
            onSuccessLoad();
            mApp.unblock("#container-grid");
        },
        error: function (txt, data) {
            onSuccessLoad();
            toastr.error('Operação não pode realizada pois ocorreu um erro interno.');
            mApp.unblock("#container-grid");
        }
	});
}

function changeAba(aba) {
    if (aba == "CockPit") {
        $("#cockPitOpt").removeClass("nav-link m-tabs__link").addClass("nav-link m-tabs__link active show");
        $("#dashBoardOpt").removeClass("nav-link m-tabs__link active show").addClass("nav-link m-tabs__link");
        $("#regiaoCockPit").show();
        $("#regiaoSLA").hide();
        $("#PortletActivity").hide();
        $("#PortletStatistic").hide();
        $("#PortletSalesYear").hide();
        $("#PortletSalesHour").hide();
        $("#btnSlas").hide();
        $("#m_dashboard_daterangepicker").hide();
        $("#dashBoardTitle").hide();
        $("#cockPitTitle").show();
    }
    else if (aba == "DashBoard") {
        $("#dashBoardOpt").removeClass("nav-link m-tabs__link").addClass("nav-link m-tabs__link active show");
        $("#cockPitOpt").removeClass("nav-link m-tabs__link active show").addClass("nav-link m-tabs__link");
        $("#regiaoSLA").show();
        $("#regiaoCockPit").hide();
        $("#PortletActivity").show();
        $("#PortletStatistic").show();
        $("#PortletSalesYear").show();
        $("#PortletSalesHour").show();
        $("#btnSlas").show();
        $("#m_dashboard_daterangepicker").show();
        $("#cockPitTitle").hide();
        $("#dashBoardTitle").show();
    }
}


function loadCockPit() {
    onBeginLoad();
    $.ajax({
        type: 'POST',
        url: '/Home/Cockpit',
        cache: false,
        data: {},
        dataType: 'text',
        beforeSend: function () {
            mApp.block("body", { overlayColor: "#000000", type: "loader", state: "success", message: "Carregando..." });
        },
        success: function (txt) {
            $("#regiaoCockPit").html(txt);
            loadDates();
            loadSelect();
            onSuccessLoad();
            mApp.unblock("body");
        },
        error: function (txt, data) {
            onSuccessLoad();
            toastr.error('Operação não pode realizada pois ocorreu um erro interno.');
            mApp.unblock("body");
        }
    });
}

function loadDates() {
    $('#data_pedido').daterangepicker({
        buttonClasses: 'm-btn btn',
        applyClass: 'btn-primary',
        cancelClass: 'btn-secondary',
        autoApply: true,
        timePicker: false,

        timePicker24Hour: true,
        locale: {
            format: 'DD/MM/YYYY',
            language: 'pt-br'
        },

        startDate: moment().add(-1, 'month'),

        // dateLimit: {
        // 	days: 30
        // }

    }, function (start, end, label) {
        $('#data_pedido').val(start.format('DD/MM/YYYY') + ' / ' + end.format('DD/MM/YYYY'));
    });
}

function loadSelect() {
    $(".m-select2").select2();
    onBeginLoad();
}

function changeLastUpdateTitle() {
    var opcaoFiltroTela = $("input[name='dataConsulta']:checked").val();
    if (opcaoFiltroTela == undefined)
        opcaoFiltroTela = 2; //Valor do filtro tela (Data Do Pedido)

    $.ajax({
        type: 'POST',
        url: '/Home/CockPitLastUpdate',
        cache: false,
        data: {
            opcaoFiltroTela: opcaoFiltroTela,
        },
        dataType: 'text',
        success: function (txt) {
            $("#dataUpdateCockPit").html(txt);
            onSuccessLoad();
        },
    });
}

//-------------------------------------------------------- EVENTS ------------------------------------------------------------
$(document).ready(function () {
    $(document).on("change", '#loja_id, input[name="tipod0"], #data_pedido ', function () {
        carregaGrid();
    });

    $(document).on("change", 'input[name = "dataConsulta"]', function () {
        carregaGrid();
        changeLastUpdateTitle();
    });

    $(document).on("click", "#cockPitOpt", function () {
        changeAba("CockPit");
    });

    $(document).on("click", "#dashBoardOpt", function () {
        changeAba("DashBoard");
    });

    $("#cockPitOpt").one("click", function () {
        loadCockPit();
        changeLastUpdateTitle();
    });

    $(document).on("click", ".table-cockpit .btn", function (e) {
        e.preventDefault();

            var link = $(this).attr("href");

        var tipoPeriodo = $("input[name='dataConsulta']:checked").val();
        link += "&opcaofiltro=" + tipoPeriodo

        var loja = $("#loja_id").val();
        if (loja != null && loja != undefined)
            link += "&loja_id=" + loja


        let data_inicial = $(this).attr('data-start');
        let data_final = $(this).attr('data-end');

        link += "&data_inicial=" + data_inicial;
        link += "&data_final=" + data_final;

        window.open(link, "_blank");
    });
});