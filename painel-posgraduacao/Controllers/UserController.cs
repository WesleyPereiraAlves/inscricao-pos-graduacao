using Microsoft.AspNetCore.Mvc;
using System.Globalization;
using Ufu.Facom.Ppgco.Web.Models;
using Ufu.Facom.Ppgco.Web.Util;


namespace Ufu.Facom.Ppgco.Web.Controllers
{
    public class UserController : Controller
    {
        public SessionGlobalController sessionGlobalController = new SessionGlobalController();
        private Repository.Repository _repo = new Repository.Repository();
        private readonly ISessao _sessao;
        public string _sessao_usuario;


        public UserController(ISessao sessao)
        {
            _sessao = sessao;
        }

        /*
        public const string SessionKeyMemberId = "_Name";
        public const string SessionKeyPerfilId = "_Age";

        
        private readonly IHttpContextAccessor _httpContextAccessor; //Configurando uma variável privada para conter o HttpContextAccessor
        private ISession _session => _httpContextAccessor.HttpContext.Session; //adicionando uma variável de conveniência como um atalho diretamente para a sessão. Observe o =>? Isso significa que estamos usando um corpo de expressão, também conhecido como um atalho para escrever um método linear que retorna algo

        public UserController(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }*/

        public ActionResult Login()
        {
            if (_sessao.BuscarSessaoDoUsuario() != null) return RedirectToAction("Index", "Home");
            return View();
        }

        public ActionResult Logout()
        {
            _sessao.RemoverSessaoDoUsuario();

            return RedirectToAction("Login");
        }

        [HttpPost]
        public ActionResult Login(int perfil_conta, string username, string password)
        {
            if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password))
            {
                return Json(new Models.RetornoAction() { success = false, message = "Usuário/Senha devem ser preenchidos." }/*,
                        JsonRequestBehavior.AllowGet*/);
            }

            if (perfil_conta == 0)
            {
                return Json(new Models.RetornoAction() { success = false, message = "O tipo da pós deve ser selecionado." }/*,
                        JsonRequestBehavior.AllowGet*/);
            }

            Usuario usuario = new Usuario();
            usuario.Id = perfil_conta;
            usuario.PerfilId = perfil_conta;

            //e recupere-os com a mesma facilidade:
            //var myComplexObject = HttpContext.Session.GetObjectFromJson<MyClass>("Test");

            try
            {
                if (CheckLoginUsuario(perfil_conta, username, password))
                {
                    var member = _repo.GetMemberByLoginAndPerfilId(username, perfil_conta);

                    _sessao.CriarSesaoDoUsuario(usuario);

                    _sessao_usuario = ControllerContext.HttpContext.Session.GetString("sessaoUsuarioLogado");

                    return Json(new { success = true, userId = member.Id, perfilId = member.PerfilId }/*, JsonRequestBehavior.AllowGet */);
                }
            }
            catch (Exception e)
            {

                if (e.Message.Contains("Sua senha expirou, por favor redefina a senha!"))
                {

                    var member = _repo.GetMemberByLoginAndPerfilId(username, perfil_conta);

                    //return Json(new { success = false, message = e.Message, userId = dt.Rows[0]["id"] }, JsonRequestBehavior.AllowGet);
                    return Json(new { success = false, message = e.Message, userId = member.Id, perfilId = member.PerfilId }/*, JsonRequestBehavior.AllowGet */);
                }

                return Json(new Models.RetornoAction() { success = false, message = e.Message }/*,
                    JsonRequestBehavior.AllowGet */);
            }

