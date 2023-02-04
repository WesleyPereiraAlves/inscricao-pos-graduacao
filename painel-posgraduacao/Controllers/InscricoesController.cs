using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Newtonsoft.Json;
using Ufu.Facom.Ppgco.Web.Enums;
using Ufu.Facom.Ppgco.Web.Models;
using Ufu.Facom.Ppgco.Web.Util;

namespace Ufu.Facom.Ppgco.Web.Controllers
{
    public class InscricoesController : Controller
    {
        private Repository.Repository _repo = new Repository.Repository();
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult InscricoesPos()
        {
            var resultPerfil = "";
            string sessaoUsuario = ControllerContext.HttpContext.Session.GetString("sessaoUsuarioLogado");

            if (string.IsNullOrEmpty(sessaoUsuario))
                return RedirectToAction("Login", "User");

            Usuario usuario = JsonConvert.DeserializeObject<Usuario>(sessaoUsuario);

            if (usuario.PerfilId == (long)PerfilEnum.MestradoRegular)
                resultPerfil = "_ResultsMestradoRegular";

            if (usuario.PerfilId == (long)PerfilEnum.Doutorado)
                resultPerfil = "_ResultsDoutorado";

            if (usuario.PerfilId == (long)PerfilEnum.MestradoEspecial)
                resultPerfil = "_ResultsMestradoEspecial";

            return PartialView(resultPerfil, usuario);

        }

        public ActionResult _ResultsMestradoRegular()
        {
            var resultPerfil = "";
            string sessaoUsuario = ControllerContext.HttpContext.Session.GetString("sessaoUsuarioLogado");

            if (string.IsNullOrEmpty(sessaoUsuario))
                return RedirectToAction("Login", "User");

            Usuario usuario = JsonConvert.DeserializeObject<Usuario>(sessaoUsuario);

            ViewBag.UserId = usuario.Id;
            ViewBag.PerfilId = usuario.PerfilId;

            return View(usuario);
        }

        public ActionResult _ResultsDoutorado()
        {
            var resultPerfil = "";
            string sessaoUsuario = ControllerContext.HttpContext.Session.GetString("sessaoUsuarioLogado");

            if (string.IsNullOrEmpty(sessaoUsuario))
                return RedirectToAction("Login", "User");

            Usuario usuario = JsonConvert.DeserializeObject<Usuario>(sessaoUsuario);

            ViewBag.UserId = usuario.Id;
            ViewBag.PerfilId = usuario.PerfilId;

            return View(usuario);
        }

        public ActionResult _ResultsMestradoEspecial()
        {
            var resultPerfil = "";
            string sessaoUsuario = ControllerContext.HttpContext.Session.GetString("sessaoUsuarioLogado");

            if (string.IsNullOrEmpty(sessaoUsuario))
                return RedirectToAction("Login", "User");

            Usuario usuario = JsonConvert.DeserializeObject<Usuario>(sessaoUsuario);

            ViewBag.UserId = usuario.Id;
            ViewBag.PerfilId = usuario.PerfilId;

            return View(usuario);
        }
       
