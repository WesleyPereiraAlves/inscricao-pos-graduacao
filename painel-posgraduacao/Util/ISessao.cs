using Ufu.Facom.Ppgco.Web.Models;

namespace Ufu.Facom.Ppgco.Web.Util
{
    public interface ISessao
    {
        void CriarSesaoDoUsuario(Usuario usuario);
        void RemoverSessaoDoUsuario();
        Usuario BuscarSessaoDoUsuario();
    }
}
