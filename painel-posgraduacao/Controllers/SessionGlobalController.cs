using Microsoft.AspNetCore.Mvc;

namespace Ufu.Facom.Ppgco.Web.Controllers
{
    public class SessionGlobalController : Controller
    {
        //private readonly IHttpContextAccessor _httpContextAccessor; //Configurando uma variável privada para conter o HttpContextAccessor
        //private ISession _session => _httpContextAccessor.HttpContext.Session; //adicionando uma variável de conveniência como um atalho diretamente para a sessão. Observe o =>? Isso significa que estamos usando um corpo de expressão, também conhecido como um atalho para escrever um método linear que retorna algo

        /*
        public SessionGlobalController(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }*/

        private IHttpContextAccessor _httpContextAccessor;

        public SessionGlobalController(IHttpContextAccessor context)
        {
            _httpContextAccessor = context;
        }

        public SessionGlobalController()
        {
        }

        public IActionResult Index()
        {

            return View();
        }

        public ISession GetSession()
        {

            HttpContext.Session.SetInt32("MemberId", 0);
            HttpContext.Session.SetString("PerfilId", "");

            return HttpContext.Session;
        }

        public class SessionGlobal
        {
            const string NameSession = "OpenK.Marketplace";
            public long MemberId { get; set; }
            public long PerfilId { get; set; }
            public string NomeCliente { get; set; }
            public string NomeUsuario { get; set; }
            public string EmailCliente { get; set; }
            private string _fNomeSession;
        }


    }
}