        //[LoginActionFilter]
        [HttpPost]
        public ActionResult UploadPdf(string file_upload, long member_id, long perfil_id)
        {
            //IFormFile
            //System.Web.HttpPostedFileBase file = Request.Files["file"];

            //IFormFile file = file_upload;

            var file = file_upload;

            if (file_upload == null)
                return Json(new { success = false, message = "Documento Inválido: nenhum arquivo informado!" });
            long planilha_id = 0;


            string fileName = "";

            //var type = file..GetFileType();
            //var type = file.GetType();
            var type = file;
            var extension = type == null || string.IsNullOrEmpty(type) ? "DESCONHECIDO" : type;
            //var fileExtension = "." + extension?.TrimStart('.');
            var fileExtension = Path.GetExtension(extension?.TrimStart('.'));

            try
            {
                if (file == null)
                    return Json(new { success = false, message = "Inserção de documento vazio!" });

                if (!(fileExtension.ToLower() == ".pdf"))
                    return Json(new { success = false, message = "Formato de arquivo não suportado!" });
                /*
                var user_id = SessaoAdmin.IdUsuario;

                fileName = $"PlanilhaFrete_{loja_id}_{filial_id}_{DateTime.Now.ToString("yyyy-MM-dd")}_{DateTime.Now.ToString("HH-mm-ss")}{fileExtension}";


                var tipo_planilha_id = 3;
                planilha_id = _repo.AddPlanilha(fileName, tipo_planilha_id, SessaoAdmin.IdClient, user_id, loja_id, filial_id);

                string diretorio = (string.IsNullOrEmpty(ConfigurationManager.AppSettings["Ambiente"]?.ToLower()) ? "" : ConfigurationManager.AppSettings["Ambiente"]?.ToLower() + "/") + "planilhas_frete";
                var request = new List<FileRequest>
                {
                    new FileRequest
                    {
                        Shortname = ConfigurationManager.AppSettings["MplaceName"]?.ToLower(),
                        Base64 = Convert.ToBase64String(GetFileBytes(file)),
                        FileName = fileName,
                        Directory = diretorio
                    }
                };

                var response = Requests.PUT<List<GenericResult>>($"{ConfigurationManager.AppSettings["ApiStorage"].Trim('/')}/api/v1/sheets", request);

                if (response != null && response.Any(x => x.Status == Models.Results.ResponseStatus.Error || x.Status == Models.Results.ResponseStatus.Alert) && planilha_id > 0)
                {
                    _repo.DeletePlanilha(planilha_id, loja_id);
                    return Json(new { success = false, message = "Falha ao salvar planilha!" }, JsonRequestBehavior.AllowGet);
                }*/


                return Json(new { success = true, message = "Documento inserido com sucesso!" });
            }
            catch (Exception e)
            {
                /*
                if (planilha_id > 0)
                {
                    _repo.DeletePlanilha(planilha_id, loja_id);
                }*/
                return Json(new { success = false, message = e.Message });
            }
        }

        [HttpPost]
        public ActionResult FinalizarInscricao(string nome, string email, string telefone, long curso, DateTime ano_conclusao, long instituicao, long radio1, long radio2, long radio3, long linha_pesquisa, long modalidade_vaga, string carta_motivacao)
        {
            Inscricao inscricao = new Inscricao();

            string sessaoUsuario = ControllerContext.HttpContext.Session.GetString("sessaoUsuarioLogado");

            if (string.IsNullOrEmpty(sessaoUsuario))
                return RedirectToAction("Login", "User");

            Usuario usuario = JsonConvert.DeserializeObject<Usuario>(sessaoUsuario);

            inscricao.nome = nome;
            inscricao.email = email;
            inscricao.telefone = telefone;
            inscricao.curso = curso;
            inscricao.ano_conclusao = ano_conclusao;
            inscricao.instituicao = instituicao;
            inscricao.radio1 = radio1;
            inscricao.radio2 = radio2;
            inscricao.radio3 = radio3;
            inscricao.linha_pesquisa = linha_pesquisa;
            inscricao.modalidade_vaga = modalidade_vaga;
            inscricao.carta_motivacao = carta_motivacao;


            //var inscricao = Newtonsoft.Json.JsonConvert.DeserializeObject<Inscricao>(data);

            try
            {
                var result = _repo.SaveInscricao(usuario.Id, usuario.PerfilId, inscricao);

                if (result)
                {
                    _repo.InserthistoricMember(usuario.Id, usuario.PerfilId, DateTime.Now, "Inscricao feita com sucesso");
                }

                return Json(new { success = true, message = "Inscricao feita com sucesso!" });

            }
            catch (Exception e)
            {
                string msgErro = e.Message;

                return Json(new { success = false, message = msgErro });
            }

            return View(usuario);
        }

    }
}