            return View();

        }

        private bool CheckLoginUsuario(long perfil_id, string username, string password)
        {
            var member = _repo.GetMemberByLoginAndPerfilId(username, perfil_id);

            if (member != null && member?.Id != 0)
            {

                if (member.Password != Help.GerHash(password))
                    throw new Exception("Usuário/Senha incorretos.");

                if (!member.Active)
                    throw new Exception("Usuário desativado, por favor entre em contato com o Administrador do Sistema!");

                if (member.PasswordExpired)
                    throw new Exception("Sua senha expirou, por favor redefina a senha!");
            }
            else
            {
                throw new Exception("Usuário não cadastrado.");
            }

            return true;
        }

        [HttpPost]
        public ActionResult NewPassword(long userId, string password, string newPassword)
        {
            try
            {

                var member = _repo.GetMemberById(userId);

                if (member.Password != Help.GerHash(password))
                {
                    throw new Exception("Senha atual incorreta.");
                }
                var passwordExpired = false;
                var passwordNew = Help.GerHash(newPassword);

                var result = _repo.UpdatePasswordMember(userId, member.PerfilId, passwordExpired, passwordNew);

                return Json(new { success = true, username = member.Login, password = newPassword }/*, JsonRequestBehavior.AllowGet*/);

            }
            catch (Exception e)
            {
                return Json(new { success = false, message = e.Message });
            }

        }

        [HttpPost]
        public ActionResult SaveNewUser(string nome_completo_conta, string email_conta, string login_conta, string password_conta, string cpf_conta, long perfil_pos_conta_login)
        {
            try
            {

                var member = _repo.GetMemberByLoginAndPerfilId(login_conta, perfil_pos_conta_login);

                if (member != null)
                {
                    return Json(new { success = false, message = "Já existe um usuário com este LOGIN!" });
                }

                if (string.IsNullOrEmpty(nome_completo_conta))
                {
                    return Json(new { success = false, message = "E-mail deve ser informado!" });
                }

                if (string.IsNullOrEmpty(email_conta))
                {
                    return Json(new { success = false, message = "O nome deve ser informado!" });
                }

                if (string.IsNullOrEmpty(login_conta))
                {
                    return Json(new { success = false, message = "O login deve ser informado!" });
                }

                if (string.IsNullOrEmpty(password_conta))
                {
                    return Json(new { success = false, message = "O login deve ser informado!" });
                }

                if (string.IsNullOrEmpty(cpf_conta))
                {
                    return Json(new { success = false, message = "O campo CPF deve ser preenchido!" });
                }

                if (perfil_pos_conta_login == 0)
                {
                    return Json(new { success = false, message = "Selecione o tipo da pós!" });
                }

                var result = _repo.SaveNewMember(nome_completo_conta, email_conta, login_conta, Help.GerHash(password_conta), cpf_conta, perfil_pos_conta_login, out long memberId);

                if (result)
                {
                    _repo.InserthistoricMember(memberId, perfil_pos_conta_login, DateTime.Now, "Usuário criado via portal");
                }

                return Json(new { success = true, message = "Conta criada com sucesso!" });

            }
            catch (Exception e)
            {
                string msgErro = e.Message;

                return Json(new { success = false, message = msgErro });
            }

        }

        [HttpPost]
        public ActionResult SetRandomPassword(string login, string email)
        {
            try
            {
                //var members = new Member().getMemberByLoginAndEmail(login, email);
                var member = _repo.GetMemberByLoginAndEmail(login, email);

                if (!(member == null))
                {
                    //define nova senha e criptografa
                    string nome = member.Name.Trim().Replace(" ", "");
                    var senha = GeraSenhaAleatoria(nome);
                    var senhaCriptografada = Help.GerHash(senha);

                    //salva nova senha para o usuário e define como expirada
                    var passwordNew = senhaCriptografada;
                    var passwordExpired = true;

                    var result = _repo.UpdatePasswordMember(member.Id, member.PerfilId, passwordExpired, passwordNew);

                    //envia o email informando a senha
                    bool emailEnviado = EnviarEmailNovaSenhaTemporaria(member.Email, senha);

                    if (emailEnviado)
                    {
                        return Json(new { success = true });
                    }
                    else
                    {
                        return Json(new { success = false, message = "Erro ao enviar o email!" });
                    }
                }
                else
                {
                    return Json(new { success = false, message = "Usuário não encontrado!" });
                }
            }
            catch (Exception e)
            {
                return Json(new { success = false, message = e.Message });
            }
        }

        public string GeraSenhaAleatoria(string nome)
        {
            string primeironome =
                nome.Split(Convert.ToChar(" ")).Length > 0 ? nome.Split(Convert.ToChar(" "))[0] : nome;
            string senha = primeironome.Trim() + DateTime.Now.Hour.ToString(CultureInfo.InvariantCulture) + DateTime.Now.Minute.ToString(CultureInfo.InvariantCulture);
            return senha;
        }

        public bool EnviarEmailNovaSenhaTemporaria(string emailUser, string senha)
        {
            try
            {
                TemplateNotificacao template = _repo.GetTemplateNotificacaoById(1);

                if (template.Conteudo != null)
                {

                    //Define o corpo do email
                    string conteudo = template.Conteudo;
                    conteudo = conteudo.Replace("%ASSUNTO%", "Solicitação de nova senha.");
                    conteudo = conteudo.Replace("%SELLER%", string.Concat("Nova senha: ", senha));
                    conteudo = conteudo.Replace("%CONTEUDO%", "Será solicitado a alteração desta nova senha no seu primeiro acesso.");
                    //conteudo = conteudo.Replace("%LINK%", painelUrl);

                    //envia o email
                    Email mail = new Email();

                    mail.EnviarEmailPlus(conteudo, "Solicitação de nova senha", emailUser, true);

                    return true;
                }
                else
                {
                    return false;
                }
            }
            catch (Exception e)
            {
                return false;
            }
        }

    }
}