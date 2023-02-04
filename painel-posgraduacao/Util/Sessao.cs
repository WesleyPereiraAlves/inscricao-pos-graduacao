using Newtonsoft.Json;
using Ufu.Facom.Ppgco.Web.Models;

namespace Ufu.Facom.Ppgco.Web.Util
{
    public class Sessao : ISessao
    {
        private readonly IHttpContextAccessor _httpContext;

        public Sessao(IHttpContextAccessor httpContext)
        {
            _httpContext = httpContext;
        }

        public Usuario BuscarSessaoDoUsuario()
        {
            string sessaoUsuario = _httpContext.HttpContext.Session.GetString("sessaoUsuarioLogado");

            if (string.IsNullOrEmpty(sessaoUsuario)) return null;

            return JsonConvert.DeserializeObject<Usuario>(sessaoUsuario);
        }

        public void CriarSesaoDoUsuario(Usuario usuario)
        {

            string valor = JsonConvert.SerializeObject(usuario);
            _httpContext.HttpContext.Session.SetString("sessaoUsuarioLogado", valor);
        }

        public void RemoverSessaoDoUsuario()
        {
            _httpContext.HttpContext.Session.Remove("sessaoUsuarioLogado");
        }
    }
}
