using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Ufu.Facom.Ppgco.Web.Models;

namespace Ufu.Facom.Ppgco.Web.Controllers
{
    public class SolicitacoesController : Controller
    {
        private Repository.Repository _repo = new Repository.Repository();
        public IActionResult Index()
        {
            string sessaoUsuario = ControllerContext.HttpContext.Session.GetString("sessaoUsuarioLogado");

            if (string.IsNullOrEmpty(sessaoUsuario))
                return RedirectToAction("Login", "User");

            Usuario usuario = JsonConvert.DeserializeObject<Usuario>(sessaoUsuario);

            ViewBag.UserId = usuario.Id;
            ViewBag.PerfilId = usuario.PerfilId;

            List<Inscricao> solicitacoes = _repo.GetSolicitacaoInscricao(usuario.Id, usuario.PerfilId);

            ViewBag.Solicitacoes = solicitacoes;

            return View();
        }
    }
}
