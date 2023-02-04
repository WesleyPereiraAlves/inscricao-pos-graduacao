//function openDialogBuilder(url) {
//  $('#consulta_iframe').attr('src', url);
//  $("#modal_builder").modal("show");
//}

//function dynamicReports() {
//  $.ajax({
//    type: 'POST',
//    url: '/ajax/dynamicreports',
//    cache: false,
//    success: function (dataValores) {
//      if (typeof (dataValores) === "string") {
//        dataValores = JSON.parse(dataValores);
//      }

//      try {
//        if (dataValores.data !== undefined && dataValores.data.length > 0) {
//          for (var i = 0; i < dataValores.data.length; i++) {
//            var item = dataValores.data[i];

//            $("#dynamic-reports").append('<li class="m-menu__item " m-menu-link-redirect="1" aria-haspopup="true">' +
//              '<a href="javascript:void(0)" class="m-menu__link navigate" onclick="openDialogBuilder(\'/ajax/dynamicreportsopen/' + item.id + '\')"><span class="m-menu__link-text">' + item.nome + '</span></a>' +
//              '</li>');
//          }
//        }
//      }
//      catch (err) {
//        console.log(err);
//      }
//    },
//    error: function () {
//      console.error("Falha ao carregar os relatórios.");
//    }
//  });
//}

function openContentHelp(id, element) {
    var divElement = $(element);

    if (divElement !== null && divElement !== undefined && id !== null && id !== undefined && id !== "") {
        $.ajax({
            type: 'GET',
            url: '/Home/ContentHelp',
            data: {
                id: id
            },
            beforeSend: function () {
                onBeginLoad();
                mApp.block(element, { overlayColor: "#000000", type: "loader", state: "success", message: "Carregando, aguarde..." });
            },
            success: function (html) {
                mApp.unblock();
                divElement.html(html);
            },
            error: function () {
                mApp.unblock();
                divElement.html("Falha ao carregar o conteúdo da ajuda.");
            }
        });
    }
}

function setCookie(cookieName, cookieValue, lifespanInDays, validDomain) {
  var domainString = validDomain ?
    ("; domain=" + validDomain) : '';
  document.cookie = cookieName +
    "=" + encodeURIComponent(cookieValue) +
    "; max-age=" + 60 * 60 *
    24 * lifespanInDays +
    "; path=/" + domainString;
}

function getCookie(cName) {
  var i, x, y, arRcookies = document.cookie.split(";");
  for (i = 0; i < arRcookies.length; i++) {
    x = arRcookies[i].substr(0, arRcookies[i].indexOf("="));
    y = arRcookies[i].substr(arRcookies[i].indexOf("=") + 1);
    x = x.replace(/^\s+|\s+$/g, "");
    if (x == cName) {
      return unescape(y);
    }
  }
}

jQuery.extend(jQuery.expr[':'], {
  attrStartsWith: function (el, _, b) {
    for (var i = 0, atts = el.attributes, n = atts.length; i < n; i++) {
      if (atts[i].nodeName.toLowerCase().indexOf(b[3].toLowerCase()) === 0) {
        return true;
      }
    }

    return false;
  }
});

function roundNumber(number, decimals) { // Arguments: number to round, number of decimal places
  var newnumber = new Number(number + '').toFixed(parseInt(decimals));
  return parseFloat(newnumber); // Output the result to the form field (change for your purposes)
}
function showAlert(msg, type, icon, time) {
  $.notify({
    message: msg + "   ",
    icon: "icon " + icon
  }, {
      type: type,
      allow_dismiss: true,
      newest_on_top: false,
      mouse_over: true,
      showProgressbar: false,
      spacing: 10,
      timer: time,
      placement: {
        from: "top",
        align: "right"
      },
      offset: {
        x: 30,
        y: 30
      },
      delay: 500,
      z_index: 10000,
      animate: {
        enter: "animated pulse",
        exit: "animated pulse"
      }
    });
}

Number.prototype.formatMoney = function (c, d, t) {
  var n = this,
    c = isNaN(c = Math.abs(c)) ? 2 : c,
    d = d == undefined ? "." : d,
    t = t == undefined ? "," : t,
    s = n < 0 ? "-" : "",
    i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
    j = (j = i.length) > 3 ? j % 3 : 0;
  return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};

function sendSuccessMail(txt) {
  var data = txt;
  if (data.success) {
    swal({ title: "Sucesso!", text: "Chamado aberto com sucesso.", type: "success"}).then(function () {
        $('.nav-box-about .box-about-large').hide();
        $('#subject').val("");
        $('#message').val("");
    });
  }
  else {
    swal("Erro ao abrir o chamado!", "Tente novamente mais tarde.", "error");
    console.error(txt.message);
  }
  onSuccessLoad();
}

function normalizePorteletsOrders() {
  var portlet01H = $("#portlet01").height();
  var portlet02H = $("#portlet02").height();

  if (portlet01H > portlet02H)
    $("#portlet02").height(portlet01H);
  else
    $("#portlet01").height(portlet02H);
}

function onBeginLoad() {
    var result = CheckAjaxSession();
    if (!result)
        xhr.abort();
}

$(document).ready(function () {
  onBeginLoad();
    
  $(document).on("click", ".paginations a[data-page]", function (e) {
    e.preventDefault();

    $("#CurrentPage").val($(this).attr("data-page"));

    $("#gridSearch").click();
  });

  $(document).on("click", ".paginationsModal a[data-page]", function (e) {
    e.preventDefault();

    $("#CurrentPageModal").val($(this).attr("data-page"));

    $("#gridSearchModal").click();
  });

  $(document).on("click", ".paginationsForm a[data-page]", function (e) {
    e.preventDefault();

    $("#CurrentPageForm").val($(this).attr("data-page"));

    $("#gridSearchForm").click();
  });

  //$(document).on("click", ".navigate", function (e) {
  //	e.preventDefault();
  //	var l = $(this).attr("href");
  //	$(".m-page").fadeOut(100);
  //	$("#page-load").fadeIn(100);
  //	setTimeout(function () {
  //		location.href = l;
  //	}, 300);
  //});

  //$("#page-load").fadeOut(100, function () {
  //	$(".m-page").fadeIn(100);
  //});

  normalizePorteletsOrders();
  $('#centro-suporte').bind('click', function () {
    $('.nav-box-about .box-about-large').show();
  });

  $('#close-suporte').bind('click', function () {
    $('.nav-box-about .box-about-large').hide();
  });

  $('#suport-redirect').bind('click', function () {
    $("html, body").animate({ scrollTop: $('#centro-suporte').offset().top }, 1000);
    $('.nav-box-about .box-about-large').show();
  });

  $(document).on("click", ".table tbody > tr", function () {
    $(".table tr.active").removeClass("active");
    $(this).addClass("active");
  });

  //dynamicReports();
  
  
  
  
  
});