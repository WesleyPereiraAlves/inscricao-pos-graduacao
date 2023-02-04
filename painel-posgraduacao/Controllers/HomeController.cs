using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Diagnostics;
using Ufu.Facom.Ppgco.Web.Filter;
using Ufu.Facom.Ppgco.Web.Models;

namespace Ufu.Facom.Ppgco.Web.Controllers
{
    [PaginaParaUsuarioLogado]
    public class HomeController : Controller
    {
        private SessionGlobalController sessionGlobalController;
        private readonly ILogger<HomeController> _logger;
        public string sessaoUsuario;

        public HomeController(ILogger<HomeController> logger)
        {
            _logger = logger;
        }

        public IActionResult Index(long? id, long? perfil_id)
        {

            //var _session = sessionGlobalController.GetSession();

            sessaoUsuario = ControllerContext.HttpContext.Session.GetString("sessaoUsuarioLogado");

            if (string.IsNullOrEmpty(sessaoUsuario))
                return RedirectToAction("Login", "User");

            Usuario usuario = JsonConvert.DeserializeObject<Usuario>(sessaoUsuario);

            ViewBag.UserId = usuario.Id;
            ViewBag.PerfilId = usuario.PerfilId;

            return View();
        }

        public IActionResult Privacy()
        {

            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}